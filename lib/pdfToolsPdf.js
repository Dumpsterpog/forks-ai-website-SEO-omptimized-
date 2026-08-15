// The bridge to the two PDF libraries. Both are loaded with dynamic import()
// inside the handlers rather than at the top of a page, so the tool pages stay
// light until someone actually picks a file.
//
// pdf-lib writes PDFs (merge, split, rotate, delete, images to PDF).
// pdf.js reads them (thumbnails, page rendering, text extraction).
//
// Everything here runs in the browser. No bytes are uploaded anywhere.

let pdfLibPromise = null;
let pdfjsPromise = null;

export function loadPdfLib() {
  if (!pdfLibPromise) pdfLibPromise = import("pdf-lib");
  return pdfLibPromise;
}

export function loadPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((pdfjs) => {
      // The worker is served from public/pdfjs rather than resolved through the
      // bundler. A plain public path behaves the same in dev, in a production
      // build and behind any CDN, which a bundler-emitted worker URL does not
      // reliably do. Re-copy it from node_modules/pdfjs-dist/build when the
      // pdfjs-dist version changes; a mismatch makes pdf.js refuse to start.
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";
      return pdfjs;
    });
  }
  return pdfjsPromise;
}

export async function readFileBytes(file) {
  return new Uint8Array(await file.arrayBuffer());
}

// A password protected or truncated PDF throws from deep inside a library, and
// the raw message is not something a student can act on. This turns the common
// cases into a sentence that says what to do next.
export function describePdfError(error, filename) {
  const name = filename ? `"${filename}"` : "That file";
  const message = String(error?.message || error || "");

  if (/password|encrypt/i.test(message)) {
    return `${name} is password protected. Open it in a PDF reader, save an unlocked copy, then try again.`;
  }
  if (/invalid pdf|no pdf header|structure/i.test(message)) {
    return `${name} does not look like a valid PDF. It may be damaged or only partly downloaded.`;
  }
  if (/memory|allocation/i.test(message)) {
    return `${name} is too large for this browser tab to hold in memory. Try splitting it first, or use a desktop browser.`;
  }
  return `${name} could not be read. ${message || "The browser gave no reason."}`;
}

/**
 * Opens a PDF with pdf-lib for editing. ignoreEncryption is off on purpose:
 * silently producing a broken output from an encrypted file is worse than
 * saying the file is locked.
 */
export async function openForEditing(bytes) {
  const { PDFDocument } = await loadPdfLib();
  return PDFDocument.load(bytes);
}

/** Opens a PDF with pdf.js for reading and rendering. */
export async function openForReading(bytes) {
  const pdfjs = await loadPdfjs();
  return pdfjs.getDocument({
    // pdf.js takes ownership of the buffer it is handed, so pass a copy and
    // keep the original usable for a second pass with pdf-lib.
    data: bytes.slice(),
    isEvalSupported: false,
    // Both directories are vendored into public/pdfjs and fetched only when a
    // document needs them. Without the fonts, a PDF that names Helvetica or
    // Times without embedding it renders blank. Without the CMaps, text in a
    // Chinese, Japanese or Korean PDF comes out as the wrong characters.
    standardFontDataUrl: "/pdfjs/standard_fonts/",
    cMapUrl: "/pdfjs/cmaps/",
    cMapPacked: true,
  }).promise;
}

/**
 * Renders one page onto a fresh canvas.
 * @param {object} page a pdf.js PDFPageProxy
 * @param {number} scale 1 is 72 DPI, 2 is 144 DPI, and so on
 * @param {number} [rotationDelta] extra clockwise rotation in degrees
 */
export async function renderPageToCanvas(page, scale, rotationDelta = 0) {
  const viewport = page.getViewport({
    scale,
    rotation: (page.rotate + rotationDelta) % 360,
  });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));
  const context = canvas.getContext("2d", { alpha: false });
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: context, viewport }).promise;
  return canvas;
}

// Thumbnails are rendered at a fixed pixel width rather than a fixed scale, so
// a slide deck in landscape and an A4 report both come back the same size on
// the grid.
export async function renderThumbnail(page, targetWidth = 150) {
  const base = page.getViewport({ scale: 1 });
  const scale = Math.min(2, Math.max(0.05, targetWidth / base.width));
  const canvas = await renderPageToCanvas(page, scale);
  return canvas.toDataURL("image/jpeg", 0.72);
}

export function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("The browser could not encode that page as an image."))),
      type,
      quality
    );
  });
}

/**
 * Pulls the selectable text off one page. pdf.js returns positioned fragments
 * rather than lines, so hasEOL is used to rebuild line breaks, and a fragment
 * that already ends in a space is not padded again.
 */
export async function extractPageText(page) {
  const content = await page.getTextContent();
  let out = "";
  for (const item of content.items) {
    if (typeof item.str !== "string") continue;
    out += item.str;
    if (item.hasEOL) {
      out += "\n";
    } else if (item.str && !/\s$/.test(item.str)) {
      out += " ";
    }
  }
  return out.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

// Frees the worker side of a pdf.js document. Skipping this on a long document
// leaves tens of megabytes of rendered page data alive for the tab's lifetime.
// destroy() lives on the loading task rather than the document proxy, so go
// through the task the proxy came from.
export async function closeDocument(doc) {
  try {
    await doc?.loadingTask?.destroy();
  } catch {
    // A document destroyed twice, or destroyed mid-render, is not worth
    // surfacing to the user.
  }
}
