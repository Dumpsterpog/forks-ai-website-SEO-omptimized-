"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ToolPageShell, {
  ToolCta,
  ToolSection,
  cardClass,
} from "@/components/ToolPageShell";
import { TOOLS } from "@/lib/studentTools";

// The one-liner that goes under each card on the hub. Longer than the shared
// blurb used in the cross-link strips, because this is the page where a
// visitor decides which tool they came for.
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

export default function StudentToolsHubContent() {
  return (
    <ToolPageShell>
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif font-black text-3xl sm:text-[2.8rem] leading-[1.06] text-[#111] mb-4">
          Free tools for students
        </h1>
        <p className="text-[15px] sm:text-base text-[#444] leading-relaxed mb-8 max-w-2xl">
          Four calculators that do one job each and do it properly. No account,
          no email, no limits, and nothing you type is sent anywhere. They all
          run in your browser, which is also why they are free to keep running.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className={`${cardClass} p-6 no-underline transition-all hover:shadow-[2px_2px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A] flex flex-col`}
            >
              <span className="font-serif font-black text-xl text-[#111] mb-2 leading-tight">
                {tool.name}
              </span>
              <span className="text-sm text-[#555] leading-relaxed flex-1">
                {DETAIL[tool.href]}
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#111] mt-4">
                Open the tool <ArrowRight size={15} strokeWidth={2.75} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <ToolSection title="Why these run in your browser">
        <p>
          Every one of these tools is arithmetic or string handling. An
          attendance percentage is a division. A required final exam score is a
          rearranged weighted average. A CGPA conversion is a multiplication. A
          set of flashcards parsed out of Q and A lines is a string split.
        </p>
        <p>
          None of that needs a server, so none of it uses one. Your numbers and
          your notes stay on your device, the pages work on a slow connection,
          and there is no usage cap to enforce because there is no cost per use
          to recover.
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
        heading="Four calculators, one study platform"
        body="FORKSAI turns your notes, slides and PDFs into flashcards, quizzes and spaced repetition sessions. The calculators above stay free either way."
      />
    </ToolPageShell>
  );
}
