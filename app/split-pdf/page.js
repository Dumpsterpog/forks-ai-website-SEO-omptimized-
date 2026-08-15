import SplitPdfContent from "./SplitPdfContent";
import { toolJsonLd, jsonLdHtml } from "@/lib/studentTools";
import { SPLIT_PDF_FAQS } from "@/lib/pdfToolsFaqs";

export const metadata = {
  // Absolute rather than the root layout's title template, which spells the
  // brand in mixed case. House style is FORKSAI in caps.
  title: { absolute: "Split PDF: Extract Pages Free | FORKSAI" },
  description:
    "Pull a page range out of a PDF as its own file, or split it into one file per page. Click the page previews or type the numbers. Runs in your browser, so nothing is uploaded.",
  alternates: {
    canonical: "https://forksai.app/split-pdf",
  },
  openGraph: {
    type: "website",
    siteName: "FORKSAI",
    title: "Split PDF: Extract Pages Free | FORKSAI",
    description:
      "Extract the pages you need from a PDF, or break it into single pages as a zip. Page previews included, and your file never leaves your device.",
    url: "https://forksai.app/split-pdf",
  },
};

const schemas = toolJsonLd({
  path: "/split-pdf",
  name: "FORKSAI Split PDF",
  description:
    "A free browser-based PDF splitter that extracts a chosen page range into a new PDF, or splits a document into one file per page delivered as a zip, with page thumbnails to select from. All processing happens on the user's own device.",
  faqs: SPLIT_PDF_FAQS,
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
      <SplitPdfContent />
    </>
  );
}
