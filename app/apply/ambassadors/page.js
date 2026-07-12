import AmbassadorsContent from "@/components/AmbassadorsContent";

export const metadata = {
  title: "Student Ambassadors",
  description:
    "Represent FORKSAI on your campus, build community, and earn while you learn as a Student Ambassador.",
  alternates: {
    canonical: "https://forksai.app/apply/ambassadors",
  },
  openGraph: {
    type: "website",
    title: "Student Ambassadors | FORKSAI",
    description:
      "Represent FORKSAI on your campus, build community, and earn while you learn as a Student Ambassador.",
    url: "https://forksai.app/apply/ambassadors",
    siteName: "FORKSAI",
  },
};

export default function AmbassadorsPage() {
  return <AmbassadorsContent />;
}
