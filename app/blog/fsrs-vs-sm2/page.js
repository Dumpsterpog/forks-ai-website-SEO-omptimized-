import BlogLayout from "@/components/BlogLayout";

const SEO_TITLE = "FSRS-5 vs SM-2: Why We Upgraded";
const SEO_DESC =
  "A deep technical breakdown of SM-2 and FSRS-5 — how they work, why SM-2 falls short, and what actually changes when you upgrade from one to the other.";
const SEO_URL = "https://forksai.app/blog/fsrs-vs-sm2";

export const metadata = {
  title: SEO_TITLE,
  description: SEO_DESC,
  alternates: { canonical: SEO_URL },
  openGraph: {
    type: "article",
    title: SEO_TITLE,
    description: SEO_DESC,
    url: SEO_URL,
    siteName: "FORKSAI",
    locale: "en_US",
    images: [{ url: "https://forksai.app/body.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@forksai",
    creator: "@forksai",
    title: SEO_TITLE,
    description: SEO_DESC,
    images: ["https://forksai.app/body.png"],
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "FSRS-5 vs SM-2: the algorithm upgrade that actually matters",
  description: SEO_DESC,
  image: "https://forksai.app/body.png",
  datePublished: "2026-05-01",
  dateModified: "2026-05-01",
  author: { "@type": "Person", name: "Avery Chen" },
  publisher: {
    "@type": "Organization",
    name: "FORKSAI",
    logo: { "@type": "ImageObject", url: "https://forksai.app/forks-logo.png" },
  },
  mainEntityOfPage: { "@type": "WebPage", "@id": SEO_URL },
};

export default function BlogFSRSvsSM2Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <BlogLayout
        title="FSRS-5 vs SM-2: the algorithm upgrade that actually matters"
        category="Study Science"
        author="Avery Chen"
        date="May 2026"
        readTime="9 min"
        ctaHeading="Study smarter with FSRS-5."
        ctaDesc="FORKSAI runs FSRS-5 under every flashcard session. Cards get harder intervals when you rate them Easy, shorter ones when you forget, and the algorithm tightens or loosens around your personal retention target."
      >
        <p>
          Spaced repetition software has had one algorithm at its core for thirty years: SM-2, written by Piotr Wozniak for SuperMemo 2 in 1987. It became the default choice for flashcard apps everywhere, and most of what the internet describes when it talks about spaced repetition is a direct implementation of it.
        </p>
        <p>
          SM-2 works. It is dramatically better than cramming. But it is also a 1987 approximation of a problem that researchers have had another three decades to model. FSRS-5 is the result of that work. FORKSAI upgraded to FSRS-5 because the difference in scheduling accuracy is large enough to matter in real study sessions, and the upgrade path for existing cards is clean.
        </p>
        <p>
          This post explains exactly how SM-2 works, where it breaks down, how FSRS-5 fixes those breaks, and what happens to your existing cards in FORKSAI when you study after the upgrade.
        </p>

        <h3 className="font-serif font-black text-2xl text-[#111] mt-10 mb-2">How SM-2 works</h3>
        <p>
          SM-2 tracks one number per card: the ease factor, which starts at 2.5. When you review a card and rate your recall from 0 to 5, the algorithm adjusts the ease factor and multiplies the current interval by it to get the next review date.
        </p>
        <p>
          If your ease factor is 2.5 and you last saw the card 10 days ago, your next interval is 25 days. Rate the card as hard, and the ease factor drops a little. Rate it as easy, and it nudges up slightly. The minimum ease factor is 1.3, so even your worst cards never get stuck in a permanent daily review loop.
        </p>
        <p>
          For a first-time review, SM-2 ignores the ease factor entirely and uses fixed intervals: 1 day, then 6 days, then starts multiplying. If you fail a card at any point, the interval resets to 1 and the ease factor takes a penalty.
        </p>
        <p>
          This is elegant and fast to compute. But it has three significant structural problems.
        </p>

        <h3 className="font-serif font-black text-2xl text-[#111] mt-10 mb-2">Where SM-2 breaks down</h3>
        <p>
          The first problem is that SM-2 does not model your actual probability of remembering a card. It uses the interval as a rough proxy: longer interval means the card is probably well-learned. But the interval tells you nothing about what percentage chance you have of recalling the card at review time. You might have a 95 percent chance of recalling a card after 30 days, or a 60 percent chance. SM-2 gives both cards the same treatment.
        </p>
        <p>
          The second problem is ease factor drift. The ease factor can only go down, never substantially recover. After a few hard patches on a difficult card, the ease factor gravitates toward its floor of 1.3. A card at 1.3 ease gets reviewed almost daily, even after you have learned it. The algorithm has no way to distinguish "genuinely difficult concept" from "I was tired when I reviewed this six times in a row." This phenomenon is called ease hell, and it is one of the main reasons FORKSAI moved off SM-2.
        </p>
        <p>
          The third problem is that SM-2 treats every rating equally regardless of how long ago you last saw the card. If you review a card one day after learning it versus ten days after learning it, a "Hard" rating means the same thing to SM-2. In reality, struggling to recall something after one day tells you something very different about memory stability than struggling after ten days.
        </p>

        <h3 className="font-serif font-black text-2xl text-[#111] mt-10 mb-2">The two-component memory model behind FSRS</h3>
        <p>
          FSRS stands for Free Spaced Repetition Scheduler. It was developed by Jarrett Ye (working under the name L-M Sherlock) starting around 2022, and has gone through five major versions. FSRS-5 is the current version and is what FORKSAI runs.
        </p>
        <p>
          FSRS is built on a two-component model of memory. Every card has two properties: stability (S) and difficulty (D). Stability is measured in days and represents how long until your probability of recall drops to your desired retention target, typically 90 percent. A stability of 30 means you have a 90 percent chance of recalling the card 30 days from now. Difficulty is a number from 1 to 10 reflecting how inherently hard the card is for you.
        </p>
        <p>
          The forgetting curve in FSRS is a precise mathematical function. Your retrievability R at time t days after the last review is:
        </p>
        <p className="font-mono text-sm bg-[#f4f4f0] border border-black/10 rounded-xl px-4 py-3 text-[#111]">
          R(t, S) = (1 + 0.2346 * t / S) ^ (−0.5)
        </p>
        <p>
          The constants come from fitting the model to millions of real review outcomes. This gives FSRS a direct answer to the question SM-2 cannot answer: what is the probability that you will remember this card tomorrow?
        </p>

        <h3 className="font-serif font-black text-2xl text-[#111] mt-10 mb-2">How FSRS schedules the next review</h3>
        <p>
          When you rate a card in FSRS, the algorithm first computes your current retrievability using the elapsed time and the card's stability. It then updates stability based on whether you succeeded or failed, and how hard you found it.
        </p>
        <p>
          For a successful recall, stability grows. The growth is larger when retrievability was low at review time (you pushed it close to forgetting before reviewing, which is harder and creates a stronger memory) and smaller when retrievability was high (you reviewed well before forgetting, which is easier and builds less). For a failed recall, stability collapses and the card goes back to short intervals.
        </p>
        <p>
          The next interval is then computed by solving the forgetting curve equation for t: how many days until R drops to your desired retention target? If your target is 90 percent and the card has a stability of 40 days, your next interval is 40 days. If your target is 85 percent, the same card gets a slightly longer interval because you are comfortable with a lower recall probability at review time.
        </p>
        <p>
          This is the key thing SM-2 cannot do: FSRS lets you configure your desired retention. In FORKSAI you set this in Settings under the Scheduling section -- 85, 90, or 95 percent -- and every subsequent review uses that target to compute intervals. Students cramming for an exam next month want 95 percent recall. Students building long-term knowledge in a subject they will return to over years might be comfortable with 85 percent and want longer intervals. SM-2 has no mechanism for any of this.
        </p>

        <h3 className="font-serif font-black text-2xl text-[#111] mt-10 mb-2">What changed in FSRS-5</h3>
        <p>
          FSRS-4.5 used 17 trainable weights. FSRS-5 adds two more (W[17] and W[18]) specifically to handle same-day reviews more accurately.
        </p>
        <p>
          In FSRS-4.5, if you reviewed a card multiple times in the same day, the short-term stability formula used hardcoded constants to estimate how much each re-review strengthened the memory. In FSRS-5, those constants become learned weights, calibrated against the actual dataset of review outcomes. The formula for short-term stability is:
        </p>
        <p className="font-mono text-sm bg-[#f4f4f0] border border-black/10 rounded-xl px-4 py-3 text-[#111]">
          S_short = S * exp(W[17] * (rating − 3 + W[18]))
        </p>
        <p>
          W[17] = 0.51 and W[18] = 0.8 in the default calibration. This means that a Good rating on the same day modestly extends stability, while an Easy rating extends it meaningfully more and a Hard or Again rating compresses it. FSRS-4.5 used fixed values of 0.72 and 0.14 for these constants, which were less accurate especially in learning sessions where you see a new card several times before the end of the day.
        </p>
        <p>
          FSRS-5 also introduces a stability ceiling of 36,500 days (100 years) to prevent edge cases on mature cards from producing astronomically large intervals. In practice this only affects cards you have studied for many years and rated Easy on every review, but the ceiling prevents integer overflow bugs in long-running decks.
        </p>

        <h3 className="font-serif font-black text-2xl text-[#111] mt-10 mb-2">Upgrading existing SM-2 cards to FSRS-5</h3>
        <p>
          Migrating from SM-2 to FSRS-5 requires translating the SM-2 data (ease factor and interval) into the FSRS vocabulary (stability and difficulty). FORKSAI does this automatically for any card that was created or studied before the upgrade.
        </p>
        <p>
          The migration uses two mappings. The SM-2 interval becomes the FSRS stability directly: if SM-2 said you should review a card in 30 days, FSRS sets stability to 30. This is a reasonable approximation because both quantities represent roughly how long until you are likely to forget.
        </p>
        <p>
          The SM-2 ease factor maps to FSRS difficulty on an inverted scale. A high ease factor (easy card) maps to low difficulty. A low ease factor (hard card) maps to high difficulty. Specifically, ease factors in the SM-2 range of 1.3 to 2.5 map to FSRS difficulty in the range of 10 to 1. A card at the ease floor of 1.3 starts with difficulty 10. A card at ease 2.5 starts with difficulty 1.
        </p>
        <p>
          This translation is deliberately conservative. It takes what SM-2 already knows about the card and carries that knowledge forward without overcorrecting in either direction. After the first few reviews under FSRS-5, the algorithm refines its estimates based on your actual recall performance, so the initial migration accuracy matters less than it might seem.
        </p>
        <p>
          Cards that have never been reviewed in SM-2 (new cards) skip migration entirely and start fresh with FSRS-5 initial stability derived from your rating on the first review.
        </p>

        <h3 className="font-serif font-black text-2xl text-[#111] mt-10 mb-2">The practical difference in daily study on FORKSAI</h3>
        <p>
          The most immediate difference you notice in FORKSAI's Spaced Repetition mode after the FSRS-5 upgrade is in how intervals respond to ratings. Under SM-2, rating a card Easy bumped the ease factor slightly but the interval still followed a fixed multiplication. Under FSRS-5, an Easy rating on a well-learned card produces a dramatically longer next interval because the algorithm knows your retrievability was already high at review time -- this review added relatively little to memory stability, so the schedule extends accordingly.
        </p>
        <p>
          The second practical difference is the elimination of ease hell. In FORKSAI's implementation, difficulty is recalculated on each review using a mean-reversion formula that pulls it gently back toward a per-card baseline. A string of hard reviews on a difficult anatomy term does not trap that card in a permanent daily loop the way SM-2 ease degradation did. Cards that were stuck before the upgrade gradually recover their intervals as FSRS-5 accumulates evidence about your actual recall.
        </p>
        <p>
          The third practical difference is the retention target. In FORKSAI Settings, under Scheduling, you choose 85, 90, or 95 percent. This is not a display preference -- it changes the interval every card receives on every review. If you are preparing for an exam in two weeks, 95 percent compresses intervals and keeps cards cycling more aggressively through your queue. If you are a medical student maintaining knowledge across a five-year residency, 85 percent extends intervals, reduces daily review load, and lets the algorithm work over longer timescales. FORKSAI's Weak Spot Trainer also runs on FSRS-5 data, surfacing cards where your recall probability has dropped the furthest so you spend session time where it counts most.
        </p>

        <h3 className="font-serif font-black text-2xl text-[#111] mt-10 mb-2">Why the algorithm matters more than the interface</h3>
        <p>
          It is easy to dismiss scheduling algorithms as an implementation detail behind the flashcard interface. The cards look the same. The review feels the same. You still rate each one and move on.
        </p>
        <p>
          But the scheduling algorithm determines which cards you see and when, which is to say it determines what you actually spend your study time on. An algorithm that gets this wrong by ten percent means ten percent of your review sessions are spent on cards that were either too early (wasting the session) or too late (after the knowledge was already partially lost). Over a semester-long deck of five hundred cards reviewed daily, that is a large cumulative error.
        </p>
        <p>
          FSRS-5 was calibrated against real review outcome data at a scale SM-2 never had access to in 1987. It directly models the quantity that matters most (your probability of recall) rather than using interval length as a rough proxy. That is why FORKSAI upgraded the entire scheduling engine rather than patching around SM-2's limitations. For students treating spaced repetition as a serious long-term study tool rather than a short-term exam hack, the difference is not marginal -- and it compounds with every session.
        </p>
        <p>
          Curious what FSRS-5 feels like in practice? <a href="/flashcards" className="font-bold text-[#111] underline underline-offset-4">Study a deck with FORKSAI's active recall flashcards</a> and watch the intervals adjust to your own recall in real time.
        </p>
      </BlogLayout>
    </>
  );
}
