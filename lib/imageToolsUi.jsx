"use client";

// Shared client UI for the four image tools. Same visual language as the
// calculators: flat colour, 2px black borders, hard offset shadows.

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ImageUp, ShieldCheck } from "lucide-react";
import { inputClass, labelClass, hintClass } from "@/components/ToolPageShell";
import {
  IMAGE_ACCEPT,
  IMAGE_TOOLS,
  MAX_CROP_ZOOM,
  clamp,
  cropRect,
} from "@/lib/imageTools";

export function Field({ id, label, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {children}
      {hint ? <p className={hintClass}>{hint}</p> : null}
    </div>
  );
}

export function NumberField({ id, label, hint, value, onChange, min, max, step, suffix }) {
  return (
    <Field id={id} label={label} hint={hint}>
      <div className="relative">
        <input
          id={id}
          name={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={step ?? 1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} ${suffix ? "pr-14" : ""}`}
        />
        {suffix ? (
          <span
            aria-hidden="true"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#666]"
          >
            {suffix}
          </span>
        ) : null}
      </div>
    </Field>
  );
}

export function SelectField({ id, label, hint, value, onChange, children }) {
  return (
    <Field id={id} label={label} hint={hint}>
      <select
        id={id}
        name={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      >
        {children}
      </select>
    </Field>
  );
}

export function RangeField({ id, label, hint, value, onChange, min, max, step, readout, disabled }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className={labelClass}>
          {label}
        </label>
        <span className="text-sm font-bold text-[#111] tabular-nums">{readout}</span>
      </div>
      <input
        id={id}
        name={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-9 accent-[#111] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
      />
      {hint ? <p className={hintClass}>{hint}</p> : null}
    </div>
  );
}

export function CheckboxField({ id, label, hint, checked, onChange }) {
  return (
    <div>
      <div className="flex items-start gap-3">
        <input
          id={id}
          name={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-6 w-6 shrink-0 accent-[#111] cursor-pointer rounded focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
        />
        <label htmlFor={id} className="text-sm font-bold text-[#111] leading-snug cursor-pointer">
          {label}
        </label>
      </div>
      {hint ? <p className={`${hintClass} pl-8`}>{hint}</p> : null}
    </div>
  );
}

// File picker. A real labelled input, so it is reachable by keyboard and
// announced properly, with a drop target around it for desktop.
export function ImagePicker({ id, label, hint, onPick, fileName, error }) {
  const [over, setOver] = useState(false);

  const handle = (file) => {
    if (file) onPick(file);
  };

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          handle(e.dataTransfer.files && e.dataTransfer.files[0]);
        }}
        className="border-2 border-dashed border-black rounded-xl px-4 py-5 text-center transition-colors"
        style={{ background: over ? "#F0D44A" : "#ffffff" }}
      >
        <ImageUp
          size={22}
          strokeWidth={2.25}
          className="mx-auto mb-2 text-[#111]"
          aria-hidden="true"
        />
        <input
          id={id}
          name={id}
          type="file"
          accept={IMAGE_ACCEPT}
          onChange={(e) => handle(e.target.files && e.target.files[0])}
          className="block w-full text-sm text-[#444] cursor-pointer rounded-lg file:mr-3 file:cursor-pointer file:rounded-lg file:border-2 file:border-black file:bg-white file:px-3 file:py-2 file:text-sm file:font-bold file:text-[#111] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
        />
        <p className="text-xs text-[#666] mt-2 leading-relaxed">
          {fileName ? `Loaded: ${fileName}` : "JPG, PNG or WebP. Drag one in or browse."}
        </p>
      </div>
      {hint ? <p className={hintClass}>{hint}</p> : null}
      {error ? (
        <p
          role="alert"
          className="mt-2 border-2 border-black rounded-xl bg-white px-3 py-2 text-sm font-bold text-[#111]"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Crop stage: the whole picture with a movable frame over it.
 *
 * Drag the frame with a finger or a mouse, pinch to zoom, or use the three
 * sliders underneath, which exist so the tool is fully operable from a
 * keyboard and not only by dragging.
 */
export function CropStage({ image, aspect, view, onView, hint }) {
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const pointers = useRef(new Map());
  const dragStart = useRef(null);
  const pinchStart = useRef(null);
  const baseId = useId();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const cap = 960;
    const scale = Math.min(1, cap / Math.max(image.width, image.height));
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image.source, 0, 0, canvas.width, canvas.height);
  }, [image]);

  const rect = cropRect(image.width, image.height, aspect, view);
  const pct = (n) => `${clamp(n, 0, 100)}%`;

  const setView = useCallback((next) => onView({ ...view, ...next }), [onView, view]);

  const onPointerDown = (e) => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        view: { ...view },
        box: stage.getBoundingClientRect(),
      };
    } else if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinchStart.current = { distance: Math.hypot(a.x - b.x, a.y - b.y), zoom: view.zoom };
    }
  };

  const onPointerMove = (e) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size >= 2 && pinchStart.current) {
      const [a, b] = [...pointers.current.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchStart.current.distance > 0) {
        setView({
          zoom: clamp(
            pinchStart.current.zoom * (distance / pinchStart.current.distance),
            1,
            MAX_CROP_ZOOM
          ),
        });
      }
      return;
    }

    const start = dragStart.current;
    if (!start || start.box.width === 0 || start.box.height === 0) return;
    const movedX = ((e.clientX - start.x) / start.box.width) * image.width;
    const movedY = ((e.clientY - start.y) / start.box.height) * image.height;
    const base = cropRect(image.width, image.height, aspect, start.view);
    setView({
      x: base.roomX > 0 ? clamp(start.view.x + movedX / base.roomX, 0, 1) : 0.5,
      y: base.roomY > 0 ? clamp(start.view.y + movedY / base.roomY, 0, 1) : 0.5,
    });
  };

  const onPointerUp = (e) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchStart.current = null;
    if (pointers.current.size === 0) dragStart.current = null;
  };

  const onKeyDown = (e) => {
    const step = e.shiftKey ? 0.1 : 0.02;
    if (e.key === "ArrowLeft") setView({ x: clamp(view.x - step, 0, 1) });
    else if (e.key === "ArrowRight") setView({ x: clamp(view.x + step, 0, 1) });
    else if (e.key === "ArrowUp") setView({ y: clamp(view.y - step, 0, 1) });
    else if (e.key === "ArrowDown") setView({ y: clamp(view.y + step, 0, 1) });
    else if (e.key === "+" || e.key === "=") setView({ zoom: clamp(view.zoom + 0.2, 1, MAX_CROP_ZOOM) });
    else if (e.key === "-" || e.key === "_") setView({ zoom: clamp(view.zoom - 0.2, 1, MAX_CROP_ZOOM) });
    else return;
    e.preventDefault();
  };

  return (
    <div>
      <div
        ref={stageRef}
        tabIndex={0}
        role="group"
        aria-label="Crop area. Drag to move the frame. Arrow keys move it, plus and minus zoom."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        className="relative mx-auto select-none overflow-hidden border-2 border-black rounded-xl bg-[#EEEEE8] cursor-grab active:cursor-grabbing focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F0D44A]"
        style={{
          touchAction: "none",
          width: "100%",
          maxWidth: `min(100%, ${Math.round((380 * image.width) / image.height)}px)`,
          aspectRatio: `${image.width} / ${image.height}`,
        }}
      >
        <canvas ref={canvasRef} className="block w-full h-full" aria-hidden="true" />
        <div
          aria-hidden="true"
          className="absolute pointer-events-none border-2 border-white rounded-[3px]"
          style={{
            left: pct((rect.x / image.width) * 100),
            top: pct((rect.y / image.height) * 100),
            width: pct((rect.width / image.width) * 100),
            height: pct((rect.height / image.height) * 100),
            boxShadow: "0 0 0 2px #111, 0 0 0 9999px rgba(17,17,17,0.55)",
          }}
        />
      </div>

      <p className={`${hintClass} text-center`}>
        {hint || "Drag the frame, pinch to zoom, or use the sliders."}
      </p>

      <div className="mt-4 grid sm:grid-cols-3 gap-4">
        <RangeField
          id={`${baseId}-zoom`}
          label="Zoom"
          min={1}
          max={MAX_CROP_ZOOM}
          step={0.01}
          value={view.zoom}
          readout={`${view.zoom.toFixed(2)}x`}
          onChange={(zoom) => setView({ zoom })}
        />
        <RangeField
          id={`${baseId}-x`}
          label="Move across"
          min={0}
          max={100}
          step={1}
          value={Math.round(view.x * 100)}
          readout={rect.roomX > 0 ? `${Math.round(view.x * 100)}%` : "locked"}
          disabled={rect.roomX <= 0}
          onChange={(v) => setView({ x: v / 100 })}
        />
        <RangeField
          id={`${baseId}-y`}
          label="Move up and down"
          min={0}
          max={100}
          step={1}
          value={Math.round(view.y * 100)}
          readout={rect.roomY > 0 ? `${Math.round(view.y * 100)}%` : "locked"}
          disabled={rect.roomY <= 0}
          onChange={(v) => setView({ y: v / 100 })}
        />
      </div>
    </div>
  );
}

// The preview is the exact canvas that gets encoded, so what is on screen is
// the file rather than an approximation of it.
export function OutputPreview({ canvasRef, width, height, checkered }) {
  return (
    <div
      className="border-2 border-black rounded-xl p-3 flex items-center justify-center overflow-auto"
      style={
        checkered
          ? {
              background:
                "repeating-conic-gradient(#e4e4dc 0% 25%, #ffffff 0% 50%) 50% / 16px 16px",
            }
          : { background: "#EEEEE8" }
      }
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`Preview of the output image at ${width} by ${height} pixels`}
        className="block"
        style={{ width: `min(100%, ${width}px)`, height: "auto", maxHeight: 360 }}
      />
    </div>
  );
}

export function StatRow({ label, value, tone }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-black/10 py-2 last:border-b-0">
      <span className="text-xs font-black uppercase tracking-widest text-[#666]">{label}</span>
      <span
        className="text-sm font-bold tabular-nums text-right"
        style={{ color: tone === "bad" ? "#8a1c1c" : "#111" }}
      >
        {value}
      </span>
    </div>
  );
}

export function PrivacyCallout() {
  return (
    <div className="border-2 border-black rounded-xl bg-white px-4 py-3 flex items-start gap-3">
      <ShieldCheck
        size={18}
        strokeWidth={2.25}
        className="mt-0.5 shrink-0 text-[#111]"
        aria-hidden="true"
      />
      <p className="text-sm text-[#333] leading-relaxed">
        <strong className="text-[#111]">Your picture never leaves this device.</strong> The
        cropping and the encoding both run in your browser with the Canvas API. Nothing is
        uploaded, nothing is stored, and there is no account.
      </p>
    </div>
  );
}

export function ImageToolCrossLinks({ current }) {
  const others = IMAGE_TOOLS.filter((tool) => tool.href !== current);
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10 print:hidden">
      <h2 className="font-serif font-black text-xl text-[#111] mb-4">More free image tools</h2>
      <div className="grid sm:grid-cols-3 gap-3">
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
        Every one of them runs on your device. See the rest on the{" "}
        <Link href="/tools" className="font-bold text-[#111] underline underline-offset-2">
          free student tools hub
        </Link>
        .
      </p>
    </section>
  );
}
