// The seven browser-based PDF tools, in one place, so the cross-link strips and
// the JSON-LD on each page agree on what exists. Plain module with no "use
// client" and no browser access at import time, because the Server Components
// in app/*/page.js import PDF_TOOLS too.

export const PDF_TOOLS = [
  {
    href: "/merge-pdf",
    name: "Merge PDF",
    blurb:
      "Combine several PDFs into one file, and drag them into the order you want before you save.",
  },
  {
    href: "/split-pdf",
    name: "Split PDF",
    blurb:
      "Pull out a page range as its own file, or break a PDF into one file per page.",
  },
  {
    href: "/rotate-pdf",
    name: "Rotate PDF",
    blurb:
      "Turn sideways or upside down pages by 90, 180 or 270 degrees, one page or all of them.",
  },
  {
    href: "/delete-pdf-pages",
    name: "Delete PDF pages",
    blurb:
      "Pick the pages you do not want from thumbnails and save a PDF without them.",
  },
  {
    href: "/pdf-to-images",
    name: "PDF to images",
    blurb:
      "Render every page to a PNG or JPG at the size you choose, then save them individually or as a zip.",
  },
  {
    href: "/images-to-pdf",
    name: "Images to PDF",
    blurb:
      "Put JPGs and PNGs into a single PDF, with the page size, orientation and margin you pick.",
  },
  {
    href: "/pdf-text-extractor",
    name: "PDF text extractor",
    blurb:
      "Copy the selectable text out of a PDF, or save the whole thing as a .txt file.",
  },
  {
    href: "/add-page-numbers-to-pdf",
    name: "Add page numbers to PDF",
    blurb:
      "Stamp numbers onto the pages, starting where you choose, the right way up even on rotated scans.",
  },
];

// Anything past this and the browser starts to feel it, so the tools warn
// rather than silently locking the tab up. Not a hard block: a warned user with
// a fast machine can still go ahead.
export const LARGE_FILE_BYTES = 100 * 1024 * 1024;

// Above this page count, rendering a thumbnail for every page costs more than
// it helps, so the page pickers fall back to numbered buttons.
export const THUMBNAIL_PAGE_LIMIT = 300;

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 0)} MB`;
}

export function plural(n, one, many) {
  return n === 1 ? one : many;
}

// "report.pdf" -> "report". Used to build output names that still look like the
// file the user recognises.
export function baseName(filename) {
  const name = String(filename || "file");
  const dot = name.lastIndexOf(".");
  const stem = dot > 0 ? name.slice(0, dot) : name;
  return stem.trim() || "file";
}

// Strips the characters Windows and macOS refuse in a filename, so a download
// never silently fails or lands with a mangled name.
export function safeFileName(name) {
  return String(name)
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120) || "file";
}

/**
 * Parses a page selection such as "1-3, 7, 12-" into sorted, de-duplicated
 * 1-based page numbers. Returns { pages, error }; error is a sentence that can
 * be shown to the user as is.
 */
export function parsePageSelection(input, pageCount) {
  const text = String(input || "").trim();
  if (!text) return { pages: [], error: "Type the pages you want, for example 1-3, 7." };
  if (!Number.isInteger(pageCount) || pageCount < 1) {
    return { pages: [], error: "Load a PDF first." };
  }

  const picked = new Set();
  for (const rawPart of text.split(/[,\s]+/)) {
    const part = rawPart.trim();
    if (!part) continue;

    const range = part.match(/^(\d+)\s*(?:-|to)\s*(\d*)$/i);
    if (range) {
      const start = Number(range[1]);
      const end = range[2] ? Number(range[2]) : pageCount;
      if (start < 1 || end < 1) return { pages: [], error: "Page numbers start at 1." };
      if (start > pageCount || end > pageCount) {
        return { pages: [], error: `This PDF has ${pageCount} ${plural(pageCount, "page", "pages")}, so ${Math.max(start, end)} does not exist.` };
      }
      if (start > end) return { pages: [], error: `The range ${part} runs backwards.` };
      for (let p = start; p <= end; p += 1) picked.add(p);
      continue;
    }

    if (/^\d+$/.test(part)) {
      const page = Number(part);
      if (page < 1) return { pages: [], error: "Page numbers start at 1." };
      if (page > pageCount) {
        return { pages: [], error: `This PDF has ${pageCount} ${plural(pageCount, "page", "pages")}, so ${page} does not exist.` };
      }
      picked.add(page);
      continue;
    }

    return { pages: [], error: `"${part}" is not a page or a range. Use numbers and dashes, like 1-3, 7.` };
  }

  const pages = [...picked].sort((a, b) => a - b);
  if (!pages.length) return { pages: [], error: "That selection does not include any pages." };
  return { pages, error: null };
}

// The inverse of parsePageSelection, so a click-the-thumbnails selection can be
// shown back to the user as text they could have typed.
export function formatPageSelection(pages) {
  const sorted = [...new Set(pages)].sort((a, b) => a - b);
  const parts = [];
  let i = 0;
  while (i < sorted.length) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1] === sorted[j] + 1) j += 1;
    parts.push(i === j ? `${sorted[i]}` : `${sorted[i]}-${sorted[j]}`);
    i = j + 1;
  }
  return parts.join(", ");
}

// Saves a Blob under a given name. Revoking on the next tick rather than
// immediately, because Safari cancels the download if the URL dies too early.
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = safeFileName(filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// Hands control back to the browser so a long loop can paint a progress bar and
// stay responsive to clicks instead of freezing the tab.
export function yieldToBrowser() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
