import AndroidBetaContent from "@/components/AndroidBetaContent";

export const metadata = {
  title: "Get the Android App (Beta)",
  description:
    "FORKSAI is on Android. Join the beta on Google Play in two taps: AI flashcards, the AI tutor and your decks offline. Coming soon on iOS.",
  alternates: {
    canonical: "https://forksai.app/android",
  },
  openGraph: {
    type: "website",
    title: "FORKSAI for Android (Beta)",
    description:
      "FORKSAI is on Android. Join the beta on Google Play in two taps. Coming soon on iOS.",
    url: "https://forksai.app/android",
    siteName: "FORKSAI",
    images: [{ url: "https://forksai.app/body.png", width: 1200, height: 630 }],
  },
};

export default function AndroidPage() {
  return <AndroidBetaContent />;
}
