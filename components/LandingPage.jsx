"use client";

import { goToDashboard } from "@/lib/goToDashboard";
import { trackSignupClick } from "@/lib/track";
import FooterFreeTools from "@/components/FooterFreeTools";

import { useState, useEffect, Fragment } from "react";
import Image from "next/image";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, FileText, Headphones, BookOpen, Users, Brain,
  Map, ChevronDown, Check, ArrowRight, Clock,
} from "lucide-react";

/* ─── Data ──────────────────────────────────────────────────── */
const FAQS = [
  { q: "How is FORKSAI different from Quizlet and Anki?", a: "FORKSAI generates flashcards automatically from your own notes or PDFs in under 30 seconds, while Quizlet and Anki require you to build every card by hand. It runs the same FSRS-5 spaced repetition algorithm as modern Anki, plus 12 built-in study modes and live Study Rooms out of the box." },
  { q: "How does FORKSAI generate flashcards?", a: "You upload any PDF, paste notes, or type a topic. Our AI reads the content, identifies key concepts, and produces a complete, ready-to-study deck in under 30 seconds. No manual card creation needed." },
  { q: "What study modes are included?", a: "12 modes in total: Flashcard Flip, Swipe Cards, MCQ Practice, Spaced Repetition (FSRS-5), Weak Spot Trainer, Memory Sprint, Exam Simulator, Explain Back, AI Tutor Revision, Interactive Mind Maps, Case Study Mode, and Pomodoro Mode. Every mode is designed around proven learning science." },
  { q: "Can I study with other people?", a: "Yes. Study Rooms let you create a session, share a 6-character code, and study any deck live with up to 5 classmates. Host-paced or Race mode. Your choice." },
  { q: "What's the difference between Free and Premium?", a: "Free gets you one AI-generated deck with no cap on how many cards it holds, plus unlimited manual decks, all 12 study modes, FSRS-5 spaced repetition and Study Rooms. The free deck is a one-time unlock, not a monthly allowance. Premium adds 100 AI flashcard generations a month on the monthly and yearly plans, full PDF support, Podcast Mode, Medical Encyclopedia, Mind Maps, and Case Study Mode." },
  { q: "Does it work for medical students?", a: "Absolutely. The Medical Encyclopedia gives instant AI summaries for any medical term. Combined with spaced repetition and the Weak Spot Trainer, it's become a go-to tool for pre-med and nursing students." },
  { q: "Is my data private?", a: "Yes. Your uploaded content is processed to generate your flashcards and is not shared, sold, or used to train any AI model. You can delete your account and all data at any time from Settings." },
];

const FEATURES = [
  { icon: Zap,   title: "AI Flashcards in 30 seconds", desc: "Upload any PDF or paste notes. FORKSAI reads your material and produces a complete, high-quality deck instantly." },
  { icon: Users, title: "Live Study Rooms",             desc: "Study any deck in real time with classmates. Race mode, live chat, and a shared leaderboard keep the energy up." },
  { icon: Brain, title: "12 Built-in Study Modes",       desc: "From classic flip to FSRS-5 spaced repetition, exam simulation, and explain-back. Every mode built on learning science." },
];

const STEPS = [
  { num: "01", title: "Upload your material", desc: "Drop in any PDF, paste notes, or type a topic. Supports lecture slides, textbooks, and hand-written summaries." },
  { num: "02", title: "AI builds your deck",  desc: "The model reads your content, identifies key concepts, and produces a complete flashcard set ready in under 30 seconds." },
  { num: "03", title: "Study your way",       desc: "Pick from 12 study modes. Study alone or spin up a live Study Room and race your classmates through the deck." },
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
  { feat: "12 built-in study modes",              vals: [true,  false, true,  false, false] },
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

/* ─── Marker highlight ──────────────────────────────────────── */
// The flat highlight block introduced in the H1, reused on one phrase per
// section heading. Repeating a single emphasis device is what turns a set of
// styled headings into a visual language: it replaces the italic-plus-underline
// accent that read as generic, and matches the flat, hard-edged system.
// `text` defaults to ink rather than inheriting: a mark placed inside
// light-on-dark copy would otherwise inherit white and land white-on-yellow,
// which is about 1.7:1 and unreadable. Pass text="#fff" only for a dark fill
// like the purple, where ink is the weaker pairing.
function Mark({ children, color, text = "#111" }) {
  return (
    <span
      className="inline-block px-2 -mx-0.5"
      style={{ background: color, color: text, boxShadow: `0 0 0 2px ${color}` }}
    >
      {children}
    </span>
  );
}

/* ─── Scroll reveal ─────────────────────────────────────────── */
function Reveal({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Hero live demo ────────────────────────────────────────── */
// Four real subjects with genuinely usable example cards. The visitor picks
// one and watches that deck build, so the first interaction on the page is
// with the product rather than with decoration. Cards are worked examples,
// not generated live: no unauthenticated model calls, no cost, no abuse
// surface, and nothing here claims to be the visitor's own material.
const DEMO_SUBJECTS = [
  {
    id: "bio",
    label: "Biology",
    file: "biochem-lecture-4.pdf",
    meta: "42 pages",
    read: "Reading 42 pages",
    count: 38,
    cards: [
      { q: "What is the rate-limiting enzyme of glycolysis?", a: "Phosphofructokinase-1" },
      { q: "Where does the Krebs cycle take place?", a: "The mitochondrial matrix" },
      { q: "Which stage yields the most ATP?", a: "Oxidative phosphorylation" },
    ],
  },
  {
    id: "med",
    label: "Medicine",
    file: "cardio-pharm-notes.pdf",
    meta: "27 pages",
    read: "Reading 27 pages",
    count: 31,
    cards: [
      { q: "First-line treatment for anaphylaxis?", a: "IM adrenaline, 0.5 mg of 1:1000" },
      { q: "Which electrolyte disturbance causes peaked T waves?", a: "Hyperkalaemia" },
      { q: "Mechanism of action of beta blockers?", a: "Competitive antagonism at beta-adrenoceptors" },
    ],
  },
  {
    id: "hist",
    label: "History",
    file: "cold-war-seminar.pdf",
    meta: "18 pages",
    read: "Reading 18 pages",
    count: 24,
    cards: [
      { q: "What did the Marshall Plan aim to achieve?", a: "Rebuild western European economies to resist Soviet influence" },
      { q: "Which crisis brought the superpowers closest to nuclear war?", a: "The Cuban Missile Crisis, 1962" },
      { q: "What was the Truman Doctrine?", a: "A pledge to contain Soviet expansion by supporting free peoples" },
    ],
  },
  {
    id: "law",
    label: "Law",
    file: "contract-law-week6.pdf",
    meta: "33 pages",
    read: "Reading 33 pages",
    count: 29,
    cards: [
      { q: "What are the three elements of a valid contract?", a: "Offer, acceptance, and consideration" },
      { q: "What did Carlill v Carbolic Smoke Ball establish?", a: "A unilateral offer to the world can form a binding contract" },
      { q: "What is promissory estoppel?", a: "A promise relied on can bind even without consideration" },
    ],
  },
];

const DEMO_STEPS = [
  { label: "Uploading", pct: 12, hold: 900 },
  { label: null, pct: 46, hold: 1200 },
  { label: "Writing your cards", pct: 81, hold: 1100 },
  { label: "Deck ready", pct: 100, hold: 4200 },
];

const MAX_OWN_CHARS = 6000;

// Cycled through the textarea placeholder so the field reads as something to
// use rather than an empty box. Real subjects, phrased the way a student
// would actually paste them.
const PLACEHOLDER_EXAMPLES = [
  "The Krebs cycle occurs in the mitochondrial matrix and produces NADH, FADH2 and GTP...",
  "First-line treatment for anaphylaxis is IM adrenaline, 0.5 mg of 1:1000...",
  "The Marshall Plan aimed to rebuild western European economies to resist Soviet influence...",
  "A valid contract requires three elements: offer, acceptance, and consideration...",
];

function HeroLiveDemo({ accent, featureBg, onGenerate }) {
  const [subjectIdx, setSubjectIdx] = useState(0);
  const [step, setStep] = useState(0);

  // "Your notes" is the default tab: it is the one panel that asks the visitor
  // to do something, and the samples are there as a fallback for people who
  // arrive with nothing to paste. The textarea captures intent and the button
  // hands off to the dashboard, so generation happens after signup rather than
  // anonymously on this page.
  const [own, setOwn] = useState(true);
  const [ownText, setOwnText] = useState("");
  const [typed, setTyped] = useState("");
  const [focused, setFocused] = useState(false);

  const subject = DEMO_SUBJECTS[subjectIdx];

  useEffect(() => {
    // The sample animation only runs while a sample is actually on screen.
    if (own) return;
    const t = setTimeout(() => setStep((s) => (s + 1) % DEMO_STEPS.length), DEMO_STEPS[step].hold);
    return () => clearTimeout(t);
  }, [step, own]);

  const pick = (i) => {
    setOwn(false);
    if (i === subjectIdx) return;
    setSubjectIdx(i);
    setStep(0); // rebuild from the top so the choice visibly does something
  };

  // A blank box invites nothing, so the placeholder types itself out and cycles
  // through real examples. It only runs while the field is empty, unfocused and
  // on screen, and it stops entirely for anyone who prefers reduced motion.
  useEffect(() => {
    if (!own || focused || ownText) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTyped(PLACEHOLDER_EXAMPLES[0]);
      return;
    }

    let cancelled = false;
    let timer;
    let phrase = 0;
    let i = 0;
    let erasing = false;

    const tick = () => {
      if (cancelled) return;
      const full = PLACEHOLDER_EXAMPLES[phrase];
      if (!erasing) {
        i += 1;
        setTyped(full.slice(0, i));
        if (i >= full.length) {
          erasing = true;
          timer = setTimeout(tick, 2600); // hold the finished sentence
          return;
        }
      } else {
        i -= 8;
        if (i <= 0) {
          i = 0;
          erasing = false;
          phrase = (phrase + 1) % PLACEHOLDER_EXAMPLES.length;
        }
        setTyped(PLACEHOLDER_EXAMPLES[phrase].slice(0, Math.max(i, 0)));
      }
      timer = setTimeout(tick, erasing ? 18 : 34);
    };

    timer = setTimeout(tick, 500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [own, focused, ownText]);

  const done = step === DEMO_STEPS.length - 1;
  const { pct } = DEMO_STEPS[step];
  const label = DEMO_STEPS[step].label ?? subject.read;

  return (
    <div className="bg-white border-2 border-black rounded-xl shadow-[6px_6px_0_#111] overflow-hidden text-left">
      {/* Subject picker - the interactive bit. Real buttons, keyboard
          reachable, and each one visibly rebuilds the deck below. */}
      {/* No "Try" eyebrow here: with the "Your notes" chip added, five items
          plus a label overflow the card and clip the first subject. */}
      <div className="flex items-center gap-1.5 px-3 py-2.5 border-b-2 border-black overflow-x-auto" style={{ background: "#f0f0ea" }}>
        {DEMO_SUBJECTS.map((s, i) => {
          const active = !own && i === subjectIdx;
          return (
            <button
              key={s.id}
              onClick={() => pick(i)}
              aria-pressed={active}
              className="text-[10px] font-black rounded-full px-2.5 py-1 border-2 border-black shrink-0 transition-all"
              style={{
                background: active ? accent : "#fff",
                color: "#111",
                boxShadow: active ? "1px 1px 0 #111" : "none",
              }}
            >
              {s.label}
            </button>
          );
        })}
        <button
          onClick={() => setOwn(true)}
          aria-pressed={own}
          className="text-[10px] font-black rounded-full px-2.5 py-1 border-2 border-black shrink-0 transition-all whitespace-nowrap"
          style={{
            background: own ? featureBg : "#fff",
            color: own ? "#fff" : "#111",
            boxShadow: own ? "1px 1px 0 #111" : "none",
          }}
        >
          Your notes
        </button>
      </div>

      {own ? (
        <div className="p-5">
          <label htmlFor="hero-own-notes" className="block text-[11px] font-black uppercase tracking-widest text-[#777] mb-2">
            Paste your notes
          </label>
          <textarea
            id="hero-own-notes"
            value={ownText}
            onChange={(e) => setOwnText(e.target.value.slice(0, MAX_OWN_CHARS))}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            rows={6}
            placeholder={focused ? "Paste your notes here." : typed}
            className="w-full text-[12px] leading-relaxed rounded-lg border-2 border-black p-3 resize-none focus:outline-none focus:shadow-[2px_2px_0_#111] transition-shadow"
            style={{ background: "#fdfdfa" }}
          />
          <div className="flex items-center justify-end mt-1.5 mb-3">
            <span className="text-[10px] font-mono text-[#999]">
              {ownText.length}/{MAX_OWN_CHARS}
            </span>
          </div>

          <button
            onClick={onGenerate}
            className="w-full font-black text-sm border-2 border-black rounded-xl py-3.5 text-white shadow-[3px_3px_0_#111] transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5 flex items-center justify-center gap-2"
            style={{ background: "#111" }}
          >
            Generate flashcards <Zap size={15} strokeWidth={2.75} style={{ color: accent }} />
          </button>
          <p className="text-[10px] text-[#999] text-center mt-2.5">
            Free forever plan. No credit card required.
          </p>
        </div>
      ) : (
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-9 h-9 rounded-lg border-2 border-black flex items-center justify-center shrink-0" style={{ background: accent }}>
            <FileText size={16} className="text-[#111]" strokeWidth={2.5} />
          </span>
          <div className="min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.18 }}
              >
                <div className="text-[13px] font-bold text-[#111] truncate">{subject.file}</div>
                <div className="text-[10px] font-medium text-[#888]">{subject.meta}</div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="h-2.5 rounded-full border-2 border-black overflow-hidden mb-2.5" style={{ background: "#f0f0ea" }}>
          <motion.div
            className="h-full"
            style={{ background: done ? featureBg : accent }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          />
        </div>

        <div className="flex items-center justify-between mb-4 h-4">
          <AnimatePresence mode="wait">
            <motion.span
              key={`${subject.id}-${step}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="text-[11px] font-bold text-[#555] flex items-center gap-1.5"
            >
              {done && <Check size={12} strokeWidth={3} style={{ color: featureBg }} />}
              {label}
            </motion.span>
          </AnimatePresence>
          <span className="text-[11px] font-black text-[#111] font-mono">{pct}%</span>
        </div>

        <div className="flex flex-col gap-2">
          {subject.cards.map(({ q, a }, i) => (
            <motion.div
              key={`${subject.id}-${i}`}
              initial={{ opacity: 0.22, y: 6 }}
              animate={done ? { opacity: 1, y: 0 } : { opacity: 0.22, y: 6 }}
              transition={{ duration: 0.3, delay: done ? i * 0.12 : 0 }}
              className="rounded-lg bg-white px-3 py-2.5"
              style={{
                borderLeft: `3px solid ${[featureBg, "#7C3AED", accent][i]}`,
                boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.05)",
              }}
            >
              <div className="text-[11px] font-bold text-[#111] leading-snug">{q}</div>
              <div className="text-[10px] text-[#888] mt-0.5">{a}</div>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-black/10 flex items-center justify-between mb-3.5">
          <span className="text-[11px] font-bold text-[#555]">{subject.count} cards · 12 study modes</span>
          <span className="text-[11px] font-black" style={{ color: done ? featureBg : "#bbb" }}>
            {done ? "Ready to study" : "Working..."}
          </span>
        </div>

        {/* The sample view used to end here, with no way out. Anyone who
            browsed a deck hit a dead end and had to look elsewhere on the page
            for a CTA, so the most engaged visitors got the weakest path. */}
        <button
          onClick={onGenerate}
          className="w-full font-black text-sm border-2 border-black rounded-xl py-3.5 text-white shadow-[3px_3px_0_#111] transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5 flex items-center justify-center gap-2"
          style={{ background: "#111" }}
        >
          Study this deck free <ArrowRight size={15} strokeWidth={2.75} style={{ color: accent }} />
        </button>
      </div>
      )}
    </div>
  );
}

/* ─── Main ──────────────────────────────────────────────────── */
export default function LandingPage() {
  const [cycle, setCycle] = useState("monthly");
  const [showEarnPrompt, setShowEarnPrompt] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  // The mouse-parallax motion values that used to live here drove the twelve
  // decorative cards in the hero margins. Those are gone with the hero rewrite,
  // so the mousemove listener they needed is gone too rather than firing on
  // every pointer move for nothing.

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

  // Neither Signup nor Login opens an in-page modal anymore - both just
  // send the visitor straight to dashboard.forksai.app. goToDashboard()
  // already handles the "not signed in yet" case with a plain redirect (no
  // bridge token needed): an already-authenticated returning user lands on
  // an already-authenticated dashboard immediately, and a brand-new visitor
  // gets the dashboard's own onboarding-in-place flow (ProtectedRoute),
  // ending in a Google sign-in step right before their first deck gets
  // created - so auth happens as late as possible either way, instead of
  // gating it behind a popup on this page.
  // `location` identifies which CTA was clicked so the analytics events can be
  // broken down per placement. Tracking is best-effort and never blocks the
  // redirect - see lib/track.js.
  const goSignup = (location) => {
    trackSignupClick(location, "signup");
    goToDashboard();
  };
  const goLogin = (location) => {
    trackSignupClick(location, "login");
    goToDashboard();
  };
  const dismissEarnPrompt = () => {
    localStorage.setItem("forksai_earn_prompt_v1", "1");
    setShowEarnPrompt(false);
  };

  const tools = ["FORKSAI", "Anki", "Quizlet", "Notion", "ChatGPT"];

  return (
    /* pb-20 on mobile keeps the fixed bottom CTA bar from covering the footer. */
    <div className="min-h-screen font-sans pb-20 sm:pb-0" style={{ background: PAGE_BG, color: "#111111" }}>

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
                <a
                  href="/apply/ambassadors"
                  className="w-full flex items-center justify-between gap-3 border-2 border-black rounded-xl px-4 py-3 bg-green shadow-[3px_3px_0_#111] text-white font-bold text-sm transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5 no-underline"
                  onClick={dismissEarnPrompt}
                >
                  <span>Student Ambassador Program</span>
                  <ArrowRight size={16} />
                </a>
                <a
                  href="/apply/creators"
                  className="w-full flex items-center justify-between gap-3 border-2 border-black rounded-xl px-4 py-3 bg-yellow shadow-[3px_3px_0_#111] text-[#111] font-bold text-sm transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5 no-underline"
                  onClick={dismissEarnPrompt}
                >
                  <span>Affiliate Program</span>
                  <ArrowRight size={16} />
                </a>
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
      <nav className="sticky top-4 z-50 px-4">
        <div
          className="mx-auto bg-white border-black border-2 flex items-center justify-between transition-all duration-300 ease-out"
          style={{
            maxWidth: navScrolled ? "72rem" : "84rem",
            borderRadius: navScrolled ? 16 : 20,
            boxShadow: navScrolled ? "3px 3px 0 #111" : "4px 4px 0 #111",
            height: navScrolled ? 60 : 76,
            paddingLeft: navScrolled ? 16 : 28,
            paddingRight: navScrolled ? 16 : 28,
          }}
        >
          <a href="/" className="flex items-center gap-2 shrink-0">
            <img src="/forks-logo.png" alt="FORKSAI" className="h-7 w-auto" />
            {/* Wordmark is hidden on the narrowest phones so the two CTAs keep
                their full labels on one line instead of wrapping. */}
            <span className="hidden sm:inline font-serif font-black text-xl text-[#111] tracking-tight">FORKSAI</span>
          </a>

          <div className="flex items-center gap-2 sm:gap-3">
            <a href="/tools" className="hidden md:block text-sm font-bold text-[#111] border-2 border-black rounded-xl px-4 py-2 bg-white shadow-[3px_3px_0_#111] transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5">
              Free tools
            </a>
            <a href="#pricing" className="hidden sm:block text-sm font-bold text-[#111] border-2 border-black rounded-xl px-4 py-2 bg-white shadow-[3px_3px_0_#111] transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5">
              Pricing
            </a>
            <button onClick={() => goLogin("nav")} className="whitespace-nowrap text-sm font-bold text-[#111] border-2 border-black rounded-xl px-4 py-2 bg-white shadow-[3px_3px_0_#111] transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5">
              Sign In
            </button>
            <button onClick={() => goSignup("nav")} className="whitespace-nowrap text-sm font-bold text-[#111] border-2 border-black rounded-xl px-3 sm:px-4 py-2 shadow-[3px_3px_0_#111] transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5" style={{ background: ACCENT }}>
              Start for Free
            </button>
          </div>
        </div>
      </nav>

      {/* ── STICKY MOBILE CTA ──────────────────────────────── */}
      <AnimatePresence>
        {navScrolled && (
          <motion.div
            initial={{ y: 90 }}
            animate={{ y: 0 }}
            exit={{ y: 90 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="fixed bottom-0 inset-x-0 z-50 sm:hidden border-t-2 border-black bg-white px-4 py-3 flex items-center gap-3"
          >
            <div className="leading-tight min-w-0">
              <div className="text-[13px] font-black text-[#111]">Start for free</div>
              <div className="text-[10px] font-semibold text-[#777]">No credit card required</div>
            </div>
            <button
              onClick={() => goSignup("sticky_mobile")}
              className="ml-auto shrink-0 font-black text-sm border-2 border-black rounded-xl px-5 py-2.5 text-[#111] shadow-[3px_3px_0_#111] transition-all active:shadow-[1px_1px_0_#111] active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-2"
              style={{ background: ACCENT }}
            >
              Get started <ArrowRight size={15} strokeWidth={2.75} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO ───────────────────────────────────────────── */}
      {/* Asymmetric split rather than the previous centered stack. The old hero
          ran ~1.5 viewports tall, put every piece of proof below the ask, and
          set two product visuals (the demo card and a dashboard screenshot)
          competing for the same attention. Here the left column carries the
          argument and the right column carries the one thing no competitor
          offers: a generator the visitor can actually use before signing up. */}
      <section className="relative pt-14 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-[1.02fr_0.98fr] gap-10 lg:gap-12 items-center">

            {/* ── Left: the argument ── */}
            <div className="text-center lg:text-left">
              <motion.a
                href="#study-rooms"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="inline-flex items-center gap-2.5 border-2 border-black rounded-full pl-1.5 pr-4 py-1.5 mb-6 bg-white shadow-[2px_2px_0_#111] no-underline transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5"
              >
                <span className="text-[10px] font-black uppercase tracking-widest text-white px-2.5 py-1 rounded-full shrink-0" style={{ background: FEATURE_BG }}>
                  New
                </span>
                <span className="text-xs font-bold text-[#111]">Study Rooms: revise live with classmates</span>
                <ArrowRight size={13} strokeWidth={2.75} className="text-[#111]" />
              </motion.a>

              {/* The Quizlet/Anki string stays inside the h1 so the keyword
                  intent survives, but it is no longer the largest text on the
                  page: it describes a category rather than making a promise,
                  and it made the first nouns a visitor read be the competitors.
                  To revert, swap the two lines back. */}
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="font-serif font-black text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.04] text-[#111] mb-4"
              >
                A flashcard deck in{" "}
                {/* Marker-block highlight rather than the italic-plus-underline
                    word accent, which is the other half of the generic AI
                    display look and reads as decoration rather than emphasis.
                    A flat block matches the hard-edged, flat-colour system. */}
                <span
                  className="inline-block px-2 -mx-0.5"
                  style={{ background: ACCENT, boxShadow: `0 0 0 2px ${ACCENT}` }}
                >
                  30 seconds
                </span>
                , not an evening of typing.
                <span className="block font-sans font-bold text-sm sm:text-base tracking-tight text-[#777] mt-4">
                  The best alternative to Quizlet and Anki
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
                className="text-[#444] text-base sm:text-lg leading-relaxed mb-7 lg:max-w-lg mx-auto lg:mx-0"
              >
                Drop in a PDF, paste your notes, or just name a topic. FORKSAI writes the
                cards and FSRS-5 spaced repetition decides when you see each one again.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-3"
              >
                <button
                  onClick={() => goSignup("hero")}
                  className="w-full sm:w-auto font-black text-lg border-2 border-black rounded-2xl px-9 py-4 text-[#111] shadow-[5px_5px_0_#111] transition-all hover:shadow-[2px_2px_0_#111] hover:translate-x-1 hover:translate-y-1 flex items-center justify-center gap-2.5"
                  style={{ background: ACCENT }}
                >
                  Start for free <ArrowRight size={19} strokeWidth={2.75} />
                </button>
                {/* Demoted from a bordered button to a text link. Two filled
                    buttons of near-equal weight side by side read as a choice
                    rather than a hierarchy, and split the attention the primary
                    action should own. */}
                <a
                  href="#how-it-works"
                  className="font-bold text-base text-[#555] hover:text-[#111] transition-colors no-underline flex items-center gap-1.5 group px-2 py-2"
                >
                  See how it works
                  <ArrowRight size={16} strokeWidth={2.75} className="group-hover:translate-x-1 transition-transform" />
                </a>
              </motion.div>

              <div className="flex flex-wrap items-center lg:justify-start justify-center gap-x-5 gap-y-2 mt-6">
                {["Free forever plan", "No credit card", "Ready in 30 seconds"].map(t => (
                  <span key={t} className="flex items-center gap-1.5 text-[13px] font-semibold text-[#555]">
                    <Check size={14} strokeWidth={3} style={{ color: FEATURE_BG }} />
                    {t}
                  </span>
                ))}
              </div>

              {/* Institution names only. The 100,000+ and 1,500+ figures used
                  to sit here too, but the stats band one scroll below now states
                  both at display size, and saying a number twice that close
                  together weakens it rather than reinforcing it. */}
              <p className="text-[13px] text-[#888] font-medium mt-7 leading-relaxed">
                Trusted by students at UCL, Harvard, Stanford and Johns Hopkins.
              </p>
            </div>

            {/* ── Right: the thing no competitor lets you do before signing up ── */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-md mx-auto lg:mx-0 lg:justify-self-end"
            >
              {/* goSignup routes through goToDashboard(), which mints the
                  Firebase auth-bridge token before sending the visitor to
                  dashboard.forksai.app, so a returning user lands signed in. */}
              <HeroLiveDemo accent={ACCENT} featureBg={FEATURE_BG} onGenerate={() => goSignup("hero_widget")} />
              <p className="text-[11px] text-[#999] text-center mt-3 font-medium">
                Paste your own notes, or browse a sample deck.
              </p>
            </motion.div>
          </div>

          {/* Works with strip. The app-store "coming soon" badges that used to
              sit here advertised an absence at the point of highest intent;
              they now live in the footer. */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 mt-10 pt-8 border-t border-black/10">
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#888]">Works with</span>
            {IMPORT_APPS.map(({ name, bg, label }) => (
              <span key={name} className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg border-2 border-black flex items-center justify-center font-black text-[11px] text-white shrink-0" style={{ background: bg }}>
                  {label}
                </span>
                <span className="text-xs font-bold text-[#111]">{name}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURE CARDS ROW ──────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => {
            const badgeBg = [ACCENT, "#111", FEATURE_BG][i % 3];
            const iconColor = badgeBg === "#111" ? ACCENT : badgeBg === ACCENT ? "#111" : "#fff";
            const tapeBg = [FEATURE_BG, ACCENT, "#7C3AED"][i % 3];
            const cardTilt = [-2, 1.5, -1][i % 3];
            const tapeTilt = [-6, 7, -5][i % 3];
            return (
              <Reveal key={i} delay={i * 0.09}>
              <div
                className="relative bg-[#fffdf3] border border-black/10 rounded-sm shadow-[0_6px_14px_rgba(0,0,0,0.18)] p-6 pt-8 transition-transform hover:-translate-y-1 h-full"
                style={{ transform: `rotate(${cardTilt}deg)` }}
              >
                <span
                  className="absolute -top-2.5 left-8 w-12 h-5 rounded-[1px] opacity-90"
                  style={{ background: tapeBg, transform: `rotate(${tapeTilt}deg)`, boxShadow: "0 1px 2px rgba(0,0,0,0.25)" }}
                />
                <div
                  className="w-12 h-12 rounded-lg border-2 border-black flex items-center justify-center mb-5"
                  style={{ background: badgeBg }}
                >
                  <Icon size={21} color={iconColor} strokeWidth={2.5} />
                </div>
                <h3 className="font-bold text-[#111] text-base mb-2 leading-snug">{title}</h3>
                <p className="text-[#555] text-sm leading-relaxed">{desc}</p>
              </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Breaks the page's two-tone, one-composition rhythm without reaching
          for the four-up stat grid, which is the single most templated section
          in this category: big numerals, tiny tracked labels, one colour each.
          A single statement in poster type does the same structural job and
          says something a real person would say. One accent, not four. */}
      <section className="border-y-2 border-black" style={{ background: "#111" }}>
        <div className="max-w-5xl mx-auto px-6 py-20 sm:py-24">
          <Reveal>
            <p className="font-serif font-black text-white text-3xl sm:text-5xl lg:text-[3.6rem] leading-[1.08] tracking-tight">
              You didn&rsquo;t enrol to spend your evenings{" "}
              <Mark color={ACCENT}>typing out index cards.</Mark>
            </p>
            <p className="text-white/45 text-base sm:text-lg leading-relaxed mt-8 max-w-xl">
              So don&rsquo;t. Hand over the material, keep the studying, and let the
              scheduling algorithm remember what you are due to review.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────── */}
      <section id="how-it-works" className="bg-white border-b-2 border-black py-20 scroll-mt-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-2 mb-5">
              <span className="w-6 h-0.75 rounded-full" style={{ background: ACCENT }} />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#111]">How it works</span>
            </div>
            <h2 className="font-serif font-black text-4xl sm:text-5xl text-[#111] leading-tight">
              Free flashcard generator<br />in <Mark color={ACCENT}>three simple steps</Mark>
            </h2>
          </div>
          <div className="flex flex-col md:flex-row items-stretch gap-6 md:gap-3">
            {STEPS.map(({ num, title, desc }, i) => (
              <Fragment key={i}>
                <Reveal delay={i * 0.12} className="flex-1 text-center md:text-left">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-mono font-black text-sm mb-4 mx-auto md:mx-0" style={{ background: ACCENT, color: "#111" }}>
                    {num}
                  </div>
                  <h3 className="font-bold text-[#111] text-base mb-2 leading-snug">{title}</h3>
                  <p className="text-[#555] text-sm leading-relaxed">{desc}</p>
                </Reveal>
                {i < STEPS.length - 1 && (
                  <div className="flex items-center justify-center shrink-0">
                    <ArrowRight size={24} className="hidden md:block" style={{ color: ACCENT }} strokeWidth={2.5} />
                    <ArrowRight size={20} className="block md:hidden" style={{ color: ACCENT, transform: "rotate(90deg)" }} strokeWidth={2.5} />
                  </div>
                )}
              </Fragment>
            ))}
          </div>

          {/* The dashboard screenshot moved here from the hero, where it was a
              second product visual competing with the generator widget. It
              belongs with step three: this is what "study your way" looks like. */}
          <Reveal>
            <div className="mt-14 border-2 border-black rounded-xl overflow-hidden shadow-[6px_6px_0_#111] bg-white">
              <div className="border-b-2 border-black px-4 py-3 flex items-center justify-center" style={{ background: "#f0f0ea" }}>
                <span className="text-xs font-mono font-bold text-[#555]">forksai.app/dashboard</span>
              </div>
              <Image
                src="/dashboardpreview.png"
                alt="FORKSAI dashboard showing decks, study streak and cards due for review"
                width={3200}
                height={1822}
                sizes="(max-width: 1024px) 100vw, 1100px"
                className="w-full h-auto block"
              />
            </div>
          </Reveal>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-14">
            <button
              onClick={() => goSignup("how_it_works")}
              className="w-full sm:w-auto font-black text-base border-2 border-black rounded-xl px-8 py-3.5 text-[#111] shadow-[4px_4px_0_#111] transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-1 hover:translate-y-1 flex items-center justify-center gap-2"
              style={{ background: ACCENT }}
            >
              Build my first deck <ArrowRight size={16} strokeWidth={2.75} />
            </button>
            <span className="text-sm text-[#555] font-medium">Takes about 30 seconds. No card needed.</span>
          </div>
        </div>
      </section>

      {/* ── WHY BENTO ──────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-2 mb-5">
            <span className="w-6 h-0.75 rounded-full" style={{ background: FEATURE_BG }} />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#111]">Why FORKSAI</span>
          </div>
          <h2 className="font-serif font-black text-4xl sm:text-5xl text-[#111] leading-tight">
            The only <Mark color={FEATURE_BG}>free</Mark> study tool<br />you'll ever need
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
              <h3 className="font-bold text-[#111] text-sm mb-1">How to study anatomy and medical terms fast</h3>
              <p className="text-[#555] text-xs leading-relaxed">The Medical Encyclopedia gives instant AI summaries for every medical term. Built for pre-med and nursing students who need definitions fast.</p>
            </div>
          </div>

        </div>
      </section>

      {/* ── STUDY ROOMS ────────────────────────────────────── */}
      <section id="study-rooms" className="bg-white border-y-2 border-black py-20 scroll-mt-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="w-6 h-0.75 rounded-full" style={{ background: "#7C3AED" }} />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-[#111]">Live</span>
              </div>
              <h2 className="font-serif font-black text-4xl sm:text-5xl text-[#111] leading-tight mb-5">
                Flashcards you can study<br />
                <Mark color={FEATURE_BG}>live, with friends</Mark>
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
              <button onClick={() => goSignup("study_rooms")} className="font-bold text-[#111] text-sm border-2 border-black rounded-xl px-6 py-3 shadow-[3px_3px_0_#111] transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5 flex items-center gap-2" style={{ background: ACCENT }}>
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
          {/* Was a flat wall of body copy in a plain white box, the least
              looked-at composition on the page. A pull-quote treatment gives
              the science claim a shape worth stopping on, and the accent rule
              plus oversized quote mark reuse the type system rather than adding
              a new device. */}
          <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0_#111] p-8 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-6 h-0.75 rounded-full" style={{ background: ACCENT }} />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#111]">Why this works</span>
            </div>

            <div
              className="font-serif font-black leading-none select-none mb-1"
              style={{ color: ACCENT, fontSize: "3.5rem" }}
              aria-hidden="true"
            >
              &ldquo;
            </div>
            <h3 className="font-serif font-black text-3xl sm:text-[2.1rem] text-[#111] leading-[1.12] mb-6">
              Testing yourself beats re-reading. <Mark color={ACCENT}>Every time.</Mark>
            </h3>

            <div className="pl-4 border-l-2 mt-auto" style={{ borderColor: ACCENT }}>
              <p className="text-[#555] text-sm leading-relaxed mb-3">
                Decades of cognitive science agree: retrieval forces your brain to
                reconstruct information, and that is how long-term memory forms.
                Re-reading feels productive and leaves almost nothing behind.
              </p>
              <p className="text-[#555] text-sm leading-relaxed">
                FORKSAI automates the hard part of active recall, building the cards,
                so every minute goes on studying instead of preparing to study.
              </p>
            </div>
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
            <button onClick={() => goSignup("weekly_updates")} className="w-full font-bold text-[#111] text-sm border-2 border-black rounded-xl px-6 py-3.5 shadow-[3px_3px_0_#555] transition-all hover:shadow-[1px_1px_0_#555] hover:translate-x-0.5 hover:translate-y-0.5 flex items-center justify-center gap-2" style={{ background: ACCENT }}>
              Start for free <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ───────────────────────────────── */}
      <section className="bg-white border-y-2 border-black py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-2 mb-5">
              <span className="w-6 h-0.75 rounded-full" style={{ background: FEATURE_BG }} />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#111]">How we compare</span>
            </div>
            <h2 className="font-serif font-black text-4xl sm:text-5xl text-[#111] leading-tight">
              Flashcards: <Mark color={ACCENT}>FORKSAI</Mark> vs Quizlet vs Anki
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
                      <td key={vi} className="px-3 py-3.5" style={{ background: vi === 0 ? "rgba(240,212,74,0.22)" : "transparent" }}>
                        <span className="flex items-center justify-center">
                          {v ? (
                            <span
                              className="w-6 h-6 rounded-full flex items-center justify-center border-2 border-black"
                              style={{ background: vi === 0 ? FEATURE_BG : "transparent" }}
                            >
                              <Check size={13} strokeWidth={3.5} style={{ color: vi === 0 ? "#fff" : FEATURE_BG }} />
                            </span>
                          ) : (
                            /* A muted dash reads as "not offered" far more clearly
                               than the near-invisible ✕ this used to render. */
                            <span className="block w-3.5 h-0.5 rounded-full bg-black/25" />
                          )}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
            <button
              onClick={() => goSignup("comparison")}
              className="w-full sm:w-auto font-black text-base border-2 border-black rounded-xl px-8 py-3.5 text-[#111] shadow-[4px_4px_0_#111] transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-1 hover:translate-y-1 flex items-center justify-center gap-2"
              style={{ background: ACCENT }}
            >
              Switch to FORKSAI free <ArrowRight size={16} strokeWidth={2.75} />
            </button>
            <span className="text-sm text-[#555] font-medium">Free forever plan. No credit card required.</span>
          </div>

          {/* The comparison pages hang off this section rather than off the
              footer alone: a reader who just read a comparison table is the
              one most likely to want the long version. */}
          <p className="text-center text-sm text-[#555] mt-8 leading-relaxed">
            Comparing something else?{" "}
            <a href="/remnote-alternative" className="font-bold text-[#111] underline underline-offset-2">RemNote alternative</a>,{" "}
            <a href="/forksai-vs-remnote" className="font-bold text-[#111] underline underline-offset-2">FORKSAI vs RemNote</a>,{" "}
            <a href="/forksai-vs-notion" className="font-bold text-[#111] underline underline-offset-2">FORKSAI vs Notion</a>, or{" "}
            <a href="/flashcards-and-notes-app" className="font-bold text-[#111] underline underline-offset-2">flashcards and notes in one app</a>.
          </p>
        </div>
      </section>

      {/* ── BLOG POSTS ─────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-0.75 rounded-full" style={{ background: "#7C3AED" }} />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#111]">From the blog</span>
            </div>
            <h2 className="font-serif font-black text-4xl sm:text-5xl text-[#111] leading-tight">
              How to study <Mark color="#7C3AED" text="#fff">like a topper</Mark><br />and get better marks
            </h2>
          </div>
          <a href="/blogs" className="font-bold text-sm text-[#111] border-2 border-black rounded-xl px-5 py-2.5 bg-white shadow-[3px_3px_0_#111] transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5 flex items-center gap-2 shrink-0">
            All posts <ArrowRight size={14} />
          </a>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {BLOGS.map(({ title, desc, link, cat, time, catColor }, i) => (
            <Reveal key={i} delay={(i % 2) * 0.1} className="flex">
            <a href={link} className="w-full bg-white border-2 border-black rounded-xl shadow-[4px_4px_0_#111] p-6 flex flex-col transition-all hover:shadow-[2px_2px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5 group" style={{ textDecoration: "none" }}>
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
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <section className="bg-white border-y-2 border-black py-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-2 mb-5">
              <span className="w-6 h-0.75 rounded-full" style={{ background: ACCENT }} />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#111]">FAQ</span>
            </div>
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
          <div className="flex items-center justify-center gap-2 mb-5">
            <span className="w-6 h-0.75 rounded-full" style={{ background: FEATURE_BG }} />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#111]">Pricing</span>
          </div>
          <h2 className="font-serif font-black text-4xl sm:text-5xl text-[#111] leading-tight mb-8">Simple, transparent pricing</h2>
          <div className="inline-flex items-center border-2 border-black rounded-xl bg-white shadow-[3px_3px_0_#111]">
            {[
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
                  borderRight: i < 1 ? "2px solid #111" : "none",
                  borderRadius: i === 0 ? "10px 0 0 10px" : "0 10px 10px 0",
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
              {["1 AI-generated deck, no card limit", "Unlimited manual decks and folders", "All 12 study modes", "Live Study Rooms (up to 5 people)", "Public Decks library", "Progress tracking and streaks"].map((f, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: FEATURE_BG }}>
                    <Check size={10} className="text-white" strokeWidth={3} />
                  </span>
                  <span className="text-sm text-[#111]">{f}</span>
                </div>
              ))}
            </div>
            <button onClick={() => goSignup("pricing_free")} className="mt-auto w-full font-black text-sm border-2 border-black rounded-xl py-3.5 text-[#111] shadow-[3px_3px_0_#111] transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5" style={{ background: ACCENT }}>
              Get started free
            </button>
            <p className="text-[11px] text-[#888] text-center mt-3 font-medium">No credit card required</p>
          </div>

          {/* Right card — Premium */}
          <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0_#111] p-8 flex flex-col relative">
            <span className="absolute -top-3 -right-3 text-white text-[10px] font-black px-3 py-1 rounded border-2 border-black z-10" style={{ background: FEATURE_BG }}>
              MOST POPULAR
            </span>
            <div className="text-xs font-bold text-[#555] uppercase tracking-widest mb-3">
              {cycle === "monthly" ? "Premium" : "Premium Yearly"}
            </div>
            {isPinkDay && (
              <div className="inline-flex items-center gap-2 border border-black rounded-full px-2.5 py-1 text-[10px] font-black mb-2" style={{ background: '#FF6EB4', color: '#111' }}>
                🌸 10% off today · use FORKSAI10
              </div>
            )}
            <div className="flex items-start leading-none mb-1">
              {isPinkDay && (
                <span className="font-black text-xl text-[#aaa] mt-2 mr-1.5 line-through">
                  ${cycle === "monthly" ? "7.99" : "23.99"}
                </span>
              )}
              <span className="font-black text-2xl text-[#111] mt-1.5 mr-0.5">$</span>
              <span className="font-serif font-black text-5xl text-[#111]">
                {cycle === "monthly" ? (isPinkDay ? "7.19" : "7.99") : (isPinkDay ? "21.59" : "23.99")}
              </span>
            </div>
            <div className="text-sm text-[#555] mb-4">
              {cycle === "monthly" ? "/ month, cancel anytime" : "/ year, cancel anytime"}
            </div>
            <div className="text-[11px] font-bold text-[#555] mb-3">Everything in Free, plus:</div>
            <div className="flex flex-col gap-2.5 mb-8">
              {[
                "100 AI flashcard generations / month",
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
            <button onClick={() => goSignup("pricing_premium")} className="mt-auto w-full font-bold text-sm border-2 border-black rounded-xl py-3.5 text-white shadow-[3px_3px_0_#555] transition-all hover:shadow-[1px_1px_0_#555] hover:translate-x-0.5 hover:translate-y-0.5" style={{ background: "#111111" }}>
              Get Premium
            </button>
            <p className="text-[11px] text-[#888] text-center mt-3 font-medium">Cancel anytime · Start on Free first</p>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <Reveal>
          <div className="border-2 border-black rounded-2xl shadow-[6px_6px_0_#111] px-8 py-14 sm:px-14 text-center relative overflow-hidden" style={{ background: ACCENT }}>
            <h2 className="font-serif font-black text-4xl sm:text-5xl text-[#111] leading-tight mb-4">
              Stop making flashcards.<br />Start <Mark color="#fff">actually learning.</Mark>
            </h2>
            <p className="text-[#333] text-base sm:text-lg max-w-lg mx-auto leading-relaxed mb-9">
              Upload your first PDF and have a study-ready deck before your coffee gets cold.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => goSignup("final_cta")}
                className="w-full sm:w-auto font-black text-lg border-2 border-black rounded-2xl px-10 py-4 text-[#111] bg-white shadow-[5px_5px_0_#111] transition-all hover:shadow-[2px_2px_0_#111] hover:translate-x-1 hover:translate-y-1 flex items-center justify-center gap-2.5"
              >
                Start for free <ArrowRight size={19} strokeWidth={2.75} />
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-7">
              {["Free forever plan", "No credit card required", "Ready in 30 seconds"].map(t => (
                <span key={t} className="flex items-center gap-1.5 text-[13px] font-bold text-[#111]">
                  <Check size={14} strokeWidth={3} />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="border-t-2 border-black text-white" style={{ background: "#111111" }}>
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-10 pb-12 border-b border-white/10">
            <div className="lg:col-span-2">
              <div className="font-serif font-black text-xl text-white mb-3">FORKSAI</div>
              <p className="text-white/40 text-sm leading-relaxed max-w-xs mb-6">The AI study platform that turns your material into mastery. Built for students who want results, not just revision.</p>

              {/* Moved out of the hero: a "coming soon" badge advertises an
                  absence, and it was doing that at the moment of highest intent. */}
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40 mb-3">Mobile apps coming soon</div>
              <div className="flex items-center gap-2.5">
                <span className="flex items-center gap-2 border border-white/20 rounded-lg px-3 py-2" aria-label="FORKSAI coming soon on the App Store">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="rgba(255,255,255,0.55)" aria-hidden="true">
                    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09l-.001-.001zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z" />
                  </svg>
                  <span className="text-[11px] font-bold text-white/50">App Store</span>
                </span>
                <span className="flex items-center gap-2 border border-white/20 rounded-lg px-3 py-2" aria-label="FORKSAI coming soon on Google Play">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="rgba(255,255,255,0.55)" aria-hidden="true">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.39 12l2.308-2.49zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z" />
                  </svg>
                  <span className="text-[11px] font-bold text-white/50">Google Play</span>
                </span>
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">Product</div>
              {/* These all used to point at /dashboard, which is served by the
                  old app through the multi-zone fallback proxy and 404s. They
                  now point at the real marketing pages, which also gives those
                  pages the internal links they were missing. */}
              {[
                ["AI Flashcards", "/ai-flashcards"],
                ["PDF to Flashcards", "/pdf-to-flashcards"],
                ["Study Modes", "/learn"],
                ["AI Notes", "/notes"],
                ["AI Summarizer", "/ai-summarizer"],
                ["Study Tools", "/ai-study-tools"],
                ["Free student tools", "/tools"],
              ].map(([l, href]) => (
                <a key={l} href={href} className="block text-sm text-white/40 hover:text-white transition-colors mb-2 no-underline">{l}</a>
              ))}
            </div>
            <div>
              <div className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">Resources</div>
              {[["Blog", "/blogs"], ["FAQ", "/faq"], ["Docs", "/docs"], ["RemNote alternative", "/remnote-alternative"], ["FORKSAI vs RemNote", "/forksai-vs-remnote"], ["FORKSAI vs Notion", "/forksai-vs-notion"], ["Flashcards and notes in one app", "/flashcards-and-notes-app"], ["Attendance Calculator", "/attendance-calculator"], ["AI Flashcards Guide", "/blog/flashcards"]].map(([l, href]) => (
                <a key={l} href={href} className="block text-sm text-white/40 hover:text-white transition-colors mb-2 no-underline">{l}</a>
              ))}
            </div>
            <div>
              <div className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">Company</div>
              {[["Work with us", "/apply"], ["Creator Program", "/apply/creators"], ["Ambassador Program", "/apply/ambassadors"]].map(([l, href]) => (
                <a key={l} href={href} className="block text-sm text-white/40 hover:text-white transition-colors mb-2 no-underline">{l}</a>
              ))}
              {/* Re-homed from the hero badge, which was diverting first-time
                  visitors away from signup. */}
              <button
                onClick={() => setShowEarnPrompt(true)}
                className="block text-left text-sm font-bold mb-2 transition-colors hover:opacity-80"
                style={{ color: ACCENT }}
              >
                Earn with FORKSAI
              </button>
            </div>
            <div>
              <div className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">Legal</div>
              {[["Privacy Policy", "/privacy-policy"], ["Terms of Service", "/terms"], ["Refund Policy", "/refund-policy"]].map(([l, href]) => (
                <a key={l} href={href} className="block text-sm text-white/40 hover:text-white transition-colors mb-2 no-underline">{l}</a>
              ))}
            </div>
          </div>

          <FooterFreeTools />

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-white/30 text-xs">2026 FORKSAI. All rights reserved.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
