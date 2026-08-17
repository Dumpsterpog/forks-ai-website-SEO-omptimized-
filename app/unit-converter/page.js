import UnitConverterContent from "./UnitConverterContent";
import { calcToolJsonLd, jsonLdHtml } from "@/lib/calcToolsList";
import { UNIT_CONVERTER_FAQS } from "@/lib/calcToolsFaqs";
import { TOOL_OG_IMAGE } from "@/lib/studentTools";

export const metadata = {
  // Absolute rather than the root layout's title template, which spells the
  // brand in mixed case. House style is FORKSAI in caps.
  title: { absolute: "Unit Converter: Length, Weight, Temperature, Area | FORKSAI" },
  description:
    "Free unit converter for length, weight, temperature and area. Exact conversion factors, Celsius to Fahrenheit to Kelvin done properly, and every unit in the category shown at once.",
  alternates: {
    canonical: "https://forksai.app/unit-converter",
  },
  openGraph: {
    type: "website",
    siteName: "FORKSAI",
    title: "Unit Converter: Length, Weight, Temperature, Area | FORKSAI",
    description:
      "Convert length, weight, temperature and area in your browser, with exact factors and the whole category converted at once. Free, no signup.",
    url: "https://forksai.app/unit-converter",
    images: TOOL_OG_IMAGE,
  },
};

const schemas = calcToolJsonLd({
  path: "/unit-converter",
  name: "FORKSAI Unit Converter",
  description:
    "A free browser-based unit converter covering length, weight, temperature and area. Scale units convert through a base unit using the exact international definitions, and temperature is converted through Celsius so the offsets between Celsius, Fahrenheit and Kelvin are applied correctly. Every unit in the chosen category is shown for the same input value.",
  faqs: UNIT_CONVERTER_FAQS,
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
      <UnitConverterContent />
    </>
  );
}
