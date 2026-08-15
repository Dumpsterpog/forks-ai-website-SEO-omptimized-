// A markdown subset parser for /markdown-to-pdf.
//
// It is deliberately a subset, and the page says which one: headings, ordered
// and unordered lists with nesting, bold, italic, inline code, fenced and
// indented code blocks, block quotes, horizontal rules, links and paragraphs.
// Tables, images, footnotes, task lists and raw HTML are not rendered. Anything
// unsupported is passed through as plain text so it stays visible in the output
// instead of vanishing.

import { measureText } from "@/lib/formatToolsPdf";

export const SUPPORTED = [
  "Headings, # through ######",
  "Bold, italic and inline code",
  "Ordered and unordered lists, including one level of nesting",
  "Fenced and indented code blocks",
  "Block quotes",
  "Horizontal rules",
  "Links, printed as text followed by the address",
];

export const NOT_SUPPORTED = [
  "Tables, which are printed as their raw markdown",
  "Images, which are skipped",
  "Raw HTML, footnotes and task list checkboxes",
];

/**
 * Splits one line of markdown into styled spans.
 * Inline code is matched first so markers inside it stay literal.
 */
export function parseInline(text) {
  const spans = [];
  let buffer = "";
  let i = 0;

  const flush = () => {
    if (buffer) {
      spans.push({ text: buffer });
      buffer = "";
    }
  };

  while (i < text.length) {
    const rest = text.slice(i);

    // Escaped character: the next character is taken literally.
    if (rest[0] === "\\" && rest.length > 1) {
      buffer += rest[1];
      i += 2;
      continue;
    }

    const code = rest.match(/^`([^`]+)`/);
    if (code) {
      flush();
      spans.push({ text: code[1], code: true });
      i += code[0].length;
      continue;
    }

    const image = rest.match(/^!\[([^\]]*)\]\(([^)\s]+)[^)]*\)/);
    if (image) {
      // Images cannot be drawn into the PDF, so only the alt text survives.
      flush();
      if (image[1]) spans.push({ text: image[1], italic: true });
      i += image[0].length;
      continue;
    }

    const link = rest.match(/^\[([^\]]+)\]\(([^)\s]+)[^)]*\)/);
    if (link) {
      flush();
      spans.push({ text: link[1], href: link[2] });
      i += link[0].length;
      continue;
    }

    const strong = rest.match(/^(\*\*|__)(.+?)\1/);
    if (strong) {
      flush();
      parseInline(strong[2]).forEach((span) => spans.push({ ...span, bold: true }));
      i += strong[0].length;
      continue;
    }

    const emphasis = rest.match(/^(\*|_)([^*_]+?)\1/);
    if (emphasis) {
      flush();
      parseInline(emphasis[2]).forEach((span) => spans.push({ ...span, italic: true }));
      i += emphasis[0].length;
      continue;
    }

    buffer += rest[0];
    i += 1;
  }

  flush();
  return spans;
}

const ORDERED = /^(\s*)(\d+)[.)]\s+(.*)$/;
const UNORDERED = /^(\s*)[-*+]\s+(.*)$/;

/** Markdown text to a flat list of blocks. */
export function parseMarkdown(markdown) {
  const lines = String(markdown).replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let paragraph = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ type: "paragraph", spans: parseInline(paragraph.join(" ")) });
      paragraph = [];
    }
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    // Fenced code block. Everything up to the closing fence is literal.
    const fence = line.match(/^\s*(```|~~~)(.*)$/);
    if (fence) {
      flushParagraph();
      const marker = fence[1];
      const code = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith(marker)) {
        code.push(lines[i]);
        i += 1;
      }
      blocks.push({ type: "code", lines: code, language: fence[2].trim() });
      continue;
    }

    if (line.trim() === "") {
      flushParagraph();
      continue;
    }

    // An indented code block only counts when it does not continue a
    // paragraph, which is what keeps a wrapped sentence from becoming code.
    if (/^ {4}\S/.test(line) && paragraph.length === 0) {
      const code = [];
      while (i < lines.length && (/^ {4}/.test(lines[i]) || lines[i].trim() === "")) {
        code.push(lines[i].replace(/^ {4}/, ""));
        i += 1;
      }
      i -= 1;
      while (code.length && code[code.length - 1].trim() === "") code.pop();
      blocks.push({ type: "code", lines: code, language: "" });
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      flushParagraph();
      blocks.push({
        type: "heading",
        level: heading[1].length,
        spans: parseInline(heading[2].replace(/\s+#+\s*$/, "")),
      });
      continue;
    }

    if (/^\s{0,3}([-*_])\s*(\1\s*){2,}$/.test(line)) {
      flushParagraph();
      blocks.push({ type: "rule" });
      continue;
    }

    const quote = line.match(/^\s*>\s?(.*)$/);
    if (quote) {
      flushParagraph();
      const quoted = [quote[1]];
      while (i + 1 < lines.length && /^\s*>/.test(lines[i + 1])) {
        quoted.push(lines[i + 1].replace(/^\s*>\s?/, ""));
        i += 1;
      }
      blocks.push({ type: "quote", spans: parseInline(quoted.join(" ")) });
      continue;
    }

    const ordered = line.match(ORDERED);
    const unordered = line.match(UNORDERED);
    if (ordered || unordered) {
      flushParagraph();
      const items = [];
      let index = i;
      while (index < lines.length) {
        const current = lines[index];
        const o = current.match(ORDERED);
        const u = current.match(UNORDERED);
        if (!o && !u) break;
        const leading = (o ? o[1] : u[1]).length;
        items.push({
          depth: Math.min(2, Math.floor(leading / 2)),
          marker: o ? `${o[2]}.` : "-",
          ordered: Boolean(o),
          spans: parseInline(o ? o[3] : u[2]),
        });
        index += 1;
      }
      i = index - 1;
      blocks.push({ type: "list", ordered: Boolean(ordered), items });
      continue;
    }

    paragraph.push(line.trim());
  }

  flushParagraph();
  return blocks;
}

// Heading sizes as multiples of the body size, so changing the body size scales
// the whole document rather than breaking the hierarchy.
const HEADING_SCALE = [1.9, 1.55, 1.3, 1.15, 1.05, 1];

/**
 * Draws parsed blocks into a PdfDocument.
 * The document is passed in so the caller owns page size and margins.
 */
export function renderMarkdownToPdf(doc, blocks, { family, fontSize = 11 }) {
  const spanFont = (span) => {
    if (span.code) return "courier";
    if (span.bold && span.italic) return family.boldItalic;
    if (span.bold) return family.bold;
    if (span.italic) return family.italic;
    return family.regular;
  };

  // Spans are laid out word by word so a bold run can wrap mid sentence
  // without the line overflowing the margin.
  const drawSpans = (spans, { size, indent = 0, hangingIndent = 0, baseFont, color = "0 0 0" }) => {
    const available = doc.contentWidth - indent;
    const words = [];

    spans.forEach((span) => {
      const fontKey = baseFont || spanFont(span);
      const parts = span.text.split(/(\s+)/).filter((part) => part !== "");
      parts.forEach((part) => {
        if (/^\s+$/.test(part)) words.push({ space: true, fontKey, size });
        else words.push({ text: part, fontKey, size });
      });
      // A link keeps its address in the output, since a PDF page cannot be
      // clicked through on paper.
      if (span.href) {
        words.push({ space: true, fontKey, size });
        words.push({ text: `(${span.href})`, fontKey: family.italic, size: size * 0.9 });
      }
    });

    let line = [];
    let lineWidth = 0;
    let first = true;

    const flush = () => {
      if (!line.length) return;
      const leading = size * doc.lineHeight;
      doc.ensureSpace(leading);
      let x = doc.margin + indent + (first ? 0 : hangingIndent);
      const y = doc.y - size;
      line.forEach((word) => {
        if (word.space) {
          x += measureWidth(" ", word.fontKey, word.size);
          return;
        }
        doc.drawTextAt(word.text, { fontKey: word.fontKey, size: word.size, x, y, color });
        x += measureWidth(word.text, word.fontKey, word.size);
      });
      doc.y -= leading;
      line = [];
      lineWidth = 0;
      first = false;
    };

    words.forEach((word) => {
      const width = measureWidth(word.space ? " " : word.text, word.fontKey, word.size);
      const limit = available - (first ? 0 : hangingIndent);
      if (!word.space && lineWidth + width > limit && line.length) {
        // Trailing space before the break is dropped rather than drawn.
        while (line.length && line[line.length - 1].space) line.pop();
        flush();
      }
      if (word.space && !line.length) return;
      line.push(word);
      lineWidth += width;
    });
    flush();
  };

  blocks.forEach((block, index) => {
    if (index > 0) doc.moveDown(fontSize * 0.5);

    switch (block.type) {
      case "heading": {
        const size = fontSize * HEADING_SCALE[block.level - 1];
        doc.moveDown(fontSize * 0.35);
        drawSpans(block.spans, { size, baseFont: family.bold });
        break;
      }
      case "paragraph":
        drawSpans(block.spans, { size: fontSize });
        break;
      case "list":
        block.items.forEach((item) => {
          const indent = 14 + item.depth * 16;
          const markerWidth = measureWidth(`${item.marker} `, family.regular, fontSize);
          doc.ensureSpace(fontSize * doc.lineHeight);
          const markerY = doc.y - fontSize;
          doc.drawTextAt(item.marker, {
            fontKey: family.regular,
            size: fontSize,
            x: doc.margin + indent - markerWidth,
            y: markerY,
          });
          drawSpans(item.spans, { size: fontSize, indent, hangingIndent: 0 });
        });
        break;
      case "code": {
        const size = fontSize * 0.92;
        const height = block.lines.length * size * doc.lineHeight + 10;
        doc.ensureSpace(Math.min(height, doc.height - doc.margin * 2));
        doc.drawRect(doc.margin - 6, doc.y - height + 6, doc.contentWidth + 12, height, "0.95 0.95 0.92");
        doc.moveDown(4);
        block.lines.forEach((line) => {
          doc.drawLine(line, { fontKey: "courier", size, indent: 2 });
        });
        doc.moveDown(4);
        break;
      }
      case "quote": {
        const startY = doc.y;
        drawSpans(block.spans, { size: fontSize, indent: 14, baseFont: family.italic, color: "0.25 0.25 0.25" });
        doc.drawRect(doc.margin, doc.y + 2, 2.5, startY - doc.y - 4, "0.6 0.6 0.6");
        break;
      }
      case "rule":
        doc.drawRule({ spaceBefore: 4, spaceAfter: 8 });
        break;
      default:
        break;
    }
  });

  return doc;
}

// Local alias so the layout code above reads the same as the PDF module's own
// wrapping code.
function measureWidth(text, fontKey, size) {
  return measureText(text, fontKey, size);
}
