// Firebase Admin, used by exactly one route handler: /api/tool-used.
//
// Credentials are optional on purpose. The marketing site builds and runs fine
// without them, and the only thing that stops working is the free tool usage
// counter, which is instrumentation. A missing env var must never take the
// site down, so every consumer has to handle a null database.
//
// Modular imports rather than the `admin.firestore()` namespace the dashboard
// repo uses: firebase-admin 14 removed that namespace.

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;

export const hasAdminCredentials = Boolean(
  FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY
);

// Initialised on first use rather than at import, so a build with no
// credentials in the environment never touches the SDK.
export function getDb() {
  if (!hasAdminCredentials) return null;
  const app = getApps().length
    ? getApps()[0]
    : initializeApp({
        credential: cert({
          projectId: FIREBASE_PROJECT_ID,
          clientEmail: FIREBASE_CLIENT_EMAIL,
          // The key may arrive with literal backslash-n sequences (dotenv
          // format) or with real newlines (pasted into the Vercel UI).
          // Converting the former leaves the latter alone, so both work.
          // This previously matched a real newline and replaced it with a
          // real newline, which did nothing.
          privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      });
  return getFirestore(app);
}
