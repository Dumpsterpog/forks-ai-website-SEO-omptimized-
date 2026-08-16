import JsonFormatterContent from "./JsonFormatterContent";
import { formatToolJsonLd, jsonLdHtml } from "@/lib/formatToolsMeta";
import { JSON_FORMATTER_FAQS } from "@/lib/textToolsFaqs";
import { TOOL_OG_IMAGE } from "@/lib/studentTools";

export const metadata = {
  // Absolute rather than the root layout's title template, which spells the
  // brand in mixed case. House style is FORKSAI in caps.
  title: { absolute: "JSON Formatter, Validator and Minifier | FORKSAI" },
  description:
    "Free JSON formatter and validator. Beautify with 2, 4 or tab indents, minify, and get the exact line and column of any syntax error. Runs in your browser, nothing uploaded.",
  alternates: {
    canonical: "https://forksai.app/json-formatter",
  },
  openGraph: {
    type: "website",
    siteName: "FORKSAI",
    title: "JSON Formatter, Validator and Minifier | FORKSAI",
    description:
      "Beautify, minify and validate JSON, with the line and column of the error pointed out. Free, no signup, runs entirely in your browser.",
    url: "https://forksai.app/json-formatter",
    images: TOOL_OG_IMAGE,
  },
};

const schemas = formatToolJsonLd({
  path: "/json-formatter",
  name: "FORKSAI JSON Formatter",
  description:
    "A free browser-based JSON formatter, validator and minifier with a selectable indent size, exact line and column reporting on syntax errors, duplicate key detection, and formatting that preserves number precision and key order.",
  faqs: JSON_FORMATTER_FAQS,
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
      <JsonFormatterContent />
    </>
  );
}
