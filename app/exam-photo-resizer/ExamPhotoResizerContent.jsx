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
  DEFAULT_CROP_VIEW,
  KB,
  cropRect,
  downloadBlob,
  encodeToSizeBand,
  formatSize,
  loadImageFile,
  renderCrop,
  safeFileName,
  whitenBackground,
} from "@/lib/imageTools";
import {
  CheckboxField,
  CropStage,
  ImagePicker,
  ImageToolCrossLinks,
  NumberField,
  OutputPreview,
  PrivacyCallout,
  SelectField,
  StatRow,
} from "@/lib/imageToolsUi";
import { EXAM_PHOTO_FAQS } from "@/lib/imageToolsFaqs";

// Only combinations that appear on most Indian application forms, described as
// common requirements. No exam board is named next to a number we cannot
// verify, and every field stays editable so your own form always wins.
const PRESETS = [
  {
    id: "photo-200x230",
    mode: "photo",
    label: "Photo, 200 x 230 px, 20 to 50 KB (common)",
    width: 200,
    height: 230,
    minKb: 20,
    maxKb: 50,
  },
  {
    id: "photo-200x230-nomin",
    mode: "photo",
    label: "Photo, 200 x 230 px, up to 50 KB, no minimum",
    width: 200,
    height: 230,
    minKb: 0,
    maxKb: 50,
  },
  {
    id: "photo-413x531",
    mode: "photo",
    label: "Photo, 3.5 x 4.5 cm at 300 DPI (413 x 531 px), size limit up to you",
    width: 413,
    height: 531,
    minKb: 0,
    maxKb: "",
  },
  {
    id: "sign-140x60",
    mode: "signature",
    label: "Signature, 140 x 60 px, 10 to 20 KB (common)",
    width: 140,
    height: 60,
    minKb: 10,
    maxKb: 20,
  },
  {
    id: "sign-140x60-nomin",
    mode: "signature",
    label: "Signature, 140 x 60 px, up to 20 KB, no minimum",
    width: 140,
    height: 60,
    minKb: 0,
    maxKb: 20,
  },
];

const toInt = (value, fallback = 0) => {
  const n = Math.round(Number(value));
  return Number.isFinite(n) ? n : fallback;
};

export default function ExamPhotoResizerContent() {
  const [image, setImage] = useState(null);
  const [fileError, setFileError] = useState("");
  const [mode, setMode] = useState("photo");
  const [width, setWidth] = useState("200");
  const [height, setHeight] = useState("230");
  const [minKb, setMinKb] = useState("20");
  const [maxKb, setMaxKb] = useState("50");
  const [view, setView] = useState(DEFAULT_CROP_VIEW);
  const [whiten, setWhiten] = useState(false);
  const [allowPadding, setAllowPadding] = useState(true);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const previewRef = useRef(null);
  const runId = useRef(0);

  const outW = toInt(width);
  const outH = toInt(height);
  const minBytes = Math.max(0, Number(minKb || 0)) * KB;
  const maxBytes = maxKb === "" ? Infinity : Math.max(0, Number(maxKb)) * KB;

  const specError = useMemo(() => {
    if (!(outW >= 8 && outW <= 5000)) return "Width has to be between 8 and 5000 pixels.";
    if (!(outH >= 8 && outH <= 5000)) return "Height has to be between 8 and 5000 pixels.";
    if (Number.isFinite(maxBytes) && maxBytes > 0 && minBytes > maxBytes) {
      return "The minimum size is larger than the maximum. Swap the two numbers.";
    }
    if (Number.isFinite(maxBytes) && maxBytes <= 0 && maxKb !== "") {
      return "The maximum size has to be more than 0 KB, or blank for no limit.";
    }
    return "";
  }, [outW, outH, minBytes, maxBytes, maxKb]);

  const aspect = outW / outH;
  const activePreset =
    PRESETS.find(
      (p) =>
        p.width === outW &&
        p.height === outH &&
        String(p.minKb) === String(minKb || 0) &&
        String(p.maxKb) === String(maxKb)
    )?.id || "custom";

  const applyPreset = (id) => {
    const preset = PRESETS.find((p) => p.id === id);
    if (!preset) return;
    setMode(preset.mode);
    setWidth(String(preset.width));
    setHeight(String(preset.height));
    setMinKb(String(preset.minKb));
    setMaxKb(String(preset.maxKb));
  };

  const pickFile = async (file) => {
    setFileError("");
    try {
      const loaded = await loadImageFile(file);
      setImage((old) => {
        if (old && old.release) old.release();
        return loaded;
      });
      setView(DEFAULT_CROP_VIEW);
      setResult(null);
    } catch {
      setFileError("That file could not be read as an image. Try a JPG, PNG or WebP.");
    }
  };

  // Redraw and re-encode whenever anything that affects the output changes.
  // The redraw is immediate so the preview tracks the drag, and the encode is
  // debounced because it runs the quality search a dozen times over.
  useEffect(() => {
    const canvas = previewRef.current;
    if (!image || !canvas || specError) return undefined;

    const rect = cropRect(image.width, image.height, aspect, view);
    renderCrop(image.source, rect, outW, outH, { background: "#ffffff", canvas });
    if (mode === "signature" && whiten) whitenBackground(canvas);

    const id = runId.current + 1;
    runId.current = id;
    setBusy(true);

    const timer = setTimeout(async () => {
      try {
        const encoded = await encodeToSizeBand(canvas, {
          type: "image/jpeg",
          minBytes,
          maxBytes,
          allowPadding,
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
    }, 220);

    return () => clearTimeout(timer);
  }, [image, outW, outH, aspect, view, mode, whiten, minBytes, maxBytes, allowPadding, specError]);

  const inBand =
    result &&
    result.status === "ok" &&
    result.headerWidth === outW &&
    result.headerHeight === outH;

  return (
    <ToolPageShell>
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif font-black text-3xl sm:text-[2.6rem] leading-[1.08] text-[#111] mb-3">
          Exam photo and signature resizer
        </h1>
        <p className="text-[15px] sm:text-base text-[#444] leading-relaxed mb-6 max-w-2xl">
          Application forms want an exact pixel size and a file size inside a narrow
          KB range, and reject anything outside it. Set the numbers your form asks
          for, position the frame, and this hits both. It runs on your device, so
          your photo is never uploaded.
        </p>

        <div className={`${cardClass} p-5 sm:p-7`}>
          <ImagePicker
            id="exam-source"
            label="1. Choose your photo or signature"
            onPick={pickFile}
            fileName={image ? image.name : ""}
            error={fileError}
          />

          <fieldset className="mt-6">
            <legend className="block text-sm font-bold text-[#111] mb-2">
              2. What the form asks for
            </legend>

            <div className="flex gap-2 mb-4">
              {[
                ["photo", "Photo"],
                ["signature", "Signature"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setMode(value);
                    applyPreset(value === "photo" ? "photo-200x230" : "sign-140x60");
                  }}
                  aria-pressed={mode === value}
                  className={`${buttonClass} flex-1`}
                  style={mode === value ? { background: "#F0D44A" } : undefined}
                >
                  {label}
                </button>
              ))}
            </div>

            <SelectField
              id="exam-preset"
              label="Common requirement"
              value={activePreset}
              onChange={applyPreset}
              hint="These are the combinations that show up on most forms. Read your own form and change the numbers below if it says something else."
            >
              {PRESETS.filter((p) => p.mode === mode).map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
              <option value="custom">Custom, set by the four boxes below</option>
            </SelectField>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              <NumberField
                id="exam-width"
                label="Width"
                value={width}
                onChange={setWidth}
                min={8}
                max={5000}
                suffix="px"
              />
              <NumberField
                id="exam-height"
                label="Height"
                value={height}
                onChange={setHeight}
                min={8}
                max={5000}
                suffix="px"
              />
              <NumberField
                id="exam-min"
                label="Minimum size"
                value={minKb}
                onChange={setMinKb}
                min={0}
                suffix="KB"
              />
              <NumberField
                id="exam-max"
                label="Maximum size"
                value={maxKb}
                onChange={setMaxKb}
                min={0}
                suffix="KB"
              />
            </div>
            <p className="text-xs text-[#666] mt-1.5 leading-relaxed">
              1 KB is treated as 1024 bytes. Leave the maximum blank for no upper limit.
            </p>

            {specError ? (
              <p
                role="alert"
                className="mt-3 border-2 border-black rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#111]"
              >
                {specError}
              </p>
            ) : null}
          </fieldset>

          {image && !specError ? (
            <>
              <div className="mt-6">
                <p className="block text-sm font-bold text-[#111] mb-2">
                  3. Position the frame
                </p>
                <CropStage
                  image={image}
                  aspect={aspect}
                  view={view}
                  onView={setView}
                  hint={`The frame is locked to ${outW} x ${outH}. Drag it, pinch to zoom, or use the sliders.`}
                />
              </div>

              <div className="mt-5 space-y-3">
                {mode === "signature" ? (
                  <CheckboxField
                    id="exam-whiten"
                    label="Whiten the paper behind the signature"
                    checked={whiten}
                    onChange={setWhiten}
                    hint="Every pixel brighter than 200 out of 255 becomes pure white. Useful for a signature photographed on grey paper, and it compresses much smaller."
                  />
                ) : null}
                <CheckboxField
                  id="exam-padding"
                  label="Pad the file up to the minimum size if it comes out smaller"
                  checked={allowPadding}
                  onChange={setAllowPadding}
                  hint="Padding adds JPEG comment segments, which decoders skip. No pixel changes."
                />
              </div>

              <div className="mt-6 grid sm:grid-cols-2 gap-4 items-start">
                <div>
                  <p className="block text-sm font-bold text-[#111] mb-2">
                    4. Your file, at actual size
                  </p>
                  <OutputPreview canvasRef={previewRef} width={outW} height={outH} />
                </div>

                <div aria-live="polite" className="space-y-3">
                  {busy || !result ? (
                    <p className="border-2 border-black rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#111]">
                      Working out the quality that lands inside your size range.
                    </p>
                  ) : (
                    <>
                      <p
                        className="border-2 border-black rounded-xl px-4 py-3 text-sm font-bold text-[#111] leading-relaxed"
                        style={{ background: inBand ? "#F0D44A" : "#ffffff" }}
                      >
                        {result.status === "too-large"
                          ? `This picture will not compress under ${formatSize(maxBytes)} at ${outW} x ${outH}. The smallest it reaches is ${formatSize(result.bytes)}. Reduce the pixel size or raise the limit.`
                          : result.status === "under"
                          ? `The file is ${formatSize(result.bytes)}, below the ${formatSize(minBytes)} minimum, and padding is switched off.`
                          : `Ready: ${outW} x ${outH} px, ${formatSize(result.bytes)}.`}
                      </p>

                      <div className="border-2 border-black rounded-xl bg-white px-4 py-2">
                        <StatRow
                          label="Dimensions"
                          value={
                            result.headerWidth
                              ? `${result.headerWidth} x ${result.headerHeight} px`
                              : `${outW} x ${outH} px`
                          }
                          tone={
                            result.headerWidth && result.headerWidth !== outW ? "bad" : undefined
                          }
                        />
                        <StatRow
                          label="File size"
                          value={`${formatSize(result.bytes)} (${result.bytes.toLocaleString()} bytes)`}
                          tone={result.status === "ok" ? undefined : "bad"}
                        />
                        <StatRow label="Target" value={
                          `${minBytes > 0 ? `${minKb} to ` : "up to "}${maxKb === "" ? "no limit" : `${maxKb} KB`}`
                        } />
                        <StatRow
                          label="JPEG quality"
                          value={result.quality ? result.quality.toFixed(3) : "n/a"}
                        />
                        <StatRow
                          label="Padding added"
                          value={result.padded > 0 ? `${result.padded.toLocaleString()} bytes` : "none"}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          downloadBlob(
                            result.blob,
                            safeFileName(image.name, mode === "photo" ? "photo" : "signature", "image/jpeg")
                          )
                        }
                        className={`${buttonClass} w-full`}
                        style={{ background: "#F0D44A" }}
                      >
                        <Download size={16} strokeWidth={2.75} /> Download the JPG
                      </button>

                      {result.padded > 0 ? (
                        <p className="text-xs text-[#666] leading-relaxed">
                          {result.padded.toLocaleString()} bytes of JPEG comment padding were added
                          to clear the {minKb} KB minimum. The picture itself is unchanged.
                        </p>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            </>
          ) : null}

          <div className="mt-6">
            <PrivacyCallout />
          </div>
        </div>
      </section>

      <ToolSection title="Why hitting a KB range is the hard part">
        <p>
          Setting the pixel size is easy. Landing inside a KB range is not, because
          the JPEG quality setting is not a file size dial. The same quality of 0.7
          gives a 12 KB file for a plain background and a 60 KB file for a busy one,
          and no formula can tell you which in advance. The only way to know is to
          encode and measure.
        </p>
        <p>
          So this tool measures. It encodes at full quality first, and if that
          already fits under your maximum it stops. Otherwise it bisects: it
          encodes at the lowest quality to prove the target is reachable at all,
          then repeatedly halves the interval, keeping the best quality whose real
          encoded size still fits.
        </p>
        <FormulaBlock>
          keep the highest q where bytes(q) &lt;= max, by bisecting q over 12 steps
        </FormulaBlock>
        <p>
          Twelve steps narrow the quality argument to better than 0.001, which is
          finer than the encoder itself reacts to, and the whole search takes a
          fraction of a second because it runs on a picture that is only a couple
          of hundred pixels wide.
        </p>
      </ToolSection>

      <ToolSection title="What happens when the file is too small">
        <p>
          A 200 x 230 headshot on a plain background can encode to 12 KB at full
          quality. If the form demands at least 20 KB, there is no honest way to
          add 8 KB of detail that was never in the picture, and raising the quality
          further is not possible once it is already at the maximum.
        </p>
        <p>
          The tool pads the file instead. A JPEG comment segment, marker FF FE, is
          part of the JPEG standard: it carries a length and then bytes that every
          decoder skips on its way to the image data. Adding enough of them lifts
          the byte count over the minimum without touching a single pixel, the
          dimensions, or the visible quality. The page tells you exactly how many
          bytes of padding went in, and you can switch it off.
        </p>
        <p>
          The alternative approaches used elsewhere are worse. Adding visible noise
          degrades the photo to game a byte count. Silently uploading a file that
          is under the minimum just gets you rejected at submission.
        </p>
      </ToolSection>

      <ToolSection title="About the presets">
        <p>
          The presets are labelled as common requirements, not as any board&apos;s
          official specification. 200 x 230 px at 20 to 50 KB for a photo, and
          140 x 60 px at 10 to 20 KB for a signature, are the combinations that
          turn up on most Indian application forms, which is why they are here.
        </p>
        <p>
          Specifications change between sessions and between boards, and putting an
          exam name next to a number we have not verified would be worse than
          useless to somebody with one shot at a form. Read the instructions on
          your own form, type those four numbers into the boxes, and the tool will
          hit them.
        </p>
      </ToolSection>

      <ToolSection title="Getting it accepted first time">
        <p>
          <strong>Match the aspect ratio before you shoot.</strong> 200 x 230 is
          slightly taller than it is wide. A wide landscape photo has to lose most
          of its sides to fit, so a head and shoulders portrait crops far better.
        </p>
        <p>
          <strong>Sign on white paper with a dark pen.</strong> A scanned or
          photographed signature on grey paper carries a lot of texture, and texture
          is what makes JPEG files big. Whitening the background removes it, which
          matters when the limit is 20 KB.
        </p>
        <p>
          <strong>Check the extension the form wants.</strong> This tool outputs
          JPEG with a .jpg extension, which is what nearly every form asks for. If
          yours insists on .jpeg, renaming the file is enough, since the contents
          are identical.
        </p>
        <p>
          <strong>Keep the original.</strong> Portals often ask for a different size
          at a later stage. Re-crop from your original photo rather than from an
          already compressed 20 KB copy, because compression damage accumulates.
        </p>
      </ToolSection>

      <ToolSection title="Frequently asked questions" id="faq">
        <FaqList items={EXAM_PHOTO_FAQS} />
      </ToolSection>

      <ToolCta
        location="exam_photo_resizer"
        heading="Form filled. Now the exam itself."
        body="FORKSAI turns your syllabus, notes and PDFs into flashcards and spaced repetition sessions, so the months between the application and the exam actually count."
      />

      <ImageToolCrossLinks current="/exam-photo-resizer" />
    </ToolPageShell>
  );
}
