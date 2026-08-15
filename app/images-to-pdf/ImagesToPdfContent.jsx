"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, FileDown, GripVertical, X } from "lucide-react";
import ToolPageShell, {
  ToolSection,
  FaqList,
  cardClass,
  labelClass,
  hintClass,
  buttonClass,
} from "@/components/ToolPageShell";
import {
  FilePicker,
  IMAGE_ACCEPT,
  OnDeviceNote,
  PdfToolCrossLinks,
  PdfToolCta,
  ProgressBar,
  StatusRegion,
} from "@/lib/pdfToolsShell";
import {
  baseName,
  downloadBlob,
  formatBytes,
  plural,
  yieldToBrowser,
} from "@/lib/pdfTools";
import { loadPdfLib, readFileBytes } from "@/lib/pdfToolsPdf";
import { IMAGES_TO_PDF_FAQS } from "@/lib/pdfToolsFaqs";

// Sizes in PDF points, which are 1/72 inch. A4 and Letter are given portrait
// first and flipped when the orientation calls for it.
const PAGE_SIZES = {
  a4: { label: "A4", size: [595.28, 841.89] },
  letter: { label: "Letter", size: [612, 792] },
  fit: { label: "Fit to image", size: null },
};

const MARGINS = {
  none: { label: "None", points: 0 },
  small: { label: "Small", points: 24 },
  large: { label: "Large", points: 48 },
};

let nextId = 0;

export default function ImagesToPdfContent() {
  const [items, setItems] = useState([]);
  const [pageSize, setPageSize] = useState("a4");
  const [orientation, setOrientation] = useState("auto");
  const [margin, setMargin] = useState("small");
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(null);
  const dragIndex = useRef(null);
  const itemsRef = useRef([]);

  // The unmount cleanup needs the final list, but it only runs once, so it
  // cannot close over the list from any single render. A ref kept in step with
  // state gives it the current one.
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  useEffect(
    () => () => itemsRef.current.forEach((item) => URL.revokeObjectURL(item.url)),
    []
  );

  const addFiles = (files) => {
    const images = files.filter((file) => file.type.startsWith("image/"));
    const rejected = files.length - images.length;

    if (!images.length) {
      setStatus({
        tone: "error",
        text: "Those are not images. This tool takes JPG, PNG and WebP. iPhone HEIC files have to be converted to JPG first, because browsers cannot read them.",
      });
      return;
    }

    setItems((prev) => [
      ...prev,
      ...images.map((file) => ({ id: (nextId += 1), file, url: URL.createObjectURL(file) })),
    ]);
    setStatus(
      rejected > 0
        ? {
            tone: "info",
            text: `Added ${images.length} ${plural(images.length, "image", "images")}. Skipped ${rejected} ${plural(rejected, "file that is not an image", "files that are not images")}.`,
          }
        : null
    );
  };

  const move = (from, to) =>
    setItems((prev) => {
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });

  const remove = (id) =>
    setItems((prev) => {
      const going = prev.find((item) => item.id === id);
      if (going) URL.revokeObjectURL(going.url);
      return prev.filter((item) => item.id !== id);
    });

  // JPG and PNG go into the PDF byte for byte. Anything else, WebP most often,
  // is redrawn through a canvas into PNG first, which is lossless but bigger.
  const embedImage = async (doc, file) => {
    const bytes = await readFileBytes(file);
    if (file.type === "image/jpeg") return doc.embedJpg(bytes);
    if (file.type === "image/png") {
      try {
        return await doc.embedPng(bytes);
      } catch {
        // Some PNGs, interlaced ones in particular, defeat the direct path.
        // The canvas re-encode below handles them.
      }
    }
    return doc.embedPng(await toPngBytes(file));
  };

  const toPngBytes = (file) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      const url = URL.createObjectURL(file);
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        canvas.getContext("2d").drawImage(image, 0, 0);
        canvas.toBlob(async (blob) => {
          URL.revokeObjectURL(url);
          if (!blob) {
            reject(new Error(`${file.name} could not be converted by this browser.`));
            return;
          }
          resolve(new Uint8Array(await blob.arrayBuffer()));
        }, "image/png");
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error(`${file.name} is not an image this browser can open.`));
      };
      image.src = url;
    });

  const build = async () => {
    setBusy(true);
    setStatus(null);
    setProgress({ done: 0, total: items.length, label: "Reading image 1" });

    try {
      const { PDFDocument } = await loadPdfLib();
      const doc = await PDFDocument.create();
      const gap = MARGINS[margin].points;

      for (let i = 0; i < items.length; i += 1) {
        setProgress({
          done: i,
          total: items.length,
          label: `Adding image ${i + 1} of ${items.length}`,
        });
        await yieldToBrowser();

        const embedded = await embedImage(doc, items[i].file);
        const base = PAGE_SIZES[pageSize].size;

        if (!base) {
          // Fit to image: the page is exactly the image, plus the margin, so
          // there is no border and no letterboxing.
          const page = doc.addPage([embedded.width + gap * 2, embedded.height + gap * 2]);
          page.drawImage(embedded, {
            x: gap,
            y: gap,
            width: embedded.width,
            height: embedded.height,
          });
          continue;
        }

        const landscape =
          orientation === "landscape" ||
          (orientation === "auto" && embedded.width > embedded.height);
        const [pw, ph] = landscape ? [base[1], base[0]] : base;
        const page = doc.addPage([pw, ph]);

        const boxWidth = Math.max(1, pw - gap * 2);
        const boxHeight = Math.max(1, ph - gap * 2);
        const scaled = embedded.scaleToFit(boxWidth, boxHeight);
        page.drawImage(embedded, {
          x: (pw - scaled.width) / 2,
          y: (ph - scaled.height) / 2,
          width: scaled.width,
          height: scaled.height,
        });
      }

      setProgress({ done: items.length, total: items.length, label: "Writing the PDF" });
      await yieldToBrowser();

      const out = await doc.save();
      const name = `${baseName(items[0].file.name)}.pdf`;
      const blob = new Blob([out], { type: "application/pdf" });
      downloadBlob(blob, name);
      setStatus({
        tone: "success",
        text: `Saved ${name} with ${items.length} ${plural(items.length, "page", "pages")}, ${formatBytes(blob.size)}.`,
      });
    } catch (error) {
      setStatus({
        tone: "error",
        text: error?.message || "Those images could not be turned into a PDF.",
      });
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  const totalBytes = items.reduce((sum, item) => sum + item.file.size, 0);

  return (
    <ToolPageShell>
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif font-black text-3xl sm:text-[2.6rem] leading-[1.08] text-[#111] mb-3">
          Images to PDF
        </h1>
        <p className="text-[15px] sm:text-base text-[#444] leading-relaxed mb-6 max-w-2xl">
          Put photos of a whiteboard, scans of a form or screenshots of your notes
          into one PDF. Drag them into order, pick a page size, and save. Your
          images are read by this page in your browser and never uploaded.
        </p>

        <div className={`${cardClass} p-5 sm:p-7`}>
          <FilePicker
            multiple
            accept={IMAGE_ACCEPT}
            label="Drop your images here"
            hint="JPG, PNG and WebP. Add more at any time."
            onFiles={addFiles}
            disabled={busy}
            buttonText={items.length ? "Add more images" : "Choose images"}
          />

          {items.length > 0 ? (
            <div className="mt-6">
              <div className="flex items-baseline justify-between gap-3 mb-3">
                <h2 className="font-bold text-sm text-[#111]">
                  {items.length} {plural(items.length, "image", "images")}, in this order
                </h2>
                <span className="text-xs text-[#666] font-bold">{formatBytes(totalBytes)}</span>
              </div>

              <ol className="space-y-2">
                {items.map((item, index) => (
                  <li
                    key={item.id}
                    draggable={!busy}
                    onDragStart={() => {
                      dragIndex.current = index;
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (dragIndex.current !== null && dragIndex.current !== index) {
                        move(dragIndex.current, index);
                      }
                      dragIndex.current = null;
                    }}
                    className="flex items-center gap-2 sm:gap-3 border-2 border-black rounded-xl bg-white px-3 py-2.5"
                  >
                    <GripVertical
                      size={16}
                      strokeWidth={2.5}
                      aria-hidden="true"
                      className="shrink-0 text-[#999] cursor-grab hidden sm:block"
                    />
                    <span className="shrink-0 w-6 text-center text-xs font-black text-[#666]">
                      {index + 1}
                    </span>
                    <img
                      src={item.url}
                      alt=""
                      className="shrink-0 h-10 w-10 object-cover border-2 border-black rounded-lg"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-[#111] truncate">{item.file.name}</p>
                      <p className="text-xs text-[#666]">{formatBytes(item.file.size)}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => move(index, index - 1)}
                        disabled={index === 0 || busy}
                        aria-label={`Move ${item.file.name} up`}
                        className="p-1.5 border-2 border-black rounded-lg bg-white disabled:opacity-30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
                      >
                        <ArrowUp size={14} strokeWidth={3} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(index, index + 1)}
                        disabled={index === items.length - 1 || busy}
                        aria-label={`Move ${item.file.name} down`}
                        className="p-1.5 border-2 border-black rounded-lg bg-white disabled:opacity-30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
                      >
                        <ArrowDown size={14} strokeWidth={3} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(item.id)}
                        disabled={busy}
                        aria-label={`Remove ${item.file.name}`}
                        className="p-1.5 border-2 border-black rounded-lg bg-white disabled:opacity-30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
                      >
                        <X size={14} strokeWidth={3} aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-6 space-y-5">
                <fieldset>
                  <legend className={labelClass}>Page size</legend>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(PAGE_SIZES).map(([key, option]) => (
                      <label
                        key={key}
                        className="border-2 border-black rounded-xl px-3 py-2 cursor-pointer text-sm font-bold text-[#111] has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-[#F0D44A]"
                        style={{ background: pageSize === key ? "#F0D44A" : "#FFFFFF" }}
                      >
                        <input
                          type="radio"
                          name="page-size"
                          value={key}
                          checked={pageSize === key}
                          onChange={() => setPageSize(key)}
                          disabled={busy}
                          className="sr-only"
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                  <p className={hintClass}>
                    A4 and Letter place every image on a page of the same size. Fit to
                    image makes each page exactly the shape of the image on it.
                  </p>
                </fieldset>

                {pageSize !== "fit" ? (
                  <fieldset>
                    <legend className={labelClass}>Orientation</legend>
                    <div className="flex flex-wrap gap-2">
                      {[
                        ["auto", "Match each image"],
                        ["portrait", "Portrait"],
                        ["landscape", "Landscape"],
                      ].map(([key, label]) => (
                        <label
                          key={key}
                          className="border-2 border-black rounded-xl px-3 py-2 cursor-pointer text-sm font-bold text-[#111] has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-[#F0D44A]"
                          style={{ background: orientation === key ? "#F0D44A" : "#FFFFFF" }}
                        >
                          <input
                            type="radio"
                            name="orientation"
                            value={key}
                            checked={orientation === key}
                            onChange={() => setOrientation(key)}
                            disabled={busy}
                            className="sr-only"
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ) : null}

                <fieldset>
                  <legend className={labelClass}>Margin</legend>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(MARGINS).map(([key, option]) => (
                      <label
                        key={key}
                        className="border-2 border-black rounded-xl px-3 py-2 cursor-pointer text-sm font-bold text-[#111] has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-[#F0D44A]"
                        style={{ background: margin === key ? "#F0D44A" : "#FFFFFF" }}
                      >
                        <input
                          type="radio"
                          name="margin"
                          value={key}
                          checked={margin === key}
                          onChange={() => setMargin(key)}
                          disabled={busy}
                          className="sr-only"
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={build}
                  disabled={busy || items.length === 0}
                  className={`${buttonClass} disabled:opacity-40`}
                  style={{ background: busy || !items.length ? "#FFFFFF" : "#F0D44A" }}
                >
                  <FileDown size={16} strokeWidth={2.75} aria-hidden="true" />
                  {busy ? "Building" : `Make a PDF of ${items.length} ${plural(items.length, "image", "images")}`}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    items.forEach((item) => URL.revokeObjectURL(item.url));
                    setItems([]);
                    setStatus(null);
                  }}
                  disabled={busy}
                  className={`${buttonClass} disabled:opacity-40`}
                >
                  Clear list
                </button>
              </div>
            </div>
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

      <ToolSection title="Page size, orientation and margin">
        <p>
          <strong>A4 or Letter</strong> gives every page the same dimensions and
          places each image inside it, scaled to fit and centred. That is what you
          want for anything that will be printed or submitted, because a stack of
          pages the same size behaves predictably in a printer.
        </p>
        <p>
          <strong>Fit to image</strong> makes each page exactly the size of its
          image, so there is no border and no letterboxing. Pages can differ in
          shape from one another, which is fine on screen and awkward on paper.
        </p>
        <p>
          <strong>Match each image</strong> under orientation looks at whether the
          image is wider than it is tall and picks portrait or landscape for you.
          A batch of phone photos taken both ways round comes out with each one
          the right way up rather than half of them shrunk into the wrong shape.
        </p>
      </ToolSection>

      <ToolSection title="What happens to your images">
        <p>
          JPGs are embedded exactly as they are, byte for byte, with no
          re-encoding, so no quality is lost on the way in. PNGs go in as PNGs.
          WebP is the exception: browsers can read it but a PDF cannot hold it, so
          the image is redrawn into a PNG first. That loses nothing visually but
          does make the file larger.
        </p>
        <p>
          The image is placed at whatever size the page allows, but the pixels
          behind it are the full resolution ones. Zooming into the PDF shows the
          detail that was in the original photograph.
        </p>
        <p>
          Which is also why the PDF can be large. Ten photos from a modern phone
          camera make a large PDF, because they were large to begin with. If the
          file size matters more than the detail, shrink the images before adding
          them.
        </p>
      </ToolSection>

      <ToolSection title="Frequently asked questions" id="faq">
        <FaqList items={IMAGES_TO_PDF_FAQS} />
      </ToolSection>

      <PdfToolCta
        location="images_to_pdf"
        heading="Photos of the whiteboard are not revision"
        body="Feed that PDF into FORKSAI and it becomes flashcards, a summary and a spaced repetition schedule, which is the part that actually moves a grade."
      />

      <PdfToolCrossLinks current="/images-to-pdf" />
    </ToolPageShell>
  );
}
