"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ArrowDownUp, Check, Trash2 } from "lucide-react";
import ToolPageShell, {
  ToolCta,
  ToolSection,
  FaqList,
  cardClass,
  labelClass,
  buttonClass,
} from "@/components/ToolPageShell";
import { CopyButton, formatBytes } from "@/lib/formatToolsShell";
import { TextToolCrossLinks, OnDeviceNote } from "@/lib/textToolsShell";
import { JSON_FORMATTER_FAQS } from "@/lib/textToolsFaqs";
import {
  parseJson,
  formatJson,
  minifyJson,
  jsonStats,
  findDuplicateKeys,
} from "@/lib/textToolsJson";

const SAMPLE = `{"course":"Pharmacology","week":4,"published":true,"topics":["absorption","first pass metabolism"],"lecturer":{"name":"Dr Mehta","email":"mehta@example.ac.uk"},"attendance":null}`;

const INDENTS = [
  { id: 2, label: "2 spaces" },
  { id: 4, label: "4 spaces" },
  { id: "tab", label: "Tab" },
];

export default function JsonFormatterContent() {
  const [input, setInput] = useState(SAMPLE);
  const [indent, setIndent] = useState(2);
  const [sortKeys, setSortKeys] = useState(false);
  const [minified, setMinified] = useState(false);

  // Live: parsing a document of any sane size takes a millisecond, so there is
  // nothing for a Format button to do except stand in the way.
  const parsed = useMemo(() => parseJson(input), [input]);

  const output = useMemo(() => {
    if (!parsed.ok) return "";
    return minified
      ? minifyJson(parsed.ast, { sortKeys })
      : formatJson(parsed.ast, { indent, sortKeys });
  }, [parsed, indent, sortKeys, minified]);

  const stats = useMemo(() => (parsed.ok ? jsonStats(parsed.ast) : null), [parsed]);
  const duplicates = useMemo(() => (parsed.ok ? findDuplicateKeys(parsed.ast) : []), [parsed]);

  const inputBytes = useMemo(() => new TextEncoder().encode(input).length, [input]);
  const outputBytes = useMemo(() => new TextEncoder().encode(output).length, [output]);

  return (
    <ToolPageShell>
      {/* Input, controls and result all sit above the explanation. */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif font-black text-3xl sm:text-[2.6rem] leading-[1.08] text-[#111] mb-3">
          JSON formatter and validator
        </h1>
        <p className="text-[15px] sm:text-base text-[#444] leading-relaxed mb-6 max-w-2xl">
          Paste JSON to beautify it, minify it, or find out exactly what is wrong
          with it. Syntax errors are reported with the line, the column and the
          offending line itself. Free, no signup, and the document never leaves
          your browser.
        </p>

        <div className={`${cardClass} p-4 sm:p-6`}>
          <div className="grid lg:grid-cols-2 gap-4">
            <div>
              <label htmlFor="json-input" className={labelClass}>
                Your JSON
              </label>
              <textarea
                id="json-input"
                name="json-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={14}
                spellCheck="false"
                className="w-full border-2 border-black rounded-xl bg-white px-3 py-2.5 font-mono text-[13px] text-[#111] leading-relaxed outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A] resize-y"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                <button type="button" onClick={() => setInput("")} className={buttonClass}>
                  <Trash2 size={14} strokeWidth={2.75} /> Clear
                </button>
                <button
                  type="button"
                  onClick={() => parsed.ok && setInput(output)}
                  disabled={!parsed.ok}
                  className={`${buttonClass} disabled:opacity-40`}
                >
                  <ArrowDownUp size={14} strokeWidth={2.75} /> Replace input with result
                </button>
                <span className="inline-flex items-center text-xs text-[#666]">
                  {formatBytes(inputBytes)}
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="json-output" className={labelClass}>
                Result
              </label>
              <textarea
                id="json-output"
                name="json-output"
                value={output}
                readOnly
                rows={14}
                spellCheck="false"
                placeholder="Valid JSON comes out here."
                className="w-full border-2 border-black rounded-xl px-3 py-2.5 font-mono text-[13px] text-[#111] leading-relaxed outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A] resize-y"
                style={{ background: parsed.ok ? "#fff" : "#F3F3EE" }}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                <CopyButton value={output} label="Copy result" disabled={!output} />
                {output ? (
                  <span className="inline-flex items-center text-xs text-[#666]">
                    {formatBytes(outputBytes)}
                    {minified && inputBytes > 0
                      ? `, ${Math.max(0, Math.round((1 - outputBytes / inputBytes) * 100))}% smaller than the input`
                      : ""}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <fieldset className="mt-5 border-2 border-black rounded-xl px-4 py-3">
            <legend className="text-xs font-black uppercase tracking-widest text-[#111]/60 px-1">
              Output
            </legend>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <div className="flex items-center gap-2">
                <label htmlFor="indent" className="text-sm font-bold text-[#111]">
                  Indent
                </label>
                <select
                  id="indent"
                  name="indent"
                  value={String(indent)}
                  disabled={minified}
                  onChange={(e) =>
                    setIndent(e.target.value === "tab" ? "tab" : Number(e.target.value))
                  }
                  className="border-2 border-black rounded-xl bg-white px-3 py-2 text-sm font-bold text-[#111] outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A] disabled:opacity-40"
                >
                  {INDENTS.map((option) => (
                    <option key={option.id} value={String(option.id)}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <label htmlFor="minify" className="flex items-center gap-2 text-sm text-[#111] cursor-pointer">
                <input
                  id="minify"
                  name="minify"
                  type="checkbox"
                  checked={minified}
                  onChange={(e) => setMinified(e.target.checked)}
                  className="w-4 h-4 accent-[#111] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
                />
                Minify instead
              </label>
              <label htmlFor="sort-keys" className="flex items-center gap-2 text-sm text-[#111] cursor-pointer">
                <input
                  id="sort-keys"
                  name="sort-keys"
                  type="checkbox"
                  checked={sortKeys}
                  onChange={(e) => setSortKeys(e.target.checked)}
                  className="w-4 h-4 accent-[#111] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
                />
                Sort keys alphabetically
              </label>
            </div>
          </fieldset>

          {/* aria-live so the verdict and the error position are announced as
              the document is edited. */}
          <div aria-live="polite" className="mt-4">
            {input.trim() === "" ? (
              <p className="text-sm text-[#666]">Paste some JSON above to check it.</p>
            ) : parsed.ok ? (
              <div
                className="border-2 border-black rounded-xl px-4 py-3"
                style={{ background: "#E3F3D6" }}
              >
                <p className="font-bold text-sm text-[#111] flex items-center gap-2">
                  <Check size={15} strokeWidth={3} aria-hidden="true" /> Valid JSON
                </p>
                <p className="text-xs text-[#111]/70 mt-1">
                  {stats.objects} object{stats.objects === 1 ? "" : "s"}, {stats.arrays} array
                  {stats.arrays === 1 ? "" : "s"}, {stats.keys} key{stats.keys === 1 ? "" : "s"},
                  nested {stats.depth} level{stats.depth === 1 ? "" : "s"} deep.
                </p>
              </div>
            ) : (
              <div
                className="border-2 border-black rounded-xl px-4 py-3"
                style={{ background: "#FBDDD8" }}
              >
                <p className="font-bold text-sm text-[#111] flex items-center gap-2">
                  <AlertTriangle size={15} strokeWidth={3} aria-hidden="true" />
                  Syntax error on line {parsed.error.line}, column {parsed.error.column}
                </p>
                <p className="text-sm text-[#111]/80 mt-1">{parsed.error.message}</p>
                {parsed.error.source ? (
                  <pre className="mt-3 overflow-x-auto font-mono text-[12.5px] text-[#111] bg-white border-2 border-black rounded-lg px-3 py-2">
                    <code>
                      {`${String(parsed.error.line).padStart(4)} | ${parsed.error.source}\n`}
                      {`     | ${" ".repeat(Math.max(0, parsed.error.column - 1))}^`}
                    </code>
                  </pre>
                ) : null}
              </div>
            )}

            {duplicates.length > 0 ? (
              <div
                className="border-2 border-black rounded-xl px-4 py-3 mt-3"
                style={{ background: "#FFF3C9" }}
              >
                <p className="font-bold text-sm text-[#111]">
                  Duplicate key{duplicates.length === 1 ? "" : "s"} found
                </p>
                <p className="text-xs text-[#111]/70 mt-1">
                  Legal JSON, but most parsers keep only the last one, so this is usually a bug:{" "}
                  {duplicates.slice(0, 5).map((item, i) => (
                    <span key={`${item.path}-${item.key}`} className="font-mono">
                      {i > 0 ? ", " : ""}
                      {item.path}.{item.key}
                    </span>
                  ))}
                  {duplicates.length > 5 ? ` and ${duplicates.length - 5} more` : ""}.
                </p>
              </div>
            ) : null}
          </div>

          <OnDeviceNote>
            The parser is JavaScript running in this tab. Your document is never uploaded,
            logged or stored, which matters because the JSON people paste into a formatter
            is usually a real API response with real data in it.
          </OnDeviceNote>
        </div>
      </section>

      <ToolSection title="Why the error position is trustworthy">
        <p>
          This page does not hand your document to the browser JSON.parse. It
          parses the text itself, character by character, keeping count of the
          line and column as it goes. That is deliberate: the built in parser
          words its errors differently in Chrome, Firefox and Safari, and some
          versions report only a character offset, which is useless when you are
          staring at a 400 line file.
        </p>
        <p>
          Because the position is computed here, it is the same in every browser,
          and the offending line is printed underneath with a caret under the
          exact character. The message names the specific problem rather than
          saying the token was unexpected: a trailing comma, a single quoted
          string, an unquoted property name, a comment, a leading zero, or a tab
          that should have been escaped.
        </p>
      </ToolSection>

      <ToolSection title="The mistakes that account for most invalid JSON">
        <p>
          <strong>A trailing comma.</strong> Valid in JavaScript, valid in JSON5,
          not valid in JSON. It usually appears when the last item of a list was
          deleted by hand.
        </p>
        <p>
          <strong>Single quotes.</strong> JSON strings and property names are
          always in double quotes. Text copied out of a Python session or a
          JavaScript console usually has the wrong ones.
        </p>
        <p>
          <strong>Unquoted property names.</strong> A JavaScript object literal
          allows a bare key. JSON never does.
        </p>
        <p>
          <strong>Comments.</strong> There is no comment syntax in JSON at all,
          which surprises people whose config files accept them.
        </p>
        <p>
          <strong>Python literals.</strong> True, False and None are not JSON.
          The equivalents are lowercase true, false and null. NaN and Infinity
          have no JSON representation whatsoever.
        </p>
      </ToolSection>

      <ToolSection title="Formatting only changes the whitespace">
        <p>
          Most formatters parse your document into values and stringify them
          back, which quietly rewrites it. A long integer like
          12345678901234567890 comes back as 12345678901234567000, because it
          does not fit in a JavaScript number. A huge exponent such as 1e400
          becomes null. Duplicate keys collapse. Keys that look like integers get
          reordered, so an object keyed by 2 and 1 comes back the other way
          round.
        </p>
        <p>
          This one keeps the original text of every number, the original order of
          every key and every duplicate that was there, and rewrites nothing but
          the spacing. Formatting a file and minifying it back gives you the same
          bytes you started with.
        </p>
      </ToolSection>

      <ToolSection title="Frequently asked questions" id="faq">
        <FaqList items={JSON_FORMATTER_FAQS} />
      </ToolSection>

      <ToolCta
        location="json_formatter"
        heading="Debugging is easier than revising. FORKSAI helps with the other one."
        body="Turn your notes, slides and PDFs into flashcards and spaced repetition sessions, and stop rereading the same page hoping it sticks."
      />

      <TextToolCrossLinks current="/json-formatter" />
    </ToolPageShell>
  );
}
