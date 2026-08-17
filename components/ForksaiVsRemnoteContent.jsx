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
import { FORKSAI_VS_REMNOTE_FAQS } from "@/lib/compareFaqs";

const JOBS = [
  {
    job: "Where a card comes from",
    forksai:
      "From material you upload or paste: a PDF, a slide export, typed notes, a YouTube URL or a photo run through OCR. The AI reads it and writes the question and answer pairs.",
  },
  {
    job: "What you have to learn first",
    forksai:
      "Nothing. There is no card syntax and no required note structure, because generation happens after the fact rather than while you write.",
  },
  {
    job: "How review is scheduled",
    forksai:
      "FSRS-5, with confidence rated 1 to 4 on the number keys. Cards you rate low come back sooner, and each session ends with time, retention and weak spot analytics.",
  },
  {
    job: "What else you can do with a deck",
    forksai:
      "Eleven modes besides spaced repetition, including Weak Spot Trainer, Memory Sprint, MCQ practice, Exam Simulator, Explain Back, an AI tutor with Socratic mode, image occlusion, Pomodoro and live study rooms.",
  },
  {
    job: "How notes fit in",
    forksai:
      "PDF to notes writes structured, Cornell, narrative or outline notes from the same file the deck came from. Notes and decks share one folder tree with tags and search.",
  },
  {
    job: "Getting existing material in",
    forksai:
      "Import from Quizlet, Anki .txt or .apkg, and CSV or TXT, with a review and edit step before saving.",
  },
  {
    job: "Studying with other people",
    forksai:
      "Live study rooms with a timer per card, a speed bonus, reactions and a real-time leaderboard, plus a public decks library you can search by subject, difficulty and card text.",
  },
];

export default function ForksaiVsRemnoteContent() {
  return (
    <ComparePageShell>
      <CompareHero
        eyebrow="Comparison"
        title="FORKSAI vs RemNote: two different answers to the same problem"
        intro="Both tools exist because reading something once does not make you remember it. They disagree about where the fix belongs. RemNote puts it in how you write. FORKSAI puts it in what happens to your material after you already have it."
      />

      <AccuracyNote product="RemNote" />

      <ToolSection title="The one difference everything else follows from">
        <p>
          RemNote is a note-taking app built around flashcards living inside your
          notes, reviewed with spaced repetition. The card is a by-product of
          writing, and the writing is the primary act.
        </p>
        <p>
          FORKSAI inverts that. The material is the input, not the output. You
          upload a lecture PDF, paste a wall of text, drop in a YouTube link or
          photograph a page, and the deck is generated from it. The writing you
          did or did not do is irrelevant to whether the deck exists.
        </p>
        <p>
          Every other difference between the two is downstream of that one. It
          is also the only question worth asking yourself before you pick,
          because it maps directly onto where your material comes from. If you
          are the author of most of what you study, notes-first is natural. If
          most of what you study arrives from a lecturer, a textbook or a
          recording, generation is doing work that inline card writing cannot.
        </p>
      </ToolSection>

      <ToolSection title="What FORKSAI does, specifically">
        <p>
          The table below is one sided on purpose. Every row describes FORKSAI,
          because those are the claims we can be held to. There is no RemNote
          column, for the reason given in the note above.
        </p>
        <CompareTable
          caption="How FORKSAI approaches each part of a study workflow"
          rows={JOBS}
        />
      </ToolSection>

      <ToolSection title="Time to first review">
        <p>
          The measure that actually decides which tool you keep is how long it
          takes to go from raw material to a deck you can review. Not features,
          not philosophy. Time.
        </p>
        <p>
          In a notes-first system that number depends on you: it is however long
          it takes to read the material and write it up with cards embedded. For
          a dense chapter that is a real evening, and the deck does not exist
          until you finish.
        </p>
        <p>
          In FORKSAI it is an upload and a wait, usually under a minute for a
          normal chapter, and the cards land one at a time as they generate so
          you can judge the output before it completes. That is not automatically
          better. Writing the material up is itself a form of studying, and you
          lose that if you skip it. It is better when you are short of time,
          which for most students is most weeks.
        </p>
      </ToolSection>

      <ToolSection title="The medical school case">
        <p>
          Both tools get used heavily for medicine, so it is worth being specific
          rather than hand waving. On the FORKSAI side there are three things
          built for it. Image occlusion, for the labelling work anatomy demands.
          The Medical Encyclopedia, which takes any term and returns an anatomy
          and location breakdown, with physiology and clinical significance on
          the paid plan. And Case Study Mode, which generates a clinical scenario
          out of a deck you already built, so the same content gets tested as
          applied reasoning instead of recall.
        </p>
        <p>
          Against that, a knowledge base you keep for the whole degree is a real
          thing that a deck library is not trying to be. If the value you get
          from your current setup is the accumulated, interlinked notes rather
          than the review sessions, that is an argument for staying put.
        </p>
      </ToolSection>

      <ToolSection title="Where RemNote may suit you better">
        <BetterElsewhere>
          <p>
            <strong>You want notes as the primary artefact.</strong> FORKSAI
            organises around decks, with notes attached to them. If you want a
            long-lived, interlinked knowledge base as the centre of your system,
            a notes-first tool is designed for that and this is not.
          </p>
          <p>
            <strong>You write your own material.</strong> Generation earns its
            keep when the source is someone else&apos;s document. If you are the
            author, writing the card while the thought is fresh is fast and often
            produces a better card than any model will.
          </p>
          <p>
            <strong>You want full manual control over every card.</strong>{" "}
            FORKSAI lets you edit and delete cards inline and reorder them, and
            it has a fully manual creator, but the AI-first path is the one it is
            designed around.
          </p>
          <p>
            <strong>You are already productive in it.</strong> Switching study
            tools mid-term is a cost paid immediately for a benefit paid later.
            If your current system is working, finish the term on it.
          </p>
        </BetterElsewhere>
      </ToolSection>

      <ToolSection title="Running both">
        <p>
          The two are not exclusive, and the split most people land on is
          obvious once you say it out loud. Keep writing wherever you already
          write. When it is time to revise, export or paste that material into
          FORKSAI and let it produce the deck and the schedule. FORKSAI also
          takes Quizlet, Anki .txt and .apkg, and CSV or TXT imports, so an
          existing card collection can come across without being retyped.
        </p>
        <p>
          If you want to sanity check the scheduling before committing to
          anything, read{" "}
          <Link href="/blog/fsrs-vs-sm2" className="font-bold text-[#111] underline underline-offset-2">
            FSRS-5 vs SM-2
          </Link>{" "}
          and{" "}
          <Link href="/blog/spaced-repetition" className="font-bold text-[#111] underline underline-offset-2">
            the spaced repetition primer
          </Link>
          . If you would rather just see output, the{" "}
          <Link href="/ai-flashcards" className="font-bold text-[#111] underline underline-offset-2">
            AI flashcard generator
          </Link>{" "}
          is the fastest test.
        </p>
      </ToolSection>

      <CompareCta
        heading="Test it on one chapter, not your whole system"
        body="Take the material you were going to make cards from this week and run it through FORKSAI. Compare the deck to the one you would have written."
        location="vs_remnote_cta"
      />

      <ToolSection title="Questions people ask">
        <FaqList items={FORKSAI_VS_REMNOTE_FAQS} />
      </ToolSection>

      <CompareCrossLinks current="/forksai-vs-remnote" />
    </ComparePageShell>
  );
}
