import NegativeMarkingCalculatorContent from "./NegativeMarkingCalculatorContent";
import { calcToolJsonLd, jsonLdHtml } from "@/lib/calcToolsList";
import { NEGATIVE_MARKING_FAQS } from "@/lib/calcToolsFaqs";
import { TOOL_OG_IMAGE } from "@/lib/studentTools";

export const metadata = {
  // Absolute rather than the root layout's title template, which spells the
  // brand in mixed case. House style is FORKSAI in caps.
  title: { absolute: "Negative Marking Calculator: 1/3, 1/4 and Custom Penalties | FORKSAI" },
  description:
    "Calculate your exam score with 1/3, 1/4 or custom negative marking. Enter attempted and correct answers, marks per correct and the penalty per wrong answer.",
  alternates: {
    canonical: "https://forksai.app/negative-marking-calculator",
  },
  openGraph: {
    type: "website",
    siteName: "FORKSAI",
    title: "Negative Marking Calculator: Score and Accuracy | FORKSAI",
    description:
      "Work out your score after the penalty for wrong answers, with your accuracy and the point where guessing stops paying. Free, no signup.",
    url: "https://forksai.app/negative-marking-calculator",
    images: TOOL_OG_IMAGE,
  },
};

const schemas = calcToolJsonLd({
  path: "/negative-marking-calculator",
  name: "FORKSAI Negative Marking Calculator",
  description:
    "A free browser-based calculator for exams that deduct marks for wrong answers. It takes the total questions, the number attempted, the number correct, the marks per correct answer and the penalty per wrong answer, and returns the projected score, the score as a percentage, accuracy, attempt rate and the accuracy at which guessing breaks even.",
  faqs: NEGATIVE_MARKING_FAQS,
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
      <NegativeMarkingCalculatorContent />
    </>
  );
}
