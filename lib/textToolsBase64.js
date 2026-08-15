// Base64 with UTF-8 handled properly.
//
// The naive version, btoa(text), throws on anything outside Latin-1, so a
// single accented letter or emoji breaks it. btoa encodes bytes, not
// characters, so the text has to be turned into UTF-8 bytes first with
// TextEncoder and back with TextDecoder. Everything here goes through bytes for
// that reason.

const CHUNK = 0x8000; // 32k at a time, so String.fromCharCode never blows the argument limit

export function bytesToBase64(bytes, { urlSafe = false, padding = true } = {}) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
  }
  let output = btoa(binary);
  if (urlSafe) output = output.replace(/\+/g, "-").replace(/\//g, "_");
  if (!padding) output = output.replace(/=+$/, "");
  return output;
}

/**
 * Tolerant on input, because base64 arrives with line breaks from email
 * headers, with URL safe characters from JWTs, and with the padding stripped.
 * Returns { ok, bytes } or { ok: false, error }.
 */
export function base64ToBytes(input) {
  const cleaned = input.replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
  if (cleaned === "") return { ok: true, bytes: new Uint8Array(0) };

  const body = cleaned.replace(/=+$/, "");
  if (!/^[A-Za-z0-9+/]*$/.test(body)) {
    const bad = body.match(/[^A-Za-z0-9+/]/);
    return {
      ok: false,
      error: `"${bad[0]}" is not a base64 character. Valid input uses A to Z, a to z, 0 to 9, plus and slash, or dash and underscore in the URL safe variant.`,
    };
  }
  if (body.length % 4 === 1) {
    return {
      ok: false,
      error: "This is not a whole number of base64 groups, so at least one character is missing or extra.",
    };
  }

  // Padding is restored rather than demanded, since plenty of sources strip it.
  const padded = body + "=".repeat((4 - (body.length % 4)) % 4);
  let binary;
  try {
    binary = atob(padded);
  } catch {
    return { ok: false, error: "That is not valid base64." };
  }

  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return { ok: true, bytes };
}

export function encodeText(text, options) {
  return bytesToBase64(new TextEncoder().encode(text), options);
}

export function decodeToText(input) {
  const result = base64ToBytes(input);
  if (!result.ok) return result;
  try {
    // fatal, so invalid UTF-8 is reported rather than silently peppered with
    // replacement characters. Data that is not text at all lands here.
    const text = new TextDecoder("utf-8", { fatal: true }).decode(result.bytes);
    return { ok: true, text, bytes: result.bytes };
  } catch {
    return {
      ok: false,
      error:
        "The base64 decoded, but the bytes are not valid UTF-8 text. This usually means the data is a file rather than text, so use the file tab to download it instead.",
      bytes: result.bytes,
    };
  }
}

// MIME base64 wraps at 76 characters, which is what email headers and PEM
// certificates expect.
export function wrapLines(text, width = 76) {
  if (width <= 0) return text;
  const lines = [];
  for (let i = 0; i < text.length; i += width) lines.push(text.slice(i, i + width));
  return lines.join("\n");
}

// Base64 stores 3 bytes in 4 characters, so the encoded form is always about a
// third larger. Worth showing, since it is the reason not to base64 everything.
export function encodedSize(byteLength) {
  return Math.ceil(byteLength / 3) * 4;
}
