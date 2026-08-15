import QrCodeGeneratorContent from "./QrCodeGeneratorContent";
import { formatToolJsonLd, jsonLdHtml } from "@/lib/formatToolsMeta";
import { QR_CODE_FAQS } from "@/lib/formatToolsFaqs";

export const metadata = {
  // Absolute rather than the root layout's title template, which spells the
  // brand in mixed case. House style is FORKSAI in caps.
  title: { absolute: "QR Code Generator: PNG and SVG, No Expiry | FORKSAI" },
  description:
    "Free QR code generator for links and text. Choose the error correction level and size, download PNG or SVG. No redirect service, no expiry, no tracking, and nothing is uploaded.",
  alternates: {
    canonical: "https://forksai.app/qr-code-generator",
  },
  openGraph: {
    type: "website",
    siteName: "FORKSAI",
    title: "QR Code Generator: PNG and SVG, No Expiry | FORKSAI",
    description:
      "Turn a link or text into a QR code and download it as PNG or SVG. The code holds your content directly, so it never expires. Free and generated in your browser.",
    url: "https://forksai.app/qr-code-generator",
  },
};

const schemas = formatToolJsonLd({
  path: "/qr-code-generator",
  name: "FORKSAI QR Code Generator",
  description:
    "A free browser-based QR code generator that encodes links or text directly into the code, with a choice of the four error correction levels and PNG or SVG downloads. The encoding, including the Reed-Solomon error correction, runs on the device with no upload and no redirect service.",
  faqs: QR_CODE_FAQS,
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
      <QrCodeGeneratorContent />
    </>
  );
}
