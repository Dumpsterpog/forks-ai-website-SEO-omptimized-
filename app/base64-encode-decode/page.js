import Base64Content from "./Base64Content";
import { formatToolJsonLd, jsonLdHtml } from "@/lib/formatToolsMeta";
import { BASE64_FAQS } from "@/lib/textToolsFaqs";
import { TOOL_OG_IMAGE } from "@/lib/studentTools";

export const metadata = {
  // Absolute rather than the root layout's title template, which spells the
  // brand in mixed case. House style is FORKSAI in caps.
  title: { absolute: "Base64 Encode and Decode, Text or File | FORKSAI" },
  description:
    "Free base64 encoder and decoder for text and files. Handles UTF-8 properly, so emoji and accented characters survive, and supports URL safe base64 and data URIs. Runs in your browser, nothing uploaded.",
  alternates: {
    canonical: "https://forksai.app/base64-encode-decode",
  },
  openGraph: {
    type: "website",
    siteName: "FORKSAI",
    title: "Base64 Encode and Decode, Text or File | FORKSAI",
    description:
      "Encode and decode base64 both ways, for text and for files, with UTF-8 handled correctly. Free, no signup, runs entirely in your browser.",
    url: "https://forksai.app/base64-encode-decode",
    images: TOOL_OG_IMAGE,
  },
};

const schemas = formatToolJsonLd({
  path: "/base64-encode-decode",
  name: "FORKSAI Base64 Encoder and Decoder",
  description:
    "A free browser-based base64 encoder and decoder for text and files that converts through UTF-8 bytes so emoji and accented characters are preserved, supports standard and URL safe alphabets, optional line wrapping, data URIs, and uploads nothing.",
  faqs: BASE64_FAQS,
});

export default function Page() {
  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdHtml(schema) }}
        />
      ))}
      <Base64Content />
    </>
  );
}
