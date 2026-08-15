import CompressImageContent from "./CompressImageContent";
import { formatToolJsonLd, jsonLdHtml } from "@/lib/formatToolsMeta";
import { COMPRESS_IMAGE_FAQS } from "@/lib/formatToolsFaqs";

export const metadata = {
  // Absolute rather than the root layout's title template, which spells the
  // brand in mixed case. House style is FORKSAI in caps.
  title: { absolute: "Compress Image to a Target File Size | FORKSAI" },
  description:
    "Compress a JPG, PNG or WebP down to a size you name, such as under 100 KB. See the size it reached and compare the result with the original. Runs in your browser, nothing uploaded.",
  alternates: {
    canonical: "https://forksai.app/compress-image",
  },
  openGraph: {
    type: "website",
    siteName: "FORKSAI",
    title: "Compress Image to a Target File Size | FORKSAI",
    description:
      "Name a target file size and get an image compressed until it fits, with a before and after preview. Free, no signup, nothing leaves your device.",
    url: "https://forksai.app/compress-image",
  },
};

const schemas = formatToolJsonLd({
  path: "/compress-image",
  name: "FORKSAI Image Compressor",
  description:
    "A free browser-based image compressor that works backwards from a target file size, bisecting the encoder quality until the result fits under the limit and only downscaling when quality alone is not enough, with a side by side comparison against the original.",
  faqs: COMPRESS_IMAGE_FAQS,
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
      <CompressImageContent />
    </>
  );
}
