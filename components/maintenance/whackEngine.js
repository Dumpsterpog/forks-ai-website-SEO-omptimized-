// The rules of "Shoo Miso", the maintenance page's game, kept apart from
// the drawing so they can be tested.
//
// Nine server bays. Things pop out of them for a moment:
//   miso    Miso chewing a cable. Tap him away for points; if he gets away
//           with it, the bay's light goes red and your combo resets.
//   card    a golden flashcard. Bonus points.
//   spark   a live plug. Do not touch: it costs a life.
// The round lasts ROUND_SECONDS or until the lives run out, and everything
// speeds up as it goes.

export const BAYS = 9;
export const ROUND_SECONDS = 45;
export const LIVES = 3;

export function newGame(now = 0) {
  return {
    phase: "ready", // ready | playing | over
    startedAt: now,
    endsAt: now + ROUND_SECONDS * 1000,
    bays: Array(BAYS).fill(null),
    nextSpawn: now + 500,
    score: 0,
    combo: 0,
    bestCombo: 0,
    lives: LIVES,
    shooed: 0,
    escaped: 0,
    seq: 0,
    events: [], // what happened this tick, for the screen to react to
  };
}

export function startGame(now) {
  return { ...newGame(now), phase: "playing" };
}

// How far through the round, 0 to 1.
const progress = (g, now) => Math.min(1, Math.max(0, (now - g.startedAt) / (ROUND_SECONDS * 1000)));

function pickKind(random) {
  const r = random();
  if (r < 0.12) return "card";
  if (r < 0.27) return "spark";
  return "miso";
}

export function tick(g, now, random = Math.random) {
  if (g.phase !== "playing") return g;
  const events = [];
  const bays = g.bays.slice();
  let { combo, escaped } = g;
  const p = progress(g, now);

  // Whatever has been up too long goes back down.
  for (let i = 0; i < bays.length; i += 1) {
    const b = bays[i];
    if (!b || b.hit || now < b.until) continue;
    if (b.kind === "miso") {
      combo = 0;
      escaped += 1;
      events.push({ type: "escaped", bay: i });
    }
    bays[i] = null;
  }
  // Hit ones leave after their little reaction.
  for (let i = 0; i < bays.length; i += 1) {
    if (bays[i]?.hit && now > bays[i].hitAt + 450) bays[i] = null;
  }

  let { nextSpawn, seq } = g;
  if (now >= nextSpawn) {
    const free = bays.map((b, i) => (b ? -1 : i)).filter((i) => i >= 0);
    // Later in the round, sometimes two at once.
    const count = Math.min(free.length, p > 0.45 && random() < 0.35 ? 2 : 1);
    for (let n = 0; n < count; n += 1) {
      const k = Math.floor(random() * free.length);
      const bay = free.splice(k, 1)[0];
      const kind = pickKind(random);
      const stay = (kind === "card" ? 800 : 1350) - p * 600;
      seq += 1;
      bays[bay] = { id: seq, kind, until: now + stay, hit: false, hitAt: 0 };
    }
    nextSpawn = now + (950 - p * 550) * (0.75 + random() * 0.5);
  }

  const over = now >= g.endsAt || g.lives <= 0;
  return { ...g, bays, combo, escaped, nextSpawn, seq, events, phase: over ? "over" : "playing" };
}

export function tapBay(g, bay, now) {
  if (g.phase !== "playing") return g;
  const b = g.bays[bay];
  if (!b || b.hit) return { ...g, events: [{ type: "empty", bay }] };
  const bays = g.bays.slice();
  bays[bay] = { ...b, hit: true, hitAt: now };
  if (b.kind === "spark") {
    const lives = g.lives - 1;
    return { ...g, bays, lives, combo: 0, events: [{ type: "zap", bay }], phase: lives <= 0 ? "over" : g.phase };
  }
  const combo = g.combo + 1;
  const mult = 1 + Math.floor(combo / 5);
  const points = (b.kind === "card" ? 30 : 10) * mult;
  return {
    ...g,
    bays,
    combo,
    bestCombo: Math.max(g.bestCombo, combo),
    score: g.score + points,
    shooed: g.shooed + (b.kind === "miso" ? 1 : 0),
    events: [{ type: b.kind === "card" ? "card" : "shoo", bay, points, combo }],
  };
}

export const secondsLeft = (g, now) => Math.max(0, Math.ceil((g.endsAt - now) / 1000));
