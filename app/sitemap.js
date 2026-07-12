const BASE_URL = "https://forksai.app";

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
    entry("/blogs", { changeFrequency: "weekly", priority: 0.7 }),
    ...BLOG_POSTS.map((p) => entry(p, { changeFrequency: "monthly", priority: 0.6 })),
    ...APPLY_PAGES.map((p) => entry(p, { changeFrequency: "monthly", priority: 0.5 })),
    ...LEGAL_PAGES.map((p) => entry(p, { changeFrequency: "yearly", priority: 0.3 })),
  ];
}
