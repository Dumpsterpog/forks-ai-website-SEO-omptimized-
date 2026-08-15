// Client-side image work for /image-converter, /compress-image and
// /favicon-generator. Everything here runs on the device: decoding uses the
// browser's own image decoder, re-encoding uses canvas.toBlob, and the zip and
// ico containers are written by hand rather than pulled from a library.

export const FORMATS = [
  { id: "image/png", label: "PNG", extension: "png", lossy: false },
  { id: "image/jpeg", label: "JPG", extension: "jpg", lossy: true },
  { id: "image/webp", label: "WebP", extension: "webp", lossy: true },
];

export const FAVICON_SIZES = [
  { size: 16, purpose: "Browser tab and bookmark bar" },
  { size: 32, purpose: "Retina tab, Windows taskbar" },
  { size: 48, purpose: "Windows site shortcut" },
  { size: 180, purpose: "Apple touch icon for iOS home screens" },
  { size: 192, purpose: "Android home screen, web app manifest" },
  { size: 512, purpose: "Splash screens and install prompts" },
];

export function extensionFor(mimeType) {
  return FORMATS.find((f) => f.id === mimeType)?.extension ?? "png";
}

export function labelFor(mimeType) {
  return FORMATS.find((f) => f.id === mimeType)?.label ?? mimeType;
}

export function baseName(fileName) {
  const withoutPath = String(fileName || "image").split(/[\\/]/).pop();
  return withoutPath.replace(/\.[^.]+$/, "") || "image";
}

/**
 * Decodes a file into something drawable. createImageBitmap is the fast path;
 * the object URL fallback covers browsers that refuse a format there.
 */
export async function loadImage(file) {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file);
      return { source: bitmap, width: bitmap.width, height: bitmap.height };
    } catch {
      // Falls through to the img element, which handles a few formats that
      // createImageBitmap rejects.
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("This browser could not decode that image."));
      element.src = url;
    });
    return { source: img, width: img.naturalWidth, height: img.naturalHeight };
  } finally {
    // Revoked on the next tick so the decode has definitely finished with it.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

/**
 * Draws the decoded image at the requested size. background is painted first
 * when the target format has no alpha channel, otherwise transparent pixels
 * come out black rather than the colour the user expects.
 */
export function drawToCanvas(image, width, height, background) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(image.source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export function canvasToBlob(canvas, mimeType, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("This browser could not write that format."));
      },
      mimeType,
      quality
    );
  });
}

// A browser that cannot encode WebP silently hands back a PNG, so the type of
// the returned blob is the only honest answer about what happened.
export async function encodeSupported(mimeType) {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 2;
    canvas.height = 2;
    const blob = await canvasToBlob(canvas, mimeType, 0.9);
    return blob.type === mimeType;
  } catch {
    return false;
  }
}

/**
 * One-shot format conversion, with optional resizing.
 * Returns the blob plus the dimensions it was written at.
 */
export async function convertImage(file, { format, quality = 0.92, scale = 1, background } = {}) {
  const image = await loadImage(file);
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const needsBackground = format === "image/jpeg" ? background || "#ffffff" : null;
  const canvas = drawToCanvas(image, width, height, needsBackground);
  const blob = await canvasToBlob(canvas, format, quality);
  return { blob, width, height, sourceWidth: image.width, sourceHeight: image.height };
}

/**
 * Compresses until the result fits under a target byte count.
 *
 * Quality is searched first, by bisection, because dropping quality keeps the
 * pixel dimensions. Only when the lowest usable quality still misses the target
 * does it start scaling the image down, in steps, retrying the quality search
 * at each one. That order matters: people asking for "under 100 KB" want the
 * same image smaller, not a thumbnail.
 */
export async function compressToTarget(
  file,
  { targetBytes, format = "image/jpeg", minQuality = 0.05, background = "#ffffff", onProgress } = {}
) {
  const image = await loadImage(file);
  const lossless = format === "image/png";
  const scales = [1, 0.85, 0.72, 0.6, 0.5, 0.42, 0.35, 0.28, 0.22, 0.17, 0.12];

  let best = null;
  let smallest = null;
  let attempts = 0;

  for (const scale of scales) {
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = drawToCanvas(image, width, height, format === "image/jpeg" ? background : null);

    if (lossless) {
      // PNG ignores the quality argument, so the only lever left is size.
      const blob = await canvasToBlob(canvas, format);
      attempts += 1;
      if (!smallest || blob.size < smallest.blob.size) smallest = { blob, width, height, quality: null, scale };
      if (blob.size <= targetBytes) return { blob, width, height, quality: null, scale, attempts, ok: true };
      if (onProgress) onProgress({ attempts, size: blob.size });
      continue;
    }

    // Bisection over quality. Twelve steps would be wasted work: seven gets
    // within about one percent of the best quality that fits.
    let low = minQuality;
    let high = 0.96;
    let found = null;

    for (let i = 0; i < 7; i += 1) {
      const quality = (low + high) / 2;
      const blob = await canvasToBlob(canvas, format, quality);
      attempts += 1;
      if (onProgress) onProgress({ attempts, size: blob.size });
      if (!smallest || blob.size < smallest.blob.size) {
        smallest = { blob, width, height, quality, scale };
      }
      if (blob.size <= targetBytes) {
        found = { blob, width, height, quality, scale };
        low = quality;
      } else {
        high = quality;
      }
    }

    if (found) {
      best = found;
      break;
    }
  }

  if (best) return { ...best, attempts, ok: true };
  // Nothing fit. The smallest attempt is still worth handing back, with the
  // size it actually reached, rather than an error and no file.
  return { ...smallest, attempts, ok: false };
}

/** Square favicon renders. Non-square uploads are centre cropped to a square. */
export async function generateFavicons(file, { background = null } = {}) {
  const image = await loadImage(file);
  const side = Math.min(image.width, image.height);
  const offsetX = (image.width - side) / 2;
  const offsetY = (image.height - side) / 2;

  const results = [];
  for (const { size, purpose } of FAVICON_SIZES) {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    if (background) {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, size, size);
    }
    ctx.drawImage(image.source, offsetX, offsetY, side, side, 0, 0, size, size);
    const blob = await canvasToBlob(canvas, "image/png");
    results.push({ size, purpose, blob, url: URL.createObjectURL(blob) });
  }
  return { results, sourceWidth: image.width, sourceHeight: image.height };
}

// CRC32 with the standard polynomial, needed by both the zip container and any
// PNG rewriting. The table is built once on first use.
let crcTable = null;
function crc32(bytes) {
  if (!crcTable) {
    crcTable = new Uint32Array(256);
    for (let n = 0; n < 256; n += 1) {
      let c = n;
      for (let k = 0; k < 8; k += 1) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      crcTable[n] = c >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = crcTable[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Writes a zip with no compression (store method). PNGs are already deflated,
 * so a second pass would save almost nothing and would mean shipping a deflate
 * implementation to every visitor.
 */
export async function buildZip(files) {
  const encoder = new TextEncoder();
  const entries = [];
  let offset = 0;
  const chunks = [];

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const data = new Uint8Array(await file.blob.arrayBuffer());
    const crc = crc32(data);

    const header = new Uint8Array(30 + nameBytes.length);
    const view = new DataView(header.buffer);
    view.setUint32(0, 0x04034b50, true); // local file header
    view.setUint16(4, 20, true); // version needed
    view.setUint16(6, 0, true); // flags
    view.setUint16(8, 0, true); // stored
    view.setUint16(10, 0, true); // mod time
    view.setUint16(12, 0, true); // mod date
    view.setUint32(14, crc, true);
    view.setUint32(18, data.length, true);
    view.setUint32(22, data.length, true);
    view.setUint16(26, nameBytes.length, true);
    view.setUint16(28, 0, true); // extra field length
    header.set(nameBytes, 30);

    chunks.push(header, data);
    entries.push({ nameBytes, crc, size: data.length, offset });
    offset += header.length + data.length;
  }

  const centralStart = offset;
  for (const entry of entries) {
    const record = new Uint8Array(46 + entry.nameBytes.length);
    const view = new DataView(record.buffer);
    view.setUint32(0, 0x02014b50, true); // central directory header
    view.setUint16(4, 20, true); // version made by
    view.setUint16(6, 20, true); // version needed
    view.setUint16(8, 0, true);
    view.setUint16(10, 0, true); // stored
    view.setUint16(12, 0, true);
    view.setUint16(14, 0, true);
    view.setUint32(16, entry.crc, true);
    view.setUint32(20, entry.size, true);
    view.setUint32(24, entry.size, true);
    view.setUint16(28, entry.nameBytes.length, true);
    view.setUint16(30, 0, true); // extra
    view.setUint16(32, 0, true); // comment
    view.setUint16(34, 0, true); // disk number
    view.setUint16(36, 0, true); // internal attrs
    view.setUint32(38, 0, true); // external attrs
    view.setUint32(42, entry.offset, true);
    record.set(entry.nameBytes, 46);
    chunks.push(record);
    offset += record.length;
  }

  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true); // end of central directory
  endView.setUint16(4, 0, true);
  endView.setUint16(6, 0, true);
  endView.setUint16(8, entries.length, true);
  endView.setUint16(10, entries.length, true);
  endView.setUint32(12, offset - centralStart, true);
  endView.setUint32(16, centralStart, true);
  endView.setUint16(20, 0, true);
  chunks.push(end);

  return new Blob(chunks, { type: "application/zip" });
}

/**
 * Writes a .ico containing PNG images. Every browser still in use reads
 * PNG-in-ICO, and it keeps the alpha channel that a 24-bit BMP payload would
 * have to fake.
 */
export async function buildIco(images) {
  const buffers = [];
  for (const image of images) {
    buffers.push({ size: image.size, data: new Uint8Array(await image.blob.arrayBuffer()) });
  }

  const header = new Uint8Array(6 + buffers.length * 16);
  const view = new DataView(header.buffer);
  view.setUint16(0, 0, true); // reserved
  view.setUint16(2, 1, true); // type 1 is icon
  view.setUint16(4, buffers.length, true);

  let offset = header.length;
  buffers.forEach((entry, index) => {
    const at = 6 + index * 16;
    // 256 is written as 0, which is how the format encodes a full-size icon.
    header[at] = entry.size >= 256 ? 0 : entry.size;
    header[at + 1] = entry.size >= 256 ? 0 : entry.size;
    header[at + 2] = 0; // palette size
    header[at + 3] = 0; // reserved
    view.setUint16(at + 4, 1, true); // colour planes
    view.setUint16(at + 6, 32, true); // bits per pixel
    view.setUint32(at + 8, entry.data.length, true);
    view.setUint32(at + 12, offset, true);
    offset += entry.data.length;
  });

  return new Blob([header, ...buffers.map((entry) => entry.data)], { type: "image/x-icon" });
}

export function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
