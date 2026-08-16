// Rule-based flashcard parsing. Pure string handling, no model, no network.
// Pasted notes go in, front/back pairs come out, and the only intelligence is
// pattern matching that a student can predict and correct by hand.

// Q: / A: style, tolerating "Question:", "Ans -", "A)" and so on.
import { countToolUse } from "@/lib/toolUsage";

const FRONT_MARKER = /^\s*(?:q|ques|question)\s*(?:\d+)?\s*[:.)\-]\s*(.*)$/i;
const BACK_MARKER = /^\s*(?:a|ans|answer)\s*(?:\d+)?\s*[:.)\-]\s*(.*)$/i;

// Hyphen, en dash and em dash, each surrounded by whitespace. Escaped by code
// point so the source file stays free of literal dash characters.
const DASH_SPLIT = /\s+[-\u2013\u2014]\s+/;

export const FORMATS = [
  {
    id: "auto",
    label: "Detect automatically",
    hint: "Looks at your text and picks the pattern below that fits best.",
  },
  {
    id: "qa",
    label: "Q: and A: lines",
    hint: "Lines starting with Q: are fronts, lines starting with A: are backs.",
    example: "Q: What is osmosis?\nA: Movement of solvent across a semipermeable membrane.",
  },
  {
    id: "tab",
    label: "Tab separated",
    hint: "Front, a tab, then back. This is what a spreadsheet column pair pastes as.",
    example: "Osmosis\tMovement of solvent across a semipermeable membrane",
  },
  {
    id: "dash",
    label: "Dash separated",
    hint: "Front, a spaced dash, then back.",
    example: "Osmosis - movement of solvent across a semipermeable membrane",
  },
  {
    id: "colon",
    label: "Colon separated",
    hint: "Front, a colon, then back. Splits on the first colon only.",
    example: "Osmosis: movement of solvent across a semipermeable membrane",
  },
  {
    id: "alternating",
    label: "Alternating lines",
    hint: "Line one is a front, line two is its back, and so on.",
    example: "Osmosis\nMovement of solvent across a semipermeable membrane",
  },
];

const splitLines = (text) => String(text ?? "").split(/\r\n|\r|\n/);
const nonEmpty = (lines) => lines.map((l) => l.trim()).filter((l) => l.length > 0);

/**
 * Picks the format that best explains the pasted text. Order matters: the
 * checks run from the most explicit marker to the least, so a block of
 * "Q: ... A: ..." is never mistaken for colon separated text.
 */
export function detectFormat(text) {
  const lines = nonEmpty(splitLines(text));
  if (lines.length === 0) return "qa";

  const fronts = lines.filter((l) => FRONT_MARKER.test(l)).length;
  const backs = lines.filter((l) => BACK_MARKER.test(l)).length;
  if (fronts > 0 && backs > 0) return "qa";

  const share = (predicate) => lines.filter(predicate).length / lines.length;

  if (share((l) => l.includes("\t")) >= 0.5) return "tab";
  if (share((l) => DASH_SPLIT.test(l)) >= 0.5) return "dash";
  if (share((l) => l.includes(":")) >= 0.5) return "colon";
  return "alternating";
}

function parseQA(lines) {
  const cards = [];
  let front = null;
  let back = null;
  let target = null;

  const flush = () => {
    if (front !== null) cards.push({ front: front.trim(), back: (back ?? "").trim() });
    front = null;
    back = null;
    target = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    const frontMatch = line.match(FRONT_MARKER);
    if (frontMatch) {
      flush();
      front = frontMatch[1];
      target = "front";
      continue;
    }
    const backMatch = line.match(BACK_MARKER);
    if (backMatch) {
      if (front === null) continue; // an answer with no question above it
      back = backMatch[1];
      target = "back";
      continue;
    }
    if (line.length === 0) continue;
    // A wrapped continuation line belongs to whichever side is open.
    if (target === "back") back = `${back} ${line}`.trim();
    else if (target === "front") front = `${front} ${line}`.trim();
  }
  flush();
  return cards;
}

function parseBySplit(lines, splitter) {
  const cards = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const parts = splitter(line);
    if (!parts) continue;
    const [front, back] = parts;
    if (!front.trim()) continue;
    cards.push({ front: front.trim(), back: back.trim() });
  }
  return cards;
}

function parseAlternating(lines) {
  const cleaned = nonEmpty(lines);
  const cards = [];
  for (let i = 0; i < cleaned.length; i += 2) {
    cards.push({ front: cleaned[i], back: cleaned[i + 1] ?? "" });
  }
  return cards;
}

/**
 * Returns { format, cards }. `format` is the format actually used, which
 * matters when the caller asked for "auto" and wants to show what was picked.
 */
export function parseCards(text, requested = "auto") {
  const format = requested === "auto" ? detectFormat(text) : requested;
  const lines = splitLines(text);

  let cards;
  switch (format) {
    case "qa":
      cards = parseQA(lines);
      break;
    case "tab":
      cards = parseBySplit(lines, (line) => {
        const idx = line.indexOf("\t");
        if (idx === -1) return null;
        return [line.slice(0, idx), line.slice(idx + 1).replace(/\t/g, " ")];
      });
      break;
    case "dash":
      cards = parseBySplit(lines, (line) => {
        const match = line.match(DASH_SPLIT);
        if (!match) return null;
        const idx = line.indexOf(match[0]);
        return [line.slice(0, idx), line.slice(idx + match[0].length)];
      });
      break;
    case "colon":
      cards = parseBySplit(lines, (line) => {
        const idx = line.indexOf(":");
        if (idx === -1) return null;
        return [line.slice(0, idx), line.slice(idx + 1)];
      });
      break;
    case "alternating":
    default:
      cards = parseAlternating(lines);
      break;
  }

  // Drop pairs where both sides came out empty, which is what a stray
  // separator line produces.
  return { format, cards: cards.filter((c) => c.front || c.back) };
}

// RFC 4180: wrap in quotes when the value contains a comma, a quote or a line
// break, and double any quote inside.
function csvCell(value) {
  const text = String(value ?? "");
  if (/[",\r\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function toCsv(cards) {
  return cards.map((c) => `${csvCell(c.front)},${csvCell(c.back)}`).join("\r\n");
}

// Anki's plain text import is tab separated with one card per line, so tabs
// and newlines inside a field have to become spaces or the row splits.
export function toTsv(cards) {
  const flatten = (value) => String(value ?? "").replace(/[\t\r\n]+/g, " ").trim();
  return cards.map((c) => `${flatten(c.front)}\t${flatten(c.back)}`).join("\n");
}

export function downloadTextFile(filename, text, mimeType) {
  // A finished download is the tool having done its job, so this is the one
  // place a use is counted. See lib/toolUsage.js for what that sends.
  countToolUse();

  const blob = new Blob([text], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Revoked on the next tick so the click has definitely been handled.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
