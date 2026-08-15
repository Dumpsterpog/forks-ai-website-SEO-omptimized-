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
  NUMBER_FORMATS,
  NUMBER_POSITIONS,
  formatLabel,
  stampPlacement,
  unsupportedCharacters,
} from "./stamp";
import { PAGE_NUMBERS_FAQS } from "./faqs";

const FONTS = [
  { id: "Helvetica", label: "Helvetica, plain sans serif" },
  { id: "Helvetica-Bold", label: "Helvetica bold" },
  { id: "Times-Roman", label: "Times, serif" },
  { id: "Courier", label: "Courier, monospace" },
];

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

export default function PageNumbersContent() {
  const preview = usePdfPreview();
  const [rangeText, setRangeText] = useState("");
  const [firstNumber, setFirstNumber] = useState("1");
  const [formatId, setFormatId] = useState("n");
  const [customTemplate, setCustomTemplate] = useState("Page {n} of {N}");
  const [position, setPosition] = useState("bottom-center");
  const [fontId, setFontId] = useState("Helvetica");
  const [fontSize, setFontSize] = useState("11");
  const [margin, setMargin] = useState("28");
  const [color, setColor] = useState("#111111");

  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(null);

  const ready = preview.pageCount > 0 && !preview.error;

  // A blank range means every page, which is what someone who never touched the
  // box expects, so it is not an error.
  const parsed = useMemo(() => {
    if (!ready) return { pages: [], error: null };
    if (!rangeText.trim()) {
      return { pages: Array.from({ length: preview.pageCount }, (_, i) => i + 1), error: null };
    }
    return parsePageSelection(rangeText, preview.pageCount);
  }, [rangeText, preview.pageCount, ready]);

  const template =
    formatId === "custom"
      ? customTemplate
      : NUMBER_FORMATS.find((f) => f.id === formatId)?.template || "{n}";

  const start = Number.parseInt(firstNumber, 10);
  const size = Number(fontSize);
  const marginPt = Number(margin);

  const total = parsed.pages.length ? (Number.isFinite(start) ? start : 1) + parsed.pages.length - 1 : 0;

  // Which number lands on which page. One place, so the preview and the saved
  // file cannot disagree.
  const labelForPage = useMemo(() => {
    const map = new Map();
    parsed.pages.forEach((page, i) => {
      map.set(page, formatLabel(template, (Number.isFinite(start) ? start : 1) + i, total));
    });
    return map;
  }, [parsed.pages, template, start, total]);

  const settingsError = useMemo(() => {
    if (!ready) return "";
    if (parsed.error) return parsed.error;
    if (!Number.isFinite(start)) return "The first number has to be a whole number.";
    if (!(size >= 4 && size <= 72)) return "The font size has to be between 4 and 72 points.";
    if (!(marginPt >= 0 && marginPt <= 200)) return "The margin has to be between 0 and 200 points.";
    if (!template.trim()) return "Write what each number should say, using {n} for the number.";
    const bad = unsupportedCharacters(template);
    if (bad) {
      return `The built in PDF fonts cannot draw ${bad}. Stick to Latin letters, digits and punctuation.`;
    }
    return "";
  }, [ready, parsed.error, start, size, marginPt, template]);

  const openFile = async (files) => {
    setStatus(null);
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
      const font = await doc.embedFont(StandardFonts[
        fontId === "Helvetica-Bold"
          ? "HelveticaBold"
          : fontId === "Times-Roman"
            ? "TimesRoman"
            : fontId === "Courier"
              ? "Courier"
              : "Helvetica"
      ]);
      const { r, g, b } = hexToRgb(color);

      setProgress({ done: 0, total: parsed.pages.length, label: "Stamping pages" });
      await yieldToBrowser();

      let done = 0;
      for (const pageNumber of parsed.pages) {
        const page = pages[pageNumber - 1];
        if (!page) continue;
        const label = labelForPage.get(pageNumber) || "";
        const { width, height } = page.getSize();
        const box = page.getMediaBox();
        const rotation = page.getRotation().angle;

        const textWidth = font.widthOfTextAtSize(label, size);
        const textHeight = font.heightAtSize(size);

        const placement = stampPlacement({
          width,
          height,
          rotation,
          position,
          margin: marginPt,
          textWidth,
          textHeight,
          offset: { x: box.x, y: box.y },
        });

        page.drawText(label, {
          x: placement.x,
          y: placement.y,
          size,
          font,
          color: rgb(r, g, b),
          // Cancels the rotation the reader is about to apply, so the number
          // reads the right way up on a page that arrived sideways.
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
        label: "Writing the numbered PDF",
      });
      await yieldToBrowser();

      const out = await doc.save();
      const name = `${baseName(preview.file.name)}-numbered.pdf`;
      downloadBlob(new Blob([out], { type: "application/pdf" }), name);
      setStatus({
        tone: "success",
        text: `Saved ${name}. ${parsed.pages.length} ${plural(parsed.pages.length, "page was", "pages were")} numbered, and all ${preview.pageCount} ${plural(preview.pageCount, "page is", "pages are")} still there.`,
      });
    } catch (error) {
      setStatus({ tone: "error", text: describePdfError(error, preview.file?.name) });
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  const [row, column] = position.split("-");
  const overlayStyle = {
    position: "absolute",
    [row === "top" ? "top" : "bottom"]: "4%",
    ...(column === "left"
      ? { left: "6%" }
      : column === "right"
        ? { right: "6%" }
        : { left: "50%", transform: "translateX(-50%)" }),
  };

  return (
    <ToolPageShell>
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif font-black text-3xl sm:text-[2.6rem] leading-[1.08] text-[#111] mb-3">
          Add page numbers to a PDF
        </h1>
        <p className="text-[15px] sm:text-base text-[#444] leading-relaxed mb-6 max-w-2xl">
          Stamp numbers onto a PDF that does not have them. Choose the corner, the
          wording, the size and which pages get one, and start the count wherever
          your submission wants it to start. Sideways pages are numbered the right
          way up. Your file never leaves your browser.
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
              <fieldset className="mt-6">
                <legend className={labelClass}>What each number says</legend>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="numbers-format" className={labelClass}>
                      Format
                    </label>
                    <select
                      id="numbers-format"
                      value={formatId}
                      onChange={(e) => setFormatId(e.target.value)}
                      disabled={busy}
                      className={inputClass}
                    >
                      {NUMBER_FORMATS.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formatId === "custom" ? (
                    <div>
                      <label htmlFor="numbers-template" className={labelClass}>
                        Your wording
                      </label>
                      <input
                        id="numbers-template"
                        type="text"
                        value={customTemplate}
                        maxLength={60}
                        onChange={(e) => setCustomTemplate(e.target.value)}
                        disabled={busy}
                        className={inputClass}
                      />
                      <p className={hintClass}>
                        {"{n}"} is the number of the page, {"{N}"} is the last number printed.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="numbers-first" className={labelClass}>
                        First number
                      </label>
                      <input
                        id="numbers-first"
                        type="number"
                        inputMode="numeric"
                        value={firstNumber}
                        onChange={(e) => setFirstNumber(e.target.value)}
                        disabled={busy}
                        className={inputClass}
                      />
                      <p className={hintClass}>
                        What the first numbered page is called. Usually 1.
                      </p>
                    </div>
                  )}
                </div>

                {formatId === "custom" ? (
                  <div className="mt-4 sm:max-w-xs">
                    <label htmlFor="numbers-first-custom" className={labelClass}>
                      First number
                    </label>
                    <input
                      id="numbers-first-custom"
                      type="number"
                      inputMode="numeric"
                      value={firstNumber}
                      onChange={(e) => setFirstNumber(e.target.value)}
                      disabled={busy}
                      className={inputClass}
                    />
                  </div>
                ) : null}

                <div className="mt-4">
                  <label htmlFor="numbers-range" className={labelClass}>
                    Pages to number
                  </label>
                  <input
                    id="numbers-range"
                    type="text"
                    inputMode="numeric"
                    value={rangeText}
                    onChange={(e) => setRangeText(e.target.value)}
                    placeholder={`Blank for all ${preview.pageCount}, or 3-, or 2-9`}
                    disabled={busy}
                    className={inputClass}
                  />
                  <p className={hintClass}>
                    Commas between pages, dashes for ranges. Leave it blank to number
                    every page, or write 3- to leave a cover and a contents page alone.
                  </p>
                </div>
              </fieldset>

              <fieldset className="mt-6">
                <legend className={labelClass}>Where it goes and how it looks</legend>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="numbers-position" className={labelClass}>
                      Position
                    </label>
                    <select
                      id="numbers-position"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      disabled={busy}
                      className={inputClass}
                    >
                      {NUMBER_POSITIONS.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="numbers-font" className={labelClass}>
                      Typeface
                    </label>
                    <select
                      id="numbers-font"
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

                <div className="grid sm:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label htmlFor="numbers-size" className={labelClass}>
                      Font size
                    </label>
                    <input
                      id="numbers-size"
                      type="number"
                      inputMode="numeric"
                      min={4}
                      max={72}
                      value={fontSize}
                      onChange={(e) => setFontSize(e.target.value)}
                      disabled={busy}
                      className={inputClass}
                    />
                    <p className={hintClass}>Points, the same unit Word uses.</p>
                  </div>
                  <div>
                    <label htmlFor="numbers-margin" className={labelClass}>
                      Margin from the edge
                    </label>
                    <input
                      id="numbers-margin"
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
                    <label htmlFor="numbers-color" className={labelClass}>
                      Colour
                    </label>
                    <input
                      id="numbers-color"
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      disabled={busy}
                      className="h-12 w-24 border-2 border-black rounded-xl bg-white p-1 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
                    />
                  </div>
                </div>
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
                  one. The numbering itself is unaffected.
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
                      const label = labelForPage.get(i + 1);
                      return (
                        <li
                          key={i}
                          className="border-2 border-black rounded-xl overflow-hidden bg-white p-2"
                          style={{ opacity: label ? 1 : 0.45 }}
                        >
                          <span className="relative block">
                            {thumb ? (
                              <img src={thumb} alt="" className="block w-full h-auto" />
                            ) : (
                              <span className="flex h-24 items-center justify-center text-xs font-bold text-[#999]">
                                page {i + 1}
                              </span>
                            )}
                            {label && thumb ? (
                              <span
                                aria-hidden="true"
                                style={overlayStyle}
                                className="text-[7px] leading-none font-bold px-1 py-0.5 rounded bg-white/85 text-[#111] whitespace-nowrap"
                              >
                                {label}
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
                    The overlay shows which page gets which number and roughly where it
                    lands. The exact size is the font size you set above. Pages with no
                    overlay are left alone.
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
                  {busy ? "Saving" : "Save numbered PDF"}
                </button>
                <span className="text-xs text-[#666] font-bold">
                  {settingsError
                    ? "Fix the setting above first."
                    : `${parsed.pages.length} of ${preview.pageCount} ${plural(preview.pageCount, "page", "pages")} will be numbered.`}
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

      <ToolSection title="Why sideways pages usually go wrong">
        <p>
          A PDF page has two sizes: the one written in the file, and the one you
          see. A page can carry a rotation of 0, 90, 180 or 270 degrees, and every
          reader applies it when drawing. A scanned landscape sheet is very often
          stored as a portrait page with a quarter turn on it.
        </p>
        <p>
          Tools that stamp a number at the bottom of the stored page get that
          wrong. On a page with a quarter turn, the stored bottom is the visible
          left edge, so the number comes out running up the side of the sheet,
          rotated ninety degrees, sometimes half off the paper.
        </p>
        <p>
          This tool places the number in the frame you actually see, then converts
          that point back into the page&apos;s own coordinates and rotates the text
          by the same amount the reader is about to rotate the page. The two turns
          cancel, so the number sits along the visible bottom edge and reads the
          right way up. A file that mixes portrait and landscape scans comes out
          consistent.
        </p>
      </ToolSection>

      <ToolSection title="Numbering that starts somewhere else">
        <p>
          Submissions rarely want the cover counted. Two boxes cover it: the page
          range decides which sheets get stamped, and the first number decides what
          the first stamped sheet is called.
        </p>
        <p>
          Leave a title page and a contents page clean and start the count at 1 on
          the third sheet by writing <strong>3-</strong> in the range and 1 in the
          first number. Continue a second volume from where the first ended by
          leaving the range blank and setting the first number to 84. The preview
          shows exactly which number lands on which page before you save.
        </p>
        <p>
          Page 1 of N uses the last number the tool prints rather than the sheet
          count, so a numbered sequence always ends on its own total instead of
          quoting a number the reader never sees.
        </p>
      </ToolSection>

      <ToolSection title="What the file looks like afterwards">
        <p>
          Nothing existing is touched. The numbers are added as new content on top
          of each page, so text stays selectable, images are not re-compressed and
          the page count is exactly what it was. The tool says how many pages it
          stamped and how many the file still has, so you can check.
        </p>
        <p>
          The fonts are the ones built into every PDF reader, so nothing has to be
          embedded and the file grows by a fraction of a kilobyte per page. That is
          also why the wording is limited to Latin letters, digits and punctuation.
        </p>
        <p>
          Related:{" "}
          <Link href="/watermark-pdf" className="font-bold text-[#111] underline underline-offset-2">
            watermark PDF
          </Link>{" "}
          stamps text or a logo across the pages instead of numbering them,{" "}
          <Link href="/rotate-pdf" className="font-bold text-[#111] underline underline-offset-2">
            rotate PDF
          </Link>{" "}
          straightens a sideways scan for good, and{" "}
          <Link href="/merge-pdf" className="font-bold text-[#111] underline underline-offset-2">
            merge PDF
          </Link>{" "}
          joins the parts together before you number the result. For pictures there
          is{" "}
          <Link href="/watermark-image" className="font-bold text-[#111] underline underline-offset-2">
            watermark image
          </Link>{" "}
          and{" "}
          <Link href="/circle-crop" className="font-bold text-[#111] underline underline-offset-2">
            circle crop
          </Link>
          .
        </p>
      </ToolSection>

      <ToolSection title="Frequently asked questions" id="faq">
        <FaqList items={PAGE_NUMBERS_FAQS} />
      </ToolSection>

      <PdfToolCta
        location="add_page_numbers_to_pdf"
        heading="Numbered pages are the easy half"
        body="FORKSAI takes the PDF you have just tidied up and turns it into flashcards, a summary and a revision schedule you can actually keep."
      />

      <PdfToolCrossLinks current="/add-page-numbers-to-pdf" />
    </ToolPageShell>
  );
}
