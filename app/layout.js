import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  weight: "900",
  subsets: ["latin"],
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
      className={`${playfairDisplay.variable} ${jetbrainsMono.variable} h-full antialiased`}
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
