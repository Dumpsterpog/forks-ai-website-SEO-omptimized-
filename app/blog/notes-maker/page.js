import BlogLayout from "@/components/BlogLayout";

const SEO_TITLE = "How to Summarize Notes with AI";
const SEO_DESC =
  "Discover how AI note summarization works, the best strategies to extract key points from lecture notes, and how FORKSAI accelerates your revision workflow.";
const SEO_URL = "https://forksai.app/blog/notes-maker";

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
  headline: "I stopped taking notes in lecture. Here is what happened.",
  description: SEO_DESC,
  image: "https://forksai.app/body.png",
  datePublished: "2026-04-01",
  dateModified: "2026-04-01",
  author: { "@type": "Person", name: "Sam Rivera" },
  publisher: {
    "@type": "Organization",
    name: "FORKSAI",
    logo: { "@type": "ImageObject", url: "https://forksai.app/forks-logo.png" },
  },
  mainEntityOfPage: { "@type": "WebPage", "@id": SEO_URL },
};

export default function BlogNotesMakerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <BlogLayout
        title="I stopped taking notes in lecture. Here is what happened."
        category="AI Tools"
        author="Sam Rivera"
        date="April 2026"
        readTime="5 min"
        ctaHeading="Turn documents into clean notes."
        ctaDesc="Upload your heavy lecture transcripts or readings to get incredibly organized summaries without the busywork."
      >
        <p>
          Walk into any university lecture hall today and you will hear a rapid clatter of laptop keyboards. Hundreds of students are attempting to act as human transcription machines, typing out every single word the professor says.
        </p>
        <p>
          I used to do this. I thought having a fifty-page Google doc by the end of the semester meant I was a diligent student. The problem was that when it came time to study, the document was entirely unreadable. It was a massive brick of unstructured text.
        </p>
        <p>
          When your brain is fully occupied with typing what someone is saying, you are not actually processing the information. You are passing audio straight from your ears down to your fingertips, completely bypassing the comprehension parts of your brain.
        </p>
        <p>
          To learn efficiently, you need to be an active participant in the room. You should be looking at the slides, listening to the arguments, and thinking about how the concepts connect. You cannot do that if you are worried about missing a sentence fragment for your comprehensive notes.
        </p>

        <h3 className="font-serif font-black text-2xl text-[#111] mt-10 mb-2">The problem with transcription</h3>
        <p>
          We live in a time where extracting the core content from a lecture recording or a dense chapter reading takes seconds for software, but hours for humans. So, I completely changed my approach. During lecture, I focus solely on the professor. I might jot down a single phrase or two, but my hands mostly stay off the keyboard.
        </p>

        <h3 className="font-serif font-black text-2xl text-[#111] mt-10 mb-2">Outsourcing the busywork</h3>
        <p>
          Later, I provide the lecture transcript or the corresponding PDF chapter to a summarization tool. It reads the raw material and extracts exactly what I need: a clean, hierarchical outline, bolded key terms, and bulleted lists.
        </p>
        <p>
          Instead of spending two hours attempting to format a messy text document into readable notes, I receive a perfect study guide instantly. This lets me dive right into studying rather than formatting. Ultimately, your time is better spent absorbing the structure of the ideas than drafting them from scratch.
        </p>
        <p>
          Want to try it on your own lecture notes? <a href="/notes" className="font-bold text-[#111] underline underline-offset-4">FORKSAI's AI notes summarizer</a> turns a raw transcript or PDF chapter into a structured outline in seconds.
        </p>
      </BlogLayout>
    </>
  );
}
