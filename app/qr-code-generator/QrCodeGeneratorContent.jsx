"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Download } from "lucide-react";
import ToolPageShell, {
  ToolCta,
  ToolSection,
  FaqList,
  cardClass,
  labelClass,
  buttonClass,
} from "@/components/ToolPageShell";
import { encodeQr, qrToCanvas, qrToSvg, ECC_LEVELS } from "@/lib/formatToolsQr";
import { FormatToolCrossLinks, OnDeviceNote } from "@/lib/formatToolsShell";
import { downloadBlob, downloadTextFile } from "@/lib/formatToolsCsv";
import { QR_CODE_FAQS } from "@/lib/formatToolsFaqs";

const SIZES = [256, 512, 1024, 2048];

const selectClass =
  "w-full border-2 border-black rounded-xl bg-white px-3 py-2.5 text-sm font-bold text-[#111] " +
  "outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]";

export default function QrCodeGeneratorContent() {
  const [text, setText] = useState("https://forksai.app");
  const [ecl, setEcl] = useState("M");
  const [pixels, setPixels] = useState(512);
  const canvasRef = useRef(null);

  const result = useMemo(() => {
    if (!text.trim()) return { qr: null, error: "" };
    try {
      return { qr: encodeQr(text, { ecl }), error: "" };
    } catch (err) {
      return { qr: null, error: err.message };
    }
  }, [text, ecl]);

  // Drawn onto a canvas at a whole number of pixels per module, which is what
  // keeps the edges hard enough for a phone camera to read.
  useEffect(() => {
    const holder = canvasRef.current;
    if (!holder) return;
    holder.replaceChildren();
    if (!result.qr) return;
    const canvas = qrToCanvas(result.qr, { pixels: 384 });
    canvas.style.width = "100%";
    canvas.style.maxWidth = "320px";
    canvas.style.height = "auto";
    canvas.style.imageRendering = "pixelated";
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", `QR code for ${text.slice(0, 60)}`);
    holder.appendChild(canvas);
  }, [result.qr, text]);

  const downloadPng = () => {
    if (!result.qr) return;
    const canvas = qrToCanvas(result.qr, { pixels });
    canvas.toBlob((blob) => {
      if (blob) downloadBlob("qr-code.png", blob);
    }, "image/png");
  };

  const downloadSvg = () => {
    if (!result.qr) return;
    downloadTextFile("qr-code.svg", qrToSvg(result.qr, { moduleSize: 10 }), "image/svg+xml");
  };

  const used = result.qr ? Math.round((result.qr.byteLength / result.qr.capacity) * 100) : 0;

  return (
    <ToolPageShell>
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif font-black text-3xl sm:text-[2.6rem] leading-[1.08] text-[#111] mb-3">
          QR code generator
        </h1>
        <p className="text-[15px] sm:text-base text-[#444] leading-relaxed mb-6 max-w-2xl">
          Turn a link or any text into a QR code, then download it as a PNG for
          screens or an SVG for print. The code holds your content directly, so
          there is no redirect service in the middle, nothing to expire and no
          tracking. Free, no signup, generated in your browser.
        </p>

        <div className={`${cardClass} p-5 sm:p-7`}>
          <label htmlFor="content" className={labelClass}>
            Link or text
          </label>
          <textarea
            id="content"
            name="content"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            spellCheck="false"
            className="w-full border-2 border-black rounded-xl bg-white px-4 py-3 text-[15px] text-[#111] leading-relaxed outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A] resize-y"
          />
          <p className="text-xs text-[#666] mt-1.5">
            A full address starting with https opens the site. Plain text is shown to
            whoever scans it.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mt-5">
            <div>
              <label htmlFor="ecl" className={labelClass}>
                Error correction
              </label>
              <select
                id="ecl"
                name="ecl"
                value={ecl}
                onChange={(e) => setEcl(e.target.value)}
                className={selectClass}
              >
                {ECC_LEVELS.map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-[#666] mt-1.5">
                Higher recovery survives more damage but makes the code denser.
              </p>
            </div>
            <div>
              <label htmlFor="pixels" className={labelClass}>
                PNG size
              </label>
              <select
                id="pixels"
                name="pixels"
                value={pixels}
                onChange={(e) => setPixels(Number(e.target.value))}
                className={selectClass}
              >
                {SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size} by {size} pixels
                  </option>
                ))}
              </select>
              <p className="text-xs text-[#666] mt-1.5">
                The SVG is a vector, so it stays sharp at any size.
              </p>
            </div>
          </div>

          {/* aria-live so the version and capacity are announced as the text
              changes, with no Generate button in the way. */}
          <div aria-live="polite" className="mt-6">
            {result.error ? (
              <p className="border-2 border-black rounded-xl bg-white px-4 py-4 text-sm font-bold text-[#111]">
                {result.error}
              </p>
            ) : !result.qr ? (
              <p className="border-2 border-black rounded-xl bg-white px-4 py-4 text-sm text-[#555]">
                Type a link or some text above and the code appears here.
              </p>
            ) : (
              <div className="border-2 border-black rounded-xl bg-white p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  <div ref={canvasRef} className="w-full sm:w-auto shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-black uppercase tracking-widest text-[#666] mb-1">
                      This code
                    </p>
                    <p className="text-sm text-[#333] leading-relaxed">
                      Version {result.qr.version}, {result.qr.size} by {result.qr.size} modules,
                      error correction {result.qr.ecl}. It holds {result.qr.byteLength} bytes
                      of the {result.qr.capacity} this version allows at that level, which is{" "}
                      {used}% full.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      <button type="button" onClick={downloadPng} className={buttonClass}>
                        <Download size={14} strokeWidth={2.75} /> PNG
                      </button>
                      <button type="button" onClick={downloadSvg} className={buttonClass}>
                        <Download size={14} strokeWidth={2.75} /> SVG
                      </button>
                    </div>
                    <p className="text-xs text-[#666] mt-3 leading-relaxed">
                      Scan it with your phone camera before you use it anywhere. That is the
                      only test that counts.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <OnDeviceNote>
            The code is encoded in this tab, right down to the error correction maths. The
            link you type is never sent anywhere, which is not true of generators that
            wrap your address in a redirect they own.
          </OnDeviceNote>
        </div>
      </section>

      <ToolSection title="How to choose an error correction level">
        <p>
          A QR code carries spare data so a scanner can still read it when part
          of the code is dirty, torn or covered. The four levels recover roughly
          7%, 15%, 25% and 30% of the code.
        </p>
        <p>
          <strong>M is the sensible default</strong> for a screen or a document.
          <strong> Q or H</strong> earn their extra density on anything printed,
          anything that will live outdoors, and anything with a logo placed over
          the middle, since that logo is damage as far as the scanner is
          concerned. <strong>L</strong> is worth it only when the content is long
          and the code has to stay readable at a small size.
        </p>
      </ToolSection>

      <ToolSection title="Why the code gets denser as you type">
        <p>
          A QR code comes in versions, from 1 at 21 modules square up to 40 at
          177. The generator picks the smallest version that fits your content at
          the error correction level you chose, so a longer link means more
          modules in the same square, and each module gets smaller.
        </p>
        <p>
          That matters when the code will be printed small. If your code has gone
          dense, shorten the address, drop the tracking parameters, or use a
          shorter domain. It is the single most effective thing you can do for
          scan reliability.
        </p>
      </ToolSection>

      <ToolSection title="Printing a QR code so it actually scans">
        <p>
          Three things decide whether a printed code works. Size: a common rule
          of thumb is a code width of about one tenth of the distance it will be
          scanned from, so one metre away wants roughly ten centimetres across.
          Contrast: dark code on a light background, never the reverse, and never
          on a busy photograph.
        </p>
        <p>
          Quiet zone: the empty margin around the code is part of the code. The
          downloads here include it, so do not crop the file tight to the
          pattern. Then test the printed proof with two different phones before
          the run.
        </p>
      </ToolSection>

      <ToolSection title="Frequently asked questions" id="faq">
        <FaqList items={QR_CODE_FAQS} />
      </ToolSection>

      <ToolCta
        location="qr_code_generator"
        heading="A QR code shares the material. FORKSAI helps you learn it."
        body="Turn the notes, slides and PDFs behind that link into flashcards and spaced repetition sessions."
      />

      <FormatToolCrossLinks current="/qr-code-generator" />
    </ToolPageShell>
  );
}
