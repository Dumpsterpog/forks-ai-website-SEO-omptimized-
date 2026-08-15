// Line and word diff, written by hand so the page needs no dependency and no
// server. The line pass is a real longest common subsequence, which is what
// makes an inserted line show up as one insert rather than shifting every line
// below it into a false "changed".
//
// Plain module, no browser APIs, so the server page.js files can import it too.

// 4M Uint32 cells, about 16 MB, which is the point where a DP matrix stops
// being polite on a phone.
const MAX_CELLS = 4000000;

export function splitLines(text) {
  if (text === "") return [];
  // Normalise CRLF so a file saved on Windows does not read as every line changed.
  return text.replace(/\r\n?/g, "\n").split("\n");
}

// The comparison key, which is what the options act on. The original line is
// always what gets displayed, so ignoring case never rewrites your text.
function lineKey(line, options) {
  let key = line;
  if (options.ignoreWhitespace) key = key.trim().replace(/\s+/g, " ");
  if (options.ignoreCase) key = key.toLowerCase();
  return key;
}

// Straight LCS over two ranges of keys, pushing ops in order.
function lcsOps(aKeys, bKeys, aStart, bStart, aEnd, bEnd, out) {
  const n = aEnd - aStart;
  const m = bEnd - bStart;
  const width = m + 1;
  const dp = new Uint32Array((n + 1) * width);

  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i * width + j] =
        aKeys[aStart + i] === bKeys[bStart + j]
          ? dp[(i + 1) * width + j + 1] + 1
          : Math.max(dp[(i + 1) * width + j], dp[i * width + j + 1]);
    }
  }

  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (aKeys[aStart + i] === bKeys[bStart + j]) {
      out.push({ type: "equal", a: aStart + i, b: bStart + j });
      i++;
      j++;
    } else if (dp[(i + 1) * width + j] >= dp[i * width + j + 1]) {
      out.push({ type: "delete", a: aStart + i, b: -1 });
      i++;
    } else {
      out.push({ type: "insert", a: -1, b: bStart + j });
      j++;
    }
  }
  while (i < n) {
    out.push({ type: "delete", a: aStart + i, b: -1 });
    i++;
  }
  while (j < m) {
    out.push({ type: "insert", a: -1, b: bStart + j });
    j++;
  }
}

// A line that appears exactly once on each side and is identical on both is a
// safe place to cut, because no correct diff would pair it with anything else.
// Used to keep the matrix small on very large inputs.
function findAnchor(aKeys, bKeys, aStart, bStart, aEnd, bEnd) {
  const countA = new Map();
  for (let i = aStart; i < aEnd; i++) countA.set(aKeys[i], (countA.get(aKeys[i]) || 0) + 1);
  const countB = new Map();
  for (let j = bStart; j < bEnd; j++) countB.set(bKeys[j], (countB.get(bKeys[j]) || 0) + 1);

  const midA = (aStart + aEnd) / 2;
  let best = null;
  let bestDistance = Infinity;
  for (let i = aStart; i < aEnd; i++) {
    const key = aKeys[i];
    if (countA.get(key) !== 1 || countB.get(key) !== 1) continue;
    const distance = Math.abs(i - midA);
    if (distance >= bestDistance) continue;
    let j = bStart;
    while (j < bEnd && bKeys[j] !== key) j++;
    if (j < bEnd) {
      best = { a: i, b: j };
      bestDistance = distance;
    }
  }
  return best;
}

function diffRange(aKeys, bKeys, aStart, bStart, aEnd, bEnd, out) {
  if (aStart >= aEnd && bStart >= bEnd) return;
  if (aStart >= aEnd) {
    for (let j = bStart; j < bEnd; j++) out.push({ type: "insert", a: -1, b: j });
    return;
  }
  if (bStart >= bEnd) {
    for (let i = aStart; i < aEnd; i++) out.push({ type: "delete", a: i, b: -1 });
    return;
  }

  if ((aEnd - aStart) * (bEnd - bStart) > MAX_CELLS) {
    const anchor = findAnchor(aKeys, bKeys, aStart, bStart, aEnd, bEnd);
    if (anchor) {
      diffRange(aKeys, bKeys, aStart, bStart, anchor.a, anchor.b, out);
      out.push({ type: "equal", a: anchor.a, b: anchor.b });
      diffRange(aKeys, bKeys, anchor.a + 1, anchor.b + 1, aEnd, bEnd, out);
      return;
    }
    // No unique shared line to cut on, so report the block as a wholesale
    // replacement rather than allocating a matrix that would crash the tab.
    for (let i = aStart; i < aEnd; i++) out.push({ type: "delete", a: i, b: -1 });
    for (let j = bStart; j < bEnd; j++) out.push({ type: "insert", a: -1, b: j });
    return;
  }

  lcsOps(aKeys, bKeys, aStart, bStart, aEnd, bEnd, out);
}

export function diffLineOps(aLines, bLines, options = {}) {
  const aKeys = aLines.map((line) => lineKey(line, options));
  const bKeys = bLines.map((line) => lineKey(line, options));

  // Identical heads and tails are the common case in an edited document, and
  // trimming them leaves only the part that actually changed for the matrix.
  let start = 0;
  while (start < aKeys.length && start < bKeys.length && aKeys[start] === bKeys[start]) start++;
  let endA = aKeys.length;
  let endB = bKeys.length;
  while (endA > start && endB > start && aKeys[endA - 1] === bKeys[endB - 1]) {
    endA--;
    endB--;
  }

  const ops = [];
  for (let i = 0; i < start; i++) ops.push({ type: "equal", a: i, b: i });
  diffRange(aKeys, bKeys, start, start, endA, endB, ops);
  for (let k = 0; k < aKeys.length - endA; k++) {
    ops.push({ type: "equal", a: endA + k, b: endB + k });
  }
  return ops;
}

// Word level diff inside a changed line. Whitespace is its own token so the
// rebuilt line still reads normally.
function tokenize(line) {
  return line.split(/(\s+)/).filter((part) => part !== "");
}

function pushSegment(list, type, text) {
  const last = list[list.length - 1];
  if (last && last.type === type) last.text += text;
  else list.push({ type, text });
}

export function diffWords(aLine, bLine) {
  const a = tokenize(aLine);
  const b = tokenize(bLine);
  if (a.length * b.length > MAX_CELLS) {
    return {
      left: aLine ? [{ type: "delete", text: aLine }] : [],
      right: bLine ? [{ type: "insert", text: bLine }] : [],
    };
  }

  const ops = [];
  lcsOps(a, b, 0, 0, a.length, b.length, ops);

  const left = [];
  const right = [];
  for (const op of ops) {
    if (op.type === "equal") {
      pushSegment(left, "equal", a[op.a]);
      pushSegment(right, "equal", b[op.b]);
    } else if (op.type === "delete") {
      pushSegment(left, "delete", a[op.a]);
    } else {
      pushSegment(right, "insert", b[op.b]);
    }
  }
  return { left, right };
}

/**
 * Turns the raw ops into rows for the side by side view. A run of deleted lines
 * immediately followed by inserted ones is paired off into changed rows, which
 * is what people mean when they say a line was edited.
 */
export function buildDiffRows(aLines, bLines, options = {}) {
  const ops = diffLineOps(aLines, bLines, options);
  const rows = [];
  let i = 0;

  while (i < ops.length) {
    if (ops[i].type === "equal") {
      const op = ops[i];
      rows.push({
        type: "equal",
        aNumber: op.a + 1,
        bNumber: op.b + 1,
        aText: aLines[op.a],
        bText: bLines[op.b],
      });
      i++;
      continue;
    }

    const deletes = [];
    const inserts = [];
    while (i < ops.length && ops[i].type !== "equal") {
      if (ops[i].type === "delete") deletes.push(ops[i].a);
      else inserts.push(ops[i].b);
      i++;
    }

    const paired = Math.min(deletes.length, inserts.length);
    for (let k = 0; k < paired; k++) {
      const aText = aLines[deletes[k]];
      const bText = bLines[inserts[k]];
      rows.push({
        type: "changed",
        aNumber: deletes[k] + 1,
        bNumber: inserts[k] + 1,
        aText,
        bText,
        words: diffWords(aText, bText),
      });
    }
    for (let k = paired; k < deletes.length; k++) {
      rows.push({
        type: "removed",
        aNumber: deletes[k] + 1,
        bNumber: null,
        aText: aLines[deletes[k]],
        bText: null,
      });
    }
    for (let k = paired; k < inserts.length; k++) {
      rows.push({
        type: "added",
        aNumber: null,
        bNumber: inserts[k] + 1,
        aText: null,
        bText: bLines[inserts[k]],
      });
    }
  }

  return rows;
}

export function diffSummary(rows) {
  let added = 0;
  let removed = 0;
  let changed = 0;
  let unchanged = 0;
  for (const row of rows) {
    if (row.type === "added") added++;
    else if (row.type === "removed") removed++;
    else if (row.type === "changed") changed++;
    else unchanged++;
  }
  return { added, removed, changed, unchanged, total: rows.length };
}

// The unified view: one column, removals then additions, the way a patch reads.
export function toUnifiedRows(rows) {
  const out = [];
  for (const row of rows) {
    if (row.type === "equal") {
      out.push({ sign: " ", type: "equal", aNumber: row.aNumber, bNumber: row.bNumber, text: row.aText });
    } else if (row.type === "removed") {
      out.push({ sign: "-", type: "removed", aNumber: row.aNumber, bNumber: null, text: row.aText });
    } else if (row.type === "added") {
      out.push({ sign: "+", type: "added", aNumber: null, bNumber: row.bNumber, text: row.bText });
    } else {
      out.push({
        sign: "-",
        type: "removed",
        aNumber: row.aNumber,
        bNumber: null,
        text: row.aText,
        words: row.words.left,
      });
      out.push({
        sign: "+",
        type: "added",
        aNumber: null,
        bNumber: row.bNumber,
        text: row.bText,
        words: row.words.right,
      });
    }
  }
  return out;
}
