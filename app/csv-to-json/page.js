import CsvToJsonContent from "./CsvToJsonContent";
import { formatToolJsonLd, jsonLdHtml } from "@/lib/formatToolsMeta";
import { CSV_TO_JSON_FAQS } from "@/lib/formatToolsFaqs";
import { TOOL_OG_IMAGE } from "@/lib/studentTools";

export const metadata = {
  // Absolute rather than the root layout's title template, which spells the
  // brand in mixed case. House style is FORKSAI in caps.
  title: { absolute: "CSV to JSON Converter (and Back) | FORKSAI" },
  description:
    "Free CSV to JSON converter that also converts JSON to CSV. Handles quoted fields, embedded commas and line breaks per RFC 4180, with a parsed preview table. Runs in your browser.",
  alternates: {
    canonical: "https://forksai.app/csv-to-json",
  },
  openGraph: {
    type: "website",
    siteName: "FORKSAI",
    title: "CSV to JSON Converter (and Back) | FORKSAI",
    description:
      "Convert CSV to JSON and JSON to CSV with proper RFC 4180 quoting and a parsed preview. Free, no signup, and your data never leaves the browser.",
    url: "https://forksai.app/csv-to-json",
    images: TOOL_OG_IMAGE,
  },
};

const schemas = formatToolJsonLd({
  path: "/csv-to-json",
  name: "FORKSAI CSV to JSON Converter",
  description:
    "A free browser-based converter that turns CSV into JSON and JSON into CSV, following RFC 4180 for quoted fields containing commas, line breaks and doubled quotes, with delimiter detection, optional type detection and a parsed preview table.",
  faqs: CSV_TO_JSON_FAQS,
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
      <CsvToJsonContent />
    </>
  );
}
