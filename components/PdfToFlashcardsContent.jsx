"use client";

import { goToDashboard } from "@/lib/goToDashboard";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Check, ChevronRight, Upload, Sparkles, Target, TrendingUp, FileText, Zap, Brain } from "lucide-react";
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

export default function PDFToFlashcardsPage() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

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

  const faqs = [
    { q: "How do I convert a PDF to flashcards?", a: "Upload your PDF to ForksAI, and the AI will read it, extract key concepts and facts, and generate question-answer flashcards automatically. The process takes under 30 seconds for most documents." },
    { q: "What kinds of PDFs work best?", a: "Lecture slide PDFs, textbook chapters, study guides, and research papers all work well. The AI handles dense technical material - medicine, law, engineering, science - accurately." },
    { q: "How many flashcards will it generate?", a: "It depends on your document length and content density. Typically 15–50 cards per upload, covering all major testable concepts from the material." },
    { q: "Can I edit the generated flashcards?", a: "Yes. After generation you can review, edit, and delete individual cards before starting your study session." },
    { q: "Is this better than Quizlet?", a: "Quizlet requires you to create or find existing card sets. ForksAI generates cards directly from your own material - your lectures, your notes, your textbook. The cards are specific to what you're actually studying." },
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
            <span className="text-[11px] text-zinc-400 tracking-wide">Any PDF → full flashcard deck in 30 seconds</span>
          </motion.div>

          <div className="grid lg:grid-cols-[1fr_420px] gap-16 items-center">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
                style={{ fontFamily: "'DM Serif Display', serif" }}
                className="text-[2.8rem] md:text-[3.8rem] leading-[1.06] font-normal mb-6"
              >
                Convert PDFs into<br />
                <span className="italic text-[#b5ff4d]">Flashcards</span>
              </motion.h1>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                className="text-zinc-400 text-base max-w-lg leading-relaxed mb-8">
                Upload any lecture PDF, textbook chapter, or study guide. ForksAI uses AI to extract the key questions, definitions, and facts - and delivers a complete flashcard deck ready to study. No manual work. No copy-pasting.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}
                className="flex flex-wrap gap-3 mb-10">
                {["Upload any PDF", "AI extracts key questions", "Ready in 30 seconds", "Any subject or level"].map((t, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 text-xs text-zinc-400 px-3 py-1.5 rounded-full border border-white/8">
                    <Check size={11} className="text-[#b5ff4d]" />{t}
                  </span>
                ))}
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <button onClick={handleCTA}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#b5ff4d] text-black text-sm font-bold hover:bg-[#c8ff6e] transition-colors">
                  Convert your PDF now <ArrowRight size={15} />
                </button>
                <p className="text-[11px] text-zinc-700 mt-3">Free to start · No credit card needed</p>
              </motion.div>
            </div>

            {/* Upload flow mockup */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
              className="hidden lg:block">
              <div className="rounded-2xl border border-white/8 bg-white/2 p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(181,255,77,0.4), transparent)" }} />

                {/* Step 1: Upload */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                  className="mb-4 rounded-xl border-2 border-dashed border-white/10 p-6 flex flex-col items-center gap-2 text-center">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(181,255,77,0.08)" }}>
                    <Upload size={16} style={{ color: "#b5ff4d" }} />
                  </div>
                  <p className="text-xs font-semibold text-white">Biochemistry_Chapter7.pdf</p>
                  <p className="text-[10px] text-zinc-700">48 pages · 2.3 MB · Uploaded</p>
                  <div className="w-full h-1 rounded-full mt-1 overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ delay: 0.8, duration: 1.2 }}
                      className="h-full rounded-full" style={{ background: "#b5ff4d" }} />
                  </div>
                </motion.div>

                {/* Processing */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}
                  className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg" style={{ background: "rgba(181,255,77,0.05)", border: "1px solid rgba(181,255,77,0.1)" }}>
                  <Sparkles size={11} style={{ color: "#b5ff4d" }} />
                  <span className="text-[10px] text-zinc-500">AI reading document and extracting key concepts…</span>
                </motion.div>

                {/* Cards generated */}
                {[
                  { q: "What is glycolysis?", a: "10-step anaerobic process converting glucose to 2 pyruvate, yielding 2 ATP net" },
                  { q: "Define the Krebs cycle", a: "Mitochondrial cycle oxidising acetyl-CoA to CO₂ while generating NADH and FADH₂" },
                  { q: "What enzyme catalyses phosphofructokinase?", a: "PFK-1 - rate-limiting step of glycolysis, allosterically inhibited by ATP and citrate" },
                ].map((card, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2 + i * 0.25, duration: 0.35 }}
                    className="mb-2.5 rounded-xl border border-white/6 p-3.5">
                    <p className="text-[9px] uppercase tracking-widest mb-1" style={{ color: "#b5ff4d" }}>Q - {card.q}</p>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">{card.a}</p>
                  </motion.div>
                ))}

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.9 }}
                  className="text-center mt-2">
                  <span className="text-[10px] text-zinc-700">✓ 31 flashcards generated from your PDF</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="border-t border-white/5 py-24 px-6 md:px-12">
          <div className="max-w-6xl mx-auto">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-[11px] uppercase tracking-[0.2em] text-[#b5ff4d] mb-3">The process</motion.p>
            <motion.h2 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }}
              style={{ fontFamily: "'DM Serif Display', serif" }}
              className="text-[2rem] md:text-[2.6rem] font-normal mb-4">
              Three steps from PDF<br />to study-ready deck
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.14 }}
              className="text-zinc-500 text-sm max-w-2xl leading-relaxed mb-16">
              No formatting needed. No account setup. No manual card creation. Upload your lecture PDF and have a complete flashcard deck in the time it takes to make a cup of coffee.
            </motion.p>

            <div className="grid md:grid-cols-3 gap-6 relative">
              <div className="hidden md:block absolute top-10 left-[22%] right-[22%] h-px"
                style={{ background: "linear-gradient(90deg, rgba(181,255,77,0.15), rgba(181,255,77,0.5), rgba(181,255,77,0.15))" }} />

              {[
                { n: "01", icon: Upload, title: "Upload your PDF", desc: "Drag and drop any PDF lecture slides, textbook chapter, or study guide. Any length, any subject. No formatting required.", detail: "Works with scanned PDFs, lecture slide exports, research papers, and textbook chapters." },
                { n: "02", icon: Sparkles, title: "AI extracts key knowledge", desc: "ForksAI reads your entire document. It identifies key facts, definitions, mechanisms, and concepts - not generic summaries, but specific content from your material.", detail: "The AI prioritises testable content: definitions, processes, comparisons, and factual questions that appear on exams." },
                { n: "03", icon: Target, title: "Study your instant deck", desc: "Your flashcard deck is ready. Review and edit cards if needed, then start studying. Flip mode, quiz mode, and progress tracking all built in.", detail: "Weak cards resurface automatically. Your study time goes to where you actually need it." },
              ].map((step, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.14 }}
                  className="rounded-2xl border border-white/6 p-8 relative hover:border-[#b5ff4d]/20 transition-colors">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(181,255,77,0.1)", border: "1px solid rgba(181,255,77,0.2)" }}>
                      <step.icon size={16} style={{ color: "#b5ff4d" }} />
                    </div>
                    <span className="text-[11px] font-mono text-zinc-700">{step.n}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed mb-4">{step.desc}</p>
                  <p className="text-[11px] text-zinc-700 italic leading-relaxed">{step.detail}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* USE CASES */}
        <section className="border-t border-white/5 py-24 px-6 md:px-12">
          <div className="max-w-6xl mx-auto">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-[11px] uppercase tracking-[0.2em] text-[#b5ff4d] mb-3">Who uses it</motion.p>
            <motion.h2 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }}
              style={{ fontFamily: "'DM Serif Display', serif" }}
              className="text-[2rem] md:text-[2.6rem] font-normal mb-16">
              Built for every subject,<br />every level of study
            </motion.h2>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                { subject: "Medicine & Pharmacy", desc: "Upload pharmacology PDFs and get mechanism-of-action, indication, and contraindication flashcards. Perfect for USMLE, MRCPs, and pharmacy board prep.", icon: "🩺" },
                { subject: "Law", desc: "Convert case law PDFs and statute notes into principle-and-application flashcard pairs. Structured the way law exams test.", icon: "⚖️" },
                { subject: "Engineering & Sciences", desc: "Upload lecture notes on circuits, thermodynamics, biochemistry, or organic chemistry. ForksAI handles equations, definitions, and process steps.", icon: "⚗️" },
                { subject: "Humanities & Social Sciences", desc: "History, economics, psychology, philosophy - concepts, theories, key thinkers, and dates all get converted into revision-ready cards.", icon: "📚" },
              ].map((item, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="rounded-2xl border border-white/6 p-7 flex gap-5">
                  <span className="text-3xl shrink-0 mt-1">{item.icon}</span>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-2">{item.subject}</h3>
                    <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SCREENSHOT */}
        <section className="border-t border-white/5 py-24 px-6 md:px-12">
          <div className="max-w-6xl mx-auto">
            <motion.h2 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              style={{ fontFamily: "'DM Serif Display', serif" }}
              className="text-[2rem] md:text-[2.6rem] font-normal mb-10">
              See the flashcards it generates
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
                    <span className="text-[11px] text-zinc-600">forksai.app/flashcards</span>
                  </div>
                </div>
              </div>
              <Image src="/AIflashcard.png" alt="ForksAI PDF to Flashcards converter" width={3180} height={1810} className="w-full h-auto object-cover object-top" style={{ maxHeight: "500px" }} />
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
                Upload a PDF.<br /><span className="italic text-[#b5ff4d]">Get a full deck in 30 seconds.</span>
              </motion.h2>
              <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.12 }}
                className="text-zinc-500 text-sm max-w-md mx-auto mb-10 leading-relaxed">
                No setup. No manual card creation. Just upload your PDF and start studying.
              </motion.p>
              <button onClick={handleCTA}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#b5ff4d] text-black text-sm font-bold hover:bg-[#c8ff6e] transition-colors">
                Convert your PDF free <ChevronRight size={15} />
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
                { title: "AI Flashcard Generator", desc: "Generate flashcards from any notes or PDF.", href: "/ai-flashcards", tag: "Flashcards" },
                { title: "AI Summarizer", desc: "Summarize any PDF or lecture in seconds.", href: "/ai-summarizer", tag: "Summarizer" },
                { title: "AI Study Tools", desc: "The complete toolkit for smarter studying.", href: "/ai-study-tools", tag: "All tools" },
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
