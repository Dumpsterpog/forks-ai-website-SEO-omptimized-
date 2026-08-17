"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { goToDashboard } from "@/lib/goToDashboard";
import { trackSignupClick } from "@/lib/track";
import { COMPARE_PAGES } from "@/lib/comparePages";
import { ToolNav, ToolFooter, ACCENT, INK, PAGE_BG } from "@/components/ToolPageShell";

// The comparison and alternative pages reuse the tool pages' nav and footer so
// the site reads as one thing, but they need their own hero, their own CTA and
// their own cross-link strip. Those three live here.
//
// No competitor column anywhere in this file by design. Every claim on these
// pages about another product has to be something a reader can check in a
// minute, and a grid of ticks and crosses is the fastest way to end up
// asserting something about a company that is out of date or was never true.

export default function ComparePageShell({ children }) {
  return (
    <div className="min-h-screen font-sans" style={{ background: PAGE_BG, color: INK }}>
      <ToolNav />
      <main className="pt-8 pb-4">{children}</main>
      <ToolFooter />
    </div>
  );
}

export function CompareHero({ eyebrow, title, intro }) {
  return (
    <header className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-4">
      <div className="text-xs font-black uppercase tracking-[0.2em] text-[#555] mb-4">
        {eyebrow}
      </div>
      <h1 className="font-serif font-black text-3xl sm:text-5xl text-[#111] leading-[1.08] mb-5">
        {title}
      </h1>
      <p className="text-[17px] text-[#333] leading-relaxed">{intro}</p>
    </header>
  );
}

// The honesty note. Sits high on every comparison page, above the first
// competitor mention, because a reader who has just landed from a "X vs Y"
// search deserves to know what this page will and will not assert.
export function AccuracyNote({ product }) {
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
      <div className="border-2 border-black rounded-2xl bg-white p-5 sm:p-6">
        <h2 className="font-bold text-[15px] text-[#111] mb-2">
          How we handle claims about {product}
        </h2>
        <p className="text-sm text-[#555] leading-relaxed">
          This page is written by FORKSAI, so treat it as our side of the
          argument. We keep statements about {product} to broad things you can
          confirm on their own site in under a minute, and we do not list their
          prices, their limits or their feature set, because those change and a
          stale table here would mislead you. Everything specific on this page is
          about FORKSAI, where we can be held to it. Check {product} directly
          before you decide.
        </p>
      </div>
    </section>
  );
}

// Two columns, never three. The left column is the job the reader came to get
// done, the right is how FORKSAI does it, and there is deliberately no column
// for the other product.
export function CompareTable({ caption, rows }) {
  return (
    <div className="border-2 border-black rounded-2xl overflow-hidden shadow-[4px_4px_0_#111] bg-white overflow-x-auto">
      <table className="w-full border-collapse" style={{ minWidth: 520 }}>
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr className="border-b-2 border-black" style={{ background: PAGE_BG }}>
            <th scope="col" className="text-left px-5 py-3.5 text-xs font-black text-[#555] uppercase tracking-widest">
              What you want to do
            </th>
            <th scope="col" className="text-left px-5 py-3.5 text-xs font-black text-[#555] uppercase tracking-widest">
              How FORKSAI does it
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.job} className="border-t-2 border-black/10 align-top">
              <th scope="row" className="text-left px-5 py-4 text-sm font-bold text-[#111] w-[38%]">
                {row.job}
              </th>
              <td className="px-5 py-4 text-sm text-[#444] leading-relaxed">{row.forksai}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// The section that stops this being a sales sheet. Every comparison page has
// one, and it names real cases where the other tool is the better answer.
export function BetterElsewhere({ children }) {
  return (
    <div className="border-2 border-black rounded-2xl p-5 sm:p-6" style={{ background: "#FFF3E0" }}>
      <div className="text-sm text-[#333] leading-relaxed space-y-3">{children}</div>
    </div>
  );
}

export function CompareCta({ heading, body, location }) {
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="border-2 border-black rounded-2xl shadow-[4px_4px_0_#111] p-6 sm:p-8" style={{ background: ACCENT }}>
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
          Free plan, no card needed. Bring one PDF and see what comes out.
        </p>
      </div>
    </section>
  );
}

// Internal linking is the whole reason these four pages can rank as a set
// rather than as four orphans, so each one links to the other three and to the
// feature pages a reader would want next.
export function CompareCrossLinks({ current }) {
  const others = COMPARE_PAGES.filter((page) => page.href !== current);
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h2 className="font-serif font-black text-xl text-[#111] mb-4">Keep comparing</h2>
      <div className="grid sm:grid-cols-3 gap-3">
        {others.map((page) => (
          <Link
            key={page.href}
            href={page.href}
            className="block border-2 border-black rounded-xl bg-white p-4 no-underline shadow-[3px_3px_0_#111] transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
          >
            <span className="block font-bold text-sm text-[#111] mb-1.5">{page.name}</span>
            <span className="block text-xs text-[#666] leading-relaxed">{page.blurb}</span>
          </Link>
        ))}
      </div>
      <p className="text-sm text-[#555] mt-4 leading-relaxed">
        Also worth a look:{" "}
        <Link href="/blog/anki-alternative" className="font-bold text-[#111] underline underline-offset-2">
          the Anki alternative writeup
        </Link>
        ,{" "}
        <Link href="/blog/quizlet-alternative" className="font-bold text-[#111] underline underline-offset-2">
          the Quizlet one
        </Link>
        , and{" "}
        <Link href="/blog/fsrs-vs-sm2" className="font-bold text-[#111] underline underline-offset-2">
          why FSRS beats SM-2
        </Link>
        .
      </p>
    </section>
  );
}
