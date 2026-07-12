import FaqContent from "@/components/FaqContent";

export const metadata = {
  title: "FAQ - Frequently Asked Questions",
  description:
    "Got questions about FORKSAI? Find answers about how AI flashcard generation works, what's free vs. premium, how spaced repetition is implemented, and more.",
  alternates: {
    canonical: "https://forksai.app/faq",
  },
  openGraph: {
    type: "website",
    title: "FAQ | FORKSAI",
    description:
      "Got questions about FORKSAI? Find answers about how AI flashcard generation works, what's free vs. premium, how spaced repetition is implemented, and more.",
    url: "https://forksai.app/faq",
    siteName: "FORKSAI",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is FORKSAI?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "FORKSAI is a study platform that helps students learn more effectively through AI-powered tools and habit-tracking. It combines flashcard generation, PDF summarisation, quiz creation, and revision modes with a study dashboard that tracks your time, streak, and consistency.",
      },
    },
    {
      "@type": "Question",
      name: "Who is FORKSAI for?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "FORKSAI is built for university and secondary school students who deal with large volumes of reading - textbooks, lecture notes, research papers - and need a faster, more structured way to revise.",
      },
    },
    {
      "@type": "Question",
      name: "Is FORKSAI free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes - FORKSAI has a permanent free tier that includes manual flashcard creation, the full study dashboard (timer, goals, streak, heatmap), and achievement tracking. Premium unlocks AI-powered tools.",
      },
    },
    {
      "@type": "Question",
      name: "What does Premium include?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Premium adds AI Flashcard generation from PDFs and text, the PDF Summariser, the Quiz Generator, and all Revision Modes. It also includes priority AI processing speed.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use FORKSAI on mobile?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. FORKSAI is fully responsive and works in any mobile browser without any loss of functionality.",
      },
    },
    {
      "@type": "Question",
      name: "How do I get started?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sign up at forksai.app using Google or email and password. Once you're in, you'll land on the study dashboard where you can create your first flashcard deck.",
      },
    },
  ],
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <FaqContent />
    </>
  );
}
