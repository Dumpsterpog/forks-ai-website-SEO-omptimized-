import LoremIpsumContent from "./LoremIpsumContent";
import { formatToolJsonLd, jsonLdHtml } from "@/lib/formatToolsMeta";
import { LOREM_IPSUM_FAQS } from "@/lib/textToolsFaqs";
import { TOOL_OG_IMAGE } from "@/lib/studentTools";

export const metadata = {
  // Absolute rather than the root layout's title template, which spells the
  // brand in mixed case. House style is FORKSAI in caps.
  title: { absolute: "Lorem Ipsum Generator: Paragraphs, Sentences, Words | FORKSAI" },
  description:
    "Free lorem ipsum generator. Choose paragraphs, sentences or words, set the count, and copy the result as plain text or as HTML paragraphs. Generated in your browser, nothing uploaded.",
  alternates: {
    canonical: "https://forksai.app/lorem-ipsum-generator",
  },
  openGraph: {
    type: "website",
    siteName: "FORKSAI",
    title: "Lorem Ipsum Generator: Paragraphs, Sentences, Words | FORKSAI",
    description:
      "Placeholder text by the paragraph, the sentence or the word, as plain text or ready made HTML paragraphs. Free, no signup, runs entirely in your browser.",
    url: "https://forksai.app/lorem-ipsum-generator",
    images: TOOL_OG_IMAGE,
  },
};

const schemas = formatToolJsonLd({
  path: "/lorem-ipsum-generator",
  name: "FORKSAI Lorem Ipsum Generator",
  description:
    "A free browser-based lorem ipsum generator that produces placeholder text by the paragraph, the sentence or the word, outputs it as plain text or as HTML paragraph elements, can open with the familiar Lorem ipsum dolor sit amet line, and reports the word and character count of the passage. Seeded, so the same settings reproduce the same text, and nothing is uploaded.",
  faqs: LOREM_IPSUM_FAQS,
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
      <LoremIpsumContent />
    </>
  );
}
