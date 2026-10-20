import Link from "next/link";
import StudyResourceLinks from "@/components/StudyResourceLinks";
import FooterFreeTools from "@/components/FooterFreeTools";
import { getPublicDecks } from "@/lib/publicDecks";

// Every shared deck on one page, A to Z, so each deck page is a link away
// from the rest of the site.

const url = "https://forksai.app/flashcard-decks";
const title = "Free Flashcard Decks";
const description = "Free flashcard decks made and shared by students on FORKSAI: biology, chemistry, medicine, law, history and more. Study any of them with spaced repetition.";

// Built with the site, like every other page here.
export const dynamic = "force-static";
export const metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: { type: "website", title: `${title} | FORKSAI`, description, url, images: [{ url: "/body.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: `${title} | FORKSAI`, description, images: ["/body.png"] },
};

// The first letter a title files under; anything not A to Z goes under "#".
const letterOf = (t) => {
  const c = t.normalize("NFKD").replace(/[̀-ͯ]/g, "").trim()[0]?.toUpperCase() || "#";
  return /[A-Z]/.test(c) ? c : "#";
};

export default async function LibraryPage() {
  const decks = [...(await getPublicDecks())].sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }));
  // A to Z, then one "#" group for titles starting with a number or another script.
  const byLetter = new Map();
  for (const d of decks) {
    const l = letterOf(d.title);
    if (!byLetter.has(l)) byLetter.set(l, []);
    byLetter.get(l).push(d);
  }
  const groups = [...byLetter.keys()]
    .sort((a, b) => (a === "#") - (b === "#") || a.localeCompare(b))
    .map((letter) => ({ letter, decks: byLetter.get(letter) }));
  const cards = decks.reduce((n, d) => n + d.cardCount, 0);

  const schema = [
    { "@context": "https://schema.org", "@type": "CollectionPage", name: title, description, url, isPartOf: { "@type": "WebSite", name: "FORKSAI", url: "https://forksai.app" } },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://forksai.app" },
        { "@type": "ListItem", position: 2, name: "Flashcard decks", item: url },
      ],
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      <header className="border-b-2 border-black px-6 py-5">
        <Link href="/" className="font-bold text-xl">FORKSAI</Link>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-12 w-full">
        <nav aria-label="Breadcrumb" className="text-sm mb-8"><Link href="/" className="underline">Home</Link> / Flashcard decks</nav>
        <p className="font-bold uppercase tracking-widest text-sm mb-4">Shared by students</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">Free flashcard decks</h1>
        <p className="text-lg leading-relaxed mb-6 max-w-3xl">
          {decks.length} decks and {cards.toLocaleString("en-US")} cards that students made on FORKSAI and chose to share. Open one to read every card, then study it free with spaced repetition.
        </p>
        <div className="flex flex-wrap gap-3 mb-10">
          <Link href="/ai-flashcards" className="inline-block bg-black text-white px-6 py-4 font-bold rounded-lg">Make a deck from your own notes</Link>
        </div>

        {groups.length > 0 && (
          <nav aria-label="Jump to a letter" className="flex flex-wrap gap-2 mb-10">
            {groups.map((g) => (
              <a key={g.letter} href={`#letter-${g.letter === "#" ? "other" : g.letter}`} className="border-2 border-black rounded px-3 py-1 font-bold">{g.letter}</a>
            ))}
          </nav>
        )}

        {groups.map((g) => (
          <section key={g.letter} id={`letter-${g.letter === "#" ? "other" : g.letter}`} className="mb-10">
            <h2 className="text-2xl font-bold mb-4 border-b-2 border-black pb-2">{g.letter}</h2>
            <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
              {g.decks.map((d) => (
                <li key={d.id} className="break-words">
                  <Link href={`/flashcard-decks/${d.slug}`} className="underline">{d.title} flashcards</Link> <span className="text-sm">({d.cardCount} cards)</span>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {decks.length === 0 && <p className="leading-relaxed">Shared decks are on their way. In the meantime, <Link href="/ai-flashcards" className="underline">make your own from your notes</Link>.</p>}
      </main>
      <StudyResourceLinks />
      <footer className="bg-black text-white px-6 mt-10"><div className="max-w-6xl mx-auto"><FooterFreeTools /></div></footer>
    </>
  );
}
