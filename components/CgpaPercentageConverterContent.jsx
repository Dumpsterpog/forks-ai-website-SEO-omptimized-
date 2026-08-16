"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpDown } from "lucide-react";
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
  buttonClass,
} from "@/components/ToolPageShell";
import {
  convertGrade,
  round,
  CGPA_RULES,
  SCALES,
  GPA4_RULE,
} from "@/lib/studyToolMath";
import { CGPA_FAQS } from "@/lib/toolFaqs";
import { countToolUseOnResult } from "@/lib/toolUsage";

const SCALE_LIST = [SCALES.cgpa10, SCALES.gpa4, SCALES.percent];

export default function CgpaPercentageConverterContent() {
  const [value, setValue] = useState("8.5");
  const [from, setFrom] = useState("cgpa10");
  const [to, setTo] = useState("percent");
  const [ruleId, setRuleId] = useState("x9.5");

  const result = useMemo(
    () => convertGrade(value, from, to, ruleId),
    [value, from, to, ruleId]
  );

  // These three predate the shared calculator shell, so the usage count is
  // wired here rather than in ResultCard. Keyed on the result, and ignored
  // before the first real input, so the prefilled defaults do not count.
  useEffect(() => {
    countToolUseOnResult();
  }, [result]);

  const swap = () => {
    setFrom(to);
    setTo(from);
    // Carrying the answer across keeps the swap useful rather than resetting
    // the user to a value in the wrong scale.
    if (result.ok && !result.outOfRange) setValue(round(result.result, 2));
  };

  const usesCgpaRule = from === "cgpa10" || to === "cgpa10";
  const activeRule = CGPA_RULES.find((r) => r.id === ruleId) || CGPA_RULES[0];

  const errorText = () => {
    if (result.reason === "range") {
      return `A ${result.scale.label} value has to be between ${result.scale.min} and ${result.scale.max}.`;
    }
    return "Enter a value to see the conversion.";
  };

  return (
    <ToolPageShell>
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif font-black text-3xl sm:text-[2.6rem] leading-[1.08] text-[#111] mb-3">
          CGPA to percentage converter
        </h1>
        <p className="text-[15px] sm:text-base text-[#444] leading-relaxed mb-6 max-w-2xl">
          Convert between a 10-point CGPA, a 4-point GPA and a percentage, in
          either direction. The formula being applied is named on screen, and
          you can switch it, because universities do not all use the same one.
        </p>

        <div className={`${cardClass} p-5 sm:p-7`}>
          <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-4 sm:gap-4 items-end">
            <div>
              <label htmlFor="from-scale" className={labelClass}>
                Convert from
              </label>
              <select
                id="from-scale"
                name="from-scale"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className={inputClass}
              >
                {SCALE_LIST.map((scale) => (
                  <option key={scale.id} value={scale.id}>
                    {scale.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={swap}
              className={`${buttonClass} sm:mb-0 h-[52px]`}
              aria-label="Swap the two scales"
            >
              <ArrowUpDown size={16} strokeWidth={2.75} />
              <span className="sm:hidden">Swap</span>
            </button>

            <div>
              <label htmlFor="to-scale" className={labelClass}>
                Convert to
              </label>
              <select
                id="to-scale"
                name="to-scale"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className={inputClass}
              >
                {SCALE_LIST.map((scale) => (
                  <option key={scale.id} value={scale.id}>
                    {scale.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5">
            <label htmlFor="grade-value" className={labelClass}>
              Your {SCALES[from].label}
            </label>
            <input
              id="grade-value"
              name="grade-value"
              type="number"
              inputMode="decimal"
              min={SCALES[from].min}
              max={SCALES[from].max}
              step={SCALES[from].step}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className={inputClass}
            />
            <p className={hintClass}>
              Anything from {SCALES[from].min} to {SCALES[from].max}.
            </p>
          </div>

          {usesCgpaRule ? (
            <div className="mt-5">
              <label htmlFor="cgpa-rule" className={labelClass}>
                Conversion rule for the 10-point CGPA
              </label>
              <select
                id="cgpa-rule"
                name="cgpa-rule"
                value={ruleId}
                onChange={(e) => setRuleId(e.target.value)}
                className={inputClass}
              >
                {CGPA_RULES.map((rule) => (
                  <option key={rule.id} value={rule.id}>
                    {rule.label}
                  </option>
                ))}
              </select>
              <p className={hintClass}>{activeRule.note}</p>
            </div>
          ) : null}

          <div aria-live="polite" className="mt-6">
            {!result.ok ? (
              <p className="border-2 border-black rounded-xl bg-white px-4 py-4 text-sm font-bold text-[#111]">
                {errorText()}
              </p>
            ) : (
              <div className="space-y-3">
                <div
                  className="border-2 border-black rounded-xl px-4 py-4"
                  style={{ background: result.outOfRange ? "#ffffff" : "#F0D44A" }}
                >
                  <p className="text-[11px] font-black uppercase tracking-widest text-[#111]/60 mb-1">
                    Result
                  </p>
                  {result.outOfRange ? (
                    <>
                      <p className="font-serif font-black text-2xl sm:text-3xl text-[#111] leading-tight">
                        Outside the scale
                      </p>
                      <p className="text-sm text-[#111]/85 mt-1.5 leading-relaxed">
                        This rule maps {round(result.value)} {SCALES[from].label} to{" "}
                        {round(result.result)} on the {SCALES[to].label} scale, which runs from{" "}
                        {result.toScale.min} to {result.toScale.max}. The rule does not cover this
                        end of the range, so pick another one or check the figure you entered.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-serif font-black text-3xl sm:text-4xl text-[#111] leading-tight">
                        {round(result.result)}
                        {to === "percent" ? "%" : ""}
                      </p>
                      <p className="text-sm text-[#111]/75 mt-1.5 leading-relaxed">
                        {round(result.value)} {SCALES[from].label} is {round(result.result)}
                        {to === "percent" ? "%" : ` ${SCALES[to].label}`}.
                      </p>
                    </>
                  )}
                </div>

                {/* Naming the formula is the point of the page. A bare number
                    is worthless when four conventions are in circulation. */}
                <div className="border-2 border-black rounded-xl bg-white px-4 py-4">
                  <p className="text-[11px] font-black uppercase tracking-widest text-[#666] mb-2">
                    Formula applied
                  </p>
                  <ul className="space-y-2">
                    {result.steps.map((step) => (
                      <li key={step} className="font-mono text-[13px] font-bold text-[#111]">
                        {step}
                      </li>
                    ))}
                  </ul>
                  {from !== "percent" && to !== "percent" ? (
                    <p className="text-xs text-[#555] mt-3 leading-relaxed">
                      This conversion goes through a percentage, so it stacks two separate
                      conventions. Treat it as an estimate, not an official figure.
                    </p>
                  ) : null}
                </div>
              </div>
            )}
          </div>

          <p className="text-xs text-[#666] mt-5 leading-relaxed border-t-2 border-black/10 pt-4">
            Universities differ, and the number that counts on an application form is the one your
            own institution certifies. Check your academic regulations, transcript legend or
            examination office before quoting any conversion.
          </p>
        </div>
      </section>

      <ToolSection title="The formulas, written out">
        <p>
          <strong>10-point CGPA to percentage.</strong> The most widely used
          rule in India, and the default here, is the CBSE multiplier:
        </p>
        <FormulaBlock>Percentage = CGPA x 9.5</FormulaBlock>
        <p>
          A CGPA of 8.5 becomes 80.75%. Going the other way, divide instead of
          multiplying, so 76% becomes a CGPA of 8.0.
        </p>
        <p>
          Some institutions use a straight multiplication by 10, and some
          subtract a fixed amount from the CGPA before multiplying, which is
          where rules like these come from:
        </p>
        <FormulaBlock>
          Percentage = (CGPA - 0.5) x 10 or Percentage = (CGPA - 0.75) x 10
        </FormulaBlock>
        <p>
          On a CGPA of 8.5 those three rules give 85%, 80% and 77.5%. That is a
          7.5 point spread on the same transcript, which is exactly why this
          page makes you choose and then tells you what it used.
        </p>
        <p>
          <strong>4-point GPA to percentage.</strong> The usual linear mapping
          is:
        </p>
        <FormulaBlock>{GPA4_RULE.formula}</FormulaBlock>
        <p>
          A GPA of 3.5 becomes 87.5%. This treats the 4-point scale as evenly
          spaced, which most of them are not, so it is an approximation. For
          university applications, use whatever conversion the receiving
          institution asks for.
        </p>
      </ToolSection>

      <ToolSection title="Quick reference: 10-point CGPA at 9.5">
        <div className="overflow-x-auto border-2 border-black rounded-xl bg-white">
          <table className="w-full text-sm">
            <caption className="sr-only">
              CGPA to percentage using the multiply by 9.5 rule
            </caption>
            <thead>
              <tr className="border-b-2 border-black">
                <th scope="col" className="text-left font-bold text-[#111] px-4 py-3">
                  CGPA
                </th>
                <th scope="col" className="text-left font-bold text-[#111] px-4 py-3">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody>
              {[10, 9.5, 9, 8.5, 8, 7.5, 7, 6.5, 6, 5.5, 5].map((cgpa) => (
                <tr key={cgpa} className="border-b border-black/10 last:border-0">
                  <td className="px-4 py-2.5 font-bold text-[#111]">{cgpa.toFixed(1)}</td>
                  <td className="px-4 py-2.5 text-[#444]">{round(cgpa * 9.5)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Round the way your institution rounds. Some certify to two decimal
          places, some to the nearest whole percent, and a form that asks for
          one will not accept the other.
        </p>
      </ToolSection>

      <ToolSection title="Frequently asked questions" id="faq">
        <FaqList items={CGPA_FAQS} />
      </ToolSection>

      <ToolCta
        location="cgpa_converter"
        heading="The CGPA is the score. The studying is what moves it."
        body="FORKSAI turns your notes, slides and PDFs into flashcards and spaced repetition sessions, so next semester's number takes care of itself."
      />

      <ToolCrossLinks current="/cgpa-to-percentage-calculator" />
    </ToolPageShell>
  );
}
