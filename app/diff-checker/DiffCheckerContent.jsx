"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, Trash2 } from "lucide-react";
import ToolPageShell, {
  ToolCta,
  ToolSection,
  FaqList,
  cardClass,
  labelClass,
  buttonClass,
} from "@/components/ToolPageShell";
import { CopyButton } from "@/lib/formatToolsShell";
import { TextToolCrossLinks, OnDeviceNote } from "@/lib/textToolsShell";
import { DIFF_CHECKER_FAQS } from "@/lib/textToolsFaqs";
import {
  splitLines,
  buildDiffRows,
  diffSummary,
  toUnifiedRows,
} from "@/lib/textToolsDiff";

const SAMPLE_A = `Dear Dr Mehta,

Thank you for the notes on the draft.
The deadline is the 14th of March.
I have attached the revised figures.

Best wishes,
Priya`;

const SAMPLE_B = `Dear Dr Mehta,

Thank you for the detailed notes on the draft.
I have attached the revised figures.
The reference list is still being checked.

Best wishes,
Priya`;

// Flat tints rather than gradients, so a colour blind reader still has the
// sign, the line numbers and the label to go on.
const ROW_BG = {
  equal: "#ffffff",
  added: "#E3F3D6",
  removed: "#FBDDD8",
  changed: "#FFF3C9",
};

const WORD_BG = {
  insert: "#B7E294",
  delete: "#F6ADA2",
};

function LineText({ text, segments }) {
  if (text === null || text === undefined) return null;
  if (!segments || segments.length === 0) {
    return <span>{text === "" ? " " : text}</span>;
  }
  return (
    <>
      {segments.map((segment, i) =>
        segment.type === "equal" ? (
          <span key={i}>{segment.text}</span>
        ) : (
          <mark
            key={i}
            className="rounded px-0.5"
            style={{ background: WORD_BG[segment.type], color: "#111" }}
          >
            {segment.text}
          </mark>
        )
      )}
    </>
  );
}

function Cell({ number, text, segments, background }) {
  return (
    <div className="flex gap-2 px-2 py-1" style={{ background }}>
      <span className="shrink-0 w-9 text-right text-[11px] text-[#888] select-none tabular-nums pt-px">
        {number ?? ""}
      </span>
      <span className="font-mono text-[12.5px] leading-relaxed text-[#111] whitespace-pre-wrap break-words min-w-0">
        <LineText text={text} segments={segments} />
      </span>
    </div>
  );
}

function Stat({ label, value, background }) {
  return (
    <div className="border-2 border-black rounded-xl px-3 py-2" style={{ background }}>
      <p className="text-[10px] font-black uppercase tracking-widest text-[#111]/60">{label}</p>
      <p className="font-serif font-black text-xl text-[#111] leading-tight tabular-nums">{value}</p>
    </div>
  );
}

export default function DiffCheckerContent() {
  const [left, setLeft] = useState(SAMPLE_A);
  const [right, setRight] = useState(SAMPLE_B);
  const [view, setView] = useState("split");
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [hideUnchanged, setHideUnchanged] = useState(false);

  // Live, because a Compare button between the typing and the answer buys
  // nothing when the whole comparison takes a few milliseconds.
  const rows = useMemo(
    () =>
      buildDiffRows(splitLines(left), splitLines(right), {
        ignoreCase,
        ignoreWhitespace,
      }),
    [left, right, ignoreCase, ignoreWhitespace]
  );

  const summary = useMemo(() => diffSummary(rows), [rows]);
  const unified = useMemo(() => toUnifiedRows(rows), [rows]);

  const visibleRows = hideUnchanged ? rows.filter((row) => row.type !== "equal") : rows;
  const visibleUnified = hideUnchanged ? unified.filter((row) => row.type !== "equal") : unified;

  // What lands on the clipboard is a patch style listing, which pastes usefully
  // into a review comment or an email.
  const patchText = useMemo(
    () => unified.map((row) => `${row.sign}${row.text ?? ""}`).join("\n"),
    [unified]
  );

  const identical = summary.added === 0 && summary.removed === 0 && summary.changed === 0;

  const swap = () => {
    setLeft(right);
    setRight(left);
  };

  return (
    <ToolPageShell>
      {/* Both boxes come first. Everything explanatory is below them. */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif font-black text-3xl sm:text-[2.6rem] leading-[1.08] text-[#111] mb-3">
          Diff checker
        </h1>
        <p className="text-[15px] sm:text-base text-[#444] leading-relaxed mb-6 max-w-2xl">
          Paste two versions of anything, an essay draft, a config file, a block
          of code, and see what was added, removed and changed. Lines are matched
          properly, so one inserted line does not mark the whole document as
          different. Free, no signup, and both texts stay in your browser.
        </p>

        <div className={`${cardClass} p-4 sm:p-6`}>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="original" className={labelClass}>
                Original text
              </label>
              <textarea
                id="original"
                name="original"
                value={left}
                onChange={(e) => setLeft(e.target.value)}
                rows={9}
                spellCheck="false"
                className="w-full border-2 border-black rounded-xl bg-white px-3 py-2.5 font-mono text-[13px] text-[#111] leading-relaxed outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A] resize-y"
              />
            </div>
            <div>
              <label htmlFor="changed" className={labelClass}>
                Changed text
              </label>
              <textarea
                id="changed"
                name="changed"
                value={right}
                onChange={(e) => setRight(e.target.value)}
                rows={9}
                spellCheck="false"
                className="w-full border-2 border-black rounded-xl bg-white px-3 py-2.5 font-mono text-[13px] text-[#111] leading-relaxed outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A] resize-y"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <button type="button" onClick={swap} className={buttonClass}>
              <ArrowLeftRight size={14} strokeWidth={2.75} /> Swap sides
            </button>
            <button
              type="button"
              onClick={() => {
                setLeft("");
                setRight("");
              }}
              className={buttonClass}
            >
              <Trash2 size={14} strokeWidth={2.75} /> Clear both
            </button>
            <CopyButton value={patchText} label="Copy diff" disabled={identical} />
          </div>

          <fieldset className="mt-5 border-2 border-black rounded-xl px-4 py-3">
            <legend className="text-xs font-black uppercase tracking-widest text-[#111]/60 px-1">
              Comparison options
            </legend>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <label htmlFor="ignore-case" className="flex items-center gap-2 text-sm text-[#111] cursor-pointer">
                <input
                  id="ignore-case"
                  name="ignore-case"
                  type="checkbox"
                  checked={ignoreCase}
                  onChange={(e) => setIgnoreCase(e.target.checked)}
                  className="w-4 h-4 accent-[#111] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
                />
                Ignore case
              </label>
              <label
                htmlFor="ignore-whitespace"
                className="flex items-center gap-2 text-sm text-[#111] cursor-pointer"
              >
                <input
                  id="ignore-whitespace"
                  name="ignore-whitespace"
                  type="checkbox"
                  checked={ignoreWhitespace}
                  onChange={(e) => setIgnoreWhitespace(e.target.checked)}
                  className="w-4 h-4 accent-[#111] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
                />
                Ignore whitespace
              </label>
              <label
                htmlFor="hide-unchanged"
                className="flex items-center gap-2 text-sm text-[#111] cursor-pointer"
              >
                <input
                  id="hide-unchanged"
                  name="hide-unchanged"
                  type="checkbox"
                  checked={hideUnchanged}
                  onChange={(e) => setHideUnchanged(e.target.checked)}
                  className="w-4 h-4 accent-[#111] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
                />
                Show only differences
              </label>
            </div>
          </fieldset>

          <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1 min-w-[260px]">
              <Stat label="Added" value={summary.added} background={ROW_BG.added} />
              <Stat label="Removed" value={summary.removed} background={ROW_BG.removed} />
              <Stat label="Changed" value={summary.changed} background={ROW_BG.changed} />
              <Stat label="Unchanged" value={summary.unchanged} background="#fff" />
            </div>
            <div className="flex gap-2" role="group" aria-label="Diff view">
              <button
                type="button"
                onClick={() => setView("split")}
                aria-pressed={view === "split"}
                className={buttonClass}
                style={view === "split" ? { background: "#F0D44A" } : undefined}
              >
                Side by side
              </button>
              <button
                type="button"
                onClick={() => setView("inline")}
                aria-pressed={view === "inline"}
                className={buttonClass}
                style={view === "inline" ? { background: "#F0D44A" } : undefined}
              >
                Inline
              </button>
            </div>
          </div>

          {/* aria-live so the result is announced as the text changes, rather
              than sitting silently behind a Compare button. */}
          <div aria-live="polite" className="mt-4">
            <p className="text-sm text-[#555] mb-2">
              {identical
                ? "The two texts are identical."
                : `${summary.added} added, ${summary.removed} removed, ${summary.changed} changed, ${summary.unchanged} unchanged.`}
            </p>

            {view === "split" ? (
              <div className="border-2 border-black rounded-xl overflow-hidden bg-white">
                <div className="grid grid-cols-2 border-b-2 border-black">
                  <p className="text-[11px] font-black uppercase tracking-widest text-[#111]/60 px-3 py-1.5 border-r-2 border-black">
                    Original
                  </p>
                  <p className="text-[11px] font-black uppercase tracking-widest text-[#111]/60 px-3 py-1.5">
                    Changed
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <div className="min-w-[420px]">
                    {visibleRows.map((row, i) => (
                      <div key={i} className="grid grid-cols-2 border-b border-[#e5e5df] last:border-b-0">
                        <div className="border-r-2 border-black">
                          {row.aText === null ? (
                            <div className="px-2 py-1" style={{ background: "#F3F3EE" }}>
                              <span className="text-[11px] text-[#999] select-none">no line</span>
                            </div>
                          ) : (
                            <Cell
                              number={row.aNumber}
                              text={row.aText}
                              segments={row.type === "changed" ? row.words.left : null}
                              background={row.type === "equal" ? ROW_BG.equal : ROW_BG.removed}
                            />
                          )}
                        </div>
                        <div>
                          {row.bText === null ? (
                            <div className="px-2 py-1" style={{ background: "#F3F3EE" }}>
                              <span className="text-[11px] text-[#999] select-none">no line</span>
                            </div>
                          ) : (
                            <Cell
                              number={row.bNumber}
                              text={row.bText}
                              segments={row.type === "changed" ? row.words.right : null}
                              background={row.type === "equal" ? ROW_BG.equal : ROW_BG.added}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                    {visibleRows.length === 0 ? (
                      <p className="px-3 py-4 text-sm text-[#666]">Nothing to compare yet.</p>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-2 border-black rounded-xl overflow-hidden bg-white">
                <div className="overflow-x-auto">
                  <div className="min-w-[320px]">
                    {visibleUnified.map((row, i) => (
                      <div
                        key={i}
                        className="flex gap-2 px-2 py-1 border-b border-[#e5e5df] last:border-b-0"
                        style={{ background: ROW_BG[row.type] }}
                      >
                        <span className="shrink-0 w-7 text-right text-[11px] text-[#888] select-none tabular-nums pt-px">
                          {row.aNumber ?? ""}
                        </span>
                        <span className="shrink-0 w-7 text-right text-[11px] text-[#888] select-none tabular-nums pt-px">
                          {row.bNumber ?? ""}
                        </span>
                        <span className="shrink-0 w-3 font-mono text-[12.5px] font-bold text-[#111] select-none">
                          {row.sign.trim() === "" ? " " : row.sign}
                        </span>
                        <span className="font-mono text-[12.5px] leading-relaxed text-[#111] whitespace-pre-wrap break-words min-w-0">
                          <LineText text={row.text} segments={row.words} />
                        </span>
                      </div>
                    ))}
                    {visibleUnified.length === 0 ? (
                      <p className="px-3 py-4 text-sm text-[#666]">Nothing to compare yet.</p>
                    ) : null}
                  </div>
                </div>
              </div>
            )}
          </div>

          <OnDeviceNote>
            The comparison is JavaScript running in this tab. Neither text is uploaded,
            logged or stored, so an unpublished draft, a contract or a private config
            file is safe to paste here.
          </OnDeviceNote>
        </div>
      </section>

      <ToolSection title="How the comparison works">
        <p>
          <strong>Lines are matched, not counted.</strong> The tool computes the
          longest common subsequence of the two line lists, which is the same
          approach behind the diff command and version control. It finds the
          largest set of lines that appear in both texts in the same order, and
          everything outside that set is an addition or a removal.
        </p>
        <p>
          <strong>Edits become one changed row.</strong> When a removal and an
          addition land in the same place, they are almost always one line before
          and after an edit, so they are paired into a single changed row and
          compared a second time word by word. The highlighting inside the row
          shows the words that moved rather than making you reread the sentence.
        </p>
        <p>
          <strong>Line endings are normalised.</strong> A file saved on Windows
          ends its lines with a carriage return and a line feed, while one saved
          on macOS or Linux uses only a line feed. Those are treated as the same
          ending, so a file that merely changed hands does not read as though
          every line was rewritten.
        </p>
      </ToolSection>

      <ToolSection title="Reading the two views">
        <p>
          <strong>Side by side</strong> keeps the original on the left and the
          changed version on the right, with a placeholder where one side has no
          matching line. This is the view for comparing two drafts, because you
          can read either version straight down the column.
        </p>
        <p>
          <strong>Inline</strong> stacks the removal above the addition in one
          column, marked with minus and plus, which is how a patch file, a pull
          request or a code review reads. Copy diff puts exactly that listing on
          your clipboard.
        </p>
        <p>
          Turn on <strong>show only differences</strong> when the documents are
          long and mostly the same, and the unchanged lines are just noise between
          the parts you care about.
        </p>
      </ToolSection>

      <ToolSection title="When to ignore whitespace or case">
        <p>
          <strong>Ignore whitespace</strong> trims the ends of each line and
          collapses runs of spaces before comparing. Reach for it when a file has
          been through a formatter, when indentation changed from tabs to spaces,
          or when text pasted out of a PDF picked up stray spacing. It does not
          change the text you see or copy, only what counts as a match.
        </p>
        <p>
          <strong>Ignore case</strong> compares without capitalisation, which is
          useful for config keys, email addresses and anything that was retyped
          rather than copied. Leave it off when you are proofreading, since
          capitalisation is exactly the kind of error you are looking for.
        </p>
      </ToolSection>

      <ToolSection title="Frequently asked questions" id="faq">
        <FaqList items={DIFF_CHECKER_FAQS} />
      </ToolSection>

      <ToolCta
        location="diff_checker"
        heading="Spotting what changed is one thing. Remembering it is another."
        body="FORKSAI turns the notes, slides and PDFs you are revising into flashcards and spaced repetition sessions, so the material actually sticks."
      />

      <TextToolCrossLinks current="/diff-checker" />
    </ToolPageShell>
  );
}
