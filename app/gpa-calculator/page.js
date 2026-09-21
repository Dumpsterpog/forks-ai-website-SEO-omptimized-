import GpaCalculatorContent from "@/components/GpaCalculatorContent";
import { toolJsonLd, jsonLdHtml, TOOL_OG_IMAGE } from "@/lib/studentTools";
import { GPA_FAQS } from "@/lib/newStudyToolFaqs";

const path = "/gpa-calculator";
const title = "GPA Calculator (Weighted by Credits) | FORKSAI";
const description = "Free weighted GPA calculator for college and university students. Add courses and credits, choose a 4.0, 5.0 or 10.0 scale, and see the formula.";

export const metadata = { title: { absolute: title }, description, alternates: { canonical: `https://forksai.app${path}` }, openGraph: { type: "website", siteName: "FORKSAI", title, description, url: `https://forksai.app${path}`, images: TOOL_OG_IMAGE }, twitter: { card: "summary_large_image", title, description, images: ["/body.png"] } };
const schemas = toolJsonLd({ path, name: "FORKSAI Weighted GPA Calculator", description, faqs: GPA_FAQS });

export default function Page() {
  return <>{schemas.map((schema, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(schema) }} />)}<GpaCalculatorContent /></>;
}
