"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Miso from "@/components/maintenance/Miso";
import { legalDisplay, legalBody } from "@/lib/legalFonts";

// The one layout the three legal pages share (privacy policy, terms, refund
// policy), in the landing page's look: ink on the pale lilac ground, electric
// lime, 2px ink borders and the hard offset shadow, Lexend headings over
// Hanken Grotesk text.
//
// Each page keeps its own `sections` array exactly as written; this only
// draws it. The section bodies were written for the old dark layout with
// Tailwind colour classes (text-zinc-400, text-white, border-white/8 and the
// lime #b5ff4d), so LEGAL_CSS re-maps those classes inside the body to the
// light palette instead of the legal text being touched.

const INK = "#11002e";
const LIME = "#CCFF00";
const OLIVE = "#506600";
const GROUND = "#fef7ff";
const DISPLAY = "var(--font-legal-display), 'Lexend', sans-serif";
const BODY = "var(--font-legal-body), 'Hanken Grotesk', sans-serif";

const PAGES = [
  { key: "privacy", label: "Privacy", href: "/privacy-policy" },
  { key: "terms", label: "Terms", href: "/terms" },
  { key: "refund", label: "Refunds", href: "/refund-policy" },
];

function NewTag() {
  return (
    <span style={{ display: "inline-block", verticalAlign: "middle", marginLeft: 10, padding: "2px 8px", borderRadius: 999, background: LIME, border: `1.5px solid ${INK}`, color: INK, fontFamily: BODY, fontSize: 12, fontWeight: 700, lineHeight: 1.4 }}>New</span>
  );
}

// Which section is being read, for the contents list.
function useCurrent(ids) {
  const [current, setCurrent] = useState(ids[0]);
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        const shown = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (shown[0]) setCurrent(shown[0].target.id);
      },
      { rootMargin: "-90px 0px -65% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);
  return current;
}

export default function LegalShell({ page, title, intro, version, updated, changes = [], sections }) {
  const [ids] = useState(() => sections.map((s) => s.id));
  const current = useCurrent(ids);
  const [mood, setMood] = useState("idle");

  return (
    <div className={`legal ${legalDisplay.variable} ${legalBody.variable}`} style={{ minHeight: "100vh", background: GROUND, color: INK, fontFamily: BODY }}>
      {/* ── Header ── */}
      <header className="lg-header" style={{ position: "sticky", top: 0, zIndex: 40, background: `${GROUND}f2`, backdropFilter: "blur(10px)", borderBottom: `1.5px solid ${INK}` }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <Link href="/" onMouseEnter={() => setMood("cheer")} onMouseLeave={() => setMood("idle")} style={{ display: "inline-flex", alignItems: "center", gap: 8, color: INK, textDecoration: "none", fontFamily: DISPLAY, fontWeight: 800, fontSize: 19 }}>
            <Miso mood={mood} size={34} title="" style={{ marginTop: -4 }} />
            FORKSAI
          </Link>
          <nav aria-label="Legal pages" className="lg-tabs" style={{ display: "flex", border: `2px solid ${INK}`, borderRadius: 12, overflow: "hidden", background: "#fff" }}>
            {PAGES.map((p, i) => (
              <Link
                key={p.key}
                href={p.href}
                aria-current={p.key === page ? "page" : undefined}
                className="lg-tab"
                style={{ padding: "7px 16px", fontSize: 14, fontWeight: 700, color: INK, textDecoration: "none", background: p.key === page ? LIME : "transparent", borderLeft: i ? `2px solid ${INK}` : "none" }}
              >
                {p.label}
              </Link>
            ))}
          </nav>
          <Link href="/" className="lg-back" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: INK, textDecoration: "none" }}>
            <ArrowLeft size={15} /> Back to FORKSAI
          </Link>
        </div>
      </header>

      {/* ── Title ── */}
      <section style={{ borderBottom: `1.5px solid ${INK}` }}>
        <div className="lg-hero" style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(40px, 6vw, 72px) 24px clamp(40px, 5vw, 60px)" }}>
          <div>
            <h1 style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: "clamp(40px, 6.4vw, 80px)", lineHeight: 0.98, letterSpacing: "-0.035em", margin: "0 0 18px" }}>{title}</h1>
            <p style={{ fontSize: "clamp(16px, 1.5vw, 19px)", lineHeight: 1.55, color: "rgba(17,0,46,0.75)", maxWidth: 560, margin: "0 0 22px" }}>{intro}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {[`Version ${version}`, `Updated ${updated}`].map((t) => (
                <span key={t} style={{ padding: "5px 12px", borderRadius: 999, border: `1.5px solid ${INK}`, background: "#fff", fontSize: 13.5, fontWeight: 700 }}>{t}</span>
              ))}
            </div>
          </div>
          {changes.length > 0 && (
            <aside aria-label={`What changed on ${updated}`} style={{ background: LIME, border: `2px solid ${INK}`, borderRadius: 18, boxShadow: `6px 6px 0 ${INK}`, padding: "22px 24px" }}>
              <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 20, margin: "0 0 12px", lineHeight: 1.2 }}>What changed on {updated}</h2>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 10 }}>
                {changes.map((c) => (
                  <li key={c} style={{ display: "flex", gap: 10, fontSize: 15, lineHeight: 1.5 }}>
                    <span aria-hidden="true" style={{ flexShrink: 0, width: 7, height: 7, marginTop: 8, borderRadius: 2, background: INK }} />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>
      </section>

      {/* ── Body ── */}
      <main className="lg-main" style={{ maxWidth: 1180, margin: "0 auto", padding: "48px 24px 96px" }}>
        {/* Contents: a sticky list on a wide screen, a jump menu on a phone */}
        <nav aria-label="On this page" className="lg-toc">
          <div style={{ background: "#fff", border: `2px solid ${INK}`, borderRadius: 16, padding: "16px 10px 12px" }}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 15, padding: "0 10px 10px" }}>On this page</div>
            <ol style={{ listStyle: "none", margin: 0, padding: 0, maxHeight: "calc(100vh - 170px)", overflowY: "auto" }}>
              {sections.map((s, i) => {
                const on = s.id === current;
                return (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="lg-toc-link" aria-current={on ? "true" : undefined} style={{ display: "flex", gap: 10, padding: "6px 10px", borderRadius: 9, fontSize: 13.5, lineHeight: 1.35, color: INK, fontWeight: on ? 700 : 500, textDecoration: "none", background: on ? LIME : "transparent" }}>
                      <span style={{ flexShrink: 0, width: 20, fontVariantNumeric: "tabular-nums", color: "rgba(17,0,46,0.5)", fontWeight: 700 }}>{i + 1}</span>
                      <span>{s.title}{s.isNew && <span style={{ marginLeft: 6, fontSize: 11.5, fontWeight: 700, color: OLIVE }}>New</span>}</span>
                    </a>
                  </li>
                );
              })}
            </ol>
          </div>
        </nav>

        <label className="lg-jump" style={{ display: "none" }}>
          <span style={{ display: "block", fontSize: 13.5, fontWeight: 700, marginBottom: 6 }}>Jump to a section</span>
          <select
            value=""
            onChange={(e) => { const el = document.getElementById(e.target.value); if (el) el.scrollIntoView({ behavior: "smooth" }); }}
            style={{ width: "100%", minHeight: 46, padding: "0 12px", borderRadius: 12, border: `2px solid ${INK}`, background: "#fff", color: INK, fontFamily: BODY, fontSize: 15, fontWeight: 600 }}
          >
            <option value="" disabled>{sections.length} sections</option>
            {sections.map((s, i) => <option key={s.id} value={s.id}>{i + 1}. {s.title}</option>)}
          </select>
        </label>

        <div className="lg-body">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} style={{ scrollMarginTop: 88, padding: "34px 0", borderTop: i ? "1px solid rgba(17,0,46,0.14)" : "none", paddingTop: i ? 34 : 0 }}>
              <h2 style={{ display: "flex", alignItems: "baseline", gap: 14, margin: "0 0 16px", fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(22px, 2.4vw, 28px)", lineHeight: 1.15, letterSpacing: "-0.015em" }}>
                <span aria-hidden="true" style={{ flexShrink: 0, display: "inline-grid", placeItems: "center", minWidth: 34, height: 34, padding: "0 6px", borderRadius: 10, background: LIME, border: `2px solid ${INK}`, fontSize: 15, fontWeight: 800, fontVariantNumeric: "tabular-nums", transform: "translateY(-3px)" }}>{i + 1}</span>
                <span>{s.title}{s.isNew && <NewTag />}</span>
              </h2>
              <div className="lg-content">{s.content}</div>
            </section>
          ))}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer style={{ background: INK, color: "#fff" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "36px 24px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 18 }}>
          <div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 20, color: LIME }}>FORKSAI</div>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
              Questions about this page? <a href="mailto:team.forksai@gmail.com" style={{ color: "#fff", textUnderlineOffset: 3 }}>team.forksai@gmail.com</a>
            </p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20, fontSize: 14 }}>
            {PAGES.map((p) => (
              <Link key={p.key} href={p.href} style={{ color: p.key === page ? LIME : "rgba(255,255,255,0.7)", textDecoration: "none", fontWeight: p.key === page ? 700 : 500 }}>
                {p.key === "privacy" ? "Privacy Policy" : p.key === "terms" ? "Terms & Conditions" : "Refund Policy"}
              </Link>
            ))}
            <span style={{ color: "rgba(255,255,255,0.45)" }}>{new Date().getFullYear()} FORKSAI</span>
          </div>
        </div>
      </footer>

      <style>{LEGAL_CSS}</style>
    </div>
  );
}

// Layout, plus the re-mapping of the old dark-theme classes in the bodies.
const LEGAL_CSS = `
  html { scroll-behavior: smooth; }
  @media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
  .legal .lg-tab:hover:not([aria-current]) { background: rgba(204,255,0,0.35) !important; }
  .legal .lg-back:hover { text-decoration: underline !important; text-underline-offset: 4px; }
  .legal .lg-toc-link:hover:not([aria-current]) { background: rgba(17,0,46,0.06) !important; }
  .legal .lg-hero { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr); gap: clamp(28px, 4vw, 56px); align-items: center; }
  .legal .lg-main { display: grid; grid-template-columns: 270px minmax(0, 1fr); gap: 48px; align-items: start; }
  .legal .lg-body { max-width: 760px; }
  .legal .lg-toc { position: sticky; top: 88px; align-self: start; }

  .legal .lg-content { font-size: 16px; line-height: 1.7; color: rgba(17,0,46,0.82); }
  .legal .lg-content p { margin: 0 0 12px; }
  .legal .lg-content .text-sm { font-size: 16px; line-height: 1.7; }
  .legal .lg-content .text-xs { font-size: 14px; line-height: 1.6; }
  .legal .lg-content .text-zinc-300, .legal .lg-content .text-zinc-400 { color: rgba(17,0,46,0.82); }
  .legal .lg-content .text-zinc-500, .legal .lg-content .text-zinc-600, .legal .lg-content .text-zinc-700 { color: rgba(17,0,46,0.6); }
  .legal .lg-content .text-white, .legal .lg-content strong { color: ${INK}; }
  .legal .lg-content .font-medium { font-weight: 700; }
  .legal .lg-content .text-\\[\\#b5ff4d\\] { color: ${OLIVE}; font-weight: 700; }
  .legal .lg-content a { color: ${INK}; text-decoration: underline; text-decoration-color: ${OLIVE}; text-decoration-thickness: 2px; text-underline-offset: 3px; }
  .legal .lg-content a:hover { background: ${LIME}; }
  .legal .lg-content .uppercase { text-transform: none; }
  .legal .lg-content .tracking-widest, .legal .lg-content [class*="tracking-["] { letter-spacing: 0; }
  .legal .lg-content [class*="border-white"] { border-color: rgba(17,0,46,0.14); }
  .legal .lg-content [class*="border-\\[\\#b5ff4d\\]"] { border-color: ${INK}; border-width: 1.5px; }
  .legal .lg-content [class*="bg-white/2"] { background: #fff; border: 1.5px solid ${INK}; border-radius: 14px; }
  .legal .lg-content .italic { font-style: normal; }

  @media (max-width: 1000px) {
    .legal .lg-hero { grid-template-columns: minmax(0, 1fr); }
    .legal .lg-main { grid-template-columns: minmax(0, 1fr); gap: 28px; }
    .legal .lg-toc { display: none; }
    .legal .lg-jump { display: block !important; }
  }
  @media (max-width: 720px) {
    .legal .lg-back { display: none !important; }
    .legal .lg-tabs a { padding: 6px 11px !important; font-size: 13px !important; }
    .legal .lg-content li:has(> .w-48), .legal .lg-content li:has(> .w-40), .legal .lg-content li:has(> .w-36), .legal .lg-content li:has(> .w-28) { flex-direction: column; gap: 4px; }
    .legal .lg-content li > .w-48, .legal .lg-content li > .w-40, .legal .lg-content li > .w-36, .legal .lg-content li > .w-28 { width: auto; }
  }
  @media (max-width: 420px) {
    .legal .lg-header a[href="/"] { font-size: 0 !important; gap: 0 !important; }
  }
`;
