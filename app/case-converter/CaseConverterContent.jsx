"use client";

import { useMemo, useState } from "react";
import { ArrowDown, Trash2 } from "lucide-react";
import ToolPageShell, {
  ToolCta,
  ToolSection,
  FaqList,
  cardClass,
  labelClass,
  buttonClass,
} from "@/components/ToolPageShell";
import { CASES } from "@/lib/formatToolsText";
import { FormatToolCrossLinks, OnDeviceNote, CopyButton } from "@/lib/formatToolsShell";
import { CASE_CONVERTER_FAQS } from "@/lib/formatToolsFaqs";

const SAMPLE = "the quick brown fox JUMPS over the lazy dog. it was worth it.";

export default function CaseConverterContent() {
  const [text, setText] = useState(SAMPLE);

  // Every case is computed at once rather than behind a mode switch, so you can
  // see which one you actually want before copying.
  const results = useMemo(
    () => CASES.map((item) => ({ ...item, output: item.convert(text) })),
    [text]
  );

  return (
    <ToolPageShell>
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif font-black text-3xl sm:text-[2.6rem] leading-[1.08] text-[#111] mb-3">
          Case converter
        </h1>
        <p className="text-[15px] sm:text-base text-[#444] leading-relaxed mb-6 max-w-2xl">
          Paste your text and get every case at once: UPPER, lower, Title,
          Sentence, camelCase, PascalCase, snake_case, kebab-case and
          CONSTANT_CASE. Copy the one you need. Free, no signup, and the text
          never leaves your browser.
        </p>

        <div className={`${cardClass} p-5 sm:p-7`}>
          <label htmlFor="source" className={labelClass}>
            Your text
          </label>
          <textarea
            id="source"
            name="source"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            spellCheck="false"
            className="w-full border-2 border-black rounded-xl bg-white px-4 py-3 text-[15px] text-[#111] leading-relaxed outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A] resize-y"
          />
          <div className="flex flex-wrap gap-2 mt-3">
            <button type="button" onClick={() => setText("")} className={buttonClass}>
              <Trash2 size={14} strokeWidth={2.75} /> Clear
            </button>
            <span className="inline-flex items-center gap-1.5 text-xs text-[#666]">
              <ArrowDown size={13} strokeWidth={2.5} aria-hidden="true" /> all nine results update
              as you type
            </span>
          </div>

          {/* aria-live so the converted text is announced instead of sitting
              silently below a Convert button. */}
          <div aria-live="polite" className="mt-6 space-y-3">
            {results.map((item) => (
              <div key={item.id} className="border-2 border-black rounded-xl bg-white p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="font-bold text-sm text-[#111]">{item.label}</p>
                    <p className="text-xs text-[#666] font-mono">{item.sample}</p>
                  </div>
                  <CopyButton value={item.output} disabled={!item.output} />
                </div>
                <p className="text-[15px] text-[#111] leading-relaxed break-words whitespace-pre-wrap min-h-[1.5rem]">
                  {item.output || <span className="text-[#999]">Nothing to convert yet.</span>}
                </p>
              </div>
            ))}
          </div>

          <OnDeviceNote>
            These are string operations running in this tab. Nothing you paste is uploaded,
            logged or stored, which matters when the text is a client email or an
            unpublished draft.
          </OnDeviceNote>
        </div>
      </section>

      <ToolSection title="What each case is for">
        <p>
          <strong>Title Case</strong> capitalises every word and is what headings
          and book titles use. This tool capitalises all of them, including short
          words like of and the. Style guides such as AP and Chicago keep those
          lowercase, so check the result if you are following one.
        </p>
        <p>
          <strong>Sentence case</strong> lowercases everything, then capitalises
          the first letter of each sentence. It is the fix for a paragraph typed
          with caps lock on, and it is the house style for headlines in most
          modern product writing.
        </p>
        <p>
          <strong>camelCase and PascalCase</strong> are code conventions:
          variables and functions in JavaScript use camelCase, while classes and
          React components use PascalCase.
        </p>
        <p>
          <strong>snake_case, kebab-case and CONSTANT_CASE</strong> cover
          database columns and Python variables, URL slugs and CSS class names,
          and environment variables respectively.
        </p>
      </ToolSection>

      <ToolSection title="How words are split for the code cases">
        <p>
          Converting to camelCase means deciding where the words are. This
          splitter breaks on spaces, punctuation, underscores and dashes, and
          also on camel humps, so text that is already in one code case converts
          cleanly into another.
        </p>
        <p>
          Runs of capitals are handled deliberately: a capital run followed by a
          capitalised word splits before the last capital, so XMLHttpRequest
          becomes XML, Http, Request and converts to xmlHttpRequest rather than
          xMLHttpRequest. Digits stay attached to the word they were typed
          against, so version2 stays one word.
        </p>
      </ToolSection>

      <ToolSection title="Frequently asked questions" id="faq">
        <FaqList items={CASE_CONVERTER_FAQS} />
      </ToolSection>

      <ToolCta
        location="case_converter"
        heading="Fixing the capitals is a minute. Learning the material is the rest of the week."
        body="FORKSAI turns your notes, slides and PDFs into flashcards and study sessions, so revision takes fewer hours and holds longer."
      />

      <FormatToolCrossLinks current="/case-converter" />
    </ToolPageShell>
  );
}
