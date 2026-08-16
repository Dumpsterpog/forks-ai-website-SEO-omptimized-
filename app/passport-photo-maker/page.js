import PassportPhotoMakerContent from "./PassportPhotoMakerContent";
import { toolJsonLd, jsonLdHtml, TOOL_OG_IMAGE } from "@/lib/studentTools";
import { PASSPORT_PHOTO_FAQS } from "@/lib/imageToolsFaqs";

export const metadata = {
  // Absolute rather than the root layout's title template, which spells the
  // brand in mixed case. House style is FORKSAI in caps.
  title: { absolute: "Passport Photo Maker (35 x 45 mm and 2 x 2 in) | FORKSAI" },
  description:
    "Crop a photo to 35 x 45 mm, 2 x 2 in or any passport size at 300 or 600 DPI. The right print resolution is written into the file. Runs in your browser, nothing is uploaded.",
  alternates: {
    canonical: "https://forksai.app/passport-photo-maker",
  },
  openGraph: {
    type: "website",
    siteName: "FORKSAI",
    title: "Passport Photo Maker (35 x 45 mm and 2 x 2 in) | FORKSAI",
    description:
      "Standard passport and visa photo sizes at real print resolution, with the pixel arithmetic shown. Free, no signup, and your photo never leaves your device.",
    url: "https://forksai.app/passport-photo-maker",
    images: TOOL_OG_IMAGE,
  },
};

const schemas = toolJsonLd({
  path: "/passport-photo-maker",
  name: "FORKSAI Passport Photo Maker",
  description:
    "A free browser-based passport photo tool that crops an image to standard document sizes such as 35 x 45 mm and 2 x 2 in at a chosen print resolution, converts millimetres to an exact pixel count, writes the DPI into the JPEG header, and can hold the file inside a required size limit.",
  faqs: PASSPORT_PHOTO_FAQS,
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
      <PassportPhotoMakerContent />
    </>
  );
}
