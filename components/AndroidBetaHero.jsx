"use client";

// The hero's Android card: "Now available in beta on Android, coming soon on
// iOS". On a computer it carries a QR code that opens forksai.app/android on
// the visitor's phone, with a lime line sweeping over it now and then so the
// eye finds it. On a phone the QR is no use, so it becomes a button to the same
// page, and an iPhone is told iOS is on its way rather than offered Android.
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import AndroidQr, { ANDROID_BETA, PlayMark } from "@/components/AndroidQr";

const PRIMARY = "#11002e";
const LIME = "#CCFF00";
const MUTED = "rgba(17,0,46,0.62)";
const FONT_DISPLAY = "'Lexend', sans-serif";
const FONT_BODY = "'Hanken Grotesk', sans-serif";
const FONT_MONO = "'JetBrains Mono', monospace";

// "desktop" until the first effect runs, so the server render and the first
// client render agree.
function useDevice() {
  const [device, setDevice] = useState("desktop");
  useEffect(() => {
    const ua = navigator.userAgent || "";
    const ios = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
    if (ios) setDevice("ios");
    else if (/Android/i.test(ua)) setDevice("android");
    else if (window.matchMedia("(max-width: 767px)").matches) setDevice("phone");
  }, []);
  return device;
}

export default function AndroidBetaHero() {
  const device = useDevice();
  const reduce = useReducedMotion();
  const desktop = device === "desktop";

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 18, rotate: -1.5 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 22, delay: 0.35 }}
      className="ab-hero"
      style={{ display: "flex", alignItems: "center", gap: 18, textAlign: "left", background: "#fff", border: `2px solid ${PRIMARY}`, borderRadius: 20, boxShadow: `6px 6px 0 0 ${PRIMARY}`, padding: desktop ? 14 : "16px 18px", margin: "0 0 40px", maxWidth: 480, width: "100%", boxSizing: "border-box" }}
    >
      {desktop && (
        <div style={{ position: "relative", flexShrink: 0, padding: 6, borderRadius: 12, border: `2px solid ${PRIMARY}`, background: "#fff", overflow: "hidden" }}>
          <AndroidQr size={104} ink={PRIMARY} />
          {!reduce && (
            <motion.span
              aria-hidden="true"
              initial={{ top: -10 }}
              animate={{ top: ["-6%", "104%"] }}
              transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 2.6, delay: 1 }}
              style={{ position: "absolute", left: 4, right: 4, height: 3, borderRadius: 3, background: LIME, boxShadow: `0 0 0 1px ${PRIMARY}` }}
            />
          )}
        </div>
      )}

      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: PRIMARY }}>
          <span aria-hidden="true" style={{ position: "relative", width: 9, height: 9 }}>
            <span style={{ position: "absolute", inset: 0, borderRadius: 99, background: LIME, border: `1.5px solid ${PRIMARY}` }} />
            {!reduce && (
              <motion.span
                animate={{ scale: [1, 2.3], opacity: [0.7, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                style={{ position: "absolute", inset: 0, borderRadius: 99, background: LIME }}
              />
            )}
          </span>
          New · Beta {ANDROID_BETA.version}
        </div>

        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 19, lineHeight: 1.2, color: PRIMARY, marginTop: 7, letterSpacing: -0.3 }}>
          {device === "ios" ? "Now in beta on Android" : "Now available in beta on Android"}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px 12px", marginTop: 5, fontFamily: FONT_BODY, fontSize: 13.5, color: MUTED }}>
          {desktop && <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><PlayMark size={13} /> Scan to get it on Google Play</span>}
          <span style={{ fontWeight: 700, color: PRIMARY }}>{device === "ios" ? "Coming soon on iPhone and iPad" : "Coming soon on iOS"}</span>
        </div>

        {(device === "android" || device === "phone") && (
          <Link
            href="/android"
            style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 8, fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 15, background: LIME, color: PRIMARY, border: `2px solid ${PRIMARY}`, borderRadius: 12, padding: "10px 16px", boxShadow: `3px 3px 0 0 ${PRIMARY}`, textDecoration: "none" }}
          >
            <PlayMark size={15} /> Get the Android beta <ArrowRight size={16} />
          </Link>
        )}
        {desktop && (
          <Link href="/android" style={{ display: "inline-block", marginTop: 8, fontFamily: FONT_MONO, fontSize: 11.5, fontWeight: 700, color: PRIMARY, textDecoration: "underline", textUnderlineOffset: 3 }}>
            forksai.app/android
          </Link>
        )}
      </div>
    </motion.div>
  );
}
