import DiffCheckerContent from "./DiffCheckerContent";
import { formatToolJsonLd, jsonLdHtml } from "@/lib/formatToolsMeta";
import { DIFF_CHECKER_FAQS } from "@/lib/textToolsFaqs";
import { TOOL_OG_IMAGE } from "@/lib/studentTools";

export const metadata = {
  // Absolute rather than the root layout's title template, which spells the
  // brand in mixed case. House style is FORKSAI in caps.
  title: { absolute: "Diff Checker: Compare Two Texts Online | FORKSAI" },
  description:
    "Free text diff checker. Paste two versions and see added, removed and changed lines highlighted, side by side or inline, with word level detail. Runs in your browser, nothing uploaded.",
  alternates: {
    canonical: "https://forksai.app/diff-checker",
  },
  openGraph: {
    type: "website",
    siteName: "FORKSAI",
    title: "Diff Checker: Compare Two Texts Online | FORKSAI",
    description:
      "Compare two texts and see exactly what changed, line by line and word by word. Free, no signup, runs entirely in your browser.",
    url: "https://forksai.app/diff-checker",
    images: TOOL_OG_IMAGE,
  },
};

const schemas = formatToolJsonLd({
  path: "/diff-checker",
  name: "FORKSAI Diff Checker",
  description:
    "A free browser-based diff checker that compares two texts with a longest common subsequence line diff, highlights added, removed and changed lines in side by side or inline views, marks the changed words within an edited line, and uploads nothing.",
  faqs: DIFF_CHECKER_FAQS,
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
      <DiffCheckerContent />
    </>
  );
}
