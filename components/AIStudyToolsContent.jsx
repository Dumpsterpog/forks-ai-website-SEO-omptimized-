"use client";

import { goToDashboard } from "@/lib/goToDashboard";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, ChevronRight, Sparkles, Brain, FileText, Repeat, TrendingUp, Target, Zap, Clock } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import AuthModal from "@/components/AuthModal";

const FontLoader = () => {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap";
    document.head.appendChild(link);
  }, []);
  return null;
};

export default function AIStudyToolsPage() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (cu) => {
      if (cu) setUser({ uid: cu.uid });
      else setUser(null);
    });
  }, [auth]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const handleCTA = () => {
    if (user) goToDashboard();
    else setShowAuth(true);
  };

  const tools = [
    {
      href: "/ai-flashcards",
      icon: Sparkles,
      title: "AI Flashcard Generator",
      tag: "Core tool",
      tagColor: "#b5ff4d",
      desc: "Upload any PDF or notes. Get a complete flashcard deck in under 30 seconds. The AI generates exam-quality Q&A cards from your own material - not generic content.",
      points: ["Works from any PDF", "Exam-quality questions", "No manual card creation", "Any subject"],
    },
    {
      href: "/ai-summarizer",
      icon: FileText,
      title: "AI PDF Summarizer",
      tag: "Time-saver",
      tagColor: "#60a5fa",
      desc: "Upload lecture PDFs, research papers, or textbook chapters. ForksAI extracts key arguments, definitions, and exam-relevant points - structured and scannable.",
      points: ["Full PDF to summary", "Exam-relevant points only", "Definitions highlighted", "Works on any length"],
    },
    {
      href: "/pdf-to-flashcards",
      icon: Target,
      title: "PDF to Flashcards",
      tag: "High-demand",
      tagColor: "#f97316",
      desc: "The fastest path from lecture slides to study-ready cards. Upload your PDF and have a flashcard deck ready before your next class. Three clicks, done.",
      points: ["Lecture PDF → full deck", "Preserves technical accuracy", "Any subject or level", "Edit cards before studying"],
    },
    {
      href: "#revision",
      icon: Repeat,
      title: "Revision Modes",
      tag: "Active recall",
      tagColor: "#a882ff",
      desc: "Flip mode for classic flashcard review. Quiz mode for active recall testing. Cram mode for last-minute sessions. Switch between them anytime - all in one place.",
      points: ["Flip, quiz, and cram modes", "Progress tracked per card", "Weak cards resurface more", "Spaced repetition built in"],
    },
    {
      href: "#progress",
      icon: TrendingUp,
      title: "Streaks & Progress Analytics",
      tag: "Habit-building",
      tagColor: "#34d399",
      desc: "Daily streaks, XP badges, and performance analytics. See exactly where you're improving and where you're not. Consistency beats cramming - the data keeps you honest.",
      points: ["Daily study streaks", "Per-deck performance data", "XP and achievement badges", "Identifies weak areas"],
    },
  ];

  const comparisons = [
    { tool: "Anki", pro: "Powerful spaced repetition", con: "You have to make every card manually", verdict: "Great engine, terrible UX for busy students" },
    { tool: "Quizlet", pro: "Card sharing community", con: "Generic AI, not your actual material", verdict: "Good for finding existing sets, not for your notes" },
    { tool: "Notion", pro: "Excellent for note organization", con: "Zero built-in active recall or testing", verdict: "Not a study tool - it's a notes tool" },
    { tool: "ChatGPT", pro: "Flexible AI generation", con: "No study structure, forgets context, no tracking", verdict: "Useful for explanation, not for systematic studying" },
    { tool: "FORKSAI", pro: "AI generation from your own material, built-in study modes, progress tracking", con: "-", verdict: "Built specifically for how students learn" },
  ];

  return (
    <div className="min-h-screen bg-[#080808] text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <FontLoader />
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.028]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "160px" }} />

      {showAuth && <AuthModal auth={auth} onClose={() => setShowAuth(false)} onSuccess={() => { setShowAuth(false); goToDashboard(); }} />}

      {/* NAV */}
      <motion.header
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#080808]/90 backdrop-blur-md border-b border-white/6" : "border-b border-transparent"}`}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <img src="/forks-logo.png" alt="FORKSAI" className="h-6 w-auto" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase">FORKSAI</span>
          </a>
          <div className="flex items-center gap-3">
            <a href="/#pricing" className="hidden md:block text-xs text-zinc-500 hover:text-white transition-colors">Pricing</a>
            {!user ? (
              <button onClick={() => setShowAuth(true)}
                className="text-xs font-semibold px-5 py-2 rounded-full bg-white text-black hover:bg-zinc-100 transition-colors">
                Get started free
              </button>
            ) : (
              <button onClick={() => goToDashboard()}
                className="text-xs font-semibold px-5 py-2 rounded-full bg-[#b5ff4d] text-black hover:bg-[#c8ff6e] transition-colors">
                Dashboard
              </button>
            )}
          </div>
        </div>
      </motion.header>

      <main className="relative z-10 pt-28">

        {/* HERO */}
        <section className="px-6 md:px-12 py-20 max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 mb-8 px-3 py-1.5 border border-white/8 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#b5ff4d] animate-pulse" />
            <span className="text-[11px] text-zinc-400 tracking-wide">Flashcards · Summaries · Quizzes · Progress tracking</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            style={{ fontFamily: "'DM Serif Display', serif" }}
            className="text-[2.8rem] md:text-[4rem] leading-[1.06] font-normal mb-6 max-w-3xl"
          >
            The Best AI Study Tools<br />
            <span className="italic text-[#b5ff4d]">for Students</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-zinc-400 text-base max-w-xl leading-relaxed mb-10">
            FORKSAI brings together AI flashcard generation, PDF summarization, quiz modes, and progress tracking in one place - built around the science of how memory actually works. Not a feature dump. A complete study system.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center gap-4">
            <button onClick={handleCTA}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#b5ff4d] text-black text-sm font-bold hover:bg-[#c8ff6e] transition-colors">
              Try all tools free <ArrowRight size={15} />
            </button>
            <p className="text-xs text-zinc-600">No credit card · Free forever</p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            className="flex flex-wrap gap-6 mt-12 pt-10 border-t border-white/5">
            {[["25,000+", "Active students"], ["200,000+", "Documents processed"], ["67+", "Countries"]].map(([n, l], i) => (
              <div key={i}>
                <p className="text-xl font-bold text-white">{n}</p>
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest mt-0.5">{l}</p>
              </div>
            ))}
          </motion.div>
        </section>

        {/* ALL TOOLS */}
        <section className="border-t border-white/5 py-24 px-6 md:px-12">
          <div className="max-w-6xl mx-auto">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-[11px] uppercase tracking-[0.2em] text-[#b5ff4d] mb-3">Every tool</motion.p>
            <motion.h2 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }}
              style={{ fontFamily: "'DM Serif Display', serif" }}
              className="text-[2rem] md:text-[2.6rem] font-normal mb-4">
              AI Study Tools - What's included
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.14 }}
              className="text-zinc-500 text-sm max-w-2xl leading-relaxed mb-16">
              Every tool in FORKSAI is built around a specific study problem - not a checklist of features. Each one exists because passive studying doesn't work, and students need better tools than re-reading and highlighting.
            </motion.p>

            <div className="space-y-4">
              {tools.map((tool, i) => (
                <motion.a
                  key={i}
                  href={tool.href}
                  initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="grid md:grid-cols-[280px_1fr] gap-8 rounded-2xl border border-white/6 p-8 hover:border-white/12 transition-all group"
                  style={{ background: "rgba(255,255,255,0.01)" }}
                >
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${tool.tagColor}15` }}>
                        <tool.icon size={15} style={{ color: tool.tagColor }} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-[#b5ff4d] transition-colors">{tool.title}</p>
                        <span className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: tool.tagColor }}>{tool.tag}</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {tool.points.map((pt, j) => (
                        <div key={j} className="flex items-center gap-2 text-[11px] text-zinc-600">
                          <Check size={10} style={{ color: tool.tagColor }} className="shrink-0" />{pt}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col justify-between">
                    <p className="text-sm text-zinc-500 leading-relaxed">{tool.desc}</p>
                    <div className="flex items-center gap-1.5 mt-4 text-xs font-semibold" style={{ color: tool.tagColor }}>
                      Learn more <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </section>

        {/* COMPARISON */}
        <section className="border-t border-white/5 py-24 px-6 md:px-12">
          <div className="max-w-6xl mx-auto">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-[11px] uppercase tracking-[0.2em] text-[#b5ff4d] mb-3">The honest comparison</motion.p>
            <motion.h2 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }}
              style={{ fontFamily: "'DM Serif Display', serif" }}
              className="text-[2rem] md:text-[2.6rem] font-normal mb-4">
              How FORKSAI compares to<br />other study tools
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.14 }}
              className="text-zinc-500 text-sm max-w-2xl leading-relaxed mb-12">
              We're not saying other tools are bad. We're saying most of them weren't designed to solve the core study problem: turning your own material into active recall at scale.
            </motion.p>

            <div className="space-y-3">
              {comparisons.map((row, i) => {
                const isForksAI = row.tool === "ForksAI";
                return (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                    className="rounded-2xl border p-6 md:p-8"
                    style={{
                      borderColor: isForksAI ? "rgba(181,255,77,0.25)" : "rgba(255,255,255,0.06)",
                      background: isForksAI ? "rgba(181,255,77,0.04)" : "rgba(255,255,255,0.01)",
                    }}
                  >
                    <div className="grid md:grid-cols-[140px_1fr_1fr_1fr] gap-4 items-start">
                      <p className="text-sm font-bold" style={{ color: isForksAI ? "#b5ff4d" : "#fff" }}>{row.tool}</p>
                      <div>
                        <p className="text-[9px] uppercase tracking-widest text-zinc-700 mb-1">What it does well</p>
                        <p className="text-xs text-zinc-400">{row.pro}</p>
                      </div>
                      {row.con !== "-" && (
                        <div>
                          <p className="text-[9px] uppercase tracking-widest text-zinc-700 mb-1">The limitation</p>
                          <p className="text-xs text-zinc-500">{row.con}</p>
                        </div>
                      )}
                      <div className={row.con === "-" ? "md:col-span-2" : ""}>
                        <p className="text-[9px] uppercase tracking-widest text-zinc-700 mb-1">Verdict</p>
                        <p className="text-xs" style={{ color: isForksAI ? "#b5ff4d" : "#71717a" }}>{row.verdict}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SCREENSHOT */}
        <section className="border-t border-white/5 py-24 px-6 md:px-12">
          <div className="max-w-6xl mx-auto">
            <motion.h2 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              style={{ fontFamily: "'DM Serif Display', serif" }}
              className="text-[2rem] md:text-[2.6rem] font-normal mb-10">
              One platform. All your study tools.
            </motion.h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { img: "/dashboardpreview.png", label: "Dashboard - your study hub" },
                { img: "/AIflashcard.png", label: "AI Flashcard Generator" },
                { img: "/revisionmodes.png", label: "Quiz & Revision modes" },
                { img: "/achievements.png", label: "Streaks & Achievement tracking" },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="rounded-2xl overflow-hidden border border-white/8 relative group">
                  <img src={item.img} alt={item.label} className="w-full h-48 object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]" />
                  <div className="absolute inset-0 bg-linear-to-t from-[#080808] to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-xs font-semibold text-white">{item.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SCIENCE BACKING */}
        <section className="border-t border-white/5 py-24 px-6 md:px-12">
          <div className="max-w-6xl mx-auto">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-[11px] uppercase tracking-[0.2em] text-[#b5ff4d] mb-3">Why it works</motion.p>
            <motion.h2 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }}
              style={{ fontFamily: "'DM Serif Display', serif" }}
              className="text-[2rem] md:text-[2.6rem] font-normal mb-16">
              Built on learning science.<br />Not just built to look good.
            </motion.h2>

            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: Brain, title: "Active recall", desc: "Every ForksAI study mode forces you to retrieve information rather than passively recognise it. This is the key mechanism behind long-term retention.", research: "Backed by 100+ years of cognitive science research, including Roediger & Karpicke (2006)" },
                { icon: Repeat, title: "Spaced repetition", desc: "Cards you struggle with appear more often. Cards you know fade into the background. Your study time is always spent where it's needed most.", research: "Ebbinghaus forgetting curve research (1885) and subsequent replications" },
                { icon: TrendingUp, title: "Consistent practice", desc: "Daily streaks and progress tracking aren't just motivation features - consistency in spaced practice is proven to outperform cramming for retention at one month and beyond.", research: "Kornell & Bjork (2008), Cepeda et al. (2006)" },
              ].map((item, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="rounded-2xl border border-white/6 p-7" style={{ background: "rgba(181,255,77,0.02)" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-5" style={{ background: "rgba(181,255,77,0.1)" }}>
                    <item.icon size={15} style={{ color: "#b5ff4d" }} />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed mb-4">{item.desc}</p>
                  <p className="text-[10px] text-zinc-700 italic leading-relaxed">{item.research}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-white/5 py-28 px-6 md:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="rounded-2xl border p-12 md:p-20 relative overflow-hidden text-center"
              style={{ borderColor: "rgba(181,255,77,0.15)", background: "rgba(181,255,77,0.03)" }}>
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(181,255,77,0.4), transparent)" }} />
              <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                style={{ fontFamily: "'DM Serif Display', serif" }}
                className="text-[2.2rem] md:text-[3rem] leading-tight font-normal mb-6">
                Every tool you need.<br /><span className="italic text-[#b5ff4d]">Free to start.</span>
              </motion.h2>
              <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.12 }}
                className="text-zinc-500 text-sm max-w-md mx-auto mb-10 leading-relaxed">
                Upload your first document and have a flashcard deck, summary, and study session ready in under 2 minutes.
              </motion.p>
              <button onClick={handleCTA}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#b5ff4d] text-black text-sm font-bold hover:bg-[#c8ff6e] transition-colors">
                Start studying smarter <ChevronRight size={15} />
              </button>
              <p className="text-[11px] text-zinc-700 mt-4">Free forever · Premium from $1/day · Cancel anytime</p>
            </div>
          </div>
        </section>

        {/* INTERNAL LINKS */}
        <section className="border-t border-white/5 py-16 px-6 md:px-12">
          <div className="max-w-6xl mx-auto">
            <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-700 mb-8">Explore individual tools</p>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { title: "AI Flashcard Generator", desc: "Turn notes into flashcards in 30 seconds.", href: "/ai-flashcards", tag: "Flashcards" },
                { title: "AI Summarizer", desc: "Summarize any PDF or lecture instantly.", href: "/ai-summarizer", tag: "Summarizer" },
                { title: "PDF to Flashcards", desc: "Upload a PDF and get a full deck instantly.", href: "/pdf-to-flashcards", tag: "Converter" },
              ].map((link, i) => (
                <a key={i} href={link.href}
                  className="rounded-xl border border-white/6 p-6 hover:border-[#b5ff4d]/25 transition-colors group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-700">{link.tag}</span>
                    <ChevronRight size={13} className="text-zinc-700 group-hover:text-[#b5ff4d] transition-colors" />
                  </div>
                  <p className="text-sm font-bold text-white mb-1.5 group-hover:text-[#b5ff4d] transition-colors">{link.title}</p>
                  <p className="text-xs text-zinc-600">{link.desc}</p>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 px-6 md:px-12 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start justify-between gap-8">
          <div>
            <a href="/" className="flex items-center gap-2 mb-3">
              <img src="/forks-logo.png" alt="FORKSAI" className="h-5 w-auto" />
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase">FORKSAI</span>
            </a>
            <p className="text-[12px] text-zinc-700 max-w-45 leading-relaxed">The AI study platform built for real students.</p>
          </div>
          <div className="flex gap-12 text-[12px]">
            <div>
              <p className="text-zinc-600 uppercase tracking-widest text-[10px] mb-3">Tools</p>
              <div className="flex flex-col gap-2">
                <a href="/ai-flashcards" className="text-zinc-500 hover:text-white transition-colors">AI Flashcards</a>
                <a href="/ai-summarizer" className="text-zinc-500 hover:text-white transition-colors">AI Summarizer</a>
                <a href="/pdf-to-flashcards" className="text-zinc-500 hover:text-white transition-colors">PDF to Flashcards</a>
                <a href="/ai-study-tools" className="text-zinc-500 hover:text-white transition-colors">AI Study Tools</a>
              </div>
            </div>
            <div>
                          <div>
              <p className="text-zinc-600 uppercase tracking-widest text-[10px] mb-3">Blog</p>
              <div className="flex flex-col gap-2">
                <a href="/blogs" className="text-zinc-500 hover:text-white transition-colors">All Articles</a>
                <a href="/blog/active-recall" className="text-zinc-500 hover:text-white transition-colors">Active Recall</a>
                <a href="/blog/spaced-repetition" className="text-zinc-500 hover:text-white transition-colors">Spaced Repetition</a>
              </div>
            </div>
            <p className="text-zinc-600 uppercase tracking-widest text-[10px] mb-3">Legal</p>
              <div className="flex flex-col gap-2">
                <a href="/terms" className="text-zinc-500 hover:text-white transition-colors">Terms</a>
                <a href="/privacy-policy" className="text-zinc-500 hover:text-white transition-colors">Privacy</a>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-white/5 text-[11px] text-zinc-700">
          © {new Date().getFullYear()} FORKSAI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}   
