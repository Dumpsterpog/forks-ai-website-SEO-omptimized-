import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Display face for every heading. Replaces Playfair Display, which reads as the
// default AI-generated house style (high-contrast serif plus italic word
// accents) and fought the rest of the design system: hard offset shadows, 2px
// black borders and tape motifs are poster language, which wants a heavy
// grotesque rather than a delicate serif. Bricolage is variable, so one load
// covers the H1 down to card titles.
const displayFont = Bricolage_Grotesque({
  variable: "--font-display-family",
  // No `weight`: Bricolage is a variable font, so this loads one file covering
  // the whole axis instead of a static instance per weight. Its axis tops out
  // at 800, so the `font-black` (900) used throughout clamps to 800.
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  weight: "700",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://forksai.app"),
  title: {
    default: "AI Flashcards & AI Study Tools for Students | ForksAI",
    template: "%s | ForksAI",
  },
  description:
    "ForksAI helps students generate AI flashcards, summaries, and study notes instantly. Turn notes, PDFs, or text into flashcards and study faster.",
  authors: [{ name: "FORKSAI" }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  alternates: {
    types: {
      "text/markdown": "/llms.txt",
    },
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FORKSAI",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />

        {/* Google tag (gtag.js) — ported from the old app's static index.html */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18068336980"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-18068336980');
          `}
        </Script>
      </body>
    </html>
  );
}
