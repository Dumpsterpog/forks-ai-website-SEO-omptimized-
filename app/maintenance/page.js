import { DM_Sans, DM_Serif_Display } from "next/font/google";
import MaintenancePage from "@/components/maintenance/MaintenancePage";

// Shown while the dashboard is down for maintenance. It lives on the
// marketing site so it stays up when the app does not. Not for search.

const serif = DM_Serif_Display({ variable: "--font-mn-serif", weight: "400", subsets: ["latin"], display: "swap" });
const sans = DM_Sans({ variable: "--font-mn-sans", subsets: ["latin"], display: "swap" });

export const metadata = {
  title: "Back shortly",
  description: "FORKSAI is down for a short maintenance. Your decks and notes are safe.",
  robots: { index: false, follow: false },
};

export const viewport = { themeColor: "#f5f3ee" };

export default function Page() {
  return <MaintenancePage fontClass={`${serif.variable} ${sans.variable}`} />;
}
