// The nine file and format tools, in one place, so every page in the set agrees
// on what exists and can cross-link to the rest. Kept separate from
// lib/studentTools.js, which owns the study calculators.
//
// Plain module, no browser APIs: the server page.js files import it to build
// their JSON-LD, and the client components import it for the cross-link strip.

export const SITE_URL = "https://forksai.app";

export const FORMAT_TOOLS = [
  {
    href: "/image-converter",
    name: "Image converter",
    blurb: "Convert PNG, JPG and WebP in any direction, without uploading the file anywhere.",
  },
  {
    href: "/compress-image",
    name: "Compress image to size",
    blurb: "Name a target file size and get the image compressed until it fits under it.",
  },
  {
    href: "/favicon-generator",
    name: "Favicon generator",
    blurb: "One image in, every favicon size out, as a zip or as single files.",
  },
  {
    href: "/text-to-pdf",
    name: "Text to PDF",
    blurb: "Paste text, pick a page size and font size, download a real PDF.",
  },
  {
    href: "/markdown-to-pdf",
    name: "Markdown to PDF",
    blurb: "Write markdown, see it rendered, then export the formatting to PDF.",
  },
  {
    href: "/csv-to-json",
    name: "CSV to JSON",
    blurb: "Convert both ways, with RFC 4180 quoting and a parsed preview table.",
  },
  {
    href: "/word-counter",
    name: "Word counter",
    blurb: "Live words, characters, sentences, paragraphs and reading time.",
  },
  {
    href: "/case-converter",
    name: "Case converter",
    blurb: "UPPER, lower, Title, Sentence, camelCase, snake_case and kebab-case.",
  },
  {
    href: "/qr-code-generator",
    name: "QR code generator",
    blurb: "Turn any text or link into a QR code and download it as PNG or SVG.",
  },
];

/**
 * Builds the WebApplication and FAQPage schemas each tool page emits. Same
 * shape as toolJsonLd in lib/studentTools.js, with the category changed: these
 * nine are utilities rather than study aids.
 */
export function formatToolJsonLd({ path, name, description, faqs }) {
  const url = `${SITE_URL}${path}`;

  const app = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    description,
    url,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    browserRequirements: "Requires JavaScript",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@type": "Organization", name: "FORKSAI", url: SITE_URL },
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return [app, faqPage];
}

// Re-exported from the study tools module rather than reimplemented, so both
// tool families escape their JSON-LD the same way. It replaces "<" with its
// unicode escape, which JSON.stringify leaves alone and which would otherwise
// let a schema string close the script tag early.
export { jsonLdHtml } from "@/lib/studentTools";
