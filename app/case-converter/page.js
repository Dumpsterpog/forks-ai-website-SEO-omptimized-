import CaseConverterContent from "./CaseConverterContent";
import { formatToolJsonLd, jsonLdHtml } from "@/lib/formatToolsMeta";
import { CASE_CONVERTER_FAQS } from "@/lib/formatToolsFaqs";
import { TOOL_OG_IMAGE } from "@/lib/studentTools";

export const metadata = {
  // Absolute rather than the root layout's title template, which spells the
  // brand in mixed case. House style is FORKSAI in caps.
  title: { absolute: "Case Converter: Upper, Lower, Title, camelCase | FORKSAI" },
  description:
    "Free case converter. Paste text and get UPPER CASE, lower case, Title Case, Sentence case, camelCase, PascalCase, snake_case, kebab-case and CONSTANT_CASE at once.",
  alternates: {
    canonical: "https://forksai.app/case-converter",
  },
  openGraph: {
    type: "website",
    siteName: "FORKSAI",
    title: "Case Converter: Upper, Lower, Title, camelCase | FORKSAI",
    description:
      "Convert text between nine cases at once and copy the one you need. Free, no signup, runs entirely in your browser.",
    url: "https://forksai.app/case-converter",
    images: TOOL_OG_IMAGE,
  },
};

const schemas = formatToolJsonLd({
  path: "/case-converter",
  name: "FORKSAI Case Converter",
  description:
    "A free browser-based case converter that shows UPPER CASE, lower case, Title Case, Sentence case, camelCase, PascalCase, snake_case, kebab-case and CONSTANT_CASE side by side as you type, with per-result copy buttons and no upload.",
  faqs: CASE_CONVERTER_FAQS,
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
      <CaseConverterContent />
    </>
  );
}
