import PdfTextExtractorContent from "./PdfTextExtractorContent";
import { toolJsonLd, jsonLdHtml, TOOL_OG_IMAGE } from "@/lib/studentTools";
import { PDF_TEXT_EXTRACTOR_FAQS } from "@/lib/pdfToolsFaqs";

export const metadata = {
  // Absolute rather than the root layout's title template, which spells the
  // brand in mixed case. House style is FORKSAI in caps.
  title: { absolute: "PDF Text Extractor, Free | FORKSAI" },
  description:
    "Copy the selectable text out of a PDF or save it as a .txt file, page by page. Scanned PDFs hold no text to extract, and this says so plainly. Runs in your browser.",
  alternates: {
    canonical: "https://forksai.app/pdf-text-extractor",
  },
  openGraph: {
    type: "website",
    siteName: "FORKSAI",
    title: "PDF Text Extractor, Free | FORKSAI",
    description:
      "Get the text out of a PDF, with page markers and a page range. Honest about scans: a picture of a page has no characters to extract. Nothing is uploaded.",
    url: "https://forksai.app/pdf-text-extractor",
    images: TOOL_OG_IMAGE,
  },
};

const schemas = toolJsonLd({
  path: "/pdf-text-extractor",
  name: "FORKSAI PDF Text Extractor",
  description:
    "A free browser-based tool that extracts the selectable text from a PDF, for a page range or the whole document, with optional page markers and copy or .txt download. It reads real text only and reports pages that are image based. All processing happens on the user's own device.",
  faqs: PDF_TEXT_EXTRACTOR_FAQS,
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
      <PdfTextExtractorContent />
    </>
  );
}
