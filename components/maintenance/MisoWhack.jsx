"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls, useReducedMotionConfig } from "framer-motion";
import { Heart, Play, RotateCcw, Trophy } from "lucide-react";
import Miso from "./Miso";
import { sfx } from "./sound";
import { BAYS, LIVES, ROUND_SECONDS, newGame, secondsLeft, startGame, tapBay, tick } from "./whackEngine";

// "Shoo Miso": the maintenance page's game. Miso keeps popping out of the
// server bays to chew the cables; tap him away before he gets a bite. Golden
// flashcards are a bonus; live plugs are not to be touched. 45 seconds.
//
// Mouse, touch or keys: the bays are the number pad (7 8 9 / 4 5 6 / 1 2 3)
// or Q W E / A S D / Z X C. Space starts a round. The best score is kept on
// this device.

const MotionDiv = motion.div;
const BEST_KEY = "forks_shoo_miso_best";
const KEYS = { 7: 0, 8: 1, 9: 2, 4: 3, 5: 4, 6: 5, 1: 6, 2: 7, 3: 8, q: 0, w: 1, e: 2, a: 3, s: 4, d: 5, z: 6, x: 7, c: 8 };

function readBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function Plug({ hit }) {
  const reduce = useReducedMotionConfig();
  return (
    <svg viewBox="0 0 80 80" width="78%" height="78%" aria-hidden="true">
      <path d="M40 80 V56" stroke="#7a3e10" strokeWidth="9" strokeLinecap="round" />
      <path d="M40 80 V56" stroke="#e98b2f" strokeWidth="5.5" strokeLinecap="round" />
      <rect x="24" y="30" width="32" height="28" rx="5" fill={hit ? "#ffe27a" : "#dfe6ee"} stroke="#5a6672" strokeWidth="2.5" />
      <rect x="30" y="16" width="6" height="15" rx="1.5" fill="#c9a24a" />
      <rect x="44" y="16" width="6" height="15" rx="1.5" fill="#c9a24a" />
      {[
        "M28 12 l-8 -8",
        "M52 12 l8 -8",
        "M40 8 V0",
        "M18 26 l-9 2",
        "M62 26 l9 2",
      ].map((d, i) => (
        <motion.path
          key={d}
          d={d}
          stroke="#ffd34d"
          strokeWidth="3.5"
          strokeLinecap="round"
          animate={reduce ? { opacity: 1 } : { opacity: [0, 1, 0] }}
          transition={{ duration: 0.35, repeat: Infinity, repeatDelay: 0.15 + i * 0.07 }}
        />
      ))}
    </svg>
  );
}

function GoldCard() {
  return (
    <div className="shoo-card" aria-hidden="true">
      <span className="shoo-card-q">Q</span>
      <span className="shoo-card-line" />
      <span className="shoo-card-line short" />
      <span className="shoo-card-pts">+30</span>
    </div>
  );
}

function Bay({ index, item, red, onTap, size }) {
  const reduce = useReducedMotionConfig();
  const label = item ? (item.kind === "miso" ? "Miso is chewing a cable here" : item.kind === "card" ? "A golden flashcard" : "A live plug, do not touch") : "Empty server bay";
  return (
    <button type="button" className={`shoo-bay${red ? " is-red" : ""}`} onPointerDown={(e) => { e.preventDefault(); onTap(index); }} aria-label={`Bay ${index + 1}: ${label}`}>
      <span className="shoo-bay-leds" aria-hidden="true">
        <span className={red ? "led red" : "led green"} />
        <span className="led amber" />
      </span>
      <span className="shoo-bay-hole">
        <AnimatePresence>
          {item && (
            <MotionDiv
              key={item.id}
              className="shoo-pop"
              initial={reduce ? { opacity: 0 } : { y: "105%" }}
              animate={
                item.hit
                  ? item.kind === "spark"
                    ? { y: 0, scale: [1, 1.25, 1], rotate: [0, -10, 10, 0] }
                    : { y: "-18%", scale: 1.08, rotate: item.kind === "miso" ? -8 : 12 }
                  : { y: "8%", opacity: 1 }
              }
              exit={reduce ? { opacity: 0 } : { y: "110%", transition: { duration: item.hit ? 0.22 : 0.18, ease: "easeIn" } }}
              transition={{ type: "spring", stiffness: 520, damping: 22 }}
            >
              {item.kind === "miso" && <Miso mood={item.hit ? "surprised" : "happy"} size={size} title="" />}
              {item.kind === "card" && <GoldCard />}
              {item.kind === "spark" && <Plug hit={item.hit} />}
            </MotionDiv>
          )}
        </AnimatePresence>
      </span>
    </button>
  );
}

export default function MisoWhack() {
  const reduce = useReducedMotionConfig();
  const [game, setGame] = useState(() => newGame(0));
  const [now, setNow] = useState(0);
  const [best, setBest] = useState(readBest);
  const [newBest, setNewBest] = useState(false);
  const [pops, setPops] = useState([]);
  const [red, setRed] = useState({});
  const gameRef = useRef(game);
  const boardRef = useRef(null);
  const [bay, setBay] = useState(110);
  const shake = useAnimationControls();

  // Each bay's size, for the Miso inside it.
  useEffect(() => {
    const el = boardRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([e]) => setBay(Math.max(60, (e.contentRect.width - 24) / 3)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const react = useCallback(
    (events) => {
      for (const ev of events) {
        if (ev.type === "shoo" || ev.type === "card") {
          sfx.correct(Math.min(ev.combo, 12));
          if (ev.combo > 0 && ev.combo % 5 === 0) sfx.combo(ev.combo);
          const id = `${Date.now()}-${Math.random()}`;
          setPops((p) => [...p.slice(-6), { id, bay: ev.bay, text: `+${ev.points}`, gold: ev.type === "card" }]);
          setTimeout(() => setPops((p) => p.filter((x) => x.id !== id)), 700);
        } else if (ev.type === "zap") {
          sfx.miss();
          if (!reduce) shake.start({ x: [0, -10, 10, -6, 6, 0], transition: { duration: 0.35 } });
        } else if (ev.type === "escaped") {
          setRed((r) => ({ ...r, [ev.bay]: true }));
          setTimeout(() => setRed((r) => ({ ...r, [ev.bay]: false })), 900);
        }
      }
    },
    [reduce, shake],
  );

  // The game clock.
  useEffect(() => {
    if (game.phase !== "playing") return undefined;
    const id = setInterval(() => {
      const t = performance.now();
      const g = tick(gameRef.current, t);
      gameRef.current = g;
      if (g.events.length) react(g.events);
      setGame(g);
      setNow(t);
    }, 40);
    return () => clearInterval(id);
  }, [game.phase, react]);

  // The end of a round: keep the best.
  useEffect(() => {
    if (game.phase !== "over") return;
    if (game.score > best) {
      setBest(game.score);
      setNewBest(true);
      try {
        localStorage.setItem(BEST_KEY, String(game.score));
      } catch {
        // Private mode: the best is just not kept.
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.phase]);

  const start = useCallback(() => {
    const g = startGame(performance.now());
    gameRef.current = g;
    setNewBest(false);
    setRed({});
    setPops([]);
    setGame(g);
    setNow(performance.now());
  }, []);

  const tap = useCallback(
    (i) => {
      const g = tapBay(gameRef.current, i, performance.now());
      gameRef.current = g;
      if (g.events.length) react(g.events);
      setGame(g);
    },
    [react],
  );

  // Keys: the number pad or QWE/ASD/ZXC; Space starts.
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.("input, textarea")) return;
      if (e.key === " " && gameRef.current.phase !== "playing") {
        e.preventDefault();
        start();
        return;
      }
      const i = KEYS[e.key.toLowerCase()];
      if (i !== undefined && gameRef.current.phase === "playing") tap(i);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [start, tap]);

  const left = game.phase === "playing" ? secondsLeft(game, now) : ROUND_SECONDS;
  const mult = 1 + Math.floor(game.combo / 5);

  return (
    <section className="shoo" aria-labelledby="shoo-title">
      <div className="shoo-head">
        <div>
          <h2 id="shoo-title">Shoo Miso off the servers</h2>
          <p>Tap Miso before he bites a cable. Golden cards are a bonus. Never touch a live plug.</p>
        </div>
        <div className="shoo-stats" aria-live="polite">
          <div>
            <span>Score</span>
            <strong>{game.score}</strong>
          </div>
          <div>
            <span>Combo</span>
            <strong className={mult > 1 ? "hot" : ""}>{game.combo}{mult > 1 ? ` x${mult}` : ""}</strong>
          </div>
          <div>
            <span>Lives</span>
            <strong className="shoo-lives" aria-label={`${game.lives} lives`}>
              {Array.from({ length: LIVES }, (_, i) => (
                <Heart key={i} size={15} fill={i < game.lives ? "#e05a5a" : "none"} color={i < game.lives ? "#e05a5a" : "rgba(255,255,255,0.35)"} />
              ))}
            </strong>
          </div>
          <div>
            <span>Best</span>
            <strong>{best}</strong>
          </div>
        </div>
      </div>
      <div className="shoo-time" aria-hidden="true">
        <MotionDiv className="shoo-time-fill" animate={{ width: `${(left / ROUND_SECONDS) * 100}%` }} transition={{ duration: 0.25, ease: "linear" }} />
      </div>

      <MotionDiv ref={boardRef} className="shoo-board" animate={shake}>
        {Array.from({ length: BAYS }, (_, i) => (
          <div key={i} className="shoo-cell">
            <Bay index={i} item={game.bays[i]} red={red[i]} onTap={tap} size={bay * 0.92} />
            <AnimatePresence>
              {pops
                .filter((p) => p.bay === i)
                .map((p) => (
                  <MotionDiv key={p.id} className={`shoo-points${p.gold ? " gold" : ""}`} initial={{ opacity: 0, y: 0, scale: 0.6 }} animate={{ opacity: 1, y: -46, scale: 1.1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: "easeOut" }}>
                    {p.text}
                  </MotionDiv>
                ))}
            </AnimatePresence>
          </div>
        ))}

        <AnimatePresence>
          {game.phase !== "playing" && (
            <MotionDiv key={game.phase} className="shoo-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <MotionDiv initial={reduce ? false : { scale: 0.85, y: 12 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 380, damping: 22 }} className="shoo-overlay-card">
                <Miso mood={game.phase === "over" ? (newBest ? "celebrate" : game.lives <= 0 ? "sad" : "happy") : "wave"} size={Math.round(Math.min(110, bay * 0.7))} title="" />
                {game.phase === "ready" ? (
                  <>
                    <h3>Ready to protect the servers?</h3>
                    <ul className="shoo-legend">
                      <li><b>Miso</b> tap him away, 10 points</li>
                      <li><b>Golden card</b> grab it, 30 points</li>
                      <li><b>Live plug</b> leave it alone</li>
                    </ul>
                  </>
                ) : (
                  <>
                    <h3>{game.lives <= 0 ? "Zapped!" : "Time's up!"}</h3>
                    <p className="shoo-final">
                      <strong>{game.score}</strong> points, {game.shooed} Misos shooed, best combo {game.bestCombo}
                    </p>
                    {newBest && (
                      <p className="shoo-best">
                        <Trophy size={15} /> New best on this device
                      </p>
                    )}
                  </>
                )}
                <button type="button" className="shoo-play" onClick={start}>
                  {game.phase === "ready" ? <Play size={16} /> : <RotateCcw size={16} />}
                  {game.phase === "ready" ? "Play" : "Play again"}
                </button>
                <span className="shoo-keys">Space to start. Number pad or Q W E / A S D / Z X C to tap.</span>
              </MotionDiv>
            </MotionDiv>
          )}
        </AnimatePresence>
      </MotionDiv>
    </section>
  );
}
