import DocumentationContent from "@/components/DocumentationContent";

export const metadata = {
  title: "Documentation",
  description:
    "Everything you need to know about FORKSAI - from getting started to understanding how each feature works: AI flashcards, PDF summarizer, quiz generator, revision modes, and more.",
  alternates: {
    canonical: "https://forksai.app/docs",
  },
  openGraph: {
    type: "website",
    title: "FORKSAI Docs",
    description:
      "Everything you need to know about FORKSAI - from getting started to understanding how each feature works.",
    url: "https://forksai.app/docs",
    siteName: "FORKSAI",
  },
};

export default function DocumentationPage() {
  return <DocumentationContent />;
}
