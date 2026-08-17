import AISummarizerContent from "@/components/AISummarizerContent";

export const metadata = {
  title: "AI PDF Summarizer for Students",
  description:
    "Summarize any PDF, lecture notes, or textbook chapter with FORKSAI. Get concise, study-ready summaries in seconds. Included with FORKSAI Premium.",
  alternates: {
    canonical: "https://forksai.app/ai-summarizer",
  },
  openGraph: {
    title: "AI PDF Summarizer - Instant Note Summaries | FORKSAI",
    description:
      "Turn long notes and PDFs into concise summaries with FORKSAI's AI summarizer, included with Premium.",
    url: "https://forksai.app/ai-summarizer",
    type: "website",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "FORKSAI AI Summarizer",
  description:
    "Summarize any PDF, lecture notes, or textbook chapter with FORKSAI's AI summarizer. Get concise key points and study-ready summaries in seconds.",
  url: "https://forksai.app/ai-summarizer",
  applicationCategory: "EducationalApplication",
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
