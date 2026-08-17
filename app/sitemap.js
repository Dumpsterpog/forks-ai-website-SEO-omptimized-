import { TOOLS_HUB } from "@/lib/studentTools";
import { ALL_TOOLS } from "@/app/tools/toolGroups";
import { COMPARE_PAGES } from "@/lib/comparePages";

const BASE_URL = "https://forksai.app";

// Derived from the same groups the hub renders, so the sitemap and the hub
// cannot disagree about which tools exist and a new tool reaches both by being
// added to its own list once.
const TOOL_PAGES = ALL_TOOLS.map((tool) => tool.href);

// Same derivation as the tools: the comparison pages read out of the list that
// already owns them, so adding one reaches its cross-link strip, the footers
// and this file at once.
const COMPARISON_PAGES = COMPARE_PAGES.map((page) => page.href);

const FEATURE_PAGES = [
  "/ai-flashcards",
  "/ai-summarizer",
  "/pdf-to-flashcards",
  "/ai-study-tools",
  "/flashcards",
  "/learn",
  "/notes",
  "/clipstudio",
];

const BLOG_POSTS = [
  "/blog/flashcards",
  "/blog/notes-maker",
  "/blog/study-modes",
  "/blog/ai-podcasts",
  "/blog/spaced-repetition",
  "/blog/active-recall",
  "/blog/exam-prep",
  "/blog/study-schedule",
  "/blog/fsrs-vs-sm2",
  "/blog/quizlet-alternative",
  "/blog/anki-alternative",
  "/blog/how-to-make-anki-cards",
];

const LEGAL_PAGES = ["/faq", "/docs", "/privacy-policy", "/terms", "/refund-policy"];

const APPLY_PAGES = ["/apply", "/apply/ambassadors", "/apply/creators"];

export default function sitemap() {
  const now = new Date();

  const entry = (path, { changeFrequency, priority }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });

  return [
    entry("/", { changeFrequency: "weekly", priority: 1.0 }),
    ...FEATURE_PAGES.map((p) => entry(p, { changeFrequency: "monthly", priority: 0.9 })),
    ...COMPARISON_PAGES.map((p) => entry(p, { changeFrequency: "monthly", priority: 0.8 })),
    entry(TOOLS_HUB, { changeFrequency: "monthly", priority: 0.8 }),
    ...TOOL_PAGES.map((p) => entry(p, { changeFrequency: "monthly", priority: 0.8 })),
    entry("/blogs", { changeFrequency: "weekly", priority: 0.7 }),
    ...BLOG_POSTS.map((p) => entry(p, { changeFrequency: "monthly", priority: 0.6 })),
    ...APPLY_PAGES.map((p) => entry(p, { changeFrequency: "monthly", priority: 0.5 })),
    ...LEGAL_PAGES.map((p) => entry(p, { changeFrequency: "yearly", priority: 0.3 })),
  ];
}
