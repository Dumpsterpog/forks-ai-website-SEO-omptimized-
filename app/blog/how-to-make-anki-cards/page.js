import BlogLayout from "@/components/BlogLayout";

const SEO_TITLE = "How to Make Anki Cards That Work";
const SEO_DESC =
  "Anki is only as good as the cards you feed it. A step-by-step guide to writing atomic, high-quality cards that review well.";
const SEO_URL = "https://forksai.app/blog/how-to-make-anki-cards";

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
  headline: "How to make Anki cards that actually work",
  description: SEO_DESC,
  image: "https://forksai.app/body.png",
  datePublished: "2026-07-18",
  dateModified: "2026-07-18",
  author: { "@type": "Person", name: "Jordan Lee" },
  publisher: {
    "@type": "Organization",
    name: "FORKSAI",
    logo: { "@type": "ImageObject", url: "https://forksai.app/forks-logo.png" },
  },
  mainEntityOfPage: { "@type": "WebPage", "@id": SEO_URL },
};

export default function BlogHowToMakeAnkiCardsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <BlogLayout
        title="How to make Anki cards that actually work"
        category="Study Science"
        author="Jordan Lee"
        date="July 2026"
        readTime="7 min"
        ctaHeading="Want the deck built for you instead?"
        ctaDesc="Upload the same material to FORKSAI and get an FSRS-5-ready deck built around these same principles, automatically."
      >
        <p>
          Anki does not fail students. Bad cards do. The scheduling algorithm can only optimize review timing for the card you actually wrote, and a vague, overloaded, or poorly phrased card wastes every review it gets, no matter how well-timed it is.
        </p>
        <p>
          Here is the process I wish someone had explained to me before I burned a semester on cards that looked fine and reviewed terribly.
        </p>

        <h3 className="font-serif font-black text-2xl text-[#111] mt-10 mb-2">1. One fact per card</h3>
        <p>
          This is the single biggest fix available to most Anki decks. If a card asks you to recall three things at once, a definition, an example, and an exception, you will start rating it "Good" the moment you remember two out of three. That quietly breaks the scheduling, because the algorithm thinks you know the card fully.
        </p>
        <p>
          Split it. One card for the definition. One for the example. One for the exception. It feels like more work upfront, but each card reviews cleanly, and cleanly-reviewed cards are what make spaced repetition actually work.
        </p>

        <h3 className="font-serif font-black text-2xl text-[#111] mt-10 mb-2">2. Write the question so there is only one right answer</h3>
        <p>
          Avoid yes-or-no phrasing and vague prompts like "Tell me about mitochondria." Instead, ask something with a single, specific, checkable answer: "What is the primary function of the mitochondria in a eukaryotic cell?" You want to know immediately, without ambiguity, whether you got it right.
        </p>

        <h3 className="font-serif font-black text-2xl text-[#111] mt-10 mb-2">3. Use cloze deletions for things you'd naturally recall in context</h3>
        <p>
          Not everything fits a front-and-back format well. For processes, sequences, or sentences you would normally recall as a whole (like a formula or a step in a mechanism), a cloze deletion, hiding one word or phrase inside a full sentence, tests recall more naturally than an isolated question-and-answer pair.
        </p>

        <h3 className="font-serif font-black text-2xl text-[#111] mt-10 mb-2">4. Add an image or a mnemonic when the concept is spatial</h3>
        <p>
          Anatomy, diagrams, and anything involving relative position between parts are hard to encode as pure text. A single labeled image occlusion card will outperform ten text-based cards trying to describe the same structure. Reserve mnemonics for facts that resist visual representation, like ordered lists or arbitrary sequences.
        </p>

        <h3 className="font-serif font-black text-2xl text-[#111] mt-10 mb-2">5. Tag and organize by subtopic, not just by deck</h3>
        <p>
          A single "Biology" deck with 2,000 untagged cards makes targeted review impossible before a specific exam. Tag cards by chapter or subtopic so you can filter down to exactly what is being tested, especially useful in the final week before an exam when you need to drill weak areas, not the whole semester.
        </p>

        <h3 className="font-serif font-black text-2xl text-[#111] mt-10 mb-2">6. Trust the algorithm and answer honestly</h3>
        <p>
          Rate each card by how well you actually recalled it, not by how you wish you had. FSRS-5 adjusts future review intervals based on your ratings, and inflating them to feel good about your progress just pushes cards you do not actually know further out, right when you need them reviewed sooner.
        </p>

        <h3 className="font-serif font-black text-2xl text-[#111] mt-10 mb-2">Making cards faster</h3>
        <p>
          Every principle above is about card quality, not creation speed, and creation speed is still the real bottleneck for most students. If you are spending more time formatting cards than reviewing them, that ratio is backwards.
        </p>
        <p>
          FORKSAI applies most of these same rules automatically: it splits concepts into atomic cards, phrases questions with a single clear answer, and schedules reviews with the same FSRS-5 algorithm, straight from a PDF, your notes, or a slide deck. You still control difficulty, question type, and card count, but the manual writing step disappears.
        </p>
        <p>
          Want to see your own notes turned into a deck built around these principles? <a href="/ai-flashcards" className="font-bold text-[#111] underline underline-offset-4">Generate a flashcard deck automatically</a> and spend your time reviewing instead of formatting.
        </p>
      </BlogLayout>
    </>
  );
}
