// Pure arithmetic for the six everyday calculators (age, percentage, marks
// percentage, SGPA to CGPA, negative marking). Every function here is
// deterministic and runs in the browser. No fetch, no API route, no AI. Keep
// it that way: these pages cost the same at one visitor as at a hundred
// thousand.

// Comparisons use a tolerance so a value that sits exactly on a boundary in
// real maths is not pushed across it by binary floating point.
const EPS = 1e-9;

export function num(v) {
  if (v === "" || v === null || v === undefined) return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

// Round for display. Number() on the fixed string drops trailing zeros, so
// 80.750 prints as 80.75 and 75.00 prints as 75.
export function round(value, places = 2) {
  if (!Number.isFinite(value)) return "";
  return String(Number(value.toFixed(places)));
}

// Keep a fixed count of significant digits rather than decimal places, which
// is what a converted measurement needs: 0.0000254 and 25400 both stay useful.
export function formatSignificant(value, sig = 8) {
  if (!Number.isFinite(value)) return "";
  if (value === 0) return "0";
  const abs = Math.abs(value);
  if (abs >= 1e15 || abs < 1e-9) return value.toExponential(4);
  const decimals = Math.max(0, Math.min(20, sig - 1 - Math.floor(Math.log10(abs))));
  return String(Number(value.toFixed(decimals)));
}

export function plural(n, one, many) {
  return Math.abs(n) === 1 ? one : many;
}

export function withCommas(value) {
  if (!Number.isFinite(value)) return "";
  return value.toLocaleString("en-US");
}

/* ---------------------------------------------------------------- age ---- */

export function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

const MONTH_LENGTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// Month is 1 to 12. Computed from the leap rule rather than from a Date so
// there is no timezone or two-digit-year behaviour to trip over.
export function daysInMonth(year, month) {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return MONTH_LENGTHS[month - 1];
}

// "YYYY-MM-DD", the value an <input type="date"> gives you.
export function parseDateInput(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  if (m < 1 || m > 12) return null;
  if (d < 1 || d > daysInMonth(y, m)) return null;
  return { y, m, d };
}

export function formatDateInput({ y, m, d }) {
  return [
    String(y).padStart(4, "0"),
    String(m).padStart(2, "0"),
    String(d).padStart(2, "0"),
  ].join("-");
}

function utcMs({ y, m, d }) {
  const dt = new Date(Date.UTC(2000, m - 1, d));
  dt.setUTCFullYear(y);
  return dt.getTime();
}

export function compareDates(a, b) {
  if (a.y !== b.y) return a.y < b.y ? -1 : 1;
  if (a.m !== b.m) return a.m < b.m ? -1 : 1;
  if (a.d !== b.d) return a.d < b.d ? -1 : 1;
  return 0;
}

// Whole days between two calendar dates. Both are midnight UTC, so the
// division is exact and daylight saving never enters the picture.
export function daysBetween(a, b) {
  return Math.round((utcMs(b) - utcMs(a)) / 86400000);
}

/**
 * Add whole months, clamping the day to the length of the month you land in.
 * This is the rule that makes 31 January plus one month land on 28 or 29
 * February, and it is where most age calculators go subtly wrong.
 */
export function addMonths({ y, m, d }, n) {
  const total = y * 12 + (m - 1) + n;
  const ny = Math.floor(total / 12);
  const nm = total - ny * 12 + 1;
  return { y: ny, m: nm, d: Math.min(d, daysInMonth(ny, nm)) };
}

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function weekdayOf(date) {
  return WEEKDAYS[new Date(utcMs(date)).getUTCDay()];
}

export function longDate({ y, m, d }) {
  return d + " " + MONTH_NAMES[m - 1] + " " + y;
}

/**
 * Exact age between two calendar dates.
 *
 * Rather than subtracting the three fields and patching up the borrows, which
 * is what produces negative day counts around short months, this counts whole
 * months first: find the largest n where the birth date plus n months is still
 * on or before the target date, then the leftover is a plain day difference
 * from that anchor. Clamped month addition makes every case fall out
 * correctly, including 31 January to 1 March and a 29 February birthday.
 */
export function calcAge(birthInput, targetInput) {
  const birth = parseDateInput(birthInput);
  const target = parseDateInput(targetInput);

  if (!birth || !target) return { ok: false, reason: "incomplete" };
  if (compareDates(birth, target) > 0) return { ok: false, reason: "future" };

  let months = (target.y - birth.y) * 12 + (target.m - birth.m);
  while (months > 0 && compareDates(addMonths(birth, months), target) > 0) months -= 1;
  while (compareDates(addMonths(birth, months + 1), target) <= 0) months += 1;

  const anchor = addMonths(birth, months);
  const days = daysBetween(anchor, target);
  const years = Math.floor(months / 12);

  const totalDays = daysBetween(birth, target);
  const totalWeeks = Math.floor(totalDays / 7);

  // The birthday in the target year, with 29 February clamped to the 28th in a
  // year that has no 29th. That clamp is a convention, so the page says so.
  const thisYearBirthday = {
    y: target.y,
    m: birth.m,
    d: Math.min(birth.d, daysInMonth(target.y, birth.m)),
  };
  const isBirthdayToday = compareDates(thisYearBirthday, target) === 0;

  let nextBirthday = thisYearBirthday;
  if (compareDates(nextBirthday, target) <= 0) {
    nextBirthday = {
      y: target.y + 1,
      m: birth.m,
      d: Math.min(birth.d, daysInMonth(target.y + 1, birth.m)),
    };
  }

  return {
    ok: true,
    birth,
    target,
    years,
    months: months % 12,
    days,
    totalMonths: months,
    totalDays,
    totalWeeks,
    weekRemainder: totalDays % 7,
    totalHours: totalDays * 24,
    totalMinutes: totalDays * 1440,
    bornOn: weekdayOf(birth),
    isBirthdayToday,
    nextBirthday,
    nextBirthdayWeekday: weekdayOf(nextBirthday),
    daysToNextBirthday: daysBetween(target, nextBirthday),
    turningAge: years + 1,
    leapBirthday: birth.m === 2 && birth.d === 29,
    birthdayClamped: nextBirthday.d !== birth.d,
  };
}

/* -------------------------------------------------------- percentage ---- */

// What percent is X of Y.
export function calcPercentOf(xInput, yInput) {
  const x = num(xInput);
  const y = num(yInput);
  if (Number.isNaN(x) || Number.isNaN(y)) return { ok: false, reason: "incomplete" };
  if (y === 0) return { ok: false, reason: "zero-whole" };
  return { ok: true, x, y, percent: (x / y) * 100 };
}

// What is X percent of Y.
export function calcPercentValue(percentInput, yInput) {
  const percent = num(percentInput);
  const y = num(yInput);
  if (Number.isNaN(percent) || Number.isNaN(y)) return { ok: false, reason: "incomplete" };
  const value = (percent / 100) * y;
  return { ok: true, percent, y, value, remainder: y - value };
}

/**
 * Percent change from one number to another.
 *
 * The denominator is the absolute value of the starting number so a move from
 * -50 to -25 reads as a 50% increase rather than a 50% decrease. A start of
 * zero has no percent change at all: any rise from nothing is a division by
 * zero, so the tool says so instead of printing Infinity.
 */
export function calcPercentChange(fromInput, toInput) {
  const from = num(fromInput);
  const to = num(toInput);
  if (Number.isNaN(from) || Number.isNaN(to)) return { ok: false, reason: "incomplete" };
  const difference = to - from;
  if (from === 0) return { ok: false, reason: "zero-start", from, to, difference };
  const change = (difference / Math.abs(from)) * 100;
  return {
    ok: true,
    from,
    to,
    difference,
    change,
    direction: Math.abs(change) < EPS ? "same" : change > 0 ? "increase" : "decrease",
  };
}

/* ------------------------------------------------------- marks total ---- */

/**
 * Total, percentage and a per-subject breakdown, with each subject carrying
 * its own maximum. Rows that are not filled in yet are ignored rather than
 * treated as zeros, so the running total stays right while you are typing.
 */
export function calcMarks(rows) {
  const parsed = rows.map((row, index) => {
    const obtained = num(row.obtained);
    const max = num(row.max);
    const filled = !Number.isNaN(obtained) && !Number.isNaN(max);
    return {
      index,
      name: (row.name || "").trim() || "Subject " + (index + 1),
      obtained,
      max,
      filled,
      valid: filled && max > 0 && obtained >= 0 && obtained <= max,
      percent: filled && max > 0 ? (obtained / max) * 100 : NaN,
    };
  });

  const counted = parsed.filter((row) => row.valid);
  const problems = parsed.filter((row) => row.filled && !row.valid);

  if (!counted.length) {
    return {
      ok: false,
      reason: problems.length ? "invalid" : "empty",
      rows: parsed,
      problems,
    };
  }

  const totalObtained = counted.reduce((sum, row) => sum + row.obtained, 0);
  const totalMax = counted.reduce((sum, row) => sum + row.max, 0);
  const sorted = [...counted].sort((a, b) => b.percent - a.percent);

  return {
    ok: true,
    rows: parsed,
    counted,
    problems,
    subjects: counted.length,
    totalObtained,
    totalMax,
    percent: (totalObtained / totalMax) * 100,
    best: sorted[0],
    worst: sorted[sorted.length - 1],
  };
}

/* ---------------------------------------------------- SGPA and CGPA ---- */

/**
 * Credit-weighted CGPA across semesters:
 *
 *   CGPA = sum(SGPA of a semester x credits of that semester) / sum(credits)
 *
 * Weighting by credits is the part people skip. A plain average of the SGPAs
 * is only the same number when every semester carries identical credits.
 */
export function calcCgpa(rows, scale = 10) {
  const parsed = rows.map((row, index) => {
    const sgpa = num(row.sgpa);
    const credits = num(row.credits);
    const filled = !Number.isNaN(sgpa) && !Number.isNaN(credits);
    return {
      index,
      label: (row.label || "").trim() || "Semester " + (index + 1),
      sgpa,
      credits,
      filled,
      valid: filled && credits > 0 && sgpa >= 0 && sgpa <= scale,
      points: filled ? sgpa * credits : NaN,
    };
  });

  const counted = parsed.filter((row) => row.valid);
  const problems = parsed.filter((row) => row.filled && !row.valid);

  if (!counted.length) {
    return {
      ok: false,
      reason: problems.length ? "invalid" : "empty",
      rows: parsed,
      problems,
    };
  }

  const totalCredits = counted.reduce((sum, row) => sum + row.credits, 0);
  const totalPoints = counted.reduce((sum, row) => sum + row.points, 0);
  const cgpa = totalPoints / totalCredits;
  const plainAverage = counted.reduce((sum, row) => sum + row.sgpa, 0) / counted.length;

  return {
    ok: true,
    rows: parsed,
    counted,
    problems,
    semesters: counted.length,
    totalCredits,
    totalPoints,
    cgpa,
    plainAverage,
    weightingMatters: Math.abs(cgpa - plainAverage) > 0.005,
    scale,
  };
}

/**
 * The reverse question: given where you stand, what does the rest of the
 * degree have to average to finish on a target CGPA.
 *
 *   required = (target x total credits - current CGPA x credits done)
 *              / credits remaining
 */
export function calcRequiredSgpa({
  currentCgpa,
  doneCredits,
  remainingCredits,
  targetCgpa,
  scale = 10,
}) {
  const current = num(currentCgpa);
  const done = num(doneCredits);
  const remaining = num(remainingCredits);
  const target = num(targetCgpa);

  if ([current, done, remaining, target].some(Number.isNaN)) {
    return { ok: false, reason: "incomplete" };
  }
  if (done <= 0) return { ok: false, reason: "done" };
  if (remaining <= 0) return { ok: false, reason: "remaining" };
  if (current < 0 || current > scale) return { ok: false, reason: "current" };
  if (target < 0 || target > scale) return { ok: false, reason: "target" };

  const totalCredits = done + remaining;
  const required = (target * totalCredits - current * done) / remaining;

  return {
    ok: true,
    current,
    done,
    remaining,
    target,
    totalCredits,
    required,
    scale,
    alreadyThere: required <= EPS,
    reachable: required <= scale + EPS,
    // The best CGPA still available if every remaining credit scores full marks.
    ceiling: (current * done + scale * remaining) / totalCredits,
  };
}

/* -------------------------------------------------- negative marking ---- */

/**
 * Projected score under a scheme that takes marks away for wrong answers.
 *
 *   score = correct x marks per correct - wrong x penalty per wrong
 *
 * The break-even accuracy is the share of guesses you would have to get right
 * for guessing to be worth nothing either way, which falls straight out of
 * a x perCorrect = (1 - a) x penalty.
 */
export function calcNegativeMarking({ total, attempted, correct, perCorrect, penalty }) {
  const totalQ = num(total);
  const attemptedQ = num(attempted);
  const correctQ = num(correct);
  const marks = num(perCorrect);
  const minus = num(penalty);

  if ([totalQ, attemptedQ, correctQ, marks, minus].some(Number.isNaN)) {
    return { ok: false, reason: "incomplete" };
  }
  if (totalQ < 1) return { ok: false, reason: "total" };
  if (attemptedQ < 0 || attemptedQ > totalQ) return { ok: false, reason: "attempted" };
  if (correctQ < 0 || correctQ > attemptedQ) return { ok: false, reason: "correct" };
  if (marks <= 0) return { ok: false, reason: "per-correct" };
  if (minus < 0) return { ok: false, reason: "penalty" };

  const wrong = attemptedQ - correctQ;
  const earned = correctQ * marks;
  const lost = wrong * minus;
  const score = earned - lost;
  const maxScore = totalQ * marks;

  return {
    ok: true,
    total: totalQ,
    attempted: attemptedQ,
    correct: correctQ,
    wrong,
    unattempted: totalQ - attemptedQ,
    perCorrect: marks,
    penalty: minus,
    earned,
    lost,
    score,
    maxScore,
    scorePercent: (score / maxScore) * 100,
    accuracy: attemptedQ > 0 ? (correctQ / attemptedQ) * 100 : 0,
    attemptRate: (attemptedQ / totalQ) * 100,
    negative: score < 0,
    breakEvenAccuracy: minus > 0 ? (minus / (marks + minus)) * 100 : 0,
    // What the same paper would have scored with no penalty applied.
    scoreWithoutPenalty: earned,
  };
}
