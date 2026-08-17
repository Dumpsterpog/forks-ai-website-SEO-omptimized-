import RemNoteAlternativeContent from "@/components/RemNoteAlternativeContent";
import { jsonLdHtml } from "@/lib/studentTools";
import { comparisonJsonLd, TOOL_OG_IMAGE } from "@/lib/comparePages";
import { REMNOTE_ALTERNATIVE_FAQS } from "@/lib/compareFaqs";

const TITLE = "RemNote Alternative for Students | FORKSAI";
const DESC =
  "Looking for a RemNote alternative? FORKSAI builds the flashcard deck from your PDF, notes or lecture instead of asking you to write cards inline. FSRS-5 review, 12 study modes, free plan.";

export const metadata = {
  // Absolute rather than the root layout's title template, which spells the
  // brand in mixed case. House style is FORKSAI in caps.
  title: { absolute: TITLE },
  description: DESC,
  alternates: {
    canonical: "https://forksai.app/remnote-alternative",
  },
  openGraph: {
    type: "website",
    siteName: "FORKSAI",
    title: TITLE,
    description:
      "A RemNote alternative for students who would rather hand over a PDF than write cards by hand. What FORKSAI does, and where a notes-first tool still wins.",
    url: "https://forksai.app/remnote-alternative",
    images: TOOL_OG_IMAGE,
  },
};

const schemas = comparisonJsonLd({
  path: "/remnote-alternative",
  name: "RemNote alternative: FORKSAI",
  description:
    "An honest look at replacing RemNote with FORKSAI, a study-first tool that generates flashcard decks and notes from PDFs, pasted text, YouTube lectures and images, reviews them with FSRS-5 spaced repetition, and imports existing Quizlet, Anki and CSV decks.",
  faqs: REMNOTE_ALTERNATIVE_FAQS,
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
      <RemNoteAlternativeContent />
    </>
  );
}
