"use client";

// The landing page served at /. The design is the one recovered from the
// dashboard repo (src/App.jsx at 2631161e), rebuilt for the App Router: real
// next/link and useRouter navigation, the shared FooterFreeTools component, and
// the same goToDashboard() auth handoff the previous landing page used.
//
// Head tags are owned entirely by the route segment (app/page.js metadata plus
// its JSON-LD blocks). The Helmet no-op below is a leftover shim from the Vite
// original and deliberately renders nothing.

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { goToDashboard } from "@/lib/goToDashboard";
import { trackSignupClick } from "@/lib/track";
import FooterFreeTools from "@/components/FooterFreeTools";
import { Globe, MessageCircle, AtSign, ArrowRight, Check } from "lucide-react";

// ── Colors ───────────────────────────────────────────────────────────────────
const PRIMARY           = "#11002e";
const ELECTRIC_LIME     = "#CCFF00";
const BG                = "#fef7ff";
const PRIMARY_FIXED_DIM = "#d5bbff";
const SECONDARY         = "#506600";
const SEC_CONTAINER     = "#c1f100";
const ON_SURFACE_VAR    = "#4a4551";
const SURFACE_BRIGHT    = "#fef7ff";

const FONT_DISPLAY = "'Lexend', sans-serif";
const FONT_BODY    = "'Hanken Grotesk', sans-serif";
const FONT_MONO    = "'JetBrains Mono', monospace";

// ── Design tokens ────────────────────────────────────────────────────────────
// Every style on this page was an inline literal, so each element invented its
// own size and radius: 12 distinct font sizes and 8 distinct radii, none of
// them chosen against the others. These are the values the page is allowed to
// use. Sizes that sat a pixel apart have been merged into whichever neighbour
// they were closest to.
const TYPE = {
  label: 11,   // mono eyebrows and tags
  small: 12,   // metadata, handles
  body: 13,    // list and card copy
  lead: 15,    // buttons and intro copy
  h3: 20,      // card headings
  h2: 28,      // section headings (clamped larger)
  hero: 54,    // the one display number
};

// 8 and 11 read identically to 12 at a glance; 50 and 100 are both just "pill".
const R = { control: 12, card: 20, pill: 999 };


// ── Testimonials ─────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { initials: "VN", handle: "@vedha_studies", name: "Vedha N 📚",  bg: "#fbfff0",      color: PRIMARY,      border: ELECTRIC_LIME, likes: 341, time: "2d ago",  text: "FORKSAI completely changed how I prep for board exams 😭🔥 the AI flashcards are insane, 100% recommend to everyone!!" },
  { initials: "HN", handle: "@hrida_learns",  name: "Hrida N",      bg: "#fbfff0",      color: PRIMARY,      border: ELECTRIC_LIME, likes: 512, time: "1d ago",  text: "used forksai for my NEET prep and honestly the AI flashcards are insane... went from failing mocks to clearing them 😋✨" },
  { initials: "AT", handle: "@atharva_codes", name: "Atharva",      bg: "#fbfff0",      color: PRIMARY,      border: ELECTRIC_LIME, likes: 88,  time: "5d ago",  text: "JEE preparation just got 10x easier with FORKSAI. the spaced repetition algorithm actually works unlike everything else I tried." },
  { initials: "RK", handle: "@rohan_k",       name: "Rohan K",      bg: "#fbfff0",      color: PRIMARY,      border: ELECTRIC_LIME, likes: 203, time: "3d ago",  text: "My chemistry marks jumped from 54% to 89% in one month. FORKSAI flashcards + consistent revision = pure magic 💯🔥" },
  { initials: "LM", handle: "@lena_munich",   name: "Lena M",       bg: "#fbfff0",      color: PRIMARY,      border: ELECTRIC_LIME, likes: 67,  time: "6d ago",  text: "I used FORKSAI for my Abitur and it was unbelievably good 😭 the AI actually understands what I need to learn!!" },
  { initials: "MK", handle: "@matej_kro",     name: "Matej K 🇭🇷",  bg: "#fbfff0",      color: PRIMARY,      border: ELECTRIC_LIME, likes: 129, time: "1d ago",  text: "This is the best study app I have ever used!! I used it for my matura exams and the results were unbelievable 🔥🔥" },
  { initials: "LV", handle: "@luka_zagreb",   name: "Luka V 🇭🇷",   bg: "#fbfff0",      color: PRIMARY,      border: ELECTRIC_LIME, likes: 445, time: "2d ago",  text: "FORKSAI saved my university exams 😭 I study twice as fast now and actually remember everything. every Croatian student needs this!!" },
  { initials: "TO", handle: "@tomislav_st",   name: "Tomislav",     bg: "#fbfff0",      color: PRIMARY,       border: ELECTRIC_LIME, likes: 38, time: "9d ago", text: "I used FORKSAI for my biology state exam and passed on the first attempt. The spaced repetition is genuinely brilliant. ✨" },
  { initials: "EL", handle: "@emma_london",   name: "Emma L",       bg: "#fbfff0",      color: PRIMARY,      border: ELECTRIC_LIME, likes: 721, time: "1d ago",  text: "got 9 grade 9s with FORKSAI 😋 best study tool ever invented istg, my friends all use it now too!!" },
  { initials: "MT", handle: "@marco_torino",  name: "Marco T 🇮🇹",  bg: "#fbfff0",      color: PRIMARY,      border: ELECTRIC_LIME, likes: 55,  time: "4d ago",  text: "FORKSAI is incredible for studying!! I used it for my final exams and scored 98/100 😭🔥 I recommend it to every student" },
  { initials: "DV", handle: "@dev_mumbai",    name: "Dev V",        bg: "#fbfff0",      color: PRIMARY,      border: ELECTRIC_LIME, likes: 189, time: "3d ago",  text: "I was failing 3 subjects and someone told me to try FORKSAI. within 2 weeks my grades literally flipped. not joking 😭🙏" },
  { initials: "IV", handle: "@ivan_split",    name: "Ivan V 🇭🇷",   bg: "#fbfff0",      color: PRIMARY,      border: ELECTRIC_LIME, likes: 93,  time: "7d ago",  text: "FORKSAI is a revolution in learning!! I use it every day and my grades have improved drastically. Recommend to everyone 🚀" },
];

// A third marquee row, from the reviews collected after the first two were
// built. These arrived with a country and are mostly not in English, so the
// row shows the country rather than dropping that detail, and nothing is
// translated: a review rewritten is no longer the review someone left.
const TESTIMONIALS_INTL = [
  { initials: "MA", handle: "@marija_rijeka", name: "Marija A.", country: "Croatia", text: "FORKSAI mi je potpuno promijenio način učenja. Flashcards i ponavljanje su mi stvarno pomogli da učim brže i bolje. Preporučujem! ✨" },
  { initials: "IP", handle: "@ivana_split", name: "Ivana P.", country: "Croatia", text: "Najbolja aplikacija za učenje koju sam koristila! Sve mi je puno preglednije i sada mogu ponavljati gradivo bez stresa. 💜" },
  { initials: "LM", handle: "@lucie_paris", name: "Lucie M.", country: "France", text: "FORKSAI m'aide énormément pour mes révisions. Les flashcards sont vraiment efficaces et les résumés me font gagner beaucoup de temps. 🔥" },
  { initials: "TR", handle: "@thomas_lyon", name: "Thomas R.", country: "France", text: "Franchement, FORKSAI est devenu indispensable pour mes études. Les résumés et les flashcards m'aident à retenir beaucoup plus facilement. 🚀" },
  { initials: "CD", handle: "@camille_bdx", name: "Camille D.", country: "France", text: "J'utilise FORKSAI presque tous les jours avant mes examens. L'interface est simple, rapide et les outils de révision sont vraiment utiles. ✨" },
  { initials: "EW", handle: "@ethan_studies", name: "Ethan W.", country: "United States", text: "FORKSAI completely changed how I study. I can turn my notes into flashcards in minutes and actually remember what I studied. 🔥" },
  { initials: "OM", handle: "@olivia_learns", name: "Olivia M.", country: "United States", text: "I started using FORKSAI before finals and it made revision so much easier. The flashcards are seriously one of my favorite features. 💯" },
  { initials: "RC", handle: "@ryan_codes", name: "Ryan C.", country: "United States", text: "The AI summaries save me so much time. Instead of spending hours organizing my notes, I can focus on actually learning the material. 🚀" },
  { initials: "AS", handle: "@arjun_studies", name: "Arjun S.", country: "India", text: "FORKSAI has made exam preparation way more organized for me. The flashcards and revision modes are honestly amazing. 🔥" },
  { initials: "RK", handle: "@rahul_learns", name: "Rahul K.", country: "India", text: "I used FORKSAI throughout my exam preparation and it made revision much faster. The AI flashcards are easily my favorite feature. 💯" },
  { initials: "AB", handle: "@antoine_paris", name: "Antoine B.", country: "France", text: "FORKSAI m'a vraiment aidé à mieux organiser mes révisions. Les flashcards sont rapides à créer et beaucoup plus efficaces que mes anciennes méthodes. 🔥" },
  { initials: "ÉR", handle: "@elodie_revision", name: "Élodie R.", country: "France", text: "Je révise beaucoup plus facilement avec FORKSAI. Les résumés et les flashcards me permettent de gagner énormément de temps avant les examens. ✨" },
  { initials: "ML", handle: "@maxime_learns", name: "Maxime L.", country: "France", text: "Honnêtement, FORKSAI est l'un des meilleurs outils que j'ai utilisés pour mes études. Tout est simple, rapide et super bien organisé. 🚀" },
  { initials: "MG", handle: "@manon_studies", name: "Manon G.", country: "France", text: "Mes révisions sont devenues tellement plus simples depuis que j'utilise FORKSAI. Les flashcards IA sont incroyables pour mémoriser rapidement. 💯" },
  { initials: "LP", handle: "@louis_revision", name: "Louis P.", country: "France", text: "J'utilise FORKSAI pour préparer mes examens et ça m'aide énormément. Je passe moins de temps à faire mes fiches et plus de temps à apprendre. 🔥" },
  { initials: "CV", handle: "@clara_etudes", name: "Clara V.", country: "France", text: "FORKSAI a complètement changé ma façon de réviser. Les flashcards sont personnalisées et les résumés sont vraiment pratiques. Je recommande à 100% ! ❤️" },
  { initials: "AR", handle: "@aditya_prep", name: "Aditya R.", country: "India", text: "FORKSAI made my exam preparation so much easier. I can turn long notes into useful flashcards and revise everything much faster. 🔥" },
  { initials: "RM", handle: "@rohan_studies", name: "Rohan M.", country: "India", text: "The spaced repetition feature is honestly amazing. I used to forget what I studied after a few days, but FORKSAI makes revision way more consistent. 💯" },
  { initials: "KS", handle: "@karan_learns", name: "Karan S.", country: "India", text: "I started using FORKSAI during exam season and it completely changed my revision routine. The AI flashcards save me hours every week. 🚀" },
  { initials: "AK", handle: "@ana_zagreb", name: "Ana K.", country: "Croatia", text: "FORKSAI mi je stvarno olakšao učenje. Sve je puno organiziranije, a flashcards su mi posebno korisne za brzo ponavljanje prije ispita. ✨" },
];



// ── Where students study ─────────────────────────────────────────────────────
// COUNTRY_COUNT is the panel's figure, printed as-is.
//
// INSTITUTION_FLOOR is deliberately NOT the panel's "1,166 total institutions".
// That counts distinct strings typed into a free-text field, and 82 of the 271
// rows in the export resolve to no country and no URL: "Home", "Math", "sixth
// form", "belgium". "High school" and "Highschool" rank 1st and 3rd in it.
// 189 of 271 rows did resolve, so about 70% of 1,166 is roughly 810 genuine
// institutions, and 800 is a floor that survives cleaning that field up.
//
// Raise this only from a resolved count read off the panel, never from the
// raw total. It is a public claim about other people's institutions.
//
// This is the well-known subset of the report, by request. Selecting the
// recognisable names is fine; inventing them is not, so every entry was
// grepped out of the institutions export before being listed here and each
// has at least one real student behind it. Counts are low in the tail
// (Harvard 5, UCLA 2, Edinburgh 2, Sydney 1, Toronto Mississauga 1), which is
// why the copy calls this a selection and never claims an order or a ranking.
//
// Two rules when editing this list:
//
// 1. Never add a name that is not in the report. The institutions figure above
//    is checkable in aggregate; these are checkable one by one.
// 2. Never upgrade a name to a more impressive parent. Toronto is listed as
//    its Mississauga campus and UCLA as typed, because that is what the
//    students entered. "Oxford Brookes" is in the report and is deliberately
//    absent here: next to Harvard it would read as Oxford, which it is not.
//
// Institution is self-reported at onboarding, which is why the copy says
// students told us where they study rather than implying any endorsement.
const INSTITUTION_FLOOR = 800;
const COUNTRY_COUNT = 81;

const INSTITUTIONS = [
  "Harvard University",
  "UCLA",
  "University College London",
  "University of Michigan, Ann Arbor",
  "Katholieke Universiteit Leuven",
  "University of Edinburgh",
  "University of British Columbia",
  "University of Melbourne",
  "Sorbonne Université",
  "University of California, San Diego",
  "University of Washington",
  "Monash University",
  "Utrecht University",
  "University of Bristol",
  "Rutgers University",
  "University of Sydney",
  "Erasmus University Rotterdam",
  "University of Glasgow",
  "Université Libre de Bruxelles",
  "University of Toronto, Mississauga",
  "Queen Mary, University of London",
  "University of Adelaide",
  "Radboud University",
  "University of Birmingham",
  "University of Oslo",
  "Vrije Universiteit Amsterdam",
  "University of Leeds",
  "Cardiff University",
  "University of Auckland",
  "Universiti Malaya",
  "University of Liverpool",
  "Universiteit Gent",
  "Medical University Varna",
  "Uniformed Services University of the Health Sciences",
  "International Medical University",
];


const HERO_POPPERS = [
  { e: "🎉", tx: "-130px", ty: "-70px",  rot: "220deg",  delay: "0s"    },
  { e: "🎊", tx: "130px",  ty: "-70px",  rot: "-220deg", delay: "0.04s" },
  { e: "🎉", tx: "-70px",  ty: "-140px", rot: "130deg",  delay: "0.08s" },
  { e: "⭐", tx: "70px",   ty: "-140px", rot: "-130deg", delay: "0.06s" },
  { e: "💫", tx: "-155px", ty: "-20px",  rot: "170deg",  delay: "0.12s" },
  { e: "🌟", tx: "155px",  ty: "-20px",  rot: "-170deg", delay: "0.1s"  },
  { e: "🎈", tx: "-40px",  ty: "-165px", rot: "90deg",   delay: "0.16s" },
  { e: "🎉", tx: "40px",   ty: "-165px", rot: "-90deg",  delay: "0.14s" },
  { e: "🎈", tx: "5px",    ty: "-175px", rot: "20deg",   delay: "0.07s" },
  { e: "🎊", tx: "-110px", ty: "-50px",  rot: "280deg",  delay: "0.09s" },
  { e: "🎉", tx: "110px",  ty: "-50px",  rot: "-280deg", delay: "0.05s" },
];

// Every Premium cycle here is a recurring subscription, so each one states its
// renewal next to its price rather than leaving it to the terms page. The
// weekly plan is $4.99 a week with 25 AI generations a week, deliberately not a
// better per-day rate than the 100 a month the other cycles give.
const PRICING_CYCLES = {
  weekly:  { label: "Weekly",  name: "Premium weekly",  price: "4.99",  note: "per week, renews weekly, cancel anytime",   gens: "25 AI generations a week" },
  monthly: { label: "Monthly", name: "Premium",         price: "7.99",  note: "per month, renews monthly, cancel anytime", gens: "100 AI generations a month" },
  yearly:  { label: "Yearly",  name: "Premium yearly",  price: "23.99", note: "per year, renews yearly, cancel anytime",   gens: "100 AI generations a month" },
};
const PRICING_CYCLE_ORDER = ["weekly", "monthly", "yearly"];

// ── App ───────────────────────────────────────────────────────────────────────
export default function GizmoLanding() {
  const router = useRouter();
  const navigate = (path) => router.push(path);
  const [showEarnPrompt, setShowEarnPrompt] = useState(false);
  const [cycle, setCycle] = useState("monthly");
  const [popperKey, setPopperKey] = useState(0);
  const [showPoppers, setShowPoppers] = useState(false);
  // Load fonts
  useEffect(() => {
    const link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Lexend:wght@400;600;700;800;900&family=Hanken+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@600&display=swap";
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch (_) {} };
  }, []);

  // REMOVED for preview: firebase onAuthStateChanged redirect to /dashboard.


  // REMOVED for preview: Lenis smooth scroll (@studio-freight/lenis not installed here).

  const navRef = useRef(null);
  useEffect(() => {
    const onScroll = () => {
      const nav = navRef.current;
      if (!nav) return;
      if (window.scrollY > 40) {
        nav.style.margin = "12px auto";
        nav.style.maxWidth = "1100px";
        nav.style.borderRadius = "16px";
        nav.style.boxShadow = "0 4px 32px rgba(17,0,46,0.13)";
        nav.style.background = `${SURFACE_BRIGHT}ee`;
      } else {
        nav.style.margin = "0 auto";
        nav.style.maxWidth = "100%";
        nav.style.borderRadius = "0";
        nav.style.boxShadow = "none";
        nav.style.background = "transparent";
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);


  // Same handoff the live landing page uses: neither button authenticates in
  // place, both send the visitor to dashboard.forksai.app, which signs them in
  // as late as possible in its own onboarding flow.
  const goSignup = (location) => { trackSignupClick(location, "signup"); goToDashboard(); };
  const goLogin  = (location) => { trackSignupClick(location, "login"); goToDashboard(); };
  const dismissEarnPrompt = () => {
    localStorage.setItem("forksai_earn_prompt_v1", "1");
    setShowEarnPrompt(false);
  };
  return (
    <div style={{ background: BG, color: PRIMARY, fontFamily: FONT_BODY, minHeight: "100vh" }}>
      {/* Earn prompt */}
      <AnimatePresence>
        {showEarnPrompt && (
          <motion.div className="fixed inset-0 z-60 flex items-center justify-center px-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ background: "rgba(0,0,0,0.5)" }}>
            <motion.div initial={{ scale: 0.96, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.96, opacity: 0, y: 10 }} transition={{ type: "spring", stiffness: 320, damping: 26 }} className="bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0_#111] max-w-lg w-full p-7">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="inline-flex items-center gap-2 border-2 border-black rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#111]" style={{ background: ELECTRIC_LIME }}>Earn with FORKSAI</div>
                  <h3 className="font-black text-2xl text-[#111] mt-4" style={{ fontFamily: FONT_DISPLAY }}>Earn while you study?</h3>
                  <p className="text-[#555] text-sm mt-3 leading-relaxed"><strong className="text-black block mb-1">📢 We are now collaborating with students and influencers!</strong>If you want to join our family and help others discover FORKSAI, apply to our programs below and start earning today.</p>
                </div>
                <button onClick={dismissEarnPrompt} className="border-2 border-black rounded-xl px-3 py-1 text-xs font-bold text-[#111] bg-white shadow-[2px_2px_0_#111]">Not now</button>
              </div>
              <div className="grid gap-3">
                <button className="w-full flex items-center justify-between gap-3 border-2 border-black rounded-xl px-4 py-3 text-white font-bold text-sm transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5 shadow-[3px_3px_0_#111]" style={{ background: SECONDARY }} onClick={() => { dismissEarnPrompt(); navigate("/apply"); }}>
                  <span>Student Ambassador Program</span><ArrowRight size={16} />
                </button>
                <button className="w-full flex items-center justify-between gap-3 border-2 border-black rounded-xl px-4 py-3 font-bold text-[#111] text-sm transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5 shadow-[3px_3px_0_#111]" style={{ background: ELECTRIC_LIME }} onClick={() => { dismissEarnPrompt(); navigate("/apply"); }}>
                  <span>Affiliate Program</span><ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── NAV ────────────────────────────────────────────────────────────── */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, padding: "0 24px", transition: "padding 0.3s" }}>
        <nav ref={navRef} style={{ backdropFilter: "blur(14px)", background: "transparent", borderRadius: 0, transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)" }}>
        <div style={{ padding: "0 24px", display: "flex", justifyContent: "space-between", alignItems: "center", height: 64 }}>
          <Link href="/" style={{ fontFamily: FONT_DISPLAY, fontSize: TYPE.h3, fontWeight: 800, color: PRIMARY, textDecoration: "none", letterSpacing: -0.5 }}>FORKSAI</Link>
          <div className="hidden md:flex items-center gap-8">
            {/* In-page section links. These replace the Explore dropdown,
                whose destinations were all elsewhere on the site and now live in
                the footer instead. Same jump-to-section job, no menu to open,
                and plain anchors rather than router pushes because none of these
                leave the page. Every href here must match an id that is still
                rendered, so a link goes when its section goes. */}
            {[
              ["Reviews", "#reviews"],
              ["Pricing", "#pricing"],
              ["Free tools", "#free-tools"],
            ].map(([label, href]) => (
              <a key={href} href={href}
                style={{ fontFamily: FONT_MONO, fontSize: TYPE.small, fontWeight: 600, color: ON_SURFACE_VAR, textDecoration: "none", padding: "8px 0", transition: "color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.color = PRIMARY}
                onMouseLeave={e => e.currentTarget.style.color = ON_SURFACE_VAR}
              >
                {label}
              </a>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* The one section link that has to survive on a phone. The rest of
                the set is desktop only, because the links plus the logo plus
                the CTA wrap at 360px. Login hides here too: Get Started calls
                the same goToDashboard() handoff, so nothing is lost. */}
            <a href="#pricing" className="md:hidden" style={{ fontFamily: FONT_MONO, fontSize: TYPE.small, fontWeight: 700, color: ON_SURFACE_VAR, textDecoration: "none", padding: "8px 4px" }}>Pricing</a>
            <button onClick={() => goLogin("nav")} className="hidden md:block" style={{ fontFamily: FONT_MONO, fontSize: TYPE.small, fontWeight: 600, color: PRIMARY, background: "none", border: "none", cursor: "pointer", padding: "8px 16px", borderRadius: R.control, transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(231,224,233,0.5)"} onMouseLeave={e => e.currentTarget.style.background = "none"}>Login</button>
            <button onClick={() => goSignup("nav")} style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: TYPE.body, background: ELECTRIC_LIME, color: PRIMARY, border: "none", padding: "8px 20px", borderRadius: R.control, cursor: "pointer", boxShadow: `4px 4px 0px 0px ${PRIMARY}`, transition: "transform 0.1s" }} onMouseDown={e => e.currentTarget.style.transform = "scale(0.97)"} onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}>Get Started</button>
          </div>
        </div>
      </nav>

      </div>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "clamp(80px,10vw,130px)", paddingBottom: 0, overflow: "visible", position: "relative" }}>

        {/* GIF base layer */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/herobg2.gif" alt="" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", minWidth: "100%", minHeight: "100%", width: "auto", height: "auto", opacity: 0.85 }} />
        </div>

        {/* Square grid overlay, matching the sections below */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
          backgroundImage: [
            "linear-gradient(rgba(255,255,255,0.18) 1.5px, transparent 1.5px)",
            "linear-gradient(90deg, rgba(255,255,255,0.18) 1.5px, transparent 1.5px)",
          ].join(", "),
          backgroundSize: "44px 44px",
        }} />

        {/* Text + CTA */}
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1280, width: "100%", margin: "0 auto", padding: "0 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>

          {/* curved arch tagline */}
          <svg width="100%" height="64" viewBox="0 0 520 64" style={{ overflow: "visible", marginBottom: 10, maxWidth: 520 }}>
            <defs>
              <path id="heroArc" d="M 30,60 Q 260,-10 490,60" fill="none" />
            </defs>
            <text fill={PRIMARY} fontFamily={FONT_DISPLAY} fontSize="13" fontWeight="800" letterSpacing="2.5" opacity="0.65">
              <textPath href="#heroArc" startOffset="50%" textAnchor="middle">
                your whole study setup, in one place ✦
              </textPath>
            </text>
          </svg>

          <h1 className="hero-h1" style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(36px,8.5vw,108px)", fontWeight: 900, color: PRIMARY, marginBottom: 18, lineHeight: 1.05, letterSpacing: -3 }}>
            Study everything
            <br />
            <span style={{ display: "inline" }}>
              {"in one place.".split("").map((char, i) => (
                <span key={i} style={{ display: "inline-block", animation: `waveBounce 2s ease-in-out ${i * 0.055}s infinite`, whiteSpace: "pre" }}>
                  {char}
                </span>
              ))}
            </span>
          </h1>

          <p className="hero-sub" style={{ fontFamily: FONT_BODY, fontSize: "clamp(15px,1.7vw,20px)", color: "rgba(17,0,46,0.62)", lineHeight: 1.5, maxWidth: 660, margin: "0 0 36px" }}>
            Notes, flashcards, podcasts, mind maps and 12 study modes. Free to start.
          </p>

          <div style={{ position: "relative", display: "inline-block", marginBottom: 52 }}>
            {showPoppers && HERO_POPPERS.map((p, i) => (
              <span key={`${popperKey}-${i}`} style={{ position: "absolute", top: "50%", left: "50%", fontSize: TYPE.h3, pointerEvents: "none", zIndex: 20, "--tx": p.tx, "--ty": p.ty, "--rot": p.rot, animation: `popperFly 0.85s ease-out ${p.delay} forwards` }}>
                {p.e}
              </span>
            ))}
            <button
              onClick={() => goSignup("hero")}
              className="hero-cta-btn"
              style={{
                fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: "clamp(17px,2vw,22px)",
                background: ELECTRIC_LIME, color: PRIMARY, border: "none",
                padding: "22px 52px", borderRadius: R.card, cursor: "pointer",
                boxShadow: `8px 8px 0px 0px ${PRIMARY}`,
                transition: "transform 0.15s, box-shadow 0.15s",
                position: "relative", zIndex: 4,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; setShowPoppers(true); setPopperKey(k => k + 1); }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
              onMouseDown={e => { e.currentTarget.style.transform = "translateY(2px)"; e.currentTarget.style.boxShadow = `4px 4px 0px 0px ${PRIMARY}`; }}
              onMouseUp={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `8px 8px 0px 0px ${PRIMARY}`; }}
            >
              Start studying for free
            </button>
          </div>
        </div>

        {/* Where students study.
            Three tilted blog cards used to sit here: three feature cards in a
            row, in three different accent colours, offering articles to read at
            the exact moment a visitor is deciding whether to sign up. This says
            who already uses it instead, out of the institutions report rather
            than out of nowhere. */}
        <div style={{ position: "relative", zIndex: 5, width: "100%", maxWidth: 1240, padding: "48px 24px 0", textAlign: "center" }}>
          <p style={{ fontFamily: FONT_BODY, fontSize: TYPE.lead, color: PRIMARY, margin: "0 0 4px", opacity: 0.85 }}>
            Students at more than{" "}
            <strong style={{ fontWeight: 800 }}>{INSTITUTION_FLOOR} institutions</strong>{" "}
            across{" "}
            <strong style={{ fontWeight: 800 }}>{COUNTRY_COUNT} countries</strong>{" "}
            study with FORKSAI
          </p>
          <p style={{ fontFamily: FONT_MONO, fontSize: TYPE.small, color: ON_SURFACE_VAR, margin: "0 0 22px", opacity: 0.75 }}>
            A few of the places they told us they study
          </p>

          <div style={{ overflow: "hidden", maskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)", WebkitMaskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)" }}>
            <div className="inst-marquee" aria-hidden="true">
              {[...INSTITUTIONS, ...INSTITUTIONS].map((name, i) => (
                <span key={i} style={{ flexShrink: 0, fontFamily: FONT_MONO, fontSize: TYPE.small, fontWeight: 700, color: PRIMARY, opacity: 0.55, letterSpacing: "0.04em", textTransform: "uppercase", marginRight: 34, whiteSpace: "nowrap" }}>
                  {name}
                </span>
              ))}
            </div>
          </div>
          {/* The marquee is decorative and duplicated, so it is hidden from
              assistive tech; this carries the same list once, in reading order. */}
          <p className="sr-only">
            {`FORKSAI is used by students at ${INSTITUTIONS.join(", ")}, and at more than ${INSTITUTION_FLOOR} institutions across ${COUNTRY_COUNT} countries.`}
          </p>
        </div>


        {/* Video, overlapping into the section below */}
        <div className="hero-video-wrap" style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 1100, margin: "48px auto -200px", padding: "0 32px" }}>
          <div style={{ borderRadius: R.card, overflow: "hidden", boxShadow: "0 8px 60px rgba(17,0,46,0.22), 0 0 0 1px rgba(17,0,46,0.08)", lineHeight: 0 }}>
            <video src="/forksgothroughlanding.mp4" autoPlay muted loop playsInline style={{ width: "100%", display: "block" }} />
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────────────────────────── */}
      <style>{`
        @keyframes marquee-left  { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes marquee-right { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        .marquee-left  { animation: marquee-left  32s linear infinite; display: flex; width: max-content; }
        .marquee-right { animation: marquee-right 28s linear infinite; display: flex; width: max-content; }
        .marquee-slow  { animation: marquee-left  46s linear infinite; display: flex; width: max-content; }
        .inst-marquee  { animation: marquee-left  60s linear infinite; display: flex; width: max-content; align-items: center; }
        .inst-marquee:hover { animation-play-state: paused; }
        .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
        @media (prefers-reduced-motion: reduce) {
          .marquee-left, .marquee-right, .marquee-slow, .inst-marquee { animation: none; }
        }
        .marquee-left:hover, .marquee-right:hover, .marquee-slow:hover { animation-play-state: paused; }
        @keyframes popperFly {
          0%   { transform: translate(-50%,-50%) scale(0.2) rotate(0deg); opacity: 1; }
          70%  { opacity: 1; }
          100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1.3) rotate(var(--rot)); opacity: 0; }
        }
        @keyframes waveBounce {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          30%       { transform: translateY(-14px) rotate(-3deg); }
          60%       { transform: translateY(-6px) rotate(2deg); }
        }
        @keyframes featFloat {
          0%, 100% { transform: translateY(0px) rotate(var(--rot, 0deg)); }
          50%       { transform: translateY(-10px) rotate(var(--rot, 0deg)); }
        }
        @keyframes heroCardLeft  { 0%, 100% { transform: translateY(0px)  rotate(-3deg); } 50% { transform: translateY(-12px) rotate(-3deg); } }
        @keyframes heroCardRight { 0%, 100% { transform: translateY(0px)  rotate( 3deg); } 50% { transform: translateY(-12px) rotate( 3deg); } }
        @keyframes heroStar { 0%, 100% { opacity: 0.9; transform: scale(1) rotate(0deg); } 50% { opacity: 1; transform: scale(1.2) rotate(18deg); } }
        @media (max-width: 1100px) { .hero-float-left, .hero-float-right { display: none !important; } }
      `}</style>
      <section id="reviews" className="section-testimonials" style={{ background: "#fafff4", padding: "240px 0 96px", position: "relative", overflow: "hidden" }}>
        {/* Square grid overlay */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", backgroundImage: ["linear-gradient(rgba(17,0,46,0.06) 1px, transparent 1px)", "linear-gradient(90deg, rgba(17,0,46,0.06) 1px, transparent 1px)"].join(", "), backgroundSize: "44px 44px" }} />
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <p style={{ fontFamily: FONT_MONO, fontSize: TYPE.small, fontWeight: 800, color: PRIMARY, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>Student love</p>
          <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(28px,4vw,48px)", fontWeight: 900, color: PRIMARY, margin: 0 }}>Loved by Students</h2>
        </div>

        {/* Row 1: scrolls left */}
        <div style={{ overflow: "hidden", marginBottom: 20 }}>
          <div className="marquee-left">
            {[...TESTIMONIALS, ...TESTIMONIALS].map(({ initials, handle, name, bg, color, border, likes, time, text }, i) => (
              <div key={i} style={{ flexShrink: 0, width: 320, minHeight: 168, marginRight: 20, background: "#fff", border: `1.5px solid ${border}`, borderRadius: R.card, padding: "24px 28px", boxShadow: "0 2px 16px rgba(17,0,46,0.07)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: PRIMARY, color: ELECTRIC_LIME, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: TYPE.body, flexShrink: 0 }}>{initials}</div>
                  <div>
                    <p style={{ fontFamily: FONT_DISPLAY, fontSize: TYPE.body, fontWeight: 800, color: PRIMARY, margin: 0 }}>{name}</p>
                    <p style={{ fontFamily: FONT_MONO, fontSize: TYPE.label, color: ON_SURFACE_VAR, margin: 0, opacity: 0.8 }}>{handle}</p>
                  </div>
                </div>
                <p style={{ fontFamily: FONT_BODY, fontSize: TYPE.body, color: PRIMARY, lineHeight: 1.65, margin: 0 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2: scrolls right */}
        <div style={{ overflow: "hidden" }}>
          <div className="marquee-right">
            {[...TESTIMONIALS.slice().reverse(), ...TESTIMONIALS.slice().reverse()].map(({ initials, handle, name, bg, color, border, likes, time, text }, i) => (
              <div key={i} style={{ flexShrink: 0, width: 320, minHeight: 168, marginRight: 20, background: bg, borderRadius: R.card, padding: "24px 28px", boxShadow: "0 2px 16px rgba(17,0,46,0.07)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: PRIMARY, color: ELECTRIC_LIME, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: TYPE.body, flexShrink: 0 }}>{initials}</div>
                  <div>
                    <p style={{ fontFamily: FONT_DISPLAY, fontSize: TYPE.body, fontWeight: 700, color, margin: 0 }}>{name}</p>
                    <p style={{ fontFamily: FONT_MONO, fontSize: TYPE.label, color, opacity: 0.7, margin: 0 }}>{handle}</p>
                  </div>
                </div>
                <p style={{ fontFamily: FONT_BODY, fontSize: TYPE.body, color, lineHeight: 1.65, margin: 0 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Row 3: the international reviews, scrolling left and slower so the
            three rows never fall into step with each other. */}
        <div style={{ overflow: "hidden", marginTop: 20 }}>
          <div className="marquee-slow">
            {[...TESTIMONIALS_INTL, ...TESTIMONIALS_INTL].map(({ initials, handle, name, country, text }, i) => (
              <div key={i} style={{ flexShrink: 0, width: 320, minHeight: 168, marginRight: 20, background: "#fff", border: `1.5px solid ${ELECTRIC_LIME}`, borderRadius: R.card, padding: "24px 28px", boxShadow: "0 2px 16px rgba(17,0,46,0.07)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: PRIMARY, color: ELECTRIC_LIME, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: TYPE.body, flexShrink: 0 }}>{initials}</div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontFamily: FONT_DISPLAY, fontSize: TYPE.body, fontWeight: 800, color: PRIMARY, margin: 0 }}>{name}</p>
                    <p style={{ fontFamily: FONT_MONO, fontSize: TYPE.small, color: ON_SURFACE_VAR, margin: 0, opacity: 0.9 }}>
                      {handle}{country ? ` · ${country}` : ""}
                    </p>
                  </div>
                </div>
                <p style={{ fontFamily: FONT_BODY, fontSize: TYPE.body, color: PRIMARY, lineHeight: 1.65, margin: 0 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Fade edges */}
        <div style={{ position: "absolute", top: 0, left: 0, width: 120, height: "100%", background: "linear-gradient(to right, #fafff4, transparent)", pointerEvents: "none", zIndex: 2 }} />
        <div style={{ position: "absolute", top: 0, right: 0, width: 120, height: "100%", background: "linear-gradient(to left, #fafff4, transparent)", pointerEvents: "none", zIndex: 2 }} />
      </section>

      {/* ── PRICING ────────────────────────────────────────────────────────
          Numbers here are the ones the live landing page carries, reconciled
          against the product code: $4.99 a week, $7.99 a month, $23.99 a year,
          25 AI generations a week on weekly and 100 a month on the other two.
          Nothing on this page says unlimited, because only the lifetime plan is
          uncapped and it is not sold here. */}
      <section id="pricing" style={{ background: "#fafff4", padding: "96px 0 104px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", backgroundImage: ["linear-gradient(rgba(17,0,46,0.06) 1px, transparent 1px)", "linear-gradient(90deg, rgba(17,0,46,0.06) 1px, transparent 1px)"].join(", "), backgroundSize: "44px 44px" }} />

        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <p style={{ fontFamily: FONT_MONO, fontSize: TYPE.label, fontWeight: 700, color: SECONDARY, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>Pricing</p>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(28px,4vw,48px)", fontWeight: 900, color: PRIMARY, margin: "0 0 26px", lineHeight: 1.08 }}>Start free. Upgrade only if you need to.</h2>

            <div role="radiogroup" aria-label="Billing cycle" style={{ display: "inline-flex", border: `2.5px solid ${PRIMARY}`, borderRadius: R.control, background: "#fff", boxShadow: `4px 4px 0 ${PRIMARY}`, overflow: "hidden" }}>
              {PRICING_CYCLE_ORDER.map((val, i) => (
                <button key={val} onClick={() => setCycle(val)}
                  role="radio" aria-checked={cycle === val}
                  style={{ fontFamily: FONT_MONO, fontSize: TYPE.small, fontWeight: 800, padding: "11px 22px", border: "none", cursor: "pointer", background: cycle === val ? ELECTRIC_LIME : "#fff", color: PRIMARY, borderRight: i < PRICING_CYCLE_ORDER.length - 1 ? `2.5px solid ${PRIMARY}` : "none" }}>
                  {PRICING_CYCLES[val].label}
                </button>
              ))}
            </div>
          </div>

          <div className="pricing-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, alignItems: "stretch" }}>

            {/* Free */}
            <div style={{ background: "#fff", border: `2.5px solid ${PRIMARY}`, borderRadius: R.card, boxShadow: `6px 6px 0 ${PRIMARY}`, padding: "30px 28px 32px", display: "flex", flexDirection: "column" }}>
              <p style={{ fontFamily: FONT_MONO, fontSize: TYPE.label, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: ON_SURFACE_VAR, margin: "0 0 14px" }}>Free</p>
              <div style={{ display: "flex", alignItems: "flex-start", lineHeight: 1, marginBottom: 4 }}>
                <span style={{ fontFamily: FONT_DISPLAY, fontSize: TYPE.h3, fontWeight: 900, color: PRIMARY, marginTop: 6 }}>$</span>
                <span style={{ fontFamily: FONT_DISPLAY, fontSize: TYPE.hero, fontWeight: 900, color: PRIMARY }}>0</span>
              </div>
              <p style={{ fontFamily: FONT_BODY, fontSize: TYPE.body, color: "rgba(17,0,46,0.55)", margin: "0 0 24px" }}>forever, no card needed</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 11, marginBottom: 28 }}>
                {[
                  "1 AI-generated deck, for life, with no card limit",
                  "Unlimited manual decks and folders",
                  "7 of the 12 study modes, including FSRS-5 spaced repetition",
                  "3 Quick Study sessions a week",
                  "Live Study Rooms",
                  "The full public deck library",
                ].map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{ marginTop: 2, width: 17, height: 17, borderRadius: "50%", background: ELECTRIC_LIME, border: `1.5px solid ${PRIMARY}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Check size={10} strokeWidth={3.5} color={PRIMARY} />
                    </span>
                    <span style={{ fontFamily: FONT_BODY, fontSize: TYPE.body, color: PRIMARY, lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => goSignup("pricing_free")}
                style={{ marginTop: "auto", width: "100%", fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: TYPE.lead, background: "transparent", color: PRIMARY, border: `2.5px solid ${PRIMARY}`, borderRadius: R.control, padding: "13px 0", cursor: "pointer" }}>
                Get started free
              </button>
            </div>

            {/* Premium */}
            <div style={{ background: PRIMARY, border: `2.5px solid ${ELECTRIC_LIME}`, borderRadius: R.card, boxShadow: `6px 6px 0 ${ELECTRIC_LIME}`, padding: "30px 28px 32px", display: "flex", flexDirection: "column" }}>
              <p style={{ fontFamily: FONT_MONO, fontSize: TYPE.label, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: ELECTRIC_LIME, margin: "0 0 14px" }}>
                {PRICING_CYCLES[cycle].name}
              </p>
              <div style={{ display: "flex", alignItems: "flex-start", lineHeight: 1, marginBottom: 4 }}>
                <span style={{ fontFamily: FONT_DISPLAY, fontSize: TYPE.h3, fontWeight: 900, color: "#fff", marginTop: 6 }}>$</span>
                <span style={{ fontFamily: FONT_DISPLAY, fontSize: TYPE.hero, fontWeight: 900, color: "#fff" }}>{PRICING_CYCLES[cycle].price}</span>
              </div>
              <p style={{ fontFamily: FONT_BODY, fontSize: TYPE.body, color: "rgba(255,255,255,0.55)", margin: "0 0 20px" }}>
                {PRICING_CYCLES[cycle].note}
              </p>
              <p style={{ fontFamily: FONT_MONO, fontSize: TYPE.small, fontWeight: 700, color: "rgba(255,255,255,0.66)", margin: "0 0 14px", letterSpacing: "0.04em" }}>Everything in Free, plus</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 11, marginBottom: 28 }}>
                {[
                  PRICING_CYCLES[cycle].gens,
                  "AI Revision, Exam Simulator and Explain Back",
                  "Case Study mode and Interactive Mind Map",
                  "PDF Summarizer and AI notes",
                  "Podcast Mode",
                  "Medical Encyclopedia",
                ].map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{ marginTop: 2, width: 17, height: 17, borderRadius: "50%", background: ELECTRIC_LIME, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Check size={10} strokeWidth={3.5} color={PRIMARY} />
                    </span>
                    <span style={{ fontFamily: FONT_BODY, fontSize: TYPE.body, color: "rgba(255,255,255,0.88)", lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => goSignup("pricing_premium")}
                style={{ marginTop: "auto", width: "100%", fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: TYPE.lead, background: ELECTRIC_LIME, color: PRIMARY, border: `2.5px solid ${ELECTRIC_LIME}`, borderRadius: R.control, padding: "13px 0", cursor: "pointer" }}>
                Get Premium
              </button>
              <p style={{ fontFamily: FONT_MONO, fontSize: TYPE.label, color: "rgba(255,255,255,0.4)", textAlign: "center", margin: "12px 0 0" }}>Start on Free first, upgrade later</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────
          Ported wholesale from the previous landing page. It is load-bearing SEO: the four link
          columns plus <FooterFreeTools />, which renders all 41 free tools out
          of TOOL_GROUPS so a new tool reaches every footer without being typed
          again. The only changes are the brand colours (#11002e / lime instead
          of #111 / yellow) and three extra Product links, which carry the
          destinations the removed mobile hamburger used to hold. */}
      <footer className="site-footer text-white" style={{ background: PRIMARY, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-10 pb-12 border-b border-white/10">
            <div className="lg:col-span-2">
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: TYPE.h3, fontWeight: 900, color: ELECTRIC_LIME, marginBottom: 12, letterSpacing: -0.5 }}>FORKSAI</div>
              <p className="text-white/40 text-sm leading-relaxed max-w-xs mb-6">The AI study platform that turns your material into mastery. Built for students who want results, not just revision.</p>
              <div style={{ display: "flex", gap: 12 }}>
                {[Globe, MessageCircle, AtSign].map((Icon, i) => (
                  <a key={i} href="#" aria-label="FORKSAI social link" style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", textDecoration: "none" }}>
                    <Icon size={17} />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">Product</div>
              {[
                ["AI Flashcards", "/ai-flashcards"],
                ["PDF to Flashcards", "/pdf-to-flashcards"],
                ["Study Modes", "/learn"],
                ["AI Notes", "/notes"],
                ["AI Summarizer", "/ai-summarizer"],
                ["Study Tools", "/ai-study-tools"],
                ["Manual Flashcards", "/flashcards"],
                ["AI Podcasts", "/blog/ai-podcasts"],
                ["Import from Quizlet", "/blog/quizlet-alternative"],
                ["Spaced Repetition", "/blog/spaced-repetition"],
                ["Study modes", "/blog/study-modes"],
                ["Import from Anki", "/blog/anki-alternative"],
                ["Free student tools", "/tools"],
              ].map(([l, href]) => (
                <Link key={l} href={href} prefetch={false} className="block text-sm text-white/40 hover:text-white transition-colors mb-2 no-underline">{l}</Link>
              ))}
            </div>

            <div>
              <div className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">Resources</div>
              {[["Blog", "/blogs"], ["FAQ", "/faq"], ["Docs", "/docs"], ["RemNote alternative", "/remnote-alternative"], ["FORKSAI vs RemNote", "/forksai-vs-remnote"], ["FORKSAI vs Notion", "/forksai-vs-notion"], ["Flashcards and notes in one app", "/flashcards-and-notes-app"], ["Attendance Calculator", "/attendance-calculator"], ["AI Flashcards Guide", "/blog/flashcards"]].map(([l, href]) => (
                <Link key={l} href={href} prefetch={false} className="block text-sm text-white/40 hover:text-white transition-colors mb-2 no-underline">{l}</Link>
              ))}
            </div>

            <div>
              <div className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">Company</div>
              {[["Work with us", "/apply"], ["Creator Program", "/apply/creators"], ["Ambassador Program", "/apply/ambassadors"]].map(([l, href]) => (
                <Link key={l} href={href} prefetch={false} className="block text-sm text-white/40 hover:text-white transition-colors mb-2 no-underline">{l}</Link>
              ))}
              <button onClick={() => setShowEarnPrompt(true)} className="block text-left text-sm text-white/40 hover:text-white transition-colors mb-2 bg-transparent border-0 p-0 cursor-pointer">
                Earn with FORKSAI
              </button>
            </div>

            <div>
              <div className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">Legal</div>
              {[["Privacy Policy", "/privacy-policy"], ["Terms of Service", "/terms"], ["Refund Policy", "/refund-policy"]].map(([l, href]) => (
                <Link key={l} href={href} prefetch={false} className="block text-sm text-white/40 hover:text-white transition-colors mb-2 no-underline">{l}</Link>
              ))}
            </div>
          </div>

          <div id="free-tools">
            <FooterFreeTools />
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-white/30 text-xs">2026 FORKSAI. All rights reserved.</span>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes ping {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
        html { scroll-behavior: smooth; }
        /* The nav is fixed at 64px, so an anchored section would otherwise land
           with its heading underneath it. */
        section[id], #free-tools { scroll-margin-top: 84px; }
        @media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
        @media (max-width: 768px) {
          .bento-grid > *[style*="span 2"] { grid-column: span 1 !important; }
          .bento-grid { grid-template-columns: 1fr !important; }

          /* Hero */
          .hero-h1 { letter-spacing: -1px !important; margin-bottom: 24px !important; }
          .hero-cta-btn { padding: 16px 32px !important; box-shadow: 5px 5px 0 #11002e !important; }
          .hero-video-wrap { margin: 32px auto -80px !important; padding: 0 16px !important; }

          /* Testimonials */
          .section-testimonials { padding-top: 120px !important; }

          /* Pricing */
          .pricing-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
