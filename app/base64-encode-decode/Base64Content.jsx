"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, ArrowUpDown, Download, Trash2 } from "lucide-react";
import ToolPageShell, {
  ToolCta,
  ToolSection,
  FaqList,
  cardClass,
  labelClass,
  buttonClass,
} from "@/components/ToolPageShell";
import { CopyButton, FileDropZone, formatBytes } from "@/lib/formatToolsShell";
import { TextToolCrossLinks, OnDeviceNote } from "@/lib/textToolsShell";
import { BASE64_FAQS } from "@/lib/textToolsFaqs";
import {
  encodeText,
  decodeToText,
  bytesToBase64,
  base64ToBytes,
  wrapLines,
} from "@/lib/textToolsBase64";

const SAMPLE = "Rocket \u{1F680} café naïve 你好";

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={buttonClass}
      style={active ? { background: "#F0D44A" } : undefined}
    >
      {children}
    </button>
  );
}

export default function Base64Content() {
  const [mode, setMode] = useState("text");
  const [direction, setDirection] = useState("encode");
  const [input, setInput] = useState(SAMPLE);
  const [urlSafe, setUrlSafe] = useState(false);
  const [wrap, setWrap] = useState(false);

  // File tab state
  const [file, setFile] = useState(null);
  const [fileBase64, setFileBase64] = useState("");
  const [fileBusy, setFileBusy] = useState(false);
  const [fileError, setFileError] = useState("");
  const [decodedUrl, setDecodedUrl] = useState("");
  const [decodedSize, setDecodedSize] = useState(0);
  const lastUrl = useRef("");

  // Text tab is live, since encoding a paragraph costs microseconds.
  const textResult = useMemo(() => {
    if (input === "") return { ok: true, value: "" };
    if (direction === "encode") {
      const encoded = encodeText(input, { urlSafe, padding: !urlSafe });
      return { ok: true, value: wrap ? wrapLines(encoded) : encoded };
    }
    const decoded = decodeToText(input);
    return decoded.ok ? { ok: true, value: decoded.text } : { ok: false, error: decoded.error };
  }, [input, direction, urlSafe, wrap]);

  const readFile = async (chosen) => {
    setFile(chosen);
    setFileError("");
    setFileBase64("");
    setFileBusy(true);
    try {
      const buffer = await chosen.arrayBuffer();
      setFileBase64(bytesToBase64(new Uint8Array(buffer)));
    } catch {
      setFileError("That file could not be read. It may be too large for this device's memory.");
    } finally {
      setFileBusy(false);
    }
  };

  // Rebuilding the object URL on every keystroke would leak one per press, so
  // the previous one is revoked first and the last is cleaned up on unmount.
  useEffect(() => {
    return () => {
      if (lastUrl.current) URL.revokeObjectURL(lastUrl.current);
    };
  }, []);

  const buildDownload = () => {
    setFileError("");
    const result = base64ToBytes(input);
    if (!result.ok) {
      setFileError(result.error);
      setDecodedUrl("");
      return;
    }
    if (lastUrl.current) URL.revokeObjectURL(lastUrl.current);
    const blob = new Blob([result.bytes], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    lastUrl.current = url;
    setDecodedUrl(url);
    setDecodedSize(result.bytes.length);
  };

  const dataUri = file && fileBase64 ? `data:${file.type || "application/octet-stream"};base64,${fileBase64}` : "";

  return (
    <ToolPageShell>
      {/* The box you paste into is the first thing on the page. */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif font-black text-3xl sm:text-[2.6rem] leading-[1.08] text-[#111] mb-3">
          Base64 encoder and decoder
        </h1>
        <p className="text-[15px] sm:text-base text-[#444] leading-relaxed mb-6 max-w-2xl">
          Encode text or a file to base64 and decode it back. Text goes through
          UTF-8 properly, so emoji, accented letters and non Latin scripts come
          out exactly as they went in rather than as mojibake. Free, no signup,
          and nothing leaves your browser.
        </p>

        <div className={`${cardClass} p-5 sm:p-7`}>
          <div className="flex flex-wrap gap-2 mb-5" role="group" aria-label="What to convert">
            <TabButton active={mode === "text"} onClick={() => setMode("text")}>
              Text
            </TabButton>
            <TabButton active={mode === "file"} onClick={() => setMode("file")}>
              File
            </TabButton>
          </div>

          {mode === "text" ? (
            <>
              <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Direction">
                <TabButton
                  active={direction === "encode"}
                  onClick={() => setDirection("encode")}
                >
                  Text to base64
                </TabButton>
                <TabButton
                  active={direction === "decode"}
                  onClick={() => setDirection("decode")}
                >
                  Base64 to text
                </TabButton>
              </div>

              <label htmlFor="source" className={labelClass}>
                {direction === "encode" ? "Your text" : "Your base64"}
              </label>
              <textarea
                id="source"
                name="source"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={6}
                spellCheck="false"
                className="w-full border-2 border-black rounded-xl bg-white px-4 py-3 font-mono text-[13.5px] text-[#111] leading-relaxed break-all outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A] resize-y"
              />

              <div className="flex flex-wrap gap-2 mt-3">
                <button type="button" onClick={() => setInput("")} className={buttonClass}>
                  <Trash2 size={14} strokeWidth={2.75} /> Clear
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!textResult.ok) return;
                    setInput(textResult.value);
                    setDirection(direction === "encode" ? "decode" : "encode");
                  }}
                  disabled={!textResult.ok || !textResult.value}
                  className={`${buttonClass} disabled:opacity-40`}
                >
                  <ArrowUpDown size={14} strokeWidth={2.75} /> Send result back up
                </button>
              </div>

              {direction === "encode" ? (
                <fieldset className="mt-4 border-2 border-black rounded-xl px-4 py-3">
                  <legend className="text-xs font-black uppercase tracking-widest text-[#111]/60 px-1">
                    Output options
                  </legend>
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    <label htmlFor="url-safe" className="flex items-center gap-2 text-sm text-[#111] cursor-pointer">
                      <input
                        id="url-safe"
                        name="url-safe"
                        type="checkbox"
                        checked={urlSafe}
                        onChange={(e) => setUrlSafe(e.target.checked)}
                        className="w-4 h-4 accent-[#111] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
                      />
                      URL safe alphabet, no padding
                    </label>
                    <label htmlFor="wrap" className="flex items-center gap-2 text-sm text-[#111] cursor-pointer">
                      <input
                        id="wrap"
                        name="wrap"
                        type="checkbox"
                        checked={wrap}
                        onChange={(e) => setWrap(e.target.checked)}
                        className="w-4 h-4 accent-[#111] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
                      />
                      Wrap lines at 76 characters
                    </label>
                  </div>
                </fieldset>
              ) : null}

              {/* aria-live so the result is announced as you type rather than
                  waiting behind a Convert button. */}
              <div aria-live="polite" className="mt-5">
                <label htmlFor="result" className={labelClass}>
                  Result
                </label>
                <textarea
                  id="result"
                  name="result"
                  readOnly
                  rows={6}
                  spellCheck="false"
                  value={textResult.ok ? textResult.value : ""}
                  placeholder={
                    direction === "encode" ? "The base64 appears here." : "The decoded text appears here."
                  }
                  className="w-full border-2 border-black rounded-xl px-4 py-3 font-mono text-[13.5px] text-[#111] leading-relaxed break-all outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A] resize-y"
                  style={{ background: textResult.ok ? "#fff" : "#F3F3EE" }}
                />
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <CopyButton
                    value={textResult.ok ? textResult.value : ""}
                    label="Copy result"
                    disabled={!textResult.ok || !textResult.value}
                  />
                  {textResult.ok && textResult.value ? (
                    <span className="text-xs text-[#666]">
                      {formatBytes(new TextEncoder().encode(input).length)} in,{" "}
                      {formatBytes(new TextEncoder().encode(textResult.value).length)} out
                    </span>
                  ) : null}
                </div>

                {!textResult.ok ? (
                  <div
                    className="border-2 border-black rounded-xl px-4 py-3 mt-3"
                    style={{ background: "#FBDDD8" }}
                  >
                    <p className="font-bold text-sm text-[#111] flex items-center gap-2">
                      <AlertTriangle size={15} strokeWidth={3} aria-hidden="true" /> That did not decode
                    </p>
                    <p className="text-sm text-[#111]/80 mt-1">{textResult.error}</p>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <FileDropZone
                id="file"
                label="File to encode"
                accept="*/*"
                fileName={file ? `${file.name}, ${formatBytes(file.size)}` : ""}
                hint="The file is read from disk into this tab. It is not uploaded."
                onFile={readFile}
              />

              <div aria-live="polite" className="mt-5">
                {fileBusy ? <p className="text-sm text-[#666]">Reading the file.</p> : null}

                {fileBase64 ? (
                  <>
                    <label htmlFor="file-result" className={labelClass}>
                      Base64
                    </label>
                    <textarea
                      id="file-result"
                      name="file-result"
                      readOnly
                      rows={6}
                      spellCheck="false"
                      value={fileBase64}
                      className="w-full border-2 border-black rounded-xl bg-white px-4 py-3 font-mono text-[12.5px] text-[#111] leading-relaxed break-all outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A] resize-y"
                    />
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <CopyButton value={fileBase64} label="Copy base64" />
                      <CopyButton value={dataUri} label="Copy as data URI" />
                      <span className="text-xs text-[#666]">
                        {formatBytes(file.size)} in, {formatBytes(fileBase64.length)} of base64 out
                      </span>
                    </div>
                  </>
                ) : null}

                <div className="mt-6 border-t-2 border-dashed border-[#ccc] pt-5">
                  <label htmlFor="file-input" className={labelClass}>
                    Base64 to turn back into a file
                  </label>
                  <textarea
                    id="file-input"
                    name="file-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    rows={5}
                    spellCheck="false"
                    placeholder="Paste base64 here, with or without a data URI prefix."
                    className="w-full border-2 border-black rounded-xl bg-white px-4 py-3 font-mono text-[12.5px] text-[#111] leading-relaxed break-all outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A] resize-y"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button type="button" onClick={buildDownload} className={buttonClass}>
                      Decode to a file
                    </button>
                    {decodedUrl ? (
                      <a
                        href={decodedUrl}
                        download="decoded.bin"
                        className={`${buttonClass} no-underline`}
                        style={{ background: "#F0D44A" }}
                      >
                        <Download size={14} strokeWidth={2.75} /> Download {formatBytes(decodedSize)}
                      </a>
                    ) : null}
                  </div>
                  <p className="text-xs text-[#666] mt-2 leading-relaxed">
                    The download is built in your browser from the bytes you pasted. Rename the
                    file afterwards to whatever extension it should have.
                  </p>
                </div>

                {fileError ? (
                  <div
                    className="border-2 border-black rounded-xl px-4 py-3 mt-3"
                    style={{ background: "#FBDDD8" }}
                  >
                    <p className="text-sm text-[#111]">{fileError}</p>
                  </div>
                ) : null}
              </div>
            </>
          )}

          <OnDeviceNote>
            Encoding and decoding are JavaScript running in this tab, and a file you choose
            is read from disk into memory here. Nothing is uploaded, logged or stored.
          </OnDeviceNote>
        </div>
      </section>

      <ToolSection title="Why UTF-8 is the whole story here">
        <p>
          Base64 encodes <strong>bytes</strong>, not characters. Text has to
          become bytes first, and the rule for doing that is the character
          encoding. Almost everything today uses UTF-8, where an ASCII letter is
          one byte, an accented letter is two, a CJK character is three and an
          emoji is four.
        </p>
        <p>
          The browser btoa function ignores all of that and assumes one byte per
          character. Hand it an emoji and it throws an error. Hand it an accented
          letter and it does something worse: it silently encodes the Latin-1
          byte, so cafe with an accent encodes to Y2Fm6Q== instead of Y2Fmw6k=,
          and decoding that anywhere expecting UTF-8 produces a replacement
          character. This tool runs the text through TextEncoder first and
          TextDecoder on the way back, so what goes in is what comes out.
        </p>
        <p>
          Decoding is strict on purpose. If the bytes are not valid UTF-8, you
          are told so rather than being handed a string full of replacement
          characters, because that usually means the data is a file rather than
          text.
        </p>
      </ToolSection>

      <ToolSection title="Standard and URL safe alphabets">
        <p>
          Standard base64 uses 64 characters: A to Z, a to z, 0 to 9, plus and
          slash, with equals signs padding the end. Plus and slash both mean
          something inside a URL, so pasting standard base64 into one mangles it.
        </p>
        <p>
          The URL safe variant swaps them for dash and underscore and usually
          drops the padding. JSON web tokens use it, which is why a JWT payload
          decodes here and fails in a stricter decoder. This decoder accepts
          either alphabet, restores missing padding, and ignores the line breaks
          that base64 in email headers and PEM certificates always carries.
        </p>
      </ToolSection>

      <ToolSection title="What base64 is for, and what it is not for">
        <p>
          It exists to move binary data through channels that only accept text:
          email attachments, data URIs in CSS, JSON payloads, certificates. The
          cost is size. Three bytes become four characters, so the encoded form
          is about a third larger, which is why inlining a large image as a data
          URI is usually a mistake.
        </p>
        <p>
          It is <strong>not encryption</strong>. There is no key and nothing
          secret about it. Anyone can paste it into a page like this one and read
          it back, so base64 hides nothing, and a token or a password is exactly
          as exposed after encoding as before.
        </p>
      </ToolSection>

      <ToolSection title="Frequently asked questions" id="faq">
        <FaqList items={BASE64_FAQS} />
      </ToolSection>

      <ToolCta
        location="base64_tool"
        heading="Encoding is reversible. Cramming is not."
        body="FORKSAI turns your notes, slides and PDFs into flashcards and spaced repetition sessions, so what you study stays available when you need it."
      />

      <TextToolCrossLinks current="/base64-encode-decode" />
    </ToolPageShell>
  );
}
