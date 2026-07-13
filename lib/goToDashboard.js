import { auth } from "@/lib/firebase";

const DASHBOARD_URL = "https://dashboard.forksai.app";

/**
 * Sends an authenticated user to the dashboard app, which now lives on its
 * own subdomain instead of forksai.app/dashboard.
 *
 * Firebase Auth session state (IndexedDB) is scoped per-origin, so a plain
 * `window.location.href = "https://dashboard.forksai.app"` would land the
 * user there looking signed out even though they just logged in here. This
 * mints a short-lived custom token via the old app's /api/authBridge and
 * hands it to dashboard.forksai.app/auth-bridge, which redeems it with
 * signInWithCustomToken() to establish a session on that origin too.
 *
 * The token-mint call goes directly cross-origin to
 * dashboard.forksai.app/api/authBridge (CORS-enabled there for
 * https://forksai.app) rather than through this app's same-origin
 * /api/authBridge, which would depend on the multi-zone fallback proxy's
 * OLD_APP_ORIGIN env var being configured correctly. That dependency caused
 * a real outage: already-authenticated users were falling through to a
 * same-origin "/dashboard" fallback that 404'd because OLD_APP_ORIGIN was
 * still pointing at localhost in production. Calling the dashboard's own
 * domain directly makes this handoff independent of that proxy entirely.
 *
 * Falls back to a plain (session-less) redirect to dashboard.forksai.app if
 * the handoff fails for any reason - the user will need to sign in again
 * there, but at least they land on a working page instead of a broken proxy
 * error.
 */
export async function goToDashboard() {
  const user = auth.currentUser;
  if (!user) {
    window.location.href = DASHBOARD_URL;
    return;
  }

  try {
    const idToken = await user.getIdToken();
    const res = await fetch(`${DASHBOARD_URL}/api/authBridge`, {
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

  window.location.href = DASHBOARD_URL;
}
