"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Upload } from "lucide-react";
import ToolPageShell, {
  ToolCta,
  ToolSection,
  FaqList,
  cardClass,
  inputClass,
  labelClass,
  buttonClass,
} from "@/components/ToolPageShell";
import { textToPdf, PAGE_SIZES, FONT_FAMILIES } from "@/lib/formatToolsPdf";
import { FormatToolCrossLinks, OnDeviceNote, formatBytes } from "@/lib/formatToolsShell";
import { downloadBlob } from "@/lib/formatToolsCsv";
import { TEXT_TO_PDF_FAQS } from "@/lib/formatToolsFaqs";

const SAMPLE = `Reading list, week 6

Paste or type anything here and it becomes a PDF, laid out with the page size, font and margins you choose on the right.

Long paragraphs are wrapped to the text width rather than running off the page, and blank lines are kept as spacing, so notes, meeting minutes and reading lists come out looking like a document instead of a wall.

The file is written in this tab. Nothing is uploaded.`;

const selectClass =
  "w-full border-2 border-black rounded-xl bg-white px-3 py-2.5 text-sm font-bold text-[#111] " +
  "outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]";

export default function TextToPdfContent() {
  const [text, setText] = useState(SAMPLE);
  const [fontFamily, setFontFamily] = useState("helvetica");
  const [fontSize, setFontSize] = useState(11);
  const [pageSize, setPageSize] = useState("a4");
  const [orientation, setOrientation] = useState("portrait");
  const [marginMm, setMarginMm] = useState(20);
  const [output, setOutput] = useState(null);

  const options = useMemo(
    () => ({ fontFamily, fontSize: Number(fontSize) || 11, pageSize, orientation, marginMm: Number(marginMm) || 0 }),
    [fontFamily, fontSize, pageSize, orientation, marginMm]
  );

  // Rebuilt on a short delay so typing does not lay out the document on every
  // keystroke. The preview is the real PDF, rendered by the browser's own
  // viewer, rather than an HTML impression of one.
  useEffect(() => {
    let cancelled = false;
    let url = "";
    const timer = setTimeout(() => {
      try {
        const doc = textToPdf(text, options);
        const blob = doc.toBlob();
        url = URL.createObjectURL(blob);
        if (!cancelled) {
          setOutput({
            blob,
            url,
            pages: doc.pages.length,
            unsupported: Array.from(doc.unsupported).slice(0, 12),
          });
        }
      } catch {
        if (!cancelled) setOutput(null);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (url) setTimeout(() => URL.revokeObjectURL(url), 0);
    };
  }, [text, options]);

  const openTextFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setText(String(reader.result ?? ""));
    reader.readAsText(file);
  };

  return (
    <ToolPageShell>
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif font-black text-3xl sm:text-[2.6rem] leading-[1.08] text-[#111] mb-3">
          Text to PDF
        </h1>
        <p className="text-[15px] sm:text-base text-[#444] leading-relaxed mb-6 max-w-2xl">
          Paste your text, choose the page size, font and margins, and download a
          real PDF. The file is written in your browser, so nothing is uploaded,
          and there is no watermark and no signup.
        </p>

        <div className={`${cardClass} p-5 sm:p-7`}>
          <div className="flex items-center justify-between gap-3 mb-2">
            <label htmlFor="text" className={labelClass + " mb-0"}>
              Your text
            </label>
            <label className={`${buttonClass} cursor-pointer`}>
              <Upload size={14} strokeWidth={2.75} /> Open a .txt file
              <input
                type="file"
                accept=".txt,.md,text/plain"
                className="sr-only"
                onChange={(e) => openTextFile(e.target.files?.[0])}
              />
            </label>
          </div>
          <textarea
            id="text"
            name="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            className="w-full border-2 border-black rounded-xl bg-white px-4 py-3 text-[15px] text-[#111] leading-relaxed outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A] resize-y"
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
            <div>
              <label htmlFor="font" className={labelClass}>
                Font
              </label>
              <select
                id="font"
                name="font"
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className={selectClass}
              >
                {FONT_FAMILIES.map((family) => (
                  <option key={family.id} value={family.id}>
                    {family.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="size" className={labelClass}>
                Font size
              </label>
              <input
                id="size"
                name="size"
                type="number"
                inputMode="numeric"
                min={6}
                max={36}
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="pageSize" className={labelClass}>
                Page size
              </label>
              <select
                id="pageSize"
                name="pageSize"
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value)}
                className={selectClass}
              >
                {PAGE_SIZES.map((size) => (
                  <option key={size.id} value={size.id}>
                    {size.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="orientation" className={labelClass}>
                Orientation
              </label>
              <select
                id="orientation"
                name="orientation"
                value={orientation}
                onChange={(e) => setOrientation(e.target.value)}
                className={selectClass}
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>
            <div>
              <label htmlFor="margin" className={labelClass}>
                Margin
              </label>
              <div className="relative">
                <input
                  id="margin"
                  name="margin"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={60}
                  value={marginMm}
                  onChange={(e) => setMarginMm(e.target.value)}
                  className={`${inputClass} pr-14`}
                />
                <span
                  aria-hidden="true"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#666]"
                >
                  mm
                </span>
              </div>
            </div>
          </div>

          {/* aria-live so the page count and any warning are announced as the
              settings change. */}
          <div aria-live="polite" className="mt-6">
            {output ? (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => downloadBlob("document.pdf", output.blob)}
                    className={buttonClass}
                  >
                    <Download size={14} strokeWidth={2.75} /> Download PDF
                  </button>
                  <span className="text-sm text-[#555]">
                    {output.pages} {output.pages === 1 ? "page" : "pages"},{" "}
                    {formatBytes(output.blob.size)}
                  </span>
                </div>

                {output.unsupported.length > 0 ? (
                  <p
                    className="border-2 border-black rounded-xl px-4 py-3 text-sm text-[#111] mt-3"
                    style={{ background: "#F0D44A" }}
                  >
                    These characters cannot be written with the standard PDF fonts and
                    have been replaced with question marks: {output.unsupported.join(" ")}.
                    Scripts outside Western European need an embedded font, which this
                    tool does not do.
                  </p>
                ) : null}

                <div className="mt-4 border-2 border-black rounded-xl bg-white overflow-hidden">
                  <iframe
                    src={output.url}
                    title="Preview of the generated PDF"
                    className="w-full"
                    style={{ height: 520, border: "none" }}
                  />
                </div>
                <p className="text-xs text-[#666] mt-2">
                  The preview is the actual file, shown by your browser's PDF viewer. Some
                  mobile browsers refuse to display it inline, in which case download it
                  and open it normally.
                </p>
              </>
            ) : (
              <p className="border-2 border-black rounded-xl bg-white px-4 py-4 text-sm text-[#555]">
                Type something above to build a PDF.
              </p>
            )}
          </div>

          <OnDeviceNote>
            The PDF is assembled byte by byte in this tab, so a letter, a contract draft
            or a set of notes is never uploaded to a converter site.
          </OnDeviceNote>
        </div>
      </section>

      <ToolSection title="Choosing a font, a size and a margin">
        <p>
          The three fonts offered are Helvetica, Times and Courier, the standard
          faces every PDF reader has built in. Using them means no font file has
          to be embedded, which keeps the output at a few kilobytes and
          guarantees it renders the same on any machine.
        </p>
        <p>
          For a document meant to be read on screen, 11 or 12 point with a 20mm
          margin is a safe starting point. For something to be printed and
          annotated, widen the margin to 25mm. Courier is monospaced, so use it
          for code, logs and anything where column alignment matters.
        </p>
      </ToolSection>

      <ToolSection title="Which characters can be written">
        <p>
          The standard fonts use WinAnsi encoding, which covers English, the
          Western European accents, curly quotes, dashes and the common
          typographic characters. Anything you paste from a word processor
          usually falls inside it.
        </p>
        <p>
          Scripts outside that range, such as Devanagari, Chinese, Japanese,
          Arabic, Greek or Cyrillic, need a font embedded in the file, which this
          tool does not do. Rather than writing a broken PDF quietly, it replaces
          those characters with question marks and lists them above, so you know
          before you send the file.
        </p>
      </ToolSection>

      <ToolSection title="Why not print to PDF instead">
        <p>
          Printing a page to PDF from the browser works, and for a web page it is
          often the right answer. It is a poor fit for plain text, because you
          get the browser's headers, footers, URL stamp and whatever margins the
          print dialog decides on.
        </p>
        <p>
          This tool writes the document directly, so what you set is what you
          get: one text block, your page size, your margins, nothing else on the
          page.
        </p>
      </ToolSection>

      <ToolSection title="Frequently asked questions" id="faq">
        <FaqList items={TEXT_TO_PDF_FAQS} />
      </ToolSection>

      <ToolCta
        location="text_to_pdf"
        heading="A PDF of your notes is a start. Knowing them is the goal."
        body="FORKSAI turns those same notes into flashcards and study sessions, so the material moves from the file to your memory."
      />

      <FormatToolCrossLinks current="/text-to-pdf" />
    </ToolPageShell>
  );
}
