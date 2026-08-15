import ExamPhotoResizerContent from "./ExamPhotoResizerContent";
import { toolJsonLd, jsonLdHtml } from "@/lib/studentTools";
import { EXAM_PHOTO_FAQS } from "@/lib/imageToolsFaqs";

export const metadata = {
  // Absolute rather than the root layout's title template, which spells the
  // brand in mixed case. House style is FORKSAI in caps.
  title: { absolute: "Exam Photo and Signature Resizer (20 to 50 KB) | FORKSAI" },
  description:
    "Resize a photo or signature to exact pixels and an exact KB range for an application form, for example 200 x 230 px at 20 to 50 KB. Runs in your browser, nothing is uploaded.",
  alternates: {
    canonical: "https://forksai.app/exam-photo-resizer",
  },
  openGraph: {
    type: "website",
    siteName: "FORKSAI",
    title: "Exam Photo and Signature Resizer (20 to 50 KB) | FORKSAI",
    description:
      "Hit the exact pixel size and the exact file size range an exam application form demands. Free, no signup, and your photo never leaves your device.",
    url: "https://forksai.app/exam-photo-resizer",
  },
};

const schemas = toolJsonLd({
  path: "/exam-photo-resizer",
  name: "FORKSAI Exam Photo and Signature Resizer",
  description:
    "A free browser-based tool that resizes an exam application photo or signature to an exact pixel size and searches the JPEG quality range until the encoded file lands inside a required KB band, with presets for common form requirements and fully custom dimensions and size limits.",
  faqs: EXAM_PHOTO_FAQS,
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
      <ExamPhotoResizerContent />
    </>
  );
}
