// CSV and JSON conversion for /csv-to-json. Plain module with no browser APIs
// so the parsing can be reasoned about and tested on its own.
//
// The parser follows RFC 4180: fields may be wrapped in double quotes, a quoted
// field may contain the delimiter, a line break or a doubled quote, and rows
// may end with CRLF or LF.

// Guesses the delimiter by counting candidates outside quoted sections in the
// first few lines. Beats splitting on the raw string, which miscounts every
// comma that lives inside a quoted address field.
export function detectDelimiter(text) {
  const candidates = [",", ";", "\t", "|"];
  const sample = text.slice(0, 20000);
  let best = ",";
  let bestCount = 0;
  for (const candidate of candidates) {
    let count = 0;
    let inQuotes = false;
    for (let i = 0; i < sample.length; i += 1) {
      const ch = sample[i];
      if (ch === '"') {
        if (inQuotes && sample[i + 1] === '"') i += 1;
        else inQuotes = !inQuotes;
      } else if (!inQuotes && ch === candidate) {
        count += 1;
      }
    }
    if (count > bestCount) {
      best = candidate;
      bestCount = count;
    }
  }
  return best;
}

/**
 * Parses CSV text into an array of row arrays.
 * Returns { rows, errors } where errors lists recoverable problems rather than
 * throwing, so the preview can still render what did parse.
 */
export function parseCsv(text, delimiter = ",") {
  const rows = [];
  const errors = [];
  if (typeof text !== "string" || text.length === 0) return { rows, errors };

  // A trailing newline at the end of the file is a terminator, not an empty
  // final row, so it gets stripped before the walk.
  let input = text.replace(/^﻿/, "");
  if (input.endsWith("\r\n")) input = input.slice(0, -2);
  else if (input.endsWith("\n") || input.endsWith("\r")) input = input.slice(0, -1);

  let field = "";
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];

    if (inQuotes) {
      if (ch === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      // A quote that opens mid field is treated as literal text, which is what
      // spreadsheets do with input like 6" pipe.
      if (field.length === 0) inQuotes = true;
      else field += ch;
    } else if (ch === delimiter) {
      row.push(field);
      field = "";
    } else if (ch === "\r") {
      if (input[i + 1] === "\n") i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }

  row.push(field);
  rows.push(row);

  if (inQuotes) errors.push("A quoted field was never closed, so the last row may be wrong.");

  return { rows, errors };
}

// RFC 4180 quoting: wrap when the value holds the delimiter, a quote, or a line
// break, and double every quote inside.
export function csvCell(value, delimiter = ",") {
  const text = value === null || value === undefined ? "" : String(value);
  const needsQuotes =
    text.includes(delimiter) ||
    text.includes('"') ||
    text.includes("\n") ||
    text.includes("\r");
  if (!needsQuotes) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

export function rowsToCsv(rows, delimiter = ",") {
  return rows
    .map((row) => row.map((cell) => csvCell(cell, delimiter)).join(delimiter))
    .join("\r\n");
}

// Header cells arrive blank or duplicated often enough that the JSON keys have
// to be made unique here, otherwise later columns silently overwrite earlier
// ones in the object.
function uniqueHeaders(headerRow) {
  const seen = new Map();
  return headerRow.map((raw, index) => {
    let name = String(raw ?? "").trim() || `column_${index + 1}`;
    if (seen.has(name)) {
      const next = seen.get(name) + 1;
      seen.set(name, next);
      name = `${name}_${next}`;
    } else {
      seen.set(name, 1);
    }
    return name;
  });
}

// Optional value typing. Off by default because a CSV of ZIP codes or student
// IDs loses its leading zeros the moment it becomes a number.
function coerce(value) {
  const text = value.trim();
  if (text === "") return "";
  if (text === "true") return true;
  if (text === "false") return false;
  if (text === "null") return null;
  if (/^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/.test(text)) {
    const num = Number(text);
    if (Number.isFinite(num)) return num;
  }
  return value;
}

/**
 * CSV text to JSON-ready data.
 * withHeader true gives an array of objects, false gives an array of arrays.
 */
export function csvToJson(text, { delimiter = ",", withHeader = true, typed = false } = {}) {
  const { rows, errors } = parseCsv(text, delimiter);
  const filled = rows.filter((row) => row.length > 1 || (row[0] ?? "") !== "");
  if (filled.length === 0) return { data: [], headers: [], rows: [], errors };

  const map = (cell) => (typed ? coerce(cell) : cell);

  if (!withHeader) {
    return {
      data: filled.map((row) => row.map(map)),
      headers: filled[0].map((_, i) => `Column ${i + 1}`),
      rows: filled,
      errors,
    };
  }

  const headers = uniqueHeaders(filled[0]);
  const data = filled.slice(1).map((row) => {
    const record = {};
    headers.forEach((key, i) => {
      record[key] = map(row[i] ?? "");
    });
    return record;
  });
  return { data, headers, rows: filled, errors };
}

// Values that are not scalars get serialised rather than dropped, so a nested
// object survives the trip as readable JSON inside one cell.
function flattenValue(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

/**
 * JSON text to CSV. Accepts an array of objects, an array of arrays, a single
 * object, or an object with one array property holding the records.
 */
export function jsonToCsv(text, { delimiter = "," } = {}) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    return { csv: "", headers: [], rows: [], error: `Not valid JSON: ${err.message}` };
  }

  let records = parsed;
  if (records && !Array.isArray(records) && typeof records === "object") {
    const arrayProp = Object.values(records).find((v) => Array.isArray(v));
    records = arrayProp ?? [records];
  }
  if (!Array.isArray(records)) {
    return { csv: "", headers: [], rows: [], error: "JSON has to be an array of records." };
  }
  if (records.length === 0) return { csv: "", headers: [], rows: [], error: "" };

  // Array of arrays keeps its own shape, with no header invented for it.
  if (Array.isArray(records[0])) {
    const rows = records.map((row) => row.map(flattenValue));
    return { csv: rowsToCsv(rows, delimiter), headers: [], rows, error: "" };
  }

  // Union of keys in first-seen order, so a record missing a field still lines
  // up under the right column instead of shifting the row.
  const headers = [];
  for (const record of records) {
    if (!record || typeof record !== "object") continue;
    for (const key of Object.keys(record)) {
      if (!headers.includes(key)) headers.push(key);
    }
  }

  const body = records.map((record) =>
    headers.map((key) => flattenValue(record && typeof record === "object" ? record[key] : ""))
  );
  const rows = [headers, ...body];
  return { csv: rowsToCsv(rows, delimiter), headers, rows, error: "" };
}

export function downloadTextFile(filename, text, mimeType) {
  const blob = new Blob([text], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
