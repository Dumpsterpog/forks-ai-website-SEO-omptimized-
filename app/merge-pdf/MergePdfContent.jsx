"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, FileText, GripVertical, Merge, X } from "lucide-react";
import ToolPageShell, {
  ToolSection,
  FaqList,
  cardClass,
  buttonClass,
} from "@/components/ToolPageShell";
import {
  FilePicker,
  OnDeviceNote,
  PdfToolCrossLinks,
  PdfToolCta,
  ProgressBar,
  StatusRegion,
} from "@/lib/pdfToolsShell";
import {
  baseName,
  downloadBlob,
  formatBytes,
  LARGE_FILE_BYTES,
  plural,
  yieldToBrowser,
} from "@/lib/pdfTools";
import { describePdfError, loadPdfLib, readFileBytes } from "@/lib/pdfToolsPdf";
import { MERGE_PDF_FAQS } from "@/lib/pdfToolsFaqs";

let nextId = 0;

export default function MergePdfContent() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(null);
  const dragIndex = useRef(null);

  // Adding a file does not block on reading it. The row appears immediately and
  // its page count fills in when pdf-lib has parsed the header, which keeps a
  // 200MB drop from looking like a frozen page.
  const addFiles = useCallback(async (files) => {
    const pdfs = files.filter(
      (file) => file.type === "application/pdf" || /\.pdf$/i.test(file.name)
    );
    const rejected = files.length - pdfs.length;

    if (!pdfs.length) {
      setStatus({
        tone: "error",
        text: "Those are not PDFs. This tool merges PDF files only. To turn images into a PDF, use the images to PDF tool.",
      });
      return;
    }

    const added = pdfs.map((file) => ({
      id: (nextId += 1),
      file,
      pageCount: null,
      error: null,
    }));
    setItems((prev) => [...prev, ...added]);
    setStatus(
      rejected > 0
        ? {
            tone: "info",
            text: `Added ${pdfs.length} ${plural(pdfs.length, "PDF", "PDFs")}. Skipped ${rejected} ${plural(rejected, "file that is not a PDF", "files that are not PDFs")}.`,
          }
        : null
    );

    const { PDFDocument } = await loadPdfLib();
    for (const item of added) {
      try {
        const bytes = await readFileBytes(item.file);
        const doc = await PDFDocument.load(bytes);
        const pageCount = doc.getPageCount();
        setItems((prev) =>
          prev.map((row) => (row.id === item.id ? { ...row, pageCount } : row))
        );
      } catch (error) {
        const message = describePdfError(error, item.file.name);
        setItems((prev) =>
          prev.map((row) => (row.id === item.id ? { ...row, error: message } : row))
        );
      }
      await yieldToBrowser();
    }
  }, []);

  const move = (from, to) => {
    setItems((prev) => {
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const remove = (id) => setItems((prev) => prev.filter((row) => row.id !== id));

  const usable = items.filter((row) => !row.error);
  const knownPages = usable.reduce((sum, row) => sum + (row.pageCount || 0), 0);
  const stillReading = usable.some((row) => row.pageCount === null);
  const oversized = items.some((row) => row.file.size > LARGE_FILE_BYTES);

  const merge = async () => {
    if (usable.length < 2) {
      setStatus({ tone: "error", text: "Add at least two PDFs to merge." });
      return;
    }
    setBusy(true);
    setStatus(null);
    setProgress({ done: 0, total: usable.length, label: "Reading file 1" });

    try {
      const { PDFDocument } = await loadPdfLib();
      const merged = await PDFDocument.create();
      let copied = 0;

      for (let i = 0; i < usable.length; i += 1) {
        const row = usable[i];
        setProgress({
          done: i,
          total: usable.length,
          label: `Reading file ${i + 1} of ${usable.length}`,
        });
        await yieldToBrowser();

        const bytes = await readFileBytes(row.file);
        const source = await PDFDocument.load(bytes);
        const pages = await merged.copyPages(source, source.getPageIndices());
        for (const page of pages) merged.addPage(page);
        copied += pages.length;
      }

      setProgress({ done: usable.length, total: usable.length, label: "Writing the merged PDF" });
      await yieldToBrowser();

      const out = await merged.save();
      const name = `${baseName(usable[0].file.name)}-merged.pdf`;
      downloadBlob(new Blob([out], { type: "application/pdf" }), name);
      setStatus({
        tone: "success",
        text: `Merged ${usable.length} files into ${name}, ${copied} ${plural(copied, "page", "pages")} in total.`,
      });
    } catch (error) {
      setStatus({ tone: "error", text: describePdfError(error) });
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  // Dropping outside the list would otherwise make the browser navigate to the
  // file, which loses whatever the user had lined up.
  useEffect(() => {
    const block = (e) => e.preventDefault();
    window.addEventListener("dragover", block);
    window.addEventListener("drop", block);
    return () => {
      window.removeEventListener("dragover", block);
      window.removeEventListener("drop", block);
    };
  }, []);

  return (
    <ToolPageShell>
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif font-black text-3xl sm:text-[2.6rem] leading-[1.08] text-[#111] mb-3">
          Merge PDF
        </h1>
        <p className="text-[15px] sm:text-base text-[#444] leading-relaxed mb-6 max-w-2xl">
          Combine as many PDFs as you like into one file. Drag the list into the
          order you want, then save. Your files stay on your computer, so there is
          nothing to upload and nothing to wait for.
        </p>

        <div className={`${cardClass} p-5 sm:p-7`}>
          <FilePicker
            multiple
            label="Drop your PDFs here"
            hint="Or choose them from your computer. Add more at any time."
            onFiles={addFiles}
            disabled={busy}
            buttonText={items.length ? "Add more PDFs" : "Choose PDFs"}
          />

          {items.length > 0 ? (
            <div className="mt-6">
              <div className="flex items-baseline justify-between gap-3 mb-3">
                <h2 className="font-bold text-sm text-[#111]">
                  {items.length} {plural(items.length, "file", "files")}, in this order
                </h2>
                <span className="text-xs text-[#666] font-bold">
                  {stillReading ? "counting pages" : `${knownPages} ${plural(knownPages, "page", "pages")}`}
                </span>
              </div>

              <ol className="space-y-2">
                {items.map((row, index) => (
                  <li
                    key={row.id}
                    draggable={!busy}
                    onDragStart={() => {
                      dragIndex.current = index;
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (dragIndex.current !== null && dragIndex.current !== index) {
                        move(dragIndex.current, index);
                      }
                      dragIndex.current = null;
                    }}
                    className="flex items-center gap-2 sm:gap-3 border-2 border-black rounded-xl bg-white px-3 py-2.5"
                  >
                    <GripVertical
                      size={16}
                      strokeWidth={2.5}
                      aria-hidden="true"
                      className="shrink-0 text-[#999] cursor-grab hidden sm:block"
                    />
                    <span className="shrink-0 w-6 text-center text-xs font-black text-[#666]">
                      {index + 1}
                    </span>
                    <FileText size={16} strokeWidth={2.5} aria-hidden="true" className="shrink-0 hidden sm:block" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-[#111] truncate">{row.file.name}</p>
                      <p className="text-xs text-[#666]">
                        {row.error
                          ? row.error
                          : `${formatBytes(row.file.size)}${
                              row.pageCount === null
                                ? ""
                                : `, ${row.pageCount} ${plural(row.pageCount, "page", "pages")}`
                            }`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => move(index, index - 1)}
                        disabled={index === 0 || busy}
                        aria-label={`Move ${row.file.name} up`}
                        className="p-1.5 border-2 border-black rounded-lg bg-white disabled:opacity-30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
                      >
                        <ArrowUp size={14} strokeWidth={3} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(index, index + 1)}
                        disabled={index === items.length - 1 || busy}
                        aria-label={`Move ${row.file.name} down`}
                        className="p-1.5 border-2 border-black rounded-lg bg-white disabled:opacity-30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
                      >
                        <ArrowDown size={14} strokeWidth={3} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(row.id)}
                        disabled={busy}
                        aria-label={`Remove ${row.file.name}`}
                        className="p-1.5 border-2 border-black rounded-lg bg-white disabled:opacity-30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
                      >
                        <X size={14} strokeWidth={3} aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                ))}
              </ol>

              {oversized ? (
                <p className="mt-3 text-xs text-[#111] font-bold border-2 border-black rounded-xl bg-white px-4 py-3 leading-relaxed">
                  One of these files is over {formatBytes(LARGE_FILE_BYTES)}. Every file
                  has to be held in this tab at once while merging, so a large batch can
                  run a desktop browser out of memory and will almost certainly beat a
                  phone. Merge in smaller groups if the page stops responding.
                </p>
              ) : null}

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={merge}
                  disabled={busy || usable.length < 2}
                  className={`${buttonClass} disabled:opacity-40`}
                  style={{ background: busy || usable.length < 2 ? "#FFFFFF" : "#F0D44A" }}
                >
                  <Merge size={16} strokeWidth={2.75} aria-hidden="true" />
                  {busy ? "Merging" : `Merge ${usable.length} ${plural(usable.length, "PDF", "PDFs")}`}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setItems([]);
                    setStatus(null);
                  }}
                  disabled={busy}
                  className={`${buttonClass} disabled:opacity-40`}
                >
                  Clear list
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

      <ToolSection title="How to merge PDFs in your browser">
        <p>
          Merging is the simplest PDF operation there is, and it is also the one
          most likely to be done on a website that wants your email address
          first. It does not need a server. A browser can open a PDF, copy its
          pages into a new document and hand the result back, and that is exactly
          what this page does.
        </p>
        <p>
          The order of the list is the order of the pages. Drag a row with the
          mouse, or use the up and down buttons, which work with the keyboard and
          on a phone. Add more files at any point; new ones join the bottom of the
          list.
        </p>
        <p>
          Pages are copied whole. Text stays selectable, images keep their
          resolution and page sizes are preserved, so a landscape scan sitting in
          the middle of a portrait report comes out landscape. Nothing is
          re-encoded, which is why the merged file is roughly the sum of the
          originals rather than smaller.
        </p>
      </ToolSection>

      <ToolSection title="What merging does not carry across">
        <p>
          A PDF holds two kinds of thing: content that belongs to a page, and
          settings that belong to the document. Page content survives the merge
          intact. Document level settings do not, because there is no sensible way
          to combine several documents&apos; worth of them into one.
        </p>
        <p>
          In practice that means the bookmark outline, filled in form field data
          and the document&apos;s own table of contents are not carried over.
          Links that point to a web address still work. Links that jump to a page
          inside the original document may point nowhere, since that page now sits
          at a different number.
        </p>
        <p>
          If your files run into hundreds of megabytes, merge them in groups of
          two or three and then merge the results. Everything is held in your
          tab&apos;s memory at once, so a browser tab is the constraint, not the
          tool.
        </p>
      </ToolSection>

      <ToolSection title="Frequently asked questions" id="faq">
        <FaqList items={MERGE_PDF_FAQS} />
      </ToolSection>

      <PdfToolCta
        location="merge_pdf"
        heading="One PDF is easier to merge than it is to learn"
        body="FORKSAI turns lecture slides, textbook chapters and your own notes into flashcards and study sessions, so the reading you have just tidied up actually goes in."
      />

      <PdfToolCrossLinks current="/merge-pdf" />
    </ToolPageShell>
  );
}
