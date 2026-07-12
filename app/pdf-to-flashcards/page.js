import PdfToFlashcardsContent from "@/components/PdfToFlashcardsContent";

export const metadata = {
  title: "PDF to Flashcards Converter - Convert Any PDF into Study Cards Free | FORKSAI",
  description:
    "Convert any PDF into flashcards automatically with FORKSAI. Upload textbooks, research papers, or lecture slides and get an exam-ready flashcard deck in under 30 seconds. Free AI PDF to flashcard converter.",
  alternates: {
    canonical: "https://forksai.app/pdf-to-flashcards",
  },
  openGraph: {
    title: "PDF to Flashcards Converter - Convert Any PDF into Study Cards Free | FORKSAI",
    description:
      "Convert any PDF into flashcards automatically with FORKSAI. Textbooks, papers, lecture slides - ready in seconds. Free to try.",
    url: "https://forksai.app/pdf-to-flashcards",
    type: "website",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "FORKSAI PDF to Flashcards Converter",
  description:
    "Convert any PDF into flashcards automatically with FORKSAI. Upload textbooks, research papers, or lecture slides and get an exam-ready flashcard deck in under 30 seconds.",
  url: "https://forksai.app/pdf-to-flashcards",
  applicationCategory: "EducationalApplication",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  operatingSystem: "Web",
  browserRequirements: "Requires JavaScript",
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <PdfToFlashcardsContent />
    </>
  );
}
