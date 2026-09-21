import PomodoroTimerContent from "@/components/PomodoroTimerContent";
import { toolJsonLd, jsonLdHtml, TOOL_OG_IMAGE } from "@/lib/studentTools";
import { POMODORO_FAQS } from "@/lib/newStudyToolFaqs";

const path = "/pomodoro-timer";
const title = "Pomodoro Study Timer (Adjustable) | FORKSAI";
const description = "Free adjustable Pomodoro timer for studying. Run focus sessions, short breaks and long breaks in your browser, with no signup or study-data upload.";

export const metadata = { title: { absolute: title }, description, alternates: { canonical: `https://forksai.app${path}` }, openGraph: { type: "website", siteName: "FORKSAI", title, description, url: `https://forksai.app${path}`, images: TOOL_OG_IMAGE }, twitter: { card: "summary_large_image", title, description, images: ["/body.png"] } };
const schemas = toolJsonLd({ path, name: "FORKSAI Pomodoro Study Timer", description, faqs: POMODORO_FAQS });

export default function Page() {
  return <>{schemas.map((schema, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(schema) }} />)}<PomodoroTimerContent /></>;
}
