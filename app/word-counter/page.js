import WordCounterContent from "./WordCounterContent";
import { formatToolJsonLd, jsonLdHtml } from "@/lib/formatToolsMeta";
import { WORD_COUNTER_FAQS } from "@/lib/formatToolsFaqs";
import { TOOL_OG_IMAGE } from "@/lib/studentTools";

export const metadata = {
  // Absolute rather than the root layout's title template, which spells the
  // brand in mixed case. House style is FORKSAI in caps.
  title: { absolute: "Word Counter: Words, Characters, Reading Time | FORKSAI" },
  description:
    "Free live word counter. Count words, characters with and without spaces, sentences, paragraphs and reading time as you type. Runs in your browser, nothing uploaded.",
  alternates: {
    canonical: "https://forksai.app/word-counter",
  },
  openGraph: {
    type: "website",
    siteName: "FORKSAI",
    title: "Word Counter: Words, Characters, Reading Time | FORKSAI",
    description:
      "Paste your text and see words, characters, sentences, paragraphs and reading time update live. Free, no signup, runs entirely in your browser.",
    url: "https://forksai.app/word-counter",
    images: TOOL_OG_IMAGE,
  },
};

const schemas = formatToolJsonLd({
  path: "/word-counter",
  name: "FORKSAI Word Counter",
  description:
    "A free browser-based word counter that reports words, characters with and without spaces, sentences, paragraphs, lines, and estimated reading and speaking time as you type, with no upload and no account.",
  faqs: WORD_COUNTER_FAQS,
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
      <WordCounterContent />
    </>
  );
}
