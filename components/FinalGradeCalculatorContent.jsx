"use client";

import { useMemo, useState } from "react";
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
import { calcFinalGrade, round } from "@/lib/studyToolMath";
import { FINAL_GRADE_FAQS } from "@/lib/toolFaqs";

const ERRORS = {
  incomplete: "Fill in all three boxes to see what you need.",
  current: "Your current grade has to be between 0 and 100.",
  weight: "The final exam weight has to be above 0 and at most 100.",
  target: "Your target grade has to be between 0 and 100.",
};

function NumberField({ id, label, hint, value, onChange, min, max }) {
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
          inputMode="decimal"
          min={min}
          max={max}
          step="0.1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} pr-12`}
        />
        <span
          aria-hidden="true"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#666]"
        >
          %
        </span>
      </div>
      {hint ? <p className={hintClass}>{hint}</p> : null}
    </div>
  );
}

function Verdict({ result }) {
  const { status } = result;

  const tone =
    status === "impossible"
      ? { bg: "#ffffff", label: "Out of reach" }
      : status === "secured"
        ? { bg: "#5CB85C", label: "Already secured" }
        : { bg: "#F0D44A", label: "What you need" };

  return (
    <div className="border-2 border-black rounded-xl px-4 py-4" style={{ background: tone.bg }}>
      <p className="text-[11px] font-black uppercase tracking-widest text-[#111]/60 mb-1">
        {tone.label}
      </p>

      {status === "possible" ? (
        <>
          <p className="font-serif font-black text-3xl sm:text-4xl text-[#111] leading-tight">
            {round(result.required)}%
          </p>
          <p className="text-sm text-[#111]/75 mt-1.5 leading-relaxed">
            You need {round(result.required)}% on a final worth {round(result.weight)}% of the
            course to finish on {round(result.target)}% overall.{" "}
            {result.required > 90
              ? "That is a demanding score, so plan the revision around it now rather than the week before."
              : "That is within normal range for a well-prepared exam."}
          </p>
        </>
      ) : null}

      {status === "secured" ? (
        <>
          <p className="font-serif font-black text-3xl sm:text-4xl text-[#111] leading-tight">
            0%
          </p>
          <p className="text-sm text-[#111]/85 mt-1.5 leading-relaxed">
            Your target is already locked in. Even a zero on the final leaves you at{" "}
            {round(result.minGuaranteed)}% overall, which clears the {round(result.target)}% you
            asked for. Aim higher if you want the grade above it.
          </p>
        </>
      ) : null}

      {status === "impossible" ? (
        <>
          <p className="font-serif font-black text-2xl sm:text-3xl text-[#111] leading-tight">
            Not reachable
          </p>
          <p className="text-sm text-[#111]/85 mt-1.5 leading-relaxed">
            Finishing on {round(result.target)}% would need {round(result.required)}% on the final,
            and the paper is only marked out of 100. The highest overall grade still available to
            you is {round(result.maxPossible)}%, which is what a perfect final would give you.
          </p>
        </>
      ) : null}
    </div>
  );
}

export default function FinalGradeCalculatorContent() {
  const [current, setCurrent] = useState("78");
  const [weight, setWeight] = useState("40");
  const [target, setTarget] = useState("85");

  const result = useMemo(
    () => calcFinalGrade(current, weight, target),
    [current, weight, target]
  );

  return (
    <ToolPageShell>
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif font-black text-3xl sm:text-[2.6rem] leading-[1.08] text-[#111] mb-3">
          Final grade calculator
        </h1>
        <p className="text-[15px] sm:text-base text-[#444] leading-relaxed mb-6 max-w-2xl">
          Work out the exact score your final exam has to earn for you to finish
          the course on the grade you want. If the target is out of reach, this
          says so and shows the best grade you can still get. Free, no signup.
        </p>

        <div className={`${cardClass} p-5 sm:p-7`}>
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-5">
            <NumberField
              id="current-grade"
              label="Current grade"
              value={current}
              onChange={setCurrent}
              min={0}
              max={100}
              hint="Your weighted average across everything marked so far."
            />
            <NumberField
              id="final-weight"
              label="Final exam weight"
              value={weight}
              onChange={setWeight}
              min={0.1}
              max={100}
              hint="From your syllabus. A final worth 40 marks in 100 is 40%."
            />
            <NumberField
              id="target-grade"
              label="Target overall grade"
              value={target}
              onChange={setTarget}
              min={0}
              max={100}
              hint="The grade you want on the transcript at the end."
            />
          </div>

          <div aria-live="polite" className="mt-6">
            {!result.ok ? (
              <p className="border-2 border-black rounded-xl bg-white px-4 py-4 text-sm font-bold text-[#111]">
                {ERRORS[result.reason] || ERRORS.incomplete}
              </p>
            ) : (
              <div className="space-y-3">
                <Verdict result={result} />

                {/* The two honest bounds, always shown. They are what makes a
                    required score of 96 or of 225 mean something. */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="border-2 border-black rounded-xl bg-white px-4 py-4">
                    <p className="text-[11px] font-black uppercase tracking-widest text-[#666] mb-1">
                      Best case
                    </p>
                    <p className="font-serif font-black text-xl text-[#111]">
                      {round(result.maxPossible)}%
                    </p>
                    <p className="text-xs text-[#555] mt-1 leading-relaxed">
                      Where you finish if you score 100% on the final.
                    </p>
                  </div>
                  <div className="border-2 border-black rounded-xl bg-white px-4 py-4">
                    <p className="text-[11px] font-black uppercase tracking-widest text-[#666] mb-1">
                      Worst case
                    </p>
                    <p className="font-serif font-black text-xl text-[#111]">
                      {round(result.minGuaranteed)}%
                    </p>
                    <p className="text-xs text-[#555] mt-1 leading-relaxed">
                      Where you finish if you score 0% on the final.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <ToolSection title="How the final grade formula works">
        <p>
          Your final grade is a weighted average of two parts: everything marked
          up to now, and the final exam. If the final is worth 40% of the
          course, the marks you already have are worth the other 60%.
        </p>
        <FormulaBlock>
          overall = current x (1 - weight) + final x weight
        </FormulaBlock>
        <p>
          Rearranging that for the score the final has to earn gives the number
          at the top of this page:
        </p>
        <FormulaBlock>
          final = (target - current x (1 - weight)) / weight
        </FormulaBlock>
        <p>
          Weights are used as decimals in both, so a 40% final is 0.4. Two
          consequences follow, and they are the reason this page shows a best
          case and a worst case rather than a single number:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>The formula can return more than 100.</strong> That is not a
            score, it is proof that the target is unreachable. A lighter final
            exam weight makes this happen sooner, because there is less room
            left to move your average.
          </li>
          <li>
            <strong>The formula can return a negative number.</strong> That
            means your target is already secured no matter what happens in the
            exam hall.
          </li>
        </ul>
      </ToolSection>

      <ToolSection title="Three worked examples">
        <p>
          <strong>Reachable.</strong> Current grade 80%, final worth 30%, target
          85%. You carry 0.7 x 80 = 56 points into the exam, so the final has to
          supply 29 of the remaining 30, which is 96.67%. Demanding, but legal.
        </p>
        <p>
          <strong>Impossible.</strong> Current grade 50%, final worth 20%,
          target 85%. You carry 40 points, and a perfect final adds only 20
          more, so 60% is the ceiling. The formula says you need 225%, which is
          the polite way of saying no. Aim at the grade below instead.
        </p>
        <p>
          <strong>Already secured.</strong> Current grade 95%, final worth 20%,
          target 70%. You carry 76 points, which is already past the target, so
          the required score is 0%. Worth knowing before you spend a week
          panicking about that paper rather than the one you could still lose.
        </p>
      </ToolSection>

      <ToolSection title="Frequently asked questions" id="faq">
        <FaqList items={FINAL_GRADE_FAQS} />
      </ToolSection>

      <ToolCta
        location="final_grade_calculator"
        heading="Knowing the number is step one. Hitting it is step two."
        body="FORKSAI turns the syllabus you still have to cover into flashcards, quizzes and spaced repetition sessions, so the revision time you have left goes where it counts."
      />

      <ToolCrossLinks current="/final-grade-calculator" />
    </ToolPageShell>
  );
}
