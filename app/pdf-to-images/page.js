import PdfToImagesContent from "./PdfToImagesContent";
import { toolJsonLd, jsonLdHtml } from "@/lib/studentTools";
import { PDF_TO_IMAGES_FAQS } from "@/lib/pdfToolsFaqs";

export const metadata = {
  // Absolute rather than the root layout's title template, which spells the
  // brand in mixed case. House style is FORKSAI in caps.
  title: { absolute: "PDF to PNG and JPG, Free | FORKSAI" },
  description:
    "Render PDF pages to PNG or JPG at 1x to 4x, one page or a range. Save them one at a time or as a zip. Your browser does the rendering, so the file is never uploaded.",
  alternates: {
    canonical: "https://forksai.app/pdf-to-images",
  },
  openGraph: {
    type: "website",
    siteName: "FORKSAI",
    title: "PDF to PNG and JPG, Free | FORKSAI",
    description:
      "Turn PDF pages into images at the size you choose, with a progress bar and a stop button for long documents. Nothing is uploaded anywhere.",
    url: "https://forksai.app/pdf-to-images",
  },
};

const schemas = toolJsonLd({
  path: "/pdf-to-images",
  name: "FORKSAI PDF to Images",
  description:
    "A free browser-based converter that renders PDF pages to PNG or JPG images at a chosen scale from 1x to 4x, for a page range or the whole document, with individual and zipped downloads. All rendering happens on the user's own device.",
  faqs: PDF_TO_IMAGES_FAQS,
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
      <PdfToImagesContent />
    </>
  );
}
