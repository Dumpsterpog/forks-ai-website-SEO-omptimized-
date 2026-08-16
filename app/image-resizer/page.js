import ImageResizerContent from "./ImageResizerContent";
import { toolJsonLd, jsonLdHtml, TOOL_OG_IMAGE } from "@/lib/studentTools";
import { IMAGE_RESIZER_FAQS } from "@/lib/imageToolsFaqs";

export const metadata = {
  // Absolute rather than the root layout's title template, which spells the
  // brand in mixed case. House style is FORKSAI in caps.
  title: { absolute: "Image Resizer, by Pixels or Percentage | FORKSAI" },
  description:
    "Resize an image to an exact width and height, or by percentage, with the aspect ratio locked. Export as JPEG, PNG or WebP and see the file size first. Nothing is uploaded.",
  alternates: {
    canonical: "https://forksai.app/image-resizer",
  },
  openGraph: {
    type: "website",
    siteName: "FORKSAI",
    title: "Image Resizer, by Pixels or Percentage | FORKSAI",
    description:
      "Free browser-based image resizer with stepped downscaling for sharp results, live file size, and JPEG, PNG and WebP output. Your image never leaves your device.",
    url: "https://forksai.app/image-resizer",
    images: TOOL_OG_IMAGE,
  },
};

const schemas = toolJsonLd({
  path: "/image-resizer",
  name: "FORKSAI Image Resizer",
  description:
    "A free browser-based image resizer that scales by exact pixel dimensions or by percentage with an optional aspect ratio lock, downscales in halving steps to preserve detail, and exports JPEG, PNG or WebP with the encoded file size shown before download.",
  faqs: IMAGE_RESIZER_FAQS,
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
      <ImageResizerContent />
    </>
  );
}
