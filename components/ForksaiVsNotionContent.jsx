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
import { FORKSAI_VS_NOTION_FAQS } from "@/lib/compareFaqs";

const JOBS = [
  {
    job: "Get cards out of a document",
    forksai:
      "Upload the PDF, paste the text, drop in a YouTube URL or photograph the page. The AI reads it and writes the question and answer pairs for you.",
  },
  {
    job: "Decide what to revise today",
    forksai:
      "FSRS-5 spaced repetition schedules it. You rate each card 1 to 4 and the algorithm sets the next interval per card.",
  },
  {
    job: "Find out what you are bad at",
    forksai:
      "Deck analytics show new and due counts, mastered percentage, retention percentage, a difficulty spread and a weak spots list ordered by forget count.",
  },
  {
    job: "Test yourself properly",
    forksai:
      "Exam Simulator writes MCQs from your deck with a timer and a score. Explain Back has you type an answer in your own words and grades it. MCQ practice and Memory Sprint cover the quicker drills.",
  },
  {
    job: "Get notes from a source document",
    forksai:
      "PDF to notes writes structured, Cornell, narrative or outline notes, with a detail level and a focus area you choose.",
  },
  {
    job: "Keep it all organised",
    forksai:
      "Nested folders, tags, search across titles and card text, grid or list view, bulk move and bulk delete.",
  },
  {
    job: "Revise with other people",
    forksai:
      "Live study rooms on a shared deck with a per-card timer, speed bonus, reactions and a real-time leaderboard.",
  },
];

export default function ForksaiVsNotionContent() {
  return (
    <ComparePageShell>
      <CompareHero
        eyebrow="Comparison"
        title="FORKSAI vs Notion: a workspace and a study system are not the same tool"
        intro="This is a slightly odd comparison, and it is worth being honest about that up front. Notion is a general workspace. FORKSAI is a study system. Most people searching for this are not choosing between them, they are asking whether the revision setup they built inside Notion is worth keeping."
      />

      <AccuracyNote product="Notion" />

      <ToolSection title="What people are actually asking">
        <p>
          Notion is a general workspace: documents, databases, wikis, project
          tracking. It is very good at that, and a lot of students run their
          whole degree out of it. Because it is flexible, people also build
          revision systems inside it, usually a toggle list where the answer
          stays hidden until you open it, or a database with a question column
          and an answer column.
        </p>
        <p>
          That setup stores question and answer pairs perfectly well. The part it
          does not give you on its own is a scheduler: something deciding which
          cards you should see today based on how you did last time. Spaced
          repetition is not a storage format, it is a decision made for you every
          morning, and that decision is the entire benefit.
        </p>
        <p>
          So the real question is not Notion versus FORKSAI. It is whether the
          revision layer belongs in your workspace at all.
        </p>
      </ToolSection>

      <ToolSection title="What FORKSAI does, specifically">
        <p>
          Every row here describes FORKSAI. There is no Notion column, because
          what a Notion setup can do depends entirely on what its owner built,
          and a tick or a cross would be a guess about your workspace.
        </p>
        <CompareTable
          caption="Study jobs and how FORKSAI handles each one"
          rows={JOBS}
        />
        <p>
          There are twelve study modes in total. The ones above plus flip review,
          a swipe mode for fast sorting, a Weak Spot Trainer that loads only your
          high forget count cards, an AI tutor with evaluation, explanation, hint
          and Socratic modes, image occlusion for diagrams, and a Pomodoro mode.
        </p>
      </ToolSection>

      <ToolSection title="The manual entry problem">
        <p>
          A homemade Notion flashcard system has the same weakness as any manual
          system, and it is not the app&apos;s fault. Every card exists because you
          typed it. When the term gets heavy and you are behind, the first thing
          that stops is card creation, which is exactly when you needed the cards
          most.
        </p>
        <p>
          FORKSAI attacks that specific step. Give it the lecture handout and the
          deck exists whether or not you had the energy to build it. That is the
          whole argument, and if manual entry has never been your bottleneck then
          the argument does not apply to you.
        </p>
      </ToolSection>

      <ToolSection title="Where Notion is clearly the better tool">
        <BetterElsewhere>
          <p>
            <strong>Anything that is not revision.</strong> Project tracking,
            databases, relations, a team wiki, a reading list, a shared syllabus
            page. FORKSAI has none of that and is not trying to. If you replaced
            Notion with FORKSAI you would lose most of what you use Notion for.
          </p>
          <p>
            <strong>Long-form writing and structured documents.</strong> FORKSAI
            has a summarizer with a rich text editor and a manual notes editor,
            but those exist to support study material, not to be your document
            tool.
          </p>
          <p>
            <strong>Collaboration on documents.</strong> FORKSAI has live study
            rooms and public decks, which is collaboration on revision, not
            collaboration on writing.
          </p>
          <p>
            <strong>Total control over structure.</strong> Some people genuinely
            prefer building their own system to living inside someone else&apos;s
            opinions. That is a legitimate preference and Notion serves it better
            than any opinionated study app will.
          </p>
        </BetterElsewhere>
      </ToolSection>

      <ToolSection title="Using both, which is what we would suggest">
        <p>
          Keep Notion as the workspace. Plan there, write there, track deadlines
          there. When a piece of material is finished and needs to be learned
          rather than stored, send it to FORKSAI: paste the text, or export the
          page to PDF and upload it. If your material sits in a Notion database,
          export a CSV and import that instead.
        </p>
        <p>
          Inside FORKSAI, notes and decks from the same source live in the same
          folder tree, so the revision half stays organised without you needing
          to mirror your workspace structure. Nothing has to be kept in sync,
          because the two tools are doing different jobs.
        </p>
        <p>
          Worth reading alongside this:{" "}
          <Link href="/blog/active-recall" className="font-bold text-[#111] underline underline-offset-2">
            why testing yourself beats rereading
          </Link>
          , and{" "}
          <Link href="/blog/spaced-repetition" className="font-bold text-[#111] underline underline-offset-2">
            what spaced repetition is actually doing
          </Link>
          . If you would rather see it work, the{" "}
          <Link href="/ai-summarizer" className="font-bold text-[#111] underline underline-offset-2">
            AI summarizer
          </Link>{" "}
          and the{" "}
          <Link href="/notes" className="font-bold text-[#111] underline underline-offset-2">
            AI notes tool
          </Link>{" "}
          are the closest things to what you were doing in Notion.
        </p>
      </ToolSection>

      <CompareCta
        heading="Move the revision, keep the workspace"
        body="Export one page you were trying to revise from and run it through FORKSAI. Notion keeps doing what it is good at."
        location="vs_notion_cta"
      />

      <ToolSection title="Questions people ask">
        <FaqList items={FORKSAI_VS_NOTION_FAQS} />
      </ToolSection>

      <CompareCrossLinks current="/forksai-vs-notion" />
    </ComparePageShell>
  );
}
