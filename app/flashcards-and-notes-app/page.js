import FlashcardsAndNotesContent from "@/components/FlashcardsAndNotesContent";
import { jsonLdHtml } from "@/lib/studentTools";
import { comparisonJsonLd, TOOL_OG_IMAGE } from "@/lib/comparePages";
import { FLASHCARDS_AND_NOTES_FAQS } from "@/lib/compareFaqs";

const TITLE = "Flashcards and Notes in One App: How to Choose";
const DESC =
  "Two designs hide behind the phrase notes plus flashcards, and picking the wrong one leaves you with tidy notes and an empty deck. How to tell which fits your material.";

export const metadata = {
  // Absolute rather than the root layout's title template, which spells the
  // brand in mixed case. House style is FORKSAI in caps.
  title: { absolute: TITLE },
  description: DESC,
  alternates: {
    canonical: "https://forksai.app/flashcards-and-notes-app",
  },
  openGraph: {
    type: "website",
    siteName: "FORKSAI",
    title: TITLE,
    description:
      "Notes-first or study-first? The difference decides whether your deck still exists in week ten. How FORKSAI produces notes and a deck from the same upload.",
    url: "https://forksai.app/flashcards-and-notes-app",
    images: TOOL_OG_IMAGE,
  },
};

const schemas = comparisonJsonLd({
  path: "/flashcards-and-notes-app",
  name: "Flashcards and notes in one app",
  description:
    "A guide to the two designs behind study apps that combine notes and flashcards, when each one suits you, and how FORKSAI produces notes and a flashcard deck from the same PDF, pasted text, lecture recording or photographed page.",
  faqs: FLASHCARDS_AND_NOTES_FAQS,
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
      <FlashcardsAndNotesContent />
    </>
  );
}
