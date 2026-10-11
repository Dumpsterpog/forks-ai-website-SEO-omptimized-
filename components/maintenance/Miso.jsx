"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotionConfig } from "framer-motion";
const bodyImg = "/miso/bodyBlank.webp";
const pawImg = "/miso/paw.webp";
const eyeLImg = "/miso/eyeL.webp";
const eyeRImg = "/miso/eyeR.webp";
const mouthImg = "/miso/mouth.webp";
const tailImg = "/miso/tail.webp";
const shadowImg = "/miso/shadow.webp";
const linesImg = "/miso/lines.webp";
const heartLImg = "/miso/heartL.webp";
const heartRImg = "/miso/heartR.webp";
const sparkAImg = "/miso/sparkA.webp";
const sparkBImg = "/miso/sparkB.webp";
const sparkCImg = "/miso/sparkC.webp";

// Miso, animated from the original artwork. Copied from the dashboard app
// (src/gamify/Miso.jsx); the layers live in public/miso.
//
// The original picture is cut into its own pieces and stacked back exactly
// where they were: at rest the stack is the original image, pixel for pixel.
//   shadow, tail, body, front paw, left eye, right eye, mouth, motion lines,
//   two hearts and three sparkles.
// Each piece moves on its own. The tail wags from its base behind the body,
// the front paw taps and waves from the leg, the body breathes and bounces
// from where he sits, the hearts drift and the sparkles twinkle.
//
// Faces. His own happy face (closed eyes, open mouth) is the original art and
// is used whenever he is happy. For other feelings, only the eyes and mouth
// change: they are drawn in his ink, at his line weight, in the places his
// own eyes and mouth sit, on the same tilt as his head. Nose, cheeks, brow
// dots and everything else stay the original.
//
// Moods: idle, happy, cheer, celebrate, wave, think, sad, sleep, surprised,
// worried.

const MotionDiv = motion.div;
const MotionImg = motion.img;
const MotionG = motion.g;
const MotionPath = motion.path;
const MotionCircle = motion.circle;
const MotionEllipse = motion.ellipse;

const ART_W = 584;
const ART_H = 604;
const BOX = {
  shadow: [140, 496, 492, 542],
  tail: [436, 372, 517, 516],
  body: [145, 75, 491, 541],
  paw: [246, 430, 349, 526],
  eyeL: [186, 252, 223, 276],
  eyeR: [275, 266, 320, 291],
  mouth: [218, 297, 272, 341],
  heartL: [59, 177, 122, 236],
  heartR: [490, 179, 540, 229],
  sparkA: [114, 83, 159, 134],
  sparkB: [461, 271, 506, 323],
  sparkC: [70, 286, 115, 336],
  lines: [510, 338, 553, 399],
};
const SRC = { shadow: shadowImg, tail: tailImg, body: bodyImg, paw: pawImg, eyeL: eyeLImg, eyeR: eyeRImg, mouth: mouthImg, heartL: heartLImg, heartR: heartRImg, sparkA: sparkAImg, sparkB: sparkBImg, sparkC: sparkCImg, lines: linesImg };

const SEAT = { x: 318, y: 532 }; // the middle of his paws, where he sits
const TAIL_BASE = { x: 452, y: 482 };
const PAW_SHOULDER = { x: 300, y: 446 }; // top of the front leg
const FACE = { x: 251, y: 271, tilt: 8.9 }; // between his eyes, on his head's tilt
const EYE_X = 47; // each eye's distance from FACE along the tilt
const MOUTH_AT = { x: 1.5, y: 48 };
const INK = "#0B0906"; // sampled from his outline
const MOUTH_RED = "#C94848";

const loop = (duration, extra = {}) => ({ duration, repeat: Infinity, ease: "easeInOut", ...extra });

const hop = (h, d) => ({
  dog: { y: [0, -h, 0, 0], scaleY: [1, 1.04, 0.93, 1], scaleX: [1, 0.98, 1.05, 1] },
  dogT: {
    y: { duration: d, times: [0, 0.42, 0.78, 1], repeat: Infinity, ease: ["easeOut", "easeIn", "linear"] },
    scaleY: { duration: d, times: [0, 0.42, 0.84, 1], repeat: Infinity },
    scaleX: { duration: d, times: [0, 0.42, 0.84, 1], repeat: Infinity },
  },
  shadow: { scaleX: [1, 0.72, 1, 1], opacity: [1, 0.55, 1, 1] },
  shadowT: { duration: d, times: [0, 0.42, 0.78, 1], repeat: Infinity },
});

const wagFast = (d) => ({
  tail: { rotate: [-12, 14] },
  tailT: { duration: d, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" },
  lines: { opacity: [0.2, 1] },
  linesT: { duration: d, repeat: Infinity, repeatType: "mirror" },
});

// The paw stays small on purpose: it lifts from the leg and comes back, the
// way a sitting puppy's paw does, never swung up into a pose the art does not
// have.
const PAW = {
  rest: { animate: { y: 0, rotate: 0 }, transition: { type: "spring", stiffness: 300, damping: 22 } },
  tap: { animate: { y: [0, -10, 0, 0, -8, 0, 0], rotate: [0, -5, 0, 0, -4, 0, 0] }, transition: loop(1.4, { times: [0, 0.12, 0.25, 0.5, 0.62, 0.75, 1] }) },
  pump: { animate: { y: [0, -15, 0], rotate: [0, -9, 0] }, transition: loop(0.62) },
  wave: { animate: { y: [-11, -16], rotate: [-6, -13] }, transition: { duration: 0.26, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" } },
  startle: { animate: { y: -14, rotate: -8 }, transition: { type: "spring", stiffness: 500, damping: 14 } },
  ponder: { animate: { y: [0, -6, 0, 0], rotate: [0, -3, 0, 0] }, transition: loop(1.8, { times: [0, 0.18, 0.36, 1] }) },
};

const MOODS = {
  idle: {
    dog: { y: [0, -2.5, 0], scaleY: [1, 1.012, 1] },
    dogT: loop(3.2),
    tail: { rotate: [-3, 7, -3] },
    tailT: loop(1.7),
    lines: { opacity: [0.55, 1, 0.55] },
    linesT: loop(1.7),
    deco: "float",
    face: "happy",
    paw: "rest",
  },
  happy: { ...hop(14, 0.66), ...wagFast(0.17), deco: "pulse", face: "happy", paw: "tap" },
  cheer: { ...hop(30, 0.62), ...wagFast(0.13), deco: "burst", face: "happy", paw: "pump" },
  celebrate: {
    ...hop(36, 0.7),
    dog: { y: [0, -36, 0, 0], scaleY: [1, 1.04, 0.92, 1], scaleX: [1, 0.98, 1.06, 1], rotate: [0, -5, 5, 0] },
    dogT: { ...hop(36, 0.7).dogT, rotate: { duration: 1.4, repeat: Infinity, ease: "easeInOut" } },
    ...wagFast(0.12),
    deco: "rise",
    face: "happy",
    paw: "pump",
  },
  wave: {
    dog: { rotate: [-3, 3, -3], y: [0, -3, 0] },
    dogT: { rotate: loop(1.6), y: loop(0.8) },
    ...wagFast(0.22),
    deco: "float",
    face: "wink",
    paw: "wave",
  },
  think: {
    dog: { rotate: -6, y: [0, -2, 0] },
    dogT: { rotate: { type: "spring", stiffness: 90, damping: 14 }, y: loop(2.6) },
    tail: { rotate: [0, 4, 0] },
    tailT: loop(2.4),
    lines: { opacity: 0 },
    deco: "hide",
    face: "think",
    paw: "ponder",
    extra: "think",
  },
  sad: {
    dog: { rotate: [3, 1.5, 3], y: 7, scaleY: 0.965 },
    dogT: { rotate: loop(4), y: { type: "spring", stiffness: 80, damping: 16 }, scaleY: { type: "spring", stiffness: 80, damping: 16 } },
    tail: { rotate: -16 },
    tailT: { type: "spring", stiffness: 60, damping: 14 },
    lines: { opacity: 0 },
    deco: "hide",
    face: "sad",
    paw: "rest",
    extra: "cloud",
  },
  sleep: {
    dog: { scaleY: [1, 1.03, 1], y: [3, 1.5, 3] },
    dogT: loop(3.8),
    tail: { rotate: 6 },
    tailT: { type: "spring", stiffness: 60, damping: 16 },
    lines: { opacity: 0 },
    deco: "hide",
    face: "sleepy",
    paw: "rest",
    extra: "zzz",
  },
  surprised: {
    dog: { y: [0, -12, 0], scaleY: [1, 1.05, 1] },
    dogT: { y: { duration: 0.35, ease: "easeOut" }, scaleY: { duration: 0.35 } },
    tail: { rotate: 18 },
    tailT: { type: "spring", stiffness: 400, damping: 10 },
    lines: { opacity: 0 },
    deco: "hide",
    face: "surprised",
    paw: "startle",
    extra: "pop",
  },
  worried: {
    dog: { x: [-1.5, 1.5, -1.5], scaleY: 0.98 },
    dogT: { x: { duration: 0.5, repeat: Infinity, ease: "easeInOut" }, scaleY: { duration: 0.4 } },
    tail: { rotate: -10 },
    tailT: { type: "spring", stiffness: 80, damping: 14 },
    lines: { opacity: 0 },
    deco: "hide",
    face: "worried",
    paw: "rest",
    extra: "sweat",
  },
};

const still = (anim) => (anim ? Object.fromEntries(Object.entries(anim).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])) : anim);

function Piece({ name, style, ...motionProps }) {
  const [x0, y0, x1, y1] = BOX[name];
  return (
    <MotionImg
      src={SRC[name]}
      alt=""
      draggable={false}
      {...motionProps}
      style={{ position: "absolute", left: x0, top: y0, width: x1 - x0, height: y1 - y0, userSelect: "none", pointerEvents: "none", ...style }}
    />
  );
}

// ---------- faces ----------

// Open eyes blink every few seconds, at slightly irregular intervals.
function useBlink(active, reduce) {
  const [shut, setShut] = useState(false);
  useEffect(() => {
    if (!active || reduce) return undefined;
    let t1;
    let t2;
    const next = () => {
      t1 = setTimeout(() => {
        setShut(true);
        t2 = setTimeout(() => {
          setShut(false);
          next();
        }, 120);
      }, 2400 + Math.random() * 2600);
    };
    next();
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [active, reduce]);
  return shut;
}

function OpenEye({ x, rx = 7.5, ry = 10, cy = 0, shut, look = 0 }) {
  return (
    // Position on a plain group, blink on the one inside: a motion transform
    // would replace an SVG transform attribute on the same element.
    <g transform={`translate(${x} ${cy})`}>
      <MotionG animate={{ scaleY: shut ? 0.1 : 1 }} transition={{ duration: 0.07 }} style={{ originX: 0.5, originY: 0.5 }}>
        <ellipse rx={rx} ry={ry} fill={INK} />
        <circle cx={rx * 0.32} cy={-ry * 0.42 + look} r={rx * 0.34} fill="#fff" />
      </MotionG>
    </g>
  );
}

const line = { fill: "none", stroke: INK, strokeLinecap: "round", strokeLinejoin: "round" };

function DrawnFace({ face, shut, reduce }) {
  const L = -EYE_X;
  const R = EYE_X;
  const my = MOUTH_AT.y;
  const mx = MOUTH_AT.x;
  switch (face) {
    case "wink":
      return <OpenEye x={R} shut={shut} />;
    case "surprised":
      return (
        <>
          <OpenEye x={L} rx={8.5} ry={11.5} shut={shut} />
          <OpenEye x={R} rx={8.5} ry={11.5} shut={shut} />
          <path d={`M${L - 11} -22 Q${L} -29 ${L + 11} -22 M${R - 11} -22 Q${R} -29 ${R + 11} -22`} {...line} strokeWidth="6" />
          <MotionEllipse
            cx={mx}
            cy={my + 1}
            rx={9}
            ry={11}
            fill={MOUTH_RED}
            stroke={INK}
            strokeWidth="6"
            initial={reduce ? false : { scale: 0.3 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 600, damping: 12 }}
            style={{ originX: 0.5, originY: 0.5 }}
          />
        </>
      );
    case "sad":
      return (
        <>
          <OpenEye x={L} rx={6.5} ry={8.5} cy={2} shut={shut} />
          <OpenEye x={R} rx={6.5} ry={8.5} cy={2} shut={shut} />
          <path d={`M${L - 15} -14 L${L + 9} -22 M${R - 9} -22 L${R + 15} -14`} {...line} strokeWidth="6" />
          <path d={`M${mx - 13.5} ${my + 5} Q${mx} ${my - 7} ${mx + 13.5} ${my + 5}`} {...line} strokeWidth="7" />
          {!reduce && (
            <MotionPath
              d={`M${L + 4} 12c-3 5-5 8-5 11a5 5 0 0 0 10 0c0-3-2-6-5-11z`}
              fill="#8EC5F0"
              stroke={INK}
              strokeWidth="3.5"
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: [0, 1, 1, 0], y: [0, 4, 22, 30] }}
              transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 0.8, ease: "easeIn" }}
            />
          )}
        </>
      );
    case "sleepy":
      return (
        <>
          <path d={`M${L - 13} -1 Q${L} 9 ${L + 13} -1 M${R - 13} -1 Q${R} 9 ${R + 13} -1`} {...line} strokeWidth="7" />
          <path d={`M${mx - 7.5} ${my - 1} Q${mx} ${my + 5} ${mx + 7.5} ${my - 1}`} {...line} strokeWidth="6" />
        </>
      );
    case "think":
      return (
        <>
          <OpenEye x={L} rx={7} ry={9.5} cy={-1} shut={shut} look={-1.5} />
          <OpenEye x={R} rx={7} ry={9.5} cy={-1} shut={shut} look={-1.5} />
          <path d={`M${R - 11} -21 Q${R} -28 ${R + 11} -20`} {...line} strokeWidth="6" />
          <path d={`M${mx - 9.5} ${my + 2} L${mx + 10.5} ${my - 2}`} {...line} strokeWidth="7" />
        </>
      );
    case "worried":
      return (
        <>
          <OpenEye x={L} rx={6.5} ry={8.5} cy={2} shut={shut} />
          <OpenEye x={R} rx={6.5} ry={8.5} cy={2} shut={shut} />
          <path d={`M${L - 15} -14 L${L + 9} -22 M${R - 9} -22 L${R + 15} -14`} {...line} strokeWidth="6" />
          <path d={`M${mx - 15.5} ${my + 2} q6 -6 12 0 t12 0 t6 -2`} {...line} strokeWidth="6" />
        </>
      );
    default:
      return null;
  }
}

// ---------- hearts, sparkles and extras ----------

function decoAnim(kind, i, isSpark, reduce) {
  if (kind === "hide") return { animate: { opacity: 0, scale: 0.5 }, transition: { duration: 0.3 } };
  if (reduce) return { animate: { opacity: 1, scale: 1, y: 0 }, transition: { duration: 0 } };
  const delay = i * 0.37;
  if (isSpark) {
    const fast = kind === "burst" || kind === "rise";
    return {
      animate: { opacity: [1, 0.55, 1, 1], scale: fast ? [1, 0.6, 1.35, 1] : [1, 0.75, 1.15, 1], rotate: [0, 0, fast ? 45 : 20, 0] },
      transition: { duration: fast ? 0.8 : 2, times: [0, 0.3, 0.6, 1], repeat: Infinity, delay, ease: "easeInOut" },
    };
  }
  if (kind === "pulse" || kind === "burst") return { animate: { opacity: 1, scale: [1, 1.2, 1], y: 0 }, transition: { duration: 0.66, repeat: Infinity, delay: i * 0.12, ease: "easeInOut" } };
  if (kind === "rise") return { animate: { opacity: [0, 1, 1, 0], scale: [0.6, 1.1, 1, 0.9], y: [12, 0, -26, -48] }, transition: { duration: 1.8, times: [0, 0.2, 0.7, 1], repeat: Infinity, delay: i * 0.5 } };
  return { animate: { opacity: 1, scale: 1, y: [0, -7, 0] }, transition: { y: { duration: 2.8, repeat: Infinity, delay, ease: "easeInOut" }, default: { duration: 0.3 } } };
}

function Extra({ kind, reduce }) {
  const t = (d) => (reduce ? { duration: 0 } : d);
  if (kind === "think") {
    return [
      { cx: 472, cy: 168, r: 9 },
      { cx: 506, cy: 128, r: 14 },
      { cx: 544, cy: 76, r: 22 },
    ].map((d, i) => (
      <MotionCircle
        key={i}
        cx={d.cx}
        cy={d.cy}
        r={d.r}
        fill="#fff"
        stroke={INK}
        strokeWidth="6"
        initial={{ opacity: 0, scale: 0.4 }}
        animate={reduce ? { opacity: 1, scale: 1 } : { opacity: [0, 1, 1, 0], scale: [0.4, 1, 1, 0.8] }}
        transition={t({ duration: 2.4, times: [0, 0.2, 0.8, 1], repeat: Infinity, delay: i * 0.3 })}
        style={{ originX: 0.5, originY: 0.5 }}
      />
    ));
  }
  if (kind === "zzz") {
    return [0, 1, 2].map((i) => {
      const s = 1 + i * 0.35;
      const x = 448 + i * 30;
      const y = 150 - i * 44;
      return (
        <MotionPath
          key={i}
          d={`M${x} ${y}h${22 * s}l${-22 * s} ${22 * s}h${22 * s}`}
          {...line}
          strokeWidth="6"
          initial={{ opacity: 0, y: 10 }}
          animate={reduce ? { opacity: 0.85, y: 0 } : { opacity: [0, 0.9, 0], y: [10, -16] }}
          transition={t({ duration: 2.8, repeat: Infinity, delay: i * 0.8, ease: "easeOut" })}
        />
      );
    });
  }
  if (kind === "cloud") {
    return (
      <MotionG initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <path d="M262 70a26 26 0 0 1 10-41 34 34 0 0 1 64-8 28 28 0 0 1 46 22 22 22 0 0 1-6 27z" fill="#E6EAF0" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
        {[288, 322, 356].map((x, i) => (
          <MotionPath
            key={x}
            d={`M${x} 84c-4 6-6 10-6 13a6 6 0 0 0 12 0c0-3-2-7-6-13z`}
            fill="#8EC5F0"
            stroke={INK}
            strokeWidth="4"
            strokeLinejoin="round"
            initial={{ opacity: 0, y: 0 }}
            animate={reduce ? { opacity: 1 } : { opacity: [0, 1, 0], y: [0, 26] }}
            transition={t({ duration: 1.3, repeat: Infinity, delay: i * 0.42, ease: "easeIn" })}
          />
        ))}
      </MotionG>
    );
  }
  if (kind === "pop") {
    // three short strokes off the side of his head: the cartoon "!" of surprise
    return [
      "M402 120 L420 98",
      "M418 150 L446 140",
      "M394 92 L398 66",
    ].map((d, i) => (
      <MotionPath key={i} d={d} {...line} strokeWidth="7" initial={{ pathLength: reduce ? 1 : 0, opacity: 1 }} animate={{ pathLength: 1, opacity: 1 }} transition={t({ duration: 0.25, delay: 0.05 + i * 0.05 })} />
    ));
  }
  if (kind === "sweat") {
    return (
      <MotionPath
        d="M392 150c-6 9-9 15-9 19a9 9 0 0 0 18 0c0-4-3-10-9-19z"
        fill="#8EC5F0"
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
        initial={{ opacity: 0, y: -6 }}
        animate={reduce ? { opacity: 1, y: 0 } : { opacity: [0, 1, 1], y: [-6, 0, 6] }}
        transition={t({ duration: 1.6, repeat: Infinity, repeatDelay: 0.6 })}
      />
    );
  }
  return null;
}

export default function Miso({ mood = "idle", size = 120, title = "Miso", style, className }) {
  const reduce = useReducedMotionConfig();
  const m = MOODS[mood] || MOODS.idle;
  const scale = size / ART_H;
  const pick = (anim) => (reduce ? still(anim) : anim);
  const face = m.face || "happy";
  const showEyeL = face === "happy" || face === "wink";
  const showEyeR = face === "happy";
  const showMouth = face === "happy" || face === "wink";
  const opensEyes = face !== "happy" && face !== "sleepy";
  const shut = useBlink(opensEyes, reduce);
  const paw = PAW[m.paw || "rest"];

  return (
    <div
      role="img"
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
      className={className}
      style={{ position: "relative", width: size, height: size, display: "block", flexShrink: 0, ...style }}
    >
      <div style={{ position: "absolute", left: (size - ART_W * scale) / 2, top: 0, width: ART_W, height: ART_H, transform: `scale(${scale})`, transformOrigin: "0 0" }}>
        <Piece name="shadow" animate={pick(m.shadow) || { scaleX: 1, opacity: 1 }} transition={m.shadowT || { duration: 0.4 }} style={{ originX: 0.5, originY: 0.5 }} />

        <MotionDiv animate={pick(m.dog)} transition={m.dogT} style={{ position: "absolute", inset: 0, originX: SEAT.x / ART_W, originY: SEAT.y / ART_H }}>
          <Piece
            name="tail"
            animate={pick(m.tail)}
            transition={m.tailT}
            style={{ originX: (TAIL_BASE.x - BOX.tail[0]) / (BOX.tail[2] - BOX.tail[0]), originY: (TAIL_BASE.y - BOX.tail[1]) / (BOX.tail[3] - BOX.tail[1]) }}
          />
          <Piece name="body" />
          <Piece
            name="paw"
            animate={reduce ? still(paw.animate) : paw.animate}
            transition={paw.transition}
            style={{ originX: (PAW_SHOULDER.x - BOX.paw[0]) / (BOX.paw[2] - BOX.paw[0]), originY: (PAW_SHOULDER.y - BOX.paw[1]) / (BOX.paw[3] - BOX.paw[1]) }}
          />

          {/* his own eyes and mouth, shown when the face uses them */}
          <Piece name="eyeL" initial={false} animate={{ opacity: showEyeL ? 1 : 0 }} transition={{ duration: 0.12 }} />
          <Piece name="eyeR" initial={false} animate={{ opacity: showEyeR ? 1 : 0 }} transition={{ duration: 0.12 }} />
          <Piece name="mouth" initial={false} animate={{ opacity: showMouth ? 1 : 0 }} transition={{ duration: 0.12 }} />

          {/* the drawn eyes and mouth for other feelings, on his head's tilt */}
          <svg width={ART_W} height={ART_H} viewBox={`0 0 ${ART_W} ${ART_H}`} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }} aria-hidden="true">
            <g transform={`translate(${FACE.x} ${FACE.y}) rotate(${FACE.tilt})`}>
              <AnimatePresence initial={false}>
                {face !== "happy" && (
                  <MotionG key={face} initial={reduce ? false : { opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, transition: { duration: 0.08 } }} transition={{ type: "spring", stiffness: 500, damping: 22 }}>
                    <DrawnFace face={face} shut={shut} reduce={reduce} />
                  </MotionG>
                )}
              </AnimatePresence>
            </g>
          </svg>

          <Piece name="lines" animate={pick(m.lines)} transition={m.linesT || { duration: 0.3 }} />
        </MotionDiv>

        {["heartL", "heartR"].map((n, i) => (
          <Piece key={n} name={n} initial={false} {...decoAnim(m.deco, i, false, reduce)} style={{ originX: 0.5, originY: 0.5 }} />
        ))}
        {["sparkA", "sparkB", "sparkC"].map((n, i) => (
          <Piece key={n} name={n} initial={false} {...decoAnim(m.deco, i, true, reduce)} style={{ originX: 0.5, originY: 0.5 }} />
        ))}

        {m.extra && (
          <svg width={ART_W} height={ART_H} viewBox={`0 0 ${ART_W} ${ART_H}`} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }} aria-hidden="true">
            <Extra kind={m.extra} reduce={reduce} />
          </svg>
        )}
      </div>
    </div>
  );
}

export const MISO_MOODS = Object.keys(MOODS);
