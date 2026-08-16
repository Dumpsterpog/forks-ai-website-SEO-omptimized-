import MarkdownToPdfContent from "./MarkdownToPdfContent";
import { formatToolJsonLd, jsonLdHtml } from "@/lib/formatToolsMeta";
import { MARKDOWN_TO_PDF_FAQS } from "@/lib/formatToolsFaqs";
import { TOOL_OG_IMAGE } from "@/lib/studentTools";

export const metadata = {
  // Absolute rather than the root layout's title template, which spells the
  // brand in mixed case. House style is FORKSAI in caps.
  title: { absolute: "Markdown to PDF Converter | FORKSAI" },
  description:
    "Convert markdown to PDF in your browser. Headings, lists, bold, italic, code blocks, quotes and links are rendered, with a live preview and no upload.",
  alternates: {
    canonical: "https://forksai.app/markdown-to-pdf",
  },
  openGraph: {
    type: "website",
    siteName: "FORKSAI",
    title: "Markdown to PDF Converter | FORKSAI",
    description:
      "Write markdown, see it rendered, download the PDF. Free, no signup, and the document never leaves your device.",
    url: "https://forksai.app/markdown-to-pdf",
    images: TOOL_OG_IMAGE,
  },
};

const schemas = formatToolJsonLd({
  path: "/markdown-to-pdf",
  name: "FORKSAI Markdown to PDF Converter",
  description:
    "A free browser-based markdown to PDF converter covering headings, ordered and unordered lists, bold, italic, inline code, fenced and indented code blocks, block quotes, horizontal rules and links, with a live rendered preview and the PDF written on the device.",
  faqs: MARKDOWN_TO_PDF_FAQS,
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
      <MarkdownToPdfContent />
    </>
  );
}
