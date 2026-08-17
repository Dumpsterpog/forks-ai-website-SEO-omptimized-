import ForksaiVsRemnoteContent from "@/components/ForksaiVsRemnoteContent";
import { jsonLdHtml } from "@/lib/studentTools";
import { comparisonJsonLd, TOOL_OG_IMAGE } from "@/lib/comparePages";
import { FORKSAI_VS_REMNOTE_FAQS } from "@/lib/compareFaqs";

const TITLE = "FORKSAI vs RemNote: Which Suits How You Study?";
const DESC =
  "RemNote grows cards out of your notes. FORKSAI generates them from PDFs, lectures and pasted text. A fair look at which fits your material, including where RemNote wins.";

export const metadata = {
  // Absolute rather than the root layout's title template, which spells the
  // brand in mixed case. House style is FORKSAI in caps.
  title: { absolute: TITLE },
  description: DESC,
  alternates: {
    canonical: "https://forksai.app/forksai-vs-remnote",
  },
  openGraph: {
    type: "website",
    siteName: "FORKSAI",
    title: TITLE,
    description:
      "Two different answers to the same problem: cards written inside your notes, or cards generated from the material you already have. Where each one fits.",
    url: "https://forksai.app/forksai-vs-remnote",
    images: TOOL_OG_IMAGE,
  },
};

const schemas = comparisonJsonLd({
  path: "/forksai-vs-remnote",
  name: "FORKSAI vs RemNote",
  description:
    "A comparison of FORKSAI and RemNote for students, framed by where your study material comes from. Covers deck generation from PDFs and lectures, FSRS-5 spaced repetition, twelve study modes, medical study features, and the cases where a notes-first tool is the better choice.",
  faqs: FORKSAI_VS_REMNOTE_FAQS,
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
      <ForksaiVsRemnoteContent />
    </>
  );
}
