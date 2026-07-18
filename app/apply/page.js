import ApplyContent from "@/components/ApplyContent";

export const metadata = {
  title: "Work with Us",
  description:
    "Apply to join FORKSAI as a Student Ambassador or Creator Affiliate. Earn real money, access exclusive resources, and grow with a community of students.",
  alternates: {
    canonical: "https://forksai.app/apply",
  },
  openGraph: {
    type: "website",
    title: "Work with FORKSAI",
    description:
      "Apply to join FORKSAI as a Student Ambassador or Creator Affiliate. Earn real money, access exclusive resources, and grow with a community of students.",
    url: "https://forksai.app/apply",
    siteName: "FORKSAI",
  },
};

export default function ApplyPage() {
  return <ApplyContent />;
}
