// A small PDF writer for /text-to-pdf and /markdown-to-pdf.
//
// It writes PDF 1.4 by hand rather than pulling in a PDF library, for two
// reasons: the pages only need text, rules and filled rectangles, and shipping
// a megabyte of library to a visitor who wants to turn a paragraph into a PDF
// is a poor trade. Only the standard fourteen fonts are used, so nothing has to
// be embedded and the output stays a few kilobytes.

export const PAGE_SIZES = [
  { id: "a4", label: "A4", width: 595.28, height: 841.89 },
  { id: "letter", label: "Letter", width: 612, height: 792 },
  { id: "legal", label: "Legal", width: 612, height: 1008 },
  { id: "a5", label: "A5", width: 419.53, height: 595.28 },
];

// The base fourteen fonts every PDF reader has built in, with the CSS stack to
// measure against. Arial is metrically compatible with Helvetica and Times New
// Roman with Times, which is what makes browser measurement usable here.
export const PDF_FONTS = {
  helvetica: { name: "Helvetica", css: "Helvetica, Arial, sans-serif", weight: "normal", style: "normal" },
  helveticaBold: { name: "Helvetica-Bold", css: "Helvetica, Arial, sans-serif", weight: "bold", style: "normal" },
  helveticaOblique: { name: "Helvetica-Oblique", css: "Helvetica, Arial, sans-serif", weight: "normal", style: "italic" },
  helveticaBoldOblique: { name: "Helvetica-BoldOblique", css: "Helvetica, Arial, sans-serif", weight: "bold", style: "italic" },
  times: { name: "Times-Roman", css: "'Times New Roman', Times, serif", weight: "normal", style: "normal" },
  timesBold: { name: "Times-Bold", css: "'Times New Roman', Times, serif", weight: "bold", style: "normal" },
  timesItalic: { name: "Times-Italic", css: "'Times New Roman', Times, serif", weight: "normal", style: "italic" },
  timesBoldItalic: { name: "Times-BoldItalic", css: "'Times New Roman', Times, serif", weight: "bold", style: "italic" },
  courier: { name: "Courier", css: "'Courier New', Courier, monospace", weight: "normal", style: "normal" },
  courierBold: { name: "Courier-Bold", css: "'Courier New', Courier, monospace", weight: "bold", style: "normal" },
  courierOblique: { name: "Courier-Oblique", css: "'Courier New', Courier, monospace", weight: "normal", style: "italic" },
};

export const FONT_FAMILIES = [
  { id: "helvetica", label: "Helvetica", regular: "helvetica", bold: "helveticaBold", italic: "helveticaOblique", boldItalic: "helveticaBoldOblique" },
  { id: "times", label: "Times", regular: "times", bold: "timesBold", italic: "timesItalic", boldItalic: "timesBoldItalic" },
  { id: "courier", label: "Courier", regular: "courier", bold: "courierBold", italic: "courierOblique", boldItalic: "courierBold" },
];

export const MM_TO_POINTS = 72 / 25.4;

// WinAnsiEncoding matches Latin-1 except in 0x80 to 0x9F, where it carries the
// typographic characters people actually paste: curly quotes, dashes, ellipsis.
const WIN_ANSI_EXTRAS = {
  0x20ac: 0x80,
  0x201a: 0x82,
  0x0192: 0x83,
  0x201e: 0x84,
  0x2026: 0x85,
  0x2020: 0x86,
  0x2021: 0x87,
  0x02c6: 0x88,
  0x2030: 0x89,
  0x0160: 0x8a,
  0x2039: 0x8b,
  0x0152: 0x8c,
  0x017d: 0x8e,
  0x2018: 0x91,
  0x2019: 0x92,
  0x201c: 0x93,
  0x201d: 0x94,
  0x2022: 0x95,
  0x2013: 0x96,
  0x2014: 0x97,
  0x02dc: 0x98,
  0x2122: 0x99,
  0x0161: 0x9a,
  0x203a: 0x9b,
  0x0153: 0x9c,
  0x017e: 0x9e,
  0x0178: 0x9f,
};

/**
 * Maps a string to WinAnsi bytes. Characters with no WinAnsi equivalent are
 * replaced with a question mark and reported, so the page can tell the user
 * which script will not render rather than shipping a silently broken PDF.
 */
export function toWinAnsi(text) {
  const bytes = [];
  const unsupported = new Set();
  for (const char of String(text)) {
    const code = char.codePointAt(0);
    if (code === 9) {
      // Tabs have no glyph. Four spaces keeps code blocks aligned.
      bytes.push(32, 32, 32, 32);
    } else if (code >= 32 && code <= 126) {
      bytes.push(code);
    } else if (WIN_ANSI_EXTRAS[code] !== undefined) {
      bytes.push(WIN_ANSI_EXTRAS[code]);
    } else if (code >= 0xa0 && code <= 0xff) {
      bytes.push(code);
    } else if (code === 10 || code === 13) {
      // Line breaks are handled by the layout, never written into a string.
    } else {
      bytes.push(63);
      unsupported.add(char);
    }
  }
  return { bytes, unsupported };
}

// PDF string literals escape the two parentheses and the backslash. Everything
// above 126 is written as an octal escape so the file stays 7-bit clean.
function pdfString(bytes) {
  let out = "";
  for (const byte of bytes) {
    if (byte === 0x28) out += "\\(";
    else if (byte === 0x29) out += "\\)";
    else if (byte === 0x5c) out += "\\\\";
    else if (byte < 32 || byte > 126) out += "\\" + byte.toString(8).padStart(3, "0");
    else out += String.fromCharCode(byte);
  }
  return out;
}

// Per-character widths, measured once per font at a 1000 unit size and cached.
// Measuring character by character rather than measuring the whole string is
// deliberate: the PDF reader lays glyphs out with no kerning or ligatures, so
// the sum of single-character widths is the closer match.
const widthCache = new Map();

function measureChar(fontKey, char) {
  let table = widthCache.get(fontKey);
  if (!table) {
    table = new Map();
    widthCache.set(fontKey, table);
  }
  if (table.has(char)) return table.get(char);

  const font = PDF_FONTS[fontKey];
  let width = 500;
  if (typeof document !== "undefined") {
    const canvas = widthCache.get("__canvas") || document.createElement("canvas");
    widthCache.set("__canvas", canvas);
    const ctx = canvas.getContext("2d");
    ctx.font = `${font.style} ${font.weight} 1000px ${font.css}`;
    width = ctx.measureText(char).width;
  }
  table.set(char, width);
  return width;
}

export function measureText(text, fontKey, size) {
  let total = 0;
  for (const char of String(text)) total += measureChar(fontKey, char);
  return (total * size) / 1000;
}

/**
 * Greedy word wrap against a measured width. Words longer than the line, such
 * as a URL, are broken by character rather than allowed to run off the page.
 */
export function wrapText(text, fontKey, size, maxWidth) {
  const lines = [];
  const paragraphs = String(text).split(/\r\n|\r|\n/);

  for (const paragraph of paragraphs) {
    if (paragraph.trim() === "") {
      lines.push("");
      continue;
    }
    const words = paragraph.split(/ +/);
    let line = "";

    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (measureText(candidate, fontKey, size) <= maxWidth || !line) {
        if (measureText(candidate, fontKey, size) > maxWidth && !line) {
          // A single word wider than the line has to be split.
          let chunk = "";
          for (const char of word) {
            if (measureText(chunk + char, fontKey, size) > maxWidth && chunk) {
              lines.push(chunk);
              chunk = char;
            } else {
              chunk += char;
            }
          }
          line = chunk;
        } else {
          line = candidate;
        }
      } else {
        lines.push(line);
        line = word;
      }
    }
    lines.push(line);
  }

  return lines;
}

/**
 * A document you push blocks onto. It tracks the cursor, starts new pages when
 * the cursor runs off the bottom, and serialises to a Blob at the end.
 */
export class PdfDocument {
  constructor({
    pageSize = "a4",
    orientation = "portrait",
    marginMm = 20,
    lineHeight = 1.45,
  } = {}) {
    const size = PAGE_SIZES.find((p) => p.id === pageSize) || PAGE_SIZES[0];
    const portrait = orientation !== "landscape";
    this.width = portrait ? size.width : size.height;
    this.height = portrait ? size.height : size.width;
    this.margin = marginMm * MM_TO_POINTS;
    this.lineHeight = lineHeight;
    this.pages = [];
    this.unsupported = new Set();
    this.newPage();
  }

  get contentWidth() {
    return this.width - this.margin * 2;
  }

  newPage() {
    this.current = [];
    this.pages.push(this.current);
    this.y = this.height - this.margin;
  }

  ensureSpace(needed) {
    if (this.y - needed < this.margin) this.newPage();
  }

  moveDown(points) {
    this.y -= points;
  }

  /** Draws text at an absolute position without moving the cursor. */
  drawTextAt(text, { fontKey = "helvetica", size = 11, x = 0, y = 0, color = "0 0 0" } = {}) {
    const { bytes, unsupported } = toWinAnsi(text);
    unsupported.forEach((char) => this.unsupported.add(char));
    this.current.push(
      `BT ${color} rg /${fontKey} ${size} Tf 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm (${pdfString(bytes)}) Tj ET`
    );
  }

  /** Draws one already-wrapped line at the current cursor. */
  drawLine(text, { fontKey = "helvetica", size = 11, indent = 0, color = "0 0 0" } = {}) {
    const leading = size * this.lineHeight;
    this.ensureSpace(leading);
    this.drawTextAt(text, { fontKey, size, x: this.margin + indent, y: this.y - size, color });
    this.y -= leading;
  }

  /** Wraps then draws, which is what every caller other than a rule wants. */
  drawParagraph(text, { fontKey = "helvetica", size = 11, indent = 0, hangingIndent = 0, color = "0 0 0", spaceAfter = 0 } = {}) {
    const available = this.contentWidth - indent;
    const lines = wrapText(text, fontKey, size, available);
    lines.forEach((line, i) => {
      this.drawLine(line, {
        fontKey,
        size,
        color,
        indent: i === 0 ? indent : indent + hangingIndent,
      });
    });
    if (spaceAfter) this.moveDown(spaceAfter);
  }

  drawRule({ thickness = 1, color = "0.7 0.7 0.7", spaceBefore = 6, spaceAfter = 10 } = {}) {
    this.moveDown(spaceBefore);
    this.ensureSpace(thickness + spaceAfter);
    const y = this.y;
    this.current.push(
      `${color} RG ${thickness} w ${this.margin.toFixed(2)} ${y.toFixed(2)} m ${(
        this.width - this.margin
      ).toFixed(2)} ${y.toFixed(2)} l S`
    );
    this.moveDown(spaceAfter);
  }

  drawRect(x, y, width, height, color) {
    this.current.push(`${color} rg ${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re f`);
  }

  toBlob() {
    return new Blob([this.serialise()], { type: "application/pdf" });
  }

  serialise() {
    const fontKeys = Object.keys(PDF_FONTS);
    const objects = [];
    const push = (body) => {
      objects.push(body);
      return objects.length; // object numbers are 1 based
    };

    const catalogId = push(null); // reserved, filled in below
    const pagesId = push(null);
    const fontIds = fontKeys.map((key) => ({ key, id: push(`<< /Type /Font /Subtype /Type1 /BaseFont /${PDF_FONTS[key].name} /Encoding /WinAnsiEncoding >>`) }));

    const fontResource = fontIds.map(({ key, id }) => `/${key} ${id} 0 R`).join(" ");
    const pageIds = [];

    for (const content of this.pages) {
      const stream = content.join("\n");
      const contentId = push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
      const pageId = push(
        `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${this.width.toFixed(2)} ${this.height.toFixed(
          2
        )}] /Resources << /Font << ${fontResource} >> >> /Contents ${contentId} 0 R >>`
      );
      pageIds.push(pageId);
    }

    objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
    objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds
      .map((id) => `${id} 0 R`)
      .join(" ")}] /Count ${pageIds.length} >>`;

    let file = "%PDF-1.4\n";
    const offsets = [0];
    objects.forEach((body, index) => {
      offsets.push(file.length);
      file += `${index + 1} 0 obj\n${body}\nendobj\n`;
    });

    const xrefStart = file.length;
    file += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (let i = 1; i <= objects.length; i += 1) {
      file += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
    }
    file += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

    // Every byte written above is below 256 by construction, so a plain
    // char-code copy is a faithful encoding.
    const bytes = new Uint8Array(file.length);
    for (let i = 0; i < file.length; i += 1) bytes[i] = file.charCodeAt(i) & 0xff;
    return bytes;
  }
}

/** Plain text to PDF: the whole job of the text-to-pdf page. */
export function textToPdf(text, options = {}) {
  const {
    fontFamily = "helvetica",
    fontSize = 11,
    pageSize = "a4",
    orientation = "portrait",
    marginMm = 20,
    lineHeight = 1.45,
  } = options;
  const family = FONT_FAMILIES.find((f) => f.id === fontFamily) || FONT_FAMILIES[0];
  const doc = new PdfDocument({ pageSize, orientation, marginMm, lineHeight });

  const paragraphs = String(text).split(/\r\n|\r|\n/);
  for (const paragraph of paragraphs) {
    if (paragraph.trim() === "") {
      doc.moveDown(fontSize * lineHeight * 0.6);
      continue;
    }
    doc.drawParagraph(paragraph, { fontKey: family.regular, size: fontSize });
  }

  return doc;
}
