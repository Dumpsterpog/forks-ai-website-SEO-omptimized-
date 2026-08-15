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
  cropRect,
  downloadBlob,
  encodeToSizeBand,
  extensionFor,
  formatSize,
  loadImageFile,
  renderCrop,
  safeFileName,
} from "@/lib/imageTools";
import {
  CropStage,
  ImagePicker,
  ImageToolCrossLinks,
  NumberField,
  OutputPreview,
  PrivacyCallout,
  RangeField,
  SelectField,
  StatRow,
} from "@/lib/imageToolsUi";
import { IMAGE_CROPPER_FAQS } from "@/lib/imageToolsFaqs";

const RATIOS = [
  { id: "original", label: "Original ratio" },
  { id: "1:1", label: "1:1 square, profile pictures and posts" },
  { id: "4:3", label: "4:3 landscape, the classic camera ratio" },
  { id: "3:4", label: "3:4 portrait" },
  { id: "16:9", label: "16:9 widescreen, video and banners" },
  { id: "9:16", label: "9:16 vertical, stories and reels" },
  { id: "3:2", label: "3:2, standard photo prints" },
  { id: "custom", label: "Custom, set by the two boxes" },
];

const FORMATS = [
  { id: "image/jpeg", label: "JPEG, smallest for photographs", lossy: true },
  { id: "image/png", label: "PNG, lossless, keeps transparency", lossy: false },
  { id: "image/webp", label: "WebP, smaller at the same quality", lossy: true },
];

const MAX_PIXELS = 40000000;

const toInt = (value, fallback = 0) => {
  const n = Math.round(Number(value));
  return Number.isFinite(n) ? n : fallback;
};

export default function ImageCropperContent() {
  const [image, setImage] = useState(null);
  const [fileError, setFileError] = useState("");
  const [ratio, setRatio] = useState("1:1");
  const [customW, setCustomW] = useState("5");
  const [customH, setCustomH] = useState("7");
  const [longestSide, setLongestSide] = useState("");
  const [format, setFormat] = useState("image/jpeg");
  const [quality, setQuality] = useState(90);
  const [view, setView] = useState(DEFAULT_CROP_VIEW);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const previewRef = useRef(null);
  const runId = useRef(0);

  const lossy = FORMATS.find((f) => f.id === format)?.lossy ?? true;

  const aspect = useMemo(() => {
    if (!image) return 1;
    if (ratio === "original") return image.width / image.height;
    if (ratio === "custom") {
      const w = Number(customW);
      const h = Number(customH);
      if (w > 0 && h > 0) return w / h;
      return image.width / image.height;
    }
    const [w, h] = ratio.split(":").map(Number);
    return w / h;
  }, [ratio, customW, customH, image]);

  const rect = useMemo(
    () => (image ? cropRect(image.width, image.height, aspect, view) : null),
    [image, aspect, view]
  );

  // The crop keeps its own pixels unless a cap is set, so a square crop from a
  // 12 megapixel photo comes out at full resolution.
  const { outW, outH } = useMemo(() => {
    if (!rect) return { outW: 0, outH: 0 };
    let w = Math.max(1, Math.round(rect.width));
    let h = Math.max(1, Math.round(rect.height));
    const cap = toInt(longestSide);
    if (longestSide !== "" && cap > 0 && Math.max(w, h) > cap) {
      const scale = cap / Math.max(w, h);
      w = Math.max(1, Math.round(w * scale));
      h = Math.max(1, Math.round(h * scale));
    }
    return { outW: w, outH: h };
  }, [rect, longestSide]);

  const specError = useMemo(() => {
    if (!image) return "";
    if (ratio === "custom" && !(Number(customW) > 0 && Number(customH) > 0)) {
      return "Both ratio numbers have to be more than 0.";
    }
    if (outW * outH > MAX_PIXELS) {
      return "That crop is more than 40 megapixels. Set a limit on the longest side.";
    }
    return "";
  }, [image, ratio, customW, customH, outW, outH]);

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

  useEffect(() => {
    const canvas = previewRef.current;
    if (!image || !canvas || !rect || specError) return undefined;

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
  }, [image, rect, outW, outH, format, quality, lossy, specError]);

  return (
    <ToolPageShell>
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif font-black text-3xl sm:text-[2.6rem] leading-[1.08] text-[#111] mb-3">
          Image cropper
        </h1>
        <p className="text-[15px] sm:text-base text-[#444] leading-relaxed mb-6 max-w-2xl">
          Crop to a square, to 4:3, to 16:9, or to any ratio you type in. The frame
          is locked to the ratio, so you cannot end up a few pixels out. Drag it
          with a finger, pinch to zoom, and download. Your picture never leaves
          your device.
        </p>

        <div className={`${cardClass} p-5 sm:p-7`}>
          <ImagePicker
            id="cropper-source"
            label="1. Choose an image"
            onPick={pickFile}
            fileName={image ? image.name : ""}
            error={fileError}
          />

          {image ? (
            <>
              <fieldset className="mt-6">
                <legend className="block text-sm font-bold text-[#111] mb-2">
                  2. Shape of the crop
                </legend>

                <SelectField id="cropper-ratio" label="Aspect ratio" value={ratio} onChange={setRatio}>
                  {RATIOS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </SelectField>

                {ratio === "custom" ? (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <NumberField
                      id="cropper-ratio-w"
                      label="Ratio width"
                      value={customW}
                      onChange={setCustomW}
                      min={1}
                      step={0.1}
                    />
                    <NumberField
                      id="cropper-ratio-h"
                      label="Ratio height"
                      value={customH}
                      onChange={setCustomH}
                      min={1}
                      step={0.1}
                    />
                  </div>
                ) : null}

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
                <>
                  <div className="mt-6">
                    <p className="block text-sm font-bold text-[#111] mb-2">
                      3. Choose what to keep
                    </p>
                    <CropStage
                      image={image}
                      aspect={aspect}
                      view={view}
                      onView={setView}
                      hint="Drag the frame, pinch to zoom, or use the sliders."
                    />
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4 mt-5">
                    <SelectField id="cropper-format" label="Format" value={format} onChange={setFormat}>
                      {FORMATS.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </SelectField>
                    <NumberField
                      id="cropper-longest"
                      label="Limit the longest side"
                      value={longestSide}
                      onChange={setLongestSide}
                      min={0}
                      max={20000}
                      suffix="px"
                      hint="Leave blank to keep the crop at full resolution."
                    />
                    {lossy ? (
                      <RangeField
                        id="cropper-quality"
                        label="Quality"
                        min={10}
                        max={100}
                        step={1}
                        value={quality}
                        readout={`${quality}`}
                        onChange={setQuality}
                      />
                    ) : (
                      <p className="text-sm text-[#555] leading-relaxed self-end pb-1">
                        PNG is lossless, so there is no quality setting.
                      </p>
                    )}
                  </div>

                  <div className="mt-6 grid sm:grid-cols-2 gap-4 items-start">
                    <div>
                      <p className="block text-sm font-bold text-[#111] mb-2">4. Result</p>
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
                          Encoding the crop.
                        </p>
                      ) : (
                        <>
                          <p
                            className="border-2 border-black rounded-xl px-4 py-3 text-sm font-bold text-[#111] leading-relaxed"
                            style={{ background: "#F0D44A" }}
                          >
                            {outW} x {outH} px, {formatSize(result.bytes)}.
                          </p>

                          <div className="border-2 border-black rounded-xl bg-white px-4 py-2">
                            <StatRow label="Source" value={`${image.width} x ${image.height} px`} />
                            <StatRow
                              label="Crop"
                              value={
                                result.headerWidth
                                  ? `${result.headerWidth} x ${result.headerHeight} px`
                                  : `${outW} x ${outH} px`
                              }
                            />
                            <StatRow
                              label="Ratio"
                              value={ratio === "custom" ? `${customW}:${customH}` : ratio}
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
                                safeFileName(image.name, `crop-${outW}x${outH}`, format)
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
                </>
              ) : null}
            </>
          ) : null}

          <div className="mt-6">
            <PrivacyCallout />
          </div>
        </div>
      </section>

      <ToolSection title="How the frame works">
        <p>
          The frame is described by three numbers: how far it is zoomed in, and
          where it sits in the room it has left to move, across and down. Both
          positions run from 0 to 1, so the frame is inside the picture by
          construction rather than by clamping after the fact.
        </p>
        <FormulaBlock>
          widest frame = min(image width, image height x ratio), then divided by the zoom
        </FormulaBlock>
        <p>
          At a zoom of 1 the frame is as large as your chosen ratio allows inside
          the picture, so one of the two sliders is locked because there is nowhere
          to move in that direction. Zoom in and both unlock. It is also the reason
          an exported crop can never contain a transparent edge or a strip of
          background: the frame cannot leave the image.
        </p>
      </ToolSection>

      <ToolSection title="Which ratio for what">
        <p>
          <strong>1:1</strong> for profile pictures and grid posts.{" "}
          <strong>4:5</strong> as a custom ratio is the tallest a feed post usually
          allows. <strong>9:16</strong> for stories and reels.{" "}
          <strong>16:9</strong> for video thumbnails, slide backgrounds and page
          banners.
        </p>
        <p>
          <strong>3:2</strong> matches most photo prints, and{" "}
          <strong>4:3</strong> matches the classic camera and projector shape,
          which is still what a lot of presentation software expects.
        </p>
        <p>
          For a printed size that is quoted in inches or centimetres, put the two
          numbers into the custom boxes. A 5 by 7 print is just a 5:7 ratio.
        </p>
      </ToolSection>

      <ToolSection title="Resolution and quality">
        <p>
          The crop keeps its own pixels. Take a square out of a 12 megapixel photo
          and you get roughly 3000 x 3000, not a thumbnail, which is what you want
          if the file will be printed or edited again. Set a limit on the longest
          side when you want something smaller for the web.
        </p>
        <p>
          Cropping itself is lossless, since it only discards what is outside the
          frame. Quality is lost in the re-encode, so PNG output keeps every pixel
          exactly and JPEG output depends on the quality slider. If the file is
          going to be edited again later, keep the quality high or use PNG.
        </p>
      </ToolSection>

      <ToolSection title="Frequently asked questions" id="faq">
        <FaqList items={IMAGE_CROPPER_FAQS} />
      </ToolSection>

      <ToolCta
        location="image_cropper"
        heading="Crop the photo. Then crop the syllabus."
        body="FORKSAI turns your notes, slides and PDFs into flashcards and spaced repetition sessions, so you spend your hours on the parts you have not learned yet."
      />

      <ImageToolCrossLinks current="/image-cropper" />
    </ToolPageShell>
  );
}
