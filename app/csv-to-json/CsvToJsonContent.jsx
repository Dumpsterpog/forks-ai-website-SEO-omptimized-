"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowLeftRight, Download, Trash2, Upload } from "lucide-react";
import ToolPageShell, {
  ToolCta,
  ToolSection,
  FaqList,
  cardClass,
  labelClass,
  buttonClass,
} from "@/components/ToolPageShell";
import {
  csvToJson,
  jsonToCsv,
  parseCsv,
  detectDelimiter,
  downloadTextFile,
} from "@/lib/formatToolsCsv";
import { FormatToolCrossLinks, OnDeviceNote, CopyButton } from "@/lib/formatToolsShell";
import { CSV_TO_JSON_FAQS } from "@/lib/formatToolsFaqs";

// The sample deliberately contains the two fields that break naive splitters: a
// quoted comma and a quoted line break.
const SAMPLE_CSV = `name,course,note,score
Ada Lovelace,Computer Science,"Strong on loops, weaker on recursion",88
Rosalind Franklin,Chemistry,"Lab report says:
crystallography is the strength",92
Alan Turing,Mathematics,"Wants the ""hard"" problem set",95`;

const SAMPLE_JSON = `[
  { "name": "Ada Lovelace", "course": "Computer Science", "score": 88 },
  { "name": "Alan Turing", "course": "Mathematics", "score": 95 }
]`;

const DELIMITERS = [
  { id: "auto", label: "Detect automatically" },
  { id: ",", label: "Comma" },
  { id: ";", label: "Semicolon" },
  { id: "\t", label: "Tab" },
  { id: "|", label: "Pipe" },
];

const selectClass =
  "w-full border-2 border-black rounded-xl bg-white px-3 py-2.5 text-sm font-bold text-[#111] " +
  "outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]";

const areaClass =
  "w-full border-2 border-black rounded-xl bg-white px-4 py-3 font-mono text-[13px] text-[#111] " +
  "leading-relaxed outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A] resize-y";

function Checkbox({ id, checked, onChange, label, hint }) {
  return (
    <div className="flex items-start gap-2.5">
      <input
        id={id}
        name={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-5 w-5 shrink-0 border-2 border-black rounded accent-[#F0D44A] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
      />
      <label htmlFor={id} className="text-sm text-[#333] leading-snug">
        <span className="font-bold text-[#111]">{label}</span>
        {hint ? <span className="block text-xs text-[#666] mt-0.5">{hint}</span> : null}
      </label>
    </div>
  );
}

export default function CsvToJsonContent() {
  const [direction, setDirection] = useState("csvToJson");
  const [csvText, setCsvText] = useState(SAMPLE_CSV);
  const [jsonText, setJsonText] = useState(SAMPLE_JSON);
  const [delimiterChoice, setDelimiterChoice] = useState("auto");
  const [withHeader, setWithHeader] = useState(true);
  const [typed, setTyped] = useState(false);
  const fileRef = useRef(null);

  const toJson = direction === "csvToJson";
  const source = toJson ? csvText : jsonText;

  const delimiter = useMemo(() => {
    if (delimiterChoice !== "auto") return delimiterChoice;
    return detectDelimiter(toJson ? csvText : ",");
  }, [delimiterChoice, csvText, toJson]);

  const result = useMemo(() => {
    if (toJson) {
      const { data, headers, errors } = csvToJson(csvText, { delimiter, withHeader, typed });
      const preview = parseCsv(csvText, delimiter).rows.slice(0, 8);
      return {
        output: data.length ? JSON.stringify(data, null, 2) : "",
        preview,
        headers,
        error: errors[0] || "",
        count: data.length,
      };
    }
    const { csv, rows, error } = jsonToCsv(jsonText, { delimiter: delimiter === "auto" ? "," : delimiter });
    return {
      output: csv,
      preview: rows.slice(0, 8),
      headers: [],
      error,
      count: Math.max(rows.length - 1, 0),
    };
  }, [toJson, csvText, jsonText, delimiter, withHeader, typed]);

  const readFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      if (file.name.toLowerCase().endsWith(".json")) {
        setJsonText(text);
        setDirection("jsonToCsv");
      } else {
        setCsvText(text);
        setDirection("csvToJson");
      }
    };
    reader.readAsText(file);
  };

  const delimiterName =
    delimiter === "\t" ? "tab" : delimiter === ";" ? "semicolon" : delimiter === "|" ? "pipe" : "comma";

  return (
    <ToolPageShell>
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif font-black text-3xl sm:text-[2.6rem] leading-[1.08] text-[#111] mb-3">
          CSV to JSON converter
        </h1>
        <p className="text-[15px] sm:text-base text-[#444] leading-relaxed mb-6 max-w-2xl">
          Paste a CSV and get JSON, or paste JSON and get a CSV back. Quoted
          fields with commas and line breaks inside them are handled per RFC
          4180, and the preview table shows exactly how each row was split. Free,
          no signup, and your spreadsheet never leaves the browser.
        </p>

        <div className={`${cardClass} p-5 sm:p-7`}>
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <div className="inline-flex border-2 border-black rounded-xl overflow-hidden">
              {[
                ["csvToJson", "CSV to JSON"],
                ["jsonToCsv", "JSON to CSV"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={direction === id}
                  onClick={() => setDirection(id)}
                  className="px-4 py-2.5 text-sm font-bold text-[#111] border-r-2 border-black last:border-r-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
                  style={{ background: direction === id ? "#F0D44A" : "#fff" }}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setDirection(toJson ? "jsonToCsv" : "csvToJson")}
              className={buttonClass}
            >
              <ArrowLeftRight size={14} strokeWidth={2.75} /> Swap
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="delimiter" className={labelClass}>
                Delimiter
              </label>
              <select
                id="delimiter"
                name="delimiter"
                value={delimiterChoice}
                onChange={(e) => setDelimiterChoice(e.target.value)}
                className={selectClass}
              >
                {DELIMITERS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-[#666] mt-1.5">Using the {delimiterName} separator.</p>
            </div>
            <div className="flex flex-col justify-center gap-3">
              {toJson ? (
                <>
                  <Checkbox
                    id="header"
                    checked={withHeader}
                    onChange={setWithHeader}
                    label="First row is a header"
                    hint="Off gives an array of arrays instead of objects."
                  />
                  <Checkbox
                    id="typed"
                    checked={typed}
                    onChange={setTyped}
                    label="Detect numbers and booleans"
                    hint="Off keeps every value a string, which protects leading zeros."
                  />
                </>
              ) : (
                <p className="text-xs text-[#666] leading-relaxed">
                  An array of objects becomes a header row plus one row per record. Nested
                  objects and arrays are written into the cell as JSON text.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 mb-2">
            <label htmlFor="source" className={labelClass + " mb-0"}>
              {toJson ? "Your CSV" : "Your JSON"}
            </label>
            <div className="flex gap-2">
              <button type="button" onClick={() => fileRef.current?.click()} className={buttonClass}>
                <Upload size={14} strokeWidth={2.75} /> Open file
              </button>
              <button
                type="button"
                onClick={() => (toJson ? setCsvText("") : setJsonText(""))}
                className={buttonClass}
              >
                <Trash2 size={14} strokeWidth={2.75} /> Clear
              </button>
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.tsv,.txt,.json,text/csv,application/json"
            className="sr-only"
            onChange={(e) => readFile(e.target.files?.[0])}
          />
          <textarea
            id="source"
            name="source"
            value={source}
            onChange={(e) => (toJson ? setCsvText(e.target.value) : setJsonText(e.target.value))}
            rows={9}
            spellCheck="false"
            className={areaClass}
          />

          {/* aria-live so the conversion is announced as it happens, with no
              Convert button in the way. */}
          <div aria-live="polite" className="mt-6">
            {result.error ? (
              <p className="border-2 border-black rounded-xl bg-white px-4 py-4 text-sm font-bold text-[#111] mb-4">
                {result.error}
              </p>
            ) : null}

            <div className="flex items-center justify-between gap-3 mb-2">
              <label htmlFor="output" className={labelClass + " mb-0"}>
                {toJson ? "JSON output" : "CSV output"}
              </label>
              <div className="flex gap-2">
                <CopyButton value={result.output} disabled={!result.output} />
                <button
                  type="button"
                  disabled={!result.output}
                  onClick={() =>
                    downloadTextFile(
                      toJson ? "data.json" : "data.csv",
                      result.output,
                      toJson ? "application/json" : "text/csv"
                    )
                  }
                  className={`${buttonClass} disabled:opacity-40`}
                >
                  <Download size={14} strokeWidth={2.75} /> Download
                </button>
              </div>
            </div>
            <textarea
              id="output"
              name="output"
              readOnly
              value={result.output}
              rows={9}
              className={`${areaClass} bg-[#FAFAF7]`}
            />
            <p className="text-xs text-[#666] mt-1.5">
              {result.count} {result.count === 1 ? "record" : "records"} converted.
            </p>

            {result.preview.length > 0 ? (
              <div className="mt-5">
                <p className="text-sm font-bold text-[#111] mb-2">
                  Parsed preview{result.preview.length >= 8 ? " (first 8 rows)" : ""}
                </p>
                <div className="border-2 border-black rounded-xl bg-white overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <tbody>
                      {result.preview.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b-2 border-black last:border-b-0">
                          {row.map((cell, cellIndex) => (
                            <td
                              key={cellIndex}
                              className="px-3 py-2 border-r border-[#ddd] last:border-r-0 align-top whitespace-pre-wrap"
                              style={{
                                fontWeight: rowIndex === 0 && withHeader ? 700 : 400,
                                background: rowIndex === 0 && withHeader ? "#F7F3DC" : "#fff",
                              }}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </div>

          <OnDeviceNote>
            The parsing runs in this tab. A file you open is read with the browser file
            reader, so a spreadsheet of customer or student records is never uploaded.
          </OnDeviceNote>
        </div>
      </section>

      <ToolSection title="What RFC 4180 actually requires">
        <p>
          RFC 4180 is the closest thing CSV has to a specification, and the three
          rules that matter are all about quotes. A field may be wrapped in
          double quotes. A quoted field may contain the delimiter, a carriage
          return or a line feed. A quote inside a quoted field is written twice.
        </p>
        <p>
          That is why splitting a CSV on commas is wrong so often. The sample
          loaded above contains a note with a comma in it, a note with a line
          break in the middle, and a note containing doubled quotes. A naive
          split produces four broken rows from those three records. The parser
          here walks the text one character at a time and tracks whether it is
          inside quotes, so all three survive the trip.
        </p>
      </ToolSection>

      <ToolSection title="Converting JSON back to CSV">
        <p>
          Going the other way is lossy in a different direction, because JSON has
          nesting and CSV does not. Two decisions are worth knowing about.
        </p>
        <p>
          <strong>The header is the union of every key.</strong> If the first
          record has no middle name and the second one does, the column still
          appears and the first record gets an empty cell, rather than every
          later value shifting one column left.
        </p>
        <p>
          <strong>Nested values are written as JSON text in the cell.</strong> An
          address object becomes readable JSON inside one column instead of being
          dropped or exploded into columns that would not survive a round trip.
        </p>
      </ToolSection>

      <ToolSection title="Why numbers stay strings by default">
        <p>
          Typed output looks tidier, right up until a ZIP code of 02138 becomes
          2138, a student ID of 0004 becomes 4, and a phone number in scientific
          notation becomes unusable. CSV has no types, so any conversion is a
          guess about intent.
        </p>
        <p>
          The safe default is to keep every value a string and let you opt in.
          Turn on number and boolean detection when the data is genuinely
          numeric, such as scores, prices or counts.
        </p>
      </ToolSection>

      <ToolSection title="Frequently asked questions" id="faq">
        <FaqList items={CSV_TO_JSON_FAQS} />
      </ToolSection>

      <ToolCta
        location="csv_to_json"
        heading="Cleaning the data is one job. Learning it is another."
        body="FORKSAI turns your notes, slides and PDFs into flashcards and study sessions, so the material you are wrangling actually sticks."
      />

      <FormatToolCrossLinks current="/csv-to-json" />
    </ToolPageShell>
  );
}
