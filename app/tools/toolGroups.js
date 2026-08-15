// The hub's sections. Every member is read out of the list that already owns
// the tool, so a tool added to lib/studentTools.js, lib/imageTools.js,
// lib/pdfTools.js or lib/formatToolsMeta.js reaches the hub, its JSON-LD and
// the sitemap without its name or its blurb being typed a second time.
//
// Plain module with no browser access at import time: app/tools/page.js is a
// Server Component and imports it to build the ItemList.

import { TOOLS } from "@/lib/studentTools";
import { IMAGE_TOOLS } from "@/lib/imageTools";
import { PDF_TOOLS } from "@/lib/pdfTools";
import { FORMAT_TOOLS } from "@/lib/formatToolsMeta";

// The converter group is the longest, and its source order is the order the
// pages were built in, which buries the ones people arrive looking for.
// Anything not named here keeps its list position, after the ones that are.
const CONVERTER_LEAD = [
  "/compress-image",
  "/image-converter",
  "/word-counter",
  "/qr-code-generator",
];

function leadWith(tools, order) {
  const rank = (tool) => {
    const at = order.indexOf(tool.href);
    return at === -1 ? order.length : at;
  };
  // Array sort is stable, so the tools that share the fallback rank stay in
  // the order the source list put them in.
  return [...tools].sort((a, b) => rank(a) - rank(b));
}

export const TOOL_GROUPS = [
  {
    id: "study",
    title: "Study calculators",
    intro:
      "Attendance, final grades, GPA conversion, and notes turned into flashcards by pattern matching.",
    // Longer copy per card than the other groups, so these get two columns
    // rather than three.
    wide: true,
    tools: TOOLS,
  },
  {
    id: "image",
    title: "Image tools",
    intro:
      "Resize, crop and hit the exact pixel and file size an application form asks for.",
    tools: IMAGE_TOOLS,
  },
  {
    id: "pdf",
    title: "PDF tools",
    intro:
      "Merge, split, rotate and convert PDFs on your own device, without uploading them.",
    tools: PDF_TOOLS,
  },
  {
    id: "convert",
    title: "File and text converters",
    intro:
      "Change a file from one format into another, and count or reshape what you have written.",
    tools: leadWith(FORMAT_TOOLS, CONVERTER_LEAD),
  },
];

export const ALL_TOOLS = TOOL_GROUPS.flatMap((group) => group.tools);
