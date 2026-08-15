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
  buttonClass,
} from "@/components/ToolPageShell";
import {
  CalcToolCrossLinks,
  ResultCard,
  StatGrid,
  ErrorNote,
} from "@/lib/calcToolsShell";
import { calcMarks, round, plural } from "@/lib/calcToolsMath";
import { MARKS_FAQS } from "@/lib/calcToolsFaqs";

const START_ROWS = [
  { id: 1, name: "Theory", obtained: "78", max: "100" },
  { id: 2, name: "Practical", obtained: "44", max: "50" },
  { id: 3, name: "Internal", obtained: "17", max: "20" },
];

// Labels sit above each field on a phone and go to screen readers only on wider
// screens, where the column headings carry the same information visually.
const rowLabelClass = "block text-xs font-bold text-[#666] mb-1 sm:sr-only";

export default function MarksPercentageCalculatorContent() {
  const [rows, setRows] = useState(START_ROWS);
  const [nextId, setNextId] = useState(4);

  const result = useMemo(() => calcMarks(rows), [rows]);

  const update = (id, field, value) => {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const addRow = () => {
    setRows((current) => [...current, { id: nextId, name: "", obtained: "", max: "" }]);
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
          Marks percentage calculator
        </h1>
        <p className="text-[15px] sm:text-base text-[#444] leading-relaxed mb-6 max-w-2xl">
          Enter each subject with its own maximum marks and get the total, the
          overall percentage and a subject by subject breakdown. Papers out of
          50, 100 and 20 can sit in the same list, because the maximum is set
          per row rather than assumed. Free, no signup.
        </p>

        <div className={`${cardClass} p-5 sm:p-7`}>
          {/* Visual column headings for wide screens. The real labels are on
              the inputs themselves, so this is decoration to a screen reader. */}
          <div
            aria-hidden="true"
            className="hidden sm:grid grid-cols-[1fr_7rem_7rem_2.5rem] gap-3 mb-2 px-1"
          >
            <span className="text-xs font-bold text-[#666]">Subject</span>
            <span className="text-xs font-bold text-[#666]">Marks obtained</span>
            <span className="text-xs font-bold text-[#666]">Out of</span>
            <span className="sr-only">Remove</span>
          </div>

          <div className="space-y-4 sm:space-y-3">
            {rows.map((row, index) => (
              <div
                key={row.id}
                className="grid sm:grid-cols-[1fr_7rem_7rem_2.5rem] gap-3 items-start border-2 border-black rounded-xl p-3 sm:border-0 sm:rounded-none sm:p-0"
              >
                <div>
                  <label htmlFor={`subject-name-${row.id}`} className={rowLabelClass}>
                    Subject {index + 1} name
                  </label>
                  <input
                    id={`subject-name-${row.id}`}
                    name={`subject-name-${row.id}`}
                    type="text"
                    value={row.name}
                    placeholder={`Subject ${index + 1}`}
                    onChange={(e) => update(row.id, "name", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor={`subject-obtained-${row.id}`} className={rowLabelClass}>
                    Marks obtained in subject {index + 1}
                  </label>
                  <input
                    id={`subject-obtained-${row.id}`}
                    name={`subject-obtained-${row.id}`}
                    type="number"
                    inputMode="decimal"
                    step="any"
                    min="0"
                    value={row.obtained}
                    onChange={(e) => update(row.id, "obtained", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor={`subject-max-${row.id}`} className={rowLabelClass}>
                    Maximum marks for subject {index + 1}
                  </label>
                  <input
                    id={`subject-max-${row.id}`}
                    name={`subject-max-${row.id}`}
                    type="number"
                    inputMode="decimal"
                    step="any"
                    min="1"
                    value={row.max}
                    onChange={(e) => update(row.id, "max", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="sm:pt-1">
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    disabled={rows.length < 2}
                    aria-label={`Remove subject ${index + 1}`}
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
            Add subject
          </button>

          {/* aria-live so a screen reader hears the total change as you type,
              without a Calculate button in the way. */}
          <div aria-live="polite" className="mt-6">
            {!result.ok ? (
              <ErrorNote>
                {result.reason === "invalid"
                  ? "Check the rows you have filled in: marks obtained cannot be more than the maximum, and the maximum has to be above zero."
                  : "Fill in the marks obtained and the maximum for at least one subject."}
              </ErrorNote>
            ) : (
              <div className="space-y-3">
                <ResultCard eyebrow="Overall percentage" headline={`${round(result.percent, 2)}%`}>
                  <p>
                    {round(result.totalObtained, 2)} marks out of{" "}
                    {round(result.totalMax, 2)}, across {result.subjects}{" "}
                    {plural(result.subjects, "subject", "subjects")}.
                  </p>
                </ResultCard>

                <StatGrid
                  items={[
                    { label: "Total obtained", value: round(result.totalObtained, 2) },
                    { label: "Total maximum", value: round(result.totalMax, 2) },
                    {
                      label: "Marks lost",
                      value: round(result.totalMax - result.totalObtained, 2),
                    },
                    { label: "Subjects counted", value: result.subjects },
                  ]}
                />

                <div className="border-2 border-black rounded-xl bg-white px-4 py-4">
                  <p className="text-[11px] font-black uppercase tracking-widest text-[#666] mb-3">
                    Subject by subject
                  </p>
                  <ul className="space-y-2">
                    {result.counted.map((row) => (
                      <li
                        key={row.index}
                        className="flex items-baseline justify-between gap-3 text-sm"
                      >
                        <span className="font-bold text-[#111]">{row.name}</span>
                        <span className="text-[#555] tabular-nums">
                          {round(row.obtained, 2)} / {round(row.max, 2)}{" "}
                          <span className="font-bold text-[#111]">
                            {round(row.percent, 2)}%
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                  {result.subjects > 1 ? (
                    <p className="text-sm text-[#555] mt-3 leading-relaxed">
                      Strongest is {result.best.name} at {round(result.best.percent, 2)}%,
                      weakest is {result.worst.name} at {round(result.worst.percent, 2)}%.
                    </p>
                  ) : null}
                </div>

                {result.problems.length ? (
                  <ErrorNote>
                    {result.problems.length}{" "}
                    {plural(result.problems.length, "row is", "rows are")} not
                    being counted, because the marks obtained are above the
                    maximum or the maximum is not above zero.
                  </ErrorNote>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </section>

      <ToolSection title="How the percentage of marks is worked out">
        <p>
          Add up every mark you obtained, add up every maximum across the same
          subjects, then divide and multiply by 100:
        </p>
        <FormulaBlock>
          percentage = (sum of marks obtained / sum of maximum marks) x 100
        </FormulaBlock>
        <p>
          The important part is that the maximum is summed as well, not assumed.
          A 20 mark internal and a 100 mark theory paper carry different weight
          in the total, and adding the maxima is what applies that weight
          without any extra step.
        </p>
        <p>
          Rows you have not filled in yet are ignored rather than counted as
          zeros, so the running percentage stays correct while you are still
          typing. A row where the marks obtained exceed the maximum is left out
          of the total and flagged, rather than quietly producing a percentage
          above 100.
        </p>
      </ToolSection>

      <ToolSection title="Why averaging the per-subject percentages is wrong">
        <p>
          It is tempting to work out each subject as a percentage and average
          those. That only gives the right answer when every paper is out of the
          same total, because a plain average treats every subject as equally
          important regardless of how many marks it carried.
        </p>
        <p>
          Take two subjects: 22.5 out of 25, and 60 out of 100. As percentages
          those are 90% and 60%, and the average of the two is 75%. The real
          overall percentage is 82.5 out of 125, which is 66%. The gap is
          entirely down to the 25 mark paper being given four times the weight
          it earned.
        </p>
        <p>
          This calculator works from the marks, never from the percentages, so
          that mistake cannot happen. The per-subject percentages shown in the
          breakdown are there to tell you where you stand, not to be averaged.
        </p>
      </ToolSection>

      <ToolSection title="A worked example">
        <p>
          Theory 78 out of 100, practical 44 out of 50, internal 17 out of 20.
          The marks add up to 139 and the maxima add up to 170, so the overall
          percentage is 139 divided by 170, which is 81.76%.
        </p>
        <p>
          Notice that the three subjects individually are 78%, 88% and 85%. The
          average of those three is 83.67%, which is not the answer, because the
          100 mark theory paper pulls harder than the other two. The marks based
          figure of 81.76% is the one your marksheet will agree with.
        </p>
      </ToolSection>

      <ToolSection title="Frequently asked questions" id="faq">
        <FaqList items={MARKS_FAQS} />
      </ToolSection>

      <ToolCta
        location="marks_percentage_calculator"
        heading="Adding up the marks is the easy half."
        body="FORKSAI turns your notes, slides and PDFs into flashcards and study sessions, so next term's marks need less adding up and less explaining."
      />

      <CalcToolCrossLinks current="/marks-percentage-calculator" />
    </ToolPageShell>
  );
}
