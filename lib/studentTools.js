// The free student tools, in one place, so the hub page, the cross-link strips,
// the footers and the sitemap all agree on what exists. Plain module rather
// than part of the client shell: app/sitemap.js and the server page.js files
// import from here too.

export const SITE_URL = "https://forksai.app";

export const TOOLS = [
  {
    href: "/attendance-calculator",
    name: "Attendance calculator",
    blurb:
      "Work out how many classes you can skip, or how many you must attend, to stay above your 75% requirement.",
  },
  {
    href: "/final-grade-calculator",
    name: "Final grade calculator",
    blurb:
      "Find the exact score you need on the final exam to finish with the overall grade you want.",
  },
  {
    href: "/cgpa-to-percentage-calculator",
    name: "CGPA to percentage converter",
    blurb:
      "Convert between a 10-point CGPA, a 4-point GPA and a percentage, with the formula shown.",
  },
  {
    href: "/text-to-flashcards",
    name: "Text to flashcards",
    blurb:
      "Paste notes and get flashcards by pattern matching, then export them to CSV or Anki.",
  },
];

export const TOOLS_HUB = "/tools";

/**
 * Builds the WebApplication and FAQPage schemas a tool page emits. Shared so
 * the four pages cannot drift apart in shape, only in content.
 */
export function toolJsonLd({ path, name, description, faqs }) {
  const url = `${SITE_URL}${path}`;

  const app = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    description,
    url,
    applicationCategory: "EducationalApplication",
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

// JSON.stringify does not escape "<", so a schema string containing markup
// could close the script tag early. Follows the Next.js JSON-LD guide.
export function jsonLdHtml(schema) {
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}
