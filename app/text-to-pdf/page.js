import TextToPdfContent from "./TextToPdfContent";
import { formatToolJsonLd, jsonLdHtml } from "@/lib/formatToolsMeta";
import { TEXT_TO_PDF_FAQS } from "@/lib/formatToolsFaqs";

export const metadata = {
  // Absolute rather than the root layout's title template, which spells the
  // brand in mixed case. House style is FORKSAI in caps.
  title: { absolute: "Text to PDF Converter, No Watermark | FORKSAI" },
  description:
    "Paste text and download a PDF. Choose A4 or Letter, portrait or landscape, font, size and margins. No watermark, no signup, and the file is written in your browser.",
  alternates: {
    canonical: "https://forksai.app/text-to-pdf",
  },
  openGraph: {
    type: "website",
    siteName: "FORKSAI",
    title: "Text to PDF Converter, No Watermark | FORKSAI",
    description:
      "Turn plain text into a PDF with your own page size, font and margins. Free, no watermark, and nothing is uploaded.",
    url: "https://forksai.app/text-to-pdf",
  },
};

const schemas = formatToolJsonLd({
  path: "/text-to-pdf",
  name: "FORKSAI Text to PDF Converter",
  description:
    "A free browser-based text to PDF converter that writes the PDF on the device using the standard PDF fonts, with a choice of A4, Letter, Legal or A5 pages, portrait or landscape, font family, font size and margin, and a live preview of the real file.",
  faqs: TEXT_TO_PDF_FAQS,
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
      <TextToPdfContent />
    </>
  );
}
