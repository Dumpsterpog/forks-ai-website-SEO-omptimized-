// Copied from the dashboard app (src/gamify/sound.js).
// FORKSAI's game sounds, synthesized in the browser.
//
// No audio files: every sound is a few oscillators shaped by an envelope, so
// nothing downloads, nothing can fail to load, the first play is instant and
// the sounds are ours. The palette is small on purpose: soft, rounded tones
// in one key (C major), quiet enough for a library, short enough never to
// sit on top of the next answer.
//
// A correct answer climbs a semitone per answer in a combo, so a streak is
// something you hear building. A miss is a low, soft tap, never a buzzer.
//
// Off switch: localStorage "forks_game_sounds" = "off". Sounds also stay
// silent while the tab is hidden.

const KEY = "forks_game_sounds";
const listeners = new Set();
let ctx = null;
let out = null;

export function soundOn() {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSoundOn(on) {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    // Private mode: the choice lasts for this visit.
  }
  listeners.forEach((fn) => fn(on));
  if (on) sfx.toggle();
}

export function onSoundChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Created on first use. Every sound here follows a tap or a key press, which
// is what browsers need before they allow audio.
function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 4;
    out = ctx.createGain();
    out.gain.value = 0.28;
    out.connect(comp);
    comp.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

const ready = () => soundOn() && !(typeof document !== "undefined" && document.hidden) && audio();

// One note: a quick attack and an exponential fall, which is what makes it
// sound plucked rather than beeped.
function note(freq, { at = 0, dur = 0.18, vol = 0.5, type = "sine", glide, partial = 0.18 } = {}) {
  const a = ready();
  if (!a) return;
  const t = a.currentTime + at;
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  g.connect(out);

  const o = a.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (glide) o.frequency.exponentialRampToValueAtTime(glide, t + dur * 0.8);
  o.connect(g);
  o.start(t);
  o.stop(t + dur + 0.02);

  // A quiet octave above gives the note a little shine.
  if (partial) {
    const g2 = a.createGain();
    g2.gain.setValueAtTime(0.0001, t);
    g2.gain.exponentialRampToValueAtTime(vol * partial, t + 0.004);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.6);
    g2.connect(out);
    const o2 = a.createOscillator();
    o2.type = "sine";
    o2.frequency.setValueAtTime(freq * 2, t);
    o2.connect(g2);
    o2.start(t);
    o2.stop(t + dur);
  }
}

const C5 = 523.25;
const st = (n) => C5 * Math.pow(2, n / 12); // semitones above C5
const MAJOR = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19, 21, 23, 24];

export const sfx = {
  // A correct answer: two notes a fifth apart, a step higher per combo.
  correct(combo = 1) {
    const base = MAJOR[Math.min(Math.max(combo, 1) - 1, MAJOR.length - 1)];
    note(st(base + 4), { dur: 0.14, vol: 0.42, type: "triangle" });
    note(st(base + 11), { at: 0.055, dur: 0.22, vol: 0.34, type: "sine" });
  },
  // A miss: low and soft, a tap rather than a buzzer.
  miss() {
    note(220, { dur: 0.2, vol: 0.32, type: "triangle", glide: 165, partial: 0 });
  },
  // XP landing in the meter: a tiny bright tick.
  land() {
    note(st(24), { dur: 0.06, vol: 0.12, type: "sine", partial: 0 });
  },
  // A combo milestone: a quick rising arpeggio.
  combo(n = 5) {
    const top = n >= 10 ? 7 : 0;
    [0, 4, 7, 12].forEach((s, i) => note(st(s + top), { at: i * 0.055, dur: 0.18, vol: 0.32, type: "triangle" }));
  },
  // A level up: an arpeggio up two octaves, then a held chord.
  levelUp() {
    [0, 4, 7, 12, 16, 19, 24].forEach((s, i) => note(st(s - 12), { at: i * 0.06, dur: 0.22, vol: 0.3, type: "triangle" }));
    [12, 16, 19, 23].forEach((s) => note(st(s), { at: 0.46, dur: 1.3, vol: 0.16, type: "sine", partial: 0.1 }));
  },
  // The daily goal: two bell strikes, warm and unhurried.
  goal() {
    note(st(7), { dur: 1.1, vol: 0.3, type: "sine", partial: 0.35 });
    note(st(12), { at: 0.16, dur: 1.4, vol: 0.28, type: "sine", partial: 0.35 });
  },
  // A finished session: a short resolving phrase.
  session() {
    [4, 7, 12].forEach((s, i) => note(st(s), { at: i * 0.09, dur: 0.3, vol: 0.28, type: "triangle" }));
  },
  // Confirms the switch when sound is turned back on.
  toggle() {
    note(st(12), { dur: 0.1, vol: 0.2, type: "sine", partial: 0 });
  },
};
