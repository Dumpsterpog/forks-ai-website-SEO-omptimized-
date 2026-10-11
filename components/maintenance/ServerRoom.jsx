"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotionConfig } from "framer-motion";
import Miso from "./Miso";

// The maintenance page's picture: Miso has found the server room. One Miso
// sits on the floor chewing a network cable, one is asleep on top of the
// low server, and one peeks out from behind the tall one. The servers are
// drawn here; Miso is the animated mascot, layered over the drawing.
//
// Tapping the chewing Miso makes him jump and drop the cable for a moment.

const MotionG = motion.g;
const MotionDiv = motion.div;
const MotionCircle = motion.circle;
const MotionPath = motion.path;

// The scene is drawn in a 640 x 400 box; everything below is placed in it.
const VB_W = 640;
const VB_H = 400;
// Where the chewing Miso sits (left, top and width, as fractions of the box)
// and where his mouth lands in the box, for the cable's end.
const CHEW = { left: 0.31, top: 0.37, w: 0.34 };
const MOUTH = { x: CHEW.left * VB_W + 0.422 * CHEW.w * VB_W, y: CHEW.top * VB_H + 0.528 * CHEW.w * VB_W };

function Tower({ x, y, w, h, leds, depth = 22 }) {
  const reduce = useReducedMotionConfig();
  return (
    <g>
      {/* side, then top, then the face */}
      <path d={`M${x + w} ${y} l${depth} ${-depth * 0.55} v${h} l${-depth} ${depth * 0.55} z`} fill="#15181d" />
      <path d={`M${x} ${y} l${depth} ${-depth * 0.55} h${w} l${-depth} ${depth * 0.55} z`} fill="#3a404a" />
      <rect x={x} y={y} width={w} height={h} rx="4" fill="#23272e" stroke="#0e1013" strokeWidth="2" />
      {/* drive bays */}
      {[0, 1, 2].map((i) => (
        <rect key={i} x={x + 14} y={y + 18 + i * 20} width={w - 28} height="11" rx="2" fill="#121418" stroke="#30353e" />
      ))}
      {/* the status panel */}
      <rect x={x + 14} y={y + h * 0.5} width={w - 28} height={h * 0.2} rx="3" fill="#1a1d22" stroke="#30353e" />
      {leds.map((c, i) => (
        <MotionCircle
          key={i}
          cx={x + 26 + i * 12}
          cy={y + h * 0.5 + 12}
          r="3.4"
          fill={c}
          animate={reduce ? {} : { opacity: [1, 0.25, 1] }}
          transition={{ duration: 0.6 + i * 0.37, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
        />
      ))}
      {/* power button */}
      <circle cx={x + w - 28} cy={y + h * 0.5 + h * 0.1} r="9" fill="#2c313a" stroke="#4a515c" strokeWidth="2" />
      <path d={`M${x + w - 28} ${y + h * 0.5 + h * 0.1 - 5} v5`} stroke="#9aa3ad" strokeWidth="2" strokeLinecap="round" />
      {/* vents */}
      {Array.from({ length: 4 }, (_, i) => (
        <rect key={`v${i}`} x={x + 14} y={y + h * 0.78 + i * 7} width={w - 28} height="3" rx="1.5" fill="#15181d" />
      ))}
      {/* a port the cable comes out of */}
      <rect x={x + w / 2 - 6} y={y + h - 16} width="12" height="8" rx="1.5" fill="#0b0c0f" stroke="#59606b" />
    </g>
  );
}

// The scene's width in pixels, so the mascots scale with the drawing.
function useWidth() {
  const ref = useRef(null);
  const [w, setW] = useState(640);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

export default function ServerRoom() {
  const reduce = useReducedMotionConfig();
  const [ref, w] = useWidth();
  const h = (w * VB_H) / VB_W;
  const k = w / VB_W; // box units to pixels
  const [startled, setStartled] = useState(0);
  const chewing = startled === 0;

  // From the middle server's port, along the floor, up to Miso's mouth.
  const port = { x: 326, y: 296 };
  const cable = `M${port.x} ${port.y} C ${port.x} 352, 250 362, 214 340 S ${MOUTH.x - 40} ${MOUTH.y + 30}, ${MOUTH.x - 6} ${MOUTH.y + 4}`;

  const startle = () => {
    setStartled((n) => n + 1);
    setTimeout(() => setStartled(0), 1400);
  };

  return (
    <div ref={ref} className="mn-scene" aria-label="Miso chewing a cable in the server room" role="img">
      {/* Miso peeking from behind the left tower (drawn under the towers) */}
      <MotionDiv
        style={{ position: "absolute", left: 40 * k, top: 120 * k }}
        animate={reduce ? {} : { x: [-26 * k, 0, 0, -26 * k], rotate: [-10, 0, 0, -10] }}
        transition={{ duration: 5, times: [0, 0.15, 0.75, 1], repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" }}
      >
        <Miso mood="surprised" size={118 * k} title="" />
      </MotionDiv>
      <svg className="mn-scene-svg" viewBox={`0 0 ${VB_W} ${VB_H}`} aria-hidden="true">
        {/* floor shadow */}
        <ellipse cx="330" cy="372" rx="250" ry="20" fill="rgba(0,0,0,0.07)" />
        {/* the low server at the back right, with a sleeping Miso on it */}
        <Tower x={400} y={208} w={170} h={140} leds={["#e04b4b", "#4cc38a", "#e9b949"]} />
        {/* the two tall ones */}
        <Tower x={92} y={96} w={128} h={250} leds={["#4cc38a", "#e04b4b", "#e9b949"]} />
        <Tower x={258} y={70} w={136} h={262} leds={["#e04b4b", "#e04b4b", "#4cc38a"]} />
        {/* the cable, chewed at the end */}
        <path d={cable} fill="none" stroke="#7a3e10" strokeWidth="7" strokeLinecap="round" />
        <path d={cable} fill="none" stroke="#e98b2f" strokeWidth="4.5" strokeLinecap="round" />
      </svg>

      {/* Miso asleep on the low server */}
      <div style={{ position: "absolute", left: 440 * k, top: 196 * k - 150 * k * 0.86, pointerEvents: "none" }}>
        <Miso mood="sleep" size={150 * k} title="" />
      </div>

      {/* the chewing Miso, who can be shooed */}
      <button type="button" className="mn-chewer" onClick={startle} aria-label="Shoo Miso away from the cable" style={{ left: CHEW.left * w, top: CHEW.top * h, width: CHEW.w * w, height: CHEW.w * w }}>
        <MotionDiv
          key={startled}
          initial={false}
          animate={reduce ? {} : startled ? { y: [0, -60, 0], rotate: [0, -8, 0] } : { y: [0, -3, 0], rotate: [0, 1.5, 0] }}
          transition={startled ? { duration: 0.7, ease: "easeOut" } : { duration: 0.42, repeat: Infinity, ease: "easeInOut" }}
        >
          <Miso mood={chewing ? "happy" : "surprised"} size={CHEW.w * w} title="" />
        </MotionDiv>
      </button>

      {/* the plug, in his mouth while he chews, sparking */}
      <svg className="mn-scene-svg mn-front" viewBox={`0 0 ${VB_W} ${VB_H}`} aria-hidden="true">
        <AnimatePresence>
          {chewing && (
            <MotionG
              key="plug"
              initial={{ opacity: 0 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, rotate: [-6, 8, -6], y: [0, 2, 0] }}
              exit={{ opacity: 0, y: 40, rotate: 30, transition: { duration: 0.35 } }}
              transition={{ duration: 0.42, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformBox: "fill-box", transformOrigin: "0% 50%" }}
            >
              <path d={`M${MOUTH.x - 22} ${MOUTH.y + 12} q 10 -8 22 -10`} fill="none" stroke="#7a3e10" strokeWidth="7" strokeLinecap="round" />
              <path d={`M${MOUTH.x - 22} ${MOUTH.y + 12} q 10 -8 22 -10`} fill="none" stroke="#e98b2f" strokeWidth="4.5" strokeLinecap="round" />
              <rect x={MOUTH.x - 2} y={MOUTH.y - 8} width="20" height="13" rx="2" fill="#dfe6ee" stroke="#5a6672" strokeWidth="1.6" />
              <rect x={MOUTH.x + 16} y={MOUTH.y - 5} width="5" height="7" fill="#c9a24a" />
              {!reduce &&
                [0, 1, 2].map((i) => (
                  <MotionPath
                    key={i}
                    d={`M${MOUTH.x + 24} ${MOUTH.y - 4 + i * 4} l ${8 + i * 2} ${-6 + i * 6}`}
                    stroke="#ffd34d"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    animate={{ opacity: [0, 1, 0], pathLength: [0, 1, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.9 + i * 0.4, delay: i * 0.15 }}
                  />
                ))}
            </MotionG>
          )}
        </AnimatePresence>
      </svg>
      <AnimatePresence>
        {!chewing && (
          <MotionDiv key="say" className="mn-say" style={{ left: (CHEW.left + CHEW.w * 0.7) * w, top: CHEW.top * h - 10 * k }} initial={{ opacity: 0, scale: 0.6, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ type: "spring", stiffness: 500, damping: 22 }}>
            It was only a snack!
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
}
