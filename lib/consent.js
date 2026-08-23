// Consent categories for the marketing site. Deliberately the same shape and
// the same localStorage key as the dashboard's src/utils/consent.js, so a
// visitor who chooses here is not asked again after signing in, and a choice
// made in either place is honoured in both.
//
// The two copies exist because the sites are separate deployments on separate
// origins with no shared bundle. Keep them in step: the storage key, the
// version and the category ids are the contract between them.

export const CONSENT_VERSION = "2026-08-23";
export const CONSENT_STORAGE_KEY = "forksai_privacy_consent";
// Opaque per-browser id so the audit trail can tie a change of mind to the
// earlier record without knowing anything about who made it.
export const CONSENT_ID_KEY = "forksai_consent_id";
export const CONSENT_DATE_LABEL = "August 23, 2026";

export const CONSENT_CATEGORIES = [
  {
    id: "essential",
    label: "Essential",
    required: true,
    desc: "Remembering this choice and keeping the site working. Nothing here identifies you.",
  },
  {
    id: "analytics",
    label: "Analytics",
    required: false,
    desc: "Anonymous page and performance measurement, so we can see which pages are slow or unread. Never linked to a name or email.",
  },
  {
    id: "ads",
    label: "Advertising",
    required: false,
    desc: "Google Ads measurement, used to see whether an ad led someone to sign up. Declining stops advertising cookies from being set.",
  },
];

const OPTIONAL = CONSENT_CATEGORIES.filter((c) => !c.required).map((c) => c.id);
export const ALL_GRANTED = Object.fromEntries(OPTIONAL.map((id) => [id, true]));
export const ALL_DENIED = Object.fromEntries(OPTIONAL.map((id) => [id, false]));

export function consentId() {
  if (typeof window === "undefined") return null;
  try {
    let id = window.localStorage.getItem(CONSENT_ID_KEY);
    if (!id) {
      id = (crypto.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36))
        .replace(/[^A-Za-z0-9_-]/g, "");
      window.localStorage.setItem(CONSENT_ID_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

// Best-effort audit copy. The choice is already applied locally by the time
// this runs, so a failure here must never block or surface to the visitor.
function recordConsent(categories, method) {
  const id = consentId();
  if (!id) return;
  try {
    const payload = JSON.stringify({
      consentId: id,
      version: CONSENT_VERSION,
      categories,
      method,
    });
    // Survives the page being navigated away from mid-request.
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/consent", new Blob([payload], { type: "application/json" }));
      return;
    }
    fetch("/api/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Non-blocking by design.
  }
}

export function readConsent() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? parsed : null;
  } catch {
    return null;
  }
}

// What a stored record actually granted. Anything written before categories
// existed granted nothing: those visitors were never asked.
export function grantedCategories(stored) {
  const rec = stored === undefined ? readConsent() : stored;
  if (!rec || rec.version !== CONSENT_VERSION) return { ...ALL_DENIED };
  const c = rec.categories;
  if (!c || typeof c !== "object") return { ...ALL_DENIED };
  return Object.fromEntries(OPTIONAL.map((id) => [id, c[id] === true]));
}

export function needsPrompt() {
  const rec = readConsent();
  return !rec || rec.version !== CONSENT_VERSION;
}

// Google Consent Mode v2. Safe before gtag.js has loaded: the commands queue
// on dataLayer and replay once it does.
export function applyConsent(categories) {
  if (typeof window === "undefined") return;
  try {
    window.dataLayer = window.dataLayer || [];
    const gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    gtag("consent", "update", {
      analytics_storage: categories?.analytics ? "granted" : "denied",
      ad_storage: categories?.ads ? "granted" : "denied",
      ad_user_data: categories?.ads ? "granted" : "denied",
      ad_personalization: categories?.ads ? "granted" : "denied",
    });
  } catch {
    // A consent signal failing must never take the page with it.
  }
}

export function writeConsent(categories, method = "banner") {
  const clean = Object.fromEntries(OPTIONAL.map((id) => [id, categories?.[id] === true]));
  try {
    window.localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({
        accepted: true,
        version: CONSENT_VERSION,
        uid: null,
        clicked: true,
        categories: clean,
        date: new Date().toISOString(),
      }),
    );
  } catch {
    // Private mode or a full quota: the choice cannot persist, so the banner
    // asks again next visit rather than assuming agreement.
  }
  applyConsent(clean);
  recordConsent(clean, method);
  window.dispatchEvent(new CustomEvent("forksai:consent"));
  return clean;
}
