import ForksaiVsNotionContent from "@/components/ForksaiVsNotionContent";
import { jsonLdHtml } from "@/lib/studentTools";
import { comparisonJsonLd, TOOL_OG_IMAGE } from "@/lib/comparePages";
import { FORKSAI_VS_NOTION_FAQS } from "@/lib/compareFaqs";

const TITLE = "FORKSAI vs Notion for Studying and Flashcards";
const DESC =
  "Notion stores your question and answer pairs. It does not decide what you revise today. Where a homemade Notion flashcard setup breaks, and what FORKSAI adds on top of it.";

export const metadata = {
  // Absolute rather than the root layout's title template, which spells the
  // brand in mixed case. House style is FORKSAI in caps.
  title: { absolute: TITLE },
  description: DESC,
  alternates: {
    canonical: "https://forksai.app/forksai-vs-notion",
  },
  openGraph: {
    type: "website",
    siteName: "FORKSAI",
    title: TITLE,
    description:
      "A workspace and a study system are not the same tool. Where a Notion revision setup runs out, and how to keep both without duplicating your work.",
    url: "https://forksai.app/forksai-vs-notion",
    images: TOOL_OG_IMAGE,
  },
};

const schemas = comparisonJsonLd({
  path: "/forksai-vs-notion",
  name: "FORKSAI vs Notion",
  description:
    "A comparison of FORKSAI and a homemade Notion revision setup, covering why storing question and answer pairs is not the same as scheduling them, what FSRS-5 spaced repetition and twelve study modes add, and the many jobs Notion still does better.",
  faqs: FORKSAI_VS_NOTION_FAQS,
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
      <ForksaiVsNotionContent />
    </>
  );
}
