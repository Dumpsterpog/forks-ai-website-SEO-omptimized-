"use client";

// UI pieces the seven PDF tools share: the file picker, the progress bar, the
// on-device promise, the CTA and the cross-link strip. Styling comes from the
// calculator shell so the PDF pages look like part of the same set: flat
// colour, 2px black borders, hard offset shadows, no gradients.

import { useId, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Upload } from "lucide-react";
import { goToDashboard } from "@/lib/goToDashboard";
import { trackSignupClick } from "@/lib/track";
import { ACCENT, cardClass } from "@/components/ToolPageShell";
import { PDF_TOOLS, formatBytes, LARGE_FILE_BYTES } from "@/lib/pdfTools";

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
