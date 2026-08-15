import DeletePdfPagesContent from "./DeletePdfPagesContent";
import { toolJsonLd, jsonLdHtml } from "@/lib/studentTools";
import { DELETE_PDF_PAGES_FAQS } from "@/lib/pdfToolsFaqs";

export const metadata = {
  // Absolute rather than the root layout's title template, which spells the
  // brand in mixed case. House style is FORKSAI in caps.
  title: { absolute: "Delete Pages From a PDF Free | FORKSAI" },
  description:
    "Pick the pages you do not want from thumbnails, or type their numbers, and save a PDF without them. Your original is untouched and your file never leaves your browser.",
  alternates: {
    canonical: "https://forksai.app/delete-pdf-pages",
  },
  openGraph: {
    type: "website",
    siteName: "FORKSAI",
    title: "Delete Pages From a PDF Free | FORKSAI",
    description:
      "Remove blank scans, cover sheets or whole chapters from a PDF by clicking page previews. No signup, no upload, no watermark.",
    url: "https://forksai.app/delete-pdf-pages",
  },
};

const schemas = toolJsonLd({
  path: "/delete-pdf-pages",
  name: "FORKSAI Delete PDF Pages",
  description:
    "A free browser-based tool that removes chosen pages from a PDF, selected from page thumbnails or typed as a range, and saves a new document containing only the pages kept. All processing happens on the user's own device.",
  faqs: DELETE_PDF_PAGES_FAQS,
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
      <DeletePdfPagesContent />
    </>
  );
}
