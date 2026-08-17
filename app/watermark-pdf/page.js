import WatermarkPdfContent from "./WatermarkPdfContent";
import { toolJsonLd, jsonLdHtml, TOOL_OG_IMAGE } from "@/lib/studentTools";
import { WATERMARK_PDF_FAQS } from "./faqs";

export const metadata = {
  // Absolute rather than the root layout's title template, which spells the
  // brand in mixed case. House style is FORKSAI in caps.
  title: { absolute: "Watermark a PDF Free, in Your Browser | FORKSAI" },
  description:
    "Stamp text across the pages of a PDF. Set the wording, the angle, the size, how faint it is and which pages get it. Sideways scans are stamped straight, and nothing is uploaded.",
  alternates: {
    canonical: "https://forksai.app/watermark-pdf",
  },
  openGraph: {
    type: "website",
    siteName: "FORKSAI",
    title: "Watermark a PDF Free, in Your Browser | FORKSAI",
    description:
      "Add a draft, sample or confidential watermark to every page, or just the ones you pick. Runs on your own device, so the file is never uploaded.",
    url: "https://forksai.app/watermark-pdf",
    images: TOOL_OG_IMAGE,
  },
};

const schemas = toolJsonLd({
  path: "/watermark-pdf",
  name: "FORKSAI Watermark PDF",
  description:
    "A free browser-based tool that stamps a text watermark across the pages of a PDF, with control over the wording, the position, the angle, the size as a share of the page width, the opacity, the colour, the typeface and which pages are stamped, and correct placement on pages that already carry a rotation. All processing happens on the user's own device and no file is uploaded.",
  faqs: WATERMARK_PDF_FAQS,
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
      <WatermarkPdfContent />
    </>
  );
}
