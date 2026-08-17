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
import { CopyButton } from "@/lib/formatToolsShell";
import { TextToolCrossLinks, OnDeviceNote } from "@/lib/textToolsShell";
import { URL_ENCODE_FAQS } from "@/lib/textToolsFaqs";
import {
  ENCODERS,
  runEncoder,
  runDecoder,
  RESERVED_COMPARISON,
  describeUrl,
} from "@/lib/textToolsUrl";

const SAMPLE = "https://example.com/search?q=café & cream&page=2";

export default function UrlEncodeContent() {
  const [text, setText] = useState(SAMPLE);
  const [direction, setDirection] = useState("encode");

  // All three results at once rather than behind a mode switch, because the
  // question people actually have is which of them they need.
  const results = useMemo(
    () =>
      ENCODERS.map((encoder) => ({
        ...encoder,
        result: direction === "encode" ? runEncoder(encoder, text) : runDecoder(encoder, text),
      })),
    [text, direction]
  );

  const parts = useMemo(() => describeUrl(text), [text]);

  return (
    <ToolPageShell>
      {/* Input and all three results sit above the explanation. */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif font-black text-3xl sm:text-[2.6rem] leading-[1.08] text-[#111] mb-3">
          URL encoder and decoder
        </h1>
        <p className="text-[15px] sm:text-base text-[#444] leading-relaxed mb-6 max-w-2xl">
          Percent encode and decode, both directions, with encodeURI and
          encodeURIComponent shown side by side so you can see exactly where they
          differ. That difference is usually the reason a URL broke. Free, no
          signup, and nothing leaves your browser.
        </p>

        <div className={`${cardClass} p-5 sm:p-7`}>
          <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Direction">
            <button
              type="button"
              onClick={() => setDirection("encode")}
              aria-pressed={direction === "encode"}
              className={buttonClass}
              style={direction === "encode" ? { background: "#F0D44A" } : undefined}
            >
              Encode
            </button>
            <button
              type="button"
              onClick={() => setDirection("decode")}
              aria-pressed={direction === "decode"}
              className={buttonClass}
              style={direction === "decode" ? { background: "#F0D44A" } : undefined}
            >
              Decode
            </button>
          </div>

          <label htmlFor="source" className={labelClass}>
            {direction === "encode" ? "Text or URL to encode" : "Percent encoded text to decode"}
          </label>
          <textarea
            id="source"
            name="source"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            spellCheck="false"
            className="w-full border-2 border-black rounded-xl bg-white px-4 py-3 font-mono text-[13.5px] text-[#111] leading-relaxed break-all outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A] resize-y"
          />
          <div className="flex flex-wrap gap-2 mt-3">
            <button type="button" onClick={() => setText("")} className={buttonClass}>
              <Trash2 size={14} strokeWidth={2.75} /> Clear
            </button>
          </div>

          {/* aria-live so all three results are announced as you type. */}
          <div aria-live="polite" className="mt-5 space-y-3">
            {results.map((item) => (
              <div key={item.id} className="border-2 border-black rounded-xl bg-white p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-[#111] font-mono break-words">
                      {item.label}
                    </p>
                    <p className="text-xs text-[#666]">{item.sub}</p>
                  </div>
                  <CopyButton
                    value={item.result.ok ? item.result.value : ""}
                    disabled={!item.result.ok || !item.result.value}
                  />
                </div>
                {item.result.ok ? (
                  <p className="font-mono text-[13px] text-[#111] leading-relaxed break-all whitespace-pre-wrap min-h-[1.25rem]">
                    {item.result.value || <span className="text-[#999]">Nothing to convert yet.</span>}
                  </p>
                ) : (
                  <p
                    className="text-[13px] text-[#111] leading-relaxed border-2 border-black rounded-lg px-3 py-2"
                    style={{ background: "#FBDDD8" }}
                  >
                    {item.result.error}
                  </p>
                )}
                <p className="text-xs text-[#666] leading-relaxed mt-2">{item.note}</p>
              </div>
            ))}
          </div>

          {parts ? (
            <div className="mt-4 border-2 border-black rounded-xl bg-white p-4">
              <p className="text-[11px] font-black uppercase tracking-widest text-[#111]/60 mb-2">
                That input parses as a URL
              </p>
              <dl className="text-[13px] text-[#333] space-y-1">
                <div className="flex gap-2">
                  <dt className="font-bold w-20 shrink-0">Scheme</dt>
                  <dd className="font-mono break-all">{parts.protocol}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="font-bold w-20 shrink-0">Host</dt>
                  <dd className="font-mono break-all">{parts.host}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="font-bold w-20 shrink-0">Path</dt>
                  <dd className="font-mono break-all">{parts.path}</dd>
                </div>
                {parts.params.length > 0 ? (
                  <div className="flex gap-2">
                    <dt className="font-bold w-20 shrink-0">Query</dt>
                    <dd className="font-mono break-all">
                      {parts.params.map((param) => (
                        <span key={param.key} className="block">
                          {param.key} = {param.value}
                        </span>
                      ))}
                    </dd>
                  </div>
                ) : null}
                {parts.hash ? (
                  <div className="flex gap-2">
                    <dt className="font-bold w-20 shrink-0">Fragment</dt>
                    <dd className="font-mono break-all">{parts.hash}</dd>
                  </div>
                ) : null}
              </dl>
              <p className="text-xs text-[#666] mt-2 leading-relaxed">
                The query values above are already decoded. Each one on its own is what
                encodeURIComponent belongs on.
              </p>
            </div>
          ) : null}

          <OnDeviceNote>
            The encoding happens in this tab. The URL, token or search query you paste is
            never uploaded, logged or stored.
          </OnDeviceNote>
        </div>
      </section>

      <ToolSection title="encodeURI or encodeURIComponent">
        <p>
          The two differ on exactly one thing: what they do with the{" "}
          <strong>reserved characters</strong>, the punctuation that gives a URL
          its shape. Those are ; / ? : @ &amp; = + $ , and #.
        </p>
        <p>
          <strong>encodeURI</strong> leaves them alone, because it assumes you
          handed it a complete address where a slash separates path segments and
          an ampersand separates parameters. It escapes spaces and non ASCII
          characters and nothing else.
        </p>
        <p>
          <strong>encodeURIComponent</strong> escapes them, because it assumes
          you handed it one piece of data that has to survive being dropped
          inside a URL. A slash in a search term is part of the term, not a path
          separator, so it has to become %2F.
        </p>
        <p>
          The rule that follows: <strong>encodeURIComponent for the values,
          encodeURI for the whole thing</strong>. Getting it backwards is the
          classic bug. A search for red &amp; blue encoded with encodeURI keeps
          its ampersand, so the server sees a parameter q=red and a second
          parameter called blue, and the search silently runs on half the query.
        </p>
      </ToolSection>

      <ToolSection title="Where the two disagree, character by character">
        <div className="overflow-x-auto border-2 border-black rounded-xl bg-white">
          <table className="w-full text-[13px] text-left border-collapse min-w-[420px]">
            <caption className="sr-only">
              How each encoder treats the reserved characters
            </caption>
            <thead>
              <tr className="border-b-2 border-black">
                <th scope="col" className="px-3 py-2 font-black text-xs uppercase tracking-widest text-[#111]/60">
                  Character
                </th>
                <th scope="col" className="px-3 py-2 font-black text-xs uppercase tracking-widest text-[#111]/60">
                  encodeURI
                </th>
                <th scope="col" className="px-3 py-2 font-black text-xs uppercase tracking-widest text-[#111]/60">
                  encodeURIComponent
                </th>
                <th scope="col" className="px-3 py-2 font-black text-xs uppercase tracking-widest text-[#111]/60">
                  Form
                </th>
              </tr>
            </thead>
            <tbody>
              {RESERVED_COMPARISON.map((row) => (
                <tr key={row.char} className="border-b border-[#e5e5df] last:border-b-0">
                  <td className="px-3 py-2 font-mono font-bold text-[#111]">{row.char}</td>
                  <td className="px-3 py-2 font-mono text-[#333]">{row.uri}</td>
                  <td className="px-3 py-2 font-mono text-[#333]">{row.component}</td>
                  <td className="px-3 py-2 font-mono text-[#333]">{row.form}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Everything outside that list behaves identically in both. Letters,
          digits and the characters - _ . ! ~ * &apos; ( ) pass through
          untouched, and anything non ASCII becomes its UTF-8 bytes written as
          percent escapes, which is why an accented e is two escapes and an emoji
          is four.
        </p>
      </ToolSection>

      <ToolSection title="The plus sign problem">
        <p>
          Percent encoding says a space is %20. The
          application/x-www-form-urlencoded format, which is what an HTML form
          submits and what most query strings use in practice, says a space is a
          plus sign. Both are correct in their own context, which is precisely
          why they cause trouble.
        </p>
        <p>
          A plus sign inside a path segment is a literal plus. A plus sign inside
          a form encoded query value is a space. Decode with the wrong rule and
          you get spaces where a plus was meant, which quietly corrupts phone
          numbers, chemical formulae and anything else where the character
          matters. That is why form encoding is listed here as its own result
          rather than folded into the other two.
        </p>
      </ToolSection>

      <ToolSection title="Frequently asked questions" id="faq">
        <FaqList items={URL_ENCODE_FAQS} />
      </ToolSection>

      <ToolCta
        location="url_encode_tool"
        heading="Encoding rules are worth knowing once. Your syllabus is worth knowing properly."
        body="FORKSAI turns your notes, slides and PDFs into flashcards and spaced repetition sessions, so the things you look up twice you eventually stop looking up."
      />

      <TextToolCrossLinks current="/url-encode-decode" />
    </ToolPageShell>
  );
}
