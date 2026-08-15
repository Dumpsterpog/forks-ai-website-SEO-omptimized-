import SgpaToCgpaCalculatorContent from "./SgpaToCgpaCalculatorContent";
import { calcToolJsonLd, jsonLdHtml } from "@/lib/calcToolsList";
import { SGPA_CGPA_FAQS } from "@/lib/calcToolsFaqs";

export const metadata = {
  // Absolute rather than the root layout's title template, which spells the
  // brand in mixed case. House style is FORKSAI in caps.
  title: { absolute: "SGPA to CGPA Calculator (Credit Weighted) | FORKSAI" },
  description:
    "Free SGPA to CGPA calculator. Combine semester SGPAs into a credit-weighted CGPA, or find the SGPA you still need to hit a target. Formula shown, 10-point and 4-point scales.",
  alternates: {
    canonical: "https://forksai.app/sgpa-to-cgpa-calculator",
  },
  openGraph: {
    type: "website",
    siteName: "FORKSAI",
    title: "SGPA to CGPA Calculator (Credit Weighted) | FORKSAI",
    description:
      "Turn several semester SGPAs into one credit-weighted CGPA, or work backwards to the SGPA the rest of your degree needs. Free, no signup.",
    url: "https://forksai.app/sgpa-to-cgpa-calculator",
  },
};

const schemas = calcToolJsonLd({
  path: "/sgpa-to-cgpa-calculator",
  name: "FORKSAI SGPA to CGPA Calculator",
  description:
    "A free browser-based calculator that aggregates semester SGPAs into a credit-weighted CGPA on either a 10-point or a 4-point scale, and solves the reverse question of what average the remaining credits must reach for a target CGPA. It states the formula it applies and notes that university regulations differ.",
  faqs: SGPA_CGPA_FAQS,
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
      <SgpaToCgpaCalculatorContent />
    </>
  );
}
