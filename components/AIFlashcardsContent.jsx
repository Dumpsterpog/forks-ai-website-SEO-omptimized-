"use client";

import { goToDashboard } from "@/lib/goToDashboard";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Check, ChevronRight, Zap, Brain, FileText, Target, Repeat, Clock, TrendingUp, Sparkles } from "lucide-react";
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

export default function AIFlashcardsPage() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (cu) => {
      if (cu) setUser({ name: cu.displayName, email: cu.email, uid: cu.uid });
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

  const faqs = [
    { q: "How does the AI flashcard generator work?", a: "You upload a PDF or paste your notes. FORKSAI reads your material, identifies key concepts, and generates question-answer pairs automatically. The entire process takes under 30 seconds." },
    { q: "What file types can I upload?", a: "FORKSAI supports PDF uploads and direct text/note paste. Any subject - medicine, law, engineering, humanities." },
    { q: "Is it better than making cards manually in Anki?", a: "For speed, yes - drastically. Anki is powerful but requires you to author every card yourself. ForksAI generates exam-quality cards from your own material in seconds." },
    { q: "Are the flashcards actually good quality?", a: "They're pulled directly from your uploaded material, not generated generically. The AI identifies key facts, definitions, and relationships - the kinds of things that actually appear on exams." },
  ];

  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen bg-[#080808] text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <FontLoader />

      {/* Grain */}
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
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-8 px-3 py-1.5 border border-white/8 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#b5ff4d] animate-pulse" />
            <span className="text-[11px] text-zinc-400 tracking-wide">AI-powered · works from any PDF or notes</span>
          </motion.div>

          <div className="grid lg:grid-cols-[1fr_400px] gap-16 items-center">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
                style={{ fontFamily: "'DM Serif Display', serif" }}
                className="text-[2.8rem] md:text-[3.8rem] leading-[1.06] font-normal mb-6"
              >
                AI Flashcard<br />
                <span className="italic text-[#b5ff4d]">Generator</span>
              </motion.h1>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                className="text-zinc-400 text-base max-w-lg leading-relaxed mb-8">
                Turn your notes, PDFs, and lecture slides into study-ready flashcards in under 30 seconds. ForksAI reads your material and generates exam-quality Q&A pairs - no manual card creation required.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}
                className="flex flex-wrap gap-3 mb-10">
                {["Instant generation from any PDF", "Exam-quality Q&A pairs", "No Anki setup needed", "Any subject, any level"].map((t, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 text-xs text-zinc-400 px-3 py-1.5 rounded-full border border-white/8">
                    <Check size={11} className="text-[#b5ff4d]" />{t}
                  </span>
                ))}
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <button onClick={handleCTA}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#b5ff4d] text-black text-sm font-bold hover:bg-[#c8ff6e] transition-colors">
                  Generate flashcards free <ArrowRight size={15} />
                </button>
                <p className="text-[11px] text-zinc-700 mt-3">Free to start · No card needed</p>
              </motion.div>
            </div>

            {/* Live card demo */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
              className="hidden lg:block">
              <div className="rounded-2xl border border-white/8 bg-white/2 p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(181,255,77,0.4), transparent)" }} />
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#b5ff4d] animate-pulse" />
                    <span className="text-[10px] text-zinc-600 uppercase tracking-widest">Generating deck…</span>
                  </div>
                  <span className="text-[10px] text-zinc-700">Pharmacology - Chapter 4</span>
                </div>
                {[
                  { q: "What is the mechanism of action of beta blockers?", a: "Competitively block β-adrenergic receptors, reducing heart rate and myocardial contractility", delay: 0.6 },
                  { q: "Name the first-line treatment for hypertensive emergency", a: "IV labetalol or nicardipine - goal is 25% MAP reduction in first hour", delay: 1.0 },
                  { q: "Define therapeutic index", a: "Ratio of TD50 to ED50 - higher ratio = safer drug with wider margin", delay: 1.4 },
                ].map((card, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: card.delay, duration: 0.4 }}
                    className="mb-3 rounded-xl border border-white/6 bg-white/2 p-4">
                    <p className="text-[9px] uppercase tracking-widest mb-1.5" style={{ color: "#b5ff4d" }}>Q</p>
                    <p className="text-xs text-white font-medium mb-2 leading-snug">{card.q}</p>
                    <p className="text-[9px] uppercase tracking-widest text-zinc-700 mb-1">A</p>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">{card.a}</p>
                  </motion.div>
                ))}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }} className="text-center pt-2">
                  <span className="text-[10px] text-zinc-700">+ 24 more cards generated</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* WHY AI FLASHCARDS */}
        <section className="border-t border-white/5 py-24 px-6 md:px-12">
          <div className="max-w-6xl mx-auto">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-[11px] uppercase tracking-[0.2em] text-[#b5ff4d] mb-3">The science</motion.p>
            <motion.h2 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }}
              style={{ fontFamily: "'DM Serif Display', serif" }}
              className="text-[2rem] md:text-[2.6rem] font-normal mb-4">
              Why AI Flashcards Help Students<br />Learn Faster
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.14 }}
              className="text-zinc-500 text-sm max-w-2xl leading-relaxed mb-16">
              Decades of cognitive science research confirms it: active recall - forcing your brain to retrieve information - is the single most effective study technique. Flashcards are the practical implementation. The problem has always been the time it takes to make them.
            </motion.p>

            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: Brain, title: "Active recall beats re-reading", desc: "When you flip a flashcard and retrieve an answer, your brain strengthens the neural pathway. Re-reading feels productive but leaves information shallow and temporary.", stat: "2.5× better retention vs passive reading" },
                { icon: Repeat, title: "Spaced repetition works", desc: "Reviewing cards at increasing intervals is proven to move information into long-term memory. ForksAI surfaces cards you struggle with more frequently.", stat: "Up to 85% retention at 3 months" },
                { icon: Zap, title: "Speed removes the friction", desc: "The #1 reason students don't use flashcards: making them takes forever. AI generation removes that barrier entirely. Upload and study.", stat: "Cards ready in under 30 seconds" },
              ].map((item, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="rounded-2xl border border-white/6 p-7" style={{ background: "rgba(181,255,77,0.02)" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-5" style={{ background: "rgba(181,255,77,0.1)" }}>
                    <item.icon size={15} style={{ color: "#b5ff4d" }} />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed mb-4">{item.desc}</p>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold"
                    style={{ background: "rgba(181,255,77,0.08)", color: "#b5ff4d", border: "1px solid rgba(181,255,77,0.15)" }}>
                    <TrendingUp size={9} /> {item.stat}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="border-t border-white/5 py-24 px-6 md:px-12">
          <div className="max-w-6xl mx-auto">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-[11px] uppercase tracking-[0.2em] text-[#b5ff4d] mb-3">How it works</motion.p>
            <motion.h2 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }}
              style={{ fontFamily: "'DM Serif Display', serif" }}
              className="text-[2rem] md:text-[2.6rem] font-normal mb-16">
              How to Generate Flashcards<br />with ForksAI
            </motion.h2>

            <div className="space-y-4">
              {[
                { n: "01", title: "Upload your material", desc: "Drop in a PDF, paste your lecture notes, or upload any text-based study material. Any subject - medicine, law, engineering, history, science. There's no formatting required.", detail: "ForksAI accepts PDFs and plain text. Lecture slides, textbook chapters, handwritten notes scanned to PDF - all work." },
                { n: "02", title: "AI reads and extracts key knowledge", desc: "ForksAI's AI reads your entire document, identifies the important facts, definitions, mechanisms, and concepts - not generic summaries, but the specific content from your material.", detail: "The AI distinguishes between key testable facts and supporting context, so your flashcards contain what actually matters for exams." },
                { n: "03", title: "Review your deck and study", desc: "Your flashcard deck is ready. Flip through cards, mark what you know and what needs more work. ForksAI tracks your progress and resurfaces difficult cards.", detail: "Cards you struggle with appear more often. Cards you know fade back. Your study time is spent where it's actually needed." },
              ].map((step, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                  className="grid grid-cols-[3rem_1fr] gap-6 rounded-2xl border border-white/6 p-7 hover:border-[#b5ff4d]/20 transition-colors">
                  <span className="text-[11px] font-mono text-[#b5ff4d] pt-1">{step.n}</span>
                  <div>
                    <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed mb-2">{step.desc}</p>
                    <p className="text-[11px] text-zinc-700 italic">{step.detail}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SCREENSHOT */}
        <section className="border-t border-white/5 py-24 px-6 md:px-12">
          <div className="max-w-6xl mx-auto">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-[11px] uppercase tracking-[0.2em] text-[#b5ff4d] mb-3">The product</motion.p>
            <motion.h2 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }}
              style={{ fontFamily: "'DM Serif Display', serif" }}
              className="text-[2rem] md:text-[2.6rem] font-normal mb-10">
              Real flashcards. Not mockups.
            </motion.h2>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="rounded-2xl overflow-hidden border border-white/8" style={{ background: "#0d0d0d" }}>
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(181,255,77,0.4), transparent)" }} />
              <div className="flex items-center gap-3 px-5 py-3 border-b border-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: "#ffbd2e" }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: "#28ca41" }} />
                </div>
                <div className="flex-1 mx-3">
                  <div className="mx-auto max-w-xs h-6 rounded-md flex items-center justify-center px-3"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <span className="text-[11px] text-zinc-600">forksai.app/flashcards</span>
                  </div>
                </div>
              </div>
              <Image src="/AIflashcard.png" alt="ForksAI AI Flashcard Generator interface" width={3180} height={1810} className="w-full h-auto object-cover object-top" style={{ maxHeight: "500px" }} />
            </motion.div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-white/5 py-24 px-6 md:px-12">
          <div className="max-w-6xl mx-auto">
            <motion.h2 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              style={{ fontFamily: "'DM Serif Display', serif" }}
              className="text-[2rem] md:text-[2.4rem] font-normal mb-12">
              Frequently asked questions
            </motion.h2>
            <div className="max-w-3xl space-y-2">
              {faqs.map((faq, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                  className="rounded-xl border border-white/6 overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white/2 transition-colors">
                    <span className="text-sm font-medium text-white">{faq.q}</span>
                    <ChevronRight size={14} className={`text-zinc-600 transition-transform shrink-0 ml-4 ${openFaq === i ? "rotate-90" : ""}`} />
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-5 border-t border-white/5">
                      <p className="text-sm text-zinc-500 leading-relaxed pt-4">{faq.a}</p>
                    </div>
                  )}
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
                Try the AI Flashcard Generator.<br /><span className="italic text-[#b5ff4d]">Free to start.</span>
              </motion.h2>
              <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.12 }}
                className="text-zinc-500 text-sm max-w-md mx-auto mb-10 leading-relaxed">
                Upload your first PDF and have a full flashcard deck ready in under 30 seconds. No credit card. No setup.
              </motion.p>
              <button onClick={handleCTA}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#b5ff4d] text-black text-sm font-bold hover:bg-[#c8ff6e] transition-colors">
                Generate flashcards now <ChevronRight size={15} />
              </button>
              <p className="text-[11px] text-zinc-700 mt-4">Free forever · Premium from $1/day</p>
            </div>
          </div>
        </section>

        {/* INTERNAL LINKS */}
        <section className="border-t border-white/5 py-16 px-6 md:px-12">
          <div className="max-w-6xl mx-auto">
            <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-700 mb-8">More ForksAI tools</p>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { title: "AI PDF Summarizer", desc: "Summarize any PDF or lecture notes in seconds.", href: "/ai-summarizer", tag: "Summarizer" },
                { title: "PDF to Flashcards", desc: "Upload a PDF and get a full flashcard deck instantly.", href: "/pdf-to-flashcards", tag: "Converter" },
                { title: "AI Study Tools", desc: "Everything you need to study smarter, not longer.", href: "/ai-study-tools", tag: "All tools" },
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

      {/* FOOTER */}
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
