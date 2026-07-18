import BlogsIndexContent from "@/components/BlogsIndexContent";

export const metadata = {
  title: "Study Hacks, AI Tips & Student Guides | FORKSAI Blog",
  description:
    "Read FORKSAI guides on AI flashcards, spaced repetition, active recall, study modes, and how AI is changing the way students learn.",
  alternates: { canonical: "https://forksai.app/blogs" },
  openGraph: {
    type: "website",
    title: "Study Hacks, AI Tips & Student Guides | FORKSAI Blog",
    description:
      "Read FORKSAI guides on AI flashcards, spaced repetition, active recall, study modes, and how AI is changing the way students learn.",
    url: "https://forksai.app/blogs",
    siteName: "FORKSAI",
    locale: "en_US",
    images: [{ url: "https://forksai.app/body.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@forksai",
    creator: "@forksai",
    title: "Study Hacks, AI Tips & Student Guides | FORKSAI Blog",
    description:
      "Read FORKSAI guides on AI flashcards, spaced repetition, active recall, study modes, and how AI is changing the way students learn.",
    images: ["https://forksai.app/body.png"],
  },
};

const POSTS = [
  { title: "Active recall: the study technique that actually works", url: "/blog/active-recall" },
  { title: "How to prepare for any exam in 2 weeks", url: "/blog/exam-prep" },
  { title: "Why your study schedule keeps falling apart", url: "/blog/study-schedule" },
  { title: "FSRS-5 vs SM-2: the algorithm upgrade that actually matters", url: "/blog/fsrs-vs-sm2" },
  { title: "Spaced repetition: the secret to passing heavy exams", url: "/blog/spaced-repetition" },
  { title: "Why traditional flashcards are slowing you down", url: "/blog/flashcards" },
  { title: "I stopped taking notes in lecture. Here is what happened.", url: "/blog/notes-maker" },
  { title: "The problem with rereading the textbook", url: "/blog/study-modes" },
  { title: "Turning downtime into learning time with audio", url: "/blog/ai-podcasts" },
  { title: "The best Quizlet alternative for students who want less busywork", url: "/blog/quizlet-alternative" },
  { title: "The best Anki alternative for students who don't want to fight the interface", url: "/blog/anki-alternative" },
  { title: "How to make Anki cards that actually work", url: "/blog/how-to-make-anki-cards" },
];

const collectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Study Hacks, AI Tips & Student Guides",
  url: "https://forksai.app/blogs",
  description:
    "Read FORKSAI guides on AI flashcards, spaced repetition, active recall, study modes, and how AI is changing the way students learn.",
  mainEntity: {
    "@type": "ItemList",
    itemListElement: POSTS.map((post, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://forksai.app${post.url}`,
      name: post.title,
    })),
  },
};

export default function BlogsIndexPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <BlogsIndexContent />
    </>
  );
}
