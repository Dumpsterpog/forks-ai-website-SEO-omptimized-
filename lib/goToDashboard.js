import { auth } from "@/lib/firebase";

const DASHBOARD_URL = "https://dashboard.forksai.app";

/**
 * Sends an authenticated user to the dashboard app, which now lives on its
 * own subdomain instead of forksai.app/dashboard.
 *
 * Firebase Auth session state (IndexedDB) is scoped per-origin, so a plain
 * `window.location.href = "https://dashboard.forksai.app"` would land the
 * user there looking signed out even though they just logged in here. This
 * mints a short-lived custom token via the old app's /api/authBridge
 * (reachable same-origin through the multi-zone fallback rewrite) and hands
 * it to dashboard.forksai.app/auth-bridge, which redeems it with
 * signInWithCustomToken() to establish a session on that origin too.
 *
 * Falls back to same-origin "/dashboard" if the handoff fails for any
 * reason. That path isn't owned by this Next.js app, so it falls through
 * the multi-zone proxy to the old app, whose router treats any unmatched
 * path as an internal redirect to its own dashboard root - so this still
 * lands the user on the dashboard, just without the subdomain hop. Do NOT
 * use "/" here - this app owns "/" itself (the marketing homepage), so
 * that would just reload the landing page instead of reaching the old app.
 */
export async function goToDashboard() {
  const user = auth.currentUser;
  if (!user) {
    window.location.href = "/dashboard";
    return;
  }

  try {
    const idToken = await user.getIdToken();
    const res = await fetch("/api/authBridge", {
      method: "POST",
      headers: { Authorization: `Bearer ${idToken}` },
    });
    const data = await res.json();
    if (data?.success && data?.token) {
      window.location.href = `${DASHBOARD_URL}/auth-bridge?token=${encodeURIComponent(data.token)}`;
      return;
    }
  } catch (err) {
    console.error("goToDashboard: auth bridge handoff failed", err);
  }

  window.location.href = "/dashboard";
}
