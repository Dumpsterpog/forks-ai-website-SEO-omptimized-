"use client";

// UI pieces the seven PDF tools share: the file picker, the progress bar, the
// on-device promise, the CTA and the cross-link strip. Styling comes from the
// calculator shell so the PDF pages look like part of the same set: flat
// colour, 2px black borders, hard offset shadows, no gradients.

import { useCallback, useId, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Upload } from "lucide-react";
import { goToDashboard } from "@/lib/goToDashboard";
import { trackSignupClick } from "@/lib/track";
import { ACCENT, cardClass } from "@/components/ToolPageShell";
import {
  PDF_TOOLS,
  formatBytes,
  LARGE_FILE_BYTES,
  THUMBNAIL_PAGE_LIMIT,
  yieldToBrowser,
} from "@/lib/pdfTools";
import {
  closeDocument,
  describePdfError,
  openForReading,
  readFileBytes,
  renderThumbnail,
} from "@/lib/pdfToolsPdf";

export const PDF_ACCEPT = "application/pdf,.pdf";
export const IMAGE_ACCEPT = "image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp";

/**
 * The file picker. A real <input type="file"> with a real <label>, so the
 * keyboard and a screen reader get the native control, with drag and drop
 * layered on top for the mouse.
 */
export function FilePicker({
  label,
  hint,
  accept = PDF_ACCEPT,
  multiple = false,
  onFiles,
  disabled = false,
  buttonText,
}) {
  const inputId = useId();
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (fileList) => {
    const files = [...fileList];
    if (files.length) onFiles(files);
    // Clearing lets the same file be picked twice in a row, which otherwise
    // fires no change event and looks broken.
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={(e) => handleFiles(e.target.files)}
        className="peer sr-only"
      />
      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled) handleFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center text-center gap-2 border-2 border-dashed border-black rounded-2xl px-5 py-8 sm:py-10 cursor-pointer transition-colors peer-focus-visible:outline-none peer-focus-visible:ring-4 peer-focus-visible:ring-[#F0D44A] ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        style={{ background: dragging ? ACCENT : "#FFFFFF" }}
      >
        <Upload size={22} strokeWidth={2.5} aria-hidden="true" />
        <span className="font-bold text-[15px] text-[#111]">{label}</span>
        {hint ? <span className="text-xs text-[#666] leading-relaxed max-w-sm">{hint}</span> : null}
        <span className="mt-1 inline-flex items-center border-2 border-black rounded-xl bg-white px-4 py-2 text-sm font-bold text-[#111] shadow-[3px_3px_0_#111]">
          {buttonText || (multiple ? "Choose files" : "Choose file")}
        </span>
      </label>
    </div>
  );
}

// The claim that nothing is uploaded is the main reason to use these pages over
// a server-based converter, so it is stated on every one of them.
export function OnDeviceNote({ className = "" }) {
  return (
    <p className={`text-xs text-[#555] leading-relaxed ${className}`}>
      <strong className="text-[#111]">Everything runs on your device.</strong> Your
      file is opened by this page in your browser and never uploaded, so nothing is
      sent to FORKSAI or anyone else. Close the tab and it is gone.
    </p>
  );
}

export function ProgressBar({ done, total, label }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-1.5">
        <span className="text-xs font-bold text-[#111]">{label}</span>
        <span className="text-xs font-bold text-[#666]">{pct}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        aria-label={label}
        className="h-3 w-full border-2 border-black rounded-full bg-white overflow-hidden"
      >
        <div className="h-full transition-all duration-200" style={{ width: `${pct}%`, background: ACCENT }} />
      </div>
    </div>
  );
}

// One live region per tool, so a screen reader hears the result and the errors
// without the user hunting for what changed.
export function StatusRegion({ children, tone = "info" }) {
  return (
    <div aria-live="polite" className="min-h-0">
      {children ? (
        <p
          className="border-2 border-black rounded-xl px-4 py-3 text-sm font-bold text-[#111]"
          style={{ background: tone === "error" ? "#FFE3E3" : tone === "success" ? ACCENT : "#FFFFFF" }}
        >
          {children}
        </p>
      ) : null}
    </div>
  );
}

export function FileSizeWarning({ file }) {
  if (!file || file.size <= LARGE_FILE_BYTES) return null;
  return (
    <p className="text-xs text-[#111] font-bold border-2 border-black rounded-xl bg-white px-4 py-3 leading-relaxed">
      This file is {formatBytes(file.size)}. Files this big are held in your tab&apos;s
      memory, so the page may take a while and a phone may run out of room. A desktop
      browser will cope better.
    </p>
  );
}

export function PdfToolCta({ heading, body, location }) {
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-4">
      <div className={`${cardClass} p-6 sm:p-8`} style={{ background: ACCENT }}>
        <h2 className="font-serif font-black text-2xl sm:text-3xl text-[#111] mb-3 leading-tight">{heading}</h2>
        <p className="text-sm sm:text-[15px] text-[#111]/80 leading-relaxed mb-6 max-w-xl">{body}</p>
        <button
          onClick={() => {
            trackSignupClick(location, "signup");
            goToDashboard();
          }}
          className="inline-flex items-center gap-2 border-2 border-black rounded-xl px-5 py-3 text-sm font-black text-[#111] bg-white shadow-[3px_3px_0_#111] transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white"
        >
          Try FORKSAI free <ArrowRight size={16} strokeWidth={2.75} />
        </button>
        <p className="text-xs text-[#111]/60 mt-3">The tool above stays free and needs no account.</p>
      </div>
    </section>
  );
}

const EMPTY = {
  file: null,
  pageCount: 0,
  thumbs: [],
  tooManyPages: false,
  loading: false,
  error: null,
  thumbProgress: null,
};

/**
 * Loads a PDF for the tools that show page previews, and streams the
 * thumbnails in one page at a time. Split, rotate and delete all need exactly
 * this, and all three would otherwise freeze the tab on a long document.
 *
 * Every load carries a run id. A second file picked while the first is still
 * rendering bumps the id, and the older loop sees the mismatch and stops,
 * rather than painting its thumbnails over the new document's.
 */
export function usePdfPreview() {
  const [state, setState] = useState(EMPTY);
  const runId = useRef(0);

  const reset = useCallback(() => {
    runId.current += 1;
    setState(EMPTY);
  }, []);

  const load = useCallback(async (file) => {
    const id = (runId.current += 1);
    setState({ ...EMPTY, file, loading: true });

    let doc = null;
    try {
      const bytes = await readFileBytes(file);
      doc = await openForReading(bytes);
      if (id !== runId.current) return;

      const pageCount = doc.numPages;
      const tooManyPages = pageCount > THUMBNAIL_PAGE_LIMIT;
      setState({
        ...EMPTY,
        file,
        pageCount,
        tooManyPages,
        thumbs: new Array(pageCount).fill(null),
        thumbProgress: tooManyPages ? null : { done: 0, total: pageCount },
      });

      if (!tooManyPages) {
        for (let n = 1; n <= pageCount; n += 1) {
          if (id !== runId.current) return;
          const page = await doc.getPage(n);
          const thumb = await renderThumbnail(page, 150);
          page.cleanup();
          if (id !== runId.current) return;
          setState((prev) => {
            const thumbs = [...prev.thumbs];
            thumbs[n - 1] = thumb;
            return {
              ...prev,
              thumbs,
              thumbProgress: n < pageCount ? { done: n, total: pageCount } : null,
            };
          });
          // Every few pages, let the browser paint and take clicks. Without
          // this the whole render looks like one long freeze.
          if (n % 3 === 0) await yieldToBrowser();
        }
      }
    } catch (error) {
      if (id === runId.current) {
        setState({ ...EMPTY, file, error: describePdfError(error, file.name) });
      }
    } finally {
      await closeDocument(doc);
    }
  }, []);

  return { ...state, load, reset };
}

export function PageGrid({ children }) {
  return (
    <ul className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">{children}</ul>
  );
}

/**
 * One page in a picker grid. Selectable cells use a real checkbox so the
 * keyboard, the space bar and a screen reader all behave the way they do
 * everywhere else, with the thumbnail as its label.
 */
export function PageCell({
  pageNumber,
  thumb,
  rotation = 0,
  selectable = false,
  selected = false,
  onSelect,
  selectHint,
  actions,
}) {
  const id = useId();
  // The preview box is square on purpose. An element rotated about the centre
  // of a square stays inside that square, so a portrait page turned 90 degrees
  // cannot spill over its neighbours in the grid.
  const preview = (
    <span className="relative block mx-auto h-24 w-24 sm:h-28 sm:w-28">
      {thumb ? (
        <img
          src={thumb}
          alt=""
          className="absolute inset-0 h-full w-full object-contain transition-transform duration-200"
          style={{ transform: rotation ? `rotate(${rotation}deg)` : undefined }}
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#999]">
          page {pageNumber}
        </span>
      )}
    </span>
  );

  return (
    <li
      className="border-2 border-black rounded-xl overflow-hidden"
      style={{ background: selected ? ACCENT : "#FFFFFF" }}
    >
      {selectable ? (
        <>
          <input
            id={id}
            type="checkbox"
            checked={selected}
            onChange={() => onSelect(pageNumber)}
            className="peer sr-only"
          />
          <label
            htmlFor={id}
            className="block cursor-pointer p-2 peer-focus-visible:outline-none peer-focus-visible:ring-4 peer-focus-visible:ring-[#F0D44A] peer-focus-visible:rounded-lg"
          >
            <span className="sr-only">
              {selectHint ? `${selectHint} page ${pageNumber}` : `Select page ${pageNumber}`}
            </span>
            {preview}
            <span className="block text-center text-xs font-black text-[#111] mt-1.5" aria-hidden="true">
              {pageNumber}
            </span>
          </label>
        </>
      ) : (
        <div className="p-2">
          {preview}
          <span className="block text-center text-xs font-black text-[#111] mt-1.5">{pageNumber}</span>
        </div>
      )}
      {actions ? <div className="border-t-2 border-black flex">{actions}</div> : null}
    </li>
  );
}

// Seven pages that link to each other rank as a set rather than as seven
// orphans, so every PDF tool carries the other six.
export function PdfToolCrossLinks({ current }) {
  const others = PDF_TOOLS.filter((tool) => tool.href !== current);
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h2 className="font-serif font-black text-xl text-[#111] mb-4">More free PDF tools</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {others.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="block border-2 border-black rounded-xl bg-white p-4 no-underline shadow-[3px_3px_0_#111] transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
          >
            <span className="block font-bold text-sm text-[#111] mb-1.5">{tool.name}</span>
            <span className="block text-xs text-[#666] leading-relaxed">{tool.blurb}</span>
          </Link>
        ))}
      </div>
      <p className="text-sm text-[#555] mt-4">
        Every one of them runs in your browser. See the rest of the{" "}
        <Link href="/tools" className="font-bold text-[#111] underline underline-offset-2">
          free student tools
        </Link>
        .
      </p>
    </section>
  );
}
