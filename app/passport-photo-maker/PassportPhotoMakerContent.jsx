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
  mmToPx,
  renderCrop,
  safeFileName,
  setJpegDensity,
} from "@/lib/imageTools";
import {
  CropStage,
  ImagePicker,
  ImageToolCrossLinks,
  NumberField,
  OutputPreview,
  PrivacyCallout,
  SelectField,
  StatRow,
} from "@/lib/imageToolsUi";
import { PASSPORT_PHOTO_FAQS } from "@/lib/imageToolsFaqs";

// Physical sizes only. The pixel count falls out of the size and the DPI, and
// the arithmetic is shown on the page so it can be checked.
const SIZES = [
  {
    id: "35x45",
    label: "35 x 45 mm, the most widely used passport size",
    w: 35,
    h: 45,
  },
  {
    id: "2x2in",
    label: "2 x 2 in (50.8 x 50.8 mm), the United States size",
    w: 50.8,
    h: 50.8,
  },
  { id: "33x48", label: "33 x 48 mm", w: 33, h: 48 },
  { id: "50x70", label: "50 x 70 mm", w: 50, h: 70 },
  { id: "35x35", label: "35 x 35 mm, square", w: 35, h: 35 },
];

const DPI_CHOICES = [200, 300, 600];

const num = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

export default function PassportPhotoMakerContent() {
  const [image, setImage] = useState(null);
  const [fileError, setFileError] = useState("");
  const [widthMm, setWidthMm] = useState("35");
  const [heightMm, setHeightMm] = useState("45");
  const [dpi, setDpi] = useState("300");
  const [minKb, setMinKb] = useState("0");
  const [maxKb, setMaxKb] = useState("");
  const [view, setView] = useState(DEFAULT_CROP_VIEW);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const previewRef = useRef(null);
  const runId = useRef(0);

  const mmW = num(widthMm);
  const mmH = num(heightMm);
  const dpiValue = num(dpi, 300);
  const outW = mmToPx(mmW, dpiValue);
  const outH = mmToPx(mmH, dpiValue);
  const minBytes = Math.max(0, num(minKb)) * KB;
  const maxBytes = maxKb === "" ? Infinity : Math.max(0, num(maxKb)) * KB;

  const specError = useMemo(() => {
    if (!(mmW >= 10 && mmW <= 300)) return "Width has to be between 10 and 300 mm.";
    if (!(mmH >= 10 && mmH <= 300)) return "Height has to be between 10 and 300 mm.";
    if (!(dpiValue >= 72 && dpiValue <= 1200)) return "Resolution has to be between 72 and 1200 DPI.";
    if (Number.isFinite(maxBytes) && maxBytes > 0 && minBytes > maxBytes) {
      return "The minimum size is larger than the maximum. Swap the two numbers.";
    }
    return "";
  }, [mmW, mmH, dpiValue, minBytes, maxBytes]);

  const aspect = outW / outH;
  const activeSize =
    SIZES.find((s) => String(s.w) === String(mmW) && String(s.h) === String(mmH))?.id || "custom";

  const applySize = (id) => {
    const size = SIZES.find((s) => s.id === id);
    if (!size) return;
    setWidthMm(String(size.w));
    setHeightMm(String(size.h));
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

  useEffect(() => {
    const canvas = previewRef.current;
    if (!image || !canvas || specError) return undefined;

    const rect = cropRect(image.width, image.height, aspect, view);
    renderCrop(image.source, rect, outW, outH, { background: "#ffffff", canvas });

    const id = runId.current + 1;
    runId.current = id;
    setBusy(true);

    const timer = setTimeout(async () => {
      try {
        const encoded = await encodeToSizeBand(canvas, {
          type: "image/jpeg",
          minBytes,
          maxBytes,
          allowPadding: true,
          // The print size lives in the JFIF header, not in the pixel count.
          transform: (bytes) => setJpegDensity(bytes, dpiValue),
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
  }, [image, outW, outH, aspect, view, dpiValue, minBytes, maxBytes, specError]);

  return (
    <ToolPageShell>
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif font-black text-3xl sm:text-[2.6rem] leading-[1.08] text-[#111] mb-3">
          Passport photo maker
        </h1>
        <p className="text-[15px] sm:text-base text-[#444] leading-relaxed mb-6 max-w-2xl">
          Crop a photo to a standard passport or visa size at real print
          resolution. Pick the size in millimetres and the DPI, and the tool works
          out the pixel count, writes the right print resolution into the file,
          and shows you the exact file size before you download. Nothing is
          uploaded.
        </p>

        <div className={`${cardClass} p-5 sm:p-7`}>
          <ImagePicker
            id="passport-source"
            label="1. Choose your photo"
            onPick={pickFile}
            fileName={image ? image.name : ""}
            error={fileError}
          />

          <fieldset className="mt-6">
            <legend className="block text-sm font-bold text-[#111] mb-2">
              2. Size and resolution
            </legend>

            <SelectField
              id="passport-size"
              label="Standard size"
              value={activeSize}
              onChange={applySize}
              hint="Check the rules published by the authority issuing your document. Sizes differ by country and by document type."
            >
              {SIZES.map((size) => (
                <option key={size.id} value={size.id}>
                  {size.label}
                </option>
              ))}
              <option value="custom">Custom, set by the boxes below</option>
            </SelectField>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
              <NumberField
                id="passport-width"
                label="Width"
                value={widthMm}
                onChange={setWidthMm}
                min={10}
                max={300}
                step={0.1}
                suffix="mm"
              />
              <NumberField
                id="passport-height"
                label="Height"
                value={heightMm}
                onChange={setHeightMm}
                min={10}
                max={300}
                step={0.1}
                suffix="mm"
              />
              <SelectField
                id="passport-dpi"
                label="Print resolution"
                value={dpi}
                onChange={setDpi}
              >
                {DPI_CHOICES.map((choice) => (
                  <option key={choice} value={String(choice)}>
                    {choice} DPI
                  </option>
                ))}
              </SelectField>
            </div>

            <p className="text-sm text-[#333] mt-3 leading-relaxed">
              {specError ? null : (
                <>
                  That is <strong>{outW} x {outH} pixels</strong> at {dpiValue} DPI.
                  300 DPI is the usual minimum for a printed photo, and 600 DPI is
                  worth using if a print shop asks for it.
                </>
              )}
            </p>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <NumberField
                id="passport-min"
                label="Minimum file size"
                value={minKb}
                onChange={setMinKb}
                min={0}
                suffix="KB"
              />
              <NumberField
                id="passport-max"
                label="Maximum file size"
                value={maxKb}
                onChange={setMaxKb}
                min={0}
                suffix="KB"
              />
            </div>
            <p className="text-xs text-[#666] mt-1.5 leading-relaxed">
              Leave both at 0 or blank for a full quality print file. Fill them in when an
              online application caps the upload. 1 KB is treated as 1024 bytes.
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
                <p className="block text-sm font-bold text-[#111] mb-2">3. Frame your face</p>
                <CropStage
                  image={image}
                  aspect={aspect}
                  view={view}
                  onView={setView}
                  hint="Head centred, eyes looking straight at the camera, plenty of room above the head. Drag, pinch or use the sliders."
                />
              </div>

              <div className="mt-6 grid sm:grid-cols-2 gap-4 items-start">
                <div>
                  <p className="block text-sm font-bold text-[#111] mb-2">4. Your photo</p>
                  <OutputPreview canvasRef={previewRef} width={outW} height={outH} />
                </div>

                <div aria-live="polite" className="space-y-3">
                  {busy || !result ? (
                    <p className="border-2 border-black rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#111]">
                      Encoding your photo.
                    </p>
                  ) : (
                    <>
                      <p
                        className="border-2 border-black rounded-xl px-4 py-3 text-sm font-bold text-[#111] leading-relaxed"
                        style={{ background: result.status === "ok" ? "#F0D44A" : "#ffffff" }}
                      >
                        {result.status === "too-large"
                          ? `This photo will not compress under ${formatSize(maxBytes)} at ${outW} x ${outH}. The smallest it reaches is ${formatSize(result.bytes)}.`
                          : `Ready: ${mmW} x ${mmH} mm at ${dpiValue} DPI, ${formatSize(result.bytes)}.`}
                      </p>

                      <div className="border-2 border-black rounded-xl bg-white px-4 py-2">
                        <StatRow
                          label="Pixels"
                          value={
                            result.headerWidth
                              ? `${result.headerWidth} x ${result.headerHeight}`
                              : `${outW} x ${outH}`
                          }
                        />
                        <StatRow label="Print size" value={`${mmW} x ${mmH} mm`} />
                        <StatRow label="Resolution" value={`${dpiValue} DPI, written into the file`} />
                        <StatRow
                          label="File size"
                          value={`${formatSize(result.bytes)} (${result.bytes.toLocaleString()} bytes)`}
                        />
                        <StatRow
                          label="JPEG quality"
                          value={result.quality ? result.quality.toFixed(3) : "n/a"}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          downloadBlob(
                            result.blob,
                            safeFileName(image.name, `passport-${outW}x${outH}`, "image/jpeg")
                          )
                        }
                        className={`${buttonClass} w-full`}
                        style={{ background: "#F0D44A" }}
                      >
                        <Download size={16} strokeWidth={2.75} /> Download the JPG
                      </button>
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

      <ToolSection title="How the pixel count is worked out">
        <p>
          A passport photo requirement is a physical size, not a pixel size, so the
          pixel count depends entirely on the resolution you print at. The
          conversion is millimetres to inches to dots:
        </p>
        <FormulaBlock>pixels = round(millimetres / 25.4 x DPI)</FormulaBlock>
        <p>
          For the 35 x 45 mm size at 300 DPI that is 35 / 25.4 x 300 = 413.4, which
          rounds to 413, and 45 / 25.4 x 300 = 531.5, which rounds to 531. So the
          file is 413 x 531 pixels. At 600 DPI the same photo is 827 x 1063. The 2
          x 2 inch size lands on 600 x 600 at 300 DPI with no rounding at all,
          because 2 inches is exactly 600 dots.
        </p>
        <p>
          Rounding to the nearest pixel changes the printed size by less than a
          tenth of a millimetre, which no photo booth or passport office measures
          to.
        </p>
      </ToolSection>

      <ToolSection title="The DPI is written into the file, not just assumed">
        <p>
          A browser canvas writes 72 DPI into the JPEG header whatever the pixel
          count is. That is why a correctly sized photo from most online tools opens
          in print software at the wrong physical size: 413 x 531 pixels at 72 DPI
          is a 146 x 187 mm poster, not a passport photo.
        </p>
        <p>
          This tool rewrites the JFIF density field in the encoded file to the DPI
          you selected, so the file both contains the right number of pixels and
          reports the right print size. Drop it into a print dialog or hand it to a
          print shop and it lands at the size you asked for.
        </p>
      </ToolSection>

      <ToolSection title="What this tool does not do">
        <p>
          It handles size, cropping and resolution. It does not check background
          colour, lighting, shadows, head height, expression, glasses or headwear,
          and it cannot tell you whether a photo will be accepted.
        </p>
        <p>
          Those rules are set by whoever issues your document and they differ
          between countries, between document types and over time. Read the
          published guidance, take the photo against a plain light background in
          even light, and use this for the sizing step.
        </p>
      </ToolSection>

      <ToolSection title="Frequently asked questions" id="faq">
        <FaqList items={PASSPORT_PHOTO_FAQS} />
      </ToolSection>

      <ToolCta
        location="passport_photo_maker"
        heading="Travelling to study? The exam still comes first."
        body="FORKSAI turns your notes, slides and PDFs into flashcards and spaced repetition sessions, so the preparation behind the application holds up too."
      />

      <ImageToolCrossLinks current="/passport-photo-maker" />
    </ToolPageShell>
  );
}
