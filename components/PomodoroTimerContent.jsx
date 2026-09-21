"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ToolPageShell, { ToolCta, ToolCrossLinks, ToolSection, FaqList, cardClass, inputClass, labelClass } from "@/components/ToolPageShell";
import { POMODORO_FAQS } from "@/lib/newStudyToolFaqs";

export default function PomodoroTimerContent() {
  const [focus, setFocus] = useState(25), [shortBreak, setShortBreak] = useState(5), [longBreak, setLongBreak] = useState(15);
  const [mode, setMode] = useState("focus"), [seconds, setSeconds] = useState(25 * 60), [running, setRunning] = useState(false), [sessions, setSessions] = useState(0);
  const duration = mode === "focus" ? focus : mode === "short" ? shortBreak : longBreak;
  const label = mode === "focus" ? "Focus" : mode === "short" ? "Short break" : "Long break";
  const choose = next => { setMode(next); setRunning(false); const mins = next === "focus" ? focus : next === "short" ? shortBreak : longBreak; setSeconds(mins * 60); };
  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => setSeconds(current => {
      if (current > 1) return current - 1;
      clearInterval(id);
      setRunning(false);
      if (mode === "focus") setSessions(n => n + 1);
      return 0;
    }), 1000);
    return () => clearInterval(id);
  }, [running, mode]);
  const changeDuration = (kind, setter, raw) => {
    const next = Math.min(120, Math.max(1, Number(raw) || 1));
    setter(next);
    if (!running && mode === kind) setSeconds(next * 60);
  };
  const clock = useMemo(() => `${String(Math.floor(seconds / 60)).padStart(2,"0")}:${String(seconds % 60).padStart(2,"0")}`, [seconds]);

  return <ToolPageShell>
    <section className="max-w-3xl mx-auto px-4 sm:px-6">
      <h1 className="font-serif font-black text-3xl sm:text-[2.6rem] leading-tight mb-3">Pomodoro study timer</h1>
      <p className="text-[15px] sm:text-base text-[#444] leading-relaxed mb-6 max-w-2xl">Protect one focused study interval, take a real break, and repeat. Adjust every interval to your attention and workload. The timer runs locally in your browser.</p>
      <div className={`${cardClass} p-5 sm:p-8 text-center`}>
        <div className="flex flex-wrap justify-center gap-2 mb-6">{[["focus","Focus"],["short","Short break"],["long","Long break"]].map(([key,text]) => <button key={key} onClick={() => choose(key)} className={`border-2 border-black rounded-xl px-4 py-2 font-bold ${mode === key ? "bg-[#F0D44A]" : "bg-white"}`}>{text}</button>)}</div>
        <p className="text-xs font-black uppercase tracking-widest text-black/50">{label}</p><div role="timer" aria-live="off" className="font-serif font-black text-7xl sm:text-8xl tabular-nums my-3">{clock}</div><p className="text-sm text-[#555] mb-6">Completed focus sessions: <strong>{sessions}</strong></p>
        <div className="flex justify-center gap-3"><button onClick={() => setRunning(v => !v)} className="border-2 border-black rounded-xl bg-[#F0D44A] px-7 py-3 font-black shadow-[4px_4px_0_#111]">{running ? "Pause" : "Start"}</button><button onClick={() => { setRunning(false); setSeconds(duration * 60); }} className="border-2 border-black rounded-xl bg-white px-5 py-3 font-bold">Reset</button></div>
        <div className="grid grid-cols-3 gap-3 mt-8 text-left">{[["focus-min","Focus","focus",focus,setFocus],["short-min","Short break","short",shortBreak,setShortBreak],["long-min","Long break","long",longBreak,setLongBreak]].map(([id,text,kind,value,setter]) => <div key={id}><label htmlFor={id} className={labelClass}>{text}</label><input id={id} type="number" min="1" max="120" className={inputClass} value={value} onChange={e => changeDuration(kind, setter, e.target.value)} /></div>)}</div>
      </div>
    </section>
    <ToolSection title="How to use a Pomodoro timer for studying"><ol className="list-decimal pl-5 space-y-2"><li>Choose one concrete target, such as answering 20 practice questions.</li><li>Remove notifications and start the focus timer.</li><li>Write distractions down instead of following them.</li><li>Stop when the interval ends and take the break.</li><li>After the break, retrieve what you learned before rereading.</li></ol><p>A timer protects attention, but it does not choose a learning method. Read the <Link href="/blog/pomodoro-technique-for-studying" className="font-bold underline">Pomodoro technique study guide</Link>, pair the interval with <Link href="/blog/active-recall" className="font-bold underline">active recall</Link>, or prepare a deck with the <Link href="/text-to-flashcards" className="font-bold underline">text-to-flashcards tool</Link>.</p></ToolSection>
    <ToolSection title="Frequently asked questions" id="faq"><FaqList items={POMODORO_FAQS} /></ToolSection>
    <ToolCta location="pomodoro_timer" heading="Fill the focus block with active study" body="FORKSAI turns your course material into editable flashcards and structured review sessions." />
    <ToolCrossLinks current="/pomodoro-timer" />
  </ToolPageShell>;
}
