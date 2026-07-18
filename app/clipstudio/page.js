import ClipStudioContent from "@/components/ClipStudioContent";

export const metadata = {
  title: "ClipStudio - AI Video Clipping | FORKSAI",
  description:
    "Upload a long video and ClipStudio finds the best moments, clips them, and formats them for Shorts, Reels, and TikTok. No timeline editing required.",
  alternates: {
    canonical: "https://forksai.app/clipstudio",
  },
  openGraph: {
    title: "ClipStudio - AI Video Clipping | FORKSAI",
    description:
      "Turn one long video into clean, ready-to-post clips for Shorts, Reels, and TikTok - automatically, with FORKSAI's ClipStudio.",
    url: "https://forksai.app/clipstudio",
    type: "website",
  },
};

export default function Page() {
  return <ClipStudioContent />;
}
