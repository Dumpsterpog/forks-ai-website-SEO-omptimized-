"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Check, ChevronRight, FileText, Zap, BookOpen, Clock, Brain, TrendingUp, Sparkles } from "lucide-react";
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

export default function AISummarizerPage() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (cu) => {
      if (cu) setUser({ name: cu.displayName, uid: cu.uid });
      else setUser(null);
    });
  }, [auth]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const handleCTA = () => {
    if (user) (window.location.href = "/dashboard");
    else setShowAuth(true);
  };

  const faqs = [
    { q: "What can FORKSAI summarize?", a: "Any PDF document - lecture slides, research papers, textbook chapters, case studies - and plain text notes. If you can upload it or paste it, FORKSAI can summarize it." },
    { q: "How is this different from ChatGPT summarization?", a: "ChatGPT summarizes generically and has context window limits for long PDFs. FORKSAI is purpose-built for students: it identifies exam-relevant points, key definitions, and testable content - not just paragraph summaries." },
    { q: "Does it work for technical subjects?", a: "Yes. Medicine, engineering, law, chemistry, economics - FORKSAI handles technical material and preserves subject-specific terminology accurately." },
    { q: "Can I turn summaries into flashcards?", a: "Yes. After summarizing, you can generate a full flashcard deck from the same material in one click." },
  ];

  return (
    <div className="min-h-screen bg-[#080808] text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <FontLoader />
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.028]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "160px" }} />

      {showAuth && <AuthModal auth={auth} onClose={() => setShowAuth(false)} onSuccess={() => { setShowAuth(false); (window.location.href = "/dashboard"); }} />}

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
              <button onClick={() => (window.location.href = "/dashboard")}
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
            <span className="text-[11px] text-zinc-400 tracking-wide">Summarize PDFs, notes, lectures in seconds</span>
          </motion.div>

          <div className="grid lg:grid-cols-[1fr_420px] gap-16 items-center">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
                style={{ fontFamily: "'DM Serif Display', serif" }}
                className="text-[2.8rem] md:text-[3.8rem] leading-[1.06] font-normal mb-6"
              >
                AI Study<br />
                <span className="italic text-[#b5ff4d]">Summarizer</span>
              </motion.h1>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                className="text-zinc-400 text-base max-w-lg leading-relaxed mb-8">
                Upload any PDF, paste your lecture notes, or drop in a textbook chapter. ForksAI produces a structured summary of key arguments, definitions, and exam-ready points - in seconds. Read what matters. Skip the rest.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}
                className="flex flex-wrap gap-3 mb-10">
                {["Summarize full PDFs", "Lecture notes to key points", "Exam-relevant content only", "Any subject"].map((t, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 text-xs text-zinc-400 px-3 py-1.5 rounded-full border border-white/8">
                    <Check size={11} className="text-[#b5ff4d]" />{t}
                  </span>
                ))}
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <button onClick={handleCTA}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#b5ff4d] text-black text-sm font-bold hover:bg-[#c8ff6e] transition-colors">
                  Summarize notes instantly <ArrowRight size={15} />
                </button>
                <p className="text-[11px] text-zinc-700 mt-3">Free to start · No card needed</p>
              </motion.div>
            </div>

            {/* Summary preview */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
              className="hidden lg:block">
              <div className="rounded-2xl border border-white/8 bg-white/2 p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(181,255,77,0.4), transparent)" }} />
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Sparkles size={12} style={{ color: "#b5ff4d" }} />
                    <span className="text-[10px] text-zinc-600 uppercase tracking-widest">Summary generated</span>
                  </div>
                  <span className="text-[10px] text-zinc-700">Endocrine System - 48pp</span>
                </div>

                {[
                  { label: "Key Concept", text: "The hypothalamic-pituitary axis regulates all major endocrine glands through negative feedback loops." },
                  { label: "Definition", text: "Insulin resistance: reduced cellular response to insulin, compensated by increased pancreatic secretion until beta-cell failure." },
                  { label: "Exam Point", text: "Cortisol is elevated in Cushing's syndrome - key signs: central obesity, striae, moon face, buffalo hump." },
                  { label: "Key Concept", text: "Thyroid hormone synthesis requires iodine; TSH stimulation triggers uptake and organification at follicular cells." },
                ].map((item, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.2, duration: 0.4 }}
                    className="mb-3 rounded-xl border border-white/6 bg-white/2 p-3.5">
                    <span className="text-[9px] uppercase tracking-widest font-semibold mb-1.5 block"
                      style={{ color: item.label === "Exam Point" ? "#f97316" : item.label === "Definition" ? "#60a5fa" : "#b5ff4d" }}>
                      {item.label}
                    </span>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">{item.text}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* WHY AI SUMMARIES */}
        <section className="border-t border-white/5 py-24 px-6 md:px-12">
          <div className="max-w-6xl mx-auto">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-[11px] uppercase tracking-[0.2em] text-[#b5ff4d] mb-3">The problem</motion.p>
            <motion.h2 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }}
              style={{ fontFamily: "'DM Serif Display', serif" }}
              className="text-[2rem] md:text-[2.6rem] font-normal mb-4">
              Why Students Use AI Summaries
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.14 }}
              className="text-zinc-500 text-sm max-w-2xl leading-relaxed mb-16">
              The average university textbook chapter is 25–40 pages. The average lecture slide deck is 60–90 slides. You cannot re-read all of it before every exam - but you also can't study what you don't understand. AI summarization solves the bottleneck.
            </motion.p>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="rounded-2xl border p-8" style={{ borderColor: "rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.03)" }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(239,68,68,0.1)" }}>
                    <Clock size={14} style={{ color: "#ef4444" }} />
                  </div>
                  <p className="text-sm font-bold text-white">Without AI summarization</p>
                </div>
                <ul className="space-y-3">
                  {["3–5 hours reading a single chapter", "Unsure which parts actually matter for exams", "Re-reading the same passages hoping they stick", "Highlighting everything = highlighting nothing"].map((t, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-zinc-500">
                      <span className="w-1 h-1 rounded-full bg-red-500/50 mt-1.5 shrink-0" />{t}
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                className="rounded-2xl border p-8" style={{ borderColor: "rgba(181,255,77,0.2)", background: "rgba(181,255,77,0.03)" }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(181,255,77,0.1)" }}>
                    <Zap size={14} style={{ color: "#b5ff4d" }} />
                  </div>
                  <p className="text-sm font-bold text-white">With ForksAI Summarizer</p>
                </div>
                <ul className="space-y-3">
                  {["Key points extracted in under 30 seconds", "Exam-relevant content clearly separated", "Definitions and mechanisms highlighted", "Remaining time used for active recall"].map((t, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-zinc-400">
                      <Check size={11} className="text-[#b5ff4d] mt-0.5 shrink-0" />{t}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Three use cases */}
            <div className="grid md:grid-cols-3 gap-4 mt-8">
              {[
                { icon: FileText, title: "Summarize lecture PDFs", desc: "Upload your professor's lecture slides. ForksAI extracts the key concepts, definitions, and points most likely to appear on assessments - not just bullet point reductions.", color: "#b5ff4d" },
                { icon: BookOpen, title: "Condense textbook chapters", desc: "Long textbook chapters summarized into structured, scannable breakdowns. Key arguments, important figures, and terminology - surfaced and organized.", color: "#60a5fa" },
                { icon: Brain, title: "Distill research papers", desc: "Upload academic papers or case studies. ForksAI identifies methodology, key findings, and implications - making dense research accessible in minutes.", color: "#f97316" },
              ].map((item, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="rounded-2xl border border-white/6 p-7">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-5" style={{ background: `${item.color}15` }}>
                    <item.icon size={15} style={{ color: item.color }} />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
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
              Summarize Notes Instantly
            </motion.h2>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="rounded-2xl overflow-hidden border border-white/8" style={{ background: "#0d0d0d" }}>
              <div className="flex items-center gap-3 px-5 py-3 border-b border-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: "#ffbd2e" }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: "#28ca41" }} />
                </div>
                <div className="flex-1 mx-3">
                  <div className="mx-auto max-w-xs h-6 rounded-md flex items-center justify-center px-3"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <span className="text-[11px] text-zinc-600">forksai.app/summarizer</span>
                  </div>
                </div>
              </div>
              <Image src="/dashboardpreview.png" alt="ForksAI AI Summarizer interface" width={3182} height={1824} className="w-full h-auto object-cover object-top" style={{ maxHeight: "500px" }} />
            </motion.div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-white/5 py-24 px-6 md:px-12">
          <div className="max-w-6xl mx-auto">
            <motion.h2 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              style={{ fontFamily: "'DM Serif Display', serif" }}
              className="text-[2rem] md:text-[2.4rem] font-normal mb-12">
              Common questions
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
                Stop reading everything.<br /><span className="italic text-[#b5ff4d]">Read what matters.</span>
              </motion.h2>
              <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.12 }}
                className="text-zinc-500 text-sm max-w-md mx-auto mb-10 leading-relaxed">
                Upload your first document and get a structured summary in under 30 seconds.
              </motion.p>
              <button onClick={handleCTA}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#b5ff4d] text-black text-sm font-bold hover:bg-[#c8ff6e] transition-colors">
                Summarize your notes <ChevronRight size={15} />
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
                { title: "AI Flashcard Generator", desc: "Turn your notes into flashcards in 30 seconds.", href: "/ai-flashcards", tag: "Flashcards" },
                { title: "PDF to Flashcards", desc: "Upload a PDF and get a full deck instantly.", href: "/pdf-to-flashcards", tag: "Converter" },
                { title: "AI Study Tools", desc: "The complete AI study toolkit for students.", href: "/ai-study-tools", tag: "All tools" },
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
