"use client";

import { useEffect, useMemo, useState } from "react";
import ToolPageShell, {
  ToolCta,
  ToolCrossLinks,
  ToolSection,
  FormulaBlock,
  FaqList,
  cardClass,
  inputClass,
  labelClass,
  hintClass,
} from "@/components/ToolPageShell";
import { calcAttendance, round, plural } from "@/lib/studyToolMath";
import { ATTENDANCE_FAQS } from "@/lib/toolFaqs";
import { countToolUseOnResult } from "@/lib/toolUsage";

const ERRORS = {
  incomplete: "Fill in all three boxes to see your answer.",
  held: "Total classes held has to be at least 1.",
  attended: "Classes attended cannot be more than classes held.",
  threshold: "The required attendance has to be between 1 and 100.",
};

function NumberField({ id, label, hint, value, onChange, min, max, step, suffix }) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          min={min}
          max={max}
          step={step ?? 1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} ${suffix ? "pr-12" : ""}`}
        />
        {suffix ? (
          <span
            aria-hidden="true"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#666]"
          >
            {suffix}
          </span>
        ) : null}
      </div>
      {hint ? <p className={hintClass}>{hint}</p> : null}
    </div>
  );
}

export default function AttendanceCalculatorContent() {
  const [attended, setAttended] = useState("30");
  const [held, setHeld] = useState("40");
  const [threshold, setThreshold] = useState("75");

  const result = useMemo(
    () => calcAttendance(attended, held, threshold),
    [attended, held, threshold]
  );

  // These three predate the shared calculator shell, so the usage count is
  // wired here rather than in ResultCard. Keyed on the result, and ignored
  // before the first real input, so the prefilled defaults do not count.
  useEffect(() => {
    countToolUseOnResult();
  }, [result]);

  return (
    <ToolPageShell>
      {/* The calculator sits first. Everything explanatory is below it. */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif font-black text-3xl sm:text-[2.6rem] leading-[1.08] text-[#111] mb-3">
          Attendance calculator
        </h1>
        <p className="text-[15px] sm:text-base text-[#444] leading-relaxed mb-6 max-w-2xl">
          Enter what you have attended so far and see two things at once: how many
          classes you can still miss, and how many you would have to attend in a
          row to climb back above the line. Free, no signup, works on your phone.
        </p>

        <div className={`${cardClass} p-5 sm:p-7`}>
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-5">
            <NumberField
              id="attended"
              label="Classes attended"
              value={attended}
              onChange={setAttended}
              min={0}
            />
            <NumberField
              id="held"
              label="Total classes held"
              value={held}
              onChange={setHeld}
              min={1}
            />
            <NumberField
              id="threshold"
              label="Required attendance"
              value={threshold}
              onChange={setThreshold}
              min={1}
              max={100}
              step={0.5}
              suffix="%"
              hint="75% is the usual rule. Change it to match your college."
            />
          </div>

          {/* aria-live so a screen reader hears the answer change as you type,
              without a Calculate button in the way. */}
          <div aria-live="polite" className="mt-6">
            {!result.ok ? (
              <p className="border-2 border-black rounded-xl bg-white px-4 py-4 text-sm font-bold text-[#111]">
                {ERRORS[result.reason] || ERRORS.incomplete}
              </p>
            ) : (
              <div className="space-y-3">
                <div className="border-2 border-black rounded-xl px-4 py-4" style={{ background: "#F0D44A" }}>
                  <p className="text-[11px] font-black uppercase tracking-widest text-[#111]/60 mb-1">
                    Where you stand
                  </p>
                  <p className="font-serif font-black text-2xl sm:text-3xl text-[#111] leading-tight">
                    {round(result.current)}% attendance
                  </p>
                  <p className="text-sm text-[#111]/75 mt-1.5 leading-relaxed">
                    You have attended {result.attended} of {result.held}{" "}
                    {plural(result.held, "class", "classes")} and missed{" "}
                    {result.missedSoFar}.{" "}
                    {result.meets
                      ? `That is at or above the ${round(result.threshold)}% requirement.`
                      : `That is below the ${round(result.threshold)}% requirement.`}
                  </p>
                </div>

                {result.meets ? (
                  <div className="border-2 border-black rounded-xl bg-white px-4 py-4">
                    <p className="text-[11px] font-black uppercase tracking-widest text-[#666] mb-1">
                      How many you can skip
                    </p>
                    <p className="text-[15px] sm:text-base text-[#111] leading-relaxed font-bold">
                      {result.canSkip === 0
                        ? `You cannot miss another class. You are sitting exactly on the ${round(result.threshold)}% line, so the very next absence takes you below it.`
                        : `You can miss ${result.canSkip} more ${plural(result.canSkip, "class", "classes")} and still be above ${round(result.threshold)}%. After skipping all ${result.canSkip}, you would be at ${round(result.percentAfterSkipping)}%, and the class after that would drop you below the line.`}
                    </p>
                  </div>
                ) : (
                  <div className="border-2 border-black rounded-xl bg-white px-4 py-4">
                    <p className="text-[11px] font-black uppercase tracking-widest text-[#666] mb-1">
                      How many you must attend
                    </p>
                    <p className="text-[15px] sm:text-base text-[#111] leading-relaxed font-bold">
                      {!result.reachable
                        ? `A ${round(result.threshold)}% requirement means you cannot miss a single class, and you have already missed ${result.missedSoFar}. No number of future classes brings you back up. Talk to your department about a condonation or medical exemption.`
                        : `You need to attend the next ${result.mustAttend} ${plural(result.mustAttend, "class", "classes")} without missing one. That puts you at ${round(result.percentAfterAttending)}%, which clears the ${round(result.threshold)}% requirement. Miss one along the way and the count starts climbing again.`}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <ToolSection title="How the attendance maths works">
        <p>
          Attendance is a plain ratio: classes you attended divided by classes
          that were held. The two useful questions are what happens to that
          ratio when you add absences, and what happens when you add
          attendances.
        </p>
        <p>
          <strong>Classes you can still skip.</strong> Skipping adds to the
          bottom of the fraction but not the top, so your percentage falls. The
          largest number of skips that keeps you legal is:
        </p>
        <FormulaBlock>
          skips = floor((100 x attended) / threshold - held)
        </FormulaBlock>
        <p>
          The result is rounded down because half a class does not exist, which
          means the answer errs on the safe side rather than the flattering one.
        </p>
        <p>
          <strong>Classes you must attend.</strong> Attending adds to both the
          top and the bottom, so your percentage rises, but slowly. The smallest
          unbroken run that gets you to the threshold is:
        </p>
        <FormulaBlock>
          classes = ceil((threshold x held - 100 x attended) / (100 - threshold))
        </FormulaBlock>
        <p>
          This is why recovering from a bad start is so much harder than
          protecting a good one. At a 75% requirement, every class you miss
          costs three classes of perfect attendance to undo.
        </p>
      </ToolSection>

      <ToolSection title="A worked example">
        <p>
          Say 40 classes have been held and you attended 30. That is 75%
          exactly, so you can skip zero more. If you attend the next 4 without
          missing any, you are at 34 of 44, which is 77.3%, and the calculator
          will then tell you that you can afford to miss 1.
        </p>
        <p>
          Now say you attended only 20 of those 40, which is 50%. To reach 75%
          you have to attend the next 40 classes in a row, ending at 60 of 80.
          Missing a single class in that run pushes the requirement higher
          again. The gap between 50% and 75% is not 25 classes, it is 40.
        </p>
      </ToolSection>

      <ToolSection title="Frequently asked questions" id="faq">
        <FaqList items={ATTENDANCE_FAQS} />
      </ToolSection>

      <ToolCta
        location="attendance_calculator"
        heading="Attendance keeps you in the exam. Studying gets you through it."
        body="FORKSAI turns your notes, slides and PDFs into flashcards and study sessions, so the hours you do spend revising actually stick."
      />

      <ToolCrossLinks current="/attendance-calculator" />
    </ToolPageShell>
  );
}
