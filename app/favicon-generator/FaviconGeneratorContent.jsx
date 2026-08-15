"use client";

import { useEffect, useState } from "react";
import { Download, Package } from "lucide-react";
import ToolPageShell, {
  ToolCta,
  ToolSection,
  FaqList,
  cardClass,
  labelClass,
  buttonClass,
} from "@/components/ToolPageShell";
import { generateFavicons, buildZip, buildIco, downloadBlob } from "@/lib/formatToolsImage";
import {
  FormatToolCrossLinks,
  OnDeviceNote,
  FileDropZone,
  CopyButton,
  formatBytes,
} from "@/lib/formatToolsShell";
import { FAVICON_GENERATOR_FAQS } from "@/lib/formatToolsFaqs";

const HTML_SNIPPET = `<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">`;

const MANIFEST_SNIPPET = `{
  "icons": [
    { "src": "/icon-192.png", "type": "image/png", "sizes": "192x192" },
    { "src": "/icon-512.png", "type": "image/png", "sizes": "512x512" }
  ]
}`;

// The file names the snippets above expect, so a copied snippet works against
// the zip without renaming anything.
const FILE_NAMES = {
  16: "favicon-16.png",
  32: "favicon-32.png",
  48: "favicon-48.png",
  180: "apple-touch-icon.png",
  192: "icon-192.png",
  512: "icon-512.png",
};

export default function FaviconGeneratorContent() {
  const [file, setFile] = useState(null);
  const [background, setBackground] = useState("#ffffff");
  const [useBackground, setUseBackground] = useState(false);
  const [output, setOutput] = useState(null);
  const [failure, setFailure] = useState(null);

  // One string identifying the icon set the settings currently ask for. The
  // output carries the key it was generated for, so "still resizing" is derived
  // rather than tracked in a busy flag set inside the effect.
  const jobKey = file ? `${file.name}:${file.size}:${useBackground ? background : "transparent"}` : "";

  useEffect(() => {
    if (!file) return undefined;
    let cancelled = false;
    let created = [];

    generateFavicons(file, { background: useBackground ? background : null })
      .then(({ results, sourceWidth, sourceHeight }) => {
        if (cancelled) {
          results.forEach((icon) => URL.revokeObjectURL(icon.url));
          return;
        }
        created = results;
        setOutput({ key: jobKey, icons: results, source: { width: sourceWidth, height: sourceHeight } });
      })
      .catch((err) => {
        if (!cancelled) {
          setFailure({ key: jobKey, message: err.message || "That image could not be read." });
        }
      });

    return () => {
      cancelled = true;
      created.forEach((icon) => setTimeout(() => URL.revokeObjectURL(icon.url), 0));
    };
  }, [file, useBackground, background, jobKey]);

  const current = output && output.key === jobKey ? output : null;
  const icons = current ? current.icons : [];
  const source = current ? current.source : null;
  const error = failure && failure.key === jobKey ? failure.message : "";
  const busy = Boolean(file) && !current && !error;

  const downloadZip = async () => {
    const ico = await buildIco(icons.filter((icon) => icon.size <= 48));
    const zip = await buildZip([
      ...icons.map((icon) => ({ name: FILE_NAMES[icon.size], blob: icon.blob })),
      { name: "favicon.ico", blob: ico },
      {
        name: "site.webmanifest",
        blob: new Blob([MANIFEST_SNIPPET], { type: "application/manifest+json" }),
      },
      { name: "head-tags.html", blob: new Blob([HTML_SNIPPET], { type: "text/html" }) },
    ]);
    downloadBlob("favicons.zip", zip);
  };

  const notSquare = source && source.width !== source.height;
  const tooSmall = source && Math.min(source.width, source.height) < 512;

  return (
    <ToolPageShell>
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif font-black text-3xl sm:text-[2.6rem] leading-[1.08] text-[#111] mb-3">
          Favicon generator
        </h1>
        <p className="text-[15px] sm:text-base text-[#444] leading-relaxed mb-6 max-w-2xl">
          Upload one image and get every favicon size a site needs: 16, 32, 48,
          180, 192 and 512 pixels, plus a favicon.ico and the head tags to paste
          into your HTML. Free, no signup, and the image is resized in your
          browser rather than on a server you do not control.
        </p>

        <div className={`${cardClass} p-5 sm:p-7`}>
          <FileDropZone
            id="source-image"
            label="Your logo or icon"
            accept="image/*"
            fileName={file ? `${file.name} (${formatBytes(file.size)})` : ""}
            hint="Square works best, 512 pixels or larger. A non-square image is cropped from the centre."
            onFile={(next) => {
              setFile(next);
              setOutput(null);
              setFailure(null);
            }}
          />

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <label className="inline-flex items-center gap-2.5 text-sm text-[#333]">
              <input
                type="checkbox"
                checked={useBackground}
                onChange={(e) => setUseBackground(e.target.checked)}
                className="h-5 w-5 border-2 border-black rounded accent-[#F0D44A] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
              />
              <span className="font-bold text-[#111]">Fill the transparent background</span>
            </label>
            {useBackground ? (
              <span className="inline-flex items-center gap-2">
                <label htmlFor="background" className="text-sm font-bold text-[#111]">
                  Colour
                </label>
                <input
                  id="background"
                  name="background"
                  type="color"
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  className="h-10 w-16 border-2 border-black rounded-lg bg-white p-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
                />
              </span>
            ) : (
              <span className="text-xs text-[#666]">Transparency is kept by default.</span>
            )}
          </div>

          {/* aria-live so the generated set is announced once it is ready. */}
          <div aria-live="polite" className="mt-6">
            {!file ? (
              <p className="border-2 border-black rounded-xl bg-white px-4 py-4 text-sm text-[#555]">
                Choose an image above and all six sizes appear here.
              </p>
            ) : error ? (
              <p className="border-2 border-black rounded-xl bg-white px-4 py-4 text-sm font-bold text-[#111]">
                {error}
              </p>
            ) : busy && icons.length === 0 ? (
              <p className="border-2 border-black rounded-xl bg-white px-4 py-4 text-sm text-[#555]">
                Resizing.
              </p>
            ) : icons.length > 0 ? (
              <>
                {notSquare || tooSmall ? (
                  <p className="border-2 border-black rounded-xl px-4 py-3 text-sm text-[#111] mb-4" style={{ background: "#F0D44A" }}>
                    {notSquare
                      ? `Your image is ${source.width} by ${source.height}, so it was cropped from the centre to a square. `
                      : ""}
                    {tooSmall
                      ? `The smaller side is ${Math.min(
                          source.width,
                          source.height
                        )} pixels, so the 512 icon has been scaled up and will look soft.`
                      : ""}
                  </p>
                ) : null}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {icons.map((icon) => (
                    <div key={icon.size} className="border-2 border-black rounded-xl bg-white p-3">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={icon.url}
                          alt={`Favicon at ${icon.size} by ${icon.size} pixels`}
                          width={Math.min(icon.size, 48)}
                          height={Math.min(icon.size, 48)}
                          className="border border-[#ddd] rounded"
                        />
                        <div>
                          <p className="font-bold text-sm text-[#111]">
                            {icon.size} x {icon.size}
                          </p>
                          <p className="text-xs text-[#666]">{formatBytes(icon.blob.size)}</p>
                        </div>
                      </div>
                      <p className="text-xs text-[#666] mt-2 leading-snug">{icon.purpose}</p>
                      <button
                        type="button"
                        onClick={() => downloadBlob(FILE_NAMES[icon.size], icon.blob)}
                        className="mt-2 inline-flex items-center gap-1.5 border-2 border-black rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#111] bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
                      >
                        <Download size={12} strokeWidth={2.75} /> PNG
                      </button>
                    </div>
                  ))}
                </div>

                <button type="button" onClick={downloadZip} className={`${buttonClass} mt-4`}>
                  <Package size={14} strokeWidth={2.75} /> Download all as a zip
                </button>
                <p className="text-xs text-[#666] mt-2">
                  The zip holds all six PNGs, a favicon.ico built from the 16, 32 and 48
                  pixel versions, a starter site.webmanifest and the head tags below.
                </p>

                <div className="mt-6">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className={labelClass + " mb-0"}>Paste this into your head</p>
                    <CopyButton value={HTML_SNIPPET} />
                  </div>
                  <pre className="border-2 border-black rounded-xl bg-white px-4 py-3 font-mono text-[12px] text-[#111] overflow-x-auto">
                    {HTML_SNIPPET}
                  </pre>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className={labelClass + " mb-0"}>site.webmanifest</p>
                    <CopyButton value={MANIFEST_SNIPPET} />
                  </div>
                  <pre className="border-2 border-black rounded-xl bg-white px-4 py-3 font-mono text-[12px] text-[#111] overflow-x-auto">
                    {MANIFEST_SNIPPET}
                  </pre>
                </div>
              </>
            ) : null}
          </div>

          <OnDeviceNote>
            The resizing, the ico and the zip are all built in this tab with the canvas
            API. Your logo is never uploaded, which matters when the brand is not public
            yet.
          </OnDeviceNote>
        </div>
      </section>

      <ToolSection title="What each size is for">
        <p>
          <strong>16 and 32 pixels</strong> are the browser tab and the bookmark
          bar, at standard and retina density. These are the two that most people
          will ever see, and they are the two where detail disappears.
        </p>
        <p>
          <strong>48 pixels</strong> covers Windows site shortcuts and a few
          desktop contexts that still ask for it.
        </p>
        <p>
          <strong>180 pixels</strong> is the Apple touch icon, used when somebody
          adds your site to an iPhone or iPad home screen.
        </p>
        <p>
          <strong>192 and 512 pixels</strong> are the manifest icons Android and
          progressive web apps read for home screens, install prompts and splash
          screens.
        </p>
      </ToolSection>

      <ToolSection title="Designing an icon that survives 16 pixels">
        <p>
          A favicon is smaller than a word of body text. Full logos with a
          wordmark turn into grey mush at that size, which is why most sites use
          a single letter, a monogram or one simplified shape.
        </p>
        <p>
          Three things that help: high contrast between the mark and its
          background, thick strokes rather than hairlines, and generous padding
          so the shape does not touch the edges. Check the 16 pixel preview above
          before you commit, since that is the honest test.
        </p>
      </ToolSection>

      <ToolSection title="Where the files go">
        <p>
          Put every file in your site root, or in the public folder if your
          framework has one, so they are served from addresses like
          /favicon-32.png. Then paste the head tags into your HTML template.
          Next.js, Astro and most static site generators serve the public folder
          at the root for exactly this reason.
        </p>
        <p>
          If the old icon keeps appearing after you deploy, it is almost always
          the cache rather than the file. Open the icon address directly to
          confirm the new one is being served, then hard reload the page.
        </p>
      </ToolSection>

      <ToolSection title="Frequently asked questions" id="faq">
        <FaqList items={FAVICON_GENERATOR_FAQS} />
      </ToolSection>

      <ToolCta
        location="favicon_generator"
        heading="Shipping the site is one thing. Passing the term is another."
        body="FORKSAI turns your notes, slides and PDFs into flashcards and study sessions, so the studying fits around everything else you are building."
      />

      <FormatToolCrossLinks current="/favicon-generator" />
    </ToolPageShell>
  );
}
