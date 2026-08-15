// A QR code encoder for /qr-code-generator, written against ISO/IEC 18004.
//
// Byte mode only, which covers every input a person types into a generator:
// URLs, text, wifi strings, vCards. Numeric and alphanumeric modes would pack
// digits and capitals slightly tighter, at the cost of a mode chooser that can
// pick wrong, so this trades a few modules for predictability.

export const ECC_LEVELS = [
  { id: "L", label: "L, about 7% recovery", bits: 1, recovery: "7%" },
  { id: "M", label: "M, about 15% recovery", bits: 0, recovery: "15%" },
  { id: "Q", label: "Q, about 25% recovery", bits: 3, recovery: "25%" },
  { id: "H", label: "H, about 30% recovery", bits: 2, recovery: "30%" },
];

// Error correction codewords per block, indexed by level then version.
// Straight out of the specification's table 13 to 22.
const ECC_CODEWORDS_PER_BLOCK = {
  L: [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  M: [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  Q: [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  H: [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
};

// Number of error correction blocks, indexed by level then version.
const NUM_ERROR_CORRECTION_BLOCKS = {
  L: [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  M: [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  Q: [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  H: [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
};

const MIN_VERSION = 1;
const MAX_VERSION = 40;

// Total data modules for a version, before error correction, function patterns
// and format information are taken out. Derived rather than tabulated.
function rawDataModules(version) {
  let result = (16 * version + 128) * version + 64;
  if (version >= 2) {
    const numAlign = Math.floor(version / 7) + 2;
    result -= (25 * numAlign - 10) * numAlign - 55;
    if (version >= 7) result -= 36;
  }
  return result;
}

function totalCodewords(version) {
  return Math.floor(rawDataModules(version) / 8);
}

function dataCodewords(version, ecl) {
  return (
    totalCodewords(version) -
    ECC_CODEWORDS_PER_BLOCK[ecl][version] * NUM_ERROR_CORRECTION_BLOCKS[ecl][version]
  );
}

function alignmentPatternPositions(version) {
  if (version === 1) return [];
  const size = version * 4 + 17;
  const numAlign = Math.floor(version / 7) + 2;
  const step = version === 32 ? 26 : Math.ceil((version * 4 + 4) / (numAlign * 2 - 2)) * 2;
  const positions = [6];
  for (let pos = size - 7; positions.length < numAlign; pos -= step) positions.splice(1, 0, pos);
  return positions;
}

// GF(256) arithmetic with the QR primitive polynomial x^8 + x^4 + x^3 + x^2 + 1.
function gfMultiply(a, b) {
  let result = 0;
  for (let i = 7; i >= 0; i -= 1) {
    result = (result << 1) ^ ((result >>> 7) * 0x11d);
    result ^= ((b >>> i) & 1) * a;
  }
  return result & 0xff;
}

function reedSolomonGenerator(degree) {
  const result = new Uint8Array(degree);
  result[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i += 1) {
    for (let j = 0; j < degree; j += 1) {
      result[j] = gfMultiply(result[j], root);
      if (j + 1 < degree) result[j] ^= result[j + 1];
    }
    root = gfMultiply(root, 0x02);
  }
  return result;
}

export function reedSolomonRemainder(data, generator) {
  const result = new Uint8Array(generator.length);
  for (const byte of data) {
    const factor = byte ^ result[0];
    result.copyWithin(0, 1);
    result[result.length - 1] = 0;
    for (let i = 0; i < result.length; i += 1) {
      result[i] ^= gfMultiply(generator[i], factor);
    }
  }
  return result;
}

/** UTF-8 bytes, which is what every scanner assumes for byte mode content. */
function toBytes(text) {
  return new TextEncoder().encode(String(text));
}

function charCountBits(version) {
  return version <= 9 ? 8 : 16;
}

class BitBuffer {
  constructor() {
    this.bits = [];
  }

  append(value, length) {
    for (let i = length - 1; i >= 0; i -= 1) this.bits.push((value >>> i) & 1);
  }

  get length() {
    return this.bits.length;
  }
}

/** Chooses the smallest version that holds the payload at this level. */
function chooseVersion(byteLength, ecl) {
  for (let version = MIN_VERSION; version <= MAX_VERSION; version += 1) {
    const capacityBits = dataCodewords(version, ecl) * 8;
    const needed = 4 + charCountBits(version) + byteLength * 8;
    if (needed <= capacityBits) return version;
  }
  return null;
}

function buildCodewords(text, ecl, version) {
  const bytes = toBytes(text);
  const buffer = new BitBuffer();
  buffer.append(0b0100, 4); // byte mode
  buffer.append(bytes.length, charCountBits(version));
  for (const byte of bytes) buffer.append(byte, 8);

  const capacityBits = dataCodewords(version, ecl) * 8;
  // Terminator, then pad to a byte boundary, then the alternating pad bytes the
  // specification names.
  buffer.append(0, Math.min(4, capacityBits - buffer.length));
  buffer.append(0, (8 - (buffer.length % 8)) % 8);

  const data = new Uint8Array(capacityBits / 8);
  for (let i = 0; i < buffer.length; i += 1) {
    data[i >>> 3] |= buffer.bits[i] << (7 - (i & 7));
  }
  for (let i = buffer.length / 8, pad = 0xec; i < data.length; i += 1, pad ^= 0xec ^ 0x11) {
    data[i] = pad;
  }
  return data;
}

/**
 * Splits the data into blocks, appends each block's error correction bytes, and
 * interleaves them, which is what spreads a smudge across many blocks instead
 * of destroying one.
 */
function addEccAndInterleave(data, version, ecl) {
  const numBlocks = NUM_ERROR_CORRECTION_BLOCKS[ecl][version];
  const eccLength = ECC_CODEWORDS_PER_BLOCK[ecl][version];
  const rawCodewords = totalCodewords(version);
  const numShortBlocks = numBlocks - (rawCodewords % numBlocks);
  const shortBlockLength = Math.floor(rawCodewords / numBlocks);

  const blocks = [];
  const generator = reedSolomonGenerator(eccLength);
  for (let i = 0, k = 0; i < numBlocks; i += 1) {
    const length = shortBlockLength - eccLength + (i < numShortBlocks ? 0 : 1);
    const dat = data.slice(k, k + length);
    k += length;
    const ecc = reedSolomonRemainder(dat, generator);
    blocks.push({ dat, ecc });
  }

  const result = new Uint8Array(rawCodewords);
  let index = 0;
  for (let i = 0; i < shortBlockLength - eccLength + 1; i += 1) {
    blocks.forEach((block, blockIndex) => {
      // The last data byte of the long blocks comes after every short block.
      if (i < block.dat.length && (i !== shortBlockLength - eccLength || blockIndex >= numShortBlocks)) {
        result[index] = block.dat[i];
        index += 1;
      }
    });
  }
  for (let i = 0; i < eccLength; i += 1) {
    blocks.forEach((block) => {
      result[index] = block.ecc[i];
      index += 1;
    });
  }
  return result;
}

class Matrix {
  constructor(size) {
    this.size = size;
    this.modules = Array.from({ length: size }, () => new Array(size).fill(false));
    this.reserved = Array.from({ length: size }, () => new Array(size).fill(false));
  }

  set(x, y, dark, reserve = true) {
    this.modules[y][x] = dark;
    if (reserve) this.reserved[y][x] = true;
  }
}

function drawFunctionPatterns(matrix, version) {
  const size = matrix.size;

  // Timing patterns run the full width and height; the finders overwrite the
  // ends of them a moment later.
  for (let i = 0; i < size; i += 1) {
    matrix.set(6, i, i % 2 === 0);
    matrix.set(i, 6, i % 2 === 0);
  }

  const drawFinder = (cx, cy) => {
    for (let dy = -4; dy <= 4; dy += 1) {
      for (let dx = -4; dx <= 4; dx += 1) {
        const x = cx + dx;
        const y = cy + dy;
        if (x < 0 || x >= size || y < 0 || y >= size) continue;
        const distance = Math.max(Math.abs(dx), Math.abs(dy));
        matrix.set(x, y, distance !== 2 && distance <= 3);
      }
    }
  };

  drawFinder(3, 3);
  drawFinder(size - 4, 3);
  drawFinder(3, size - 4);

  const positions = alignmentPatternPositions(version);
  positions.forEach((cy, i) => {
    positions.forEach((cx, j) => {
      // The three corners already hold finder patterns.
      const corner =
        (i === 0 && j === 0) ||
        (i === 0 && j === positions.length - 1) ||
        (i === positions.length - 1 && j === 0);
      if (corner) return;
      for (let dy = -2; dy <= 2; dy += 1) {
        for (let dx = -2; dx <= 2; dx += 1) {
          matrix.set(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
        }
      }
    });
  });

  // Reserve the format information areas and set the always-dark module. Index
  // 6 is skipped in both directions: those two modules belong to the timing
  // patterns, not to the format information, and blanking them here would break
  // the timing line.
  for (let i = 0; i < 9; i += 1) {
    if (i !== 6) {
      matrix.set(i, 8, false);
      matrix.set(8, i, false);
    }
    if (i < 8) {
      matrix.set(size - 1 - i, 8, false);
      matrix.set(8, size - 1 - i, false);
    }
  }
  matrix.set(8, size - 8, true);

  if (version >= 7) {
    for (let i = 0; i < 18; i += 1) {
      const a = size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      matrix.set(a, b, false);
      matrix.set(b, a, false);
    }
  }
}

function drawVersionInfo(matrix, version) {
  if (version < 7) return;
  let rem = version;
  for (let i = 0; i < 12; i += 1) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
  const bits = (version << 12) | rem;
  const size = matrix.size;
  for (let i = 0; i < 18; i += 1) {
    const bit = ((bits >>> i) & 1) === 1;
    const a = size - 11 + (i % 3);
    const b = Math.floor(i / 3);
    matrix.set(a, b, bit);
    matrix.set(b, a, bit);
  }
}

function drawFormatBits(matrix, ecl, mask) {
  const eccBits = ECC_LEVELS.find((level) => level.id === ecl).bits;
  const data = (eccBits << 3) | mask;
  let rem = data;
  for (let i = 0; i < 10; i += 1) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  const bits = ((data << 10) | rem) ^ 0x5412;
  const size = matrix.size;

  for (let i = 0; i <= 5; i += 1) matrix.set(8, i, ((bits >>> i) & 1) === 1);
  matrix.set(8, 7, ((bits >>> 6) & 1) === 1);
  matrix.set(8, 8, ((bits >>> 7) & 1) === 1);
  matrix.set(7, 8, ((bits >>> 8) & 1) === 1);
  for (let i = 9; i < 15; i += 1) matrix.set(14 - i, 8, ((bits >>> i) & 1) === 1);

  for (let i = 0; i < 8; i += 1) matrix.set(size - 1 - i, 8, ((bits >>> i) & 1) === 1);
  for (let i = 8; i < 15; i += 1) matrix.set(8, size - 15 + i, ((bits >>> i) & 1) === 1);
  matrix.set(8, size - 8, true);
}

// The zigzag walk: two module wide columns, right to left, alternating upward
// and downward, skipping the vertical timing column.
function drawCodewords(matrix, codewords) {
  const size = matrix.size;
  let i = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert += 1) {
      for (let j = 0; j < 2; j += 1) {
        const x = right - j;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? size - 1 - vert : vert;
        if (matrix.reserved[y][x]) continue;
        if (i < codewords.length * 8) {
          matrix.modules[y][x] = ((codewords[i >>> 3] >>> (7 - (i & 7))) & 1) !== 0;
          i += 1;
        }
        // Remaining modules stay light, which the specification allows.
      }
    }
  }
  return i;
}

function maskCondition(mask, x, y) {
  switch (mask) {
    case 0: return (x + y) % 2 === 0;
    case 1: return y % 2 === 0;
    case 2: return x % 3 === 0;
    case 3: return (x + y) % 3 === 0;
    case 4: return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
    case 5: return ((x * y) % 2) + ((x * y) % 3) === 0;
    case 6: return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
    case 7: return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
    default: return false;
  }
}

function applyMask(matrix, mask) {
  for (let y = 0; y < matrix.size; y += 1) {
    for (let x = 0; x < matrix.size; x += 1) {
      if (matrix.reserved[y][x]) continue;
      if (maskCondition(mask, x, y)) matrix.modules[y][x] = !matrix.modules[y][x];
    }
  }
}

// The four penalty rules from the specification. Lower is better, and the mask
// with the lowest total is the one a scanner will find easiest.
function penaltyScore(matrix) {
  const size = matrix.size;
  const modules = matrix.modules;
  let score = 0;

  const runScore = (runLength) => (runLength >= 5 ? 3 + (runLength - 5) : 0);

  for (let y = 0; y < size; y += 1) {
    let runColour = modules[y][0];
    let runLength = 1;
    for (let x = 1; x < size; x += 1) {
      if (modules[y][x] === runColour) {
        runLength += 1;
      } else {
        score += runScore(runLength);
        runColour = modules[y][x];
        runLength = 1;
      }
    }
    score += runScore(runLength);
  }

  for (let x = 0; x < size; x += 1) {
    let runColour = modules[0][x];
    let runLength = 1;
    for (let y = 1; y < size; y += 1) {
      if (modules[y][x] === runColour) {
        runLength += 1;
      } else {
        score += runScore(runLength);
        runColour = modules[y][x];
        runLength = 1;
      }
    }
    score += runScore(runLength);
  }

  for (let y = 0; y < size - 1; y += 1) {
    for (let x = 0; x < size - 1; x += 1) {
      const colour = modules[y][x];
      if (colour === modules[y][x + 1] && colour === modules[y + 1][x] && colour === modules[y + 1][x + 1]) {
        score += 3;
      }
    }
  }

  // The finder-like pattern, dark light dark dark dark light dark, with four
  // light modules on one side.
  const pattern = [true, false, true, true, true, false, true];
  const matches = (cells) => {
    for (let i = 0; i < 7; i += 1) if (cells[i] !== pattern[i]) return false;
    return true;
  };
  const light4 = (cells) => cells.every((cell) => cell === false);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x <= size - 7; x += 1) {
      const row = [];
      for (let i = 0; i < 7; i += 1) row.push(modules[y][x + i]);
      if (!matches(row)) continue;
      const before = [];
      for (let i = 4; i >= 1; i -= 1) before.push(x - i >= 0 ? modules[y][x - i] : false);
      const after = [];
      for (let i = 0; i < 4; i += 1) after.push(x + 7 + i < size ? modules[y][x + 7 + i] : false);
      if (light4(before) || light4(after)) score += 40;
    }
  }

  for (let x = 0; x < size; x += 1) {
    for (let y = 0; y <= size - 7; y += 1) {
      const column = [];
      for (let i = 0; i < 7; i += 1) column.push(modules[y + i][x]);
      if (!matches(column)) continue;
      const before = [];
      for (let i = 4; i >= 1; i -= 1) before.push(y - i >= 0 ? modules[y - i][x] : false);
      const after = [];
      for (let i = 0; i < 4; i += 1) after.push(y + 7 + i < size ? modules[y + 7 + i][x] : false);
      if (light4(before) || light4(after)) score += 40;
    }
  }

  let dark = 0;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) if (modules[y][x]) dark += 1;
  }
  const total = size * size;
  const percent = (dark * 100) / total;
  score += Math.floor(Math.abs(percent - 50) / 5) * 10;

  return score;
}

/**
 * Encodes text into a QR matrix.
 * Returns { modules, size, version, ecl, mask } where modules[y][x] is true for
 * a dark module. Throws when the text is too long for the largest version.
 */
export function encodeQr(text, { ecl = "M", forceMask = null } = {}) {
  const byteLength = toBytes(text).length;
  const version = chooseVersion(byteLength, ecl);
  if (!version) {
    throw new Error(
      "That is too long for a QR code. The largest version holds about 2,900 bytes at level L, and less at higher error correction."
    );
  }

  const data = buildCodewords(text, ecl, version);
  const codewords = addEccAndInterleave(data, version, ecl);

  let best = null;
  const masks = forceMask === null ? [0, 1, 2, 3, 4, 5, 6, 7] : [forceMask];

  for (const mask of masks) {
    const matrix = new Matrix(version * 4 + 17);
    drawFunctionPatterns(matrix, version);
    drawVersionInfo(matrix, version);
    drawCodewords(matrix, codewords);
    // Format bits are written before masking because the mask must not touch
    // them, and writing them marks their modules as reserved.
    drawFormatBits(matrix, ecl, mask);
    applyMask(matrix, mask);
    const score = penaltyScore(matrix);
    if (!best || score < best.score) best = { matrix, mask, score };
  }

  return {
    modules: best.matrix.modules,
    size: best.matrix.size,
    version,
    ecl,
    mask: best.mask,
    byteLength,
    capacity: dataCodewords(version, ecl),
  };
}

/** Renders a matrix to an SVG string, with a quiet zone of four modules. */
export function qrToSvg(qr, { moduleSize = 10, margin = 4, dark = "#000000", light = "#ffffff" } = {}) {
  const dimension = qr.size + margin * 2;
  const parts = [];
  for (let y = 0; y < qr.size; y += 1) {
    for (let x = 0; x < qr.size; x += 1) {
      if (qr.modules[y][x]) parts.push(`M${x + margin},${y + margin}h1v1h-1z`);
    }
  }
  const size = dimension * moduleSize;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${dimension} ${dimension}" shape-rendering="crispEdges">`,
    `<rect width="${dimension}" height="${dimension}" fill="${light}"/>`,
    `<path fill="${dark}" d="${parts.join("")}"/>`,
    "</svg>",
  ].join("");
}

/** Renders a matrix onto a canvas element at a whole number of pixels per module. */
export function qrToCanvas(qr, { pixels = 512, margin = 4, dark = "#000000", light = "#ffffff" } = {}) {
  const dimension = qr.size + margin * 2;
  // A whole number of pixels per module keeps the edges sharp, which is what
  // scanners want. The canvas is sized to the multiple, not to the request.
  const scale = Math.max(1, Math.floor(pixels / dimension));
  const canvas = document.createElement("canvas");
  canvas.width = dimension * scale;
  canvas.height = dimension * scale;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = light;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = dark;
  for (let y = 0; y < qr.size; y += 1) {
    for (let x = 0; x < qr.size; x += 1) {
      if (qr.modules[y][x]) {
        ctx.fillRect((x + margin) * scale, (y + margin) * scale, scale, scale);
      }
    }
  }
  return canvas;
}
