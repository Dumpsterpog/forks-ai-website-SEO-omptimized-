"use client";

import { useEffect, useMemo, useState } from "react";
import ToolPageShell, {
  ToolCta,
  ToolSection,
  FormulaBlock,
  FaqList,
  cardClass,
  labelClass,
  hintClass,
  inputClass,
  buttonClass,
} from "@/components/ToolPageShell";
import {
  CalcToolCrossLinks,
  ModeSwitch,
  ResultCard,
  DetailCard,
  StatGrid,
  ErrorNote,
} from "@/lib/calcToolsShell";
import {
  calcAge,
  formatDateInput,
  longDate,
  plural,
  withCommas,
} from "@/lib/calcToolsMath";
import { AGE_FAQS } from "@/lib/calcToolsFaqs";

const ERRORS = {
  incomplete: "Pick a date of birth and a date to measure to.",
  future: "The date of birth is after the date you are measuring to, so there is no age to report yet.",
};

// Today has to come from the browser, not the render on the server, or the two
// disagree whenever the visitor's timezone has already rolled over the date.
// So it is filled in on mount instead of during the first render.
function todayInput() {
  const now = new Date();
  return formatDateInput({
    y: now.getFullYear(),
    m: now.getMonth() + 1,
    d: now.getDate(),
  });
}

function DateField({ id, label, value, onChange, hint, min, max }) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input
        id={id}
        name={id}
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
      {hint ? <p className={hintClass}>{hint}</p> : null}
    </div>
  );
}

export default function AgeCalculatorContent() {
  const [birth, setBirth] = useState("2000-01-01");
  const [mode, setMode] = useState("today");
  const [today, setToday] = useState("");
  const [custom, setCustom] = useState("");

  useEffect(() => {
    const now = todayInput();
    setToday(now);
    setCustom((current) => current || now);
  }, []);

  const target = mode === "today" ? today : custom;
  const result = useMemo(() => calcAge(birth, target), [birth, target]);

  return (
    <ToolPageShell>
      {/* The calculator sits first. Everything explanatory is below it. */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif font-black text-3xl sm:text-[2.6rem] leading-[1.08] text-[#111] mb-3">
          Age calculator
        </h1>
        <p className="text-[15px] sm:text-base text-[#444] leading-relaxed mb-6 max-w-2xl">
          Your exact age in years, months and days, on today or on any date you
          choose. It also gives the total in days and weeks and counts down to
          your next birthday. Leap years and short months are handled properly,
          which is where most age calculators quietly go wrong. Free, no signup.
        </p>

        <div className={`${cardClass} p-5 sm:p-7`}>
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
            <DateField
              id="birth-date"
              label="Date of birth"
              value={birth}
              onChange={setBirth}
              min="1900-01-01"
              max="2200-12-31"
            />
            <div>
              <span className={labelClass}>Age on</span>
              <ModeSwitch
                label="Date to measure the age on"
                value={mode}
                onChange={setMode}
                options={[
                  { id: "today", label: "Today" },
                  { id: "custom", label: "Another date" },
                ]}
              />
              <p className={hintClass}>
                Pick another date to check an age on an application cut-off or an
                exam eligibility date.
              </p>
            </div>
          </div>

          {mode === "custom" ? (
            <div className="mt-4 sm:mt-5 grid sm:grid-cols-2 gap-4 sm:gap-5 items-end">
              <DateField
                id="target-date"
                label="Measure the age on this date"
                value={custom}
                onChange={setCustom}
                min="1900-01-01"
                max="2200-12-31"
              />
              <div>
                <button
                  type="button"
                  onClick={() => setCustom(today)}
                  className={buttonClass}
                >
                  Reset to today
                </button>
              </div>
            </div>
          ) : null}

          {/* aria-live so a screen reader hears the answer change as the dates
              change, without a Calculate button in the way. */}
          <div aria-live="polite" className="mt-6">
            {!result.ok ? (
              <ErrorNote>{ERRORS[result.reason] || ERRORS.incomplete}</ErrorNote>
            ) : (
              <div className="space-y-3">
                <ResultCard
                  eyebrow="Exact age"
                  headline={`${result.years} ${plural(result.years, "year", "years")}, ${result.months} ${plural(result.months, "month", "months")}, ${result.days} ${plural(result.days, "day", "days")}`}
                >
                  <p>
                    Measured from {longDate(result.birth)} to{" "}
                    {longDate(result.target)}
                    {mode === "today" ? ", which is today" : ""}. That is{" "}
                    {withCommas(result.totalDays)}{" "}
                    {plural(result.totalDays, "day", "days")} in all.
                  </p>
                </ResultCard>

                <StatGrid
                  items={[
                    { label: "In months", value: `${withCommas(result.totalMonths)} months` },
                    {
                      label: "In weeks",
                      value: `${withCommas(result.totalWeeks)} weeks${result.weekRemainder ? `, ${result.weekRemainder} ${plural(result.weekRemainder, "day", "days")}` : ""}`,
                    },
                    { label: "In days", value: withCommas(result.totalDays) },
                    { label: "In hours", value: withCommas(result.totalHours) },
                  ]}
                />

                <DetailCard eyebrow="Next birthday">
                  {result.isBirthdayToday ? (
                    <p className="font-bold">
                      That is today. The next one is{" "}
                      {longDate(result.nextBirthday)}, a{" "}
                      {result.nextBirthdayWeekday}, in{" "}
                      {withCommas(result.daysToNextBirthday)} days, turning{" "}
                      {result.turningAge}.
                    </p>
                  ) : (
                    <p className="font-bold">
                      {withCommas(result.daysToNextBirthday)}{" "}
                      {plural(result.daysToNextBirthday, "day", "days")} to go.
                      It falls on {longDate(result.nextBirthday)}, a{" "}
                      {result.nextBirthdayWeekday}, turning {result.turningAge}.
                    </p>
                  )}
                  {result.leapBirthday && result.birthdayClamped ? (
                    <p className="text-sm text-[#555] mt-2 leading-relaxed font-normal">
                      That is a 29 February birthday and{" "}
                      {result.nextBirthday.y} has no 29 February, so the
                      countdown uses 28 February. The exact age above is
                      unaffected, because it is measured from the real date.
                    </p>
                  ) : null}
                </DetailCard>

                <DetailCard eyebrow="Day of the week">
                  <p className="font-bold">
                    {longDate(result.birth)} was a {result.bornOn}.
                  </p>
                </DetailCard>
              </div>
            )}
          </div>
        </div>
      </section>

      <ToolSection title="How age in years, months and days is worked out">
        <p>
          Age looks like simple subtraction and is not. Taking one date away
          from another field by field gives you a day count that can come out
          negative, and the usual fix is to borrow days from a neighbouring
          month. Which neighbouring month you borrow from is exactly where
          different calculators disagree, and it is why two of them can be a day
          apart on the same pair of dates.
        </p>
        <p>
          This page avoids the borrow entirely. It counts whole months first,
          then measures what is left in plain days:
        </p>
        <FormulaBlock>
          months = largest n where birth date + n months is on or before the
          target date
        </FormulaBlock>
        <FormulaBlock>
          years = floor(months / 12), remaining months = months mod 12
        </FormulaBlock>
        <FormulaBlock>
          days = calendar days from (birth date + months) to the target date
        </FormulaBlock>
        <p>
          Adding a month clamps the day to the length of the month it lands in,
          so 31 January plus one month is 28 February, or 29 February in a leap
          year. Because the anchor date is always on or before the target, the
          leftover day count can never be negative and never needs patching.
        </p>
      </ToolSection>

      <ToolSection title="Leap years, and the case that breaks other calculators">
        <p>
          A year is a leap year when it divides by 4, except that a century year
          has to divide by 400. So 2000 and 2024 have a 29 February, and 1900
          and 2100 do not. The total day count on this page is a real calendar
          count, so every leap day between your two dates is included.
        </p>
        <p>
          <strong>31 January to 1 March.</strong> In a leap year the answer is 1
          month and 1 day, because 31 January plus one month is 29 February, and
          1 March is one day after that. A calculator that borrows the length of
          the month before the target date instead ends up with 1 month and
          minus 1 day and then rounds its way to something wrong.
        </p>
        <p>
          <strong>Born on 29 February.</strong> From 29 February 2000 to 28
          February 2001 this page reports exactly 1 year, and 365 days. From 29
          February 2004 to 29 February 2024 it reports exactly 20 years, and
          7,305 days, which is 20 times 365 plus the 5 leap days in between.
        </p>
        <p>
          For the birthday countdown in a year with no 29 February, the page
          uses 28 February and says so on screen. That is a convention rather
          than a fact of arithmetic, and countries differ on it, so check your
          own paperwork wherever it matters legally.
        </p>
      </ToolSection>

      <ToolSection title="A worked example">
        <p>
          Take a birth date of 15 August 1995 and a target date of 15 August
          2025. The exact age is 30 years, 0 months and 0 days. The total is
          10,958 days, not 10,950, because 8 leap days fall in that span: 1996,
          2000, 2004, 2008, 2012, 2016, 2020 and 2024. In whole weeks that is
          1,565 weeks and 3 days.
        </p>
        <p>
          Move the target date back one day to 14 August 2025 and the age
          becomes 29 years, 11 months and 30 days, with 1 day left until the
          birthday. The jump from 29 years and 11 months to 30 years happens on
          the day itself, which is the behaviour every eligibility form assumes.
        </p>
      </ToolSection>

      <ToolSection title="Frequently asked questions" id="faq">
        <FaqList items={AGE_FAQS} />
      </ToolSection>

      <ToolCta
        location="age_calculator"
        heading="Knowing the date is easy. Knowing the material is the hard part."
        body="FORKSAI turns your notes, slides and PDFs into flashcards and study sessions, so the hours you spend revising actually stick."
      />

      <CalcToolCrossLinks current="/age-calculator" />
    </ToolPageShell>
  );
}
