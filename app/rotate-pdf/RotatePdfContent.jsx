"use client";

import { useMemo, useState } from "react";
import { RotateCcw, RotateCw, Save } from "lucide-react";
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
  parsePageSelection,
  plural,
  THUMBNAIL_PAGE_LIMIT,
  yieldToBrowser,
} from "@/lib/pdfTools";
import { describePdfError, loadPdfLib, readFileBytes } from "@/lib/pdfToolsPdf";
import { ROTATE_PDF_FAQS } from "@/lib/pdfToolsFaqs";

const turn = (current, delta) => (((current + delta) % 360) + 360) % 360;

export default function RotatePdfContent() {
  const preview = usePdfPreview();
  const [rangeText, setRangeText] = useState("");
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(null);

  // The turns are stored against the document that produced them. Load a
  // different file and the key stops matching, so a fresh set of zeroes takes
  // over with no effect needed to reset anything.
  const documentKey = preview.file
    ? `${preview.file.name}:${preview.file.size}:${preview.pageCount}`
    : "";
  const [turns, setTurns] = useState({ key: "", values: [] });
  const deltas =
    turns.key === documentKey ? turns.values : new Array(preview.pageCount).fill(0);
  const setDeltas = (next) =>
    setTurns({ key: documentKey, values: typeof next === "function" ? next(deltas) : next });

  const parsedRange = useMemo(
    () => parsePageSelection(rangeText, preview.pageCount),
    [rangeText, preview.pageCount]
  );

  const openFile = async (files) => {
    setStatus(null);
    setRangeText("");
    await preview.load(files[0]);
  };

  const rotatePage = (index, delta) =>
    setDeltas((prev) => prev.map((d, i) => (i === index ? turn(d, delta) : d)));

  const rotateAll = (delta) => setDeltas((prev) => prev.map((d) => turn(d, delta)));

  const rotateRange = (delta) => {
    if (parsedRange.error) {
      setStatus({ tone: "error", text: parsedRange.error });
      return;
    }
    const chosen = new Set(parsedRange.pages);
    setDeltas((prev) => prev.map((d, i) => (chosen.has(i + 1) ? turn(d, delta) : d)));
    setStatus(null);
  };

  const changedCount = deltas.filter((d) => d !== 0).length;

  const save = async () => {
    setBusy(true);
    setStatus(null);
    setProgress({ done: 0, total: 1, label: "Reading the PDF" });

    try {
      const { PDFDocument, degrees } = await loadPdfLib();
      const bytes = await readFileBytes(preview.file);
      const doc = await PDFDocument.load(bytes);
      const pages = doc.getPages();

      setProgress({ done: 0, total: pages.length, label: "Turning pages" });
      await yieldToBrowser();

      pages.forEach((page, i) => {
        const delta = deltas[i] || 0;
        if (!delta) return;
        // The page's own rotation is added to, not replaced. A scan that
        // already arrived at 90 and gets one more turn right ends at 180.
        page.setRotation(degrees(turn(page.getRotation().angle, delta)));
      });

      setProgress({ done: pages.length, total: pages.length, label: "Writing the rotated PDF" });
      await yieldToBrowser();

      const out = await doc.save();
      const name = `${baseName(preview.file.name)}-rotated.pdf`;
      downloadBlob(new Blob([out], { type: "application/pdf" }), name);
      setStatus({
        tone: "success",
        text: `Saved ${name}. ${changedCount} ${plural(changedCount, "page was", "pages were")} turned, and the rotation is written into the file.`,
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
          Rotate PDF
        </h1>
        <p className="text-[15px] sm:text-base text-[#444] leading-relaxed mb-6 max-w-2xl">
          Turn a sideways scan the right way up and keep it that way. The rotation
          is written into the file, not just into your viewer, so it opens
          correctly everywhere. Rotate one page or all of them, by 90, 180 or 270
          degrees. Your file never leaves your browser.
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
            <div className="mt-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`${labelClass} mb-0 mr-1`}>Turn every page</span>
                <button
                  type="button"
                  onClick={() => rotateAll(-90)}
                  disabled={busy}
                  className={`${buttonClass} disabled:opacity-40`}
                >
                  <RotateCcw size={15} strokeWidth={2.75} aria-hidden="true" /> Left 90
                </button>
                <button
                  type="button"
                  onClick={() => rotateAll(90)}
                  disabled={busy}
                  className={`${buttonClass} disabled:opacity-40`}
                >
                  <RotateCw size={15} strokeWidth={2.75} aria-hidden="true" /> Right 90
                </button>
                <button
                  type="button"
                  onClick={() => rotateAll(180)}
                  disabled={busy}
                  className={`${buttonClass} disabled:opacity-40`}
                >
                  Flip 180
                </button>
                <button
                  type="button"
                  onClick={() => setDeltas(new Array(preview.pageCount).fill(0))}
                  disabled={busy || changedCount === 0}
                  className={`${buttonClass} disabled:opacity-40`}
                >
                  Reset
                </button>
              </div>

              {preview.tooManyPages ? (
                <div className="mt-5">
                  <p className="text-xs text-[#111] font-bold border-2 border-black rounded-xl bg-white px-4 py-3 leading-relaxed">
                    This PDF has {preview.pageCount} pages, past the{" "}
                    {THUMBNAIL_PAGE_LIMIT} where drawing a preview of every one costs
                    more time than it saves. Turn every page with the buttons above, or
                    name the pages you want below.
                  </p>
                  <div className="mt-4">
                    <label htmlFor="rotate-range" className={labelClass}>
                      Pages to turn
                    </label>
                    <input
                      id="rotate-range"
                      type="text"
                      inputMode="numeric"
                      value={rangeText}
                      onChange={(e) => setRangeText(e.target.value)}
                      placeholder="1-3, 7, 11-14"
                      disabled={busy}
                      className={inputClass}
                    />
                    <p className={hintClass}>
                      Commas between pages, dashes for ranges.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => rotateRange(-90)}
                        disabled={busy}
                        className={`${buttonClass} disabled:opacity-40`}
                      >
                        <RotateCcw size={15} strokeWidth={2.75} aria-hidden="true" /> Left 90
                      </button>
                      <button
                        type="button"
                        onClick={() => rotateRange(90)}
                        disabled={busy}
                        className={`${buttonClass} disabled:opacity-40`}
                      >
                        <RotateCw size={15} strokeWidth={2.75} aria-hidden="true" /> Right 90
                      </button>
                      <button
                        type="button"
                        onClick={() => rotateRange(180)}
                        disabled={busy}
                        className={`${buttonClass} disabled:opacity-40`}
                      >
                        Flip 180
                      </button>
                    </div>
                  </div>
                </div>
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
                  <PageGrid>
                    {preview.thumbs.map((thumb, i) => (
                      <PageCell
                        key={i}
                        pageNumber={i + 1}
                        thumb={thumb}
                        rotation={deltas[i] || 0}
                        actions={
                          <>
                            <button
                              type="button"
                              onClick={() => rotatePage(i, -90)}
                              disabled={busy}
                              aria-label={`Turn page ${i + 1} left`}
                              className="flex-1 flex items-center justify-center py-1.5 bg-white hover:bg-[#F0D44A] transition-colors disabled:opacity-40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
                            >
                              <RotateCcw size={14} strokeWidth={3} aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => rotatePage(i, 90)}
                              disabled={busy}
                              aria-label={`Turn page ${i + 1} right`}
                              className="flex-1 flex items-center justify-center py-1.5 bg-white border-l-2 border-black hover:bg-[#F0D44A] transition-colors disabled:opacity-40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
                            >
                              <RotateCw size={14} strokeWidth={3} aria-hidden="true" />
                            </button>
                          </>
                        }
                      />
                    ))}
                  </PageGrid>
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={save}
                  disabled={busy || changedCount === 0}
                  className={`${buttonClass} disabled:opacity-40`}
                  style={{ background: busy || changedCount === 0 ? "#FFFFFF" : "#F0D44A" }}
                >
                  <Save size={16} strokeWidth={2.75} aria-hidden="true" />
                  {busy ? "Saving" : "Save rotated PDF"}
                </button>
                <span className="text-xs text-[#666] font-bold" aria-live="polite">
                  {changedCount === 0
                    ? "Nothing turned yet."
                    : `${changedCount} ${plural(changedCount, "page", "pages")} turned.`}
                </span>
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

      <ToolSection title="Why your PDF reader forgets the rotation">
        <p>
          Nearly every PDF reader has a rotate button, and nearly every one of
          them rotates the view rather than the document. Close the file and the
          setting goes with the window. Email it to someone and they get the
          sideways version, because nothing in the file ever changed.
        </p>
        <p>
          A PDF page carries its own rotation value, one of 0, 90, 180 or 270,
          which every reader must obey when it draws the page. This tool changes
          that value and saves the file, so the rotation travels with the document
          into any reader, any printer and any upload form.
        </p>
        <p>
          Nothing is redrawn in the process. Rotation is one number per page, so
          text stays selectable, images are untouched and the saved file is about
          the size it started at.
        </p>
      </ToolSection>

      <ToolSection title="Which way to turn">
        <p>
          If the top of the text points to the left of your screen, turn the page
          right. If it points to the right, turn the page left. Upside down needs
          180 degrees, which is two presses of either button. The preview turns
          with each press, so you can settle it before saving.
        </p>
        <p>
          Turns are added to whatever the page already had. A page that arrived at
          90 degrees and gets one more turn right is saved at 180, not at 90.
          Pages you never touch are written back exactly as they were.
        </p>
        <p>
          Documents from a scanner often mix orientations, with a few pages fed in
          the wrong way round. That is what the per page buttons are for. When the
          whole batch is sideways, one press of the turn every page buttons sorts
          the lot.
        </p>
      </ToolSection>

      <ToolSection title="Frequently asked questions" id="faq">
        <FaqList items={ROTATE_PDF_FAQS} />
      </ToolSection>

      <PdfToolCta
        location="rotate_pdf"
        heading="Readable notes are the easy half"
        body="FORKSAI takes the PDF you have just straightened out and turns it into flashcards, a summary and a revision schedule you can actually keep."
      />

      <PdfToolCrossLinks current="/rotate-pdf" />
    </ToolPageShell>
  );
}
