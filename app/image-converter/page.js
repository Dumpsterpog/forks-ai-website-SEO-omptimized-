import ImageConverterContent from "./ImageConverterContent";
import { formatToolJsonLd, jsonLdHtml } from "@/lib/formatToolsMeta";
import { IMAGE_CONVERTER_FAQS } from "@/lib/formatToolsFaqs";
import { TOOL_OG_IMAGE } from "@/lib/studentTools";

export const metadata = {
  // Absolute rather than the root layout's title template, which spells the
  // brand in mixed case. House style is FORKSAI in caps.
  title: { absolute: "Image Converter: PNG, JPG and WebP | FORKSAI" },
  description:
    "Free image converter for PNG, JPG and WebP in any direction. Set quality, see the new file size before downloading, and keep the file on your device: nothing is uploaded.",
  alternates: {
    canonical: "https://forksai.app/image-converter",
  },
  openGraph: {
    type: "website",
    siteName: "FORKSAI",
    title: "Image Converter: PNG, JPG and WebP | FORKSAI",
    description:
      "Convert PNG, JPG and WebP both ways in your browser. Quality control, live size preview, and no upload. Free and no signup.",
    url: "https://forksai.app/image-converter",
    images: TOOL_OG_IMAGE,
  },
};

const schemas = formatToolJsonLd({
  path: "/image-converter",
  name: "FORKSAI Image Converter",
  description:
    "A free browser-based image converter that turns PNG, JPG and WebP into each other using the canvas API, with a quality slider, a fill colour for transparency lost to JPG, and a live before and after file size. No upload and no account.",
  faqs: IMAGE_CONVERTER_FAQS,
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
      <ImageConverterContent />
    </>
  );
}
