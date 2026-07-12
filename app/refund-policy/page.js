import RefundPolicyContent from "@/components/RefundPolicyContent";

export const metadata = {
  title: "Refund Policy",
  description:
    "How refunds, cancellations, and billing disputes are handled for FORKSAI Premium subscriptions.",
  alternates: {
    canonical: "https://forksai.app/refund-policy",
  },
  openGraph: {
    type: "website",
    title: "Refund Policy | FORKSAI",
    description:
      "How refunds, cancellations, and billing disputes are handled for FORKSAI Premium subscriptions.",
    url: "https://forksai.app/refund-policy",
    siteName: "FORKSAI",
  },
};

export default function RefundPolicyPage() {
  return <RefundPolicyContent />;
}
