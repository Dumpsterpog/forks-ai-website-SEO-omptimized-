"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Upload } from "lucide-react";
import ToolPageShell, {
  ToolCta,
  ToolSection,
  FaqList,
  cardClass,
  inputClass,
  labelClass,
  buttonClass,
} from "@/components/ToolPageShell";
import { PdfDocument, PAGE_SIZES, FONT_FAMILIES } from "@/lib/formatToolsPdf";
import {
  parseMarkdown,
  renderMarkdownToPdf,
  SUPPORTED,
  NOT_SUPPORTED,
} from "@/lib/formatToolsMarkdown";
import { FormatToolCrossLinks, OnDeviceNote, formatBytes } from "@/lib/formatToolsShell";
import { downloadBlob } from "@/lib/formatToolsCsv";
import { MARKDOWN_TO_PDF_FAQS } from "@/lib/formatToolsFaqs";

const SAMPLE = `# Cell respiration, week 4

A short set of notes to show what the renderer supports.

## The three stages

1. Glycolysis, in the cytoplasm
2. The Krebs cycle, in the mitochondrial matrix
3. Oxidative phosphorylation, on the inner membrane

Key terms are **bold**, definitions are *italic*, and anything mechanical is
written as \`inline code\`.

> Glycolysis nets two ATP per glucose molecule, which is the number people
> forget under exam pressure.

- Aerobic yield: about 30 to 32 ATP
- Anaerobic yield: 2 ATP
  - Lactate in animals
  - Ethanol in yeast

\`\`\`
glucose + 6 O2 -> 6 CO2 + 6 H2O + ATP
\`\`\`

---

See the [reading list](https://example.com/reading) before the seminar.`;

const selectClass =
  "w-full border-2 border-black rounded-xl bg-white px-3 py-2.5 text-sm font-bold text-[#111] " +
  "outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]";

// The preview mirrors the PDF structurally: same blocks, same order, browser
// fonts rather than the PDF fonts, which is why line breaks can differ.
function Spans({ spans }) {
  return spans.map((span, i) => {
    let node = span.text;
    if (span.code) {
      node = (
        <code key={i} className="font-mono text-[0.92em] bg-[#F2F1EA] px-1 py-0.5 rounded">
          {span.text}
        </code>
      );
    }
    if (span.bold) node = <strong key={i}>{node}</strong>;
    if (span.italic) node = <em key={i}>{node}</em>;
    if (span.href) {
      return (
        <span key={i}>
          {node} <span className="text-[#666] text-[0.85em]">({span.href})</span>
        </span>
      );
    }
    return <span key={i}>{node}</span>;
  });
}

function Preview({ blocks }) {
  return blocks.map((block, index) => {
    switch (block.type) {
      case "heading": {
        const Tag = `h${Math.min(block.level + 1, 6)}`;
        const sizes = ["1.6rem", "1.35rem", "1.15rem", "1.05rem", "1rem", "0.95rem"];
        return (
          <Tag
            key={index}
            className="font-serif font-black text-[#111] mt-4 mb-2 leading-tight"
            style={{ fontSize: sizes[block.level - 1] }}
          >
            <Spans spans={block.spans} />
          </Tag>
        );
      }
      case "paragraph":
        return (
          <p key={index} className="text-[15px] text-[#222] leading-relaxed mb-3">
            <Spans spans={block.spans} />
          </p>
        );
      case "list":
        return (
          <ul key={index} className="mb-3 space-y-1">
            {block.items.map((item, i) => (
              <li
                key={i}
                className="text-[15px] text-[#222] leading-relaxed flex gap-2"
                style={{ paddingLeft: item.depth * 16 }}
              >
                <span className="text-[#666] shrink-0">{item.marker}</span>
                <span>
                  <Spans spans={item.spans} />
                </span>
              </li>
            ))}
          </ul>
        );
      case "code":
        return (
          <pre
            key={index}
            className="border-2 border-black rounded-xl bg-[#F2F1EA] px-4 py-3 font-mono text-[12.5px] text-[#111] overflow-x-auto mb-3"
          >
            {block.lines.join("\n")}
          </pre>
        );
      case "quote":
        return (
          <blockquote
            key={index}
            className="border-l-4 border-[#999] pl-4 text-[15px] text-[#444] italic leading-relaxed mb-3"
          >
            <Spans spans={block.spans} />
          </blockquote>
        );
      case "rule":
        return <hr key={index} className="border-t-2 border-[#ccc] my-4" />;
      default:
        return null;
    }
  });
}

export default function MarkdownToPdfContent() {
  const [markdown, setMarkdown] = useState(SAMPLE);
  const [fontFamily, setFontFamily] = useState("helvetica");
  const [fontSize, setFontSize] = useState(11);
  const [pageSize, setPageSize] = useState("a4");
  const [marginMm, setMarginMm] = useState(20);
  const [output, setOutput] = useState(null);

  const blocks = useMemo(() => parseMarkdown(markdown), [markdown]);

  useEffect(() => {
    let cancelled = false;
    let url = "";
    const timer = setTimeout(() => {
      try {
        const family = FONT_FAMILIES.find((f) => f.id === fontFamily) || FONT_FAMILIES[0];
        const doc = new PdfDocument({ pageSize, marginMm: Number(marginMm) || 0 });
        renderMarkdownToPdf(doc, blocks, { family, fontSize: Number(fontSize) || 11 });
        const blob = doc.toBlob();
        url = URL.createObjectURL(blob);
        if (!cancelled) {
          setOutput({
            blob,
            url,
            pages: doc.pages.length,
            unsupported: Array.from(doc.unsupported).slice(0, 12),
          });
        }
      } catch {
        if (!cancelled) setOutput(null);
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (url) setTimeout(() => URL.revokeObjectURL(url), 0);
    };
  }, [blocks, fontFamily, fontSize, pageSize, marginMm]);

  const openFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setMarkdown(String(reader.result ?? ""));
    reader.readAsText(file);
  };

  return (
    <ToolPageShell>
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif font-black text-3xl sm:text-[2.6rem] leading-[1.08] text-[#111] mb-3">
          Markdown to PDF
        </h1>
        <p className="text-[15px] sm:text-base text-[#444] leading-relaxed mb-6 max-w-2xl">
          Write or paste markdown, see it rendered, then download it as a PDF
          with the headings, lists, code blocks and quotes intact. Free, no
          signup, and the document never leaves your browser.
        </p>

        <div className={`${cardClass} p-5 sm:p-7`}>
          <div className="flex items-center justify-between gap-3 mb-2">
            <label htmlFor="markdown" className={labelClass + " mb-0"}>
              Your markdown
            </label>
            <label className={`${buttonClass} cursor-pointer`}>
              <Upload size={14} strokeWidth={2.75} /> Open a .md file
              <input
                type="file"
                accept=".md,.markdown,.txt,text/markdown,text/plain"
                className="sr-only"
                onChange={(e) => openFile(e.target.files?.[0])}
              />
            </label>
          </div>
          <textarea
            id="markdown"
            name="markdown"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            rows={12}
            spellCheck="false"
            className="w-full border-2 border-black rounded-xl bg-white px-4 py-3 font-mono text-[13px] text-[#111] leading-relaxed outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A] resize-y"
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
            <div>
              <label htmlFor="font" className={labelClass}>
                Font
              </label>
              <select
                id="font"
                name="font"
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className={selectClass}
              >
                {FONT_FAMILIES.map((family) => (
                  <option key={family.id} value={family.id}>
                    {family.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="size" className={labelClass}>
                Body size
              </label>
              <input
                id="size"
                name="size"
                type="number"
                inputMode="numeric"
                min={7}
                max={24}
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="pageSize" className={labelClass}>
                Page size
              </label>
              <select
                id="pageSize"
                name="pageSize"
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value)}
                className={selectClass}
              >
                {PAGE_SIZES.map((size) => (
                  <option key={size.id} value={size.id}>
                    {size.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="margin" className={labelClass}>
                Margin
              </label>
              <div className="relative">
                <input
                  id="margin"
                  name="margin"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={60}
                  value={marginMm}
                  onChange={(e) => setMarginMm(e.target.value)}
                  className={`${inputClass} pr-14`}
                />
                <span
                  aria-hidden="true"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#666]"
                >
                  mm
                </span>
              </div>
            </div>
          </div>

          {/* aria-live so the page count and any warning are announced. */}
          <div aria-live="polite" className="mt-6">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={!output}
                onClick={() => output && downloadBlob("document.pdf", output.blob)}
                className={`${buttonClass} disabled:opacity-40`}
              >
                <Download size={14} strokeWidth={2.75} /> Download PDF
              </button>
              {output ? (
                <span className="text-sm text-[#555]">
                  {output.pages} {output.pages === 1 ? "page" : "pages"},{" "}
                  {formatBytes(output.blob.size)}
                </span>
              ) : null}
            </div>

            {output && output.unsupported.length > 0 ? (
              <p
                className="border-2 border-black rounded-xl px-4 py-3 text-sm text-[#111] mt-3"
                style={{ background: "#F0D44A" }}
              >
                These characters cannot be written with the standard PDF fonts and have
                been replaced with question marks: {output.unsupported.join(" ")}.
              </p>
            ) : null}

            <p className={`${labelClass} mt-5`}>Rendered preview</p>
            <div className="border-2 border-black rounded-xl bg-white p-5 max-h-[520px] overflow-y-auto">
              <Preview blocks={blocks} />
            </div>
            <p className="text-xs text-[#666] mt-2">
              The preview uses your browser's fonts and the PDF uses the standard PDF
              fonts, so line breaks can land differently. Headings, lists, code and quotes
              match.
            </p>
          </div>

          <OnDeviceNote>
            The markdown is parsed and the PDF is written in this tab. A draft, a README
            or a set of private notes is never uploaded.
          </OnDeviceNote>
        </div>
      </section>

      <ToolSection title="Which markdown is supported">
        <p>
          This is a common subset rather than full CommonMark, and the honest
          list is short enough to print.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="border-2 border-black rounded-xl bg-white p-4">
            <p className="font-bold text-sm text-[#111] mb-2">Rendered</p>
            <ul className="text-sm text-[#555] leading-relaxed space-y-1.5">
              {SUPPORTED.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="border-2 border-black rounded-xl bg-white p-4">
            <p className="font-bold text-sm text-[#111] mb-2">Not rendered</p>
            <ul className="text-sm text-[#555] leading-relaxed space-y-1.5">
              {NOT_SUPPORTED.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <p>
          Nothing unsupported is silently dropped except images. A table comes
          through as its raw markdown, so you can see it in the preview and
          decide what to do rather than discovering the gap after you send the
          file.
        </p>
      </ToolSection>

      <ToolSection title="What happens to links">
        <p>
          A PDF page is not a web page. Link text is printed, and the address
          follows it in brackets at a slightly smaller size, so a printed copy
          still carries the destination.
        </p>
        <p>
          If your document is mostly links, that gets noisy quickly. Shorten the
          addresses in the markdown before exporting, or move them into a
          reading list at the end.
        </p>
      </ToolSection>

      <ToolSection title="Frequently asked questions" id="faq">
        <FaqList items={MARKDOWN_TO_PDF_FAQS} />
      </ToolSection>

      <ToolCta
        location="markdown_to_pdf"
        heading="Your notes are already written. Now make them stick."
        body="FORKSAI turns markdown notes, slides and PDFs into flashcards and spaced repetition sessions, so revision is not just rereading."
      />

      <FormatToolCrossLinks current="/markdown-to-pdf" />
    </ToolPageShell>
  );
}
