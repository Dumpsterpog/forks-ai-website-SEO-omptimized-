"use client";

// The landing page's reviews, as a wall of chat messages: each review is a
// message bubble with the student's initials and name over it, laid out in
// columns that hold still, so a visitor can read at their own pace instead of
// chasing three scrolling rows. Every few messages the bubble comes from the
// other side, dark with light text, the way a group chat alternates. Reviews
// stay exactly as they were left, in their own language, and the wall opens to
// show the rest on request.

import { useState } from "react";

const PRIMARY = "#11002e";
const LIME = "#CCFF00";
const MUTED = "#4a4551";
const LINE = "#e6e0ee";
const FONT_DISPLAY = "'Lexend', sans-serif";
const FONT_BODY = "'Hanken Grotesk', sans-serif";
const FONT_MONO = "'JetBrains Mono', monospace";

// Interleave the lists so languages and countries mix down the wall.
function weave(a, b) {
  const out = [];
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i]) out.push(a[i]);
    if (b[i]) out.push(b[i]);
  }
  return out;
}

function Bubble({ r, mine }) {
  const who = (
    <div style={{ display: "flex", alignItems: "baseline", gap: 6, justifyContent: mine ? "flex-end" : "flex-start", margin: mine ? "0 4px 6px 0" : "0 0 6px 4px", minWidth: 0 }}>
      <span style={{ fontFamily: FONT_DISPLAY, fontSize: 13, fontWeight: 700, color: PRIMARY, whiteSpace: "nowrap" }}>{r.name}</span>
      <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: MUTED, opacity: 0.85, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {r.country || r.handle}
      </span>
    </div>
  );
  const avatar = (
    <span
      aria-hidden="true"
      style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 999, display: "grid", placeItems: "center", background: mine ? LIME : PRIMARY, color: mine ? PRIMARY : LIME, fontFamily: FONT_DISPLAY, fontSize: 12, fontWeight: 800 }}
    >
      {r.initials}
    </span>
  );
  return (
    <figure className="rw-item" style={{ margin: 0, display: "flex", alignItems: "flex-end", gap: 10, flexDirection: mine ? "row-reverse" : "row" }}>
      {avatar}
      <div style={{ minWidth: 0, flex: 1, display: "flex", flexDirection: "column", alignItems: mine ? "flex-end" : "flex-start" }}>
        {who}
        <blockquote
          style={{
            margin: 0,
            maxWidth: "100%",
            padding: "12px 16px",
            borderRadius: mine ? "20px 20px 6px 20px" : "20px 20px 20px 6px",
            background: mine ? PRIMARY : "#ffffff",
            border: mine ? "none" : `1.5px solid ${LINE}`,
            color: mine ? "#f6f2ff" : PRIMARY,
            fontFamily: FONT_BODY,
            fontSize: 15,
            lineHeight: 1.55,
          }}
        >
          {r.text}
        </blockquote>
      </div>
    </figure>
  );
}

export default function ReviewWall({ reviews = [], moreReviews = [], collapsedCount = 12 }) {
  const all = weave(reviews, moreReviews);
  const [open, setOpen] = useState(false);
  const shown = open ? all : all.slice(0, collapsedCount);

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px" }}>
      <style>{`
        .rw-wall { columns: 3 300px; column-gap: 28px; }
        .rw-item { break-inside: avoid; margin-bottom: 22px !important; }
        .rw-more:hover { background: ${PRIMARY} !important; color: ${LIME} !important; }
        .rw-more:focus-visible { outline: 2px solid ${PRIMARY}; outline-offset: 3px; }
        @media (max-width: 680px) { .rw-wall { columns: 1; } .rw-closed .rw-item:nth-child(n+7) { display: none; } }
      `}</style>
      <div style={{ position: "relative" }}>
        <div className={open ? "rw-wall" : "rw-wall rw-closed"}>
          {shown.map((r, i) => (
            <Bubble key={`${r.handle}-${i}`} r={r} mine={i % 5 === 3} />
          ))}
        </div>
        {!open && all.length > collapsedCount && (
          <div aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 140, background: "linear-gradient(to bottom, rgba(250,255,244,0), #fafff4)", pointerEvents: "none" }} />
        )}
      </div>
      {all.length > collapsedCount && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: open ? 12 : 4 }}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="rw-more"
            style={{ height: 46, padding: "0 22px", borderRadius: 999, border: `1.5px solid ${PRIMARY}`, background: "transparent", color: PRIMARY, fontFamily: FONT_DISPLAY, fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "background 150ms, color 150ms" }}
          >
            {open ? "Show fewer" : `Read ${all.length - collapsedCount} more reviews`}
          </button>
        </div>
      )}
    </div>
  );
}
