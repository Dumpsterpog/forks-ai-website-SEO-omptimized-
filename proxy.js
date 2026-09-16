import { LLMS_TXT } from "@/lib/llmsContent";
export const config = { matcher: ["/"] };
export default function proxy(request) {
  const accept = request.headers.get("accept") || "";
  if (!accept.split(",").some(type => type.trim().split(";")[0] === "text/markdown")) return;
  return new Response(LLMS_TXT, { headers: {
    "Content-Type": "text/markdown; charset=utf-8",
    "Vary": "Accept",
    "X-Content-Type-Options": "nosniff",
    "Link": '<https://forksai.app/>; rel="canonical"',
  }});
}
