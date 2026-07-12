import TermsContent from "@/components/TermsContent";

export const metadata = {
  title: "Terms & Conditions",
  description:
    "The terms that apply to all products and services under FORKSAI - including the study dashboard, AI tools, Premium subscriptions, and all related features.",
  alternates: {
    canonical: "https://forksai.app/terms",
  },
  openGraph: {
    type: "website",
    title: "Terms & Conditions | FORKSAI",
    description:
      "The terms that apply to all products and services under FORKSAI - including the study dashboard, AI tools, Premium subscriptions, and all related features.",
    url: "https://forksai.app/terms",
    siteName: "FORKSAI",
  },
};

export default function TermsPage() {
  return <TermsContent />;
}
