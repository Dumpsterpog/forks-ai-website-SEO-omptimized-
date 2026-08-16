"use client";

// Shared pieces for the six everyday calculators: the cross-link strip, the
// number field and the segmented mode switch. Lives here rather than being
// pasted into each page so the set cannot drift apart.

import { useEffect } from "react";
import Link from "next/link";
import { inputClass, labelClass, hintClass } from "@/components/ToolPageShell";
import { CALC_TOOLS } from "@/lib/calcToolsList";
import { countToolUseOnResult } from "@/lib/toolUsage";

// Internal linking is what makes the six pages rank as a set instead of six
// orphans, so every one of them links to the other five and to the hub.
export function CalcToolCrossLinks({ current }) {
  const others = CALC_TOOLS.filter((tool) => tool.href !== current);
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10 print:hidden">
      <h2 className="font-serif font-black text-xl text-[#111] mb-4">More free calculators</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {others.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="block border-2 border-black rounded-xl bg-white p-4 no-underline shadow-[3px_3px_0_#111] transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
          >
            <span className="block font-bold text-sm text-[#111] mb-1.5">{tool.name}</span>
            <span className="block text-xs text-[#666] leading-relaxed">{tool.blurb}</span>
          </Link>
        ))}
      </div>
      <p className="text-sm text-[#555] mt-4">
        Every free tool on the site is listed on the{" "}
        <Link href="/tools" className="font-bold text-[#111] underline underline-offset-2">
          free student tools hub
        </Link>
        .
      </p>
    </section>
  );
}

/**
 * A labelled number input. The label is a real <label>, the keyboard is the
 * numeric one on a phone, and there is no Calculate button anywhere in the
 * set: every field calls onChange straight into the result.
 */
export function NumberField({
  id,
  label,
  hint,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
  decimal,
  placeholder,
}) {
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
          inputMode={decimal ? "decimal" : "numeric"}
          min={min}
          max={max}
          step={step ?? (decimal ? "any" : 1)}
          value={value}
          placeholder={placeholder}
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

// A text field for naming a row, kept alongside NumberField so the two line up.
export function TextField({ id, label, value, onChange, placeholder, hint }) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input
        id={id}
        name={id}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
      {hint ? <p className={hintClass}>{hint}</p> : null}
    </div>
  );
}

/**
 * Segmented control for the pages that answer more than one question. Built
 * from real buttons with a radiogroup role so arrow keys and a screen reader
 * both behave, rather than styled divs.
 */
const MODE_COLUMNS = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
};

export function ModeSwitch({ label, options, value, onChange }) {
  // Tailwind needs the class to exist in the source, so the count maps to a
  // written-out class rather than being interpolated.
  const columns = MODE_COLUMNS[options.length] || "sm:grid-cols-3";
  return (
    <div role="radiogroup" aria-label={label} className={`grid grid-cols-2 ${columns} gap-2`}>
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.id)}
            className="border-2 border-black rounded-xl px-3 py-2.5 text-sm font-bold text-[#111] text-left transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
            style={{
              background: active ? "#F0D44A" : "#fff",
              boxShadow: active ? "1px 1px 0 #111" : "3px 3px 0 #111",
              transform: active ? "translate(2px, 2px)" : "none",
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

// The one big number a calculator exists to produce.
export function ResultCard({ eyebrow, headline, children }) {
  // A calculator has no download, so producing this number is the use. The
  // headline is the dependency rather than the mount, and countToolUseOnResult
  // ignores anything before the first real input, so a calculator that renders
  // a result for its prefilled defaults does not count the page view.
  useEffect(() => {
    countToolUseOnResult();
  }, [headline]);

  return (
    <div className="border-2 border-black rounded-xl px-4 py-4" style={{ background: "#F0D44A" }}>
      <p className="text-[11px] font-black uppercase tracking-widest text-[#111]/60 mb-1">
        {eyebrow}
      </p>
      <p className="font-serif font-black text-2xl sm:text-3xl text-[#111] leading-tight">
        {headline}
      </p>
      {children ? (
        <div className="text-sm text-[#111]/75 mt-1.5 leading-relaxed">{children}</div>
      ) : null}
    </div>
  );
}

// The supporting numbers underneath it.
export function DetailCard({ eyebrow, children }) {
  return (
    <div className="border-2 border-black rounded-xl bg-white px-4 py-4">
      <p className="text-[11px] font-black uppercase tracking-widest text-[#666] mb-1">
        {eyebrow}
      </p>
      <div className="text-[15px] text-[#111] leading-relaxed">{children}</div>
    </div>
  );
}

// Small label and value pairs, for the "also worth knowing" rows.
export function StatGrid({ items }) {
  return (
    <dl className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {items.map((item) => (
        <div key={item.label} className="border-2 border-black rounded-xl bg-white px-3 py-3">
          <dt className="text-[11px] font-bold uppercase tracking-wide text-[#666] mb-1">
            {item.label}
          </dt>
          <dd className="text-base font-black text-[#111] leading-tight break-words">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function ErrorNote({ children }) {
  return (
    <p className="border-2 border-black rounded-xl bg-white px-4 py-4 text-sm font-bold text-[#111]">
      {children}
    </p>
  );
}
