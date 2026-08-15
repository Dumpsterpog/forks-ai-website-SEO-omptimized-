"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Download } from "lucide-react";
import ToolPageShell, {
  ToolCta,
  ToolSection,
  FormulaBlock,
  FaqList,
  cardClass,
  buttonClass,
} from "@/components/ToolPageShell";
import {
  downloadBlob,
  encodeToSizeBand,
  extensionFor,
  formatSize,
  loadImageFile,
  renderCrop,
  safeFileName,
} from "@/lib/imageTools";
import {
  CheckboxField,
  ImagePicker,
  ImageToolCrossLinks,
  NumberField,
  OutputPreview,
  PrivacyCallout,
  RangeField,
  SelectField,
  StatRow,
} from "@/lib/imageToolsUi";
import { IMAGE_RESIZER_FAQS } from "@/lib/imageToolsFaqs";

const FORMATS = [
  { id: "image/jpeg", label: "JPEG, smallest for photographs", lossy: true },
  { id: "image/png", label: "PNG, lossless, keeps transparency", lossy: false },
  { id: "image/webp", label: "WebP, smaller than both at the same quality", lossy: true },
];

const MAX_PIXELS = 40000000;

const toInt = (value, fallback = 0) => {
  const n = Math.round(Number(value));
  return Number.isFinite(n) ? n : fallback;
};

export default function ImageResizerContent() {
  const [image, setImage] = useState(null);
  const [fileError, setFileError] = useState("");
  const [mode, setMode] = useState("px");
  const [widthPx, setWidthPx] = useState("");
  const [heightPx, setHeightPx] = useState("");
  const [percent, setPercent] = useState(50);
  const [lock, setLock] = useState(true);
  const [format, setFormat] = useState("image/jpeg");
  const [quality, setQuality] = useState(85);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const previewRef = useRef(null);
  const runId = useRef(0);

  const lossy = FORMATS.find((f) => f.id === format)?.lossy ?? true;

  const outW =
    mode === "pct" && image ? Math.max(1, Math.round((image.width * percent) / 100)) : toInt(widthPx);
  const outH =
    mode === "pct" && image ? Math.max(1, Math.round((image.height * percent) / 100)) : toInt(heightPx);

  const specError = useMemo(() => {
    if (!image) return "";
    if (!(outW >= 1 && outW <= 20000)) return "Width has to be between 1 and 20000 pixels.";
    if (!(outH >= 1 && outH <= 20000)) return "Height has to be between 1 and 20000 pixels.";
    if (outW * outH > MAX_PIXELS) {
      return "That is more than 40 megapixels, which is more than a browser canvas can hold reliably. Try a smaller size.";
    }
    return "";
  }, [image, outW, outH]);

  const pickFile = async (file) => {
    setFileError("");
    try {
      const loaded = await loadImageFile(file);
      setImage((old) => {
        if (old && old.release) old.release();
        return loaded;
      });
      setWidthPx(String(loaded.width));
      setHeightPx(String(loaded.height));
      setPercent(50);
      setResult(null);
    } catch {
      setFileError("That file could not be read as an image. Try a JPG, PNG or WebP.");
    }
  };

  const changeWidth = (value) => {
    setWidthPx(value);
    if (lock && image) {
      const w = toInt(value);
      if (w > 0) setHeightPx(String(Math.max(1, Math.round((w * image.height) / image.width))));
    }
  };

  const changeHeight = (value) => {
    setHeightPx(value);
    if (lock && image) {
      const h = toInt(value);
      if (h > 0) setWidthPx(String(Math.max(1, Math.round((h * image.width) / image.height))));
    }
  };

  useEffect(() => {
    const canvas = previewRef.current;
    if (!image || !canvas || specError) return undefined;

    const rect = { x: 0, y: 0, width: image.width, height: image.height };
    renderCrop(image.source, rect, outW, outH, {
      background: format === "image/png" ? null : "#ffffff",
      canvas,
    });

    const id = runId.current + 1;
    runId.current = id;
    setBusy(true);

    const timer = setTimeout(async () => {
      try {
        const encoded = await encodeToSizeBand(canvas, {
          type: format,
          quality: lossy ? quality / 100 : null,
        });
        if (runId.current === id) {
          setResult(encoded);
          setBusy(false);
        }
      } catch {
        if (runId.current === id) {
          setResult(null);
          setBusy(false);
        }
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [image, outW, outH, format, quality, lossy, specError]);

  const savings =
    result && image && image.bytes
      ? Math.round((1 - result.bytes / image.bytes) * 100)
      : null;

  return (
    <ToolPageShell>
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif font-black text-3xl sm:text-[2.6rem] leading-[1.08] text-[#111] mb-3">
          Image resizer
        </h1>
        <p className="text-[15px] sm:text-base text-[#444] leading-relaxed mb-6 max-w-2xl">
          Resize by pixels or by percentage, with the aspect ratio locked or free.
          The preview and the file size update as you type, so there is nothing to
          press before you see the result. It runs on your device, so your picture
          is never uploaded.
        </p>

        <div className={`${cardClass} p-5 sm:p-7`}>
          <ImagePicker
            id="resizer-source"
            label="1. Choose an image"
            onPick={pickFile}
            fileName={image ? image.name : ""}
            error={fileError}
          />

          {image ? (
            <>
              <p className="text-sm text-[#333] mt-3 leading-relaxed">
                Original: <strong>{image.width} x {image.height} px</strong>
                {image.bytes ? `, ${formatSize(image.bytes)}` : ""}.
              </p>

              <fieldset className="mt-6">
                <legend className="block text-sm font-bold text-[#111] mb-2">
                  2. New size
                </legend>

                <div className="flex gap-2 mb-4">
                  {[
                    ["px", "By pixels"],
                    ["pct", "By percentage"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setMode(value)}
                      aria-pressed={mode === value}
                      className={`${buttonClass} flex-1`}
                      style={mode === value ? { background: "#F0D44A" } : undefined}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {mode === "px" ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <NumberField
                        id="resizer-width"
                        label="Width"
                        value={widthPx}
                        onChange={changeWidth}
                        min={1}
                        max={20000}
                        suffix="px"
                      />
                      <NumberField
                        id="resizer-height"
                        label="Height"
                        value={heightPx}
                        onChange={changeHeight}
                        min={1}
                        max={20000}
                        suffix="px"
                      />
                    </div>
                    <CheckboxField
                      id="resizer-lock"
                      label="Keep the aspect ratio"
                      checked={lock}
                      onChange={(next) => {
                        setLock(next);
                        if (next && image) changeWidth(widthPx);
                      }}
                      hint="Unlock this to force both numbers, which stretches the picture."
                    />
                  </div>
                ) : (
                  <RangeField
                    id="resizer-percent"
                    label="Scale"
                    min={1}
                    max={400}
                    step={1}
                    value={percent}
                    readout={`${percent}%`}
                    onChange={setPercent}
                    hint="50% halves each side, which is a quarter of the pixels. Above 100% the picture is enlarged, and enlarging cannot recover detail that was never there."
                  />
                )}

                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <SelectField
                    id="resizer-format"
                    label="Format"
                    value={format}
                    onChange={setFormat}
                  >
                    {FORMATS.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </SelectField>
                  {lossy ? (
                    <RangeField
                      id="resizer-quality"
                      label="Quality"
                      min={10}
                      max={100}
                      step={1}
                      value={quality}
                      readout={`${quality}`}
                      onChange={setQuality}
                      hint="85 is a good default. Below 60 the edges start to show artefacts."
                    />
                  ) : (
                    <p className="text-sm text-[#555] leading-relaxed self-end pb-1">
                      PNG is lossless, so there is no quality setting. Every pixel is kept
                      exactly as drawn.
                    </p>
                  )}
                </div>

                {specError ? (
                  <p
                    role="alert"
                    className="mt-3 border-2 border-black rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#111]"
                  >
                    {specError}
                  </p>
                ) : null}
              </fieldset>

              {!specError ? (
                <div className="mt-6 grid sm:grid-cols-2 gap-4 items-start">
                  <div>
                    <p className="block text-sm font-bold text-[#111] mb-2">3. Result</p>
                    <OutputPreview
                      canvasRef={previewRef}
                      width={outW}
                      height={outH}
                      checkered={format === "image/png"}
                    />
                  </div>

                  <div aria-live="polite" className="space-y-3">
                    {busy || !result ? (
                      <p className="border-2 border-black rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#111]">
                        Encoding at the new size.
                      </p>
                    ) : (
                      <>
                        <p
                          className="border-2 border-black rounded-xl px-4 py-3 text-sm font-bold text-[#111] leading-relaxed"
                          style={{ background: "#F0D44A" }}
                        >
                          {outW} x {outH} px, {formatSize(result.bytes)}
                          {savings !== null && savings > 0
                            ? `, ${savings}% smaller than the original file.`
                            : "."}
                        </p>

                        <div className="border-2 border-black rounded-xl bg-white px-4 py-2">
                          <StatRow label="From" value={`${image.width} x ${image.height} px`} />
                          <StatRow
                            label="To"
                            value={
                              result.headerWidth
                                ? `${result.headerWidth} x ${result.headerHeight} px`
                                : `${outW} x ${outH} px`
                            }
                          />
                          <StatRow
                            label="File size"
                            value={`${formatSize(result.bytes)} (${result.bytes.toLocaleString()} bytes)`}
                          />
                          <StatRow label="Format" value={extensionFor(format).toUpperCase()} />
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            downloadBlob(
                              result.blob,
                              safeFileName(image.name, `${outW}x${outH}`, format)
                            )
                          }
                          className={`${buttonClass} w-full`}
                          style={{ background: "#F0D44A" }}
                        >
                          <Download size={16} strokeWidth={2.75} /> Download
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : null}
            </>
          ) : null}

          <div className="mt-6">
            <PrivacyCallout />
          </div>
        </div>
      </section>

      <ToolSection title="Why a resized image can look ragged, and why this one does not">
        <p>
          Shrinking an image in one step samples the original sparsely. Reducing by
          a factor of four means each output pixel is taken from a small
          neighbourhood while most of the pixels in between are never looked at, so
          fine detail turns into speckle. It is most obvious on text in screenshots
          and on scanned documents.
        </p>
        <p>
          This tool halves the image repeatedly until it is within a factor of two
          of the target, then does the final step:
        </p>
        <FormulaBlock>
          4000 px wide to 300 px: 4000 to 2000 to 1000 to 500 to 300
        </FormulaBlock>
        <p>
          Every pixel contributes to the result at each halving, so detail is
          averaged down instead of dropped. It costs a few milliseconds and it is
          the difference between a readable downscaled screenshot and a noisy one.
        </p>
      </ToolSection>

      <ToolSection title="Pixels, percentage and aspect ratio">
        <p>
          <strong>By pixels</strong> when something else sets the size: an upload
          limit, a template, a print size. Keep the ratio locked and set one number,
          and the other follows.
        </p>
        <p>
          <strong>By percentage</strong> when you just want it smaller. Remember
          that percentage applies to each side, so 50% is a quarter of the pixels
          and roughly a quarter of the file size, not half.
        </p>
        <p>
          <strong>Unlocking the ratio</strong> stretches the picture. It is
          occasionally what you want for a banner or a background, and it is
          obviously wrong on a face, so the lock is on by default.
        </p>
      </ToolSection>

      <ToolSection title="What happens to the metadata">
        <p>
          Redrawing a picture onto a canvas produces a fresh file that contains the
          pixels and nothing else, so EXIF fields such as GPS coordinates, the
          camera model and the capture time are not carried over. If you are
          resizing a photo before posting it publicly, that is a privacy gain worth
          knowing about.
        </p>
        <p>
          One EXIF field is read before it is discarded: the orientation flag. Phone
          cameras store the sensor image and a note about how it should be rotated,
          and a tool that ignores the note turns your portrait photo sideways. This
          one applies the rotation while decoding.
        </p>
      </ToolSection>

      <ToolSection title="Frequently asked questions" id="faq">
        <FaqList items={IMAGE_RESIZER_FAQS} />
      </ToolSection>

      <ToolCta
        location="image_resizer"
        heading="Resizing is admin. Studying is the job."
        body="FORKSAI turns your notes, slides and PDFs into flashcards and spaced repetition sessions, so what you revise actually sticks."
      />

      <ImageToolCrossLinks current="/image-resizer" />
    </ToolPageShell>
  );
}
