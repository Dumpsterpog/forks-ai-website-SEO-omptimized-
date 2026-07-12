import BlogLayout from "@/components/BlogLayout";

const SEO_TITLE = "How to Prepare for Any Exam in 2 Weeks | FORKSAI Blog";
const SEO_DESC =
  "A realistic, week-by-week plan for exam prep — built around spaced repetition, active recall, and actually understanding the material rather than hoping it sticks.";
const SEO_URL = "https://forksai.app/blog/exam-prep";

export const metadata = {
  title: SEO_TITLE,
  description: SEO_DESC,
  alternates: { canonical: SEO_URL },
  openGraph: {
    type: "article",
    title: SEO_TITLE,
    description: SEO_DESC,
    url: SEO_URL,
    siteName: "FORKSAI",
    locale: "en_US",
    images: [{ url: "https://forksai.app/body.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@forksai",
    creator: "@forksai",
    title: SEO_TITLE,
    description: SEO_DESC,
    images: ["https://forksai.app/body.png"],
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "How to prepare for any exam in 2 weeks",
  description: SEO_DESC,
  image: "https://forksai.app/body.png",
  datePublished: "2026-05-01",
  dateModified: "2026-05-01",
  author: { "@type": "Person", name: "Sam Rivera" },
  publisher: {
    "@type": "Organization",
    name: "FORKSAI",
    logo: { "@type": "ImageObject", url: "https://forksai.app/forks-logo.png" },
  },
  mainEntityOfPage: { "@type": "WebPage", "@id": SEO_URL },
};

export default function BlogExamPrepPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <BlogLayout
        title="How to prepare for any exam in 2 weeks"
        category="Exam Tips"
        author="Sam Rivera"
        date="May 2026"
        readTime="6 min"
        ctaHeading="Stop winging it and build a plan."
        ctaDesc="FORKSAI handles the material generation — you handle the repetition. Upload your notes and get a full study deck in under a minute."
      >
        <p>
          Two weeks sounds tight. But for most examss — a university midterm, a professional certification, a standardized test — two weeks is actually enough time to go from scattered notes to genuine command of the material. The key is not intensity. It is structure. Most students waste exam prep time by doing the wrong things in the wrong order at the wrong stage.
        </p>
        <p>
          This is a realistic week-by-week plan built around how memory actually works — spaced repetition, active recall, and progressive overload on your weak spots. No color-coding your notes for four hours. No rereading the textbook in a panic the night before.
        </p>

        <h3 className="font-serif font-black text-2xl text-[#111] mt-10 mb-2">Week 1: build the foundation</h3>
        <p>
          The first three days of Week 1 are entirely diagnostic. Your job is not to learn anything yet — it is to find out what you do not know. Go through every topic on the syllabus and honestly rate your confidence on each one. Flag the ones where you would fail a pop quiz right now. These are your priority cards.
        </p>
        <p>
          From Day 3 onwards, start converting your notes into flashcards. Do not just copy definitions. Frame each card as a retrieval challenge: a question that forces you to reconstruct a concept, not recognize it. If you are using FORKSAI, upload your notes or lecture slides and let the platform generate a full deck automatically — then spend your remaining time in Week 1 doing your first pass through the spaced repetition queue. You are not trying to master everything yet. You are seeding the algorithm with your performance so it can route harder cards back to you sooner.
        </p>
        <p>
          End Week 1 by doing one untimed practice question set on each major topic. Do not look anything up mid-answer. The goal is to surface the gaps that your note review did not reveal.
        </p>

        <h3 className="font-serif font-black text-2xl text-[#111] mt-10 mb-2">Week 2: pressure test everything</h3>
        <p>
          Week 2 is where the algorithm pays off. By now your review queue has recalibrated around the cards you got wrong. Do your daily review session every morning — even fifteen minutes is enough if you are consistent — and watch the hard cards gradually shrink as a proportion of the queue. This is the spaced repetition flywheel: you are reviewing material at exactly the moment it is about to slip, which means every review session is maximally efficient.
        </p>
        <p>
          Midweek, run a timed exam simulation. Set a timer for the actual exam duration, use only official past papers or practice questions, and treat it as the real thing. This is uncomfortable on purpose. The discomfort is the point — your brain needs to practice retrieving under time pressure, not just in a relaxed review session. After the simulation, log every question you got wrong and add targeted cards for each gap.
        </p>
        <p>
          In the final two days, do not introduce any new material. Review your weakest cards, re-run the practice questions you got wrong, and get sleep. Memory consolidation happens during sleep. A well-rested brain outperforms a cramming brain on almost every measure of exam performance.
        </p>

        <h3 className="font-serif font-black text-2xl text-[#111] mt-10 mb-2">The mistakes that kill most exam prep plans</h3>
        <p>
          Starting late is the obvious one, but it is not the most damaging mistake. The most damaging mistake is spending Week 1 on passive review — re-reading notes, watching lecture videos again, making beautiful summaries — without ever testing yourself. Passive review creates the illusion of preparation without building the retrieval pathways that actually carry you through an exam.
        </p>
        <p>
          The second mistake is treating all material as equally important. Every exam has a small core of concepts that appear repeatedly and a large periphery of details that rarely show up. Your Week 1 diagnostic exists precisely to find that core. Once you know it, you can allocate 80 percent of your review time to the concepts most likely to determine your grade and handle the rest on maintenance.
        </p>
        <p>
          AI tools change this calculation significantly. When generating flashcards from your notes takes thirty seconds instead of two hours, you can start retrieval practice on Day 1 of your two-week plan instead of Day 5. That compounding effect — more retrieval cycles over more days — is where the real gains come from.
        </p>
        <p>
          Skip straight to Day 1: <a href="/pdf-to-flashcards" className="font-bold text-[#111] underline underline-offset-4">turn a PDF into a flashcard deck</a> with FORKSAI and start your first review session today instead of next week.
        </p>
      </BlogLayout>
    </>
  );
}
