"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Download } from "lucide-react";
import ToolPageShell, {
  ToolCta,
  ToolSection,
  FaqList,
  cardClass,
  labelClass,
  buttonClass,
} from "@/components/ToolPageShell";
import {
  FORMATS,
  convertImage,
  baseName,
  extensionFor,
  labelFor,
  downloadBlob,
} from "@/lib/formatToolsImage";
import {
  FormatToolCrossLinks,
  OnDeviceNote,
  FileDropZone,
  formatBytes,
} from "@/lib/formatToolsShell";
import { IMAGE_CONVERTER_FAQS } from "@/lib/formatToolsFaqs";

export default function ImageConverterContent() {
  const [file, setFile] = useState(null);
  const [format, setFormat] = useState("image/jpeg");
  const [quality, setQuality] = useState(92);
  const [background, setBackground] = useState("#ffffff");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const lossy = format !== "image/png";
  const losesTransparency = format === "image/jpeg";

  // Re-converts whenever the file or any setting changes, so there is no
  // Convert button between the choice and the result.
  useEffect(() => {
    if (!file) {
      setResult(null);
      return undefined;
    }
    let cancelled = false;
    let objectUrl = "";
    setBusy(true);
    setError("");

    convertImage(file, { format, quality: quality / 100, background })
      .then(({ blob, width, height }) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setResult({
          blob,
          width,
          height,
          url: objectUrl,
          // A browser without WebP encoding hands back a PNG instead of
          // failing, so the blob type is the only honest answer.
          actualType: blob.type,
        });
      })
      .catch((err) => {
        if (!cancelled) {
          setResult(null);
          setError(err.message || "That image could not be converted.");
        }
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });

    return () => {
      cancelled = true;
      if (objectUrl) setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
    };
  }, [file, format, quality, background]);

  const mismatch = result && result.actualType !== format;
  const outputName = file ? `${baseName(file.name)}.${extensionFor(format)}` : "";
  const delta =
    result && file ? Math.round(((result.blob.size - file.size) / file.size) * 100) : null;

  return (
    <ToolPageShell>
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif font-black text-3xl sm:text-[2.6rem] leading-[1.08] text-[#111] mb-3">
          Image converter
        </h1>
        <p className="text-[15px] sm:text-base text-[#444] leading-relaxed mb-6 max-w-2xl">
          Convert between PNG, JPG and WebP in any direction. Pick a file, pick a
          format, see the new size before you download it. Free, no signup, and
          the image never leaves your browser.
        </p>

        <div className={`${cardClass} p-5 sm:p-7`}>
          <FileDropZone
            id="source-image"
            label="Your image"
            accept="image/*"
            fileName={file ? `${file.name} (${formatBytes(file.size)})` : ""}
            hint="PNG, JPG, WebP, GIF, BMP or anything else your browser can open."
            onFile={(next) => setFile(next)}
          />

          <fieldset className="mt-5">
            <legend className={labelClass}>Convert to</legend>
            <div className="flex flex-wrap gap-2">
              {FORMATS.map((item) => (
                <label
                  key={item.id}
                  className="inline-flex items-center gap-2 border-2 border-black rounded-xl px-4 py-2.5 cursor-pointer text-sm font-bold text-[#111] focus-within:ring-4 focus-within:ring-[#F0D44A]"
                  style={{ background: format === item.id ? "#F0D44A" : "#fff" }}
                >
                  <input
                    type="radio"
                    name="format"
                    value={item.id}
                    checked={format === item.id}
                    onChange={() => setFormat(item.id)}
                    className="sr-only"
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </fieldset>

          {lossy ? (
            <div className="mt-5">
              <label htmlFor="quality" className={labelClass}>
                Quality: {quality}
              </label>
              <input
                id="quality"
                name="quality"
                type="range"
                min={10}
                max={100}
                step={1}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-[#F0D44A] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A] rounded"
              />
              <p className="text-xs text-[#666] mt-1.5">
                Around 80 to 90 is the usual sweet spot. Below 60 the edges of text start
                to smear.
              </p>
            </div>
          ) : (
            <p className="text-xs text-[#666] mt-5">
              PNG is lossless, so there is no quality setting. Transparency is kept.
            </p>
          )}

          {losesTransparency ? (
            <div className="mt-5 border-2 border-black rounded-xl px-4 py-4" style={{ background: "#F0D44A" }}>
              <p className="text-sm font-bold text-[#111] flex items-start gap-2">
                <AlertTriangle size={16} strokeWidth={2.75} className="mt-0.5 shrink-0" aria-hidden="true" />
                JPG has no transparency. Transparent pixels are filled with a solid colour.
              </p>
              <div className="flex items-center gap-3 mt-3">
                <label htmlFor="background" className="text-sm font-bold text-[#111]">
                  Fill colour
                </label>
                <input
                  id="background"
                  name="background"
                  type="color"
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  className="h-10 w-16 border-2 border-black rounded-lg bg-white p-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white"
                />
                <span className="text-xs text-[#111]/70">{background}</span>
              </div>
            </div>
          ) : null}

          {/* aria-live so the new file size is announced as the settings
              change, rather than only being visible. */}
          <div aria-live="polite" className="mt-6">
            {!file ? (
              <p className="border-2 border-black rounded-xl bg-white px-4 py-4 text-sm text-[#555]">
                Choose an image above and the converted version appears here.
              </p>
            ) : error ? (
              <p className="border-2 border-black rounded-xl bg-white px-4 py-4 text-sm font-bold text-[#111]">
                {error}
              </p>
            ) : busy && !result ? (
              <p className="border-2 border-black rounded-xl bg-white px-4 py-4 text-sm text-[#555]">
                Converting.
              </p>
            ) : result ? (
              <div className="border-2 border-black rounded-xl bg-white p-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-[#666] mb-1">
                      Before
                    </p>
                    <p className="font-bold text-[15px] text-[#111]">{formatBytes(file.size)}</p>
                    <p className="text-xs text-[#666] mt-0.5">
                      {file.type || "unknown type"}, {result.width} by {result.height} pixels
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-[#666] mb-1">
                      After
                    </p>
                    <p className="font-bold text-[15px] text-[#111]">
                      {formatBytes(result.blob.size)}{" "}
                      {delta !== null ? (
                        <span className="text-xs text-[#666] font-normal">
                          ({delta > 0 ? "+" : ""}
                          {delta}%)
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs text-[#666] mt-0.5">
                      {labelFor(format)}, {result.width} by {result.height} pixels
                    </p>
                  </div>
                </div>

                {mismatch ? (
                  <p className="text-sm font-bold text-[#111] border-2 border-black rounded-xl px-3 py-2 mt-4">
                    This browser cannot write {labelFor(format)}, so it returned{" "}
                    {result.actualType} instead. Try another format or another browser.
                  </p>
                ) : null}

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result.url}
                  alt="Converted result preview"
                  className="mt-4 w-full h-auto border-2 border-black rounded-xl bg-white"
                  style={{ maxHeight: 420, objectFit: "contain" }}
                />

                <button
                  type="button"
                  onClick={() => downloadBlob(outputName, result.blob)}
                  className={`${buttonClass} mt-4`}
                >
                  <Download size={14} strokeWidth={2.75} /> Download {outputName}
                </button>
              </div>
            ) : null}
          </div>

          <OnDeviceNote>
            The file is decoded and re-encoded by your browser with the canvas API. It is
            never uploaded, so you can convert a passport scan or a contract without
            handing it to a stranger's server.
          </OnDeviceNote>
        </div>
      </section>

      <ToolSection title="Which format to convert to">
        <p>
          <strong>PNG</strong> is lossless and keeps transparency. Use it for
          screenshots, logos, diagrams, and anything with flat colour or text. It
          is the wrong choice for photographs, where it produces files several
          times larger than JPG for no visible gain.
        </p>
        <p>
          <strong>JPG</strong> is lossy and has no alpha channel. Use it for
          photographs and for anywhere that needs the widest possible
          compatibility. Every re-save loses a little more detail, so convert
          from the original rather than from a previous JPG.
        </p>
        <p>
          <strong>WebP</strong> gives photo-grade compression and transparency in
          the same file, usually at a smaller size than either. Every current
          browser reads it. Older desktop software sometimes does not, which is
          the only real reason to avoid it.
        </p>
      </ToolSection>

      <ToolSection title="What happens to transparency">
        <p>
          Converting a PNG or WebP with a transparent background to JPG cannot
          keep that background, because the JPG format has no channel to store
          it in. Every transparent pixel has to become a solid colour.
        </p>
        <p>
          This converter fills it with white by default and lets you pick another
          colour. If the image is a logo destined for a dark page, set the fill
          to that page's colour rather than accepting a white box around it, or
          convert to PNG or WebP and keep the transparency.
        </p>
      </ToolSection>

      <ToolSection title="Why conversions are not reversible">
        <p>
          Converting a JPG to PNG does not restore the detail the JPG discarded.
          It stores the already-damaged image losslessly, usually in a much
          bigger file. The same is true of WebP to PNG.
        </p>
        <p>
          The rule that follows: always convert from the original file. If you
          need several formats, export each one from the original rather than
          chaining conversions.
        </p>
      </ToolSection>

      <ToolSection title="Frequently asked questions" id="faq">
        <FaqList items={IMAGE_CONVERTER_FAQS} />
      </ToolSection>

      <ToolCta
        location="image_converter"
        heading="Converting a file takes a second. Learning the material takes the term."
        body="FORKSAI turns your notes, slides and PDFs into flashcards and study sessions, so the hours you spend revising actually count."
      />

      <FormatToolCrossLinks current="/image-converter" />
    </ToolPageShell>
  );
}
