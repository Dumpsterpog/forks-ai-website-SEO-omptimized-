import Link from "next/link";
export default function StudyResourceLinks({dark=false}) {
 return <section className={"max-w-4xl mx-auto my-10 px-6 py-8 rounded-xl border "+(dark?"border-white/20 text-zinc-100":"border-black/20 bg-white text-black")}>
 <h2 className="text-2xl font-bold mb-4">Plan your next review session</h2>
 <p className="leading-relaxed mb-4">Use the <Link href="/resources/student-study-kit" className="underline">free student study kit</Link> to plan a week of revision, check flashcard quality, and record mistakes from practice questions.</p>
 <p className="leading-relaxed">Need a deck first? <Link href="/pdf-to-flashcards" className="underline">Turn a lecture PDF into editable flashcards</Link>, then follow the <Link href="/blog/active-recall" className="underline">active recall guide</Link> to practise answering before revealing the back of each card.</p>
 </section>;
}
