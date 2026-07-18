import AIStudyToolsContent from "@/components/AIStudyToolsContent";

export const metadata = {
  title: "Free AI Study Tools for Students",
  description:
    "FORKSAI's free AI study tools help you learn faster with flashcards, AI podcasts, spaced repetition, and 8 revision modes. No signup required.",
  alternates: {
    canonical: "https://forksai.app/ai-study-tools",
  },
  openGraph: {
    title: "Free AI Study Tools for Students | FORKSAI",
    description:
      "Flashcards, AI podcasts, spaced repetition, and 8 revision modes - FORKSAI's complete free AI study toolkit for students.",
    url: "https://forksai.app/ai-study-tools",
    type: "website",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "FORKSAI AI Study Tools",
  description:
    "FORKSAI's free AI study tools help students learn faster with flashcard generation, AI podcasts, spaced repetition, exam simulation, and 8 revision modes.",
  url: "https://forksai.app/ai-study-tools",
  applicationCategory: "EducationalApplication",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  operatingSystem: "Web",
  browserRequirements: "Requires JavaScript",
  featureList: [
    "AI flashcard generation",
    "AI podcasts",
    "Spaced repetition",
    "Exam simulation",
    "8 revision modes",
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <AIStudyToolsContent />
    </>
  );
}
