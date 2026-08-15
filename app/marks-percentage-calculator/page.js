import MarksPercentageCalculatorContent from "./MarksPercentageCalculatorContent";
import { calcToolJsonLd, jsonLdHtml } from "@/lib/calcToolsList";
import { MARKS_FAQS } from "@/lib/calcToolsFaqs";

export const metadata = {
  // Absolute rather than the root layout's title template, which spells the
  // brand in mixed case. House style is FORKSAI in caps.
  title: { absolute: "Marks Percentage Calculator (Any Maximum) | FORKSAI" },
  description:
    "Free marks percentage calculator. Add each subject with its own maximum marks and get the total, the overall percentage and a per-subject breakdown. Add or remove subjects as you go.",
  alternates: {
    canonical: "https://forksai.app/marks-percentage-calculator",
  },
  openGraph: {
    type: "website",
    siteName: "FORKSAI",
    title: "Marks Percentage Calculator (Any Maximum) | FORKSAI",
    description:
      "Enter every subject with its own maximum marks and get the total and the overall percentage, weighted correctly rather than averaged. Free, no signup.",
    url: "https://forksai.app/marks-percentage-calculator",
  },
};

const schemas = calcToolJsonLd({
  path: "/marks-percentage-calculator",
  name: "FORKSAI Marks Percentage Calculator",
  description:
    "A free browser-based marks percentage calculator that takes any number of subjects, each with its own maximum marks, and returns the total obtained, the total maximum, the overall percentage and a per-subject breakdown. It works from the marks rather than from per-subject percentages, so subjects out of different totals are weighted correctly.",
  faqs: MARKS_FAQS,
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
      <MarksPercentageCalculatorContent />
    </>
  );
}
