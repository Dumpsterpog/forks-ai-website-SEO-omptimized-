"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Images, Square } from "lucide-react";
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
  parsePageSelection,
  plural,
  yieldToBrowser,
} from "@/lib/pdfTools";
import {
  canvasToBlob,
  closeDocument,
  describePdfError,
  openForReading,
  readFileBytes,
  renderPageToCanvas,
} from "@/lib/pdfToolsPdf";
import { createZip, zipPayloadBytes, ZIP_MAX_BYTES } from "@/lib/pdfToolsZip";
import { PDF_TO_IMAGES_FAQS } from "@/lib/pdfToolsFaqs";

const SCALES = [
  { value: 1, label: "1x", note: "72 ppi, for the screen" },
  { value: 2, label: "2x", note: "144 ppi, a good default" },
  { value: 3, label: "3x", note: "216 ppi" },
  { value: 4, label: "4x", note: "288 ppi, near print quality" },
];

// Rough budget in pages at scale 1. Doubling the scale quadruples the pixels,
// so 100 pages at 2x and 25 pages at 4x weigh the same. Past this the finished
// images alone can run into hundreds of megabytes held in the tab, so the page
// warns before it starts rather than after the tab dies.
const RENDER_BUDGET = 400;

export default function PdfToImagesContent() {
  const preview = usePdfPreview({ thumbnails: false });
  const [format, setFormat] = useState("image/png");
  const [scale, setScale] = useState(2);
  const [rangeText, setRangeText] = useState("");
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(null);
  const cancelled = useRef(false);

  const parsed = useMemo(
    () => parsePageSelection(rangeText || `1-${preview.pageCount || 1}`, preview.pageCount),
    [rangeText, preview.pageCount]
  );

  // Object URLs outlive a render, so they have to be released by hand. Only at
  // the two points where results are thrown away, and on unmount: revoking on
  // every change would kill the URLs of the images still on screen, because a
  // growing result list keeps the same objects.
  const resultsRef = useRef([]);
  const clearResults = () => {
    resultsRef.current.forEach((item) => URL.revokeObjectURL(item.url));
    resultsRef.current = [];
    setResults([]);
  };
  const publishResults = (list) => {
    resultsRef.current = list;
    setResults(list);
  };
  useEffect(
    () => () => resultsRef.current.forEach((item) => URL.revokeObjectURL(item.url)),
    []
  );

  const openFile = async (files) => {
    setStatus(null);
    setRangeText("");
    clearResults();
    await preview.load(files[0]);
  };

  const heavy = parsed.pages.length * scale * scale > RENDER_BUDGET;

  const convert = async () => {
    if (parsed.error) {
      setStatus({ tone: "error", text: parsed.error });
      return;
    }
    setBusy(true);
    setStatus(null);
    cancelled.current = false;
    clearResults();

    const extension = format === "image/png" ? "png" : "jpg";
    const quality = format === "image/jpeg" ? 0.92 : undefined;
    const stem = baseName(preview.file.name);
    const width = String(preview.pageCount).length;
    const made = [];
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
          label: `Rendering page ${pageNumber}`,
        });
        await yieldToBrowser();

        const page = await doc.getPage(pageNumber);
        const canvas = await renderPageToCanvas(page, scale);
        const blob = await canvasToBlob(canvas, format, quality);
        made.push({
          pageNumber,
          blob,
          url: URL.createObjectURL(blob),
          width: canvas.width,
          height: canvas.height,
          name: `${stem}-page-${String(pageNumber).padStart(width, "0")}.${extension}`,
        });
        // Shrinking the canvas to nothing is what actually frees the bitmap.
        // Dropping the reference alone leaves it to the garbage collector,
        // which on a long document arrives far too late.
        canvas.width = 0;
        canvas.height = 0;
        page.cleanup();
        publishResults([...made]);
      }

      setProgress(null);
      const total = made.reduce((sum, item) => sum + item.blob.size, 0);
      setStatus({
        tone: "success",
        text: cancelled.current
          ? `Stopped after ${made.length} of ${parsed.pages.length} ${plural(parsed.pages.length, "page", "pages")}. The images already made are below.`
          : `Rendered ${made.length} ${plural(made.length, "image", "images")}, ${formatBytes(total)} in total.`,
      });
    } catch (error) {
      setStatus({ tone: "error", text: describePdfError(error, preview.file?.name) });
    } finally {
      await closeDocument(doc);
      setBusy(false);
      setProgress(null);
    }
  };

  const downloadAll = async () => {
    setBusy(true);
    try {
      const entries = [];
      for (const item of results) {
        entries.push({ name: item.name, data: new Uint8Array(await item.blob.arrayBuffer()) });
      }
      if (zipPayloadBytes(entries) > ZIP_MAX_BYTES) {
        setStatus({
          tone: "error",
          text: "These images add up to more than 4GB, which is past what a plain zip can hold. Convert fewer pages, or at a smaller scale.",
        });
        return;
      }
      const zip = createZip(entries);
      downloadBlob(zip, `${baseName(preview.file.name)}-images.zip`);
      setStatus({
        tone: "success",
        text: `Saved a zip with ${entries.length} ${plural(entries.length, "image", "images")}, ${formatBytes(zip.size)}.`,
      });
    } finally {
      setBusy(false);
    }
  };

  const ready = preview.pageCount > 0 && !preview.error;

  return (
    <ToolPageShell>
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif font-black text-3xl sm:text-[2.6rem] leading-[1.08] text-[#111] mb-3">
          PDF to images
        </h1>
        <p className="text-[15px] sm:text-base text-[#444] leading-relaxed mb-6 max-w-2xl">
          Turn PDF pages into PNG or JPG files at the size you choose. Useful for
          dropping a diagram into slides, sending one page to someone who will not
          open a PDF, or getting a figure out of a paper. Your file is rendered by
          your own browser and never uploaded.
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
              <fieldset>
                <legend className={labelClass}>Image format</legend>
                <div className="flex flex-wrap gap-2">
                  {[
                    ["image/png", "PNG", "Lossless. Best for text and diagrams."],
                    ["image/jpeg", "JPG", "Smaller. Best for photographic pages."],
                  ].map(([value, label, note]) => (
                    <label
                      key={value}
                      className="flex-1 min-w-[9rem] border-2 border-black rounded-xl px-3 py-2.5 cursor-pointer has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-[#F0D44A]"
                      style={{ background: format === value ? "#F0D44A" : "#FFFFFF" }}
                    >
                      <input
                        type="radio"
                        name="image-format"
                        value={value}
                        checked={format === value}
                        onChange={() => setFormat(value)}
                        disabled={busy}
                        className="sr-only"
                      />
                      <span className="block text-sm font-black text-[#111]">{label}</span>
                      <span className="block text-xs text-[#111]/70 leading-snug mt-0.5">{note}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className={labelClass}>Size</legend>
                <div className="flex flex-wrap gap-2">
                  {SCALES.map((option) => (
                    <label
                      key={option.value}
                      className="border-2 border-black rounded-xl px-3 py-2 cursor-pointer has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-[#F0D44A]"
                      style={{ background: scale === option.value ? "#F0D44A" : "#FFFFFF" }}
                    >
                      <input
                        type="radio"
                        name="image-scale"
                        value={option.value}
                        checked={scale === option.value}
                        onChange={() => setScale(option.value)}
                        disabled={busy}
                        className="sr-only"
                      />
                      <span className="block text-sm font-black text-[#111]">{option.label}</span>
                      <span className="block text-xs text-[#111]/70">{option.note}</span>
                    </label>
                  ))}
                </div>
                <p className={hintClass}>
                  A PDF page has a physical size, not a pixel one. Scale 1 draws it at
                  72 pixels per inch, so an A4 page comes out 595 by 842 pixels.
                </p>
              </fieldset>

              <div>
                <label htmlFor="image-range" className={labelClass}>
                  Pages to convert
                </label>
                <input
                  id="image-range"
                  type="text"
                  inputMode="numeric"
                  value={rangeText}
                  onChange={(e) => setRangeText(e.target.value)}
                  placeholder={`Leave empty for all ${preview.pageCount}`}
                  disabled={busy}
                  className={inputClass}
                />
                <p className={hintClass}>
                  Commas between pages, dashes for ranges, for example 1-3, 7.
                </p>
                <p className="mt-2 text-sm font-bold text-[#111]">
                  {parsed.error
                    ? parsed.error
                    : `${parsed.pages.length} ${plural(parsed.pages.length, "page", "pages")} to render.`}
                </p>
              </div>

              {heavy ? (
                <p className="text-xs text-[#111] font-bold border-2 border-black rounded-xl bg-white px-4 py-3 leading-relaxed">
                  That is a lot of pixels. Every page is held as a bitmap while it is
                  encoded, so a long document at 3x or 4x can exhaust a phone and slow
                  a laptop right down. Try 2x first, or convert in smaller batches. You
                  can stop partway and keep what is done.
                </p>
              ) : null}

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={convert}
                  disabled={busy || Boolean(parsed.error)}
                  className={`${buttonClass} disabled:opacity-40`}
                  style={{ background: busy || parsed.error ? "#FFFFFF" : "#F0D44A" }}
                >
                  <Images size={16} strokeWidth={2.75} aria-hidden="true" />
                  {busy ? "Rendering" : "Convert to images"}
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
                {results.length > 1 ? (
                  <button type="button" onClick={downloadAll} disabled={busy} className={`${buttonClass} disabled:opacity-40`}>
                    <Download size={16} strokeWidth={2.75} aria-hidden="true" /> Download all as zip
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

          {results.length ? (
            <ul className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {results.map((item) => (
                <li key={item.pageNumber} className="border-2 border-black rounded-xl bg-white overflow-hidden">
                  <span className="flex h-28 items-center justify-center p-2">
                    <img src={item.url} alt={`Page ${item.pageNumber}`} className="max-h-full max-w-full object-contain" />
                  </span>
                  <span className="block border-t-2 border-black px-2 py-1.5">
                    <span className="block text-xs font-black text-[#111]">Page {item.pageNumber}</span>
                    <span className="block text-[11px] text-[#666]">
                      {item.width} x {item.height}, {formatBytes(item.blob.size)}
                    </span>
                    <button
                      type="button"
                      onClick={() => downloadBlob(item.blob, item.name)}
                      className="mt-1.5 w-full border-2 border-black rounded-lg bg-white px-2 py-1 text-xs font-bold text-[#111] hover:bg-[#F0D44A] transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
                    >
                      Save
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          <OnDeviceNote className="mt-5" />
        </div>
      </section>

      <ToolSection title="Choosing a format and a size">
        <p>
          <strong>PNG or JPG.</strong> PNG is lossless, so text edges and thin
          diagram lines stay crisp. JPG throws away detail your eye is unlikely to
          miss on a photograph and comes out far smaller. A page of text as a PNG
          is usually several times the size of the same page as a JPG, and the PNG
          is usually the one worth having.
        </p>
        <p>
          <strong>What scale means.</strong> A PDF page is measured in points, not
          pixels, so a renderer has to be told how many pixels to use. Scale 1
          means 72 pixels per inch, which turns an A4 page into roughly 595 by 842
          pixels. Scale 2 doubles both dimensions and quadruples the pixel count.
          Scale 4 gets close to the 300 pixels per inch that print work asks for.
        </p>
        <p>
          Higher is not automatically better. Four times the scale is sixteen
          times the memory, and a page that only ever appears in a slide deck
          gains nothing from it.
        </p>
      </ToolSection>

      <ToolSection title="Long documents and slow machines">
        <p>
          Rendering is real work, done by your own processor, one page at a time.
          Nothing is queued on a server, which is why nothing is uploaded, and
          also why a 400 page document at 4x will take a while.
        </p>
        <p>
          The progress bar shows which page it is on, and the stop button ends the
          run while keeping every image already made. If the tab feels heavy, drop
          the scale to 2x or convert a page range at a time. Phones have far less
          room to work in than laptops, and it is the pixel count rather than the
          file size that decides.
        </p>
      </ToolSection>

      <ToolSection title="Frequently asked questions" id="faq">
        <FaqList items={PDF_TO_IMAGES_FAQS} />
      </ToolSection>

      <PdfToolCta
        location="pdf_to_images"
        heading="A picture of a page is still a page to reread"
        body="FORKSAI turns the PDF behind those images into flashcards and a revision schedule, so the diagram you just exported is one you can actually recall."
      />

      <PdfToolCrossLinks current="/pdf-to-images" />
    </ToolPageShell>
  );
}
