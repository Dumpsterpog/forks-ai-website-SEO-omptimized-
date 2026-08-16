import TextToFlashcardsContent from "@/components/TextToFlashcardsContent";
import { toolJsonLd, jsonLdHtml, TOOL_OG_IMAGE } from "@/lib/studentTools";
import { TEXT_TO_FLASHCARDS_FAQS } from "@/lib/toolFaqs";

export const metadata = {
  // Absolute rather than the root layout's title template, which spells the
  // brand in mixed case. House style is FORKSAI in caps.
  title: { absolute: "Text to Flashcards Converter | FORKSAI" },
  description:
    "Paste notes and get flashcards, split on Q and A lines, tabs, dashes, colons or alternating lines. Edit the cards, then export to CSV, to Anki or to your printer.",
  alternates: {
    canonical: "https://forksai.app/text-to-flashcards",
  },
  openGraph: {
    type: "website",
    siteName: "FORKSAI",
    title: "Text to Flashcards Converter | FORKSAI",
    description:
      "Turn pasted notes into flashcards by pattern matching, edit them in the preview, and export to CSV or Anki. Runs entirely in your browser.",
    url: "https://forksai.app/text-to-flashcards",
    images: TOOL_OG_IMAGE,
  },
};

const schemas = toolJsonLd({
  path: "/text-to-flashcards",
  name: "FORKSAI Text to Flashcards Converter",
  description:
    "A free browser-based converter that turns pasted notes into flashcards using rule-based pattern matching on Q and A markers, tabs, dashes, colons or alternating lines, with an editable preview and CSV, Anki and print exports.",
  faqs: TEXT_TO_FLASHCARDS_FAQS,
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
      <TextToFlashcardsContent />
    </>
  );
}
