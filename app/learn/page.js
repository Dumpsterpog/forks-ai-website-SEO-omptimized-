import LearnModeContent from "@/components/LearnModeContent";

export const metadata = {
  title: "Learn Mode - Interactive Flashcard Study Sessions",
  description:
    "Study your flashcards in FORKSAI's Learn Mode - an interactive session that adapts to your answers, prioritises weak cards, and tracks your progress per deck.",
  alternates: {
    canonical: "https://forksai.app/learn",
  },
  openGraph: {
    title: "Learn Mode - Interactive Study Sessions | FORKSAI",
    description:
      "Adaptive flashcard study sessions that prioritise your weak cards and track progress. Free on FORKSAI.",
    url: "https://forksai.app/learn",
    type: "website",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "FORKSAI Learn Mode",
  description:
    "Study your flashcards in FORKSAI's Learn Mode - an interactive session that adapts to your answers, prioritises weak cards, and tracks your progress per deck.",
  url: "https://forksai.app/learn",
  applicationCategory: "EducationalApplication",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  operatingSystem: "Web",
  browserRequirements: "Requires JavaScript",
};


export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <LearnModeContent />
    </>
  );
}
