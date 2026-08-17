// The comparison and alternative pages, in one place, so the pages themselves,
// their cross-link strip, the footers and app/sitemap.js all agree on what
// exists. Same shape as lib/studentTools.js, and for the same reason: a page
// added here reaches every surface without its slug being typed a second time.
//
// Plain module with no browser access at import time. app/sitemap.js and the
// Server Component page.js files import it directly.

import { SITE_URL, TOOL_OG_IMAGE } from "@/lib/studentTools";

export { SITE_URL, TOOL_OG_IMAGE };

export const COMPARE_PAGES = [
  {
    href: "/remnote-alternative",
    name: "RemNote alternative",
    blurb:
      "For students leaving a notes-first tool who want the deck built for them instead of typed by hand.",
  },
  {
    href: "/forksai-vs-remnote",
    name: "FORKSAI vs RemNote",
    blurb:
      "Two different starting points: notes that contain cards, or material that becomes a deck.",
  },
  {
    href: "/forksai-vs-notion",
    name: "FORKSAI vs Notion",
    blurb:
      "A general workspace and a study system solve different problems. Here is where the line falls.",
  },
  {
    href: "/flashcards-and-notes-app",
    name: "Flashcards and notes in one app",
    blurb:
      "What it actually means for notes and review to live together, and how FORKSAI joins them.",
  },
];

// Date the comparison set was last reviewed for accuracy. Fed to the WebPage
// schema so the pages carry an honest freshness signal rather than today's
// date, which would be a lie on every rebuild.
export const COMPARE_REVIEWED = "2026-08-17";

/**
 * Builds the WebPage and FAQPage schemas a comparison page emits.
 *
 * WebPage rather than WebApplication: these pages are not tools, so claiming
 * SoftwareApplication would be structured data that misdescribes the page.
 * Article was the other candidate and was rejected because there is no named
 * author or publication date behind these, and inventing one to satisfy the
 * schema would be exactly the kind of fabrication these pages are supposed to
 * avoid.
 */
export function comparisonJsonLd({ path, name, description, faqs }) {
  const url = `${SITE_URL}${path}`;

  const page = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    description,
    url,
    inLanguage: "en",
    dateModified: COMPARE_REVIEWED,
    isPartOf: {
      "@type": "WebSite",
      name: "FORKSAI",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "FORKSAI",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/forks-logo.png`,
      },
    },
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

  return [page, faqPage];
}
