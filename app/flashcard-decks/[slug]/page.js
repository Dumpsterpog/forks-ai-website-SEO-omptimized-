import Link from "next/link";
import { notFound } from "next/navigation";
import StudyResourceLinks from "@/components/StudyResourceLinks";
import FooterFreeTools from "@/components/FooterFreeTools";
import { APP_DECK_URL, getPublicDeck, getPublicDecks, relatedDecks } from "@/lib/publicDecks";

// A public deck as a page: its cards in full, readable by search engines, with
// the way into FORKSAI to study them. Built for every public deck at build
// time; any other address is a 404.
// Built with the site, like every other page here.
export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  const decks = await getPublicDecks();
  return decks.map((d) => ({ slug: d.slug }));
}

const clip = (s, n) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}...` : s);
const LEVEL = { easy: "Easy", medium: "Medium", hard: "Hard" };

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const deck = await getPublicDeck(slug);
  if (!deck) return {};
  const url = `https://forksai.app/flashcard-decks/${deck.slug}`;
  const title = `${deck.title} Flashcards`;
  const description = clip(
    `${deck.cardCount} free flashcards on ${deck.title}. ${deck.cards[0]?.q || ""} Study them with spaced repetition on FORKSAI.`,
    158,
  );
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "article", title: `${title} | FORKSAI`, description, url, images: [{ url: "/body.png", width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title: `${title} | FORKSAI`, description, images: ["/body.png"] },
  };
}

export default async function DeckPage({ params }) {
  const { slug } = await params;
  const deck = await getPublicDeck(slug);
  if (!deck) notFound();
  const decks = await getPublicDecks();
  const more = relatedDecks(deck, decks);
  const url = `https://forksai.app/flashcard-decks/${deck.slug}`;
  const studyUrl = APP_DECK_URL(deck.id);

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "Quiz",
      name: `${deck.title} flashcards`,
      about: deck.title,
      url,
      educationalUse: "Practice",
      learningResourceType: "Flashcards",
      isAccessibleForFree: true,
      hasPart: deck.cards.slice(0, 30).map((c) => ({
        "@type": "Question",
        name: clip(c.q, 300),
        acceptedAnswer: { "@type": "Answer", text: clip(c.a, 500) },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://forksai.app" },
        { "@type": "ListItem", position: 2, name: "Flashcard decks", item: "https://forksai.app/flashcard-decks" },
        { "@type": "ListItem", position: 3, name: deck.title, item: url },
      ],
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      <header className="border-b-2 border-black px-6 py-5">
        <Link href="/" className="font-bold text-xl">FORKSAI</Link>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-12 w-full">
        <nav aria-label="Breadcrumb" className="text-sm mb-8">
          <Link href="/" className="underline">Home</Link> / <Link href="/flashcard-decks" className="underline">Flashcard decks</Link> / {clip(deck.title, 50)}
        </nav>
        <p className="font-bold uppercase tracking-widest text-sm mb-4">Free flashcard deck</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 break-words">{deck.title} flashcards</h1>
        <p className="text-lg mb-2">
          {deck.cardCount} cards{deck.difficulty ? `, ${LEVEL[deck.difficulty]}` : ""}, made and shared by a student on FORKSAI.
        </p>
        {deck.description && <p className="leading-relaxed mb-2">{deck.description}</p>}

        <div className="flex flex-wrap gap-3 mt-6">
          <a href={studyUrl} className="inline-block bg-black text-white px-6 py-4 font-bold rounded-lg">Study these cards free</a>
          <Link href="/ai-flashcards" className="inline-block border-2 border-black px-6 py-4 font-bold rounded-lg">Make a deck from your own notes</Link>
        </div>
        <p className="text-sm mt-4 leading-relaxed">
          FORKSAI brings each card back with spaced repetition, right before you would forget it. Free to start, no card needed.
        </p>

        <section className="mt-12" aria-labelledby="cards-heading">
          <h2 id="cards-heading" className="text-2xl font-bold mb-6">All {deck.cardCount} cards</h2>
          <ol className="space-y-4">
            {deck.cards.map((c, i) => (
              <li key={i} className="border-2 border-black rounded-lg p-5 bg-white">
                <p className="text-sm font-bold uppercase tracking-widest mb-2">Card {i + 1}</p>
                <p className="font-bold leading-relaxed break-words">{c.q}</p>
                {Array.isArray(c.options) && c.options.length > 0 ? (
                  <ul className="mt-3 space-y-1">
                    {c.options.map((o, j) => (
                      <li key={j} className={`leading-relaxed break-words ${c.correct?.includes(j) ? "font-bold" : ""}`}>
                        {String.fromCharCode(65 + j)}. {o}{c.correct?.includes(j) ? " (correct)" : ""}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 leading-relaxed break-words border-t border-black/20 pt-3">{c.a}</p>
                )}
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-12 border-2 border-black rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-3">Study {deck.title} the way that sticks</h2>
          <p className="leading-relaxed mb-5">
            Reading cards is not the same as remembering them. In FORKSAI you answer each card before you see the back, and the ones you miss come back first.
          </p>
          <a href={studyUrl} className="inline-block bg-black text-white px-6 py-4 font-bold rounded-lg">Study these cards free</a>
        </section>

        {more.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-4">More flashcard decks</h2>
            <ul className="space-y-3">
              {more.map((d) => (
                <li key={d.id}>
                  <Link href={`/flashcard-decks/${d.slug}`} className="underline">{d.title} flashcards</Link> <span className="text-sm">({d.cardCount} cards)</span>
                </li>
              ))}
            </ul>
            <p className="mt-4"><Link href="/flashcard-decks" className="underline font-bold">Browse every shared deck</Link></p>
          </section>
        )}
      </main>
      <StudyResourceLinks />
      <footer className="bg-black text-white px-6 mt-10"><div className="max-w-6xl mx-auto"><FooterFreeTools /></div></footer>
    </>
  );
}
