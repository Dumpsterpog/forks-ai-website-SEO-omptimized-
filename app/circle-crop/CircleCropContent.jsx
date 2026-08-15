"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Download } from "lucide-react";
import ToolPageShell, {
  ToolCta,
  ToolSection,
  FormulaBlock,
  FaqList,
  cardClass,
  buttonClass,
  labelClass,
  hintClass,
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
  CheckboxField,
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
import { CIRCLE_CROP_FAQS } from "./faqs";

const SIZES = [
  { id: "match", label: "Match the crop, full resolution" },
  { id: "128", label: "128 px, small avatar" },
  { id: "200", label: "200 px, forum and chat avatar" },
  { id: "256", label: "256 px" },
  { id: "400", label: "400 px, common profile picture" },
  { id: "512", label: "512 px, sharp on a retina screen" },
  { id: "800", label: "800 px" },
  { id: "1024", label: "1024 px, large" },
  { id: "custom", label: "Custom, set by the box below" },
];

const TAU = Math.PI * 2;
const MAX_SIZE = 4096;

export default function CircleCropContent() {
  const [image, setImage] = useState(null);
  const [fileError, setFileError] = useState("");
  const [view, setView] = useState(DEFAULT_CROP_VIEW);
  const [sizeChoice, setSizeChoice] = useState("400");
  const [customSize, setCustomSize] = useState("600");
  const [corners, setCorners] = useState("transparent");
  const [cornerColor, setCornerColor] = useState("#ffffff");
  const [ringOn, setRingOn] = useState(false);
  const [ringWidth, setRingWidth] = useState(8);
  const [ringColor, setRingColor] = useState("#111111");
  const [format, setFormat] = useState("image/png");
  const [quality, setQuality] = useState(92);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const previewRef = useRef(null);
  const runId = useRef(0);

  const transparent = corners === "transparent";
  // JPEG has no alpha channel, so it is only on the menu once the corners are
  // being filled with a colour. Offering it otherwise would quietly turn the
  // empty corners black.
  const formats = transparent
    ? [
        { id: "image/png", label: "PNG, keeps the transparency", lossy: false },
        { id: "image/webp", label: "WebP, transparent and smaller", lossy: true },
      ]
    : [
        { id: "image/png", label: "PNG, lossless", lossy: false },
        { id: "image/webp", label: "WebP, smaller at the same quality", lossy: true },
        { id: "image/jpeg", label: "JPEG, smallest for photographs", lossy: true },
      ];

  const lossy = formats.find((f) => f.id === format)?.lossy ?? false;

  const rect = useMemo(
    () => (image ? cropRect(image.width, image.height, 1, view) : null),
    [image, view]
  );

  const size = useMemo(() => {
    if (!rect) return 0;
    if (sizeChoice === "match") return Math.max(1, Math.round(rect.width));
    if (sizeChoice === "custom") {
      const n = Math.round(Number(customSize));
      return Number.isFinite(n) ? n : 0;
    }
    return Number(sizeChoice);
  }, [rect, sizeChoice, customSize]);

  const sizeError = useMemo(() => {
    if (!image) return "";
    if (!(size >= 16)) return "The output has to be at least 16 pixels across.";
    if (size > MAX_SIZE) return `The output cannot be more than ${MAX_SIZE} pixels across.`;
    return "";
  }, [image, size]);

  const ringPx = ringOn ? Math.max(1, Math.round((ringWidth / 100) * (size / 2))) : 0;

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

  // Keep the format legal when the corner style changes under it.
  useEffect(() => {
    if (transparent && format === "image/jpeg") setFormat("image/png");
  }, [transparent, format]);

  useEffect(() => {
    const canvas = previewRef.current;
    if (!image || !canvas || !rect || sizeError) return undefined;

    // The square crop first, at the exact output size, then the mask. This is
    // the canvas that gets encoded, so the preview is the file rather than an
    // impression of it.
    renderCrop(image.source, rect, size, size, { background: null, canvas });

    const ctx = canvas.getContext("2d");
    const centre = size / 2;

    // destination-in rather than clip(). A clipped path is not antialiased in
    // every browser, and a composited mask is, so the edge of the circle comes
    // out smooth and the corners come out at an alpha of exactly zero.
    ctx.globalCompositeOperation = "destination-in";
    ctx.beginPath();
    ctx.arc(centre, centre, centre, 0, TAU);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";

    if (ringPx > 0) {
      ctx.lineWidth = ringPx;
      ctx.strokeStyle = ringColor;
      ctx.beginPath();
      // Half a stroke sits either side of the path, so the path runs half a ring
      // in from the edge and the whole ring stays inside the circle.
      ctx.arc(centre, centre, Math.max(0.5, centre - ringPx / 2), 0, TAU);
      ctx.stroke();
    }

    if (!transparent) {
      ctx.globalCompositeOperation = "destination-over";
      ctx.fillStyle = cornerColor;
      ctx.fillRect(0, 0, size, size);
      ctx.globalCompositeOperation = "source-over";
    }

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
  }, [
    image,
    rect,
    size,
    sizeError,
    format,
    quality,
    lossy,
    transparent,
    cornerColor,
    ringPx,
    ringColor,
  ]);

  return (
    <ToolPageShell>
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif font-black text-3xl sm:text-[2.6rem] leading-[1.08] text-[#111] mb-3">
          Circle crop
        </h1>
        <p className="text-[15px] sm:text-base text-[#444] leading-relaxed mb-6 max-w-2xl">
          Cut a picture into a circle for a profile photo, with the corners left
          genuinely transparent rather than filled with white. Drag or pinch to
          choose what sits inside the circle, pick an output size, and download a
          PNG. Your picture never leaves your device.
        </p>

        <div className={`${cardClass} p-5 sm:p-7`}>
          <ImagePicker
            id="circle-source"
            label="1. Choose an image"
            onPick={pickFile}
            fileName={image ? image.name : ""}
            error={fileError}
          />

          {image ? (
            <>
              <div className="mt-6">
                <p className="block text-sm font-bold text-[#111] mb-2">
                  2. Choose what goes inside the circle
                </p>
                <CropStage
                  image={image}
                  aspect={1}
                  view={view}
                  onView={setView}
                  hint="The frame is square and the circle is drawn inside it. Drag, pinch to zoom, or use the sliders."
                />
              </div>

              <fieldset className="mt-6">
                <legend className="block text-sm font-bold text-[#111] mb-2">3. Output</legend>

                <div className="grid sm:grid-cols-2 gap-4">
                  <SelectField
                    id="circle-size"
                    label="Size across"
                    value={sizeChoice}
                    onChange={setSizeChoice}
                    hint="The circle fills the square, so this is the diameter too."
                  >
                    {SIZES.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </SelectField>

                  <SelectField
                    id="circle-corners"
                    label="Corners"
                    value={corners}
                    onChange={setCorners}
                  >
                    <option value="transparent">Transparent, nothing behind the circle</option>
                    <option value="solid">Filled with a colour</option>
                  </SelectField>
                </div>

                {sizeChoice === "custom" ? (
                  <div className="mt-4">
                    <NumberField
                      id="circle-custom-size"
                      label="Custom size"
                      value={customSize}
                      onChange={setCustomSize}
                      min={16}
                      max={MAX_SIZE}
                      suffix="px"
                    />
                  </div>
                ) : null}

                {!transparent ? (
                  <div className="mt-4">
                    <label htmlFor="circle-corner-color" className={labelClass}>
                      Corner colour
                    </label>
                    <input
                      id="circle-corner-color"
                      name="circle-corner-color"
                      type="color"
                      value={cornerColor}
                      onChange={(e) => setCornerColor(e.target.value)}
                      className="h-12 w-24 border-2 border-black rounded-xl bg-white p-1 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
                    />
                    <p className={hintClass}>
                      Match this to the page the picture will sit on and the square
                      edges disappear.
                    </p>
                  </div>
                ) : null}

                <div className="mt-4">
                  <CheckboxField
                    id="circle-ring"
                    label="Draw a ring around the circle"
                    checked={ringOn}
                    onChange={setRingOn}
                  />
                </div>

                {ringOn ? (
                  <div className="grid sm:grid-cols-2 gap-4 mt-4">
                    <RangeField
                      id="circle-ring-width"
                      label="Ring thickness"
                      min={1}
                      max={20}
                      step={1}
                      value={ringWidth}
                      readout={`${ringPx} px`}
                      onChange={setRingWidth}
                      hint="A share of the radius, so it looks the same at any output size."
                    />
                    <div>
                      <label htmlFor="circle-ring-color" className={labelClass}>
                        Ring colour
                      </label>
                      <input
                        id="circle-ring-color"
                        name="circle-ring-color"
                        type="color"
                        value={ringColor}
                        onChange={(e) => setRingColor(e.target.value)}
                        className="h-12 w-24 border-2 border-black rounded-xl bg-white p-1 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
                      />
                    </div>
                  </div>
                ) : null}

                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <SelectField id="circle-format" label="Format" value={format} onChange={setFormat}>
                    {formats.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </SelectField>
                  {lossy ? (
                    <RangeField
                      id="circle-quality"
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

                {sizeError ? (
                  <p
                    role="alert"
                    className="mt-3 border-2 border-black rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#111]"
                  >
                    {sizeError}
                  </p>
                ) : null}
              </fieldset>

              {!sizeError ? (
                <div className="mt-6 grid sm:grid-cols-2 gap-4 items-start">
                  <div>
                    <p className="block text-sm font-bold text-[#111] mb-2">4. Result</p>
                    <OutputPreview
                      canvasRef={previewRef}
                      width={size}
                      height={size}
                      checkered={transparent}
                    />
                  </div>

                  <div aria-live="polite" className="space-y-3">
                    {busy || !result ? (
                      <p className="border-2 border-black rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#111]">
                        Encoding the circle.
                      </p>
                    ) : (
                      <>
                        <p
                          className="border-2 border-black rounded-xl px-4 py-3 text-sm font-bold text-[#111] leading-relaxed"
                          style={{ background: "#F0D44A" }}
                        >
                          {size} x {size} px, {formatSize(result.bytes)}.
                        </p>

                        <div className="border-2 border-black rounded-xl bg-white px-4 py-2">
                          <StatRow label="Source" value={`${image.width} x ${image.height} px`} />
                          <StatRow label="Circle" value={`${size} px across`} />
                          <StatRow
                            label="Corners"
                            value={transparent ? "Transparent" : cornerColor.toUpperCase()}
                          />
                          <StatRow label="Ring" value={ringPx ? `${ringPx} px` : "None"} />
                          <StatRow label="Format" value={extensionFor(format).toUpperCase()} />
                          <StatRow
                            label="File size"
                            value={`${formatSize(result.bytes)} (${result.bytes.toLocaleString()} bytes)`}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            downloadBlob(
                              result.blob,
                              safeFileName(image.name, `circle-${size}`, format)
                            )
                          }
                          className={`${buttonClass} w-full`}
                          style={{ background: "#F0D44A" }}
                        >
                          <Download size={16} strokeWidth={2.75} aria-hidden="true" /> Download
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

      <ToolSection title="How the corners are actually emptied">
        <p>
          A circular crop is a square image plus an alpha channel. The square is
          drawn first, then the circle is composited over it in destination-in
          mode, which keeps the existing pixels only where the new shape is opaque
          and sets everything else to an alpha of zero.
        </p>
        <FormulaBlock>
          alpha out = alpha of the photo x coverage of the circle at that pixel
        </FormulaBlock>
        <p>
          Because it is a composite rather than a hard clip, the pixels sitting on
          the boundary get a partial alpha instead of being fully in or fully out,
          which is what makes the edge read as a smooth curve at 128 pixels as
          well as at 1024. Save it as PNG or WebP and that alpha channel survives
          into the file. Save it as JPEG and it cannot, which is why JPEG only
          appears once you have chosen a colour for the corners.
        </p>
      </ToolSection>

      <ToolSection title="Picking a size">
        <p>
          Most sites show an avatar at somewhere between 40 and 200 pixels but
          store a larger copy for high resolution screens, so 400 or 512 pixels is
          a sensible default. It stays sharp when a page draws it at twice its CSS
          size, and it is still a small file.
        </p>
        <p>
          Match the crop keeps whatever resolution your frame actually covers. Take
          a circle out of a 12 megapixel photo without zooming in and that is
          around 3000 pixels across, which is more than an avatar needs but right
          if the cut out is going into print or into a poster.
        </p>
        <p>
          The circle always fills the square, so the size you pick is both the
          width of the file and the diameter of the circle. There is no padding to
          account for.
        </p>
      </ToolSection>

      <ToolSection title="Where a transparent circle helps">
        <p>
          Slides and documents are the usual reason. A white cornered circle looks
          fine on a white slide and looks like a mistake on any other colour. With
          real transparency the same file works on every background, so you do not
          need one copy per deck.
        </p>
        <p>
          Team pages and CVs are the other one. A row of head shots cut to the same
          circle at the same size reads as one set, which is much harder to get by
          cropping each photo to a square and hoping the layout rounds them off.
        </p>
        <p>
          If you need a square or a fixed ratio rather than a circle, the{" "}
          <Link href="/image-cropper" className="font-bold text-[#111] underline underline-offset-2">
            image cropper
          </Link>{" "}
          does that, and the{" "}
          <Link href="/watermark-image" className="font-bold text-[#111] underline underline-offset-2">
            image watermarker
          </Link>{" "}
          puts your name or logo over a picture before you share it. For documents
          there is{" "}
          <Link href="/watermark-pdf" className="font-bold text-[#111] underline underline-offset-2">
            watermark PDF
          </Link>{" "}
          and{" "}
          <Link
            href="/add-page-numbers-to-pdf"
            className="font-bold text-[#111] underline underline-offset-2"
          >
            add page numbers to PDF
          </Link>
          .
        </p>
      </ToolSection>

      <ToolSection title="Frequently asked questions" id="faq">
        <FaqList items={CIRCLE_CROP_FAQS} />
      </ToolSection>

      <ToolCta
        location="circle_crop"
        heading="A better profile picture will not pass the exam"
        body="FORKSAI turns your notes, slides and PDFs into flashcards and spaced repetition sessions, so your study hours land on the parts you have not learned yet."
      />

      <ImageToolCrossLinks current="/circle-crop" />
    </ToolPageShell>
  );
}
