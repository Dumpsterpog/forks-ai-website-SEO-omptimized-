// Where a visitor came from, carried to the dashboard when they sign up.
//
// A link tags itself with ?source=tiktok (or utm_source, utm_medium,
// utm_campaign, utm_content). The tag is kept for this tab only and added to
// the dashboard address by goToDashboard(), where the app saves it on the new
// account (the app's src/utils/signupSource.js). Without a tag, the outside
// site that sent the visitor stands in.

const KEY = "forks_src";
const PARAMS = ["source", "utm_source", "utm_medium", "utm_campaign", "utm_content"];

const hostOf = (url) => {
  try { return url ? new URL(url).hostname.toLowerCase() : ""; } catch { return ""; }
};
const OWN = /(^|\.)forksai\.app$|(^|\.)workers\.dev$|^localhost$|^127\.0\.0\.1$/;

export function captureSource() {
  try {
    const p = new URLSearchParams(window.location.search);
    const tagged = {};
    for (const k of PARAMS) {
      const v = (p.get(k) || "").trim().slice(0, 80);
      if (v) tagged[k] = v;
    }
    if (tagged.source || tagged.utm_source) {
      sessionStorage.setItem(KEY, JSON.stringify(tagged));
      return;
    }
    if (sessionStorage.getItem(KEY)) return;
    const ref = hostOf(document.referrer);
    if (ref && !OWN.test(ref)) sessionStorage.setItem(KEY, JSON.stringify({ ref }));
  } catch {
    // Storage blocked: the signup is saved as direct.
  }
}

// "source=tiktok&utm_campaign=..." for the dashboard address, or "".
export function sourceQuery() {
  try {
    const v = JSON.parse(sessionStorage.getItem(KEY) || "null");
    if (!v) return "";
    const q = new URLSearchParams();
    for (const k of PARAMS) if (v[k]) q.set(k, v[k]);
    // An untagged visit sent from another site passes on the site's name,
    // which the app groups (google, reddit) like a referrer of its own.
    if (!q.toString() && v.ref) q.set("ref_host", v.ref);
    return q.toString();
  } catch {
    return "";
  }
}
