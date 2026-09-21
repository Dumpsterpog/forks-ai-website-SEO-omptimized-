"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolPageShell, { ToolCta, ToolCrossLinks, ToolSection, FormulaBlock, FaqList, cardClass, inputClass, labelClass, hintClass } from "@/components/ToolPageShell";
import { STUDY_PLANNER_FAQS } from "@/lib/newStudyToolFaqs";

function localDate(value) { const [y,m,d] = value.split("-").map(Number); return new Date(y,m-1,d,12); }

export default function StudyPlannerContent() {
  const [examDate, setExamDate] = useState(""), [topics, setTopics] = useState("24"), [minutes, setMinutes] = useState("90"), [review, setReview] = useState("30");
  const plan = useMemo(() => {
    if (!examDate) return null;
    const today = new Date(); today.setHours(12,0,0,0); const exam = localDate(examDate);
    const days = Math.ceil((exam - today) / 86400000);
    const t = Number(topics), daily = Number(minutes), r = Number(review);
    if (days < 1 || t < 1 || daily < 10 || r < 0 || r > 80) return { error: true };
    const studyDays = Math.max(1, days - 1), learnMinutes = daily * (1 - r / 100), reviewMinutes = daily - learnMinutes;
    return { days, studyDays, topics: t, topicsPerDay: t / studyDays, learnMinutes, reviewMinutes, minutesPerTopic: learnMinutes * studyDays / t, totalHours: daily * studyDays / 60 };
  }, [examDate, topics, minutes, review]);

  return <ToolPageShell>
    <section className="max-w-3xl mx-auto px-4 sm:px-6">
      <h1 className="font-serif font-black text-3xl sm:text-[2.6rem] leading-tight mb-3">Exam study planner calculator</h1>
      <p className="text-[15px] sm:text-base text-[#444] leading-relaxed mb-6 max-w-2xl">Turn the time before your exam into a daily topic target. Reserve part of every session for retrieval and leave the final day for review rather than new material.</p>
      <div className={`${cardClass} p-5 sm:p-7`}>
        <div className="grid sm:grid-cols-2 gap-4"><div><label htmlFor="exam-date" className={labelClass}>Exam date</label><input id="exam-date" type="date" className={inputClass} value={examDate} onChange={e => setExamDate(e.target.value)} /><p className={hintClass}>The final day is reserved for review.</p></div><div><label htmlFor="topic-count" className={labelClass}>Topics to cover</label><input id="topic-count" type="number" min="1" className={inputClass} value={topics} onChange={e => setTopics(e.target.value)} /><p className={hintClass}>Use lectures, objectives or chapter sections.</p></div><div><label htmlFor="daily-minutes" className={labelClass}>Minutes available per day</label><input id="daily-minutes" type="number" min="10" className={inputClass} value={minutes} onChange={e => setMinutes(e.target.value)} /></div><div><label htmlFor="review-share" className={labelClass}>Time reserved for review</label><div className="relative"><input id="review-share" type="number" min="0" max="80" className={`${inputClass} pr-10`} value={review} onChange={e => setReview(e.target.value)} /><span className="absolute right-4 top-3.5 font-bold">%</span></div></div></div>
        <div aria-live="polite" className="mt-6">{!plan ? <div className="border-2 border-black rounded-xl bg-white p-4 font-bold">Choose your exam date to build the plan.</div> : plan.error ? <div className="border-2 border-black rounded-xl bg-white p-4 font-bold">Use a future exam date, at least one topic, 10 minutes per day, and a review share from 0% to 80%.</div> : <div className="border-2 border-black rounded-xl bg-[#F0D44A] p-5"><p className="text-xs font-black uppercase tracking-widest text-black/60">Daily target for {plan.studyDays} study days</p><p className="font-serif font-black text-3xl mt-1">{Math.ceil(plan.topicsPerDay)} topic{Math.ceil(plan.topicsPerDay) === 1 ? "" : "s"} per day</p><div className="grid sm:grid-cols-3 gap-3 mt-4 text-sm"><p><strong>{Math.round(plan.learnMinutes)} min</strong><br/>new material</p><p><strong>{Math.round(plan.reviewMinutes)} min</strong><br/>retrieval and review</p><p><strong>{plan.totalHours.toFixed(1)} hours</strong><br/>planned before review day</p></div><p className="text-sm mt-4">You have about {Math.round(plan.minutesPerTopic)} learning minutes per topic. If that is too small, reduce the scope or increase the available time.</p></div>}</div>
      </div>
    </section>
    <ToolSection title="How the study plan is calculated"><p>The planner keeps the day before the exam for consolidation. It distributes the topics across the remaining days, then separates daily minutes into new learning and review.</p><FormulaBlock>topics per day = topics ÷ (days until exam - 1)</FormulaBlock><p>Use the review block for practice questions, blank-page recall, or flashcards. Do not count passive rereading as retrieval. The <Link href="/resources/student-study-kit" className="font-bold underline">free student study kit</Link> includes a weekly planner and an error log for recording what still needs work.</p></ToolSection>
    <ToolSection title="Build a stronger revision loop"><p>Start each session with yesterday&apos;s difficult material, learn today&apos;s topics, then finish by testing without notes. Turn course material into prompts with <Link href="/pdf-to-flashcards" className="font-bold underline">PDF to flashcards</Link>, and use the <Link href="/pomodoro-timer" className="font-bold underline">Pomodoro study timer</Link> when distractions make the first focused block hard to start.</p></ToolSection>
    <ToolSection title="Frequently asked questions" id="faq"><FaqList items={STUDY_PLANNER_FAQS} /></ToolSection>
    <ToolCta location="study_planner" heading="Turn the plan into daily practice" body="Create editable flashcards from the topics in your schedule and review them across the days you have available." />
    <ToolCrossLinks current="/study-planner" />
  </ToolPageShell>;
}
