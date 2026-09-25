// Service account signing on Web Crypto, for the Worker build. Everything the
// Admin SDK did with node crypto and google-auth-library: an OAuth access
// token for the REST APIs, Firebase ID token checks, custom tokens and signed
// Storage URLs.

const enc = new TextEncoder();

const b64url = (bytes) => {
  let s = "";
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const b64urlJson = (obj) => b64url(enc.encode(JSON.stringify(obj)));
const fromB64url = (s) => {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
};

let account = null;
let signingKey = null;

export function setServiceAccount({ projectId, clientEmail, privateKey }) {
  account = { projectId, clientEmail, privateKey: String(privateKey || "").replace(/\\n/g, "\n") };
  signingKey = null;
  accessToken = null;
}

export function getServiceAccount() {
  if (!account) throw new Error("firebase-admin shim: initializeApp was not called");
  return account;
}

async function getSigningKey() {
  if (signingKey) return signingKey;
  const pem = getServiceAccount().privateKey;
  const body = pem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const der = Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
  signingKey = await crypto.subtle.importKey("pkcs8", der, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  return signingKey;
}

export async function rsaSign(bytes) {
  return new Uint8Array(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", await getSigningKey(), bytes));
}

export async function signJwt(payload) {
  const head = b64urlJson({ alg: "RS256", typ: "JWT" });
  const body = b64urlJson(payload);
  const sig = await rsaSign(enc.encode(`${head}.${body}`));
  return `${head}.${body}.${b64url(sig)}`;
}

// One token per isolate, refreshed five minutes before Google expires it.
let accessToken = null;
let tokenPending = null;

export async function getAccessToken() {
  if (accessToken && accessToken.expiresAt - 5 * 60 * 1000 > Date.now()) return accessToken.token;
  if (tokenPending) return tokenPending;
  tokenPending = (async () => {
    const now = Math.floor(Date.now() / 1000);
    const assertion = await signJwt({
      iss: getServiceAccount().clientEmail,
      scope: "https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/identitytoolkit",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    });
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: `grant_type=${encodeURIComponent("urn:ietf:params:oauth:grant-type:jwt-bearer")}&assertion=${assertion}`,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.access_token) throw new Error(`Google token exchange failed (${res.status}): ${json.error_description || json.error || ""}`);
    accessToken = { token: json.access_token, expiresAt: Date.now() + (json.expires_in || 3600) * 1000 };
    return accessToken.token;
  })().finally(() => { tokenPending = null; });
  return tokenPending;
}

// Firebase ID tokens are signed by securetoken@; Google publishes the keys as
// a JWK set, which Web Crypto imports directly.
const JWKS_URL = "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";
let jwks = null;

async function getVerifyKey(kid) {
  if (!jwks || jwks.expiresAt < Date.now() || !jwks.keys[kid]) {
    const res = await fetch(JWKS_URL);
    if (!res.ok) throw authError("auth/internal-error", `Could not fetch Firebase signing keys (${res.status})`);
    const maxAge = Number((res.headers.get("cache-control") || "").match(/max-age=(\d+)/)?.[1] || 3600);
    const { keys = [] } = await res.json();
    const imported = {};
    for (const jwk of keys) {
      imported[jwk.kid] = await crypto.subtle.importKey("jwk", { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: "RS256", ext: true }, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
    }
    jwks = { keys: imported, expiresAt: Date.now() + maxAge * 1000 };
  }
  return jwks.keys[kid] || null;
}

export function authError(code, message) {
  const err = new Error(message);
  err.code = code;
  err.errorInfo = { code, message };
  return err;
}

export async function verifyFirebaseIdToken(token) {
  if (typeof token !== "string" || token.split(".").length !== 3) {
    throw authError("auth/argument-error", "Decoding Firebase ID token failed. Make sure you passed a string that represents a complete and valid JWT.");
  }
  const [h, p, s] = token.split(".");
  let header, payload;
  try {
    header = JSON.parse(new TextDecoder().decode(fromB64url(h)));
    payload = JSON.parse(new TextDecoder().decode(fromB64url(p)));
  } catch {
    throw authError("auth/argument-error", "Decoding Firebase ID token failed.");
  }
  const { projectId } = getServiceAccount();
  const now = Math.floor(Date.now() / 1000);
  if (header.alg !== "RS256") throw authError("auth/argument-error", "Firebase ID token has incorrect algorithm.");
  if (payload.aud !== projectId) throw authError("auth/argument-error", "Firebase ID token has incorrect \"aud\" (audience) claim.");
  if (payload.iss !== `https://securetoken.google.com/${projectId}`) throw authError("auth/argument-error", "Firebase ID token has incorrect \"iss\" (issuer) claim.");
  if (typeof payload.sub !== "string" || !payload.sub || payload.sub.length > 128) throw authError("auth/argument-error", "Firebase ID token has an invalid \"sub\" (subject) claim.");
  if (typeof payload.exp !== "number" || payload.exp <= now) throw authError("auth/id-token-expired", "Firebase ID token has expired. Get a fresh ID token from your client app and try again.");
  if (typeof payload.iat !== "number" || payload.iat > now + 300) throw authError("auth/argument-error", "Firebase ID token has an invalid \"iat\" claim.");
  const key = await getVerifyKey(header.kid);
  if (!key) throw authError("auth/argument-error", "Firebase ID token has \"kid\" claim which does not correspond to a known public key.");
  const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, fromB64url(s), enc.encode(`${h}.${p}`));
  if (!ok) throw authError("auth/argument-error", "Firebase ID token has invalid signature.");
  return { ...payload, uid: payload.sub };
}

export async function createCustomToken(uid, claims) {
  const { clientEmail } = getServiceAccount();
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: clientEmail,
    sub: clientEmail,
    aud: "https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit",
    iat: now,
    exp: now + 3600,
    uid,
  };
  if (claims && Object.keys(claims).length) payload.claims = claims;
  return signJwt(payload);
}

// V2 signing, as @google-cloud/storage did by default, so the long expiry
// dates the handlers ask for keep working (V4 caps at seven days).
export async function signStorageUrl(bucket, name, { action = "read", expires } = {}) {
  const method = { read: "GET", write: "PUT", delete: "DELETE" }[action] || "GET";
  const expiresAt = Math.floor(new Date(expires).getTime() / 1000);
  const encodedName = encodeURIComponent(name).replace(/%2F/g, "/");
  const toSign = `${method}\n\n\n${expiresAt}\n/${bucket}/${encodedName}`;
  const sig = await rsaSign(enc.encode(toSign));
  let bin = "";
  for (let i = 0; i < sig.length; i++) bin += String.fromCharCode(sig[i]);
  const qs = `GoogleAccessId=${encodeURIComponent(getServiceAccount().clientEmail)}&Expires=${expiresAt}&Signature=${encodeURIComponent(btoa(bin))}`;
  return `https://storage.googleapis.com/${bucket}/${encodedName}?${qs}`;
}
