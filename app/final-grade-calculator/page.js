import FinalGradeCalculatorContent from "@/components/FinalGradeCalculatorContent";
import { toolJsonLd, jsonLdHtml } from "@/lib/studentTools";
import { FINAL_GRADE_FAQS } from "@/lib/toolFaqs";

export const metadata = {
  // Absolute rather than the root template, which renders the brand as
  // "ForksAI". House style is FORKSAI in caps.
  title: { absolute: "Final Grade Calculator | FORKSAI" },
  description:
    "Find the exact score you need on your final exam to hit your target grade. Says plainly when a target is impossible or already secured, instead of printing an absurd number.",
  alternates: {
    canonical: "https://forksai.app/final-grade-calculator",
  },
  openGraph: {
    type: "website",
    siteName: "FORKSAI",
    title: "Final Grade Calculator | FORKSAI",
    description:
      "Enter your current grade, the final exam weight and your target. Get the score the final has to earn, plus the best and worst grade still available to you.",
    url: "https://forksai.app/final-grade-calculator",
  },
};

const schemas = toolJsonLd({
  path: "/final-grade-calculator",
  name: "FORKSAI Final Grade Calculator",
  description:
    "A free browser-based final grade calculator. Enter your current grade, the weight of the final exam and your target overall grade to get the score the final must earn, along with the highest grade still reachable and the grade already guaranteed.",
  faqs: FINAL_GRADE_FAQS,
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
      <FinalGradeCalculatorContent />
    </>
  );
}
