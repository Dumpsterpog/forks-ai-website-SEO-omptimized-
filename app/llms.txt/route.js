import { LLMS_TXT } from "@/lib/llmsContent";

// Serves the AEO document from the shared module rather than a static file
// in public/, so proxy.js and this route cannot drift apart.
export const dynamic = "force-static";

export function GET() {
  return new Response(LLMS_TXT, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
