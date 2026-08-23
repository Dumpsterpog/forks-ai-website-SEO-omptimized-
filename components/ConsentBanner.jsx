"use client";

import { useEffect, useState } from "react";
import {
  CONSENT_CATEGORIES,
  ALL_GRANTED,
  ALL_DENIED,
  writeConsent,
  grantedCategories,
  needsPrompt,
} from "../lib/consent";

// The marketing site had no consent surface at all, so a visitor who never
// signed in was never asked, while the Google Ads tag and Vercel Analytics
// both ran regardless. This asks, and the answer is enforced in lib/consent.
export default function ConsentBanner() {
  const [phase, setPhase] = useState(null); // null | "ask" | "manage"
  const [prefs, setPrefs] = useState(ALL_DENIED);

  useEffect(() => {
    // Read after mount only: localStorage does not exist during the static
    // render, and reading it there would hydrate the wrong state.
    setPrefs(grantedCategories());
    if (needsPrompt()) setPhase("ask");
  }, []);

  if (!phase) return null;

  const save = (categories, method = "banner") => {
    writeConsent(categories, method);
    setPhase(null);
  };

  const card = "rounded-2xl border border-white/10 bg-[#111214] shadow-2xl";

  return (
    <div className="fixed inset-x-3 bottom-3 z-[100] sm:left-auto sm:right-5 sm:bottom-5 sm:w-[400px]">
      <div className={card}>
        <div className="p-5">
          {phase === "ask" ? (
            <>
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1.5">
                Privacy
              </p>
              <h2 className="text-white text-base font-bold mb-2">
                You choose what we measure
              </h2>
              <p className="text-[13px] leading-relaxed text-zinc-400 mb-4">
                We use cookies to keep the site working, and optionally to measure how it
                is used and whether our ads work. Nothing optional runs until you say so.
                See our{" "}
                <a href="/privacy-policy" className="text-[#b5ff4d] underline underline-offset-4">
                  Privacy Policy
                </a>
                .
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setPhase("manage")}
                  className="flex-1 min-w-[90px] rounded-lg border border-white/12 px-3 py-2 text-[13px] font-semibold text-zinc-300 hover:text-white hover:border-white/25 transition-colors"
                >
                  Manage
                </button>
                <button
                  onClick={() => save(ALL_DENIED)}
                  className="flex-1 min-w-[90px] rounded-lg border border-white/12 px-3 py-2 text-[13px] font-semibold text-zinc-300 hover:text-white hover:border-white/25 transition-colors"
                >
                  Reject all
                </button>
                <button
                  onClick={() => save(ALL_GRANTED)}
                  className="flex-1 min-w-[110px] rounded-lg bg-[#b5ff4d] px-3 py-2 text-[13px] font-bold text-black hover:bg-[#c8ff6e] transition-colors"
                >
                  Accept all
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1.5">
                Your choices
              </p>
              <h2 className="text-white text-base font-bold mb-4">
                Choose what we may use
              </h2>

              <div className="flex flex-col gap-3 mb-5">
                {CONSENT_CATEGORIES.map((cat) => {
                  const on = cat.required || prefs[cat.id] === true;
                  return (
                    <div key={cat.id} className="flex gap-3 items-start">
                      <button
                        role="switch"
                        aria-checked={on}
                        aria-label={cat.label}
                        disabled={cat.required}
                        onClick={() =>
                          !cat.required && setPrefs((p) => ({ ...p, [cat.id]: !p[cat.id] }))
                        }
                        className="shrink-0 mt-0.5 relative h-5 w-9 rounded-full transition-colors"
                        style={{
                          background: on ? "#b5ff4d" : "rgba(255,255,255,0.16)",
                          cursor: cat.required ? "not-allowed" : "pointer",
                          opacity: cat.required ? 0.6 : 1,
                        }}
                      >
                        <span
                          className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all"
                          style={{ left: on ? 18 : 2 }}
                        />
                      </button>
                      <div className="min-w-0">
                        <p className="text-[12px] font-bold text-white">
                          {cat.label}
                          {cat.required ? " · always on" : ""}
                        </p>
                        <p className="text-[11px] leading-relaxed text-zinc-500">{cat.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setPhase("ask")}
                  className="flex-1 rounded-lg border border-white/12 px-3 py-2 text-[13px] font-semibold text-zinc-300 hover:text-white hover:border-white/25 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => save(prefs, "preferences")}
                  className="flex-1 rounded-lg bg-[#b5ff4d] px-3 py-2 text-[13px] font-bold text-black hover:bg-[#c8ff6e] transition-colors"
                >
                  Save choices
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
