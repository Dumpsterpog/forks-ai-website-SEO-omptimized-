"use client";

import { useMemo, useRef, useState } from "react";
import { Copy, Download, FileText, Square } from "lucide-react";
import ToolPageShell, {
  ToolSection,
  FaqList,
  cardClass,
  inputClass,
  labelClass,
  hintClass,
  buttonClass,
} from "@/components/ToolPageShell";
import {
  FilePicker,
  FileSizeWarning,
  OnDeviceNote,
  PdfToolCrossLinks,
  PdfToolCta,
  ProgressBar,
  StatusRegion,
  usePdfPreview,
} from "@/lib/pdfToolsShell";
import {
  baseName,
  downloadBlob,
  formatBytes,
  formatPageSelection,
  parsePageSelection,
  plural,
  yieldToBrowser,
} from "@/lib/pdfTools";
import {
  closeDocument,
  describePdfError,
  extractPageText,
  openForReading,
  readFileBytes,
} from "@/lib/pdfToolsPdf";
import { PDF_TEXT_EXTRACTOR_FAQS } from "@/lib/pdfToolsFaqs";

export default function PdfTextExtractorContent() {
  const preview = usePdfPreview({ thumbnails: false });
  const [rangeText, setRangeText] = useState("");
  const [markPages, setMarkPages] = useState(true);
  const [text, setText] = useState("");
  const [emptyPages, setEmptyPages] = useState([]);
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(null);
  const cancelled = useRef(false);

  const parsed = useMemo(
    () => parsePageSelection(rangeText || `1-${preview.pageCount || 1}`, preview.pageCount),
    [rangeText, preview.pageCount]
  );

  const openFile = async (files) => {
    setStatus(null);
    setRangeText("");
    setText("");
    setEmptyPages([]);
    await preview.load(files[0]);
  };

  const extract = async () => {
    if (parsed.error) {
      setStatus({ tone: "error", text: parsed.error });
      return;
    }
    setBusy(true);
    setStatus(null);
    setText("");
    setEmptyPages([]);
    cancelled.current = false;

    const blank = [];
    const chunks = [];
    let doc = null;

    try {
      const bytes = await readFileBytes(preview.file);
      doc = await openForReading(bytes);

      for (let i = 0; i < parsed.pages.length; i += 1) {
        if (cancelled.current) break;
        const pageNumber = parsed.pages[i];
        setProgress({
          done: i,
          total: parsed.pages.length,
          label: `Reading page ${pageNumber}`,
        });
        // Every few pages, so the progress bar moves and the stop button works.
        if (i % 5 === 0) await yieldToBrowser();

        const page = await doc.getPage(pageNumber);
        const pageText = await extractPageText(page);
        page.cleanup();

        if (!pageText) blank.push(pageNumber);
        else chunks.push(markPages ? `[Page ${pageNumber}]\n${pageText}` : pageText);
      }

      const joined = chunks.join("\n\n");
      setText(joined);
      setEmptyPages(blank);

      if (!joined) {
        setStatus({
          tone: "error",
          text: "This PDF holds no selectable text at all, which almost always means it is a scan: a picture of a page rather than a page of characters. There is nothing here to extract. Pulling text out of a scan needs optical character recognition, which this tool does not do.",
        });
      } else {
        const words = joined.split(/\s+/).filter(Boolean).length;
        setStatus({
          tone: "success",
          text: cancelled.current
            ? `Stopped after ${chunks.length + blank.length} of ${parsed.pages.length} ${plural(parsed.pages.length, "page", "pages")}. ${words} words so far.`
            : `Read ${parsed.pages.length} ${plural(parsed.pages.length, "page", "pages")} and found ${words} words${blank.length ? `. ${blank.length} ${plural(blank.length, "page has", "pages have")} no selectable text` : ""}.`,
        });
      }
    } catch (error) {
      setStatus({ tone: "error", text: describePdfError(error, preview.file?.name) });
    } finally {
      await closeDocument(doc);
      setBusy(false);
      setProgress(null);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus({ tone: "success", text: "Copied to your clipboard." });
    } catch {
      setStatus({
        tone: "error",
        text: "Your browser blocked the clipboard. Select the text in the box and copy it by hand.",
      });
    }
  };

  const ready = preview.pageCount > 0 && !preview.error;
  const words = text ? text.split(/\s+/).filter(Boolean).length : 0;

  return (
    <ToolPageShell>
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif font-black text-3xl sm:text-[2.6rem] leading-[1.08] text-[#111] mb-3">
          PDF text extractor
        </h1>
        <p className="text-[15px] sm:text-base text-[#444] leading-relaxed mb-6 max-w-2xl">
          Pull the selectable text out of a PDF, then copy it or save it as a .txt
          file. Worth knowing before you start: a scanned document is a picture of
          text, not text, so it holds nothing to extract. This page reads only
          what is really there, and it reads it in your browser.
        </p>

        <div className={`${cardClass} p-5 sm:p-7`}>
          <FilePicker
            label={preview.file ? "Choose a different PDF" : "Drop your PDF here"}
            hint="One file at a time."
            onFiles={openFile}
            disabled={busy}
          />

          {preview.file ? (
            <p className="mt-3 text-xs text-[#666]">
              <span className="font-bold text-[#111]">{preview.file.name}</span>
              {preview.pageCount
                ? `, ${preview.pageCount} ${plural(preview.pageCount, "page", "pages")}, ${formatBytes(preview.file.size)}`
                : preview.loading
                  ? ", opening"
                  : ""}
            </p>
          ) : null}

          <div className="mt-3">
            <FileSizeWarning file={preview.file} />
          </div>

          {preview.error ? (
            <div className="mt-4">
              <StatusRegion tone="error">{preview.error}</StatusRegion>
            </div>
          ) : null}

          {ready ? (
            <div className="mt-6 space-y-5">
              <div>
                <label htmlFor="text-range" className={labelClass}>
                  Pages to read
                </label>
                <input
                  id="text-range"
                  type="text"
                  inputMode="numeric"
                  value={rangeText}
                  onChange={(e) => setRangeText(e.target.value)}
                  placeholder={`Leave empty for all ${preview.pageCount}`}
                  disabled={busy}
                  className={inputClass}
                />
                <p className={hintClass}>
                  Commas between pages, dashes for ranges, for example 12-18.
                </p>
                <p className="mt-2 text-sm font-bold text-[#111]">
                  {parsed.error
                    ? parsed.error
                    : `${parsed.pages.length} ${plural(parsed.pages.length, "page", "pages")} to read.`}
                </p>
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={markPages}
                  onChange={(e) => setMarkPages(e.target.checked)}
                  disabled={busy}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#F0D44A] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
                />
                <span className="text-sm text-[#111]">
                  <span className="font-bold">Mark where each page starts</span>
                  <span className="block text-xs text-[#666] mt-0.5">
                    Puts a [Page 3] line above each page&apos;s text, so you can find
                    your way back to the source.
                  </span>
                </span>
              </label>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={extract}
                  disabled={busy || Boolean(parsed.error)}
                  className={`${buttonClass} disabled:opacity-40`}
                  style={{ background: busy || parsed.error ? "#FFFFFF" : "#F0D44A" }}
                >
                  <FileText size={16} strokeWidth={2.75} aria-hidden="true" />
                  {busy ? "Reading" : "Extract the text"}
                </button>
                {busy && progress ? (
                  <button
                    type="button"
                    onClick={() => {
                      cancelled.current = true;
                    }}
                    className={buttonClass}
                  >
                    <Square size={14} strokeWidth={3} aria-hidden="true" /> Stop
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          {progress ? (
            <div className="mt-5">
              <ProgressBar done={progress.done} total={progress.total} label={progress.label} />
            </div>
          ) : null}

          <div className="mt-5">
            <StatusRegion tone={status?.tone}>{status?.text}</StatusRegion>
          </div>

          {text ? (
            <div className="mt-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                <label htmlFor="extracted" className={`${labelClass} mb-0`}>
                  Extracted text
                </label>
                <span className="text-xs font-bold text-[#666]">
                  {words} {plural(words, "word", "words")}, {text.length} characters
                </span>
              </div>
              <textarea
                id="extracted"
                readOnly
                value={text}
                rows={14}
                className={`${inputClass} font-mono text-[13px] leading-relaxed resize-y`}
              />
              <div className="mt-3 flex flex-wrap gap-3">
                <button type="button" onClick={copy} className={buttonClass}>
                  <Copy size={16} strokeWidth={2.75} aria-hidden="true" /> Copy all
                </button>
                <button
                  type="button"
                  onClick={() =>
                    downloadBlob(
                      new Blob([text], { type: "text/plain;charset=utf-8" }),
                      `${baseName(preview.file.name)}.txt`
                    )
                  }
                  className={buttonClass}
                >
                  <Download size={16} strokeWidth={2.75} aria-hidden="true" /> Save as .txt
                </button>
              </div>

              {emptyPages.length ? (
                <p className="mt-3 text-xs text-[#111] font-bold border-2 border-black rounded-xl bg-white px-4 py-3 leading-relaxed">
                  No selectable text on {plural(emptyPages.length, "page", "pages")}{" "}
                  {formatPageSelection(emptyPages)}. Those are almost certainly scanned
                  or image only, and there is nothing on them to extract without
                  optical character recognition.
                </p>
              ) : null}
            </div>
          ) : null}

          <OnDeviceNote className="mt-5" />
        </div>
      </section>

      <ToolSection title="Why some PDFs give you nothing">
        <p>
          There are two completely different things people call a PDF. One holds
          characters, with a font and a position for each of them. The other holds
          a photograph of a page. They look identical on screen and behave nothing
          alike.
        </p>
        <p>
          This tool reads the first kind. On the second kind it returns nothing,
          and it says so rather than handing you an empty box and letting you
          wonder. The test takes two seconds: open the PDF in any reader and try
          to select a word with your cursor. If the highlight will not stick, the
          characters are not there.
        </p>
        <p>
          Turning a picture of text back into text is optical character
          recognition, a different job with a different failure mode: it guesses,
          and it guesses badly on handwriting, on bad lighting and on anything
          set in columns. This page does not do it, and does not pretend to.
        </p>
      </ToolSection>

      <ToolSection title="Why the spacing comes out odd">
        <p>
          A PDF does not store sentences or paragraphs. It stores fragments of
          text with coordinates, in whatever order the program that made the file
          happened to write them. Rebuilding lines from that is reconstruction,
          not reading, and it is why extracted text so often needs a tidy up.
        </p>
        <p>
          The usual troublemakers are two column layouts, where the reading order
          on screen is not the order in the file, tables, which arrive as a stream
          of cells with the structure gone, and running headers and footers, which
          turn up in the middle of the text once per page.
        </p>
        <p>
          Ligatures are worth watching for too. In many fonts fi and fl are single
          characters, so words like file and flow can come out looking odd in a
          plain text editor. A search and replace fixes the lot in one pass.
        </p>
      </ToolSection>

      <ToolSection title="Frequently asked questions" id="faq">
        <FaqList items={PDF_TEXT_EXTRACTOR_FAQS} />
      </ToolSection>

      <PdfToolCta
        location="pdf_text_extractor"
        heading="You have the text. Now make it stick."
        body="Paste it into FORKSAI and it comes back as flashcards, a summary and a spaced repetition schedule, so the reading turns into recall."
      />

      <PdfToolCrossLinks current="/pdf-text-extractor" />
    </ToolPageShell>
  );
}
