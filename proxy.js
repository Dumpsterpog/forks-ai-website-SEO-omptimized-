/**
 * Vercel Edge Middleware — AEO (AI Engine Optimization) Content Negotiation
 *
 * Implements the AEO spec tested by DualMark and similar conformance checkers:
 *
 *   Accept: text/markdown  → serve markdown inline (Content-Type: text/markdown)
 *   Known AI bot UA        → serve markdown inline
 *   Accept excludes html+md → 406 Not Acceptable
 *   Normal browser         → pass through (Link + Vary headers added via vercel.json)
 *
 * Markdown response headers required by the AEO spec:
 *   Content-Type: text/markdown; charset=utf-8
 *   X-Markdown-Tokens: <count>
 *   X-Robots-Tag: noindex
 *   Vary: Accept
 *   X-AEO-Version: 1
 *   Link: </llms.txt>; rel="alternate"; type="text/markdown"
 *
 * This mirrors public/llms.txt exactly — keep both in sync.
 */

// ─── AI Bot User-Agent fingerprints ──────────────────────────────────────────
// Only bots that do NOT execute JavaScript are included.
// Google/Bing use Chromium-based crawlers that handle SSR pages fine — excluded.
const AI_BOTS = [
  // OpenAI
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  // Anthropic
  "anthropic-ai",
  "ClaudeBot",
  "Claude-Web",
  // Perplexity
  "PerplexityBot",
  // You.com
  "YouBot",
  // Common Crawl (AI training datasets)
  "CCBot",
  // Apple
  "Applebot-Extended",
  // Meta / Llama
  "meta-externalagent",
  // Cohere
  "cohere-ai",
  // Diffbot (AI knowledge graph)
  "Diffbot",
  // ByteDance / TikTok
  "Bytespider",
  // Allen Institute for AI
  "AI2Bot",
  // Timpi AI search
  "Timpibot",
];

function isAIBot(ua) {
  if (!ua) return false;
  const lower = ua.toLowerCase();
  return AI_BOTS.some((bot) => lower.includes(bot.toLowerCase()));
}

// Returns true when Accept explicitly excludes both text/html and text/markdown
// (e.g. "Accept: application/json"). Real browsers always include */* so never hit this.
function isNotAcceptable(accept) {
  if (!accept) return false;
  const types = accept
    .split(",")
    .map((t) => t.split(";")[0].trim().toLowerCase());
  const hasHtml = types.some(
    (t) => t === "text/html" || t === "text/*" || t === "*/*"
  );
  const hasMarkdown = types.some(
    (t) => t === "text/markdown" || t === "text/*" || t === "*/*"
  );
  return !hasHtml && !hasMarkdown;
}

// ─── Inline markdown content (served to AI bots and Accept: text/markdown) ───
// Mirrors /llms.txt exactly so any client can verify by fetching that file.
const MARKDOWN_CONTENT = `# FORKSAI

> FORKSAI is a free, fully customizable AI-powered study platform. It turns any PDF, notes, text, slides, YouTube video, or image into a complete, configurable flashcard deck or structured study notes in seconds. Unlike a basic PDF-to-flashcards converter, every generation is controllable: difficulty, question types, card count, note style, detail level, and a Smart Focus panel that tells the AI exactly what to prioritize. Used by 100,000+ students worldwide.

## What is FORKSAI?

FORKSAI is an AI study tool built for students, medical learners, and working professionals. It is more than a one-click PDF-to-flashcards generator: it ships with a full configuration panel for both the AI Flashcard Generator and the AI Notes Summarizer, so you control exactly what gets created and how. Upload any PDF, paste notes, drop a YouTube link, or upload an image, and receive a structured, exam-ready flashcard deck or formatted study notes in under 30 seconds. No manual card creation required.

FORKSAI is available at https://forksai.app and works entirely in the browser with no download or installation required.

## Core Features

### PDF to Flashcards
Upload any PDF (textbooks, lecture slides, research papers, study guides) and FORKSAI's AI extracts key concepts, definitions, and facts to create a complete flashcard deck. Supports files of any length.

### Customizable AI Flashcard Generator (Configuration Panel)
FORKSAI is not a fixed one-click generator — it gives you a full configuration panel before every flashcard generation: difficulty level, question types, number of cards, Smart Focus tags, and multiple input sources (PDF, pasted text, YouTube URL, PPTX, or image via OCR).

### AI Notes Summarizer and PDF to Notes (Configuration Panel)
Turns any PDF or text into clean, structured study notes with configurable note style (Structured, Cornell, Narrative, Outline), detail level, and focus area, plus a built-in rich-text editor.

### 9 Built-in Study Modes
AI Flashcards, Spaced Repetition (FSRS-5), Weak Spot Trainer, Exam Simulator, Explain Back Mode, Memory Sprint, Podcast Mode (Premium), Interactive Mind Maps, Live Study Rooms.

### Medical Encyclopedia (Premium)
Instant AI summaries for every medical term. Built for pre-med students, nursing students, and USMLE preparation.

## Who Uses FORKSAI?

University and college students, medical students (USMLE Step 1/2), NEET and JEE aspirants, nursing and pre-med students, language learners, and working professionals upskilling or certifying.

## Pricing

Free plan ($0, no AI generation), Premium Day Pass ($1.99/day), Premium Monthly ($7.99/month, 100 AI generations), Premium Yearly ($23.99/year, best value).

## Frequently Asked Questions

**What makes FORKSAI different from Quizlet?** FORKSAI generates flashcards automatically from your own material using AI. Quizlet requires manual card creation or searching public sets.

**How is FORKSAI different from Anki?** Anki requires significant manual setup. FORKSAI generates a complete deck in under 30 seconds with built-in FSRS-5 spaced repetition.

**Is FORKSAI free?** Yes. The free plan includes all core study modes, unlimited deck creation, and progress tracking. AI flashcard generation requires a Premium plan.

**What file types does FORKSAI support?** PDF, plain text, PPTX, images (via OCR), and YouTube video URLs.

## Company Information

Website: https://forksai.app | Support: support@forksai.app | Founded: 2024 | Users: 100,000+ students worldwide

## Key Pages

- Homepage: https://forksai.app/
- Pricing: https://forksai.app/#pricing
- AI Flashcard Generator: https://forksai.app/ai-flashcards
- AI Notes Summarizer: https://forksai.app/ai-summarizer
- PDF to Flashcards: https://forksai.app/pdf-to-flashcards
- Blog: https://forksai.app/blogs
`;

// Token count: rough approximation using ~4 chars per token (GPT-4 tokenizer average)
const TOKEN_COUNT = Math.ceil(MARKDOWN_CONTENT.length / 4);

// ─── Markdown response builder ────────────────────────────────────────────────
function markdownResponse() {
  return new Response(MARKDOWN_CONTENT, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "X-Markdown-Tokens": String(TOKEN_COUNT),
      "X-Robots-Tag": "noindex",
      "Vary": "Accept",
      "X-AEO-Version": "1.0",
      "X-Content-Type-Options": "nosniff",
      "Link": '</llms.txt>; rel="alternate"; type="text/markdown"',
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}

// ─── Middleware export ────────────────────────────────────────────────────────

export const config = {
  matcher: ["/:path*"],
};

export default function proxy(request) {
  const { pathname } = new URL(request.url);

  // Skip API routes, static assets, and anything owned by the old app via the
  // multi-zone fallback rewrite (dashboard, dev login, auth bridge) — none of
  // that is meant to be indexed or AEO-negotiated, robots.txt already
  // disallows /dashboard.
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/auth-bridge") ||
    pathname.includes(".")
  )
    return;

  const ua = request.headers.get("user-agent") || "";
  const accept = request.headers.get("accept") || "";

  // 406: client explicitly rejects both text/html and text/markdown
  if (isNotAcceptable(accept)) {
    return new Response("Not Acceptable", {
      status: 406,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Vary": "Accept",
      },
    });
  }

  // Serve markdown for AI bots or explicit Accept: text/markdown negotiation
  if (isAIBot(ua) || accept.includes("text/markdown")) {
    return markdownResponse();
  }

  // Normal browsers: pass through to the Next.js app or the fallback proxy.
}
