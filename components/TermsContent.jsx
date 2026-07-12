"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X, Scale } from "lucide-react";
import { dmSerifDisplay, dmSans } from "@/lib/fonts";

/* ── Section data ── */
const sections = [
  {
    id: "intro",
    title: "Introduction",
    content: (
      <p className="text-sm text-zinc-400 leading-relaxed">
        Welcome to <strong className="text-white">FORKSAI</strong>. These Terms and Conditions ("Terms") govern your access to and use of our website, study dashboard, AI tools, APIs, and all related services and features (collectively, the "Service"). By accessing, registering for, or using the Service, you agree to be bound by these Terms. If you do not agree, you must discontinue use immediately.
      </p>
    ),
  },
  {
    id: "accounts",
    title: "Accounts & Eligibility",
    content: (
      <ul className="space-y-3 text-sm text-zinc-400">
        {[
          "You must be at least 13 years old to use the Service. If you are under the age of majority in your jurisdiction, you may use the Service only with the involvement and consent of a parent or legal guardian.",
          "You agree to provide accurate, current, and complete information when creating an account.",
          "Accounts are created using Google Sign-In (Google OAuth). By signing in, you authorize us to access basic profile information (such as your name, email address, and profile photo) as described in our Privacy Policy.",
          "You are responsible for maintaining the security of your Google account and for all activity that occurs under your FORKSAI account.",
          "You must notify us immediately of any unauthorized access or suspected security breach at support@forksai.app.",
        ].map((t, i) => (
          <li key={i} className="flex gap-3">
            <span className="text-[#b5ff4d] shrink-0 mt-0.5">-</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable Use",
    content: (
      <ul className="space-y-3 text-sm text-zinc-400">
        {[
          "Use the Service only for lawful, personal, and educational purposes.",
          "You may not violate applicable laws, regulations, or the rights of others.",
          "You may not attempt to disrupt, exploit, reverse-engineer, or misuse the Service or its infrastructure.",
          "You may not create multiple accounts to circumvent feature restrictions or Premium access controls.",
          "You may not use automated scripts, bots, or tools to scrape, mine, or abuse the platform.",
          "We reserve the right to suspend or terminate access if misuse, abuse, or violations are detected.",
        ].map((t, i) => (
          <li key={i} className="flex gap-3">
            <span className="text-[#b5ff4d] shrink-0 mt-0.5">-</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: "premium",
    title: "Premium Subscriptions",
    content: (
      <>
        <p className="text-sm text-zinc-400 leading-relaxed mb-4">
          FORKSAI offers optional Premium plans that unlock AI-powered features including unlimited flashcard generation, PDF summarization, quiz generation, and all revision modes.
        </p>
        <ul className="space-y-3 text-sm text-zinc-400">
          {[
            "Premium plans are available on a 1-day, monthly, yearly, or Lifetime basis. Pricing is displayed at the time of purchase.",
            "The Lifetime plan is a one-time payment of $99.99 USD that provides permanent Premium access with no recurring charges. It is strictly non-refundable - see the Billing section below and our Refund Policy for full details.",
            "Payments are processed by Dodo Payments. By purchasing a plan, you agree to their terms of service.",
            "You are responsible for ensuring your payment details are accurate and up to date.",
            "Premium access is tied to your account. It is non-transferable and may not be shared with other users.",
            "FORKSAI reserves the right to modify, suspend, or discontinue Premium features with reasonable notice.",
            "Free-tier users retain access to core features - manual flashcard creation, file organization, and the study dashboard - without AI tools.",
          ].map((t, i) => (
            <li key={i} className="flex gap-3">
              <span className="text-[#b5ff4d] shrink-0 mt-0.5">-</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: "billing-refunds",
    title: "Billing, Cancellations & Refunds",
    content: (
      <ul className="space-y-3 text-sm text-zinc-400">
        {[
          "Subscriptions are billed according to the plan selected at checkout - 1-day, monthly, yearly, or Lifetime.",
          "Recurring plans (1-day, monthly, yearly) may be canceled at any time. Cancellation takes effect at the end of the current billing period.",
          "The Lifetime plan is a one-time purchase with no subscription to cancel and no recurring charges. It is strictly and permanently non-refundable under all circumstances - including accidental purchases, change of mind, or failure to review plan details before completing payment.",
          "No free trial is offered. Access to Premium features begins immediately upon successful payment.",
          "Refunds for recurring plans are assessed on a case-by-case basis. Lifetime plan payments are final and will not be refunded for any reason. See our Refund Policy for full details.",
          "FORKSAI reserves the right to issue or decline refunds in accordance with our Refund Policy.",
          "Chargebacks initiated without contacting us first may result in account suspension.",
        ].map((t, i) => (
          <li key={i} className="flex gap-3">
            <span className="text-[#b5ff4d] shrink-0 mt-0.5">-</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: "ai-tools",
    title: "AI Tools & Features",
    content: (
      <>
        <p className="text-sm text-zinc-400 leading-relaxed mb-4">
          FORKSAI provides AI-powered tools including a Flashcard Generator, PDF Summarizer, Quiz Generator, and Revision Modes. Use of these tools is subject to the following.
        </p>
        <ul className="space-y-3 text-sm text-zinc-400">
          {[
            "AI tools are available to Premium subscribers only.",
            "AI-generated outputs are provided for educational and informational purposes only. They may contain inaccuracies, omissions, or errors.",
            "You are responsible for reviewing, verifying, and validating all AI-generated content before relying on or sharing it.",
            "AI outputs do not constitute professional, legal, medical, or academic advice.",
            "Input you provide - such as PDF content or study text - is processed transiently and is not used to train public models.",
            "For PDFs, the text is extracted in your browser and only that text is sent for processing - the original PDF file is not uploaded to or retained on our servers.",
            "FORKSAI does not guarantee accuracy, completeness, or fitness for purpose of any AI-generated content.",
          ].map((t, i) => (
            <li key={i} className="flex gap-3">
              <span className="text-[#b5ff4d] shrink-0 mt-0.5">-</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: "study-timer",
    title: "Study Timer & Session Data",
    content: (
      <ul className="space-y-3 text-sm text-zinc-400">
        {[
          "FORKSAI's study timer records your session start and end times to calculate daily and weekly study statistics displayed on your dashboard.",
          "Study session data is stored per account and used solely to power your personal statistics.",
          "If you close the browser or log out without stopping the timer, the session may not be recorded. You are responsible for stopping the timer before exiting.",
          "Study time calculations are for personal tracking purposes only and carry no official academic weight or certification.",
          "You may request deletion of your study session history as part of an account deletion request.",
        ].map((t, i) => (
          <li key={i} className="flex gap-3">
            <span className="text-[#b5ff4d] shrink-0 mt-0.5">-</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: "achievements",
    title: "Achievements & Streaks",
    content: (
      <p className="text-sm text-zinc-400 leading-relaxed">
        FORKSAI tracks your study activity - including flashcard creation timestamps and session records - to calculate streaks, unlock achievements, and display consistency data. Achievements and streak counts are stored per account and are for motivational purposes only. FORKSAI does not guarantee accuracy of streak calculations in all edge cases (e.g. timezone changes or connectivity issues). Streak data may be reset or adjusted without notice if data integrity issues are detected.
      </p>
    ),
  },
  {
    id: "goals",
    title: "Study Goals",
    content: (
      <p className="text-sm text-zinc-400 leading-relaxed">
        Study goals created during a session are stored in your browser's session storage only - they are not sent to our servers or associated with your account. Goals are cleared when you close the tab or log out. FORKSAI accepts no liability for loss of goal data due to browser closure, session expiry, or other client-side events.
      </p>
    ),
  },
  {
    id: "user-content",
    title: "User Content",
    content: (
      <ul className="space-y-3 text-sm text-zinc-400">
        {[
          "You retain ownership of the content you provide, submit, or generate using the Service - including flashcard decks, notes, and the PDFs or text you supply.",
          "By using the Service, you grant FORKSAI a limited, non-exclusive license to store, process, and display your content solely for providing core platform functionality.",
          "This license ends when you delete the content or your account.",
          "You are solely responsible for ensuring your content does not violate applicable laws, third-party intellectual property rights, or your institution's academic integrity policies.",
          "FORKSAI is not responsible for how AI-generated flashcards or summaries are used in academic settings. Misuse in violation of your institution's policies is your responsibility.",
        ].map((t, i) => (
          <li key={i} className="flex gap-3">
            <span className="text-[#b5ff4d] shrink-0 mt-0.5">-</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: "intellectual-property",
    title: "Intellectual Property",
    content: (
      <p className="text-sm text-zinc-400 leading-relaxed">
        All software, user interfaces, brand elements, designs, content, and system architecture are the exclusive property of <strong className="text-white">FORKSAI</strong> or its licensors. You may not copy, distribute, resell, modify, reverse-engineer, or create derivative works from any part of the Service without prior written permission. The FORKSAI name, logo, and visual identity may not be used without explicit consent.
      </p>
    ),
  },
  {
    id: "privacy",
    title: "Privacy & Data Use",
    content: (
      <p className="text-sm text-zinc-400 leading-relaxed">
        Your use of the Service is governed by our{" "}
        <a href="/privacy-policy" className="text-[#b5ff4d] hover:underline underline-offset-4">Privacy Policy</a>.
        {" "}By using the Service, you acknowledge and agree to the collection, processing, and use of your data - including study session records, flashcard content, streak data, and subscription status - as described therein.
      </p>
    ),
  },
  {
    id: "third-parties",
    title: "Third-Party Services",
    content: (
      <>
        <p className="text-sm text-zinc-400 leading-relaxed mb-4">
          FORKSAI integrates with third-party providers to deliver core functionality. FORKSAI is not responsible for the practices, policies, or actions of these services.
        </p>
        <ul className="space-y-3 text-sm text-zinc-400">
          {[
            ["Firebase (Google)", "Authentication, real-time database, and storage for accounts, flashcard decks, and study session data."],
            ["Dodo Payments", "Secure payment processing for Premium subscriptions."],
            ["AI APIs", "Language model providers used for flashcard generation, summarization, and quiz creation."],
            ["Vercel Speed Insights", "Performance monitoring and platform analytics."],
          ].map(([term, def]) => (
            <li key={term} className="flex gap-3 border-b border-white/4 pb-3 last:border-0 last:pb-0">
              <span className="font-medium text-white shrink-0 w-36">{term}</span>
              <span>{def}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: "prohibited",
    title: "Prohibited Conduct",
    content: (
      <ul className="space-y-3 text-sm text-zinc-400">
        {[
          "Unauthorized access, scraping, or data mining of any part of the Service.",
          "Introducing malware, harmful code, or attempting denial-of-service attacks.",
          "Publishing, generating, or distributing illegal, harmful, abusive, or deceptive content using FORKSAI tools.",
          "Attempting to bypass security measures, rate limits, Premium access gates, or access controls.",
          "Sharing, selling, or sublicensing your FORKSAI account or Premium access to others.",
          "Impersonating FORKSAI, its team, or other users.",
        ].map((t, i) => (
          <li key={i} className="flex gap-3">
            <span className="text-[#b5ff4d] shrink-0 mt-0.5">-</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: "termination",
    title: "Suspension & Termination",
    content: (
      <p className="text-sm text-zinc-400 leading-relaxed">
        We reserve the right to suspend or terminate your access at any time - with or without notice - if you violate these Terms, misuse the Service, attempt to circumvent Premium access controls, or pose a security or legal risk. Upon termination, your right to use the Service ceases immediately. You may discontinue use at any time by stopping access or requesting account deletion via our support email.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Limitation of Liability",
    content: (
      <>
        <p className="text-sm text-zinc-400 leading-relaxed mb-3">
          To the maximum extent permitted by applicable law, FORKSAI shall not be liable for any indirect, incidental, special, consequential, or punitive damages - including loss of data, study records, streak counts, or access to AI-generated content - arising from your use of or inability to use the Service.
        </p>
        <p className="text-sm text-zinc-400 leading-relaxed">
          All use is at your own risk. FORKSAI does not guarantee uninterrupted service, accuracy of AI outputs, or that study statistics will be recorded without error in all circumstances.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to These Terms",
    content: (
      <>
        <p className="text-sm text-zinc-400 leading-relaxed">
          We may update these Terms from time to time to reflect changes in the Service, new features, or legal requirements. Major updates will be communicated through in-app notifications, email, or website banners. Continued use of the Service after updates take effect constitutes your acceptance of the revised Terms.
        </p>
        <p className="mt-3 text-xs text-zinc-600 italic">Last updated: June 9, 2026 (v12.1)</p>
      </>
    ),
  },
  {
    id: "all-revision-modes",
    title: "All Revision & Study Modes",
    content: (
      <>
        <p className="text-sm text-zinc-400 leading-relaxed mb-4">
          FORKSAI offers seven distinct study and revision modes to support different learning styles and needs:
        </p>
        <ul className="space-y-3 text-sm text-zinc-400">
          {[
            ["Memory Sprint", "Free | AI-powered fast-paced flashcard review mode with timed challenges to strengthen memory recall."],
            ["Spaced Repetition", "Free | Evidence-based study method that schedules reviews based on forgetting curve principles to maximize long-term retention."],
            ["Weak Spot Trainer", "Free | AI-driven analytics identify your weakest areas and focus study sessions on topics you struggle with most."],
            ["Pomodoro Mode", "Free | Integrated focus timer based on the Pomodoro Technique - study in 25-minute intervals with built-in break reminders."],
            ["AI Revision", "Premium | Generate AI-powered explanations, quizzes, and study guides from uploaded content or existing flashcards to enhance learning depth."],
            ["Exam Simulator", "Premium | AI-generated practice exams that simulate real test conditions with question types and difficulty levels matching common standardized assessments."],
            ["Explain Back", "Premium | AI analyzes your hand-written or text explanations and provides detailed feedback on clarity, accuracy, and completeness."],
          ].map(([mode, info]) => (
            <li key={mode} className="flex gap-3 border-b border-white/4 pb-3 last:border-0 last:pb-0">
              <span className="font-medium text-white shrink-0 w-40">{mode}</span>
              <span>{info}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: "activity-heatmap",
    title: "Activity Heatmap",
    content: (
      <ul className="space-y-3 text-sm text-zinc-400">
        {[
          "FORKSAI displays an activity heatmap calendar on your Dashboard showing the number of study hours completed each day.",
          "The heatmap is calculated from session timers you explicitly stop before exiting the study platform.",
          "Heatmap data is available to all users - Free and Premium alike - at no additional cost. It is not gated behind any paywall.",
          "Your activity heatmap is personal to your account and is not shared publicly unless you explicitly choose to share it.",
          "Heatmap calculations are based on your recorded study sessions (start and end times). Timezone changes or connectivity issues may affect accuracy.",
          "You may request deletion of all heatmap historical data as part of an account deletion request.",
        ].map((t, i) => (
          <li key={i} className="flex gap-3">
            <span className="text-[#b5ff4d] shrink-0 mt-0.5">-</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: "public-decks",
    title: "Public Decks & Explore Decks",
    content: (
      <>
        <p className="text-sm text-zinc-400 leading-relaxed mb-4">
          FORKSAI allows users to share AI-generated flashcard decks publicly through the Explore & Import system. This enables collaborative learning and quick access to high-quality study materials. <strong className="text-white">When you share a deck publicly, only the flashcard content is visible - your personal information (email, account details) remains completely private.</strong>
        </p>
        <ul className="space-y-3 text-sm text-zinc-400">
          {[
            "Only AI-generated decks created by FORKSAI can be published to the public library. Manually created or imported decks remain private to your account.",
            "Public decks are discoverable by any FORKSAI user through the Explore page. You may search, preview, and import public decks into your private study collection.",
            "Importing a public deck creates a private copy in your account. The original deck remains unchanged, and credit goes to the original creator.",
            "You may toggle your own AI-generated decks between public and private status at any time via deck settings.",
            "Decks published publicly remain in the library until you set them to private. Deletion of your account also removes your public decks from the library.",
            "FORKSAI reserves the right to remove decks from the public library if they contain illegal, harmful, abusive, or inaccurate content.",
            "Public deck creators retain ownership of their content. Importers receive a private, non-commercial copy for personal study purposes only.",
            "You may not use FORKSAI's public deck system to distribute solutions, answer keys to copyrighted assessments, or material violating academic integrity policies.",
            "<strong>Privacy protection:</strong> When your deck appears in Explore, only the flashcard content and your account name are shown - never your email address, account creation date, subscription status, or any other sensitive account information.",
          ].map((t, i) => (
            <li key={i} className="flex gap-3">
              <span className="text-[#b5ff4d] shrink-0 mt-0.5">-</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {    id: "gifted-premium",
    title: "Gifted Premium",
    content: (
      <ul className="space-y-3 text-sm text-zinc-400">
        {[
          "FORKSAI may occasionally grant gifted Premium access to selected users at our sole discretion.",
          "Gifted Premium access is provided as a privilege and is strictly tied to the recipient's account.",
          "Any suspicious activity, misuse of AI tools, or violation of our Acceptable Use policy will result in immediate suspension of the gifted Premium status.",
          "Gifted Premium cannot be transferred, sold, or exchanged for cash or other benefits.",
          "FORKSAI reserves the right to revoke, modify, or terminate gifted Premium access at any time, with or without notice."
        ].map((t, i) => (
          <li key={i} className="flex gap-3">
            <span className="text-[#b5ff4d] shrink-0 mt-0.5">-</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: "study-rooms",
    title: "Study Rooms",
    content: (
      <>
        <p className="text-sm text-zinc-400 leading-relaxed mb-4">
          FORKSAI Study Rooms allow a host to invite other users into a live, shared flashcard study session using a 6-character room code. By creating or joining a Study Room, you agree to the following terms.
        </p>
        <ul className="space-y-3 text-sm text-zinc-400">
          {[
            "Study Rooms are available to all registered FORKSAI users. Creating a room requires an account and uses one of your available deck collections.",
            "The host controls session settings including the study mode (host-paced or race), answer mode, and break configuration. These settings are fixed once the session starts.",
            "In race mode, participant answer speed and completion progress are tracked and displayed on a live leaderboard visible to all participants. By joining a race-mode session, you consent to this visibility.",
            "Chat messages sent in a Study Room are visible to all current participants. You are solely responsible for the content of messages you send. Harassment, abuse, spam, or any harmful content in the chat is a violation of our Acceptable Use policy and may result in account suspension.",
            "Study Room data - including chat messages, participant lists, and session progress - is stored temporarily and expires automatically 2 hours after room creation. No Study Room data is retained permanently.",
            "Room codes are randomly generated and should be shared only with intended participants. FORKSAI is not responsible for unauthorized access resulting from a code being shared publicly.",
            "FORKSAI reserves the right to terminate any Study Room session at any time if misuse, abuse, or policy violations are detected.",
            "Study Room activity does not count toward your streak, study timer statistics, or heatmap. It is a supplementary collaborative feature.",
          ].map((t, i) => (
            <li key={i} className="flex gap-3">
              <span className="text-[#b5ff4d] shrink-0 mt-0.5">-</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: "governing-law",
    title: "Governing Law & Jurisdiction",
    content: (
      <>
        <p className="text-sm text-zinc-400 leading-relaxed">
          These Terms, and any dispute or claim arising out of or in connection with them or your use of the Service, are governed by and construed in accordance with the laws of <strong className="text-white">India</strong>, without regard to its conflict-of-law principles.
        </p>
        <p className="text-sm text-zinc-400 leading-relaxed mt-3">
          Subject to the Dispute Resolution section below, you agree that the courts located in India shall have exclusive jurisdiction over any disputes arising from or relating to these Terms or the Service. Nothing in this section limits any mandatory statutory rights you may have as a consumer under the laws of your country of residence.
        </p>
      </>
    ),
  },
  {
    id: "dispute-resolution",
    title: "Dispute Resolution",
    content: (
      <ul className="space-y-3 text-sm text-zinc-400">
        {[
          "Informal resolution first: before initiating any formal proceeding, you agree to contact us at support@forksai.app and attempt in good faith to resolve the dispute. Most issues can be resolved this way.",
          "If a dispute cannot be resolved informally within 30 days, it shall be handled in accordance with the Governing Law & Jurisdiction section above.",
          "Billing and refund disputes are governed by our Refund Policy. Please review it and contact us before initiating a chargeback - see our Refund Policy for details.",
          "To the extent permitted by law, any claim must be brought on an individual basis and not as part of a class or representative action.",
          "Nothing in these Terms prevents either party from seeking urgent injunctive or equitable relief from a competent court.",
        ].map((t, i) => (
          <li key={i} className="flex gap-3">
            <span className="text-[#b5ff4d] shrink-0 mt-0.5">-</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {    id: "contact",
    title: "Contact Us",
    content: (
      <>
        <p className="text-sm text-zinc-400 leading-relaxed">
          For questions regarding these Terms, contact us at:
        </p>
        <p className="mt-3">
          <a href="mailto:support@forksai.app" className="text-[#b5ff4d] hover:underline underline-offset-4 text-sm font-medium">
            support@forksai.app
          </a>
        </p>
        <p className="mt-3 text-xs text-zinc-600">We aim to respond within 7 business days.</p>
      </>
    ),
  },
];

/* ── Component ── */
export default function TermsContent() {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div
      className={`${dmSans.variable} ${dmSerifDisplay.variable} min-h-screen bg-[#080808] text-zinc-100`}
      style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
    >
      {/* grain */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.025]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "160px" }} />

      {/* ── HEADER ── */}
      <header className="fixed top-0 inset-x-0 z-40 bg-[#080808]/90 backdrop-blur-md border-b border-white/6">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <img src="/forks-logo.png" alt="FORKSAI" className="h-6 w-auto" />
            <div>
              <p className="text-xs font-bold tracking-[0.2em] uppercase leading-none">FORKSAI</p>
              <p className="text-[9px] uppercase tracking-widest text-zinc-600 mt-0.5">Terms & Conditions</p>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-6 text-xs">
            <a href="/" className="text-zinc-500 hover:text-white transition-colors">← Back home</a>
            <a href="/docs" className="text-zinc-500 hover:text-white transition-colors">Docs</a>
            <a href="/privacy-policy" className="text-zinc-500 hover:text-white transition-colors">Privacy</a>
            <span className="text-[#b5ff4d] font-medium">Terms</span>
          </nav>

          <button onClick={() => setNavOpen(v => !v)} className="md:hidden p-1.5 border border-white/8 rounded-lg text-zinc-400">
            {navOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {navOpen && (
          <div className="md:hidden border-t border-white/6 bg-[#080808]">
            <div className="px-6 py-4 flex flex-col gap-3 text-sm">
              <a href="/" onClick={() => setNavOpen(false)} className="text-zinc-400 hover:text-white transition-colors">← Back home</a>
              <a href="/docs" onClick={() => setNavOpen(false)} className="text-zinc-400 hover:text-white transition-colors">Docs</a>
              <a href="/privacy-policy" onClick={() => setNavOpen(false)} className="text-zinc-400 hover:text-white transition-colors">Privacy Policy</a>
              <span className="text-[#b5ff4d] font-medium">Terms & Conditions</span>
            </div>
          </div>
        )}
      </header>

      {/* ── MAIN ── */}
      <main className="relative z-10 pt-24">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-12">

          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="mb-14"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-white/8 rounded-full mb-6">
              <Scale size={12} className="text-[#b5ff4d]" />
              <span className="text-[10px] uppercase tracking-widest text-zinc-500">Legal Agreement</span>
            </div>
            <h1
              style={{ fontFamily: "var(--font-dm-serif-display), serif" }}
              className="text-[2.2rem] md:text-[2.8rem] font-normal leading-tight mb-3"
            >
              Terms & Conditions
            </h1>
            <p className="text-zinc-500 text-sm max-w-xl leading-relaxed">
              These terms apply to all products and services under FORKSAI - including the study dashboard, AI tools, Premium subscriptions, and all related features.
            </p>
            <p className="text-xs text-zinc-700 mt-3 uppercase tracking-widest">Last updated: June 9, 2026 · v12.1</p>
          </motion.div>

          {/* Two-column layout */}
          <div className="grid md:grid-cols-[200px_1fr] gap-12">

            {/* Sticky TOC */}
            <aside className="hidden md:block">
              <div className="sticky top-28">
                <p className="text-[9px] uppercase tracking-[0.25em] text-zinc-700 mb-4">On this page</p>
                <ul className="space-y-2">
                  {sections.map(s => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="text-xs text-zinc-600 hover:text-[#b5ff4d] transition-colors leading-relaxed block"
                      >
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Content */}
            <div className="divide-y divide-white/5">
              {sections.map((section, i) => (
                <motion.section
                  key={section.id}
                  id={section.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className="scroll-mt-28 py-10 first:pt-0"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <span className="text-[10px] font-mono text-zinc-700 pt-1 w-6 shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h2
                      style={{ fontFamily: "var(--font-dm-serif-display), serif" }}
                      className="text-xl font-normal text-white"
                    >
                      {section.title}
                    </h2>
                  </div>
                  <div className="ml-10">
                    {section.content}
                  </div>
                </motion.section>
              ))}
            </div>
          </div>
        </div>

        {/* Footer strip */}
        <div className="border-t border-white/5 px-6 md:px-12 py-8 mt-8">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-zinc-700">
            <span>© {new Date().getFullYear()} FORKSAI. All rights reserved.</span>
            <div className="flex items-center gap-5">
              <a href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="mailto:support@forksai.app" className="hover:text-white transition-colors">Contact</a>
              <a href="/refund-policy" className="hover:text-white transition-colors">Refund Policy</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
