import PercentageCalculatorContent from "./PercentageCalculatorContent";
import { calcToolJsonLd, jsonLdHtml } from "@/lib/calcToolsList";
import { PERCENTAGE_FAQS } from "@/lib/calcToolsFaqs";
import { TOOL_OG_IMAGE } from "@/lib/studentTools";

export const metadata = {
  // Absolute rather than the root layout's title template, which spells the
  // brand in mixed case. House style is FORKSAI in caps.
  title: { absolute: "Percentage Calculator: 3 Calculators in One | FORKSAI" },
  description:
    "Free percentage calculator. Work out what percent X is of Y, what X% of Y comes to, and the percentage increase or decrease between two numbers. Answers update as you type.",
  alternates: {
    canonical: "https://forksai.app/percentage-calculator",
  },
  openGraph: {
    type: "website",
    siteName: "FORKSAI",
    title: "Percentage Calculator: 3 Calculators in One | FORKSAI",
    description:
      "The three percentage questions on one page: what percent is X of Y, what is X% of Y, and the increase or decrease between two numbers. Free, no signup.",
    url: "https://forksai.app/percentage-calculator",
    images: TOOL_OG_IMAGE,
  },
};

const schemas = calcToolJsonLd({
  path: "/percentage-calculator",
  name: "FORKSAI Percentage Calculator",
  description:
    "A free browser-based percentage calculator with three modes: what percent one number is of another, what a given percentage of a number comes to, and the percentage increase or decrease between two values. Each mode shows the formula it applied, and a change from zero is reported as undefined rather than as infinity.",
  faqs: PERCENTAGE_FAQS,
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
      <PercentageCalculatorContent />
    </>
  );
}
