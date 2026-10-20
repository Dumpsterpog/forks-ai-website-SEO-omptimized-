// The public decks students have shared, read from the app when the site is
// built. Each becomes a page at /flashcard-decks/<slug>, so a student searching
// "<topic> flashcards" can land on a real deck and study it in FORKSAI.
//
// Only decks their owners made public, and nothing about the owner. A deck
// published or unpublished after a build shows (or goes) at the next deploy.

const APP_ORIGIN = process.env.FORKSAI_APP_ORIGIN || "https://dashboard.forksai.app";
export const APP_DECK_URL = (id) => `${APP_ORIGIN}/decks/${encodeURIComponent(id)}`;

let pending = null;

// One request per build process. The answer is a few megabytes, above what
// Next's data cache keeps, so it is held here instead.
export function getPublicDecks() {
  if (!pending) {
    pending = (async () => {
      try {
        const res = await fetch(`${APP_ORIGIN}/api/userHandler?action=seoDecks`, { cache: "force-cache" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = await res.json();
        return Array.isArray(body?.decks) ? body.decks : [];
      } catch (err) {
        // A build without decks still ships the rest of the site.
        console.warn("[publicDecks] could not load public decks:", err?.message || err);
        return [];
      }
    })();
  }
  return pending;
}

export async function getPublicDeck(slug) {
  const decks = await getPublicDecks();
  return decks.find((d) => d.slug === slug) || null;
}

// Decks that share a word with this one's title, for the "more decks" links.
export function relatedDecks(deck, decks, count = 6) {
  const words = new Set(deck.title.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 3));
  const scored = decks
    .filter((d) => d.id !== deck.id)
    .map((d) => ({ d, score: d.title.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((w) => words.has(w)).length }))
    .sort((a, b) => b.score - a.score || b.d.cardCount - a.d.cardCount);
  return scored.slice(0, count).map((x) => x.d);
}
