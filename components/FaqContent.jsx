"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, HelpCircle, Menu } from "lucide-react";
import { dmSerifDisplay, dmSans } from "@/lib/fonts";

/* ── FAQ data ── */
const categories = [
  {
    label: "General",
    faqs: [
      {
        q: "What is FORKSAI?",
        a: "FORKSAI is a study platform that helps students learn more effectively through AI-powered tools and habit-tracking. It combines flashcard generation, PDF summarisation, quiz creation, and revision modes with a study dashboard that tracks your time, streak, and consistency - turning passive reading into active, measurable learning.",
      },
      {
        q: "Who is FORKSAI for?",
        a: "FORKSAI is built for university and secondary school students who deal with large volumes of reading - textbooks, lecture notes, research papers - and need a faster, more structured way to revise. It works especially well for content-heavy subjects: medicine, law, sciences, history, economics, and similar fields.",
      },
      {
        q: "Is FORKSAI free to use?",
        a: "Yes - FORKSAI has a permanent free tier that includes manual flashcard creation, the full study dashboard (timer, goals, streak, heatmap), and achievement tracking. Premium unlocks the AI-powered tools: AI Flashcard generation, PDF Summariser, Quiz Generator, and Revision Modes.",
      },
      {
        q: "What does Premium include?",
        a: "Premium adds AI Flashcard generation from PDFs and text, the PDF Summariser, the Quiz Generator, and all Revision Modes (Flip Cards and Throw Cards). It also includes priority AI processing speed during high-demand periods. Premium is available as a 1-day, monthly, or yearly subscription.",
      },
      {
        q: "Can I use FORKSAI on mobile?",
        a: "Yes. FORKSAI is fully responsive and works in any mobile browser. The dashboard, timer, flashcard creation, and all tools are accessible on smartphones and tablets without any loss of functionality.",
      },
      {
        q: "How do I get started?",
        a: "Sign up at forksai.com using Google or email and password. Email accounts require verification before logging in. Once you're in, you'll land on the study dashboard. From there, click Create to make your first flashcard deck - either manually (free) or using AI generation (Premium).",
      },
    ],
  },
  {
    label: "AI Flashcards",
    faqs: [
      {
        q: "How does AI Flashcard generation work?",
        a: "You upload a PDF or paste text, and FORKSAI's AI identifies key concepts, definitions, processes, and exam-relevant points - generating a complete flashcard deck in question–answer format. Generation typically takes under 30 seconds. The deck appears in your Recent Decks on the dashboard and is immediately ready to study.",
      },
      {
        q: "What input works best for AI Flashcards?",
        a: "Structured academic text works best - textbook chapters, lecture notes, revision guides, and handouts. The AI extracts meaning from content, so well-written, clearly organised material produces better cards. Avoid scanned image PDFs without OCR - the AI processes text, not images. If you can't select text in the PDF in your browser, the file needs OCR applied first.",
      },
      {
        q: "Can I edit AI-generated decks?",
        a: "Yes. After generation, you can open any deck and edit individual cards - update the question, rewrite the answer, or delete cards that aren't relevant. Treat generated decks as a strong starting point, not an unchangeable output. Editing a few cards to match your course's exact terminology usually takes less than a minute.",
      },
      {
        q: "What if the deck feels too broad or shallow?",
        a: "Try uploading a smaller, more focused section of your material - a single chapter or topic rather than an entire document. Focused input consistently produces more targeted cards. For very dense material like full medical textbooks, break uploads into one unit or chapter at a time.",
      },
      {
        q: "What's the difference between AI and manual flashcards?",
        a: "AI Flashcards are generated automatically from your uploaded material - fast and broad. Manual Flashcards are created card by card, giving you full control over phrasing and content. Both types behave identically once created: they appear in your dashboard, contribute to your streak, and can be studied using all revision modes.",
      },
    ],
  },
  {
    label: "PDF Summariser",
    faqs: [
      {
        q: "What does the PDF Summariser do?",
        a: "It extracts the key concepts, arguments, definitions, and important points from an uploaded document - structured for revision, not just compressed for length. Instead of reading a 40-page paper front to back, you get a focused breakdown of what actually matters.",
      },
      {
        q: "Are uploaded files stored on your servers?",
        a: "No. Uploaded files are processed transiently and discarded after summarisation is complete. Your document content is not retained on our servers after the summary is generated.",
      },
      {
        q: "What types of PDFs work best?",
        a: "Text-based PDFs work best - textbook chapters, research papers, lecture slides, revision handouts, and academic articles. Scanned image PDFs without a text layer cannot be processed. If you can't select text in the PDF, it needs OCR applied before uploading.",
      },
      {
        q: "Can I use the summary to create flashcards?",
        a: "Yes - and this is a particularly effective two-step workflow. Summarise a document first to extract the key points, then paste the summary into the AI Flashcard generator to create highly targeted cards. This produces more focused decks than uploading the raw document directly.",
      },
      {
        q: "What if the summary feels too shallow for a long document?",
        a: "Upload individual sections or chapters rather than the full document. Focused input produces deeper summaries. For very long documents, treating each chapter as a separate upload and summarising them individually gives much better results.",
      },
    ],
  },
  {
    label: "Quiz Generator",
    faqs: [
      {
        q: "What does the Quiz Generator create?",
        a: "It generates exam-style questions from your study material - multiple choice and short answer formats. It's designed to surface knowledge gaps: topics you think you understand but can't recall accurately under question pressure. Questions are generated on-demand and not stored unless you save the session.",
      },
      {
        q: "When should I use the Quiz Generator?",
        a: "Use it after you've already read and revised a topic - it works best as a recall check, not a first introduction. It's particularly effective the day before an exam: generate 10–20 questions from each major topic and see what you can actually answer without looking. It also works well after reviewing a flashcard deck.",
      },
      {
        q: "How do I improve quiz question quality?",
        a: "Use well-structured academic text as input. Clear, specific content with defined concepts and facts produces better questions than vague overviews. If questions feel too generic, try uploading a focused section rather than a broad document.",
      },
    ],
  },
  {
    label: "Revision Modes",
    faqs: [
      {
        q: "What revision modes does FORKSAI offer?",
        a: "Two modes: Flip Cards and Throw Cards. Flip Cards is the classic experience - see the question, think through your answer, then flip to reveal it. Self-paced and deliberate. Throw Cards is swipe-based - mark each card as Known or Needs Work. Fast, high-repetition, and momentum-driven. Both are available to Premium subscribers.",
      },
      {
        q: "Which revision mode should I use?",
        a: "Use Flip Cards when first working through a new deck or studying topics that require careful reasoning. Use Throw Cards for reinforcing cards you already partially know, or when time is short before an exam. Switching between modes across sessions is more effective than using only one - different retrieval formats strengthen different memory pathways.",
      },
      {
        q: "How does Throw Cards handle cards I get wrong?",
        a: "Cards you mark as Needs Work automatically cycle back through the deck, so you spend more time on weaker cards without manual tracking. By the end of a Throw Cards session, only the cards you genuinely struggle with remain cycling - making it an efficient way to identify exactly where your gaps are.",
      },
    ],
  },
  {
    label: "Study Timer & Goals",
    faqs: [
      {
        q: "What does the study timer track?",
        a: "The timer records the start and end time of each session and calculates the duration. Completed sessions are saved to your account and used to calculate your daily and weekly study totals, streak activity, heatmap entries, and achievement progress.",
      },
      {
        q: "What happens if I close the browser without stopping the timer?",
        a: "The session is not saved. The end time is recorded at the moment you click Stop - if you close the tab without stopping, that event never fires and the session is lost. Always stop the timer before closing or logging out.",
      },
      {
        q: "Can I run multiple timer sessions in one day?",
        a: "Yes. Each session is saved separately and the durations are summed to calculate your daily total. There's no limit on sessions per day - running multiple shorter, focused sessions and stopping between them is perfectly valid.",
      },
      {
        q: "How do Study Goals work?",
        a: "Goals are a session-based focus tool - you set what you want to accomplish during a study block and tick them off as you go. Your first goal slot is available immediately. Each additional slot unlocks after 30 minutes of accumulated timer activity in the current session. Goals are stored in browser session storage only - they reset when you close the tab and are not saved to your account.",
      },
    ],
  },
  {
    label: "Streaks, Heatmap & Achievements",
    faqs: [
      {
        q: "How is my streak calculated?",
        a: "Your streak counts the number of consecutive calendar days you've been active on FORKSAI. Activity is determined by flashcard creation timestamps or completed study timer sessions. The streak counts backwards from today - if any day in that chain has no recorded activity, the streak stops at that point and resets.",
      },
      {
        q: "What counts as activity for a streak?",
        a: "Creating a flashcard deck (manual or AI-generated) or completing and saving a study timer session. At least one of these must occur on a given calendar day for that day to count as active. Multiple sessions in a single day still count as one streak day.",
      },
      {
        q: "What does the heatmap show?",
        a: "A calendar view of your study activity across the current month. Active days are shown in green - intensity scales with the level of activity. Missed days are dimly marked. The heatmap panel also shows your active day count, best streak, and consistency percentage for the month.",
      },
      {
        q: "How do achievements unlock?",
        a: "Automatically, based on your real activity - no manual claiming needed. Achievements reward streak length, total study time, number of decks created, total cards generated, long individual sessions, and overall consistency. You can view all unlocked and locked achievements (with their requirements) from the Achievements page in the dashboard.",
      },
      {
        q: "Do achievements reset if I cancel Premium?",
        a: "No. Achievements are stored permanently to your account and persist regardless of subscription status. They are never reset.",
      },
    ],
  },
  {
    label: "Account & Billing",
    faqs: [
      {
        q: "How do I sign in?",
        a: "FORKSAI supports Google Sign-In and email & password login. Email accounts require verification before first login. If you created an account before January 3, 2026, use Forgot Password or Google sign-in - the login system was updated at that point.",
      },
      {
        q: "Who processes payments?",
        a: "All payments are handled by Dodo Payments, our third-party payment provider. FORKSAI never stores your card number, CVV, or banking credentials. We only retain subscription status, plan type, and transaction identifiers for access control and support purposes.",
      },
      {
        q: "What happens to my data if I cancel Premium?",
        a: "You retain Premium access until the end of your current billing period. After that, AI tools are locked and you return to the free tier. Your flashcard decks, study history, stats, streaks, and achievements are never deleted - they're all still there if you resubscribe.",
      },
      {
        q: "Can I get a refund?",
        a: "Subscription fees are generally non-refundable. Refunds may be considered for duplicate charges, verified technical issues preventing access for an extended period, or confirmed fraudulent transactions. Contact support@forksai.app with your account email, charge date, and a description of the issue.",
      },
      {
        q: "How do I delete my account?",
        a: "Email support@forksai.app with your account email and a clear deletion request. This permanently removes your account, flashcard decks, study history, streaks, and achievements from active systems. Some residual data may remain in encrypted backups briefly for security purposes.",
      },
      {
        q: "Is my data safe?",
        a: "Yes. All data is stored with encryption in transit and at rest. Firebase security rules ensure users can only access their own data. Uploaded files (PDFs) are processed transiently and not retained after use. We do not sell or share your data with third parties for advertising purposes.",
      },
    ],
  },
  {
    label: "Troubleshooting",
    faqs: [
      {
        q: "My streak didn't update - what happened?",
        a: "Confirm that a study session was properly started and stopped (not just paused and abandoned), or that a flashcard deck was created on that day. The streak is calculated from server-recorded timestamps - if a session wasn't saved, it won't count. Try refreshing the dashboard - streak recalculation runs on each page load.",
      },
      {
        q: "AI generation failed or the output was poor quality.",
        a: "Refresh and try again. Ensure your document contains readable, selectable text - if you can't select text in the PDF in your browser, it needs OCR applied first. If generation succeeds but quality is low, try uploading a smaller, more focused section of your material.",
      },
      {
        q: "Premium is showing as locked after I paid.",
        a: "Premium status is verified on each page load from our payment provider. Wait a few seconds and hard-refresh the page (Ctrl+Shift+R on Windows, Cmd+Shift+R on Mac). If still locked after one minute, contact support@forksai.app with your account email and payment confirmation.",
      },
      {
        q: "My verification email didn't arrive.",
        a: "Check your spam or junk folder. Add support@forksai.app to your contacts and use the Resend Verification option on the login screen. Ensure you're checking the exact email address used to register.",
      },
      {
        q: "Newly generated flashcards aren't appearing.",
        a: "Wait a few seconds and refresh the dashboard. New decks appear in Recent Decks. If they're still not showing after 30 seconds, navigate to My Decks from the sidebar - the full deck list updates independently of the Recent Decks widget.",
      },
    ],
  },
];

// Flatten all FAQs for search
const allFaqs = categories.flatMap((cat) =>
  cat.faqs.map((faq) => ({ ...faq, category: cat.label }))
);

/* ── Component ── */
export default function FaqContent() {
  const [openId, setOpenId] = useState(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [navOpen, setNavOpen] = useState(false);
  const itemRefs = useRef({});

  const tabs = ["All", ...categories.map((c) => c.label)];

  const filtered = search
    ? allFaqs.filter(
        (f) =>
          f.q.toLowerCase().includes(search.toLowerCase()) ||
          f.a.toLowerCase().includes(search.toLowerCase())
      )
    : activeTab === "All"
    ? allFaqs
    : allFaqs.filter((f) => f.category === activeTab);

  const toggle = (id) => setOpenId(openId === id ? null : id);

  return (
    <div
      className={`${dmSans.variable} ${dmSerifDisplay.variable} min-h-screen bg-[#080808] text-white`}
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
              <p className="text-[9px] uppercase tracking-widest text-zinc-600 mt-0.5">FAQ</p>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-6 text-xs">
            <a href="/" className="text-zinc-500 hover:text-white transition-colors">← Back home</a>
            <a href="/docs" className="text-zinc-500 hover:text-white transition-colors">Docs</a>
            <a href="/privacy-policy" className="text-zinc-500 hover:text-white transition-colors">Privacy</a>
            <a href="/terms" className="text-zinc-500 hover:text-white transition-colors">Terms</a>
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
              <a href="/privacy-policy" onClick={() => setNavOpen(false)} className="text-zinc-400 hover:text-white transition-colors">Privacy</a>
              <a href="/terms" onClick={() => setNavOpen(false)} className="text-zinc-400 hover:text-white transition-colors">Terms</a>
            </div>
          </div>
        )}
      </header>

      {/* ── MAIN ── */}
      <main className="relative z-10 pt-28 pb-20">
        <div className="max-w-3xl mx-auto px-6">

          {/* Page header */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-white/8 rounded-full mb-6">
              <HelpCircle size={12} className="text-[#b5ff4d]" />
              <span className="text-[10px] uppercase tracking-widest text-zinc-500">Frequently Asked Questions</span>
            </div>
            <h1 style={{ fontFamily: "var(--font-dm-serif-display), serif" }} className="text-[2.2rem] md:text-[2.8rem] font-normal leading-tight mb-3">
              Got questions?
            </h1>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-md">
              Everything you need to know about FORKSAI - how it works, what's included, and how to get the most out of it.
            </p>
          </motion.div>

          {/* Search */}
          <div className="relative mb-8">
            <input
              type="text"
              placeholder="Search questions…"
              value={search}
              onChange={e => { setSearch(e.target.value); setActiveTab("All"); }}
              className="w-full px-5 py-3 rounded-full border border-white/8 bg-white/3 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-[#b5ff4d]/30 transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category tabs */}
          {!search && (
            <div className="flex flex-wrap gap-2 mb-8">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-full text-xs transition-all border ${
                    activeTab === tab
                      ? "bg-[#b5ff4d] text-black border-[#b5ff4d] font-medium"
                      : "border-white/8 text-zinc-600 hover:text-white hover:border-white/20"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}

          {/* Search results count */}
          {search && (
            <p className="text-xs text-zinc-700 mb-6">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""} for <span className="text-zinc-400">"{search}"</span>
            </p>
          )}

          {/* FAQ items */}
          <div className="divide-y divide-white/5 border-t border-white/5">
            {filtered.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-zinc-600 text-sm">No questions match your search.</p>
                <button onClick={() => setSearch("")} className="mt-3 text-xs text-zinc-700 hover:text-white transition-colors underline underline-offset-4">Clear search</button>
              </div>
            ) : (
              filtered.map((faq, i) => {
                const id = `${faq.category}-${i}`;
                const isOpen = openId === id;
                return (
                  <div key={id} ref={el => itemRefs.current[id] = el}>
                    <button
                      onClick={() => toggle(id)}
                      className="w-full flex items-start justify-between gap-4 py-5 text-left group"
                    >
                      <div className="flex-1">
                        {search && (
                          <p className="text-[9px] uppercase tracking-widest text-zinc-700 mb-1">{faq.category}</p>
                        )}
                        <span className={`text-sm leading-relaxed transition-colors ${isOpen ? "text-white" : "text-zinc-400 group-hover:text-white"}`}>
                          {faq.q}
                        </span>
                      </div>
                      <span className={`shrink-0 mt-0.5 transition-colors ${isOpen ? "text-[#b5ff4d]" : "text-zinc-700 group-hover:text-zinc-400"}`}>
                        {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                      </span>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <p className="text-sm text-zinc-500 leading-relaxed pb-5 max-w-2xl">
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>

          {/* Still have questions */}
          <div className="mt-16 border border-white/6 rounded-2xl p-8 bg-white/2 text-center">
            <p style={{ fontFamily: "var(--font-dm-serif-display), serif" }} className="text-xl font-normal mb-2">Still have questions?</p>
            <p className="text-sm text-zinc-500 mb-5">Can't find what you're looking for? Reach out directly.</p>
            <a
              href="mailto:support@forksai.app"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#b5ff4d] text-black text-sm font-bold hover:bg-[#c8ff6e] transition-colors"
            >
              support@forksai.app
            </a>
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-white/5 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-zinc-700">
          <span>© {new Date().getFullYear()} FORKSAI. All rights reserved.</span>
          <div className="flex items-center gap-5">
            <a href="/" className="hover:text-white transition-colors">Home</a>
            <a href="/blogs" className="hover:text-white transition-colors">Blog</a>
            <a href="/privacy-policy" className="hover:text-white transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-white transition-colors">Terms</a>
            <a href="mailto:support@forksai.app" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
