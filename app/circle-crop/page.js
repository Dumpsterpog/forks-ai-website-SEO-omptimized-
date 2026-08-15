import CircleCropContent from "./CircleCropContent";
import { toolJsonLd, jsonLdHtml } from "@/lib/studentTools";
import { CIRCLE_CROP_FAQS } from "./faqs";

export const metadata = {
  // Absolute rather than the root layout's title template, which spells the
  // brand in mixed case. House style is FORKSAI in caps.
  title: { absolute: "Circle Crop an Image, Transparent PNG | FORKSAI" },
  description:
    "Crop a photo into a circle for a profile picture and download a PNG with genuinely transparent corners. Pan, zoom, pick a size, add a ring. Nothing is uploaded.",
  alternates: {
    canonical: "https://forksai.app/circle-crop",
  },
  openGraph: {
    type: "website",
    siteName: "FORKSAI",
    title: "Circle Crop an Image, Transparent PNG | FORKSAI",
    description:
      "A free circle cropper that runs in your browser. The corners come out at an alpha of zero, not filled with white, so the cut out works on any background.",
    url: "https://forksai.app/circle-crop",
  },
};

const schemas = toolJsonLd({
  path: "/circle-crop",
  name: "FORKSAI Circle Crop",
  description:
    "A free browser-based circle cropper that masks a square crop to a circle and exports a PNG or WebP with a real alpha channel, with pan and zoom positioning, common avatar sizes, an optional ring and an optional solid colour for the corners. All processing happens on the user's own device.",
  faqs: CIRCLE_CROP_FAQS,
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
      <CircleCropContent />
    </>
  );
}
