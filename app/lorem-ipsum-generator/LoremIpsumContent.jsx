"use client";

import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import ToolPageShell, {
  ToolCta,
  ToolSection,
  FaqList,
  cardClass,
  inputClass,
  labelClass,
  hintClass,
  buttonClass,
} from "@/components/ToolPageShell";
import { CopyButton } from "@/lib/formatToolsShell";
import { TextToolCrossLinks, OnDeviceNote } from "@/lib/textToolsShell";
import { LOREM_IPSUM_FAQS } from "@/lib/textToolsFaqs";
import {
  LOREM_UNITS,
  LOREM_FORMATS,
  getUnit,
  generateLorem,
  renderLorem,
  loremStats,
} from "@/lib/textToolsLorem";

export default function LoremIpsumContent() {
  const [unit, setUnit] = useState("paragraphs");
  const [count, setCount] = useState("3");
  const [format, setFormat] = useState("text");
  const [startWithLorem, setStartWithLorem] = useState(true);
  // A fixed starting seed, so the server and the browser render the same
  // passage on the first paint. The button below moves it on.
  const [seed, setSeed] = useState(1);

  const spec = getUnit(unit);
  const typed = Number.parseInt(count, 10);
  const valid = Number.isFinite(typed) && typed >= 1 && typed <= spec.max;

  const blocks = useMemo(() => {
    const wanted = Number.parseInt(count, 10);
    if (!Number.isFinite(wanted) || wanted < 1 || wanted > getUnit(unit).max) return [];
    return generateLorem({ unit, count: wanted, seed, startWithLorem });
  }, [unit, count, seed, startWithLorem]);

  const output = useMemo(() => renderLorem(blocks, format), [blocks, format]);
  const stats = useMemo(() => loremStats(blocks), [blocks]);

  // Switching unit carries the count over, which is rarely what you want:
  // three paragraphs is sensible, three words is not.
  const switchUnit = (id) => {
    setUnit(id);
    setCount(String(getUnit(id).defaultCount));
  };

  return (
    <ToolPageShell>
      {/* Controls and output first. Everything explanatory is below them. */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif font-black text-3xl sm:text-[2.6rem] leading-[1.08] text-[#111] mb-3">
          Lorem ipsum generator
        </h1>
        <p className="text-[15px] sm:text-base text-[#444] leading-relaxed mb-6 max-w-2xl">
          Placeholder text by the paragraph, the sentence or the word, as plain
          text or as HTML paragraphs you can paste straight into a template. The
          text is generated in your browser, so nothing is uploaded and it works
          with the network off. Free, no signup.
        </p>

        <div className={`${cardClass} p-5 sm:p-7`}>
          <div className="grid sm:grid-cols-[1fr_1fr] gap-4">
            <div>
              <label htmlFor="lorem-unit" className={labelClass}>
                Generate
              </label>
              <select
                id="lorem-unit"
                name="lorem-unit"
                value={unit}
                onChange={(e) => switchUnit(e.target.value)}
                className={inputClass}
              >
                {LOREM_UNITS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="lorem-count" className={labelClass}>
                How many
              </label>
              <input
                id="lorem-count"
                name="lorem-count"
                type="number"
                inputMode="numeric"
                min={1}
                max={spec.max}
                value={count}
                onChange={(e) => setCount(e.target.value)}
                className={inputClass}
              />
              <p className={hintClass}>
                Between 1 and {spec.max} {spec.label.toLowerCase()}.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-[1fr_1fr] gap-4 mt-4">
            <div>
              <label htmlFor="lorem-format" className={labelClass}>
                Output
              </label>
              <select
                id="lorem-format"
                name="lorem-format"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className={inputClass}
              >
                {LOREM_FORMATS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
              <p className={hintClass}>
                {format === "html"
                  ? "One p element per paragraph, with no class names and no wrapper."
                  : "A blank line between paragraphs, ready to paste into a document."}
              </p>
            </div>
            <div className="flex items-start sm:items-end">
              <label
                htmlFor="lorem-start"
                className="flex items-start gap-2.5 border-2 border-black rounded-xl bg-white px-4 py-3 w-full cursor-pointer"
              >
                <input
                  id="lorem-start"
                  name="lorem-start"
                  type="checkbox"
                  checked={startWithLorem}
                  onChange={(e) => setStartWithLorem(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[#111] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
                />
                <span className="text-sm font-bold text-[#111] leading-snug">
                  Start with Lorem ipsum dolor sit amet
                </span>
              </label>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-5">
            <button
              type="button"
              onClick={() => setSeed((current) => current + 1)}
              className={buttonClass}
            >
              <RefreshCw size={14} strokeWidth={2.75} aria-hidden="true" /> Generate again
            </button>
            <CopyButton value={output} label="Copy text" disabled={!valid || !output} />
            {valid ? (
              <span className="text-xs text-[#666] font-bold">
                {stats.words} words, {stats.characters} characters
              </span>
            ) : null}
          </div>

          {/* aria-live so the passage is announced when the settings change. */}
          <div aria-live="polite" className="mt-5">
            <label htmlFor="lorem-output" className={labelClass}>
              Your placeholder text
            </label>
            {valid ? (
              <textarea
                id="lorem-output"
                name="lorem-output"
                readOnly
                value={output}
                rows={12}
                spellCheck="false"
                className="w-full border-2 border-black rounded-xl bg-white px-4 py-3 text-[13.5px] text-[#111] leading-relaxed outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A] resize-y font-mono"
              />
            ) : (
              <p
                role="alert"
                className="border-2 border-black rounded-xl bg-white px-4 py-4 text-sm font-bold text-[#111]"
              >
                Type a number between 1 and {spec.max}.
              </p>
            )}
          </div>

          <OnDeviceNote>
            The words are picked in this tab from a list built into the page. There is
            no request to a server, so nothing about what you generate is logged.
          </OnDeviceNote>
        </div>
      </section>

      <ToolSection title="What lorem ipsum actually is">
        <p>
          It is a scrambled extract from Cicero&apos;s De Finibus Bonorum et
          Malorum, written in 45 BC, with words cut, joined and invented until it
          stopped meaning anything. Typesetters have used it since the sixteenth
          century, and the reason it survived is not tradition. It is that text
          nobody can read is text nobody stops to read.
        </p>
        <p>
          That is the whole point of placeholder copy. Put real sentences in a
          draft layout and everyone in the review talks about the sentences.
          Put lorem ipsum in and they look at the thing you asked them to look
          at, which is the spacing, the line length and the shape of the page.
        </p>
      </ToolSection>

      <ToolSection title="Why not repeat one sentence instead">
        <p>
          Because repeated text lies to you. Identical sentences give identical
          line breaks, so the block looks neater than the finished page ever
          will, hyphenation never fires, and a column that will overflow in
          production sits perfectly inside its box in the mockup.
        </p>
        <p>
          The sentences here run six to sixteen words and the paragraphs three to
          six sentences, which is close enough to ordinary prose that ragged
          edges, awkward widows and a heading that only just fits all show up
          while there is still time to change them.
        </p>
      </ToolSection>

      <ToolSection title="Plain text or HTML">
        <p>
          Plain text puts a blank line between paragraphs. That is what a word
          processor, a design tool and most content fields expect when you paste,
          and it is the right choice if the text is going anywhere a person will
          edit it.
        </p>
        <p>
          The HTML output wraps each paragraph in a p element and does nothing
          else. No class names, no div around the outside, no inline styles, so
          it inherits whatever your stylesheet already says about paragraphs
          rather than fighting it. Paste it into a template and the spacing you
          see is the spacing your real copy will get.
        </p>
      </ToolSection>

      <ToolSection title="The same settings give the same text">
        <p>
          The generator is seeded rather than random, so a given combination of
          unit, count and options always produces the same passage. Reload the
          page and your block comes back. Send someone the settings and they see
          what you saw.
        </p>
        <p>
          Generate again moves the seed on by one, which is how you ask for a
          different passage. It is a small thing, but the alternative is losing a
          block you had already fitted to a layout the moment you click anything.
        </p>
      </ToolSection>

      <ToolSection title="Frequently asked questions" id="faq">
        <FaqList items={LOREM_IPSUM_FAQS} />
      </ToolSection>

      <ToolCta
        location="lorem_ipsum_tool"
        heading="Placeholder text is for layouts. Your notes deserve better."
        body="FORKSAI turns your slides, PDFs and notes into flashcards and spaced repetition sessions, so the real words are the ones that stick."
      />

      <TextToolCrossLinks current="/lorem-ipsum-generator" />
    </ToolPageShell>
  );
}
