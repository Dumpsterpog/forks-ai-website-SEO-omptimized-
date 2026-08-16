// Canvas-only image engine for the four image tools (exam photo resizer,
// passport photo maker, resizer, cropper). Everything here runs in the
// visitor's browser: no upload, no API route, no third party service. A
// thousand visitors cost exactly what one costs.

import { countToolUse } from "@/lib/toolUsage";

export const SITE_URL = "https://forksai.app";

// Forms and file managers in India state limits in KB meaning 1024 bytes, so
// that is what the tools use. Stated on the page too.
export const KB = 1024;

export const IMAGE_TOOLS = [
  {
    href: "/exam-photo-resizer",
    name: "Exam photo resizer",
    blurb:
      "Resize a photo or signature to exact pixels and land the file inside the KB range an application form demands.",
  },
  {
    href: "/passport-photo-maker",
    name: "Passport photo maker",
    blurb:
      "Crop to 35 x 45 mm, 2 x 2 in and other standard passport sizes at print resolution.",
  },
  {
    href: "/image-resizer",
    name: "Image resizer",
    blurb:
      "Resize by pixels or by percentage, with the aspect ratio locked or free, and see the file size before you download.",
  },
  {
    href: "/image-cropper",
    name: "Image cropper",
    blurb: "Crop to 1:1, 4:3, 16:9 or any ratio you type in, straight in the browser.",
  },
  {
    href: "/circle-crop",
    name: "Circle crop",
    blurb:
      "Cut a photo into a circle for a profile picture, with the corners saved genuinely transparent.",
  },
  {
    href: "/watermark-image",
    name: "Watermark image",
    blurb:
      "Put text or your own logo over a picture, with the position, size, angle, colour and opacity you choose.",
  },
];

export const IMAGE_TOOL_PATHS = IMAGE_TOOLS.map((tool) => tool.href);

// Encoder settings. The quality search is a bisection, so 12 steps resolve the
// JPEG quality argument to better than 0.001, which is far finer than the
// encoder itself reacts to.
const QUALITY_STEPS = 12;
const MIN_QUALITY = 0.02;
const MAX_QUALITY = 1;
const DEFAULT_QUALITY = 0.92;
// When padding up to a minimum, aim slightly above it so a form that reads the
// limit as "more than 20 KB" rather than "at least 20 KB" still passes.
const PAD_MARGIN = 512;

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function formatSize(bytes) {
  if (!Number.isFinite(bytes)) return "";
  if (bytes < KB) return `${bytes} B`;
  const kb = bytes / KB;
  if (kb < KB) return `${kb.toFixed(1)} KB`;
  return `${(kb / KB).toFixed(2)} MB`;
}

export function mmToPx(mm, dpi) {
  return Math.round((mm / 25.4) * dpi);
}

export function inToPx(inches, dpi) {
  return Math.round(inches * dpi);
}

export function pxToMm(px, dpi) {
  return (px / dpi) * 25.4;
}

export const IMAGE_ACCEPT = "image/png,image/jpeg,image/webp,image/gif,image/bmp";

// Decode a picked file into something drawImage accepts. createImageBitmap with
// imageOrientation "from-image" applies the EXIF rotation phone cameras write,
// which is why a portrait selfie does not come out sideways.
export async function loadImageFile(file) {
  if (!file) throw new Error("no-file");
  if (file.type && !file.type.startsWith("image/")) throw new Error("not-an-image");

  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        name: file.name || "image",
        type: file.type || "",
        bytes: file.size,
        release: () => bitmap.close && bitmap.close(),
      };
    } catch {
      // Fall through to the <img> path below.
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("decode-failed"));
      el.src = url;
    });
    return {
      source: img,
      width: img.naturalWidth,
      height: img.naturalHeight,
      name: file.name || "image",
      type: file.type || "",
      bytes: file.size,
      release: () => URL.revokeObjectURL(url),
    };
  } catch (err) {
    URL.revokeObjectURL(url);
    throw err;
  }
}

export function createCanvas(width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return canvas;
}

// Draw a crop rectangle of the source into a canvas of exactly outW x outH.
// One drawImage that shrinks by more than half throws away pixels instead of
// averaging them, which is what makes a downscaled scan look ragged, so big
// reductions are done by halving repeatedly first.
export function renderCrop(source, crop, outW, outH, options = {}) {
  const { background = null, canvas = null } = options;
  const out = canvas || createCanvas(outW, outH);
  out.width = Math.max(1, Math.round(outW));
  out.height = Math.max(1, Math.round(outH));

  const octx = out.getContext("2d");
  octx.clearRect(0, 0, out.width, out.height);
  octx.imageSmoothingEnabled = true;
  octx.imageSmoothingQuality = "high";
  if (background) {
    octx.fillStyle = background;
    octx.fillRect(0, 0, out.width, out.height);
  }

  let current = source;
  let sx = crop.x;
  let sy = crop.y;
  let sw = crop.width;
  let sh = crop.height;

  while (sw > out.width * 2 && sh > out.height * 2) {
    const nw = Math.max(out.width, Math.round(sw / 2));
    const nh = Math.max(out.height, Math.round(sh / 2));
    const step = createCanvas(nw, nh);
    const sctx = step.getContext("2d");
    sctx.imageSmoothingEnabled = true;
    sctx.imageSmoothingQuality = "high";
    sctx.drawImage(current, sx, sy, sw, sh, 0, 0, nw, nh);
    current = step;
    sx = 0;
    sy = 0;
    sw = nw;
    sh = nh;
  }

  octx.drawImage(current, sx, sy, sw, sh, 0, 0, out.width, out.height);
  return out;
}

// Push near-white pixels to pure white. Photographed signatures sit on grey
// paper, and forms want ink on white. Opt in only, and the threshold is stated
// on the page rather than hidden.
export function whitenBackground(canvas, threshold = 200) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const px = data.data;
  for (let i = 0; i < px.length; i += 4) {
    const luma = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
    if (luma >= threshold) {
      px[i] = 255;
      px[i + 1] = 255;
      px[i + 2] = 255;
      px[i + 3] = 255;
    }
  }
  ctx.putImageData(data, 0, 0);
  return canvas;
}

export function toBlobAsync(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("encode-failed"))),
      type,
      quality
    );
  });
}

// Where a fresh marker segment can legally go: after the SOI and after any APPn
// segments the encoder wrote, before the quantisation tables.
function jpegSegmentInsertOffset(bytes) {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return -1;
  let offset = 2;
  while (offset + 4 <= bytes.length && bytes[offset] === 0xff) {
    const marker = bytes[offset + 1];
    if (marker < 0xe0 || marker > 0xef) break;
    const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
    if (length < 2) return -1;
    offset += 2 + length;
  }
  return offset;
}

// Grow a JPEG to a minimum byte count by inserting COM (comment) segments.
// A comment is part of the JPEG standard and every decoder skips it, so the
// pixels, the dimensions and the visible quality are untouched. This is the
// only honest way to satisfy a form that demands a minimum file size when the
// picture compresses smaller than that at full quality.
export function padJpegToBytes(bytes, targetBytes) {
  if (bytes.length >= targetBytes) return bytes;
  const at = jpegSegmentInsertOffset(bytes);
  if (at < 0) return bytes;

  let need = targetBytes - bytes.length;
  const segments = [];
  // A comment segment costs 2 bytes of marker plus a 2 byte length field, and
  // the length field itself caps the payload at 65533.
  while (need > 0) {
    const payload = clamp(need - 4, 0, 65533);
    const segment = new Uint8Array(4 + payload);
    segment[0] = 0xff;
    segment[1] = 0xfe;
    const length = payload + 2;
    segment[2] = (length >> 8) & 0xff;
    segment[3] = length & 0xff;
    segment.fill(0x20, 4);
    segments.push(segment);
    need -= segment.length;
  }

  const added = segments.reduce((total, s) => total + s.length, 0);
  const out = new Uint8Array(bytes.length + added);
  out.set(bytes.subarray(0, at), 0);
  let offset = at;
  for (const segment of segments) {
    out.set(segment, offset);
    offset += segment.length;
  }
  out.set(bytes.subarray(at), offset);
  return out;
}

// Write a real DPI into the JFIF header. Canvas encodes at the default 72, so
// a 35 x 45 mm photo would open in a print dialog at the wrong physical size
// even though the pixel count is right.
export function setJpegDensity(bytes, dpi) {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return bytes;
  const density = clamp(Math.round(dpi), 1, 65535);

  let offset = 2;
  while (offset + 4 <= bytes.length && bytes[offset] === 0xff) {
    const marker = bytes[offset + 1];
    if (marker < 0xe0 || marker > 0xef) break;
    const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
    if (length < 2) break;
    const isJfif =
      marker === 0xe0 &&
      length >= 16 &&
      bytes[offset + 4] === 0x4a &&
      bytes[offset + 5] === 0x46 &&
      bytes[offset + 6] === 0x49 &&
      bytes[offset + 7] === 0x46 &&
      bytes[offset + 8] === 0x00;
    if (isJfif) {
      const out = bytes.slice();
      out[offset + 11] = 1; // units: dots per inch
      out[offset + 12] = (density >> 8) & 0xff;
      out[offset + 13] = density & 0xff;
      out[offset + 14] = (density >> 8) & 0xff;
      out[offset + 15] = density & 0xff;
      return out;
    }
    offset += 2 + length;
  }

  // No JFIF header in the encoder output, so write one of our own.
  const app0 = new Uint8Array([
    0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 1, 1, 1,
    (density >> 8) & 0xff, density & 0xff,
    (density >> 8) & 0xff, density & 0xff,
    0, 0,
  ]);
  const out = new Uint8Array(bytes.length + app0.length);
  out.set(bytes.subarray(0, 2), 0);
  out.set(app0, 2);
  out.set(bytes.subarray(2), 2 + app0.length);
  return out;
}

// Read the dimensions back out of the encoded file itself rather than trusting
// the canvas we asked for. What the tools report is what the file says.
export function readImageSize(bytes) {
  if (!bytes || bytes.length < 24) return null;

  // PNG: 8 byte signature, then the IHDR length and tag, then the dimensions.
  if (
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47
  ) {
    const width = (bytes[16] << 24) | (bytes[17] << 16) | (bytes[18] << 8) | bytes[19];
    const height = (bytes[20] << 24) | (bytes[21] << 16) | (bytes[22] << 8) | bytes[23];
    return { width, height };
  }

  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 9 <= bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = bytes[offset + 1];
    if (marker === 0xff) {
      offset += 1;
      continue;
    }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) {
      offset += 2;
      continue;
    }
    const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
    if (length < 2) return null;
    const isStartOfFrame =
      marker >= 0xc0 && marker <= 0xcf &&
      marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isStartOfFrame) {
      return {
        height: (bytes[offset + 5] << 8) | bytes[offset + 6],
        width: (bytes[offset + 7] << 8) | bytes[offset + 8],
      };
    }
    if (marker === 0xda) return null;
    offset += 2 + length;
  }
  return null;
}

/**
 * Encode a canvas so the finished file lands inside a byte range.
 *
 * The hard part of every "resize to 20 to 50 KB" form is that the pixel size is
 * fixed, so the only lever left is the JPEG quality argument, and the size it
 * produces cannot be predicted from the number. So this bisects: it measures
 * real encoded sizes and keeps the highest quality whose output still fits
 * under the maximum. If that file is under the minimum even at quality 1, it
 * pads with JPEG comment segments rather than pretending.
 *
 * Returns the blob, its exact byte count, the quality used, how many bytes of
 * padding went in, and the dimensions read back out of the file header.
 */
export async function encodeToSizeBand(canvas, options = {}) {
  const {
    type = "image/jpeg",
    minBytes = 0,
    maxBytes = Infinity,
    allowPadding = true,
    transform = null,
    quality: fixedQuality = null,
  } = options;

  const lossless = type === "image/png";

  const measure = async (quality) => {
    const blob = await toBlobAsync(canvas, type, quality);
    if (!transform) return { blob, bytes: blob.size, quality };
    const patched = transform(new Uint8Array(await blob.arrayBuffer()));
    const out = new Blob([patched], { type });
    return { blob: out, bytes: out.size, quality };
  };

  let attempts = 0;
  let best;

  if (lossless || fixedQuality !== null) {
    best = await measure(lossless ? undefined : fixedQuality);
    attempts = 1;
  } else {
    const opening = Number.isFinite(maxBytes) ? MAX_QUALITY : DEFAULT_QUALITY;
    best = await measure(opening);
    attempts = 1;

    if (best.bytes > maxBytes) {
      const floor = await measure(MIN_QUALITY);
      attempts += 1;
      if (floor.bytes > maxBytes) {
        return finish(floor, {
          status: "too-large",
          padded: 0,
          attempts,
          type,
        });
      }
      best = floor;
      let low = MIN_QUALITY;
      let high = opening;
      for (let i = 0; i < QUALITY_STEPS; i += 1) {
        const mid = (low + high) / 2;
        const probe = await measure(mid);
        attempts += 1;
        if (probe.bytes <= maxBytes) {
          low = mid;
          best = probe;
        } else {
          high = mid;
        }
      }
    }
  }

  if (best.bytes >= minBytes) {
    return finish(best, { status: "ok", padded: 0, attempts, type });
  }

  if (!allowPadding || type !== "image/jpeg") {
    return finish(best, { status: "under", padded: 0, attempts, type });
  }

  const ceiling = Number.isFinite(maxBytes) ? maxBytes : minBytes + PAD_MARGIN;
  const target = Math.min(minBytes + PAD_MARGIN, Math.max(minBytes, ceiling));
  const original = new Uint8Array(await best.blob.arrayBuffer());
  const padded = padJpegToBytes(original, target);
  const blob = new Blob([padded], { type });
  return finish(
    { blob, bytes: blob.size, quality: best.quality },
    {
      status: blob.size >= minBytes ? "ok" : "under",
      padded: blob.size - original.length,
      attempts,
      type,
      bytesView: padded,
    }
  );

  async function finish(result, meta) {
    const view = meta.bytesView || new Uint8Array(await result.blob.arrayBuffer());
    const size = readImageSize(view);
    return {
      blob: result.blob,
      bytes: result.bytes,
      quality: result.quality ?? null,
      status: meta.status,
      padded: meta.padded,
      attempts: meta.attempts,
      type: meta.type,
      headerWidth: size ? size.width : null,
      headerHeight: size ? size.height : null,
    };
  }
}

export function downloadBlob(blob, filename) {
  // A finished download is the tool having done its job, so this is the one
  // place a use is counted. See lib/toolUsage.js for what that sends.
  countToolUse();

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Give the browser a moment to start the download before the URL dies.
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function extensionFor(type) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

export function safeFileName(base, suffix, type) {
  const stem = String(base || "image")
    .replace(/\.[^./\\]+$/, "")
    .replace(/[^\w-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "image";
  return `${stem}-${suffix}.${extensionFor(type)}`;
}

/**
 * Crop geometry.
 *
 * State is three numbers: a zoom, and where the window sits inside the room it
 * has to move in, horizontally and vertically, each from 0 to 1. Expressing it
 * that way means the crop can never leave the picture, so there is no clamping
 * to get wrong and no way to export a frame with a transparent edge.
 */
export const MAX_CROP_ZOOM = 8;

export function cropRect(imageWidth, imageHeight, aspect, view) {
  const zoom = clamp(view.zoom || 1, 1, MAX_CROP_ZOOM);
  const ratio = aspect > 0 ? aspect : imageWidth / imageHeight;
  const widest = Math.min(imageWidth, imageHeight * ratio);
  const width = widest / zoom;
  const height = width / ratio;
  const roomX = Math.max(0, imageWidth - width);
  const roomY = Math.max(0, imageHeight - height);
  return {
    x: roomX * clamp(view.x ?? 0.5, 0, 1),
    y: roomY * clamp(view.y ?? 0.5, 0, 1),
    width,
    height,
    roomX,
    roomY,
  };
}

export const DEFAULT_CROP_VIEW = { zoom: 1, x: 0.5, y: 0.5 };
