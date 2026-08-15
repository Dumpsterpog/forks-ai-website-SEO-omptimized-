import WatermarkImageContent from "./WatermarkImageContent";
import { toolJsonLd, jsonLdHtml } from "@/lib/studentTools";
import { WATERMARK_IMAGE_FAQS } from "./faqs";

export const metadata = {
  // Absolute rather than the root layout's title template, which spells the
  // brand in mixed case. House style is FORKSAI in caps.
  title: { absolute: "Add a Watermark to an Image, Text or Logo | FORKSAI" },
  description:
    "Stamp text or your own logo onto a photo. Nine positions, opacity, size, angle and colour, with a live preview of the real file. Free, and nothing is uploaded.",
  alternates: {
    canonical: "https://forksai.app/watermark-image",
  },
  openGraph: {
    type: "website",
    siteName: "FORKSAI",
    title: "Add a Watermark to an Image, Text or Logo | FORKSAI",
    description:
      "A free image watermarker that runs in your browser. Size and margin are shares of the picture, so one setting looks right on every photo you run through it.",
    url: "https://forksai.app/watermark-image",
  },
};

const schemas = toolJsonLd({
  path: "/watermark-image",
  name: "FORKSAI Image Watermarker",
  description:
    "A free browser-based image watermarking tool that draws text or an uploaded logo over a picture, with a nine point position grid, opacity, rotation, size, colour and an optional outline, previewed on the full resolution output. All processing happens on the user's own device.",
  faqs: WATERMARK_IMAGE_FAQS,
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
      <WatermarkImageContent />
    </>
  );
}
