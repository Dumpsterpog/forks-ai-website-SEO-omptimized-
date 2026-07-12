import AISummarizerContent from "@/components/AISummarizerContent";

export const metadata = {
  title: "Free AI Summarizer - Summarize Notes and PDFs Instantly | FORKSAI",
  description:
    "Summarize any PDF, lecture notes, or textbook chapter with FORKSAI's free AI summarizer. Get concise key points and study-ready summaries in seconds. No signup required.",
  alternates: {
    canonical: "https://forksai.app/ai-summarizer",
  },
  openGraph: {
    title: "Free AI Summarizer - Instant Note Summaries | FORKSAI",
    description:
      "Turn long notes and PDFs into concise summaries with FORKSAI's free AI summarizer. No signup required.",
    url: "https://forksai.app/ai-summarizer",
    type: "website",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "FORKSAI AI Summarizer",
  description:
    "Summarize any PDF, lecture notes, or textbook chapter with FORKSAI's free AI summarizer. Get concise key points and study-ready summaries in seconds.",
  url: "https://forksai.app/ai-summarizer",
  applicationCategory: "EducationalApplication",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  operatingSystem: "Web",
  browserRequirements: "Requires JavaScript",
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <AISummarizerContent />
    </>
  );
}
