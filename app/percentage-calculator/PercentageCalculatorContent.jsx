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
  ModeSwitch,
  ResultCard,
  DetailCard,
  ErrorNote,
} from "@/lib/calcToolsShell";
import {
  calcPercentOf,
  calcPercentValue,
  calcPercentChange,
  round,
} from "@/lib/calcToolsMath";
import { PERCENTAGE_FAQS } from "@/lib/calcToolsFaqs";

const MODES = [
  { id: "of", label: "X is what % of Y" },
  { id: "value", label: "What is X% of Y" },
  { id: "change", label: "Increase or decrease" },
];

const INCOMPLETE = "Fill in both boxes to see the answer.";

export default function PercentageCalculatorContent() {
  const [mode, setMode] = useState("of");

  // Each mode keeps its own pair of numbers, so switching back and forth does
  // not wipe what you already typed.
  const [part, setPart] = useState("45");
  const [whole, setWhole] = useState("60");
  const [percent, setPercent] = useState("18");
  const [base, setBase] = useState("250");
  const [from, setFrom] = useState("80");
  const [to, setTo] = useState("100");

  const ofResult = useMemo(() => calcPercentOf(part, whole), [part, whole]);
  const valueResult = useMemo(() => calcPercentValue(percent, base), [percent, base]);
  const changeResult = useMemo(() => calcPercentChange(from, to), [from, to]);

  return (
    <ToolPageShell>
      {/* The calculator sits first. Everything explanatory is below it. */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif font-black text-3xl sm:text-[2.6rem] leading-[1.08] text-[#111] mb-3">
          Percentage calculator
        </h1>
        <p className="text-[15px] sm:text-base text-[#444] leading-relaxed mb-6 max-w-2xl">
          The three percentage questions people actually ask, on one page: what
          percent one number is of another, what a percentage of a number comes
          to, and the increase or decrease between two numbers. Answers update
          as you type. Free, no signup.
        </p>

        <div className={`${cardClass} p-5 sm:p-7`}>
          <div className="mb-5">
            <span className={labelClass}>What do you want to work out?</span>
            <ModeSwitch
              label="Percentage question"
              options={MODES}
              value={mode}
              onChange={setMode}
            />
          </div>

          {mode === "of" ? (
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
              <NumberField
                id="part"
                label="X, the part"
                value={part}
                onChange={setPart}
                decimal
                hint="The number you have."
              />
              <NumberField
                id="whole"
                label="Y, the whole"
                value={whole}
                onChange={setWhole}
                decimal
                hint="The number it is a share of."
              />
            </div>
          ) : null}

          {mode === "value" ? (
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
              <NumberField
                id="percent"
                label="X, the percentage"
                value={percent}
                onChange={setPercent}
                decimal
                suffix="%"
                hint="Can be over 100, and can be negative."
              />
              <NumberField
                id="base"
                label="Y, the number"
                value={base}
                onChange={setBase}
                decimal
                hint="The number to take the percentage of."
              />
            </div>
          ) : null}

          {mode === "change" ? (
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
              <NumberField
                id="from"
                label="Starting value"
                value={from}
                onChange={setFrom}
                decimal
                hint="Where the number was before."
              />
              <NumberField
                id="to"
                label="Ending value"
                value={to}
                onChange={setTo}
                decimal
                hint="Where it is now. Order matters."
              />
            </div>
          ) : null}

          {/* aria-live so a screen reader hears the answer change as you type,
              without a Calculate button in the way. */}
          <div aria-live="polite" className="mt-6">
            {mode === "of" ? (
              !ofResult.ok ? (
                <ErrorNote>
                  {ofResult.reason === "zero-whole"
                    ? "Y cannot be zero. Nothing can be a share of nothing, because the sum divides by Y."
                    : INCOMPLETE}
                </ErrorNote>
              ) : (
                <div className="space-y-3">
                  <ResultCard
                    eyebrow="Answer"
                    headline={`${round(ofResult.percent, 4)}%`}
                  >
                    <p>
                      {ofResult.x} is {round(ofResult.percent, 4)}% of{" "}
                      {ofResult.y}.
                    </p>
                  </ResultCard>
                  <DetailCard eyebrow="How it was worked out">
                    <p>
                      {ofResult.x} divided by {ofResult.y} is{" "}
                      {round(ofResult.x / ofResult.y, 6)}, and multiplying that
                      by 100 gives {round(ofResult.percent, 4)}%.
                    </p>
                  </DetailCard>
                </div>
              )
            ) : null}

            {mode === "value" ? (
              !valueResult.ok ? (
                <ErrorNote>{INCOMPLETE}</ErrorNote>
              ) : (
                <div className="space-y-3">
                  <ResultCard
                    eyebrow="Answer"
                    headline={round(valueResult.value, 6)}
                  >
                    <p>
                      {round(valueResult.percent, 4)}% of {valueResult.y} is{" "}
                      {round(valueResult.value, 6)}.
                    </p>
                  </ResultCard>
                  <DetailCard eyebrow="What is left">
                    <p>
                      Taking {round(valueResult.value, 6)} away from{" "}
                      {valueResult.y} leaves {round(valueResult.remainder, 6)},
                      which is the other{" "}
                      {round(100 - valueResult.percent, 4)}%.
                    </p>
                  </DetailCard>
                </div>
              )
            ) : null}

            {mode === "change" ? (
              !changeResult.ok ? (
                changeResult.reason === "zero-start" ? (
                  <div className="space-y-3">
                    <ErrorNote>
                      There is no percentage change from zero. The formula
                      divides by the starting value, and dividing by zero has no
                      answer, so no percentage describes this move.
                    </ErrorNote>
                    <DetailCard eyebrow="What can be said">
                      <p>
                        In absolute terms the value changed by{" "}
                        {round(changeResult.difference, 6)}, from{" "}
                        {changeResult.from} to {changeResult.to}. Report that
                        figure instead of a percentage.
                      </p>
                    </DetailCard>
                  </div>
                ) : (
                  <ErrorNote>{INCOMPLETE}</ErrorNote>
                )
              ) : (
                <div className="space-y-3">
                  <ResultCard
                    eyebrow={
                      changeResult.direction === "same"
                        ? "No change"
                        : changeResult.direction === "increase"
                          ? "Increase"
                          : "Decrease"
                    }
                    headline={`${round(Math.abs(changeResult.change), 4)}%`}
                  >
                    <p>
                      {changeResult.direction === "same"
                        ? `${changeResult.from} and ${changeResult.to} are the same number, so there is no change.`
                        : `Going from ${changeResult.from} to ${changeResult.to} is a ${round(Math.abs(changeResult.change), 4)}% ${changeResult.direction}.`}
                    </p>
                  </ResultCard>
                  <DetailCard eyebrow="How it was worked out">
                    <p>
                      The difference is {round(changeResult.difference, 6)}.
                      Divided by the starting value of{" "}
                      {Math.abs(changeResult.from)} and multiplied by 100, that
                      is {round(changeResult.change, 4)}%.
                    </p>
                  </DetailCard>
                </div>
              )
            ) : null}
          </div>
        </div>
      </section>

      <ToolSection title="The three formulas">
        <p>
          <strong>What percent is X of Y.</strong> Divide the part by the whole,
          then multiply by 100. This is the one behind test scores, discounts
          and any question phrased as "out of".
        </p>
        <FormulaBlock>percent = (X / Y) x 100</FormulaBlock>
        <p>
          <strong>What is X percent of Y.</strong> Turn the percentage into a
          decimal by dividing by 100, then multiply. This is the one behind tax,
          tips and interest.
        </p>
        <FormulaBlock>value = (X / 100) x Y</FormulaBlock>
        <p>
          <strong>Percent increase or decrease.</strong> Subtract the old value
          from the new one, divide by the old value, and multiply by 100. The
          starting value is always the denominator, which is why swapping the
          two numbers does not just flip the sign.
        </p>
        <FormulaBlock>
          change = ((new - old) / |old|) x 100
        </FormulaBlock>
        <p>
          The absolute value on the denominator is there so a move from -50 to
          -25 reads as a 50% increase, which is the direction it actually went,
          rather than a decrease.
        </p>
      </ToolSection>

      <ToolSection title="Where percentages catch people out">
        <p>
          <strong>A rise and a fall of the same percentage do not cancel.</strong>{" "}
          Take 100 up by 20% and you have 120. Take 120 down by 20% and you lose
          24, landing on 96, not 100. Each percentage is measured against a
          different base. If you want the net effect, put your real start and
          end values into the third mode rather than adding the percentages up.
        </p>
        <p>
          <strong>Percent and percentage points are different things.</strong>{" "}
          A rate moving from 20% to 25% has risen by 5 percentage points, and
          also by 25% of itself. Both are correct and they are not
          interchangeable. Use percentage points whenever the thing you are
          comparing is already a percentage.
        </p>
        <p>
          <strong>You cannot have a percentage increase from zero.</strong>{" "}
          Growth from 0 to 40 is real, but the formula divides by the starting
          value, and dividing by zero has no answer. This page says so instead
          of printing infinity or a made up number. Report the absolute change
          instead.
        </p>
        <p>
          <strong>Order matters in the third mode.</strong> 80 to 100 is a 25%
          increase. 100 to 80 is a 20% decrease. Same two numbers, same gap of
          20, different denominators.
        </p>
      </ToolSection>

      <ToolSection title="Worked examples">
        <p>
          <strong>45 out of 60.</strong> 45 divided by 60 is 0.75, so 75%.
        </p>
        <p>
          <strong>18% of 250.</strong> 0.18 multiplied by 250 is 45, leaving 205
          as the other 82%.
        </p>
        <p>
          <strong>80 up to 100.</strong> The difference is 20, divided by the
          starting 80 is 0.25, so a 25% increase. Reverse it and 100 down to 80
          is 20 divided by 100, a 20% decrease.
        </p>
      </ToolSection>

      <ToolSection title="Frequently asked questions" id="faq">
        <FaqList items={PERCENTAGE_FAQS} />
      </ToolSection>

      <ToolCta
        location="percentage_calculator"
        heading="Percentages are quick. Remembering a syllabus is not."
        body="FORKSAI turns your notes, slides and PDFs into flashcards and study sessions, so the hours you spend revising actually stick."
      />

      <CalcToolCrossLinks current="/percentage-calculator" />
    </ToolPageShell>
  );
}
