// Percent encoding, with the encodeURI and encodeURIComponent distinction made
// visible rather than left as a footnote. Both are offered side by side because
// picking the wrong one is the actual problem people arrive with.

// Space becomes a plus sign in application/x-www-form-urlencoded, which is what
// HTML forms and most query strings historically use. It is not the same as
// percent encoding, and mixing the two is its own class of bug.
function encodeForm(text) {
  return encodeURIComponent(text).replace(/%20/g, "+");
}

function decodeForm(text) {
  return decodeURIComponent(text.replace(/\+/g, " "));
}

export const ENCODERS = [
  {
    id: "component",
    label: "encodeURIComponent",
    sub: "For one piece of a URL",
    note: "Escapes everything except letters, digits and - _ . ! ~ * ' ( ). Use it for a single query parameter value, a path segment or a fragment, because it escapes the separators that would otherwise end the value early.",
    encode: encodeURIComponent,
    decode: decodeURIComponent,
  },
  {
    id: "uri",
    label: "encodeURI",
    sub: "For a whole URL",
    note: "Leaves the reserved characters ; / ? : @ & = + $ , # alone, because in a complete URL they are structure rather than data. Use it when you have an entire address that only needs its spaces and non ASCII characters escaped.",
    encode: encodeURI,
    decode: decodeURI,
  },
  {
    id: "form",
    label: "Form encoding",
    sub: "Spaces become plus",
    note: "The application/x-www-form-urlencoded variant, which is what an HTML form submits and what most query strings use. Identical to encodeURIComponent except that a space becomes a plus sign rather than %20.",
    encode: encodeForm,
    decode: decodeForm,
  },
];

export function runEncoder(encoder, text) {
  if (text === "") return { ok: true, value: "" };
  try {
    return { ok: true, value: encoder.encode(text) };
  } catch {
    // Thrown by a lone surrogate, which cannot be turned into UTF-8 bytes.
    return {
      ok: false,
      error: "That text contains an unpaired surrogate character, which has no UTF-8 representation.",
    };
  }
}

export function runDecoder(encoder, text) {
  if (text === "") return { ok: true, value: "" };
  try {
    return { ok: true, value: encoder.decode(text) };
  } catch {
    // Two different failures wear the same exception. Either a percent sign is
    // not followed by two hexadecimal digits, or the escapes are well formed
    // but the bytes they spell out are not valid UTF-8, which is what a
    // half copied multi byte character looks like.
    const malformed = text.match(/%(?![0-9A-Fa-f]{2}).{0,2}/);
    return {
      ok: false,
      error: malformed
        ? `Malformed percent escape near "${malformed[0]}". Every percent sign has to be followed by two hexadecimal digits, and a literal percent sign is written %25.`
        : "The escapes are well formed, but the bytes they spell out are not valid UTF-8. A multi byte character such as an accented letter or an emoji has probably been cut in half.",
    };
  }
}

// The reserved characters, which are exactly where the two functions disagree.
// Shown as a table on the page, because seeing the difference settles the
// question faster than any amount of prose.
export const RESERVED_COMPARISON = [
  { char: "space", uri: "%20", component: "%20", form: "+" },
  { char: "/", uri: "/", component: "%2F", form: "%2F" },
  { char: "?", uri: "?", component: "%3F", form: "%3F" },
  { char: "&", uri: "&", component: "%26", form: "%26" },
  { char: "=", uri: "=", component: "%3D", form: "%3D" },
  { char: "#", uri: "#", component: "%23", form: "%23" },
  { char: ":", uri: ":", component: "%3A", form: "%3A" },
  { char: "+", uri: "+", component: "%2B", form: "%2B" },
  { char: "@", uri: "@", component: "%40", form: "%40" },
  { char: "é", uri: "%C3%A9", component: "%C3%A9", form: "%C3%A9" },
];

/**
 * Splits a URL into its parts so the page can show which piece each encoder
 * belongs on. Uses the URL parser rather than a regular expression, and simply
 * reports that it is not a full URL when it is not.
 */
export function describeUrl(text) {
  const trimmed = text.trim();
  if (!trimmed) return null;
  let url;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }
  const params = [];
  url.searchParams.forEach((value, key) => params.push({ key, value }));
  return {
    protocol: url.protocol.replace(":", ""),
    host: url.host,
    path: url.pathname,
    hash: url.hash.replace("#", ""),
    params,
  };
}
