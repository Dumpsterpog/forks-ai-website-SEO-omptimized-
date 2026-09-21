import StudyPlannerContent from "@/components/StudyPlannerContent";
import { toolJsonLd, jsonLdHtml, TOOL_OG_IMAGE } from "@/lib/studentTools";
import { STUDY_PLANNER_FAQS } from "@/lib/newStudyToolFaqs";

const path = "/study-planner";
const title = "Exam Study Planner Calculator | FORKSAI";
const description = "Create a realistic exam study plan from your exam date, topic count and available minutes. Get daily targets, review time and a simple revision schedule.";

export const metadata = { title: { absolute: title }, description, alternates: { canonical: `https://forksai.app${path}` }, openGraph: { type: "website", siteName: "FORKSAI", title, description, url: `https://forksai.app${path}`, images: TOOL_OG_IMAGE }, twitter: { card: "summary_large_image", title, description, images: ["/body.png"] } };
const schemas = toolJsonLd({ path, name: "FORKSAI Exam Study Planner", description, faqs: STUDY_PLANNER_FAQS });

export default function Page() {
  return <>{schemas.map((schema, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(schema) }} />)}<StudyPlannerContent /></>;
}
