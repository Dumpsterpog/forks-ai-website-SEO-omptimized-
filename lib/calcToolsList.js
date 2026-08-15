// The six everyday calculators, in one place, so every page in the set agrees
// on what exists and can cross-link to the rest. Kept separate from
// lib/studentTools.js, which owns the original four study calculators.
//
// Plain module, no browser APIs: the server page.js files import it to build
// their JSON-LD, and the client components import it for the cross-link strip.

export const SITE_URL = "https://forksai.app";

export const CALC_TOOLS = [
  {
    href: "/age-calculator",
    name: "Age calculator",
    blurb:
      "Exact age in years, months and days, plus total days and the countdown to your next birthday.",
  },
  {
    href: "/percentage-calculator",
    name: "Percentage calculator",
    blurb:
      "What percent is X of Y, what is X% of Y, and the increase or decrease between two numbers.",
  },
  {
    href: "/marks-percentage-calculator",
    name: "Marks percentage calculator",
    blurb:
      "Add every subject with its own maximum marks and get the total, the percentage and a per-subject breakdown.",
  },
  {
    href: "/sgpa-to-cgpa-calculator",
    name: "SGPA to CGPA calculator",
    blurb:
      "Combine semester SGPAs into a credit-weighted CGPA, or find the SGPA you still need.",
  },
  {
    href: "/negative-marking-calculator",
    name: "Negative marking calculator",
    blurb:
      "Projected score and accuracy from your attempts, with the penalty for wrong answers applied.",
  },
  {
    href: "/unit-converter",
    name: "Unit converter",
    blurb:
      "Length, weight, temperature and area, converted the moment you type, with the whole table shown.",
  },
];

export const CALC_TOOL_PATHS = CALC_TOOLS.map((tool) => tool.href);

/**
 * Builds the WebApplication and FAQPage schemas each page in this set emits.
 * Same shape as toolJsonLd in lib/studentTools.js, so the families cannot
 * drift apart in structure, only in content.
 */
export function calcToolJsonLd({ path, name, description, faqs }) {
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

// Re-exported rather than reimplemented so every tool family on the site
// escapes its JSON-LD the same way. It replaces "<" with the unicode escape,
// which JSON.stringify leaves alone and which would otherwise let a schema
// string close the script tag early.
export { jsonLdHtml } from "@/lib/studentTools";
