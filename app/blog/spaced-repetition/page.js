import BlogLayout from "@/components/BlogLayout";

const SEO_TITLE = "Spaced Repetition Explained";
const SEO_DESC =
  "How the FSRS-5 spaced repetition algorithm works, and how FORKSAI uses it to keep your most important cards on schedule.";
const SEO_URL = "https://forksai.app/blog/spaced-repetition";

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
  headline: "Spaced repetition: the secret to passing heavy exams",
  description: SEO_DESC,
  image: "https://forksai.app/body.png",
  datePublished: "2026-02-01",
  dateModified: "2026-02-01",
  author: { "@type": "Person", name: "Avery Chen" },
  publisher: {
    "@type": "Organization",
    name: "FORKSAI",
    logo: { "@type": "ImageObject", url: "https://forksai.app/forks-logo.png" },
  },
  mainEntityOfPage: { "@type": "WebPage", "@id": SEO_URL },
};

export default function BlogSpacedRepetitionPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <BlogLayout
        title="Spaced repetition: the secret to passing heavy exams"
        category="Memory"
        author="Avery Chen"
        date="February 2026"
        readTime="7 min"
        ctaHeading="Build long-term knowledge."
        ctaDesc="Stop cramming. Start using smart algorithms that adapt to how fast you learn and present material exactly when you need to see it."
      >
        <p>
          It is standard procedure to cram eight chapters of history into a single panicked night. You drink an aggressive amount of caffeine, memorize dates, take the test at 8 AM, and dump the knowledge from your brain by the afternoon.
        </p>
        <p>
          Then finals week rolls around, and you have to learn everything all over again from scratch. It is exhausting, demoralizing, and simply a bad way to handle high-volume classes.
        </p>

        <h3 className="font-serif font-black text-2xl text-[#111] mt-10 mb-2">The dropping curve of memory</h3>
        <p>
          Our brains are ruthlessly efficient. If you learn the capital of a small nation and then do not use that fact for three days, your brain deletes it to save space. Hermann Ebbinghaus formally modeled this as the "forgetting curve," demonstrating that we naturally lose a huge percentage of learned material over a few days.
        </p>
        <p>
          The only way to interrupt the curve is to introduce the information again right before it is forgotten. Do that enough times, and the brain realizes the data is permanently valuable. It locks it into long-term storage.
        </p>

        <h3 className="font-serif font-black text-2xl text-[#111] mt-10 mb-2">Managing the timing</h3>
        <p>
          If a concept is extremely easy, reviewing it tomorrow is a waste of time. You should review it in two weeks. If a concept is grueling, you need to see it again tomorrow. Managing when to see cards is nearly impossible with physical paper setups.
        </p>
        <p>
          Spaced repetition software runs an algorithm in the background. It logs how badly you interact with a prompt and schedules the next review date dynamically based on your performance. It completely flattens the forgetting curve.
        </p>
        <p>
          By giving fifteen minutes a day to a smart review queue, cramming goes away. You inherently know the material. The peace of mind derived from proper spaced repetition completely changes how students walk into an exam hall.
        </p>
        <p>
          Want to see the algorithm run on your own deck? <a href="/learn" className="font-bold text-[#111] underline underline-offset-4">Start a study session in Learn Mode</a> and FORKSAI will schedule every card for you automatically.
        </p>
      </BlogLayout>
    </>
  );
}
