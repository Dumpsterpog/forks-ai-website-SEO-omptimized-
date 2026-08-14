import CgpaPercentageConverterContent from "@/components/CgpaPercentageConverterContent";
import { toolJsonLd, jsonLdHtml } from "@/lib/studentTools";
import { CGPA_FAQS } from "@/lib/toolFaqs";

export const metadata = {
  // Absolute rather than the root layout's title template, which spells the
  // brand in mixed case. House style is FORKSAI in caps.
  title: { absolute: "CGPA to Percentage Calculator | FORKSAI" },
  description:
    "Convert CGPA to percentage and back, on the 10-point and 4-point scales. Pick the conversion rule your university uses and see the exact formula applied.",
  alternates: {
    canonical: "https://forksai.app/cgpa-to-percentage-calculator",
  },
  openGraph: {
    type: "website",
    siteName: "FORKSAI",
    title: "CGPA to Percentage Calculator | FORKSAI",
    description:
      "Convert between a 10-point CGPA, a 4-point GPA and a percentage in either direction, with the formula named on screen. Free and no signup.",
    url: "https://forksai.app/cgpa-to-percentage-calculator",
  },
};

const schemas = toolJsonLd({
  path: "/cgpa-to-percentage-calculator",
  name: "FORKSAI CGPA to Percentage Converter",
  description:
    "A free browser-based converter for a 10-point CGPA, a 4-point GPA and a percentage, in both directions. Supports the CBSE multiply by 9.5 convention along with other rules used by Indian universities, and states which formula was applied.",
  faqs: CGPA_FAQS,
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
      <CgpaPercentageConverterContent />
    </>
  );
}
