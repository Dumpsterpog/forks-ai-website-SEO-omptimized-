"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ToolPageShell, {
  ToolCta,
  ToolSection,
  cardClass,
} from "@/components/ToolPageShell";
import { TOOL_GROUPS, ALL_TOOLS } from "@/app/tools/toolGroups";

// The one-liner that goes under each card on the hub. Longer than the shared
// blurb used in the cross-link strips, because this is the page where a
// visitor decides which tool they came for. Only the four calculators carry
// one; every other card falls back to the blurb its list already defines.
const DETAIL = {
  "/attendance-calculator":
    "Set your own threshold, enter classes attended and held, and get both answers at once: the classes you can still miss, and the unbroken run you would need to climb back above the line.",
  "/final-grade-calculator":
    "Get the score your final exam has to earn for the overall grade you want, plus the best grade still reachable and the grade already locked in whatever happens in the exam hall.",
  "/cgpa-to-percentage-calculator":
    "Convert a 10-point CGPA, a 4-point GPA and a percentage in any direction. Choose between the CBSE multiply by 9.5 rule and the other conventions in use, and see the formula applied.",
  "/text-to-flashcards":
    "Paste notes written as Q and A lines, tabs, dashes, colons or alternating lines. Edit the parsed cards, then export to CSV, to Anki, or to your printer.",
};

function ToolCard({ tool }) {
  return (
    <Link
      href={tool.href}
      className={`${cardClass} p-5 sm:p-6 no-underline transition-all hover:shadow-[2px_2px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A] flex flex-col`}
    >
      <span className="font-serif font-black text-lg sm:text-xl text-[#111] mb-2 leading-tight">
        {tool.name}
      </span>
      <span className="text-sm text-[#555] leading-relaxed flex-1">
        {DETAIL[tool.href] || tool.blurb}
      </span>
      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#111] mt-4">
        Open the tool <ArrowRight size={15} strokeWidth={2.75} />
      </span>
    </Link>
  );
}

export default function StudentToolsHubContent() {
  return (
    <ToolPageShell>
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif font-black text-3xl sm:text-[2.8rem] leading-[1.06] text-[#111] mb-4">
          Free tools for students
        </h1>
        <p className="text-[15px] sm:text-base text-[#444] leading-relaxed mb-6 max-w-2xl">
          {ALL_TOOLS.length} tools that each do one job and do it properly. No
          account, no email, no limits, and nothing you type or open is sent
          anywhere. They all run in your browser, which is also why they are
          free to keep running.
        </p>

        <nav aria-label="Tool categories" className="flex flex-wrap gap-2 mb-12">
          {TOOL_GROUPS.map((group) => (
            <a
              key={group.id}
              href={`#${group.id}`}
              className="inline-flex items-center gap-2 border-2 border-black rounded-xl bg-white px-3.5 py-2 text-sm font-bold text-[#111] no-underline shadow-[3px_3px_0_#111] transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
            >
              {group.title}
              <span className="text-xs font-bold text-[#777]">{group.tools.length}</span>
            </a>
          ))}
        </nav>

        {TOOL_GROUPS.map((group) => (
          <section key={group.id} id={group.id} className="mb-14 scroll-mt-24">
            <h2 className="font-serif font-black text-2xl sm:text-[1.75rem] text-[#111] mb-2 leading-tight">
              {group.title}
            </h2>
            <p className="text-[15px] text-[#555] leading-relaxed mb-5 max-w-2xl">
              {group.intro}
            </p>
            <div
              className={`grid gap-4 sm:grid-cols-2 ${group.wide ? "" : "lg:grid-cols-3"}`}
            >
              {group.tools.map((tool) => (
                <ToolCard key={tool.href} tool={tool} />
              ))}
            </div>
          </section>
        ))}
      </section>

      <ToolSection title="Why these run in your browser">
        <p>
          Every tool on this page is arithmetic, string handling, or work the
          browser can already do to a file it has open. An attendance
          percentage is a division. A required final exam score is a rearranged
          weighted average. Resizing a photo is a canvas draw and an encode.
          Merging two PDFs is reading the bytes of both and writing new ones.
        </p>
        <p>
          None of that needs a server, so none of it uses one. Your numbers,
          your notes and your files stay on your device, the pages work on a
          slow connection, and there is no usage cap to enforce because there is
          no cost per use to recover.
        </p>
      </ToolSection>

      <ToolSection title="Where the AI tools sit">
        <p>
          The tools above are deliberately dumb, and that is what makes them
          reliable. When you need something that has to actually read your
          material, that is a different job:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <Link href="/ai-flashcards" className="font-bold text-[#111] underline underline-offset-2">
              AI flashcard generator
            </Link>{" "}
            writes question and answer pairs from notes that were never written
            in pairs.
          </li>
          <li>
            <Link href="/pdf-to-flashcards" className="font-bold text-[#111] underline underline-offset-2">
              PDF to flashcards
            </Link>{" "}
            takes lecture slides and textbook chapters straight to a deck.
          </li>
          <li>
            <Link href="/ai-summarizer" className="font-bold text-[#111] underline underline-offset-2">
              AI summarizer
            </Link>{" "}
            pulls the exam-relevant points out of long readings.
          </li>
          <li>
            <Link href="/ai-study-tools" className="font-bold text-[#111] underline underline-offset-2">
              All AI study tools
            </Link>{" "}
            covers the study modes, spaced repetition and progress tracking.
          </li>
        </ul>
      </ToolSection>

      <ToolCta
        location="tools_hub"
        heading="One place for the tools and the studying"
        body="FORKSAI turns your notes, slides and PDFs into flashcards, quizzes and spaced repetition sessions. The tools on this page stay free either way."
      />
    </ToolPageShell>
  );
}
