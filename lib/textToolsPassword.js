// Password generation and entropy maths. Every random value comes from
// crypto.getRandomValues, which is the browser's cryptographically secure
// generator. Math.random is not used anywhere in this file and must not be:
// it is a fast statistical generator with a predictable internal state, which
// is fine for animations and useless for secrets.

export const CHARSETS = {
  lowercase: { label: "Lowercase letters", sample: "a to z", chars: "abcdefghijklmnopqrstuvwxyz" },
  uppercase: { label: "Uppercase letters", sample: "A to Z", chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ" },
  digits: { label: "Digits", sample: "0 to 9", chars: "0123456789" },
  symbols: { label: "Symbols", sample: "!@#$% and more", chars: "!@#$%^&*()-_=+[]{};:,.<>?/~" },
};

// Characters that are easy to misread on a printed card or in a terminal font.
export const AMBIGUOUS = "Il1|oO0`'\"{}[]";

export const MIN_LENGTH = 4;
export const MAX_LENGTH = 128;

export function buildPool(selected, excludeAmbiguous) {
  let pool = "";
  for (const key of Object.keys(CHARSETS)) {
    if (selected[key]) pool += CHARSETS[key].chars;
  }
  if (excludeAmbiguous) {
    pool = pool
      .split("")
      .filter((char) => !AMBIGUOUS.includes(char))
      .join("");
  }
  return pool;
}

/**
 * A uniform integer in [0, max). Taking the remainder of a raw 32 bit value
 * would bias the low end whenever max does not divide 2^32, so values in the
 * uneven tail are rejected and redrawn.
 */
function randomInt(max) {
  if (max <= 0) throw new Error("max must be positive");
  const range = 4294967296; // 2^32
  const limit = range - (range % max);
  const buffer = new Uint32Array(1);
  let value;
  do {
    crypto.getRandomValues(buffer);
    value = buffer[0];
  } while (value >= limit);
  return value % max;
}

// Fisher-Yates, drawing each swap index from the same secure source.
function shuffle(items) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    const temp = items[i];
    items[i] = items[j];
    items[j] = temp;
  }
  return items;
}

export function generatePassword({ length, selected, excludeAmbiguous, requireEach }) {
  const pool = buildPool(selected, excludeAmbiguous);
  if (pool.length === 0) return "";

  const chars = [];

  if (requireEach) {
    // One character from each chosen set first, so the password satisfies the
    // usual "must contain a digit" rule, then the rest drawn from the whole
    // pool and the lot shuffled so the guaranteed characters are not stuck at
    // the front.
    for (const key of Object.keys(CHARSETS)) {
      if (!selected[key]) continue;
      let set = CHARSETS[key].chars;
      if (excludeAmbiguous) {
        set = set
          .split("")
          .filter((char) => !AMBIGUOUS.includes(char))
          .join("");
      }
      if (set.length > 0 && chars.length < length) chars.push(set[randomInt(set.length)]);
    }
  }

  while (chars.length < length) {
    chars.push(pool[randomInt(pool.length)]);
  }

  return shuffle(chars).join("");
}

/**
 * Entropy of the generation process, not of the string. A password drawn
 * uniformly from a pool of P characters, L characters long, has L * log2(P)
 * bits, because there are P^L equally likely results. This is the honest number
 * to quote, unlike the coloured strength meters that score a password on
 * whether it contains a capital letter.
 */
export function entropyBits(poolSize, length) {
  if (poolSize < 2 || length < 1) return 0;
  return length * Math.log2(poolSize);
}

export const STRENGTH_BANDS = [
  { max: 40, label: "Too weak", note: "Fine for a throwaway login, not for anything you would miss." },
  { max: 60, label: "Weak", note: "Survives casual guessing, not a determined offline attack." },
  { max: 80, label: "Reasonable", note: "Sensible for an everyday account behind rate limiting." },
  { max: 100, label: "Strong", note: "Comfortable for a password manager entry or a work account." },
  { max: Infinity, label: "Very strong", note: "Overkill for most accounts, which is the right kind of overkill." },
];

export function strengthFor(bits) {
  return STRENGTH_BANDS.find((band) => bits < band.max) ?? STRENGTH_BANDS[STRENGTH_BANDS.length - 1];
}

// The assumption is stated on the page rather than hidden: an offline attacker
// against a fast hash, at 10^12 guesses per second, needing half the keyspace on
// average. Change the assumption and the number changes, which is exactly why
// the bits matter more than the time.
export const GUESSES_PER_SECOND = 1e12;

export function averageCrackSeconds(bits) {
  if (bits <= 0) return 0;
  // 2^(bits-1) average guesses, kept in log space so large exponents survive.
  return Math.pow(2, bits - 1) / GUESSES_PER_SECOND;
}

export function formatDuration(seconds) {
  if (!Number.isFinite(seconds)) return "longer than anyone will wait";
  if (seconds < 1) return "under a second";
  const units = [
    { name: "second", size: 1 },
    { name: "minute", size: 60 },
    { name: "hour", size: 3600 },
    { name: "day", size: 86400 },
    { name: "year", size: 31557600 },
  ];
  let chosen = units[0];
  for (const unit of units) {
    if (seconds >= unit.size) chosen = unit;
  }
  const value = seconds / chosen.size;
  if (chosen.name === "year" && value >= 1000) {
    if (value >= 1e15) return `${value.toExponential(1)} years`;
    return `${Math.round(value).toLocaleString("en-US")} years`;
  }
  const rounded = value >= 10 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded.toLocaleString("en-US")} ${chosen.name}${rounded === 1 ? "" : "s"}`;
}
