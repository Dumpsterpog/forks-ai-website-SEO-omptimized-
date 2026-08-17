import UrlEncodeContent from "./UrlEncodeContent";
import { formatToolJsonLd, jsonLdHtml } from "@/lib/formatToolsMeta";
import { URL_ENCODE_FAQS } from "@/lib/textToolsFaqs";
import { TOOL_OG_IMAGE } from "@/lib/studentTools";

export const metadata = {
  // Absolute rather than the root layout's title template, which spells the
  // brand in mixed case. House style is FORKSAI in caps.
  title: { absolute: "URL Encode and Decode Online | FORKSAI" },
  description:
    "Free URL encoder and decoder. See encodeURI, encodeURIComponent and form encoding side by side, so you can tell which one your URL actually needs. Runs in your browser, nothing uploaded.",
  alternates: {
    canonical: "https://forksai.app/url-encode-decode",
  },
  openGraph: {
    type: "website",
    siteName: "FORKSAI",
    title: "URL Encode and Decode Online | FORKSAI",
    description:
      "Percent encode and decode URLs, with encodeURI and encodeURIComponent shown together and the difference explained. Free, no signup, runs entirely in your browser.",
    url: "https://forksai.app/url-encode-decode",
    images: TOOL_OG_IMAGE,
  },
};

const schemas = formatToolJsonLd({
  path: "/url-encode-decode",
  name: "FORKSAI URL Encoder and Decoder",
  description:
    "A free browser-based URL encoder and decoder that shows encodeURI, encodeURIComponent and application/x-www-form-urlencoded results side by side, decodes all three, explains which to use for a whole URL versus a single parameter, and uploads nothing.",
  faqs: URL_ENCODE_FAQS,
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
      <UrlEncodeContent />
    </>
  );
}
