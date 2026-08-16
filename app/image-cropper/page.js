import ImageCropperContent from "./ImageCropperContent";
import { toolJsonLd, jsonLdHtml, TOOL_OG_IMAGE } from "@/lib/studentTools";
import { IMAGE_CROPPER_FAQS } from "@/lib/imageToolsFaqs";

export const metadata = {
  // Absolute rather than the root layout's title template, which spells the
  // brand in mixed case. House style is FORKSAI in caps.
  title: { absolute: "Image Cropper, 1:1, 4:3, 16:9 or Custom | FORKSAI" },
  description:
    "Crop an image to a square, 4:3, 16:9 or any ratio you type in. Touch friendly, keeps full resolution, exports JPEG, PNG or WebP. Nothing is uploaded.",
  alternates: {
    canonical: "https://forksai.app/image-cropper",
  },
  openGraph: {
    type: "website",
    siteName: "FORKSAI",
    title: "Image Cropper, 1:1, 4:3, 16:9 or Custom | FORKSAI",
    description:
      "A free ratio-locked image cropper that runs in your browser. Drag or pinch on a phone, keep the original resolution, and see the file size before you download.",
    url: "https://forksai.app/image-cropper",
    images: TOOL_OG_IMAGE,
  },
};

const schemas = toolJsonLd({
  path: "/image-cropper",
  name: "FORKSAI Image Cropper",
  description:
    "A free browser-based image cropper with a frame locked to a chosen aspect ratio of 1:1, 4:3, 16:9, 9:16, 3:2, the original ratio or a custom ratio, keeping the cropped region at full resolution and exporting JPEG, PNG or WebP.",
  faqs: IMAGE_CROPPER_FAQS,
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
      <ImageCropperContent />
    </>
  );
}
