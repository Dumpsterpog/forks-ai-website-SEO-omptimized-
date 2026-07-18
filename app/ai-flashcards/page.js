import AIFlashcardsContent from "@/components/AIFlashcardsContent";

export const metadata = {
  title: "Free AI Flashcard Generator | FORKSAI",
  description:
    "Generate AI flashcards from your notes, PDFs, or any text in seconds. Turn lecture notes and textbooks into exam-ready cards. No signup required.",
  alternates: {
    canonical: "https://forksai.app/ai-flashcards",
  },
  openGraph: {
    title: "Free AI Flashcard Generator | FORKSAI",
    description:
      "Turn notes and PDFs into exam-ready flashcards instantly with FORKSAI's free AI flashcard generator. No signup required.",
    url: "https://forksai.app/ai-flashcards",
    type: "website",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "FORKSAI AI Flashcard Generator",
  description:
    "Generate AI flashcards from your notes, PDFs, or any text in seconds. Free AI flashcard maker for students - turn lecture notes, textbooks, and study material into exam-ready question-answer cards.",
  url: "https://forksai.app/ai-flashcards",
  applicationCategory: "EducationalApplication",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  operatingSystem: "Web",
  browserRequirements: "Requires JavaScript",
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <AIFlashcardsContent />
    </>
  );
}
