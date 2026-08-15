"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
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
import { DELETE_PDF_PAGES_FAQS } from "@/lib/pdfToolsFaqs";

export default function DeletePdfPagesContent() {
  const preview = usePdfPreview();
  const [rangeText, setRangeText] = useState("");
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(null);

  // The typed range is the source of truth and the thumbnails edit it, so the
  // two controls always describe the same selection.
  const parsed = useMemo(
    () => parsePageSelection(rangeText, preview.pageCount),
    [rangeText, preview.pageCount]
  );
  const doomed = useMemo(() => new Set(parsed.pages), [parsed.pages]);
  const keeping = preview.pageCount - doomed.size;
  const emptyResult = preview.pageCount > 0 && keeping < 1;

  const openFile = async (files) => {
    setStatus(null);
    setRangeText("");
    await preview.load(files[0]);
  };

  const togglePage = (pageNumber) => {
    const next = new Set(doomed);
    if (next.has(pageNumber)) next.delete(pageNumber);
    else next.add(pageNumber);
    setRangeText(formatPageSelection([...next]));
  };

  const removePages = async () => {
    if (parsed.error) {
      setStatus({ tone: "error", text: parsed.error });
      return;
    }
    if (emptyResult) {
      setStatus({
        tone: "error",
        text: "That would delete every page. A PDF with no pages is not a valid PDF, so at least one has to stay.",
      });
      return;
    }

    setBusy(true);
    setStatus(null);
    setProgress({ done: 0, total: 1, label: "Reading the PDF" });

    try {
      const { PDFDocument } = await loadPdfLib();
      const bytes = await readFileBytes(preview.file);
      const source = await PDFDocument.load(bytes);
      const kept = [];
      for (let n = 1; n <= source.getPageCount(); n += 1) {
        if (!doomed.has(n)) kept.push(n - 1);
      }

      setProgress({ done: 0, total: kept.length, label: "Copying the pages you kept" });
      await yieldToBrowser();

      // Building a new document from the pages that survive, rather than
      // calling removePage in a loop. Removing while iterating is where the
      // off-by-one bugs live, and a fresh document also drops the orphaned
      // objects the deleted pages left behind.
      const out = await PDFDocument.create();
      const copied = await out.copyPages(source, kept);
      for (const page of copied) out.addPage(page);

      setProgress({ done: kept.length, total: kept.length, label: "Writing the new PDF" });
      await yieldToBrowser();

      const saved = await out.save();
      const name = `${baseName(preview.file.name)}-pages-removed.pdf`;
      downloadBlob(new Blob([saved], { type: "application/pdf" }), name);
      setStatus({
        tone: "success",
        text: `Saved ${name}. Removed ${doomed.size} ${plural(doomed.size, "page", "pages")}, kept ${kept.length}. Your original file is untouched.`,
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
          Delete pages from a PDF
        </h1>
        <p className="text-[15px] sm:text-base text-[#444] leading-relaxed mb-6 max-w-2xl">
          Click the pages you want gone and save a PDF without them. Blank scans,
          the cover sheet, the twenty pages of references at the back: pick them
          off the previews and keep the rest. Your original file is never touched
          and never uploaded.
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
              <label htmlFor="delete-range" className={labelClass}>
                Pages to delete
              </label>
              <input
                id="delete-range"
                type="text"
                inputMode="numeric"
                value={rangeText}
                onChange={(e) => setRangeText(e.target.value)}
                placeholder="2, 5-7, 19"
                disabled={busy}
                className={inputClass}
              />
              <p className={hintClass}>
                Commas between pages, dashes for ranges. Clicking a preview below
                types this for you.
              </p>
              <p className="mt-2 text-sm font-bold text-[#111]" aria-live="polite">
                {parsed.error && rangeText
                  ? parsed.error
                  : emptyResult
                    ? "That is every page. At least one has to stay."
                    : `Deleting ${doomed.size} ${plural(doomed.size, "page", "pages")}, keeping ${keeping}.`}
              </p>

              {preview.tooManyPages ? (
                <p className="mt-5 text-xs text-[#111] font-bold border-2 border-black rounded-xl bg-white px-4 py-3 leading-relaxed">
                  This PDF has {preview.pageCount} pages, past the{" "}
                  {THUMBNAIL_PAGE_LIMIT} where drawing a preview of every one costs
                  more time than it saves. Type the page numbers instead.
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
                  <PageGrid>
                    {preview.thumbs.map((thumb, i) => (
                      <PageCell
                        key={i}
                        pageNumber={i + 1}
                        thumb={thumb}
                        selectable
                        selected={doomed.has(i + 1)}
                        onSelect={togglePage}
                        selectHint="Delete"
                      />
                    ))}
                  </PageGrid>
                  <p className="mt-2 text-xs text-[#666]">
                    Highlighted pages are the ones that will go.
                  </p>
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={removePages}
                  disabled={busy || doomed.size === 0 || emptyResult}
                  className={`${buttonClass} disabled:opacity-40`}
                  style={{
                    background: busy || doomed.size === 0 || emptyResult ? "#FFFFFF" : "#F0D44A",
                  }}
                >
                  <Trash2 size={16} strokeWidth={2.75} aria-hidden="true" />
                  {busy
                    ? "Working"
                    : `Delete ${doomed.size || ""} ${plural(doomed.size, "page", "pages")}`}
                </button>
                <button
                  type="button"
                  onClick={() => setRangeText("")}
                  disabled={busy || doomed.size === 0}
                  className={`${buttonClass} disabled:opacity-40`}
                >
                  Clear selection
                </button>
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

      <ToolSection title="How to delete pages from a PDF">
        <p>
          Load the file and the pages appear as previews. Click the ones you want
          gone; they highlight, and the count below the box updates. If you would
          rather type, the box takes page numbers and ranges in the usual form, 2,
          5-7, 19, and the previews follow along.
        </p>
        <p>
          Pressing delete does not edit your file. It builds a new PDF from the
          pages you kept, in their original order, and downloads that. Your
          original is still sitting on disk exactly as it was, so a wrong
          selection costs you nothing but a second go.
        </p>
        <p>
          The tool will not let you delete every page. A PDF with no pages is not
          a valid PDF and most readers refuse to open one, so at least one page
          has to stay.
        </p>
      </ToolSection>

      <ToolSection title="Removing pages is not redacting them">
        <p>
          A deleted page is not copied into the new file, so its content does not
          travel with the document. That is genuine removal, and it is the right
          tool for dropping a cover sheet or a blank scan.
        </p>
        <p>
          It is not redaction. If the thing you want hidden sits on a page you are
          keeping, deleting other pages does nothing for it, and drawing a black
          box over text in most editors leaves the text underneath, selectable by
          anyone who tries. Proper redaction removes the underlying content, and
          this page does not do that.
        </p>
        <p>
          Expect the new file to be smaller, but not always by as much as you
          hoped. Fonts and images are shared between pages in a PDF, so dropping
          half the pages rarely halves the size.
        </p>
      </ToolSection>

      <ToolSection title="Frequently asked questions" id="faq">
        <FaqList items={DELETE_PDF_PAGES_FAQS} />
      </ToolSection>

      <PdfToolCta
        location="delete_pdf_pages"
        heading="Fewer pages is a start. Fewer rereads is the point."
        body="FORKSAI reads what you kept and builds flashcards, summaries and a spaced repetition schedule from it, so you stop rereading and start recalling."
      />

      <PdfToolCrossLinks current="/delete-pdf-pages" />
    </ToolPageShell>
  );
}
