import RotatePdfContent from "./RotatePdfContent";
import { toolJsonLd, jsonLdHtml } from "@/lib/studentTools";
import { ROTATE_PDF_FAQS } from "@/lib/pdfToolsFaqs";

export const metadata = {
  // Absolute rather than the root layout's title template, which spells the
  // brand in mixed case. House style is FORKSAI in caps.
  title: { absolute: "Rotate PDF and Save It That Way | FORKSAI" },
  description:
    "Turn PDF pages by 90, 180 or 270 degrees and save the rotation into the file, so it opens the right way up everywhere. One page or all of them. Runs in your browser.",
  alternates: {
    canonical: "https://forksai.app/rotate-pdf",
  },
  openGraph: {
    type: "website",
    siteName: "FORKSAI",
    title: "Rotate PDF and Save It That Way | FORKSAI",
    description:
      "Most readers rotate the view and forget it. This writes the rotation into the PDF itself. Page previews turn as you press, and nothing is uploaded.",
    url: "https://forksai.app/rotate-pdf",
  },
};

const schemas = toolJsonLd({
  path: "/rotate-pdf",
  name: "FORKSAI Rotate PDF",
  description:
    "A free browser-based PDF rotator that turns selected pages or every page by 90, 180 or 270 degrees and writes the rotation into the saved file, with live page previews. All processing happens on the user's own device.",
  faqs: ROTATE_PDF_FAQS,
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
      <RotatePdfContent />
    </>
  );
}
