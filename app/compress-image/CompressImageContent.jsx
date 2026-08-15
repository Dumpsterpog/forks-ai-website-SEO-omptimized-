"use client";

import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import ToolPageShell, {
  ToolCta,
  ToolSection,
  FaqList,
  cardClass,
  inputClass,
  labelClass,
  buttonClass,
} from "@/components/ToolPageShell";
import {
  compressToTarget,
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
import { COMPRESS_IMAGE_FAQS } from "@/lib/formatToolsFaqs";

const PRESETS = [
  { label: "100 KB", kb: 100 },
  { label: "200 KB", kb: 200 },
  { label: "500 KB", kb: 500 },
  { label: "1 MB", kb: 1024 },
  { label: "2 MB", kb: 2048 },
];

const OUTPUTS = [
  { id: "image/jpeg", label: "JPG" },
  { id: "image/webp", label: "WebP" },
  { id: "image/png", label: "PNG" },
];

export default function CompressImageContent() {
  const [file, setFile] = useState(null);
  const [targetKb, setTargetKb] = useState("100");
  const [format, setFormat] = useState("image/jpeg");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [originalUrl, setOriginalUrl] = useState("");

  const targetBytes = useMemo(() => {
    const kb = Number(targetKb);
    return Number.isFinite(kb) && kb > 0 ? Math.round(kb * 1024) : 0;
  }, [targetKb]);

  useEffect(() => {
    if (!file) {
      setOriginalUrl("");
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setOriginalUrl(url);
    return () => setTimeout(() => URL.revokeObjectURL(url), 0);
  }, [file]);

  // Debounced so typing a target size does not kick off a dozen compression
  // runs, one per keystroke.
  useEffect(() => {
    if (!file || !targetBytes) {
      setResult(null);
      return undefined;
    }
    let cancelled = false;
    let objectUrl = "";
    setBusy(true);
    setError("");

    const timer = setTimeout(() => {
      compressToTarget(file, { targetBytes, format })
        .then((outcome) => {
          if (cancelled || !outcome?.blob) return;
          objectUrl = URL.createObjectURL(outcome.blob);
          setResult({ ...outcome, url: objectUrl });
        })
        .catch((err) => {
          if (!cancelled) {
            setResult(null);
            setError(err.message || "That image could not be compressed.");
          }
        })
        .finally(() => {
          if (!cancelled) setBusy(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (objectUrl) setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
    };
  }, [file, targetBytes, format]);

  const outputName = file ? `${baseName(file.name)}-compressed.${extensionFor(format)}` : "";
  const saved =
    result && file ? Math.round(((file.size - result.blob.size) / file.size) * 100) : null;

  return (
    <ToolPageShell>
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif font-black text-3xl sm:text-[2.6rem] leading-[1.08] text-[#111] mb-3">
          Compress an image to a target size
        </h1>
        <p className="text-[15px] sm:text-base text-[#444] leading-relaxed mb-6 max-w-2xl">
          Say how small the file has to be, for example under 100 KB for an exam
          form, and the compressor works down to it: quality first, dimensions
          only if it has to. You see the size it reached and the image it reached
          it with. Free, no signup, nothing uploaded.
        </p>

        <div className={`${cardClass} p-5 sm:p-7`}>
          <FileDropZone
            id="source-image"
            label="Your image"
            accept="image/*"
            fileName={file ? `${file.name} (${formatBytes(file.size)})` : ""}
            hint="A photo, a scan or a screenshot. Larger files simply take a moment longer."
            onFile={(next) => setFile(next)}
          />

          <div className="grid sm:grid-cols-2 gap-4 mt-5">
            <div>
              <label htmlFor="target" className={labelClass}>
                Target size
              </label>
              <div className="relative">
                <input
                  id="target"
                  name="target"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  step={10}
                  value={targetKb}
                  onChange={(e) => setTargetKb(e.target.value)}
                  className={`${inputClass} pr-14`}
                />
                <span
                  aria-hidden="true"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#666]"
                >
                  KB
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.kb}
                    type="button"
                    onClick={() => setTargetKb(String(preset.kb))}
                    className="border-2 border-black rounded-lg px-2.5 py-1 text-xs font-bold text-[#111] bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
                    style={{ background: Number(targetKb) === preset.kb ? "#F0D44A" : "#fff" }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <fieldset>
              <legend className={labelClass}>Output format</legend>
              <div className="flex flex-wrap gap-2">
                {OUTPUTS.map((item) => (
                  <label
                    key={item.id}
                    className="inline-flex items-center gap-2 border-2 border-black rounded-xl px-4 py-2.5 cursor-pointer text-sm font-bold text-[#111] focus-within:ring-4 focus-within:ring-[#F0D44A]"
                    style={{ background: format === item.id ? "#F0D44A" : "#fff" }}
                  >
                    <input
                      type="radio"
                      name="output"
                      value={item.id}
                      checked={format === item.id}
                      onChange={() => setFormat(item.id)}
                      className="sr-only"
                    />
                    {item.label}
                  </label>
                ))}
              </div>
              <p className="text-xs text-[#666] mt-2 leading-relaxed">
                {format === "image/png"
                  ? "PNG is lossless, so quality cannot be traded away. Hitting a target means shrinking the dimensions."
                  : "Quality is lowered first, which keeps the pixel dimensions. Downscaling only starts if quality alone is not enough."}
              </p>
            </fieldset>
          </div>

          {/* aria-live so the size it landed on is announced, not just shown. */}
          <div aria-live="polite" className="mt-6">
            {!file ? (
              <p className="border-2 border-black rounded-xl bg-white px-4 py-4 text-sm text-[#555]">
                Choose an image above and the compressed version appears here.
              </p>
            ) : error ? (
              <p className="border-2 border-black rounded-xl bg-white px-4 py-4 text-sm font-bold text-[#111]">
                {error}
              </p>
            ) : busy && !result ? (
              <p className="border-2 border-black rounded-xl bg-white px-4 py-4 text-sm text-[#555]">
                Compressing.
              </p>
            ) : result ? (
              <>
                <div
                  className="border-2 border-black rounded-xl px-4 py-4"
                  style={{ background: result.ok ? "#F0D44A" : "#fff" }}
                >
                  <p className="text-[11px] font-black uppercase tracking-widest text-[#111]/60 mb-1">
                    {result.ok ? "Landed under your target" : "Could not reach your target"}
                  </p>
                  <p className="font-serif font-black text-2xl sm:text-3xl text-[#111] leading-tight">
                    {formatBytes(file.size)} to {formatBytes(result.blob.size)}
                  </p>
                  <p className="text-sm text-[#111]/75 mt-1.5 leading-relaxed">
                    {result.ok
                      ? `Target was ${formatBytes(targetBytes)} and the result is ${formatBytes(
                          result.blob.size
                        )}, which is ${saved}% smaller than the original.`
                      : `The smallest usable version came out at ${formatBytes(
                          result.blob.size
                        )}, still above your ${formatBytes(
                          targetBytes
                        )} target. Try WebP, or raise the target.`}{" "}
                    {result.quality !== null && result.quality !== undefined
                      ? `Quality ${Math.round(result.quality * 100)}.`
                      : ""}{" "}
                    {result.scale < 1
                      ? `Scaled to ${Math.round(result.scale * 100)}% of the original width, now ${
                          result.width
                        } by ${result.height} pixels.`
                      : `Dimensions unchanged at ${result.width} by ${result.height} pixels.`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => downloadBlob(outputName, result.blob)}
                  className={`${buttonClass} mt-3`}
                >
                  <Download size={14} strokeWidth={2.75} /> Download {labelFor(format)}
                </button>

                {/* Both images at the same size, so the quality you traded away
                    is visible rather than described. */}
                <div className="grid sm:grid-cols-2 gap-3 mt-5">
                  <figure className="border-2 border-black rounded-xl bg-white p-3">
                    <figcaption className="text-[11px] font-black uppercase tracking-widest text-[#666] mb-2">
                      Original, {formatBytes(file.size)}
                    </figcaption>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={originalUrl}
                      alt="The original image before compression"
                      className="w-full h-auto rounded-lg"
                      style={{ maxHeight: 320, objectFit: "contain" }}
                    />
                  </figure>
                  <figure className="border-2 border-black rounded-xl bg-white p-3">
                    <figcaption className="text-[11px] font-black uppercase tracking-widest text-[#666] mb-2">
                      Compressed, {formatBytes(result.blob.size)}
                    </figcaption>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={result.url}
                      alt="The same image after compression, for comparison"
                      className="w-full h-auto rounded-lg"
                      style={{ maxHeight: 320, objectFit: "contain" }}
                    />
                  </figure>
                </div>
                <p className="text-xs text-[#666] mt-2">
                  Open both at full size before you commit to the result. Text and sharp
                  edges are where compression shows first.
                </p>
              </>
            ) : null}
          </div>

          <OnDeviceNote>
            The compression loop runs in this tab, re-encoding the image over and over
            until it fits. Your photo, ID scan or exam form is never uploaded.
          </OnDeviceNote>
        </div>
      </section>

      <ToolSection title="How the target size is reached">
        <p>
          A quality slider does not answer the question people actually have,
          which is whether the file is under the limit a form will accept. This
          tool works backwards from that limit instead.
        </p>
        <p>
          It re-encodes the image at a quality level, measures the bytes that
          came out, and bisects: too big means try lower, small enough means try
          a little higher to keep as much quality as the target allows. Seven
          passes gets within about one percent of the best quality that fits.
        </p>
        <p>
          Only when the lowest usable quality still misses does it start scaling
          the image down, in steps, retrying the quality search at each one. That
          order is deliberate. Somebody who needs a photo under 100 KB wants the
          same photo smaller, not a thumbnail.
        </p>
      </ToolSection>

      <ToolSection title="Picking a target that is actually achievable">
        <p>
          Every image has a floor. A 12 megapixel photo will not become a
          readable 20 KB JPG, no matter how the compressor is asked. When the
          floor is above your target, this tool says so and hands you the
          smallest version it managed, with the size it reached, rather than
          pretending it succeeded.
        </p>
        <p>
          Two things usually fix it. Switch the output to WebP, which is
          typically smaller than JPG at the same visual quality. Or accept a
          smaller pixel size, since an image being uploaded to a form rarely
          needs to stay at full camera resolution.
        </p>
      </ToolSection>

      <ToolSection title="Common size limits">
        <p>
          Exam and government portals in particular are strict, and the limits
          are usually written in the form's own instructions: photographs often
          have to fit in 20 to 100 KB, signatures in 10 to 20 KB, and supporting
          documents in 200 KB to 2 MB. Read the limit off your form and type it
          in rather than guessing.
        </p>
        <p>
          For the web, the useful rule is different: aim for the smallest file
          that still looks right at the size it is displayed. A hero image at 200
          KB and a thumbnail at 20 KB is a reasonable place to start.
        </p>
      </ToolSection>

      <ToolSection title="Frequently asked questions" id="faq">
        <FaqList items={COMPRESS_IMAGE_FAQS} />
      </ToolSection>

      <ToolCta
        location="compress_image"
        heading="Squeezing a file is quick. Getting through the syllabus is not."
        body="FORKSAI turns your notes, slides and PDFs into flashcards and study sessions, so revision takes fewer hours and holds longer."
      />

      <FormatToolCrossLinks current="/compress-image" />
    </ToolPageShell>
  );
}
