import { Lexend, Hanken_Grotesk } from "next/font/google";

// The legal pages (privacy, terms, refund policy) are set in the landing
// page's own two faces, self-hosted here rather than fetched at runtime:
// Lexend for headings, Hanken Grotesk for the long reading text.
export const legalDisplay = Lexend({
  subsets: ["latin"],
  weight: ["600", "800", "900"],
  variable: "--font-legal-display",
  display: "swap",
});

export const legalBody = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-legal-body",
  display: "swap",
});
