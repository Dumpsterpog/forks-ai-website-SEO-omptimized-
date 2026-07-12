import PrivacyPolicyContent from "@/components/PrivacyPolicyContent";

export const metadata = {
  title: "Privacy Policy",
  description:
    "How FORKSAI collects, uses, and protects your information across the platform - including the study dashboard, AI tools, and payment features.",
  alternates: {
    canonical: "https://forksai.app/privacy-policy",
  },
  openGraph: {
    type: "website",
    title: "Privacy Policy | FORKSAI",
    description:
      "How FORKSAI collects, uses, and protects your information across the platform - including the study dashboard, AI tools, and payment features.",
    url: "https://forksai.app/privacy-policy",
    siteName: "FORKSAI",
  },
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyContent />;
}
