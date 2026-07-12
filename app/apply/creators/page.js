import CreatorsContent from "@/components/CreatorsContent";

export const metadata = {
  title: "Creator Affiliates",
  description:
    "Create content, share FORKSAI with your audience, and build a serious revenue stream as a Creator Affiliate.",
  alternates: {
    canonical: "https://forksai.app/apply/creators",
  },
  openGraph: {
    type: "website",
    title: "Creator Affiliates | FORKSAI",
    description:
      "Create content, share FORKSAI with your audience, and build a serious revenue stream as a Creator Affiliate.",
    url: "https://forksai.app/apply/creators",
    siteName: "FORKSAI",
  },
};

export default function CreatorsPage() {
  return <CreatorsContent />;
}
