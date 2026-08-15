"use client";

// Shared pieces for the nine file and format tools: the cross-link strip, the
// on-device note, the file picker and a copy button. Lives here rather than in
// each page so the set cannot drift apart.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, Copy, Upload } from "lucide-react";
import { buttonClass } from "@/components/ToolPageShell";
import { FORMAT_TOOLS } from "@/lib/formatToolsMeta";

// Internal linking is what makes the nine pages rank as a set instead of nine
// orphans, so every one of them links to the other eight.
export function FormatToolCrossLinks({ current }) {
  const others = FORMAT_TOOLS.filter((tool) => tool.href !== current);
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10 print:hidden">
      <h2 className="font-serif font-black text-xl text-[#111] mb-4">More free tools</h2>
      <div className="grid sm:grid-cols-2 gap-3">
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
        There are study calculators too, on the{" "}
        <Link href="/tools" className="font-bold text-[#111] underline underline-offset-2">
          free student tools hub
        </Link>
        .
      </p>
    </section>
  );
}

// Every one of these tools runs on the device. Saying so next to the input is
// the whole reason to pick this over a site that uploads your file.
export function OnDeviceNote({ children }) {
  return (
    <p className="text-xs text-[#555] leading-relaxed mt-4 border-2 border-black rounded-xl bg-white px-4 py-3">
      <strong className="text-[#111]">Runs on your device.</strong> {children}
    </p>
  );
}

/**
 * File picker with drag and drop. The visible control is a real input so it
 * stays keyboard reachable, and the drop zone is a label around it.
 */
export function FileDropZone({ id, label, accept, hint, onFile, fileName }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handle = (file) => {
    if (file) onFile(file);
  };

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold text-[#111] mb-2">
        {label}
      </label>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handle(e.dataTransfer.files?.[0]);
        }}
        className="border-2 border-black rounded-xl bg-white px-4 py-6 text-center transition-colors"
        style={{ background: dragging ? "#F0D44A" : "#fff" }}
      >
        <input
          ref={inputRef}
          id={id}
          name={id}
          type="file"
          accept={accept}
          onChange={(e) => handle(e.target.files?.[0])}
          className="block w-full text-sm text-[#333] file:mr-3 file:border-2 file:border-black file:rounded-lg file:bg-white file:px-3 file:py-2 file:text-sm file:font-bold file:text-[#111] file:cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A] rounded-lg"
        />
        <p className="text-xs text-[#666] mt-3 flex items-center justify-center gap-1.5">
          <Upload size={13} strokeWidth={2.5} aria-hidden="true" />
          {fileName ? fileName : "or drag a file onto this box"}
        </p>
      </div>
      {hint ? <p className="text-xs text-[#666] mt-1.5 leading-relaxed">{hint}</p> : null}
    </div>
  );
}

export function CopyButton({ value, label = "Copy", disabled }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
        } catch {
          // Clipboard access can be blocked, in which case the textarea below
          // is still selectable by hand, so there is nothing to recover from.
        }
      }}
      className={`${buttonClass} disabled:opacity-40`}
    >
      {copied ? <Check size={14} strokeWidth={2.75} /> : <Copy size={14} strokeWidth={2.75} />}
      {copied ? "Copied" : label}
    </button>
  );
}

// Human readable byte counts, used by every tool that shows a file size.
export function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
