import FaviconGeneratorContent from "./FaviconGeneratorContent";
import { formatToolJsonLd, jsonLdHtml } from "@/lib/formatToolsMeta";
import { FAVICON_GENERATOR_FAQS } from "@/lib/formatToolsFaqs";
import { TOOL_OG_IMAGE } from "@/lib/studentTools";

export const metadata = {
  // Absolute rather than the root layout's title template, which spells the
  // brand in mixed case. House style is FORKSAI in caps.
  title: { absolute: "Favicon Generator: All Sizes From One Image | FORKSAI" },
  description:
    "Upload one image and get favicons at 16, 32, 48, 180, 192 and 512 pixels, plus a favicon.ico, a manifest and the head tags. Runs in your browser, nothing uploaded.",
  alternates: {
    canonical: "https://forksai.app/favicon-generator",
  },
  openGraph: {
    type: "website",
    siteName: "FORKSAI",
    title: "Favicon Generator: All Sizes From One Image | FORKSAI",
    description:
      "One upload, every favicon size, as single PNGs or one zip with the ico and the head tags. Free, no signup, and your logo never leaves the browser.",
    url: "https://forksai.app/favicon-generator",
    images: TOOL_OG_IMAGE,
  },
};

const schemas = formatToolJsonLd({
  path: "/favicon-generator",
  name: "FORKSAI Favicon Generator",
  description:
    "A free browser-based favicon generator that resizes one image into the 16, 32, 48, 180, 192 and 512 pixel icons a site needs, builds a favicon.ico and a starter web manifest, and packages them as a zip, entirely on the device.",
  faqs: FAVICON_GENERATOR_FAQS,
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
      <FaviconGeneratorContent />
    </>
  );
}
