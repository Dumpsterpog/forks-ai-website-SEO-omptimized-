import PageNumbersContent from "./PageNumbersContent";
import { toolJsonLd, jsonLdHtml, TOOL_OG_IMAGE } from "@/lib/studentTools";
import { PAGE_NUMBERS_FAQS } from "./faqs";

export const metadata = {
  // Absolute rather than the root layout's title template, which spells the
  // brand in mixed case. House style is FORKSAI in caps.
  title: { absolute: "Add Page Numbers to a PDF, Free | FORKSAI" },
  description:
    "Stamp page numbers onto a PDF. Pick the corner, the wording, the size and which pages get one, and start the count where you like. Sideways pages come out the right way up.",
  alternates: {
    canonical: "https://forksai.app/add-page-numbers-to-pdf",
  },
  openGraph: {
    type: "website",
    siteName: "FORKSAI",
    title: "Add Page Numbers to a PDF, Free | FORKSAI",
    description:
      "Numbers are written into the file, so they print and they survive being emailed. Rotated scans are numbered along the edge you actually see. Nothing is uploaded.",
    url: "https://forksai.app/add-page-numbers-to-pdf",
    images: TOOL_OG_IMAGE,
  },
};

const schemas = toolJsonLd({
  path: "/add-page-numbers-to-pdf",
  name: "FORKSAI Add Page Numbers to PDF",
  description:
    "A free browser-based tool that stamps page numbers into an existing PDF, with a choice of six positions, the wording, the first number, the page range, the typeface, the size and the colour, and correct placement on pages that already carry a rotation. All processing happens on the user's own device.",
  faqs: PAGE_NUMBERS_FAQS,
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
      <PageNumbersContent />
    </>
  );
}
