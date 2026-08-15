"use client";

import { useMemo, useState } from "react";
import ToolPageShell, {
  ToolCta,
  ToolSection,
  FormulaBlock,
  FaqList,
  cardClass,
  labelClass,
} from "@/components/ToolPageShell";
import {
  CalcToolCrossLinks,
  NumberField,
  ResultCard,
  DetailCard,
  StatGrid,
  ErrorNote,
} from "@/lib/calcToolsShell";
import { calcNegativeMarking, round, plural } from "@/lib/calcToolsMath";
import { NEGATIVE_MARKING_FAQS } from "@/lib/calcToolsFaqs";

// Deliberately described as common patterns rather than attributed to any
// named exam board. Marking schemes change between sessions and between
// papers, so the only reliable source is the instruction sheet on the day.
const PRESETS = [
  { id: "4-1", label: "+4, -1", perCorrect: "4", penalty: "1" },
  { id: "1-025", label: "+1, -0.25", perCorrect: "1", penalty: "0.25" },
  { id: "2-05", label: "+2, -0.5", perCorrect: "2", penalty: "0.5" },
  { id: "1-0", label: "+1, no penalty", perCorrect: "1", penalty: "0" },
];

const ERRORS = {
  incomplete: "Fill in every box to see your projected score.",
  total: "The total number of questions has to be at least 1.",
  attempted: "You cannot attempt more questions than the paper has.",
  correct: "Correct answers cannot be more than the questions you attempted.",
  "per-correct": "Marks for a correct answer have to be above zero.",
  penalty: "The penalty for a wrong answer cannot be negative. Enter it as a positive number.",
};

export default function NegativeMarkingCalculatorContent() {
  const [total, setTotal] = useState("90");
  const [attempted, setAttempted] = useState("70");
  const [correct, setCorrect] = useState("55");
  const [perCorrect, setPerCorrect] = useState("4");
  const [penalty, setPenalty] = useState("1");

  const result = useMemo(
    () => calcNegativeMarking({ total, attempted, correct, perCorrect, penalty }),
    [total, attempted, correct, perCorrect, penalty]
  );

  const activePreset = PRESETS.find(
    (preset) => preset.perCorrect === perCorrect && preset.penalty === penalty
  );

  return (
    <ToolPageShell>
      {/* The calculator sits first. Everything explanatory is below it. */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif font-black text-3xl sm:text-[2.6rem] leading-[1.08] text-[#111] mb-3">
          Negative marking calculator
        </h1>
        <p className="text-[15px] sm:text-base text-[#444] leading-relaxed mb-6 max-w-2xl">
          Put in what you attempted and what you got right, and see the score
          after the penalty for wrong answers is taken off, along with your
          accuracy and the point where guessing stops paying. Set the scheme to
          whatever your own paper uses. Free, no signup.
        </p>

        <div className={`${cardClass} p-5 sm:p-7`}>
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-5">
            <NumberField
              id="total-questions"
              label="Questions in the paper"
              value={total}
              onChange={setTotal}
              min={1}
            />
            <NumberField
              id="attempted-questions"
              label="Questions attempted"
              value={attempted}
              onChange={setAttempted}
              min={0}
              hint="Leave out anything you skipped."
            />
            <NumberField
              id="correct-questions"
              label="Answers correct"
              value={correct}
              onChange={setCorrect}
              min={0}
            />
          </div>

          <div className="mt-5">
            <span className={labelClass}>Marking scheme</span>
            <div className="flex flex-wrap gap-2 mb-4">
              {PRESETS.map((preset) => {
                const active = activePreset?.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setPerCorrect(preset.perCorrect);
                      setPenalty(preset.penalty);
                    }}
                    aria-pressed={active}
                    className="border-2 border-black rounded-xl px-3 py-2 text-sm font-bold text-[#111] transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
                    style={{
                      background: active ? "#F0D44A" : "#fff",
                      boxShadow: active ? "1px 1px 0 #111" : "3px 3px 0 #111",
                      transform: active ? "translate(2px, 2px)" : "none",
                    }}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-[#666] leading-relaxed mb-4">
              These are common patterns offered as starting points, not any
              particular exam board's official rule. Schemes vary between papers
              and between sessions, so type in whatever your own instruction
              sheet states.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
              <NumberField
                id="marks-per-correct"
                label="Marks for a correct answer"
                value={perCorrect}
                onChange={setPerCorrect}
                decimal
                min={0}
              />
              <NumberField
                id="penalty-per-wrong"
                label="Marks deducted for a wrong answer"
                value={penalty}
                onChange={setPenalty}
                decimal
                min={0}
                hint="Enter it as a positive number. Zero means no negative marking."
              />
            </div>
          </div>

          {/* aria-live so a screen reader hears the score change as you type,
              without a Calculate button in the way. */}
          <div aria-live="polite" className="mt-6">
            {!result.ok ? (
              <ErrorNote>{ERRORS[result.reason] || ERRORS.incomplete}</ErrorNote>
            ) : (
              <div className="space-y-3">
                <ResultCard
                  eyebrow="Projected score"
                  headline={`${round(result.score, 2)} out of ${round(result.maxScore, 2)}`}
                >
                  <p>
                    {result.correct} correct at {round(result.perCorrect, 2)}{" "}
                    each earns {round(result.earned, 2)}.{" "}
                    {result.penalty > 0
                      ? `${result.wrong} wrong at ${round(result.penalty, 2)} each takes ${round(result.lost, 2)} back off.`
                      : "There is no penalty for a wrong answer under this scheme."}{" "}
                    That is {round(result.scorePercent, 2)}% of the paper.
                  </p>
                </ResultCard>

                <StatGrid
                  items={[
                    { label: "Accuracy", value: `${round(result.accuracy, 2)}%` },
                    { label: "Wrong", value: result.wrong },
                    { label: "Skipped", value: result.unattempted },
                    { label: "Attempt rate", value: `${round(result.attemptRate, 2)}%` },
                  ]}
                />

                {result.negative ? (
                  <DetailCard eyebrow="The score is below zero">
                    <p>
                      The penalties come to {round(result.lost, 2)}, which is
                      more than the {round(result.earned, 2)} you earned, so the
                      total lands at {round(result.score, 2)}. The figure is
                      shown as it falls out of the arithmetic. Whether your exam
                      floors the total at zero is a rule of that exam, not of
                      the sum.
                    </p>
                  </DetailCard>
                ) : null}

                {result.penalty > 0 ? (
                  <DetailCard eyebrow="Where guessing breaks even">
                    <p>
                      Under {round(result.perCorrect, 2)} for a correct answer
                      and {round(result.penalty, 2)} off for a wrong one,
                      guessing is worth nothing either way at{" "}
                      <strong>{round(result.breakEvenAccuracy, 2)}% accuracy</strong>.
                      Above that, guesses gain marks on average. Below it, they
                      cost marks. You are currently at{" "}
                      {round(result.accuracy, 2)}% on the questions you did
                      attempt.
                    </p>
                  </DetailCard>
                ) : null}

                <DetailCard eyebrow="What the penalty cost you">
                  <p>
                    Without any negative marking the same paper would have
                    scored {round(result.scoreWithoutPenalty, 2)}. The deduction
                    is {round(result.lost, 2)}{" "}
                    {plural(result.lost, "mark", "marks")}, which is the price
                    of the {result.wrong}{" "}
                    {plural(result.wrong, "wrong answer", "wrong answers")}.
                  </p>
                </DetailCard>
              </div>
            )}
          </div>
        </div>
      </section>

      <ToolSection title="How the score is worked out">
        <p>
          Every scheme of this kind is two multiplications and a subtraction.
          Correct answers earn, wrong answers cost, and questions you left
          untouched do neither:
        </p>
        <FormulaBlock>
          score = (correct x marks per correct) - (wrong x penalty per wrong)
        </FormulaBlock>
        <p>
          The number of wrong answers is not something you enter, it is derived,
          because it has to be what you attempted minus what you got right:
        </p>
        <FormulaBlock>
          wrong = attempted - correct, and skipped = total - attempted
        </FormulaBlock>
        <p>
          Accuracy is measured against what you attempted, not against the whole
          paper, because it is meant to answer how reliable you were when you
          committed to an answer. How much of the paper you took on is reported
          separately as the attempt rate.
        </p>
      </ToolSection>

      <ToolSection title="The point where guessing stops paying">
        <p>
          Guessing is worth it exactly when the marks you expect to gain beat
          the marks you expect to lose. Write your hit rate as a, and guessing
          breaks even when:
        </p>
        <FormulaBlock>
          a x marks per correct = (1 - a) x penalty per wrong
        </FormulaBlock>
        <p>Rearranged, the break-even hit rate is:</p>
        <FormulaBlock>
          a = penalty / (marks per correct + penalty)
        </FormulaBlock>
        <p>
          Under a scheme awarding 4 with 1 deducted, that is 1 divided by 5, or
          20%. Under 1 with 0.25 deducted it is 0.25 divided by 1.25, which is
          also 20%. Both schemes have the same shape, which is why they feel the
          same to sit even though the numbers look different.
        </p>
        <p>
          The practical reading is that eliminating even one option out of four
          usually pushes you past break even, while a pure blind guess on four
          options sits right on it. This is arithmetic about the scheme you
          typed in, not advice about any particular exam.
        </p>
      </ToolSection>

      <ToolSection title="When the penalty is bigger than the score">
        <p>
          Attempting everything on a paper you do not know is how a total goes
          negative. Take 100 questions with 1 mark for a correct answer and 0.25
          off for a wrong one, all 100 attempted and 10 correct. You earn 10 and
          lose 90 times 0.25, which is 22.5, so the score is minus 12.5.
        </p>
        <p>
          This calculator prints that negative figure rather than clamping it to
          zero, because a paper that deducts more than you scored is exactly the
          situation worth seeing clearly. Whether the official result floors at
          zero is a rule of the exam, and it does not change the arithmetic.
        </p>
      </ToolSection>

      <ToolSection title="Frequently asked questions" id="faq">
        <FaqList items={NEGATIVE_MARKING_FAQS} />
      </ToolSection>

      <ToolCta
        location="negative_marking_calculator"
        heading="The best way to beat negative marking is to stop guessing."
        body="FORKSAI turns your notes, slides and PDFs into flashcards and spaced repetition sessions, so more of the paper is recall instead of a coin toss."
      />

      <CalcToolCrossLinks current="/negative-marking-calculator" />
    </ToolPageShell>
  );
}
