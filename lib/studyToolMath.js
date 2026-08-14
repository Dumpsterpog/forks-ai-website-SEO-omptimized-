// Pure arithmetic for the free student calculators (attendance, final grade,
// CGPA conversion). Every function here is deterministic and runs in the
// browser. No fetch, no API route, no AI. Keep it that way: these pages are
// meant to cost the same at one visitor as at a hundred thousand.

// Percentages are compared with a tolerance so that a value that is exactly on
// the threshold in real maths is not pushed under it by binary floating point.
// 75/100 * 40 === 30 holds, but plenty of neighbouring cases do not.
const EPS = 1e-9;

const num = (v) => {
  if (v === "" || v === null || v === undefined) return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
};

/**
 * Attendance, answered in both directions from one set of inputs.
 *
 *   canSkip:    largest s where attended / (held + s) >= threshold
 *               solving for s gives s <= (100 * attended) / threshold - held
 *   mustAttend: smallest n where (attended + n) / (held + n) >= threshold
 *               solving for n gives n >= (threshold * held - 100 * attended)
 *                                       / (100 - threshold)
 *
 * "How many can I skip" is only meaningful when you are currently at or above
 * the threshold, and "how many must I attend" is only meaningful when you are
 * below it, so exactly one of the two is ever the live answer.
 */
export function calcAttendance(attendedInput, heldInput, thresholdInput) {
  const attended = num(attendedInput);
  const held = num(heldInput);
  const threshold = num(thresholdInput);

  if (Number.isNaN(attended) || Number.isNaN(held) || Number.isNaN(threshold)) {
    return { ok: false, reason: "incomplete" };
  }
  if (held <= 0) return { ok: false, reason: "held" };
  if (attended < 0 || attended > held) return { ok: false, reason: "attended" };
  if (threshold <= 0 || threshold > 100) return { ok: false, reason: "threshold" };

  const current = (attended / held) * 100;
  const meets = current + EPS >= threshold;

  let canSkip = 0;
  if (meets) {
    canSkip = Math.max(0, Math.floor((100 * attended) / threshold - held + EPS));
  }

  let mustAttend = 0;
  let reachable = true;
  if (!meets) {
    if (threshold >= 100 - EPS) {
      // At a 100% requirement a single missed class can never be undone.
      reachable = false;
    } else {
      mustAttend = Math.max(
        0,
        Math.ceil((threshold * held - 100 * attended) / (100 - threshold) - EPS)
      );
    }
  }

  return {
    ok: true,
    attended,
    held,
    threshold,
    current,
    meets,
    canSkip,
    mustAttend,
    reachable,
    // Where you land if you take the full allowance / do the full catch-up.
    percentAfterSkipping: (attended / (held + canSkip)) * 100,
    percentAfterAttending:
      ((attended + mustAttend) / (held + mustAttend)) * 100,
    // The classes you must not miss to keep the current run legal.
    missedSoFar: held - attended,
  };
}

/**
 * Final exam score needed to land on a target overall grade.
 *
 *   overall = current * (1 - weight) + final * weight
 *   final   = (target - current * (1 - weight)) / weight
 *
 * The honest part is what surrounds that number: the best grade still
 * reachable (scoring 100 on the final) and the worst grade already locked in
 * (scoring 0 on the final).
 */
export function calcFinalGrade(currentInput, weightInput, targetInput) {
  const current = num(currentInput);
  const weight = num(weightInput);
  const target = num(targetInput);

  if (Number.isNaN(current) || Number.isNaN(weight) || Number.isNaN(target)) {
    return { ok: false, reason: "incomplete" };
  }
  if (current < 0 || current > 100) return { ok: false, reason: "current" };
  if (weight <= 0 || weight > 100) return { ok: false, reason: "weight" };
  if (target < 0 || target > 100) return { ok: false, reason: "target" };

  const w = weight / 100;
  const carried = current * (1 - w);
  const required = (target - carried) / w;
  const maxPossible = carried + 100 * w;
  const minGuaranteed = carried;

  let status = "possible";
  if (required <= EPS) status = "secured";
  else if (required > 100 + EPS) status = "impossible";

  return {
    ok: true,
    current,
    weight,
    target,
    required,
    // Clamped copy for display: a needed score is never below 0 or above 100.
    requiredClamped: Math.min(100, Math.max(0, required)),
    maxPossible,
    minGuaranteed,
    status,
    // Highest target that is still reachable, for the impossible case.
    bestReachable: maxPossible,
  };
}

// The 10-point CGPA rules that Indian institutions actually use. There is no
// single national formula, which is exactly why the page names the rule it
// applied instead of printing a bare number.
export const CGPA_RULES = [
  {
    id: "x9.5",
    label: "CGPA x 9.5",
    formula: "Percentage = CGPA x 9.5",
    inverse: "CGPA = Percentage / 9.5",
    note: "The CBSE convention, and the one most Indian universities and recruiters expect.",
    toPercent: (c) => c * 9.5,
    fromPercent: (p) => p / 9.5,
  },
  {
    id: "x10",
    label: "CGPA x 10",
    formula: "Percentage = CGPA x 10",
    inverse: "CGPA = Percentage / 10",
    note: "A straight decimal shift. Used by institutions that treat the grade point as a percentage band directly.",
    toPercent: (c) => c * 10,
    fromPercent: (p) => p / 10,
  },
  {
    id: "minus0.5",
    label: "(CGPA - 0.5) x 10",
    formula: "Percentage = (CGPA - 0.5) x 10",
    inverse: "CGPA = (Percentage / 10) + 0.5",
    note: "A deduction rule used by some universities. Check your own academic regulations before quoting it.",
    toPercent: (c) => (c - 0.5) * 10,
    fromPercent: (p) => p / 10 + 0.5,
  },
  {
    id: "minus0.75",
    label: "(CGPA - 0.75) x 10",
    formula: "Percentage = (CGPA - 0.75) x 10",
    inverse: "CGPA = (Percentage / 10) + 0.75",
    note: "A larger deduction used by some universities. Again, your own regulations decide.",
    toPercent: (c) => (c - 0.75) * 10,
    fromPercent: (p) => p / 10 + 0.75,
  },
];

export const GPA4_RULE = {
  formula: "Percentage = GPA / 4 x 100, which is GPA x 25",
  inverse: "GPA = Percentage / 25",
};

export const SCALES = {
  cgpa10: { id: "cgpa10", label: "CGPA (10-point)", min: 0, max: 10, step: 0.01 },
  gpa4: { id: "gpa4", label: "GPA (4-point)", min: 0, max: 4, step: 0.01 },
  percent: { id: "percent", label: "Percentage", min: 0, max: 100, step: 0.01 },
};

export function getCgpaRule(ruleId) {
  return CGPA_RULES.find((r) => r.id === ruleId) || CGPA_RULES[0];
}

/**
 * Convert between a 10-point CGPA, a 4-point GPA and a percentage.
 *
 * Percentage is the pivot: every conversion goes source -> percentage ->
 * target, so a CGPA to GPA conversion is honest about the fact that it is two
 * institutional conventions stacked, not one exact mapping.
 */
export function convertGrade(valueInput, from, to, ruleId) {
  const value = num(valueInput);
  const rule = getCgpaRule(ruleId);

  if (Number.isNaN(value)) return { ok: false, reason: "incomplete" };

  const fromScale = SCALES[from];
  const toScale = SCALES[to];
  if (!fromScale || !toScale) return { ok: false, reason: "scale" };
  if (value < fromScale.min || value > fromScale.max) {
    return { ok: false, reason: "range", scale: fromScale };
  }

  let percent;
  if (from === "percent") percent = value;
  else if (from === "cgpa10") percent = rule.toPercent(value);
  else percent = value * 25;

  let result;
  if (to === "percent") result = percent;
  else if (to === "cgpa10") result = rule.fromPercent(percent);
  else result = percent / 25;

  const steps = [];
  if (from !== "percent") {
    steps.push(from === "cgpa10" ? rule.formula : GPA4_RULE.formula);
  }
  if (to !== "percent") {
    steps.push(to === "cgpa10" ? rule.inverse : GPA4_RULE.inverse);
  }
  if (steps.length === 0) steps.push("Percentage is already the target scale, so nothing is converted.");

  return {
    ok: true,
    value,
    percent,
    result,
    from,
    to,
    rule,
    steps,
    // A rule with a deduction can push a low CGPA below zero, and a high
    // percentage back above the top of a scale. Say so rather than printing it.
    outOfRange: result < toScale.min - EPS || result > toScale.max + EPS,
    toScale,
    fromScale,
  };
}

// Trims trailing zeros so 80.75 stays 80.75 and 80.00 becomes 80.
export function round(value, places = 2) {
  if (!Number.isFinite(value)) return "";
  const factor = 10 ** places;
  const rounded = Math.round(value * factor) / factor;
  return String(rounded);
}

export function plural(count, singular, pluralWord) {
  return count === 1 ? singular : pluralWord || `${singular}s`;
}
