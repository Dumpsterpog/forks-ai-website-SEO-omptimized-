"use client";

import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import ToolPageShell, {
  ToolCta,
  ToolSection,
  FormulaBlock,
  FaqList,
  cardClass,
  inputClass,
  labelClass,
  buttonClass,
} from "@/components/ToolPageShell";
import {
  CalcToolCrossLinks,
  NumberField,
  ModeSwitch,
  ResultCard,
  DetailCard,
  StatGrid,
  ErrorNote,
} from "@/lib/calcToolsShell";
import { calcCgpa, calcRequiredSgpa, round, plural } from "@/lib/calcToolsMath";
import { SGPA_CGPA_FAQS } from "@/lib/calcToolsFaqs";

const START_ROWS = [
  { id: 1, label: "Semester 1", sgpa: "8.2", credits: "22" },
  { id: 2, label: "Semester 2", sgpa: "8.6", credits: "24" },
  { id: 3, label: "Semester 3", sgpa: "7.9", credits: "20" },
];

// Labels sit above each field on a phone and go to screen readers only on wider
// screens, where the column headings carry the same information visually.
const rowLabelClass = "block text-xs font-bold text-[#666] mb-1 sm:sr-only";

const REQUIRED_ERRORS = {
  incomplete: "Fill in all four boxes to see the SGPA you need.",
  done: "The credits already completed have to be above zero.",
  remaining: "The credits still to come have to be above zero.",
  current: "Your current CGPA has to sit within the scale you picked.",
  target: "The target CGPA has to sit within the scale you picked.",
};

export default function SgpaToCgpaCalculatorContent() {
  const [mode, setMode] = useState("combine");
  const [scale, setScale] = useState(10);
  const [rows, setRows] = useState(START_ROWS);
  const [nextId, setNextId] = useState(4);

  const [currentCgpa, setCurrentCgpa] = useState("7");
  const [doneCredits, setDoneCredits] = useState("80");
  const [remainingCredits, setRemainingCredits] = useState("20");
  const [targetCgpa, setTargetCgpa] = useState("7.5");

  const combined = useMemo(() => calcCgpa(rows, scale), [rows, scale]);
  const required = useMemo(
    () =>
      calcRequiredSgpa({
        currentCgpa,
        doneCredits,
        remainingCredits,
        targetCgpa,
        scale,
      }),
    [currentCgpa, doneCredits, remainingCredits, targetCgpa, scale]
  );

  const update = (id, field, value) => {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const addRow = () => {
    setRows((current) => [
      ...current,
      { id: nextId, label: `Semester ${current.length + 1}`, sgpa: "", credits: "" },
    ]);
    setNextId((id) => id + 1);
  };

  const removeRow = (id) => {
    setRows((current) => (current.length > 1 ? current.filter((row) => row.id !== id) : current));
  };

  return (
    <ToolPageShell>
      {/* The calculator sits first. Everything explanatory is below it. */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif font-black text-3xl sm:text-[2.6rem] leading-[1.08] text-[#111] mb-3">
          SGPA to CGPA calculator
        </h1>
        <p className="text-[15px] sm:text-base text-[#444] leading-relaxed mb-6 max-w-2xl">
          Combine your semester SGPAs into one credit-weighted CGPA, or work the
          other way and find the SGPA the rest of your degree has to average to
          reach a target. The formula is written on the page, and universities
          differ, so check yours against your own regulations. Free, no signup.
        </p>

        <div className={`${cardClass} p-5 sm:p-7`}>
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-5 mb-5">
            <div>
              <span className={labelClass}>What do you want to work out?</span>
              <ModeSwitch
                label="Direction of the calculation"
                options={[
                  { id: "combine", label: "SGPAs into a CGPA" },
                  { id: "required", label: "SGPA I still need" },
                ]}
                value={mode}
                onChange={setMode}
              />
            </div>
            <div>
              <label htmlFor="grade-scale" className={labelClass}>
                Grade point scale
              </label>
              <select
                id="grade-scale"
                name="grade-scale"
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className={inputClass}
              >
                <option value={10}>10-point scale</option>
                <option value={4}>4-point scale</option>
              </select>
            </div>
          </div>

          {mode === "combine" ? (
            <>
              {/* Visual column headings for wide screens. The real labels are
                  on the inputs, so this is decoration to a screen reader. */}
              <div
                aria-hidden="true"
                className="hidden sm:grid grid-cols-[1fr_7rem_7rem_2.5rem] gap-3 mb-2 px-1"
              >
                <span className="text-xs font-bold text-[#666]">Semester</span>
                <span className="text-xs font-bold text-[#666]">SGPA</span>
                <span className="text-xs font-bold text-[#666]">Credits</span>
                <span className="sr-only">Remove</span>
              </div>

              <div className="space-y-4 sm:space-y-3">
                {rows.map((row, index) => (
                  <div
                    key={row.id}
                    className="grid sm:grid-cols-[1fr_7rem_7rem_2.5rem] gap-3 items-start border-2 border-black rounded-xl p-3 sm:border-0 sm:rounded-none sm:p-0"
                  >
                    <div>
                      <label htmlFor={`sem-label-${row.id}`} className={rowLabelClass}>
                        Name of semester {index + 1}
                      </label>
                      <input
                        id={`sem-label-${row.id}`}
                        name={`sem-label-${row.id}`}
                        type="text"
                        value={row.label}
                        placeholder={`Semester ${index + 1}`}
                        onChange={(e) => update(row.id, "label", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor={`sem-sgpa-${row.id}`} className={rowLabelClass}>
                        SGPA in semester {index + 1}
                      </label>
                      <input
                        id={`sem-sgpa-${row.id}`}
                        name={`sem-sgpa-${row.id}`}
                        type="number"
                        inputMode="decimal"
                        step="any"
                        min="0"
                        max={scale}
                        value={row.sgpa}
                        onChange={(e) => update(row.id, "sgpa", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor={`sem-credits-${row.id}`} className={rowLabelClass}>
                        Credits in semester {index + 1}
                      </label>
                      <input
                        id={`sem-credits-${row.id}`}
                        name={`sem-credits-${row.id}`}
                        type="number"
                        inputMode="decimal"
                        step="any"
                        min="0"
                        value={row.credits}
                        onChange={(e) => update(row.id, "credits", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div className="sm:pt-1">
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        disabled={rows.length < 2}
                        aria-label={`Remove semester ${index + 1}`}
                        className="inline-flex items-center justify-center gap-1.5 w-full sm:w-10 h-10 border-2 border-black rounded-xl bg-white text-sm font-bold text-[#111] shadow-[3px_3px_0_#111] transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-40 disabled:shadow-[3px_3px_0_#111] disabled:translate-x-0 disabled:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
                      >
                        <X size={15} strokeWidth={2.75} aria-hidden="true" />
                        <span className="sm:hidden">Remove</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button type="button" onClick={addRow} className={`${buttonClass} mt-4`}>
                <Plus size={15} strokeWidth={2.75} aria-hidden="true" />
                Add semester
              </button>
            </>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
              <NumberField
                id="current-cgpa"
                label="CGPA so far"
                value={currentCgpa}
                onChange={setCurrentCgpa}
                decimal
                min={0}
                max={scale}
                hint={`Your cumulative figure today, on the ${scale}-point scale.`}
              />
              <NumberField
                id="done-credits"
                label="Credits completed"
                value={doneCredits}
                onChange={setDoneCredits}
                decimal
                min={0}
                hint="The total credits behind that CGPA."
              />
              <NumberField
                id="remaining-credits"
                label="Credits still to come"
                value={remainingCredits}
                onChange={setRemainingCredits}
                decimal
                min={0}
                hint="Everything left in the degree."
              />
              <NumberField
                id="target-cgpa"
                label="Target CGPA"
                value={targetCgpa}
                onChange={setTargetCgpa}
                decimal
                min={0}
                max={scale}
                hint="What you want to finish on."
              />
            </div>
          )}

          {/* aria-live so a screen reader hears the answer change as you type,
              without a Calculate button in the way. */}
          <div aria-live="polite" className="mt-6">
            {mode === "combine" ? (
              !combined.ok ? (
                <ErrorNote>
                  {combined.reason === "invalid"
                    ? `Check the rows you have filled in: credits have to be above zero and each SGPA has to sit between 0 and ${scale}.`
                    : "Fill in the SGPA and the credits for at least one semester."}
                </ErrorNote>
              ) : (
                <div className="space-y-3">
                  <ResultCard eyebrow="Your CGPA" headline={round(combined.cgpa, 3)}>
                    <p>
                      Across {combined.semesters}{" "}
                      {plural(combined.semesters, "semester", "semesters")} and{" "}
                      {round(combined.totalCredits, 2)} credits, on the {scale}
                      -point scale.
                    </p>
                  </ResultCard>

                  <StatGrid
                    items={[
                      { label: "Total credits", value: round(combined.totalCredits, 2) },
                      { label: "Grade points", value: round(combined.totalPoints, 2) },
                      { label: "Semesters", value: combined.semesters },
                      { label: "Plain average", value: round(combined.plainAverage, 3) },
                    ]}
                  />

                  <DetailCard eyebrow="Why the weighting matters">
                    {combined.weightingMatters ? (
                      <p>
                        A plain average of your SGPAs would give{" "}
                        {round(combined.plainAverage, 3)}, but your semesters
                        carry different credit loads, so the credit-weighted
                        figure of {round(combined.cgpa, 3)} is the one that
                        counts. The heavier semesters pull harder.
                      </p>
                    ) : (
                      <p>
                        Your semesters carry the same credit load, so the
                        credit-weighted CGPA and a plain average of the SGPAs
                        happen to agree here. Add a semester with different
                        credits and they will separate.
                      </p>
                    )}
                  </DetailCard>

                  {combined.problems.length ? (
                    <ErrorNote>
                      {combined.problems.length}{" "}
                      {plural(combined.problems.length, "row is", "rows are")}{" "}
                      not being counted, because the credits are not above zero
                      or the SGPA is outside the {scale}-point scale.
                    </ErrorNote>
                  ) : null}
                </div>
              )
            ) : !required.ok ? (
              <ErrorNote>{REQUIRED_ERRORS[required.reason] || REQUIRED_ERRORS.incomplete}</ErrorNote>
            ) : (
              <div className="space-y-3">
                <ResultCard
                  eyebrow="SGPA needed in the remaining credits"
                  headline={
                    required.alreadyThere
                      ? "Already secured"
                      : required.reachable
                        ? round(required.required, 3)
                        : "Out of reach"
                  }
                >
                  {required.alreadyThere ? (
                    <p>
                      Your CGPA is already at or above {required.target}, and it
                      stays there even if the remaining{" "}
                      {round(required.remaining, 2)} credits score nothing.
                    </p>
                  ) : required.reachable ? (
                    <p>
                      The remaining {round(required.remaining, 2)} credits have
                      to average {round(required.required, 3)} to finish on a
                      CGPA of {required.target}.
                    </p>
                  ) : (
                    <p>
                      Reaching {required.target} would need an average of{" "}
                      {round(required.required, 3)} across the remaining
                      credits, which is above the {scale}-point ceiling. It
                      cannot be done.
                    </p>
                  )}
                </ResultCard>

                <DetailCard eyebrow="The best you can still finish on">
                  <p>
                    Scoring the full {scale} in every one of the remaining{" "}
                    {round(required.remaining, 2)} credits would put you at{" "}
                    <strong>{round(required.ceiling, 3)}</strong> across all{" "}
                    {round(required.totalCredits, 2)} credits. That is the
                    ceiling, whatever your target says.
                  </p>
                </DetailCard>

                <DetailCard eyebrow="How it was worked out">
                  <p>
                    {required.target} multiplied by{" "}
                    {round(required.totalCredits, 2)} total credits is{" "}
                    {round(required.target * required.totalCredits, 2)} grade
                    points needed in all. You already hold{" "}
                    {round(required.current * required.done, 2)}, so the
                    shortfall of{" "}
                    {round(
                      required.target * required.totalCredits -
                        required.current * required.done,
                      2
                    )}{" "}
                    has to come out of {round(required.remaining, 2)} credits.
                  </p>
                </DetailCard>
              </div>
            )}
          </div>

          <p className="text-xs text-[#555] leading-relaxed mt-4 border-2 border-black rounded-xl bg-white px-4 py-3">
            <strong className="text-[#111]">Check your own rule.</strong>{" "}
            Universities genuinely differ on how a CGPA is assembled: whether
            failed or repeated papers count, whether audit courses carry
            credits, how a supplementary attempt is treated, and whether the
            result is rounded or truncated. Credit weighting is the common core,
            but your academic regulations are what your transcript follows.
          </p>
        </div>
      </section>

      <ToolSection title="The formula used">
        <p>
          A CGPA is a credit-weighted average of semester SGPAs. Each semester
          contributes its SGPA multiplied by the credits it carried, and the
          total is divided by the total credits:
        </p>
        <FormulaBlock>
          CGPA = sum(SGPA of a semester x credits of that semester) / sum(credits)
        </FormulaBlock>
        <p>
          The reverse question rearranges the same equation. If you know your
          CGPA so far, the credits behind it, the credits still to come and the
          CGPA you want to end on, the average the rest of the degree has to hit
          is:
        </p>
        <FormulaBlock>
          required SGPA = (target CGPA x total credits - current CGPA x credits
          done) / credits remaining
        </FormulaBlock>
        <p>
          If that number comes out above the top of your scale, the target is
          not reachable, and the page says so and gives you the best CGPA still
          available instead of printing an impossible figure.
        </p>
      </ToolSection>

      <ToolSection title="Why credits and not a plain average">
        <p>
          Averaging the SGPAs directly is only correct when every semester
          carries exactly the same number of credits. As soon as they differ,
          the two answers separate, and the credit-weighted one is what appears
          on a transcript.
        </p>
        <p>
          Take two semesters: a 9.0 across 10 credits, and a 7.0 across 30
          credits. The plain average of 9 and 7 is 8.0. The credit-weighted
          figure is 90 grade points plus 210, divided by 40 credits, which is
          7.5. Half a grade point of difference, purely because the weaker
          semester carried three times the load.
        </p>
        <p>
          This is also why a strong short semester rescues less than it feels
          like it should, and why a target CGPA gets harder to move the further
          into a degree you are: the credits already banked outweigh the ones
          left.
        </p>
      </ToolSection>

      <ToolSection title="A worked example of the reverse direction">
        <p>
          Say you hold a CGPA of 7.0 across 80 credits, with 20 credits left,
          and you want to finish on 7.5. A 7.5 across 100 credits is 750 grade
          points. You already hold 7.0 times 80, which is 560. The shortfall of
          190 has to come out of 20 credits, so you need an average of 9.5.
        </p>
        <p>
          Change the target to 8.0 and the sum becomes 800 minus 560, which is
          240 over 20 credits, an average of 12. That is above a 10-point scale,
          so the answer is that it cannot be done. The best available is 10
          across the remaining 20 credits, which lands you at 7.6.
        </p>
      </ToolSection>

      <ToolSection title="Frequently asked questions" id="faq">
        <FaqList items={SGPA_CGPA_FAQS} />
      </ToolSection>

      <ToolCta
        location="sgpa_cgpa_calculator"
        heading="The arithmetic is fixed. The next semester is not."
        body="FORKSAI turns your notes, slides and PDFs into flashcards and study sessions, so the credits still ahead of you go better than the ones behind."
      />

      <CalcToolCrossLinks current="/sgpa-to-cgpa-calculator" />
    </ToolPageShell>
  );
}
