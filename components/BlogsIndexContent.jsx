"use client";

import { goToDashboard } from "@/lib/goToDashboard";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Search, Clock, User } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import AuthModal from "@/components/AuthModal";

const CAT_STYLES = {
  "Study Science": { bg: "#E8E0FF", border: "#7C3AED", text: "#7C3AED" },
  "Exam Tips":     { bg: "#FFF3E0", border: "#EA580C", text: "#EA580C" },
  "Productivity":  { bg: "#F0F9E8", border: "#5CB85C", text: "#3d7a3d" },
  "AI Tools":      { bg: "#E0F4FF", border: "#0891B2", text: "#0891B2" },
  "Memory":        { bg: "#FFE8E8", border: "#DC2626", text: "#DC2626" },
};

function CategoryBadge({ label }) {
  const s = CAT_STYLES[label] || CAT_STYLES["AI Tools"];
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2"
      style={{ background: s.bg, borderColor: s.border, color: s.text }}
    >
      {label}
    </span>
  );
}

const BLOGS = [
  {
    title: "Active recall: the study technique that actually works",
    desc: "Testing yourself is the single most effective study method science has found. Here is what active recall is, why it works, and how to do it properly.",
    link: "/blog/active-recall",
    category: "Study Science",
    author: "Jordan Lee",
    date: "May 2026",
    readTime: "5 min",
    featured: true,
  },
  {
    title: "How to prepare for any exam in 2 weeks",
    desc: "A realistic week-by-week plan built around spaced repetition and active recall — not wishful thinking.",
    link: "/blog/exam-prep",
    category: "Exam Tips",
    author: "Sam Rivera",
    date: "May 2026",
    readTime: "6 min",
  },
  {
    title: "Why your study schedule keeps falling apart",
    desc: "Most schedules fail within a week. Here is a simpler, more honest approach that survives real student life.",
    link: "/blog/study-schedule",
    category: "Productivity",
    author: "Alex Morgan",
    date: "April 2026",
    readTime: "5 min",
  },
  {
    title: "FSRS-5 vs SM-2: the algorithm upgrade that actually matters",
    desc: "SM-2 has powered spaced repetition for 30 years. Here is a technical breakdown of why FSRS-5 is more accurate and what changes when you upgrade.",
    link: "/blog/fsrs-vs-sm2",
    category: "Study Science",
    author: "Avery Chen",
    date: "May 2026",
    readTime: "9 min",
  },
  {
    title: "Spaced repetition: the secret to passing heavy exams",
    desc: "Cramming does not work for long-term memory. Let us look at the forgetting curve and how to beat it permanently.",
    link: "/blog/spaced-repetition",
    category: "Memory",
    author: "Avery Chen",
    date: "February 2026",
    readTime: "7 min",
  },
  {
    title: "Why traditional flashcards are slowing you down",
    desc: "Making cards by hand steals hours from actually studying them. Here is a fundamentally better approach.",
    link: "/blog/flashcards",
    category: "AI Tools",
    author: "Alex Morgan",
    date: "April 2026",
    readTime: "4 min",
  },
  {
    title: "I stopped taking notes in lecture. Here is what happened.",
    desc: "Transcribing a lecture word-for-word is inefficient. Automating note summaries changes how you actually learn.",
    link: "/blog/notes-maker",
    category: "AI Tools",
    author: "Sam Rivera",
    date: "April 2026",
    readTime: "5 min",
  },
  {
    title: "The problem with rereading the textbook",
    desc: "Rereading feels productive but tricks your brain. You recognise the words so you think you know the material.",
    link: "/blog/study-modes",
    category: "Study Science",
    author: "Jordan Lee",
    date: "March 2026",
    readTime: "6 min",
  },
  {
    title: "Turning downtime into learning time with audio",
    desc: "Commuting, walking, doing the dishes — these are lost hours. Listening to your notes as audio reclaims your day.",
    link: "/blog/ai-podcasts",
    category: "AI Tools",
    author: "Taylor Reed",
    date: "March 2026",
    readTime: "4 min",
  },
];

const ALL_CATS = ["All", ...Array.from(new Set(BLOGS.map(b => b.category)))];

export default function BlogsIndexContent() {
  const [showAuth, setShowAuth]           = useState(false);
  const [user, setUser]                   = useState(null);
  const [searchQuery, setSearchQuery]     = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    return onAuthStateChanged(auth, u => setUser(u));
  }, []);

  const filtered = BLOGS.filter(b => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || b.title.toLowerCase().includes(q) || b.desc.toLowerCase().includes(q);
    const matchCat    = activeCategory === "All" || b.category === activeCategory;
    return matchSearch && matchCat;
  });

  const featured = filtered.find(b => b.featured && !searchQuery && activeCategory === "All");
  const rest      = filtered.filter(b => !featured || b.link !== featured.link);

  const goSignup = () => setShowAuth(true);

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
            <a href="/#pricing" className="hidden sm:block text-sm font-bold text-[#111] border-2 border-black rounded-xl px-4 py-2 bg-white shadow-[3px_3px_0_#111] transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5">
              Pricing
            </a>
            {user ? (
              <a href="/dashboard" className="text-sm font-bold text-[#111] border-2 border-black rounded-xl px-4 py-2 bg-white shadow-[3px_3px_0_#111] transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5">
                Dashboard
              </a>
            ) : (
              <button onClick={goSignup} className="text-sm font-bold text-[#111] border-2 border-black rounded-xl px-4 py-2 bg-white shadow-[3px_3px_0_#111] transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5">
                Sign In
              </button>
            )}
            <button onClick={goSignup} className="text-sm font-bold text-[#111] border-2 border-black rounded-xl px-3 sm:px-4 py-2 shadow-[3px_3px_0_#111] transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5" style={{ background: "#F0D44A" }}>
              Start for Free
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-16">

        {/* ── HERO ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-14">
          <div className="inline-block border-2 border-black rounded-full px-4 py-1 text-xs font-black text-[#111] mb-5 bg-white shadow-[2px_2px_0_#111]">
            The Blog
          </div>
          <h1 className="font-serif font-black text-5xl sm:text-6xl text-[#111] leading-tight mb-5">
            Study smarter.<br />
            <span style={{ WebkitTextDecoration: "underline", textDecoration: "underline", textDecorationColor: "#F0D44A", textDecorationThickness: "4px", textUnderlineOffset: "6px" }}>
              Not harder.
            </span>
          </h1>
          <p className="text-base text-[#555] leading-relaxed max-w-xl">
            Science-backed guides on active recall, spaced repetition, and how AI is changing the way students revise and remember.
          </p>
        </motion.div>

        {/* ── SEARCH + FILTER ── */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-12">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999]" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-black bg-white text-sm text-[#111] placeholder-[#999] focus:outline-none focus:border-yellow shadow-[2px_2px_0_#111] transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {ALL_CATS.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-3 py-1.5 rounded-xl text-[11px] font-black border-2 border-black transition-all shadow-[2px_2px_0_#111] hover:shadow-[1px_1px_0_#111] hover:translate-x-px hover:translate-y-px"
                style={{ background: activeCategory === cat ? "#F0D44A" : "#fff", color: "#111" }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── FEATURED ── */}
        {featured && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
            <a
              href={featured.link}
              className="group block bg-white border-2 border-black rounded-xl shadow-[4px_4px_0_#111] overflow-hidden transition-all hover:shadow-[2px_2px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5"
            >
              <div className="p-8 sm:p-10 flex flex-col sm:flex-row gap-8 items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <CategoryBadge label={featured.category} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#555] border-2 border-black rounded-full px-2.5 py-0.5 bg-yellow">
                      Featured
                    </span>
                  </div>
                  <h2 className="font-serif font-black text-3xl sm:text-4xl text-[#111] leading-tight mb-4 group-hover:opacity-80 transition-opacity">
                    {featured.title}
                  </h2>
                  <p className="text-[#555] text-base leading-relaxed mb-6 max-w-2xl">{featured.desc}</p>
                  <div className="flex items-center gap-4 text-[11px] text-[#999]">
                    <span className="flex items-center gap-1.5"><User size={11} />{featured.author}</span>
                    <span className="w-1 h-1 rounded-full bg-[#ccc]" />
                    <span className="flex items-center gap-1.5"><Clock size={11} />{featured.readTime} read</span>
                    <span className="w-1 h-1 rounded-full bg-[#ccc]" />
                    <span>{featured.date}</span>
                  </div>
                </div>
                <div className="shrink-0 self-center">
                  <div className="w-12 h-12 rounded-xl border-2 border-black bg-yellow shadow-[3px_3px_0_#111] flex items-center justify-center transition-all group-hover:shadow-[1px_1px_0_#111] group-hover:translate-x-0.5 group-hover:translate-y-0.5">
                    <ArrowRight size={20} className="text-[#111]" />
                  </div>
                </div>
              </div>
            </a>
          </motion.div>
        )}

        {/* ── GRID ── */}
        {rest.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rest.map((blog, i) => (
              <motion.div
                key={blog.link}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.04 }}
              >
                <a
                  href={blog.link}
                  className="group flex flex-col h-full bg-white border-2 border-black rounded-xl shadow-[3px_3px_0_#111] p-6 transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <CategoryBadge label={blog.category} />
                    <span className="text-[10px] flex items-center gap-1 text-[#999] font-bold">
                      <Clock size={9} />{blog.readTime}
                    </span>
                  </div>
                  <h2 className="font-serif font-black text-lg text-[#111] leading-snug mb-3 flex-1 group-hover:opacity-75 transition-opacity">
                    {blog.title}
                  </h2>
                  <p className="text-sm text-[#555] leading-relaxed mb-5 line-clamp-2">{blog.desc}</p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t-2 border-black/10">
                    <div className="flex items-center gap-2 text-[#999]">
                      <User size={10} />
                      <span className="text-[11px] font-medium">{blog.author}</span>
                      <span className="text-[11px]">· {blog.date}</span>
                    </div>
                    <div className="w-7 h-7 rounded-lg border-2 border-black bg-yellow shadow-[2px_2px_0_#111] flex items-center justify-center transition-all group-hover:shadow-[1px_1px_0_#111] group-hover:translate-x-0.5 group-hover:translate-y-0.5">
                      <ArrowRight size={12} className="text-[#111]" />
                    </div>
                  </div>
                </a>
              </motion.div>
            ))}
          </div>
        ) : filtered.length === 0 && (
          <div className="py-24 text-center bg-white border-2 border-black rounded-xl shadow-[4px_4px_0_#111]">
            <p className="text-lg font-bold text-[#111]">No articles found.</p>
            <p className="text-sm text-[#555] mt-1">Try a different search or category.</p>
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
              {["Dashboard", "AI Flashcards", "Study Modes", "Study Rooms", "Public Decks"].map(l => (
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
