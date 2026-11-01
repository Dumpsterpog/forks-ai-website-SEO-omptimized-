"use client";

// The hero's background, drawn in code instead of the 2.8 MB herobg2.gif it
// replaces. The page is cut into square cells and each cell is painted one
// flat colour, sampled from a soft field that moves: green, with the GIF's two
// periwinkle bands rolling across the middle and a lime glow behind the
// headline. Sampling once per cell is what gives it the pixel look. Cells the
// pointer passes light up and fade back, so the page answers the visitor.
//
// It only draws while the hero is on screen and the tab is visible, at about
// 30 frames a second. With reduced motion on it draws one still frame and does
// not follow the pointer.

import { useEffect, useRef } from "react";

const GREEN = [140, 226, 124];
const MINT = [132, 232, 166];
const BLUE = [147, 165, 240];
const LIME = [214, 255, 92];
const LINE = "rgba(17, 0, 46, 0.07)";
const FRAME_MS = 1000 / 30;

const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const band = (d, at, width) => Math.exp(-(((d - at) / width) ** 2));
// A fixed small shade per cell, so neighbours never come out identical.
const grain = (i, j) => {
  const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
  return (s - Math.floor(s) - 0.5) * 0.06;
};

export default function HeroCanvas({ className, style }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let cell = 48;
    let cols = 0;
    let rows = 0;
    let glow = new Float32Array(0); // pointer trail, one value per cell
    let raf = 0;
    let last = 0;
    let visible = true;
    let pointer = null;
    const t0 = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cell = w < 640 ? 34 : 48;
      cols = Math.ceil(w / cell) + 1;
      rows = Math.ceil(h / cell) + 1;
      glow = new Float32Array(cols * rows);
    };

    const draw = (now) => {
      const t = still ? 6 : (now - t0) / 1000;
      // Centre the grid so the columns sit evenly on both sides of the headline.
      const ox = ((w / 2) % cell) - cell;

      if (pointer && !still) {
        const pc = Math.floor((pointer.x - ox) / cell);
        const pr = Math.floor(pointer.y / cell);
        for (let dj = -1; dj <= 1; dj++) {
          for (let di = -1; di <= 1; di++) {
            const i = pc + di;
            const j = pr + dj;
            if (i < 0 || j < 0 || i >= cols || j >= rows) continue;
            const k = j * cols + i;
            glow[k] = Math.max(glow[k], di === 0 && dj === 0 ? 1 : 0.45);
          }
        }
      }

      for (let j = 0; j < rows; j++) {
        const y = j * cell;
        const v = (y + cell / 2) / h;
        for (let i = 0; i < cols; i++) {
          const x = ox + i * cell;
          const u = (x + cell / 2) / w;
          // The GIF's bands: two periwinkle rows that ripple and drift.
          const wave = Math.sin(u * 6.2 + t * 0.55) * 0.06 + Math.sin(u * 14.3 - t * 0.9) * 0.022;
          const d = v + wave;
          const blue = Math.min(1, band(d, 0.4, 0.055) + band(d, 0.56, 0.05));
          const edge = Math.min(1, Math.abs(v - 0.48) * 2.2);
          let c = mix(GREEN, MINT, edge * 0.8);
          c = mix(c, BLUE, blue * 0.66);
          // Lime light behind the headline, breathing slowly.
          const g = Math.exp(-(((u - 0.5) / 0.3) ** 2) - (((v - 0.36) / 0.26) ** 2)) * (0.42 + Math.sin(t * 0.8) * 0.06);
          c = mix(c, LIME, g);
          const k = j * cols + i;
          const lit = glow[k];
          if (lit > 0.01) {
            c = mix(c, [255, 255, 240], lit * 0.38);
            glow[k] = lit * 0.93;
          } else glow[k] = 0;
          const s = 1 + grain(i, j);
          ctx.fillStyle = `rgb(${c[0] * s | 0},${c[1] * s | 0},${c[2] * s | 0})`;
          ctx.fillRect(x, y, cell, cell);
        }
      }

      ctx.beginPath();
      for (let i = 0; i <= cols; i++) {
        const x = Math.round(ox + i * cell) + 0.5;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let j = 0; j <= rows; j++) {
        const y = Math.round(j * cell) + 0.5;
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.strokeStyle = LINE;
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (now - last < FRAME_MS) return;
      last = now;
      draw(now);
    };
    const start = () => {
      if (still || raf || !visible || document.hidden) return;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };

    resize();
    draw(performance.now());
    start();

    const ro = new ResizeObserver(() => { resize(); draw(performance.now()); });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); else stop(); });
    io.observe(canvas);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);
    // The canvas sits under the hero's text, so the pointer is read off the window.
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      pointer = x >= 0 && y >= 0 && x <= r.width && y <= r.height ? { x, y } : null;
    };
    const onLeave = () => { pointer = null; };
    if (!still) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerleave", onLeave);
    }

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className={className} style={{ display: "block", width: "100%", height: "100%", ...style }} />;
}
