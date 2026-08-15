"use client";

// Shared pieces for the six text and developer tools: the cross-link strip and
// the on-device note. Lives here rather than in each page so the set cannot
// drift apart. The copy button and byte formatter are reused from the file and
// format tools instead of being written twice.

import Link from "next/link";
import { TEXT_TOOLS } from "@/lib/textToolsList";
import { FORMAT_TOOLS } from "@/lib/formatToolsMeta";

// Internal linking is what makes the six pages rank as a set instead of six
// orphans, so every one of them links to the other five and to the hub.
export function TextToolCrossLinks({ current }) {
  const others = TEXT_TOOLS.filter((tool) => tool.href !== current);
  const nearby = FORMAT_TOOLS.slice(0, 3);
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10 print:hidden">
      <h2 className="font-serif font-black text-xl text-[#111] mb-4">More free tools</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {others.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="block border-2 border-black rounded-xl bg-white p-4 no-underline shadow-[3px_3px_0_#111] transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-0.5 hover:translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
          >
            <span className="block font-bold text-sm text-[#111] mb-1.5">{tool.name}</span>
            <span className="block text-xs text-[#666] leading-relaxed">{tool.blurb}</span>
          </Link>
        ))}
      </div>
      <p className="text-sm text-[#555] mt-4">
        There are file and format tools too, such as{" "}
        {nearby.map((tool, i) => (
          <span key={tool.href}>
            <Link href={tool.href} className="font-bold text-[#111] underline underline-offset-2">
              {tool.name.toLowerCase()}
            </Link>
            {i < nearby.length - 1 ? ", " : ""}
          </span>
        ))}
        , and the full set is on the{" "}
        <Link href="/tools" className="font-bold text-[#111] underline underline-offset-2">
          free tools hub
        </Link>
        .
      </p>
    </section>
  );
}

// Every one of these tools runs on the device. Saying so next to the input is
// the whole reason to pick this over a site that posts your text to a server.
export function OnDeviceNote({ children }) {
  return (
    <p className="text-xs text-[#555] leading-relaxed mt-4 border-2 border-black rounded-xl bg-white px-4 py-3">
      <strong className="text-[#111]">Runs in your browser.</strong> {children}
    </p>
  );
}
