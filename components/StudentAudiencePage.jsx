import Link from "next/link";
import FooterFreeTools from "@/components/FooterFreeTools";
import { STUDENT_AUDIENCES } from "@/lib/studentAudiences";

export default function StudentAudiencePage({ audience }) {
  const url = "https://forksai.app/for/" + audience.slug;
  const schema = [{"@context":"https://schema.org","@type":"WebPage", name:audience.title, description:audience.description, url, isPartOf:{"@type":"WebSite",name:"FORKSAI",url:"https://forksai.app"}}, {"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"Home",item:"https://forksai.app"},{"@type":"ListItem",position:2,name:audience.label,item:url}]}];
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,"\u003c")}} />
    <header className="border-b-2 border-black px-6 py-5"><Link href="/" className="font-bold text-xl">FORKSAI</Link></header>
    <main className="max-w-4xl mx-auto px-6 py-14">
      <nav aria-label="Breadcrumb" className="text-sm mb-8"><Link href="/" className="underline">Home</Link> / {audience.label}</nav>
      <p className="font-bold uppercase tracking-widest text-sm mb-4">Study with FORKSAI</p>
      <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">{audience.title}</h1>
      <p className="text-lg leading-relaxed mb-6">{audience.intro}</p>
      <Link href="/ai-flashcards" className="inline-block bg-black text-white px-6 py-4 font-bold rounded-lg">Create your first flashcard deck</Link>
      <p className="text-sm mt-4">The free plan includes one AI-generated deck, unlimited manual decks, and seven non-AI study modes. Paid plans add AI generations.</p>
      {audience.sections.map(([heading, ...paragraphs]) => <section key={heading} className="mt-12"><h2 className="text-2xl font-bold mb-4">{heading}</h2>{paragraphs.map(p=><p key={p} className="leading-relaxed mb-4">{p}</p>)}</section>)}
      <section className="mt-12"><h2 className="text-2xl font-bold mb-4">Tools and guides for your next study session</h2><ul className="space-y-3">{audience.tools.map(([href,label])=><li key={href}><Link href={href} className="underline">{label}</Link></li>)}</ul></section>
      <section className="mt-12"><h2 className="text-2xl font-bold mb-4">Study guides for other students</h2><ul className="space-y-3">{STUDENT_AUDIENCES.filter(a=>a.slug!==audience.slug).map(a=><li key={a.slug}><Link href={"/for/"+a.slug} className="underline">{a.title}</Link></li>)}</ul></section>
    </main>
    <footer className="bg-black text-white px-6"><div className="max-w-6xl mx-auto"><FooterFreeTools /></div></footer>
  </>;
}
