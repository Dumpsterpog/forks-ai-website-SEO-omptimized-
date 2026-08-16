import ImagesToPdfContent from "./ImagesToPdfContent";
import { toolJsonLd, jsonLdHtml, TOOL_OG_IMAGE } from "@/lib/studentTools";
import { IMAGES_TO_PDF_FAQS } from "@/lib/pdfToolsFaqs";

export const metadata = {
  // Absolute rather than the root layout's title template, which spells the
  // brand in mixed case. House style is FORKSAI in caps.
  title: { absolute: "Images to PDF: JPG and PNG, Free | FORKSAI" },
  description:
    "Combine JPGs and PNGs into one PDF. Drag to reorder, choose A4, Letter or fit to image, and set the margin. Runs in your browser, so your photos are never uploaded.",
  alternates: {
    canonical: "https://forksai.app/images-to-pdf",
  },
  openGraph: {
    type: "website",
    siteName: "FORKSAI",
    title: "Images to PDF: JPG and PNG, Free | FORKSAI",
    description:
      "Turn photos of a whiteboard, scans or screenshots into a single PDF, with the page size and orientation you pick. Nothing leaves your device.",
    url: "https://forksai.app/images-to-pdf",
    images: TOOL_OG_IMAGE,
  },
};

const schemas = toolJsonLd({
  path: "/images-to-pdf",
  name: "FORKSAI Images to PDF",
  description:
    "A free browser-based converter that combines JPG, PNG and WebP images into a single PDF, with drag to reorder, a choice of A4, Letter or fit to image page sizes, orientation and margin. All processing happens on the user's own device.",
  faqs: IMAGES_TO_PDF_FAQS,
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
      <ImagesToPdfContent />
    </>
  );
}
