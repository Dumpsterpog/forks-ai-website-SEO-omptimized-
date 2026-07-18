"use client";

import { goToDashboard } from "@/lib/goToDashboard";

import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import AuthModal from "@/components/AuthModal";
import { ArrowLeft, Clock, User } from "lucide-react";

const CAT_STYLES = {
  "Study Science": { bg: "#E8E0FF", border: "#7C3AED", text: "#7C3AED" },
  "Exam Tips":     { bg: "#FFF3E0", border: "#EA580C", text: "#EA580C" },
  "Productivity":  { bg: "#F0F9E8", border: "#5CB85C", text: "#3d7a3d" },
  "AI Tools":      { bg: "#E0F4FF", border: "#0891B2", text: "#0891B2" },
  "Memory":        { bg: "#FFE8E8", border: "#DC2626", text: "#DC2626" },
};

const ALL_POSTS = [
  { title: "Active recall: the study technique that actually works", link: "/blog/active-recall", category: "Study Science" },
  { title: "How to prepare for any exam in 2 weeks", link: "/blog/exam-prep", category: "Exam Tips" },
  { title: "Why your study schedule keeps falling apart", link: "/blog/study-schedule", category: "Productivity" },
  { title: "FSRS-5 vs SM-2: the algorithm upgrade that actually matters", link: "/blog/fsrs-vs-sm2", category: "Study Science" },
  { title: "Spaced repetition: the secret to passing heavy exams", link: "/blog/spaced-repetition", category: "Memory" },
  { title: "Why traditional flashcards are slowing you down", link: "/blog/flashcards", category: "AI Tools" },
  { title: "I stopped taking notes in lecture. Here is what happened.", link: "/blog/notes-maker", category: "AI Tools" },
  { title: "The problem with rereading the textbook", link: "/blog/study-modes", category: "Study Science" },
  { title: "Turning downtime into learning time with audio", link: "/blog/ai-podcasts", category: "AI Tools" },
  { title: "The best Quizlet alternative for students who want less busywork", link: "/blog/quizlet-alternative", category: "AI Tools" },
  { title: "The best Anki alternative for students who don't want to fight the interface", link: "/blog/anki-alternative", category: "AI Tools" },
  { title: "How to make Anki cards that actually work", link: "/blog/how-to-make-anki-cards", category: "Study Science" },
];

export default function BlogLayout({
  title, category, author, date, readTime,
  ctaHeading, ctaDesc,
  children,
}) {
  const [user, setUser]         = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => onAuthStateChanged(auth, u => setUser(u)), []);

  const cat = CAT_STYLES[category] || CAT_STYLES["AI Tools"];

  const others = ALL_POSTS.filter(p => p.title !== title);
  const related = [
    ...others.filter(p => p.category === category),
    ...others.filter(p => p.category !== category),
  ].slice(0, 3);

  return (
    <div className="min-h-screen font-sans" style={{ background: "#EEEEE8", color: "#111111" }}>

      {showAuth && (
        <AuthModal
          auth={auth}
          onClose={() => setShowAuth(false)}
          onSuccess={() => { setShowAuth(false); goToDashboard(); }}
        />
      )}

      {/* ── NAVBAR ── */}
      <nav className="border-b-2 border-black bg-white sticky top-0 z-50">
        <div className="w-full px-4 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 shrink-0">
            <img src="/forks-logo.png" alt="FORKSAI" className="h-7 w-auto" />
            <span className="font-serif font-black text-xl text-[#111] tracking-tight">FORKSAI</span>
          </a>
          <div className="flex items-center gap-2 sm:gap-3">
            <a href="/blogs" className="hidden sm:block text-sm font-bold text-[#111] border-2 border-black rounded-xl px-4 py-2 bg-white shadow-[3px_3px_0_#111] transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5">
              Blog
            </a>
            {user ? (
              <a href="/dashboard" className="text-sm font-bold text-[#111] border-2 border-black rounded-xl px-4 py-2 bg-white shadow-[3px_3px_0_#111] transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5">
                Dashboard
              </a>
            ) : (
              <button onClick={() => setShowAuth(true)} className="text-sm font-bold text-[#111] border-2 border-black rounded-xl px-4 py-2 bg-white shadow-[3px_3px_0_#111] transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5">
                Sign In
              </button>
            )}
            <button
              onClick={() => setShowAuth(true)}
              className="text-sm font-bold text-[#111] border-2 border-black rounded-xl px-3 sm:px-4 py-2 shadow-[3px_3px_0_#111] transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5"
              style={{ background: "#F0D44A" }}
            >
              Start for Free
            </button>
          </div>
        </div>
      </nav>

      {/* ── ARTICLE ── */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-14">

        {/* Back link */}
        <a
          href="/blogs"
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#555] border-2 border-black rounded-xl px-3 py-1.5 bg-white shadow-[2px_2px_0_#111] transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5 mb-10"
        >
          <ArrowLeft size={11} /> Back to articles
        </a>

        {/* Article header */}
        <header className="mb-10">
          <div className="mb-4">
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2"
              style={{ background: cat.bg, borderColor: cat.border, color: cat.text }}
            >
              {category}
            </span>
          </div>
          <h1 className="font-serif font-black text-4xl sm:text-5xl text-[#111] leading-tight mb-6">
            {title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#999] pb-8 border-b-2 border-black/10">
            <span className="flex items-center gap-1.5 font-medium"><User size={11} />{author}</span>
            <span className="w-1 h-1 rounded-full bg-[#ccc]" />
            <span>{date}</span>
            <span className="w-1 h-1 rounded-full bg-[#ccc]" />
            <span className="flex items-center gap-1.5"><Clock size={11} />{readTime} read</span>
          </div>
        </header>

        {/* Body */}
        <div className="space-y-6 text-[17px] leading-relaxed text-[#444]">
          {children}
        </div>

        {/* CTA box */}
        <div className="mt-16 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0_#111] p-8 text-center">
          <h4 className="font-serif font-black text-2xl text-[#111] mb-2">{ctaHeading}</h4>
          <p className="text-[#555] text-sm leading-relaxed mb-6 max-w-md mx-auto">{ctaDesc}</p>
          <button
            onClick={() => user ? goToDashboard() : setShowAuth(true)}
            className="font-black text-sm text-[#111] border-2 border-black rounded-xl px-6 py-3 shadow-[3px_3px_0_#111] transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5"
            style={{ background: "#F0D44A" }}
          >
            {user ? "Go to Dashboard" : "Try it free"}
          </button>
        </div>

        {/* Related articles */}
        {related.length > 0 && (
          <div className="mt-14">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#999] mb-4">Related articles</h4>
            <div className="grid sm:grid-cols-3 gap-4">
              {related.map(p => (
                <a
                  key={p.link}
                  href={p.link}
                  className="block bg-white border-2 border-black rounded-xl shadow-[3px_3px_0_#111] p-4 text-sm font-bold text-[#111] leading-snug transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5 no-underline"
                >
                  {p.title}
                </a>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t-2 border-black text-white" style={{ background: "#111111" }}>
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
            <div className="lg:col-span-2">
              <div className="font-serif font-black text-xl text-white mb-3">FORKSAI</div>
              <p className="text-white/40 text-sm leading-relaxed max-w-xs">The AI study platform that turns your material into mastery. Built for students who want results, not just revision.</p>
            </div>
            <div>
              <div className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">Product</div>
              {["Dashboard", "AI Flashcards", "Study Modes", "Study Rooms"].map(l => (
                <a key={l} href="/dashboard" className="block text-sm text-white/40 hover:text-white transition-colors mb-2 no-underline">{l}</a>
              ))}
            </div>
            <div>
              <div className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">Legal</div>
              {[["Privacy Policy", "/privacy-policy"], ["Terms of Service", "/terms"], ["Refund Policy", "/refund-policy"], ["FAQ", "/faq"]].map(([l, href]) => (
                <a key={l} href={href} className="block text-sm text-white/40 hover:text-white transition-colors mb-2 no-underline">{l}</a>
              ))}
            </div>
          </div>
          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-white/25">© {new Date().getFullYear()} FORKSAI. All rights reserved.</p>
            <p className="text-xs text-white/25">Made for students who want to actually remember what they study.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
