import { track as vercelTrack } from "@vercel/analytics";

/**
 * Signup / login click tracking.
 *
 * The site already loads the Google Ads gtag (AW-18068336980, see app/layout.js)
 * but never fired a single event, so Google had no conversion signal to
 * optimise campaigns against and there was no way to tell whether a landing
 * page change actually moved signups.
 *
 * Three sinks, all best-effort and independently optional:
 *
 *  1. Vercel Analytics custom event - works with zero configuration, shows up
 *     under Events in the Vercel dashboard.
 *  2. A named gtag event - importable as a conversion in GA4 / Google Ads.
 *  3. The classic Google Ads conversion event, which needs the per-conversion
 *     label from the Ads UI (Goals > Conversions > your action > tag setup).
 *     Set NEXT_PUBLIC_GADS_SIGNUP_LABEL to that label to switch it on; without
 *     it this step is skipped rather than firing a broken send_to.
 *
 * Never throws: analytics must not be able to block the redirect to signup.
 */

const GOOGLE_ADS_ID = "AW-18068336980";
const SIGNUP_LABEL = process.env.NEXT_PUBLIC_GADS_SIGNUP_LABEL;

export function trackSignupClick(location, action = "signup") {
  // Call sites pass a string, but a stray `onClick={goSignup}` would hand us a
  // React event instead - coerce anything unexpected rather than reporting
  // "[object Object]" as the location for the rest of time.
  const where = typeof location === "string" && location ? location : "unknown";

  try {
    vercelTrack("signup_click", { location: where, action });
  } catch {
    /* analytics blocked or not yet loaded */
  }

  try {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", action === "login" ? "login_click" : "sign_up_click", {
        location: where,
      });

      if (SIGNUP_LABEL) {
        window.gtag("event", "conversion", {
          send_to: `${GOOGLE_ADS_ID}/${SIGNUP_LABEL}`,
        });
      }
    }
  } catch {
    /* gtag blocked by an ad blocker */
  }
}
