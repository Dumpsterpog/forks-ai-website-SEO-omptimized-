"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import ToolPageShell, {
  ToolCta,
  ToolSection,
  FaqList,
  cardClass,
  labelClass,
  buttonClass,
} from "@/components/ToolPageShell";
import {
  textStats,
  formatDuration,
  READING_WORDS_PER_MINUTE,
  SPEAKING_WORDS_PER_MINUTE,
} from "@/lib/formatToolsText";
import { FormatToolCrossLinks, OnDeviceNote, CopyButton } from "@/lib/formatToolsShell";
import { WORD_COUNTER_FAQS } from "@/lib/formatToolsFaqs";

const SAMPLE = `Paste or type here and the counts update as you go.

Words, characters, sentences and paragraphs are all live, and the reading time follows from the word count. Nothing you write is uploaded.`;

function Stat({ label, value, hint, primary }) {
  return (
    <div
      className="border-2 border-black rounded-xl px-4 py-3"
      style={{ background: primary ? "#F0D44A" : "#fff" }}
    >
      <p className="text-[11px] font-black uppercase tracking-widest text-[#111]/60 mb-1">{label}</p>
      <p className="font-serif font-black text-2xl text-[#111] leading-tight">{value}</p>
      {hint ? <p className="text-xs text-[#111]/60 mt-1">{hint}</p> : null}
    </div>
  );
}

export default function WordCounterContent() {
  const [text, setText] = useState(SAMPLE);
  const stats = useMemo(() => textStats(text), [text]);
  const format = (n) => n.toLocaleString("en-US");

  return (
    <ToolPageShell>
      {/* The box you type in comes first. Everything explanatory is below it. */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif font-black text-3xl sm:text-[2.6rem] leading-[1.08] text-[#111] mb-3">
          Word counter
        </h1>
        <p className="text-[15px] sm:text-base text-[#444] leading-relaxed mb-6 max-w-2xl">
          Paste your essay, article or application answer and see the counts
          update as you type: words, characters with and without spaces,
          sentences, paragraphs and reading time. Free, no signup, and the text
          stays in your browser.
        </p>

        <div className={`${cardClass} p-5 sm:p-7`}>
          <label htmlFor="text" className={labelClass}>
            Your text
          </label>
          <textarea
            id="text"
            name="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            spellCheck="false"
            className="w-full border-2 border-black rounded-xl bg-white px-4 py-3 text-[15px] text-[#111] leading-relaxed outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A] resize-y"
          />

          <div className="flex flex-wrap gap-2 mt-3">
            <CopyButton value={text} label="Copy text" disabled={!text} />
            <button type="button" onClick={() => setText("")} className={buttonClass}>
              <Trash2 size={14} strokeWidth={2.75} /> Clear
            </button>
          </div>

          {/* aria-live so a screen reader hears the counts change without a
              Count button standing between the typing and the answer. */}
          <div aria-live="polite" className="mt-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Stat label="Words" value={format(stats.words)} primary />
              <Stat label="Characters" value={format(stats.characters)} hint="with spaces" />
              <Stat
                label="Characters"
                value={format(stats.charactersNoSpaces)}
                hint="without spaces"
              />
              <Stat label="Sentences" value={format(stats.sentences)} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
              <Stat label="Paragraphs" value={format(stats.paragraphs)} />
              <Stat label="Lines" value={format(stats.lines)} />
              <Stat
                label="Reading time"
                value={formatDuration(stats.readingMinutes)}
                hint={`${READING_WORDS_PER_MINUTE} wpm`}
              />
              <Stat
                label="Speaking time"
                value={formatDuration(stats.speakingMinutes)}
                hint={`${SPEAKING_WORDS_PER_MINUTE} wpm`}
              />
            </div>
            <p className="text-xs text-[#666] mt-3 leading-relaxed">
              Average word length {stats.averageWordLength.toFixed(1)} characters, average
              sentence length {stats.averageSentenceLength.toFixed(1)} words
              {stats.longestWord ? `, longest word "${stats.longestWord}"` : ""}.
            </p>
          </div>

          <OnDeviceNote>
            The counting is a few lines of JavaScript running in this tab. Your draft is
            never uploaded, never stored, and disappears when you close the page.
          </OnDeviceNote>
        </div>
      </section>

      <ToolSection title="How each count is worked out">
        <p>
          <strong>Words.</strong> Any run of characters separated by whitespace,
          which is how word processors count. A hyphenated word such as
          long-term counts as one word, a number counts as a word, and a stray
          double space does not invent an extra one.
        </p>
        <p>
          <strong>Characters.</strong> Both totals are shown because forms
          disagree about which one they mean. Application portals usually count
          characters with spaces, while some coursework limits exclude them.
          Emoji and accented letters count as one character each rather than as
          the two code units they are stored in.
        </p>
        <p>
          <strong>Sentences.</strong> A run of text ending in a full stop,
          question mark, exclamation mark or ellipsis, followed by a space or the
          end of the text. Abbreviations like Dr. and e.g. are read as endings,
          so a text full of them counts a little high.
        </p>
        <p>
          <strong>Paragraphs.</strong> A block with a blank line on either side.
          A single line break inside a block is a soft wrap, not a new paragraph,
          which matches markdown and most editors.
        </p>
      </ToolSection>

      <ToolSection title="What the reading time actually means">
        <p>
          Reading time is the word count divided by {READING_WORDS_PER_MINUTE} words
          per minute, and speaking time uses {SPEAKING_WORDS_PER_MINUTE} words per
          minute. Both are stated assumptions rather than measurements of you or
          your audience.
        </p>
        <p>
          Treat them as planning numbers. A dense technical paragraph reads
          slower than a narrative one, and a nervous presenter speaks faster than
          a rehearsed one. If you are timing a talk, read it out loud once and
          trust the stopwatch over the estimate.
        </p>
      </ToolSection>

      <ToolSection title="Frequently asked questions" id="faq">
        <FaqList items={WORD_COUNTER_FAQS} />
      </ToolSection>

      <ToolCta
        location="word_counter"
        heading="Counting the words is the easy part."
        body="FORKSAI turns the notes, slides and PDFs behind that word count into flashcards and study sessions, so the reading you do actually sticks."
      />

      <FormatToolCrossLinks current="/word-counter" />
    </ToolPageShell>
  );
}
