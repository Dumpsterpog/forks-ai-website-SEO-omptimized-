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
  inputClass,
  labelClass,
  hintClass,
} from "@/components/ToolPageShell";
import {
  clamp,
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
import { WATERMARK_IMAGE_FAQS } from "./faqs";

const POSITIONS = [
  { id: "top-left", label: "Top left" },
  { id: "top-center", label: "Top centre" },
  { id: "top-right", label: "Top right" },
  { id: "middle-left", label: "Middle left" },
  { id: "middle-center", label: "Centre" },
  { id: "middle-right", label: "Middle right" },
  { id: "bottom-left", label: "Bottom left" },
  { id: "bottom-center", label: "Bottom centre" },
  { id: "bottom-right", label: "Bottom right" },
];

const FONTS = [
  { id: "sans", label: "Sans serif", stack: "Arial, Helvetica, sans-serif" },
  { id: "serif", label: "Serif", stack: "Georgia, 'Times New Roman', serif" },
  { id: "mono", label: "Monospace", stack: "'Courier New', monospace" },
];

const FORMATS = [
  { id: "image/jpeg", label: "JPEG, smallest for photographs", lossy: true },
  { id: "image/png", label: "PNG, lossless, keeps transparency", lossy: false },
  { id: "image/webp", label: "WebP, smaller at the same quality", lossy: true },
];

const MAX_PIXELS = 40000000;
const DEG = Math.PI / 180;

const toInt = (value, fallback = 0) => {
  const n = Math.round(Number(value));
  return Number.isFinite(n) ? n : fallback;
};

// The box a rotated rectangle actually occupies. Inset by half of this and a
// watermark at any angle still lands fully inside the picture.
function rotatedBox(width, height, radians) {
  const c = Math.abs(Math.cos(radians));
  const s = Math.abs(Math.sin(radians));
  return { width: width * c + height * s, height: width * s + height * c };
}

function anchorFor(position, canvasW, canvasH, box, margin) {
  const halfW = box.width / 2;
  const halfH = box.height / 2;
  const [row, column] = position.split("-");
  let x = canvasW / 2;
  let y = canvasH / 2;
  if (column === "left") x = margin + halfW;
  else if (column === "right") x = canvasW - margin - halfW;
  if (row === "top") y = margin + halfH;
  else if (row === "bottom") y = canvasH - margin - halfH;
  // A watermark wider than the picture would otherwise be pushed off the far
  // edge by its own margin, so the anchor is kept inside whatever room exists.
  return {
    x: clamp(x, Math.min(halfW, canvasW / 2), Math.max(canvasW - halfW, canvasW / 2)),
    y: clamp(y, Math.min(halfH, canvasH / 2), Math.max(canvasH - halfH, canvasH / 2)),
  };
}

export default function WatermarkImageContent() {
  const [image, setImage] = useState(null);
  const [logo, setLogo] = useState(null);
  const [fileError, setFileError] = useState("");
  const [logoError, setLogoError] = useState("");

  const [kind, setKind] = useState("text");
  const [text, setText] = useState("FORKSAI");
  const [font, setFont] = useState("sans");
  const [bold, setBold] = useState(true);
  const [color, setColor] = useState("#ffffff");
  const [outline, setOutline] = useState(true);
  const [outlineColor, setOutlineColor] = useState("#111111");

  const [scale, setScale] = useState(18);
  const [opacity, setOpacity] = useState(45);
  const [angle, setAngle] = useState(0);
  const [position, setPosition] = useState("bottom-right");
  const [margin, setMargin] = useState(4);

  const [longestSide, setLongestSide] = useState("");
  const [format, setFormat] = useState("image/jpeg");
  const [quality, setQuality] = useState(90);

  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const previewRef = useRef(null);
  const runId = useRef(0);

  const lossy = FORMATS.find((f) => f.id === format)?.lossy ?? true;

  const { outW, outH } = useMemo(() => {
    if (!image) return { outW: 0, outH: 0 };
    let w = image.width;
    let h = image.height;
    const cap = toInt(longestSide);
    if (longestSide !== "" && cap > 0 && Math.max(w, h) > cap) {
      const factor = cap / Math.max(w, h);
      w = Math.max(1, Math.round(w * factor));
      h = Math.max(1, Math.round(h * factor));
    }
    return { outW: w, outH: h };
  }, [image, longestSide]);

  const specError = useMemo(() => {
    if (!image) return "";
    if (outW * outH > MAX_PIXELS) {
      return "That picture is more than 40 megapixels. Set a limit on the longest side.";
    }
    if (kind === "text" && !text.trim()) return "Type the text you want stamped on the picture.";
    if (kind === "logo" && !logo) return "Choose the logo image you want stamped on the picture.";
    return "";
  }, [image, outW, outH, kind, text, logo]);

  const pickFile = async (file) => {
    setFileError("");
    try {
      const loaded = await loadImageFile(file);
      setImage((old) => {
        if (old && old.release) old.release();
        return loaded;
      });
      setResult(null);
    } catch {
      setFileError("That file could not be read as an image. Try a JPG, PNG or WebP.");
    }
  };

  const pickLogo = async (file) => {
    setLogoError("");
    try {
      const loaded = await loadImageFile(file);
      setLogo((old) => {
        if (old && old.release) old.release();
        return loaded;
      });
    } catch {
      setLogoError("That logo could not be read as an image. A PNG with a transparent background works best.");
    }
  };

  useEffect(() => {
    const canvas = previewRef.current;
    if (!image || !canvas || specError) return undefined;

    // The picture first, at the output size. renderCrop halves repeatedly on a
    // big reduction, so a downscaled photo stays clean rather than ragged.
    renderCrop(
      image.source,
      { x: 0, y: 0, width: image.width, height: image.height },
      outW,
      outH,
      { background: format === "image/png" ? null : "#ffffff", canvas }
    );

    const ctx = canvas.getContext("2d");
    const radians = angle * DEG;
    const marginPx = (margin / 100) * Math.min(outW, outH);
    // Every size is a share of the picture width, so one setting looks the same
    // on a phone photo and on a large scan.
    const target = (scale / 100) * outW;

    ctx.save();
    ctx.globalAlpha = clamp(opacity / 100, 0, 1);

    if (kind === "text") {
      const stack = FONTS.find((f) => f.id === font)?.stack || FONTS[0].stack;
      const weight = bold ? "bold " : "";
      // Measure at a reference size first, then scale, so the size slider means
      // what it says: the text spans that share of the picture width whether it
      // is two characters or twenty.
      ctx.font = `${weight}100px ${stack}`;
      const reference = ctx.measureText(text).width || 1;
      const fontPx = Math.max(6, (100 * target) / reference);
      ctx.font = `${weight}${fontPx}px ${stack}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const metrics = ctx.measureText(text);
      const textW = metrics.width;
      const textH =
        (metrics.actualBoundingBoxAscent || fontPx * 0.72) +
        (metrics.actualBoundingBoxDescent || fontPx * 0.28);
      const box = rotatedBox(textW, textH, radians);
      const anchor = anchorFor(position, outW, outH, box, marginPx);

      ctx.translate(anchor.x, anchor.y);
      ctx.rotate(radians);
      if (outline) {
        ctx.lineWidth = Math.max(1, fontPx / 12);
        ctx.lineJoin = "round";
        ctx.strokeStyle = outlineColor;
        ctx.strokeText(text, 0, 0);
      }
      ctx.fillStyle = color;
      ctx.fillText(text, 0, 0);
    } else if (logo) {
      const logoW = target;
      const logoH = (logo.height / logo.width) * logoW;
      const box = rotatedBox(logoW, logoH, radians);
      const anchor = anchorFor(position, outW, outH, box, marginPx);

      ctx.translate(anchor.x, anchor.y);
      ctx.rotate(radians);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(logo.source, -logoW / 2, -logoH / 2, logoW, logoH);
    }

    ctx.restore();

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
    logo,
    outW,
    outH,
    specError,
    kind,
    text,
    font,
    bold,
    color,
    outline,
    outlineColor,
    scale,
    opacity,
    angle,
    position,
    margin,
    format,
    quality,
    lossy,
  ]);

  return (
    <ToolPageShell>
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif font-black text-3xl sm:text-[2.6rem] leading-[1.08] text-[#111] mb-3">
          Watermark an image
        </h1>
        <p className="text-[15px] sm:text-base text-[#444] leading-relaxed mb-6 max-w-2xl">
          Put your name, your handle or your logo over a picture before you share
          it. Nine positions, an angle, an opacity and a colour, all previewed on
          the real file rather than a thumbnail. Nothing is uploaded, and nothing
          of ours is stamped on your picture.
        </p>

        <div className={`${cardClass} p-5 sm:p-7`}>
          <ImagePicker
            id="watermark-source"
            label="1. Choose the picture"
            onPick={pickFile}
            fileName={image ? image.name : ""}
            error={fileError}
          />

          {image ? (
            <>
              <fieldset className="mt-6">
                <legend className="block text-sm font-bold text-[#111] mb-2">
                  2. What goes on it
                </legend>

                <div className="grid sm:grid-cols-2 gap-4">
                  <SelectField id="watermark-kind" label="Watermark" value={kind} onChange={setKind}>
                    <option value="text">Text, typed below</option>
                    <option value="logo">Logo, an image you upload</option>
                  </SelectField>

                  {kind === "text" ? (
                    <div>
                      <label htmlFor="watermark-text" className={labelClass}>
                        Text
                      </label>
                      <input
                        id="watermark-text"
                        name="watermark-text"
                        type="text"
                        value={text}
                        maxLength={80}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Your name or handle"
                        className={inputClass}
                      />
                      <p className={hintClass}>Up to 80 characters, on one line.</p>
                    </div>
                  ) : null}
                </div>

                {kind === "logo" ? (
                  <div className="mt-4">
                    <ImagePicker
                      id="watermark-logo"
                      label="Logo image"
                      onPick={pickLogo}
                      fileName={logo ? logo.name : ""}
                      error={logoError}
                      hint="A PNG with a transparent background sits over the picture most cleanly."
                    />
                  </div>
                ) : null}

                {kind === "text" ? (
                  <>
                    <div className="grid sm:grid-cols-2 gap-4 mt-4">
                      <SelectField id="watermark-font" label="Typeface" value={font} onChange={setFont}>
                        {FONTS.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.label}
                          </option>
                        ))}
                      </SelectField>
                      <div>
                        <label htmlFor="watermark-color" className={labelClass}>
                          Text colour
                        </label>
                        <input
                          id="watermark-color"
                          name="watermark-color"
                          type="color"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          className="h-12 w-24 border-2 border-black rounded-xl bg-white p-1 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 mt-4">
                      <CheckboxField
                        id="watermark-bold"
                        label="Bold"
                        checked={bold}
                        onChange={setBold}
                      />
                      <CheckboxField
                        id="watermark-outline"
                        label="Outline the letters"
                        hint="Keeps light text readable over a bright photo."
                        checked={outline}
                        onChange={setOutline}
                      />
                    </div>

                    {outline ? (
                      <div className="mt-4">
                        <label htmlFor="watermark-outline-color" className={labelClass}>
                          Outline colour
                        </label>
                        <input
                          id="watermark-outline-color"
                          name="watermark-outline-color"
                          type="color"
                          value={outlineColor}
                          onChange={(e) => setOutlineColor(e.target.value)}
                          className="h-12 w-24 border-2 border-black rounded-xl bg-white p-1 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
                        />
                      </div>
                    ) : null}
                  </>
                ) : null}
              </fieldset>

              <fieldset className="mt-6">
                <legend className="block text-sm font-bold text-[#111] mb-2">
                  3. Where it sits
                </legend>

                <div className="grid grid-cols-3 gap-2 max-w-[15rem]">
                  {POSITIONS.map((item) => (
                    <div key={item.id}>
                      <input
                        id={`watermark-pos-${item.id}`}
                        type="radio"
                        name="watermark-position"
                        value={item.id}
                        checked={position === item.id}
                        onChange={() => setPosition(item.id)}
                        className="peer sr-only"
                      />
                      <label
                        htmlFor={`watermark-pos-${item.id}`}
                        title={item.label}
                        className="flex h-12 items-center justify-center border-2 border-black rounded-xl bg-white cursor-pointer text-xs font-bold text-[#111] transition-colors peer-checked:bg-[#F0D44A] peer-focus-visible:outline-none peer-focus-visible:ring-4 peer-focus-visible:ring-[#F0D44A]"
                      >
                        <span className="sr-only">{item.label}</span>
                        <span
                          aria-hidden="true"
                          className="block h-2.5 w-2.5 rounded-full"
                          style={{ background: position === item.id ? "#111" : "#CFCFC6" }}
                        />
                      </label>
                    </div>
                  ))}
                </div>
                <p className={hintClass}>
                  Nine anchor points. The current one is {POSITIONS.find((p) => p.id === position)?.label.toLowerCase()}.
                </p>

                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <RangeField
                    id="watermark-margin"
                    label="Margin from the edge"
                    min={0}
                    max={25}
                    step={1}
                    value={margin}
                    readout={`${margin}%`}
                    onChange={setMargin}
                    hint="A share of the shorter side of the picture."
                  />
                  <RangeField
                    id="watermark-angle"
                    label="Angle"
                    min={-180}
                    max={180}
                    step={1}
                    value={angle}
                    readout={`${angle} deg`}
                    onChange={setAngle}
                    hint="Minus 45 runs uphill, plus 45 runs downhill."
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <RangeField
                    id="watermark-scale"
                    label="Size"
                    min={2}
                    max={90}
                    step={1}
                    value={scale}
                    readout={`${scale}% of the width`}
                    onChange={setScale}
                  />
                  <RangeField
                    id="watermark-opacity"
                    label="Opacity"
                    min={5}
                    max={100}
                    step={1}
                    value={opacity}
                    readout={`${opacity}%`}
                    onChange={setOpacity}
                  />
                </div>
              </fieldset>

              <fieldset className="mt-6">
                <legend className="block text-sm font-bold text-[#111] mb-2">4. Output file</legend>
                <div className="grid sm:grid-cols-3 gap-4">
                  <SelectField id="watermark-format" label="Format" value={format} onChange={setFormat}>
                    {FORMATS.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </SelectField>
                  <NumberField
                    id="watermark-longest"
                    label="Limit the longest side"
                    value={longestSide}
                    onChange={setLongestSide}
                    min={0}
                    max={20000}
                    suffix="px"
                    hint="Leave blank to keep the original resolution."
                  />
                  {lossy ? (
                    <RangeField
                      id="watermark-quality"
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
              </fieldset>

              {specError ? (
                <p
                  role="alert"
                  className="mt-4 border-2 border-black rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#111]"
                >
                  {specError}
                </p>
              ) : (
                <div className="mt-6 grid sm:grid-cols-2 gap-4 items-start">
                  <div>
                    <p className="block text-sm font-bold text-[#111] mb-2">5. Result</p>
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
                        Drawing the watermark.
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
                            label="Watermark"
                            value={kind === "text" ? `Text, ${scale}% wide` : `Logo, ${scale}% wide`}
                          />
                          <StatRow
                            label="Position"
                            value={POSITIONS.find((p) => p.id === position)?.label || ""}
                          />
                          <StatRow label="Opacity" value={`${opacity}%`} />
                          <StatRow label="Angle" value={`${angle} deg`} />
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
                              safeFileName(image.name, "watermarked", format)
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
              )}
            </>
          ) : null}

          <div className="mt-6">
            <PrivacyCallout />
          </div>
        </div>
      </section>

      <ToolSection title="Why the size is a percentage">
        <p>
          A watermark set in pixels is wrong on the next picture. Thirty pixels of
          text is a bold statement on a thumbnail and an invisible speck on a
          photograph off a modern phone. So the size here is a share of the
          picture width, and every other measurement follows the same rule.
        </p>
        <FormulaBlock>
          watermark width = size share x picture width, margin = margin share x shorter side
        </FormulaBlock>
        <p>
          The upshot is that one set of settings looks the same on every picture
          you run through it, which matters if you are stamping a batch for the
          same project. It also means the limit on the longest side changes the
          file without changing the design: shrink the output and the watermark
          shrinks with it.
        </p>
      </ToolSection>

      <ToolSection title="Placing it so it survives">
        <p>
          A small mark in a corner is polite and easy to crop off. A large mark at
          an angle across the middle is harder to remove and harder to ignore.
          Which one you want depends on whether the watermark is a signature or a
          deterrent, and the same tool does both: corner position with a low size
          for one, centre with 60 or 70 per cent and 45 degrees for the other.
        </p>
        <p>
          Rotation is measured about the anchor point, and the anchor is placed
          using the box the rotated watermark really occupies. That is why a
          diagonal mark in a corner stays inside the frame instead of running off
          the edge, which is the usual bug in tools that rotate after positioning.
        </p>
        <p>
          Opacity is where most people overdo it. Anything above about 60 per cent
          starts to compete with the picture. Between 25 and 50 is readable
          without taking over, and the outline option buys back the legibility you
          lose at the low end.
        </p>
      </ToolSection>

      <ToolSection title="What a watermark can and cannot do">
        <p>
          It travels with the file. When a picture is re-shared, screenshotted or
          pulled into a slide deck, a visible mark goes with it and says who made
          it. That is genuinely useful and it costs nothing.
        </p>
        <p>
          It is not protection. Anyone with an editor and some patience can paint
          out a corner mark, and the tools that do it automatically are getting
          better. Size and placement are your only real levers: the more of the
          picture the mark crosses, the more damage removing it does.
        </p>
        <p>
          Working with documents rather than pictures? Use{" "}
          <Link href="/watermark-pdf" className="font-bold text-[#111] underline underline-offset-2">
            watermark PDF
          </Link>{" "}
          to stamp every page at once, and{" "}
          <Link
            href="/add-page-numbers-to-pdf"
            className="font-bold text-[#111] underline underline-offset-2"
          >
            add page numbers to PDF
          </Link>{" "}
          before you print. For a profile picture there is{" "}
          <Link href="/circle-crop" className="font-bold text-[#111] underline underline-offset-2">
            circle crop
          </Link>
          .
        </p>
      </ToolSection>

      <ToolSection title="Frequently asked questions" id="faq">
        <FaqList items={WATERMARK_IMAGE_FAQS} />
      </ToolSection>

      <ToolCta
        location="watermark_image"
        heading="Mark the picture. Then learn the material."
        body="FORKSAI turns your notes, slides and PDFs into flashcards and spaced repetition sessions, so your revision lands on what you have not learned yet."
      />

      <ImageToolCrossLinks current="/watermark-image" />
    </ToolPageShell>
  );
}
