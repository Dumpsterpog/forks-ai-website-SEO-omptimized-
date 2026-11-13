"use client";

// forksai.app/android: how to get the Android beta, the page every QR code
// and "Get the Android beta" button opens. Two steps, because Google Play's
// closed testing works that way: join the testers' Google Group, then become
// a tester on Google Play and install. On a phone the two buttons are the
// page; on a computer a QR code brings the same page to the visitor's phone.
// The step to do next is the lime one, and a step done is ticked (kept in
// localStorage so a visitor coming back sees where they got to).
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BookOpen, Check, Users, WifiOff, Layers } from "lucide-react";
import Miso from "@/components/maintenance/Miso";
import AndroidQr, { ANDROID_BETA, PlayMark } from "@/components/AndroidQr";
import { goToDashboard } from "@/lib/goToDashboard";

const PRIMARY = "#11002e";
const LIME = "#CCFF00";
const BG = "#fef7ff";
const MUTED = "rgba(17,0,46,0.62)";
const FONT_DISPLAY = "'Lexend', sans-serif";
const FONT_BODY = "'Hanken Grotesk', sans-serif";
const FONT_MONO = "'JetBrains Mono', monospace";
const KEY = "forksai_android_beta_step";

const STEPS = [
  { n: 1, title: "Join the testers group", body: "Open it with the Google account your phone uses for the Play Store, and tap Join group.", cta: "Join the group", href: ANDROID_BETA.group, icon: Users },
  { n: 2, title: "Become a tester, then install", body: "On Google Play's page tap Become a tester, then Download it on Google Play. It can take a few minutes after joining the group.", cta: "Open Google Play", href: ANDROID_BETA.play, play: true },
];

const WHAT = [
  { icon: WifiOff, title: "Works offline", body: "Your decks and notes are saved on the phone. Reviews made offline sync when you're back." },
  { icon: Layers, title: "Same account", body: "Sign in with Google and your decks, streak and plan are already there." },
  { icon: BookOpen, title: "Miso comes too", body: "AI flashcards, the AI tutor and every study mode, built for a phone." },
];

function useDevice() {
  const [device, setDevice] = useState("desktop");
  useEffect(() => {
    const ua = navigator.userAgent || "";
    if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) setDevice("ios");
    else if (/Android/i.test(ua)) setDevice("android");
    else if (window.matchMedia("(max-width: 767px)").matches) setDevice("phone");
  }, []);
  return device;
}

export default function AndroidBetaContent() {
  const device = useDevice();
  const reduce = useReducedMotion();
  const [done, setDone] = useState(0);
  useEffect(() => {
    try { setDone(Number(localStorage.getItem(KEY)) || 0); } catch { /* private mode */ }
  }, []);
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Lexend:wght@400;600;700;800;900&family=Hanken+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@600;700&display=swap";
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch { /* gone */ } };
  }, []);

  const press = (n) => {
    const next = Math.max(done, n);
    setDone(next);
    try { localStorage.setItem(KEY, String(next)); } catch { /* private mode */ }
  };
  const desktop = device === "desktop";

  return (
    <div style={{ background: BG, color: PRIMARY, fontFamily: FONT_BODY, minHeight: "100vh" }}>
      <nav style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 800, color: PRIMARY, textDecoration: "none", letterSpacing: -0.5 }}>
          <Miso mood="idle" size={36} title="" style={{ marginTop: -6 }} />
          FORKSAI
        </Link>
        <button type="button" onClick={() => goToDashboard()} style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 13, background: LIME, color: PRIMARY, border: "none", padding: "8px 18px", borderRadius: 12, cursor: "pointer", boxShadow: `4px 4px 0 0 ${PRIMARY}` }}>
          Open on the web
        </button>
      </nav>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(24px,5vw,56px) 24px 80px" }}>
        <div className="and-grid">
          {/* left: the pitch and the steps */}
          <div>
            <motion.div initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "6px 12px", borderRadius: 99, border: `2px solid ${PRIMARY}`, background: "#fff" }}>
                <span aria-hidden="true" style={{ width: 9, height: 9, borderRadius: 99, background: LIME, border: `1.5px solid ${PRIMARY}` }} />
                Android beta {ANDROID_BETA.version} · iOS soon
              </div>
              <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: "clamp(38px,6.5vw,76px)", lineHeight: 1.02, letterSpacing: -2, margin: "18px 0 0" }}>
                FORKSAI is on Android.
              </h1>
              <p style={{ fontSize: "clamp(16px,1.8vw,19px)", lineHeight: 1.55, color: MUTED, margin: "14px 0 0", maxWidth: 560 }}>
                The app is in beta on Google Play. It is free to join, takes two taps, and you can leave the beta whenever you like.
              </p>
            </motion.div>

            {device === "ios" && (
              <div style={{ marginTop: 22, padding: "14px 16px", borderRadius: 16, border: `2px solid ${PRIMARY}`, background: "#fff", fontSize: 15, lineHeight: 1.5 }}>
                <strong style={{ fontFamily: FONT_DISPLAY }}>On an iPhone?</strong> The iOS app is coming soon. Until then FORKSAI works in Safari, with the same account.
              </div>
            )}

            <ol style={{ listStyle: "none", padding: 0, margin: "28px 0 0", display: "grid", gap: 14 }}>
              {STEPS.map((s, i) => {
                const isDone = done >= s.n;
                const isNext = !isDone && done === s.n - 1;
                const Icon = s.icon;
                return (
                  <motion.li key={s.n} initial={reduce ? false : { opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring", stiffness: 240, damping: 24, delay: 0.15 + i * 0.1 }}
                    style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: 18, borderRadius: 20, border: `2px solid ${PRIMARY}`, background: isNext ? "#fff" : "rgba(255,255,255,0.55)", boxShadow: isNext ? `6px 6px 0 0 ${PRIMARY}` : "none" }}>
                    <span style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 99, display: "grid", placeItems: "center", fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: 18, border: `2px solid ${PRIMARY}`, background: isDone || isNext ? LIME : "#fff" }}>
                      {isDone ? <Check size={20} strokeWidth={3} /> : s.n}
                    </span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 20, letterSpacing: -0.3 }}>{s.title}</div>
                      <p style={{ margin: "4px 0 0", fontSize: 15, lineHeight: 1.5, color: MUTED }}>{s.body}</p>
                      <a href={s.href} target="_blank" rel="noopener" onClick={() => press(s.n)}
                        style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 8, fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 15, padding: "11px 18px", borderRadius: 12, border: `2px solid ${PRIMARY}`, background: isNext ? LIME : "#fff", color: PRIMARY, textDecoration: "none", boxShadow: isNext ? `3px 3px 0 0 ${PRIMARY}` : "none" }}>
                        {s.play ? <PlayMark size={16} /> : <Icon size={17} />}
                        {isDone ? "Open again" : s.cta}
                        <ArrowRight size={16} />
                      </a>
                    </div>
                  </motion.li>
                );
              })}
            </ol>

            <p style={{ margin: "16px 2px 0", fontSize: 13.5, lineHeight: 1.5, color: MUTED }}>
              Google Play says the app is not available? Make sure the Play Store on your phone uses the same Google account that joined the group, then try again in a few minutes.
            </p>
          </div>

          {/* right: the QR code on a computer, what is in the app on a phone */}
          <div>
            {desktop && (
              <motion.div initial={reduce ? false : { opacity: 0, y: 16, rotate: 2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.25 }}
                style={{ padding: 22, borderRadius: 24, border: `2px solid ${PRIMARY}`, background: "#fff", boxShadow: `8px 8px 0 0 ${PRIMARY}`, textAlign: "center" }}>
                <div style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>On a computer?</div>
                <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 22, margin: "6px 0 14px", letterSpacing: -0.3 }}>Scan with your Android phone</div>
                <div style={{ display: "inline-block", padding: 10, borderRadius: 16, border: `2px solid ${PRIMARY}` }}>
                  <AndroidQr size={200} ink={PRIMARY} />
                </div>
                <p style={{ margin: "14px auto 0", maxWidth: 280, fontSize: 14, lineHeight: 1.5, color: MUTED }}>
                  It opens this page on your phone, so the app installs right where you will use it.
                </p>
              </motion.div>
            )}
            <div style={{ display: "grid", gap: 12, marginTop: desktop ? 22 : 8 }}>
              {WHAT.map((w) => {
                const Icon = w.icon;
                return (
                  <div key={w.title} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "14px 16px", borderRadius: 16, border: `2px solid ${PRIMARY}`, background: "rgba(255,255,255,0.7)" }}>
                    <span style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 10, display: "grid", placeItems: "center", background: LIME, border: `2px solid ${PRIMARY}` }}><Icon size={17} /></span>
                    <span>
                      <span style={{ display: "block", fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 16 }}>{w.title}</span>
                      <span style={{ display: "block", fontSize: 14, lineHeight: 1.45, color: MUTED, marginTop: 2 }}>{w.body}</span>
                    </span>
                  </div>
                );
              })}
            </div>
            <p style={{ margin: "16px 2px 0", fontSize: 13.5, lineHeight: 1.5, color: MUTED }}>
              Found a bug? Report it in the app under Settings, or email{" "}
              <a href="mailto:team.forksai@gmail.com" style={{ color: PRIMARY, fontWeight: 700 }}>team.forksai@gmail.com</a>.
            </p>
          </div>
        </div>
      </main>

      <style>{`
        .and-grid { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr); gap: 48px; align-items: start; }
        @media (max-width: 860px) { .and-grid { grid-template-columns: minmax(0, 1fr); gap: 28px; } }
      `}</style>
    </div>
  );
}
