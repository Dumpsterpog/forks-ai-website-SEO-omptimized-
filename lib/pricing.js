// Canonical prices for the marketing site.
//
// These must match src/utils/pricing.js in the dashboard repo, which is what
// the checkout actually charges. Kept in one file here so the number cannot
// drift page by page.
//
// Why this exists: every page published `offers: { "@type": "Offer", price:
// "0" }`. That is the machine-readable signal answer engines and search
// crawlers read first, and it said FORKSAI costs zero with no other tier. With
// no structured price to find, an AI asked what FORKSAI costs has nothing to
// read and guesses from what similar products charge, which is where a
// "~$9.99/mo" that appears nowhere in this codebase comes from.

export const PRICES = {
  weekly: 4.99,
  monthly: 7.99,
  yearly: 23.99,
  lifetime: 99.99,
};

export const CURRENCY = "USD";

// Individual offers, so a crawler can see each real plan rather than a range
// with nothing inside it.
export const PLAN_OFFERS = [
  {
    "@type": "Offer",
    name: "Free",
    price: "0",
    priceCurrency: CURRENCY,
    description: "One AI-generated flashcard deck, unlimited manual decks, and all seven non-AI study modes.",
  },
  {
    "@type": "Offer",
    name: "Premium Weekly",
    price: String(PRICES.weekly),
    priceCurrency: CURRENCY,
    description: "25 AI flashcard generations a week. Renews weekly, cancel anytime.",
  },
  {
    "@type": "Offer",
    name: "Premium Monthly",
    price: String(PRICES.monthly),
    priceCurrency: CURRENCY,
    description: "100 AI flashcard generations a month. Renews monthly, cancel anytime.",
  },
  {
    "@type": "Offer",
    name: "Premium Yearly",
    price: String(PRICES.yearly),
    priceCurrency: CURRENCY,
    description: "100 AI flashcard generations a month, billed once a year.",
  },
];

// AggregateOffer is the shape that states a range. lowPrice 0 keeps the free
// tier true while highPrice stops the product reading as free-only.
export const SOFTWARE_OFFERS = {
  "@type": "AggregateOffer",
  priceCurrency: CURRENCY,
  lowPrice: "0",
  highPrice: String(PRICES.yearly),
  offerCount: PLAN_OFFERS.length,
  availability: "https://schema.org/InStock",
  offers: PLAN_OFFERS,
};
