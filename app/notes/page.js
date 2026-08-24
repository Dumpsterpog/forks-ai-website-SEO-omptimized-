import NotesSummarizerContent from "@/components/NotesSummarizerContent";
import { SOFTWARE_OFFERS } from "@/lib/pricing";

export const metadata = {
  title: "AI Notes Summarizer",
  description:
    "Paste your lecture notes or upload a document and FORKSAI's AI summarizer extracts the key points, definitions, and concepts you actually need to study.",
  alternates: {
    canonical: "https://forksai.app/notes",
  },
  openGraph: {
    title: "AI Notes Summarizer | FORKSAI",
    description:
      "Extract key points and definitions from any lecture notes or document with FORKSAI's AI summarizer.",
    url: "https://forksai.app/notes",
    type: "website",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "FORKSAI Notes Summarizer",
  description:
    "Paste your lecture notes or upload a document and FORKSAI's AI summarizer extracts the key points, definitions, and concepts you actually need to study.",
  url: "https://forksai.app/notes",
  applicationCategory: "EducationalApplication",
  offers: SOFTWARE_OFFERS,
  operatingSystem: "Web",
  browserRequirements: "Requires JavaScript",
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <NotesSummarizerContent />
    </>
  );
}
