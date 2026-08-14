import AttendanceCalculatorContent from "@/components/AttendanceCalculatorContent";
import { toolJsonLd, jsonLdHtml } from "@/lib/studentTools";
import { ATTENDANCE_FAQS } from "@/lib/toolFaqs";

export const metadata = {
  // Absolute rather than the root template, which renders the brand as
  // "ForksAI". House style is FORKSAI in caps.
  title: { absolute: "Attendance Calculator (75% Rule) | FORKSAI" },
  description:
    "Free attendance calculator for college students. See how many classes you can skip and still hold 75%, or how many you must attend in a row to get back above it.",
  alternates: {
    canonical: "https://forksai.app/attendance-calculator",
  },
  openGraph: {
    type: "website",
    siteName: "FORKSAI",
    title: "Attendance Calculator (75% Rule) | FORKSAI",
    description:
      "Work out how many classes you can skip, or how many you must attend, to stay above your college's 75% attendance requirement. Free, no signup.",
    url: "https://forksai.app/attendance-calculator",
  },
};

const schemas = toolJsonLd({
  path: "/attendance-calculator",
  name: "FORKSAI Attendance Calculator",
  description:
    "A free browser-based attendance calculator that answers both directions of the 75% attendance question: how many classes you can still skip, and how many consecutive classes you must attend to reach the required percentage.",
  faqs: ATTENDANCE_FAQS,
});

export default function Page() {
  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdHtml(schema) }}
        />
      ))}
      <AttendanceCalculatorContent />
    </>
  );
}
