"use client";

import Link from "next/link";
import { ToolSection, FaqList } from "@/components/ToolPageShell";
import ComparePageShell, {
  CompareHero,
  CompareTable,
  BetterElsewhere,
  CompareCta,
  CompareCrossLinks,
} from "@/components/ComparePageShell";
import { FLASHCARDS_AND_NOTES_FAQS } from "@/lib/compareFaqs";

const JOBS = [
  {
    job: "One source, both outputs",
    forksai:
      "The same PDF can produce a flashcard deck and a set of notes. Notes come as structured, Cornell, narrative or outline, with a detail level and focus area you set.",
  },
  {
    job: "Keep them in the same place",
    forksai:
      "Decks and notes share one library with nested folders, tags, search, grid or list view, and bulk move or delete.",
  },
  {
    job: "See what you have already done",
    forksai:
      "Open a deck and it shows which study modes you have run on it, so review history stays attached to the material rather than living in your head.",
  },
  {
    job: "Turn the notes into review",
    forksai:
      "FSRS-5 spaced repetition schedules each card from your 1 to 4 confidence rating, and eleven other modes cover drilling, testing and explaining.",
  },
  {
    job: "Find the weak parts",
    forksai:
      "Deck analytics give new and due counts, mastered percentage, retention percentage, a difficulty spread and a weak spots list ordered by forget count.",
  },
  {
    job: "Write it yourself when you want to",
    forksai:
      "Manual card creator with images, drag to reorder and batch editing, plus a manual notes editor and a summarizer with a rich text editor.",
  },
];

export default function FlashcardsAndNotesContent() {
  return (
    <ComparePageShell>
      <CompareHero
        eyebrow="Guide"
        title="Flashcards and notes in one app: what that actually means"
        intro="Every study app claims to integrate notes and flashcards. Almost none of them mean the same thing by it. There are two real designs behind the phrase, they suit different people, and picking the wrong one is why so many students end up with a beautiful notes system and an empty deck."
      />

      <ToolSection title="The two designs">
        <p>
          The first design is notes-first. You write in the app, and cards are
          created inline as you write, usually with a syntax that marks which
          part is the prompt and which is the answer. The integration is total:
          the card and the note are literally the same object.
        </p>
        <p>
          The second is study-first. The app takes material as input and produces
          both the notes and the deck from it. The integration is that they share
          a source, a library and a review history rather than a paragraph.
        </p>
        <p>
          Neither is better in the abstract. The one that fits you depends on a
          single question: where does your material come from? If you write most
          of what you study, notes-first is natural and generation adds nothing.
          If most of what you study arrives as somebody else&apos;s PDF, slide export
          or recording, notes-first asks you to retype their material into your
          format before it can help you.
        </p>
      </ToolSection>

      <ToolSection title="Where notes-first tends to break down">
        <p>
          It breaks at the worst possible moment. A notes-first system produces
          cards only if you keep writing in the required way, every session. The
          fortnight you are behind, ill, or copying slides at 1am is the
          fortnight the cards do not get made, and it is also the fortnight you
          most needed them.
        </p>
        <p>
          The second failure is quieter. The syntax is a small tax on every
          sentence, and small taxes on frequent actions get avoided. People stop
          writing cards and keep writing notes, then discover in week ten that
          the deck covers the first three weeks of term.
        </p>
      </ToolSection>

      <ToolSection title="How FORKSAI joins the two">
        <CompareTable
          caption="What notes and flashcards sharing an app means in FORKSAI"
          rows={JOBS}
        />
        <p>
          The generation step is the same regardless of input. A PDF, pasted
          text, a YouTube URL whose transcript gets pulled, or a photo run
          through in-browser OCR all go through the same path, so a mixed pile of
          material becomes one consistent deck rather than four half-systems.
        </p>
      </ToolSection>

      <ToolSection title="Notes are not the finish line">
        <p>
          The reason to care about the pairing at all is that notes on their own
          do very little. Writing something down and reading it back is
          recognition, not recall, and recognition is what makes rereading feel
          productive while leaving you blank in the exam. The deck is what turns
          the note into a question you have to answer from memory.
        </p>
        <p>
          That is also why the scheduling matters more than the storage. FORKSAI
          runs FSRS-5, which sets a per-card interval from your confidence rating
          rather than showing you the same deck at the same rate forever. There
          is a{" "}
          <Link href="/blog/fsrs-vs-sm2" className="font-bold text-[#111] underline underline-offset-2">
            writeup on FSRS-5 against the older SM-2
          </Link>{" "}
          if you want the mechanics, and{" "}
          <Link href="/blog/active-recall" className="font-bold text-[#111] underline underline-offset-2">
            one on active recall
          </Link>{" "}
          for why the question format is the part doing the work.
        </p>
      </ToolSection>

      <ToolSection title="When a different tool is the right call">
        <BetterElsewhere>
          <p>
            <strong>You are the author of your material.</strong> If your notes
            originate with you and you like phrasing cards while the idea is
            fresh, an inline card syntax is fast and produces better cards than
            generation will. A notes-first tool is the right shape for you.
          </p>
          <p>
            <strong>You want a knowledge base, not a deck library.</strong>{" "}
            FORKSAI organises around decks and folders. If the artefact you want
            is an interlinked web of notes you keep for years, that is a
            different product category.
          </p>
          <p>
            <strong>You need a general workspace too.</strong> Projects,
            databases, wikis and team pages are not what FORKSAI does. See the{" "}
            <Link href="/forksai-vs-notion" className="font-bold text-[#111] underline underline-offset-2">
              FORKSAI and Notion comparison
            </Link>{" "}
            for how to split those jobs sensibly.
          </p>
        </BetterElsewhere>
      </ToolSection>

      <ToolSection title="Where to start">
        <p>
          Take one document you already have. Run it through the{" "}
          <Link href="/pdf-to-flashcards" className="font-bold text-[#111] underline underline-offset-2">
            PDF to flashcards
          </Link>{" "}
          flow for the deck and the{" "}
          <Link href="/notes" className="font-bold text-[#111] underline underline-offset-2">
            AI notes tool
          </Link>{" "}
          for the notes, and see whether having both from one upload changes how
          you work. If you would rather test the extraction with no account at
          all, the free{" "}
          <Link href="/text-to-flashcards" className="font-bold text-[#111] underline underline-offset-2">
            text to flashcards tool
          </Link>{" "}
          runs in your browser and exports to CSV or Anki.
        </p>
        <p>
          Already have cards elsewhere? Import supports Quizlet, Anki .txt and
          .apkg, and CSV or TXT, with a review step before saving.
        </p>
      </ToolSection>

      <CompareCta
        heading="One upload, notes and a deck"
        body="Bring a chapter you were going to write up anyway and see what comes back. The free plan is enough to judge it."
        location="flashcards_notes_cta"
      />

      <ToolSection title="Questions people ask">
        <FaqList items={FLASHCARDS_AND_NOTES_FAQS} />
      </ToolSection>

      <CompareCrossLinks current="/flashcards-and-notes-app" />
    </ComparePageShell>
  );
}
