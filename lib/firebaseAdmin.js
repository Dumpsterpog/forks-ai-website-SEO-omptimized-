// Firestore for the two route handlers that write to it: /api/tool-used and
// /api/consent.
//
// Credentials are optional on purpose. The marketing site builds and runs fine
// without them, and the only things that stop working are the free tool usage
// counter and the consent log. A missing env var must never take the site
// down, so every consumer has to handle a null database.
//
// Firestore is reached over its REST API (lib/firestore-rest) rather than
// through firebase-admin, whose Firestore client cannot load on Cloudflare
// Workers. The client has the same shape, so it runs on Vercel too.

import { Firestore, FieldValue } from "./firestore-rest/firestore.js";
import { setServiceAccount } from "./firestore-rest/google-auth.js";

export { FieldValue };

const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;

export const hasAdminCredentials = Boolean(
  FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY
);

let db = null;

// Set up on first use rather than at import, so a build with no credentials
// in the environment never touches it.
export function getDb() {
  if (!hasAdminCredentials) return null;
  if (!db) {
    // The key may arrive with literal backslash-n sequences (dotenv format)
    // or with real newlines (pasted into a dashboard); the client handles both.
    setServiceAccount({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY,
    });
    db = new Firestore();
  }
  return db;
}
