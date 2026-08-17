"use client";

import Link from "next/link";
import { ToolSection, FaqList } from "@/components/ToolPageShell";
import ComparePageShell, {
  CompareHero,
  AccuracyNote,
  CompareTable,
  BetterElsewhere,
  CompareCta,
  CompareCrossLinks,
} from "@/components/ComparePageShell";
import { REMNOTE_ALTERNATIVE_FAQS } from "@/lib/compareFaqs";

const JOBS = [
  {
    job: "Turn a lecture PDF into cards",
    forksai:
      "Upload the file and pick a difficulty, the question types and roughly how many cards you want. The cards land one at a time as they generate, so you can see the shape of the deck before it finishes.",
  },
  {
    job: "Turn a recorded lecture into cards",
    forksai:
      "Paste the YouTube URL. FORKSAI pulls the transcript and builds the deck from it, the same way it would from a document.",
  },
  {
    job: "Turn a photographed page into cards",
    forksai:
      "Upload the image. OCR runs in the browser and the extracted text goes through the same generation step.",
  },
  {
    job: "Get notes as well as cards",
    forksai:
      "The PDF to notes tool writes structured, Cornell, narrative or outline notes from the same file, with a detail level and a focus area you set.",
  },
  {
    job: "Review on a proper schedule",
    forksai:
      "FSRS-5 spaced repetition, rated 1 to 4 per card with the keyboard. Session analytics at the end cover time, retention and your weakest cards.",
  },
  {
    job: "Drill only the cards you keep failing",
    forksai:
      "Weak Spot Trainer loads only cards with a high forget count and loops until you clear all of them.",
  },
  {
    job: "Rehearse under exam conditions",
    forksai:
      "Exam Simulator generates multiple choice questions from your own deck, with a question count and a timer, and scores you at the end.",
  },
  {
    job: "Bring decks over from another app",
    forksai:
      "Import from Quizlet, Anki as .txt or .apkg, or CSV and TXT, with a review and edit step before anything saves.",
  },
];

export default function RemNoteAlternativeContent() {
  return (
    <ComparePageShell>
      <CompareHero
        eyebrow="Alternatives"
        title="A RemNote alternative for students who would rather not build the deck by hand"
        intro="If you are looking for something other than RemNote, it is usually for one of two reasons: the writing system is more structure than you want to maintain, or the cards are still costing you an evening you needed for revising. FORKSAI is built for the second reason. You hand it the material and it produces the deck."
      />

      <AccuracyNote product="RemNote" />

      <ToolSection title="First, work out which half you are replacing">
        <p>
          RemNote is a note-taking app built on the idea that flashcards belong
          inside your notes, reviewed with spaced repetition. That is a genuinely
          good idea, and it is why the app has a following among medical
          students in particular. It also means the app is really two products
          bolted into one, and which one you are trying to replace changes the
          answer completely.
        </p>
        <p>
          If your notes are the point, and you keep going back to them for
          months, you want another notes-first tool. Nothing on this page will
          change that, and we would rather you find the right thing than switch
          to us and bounce.
        </p>
        <p>
          If the notes were mostly a route to the cards, and the thing you
          actually do every week is revise, then you want a study tool that skips
          the writing step. That is what FORKSAI is.
        </p>
      </ToolSection>

      <ToolSection title="What FORKSAI actually does">
        <p>
          The whole product starts from one assumption: your material already
          exists, and it exists in somebody else&apos;s format. A lecturer&apos;s slide
          deck. A scanned handout. A textbook chapter. A two hour recording. You
          did not write it, so a tool that only makes cards out of what you
          typed cannot help you with it.
        </p>
        <CompareTable
          caption="Common study jobs and how FORKSAI handles each one"
          rows={JOBS}
        />
        <p>
          There are twelve study modes in total. Beyond spaced repetition and
          plain flip review there is a swipe mode for fast sorting, a timed
          Memory Sprint, MCQ practice, Explain Back where you type an answer in
          your own words and the AI grades it and hints, an AI tutor with
          evaluation, explanation, hint and Socratic modes, image occlusion for
          diagrams, a Pomodoro mode, and live study rooms where a small group
          revises the same deck against a shared leaderboard.
        </p>
      </ToolSection>

      <ToolSection title="No card syntax to learn">
        <p>
          The cost people underestimate when they adopt a notes-first system is
          not the app, it is the discipline. The cards only appear if you write
          in the way the app expects, every time, including the week you are ill
          and the week before finals when you are copying slides at 1am. Miss it
          for a fortnight and you have notes with no deck behind them.
        </p>
        <p>
          FORKSAI has no syntax. There is nothing to remember to do while you
          take notes, because the generation step happens afterwards, from
          whatever you ended up with. If you would rather write cards yourself,
          the manual creator is there, with images, drag to reorder and batch
          editing before you save. It is just not the only path to a deck.
        </p>
      </ToolSection>

      <ToolSection title="If you are a medical student">
        <p>
          Medical is the heaviest use case on the platform, so there are a few
          things aimed at it directly. The Medical Encyclopedia takes any
          medical term and returns an anatomy and location breakdown, with
          physiology and clinical significance sections on the paid plan. Image
          occlusion covers the labelling work that diagrams demand. Case Study
          Mode generates a clinical scenario out of a deck you already have, so
          the same cards get tested as applied reasoning rather than recall.
        </p>
        <p>
          Deck analytics are built for the same pressure: new and due counts,
          mastered percentage, retention percentage, a difficulty distribution,
          and a weak spots list ordered by how often you have forgotten each
          card, with AI topic clustering on demand when you want to know which
          subject is quietly sinking.
        </p>
      </ToolSection>

      <ToolSection title="Moving your existing cards across">
        <p>
          Import handles Quizlet exports, Anki decks as .txt or .apkg, and plain
          CSV or TXT. It runs in three steps: choose the source, upload the file,
          then review and edit the parsed cards before saving. That middle review
          step matters more than it sounds, because exports from any app carry
          formatting that parses badly, and fixing it before the deck exists is
          far less annoying than fixing it after.
        </p>
        <p>
          If your material is not in any of those formats, paste it as text or
          export it to PDF. Both are first class inputs.
        </p>
      </ToolSection>

      <ToolSection title="When RemNote is the better choice">
        <BetterElsewhere>
          <p>
            <strong>You want one knowledge base for years, not a term.</strong>{" "}
            A notes-first tool where everything links to everything is a
            different kind of object from a deck library. FORKSAI organises
            around decks, folders and tags. If you want a web of interlinked
            notes as your primary artefact, that is not what we built.
          </p>
          <p>
            <strong>You write your own notes and you like writing cards as you
            go.</strong> If your material originates with you and you enjoy
            phrasing cards while the idea is fresh, inline card creation is a
            real advantage and generation adds nothing you need.
          </p>
          <p>
            <strong>You already have a system that works.</strong> The switching
            cost of a study setup is genuinely high, and a working habit beats a
            better tool you use twice. If your current setup is holding, keep it.
          </p>
        </BetterElsewhere>
      </ToolSection>

      <ToolSection title="A sane way to test it">
        <p>
          Do not migrate anything. Take one chapter you were going to make cards
          from this week, run it through the{" "}
          <Link href="/ai-flashcards" className="font-bold text-[#111] underline underline-offset-2">
            AI flashcard generator
          </Link>{" "}
          or the{" "}
          <Link href="/pdf-to-flashcards" className="font-bold text-[#111] underline underline-offset-2">
            PDF to flashcards
          </Link>{" "}
          flow, and compare the deck you get against the deck you would have
          typed. That comparison takes ten minutes and tells you more than any
          feature table.
        </p>
        <p>
          If you want to see the card extraction quality with nothing installed
          and no account, the free{" "}
          <Link href="/text-to-flashcards" className="font-bold text-[#111] underline underline-offset-2">
            text to flashcards tool
          </Link>{" "}
          runs pattern matching in your browser and exports to CSV or Anki.
        </p>
      </ToolSection>

      <CompareCta
        heading="Bring one PDF and see what comes out"
        body="Upload a chapter you were already planning to revise. If the deck is not better than the one you would have typed, you have lost a minute."
        location="remnote_alternative_cta"
      />

      <ToolSection title="Questions people ask before switching">
        <FaqList items={REMNOTE_ALTERNATIVE_FAQS} />
      </ToolSection>

      <CompareCrossLinks current="/remnote-alternative" />
    </ComparePageShell>
  );
}
