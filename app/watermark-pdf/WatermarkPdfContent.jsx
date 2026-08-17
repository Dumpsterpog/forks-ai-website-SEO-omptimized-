"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Save } from "lucide-react";
import ToolPageShell, {
  ToolSection,
  FaqList,
  cardClass,
  inputClass,
  labelClass,
  hintClass,
  buttonClass,
} from "@/components/ToolPageShell";
import {
  FilePicker,
  FileSizeWarning,
  OnDeviceNote,
  PdfToolCrossLinks,
  PdfToolCta,
  ProgressBar,
  StatusRegion,
  usePdfPreview,
} from "@/lib/pdfToolsShell";
import {
  baseName,
  downloadBlob,
  formatBytes,
  parsePageSelection,
  plural,
  yieldToBrowser,
} from "@/lib/pdfTools";
import { describePdfError, loadPdfLib, readFileBytes } from "@/lib/pdfToolsPdf";
import {
  WATERMARK_POSITIONS,
  watermarkPlacement,
  unsupportedCharacters,
} from "./watermark";
import { WATERMARK_PDF_FAQS } from "./faqs";

const FONTS = [
  { id: "Helvetica-Bold", label: "Helvetica bold" },
  { id: "Helvetica", label: "Helvetica, plain sans serif" },
  { id: "Times-Roman", label: "Times, serif" },
  { id: "Courier", label: "Courier, monospace" },
];

const STANDARD_FONT_KEYS = {
  "Helvetica-Bold": "HelveticaBold",
  Helvetica: "Helvetica",
  "Times-Roman": "TimesRoman",
  Courier: "Courier",
};

// Hex to the 0 to 1 triple pdf-lib wants.
function hexToRgb(hex) {
  const clean = String(hex).replace("#", "");
  const full = clean.length === 3 ? [...clean].map((c) => c + c).join("") : clean;
  const n = parseInt(full, 16);
  if (!Number.isFinite(n)) return { r: 0, g: 0, b: 0 };
  return {
    r: ((n >> 16) & 255) / 255,
    g: ((n >> 8) & 255) / 255,
    b: (n & 255) / 255,
  };
}

export default function WatermarkPdfContent() {
  const preview = usePdfPreview();
  const [text, setText] = useState("CONFIDENTIAL");
  const [scope, setScope] = useState("all");
  const [rangeText, setRangeText] = useState("");
  const [position, setPosition] = useState("middle-center");
  const [angle, setAngle] = useState(45);
  const [sizePercent, setSizePercent] = useState(60);
  const [opacity, setOpacity] = useState(20);
  const [color, setColor] = useState("#d02f2f");
  const [fontId, setFontId] = useState("Helvetica-Bold");
  const [margin, setMargin] = useState("28");

  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(null);

  const ready = preview.pageCount > 0 && !preview.error;
  const marginPt = Number(margin);

  const parsed = useMemo(() => {
    if (!ready) return { pages: [], error: null };
    if (scope === "all" || !rangeText.trim()) {
      return { pages: Array.from({ length: preview.pageCount }, (_, i) => i + 1), error: null };
    }
    return parsePageSelection(rangeText, preview.pageCount);
  }, [ready, scope, rangeText, preview.pageCount]);

  const settingsError = useMemo(() => {
    if (!ready) return "";
    if (parsed.error) return parsed.error;
    if (!text.trim()) return "Type the words you want stamped across the pages.";
    if (!(marginPt >= 0 && marginPt <= 200)) return "The margin has to be between 0 and 200 points.";
    const bad = unsupportedCharacters(text);
    if (bad) {
      return `The built in PDF fonts cannot draw ${bad}. Stick to Latin letters, digits and punctuation.`;
    }
    return "";
  }, [ready, parsed.error, text, marginPt]);

  const openFile = async (files) => {
    setStatus(null);
    setScope("all");
    setRangeText("");
    await preview.load(files[0]);
  };

  const save = async () => {
    setBusy(true);
    setStatus(null);
    setProgress({ done: 0, total: 1, label: "Reading the PDF" });

    try {
      const { PDFDocument, StandardFonts, rgb, degrees } = await loadPdfLib();
      const bytes = await readFileBytes(preview.file);
      const doc = await PDFDocument.load(bytes);
      const pages = doc.getPages();
      const font = await doc.embedFont(StandardFonts[STANDARD_FONT_KEYS[fontId] || "Helvetica"]);
      const { r, g, b } = hexToRgb(color);
      const label = text.trim();

      setProgress({ done: 0, total: parsed.pages.length, label: "Stamping pages" });
      await yieldToBrowser();

      let done = 0;
      for (const pageNumber of parsed.pages) {
        const page = pages[pageNumber - 1];
        if (!page) continue;
        const { width, height } = page.getSize();
        const box = page.getMediaBox();
        const rotation = page.getRotation().angle;

        const placement = watermarkPlacement({
          width,
          height,
          rotation,
          position,
          margin: marginPt,
          angle,
          sizePercent,
          // Only the embedded font can measure its own text, so the placement
          // module asks for the measurement rather than guessing at it.
          measure: (size) => ({
            width: font.widthOfTextAtSize(label, size),
            height: font.heightAtSize(size),
          }),
          offset: { x: box.x, y: box.y },
        });

        page.drawText(label, {
          x: placement.x,
          y: placement.y,
          size: placement.fontSize,
          font,
          color: rgb(r, g, b),
          opacity: opacity / 100,
          // The watermark's own angle plus the page's rotation, which cancels
          // the turn the reader is about to apply. Without it, a diagonal on a
          // sideways scan crosses the page the wrong way.
          rotate: degrees(placement.angle),
        });

        done += 1;
        if (done % 25 === 0) {
          setProgress({ done, total: parsed.pages.length, label: "Stamping pages" });
          await yieldToBrowser();
        }
      }

      setProgress({
        done: parsed.pages.length,
        total: parsed.pages.length,
        label: "Writing the watermarked PDF",
      });
      await yieldToBrowser();

      const out = await doc.save();
      const name = `${baseName(preview.file.name)}-watermarked.pdf`;
      downloadBlob(new Blob([out], { type: "application/pdf" }), name);
      setStatus({
        tone: "success",
        text: `Saved ${name}. ${parsed.pages.length} ${plural(parsed.pages.length, "page was", "pages were")} stamped, and all ${preview.pageCount} ${plural(preview.pageCount, "page is", "pages are")} still there.`,
      });
    } catch (error) {
      setStatus({ tone: "error", text: describePdfError(error, preview.file?.name) });
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  const [row, column] = position.split("-");
  // The thumbnail is already drawn in the visible frame, so the overlay only
  // needs the same position and angle to sit roughly where the real stamp will.
  const overlayStyle = {
    position: "absolute",
    left: column === "left" ? "6%" : column === "right" ? "94%" : "50%",
    top: row === "top" ? "10%" : row === "bottom" ? "90%" : "50%",
    transform: `translate(-50%, -50%) rotate(${-angle}deg)`,
    transformOrigin: "center",
    color,
    opacity: opacity / 100,
    fontSize: `${Math.max(3, sizePercent / 9)}px`,
    fontWeight: 800,
    whiteSpace: "nowrap",
    lineHeight: 1,
    maxWidth: "none",
  };

  return (
    <ToolPageShell>
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif font-black text-3xl sm:text-[2.6rem] leading-[1.08] text-[#111] mb-3">
          Watermark a PDF
        </h1>
        <p className="text-[15px] sm:text-base text-[#444] leading-relaxed mb-6 max-w-2xl">
          Stamp draft, sample, confidential or any other wording across the pages
          of a PDF. Set the angle, the size, how faint it is and which pages get
          it. Pages that were scanned sideways are stamped straight, not along
          the spine. Your file never leaves your browser.
        </p>

        <div className={`${cardClass} p-5 sm:p-7`}>
          <FilePicker
            label={preview.file ? "Choose a different PDF" : "Drop your PDF here"}
            hint="One file at a time."
            onFiles={openFile}
            disabled={busy}
          />

          {preview.file ? (
            <p className="mt-3 text-xs text-[#666]">
              <span className="font-bold text-[#111]">{preview.file.name}</span>
              {preview.pageCount
                ? `, ${preview.pageCount} ${plural(preview.pageCount, "page", "pages")}, ${formatBytes(preview.file.size)}`
                : preview.loading
                  ? ", opening"
                  : ""}
            </p>
          ) : null}

          <div className="mt-3">
            <FileSizeWarning file={preview.file} />
          </div>

          {preview.error ? (
            <div className="mt-4">
              <StatusRegion tone="error">{preview.error}</StatusRegion>
            </div>
          ) : null}

          {ready ? (
            <>
              <div className="mt-6">
                <label htmlFor="watermark-text" className={labelClass}>
                  Watermark text
                </label>
                <input
                  id="watermark-text"
                  name="watermark-text"
                  type="text"
                  value={text}
                  maxLength={80}
                  onChange={(e) => setText(e.target.value)}
                  disabled={busy}
                  className={inputClass}
                />
                <p className={hintClass}>
                  Short wording reads best. A long phrase is scaled down to fit inside
                  the margins.
                </p>
              </div>

              <fieldset className="mt-6">
                <legend className={labelClass}>Where it goes and how it looks</legend>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="watermark-position" className={labelClass}>
                      Position
                    </label>
                    <select
                      id="watermark-position"
                      name="watermark-position"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      disabled={busy}
                      className={inputClass}
                    >
                      {WATERMARK_POSITIONS.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="watermark-font" className={labelClass}>
                      Typeface
                    </label>
                    <select
                      id="watermark-font"
                      name="watermark-font"
                      value={fontId}
                      onChange={(e) => setFontId(e.target.value)}
                      disabled={busy}
                      className={inputClass}
                    >
                      {FONTS.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="watermark-angle" className={labelClass}>
                    Angle: {angle} degrees
                  </label>
                  <input
                    id="watermark-angle"
                    name="watermark-angle"
                    type="range"
                    min={-90}
                    max={90}
                    step={5}
                    value={angle}
                    onChange={(e) => setAngle(Number(e.target.value))}
                    disabled={busy}
                    className="w-full accent-[#111] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A] rounded-lg"
                  />
                  <p className={hintClass}>
                    0 lies flat, 45 runs corner to corner, 90 reads up the page.
                  </p>
                </div>

                <div className="mt-4">
                  <label htmlFor="watermark-size" className={labelClass}>
                    Size: {sizePercent} percent of the page width
                  </label>
                  <input
                    id="watermark-size"
                    name="watermark-size"
                    type="range"
                    min={5}
                    max={100}
                    step={5}
                    value={sizePercent}
                    onChange={(e) => setSizePercent(Number(e.target.value))}
                    disabled={busy}
                    className="w-full accent-[#111] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A] rounded-lg"
                  />
                  <p className={hintClass}>
                    A share of the page rather than a point size, so the stamp looks the
                    same on A4 and on a landscape slide.
                  </p>
                </div>

                <div className="mt-4">
                  <label htmlFor="watermark-opacity" className={labelClass}>
                    Opacity: {opacity} percent
                  </label>
                  <input
                    id="watermark-opacity"
                    name="watermark-opacity"
                    type="range"
                    min={5}
                    max={100}
                    step={5}
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    disabled={busy}
                    className="w-full accent-[#111] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A] rounded-lg"
                  />
                  <p className={hintClass}>
                    Around 15 to 25 percent stays readable without burying the text
                    underneath it.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label htmlFor="watermark-margin" className={labelClass}>
                      Margin from the edge
                    </label>
                    <input
                      id="watermark-margin"
                      name="watermark-margin"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={200}
                      value={margin}
                      onChange={(e) => setMargin(e.target.value)}
                      disabled={busy}
                      className={inputClass}
                    />
                    <p className={hintClass}>Points. 28 is about a centimetre.</p>
                  </div>
                  <div>
                    <label htmlFor="watermark-color" className={labelClass}>
                      Colour
                    </label>
                    <input
                      id="watermark-color"
                      name="watermark-color"
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      disabled={busy}
                      className="h-12 w-24 border-2 border-black rounded-xl bg-white p-1 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
                    />
                  </div>
                </div>
              </fieldset>

              <fieldset className="mt-6">
                <legend className={labelClass}>Which pages get it</legend>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "all", label: `Every page, all ${preview.pageCount}` },
                    { id: "range", label: "Only these pages" },
                  ].map((option) => (
                    <label
                      key={option.id}
                      htmlFor={`watermark-scope-${option.id}`}
                      className="inline-flex items-center gap-2 border-2 border-black rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#111] cursor-pointer"
                      style={{ background: scope === option.id ? "#F0D44A" : "#FFFFFF" }}
                    >
                      <input
                        id={`watermark-scope-${option.id}`}
                        name="watermark-scope"
                        type="radio"
                        value={option.id}
                        checked={scope === option.id}
                        onChange={() => setScope(option.id)}
                        disabled={busy}
                        className="h-4 w-4 accent-[#111]"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>

                {scope === "range" ? (
                  <div className="mt-4">
                    <label htmlFor="watermark-range" className={labelClass}>
                      Pages to stamp
                    </label>
                    <input
                      id="watermark-range"
                      name="watermark-range"
                      type="text"
                      inputMode="numeric"
                      value={rangeText}
                      onChange={(e) => setRangeText(e.target.value)}
                      placeholder={`1-3, 7, or 4- for the fourth page on`}
                      disabled={busy}
                      className={inputClass}
                    />
                    <p className={hintClass}>
                      Commas between pages, dashes for ranges. Every other page is
                      written out untouched.
                    </p>
                  </div>
                ) : null}
              </fieldset>

              {settingsError ? (
                <p
                  role="alert"
                  className="mt-4 border-2 border-black rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#111]"
                >
                  {settingsError}
                </p>
              ) : null}

              {preview.tooManyPages ? (
                <p className="mt-5 text-xs text-[#111] font-bold border-2 border-black rounded-xl bg-white px-4 py-3 leading-relaxed">
                  This PDF is long enough that drawing a preview of every page costs
                  more time than it saves, so the settings above are applied without
                  one. The watermarking itself is unaffected.
                </p>
              ) : (
                <div className="mt-6">
                  <p className={labelClass}>Preview</p>
                  {preview.thumbProgress ? (
                    <div className="mb-3">
                      <ProgressBar
                        done={preview.thumbProgress.done}
                        total={preview.thumbProgress.total}
                        label="Drawing page previews"
                      />
                    </div>
                  ) : null}
                  <ul className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
                    {preview.thumbs.map((thumb, i) => {
                      const stamped = parsed.pages.includes(i + 1);
                      return (
                        <li
                          key={i}
                          className="border-2 border-black rounded-xl overflow-hidden bg-white p-2"
                          style={{ opacity: stamped ? 1 : 0.45 }}
                        >
                          <span className="relative block overflow-hidden">
                            {thumb ? (
                              <img src={thumb} alt="" className="block w-full h-auto" />
                            ) : (
                              <span className="flex h-24 items-center justify-center text-xs font-bold text-[#999]">
                                page {i + 1}
                              </span>
                            )}
                            {stamped && thumb && text.trim() ? (
                              <span aria-hidden="true" style={overlayStyle}>
                                {text.trim()}
                              </span>
                            ) : null}
                          </span>
                          <span className="block text-center text-xs font-black text-[#111] mt-1.5">
                            {i + 1}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                  <p className={hintClass}>
                    The overlay shows which pages get stamped and roughly where the
                    words land. The saved file measures the real text against the real
                    page, so the size is exact there. Pages with no overlay are left
                    alone.
                  </p>
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={save}
                  disabled={busy || Boolean(settingsError)}
                  className={`${buttonClass} disabled:opacity-40`}
                  style={{ background: busy || settingsError ? "#FFFFFF" : "#F0D44A" }}
                >
                  <Save size={16} strokeWidth={2.75} aria-hidden="true" />
                  {busy ? "Saving" : "Save watermarked PDF"}
                </button>
                <span className="text-xs text-[#666] font-bold">
                  {settingsError
                    ? "Fix the setting above first."
                    : `${parsed.pages.length} of ${preview.pageCount} ${plural(preview.pageCount, "page", "pages")} will be stamped.`}
                </span>
              </div>
            </>
          ) : null}

          {progress ? (
            <div className="mt-5">
              <ProgressBar done={progress.done} total={progress.total} label={progress.label} />
            </div>
          ) : null}

          <div className="mt-5">
            <StatusRegion tone={status?.tone}>{status?.text}</StatusRegion>
          </div>

          <OnDeviceNote className="mt-5" />
        </div>
      </section>

      <ToolSection title="Why a diagonal usually lands crooked">
        <p>
          A PDF page has two sizes: the one written in the file, and the one you
          see. A page can carry a rotation of 0, 90, 180 or 270 degrees, and every
          reader applies it when drawing. A scanned landscape sheet is very often
          stored as a portrait page with a quarter turn on it.
        </p>
        <p>
          Tools that stamp across the stored page get that wrong. On a page with a
          quarter turn, a 45 degree diagonal drawn in the file comes out at 135
          degrees on screen, crossing the other way and hanging off the corners,
          and a flat watermark ends up running up the spine.
        </p>
        <p>
          This tool works out where the watermark goes in the frame you actually
          see, converts that point back into the page&apos;s own coordinates, then
          adds the page&apos;s rotation to the text angle so the reader&apos;s turn
          cancels out. A file that mixes portrait and landscape scans comes out
          consistent, every stamp crossing at the same angle.
        </p>
      </ToolSection>

      <ToolSection title="Size as a share of the page, not a point size">
        <p>
          A 48 point watermark is a bold statement on a phone sized page and a
          small caption on an A0 poster, which is why the size here is a
          percentage of the page width instead. Sixty percent means the stamp
          spans roughly sixty percent of the sheet whatever the sheet is, so a
          report that mixes A4 pages with a landscape appendix stays consistent.
        </p>
        <p>
          The margin is a hard limit on top of that. A long phrase turned to 45
          degrees needs more room than the same phrase lying flat, because a
          turned box is wider and taller than the text inside it, so the size is
          reduced until the whole thing fits. That is why a very long watermark
          comes out smaller than the percentage you asked for.
        </p>
      </ToolSection>

      <ToolSection title="What a watermark is good for, and what it is not">
        <p>
          A watermark is a label. It says draft, sample, confidential or not for
          distribution loudly enough that nobody circulates the file by accident,
          and it survives printing, screenshotting and being emailed on, which a
          note in a covering message does not.
        </p>
        <p>
          It is not protection. The text is ordinary page content, so someone with
          a PDF editor can select it and delete it, and nothing drawn on a page can
          stop a camera. If the file genuinely must not be read by the wrong
          person, a watermark is the wrong tool. Use it to prevent mistakes, not to
          stop determined people.
        </p>
        <p>
          Around 15 to 25 percent opacity is the sweet spot. Fainter than that and
          it disappears when the page is printed in greyscale. Darker and the text
          underneath becomes hard to read, which defeats the point of sending the
          draft at all.
        </p>
      </ToolSection>

      <ToolSection title="What the file looks like afterwards">
        <p>
          Nothing existing is touched. The watermark is added as new content on top
          of each page, so text stays selectable, images are not re-compressed and
          the page count is exactly what it was. The tool says how many pages it
          stamped and how many the file still has, so you can check.
        </p>
        <p>
          The typefaces are the ones built into every PDF reader, so nothing has to
          be embedded and the file grows by a fraction of a kilobyte per page. That
          is also why the wording is limited to Latin letters, digits and
          punctuation.
        </p>
        <p>
          Related:{" "}
          <Link
            href="/add-page-numbers-to-pdf"
            className="font-bold text-[#111] underline underline-offset-2"
          >
            add page numbers to PDF
          </Link>{" "}
          stamps numbers instead of a label,{" "}
          <Link href="/rotate-pdf" className="font-bold text-[#111] underline underline-offset-2">
            rotate PDF
          </Link>{" "}
          straightens a sideways scan for good, and{" "}
          <Link href="/merge-pdf" className="font-bold text-[#111] underline underline-offset-2">
            merge PDF
          </Link>{" "}
          joins the parts together before you stamp the result. For pictures there
          is{" "}
          <Link
            href="/watermark-image"
            className="font-bold text-[#111] underline underline-offset-2"
          >
            watermark image
          </Link>
          .
        </p>
      </ToolSection>

      <ToolSection title="Frequently asked questions" id="faq">
        <FaqList items={WATERMARK_PDF_FAQS} />
      </ToolSection>

      <PdfToolCta
        location="watermark_pdf"
        heading="The draft is stamped. Now learn what is in it."
        body="FORKSAI turns the PDF you have just marked up into flashcards, a summary and a revision schedule you can actually keep."
      />

      <PdfToolCrossLinks current="/watermark-pdf" />
    </ToolPageShell>
  );
}
