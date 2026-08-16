import MergePdfContent from "./MergePdfContent";
import { toolJsonLd, jsonLdHtml, TOOL_OG_IMAGE } from "@/lib/studentTools";
import { MERGE_PDF_FAQS } from "@/lib/pdfToolsFaqs";

export const metadata = {
  // Absolute rather than the root layout's title template, which spells the
  // brand in mixed case. House style is FORKSAI in caps.
  title: { absolute: "Merge PDF Files Free, In Your Browser | FORKSAI" },
  description:
    "Combine several PDFs into one file and drag them into the order you want first. Runs entirely in your browser, so your files are never uploaded. No signup, no watermark.",
  alternates: {
    canonical: "https://forksai.app/merge-pdf",
  },
  openGraph: {
    type: "website",
    siteName: "FORKSAI",
    title: "Merge PDF Files Free, In Your Browser | FORKSAI",
    description:
      "Merge PDFs on your own device. Drag to reorder, keep every page, and download the combined file. Nothing is uploaded anywhere.",
    url: "https://forksai.app/merge-pdf",
    images: TOOL_OG_IMAGE,
  },
};

const schemas = toolJsonLd({
  path: "/merge-pdf",
  name: "FORKSAI Merge PDF",
  description:
    "A free browser-based PDF merger that combines several PDF files into one document, with drag to reorder before merging. All processing happens on the user's own device and no file is uploaded to a server.",
  faqs: MERGE_PDF_FAQS,
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
      <MergePdfContent />
    </>
  );
}
