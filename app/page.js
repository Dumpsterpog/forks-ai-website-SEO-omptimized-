import LandingPage from "@/components/LandingPage";

const TITLE =
  "Free AI Flashcards - Quizlet & Anki Alternative | FORKSAI";
const DESCRIPTION =
  "Free AI flashcard generator and the best Quizlet & Anki alternative. Turn any PDF, notes, or video into a study-ready deck in seconds. No credit card required.";
const OG_DESCRIPTION =
  "The Quizlet and Anki alternative that builds your deck for you. Generate customizable AI flashcards from any PDF, notes, slides, YouTube video, or image - set difficulty, question types, and card count. Join 100,000+ students studying smarter with FORKSAI.";

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords:
    "AI flashcards, quizlet alternative, anki alternative, best alternative to quizlet, best alternative to anki, how to make anki cards, customizable AI flashcard generator, configurable flashcard maker, AI notes summarizer, PDF summarizer, Cornell notes generator, outline notes, flashcards from PDF, flashcards from notes, flashcards from YouTube, flashcards from images OCR, PPT to flashcards, AI study tools, spaced repetition, FSRS-5, exam preparation, active recall learning",
  alternates: {
    canonical: "https://forksai.app/",
  },
  openGraph: {
    type: "website",
    title: TITLE,
    description: OG_DESCRIPTION,
    url: "https://forksai.app/",
    siteName: "FORKSAI",
    locale: "en_US",
    images: [{ url: "https://forksai.app/body.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@forksai",
    creator: "@forksai",
    title: TITLE,
    description:
      "The Quizlet and Anki alternative that builds your deck for you. Customizable AI flashcards from any PDF, notes, slides, video, or image - choose difficulty, question types & card count. Free for students.",
    images: ["https://forksai.app/body.png"],
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "FORKSAI",
  url: "https://forksai.app",
  logo: "https://forksai.app/forks-logo.png",
  description:
    "AI-powered study tool that generates flashcards, summaries, and study aids from any text or PDF",
  sameAs: ["https://twitter.com/forksai", "https://www.linkedin.com/company/forksai"],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Customer Service",
    email: "support@forksai.app",
  },
  founder: { "@type": "Person", name: "ForksAI Team" },
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "FORKSAI",
  description: "AI-powered flashcard generator and study tool for students",
  url: "https://forksai.app",
  applicationCategory: "EducationalApplication",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock" },
  screenshot: { "@type": "ImageObject", url: "https://forksai.app/dashboard.png" },
  operatingSystem: "Web",
  inLanguage: "en",
  developer: { "@type": "Organization", name: "ForksAI" },
  featureList: [
    "Customizable AI flashcard generator with difficulty, question types, card count, and Smart Focus controls",
    "AI notes summarizer with Structured, Cornell, Narrative, and Outline note styles",
    "Generate flashcards from PDF, notes, text, YouTube videos, PowerPoint, or images via OCR",
    "FSRS-5 spaced repetition with configurable retention, learning steps, and review limits",
    "9 study modes including exam simulator, weak spot trainer, and live study rooms",
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Can I customize the flashcards FORKSAI generates?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Before each generation, FORKSAI's configuration panel lets you set the difficulty (Easy, Medium, or Hard), the question types, the number of cards, and Smart Focus tags that tell the AI which topics or chapters to prioritize. It is a fully customizable AI flashcard generator, not a fixed one-click tool.",
      },
    },
    {
      "@type": "Question",
      name: "Does FORKSAI have an AI notes summarizer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The AI Notes Summarizer turns any PDF or text into structured study notes. You can choose the note style (Structured, Cornell, Narrative, or Outline), the level of detail, and the focus area, then refine the result in a built-in rich-text editor.",
      },
    },
    {
      "@type": "Question",
      name: "What can FORKSAI create flashcards from?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "FORKSAI generates flashcards from PDF files, pasted notes or text, PowerPoint (PPTX) presentations, YouTube video URLs, and images (handwritten or printed) using built-in OCR.",
      },
    },
    {
      "@type": "Question",
      name: "How is FORKSAI different from Quizlet and Anki?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "FORKSAI generates customizable flashcards automatically from your own material in under 30 seconds, while Quizlet and Anki require manual card creation. FORKSAI includes FSRS-5 spaced repetition - the same modern algorithm used by Anki - plus a configuration panel for difficulty, question types, card count, and note style.",
      },
    },
    {
      "@type": "Question",
      name: "Is FORKSAI free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The free plan includes the study modes, unlimited deck creation, and progress tracking, with monthly AI flashcard generations. No credit card is required to start.",
      },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <LandingPage />
    </>
  );
}
