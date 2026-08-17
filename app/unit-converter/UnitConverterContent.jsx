"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import ToolPageShell, {
  ToolCta,
  ToolSection,
  FormulaBlock,
  FaqList,
  cardClass,
  inputClass,
  labelClass,
  hintClass,
} from "@/components/ToolPageShell";
import {
  CalcToolCrossLinks,
  ModeSwitch,
  ResultCard,
  DetailCard,
  ErrorNote,
} from "@/lib/calcToolsShell";
import {
  UNIT_CATEGORIES,
  getCategory,
  getUnit,
  convertUnit,
  convertToAll,
} from "@/lib/calcToolsUnits";
import { num, formatSignificant } from "@/lib/calcToolsMath";
import { UNIT_CONVERTER_FAQS } from "@/lib/calcToolsFaqs";

export default function UnitConverterContent() {
  const [categoryId, setCategoryId] = useState("length");
  const category = getCategory(categoryId);

  const [value, setValue] = useState(category.defaultValue);
  const [fromId, setFromId] = useState(category.defaultFrom);
  const [toId, setToId] = useState(category.defaultTo);

  // Switching category has to reset the units too, because an id from one
  // table means nothing in another.
  const switchCategory = (id) => {
    const next = getCategory(id);
    setCategoryId(id);
    setFromId(next.defaultFrom);
    setToId(next.defaultTo);
    setValue(next.defaultValue);
  };

  const fromUnit = getUnit(category, fromId);
  const toUnit = getUnit(category, toId);
  const parsed = num(value);
  const valid = !Number.isNaN(parsed);

  const converted = useMemo(
    () => (valid ? convertUnit(parsed, fromUnit, toUnit) : NaN),
    [valid, parsed, fromUnit, toUnit]
  );

  const table = useMemo(
    () => (valid ? convertToAll(parsed, category, fromUnit) : []),
    [valid, parsed, category, fromUnit]
  );

  const swap = () => {
    setFromId(toId);
    setToId(fromId);
  };

  return (
    <ToolPageShell>
      {/* The converter sits first. Everything explanatory is below it. */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif font-black text-3xl sm:text-[2.6rem] leading-[1.08] text-[#111] mb-3">
          Unit converter
        </h1>
        <p className="text-[15px] sm:text-base text-[#444] leading-relaxed mb-6 max-w-2xl">
          Length, weight, temperature and area, converted the moment you type.
          The factors are the exact international definitions rather than
          rounded approximations, and every other unit in the category is shown
          underneath so you get the answer you did not think to ask for. Free,
          no signup.
        </p>

        <div className={`${cardClass} p-5 sm:p-7`}>
          <div className="mb-5">
            <span className={labelClass}>What are you converting?</span>
            <ModeSwitch
              label="Measurement category"
              options={UNIT_CATEGORIES.map((item) => ({ id: item.id, label: item.name }))}
              value={categoryId}
              onChange={switchCategory}
            />
          </div>

          <div className="grid sm:grid-cols-[1fr_1fr_auto_1fr] gap-3 sm:gap-4 items-end">
            <div>
              <label htmlFor="convert-value" className={labelClass}>
                Value
              </label>
              <input
                id="convert-value"
                name="convert-value"
                type="number"
                inputMode="decimal"
                step="any"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="convert-from" className={labelClass}>
                From
              </label>
              <select
                id="convert-from"
                name="convert-from"
                value={fromId}
                onChange={(e) => setFromId(e.target.value)}
                className={inputClass}
              >
                {category.units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:pb-1">
              <button
                type="button"
                onClick={swap}
                aria-label="Swap the two units"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-11 h-11 border-2 border-black rounded-xl bg-white text-sm font-bold text-[#111] shadow-[3px_3px_0_#111] transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
              >
                <ArrowLeftRight size={16} strokeWidth={2.75} aria-hidden="true" />
                <span className="sm:hidden">Swap units</span>
              </button>
            </div>
            <div>
              <label htmlFor="convert-to" className={labelClass}>
                To
              </label>
              <select
                id="convert-to"
                name="convert-to"
                value={toId}
                onChange={(e) => setToId(e.target.value)}
                className={inputClass}
              >
                {category.units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className={hintClass}>
            {category.offsets
              ? "Temperature scales start at different zeros, so this is not a plain multiplication. Everything routes through Celsius."
              : `Everything in this category is converted through ${category.base}.`}
          </p>

          {/* aria-live so a screen reader hears the answer change as you type,
              without a Convert button in the way. */}
          <div aria-live="polite" className="mt-6">
            {!valid ? (
              <ErrorNote>Enter a number to convert.</ErrorNote>
            ) : (
              <div className="space-y-3">
                <ResultCard
                  eyebrow="Result"
                  headline={`${formatSignificant(converted)} ${toUnit.symbol}`}
                >
                  <p>
                    {formatSignificant(parsed)} {fromUnit.name.toLowerCase()}
                    {Math.abs(parsed) === 1 ? "" : "s"} is{" "}
                    {formatSignificant(converted)} {toUnit.name.toLowerCase()}
                    {Math.abs(converted) === 1 ? "" : "s"}.
                  </p>
                </ResultCard>

                <DetailCard eyebrow={`The same value in every ${category.name.toLowerCase()} unit`}>
                  <ul className="space-y-1.5 mt-1">
                    {table.map((row) => (
                      <li
                        key={row.unit.id}
                        className="flex items-baseline justify-between gap-3 text-sm"
                      >
                        <span className="text-[#555]">{row.unit.name}</span>
                        <span className="font-bold text-[#111] tabular-nums text-right">
                          {formatSignificant(row.value)} {row.unit.symbol}
                        </span>
                      </li>
                    ))}
                  </ul>
                </DetailCard>
              </div>
            )}
          </div>
        </div>
      </section>

      <ToolSection title="Why temperature is the awkward one">
        <p>
          Length, weight and area all share a zero. Zero metres is zero feet,
          zero kilograms is zero pounds, and that is what lets a single
          multiplication do the whole job. Convert to a base unit, divide by the
          factor of the unit you want, done.
        </p>
        <p>
          Temperature scales do not share a zero. Water freezes at 0 Celsius and
          at 32 Fahrenheit, and absolute zero sits at 0 Kelvin, which is minus
          273.15 Celsius. So converting needs an offset as well as a factor, and
          the two steps cannot be collapsed into one number:
        </p>
        <FormulaBlock>F = C x 9 / 5 + 32</FormulaBlock>
        <FormulaBlock>C = (F - 32) x 5 / 9</FormulaBlock>
        <FormulaBlock>K = C + 273.15</FormulaBlock>
        <p>
          The anchors worth checking any converter against: 0C is exactly 32F
          and exactly 273.15K. 100C is 212F and 373.15K. Absolute zero, 0K, is
          minus 273.15C and minus 459.67F. And minus 40 is the one reading where
          Celsius and Fahrenheit agree, which is a genuinely useful test,
          because a converter that has mixed up the order of the offset and the
          factor will get that case wrong while looking fine at zero.
        </p>
      </ToolSection>

      <ToolSection title="The factors this page uses">
        <p>
          The imperial to metric conversions are defined exactly, not measured,
          so there is no approximation to argue with:
        </p>
        <FormulaBlock>1 inch = 25.4 mm exactly, so 1 foot = 0.3048 m</FormulaBlock>
        <FormulaBlock>1 pound = 0.45359237 kg exactly</FormulaBlock>
        <p>
          Area units follow from squaring the length ones, which is why a square
          foot is 0.09290304 square metres and not 0.3048. It is also why area
          conversions feel so much larger than people expect: doubling a length
          quadruples the area.
        </p>
        <p>
          A few results that fall out of these definitions and make good sanity
          checks: 1 metre is 3.2808399 feet, 1 mile is exactly 1.609344 km, 16
          ounces make a pound, 14 pounds make a stone, a square yard is exactly
          9 square feet, an acre is exactly 43,560 square feet, and a square
          mile is exactly 640 acres.
        </p>
        <p>
          The arithmetic here keeps full precision throughout and rounds only
          when the number is printed, to eight significant figures. Any rounding
          you can see is in the display, not in the sum.
        </p>
      </ToolSection>

      <ToolSection title="Frequently asked questions" id="faq">
        <FaqList items={UNIT_CONVERTER_FAQS} />
      </ToolSection>

      <ToolCta
        location="unit_converter"
        heading="Converting units is quick. Remembering the syllabus is not."
        body="FORKSAI turns your notes, slides and PDFs into flashcards and study sessions, so the definitions stay with you past the exam."
      />

      <CalcToolCrossLinks current="/unit-converter" />
    </ToolPageShell>
  );
}
