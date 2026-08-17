/**
 * Next.js proxy (Node runtime) - AEO (AI Engine Optimization) Content Negotiation
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
 * The markdown body lives in lib/llmsContent.js, which is also what the
 * /llms.txt route handler serves, so the two can never disagree.
 */

import { LLMS_TXT as MARKDOWN_CONTENT } from "@/lib/llmsContent";

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
