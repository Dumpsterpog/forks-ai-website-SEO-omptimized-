"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { goToDashboard } from "@/lib/goToDashboard";
import { trackSignupClick } from "@/lib/track";
import { TOOLS } from "@/lib/studentTools";

// The four free calculators share a nav, a footer, a cross-link strip and one
// CTA, so they live here rather than being pasted into each page. Visual
// language is the landing page's: flat colour, 2px black borders, hard offset
// shadows, no gradients.
export const ACCENT = "#F0D44A";
export const INK = "#111111";
export const PAGE_BG = "#EEEEE8";

// Reusable class strings. Kept as constants so every input on every tool page
// gets the same visible focus ring and the same touch target on a phone.
export const inputClass =
  "w-full border-2 border-black rounded-xl bg-white px-4 py-3 text-base font-bold text-[#111] " +
  "outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A] focus-visible:border-black " +
  "placeholder:font-normal placeholder:text-[#999]";

export const labelClass = "block text-sm font-bold text-[#111] mb-2";
export const hintClass = "text-xs text-[#666] mt-1.5 leading-relaxed";

export const cardClass =
  "border-2 border-black rounded-2xl bg-white shadow-[4px_4px_0_#111]";

export const buttonClass =
  "inline-flex items-center justify-center gap-2 border-2 border-black rounded-xl px-4 py-2.5 " +
  "text-sm font-bold text-[#111] bg-white shadow-[3px_3px_0_#111] transition-all " +
  "hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5 " +
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]";

export function ToolNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className="sticky top-3 z-50 px-3 sm:px-4 print:hidden">
      <div
        className="mx-auto max-w-6xl bg-white border-2 border-black flex items-center justify-between gap-3 px-4 sm:px-6 transition-all duration-300"
        style={{
          borderRadius: 16,
          boxShadow: scrolled ? "3px 3px 0 #111" : "4px 4px 0 #111",
          height: scrolled ? 60 : 68,
        }}
      >
        <Link href="/" className="flex items-center gap-2 shrink-0 no-underline">
          <Image src="/forks-logo.png" alt="" width={4800} height={2700} priority className="h-6 w-auto" />
          <span className="font-serif font-black text-lg text-[#111] tracking-tight">FORKSAI</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/tools"
            className="hidden sm:inline-flex text-sm font-bold text-[#111] border-2 border-black rounded-xl px-4 py-2 bg-white shadow-[3px_3px_0_#111] no-underline transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
          >
            Free tools
          </Link>
          <button
            onClick={() => {
              trackSignupClick("tools_nav", "signup");
              goToDashboard();
            }}
            className="whitespace-nowrap text-sm font-bold text-[#111] border-2 border-black rounded-xl px-3 sm:px-4 py-2 shadow-[3px_3px_0_#111] transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white"
            style={{ background: ACCENT }}
          >
            Start for free
          </button>
        </div>
      </div>
    </nav>
  );
}

// One CTA per tool page, placed after the useful content rather than over it.
// The tools themselves never ask for an account, and the copy says so.
export function ToolCta({ heading, body, location }) {
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-4 print:hidden">
      <div className={`${cardClass} p-6 sm:p-8`} style={{ background: ACCENT }}>
        <h2 className="font-serif font-black text-2xl sm:text-3xl text-[#111] mb-3 leading-tight">
          {heading}
        </h2>
        <p className="text-sm sm:text-[15px] text-[#111]/80 leading-relaxed mb-6 max-w-xl">{body}</p>
        <button
          onClick={() => {
            trackSignupClick(location, "signup");
            goToDashboard();
          }}
          className="inline-flex items-center gap-2 border-2 border-black rounded-xl px-5 py-3 text-sm font-black text-[#111] bg-white shadow-[3px_3px_0_#111] transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white"
        >
          Try FORKSAI free <ArrowRight size={16} strokeWidth={2.75} />
        </button>
        <p className="text-xs text-[#111]/60 mt-3">
          The calculator above stays free and needs no account.
        </p>
      </div>
    </section>
  );
}

// Internal linking is what makes the four pages rank as a set instead of four
// orphans, so every tool page links to the hub and to its three siblings.
export function ToolCrossLinks({ current }) {
  const others = TOOLS.filter((t) => t.href !== current);
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10 print:hidden">
      <h2 className="font-serif font-black text-xl text-[#111] mb-4">More free student tools</h2>
      <div className="grid sm:grid-cols-3 gap-3">
        {others.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="block border-2 border-black rounded-xl bg-white p-4 no-underline shadow-[3px_3px_0_#111] transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
          >
            <span className="block font-bold text-sm text-[#111] mb-1.5">{tool.name}</span>
            <span className="block text-xs text-[#666] leading-relaxed">{tool.blurb}</span>
          </Link>
        ))}
      </div>
      <p className="text-sm text-[#555] mt-4">
        See all of them on the{" "}
        <Link href="/tools" className="font-bold text-[#111] underline underline-offset-2">
          free student tools hub
        </Link>
        .
      </p>
    </section>
  );
}

export function ToolFooter() {
  return (
    <footer className="border-t-2 border-black text-white print:hidden" style={{ background: INK }}>
      <div className="max-w-6xl mx-auto px-6 pt-12 pb-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-white/10">
          <div>
            <div className="font-serif font-black text-xl text-white mb-3">FORKSAI</div>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              The AI study platform that turns your material into mastery.
            </p>
          </div>
          <div>
            <div className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">Free tools</div>
            <Link href="/tools" className="block text-sm text-white/40 hover:text-white transition-colors mb-2 no-underline">
              All free tools
            </Link>
            {TOOLS.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="block text-sm text-white/40 hover:text-white transition-colors mb-2 no-underline"
              >
                {tool.name}
              </Link>
            ))}
          </div>
          <div>
            <div className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">Product</div>
            {[
              ["AI Flashcards", "/ai-flashcards"],
              ["PDF to Flashcards", "/pdf-to-flashcards"],
              ["AI Summarizer", "/ai-summarizer"],
              ["Study Tools", "/ai-study-tools"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="block text-sm text-white/40 hover:text-white transition-colors mb-2 no-underline"
              >
                {label}
              </Link>
            ))}
          </div>
          <div>
            <div className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">Company</div>
            {[
              ["Blog", "/blogs"],
              ["FAQ", "/faq"],
              ["Privacy Policy", "/privacy-policy"],
              ["Terms of Service", "/terms"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="block text-sm text-white/40 hover:text-white transition-colors mb-2 no-underline"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-white/30 text-xs">{new Date().getFullYear()} FORKSAI. All rights reserved.</span>
          <span className="text-white/30 text-xs">Made for students, by students.</span>
        </div>
      </div>
    </footer>
  );
}

export default function ToolPageShell({ children }) {
  return (
    <div className="min-h-screen font-sans" style={{ background: PAGE_BG, color: INK }}>
      <ToolNav />
      <main className="pt-8 pb-4">{children}</main>
      <ToolFooter />
    </div>
  );
}

// Shared prose blocks so the supporting content below each calculator looks
// like one system across the four pages.
export function ToolSection({ title, children, id }) {
  return (
    <section id={id} className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h2 className="font-serif font-black text-2xl sm:text-[1.75rem] text-[#111] mb-4 leading-tight">
        {title}
      </h2>
      <div className="text-[15px] text-[#333] leading-relaxed space-y-4">{children}</div>
    </section>
  );
}

export function FormulaBlock({ children }) {
  return (
    <div className="border-2 border-black rounded-xl bg-white px-4 py-3 font-mono text-[13px] font-bold text-[#111] overflow-x-auto">
      {children}
    </div>
  );
}

export function FaqList({ items }) {
  return (
    <dl className="space-y-4">
      {items.map((item) => (
        <div key={item.q} className="border-2 border-black rounded-xl bg-white p-5">
          <dt className="font-bold text-[15px] text-[#111] mb-2">{item.q}</dt>
          <dd className="text-sm text-[#555] leading-relaxed">{item.a}</dd>
        </div>
      ))}
    </dl>
  );
}
