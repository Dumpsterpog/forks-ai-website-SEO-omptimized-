import Anthropic from "@anthropic-ai/sdk";

/**
 * Pre-signup flashcard generation for the hero widget.
 *
 * This endpoint is deliberately unauthenticated: the whole point is that a
 * visitor can watch their own notes turn into real cards before deciding to
 * sign up. That also means it spends money on behalf of anonymous traffic, so
 * every limit below is a cost control first and a UX rule second.
 *
 * Generation is capped at PREVIEW_CARD_COUNT cards. Saving a full deck stays
 * behind an account: the "generate free, gate the save" pattern.
 */

// The SDK is not edge-compatible, so this must run on Node.
export const runtime = "nodejs";
// Every request has a different body and spends tokens, so never cache.
export const dynamic = "force-dynamic";

const MODEL = "claude-opus-5";
const PREVIEW_CARD_COUNT = 5;
const MAX_INPUT_CHARS = 6000;
const MIN_INPUT_CHARS = 40;

// Per-instance limits. See the note on rateLimit() for why these are only half
// the story on serverless.
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_IP_PER_WINDOW = 5;
const MAX_GLOBAL_PER_WINDOW = 400;

const anthropic = new Anthropic();

/**
 * Structured outputs guarantee the response parses and has the shape the UI
 * renders, so there is no malformed-JSON retry loop here. The schema cannot
 * express "exactly 5 items" (numeric array constraints are not supported), so
 * the count is enforced in the prompt and by slicing the result.
 */
const DECK_SCHEMA = {
  type: "object",
  properties: {
    subject: {
      type: "string",
      description: "A one to three word label for the subject matter, for example Glycolysis or Cold War.",
    },
    cards: {
      type: "array",
      items: {
        type: "object",
        properties: {
          q: { type: "string", description: "The question on the front of the card." },
          a: { type: "string", description: "The answer on the back. One fact, kept short." },
        },
        required: ["q", "a"],
        additionalProperties: false,
      },
    },
  },
  required: ["subject", "cards"],
  additionalProperties: false,
};

const SYSTEM = `You write flashcards for students, following spaced repetition best practice.

Rules:
- Produce exactly ${PREVIEW_CARD_COUNT} cards.
- One fact per card. If a concept has a definition, an example and an exception, that is three cards, not one.
- Every question must have a single, specific, checkable answer. Never ask yes or no questions, and never use vague prompts like "Tell me about X".
- Keep answers short: a phrase or one sentence, not a paragraph.
- Draw only on the supplied material. Do not invent facts it does not contain.
- If the material is thin or vague, still return ${PREVIEW_CARD_COUNT} cards covering whatever it does contain.`;

/**
 * Best-effort in-process rate limiting.
 *
 * On Vercel this is per lambda instance, not global: traffic spread across
 * instances multiplies the effective ceiling, and a cold start resets the
 * counters. It stops casual repeat-clicking and a runaway client loop, which is
 * most real abuse, but it is NOT a spend cap. Before putting paid traffic on
 * this, move `hits` into a shared store (Vercel KV / Upstash Redis) so the
 * limit holds across instances.
 */
const hits = new Map();
let globalWindowStart = Date.now();
let globalCount = 0;

function rateLimit(ip) {
  const now = Date.now();

  if (now - globalWindowStart > WINDOW_MS) {
    globalWindowStart = now;
    globalCount = 0;
  }
  if (globalCount >= MAX_GLOBAL_PER_WINDOW) {
    return { ok: false, reason: "global" };
  }

  const record = hits.get(ip);
  if (!record || now - record.start > WINDOW_MS) {
    hits.set(ip, { start: now, count: 1 });
  } else if (record.count >= MAX_PER_IP_PER_WINDOW) {
    return { ok: false, reason: "ip" };
  } else {
    record.count += 1;
  }

  // Bound the map so a burst of unique IPs cannot grow it without limit.
  if (hits.size > 5000) {
    for (const [key, value] of hits) {
      if (now - value.start > WINDOW_MS) hits.delete(key);
    }
  }

  globalCount += 1;
  return { ok: true };
}

function clientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

function json(body, status) {
  return Response.json(body, { status });
}

export async function POST(request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("try-flashcards: ANTHROPIC_API_KEY is not set");
    return json({ error: "Flashcard preview is not configured right now." }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  const text = typeof body?.text === "string" ? body.text.trim() : "";

  if (text.length < MIN_INPUT_CHARS) {
    return json(
      { error: `Add a bit more material, at least ${MIN_INPUT_CHARS} characters.` },
      400,
    );
  }
  if (text.length > MAX_INPUT_CHARS) {
    return json(
      {
        error: `That is longer than the preview handles. Trim it to ${MAX_INPUT_CHARS} characters, or sign up to upload the whole PDF.`,
      },
      400,
    );
  }

  const limit = rateLimit(clientIp(request));
  if (!limit.ok) {
    return json(
      {
        error:
          limit.reason === "ip"
            ? "You have used the free previews for now. Sign up to keep generating."
            : "The free preview is busy right now. Sign up to generate without waiting.",
      },
      429,
    );
  }

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4000,
      system: SYSTEM,
      // effort "low" keeps latency and spend down. Thinking is left at its
      // default (on) rather than disabled: on this model disabling thinking can
      // make it write tool calls or <thinking> tags into the visible text, and
      // low effort already captures most of the saving.
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: DECK_SCHEMA },
      },
      messages: [
        {
          role: "user",
          content: `Write ${PREVIEW_CARD_COUNT} flashcards from this material:\n\n<material>\n${text}\n</material>`,
        },
      ],
    });

    // A refusal arrives as a normal HTTP 200 with empty or partial content, so
    // it has to be checked before reading content.
    if (response.stop_reason === "refusal") {
      return json(
        { error: "That material could not be turned into cards. Try a different set of notes." },
        422,
      );
    }
    if (response.stop_reason === "max_tokens") {
      return json(
        { error: "That material was too dense for the preview. Try a shorter section." },
        422,
      );
    }

    const block = response.content.find((b) => b.type === "text");
    if (!block) {
      console.error("try-flashcards: no text block, stop_reason:", response.stop_reason);
      return json({ error: "Could not build a deck from that. Try again." }, 502);
    }

    // Structured outputs guarantee this parses and matches DECK_SCHEMA.
    const deck = JSON.parse(block.text);
    const cards = deck.cards.slice(0, PREVIEW_CARD_COUNT);

    if (cards.length === 0) {
      return json({ error: "Could not build a deck from that. Try again." }, 502);
    }

    return json({ subject: deck.subject, cards });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return json({ error: "The preview is busy right now. Try again in a moment." }, 429);
    }
    if (err instanceof Anthropic.APIConnectionError) {
      return json({ error: "Could not reach the generator. Try again." }, 504);
    }
    console.error("try-flashcards: generation failed", err);
    return json({ error: "Could not build a deck from that. Try again." }, 500);
  }
}

export async function GET() {
  return json({ error: "Method not allowed." }, 405);
}
