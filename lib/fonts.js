import { DM_Serif_Display, DM_Sans } from "next/font/google";

// Used by the dark "docs family" pages (privacy, terms, refund policy, FAQ,
// docs) — ported from a runtime Google Fonts <link> injection (FontLoader
// components in the old app) to self-hosted next/font.
export const dmSerifDisplay = DM_Serif_Display({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-dm-serif-display",
});

export const dmSans = DM_Sans({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-dm-sans",
});
