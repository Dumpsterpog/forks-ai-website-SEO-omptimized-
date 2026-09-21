"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolPageShell, { ToolCta, ToolCrossLinks, ToolSection, FormulaBlock, FaqList, cardClass, inputClass, labelClass } from "@/components/ToolPageShell";
import { GPA_FAQS } from "@/lib/newStudyToolFaqs";

const starter = [
  { id: 1, course: "Anatomy", credits: "4", points: "3.7" },
  { id: 2, course: "Biochemistry", credits: "3", points: "3.3" },
  { id: 3, course: "Statistics", credits: "3", points: "4.0" },
];

export default function GpaCalculatorContent() {
  const [scale, setScale] = useState("4");
  const [rows, setRows] = useState(starter);
  const result = useMemo(() => {
    const valid = rows.map(r => ({ ...r, c: Number(r.credits), p: Number(r.points) })).filter(r => Number.isFinite(r.c) && r.c > 0 && Number.isFinite(r.p) && r.p >= 0 && r.p <= Number(scale));
    const credits = valid.reduce((sum, r) => sum + r.c, 0);
    const quality = valid.reduce((sum, r) => sum + r.c * r.p, 0);
    return { valid, credits, quality, gpa: credits ? quality / credits : null };
  }, [rows, scale]);
  const update = (id, field, value) => setRows(items => items.map(r => r.id === id ? { ...r, [field]: value } : r));
  const add = () => setRows(items => [...items, { id: Math.max(0, ...items.map(r => r.id)) + 1, course: "", credits: "3", points: "" }]);

  return <ToolPageShell>
    <section className="max-w-3xl mx-auto px-4 sm:px-6">
      <h1 className="font-serif font-black text-3xl sm:text-[2.6rem] leading-tight text-[#111] mb-3">Weighted GPA calculator</h1>
      <p className="text-[15px] sm:text-base text-[#444] leading-relaxed mb-6 max-w-2xl">Add each course, its credits and grade points to calculate a credit-weighted GPA. Choose the scale your institution uses. Free, private, and no signup.</p>
      <div className={`${cardClass} p-5 sm:p-7`}>
        <div className="max-w-xs mb-5"><label htmlFor="gpa-scale" className={labelClass}>GPA scale</label><select id="gpa-scale" className={inputClass} value={scale} onChange={e => setScale(e.target.value)}>{[4,5,10].map(n => <option key={n} value={n}>{n.toFixed(1)} scale</option>)}</select></div>
        <div className="space-y-3">
          {rows.map((row, index) => <div key={row.id} className="grid grid-cols-12 gap-2 items-end border-b border-black/10 pb-3">
            <div className="col-span-12 sm:col-span-6"><label className={labelClass} htmlFor={`course-${row.id}`}>Course {index + 1}</label><input id={`course-${row.id}`} className={inputClass} value={row.course} placeholder="Course name" onChange={e => update(row.id,"course",e.target.value)} /></div>
            <div className="col-span-5 sm:col-span-2"><label className={labelClass} htmlFor={`credits-${row.id}`}>Credits</label><input id={`credits-${row.id}`} type="number" min="0.1" step="0.5" className={inputClass} value={row.credits} onChange={e => update(row.id,"credits",e.target.value)} /></div>
            <div className="col-span-5 sm:col-span-3"><label className={labelClass} htmlFor={`points-${row.id}`}>Grade points</label><input id={`points-${row.id}`} type="number" min="0" max={scale} step="0.01" className={inputClass} value={row.points} onChange={e => update(row.id,"points",e.target.value)} /></div>
            <button type="button" aria-label={`Remove course ${index + 1}`} onClick={() => setRows(items => items.filter(r => r.id !== row.id))} className="col-span-2 sm:col-span-1 h-12 border-2 border-black rounded-xl bg-white font-black">×</button>
          </div>)}
        </div>
        <button type="button" onClick={add} className="mt-4 border-2 border-black rounded-xl bg-white px-4 py-2.5 font-bold shadow-[3px_3px_0_#111]">Add course</button>
        <div aria-live="polite" className="mt-6 border-2 border-black rounded-xl p-5 bg-[#F0D44A]">
          <p className="text-xs font-black uppercase tracking-widest text-black/60">Estimated GPA</p>
          <p className="font-serif font-black text-4xl mt-1">{result.gpa === null ? "—" : result.gpa.toFixed(2)} <span className="text-xl">/ {Number(scale).toFixed(1)}</span></p>
          <p className="text-sm mt-2">{result.credits ? `${result.quality.toFixed(2)} quality points ÷ ${result.credits.toFixed(1)} credits` : "Enter at least one valid course."}</p>
        </div>
      </div>
    </section>
    <ToolSection title="How to calculate GPA"><p>A credit-weighted GPA gives courses with more credits more influence. Multiply each course grade point by its credits, add the results, and divide by total credits.</p><FormulaBlock>GPA = sum(grade points × course credits) ÷ total credits</FormulaBlock><p>This tool accepts grade points rather than letter grades because letter-to-point rules differ by institution. Check your handbook before entering them. For an official result, follow your registrar&apos;s rules for repeats, transfers and pass/fail courses. See the <Link href="/blog/how-to-calculate-gpa" className="font-bold underline">worked GPA calculation guide</Link> for a complete example.</p></ToolSection>
    <ToolSection title="Turn the result into a study decision"><p>A GPA describes completed work; it does not tell you which topic to study next. Use the <Link href="/study-planner" className="font-bold underline">exam study planner</Link> to divide the remaining material across your available days, or calculate the score needed in one course with the <Link href="/final-grade-calculator" className="font-bold underline">final grade calculator</Link>.</p></ToolSection>
    <ToolSection title="Frequently asked questions" id="faq"><FaqList items={GPA_FAQS} /></ToolSection>
    <ToolCta location="gpa_calculator" heading="Know the number. Improve the next study session." body="Turn course notes and slides into editable flashcards, then review the material you still need to retrieve reliably." />
    <ToolCrossLinks current="/gpa-calculator" />
  </ToolPageShell>;
}
