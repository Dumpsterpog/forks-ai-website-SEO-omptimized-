import FlashcardsContent from "@/components/FlashcardsContent";

export const metadata = {
  title: "Free AI Flashcards | FORKSAI",
  description:
    "Create and study AI-generated flashcards with FORKSAI. Use active recall, spaced repetition, and smart revision modes to ace your exams. Free for students.",
  alternates: {
    canonical: "https://forksai.app/flashcards",
  },
  openGraph: {
    title: "Free AI Flashcards | FORKSAI",
    description:
      "Study with AI-generated flashcards using active recall and spaced repetition. Free for students on FORKSAI.",
    url: "https://forksai.app/flashcards",
    type: "website",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "FORKSAI AI Flashcards",
  description:
    "Create and study AI-generated flashcards with FORKSAI. Use active recall, spaced repetition, and smart revision modes to ace your exams.",
  url: "https://forksai.app/flashcards",
  applicationCategory: "EducationalApplication",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  operatingSystem: "Web",
  browserRequirements: "Requires JavaScript",
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <FlashcardsContent />
    </>
  );
}
