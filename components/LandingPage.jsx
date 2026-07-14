"use client";

import { goToDashboard } from "@/lib/goToDashboard";

import { useState, useEffect } from "react";
import Image from "next/image";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import AuthModal from "@/components/AuthModal";
import {
  Zap, FileText, Headphones, BookOpen, Users, Brain,
  Map, ChevronDown, Check, ArrowRight, Clock,
} from "lucide-react";

/* ─── Data ──────────────────────────────────────────────────── */
const FAQS = [
  { q: "How does FORKSAI generate flashcards?", a: "You upload any PDF, paste notes, or type a topic. Our AI reads the content, identifies key concepts, and produces a complete, ready-to-study deck in under 30 seconds. No manual card creation needed." },
  { q: "What study modes are included?", a: "9 modes in total: Flashcard Flip, Write Mode, Quiz, Spaced Repetition (FSRS-5), Weak Spot Trainer, Memory Sprint, Exam Simulator, Explain Back, and Pomodoro Mode. Every mode is designed around proven learning science." },
  { q: "Can I study with other people?", a: "Yes. Study Rooms let you create a session, share a 6-character code, and study any deck live with up to 5 classmates. Host-paced or Race mode. Your choice." },
  { q: "What's the difference between Free and Premium?", a: "Free gives you 30 AI generations per month plus access to all 9 study modes and Study Rooms. Premium removes every limit: unlimited generations, full PDF support, Podcast Mode, Medical Encyclopedia, Mind Maps, and Case Study Mode." },
  { q: "Does it work for medical students?", a: "Absolutely. The Medical Encyclopedia gives instant AI summaries for any medical term. Combined with spaced repetition and the Weak Spot Trainer, it's become a go-to tool for pre-med and nursing students." },
  { q: "Is my data private?", a: "Yes. Your uploaded content is processed to generate your flashcards and is not shared, sold, or used to train any AI model. You can delete your account and all data at any time from Settings." },
];

const FEATURES = [
  { icon: Zap,   title: "AI Flashcards in 30 seconds", desc: "Upload any PDF or paste notes. FORKSAI reads your material and produces a complete, high-quality deck instantly." },
  { icon: Users, title: "Live Study Rooms",             desc: "Study any deck in real time with classmates. Race mode, live chat, and a shared leaderboard keep the energy up." },
  { icon: Brain, title: "9 Built-in Study Modes",       desc: "From classic flip to FSRS-5 spaced repetition, exam simulation, and explain-back. Every mode built on learning science." },
];

const STEPS = [
  { num: "01", title: "Upload your material", desc: "Drop in any PDF, paste notes, or type a topic. Supports lecture slides, textbooks, and hand-written summaries." },
  { num: "02", title: "AI builds your deck",  desc: "The model reads your content, identifies key concepts, and produces a complete flashcard set ready in under 30 seconds." },
  { num: "03", title: "Study your way",       desc: "Pick from 9 study modes. Study alone or spin up a live Study Room and race your classmates through the deck." },
];

const WHY = [
  { icon: FileText,   title: "PDF to Flashcards",    desc: "Any length PDF converted to a structured deck in seconds.", badge: true },
  { icon: Headphones, title: "Podcast Mode",          desc: "Turn your notes into an AI study podcast you can listen on the go.", badge: true },
  { icon: Map,        title: "Interactive Mind Maps", desc: "Visualize how concepts connect across your entire deck.", badge: false },
  { icon: BookOpen,   title: "Medical Encyclopedia",  desc: "Instant AI summaries for every medical term. Built for pre-med students.", badge: true },
];

const COMPARE = [
  { feat: "AI generates cards from your notes",  vals: [true,  false, false, false, false] },
  { feat: "Reads and understands your PDFs",     vals: [true,  false, false, false, false] },
  { feat: "9 built-in study modes",              vals: [true,  false, true,  false, false] },
  { feat: "Ready in under 30 seconds",           vals: [true,  false, false, false, false] },
  { feat: "Real-time multiplayer study rooms",   vals: [true,  false, false, false, false] },
  { feat: "Progress tracking and streaks",       vals: [true,  false, true,  false, false] },
  { feat: "No card creation required",           vals: [true,  false, false, false, false] },
  { feat: "Exam-quality quiz questions",         vals: [true,  false, false, false, true ] },
];

const BLOGS = [
  { title: "Active recall: the study technique that actually works",   desc: "Testing yourself is the single most effective study method science has found.", link: "/blog/active-recall",    cat: "Study Science", time: "5 min", catColor: "#7c3aed" },
  { title: "How to prepare for any exam in 2 weeks",                   desc: "A realistic week-by-week plan built around spaced repetition, not wishful thinking.",  link: "/blog/exam-prep",        cat: "Exam Tips",     time: "6 min", catColor: "#ea580c" },
  { title: "Why traditional flashcards are slowing you down",          desc: "Making cards by hand steals hours from actually studying them. A better approach exists.", link: "/blog/flashcards",       cat: "AI Tools",      time: "4 min", catColor: "#0891b2" },
  { title: "Spaced repetition: the secret to passing heavy exams",     desc: "Cramming doesn't work for long-term memory. Let's look at the forgetting curve.", link: "/blog/spaced-repetition", cat: "Memory",        time: "7 min", catColor: "#dc2626" },
];

const FREE_FEATURES = [
  "30 AI flashcard generations / month",
  "All 9 study modes",
  "Live Study Rooms (up to 5 people)",
  "Public Decks library",
  "Progress tracking and streaks",
];

const PREMIUM_FEATURES = [
  "Unlimited AI flashcard generations",
  "Full PDF support (any length)",
  "Podcast Mode",
  "Medical Encyclopedia",
  "Interactive Mind Maps",
  "Case Study Mode",
  "Priority AI processing",
  "Early access to new features",
];

const IMPORT_APPS = [
  { name: "Notion",  bg: "#000000", label: "N" },
  { name: "Quizlet", bg: "#4257FF", label: "Q" },
  { name: "Anki",    bg: "#0478CB", label: "A" },
  { name: "Word",    bg: "#2B5796", label: "W" },
  { name: "ChatGPT", bg: "#10a37f", label: "✦" },
];

/* ─── FAQ item ──────────────────────────────────────────────── */
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-2 border-black rounded-xl bg-white overflow-hidden cursor-pointer" onClick={() => setOpen(o => !o)}>
      <div className="flex items-center justify-between px-6 py-4 gap-4">
        <span className="font-bold text-[#111] text-[15px] leading-snug">{q}</span>
        <ChevronDown size={18} className="shrink-0 text-[#111] transition-transform duration-200" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }} />
      </div>
      {open && <div className="px-6 pb-5 text-[#555] text-sm leading-relaxed border-t-2 border-black pt-4">{a}</div>}
    </div>
  );
}

/* ─── Main ──────────────────────────────────────────────────── */
export default function LandingPage() {
  const [cycle, setCycle] = useState("monthly");
  const [showAuth, setShowAuth] = useState(false);
  const [showEarnPrompt, setShowEarnPrompt] = useState(false);

  useEffect(() => {
    // The dashboard (dashboard.forksai.app) is a separate origin, so Firebase
    // Auth sessions are separate too. Logging out there redirects here with
    // ?loggedOut=1 (see Sidebar.jsx confirmLogout) so this origin's stale
    // session gets cleared as well - otherwise the onAuthStateChanged handler
    // below would see the still-valid user and immediately bridge them right
    // back into the dashboard they just logged out of.
    const params = new URLSearchParams(window.location.search);
    const justLoggedOut = params.get("loggedOut") === "1";

    if (justLoggedOut) {
      window.history.replaceState({}, "", window.location.pathname);
      signOut(auth).catch((err) => console.error("Post-logout sign-out failed", err));
      return;
    }

    const unsub = onAuthStateChanged(auth, (user) => {
      // Cross-zone hard navigation: /dashboard is served by the existing
      // Vite app via the multi-zone fallback rewrite, not this Next.js app.
      if (user) goToDashboard();
    });
    return unsub;
  }, []);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  useEffect(() => {
    const move = (e) => {
      mouseX.set(e.clientX / window.innerWidth - 0.5);
      mouseY.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);
  const lx1 = useTransform(mouseX, v => v * -22); const ly1 = useTransform(mouseY, v => v * -22);
  const lx2 = useTransform(mouseX, v => v * -12); const ly2 = useTransform(mouseY, v => v * -12);
  const lx3 = useTransform(mouseX, v => v * -30); const ly3 = useTransform(mouseY, v => v * -30);
  const lx4 = useTransform(mouseX, v => v * -16); const ly4 = useTransform(mouseY, v => v * -16);
  const lx5 = useTransform(mouseX, v => v * -20); const ly5 = useTransform(mouseY, v => v * -20);
  const lx6 = useTransform(mouseX, v => v * -10); const ly6 = useTransform(mouseY, v => v * -10);
  const rx1 = useTransform(mouseX, v => v * 18);  const ry1 = useTransform(mouseY, v => v * 18);
  const rx2 = useTransform(mouseX, v => v * 28);  const ry2 = useTransform(mouseY, v => v * 28);
  const rx3 = useTransform(mouseX, v => v * 12);  const ry3 = useTransform(mouseY, v => v * 12);
  const rx4 = useTransform(mouseX, v => v * 24);  const ry4 = useTransform(mouseY, v => v * 24);
  const rx5 = useTransform(mouseX, v => v * 20);  const ry5 = useTransform(mouseY, v => v * 20);
  const rx6 = useTransform(mouseX, v => v * 15);  const ry6 = useTransform(mouseY, v => v * 15);

  const isPinkDay = false;
  const ACCENT     = isPinkDay ? '#FF6EB4' : '#F0D44A';
  const FEATURE_BG = isPinkDay ? '#D81B60' : '#5CB85C';
  const PAGE_BG    = isPinkDay ? '#FFF0F5' : '#EEEEE8';

  const [showPinkPopup, setShowPinkPopup] = useState(() => {
    if (!isPinkDay) return false;
    if (typeof localStorage === "undefined") return false;
    return localStorage.getItem('forks_pink_day_v1') !== '2026-05-18';
  });
  const [pinkCodeCopied, setPinkCodeCopied] = useState(false);
  const dismissPinkPopup = () => {
    localStorage.setItem('forks_pink_day_v1', '2026-05-18');
    setShowPinkPopup(false);
  };
  const copyPinkCode = () => {
    navigator.clipboard.writeText('FORKSAI10').then(() => {
      setPinkCodeCopied(true);
      setTimeout(() => setPinkCodeCopied(false), 2000);
    });
  };

  // Signup no longer opens the in-page AuthModal - it sends the visitor
  // straight to dashboard.forksai.app. goToDashboard() already handles the
  // "not signed in yet" case with a plain redirect (no bridge token needed),
  // and the dashboard's own ProtectedRoute now shows onboarding in place for
  // anyone who lands there with no session, ending in a Google sign-in step
  // right before their first deck gets created - so auth happens as late as
  // possible instead of gating every onboarding question behind it up front.
  // Login is unchanged: a returning user with an existing account still gets
  // the fast in-page AuthModal + bridge handoff, skipping onboarding entirely.
  const goSignup = () => goToDashboard();
  const goLogin  = () => setShowAuth(true);
  const dismissEarnPrompt = () => {
    localStorage.setItem("forksai_earn_prompt_v1", "1");
    setShowEarnPrompt(false);
  };

  const tools = ["FORKSAI", "Anki", "Quizlet", "Notion", "ChatGPT"];

  return (
    <div className="min-h-screen font-sans" style={{ background: PAGE_BG, color: "#111111" }}>

      {/* Auth modal */}
      {showAuth && (
        <AuthModal
          auth={auth}
          onClose={() => setShowAuth(false)}
          onSuccess={() => {
            setShowAuth(false);
            goToDashboard();
          }}
        />
      )}

      {/* Earn while you study prompt */}
      <AnimatePresence>
        {showEarnPrompt && (
          <motion.div
            className="fixed inset-0 z-60 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ background: "rgba(0,0,0,0.5)" }}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0_#111] max-w-lg w-full p-7"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="inline-flex items-center gap-2 border-2 border-black rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#111] bg-yellow">
                    Earn with FORKSAI
                  </div>
                  <h3 className="font-serif font-black text-2xl text-[#111] mt-4">
                    Earn while you study?
                  </h3>
                    <p className="text-[#555] text-sm mt-3 leading-relaxed">
                      <strong className="text-black block mb-1">📢 We are now collaborating with students & influencers!</strong>
                      If you want to join our family and help others discover FORKSAI, apply to our programs below and start earning today.
                  </p>
                </div>
                <button
                  onClick={dismissEarnPrompt}
                  className="border-2 border-black rounded-xl px-3 py-1 text-xs font-bold text-[#111] bg-white shadow-[2px_2px_0_#111]"
                >
                  Not now
                </button>
              </div>

              <div className="grid gap-3">
                <button
                  className="w-full flex items-center justify-between gap-3 border-2 border-black rounded-xl px-4 py-3 bg-green shadow-[3px_3px_0_#111] text-white font-bold text-sm transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5"
                  onClick={() => {
                    dismissEarnPrompt();
                    window.location.href = '/apply';
                  }}
                >
                  <span>Student Ambassador Program</span>
                  <ArrowRight size={16} />
                </button>
                <button
                  className="w-full flex items-center justify-between gap-3 border-2 border-black rounded-xl px-4 py-3 bg-yellow shadow-[3px_3px_0_#111] text-[#111] font-bold text-sm transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5"
                  onClick={() => {
                    dismissEarnPrompt();
                    window.location.href = '/apply';
                  }}
                >
                  <span>Affiliate Program</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PINK DAY POPUP ─────────────────────────────────── */}
      <AnimatePresence>
        {showPinkPopup && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-9999 flex items-center justify-center px-4"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 12 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0_#111] max-w-md w-full overflow-hidden"
            >
              {/* Pink banner */}
              <div className="flex items-center justify-center py-5 px-6" style={{ background: '#FF6EB4' }}>
                <span className="text-4xl">🌸</span>
              </div>

              <div className="p-7">
                <div className="inline-flex items-center gap-2 border-2 border-black rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#111] mb-4" style={{ background: '#FFD6EB' }}>
                  Limited time · Today only
                </div>
                <h3 className="font-serif font-black text-2xl text-[#111] mb-3 leading-tight">
                  It's Pink Day at FORKSAI! 🎀
                </h3>
                <p className="text-[#555] text-sm leading-relaxed mb-2">
                  We're celebrating with a special one-day discount. Get <strong className="text-[#111]">10% off Premium</strong> today. Copy your code and use it at checkout:
                </p>
                <button
                  onClick={copyPinkCode}
                  className="w-full flex items-center justify-between border-2 border-black rounded-xl px-5 py-3 my-4 transition-all hover:shadow-[2px_2px_0_#111] active:translate-x-0.5 active:translate-y-0.5"
                  style={{ background: '#FFF0F5' }}
                >
                  <span className="font-mono font-black text-xl text-[#111] tracking-widest">FORKSAI10</span>
                  <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border-2 border-black" style={{ background: pinkCodeCopied ? '#FF6EB4' : 'white', color: '#111' }}>
                    {pinkCodeCopied ? '✓ Copied!' : '📋 Copy'}
                  </span>
                </button>
                <p className="text-[11px] text-[#777] text-center mb-1">Valid on <strong>monthly & yearly</strong> plans only</p>
                <p className="text-[10px] text-[#999] text-center mb-5">Offer expires at midnight · Not combinable with other codes</p>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => { dismissPinkPopup(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }}
                    className="w-full font-bold text-sm border-2 border-black rounded-xl py-3.5 text-[#111] shadow-[3px_3px_0_#111] transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5"
                    style={{ background: '#FF6EB4' }}
                  >
                    Claim 10% Off 🌸
                  </button>
                  <button
                    onClick={dismissPinkPopup}
                    className="text-xs font-bold text-[#999] hover:text-[#111] transition-colors py-1"
                  >
                    Maybe later
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <nav className="border-b-2 border-black bg-white sticky top-0 z-50">
        <div className="w-full px-4 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 shrink-0">
            <img src="/forks-logo.png" alt="FORKSAI" className="h-7 w-auto" />
            <span className="font-serif font-black text-xl text-[#111] tracking-tight">FORKSAI</span>
          </a>

          <div className="flex items-center gap-2 sm:gap-3">
            <a href="#pricing" className="hidden sm:block text-sm font-bold text-[#111] border-2 border-black rounded-xl px-4 py-2 bg-white shadow-[3px_3px_0_#111] transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5">
              Pricing
            </a>
            <button onClick={goLogin} className="text-sm font-bold text-[#111] border-2 border-black rounded-xl px-4 py-2 bg-white shadow-[3px_3px_0_#111] transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5">
              Sign In
            </button>
            <button onClick={goSignup} className="text-sm font-bold text-[#111] border-2 border-black rounded-xl px-3 sm:px-4 py-2 shadow-[3px_3px_0_#111] transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5" style={{ background: ACCENT }}>
              Start for Free
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative pt-24 pb-20 text-center">

        {/* Floating left - 6 cards, each wrapper div gives a static horizontal offset */}
        <div className="absolute left-8 top-20 hidden xl:flex flex-col gap-4 pointer-events-none select-none" style={{ zIndex: 2 }}>

          {/* 1 - Flashcard card · no offset */}
          <div>
            <motion.div style={{ x: lx1, y: ly1 }}>
              <div className="bg-white border-2 border-black rounded-xl shadow-[3px_3px_0_#111] p-3 w-36 text-left" style={{ transform: "rotate(-4deg)" }}>
                <div className="text-[8px] font-bold text-[#555] uppercase tracking-widest mb-1.5">Flashcard</div>
                <div className="text-[10px] font-bold text-[#111] leading-tight mb-2">What is the powerhouse of the cell?</div>
                <div className="h-px bg-black/10 mb-1.5" />
                <div className="text-[9px] text-[#aaa] italic">Tap to reveal</div>
              </div>
            </motion.div>
          </div>

          {/* 2 - Active recall pill · push 40 px toward center */}
          <div style={{ marginLeft: 40 }}>
            <motion.div style={{ x: lx2, y: ly2 }}>
              <div className="flex items-center gap-2 bg-white border-2 border-black rounded-full px-3 py-1.5 shadow-[2px_2px_0_#111]" style={{ transform: "rotate(2deg)" }}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: FEATURE_BG }}>
                  <Brain size={11} className="text-white" strokeWidth={2.5} />
                </span>
                <span className="text-[10px] font-bold text-[#111]">Active recall</span>
              </div>
            </motion.div>
          </div>

          {/* 3 - Last quiz · slight push */}
          <div style={{ marginLeft: 10 }}>
            <motion.div style={{ x: lx3, y: ly3 }}>
              <div className="bg-white border-2 border-black rounded-xl shadow-[3px_3px_0_#111] px-4 py-3" style={{ transform: "rotate(3deg)" }}>
                <div className="text-[9px] font-bold text-[#555] uppercase tracking-widest mb-0.5">Last quiz</div>
                <div className="text-2xl font-black text-[#111] leading-none">94%</div>
              </div>
            </motion.div>
          </div>

          {/* 4 - PDF ready pill · biggest push */}
          <div style={{ marginLeft: 56 }}>
            <motion.div style={{ x: lx4, y: ly4 }}>
              <div className="flex items-center gap-2 bg-white border-2 border-black rounded-full px-3 py-1.5 shadow-[2px_2px_0_#111]" style={{ transform: "rotate(-2deg)" }}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: "#111" }}>
                  <FileText size={10} className="text-white" strokeWidth={2.5} />
                </span>
                <span className="text-[10px] font-bold text-[#111]">PDF ready</span>
              </div>
            </motion.div>
          </div>

          {/* 5 - Study room pill · medium push */}
          <div style={{ marginLeft: 24 }}>
            <motion.div style={{ x: lx5, y: ly5 }}>
              <div className="flex items-center gap-2 bg-white border-2 border-black rounded-full px-3 py-1.5 shadow-[2px_2px_0_#111]" style={{ transform: "rotate(1.5deg)" }}>
                <span className="relative flex w-5 h-5 rounded-full items-center justify-center shrink-0" style={{ background: FEATURE_BG }}>
                  <span className="absolute inline-flex h-full w-full rounded-full opacity-40 animate-ping" style={{ background: FEATURE_BG }} />
                  <Users size={10} className="text-white relative" strokeWidth={2.5} />
                </span>
                <span className="text-[10px] font-bold text-[#111]">4 studying live</span>
              </div>
            </motion.div>
          </div>

          {/* 6 - Weak spots card · far push */}
          <div style={{ marginLeft: 68 }}>
            <motion.div style={{ x: lx6, y: ly6 }}>
              <div className="bg-white border-2 border-black rounded-xl shadow-[3px_3px_0_#111] px-3 py-2.5 text-left" style={{ transform: "rotate(-3deg)" }}>
                <div className="text-[8px] font-bold text-[#555] uppercase tracking-widest mb-1">Weak spots</div>
                <div className="flex gap-1">
                  {["Krebs", "Meiosis", "Ohm's"].map(t => (
                    <span key={t} className="text-[7px] font-bold px-1.5 py-0.5 rounded-full border border-black/20 text-[#111]" style={{ background: "#FEF3C7" }}>{t}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Floating right - 6 cards, negative margins push items toward center */}
        <div className="absolute right-8 top-20 hidden xl:flex flex-col gap-4 items-end pointer-events-none select-none" style={{ zIndex: 2 }}>

          {/* 1 - 30 cards pill · no offset */}
          <div>
            <motion.div style={{ x: rx1, y: ry1 }}>
              <div className="flex items-center gap-2 bg-white border-2 border-black rounded-full px-3 py-1.5 shadow-[2px_2px_0_#111]" style={{ transform: "rotate(3deg)" }}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: ACCENT }}>
                  <Zap size={10} className="text-[#111]" strokeWidth={2.5} />
                </span>
                <span className="text-[10px] font-bold text-[#111]">30 cards in 8s</span>
              </div>
            </motion.div>
          </div>

          {/* 2 - Day streak · 40 px toward center */}
          <div style={{ marginRight: 40 }}>
            <motion.div style={{ x: rx2, y: ry2 }}>
              <div className="bg-white border-2 border-black rounded-xl shadow-[3px_3px_0_#111] px-4 py-3" style={{ transform: "rotate(-3deg)" }}>
                <div className="text-lg font-black text-[#111] leading-none">🔥 7</div>
                <div className="text-[9px] font-bold text-[#555] uppercase tracking-widest mt-1">Day streak</div>
              </div>
            </motion.div>
          </div>

          {/* 3 - Spaced rep card · slight push */}
          <div style={{ marginRight: 10 }}>
            <motion.div style={{ x: rx3, y: ry3 }}>
              <div className="bg-white border-2 border-black rounded-xl shadow-[3px_3px_0_#111] p-3 w-36 text-left" style={{ transform: "rotate(2deg)" }}>
                <div className="text-[8px] font-bold text-[#555] uppercase tracking-widest mb-1.5">Spaced rep</div>
                <div className="text-[10px] font-bold text-[#111] leading-tight mb-2">Mitochondria review</div>
                <span className="text-[8px] font-bold text-white px-1.5 py-0.5 rounded" style={{ background: FEATURE_BG }}>Due in 2d</span>
              </div>
            </motion.div>
          </div>

          {/* 4 - 1,326 cards · biggest push toward center */}
          <div style={{ marginRight: 56 }}>
            <motion.div style={{ x: rx4, y: ry4 }}>
              <div className="flex items-center gap-2 bg-white border-2 border-black rounded-full px-3 py-1.5 shadow-[2px_2px_0_#111]" style={{ transform: "rotate(-2deg)" }}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: "#7C3AED" }}>
                  <BookOpen size={10} className="text-white" strokeWidth={2.5} />
                </span>
                <span className="text-[10px] font-bold text-[#111]">1,326 cards</span>
              </div>
            </motion.div>
          </div>

          {/* 5 - Podcast pill · medium push */}
          <div style={{ marginRight: 24 }}>
            <motion.div style={{ x: rx5, y: ry5 }}>
              <div className="flex items-center gap-2 bg-white border-2 border-black rounded-full px-3 py-1.5 shadow-[2px_2px_0_#111]" style={{ transform: "rotate(1deg)" }}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: "#111" }}>
                  <Headphones size={10} className="text-white" strokeWidth={2.5} />
                </span>
                <span className="text-[10px] font-bold text-[#111]">Podcast ready</span>
              </div>
            </motion.div>
          </div>

          {/* 6 - Score trend card · far push */}
          <div style={{ marginRight: 68 }}>
            <motion.div style={{ x: rx6, y: ry6 }}>
              <div className="bg-white border-2 border-black rounded-xl shadow-[3px_3px_0_#111] px-3 py-2.5 text-left" style={{ transform: "rotate(-1.5deg)" }}>
                <div className="text-[8px] font-bold text-[#555] uppercase tracking-widest mb-1.5">Quiz progress</div>
                <div className="flex items-center gap-1">
                  {["72%", "85%", "94%"].map((v, i) => (
                    <span key={i} className="text-[9px] font-black text-[#111]">{v}{i < 2 && <span className="text-[#aaa] mx-0.5">›</span>}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Text */}
        <div className="max-w-4xl mx-auto px-6 flex flex-col items-center">
          <button
            onClick={() => setShowEarnPrompt(true)}
            className="flex items-center gap-2 border-2 border-black rounded-full px-4 py-1.5 mb-6 bg-white shadow-[2px_2px_0_#111] transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5"
          >
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-yellow border-2 border-black shrink-0">
              <span className="font-bold text-[10px] text-black">!</span>
            </span>
            <span className="text-xs font-bold text-[#111]">Calling all students & influencers! Work with us <span className="ml-1">→</span></span>
          </button>

          <h1 className="font-serif font-black text-5xl sm:text-6xl md:text-7xl leading-[1.08] text-[#111] mb-6">
            How do you want to{" "}
            <span
              className="italic"
              style={{
                textDecoration: "underline",
                textDecorationColor: ACCENT,
                textDecorationThickness: "5px",
                textUnderlineOffset: "5px",
              }}
            >
              study today?
            </span>
          </h1>

          <p className="text-[#555] text-lg sm:text-xl max-w-xl mx-auto leading-relaxed mb-10">
            Upload any PDF or notes. FORKSAI generates a complete flashcard deck in under 30 seconds. Study alone or race your classmates in live rooms.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={goSignup}
              className="w-full sm:w-auto font-bold text-base border-2 border-black rounded-xl px-8 py-3.5 text-white shadow-[4px_4px_0_#555] transition-all hover:shadow-[2px_2px_0_#555] hover:translate-x-0.5 hover:translate-y-0.5 flex items-center justify-center gap-2"
              style={{ background: "#111111" }}
            >
              Start for free <ArrowRight size={16} />
            </button>
            <span className="text-sm text-[#555] font-medium">No credit card required</span>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <div className="flex -space-x-2">
              {["#F87171","#60A5FA","#34D399","#FBBF24","#A78BFA"].map((color, i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black text-white" style={{ background: color }}>
                  {["A","J","M","S","R"][i]}
                </div>
              ))}
            </div>
            <div className="h-5 w-px bg-black/10" />
            <p className="text-sm font-semibold text-[#333]">
              Trusted by <span className="font-black text-[#111]">60,000+</span> students worldwide
            </p>
          </div>

          {/* Mobile apps coming soon */}
          <div className="flex flex-col items-center gap-3 mt-10">
            <span className="inline-flex items-center gap-2 border-2 border-black rounded-full px-3 py-1 bg-yellow shadow-[2px_2px_0_#111] text-[10px] font-black uppercase tracking-[0.18em] text-[#111]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#111] animate-pulse" />
              Coming soon to mobile
            </span>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex items-center gap-3 border-2 border-black rounded-xl px-4 py-2.5 bg-white shadow-[3px_3px_0_#111]" aria-label="FORKSAI coming soon on the App Store">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="#111" aria-hidden="true">
                  <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09l-.001-.001zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z" />
                </svg>
                <div className="text-left leading-none">
                  <div className="text-[9px] font-bold text-[#555] uppercase tracking-widest mb-0.5">Soon on the</div>
                  <div className="text-sm font-black text-[#111]">App Store</div>
                </div>
              </div>
              <div className="flex items-center gap-3 border-2 border-black rounded-xl px-4 py-2.5 bg-white shadow-[3px_3px_0_#111]" aria-label="FORKSAI coming soon on Google Play">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="#111" aria-hidden="true">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.39 12l2.308-2.49zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z" />
                </svg>
                <div className="text-left leading-none">
                  <div className="text-[9px] font-bold text-[#555] uppercase tracking-widest mb-0.5">Soon on</div>
                  <div className="text-sm font-black text-[#111]">Google Play</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Apps + arrow + dashboard */}
        <div className="max-w-6xl mx-auto px-6 mt-14">
          <div className="flex items-center gap-5">

            {/* Apps card */}
            <div className="hidden lg:block shrink-0 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0_#111] p-5">
              <p className="text-[9px] font-bold text-[#555] uppercase tracking-widest mb-4 text-left">Works with</p>
              <div className="flex flex-col gap-3">
                {IMPORT_APPS.map(({ name, bg, label }) => (
                  <div key={name} className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg border-2 border-black flex items-center justify-center font-black text-xs text-white shrink-0" style={{ background: bg }}>
                      {label}
                    </div>
                    <span className="text-xs font-bold text-[#111]">{name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Curved arrow */}
            <div className="hidden lg:block shrink-0">
              <svg width="90" height="60" viewBox="0 0 90 60" fill="none">
                <path d="M5,35 C25,10 58,12 80,28" stroke={ACCENT} strokeWidth="3.5" strokeLinecap="round" />
                <path d="M68,18 L82,27 L72,36" stroke={ACCENT} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Dashboard */}
            <div className="flex-1 border-2 border-black rounded-xl overflow-hidden shadow-[6px_6px_0_#111] bg-white">
              <div className="border-b-2 border-black px-4 py-3 flex items-center justify-center" style={{ background: "#f0f0ea" }}>
                <span className="text-xs font-mono font-bold text-[#555]">forksai.app/dashboard</span>
              </div>
              <img src="/dashboardpreview.png" alt="FORKSAI Dashboard" className="w-full h-auto block"
                onError={e => { e.currentTarget.src = "/dashboard.png"; }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURE CARDS ROW ──────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <div key={i} className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0_#111] p-6">
              <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-5" style={{ background: FEATURE_BG }}>
                <Icon size={20} className="text-white" strokeWidth={2.5} />
              </div>
              <h3 className="font-bold text-[#111] text-base mb-2 leading-snug">{title}</h3>
              <p className="text-[#555] text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────── */}
      <section className="bg-white border-y-2 border-black py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-block border-2 border-black rounded-full px-4 py-1 text-xs font-bold text-[#111] mb-5">How it works</div>
            <h2 className="font-serif font-black text-4xl sm:text-5xl text-[#111] leading-tight">
              From upload to mastery<br />in three steps
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {STEPS.map(({ num, title, desc }, i) => (
              <div key={i} className="border-2 border-black rounded-xl shadow-[4px_4px_0_#111] p-6 relative" style={{ background: PAGE_BG }}>
                <span className="absolute top-4 right-4 font-mono font-bold text-xs border-2 border-black rounded px-2 py-0.5 text-[#111]" style={{ background: ACCENT }}>{num}</span>
                <h3 className="font-bold text-[#111] text-base mb-2 mt-1 pr-14 leading-snug">{title}</h3>
                <p className="text-[#555] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY BENTO ──────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <div className="inline-block border-2 border-black rounded-full px-4 py-1 text-xs font-bold text-[#111] mb-5">Why FORKSAI</div>
          <h2 className="font-serif font-black text-4xl sm:text-5xl text-[#111] leading-tight">
            Every tool you need,<br />nothing you don't
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Hero card - PDF to Flashcards */}
          <div className="lg:col-span-2 border-2 border-black rounded-xl shadow-[4px_4px_0_#111] p-8 relative flex flex-col justify-between min-h-60" style={{ background: ACCENT }}>
            <div>
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5" style={{ background: "#111" }}>
                <FileText size={26} strokeWidth={2} style={{ color: ACCENT }} />
              </div>
              <h3 className="font-serif font-black text-2xl text-[#111] mb-2">PDF to Flashcards</h3>
              <p className="text-[#333] text-sm leading-relaxed max-w-sm">Any length PDF converted to a structured, exam-ready deck in seconds. No manual card creation required.</p>
            </div>
            <div className="mt-6 text-[11px] font-black uppercase tracking-widest" style={{ color: "rgba(17,17,17,0.4)" }}>Most used feature</div>
          </div>

          {/* Podcast + Mind Maps stacked */}
          <div className="flex flex-col gap-5">
            <div className="border-2 border-black rounded-xl shadow-[4px_4px_0_#111] p-6 relative bg-white flex-1">
              <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-4" style={{ background: FEATURE_BG }}>
                <Headphones size={20} className="text-white" strokeWidth={2.5} />
              </div>
              <h3 className="font-bold text-[#111] text-sm mb-1.5 pr-14">Podcast Mode</h3>
              <p className="text-[#555] text-xs leading-relaxed">Turn your notes into an AI study podcast you can listen on the go.</p>
            </div>

            <div className="border-2 border-black rounded-xl shadow-[4px_4px_0_#111] p-6 bg-white flex-1">
              <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-4" style={{ background: FEATURE_BG }}>
                <Map size={20} className="text-white" strokeWidth={2.5} />
              </div>
              <h3 className="font-bold text-[#111] text-sm mb-1.5">Interactive Mind Maps</h3>
              <p className="text-[#555] text-xs leading-relaxed">Visualize how concepts connect across your entire deck.</p>
            </div>
          </div>

          {/* Full-width banner - Medical Encyclopedia */}
          <div className="lg:col-span-3 border-2 border-black rounded-xl shadow-[4px_4px_0_#111] p-6 bg-white flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0" style={{ background: FEATURE_BG }}>
              <BookOpen size={20} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-[#111] text-sm mb-1">Medical Encyclopedia</h3>
              <p className="text-[#555] text-xs leading-relaxed">Instant AI summaries for every medical term. Built for pre-med and nursing students who need definitions fast.</p>
            </div>
          </div>

        </div>
      </section>

      {/* ── STUDY ROOMS ────────────────────────────────────── */}
      <section className="bg-white border-y-2 border-black py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block border-2 border-black rounded-full px-4 py-1 text-xs font-bold text-[#111] mb-6">Live</div>
              <h2 className="font-serif font-black text-4xl sm:text-5xl text-[#111] leading-tight mb-5">
                Study with your<br />
                <span className="italic" style={{ borderBottom: `5px solid ${FEATURE_BG}`, paddingBottom: "2px" }}>classmates, live</span>
              </h2>
              <p className="text-[#555] text-base leading-relaxed mb-8">
                Create a room, share a 6-character code, and study any deck together in real time. Race Mode turns revision into a competition. Live chat keeps the energy up.
              </p>
              <div className="flex flex-col gap-3 mb-8">
                {[
                  { label: "Host-paced or Race mode", sub: "You control the pace, or let everyone race" },
                  { label: "Live chat and leaderboard", sub: "See exactly who is ahead in real time" },
                  { label: "Up to 5 participants",     sub: "Share a code, join instantly, no setup" },
                ].map(({ label, sub }, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 border-black" style={{ background: ACCENT }}>
                      <Check size={11} className="text-[#111]" strokeWidth={3} />
                    </span>
                    <div>
                      <div className="font-bold text-sm text-[#111]">{label}</div>
                      <div className="text-xs text-[#555] mt-0.5">{sub}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={goSignup} className="font-bold text-[#111] text-sm border-2 border-black rounded-xl px-6 py-3 shadow-[3px_3px_0_#111] transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5 flex items-center gap-2" style={{ background: ACCENT }}>
                Create a room <ArrowRight size={14} />
              </button>
            </div>
            <div className="border-2 border-black rounded-xl overflow-hidden shadow-[6px_6px_0_#111]">
              <div className="border-b-2 border-black px-4 py-2.5 flex items-center justify-center" style={{ background: "#f0f0ea" }}>
                <span className="text-xs font-mono font-bold text-[#555]">Study Room: Race Mode</span>
              </div>
              <Image src="/studyroom.png" alt="Study Room" width={2556} height={1666} className="w-full h-auto block" />
            </div>
          </div>
        </div>
      </section>

      {/* ── SPLIT CTA ──────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0_#111] p-8">
            <div className="inline-block border-2 border-black rounded-full px-4 py-1 text-xs font-bold text-[#111] mb-6">Why this works</div>
            <h3 className="font-serif font-black text-3xl text-[#111] leading-tight mb-4">
              Retrieval practice beats re-reading every time
            </h3>
            <p className="text-[#555] text-sm leading-relaxed mb-4">
              Decades of cognitive science confirm it: testing yourself forces your brain to retrieve information, which is how long-term memory actually forms. Re-reading feels productive but leaves almost nothing behind.
            </p>
            <p className="text-[#555] text-sm leading-relaxed">
              FORKSAI automates the hard part of active recall (building the cards) so you spend every minute actually studying instead of preparing to study.
            </p>
          </div>
          <div className="border-2 border-black rounded-xl shadow-[4px_4px_0_#555] p-8 flex flex-col justify-between" style={{ background: "#111111" }}>
            <div>
              <div className="inline-block border-2 border-purple-400 rounded-full px-4 py-1 text-xs font-bold text-purple-300 mb-6">Weekly updates shipping</div>
              <h3 className="font-serif font-black text-3xl text-white leading-tight mb-4">
                New study modes dropping every week
              </h3>
              <p className="text-white/60 text-sm leading-relaxed mb-8">
                Mind Maps, Podcast Mode, Study Rooms, Medical Encyclopedia. All shipped in the last 3 months. Join now and get every feature the moment it lands.
              </p>
            </div>
            <button onClick={goSignup} className="w-full font-bold text-[#111] text-sm border-2 border-black rounded-xl px-6 py-3.5 shadow-[3px_3px_0_#555] transition-all hover:shadow-[1px_1px_0_#555] hover:translate-x-0.5 hover:translate-y-0.5 flex items-center justify-center gap-2" style={{ background: ACCENT }}>
              Start for free <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ───────────────────────────────── */}
      <section className="bg-white border-y-2 border-black py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-block border-2 border-black rounded-full px-4 py-1 text-xs font-bold text-[#111] mb-5">How we compare</div>
            <h2 className="font-serif font-black text-4xl sm:text-5xl text-[#111] leading-tight">
              FORKSAI vs everything else
            </h2>
            <p className="text-[#555] text-base mt-4 max-w-lg mx-auto leading-relaxed">
              Most tools make you do the work. FORKSAI is the only one that reads your material and does it for you.
            </p>
          </div>
          <div className="border-2 border-black rounded-xl overflow-hidden shadow-[4px_4px_0_#111] overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: 600 }}>
              <thead>
                <tr className="border-b-2 border-black" style={{ background: PAGE_BG }}>
                  <th className="text-left px-5 py-4 text-xs font-bold text-[#555] uppercase tracking-widest">Feature</th>
                  {tools.map((t, i) => (
                    <th key={i} className="px-3 py-4 text-center">
                      {i === 0
                        ? <span className="text-xs font-black text-white px-3 py-1 rounded-full border-2 border-black" style={{ background: "#111" }}>FORKSAI</span>
                        : <span className="text-xs font-bold text-[#555]">{t}</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row, ri) => (
                  <tr key={ri} className="border-t-2 border-black/10">
                    <td className="px-5 py-3.5 text-sm font-medium text-[#111]">{row.feat}</td>
                    {row.vals.map((v, vi) => (
                      <td key={vi} className="px-3 py-3.5 text-center" style={{ background: vi === 0 ? "rgba(240,212,74,0.1)" : "transparent" }}>
                        {v
                          ? <span className="font-black text-base" style={{ color: FEATURE_BG }}>✓</span>
                          : <span className="text-sm font-bold text-black/20">✕</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── BLOG POSTS ─────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <div className="inline-block border-2 border-black rounded-full px-4 py-1 text-xs font-bold text-[#111] mb-4">From the blog</div>
            <h2 className="font-serif font-black text-4xl sm:text-5xl text-[#111] leading-tight">
              Study smarter,<br />read smarter
            </h2>
          </div>
          <a href="/blogs" className="font-bold text-sm text-[#111] border-2 border-black rounded-xl px-5 py-2.5 bg-white shadow-[3px_3px_0_#111] transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5 flex items-center gap-2 shrink-0">
            All posts <ArrowRight size={14} />
          </a>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {BLOGS.map(({ title, desc, link, cat, time, catColor }, i) => (
            <a key={i} href={link} className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0_#111] p-6 flex flex-col transition-all hover:shadow-[2px_2px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5 group" style={{ textDecoration: "none" }}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest border rounded-full px-3 py-1" style={{ borderColor: catColor, color: catColor, background: `${catColor}18` }}>{cat}</span>
                <span className="flex items-center gap-1 text-xs text-[#555] font-medium"><Clock size={11} />{time} read</span>
              </div>
              <h3 className="font-bold text-[#111] text-base leading-snug mb-3 group-hover:underline">{title}</h3>
              <p className="text-[#555] text-sm leading-relaxed flex-1">{desc}</p>
              <div className="mt-5 flex items-center gap-1 text-sm font-bold text-[#111]">
                Read more <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <section className="bg-white border-y-2 border-black py-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-block border-2 border-black rounded-full px-4 py-1 text-xs font-bold text-[#111] mb-5">FAQ</div>
            <h2 className="font-serif font-black text-4xl sm:text-5xl text-[#111] leading-tight">Questions, answered</h2>
          </div>
          <div className="flex flex-col gap-3">
            {FAQS.map((faq, i) => <FaqItem key={i} {...faq} />)}
          </div>
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────────── */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <div className="inline-block border-2 border-black rounded-full px-4 py-1 text-xs font-bold text-[#111] mb-5">Pricing</div>
          <h2 className="font-serif font-black text-4xl sm:text-5xl text-[#111] leading-tight mb-8">Simple, transparent pricing</h2>
          <div className="inline-flex items-center border-2 border-black rounded-xl bg-white shadow-[3px_3px_0_#111]">
            {[
              { val: "daily",   label: "Daily" },
              { val: "monthly", label: "Monthly" },
              { val: "yearly",  label: "Yearly", badge: "-67%" },
            ].map(({ val, label, badge }, i) => (
              <button
                key={val}
                onClick={() => setCycle(val)}
                className="relative px-5 py-2.5 text-sm font-bold transition-colors"
                style={{
                  background: cycle === val ? ACCENT : "white",
                  color: "#111",
                  borderRight: i < 2 ? "2px solid #111" : "none",
                  borderRadius: i === 0 ? "10px 0 0 10px" : i === 2 ? "0 10px 10px 0" : "0",
                }}
              >
                {label}
                {badge && (
                  <span className="absolute -top-3 -right-3 text-[8px] font-black text-white px-1.5 py-0.5 rounded-full border border-black" style={{ background: FEATURE_BG, zIndex: 1 }}>
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Left card — Free */}
          <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0_#111] p-8 flex flex-col">
            <div className="text-xs font-bold text-[#555] uppercase tracking-widest mb-3">Free</div>
            <div className="flex items-start leading-none mb-1">
              <span className="font-black text-2xl text-[#111] mt-1.5 mr-0.5">$</span>
              <span className="font-serif font-black text-5xl text-[#111]">0</span>
            </div>
            <div className="text-sm text-[#555] mb-6">/ forever</div>
            <div className="flex flex-col gap-2.5 mb-8">
              {["All 9 study modes", "Live Study Rooms (up to 5 people)", "Public Decks library", "Progress tracking and streaks"].map((f, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: FEATURE_BG }}>
                    <Check size={10} className="text-white" strokeWidth={3} />
                  </span>
                  <span className="text-sm text-[#111]">{f}</span>
                </div>
              ))}
            </div>
            <button onClick={goSignup} className="mt-auto w-full font-bold text-sm border-2 border-black rounded-xl py-3.5 bg-white text-[#111] shadow-[3px_3px_0_#111] transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5">
              Get started free
            </button>
          </div>

          {/* Right card — Premium */}
          <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0_#111] p-8 flex flex-col relative">
            <span className="absolute -top-3 -right-3 text-white text-[10px] font-black px-3 py-1 rounded border-2 border-black z-10" style={{ background: FEATURE_BG }}>
              MOST POPULAR
            </span>
            <div className="text-xs font-bold text-[#555] uppercase tracking-widest mb-3">
              {cycle === "daily" ? "Day Pass" : cycle === "monthly" ? "Premium" : "Premium Yearly"}
            </div>
            {isPinkDay && cycle !== "daily" && (
              <div className="inline-flex items-center gap-2 border border-black rounded-full px-2.5 py-1 text-[10px] font-black mb-2" style={{ background: '#FF6EB4', color: '#111' }}>
                🌸 10% off today · use FORKSAI10
              </div>
            )}
            <div className="flex items-start leading-none mb-1">
              {isPinkDay && cycle !== "daily" && (
                <span className="font-black text-xl text-[#aaa] mt-2 mr-1.5 line-through">
                  ${cycle === "monthly" ? "7.99" : "23.99"}
                </span>
              )}
              <span className="font-black text-2xl text-[#111] mt-1.5 mr-0.5">$</span>
              <span className="font-serif font-black text-5xl text-[#111]">
                {cycle === "daily" ? "1.99"
                  : cycle === "monthly" ? (isPinkDay ? "7.19" : "7.99")
                  : (isPinkDay ? "21.59" : "23.99")}
              </span>
            </div>
            <div className="text-sm text-[#555] mb-4">
              {cycle === "daily" ? "/ day · full access for 24h" : cycle === "monthly" ? "/ month, cancel anytime" : "/ year, cancel anytime"}
            </div>
            <div className="text-[11px] font-bold text-[#555] mb-3">Everything in Free, plus:</div>
            <div className="flex flex-col gap-2.5 mb-8">
              {[
                cycle === "daily" ? "1 AI flashcard generation" : "100 AI flashcard generations / month",
                "AI Podcasts",
                "Medical Encyclopedia access",
                "Full PDF support (any length)",
                "Early access to new features",
                "Priority support",
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: FEATURE_BG }}>
                    <Check size={10} className="text-white" strokeWidth={3} />
                  </span>
                  <span className="text-sm text-[#111]">{f}</span>
                </div>
              ))}
            </div>
            <button onClick={goSignup} className="mt-auto w-full font-bold text-sm border-2 border-black rounded-xl py-3.5 text-white shadow-[3px_3px_0_#555] transition-all hover:shadow-[1px_1px_0_#555] hover:translate-x-0.5 hover:translate-y-0.5" style={{ background: "#111111" }}>
              {cycle === "daily" ? "Get Day Pass" : "Get Premium"}
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="border-t-2 border-black text-white" style={{ background: "#111111" }}>
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
            <div className="lg:col-span-2">
              <div className="font-serif font-black text-xl text-white mb-3">FORKSAI</div>
              <p className="text-white/40 text-sm leading-relaxed max-w-xs">The AI study platform that turns your material into mastery. Built for students who want results, not just revision.</p>
            </div>
            <div>
              <div className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">Product</div>
              {["Dashboard", "AI Flashcards", "Study Modes", "Study Rooms", "Public Decks"].map(l => (
                <a key={l} href="/dashboard" className="block text-sm text-white/40 hover:text-white transition-colors mb-2 no-underline">{l}</a>
              ))}
            </div>
            <div>
              <div className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">Resources</div>
              {[["Blog", "/blogs"], ["FAQ", "/faq"], ["Docs", "/docs"], ["AI Flashcards Guide", "/blog/flashcards"], ["Spaced Repetition", "/blog/spaced-repetition"]].map(([l, href]) => (
                <a key={l} href={href} className="block text-sm text-white/40 hover:text-white transition-colors mb-2 no-underline">{l}</a>
              ))}
            </div>
            <div>
              <div className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">Legal</div>
              {[["Privacy Policy", "/privacy-policy"], ["Terms of Service", "/terms"], ["Refund Policy", "/refund-policy"]].map(([l, href]) => (
                <a key={l} href={href} className="block text-sm text-white/40 hover:text-white transition-colors mb-2 no-underline">{l}</a>
              ))}
            </div>
          </div>
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-white/30 text-xs">2025 FORKSAI. All rights reserved.</span>
            <span className="text-white/30 text-xs">Made for students, by students.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
