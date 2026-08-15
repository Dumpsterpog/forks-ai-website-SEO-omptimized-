import AgeCalculatorContent from "./AgeCalculatorContent";
import { calcToolJsonLd, jsonLdHtml } from "@/lib/calcToolsList";
import { AGE_FAQS } from "@/lib/calcToolsFaqs";

export const metadata = {
  // Absolute rather than the root layout's title template, which spells the
  // brand in mixed case. House style is FORKSAI in caps.
  title: { absolute: "Age Calculator: Exact Age in Years, Months, Days | FORKSAI" },
  description:
    "Free age calculator. Get your exact age in years, months and days on today or any date, plus total days and weeks and a countdown to your next birthday. Leap years handled correctly.",
  alternates: {
    canonical: "https://forksai.app/age-calculator",
  },
  openGraph: {
    type: "website",
    siteName: "FORKSAI",
    title: "Age Calculator: Exact Age in Years, Months, Days | FORKSAI",
    description:
      "Work out an exact age in years, months and days between any two dates, with leap years and short months handled properly. Free, no signup.",
    url: "https://forksai.app/age-calculator",
  },
};

const schemas = calcToolJsonLd({
  path: "/age-calculator",
  name: "FORKSAI Age Calculator",
  description:
    "A free browser-based age calculator that reports an exact age in years, months and days between any two dates, along with the total in days, weeks, months and hours, the day of the week of birth, and a countdown to the next birthday. Leap years and month lengths are handled by clamped month arithmetic rather than day borrowing.",
  faqs: AGE_FAQS,
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
      <AgeCalculatorContent />
    </>
  );
}
