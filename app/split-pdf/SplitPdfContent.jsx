"use client";

import { useMemo, useState } from "react";
import { Download, Scissors } from "lucide-react";
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
  PageCell,
  PageGrid,
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
  THUMBNAIL_PAGE_LIMIT,
  yieldToBrowser,
} from "@/lib/pdfTools";
import { describePdfError, loadPdfLib, readFileBytes } from "@/lib/pdfToolsPdf";
import { createZip, zipPayloadBytes, ZIP_MAX_BYTES } from "@/lib/pdfToolsZip";
import { SPLIT_PDF_FAQS } from "@/lib/pdfToolsFaqs";

// Zero padded so the files sort correctly in every file manager, and only as
// wide as the document needs.
function pageLabel(pageNumber, pageCount) {
  return String(pageNumber).padStart(String(pageCount).length, "0");
}

export default function SplitPdfContent() {
  const preview = usePdfPreview();
  const [mode, setMode] = useState("range");
  const [rangeText, setRangeText] = useState("");
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(null);

  // The typed range is the single source of truth. Clicking a thumbnail edits
  // that text, so the two controls can never disagree about what is selected.
  const parsed = useMemo(
    () => parsePageSelection(rangeText, preview.pageCount),
    [rangeText, preview.pageCount]
  );
  const selected = useMemo(() => new Set(parsed.pages), [parsed.pages]);

  const openFile = async (files) => {
    setStatus(null);
    setRangeText("");
    await preview.load(files[0]);
  };

  const togglePage = (pageNumber) => {
    const next = new Set(selected);
    if (next.has(pageNumber)) next.delete(pageNumber);
    else next.add(pageNumber);
    setRangeText(formatPageSelection([...next]));
  };

  const extractRange = async () => {
    if (parsed.error) {
      setStatus({ tone: "error", text: parsed.error });
      return;
    }
    setBusy(true);
    setStatus(null);
    setProgress({ done: 0, total: 1, label: "Reading the PDF" });

    try {
      const { PDFDocument } = await loadPdfLib();
      const bytes = await readFileBytes(preview.file);
      const source = await PDFDocument.load(bytes);
      const out = await PDFDocument.create();

      setProgress({ done: 0, total: parsed.pages.length, label: "Copying pages" });
      await yieldToBrowser();

      const copied = await out.copyPages(
        source,
        parsed.pages.map((n) => n - 1)
      );
      for (const page of copied) out.addPage(page);

      setProgress({ done: parsed.pages.length, total: parsed.pages.length, label: "Writing the new PDF" });
      await yieldToBrowser();

      const saved = await out.save();
      const name = `${baseName(preview.file.name)}-pages-${formatPageSelection(parsed.pages).replace(/,\s*/g, "_")}.pdf`;
      downloadBlob(new Blob([saved], { type: "application/pdf" }), name);
      setStatus({
        tone: "success",
        text: `Saved ${name} with ${parsed.pages.length} ${plural(parsed.pages.length, "page", "pages")}.`,
      });
    } catch (error) {
      setStatus({ tone: "error", text: describePdfError(error, preview.file?.name) });
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  const splitEachPage = async () => {
    setBusy(true);
    setStatus(null);

    try {
      const { PDFDocument } = await loadPdfLib();
      const bytes = await readFileBytes(preview.file);
      const source = await PDFDocument.load(bytes);
      const total = source.getPageCount();
      const stem = baseName(preview.file.name);
      const entries = [];

      for (let i = 0; i < total; i += 1) {
        setProgress({ done: i, total, label: `Splitting page ${i + 1} of ${total}` });
        await yieldToBrowser();
        const one = await PDFDocument.create();
        const [page] = await one.copyPages(source, [i]);
        one.addPage(page);
        entries.push({
          name: `${stem}-page-${pageLabel(i + 1, total)}.pdf`,
          data: await one.save(),
        });
      }

      if (zipPayloadBytes(entries) > ZIP_MAX_BYTES) {
        setStatus({
          tone: "error",
          text: "These pages add up to more than 4GB, which is past what a plain zip can hold. Extract a smaller range instead.",
        });
        return;
      }

      setProgress({ done: total, total, label: "Building the zip" });
      await yieldToBrowser();

      const zip = createZip(entries);
      downloadBlob(zip, `${stem}-pages.zip`);
      setStatus({
        tone: "success",
        text: `Saved ${stem}-pages.zip with ${total} ${plural(total, "file", "files")}, ${formatBytes(zip.size)} in total.`,
      });
    } catch (error) {
      setStatus({ tone: "error", text: describePdfError(error, preview.file?.name) });
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  const ready = preview.pageCount > 0 && !preview.error;

  return (
    <ToolPageShell>
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif font-black text-3xl sm:text-[2.6rem] leading-[1.08] text-[#111] mb-3">
          Split PDF
        </h1>
        <p className="text-[15px] sm:text-base text-[#444] leading-relaxed mb-6 max-w-2xl">
          Pull a range of pages out of a PDF as its own file, or break the whole
          thing into one file per page. Click the pages you want or type the
          numbers. Your file is opened here in your browser and never uploaded.
        </p>

        <div className={`${cardClass} p-5 sm:p-7`}>
          <FilePicker
            label={preview.file ? "Choose a different PDF" : "Drop your PDF here"}
            hint="One file at a time. To join files together first, use the merge tool."
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
            <div className="mt-6">
              <fieldset>
                <legend className={labelClass}>What do you want out of it?</legend>
                <div className="flex flex-wrap gap-2">
                  {[
                    ["range", "A range of pages, as one file"],
                    ["each", "Every page, as its own file"],
                  ].map(([value, label]) => (
                    <label
                      key={value}
                      className="inline-flex items-center gap-2 border-2 border-black rounded-xl px-3 py-2 cursor-pointer text-sm font-bold text-[#111] has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-[#F0D44A]"
                      style={{ background: mode === value ? "#F0D44A" : "#FFFFFF" }}
                    >
                      <input
                        type="radio"
                        name="split-mode"
                        value={value}
                        checked={mode === value}
                        onChange={() => setMode(value)}
                        disabled={busy}
                        className="sr-only"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>

              {mode === "range" ? (
                <div className="mt-5">
                  <label htmlFor="split-range" className={labelClass}>
                    Pages to keep
                  </label>
                  <input
                    id="split-range"
                    type="text"
                    inputMode="numeric"
                    value={rangeText}
                    onChange={(e) => setRangeText(e.target.value)}
                    placeholder="1-3, 7, 11-14"
                    disabled={busy}
                    className={inputClass}
                  />
                  <p className={hintClass}>
                    Commas between pages, dashes for ranges. A dash with nothing after
                    it, like 9-, means to the end. Clicking the pages below types this
                    for you.
                  </p>
                  <p className="mt-2 text-sm font-bold text-[#111]">
                    {parsed.error
                      ? parsed.error
                      : `${parsed.pages.length} of ${preview.pageCount} ${plural(preview.pageCount, "page", "pages")} selected.`}
                  </p>
                </div>
              ) : (
                <p className="mt-5 text-sm text-[#333] leading-relaxed">
                  Every one of the {preview.pageCount} pages becomes its own PDF, and
                  they arrive together in a single zip. Browsers block a burst of
                  separate downloads, so one zip is the reliable way to hand back this
                  many files.
                </p>
              )}

              {preview.tooManyPages ? (
                <p className="mt-5 text-xs text-[#111] font-bold border-2 border-black rounded-xl bg-white px-4 py-3 leading-relaxed">
                  This PDF has {preview.pageCount} pages, past the {THUMBNAIL_PAGE_LIMIT}{" "}
                  where drawing a preview of every one costs more time than it saves.
                  Type the page numbers instead.
                </p>
              ) : (
                <div className="mt-5">
                  {preview.thumbProgress ? (
                    <div className="mb-3">
                      <ProgressBar
                        done={preview.thumbProgress.done}
                        total={preview.thumbProgress.total}
                        label="Drawing page previews"
                      />
                    </div>
                  ) : null}
                  {mode === "range" ? (
                    <PageGrid>
                      {preview.thumbs.map((thumb, i) => (
                        <PageCell
                          key={i}
                          pageNumber={i + 1}
                          thumb={thumb}
                          selectable
                          selected={selected.has(i + 1)}
                          onSelect={togglePage}
                          selectHint="Keep"
                        />
                      ))}
                    </PageGrid>
                  ) : null}
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-3">
                {mode === "range" ? (
                  <button
                    type="button"
                    onClick={extractRange}
                    disabled={busy || Boolean(parsed.error)}
                    className={`${buttonClass} disabled:opacity-40`}
                    style={{ background: busy || parsed.error ? "#FFFFFF" : "#F0D44A" }}
                  >
                    <Scissors size={16} strokeWidth={2.75} aria-hidden="true" />
                    {busy ? "Working" : "Extract these pages"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={splitEachPage}
                    disabled={busy}
                    className={`${buttonClass} disabled:opacity-40`}
                    style={{ background: busy ? "#FFFFFF" : "#F0D44A" }}
                  >
                    <Download size={16} strokeWidth={2.75} aria-hidden="true" />
                    {busy ? "Working" : `Split into ${preview.pageCount} files (zip)`}
                  </button>
                )}
                {mode === "range" && preview.pageCount ? (
                  <button
                    type="button"
                    onClick={() => setRangeText(`1-${preview.pageCount}`)}
                    disabled={busy}
                    className={`${buttonClass} disabled:opacity-40`}
                  >
                    Select all
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

          <OnDeviceNote className="mt-5" />
        </div>
      </section>

      <ToolSection title="Two ways to split a PDF">
        <p>
          <strong>A range as one file.</strong> This is what you want when a
          lecturer posts a 300 page course pack and you need chapter four. Type
          1-3, 7, 11-14 and you get a single PDF holding exactly those pages, in
          page order, with duplicates ignored.
        </p>
        <p>
          <strong>Every page as its own file.</strong> This is for feeding pages
          into something else one at a time, or for pulling one signed page out of
          a stack. The files come back in a zip named after the original, numbered
          with leading zeros so they sort correctly rather than putting page 10
          before page 2.
        </p>
        <p>
          Either way the original file on your disk is untouched. Nothing is
          uploaded, so a private document stays private, and there is no server
          queue to sit in.
        </p>
      </ToolSection>

      <ToolSection title="What to expect from the output">
        <p>
          Pages are copied whole. Their size, orientation and rotation come across
          with them, text stays selectable and images keep their resolution.
        </p>
        <p>
          The extracted file is usually smaller than the original, but rarely in
          proportion. A PDF shares fonts and images across pages, so one page
          pulled from a long report still has to carry every font it uses. Do not
          be surprised when a single page out of a 200 page document is more than
          a two hundredth of the size.
        </p>
        <p>
          Very long documents are the slow case, because splitting into single
          pages means building one PDF per page. The progress bar tells you where
          it has got to. Extracting one range is fast whatever the length.
        </p>
      </ToolSection>

      <ToolSection title="Frequently asked questions" id="faq">
        <FaqList items={SPLIT_PDF_FAQS} />
      </ToolSection>

      <PdfToolCta
        location="split_pdf"
        heading="You split out the chapter. Now learn it."
        body="Drop the pages you kept into FORKSAI and get flashcards, a summary and a spaced repetition schedule built from what is actually on them."
      />

      <PdfToolCrossLinks current="/split-pdf" />
    </ToolPageShell>
  );
}
