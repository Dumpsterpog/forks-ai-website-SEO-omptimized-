import { LLMS_TXT } from "@/lib/llmsContent";

// Serves the AEO document from the shared module rather than a static file.
// The home page rewrites here for agents that ask for markdown (next.config.mjs).
export const dynamic = "force-static";

export function GET() {
  return new Response(LLMS_TXT, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
