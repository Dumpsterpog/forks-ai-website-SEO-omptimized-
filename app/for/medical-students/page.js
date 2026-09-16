import StudentAudiencePage from "@/components/StudentAudiencePage";
import { STUDENT_AUDIENCES } from "@/lib/studentAudiences";
const audience = STUDENT_AUDIENCES.find(a => a.slug === "medical-students");
const url = "https://forksai.app/for/medical-students";
export const metadata = { title:audience.title, description:audience.description, alternates:{canonical:url}, openGraph:{type:"website",title:audience.title+" | FORKSAI",description:audience.description,url,images:[{url:"/body.png",width:1200,height:630}]}, twitter:{card:"summary_large_image",title:audience.title+" | FORKSAI",description:audience.description,images:["/body.png"]} };
export default function Page() { return <StudentAudiencePage audience={audience} />; }
