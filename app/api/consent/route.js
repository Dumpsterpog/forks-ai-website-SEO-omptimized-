// Consent record for visitors who are not signed in.
//
// The dashboard keeps a per-account trail at users/{uid}/consents. Nobody on
// the marketing site has an account yet, so their choice had nowhere to live
// but the browser it was made in, which is not a record you can produce if
// anyone asks what a visitor agreed to.
//
// localStorage still applies the choice, because a tracker has to be allowed or
// blocked on load and that cannot wait for a round trip. This is the audit copy.
//
// Shape follows what consent management platforms record, so the trail answers
// the questions that actually get asked: who, when, which version of which
// documents, which purposes were granted AND which were refused, how it was
// collected, from where, and when it lapses.
//
//   consentEvents/{autoId}   append-only, one row per action, never rewritten
//   consentLog/{consentId}   current state for that browser, for fast lookup
//
// The event log is append-only on purpose. A record that can be overwritten
// proves nothing about what was agreed before it changed.

import { FieldValue } from "firebase-admin/firestore";
import { getDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Every purpose is listed explicitly so a refusal is recorded as a refusal
// rather than inferred from an absent key.
const CATEGORY_IDS = ["analytics", "ads"];

// Consent is not indefinite. Twelve months is the common renewal period, and
// storing the date makes the lapse auditable instead of implicit.
const CONSENT_TTL_DAYS = 365;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  const consentId = typeof body?.consentId === "string" ? body.consentId.slice(0, 64) : "";
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(consentId)) {
    return Response.json({ error: "Invalid consent id" }, { status: 400 });
  }

  const version = typeof body?.version === "string" ? body.version.slice(0, 40) : "unknown";
  const method = typeof body?.method === "string" ? body.method.slice(0, 40) : "banner";
  const raw = body?.categories && typeof body.categories === "object" ? body.categories : {};

  // Silence is not consent: anything not explicitly granted is a refusal, and a
  // malformed payload must never read as agreement.
  const granted = CATEGORY_IDS.filter((id) => raw[id] === true);
  const denied = CATEGORY_IDS.filter((id) => raw[id] !== true);
  const categories = Object.fromEntries(CATEGORY_IDS.map((id) => [id, raw[id] === true]));

  const fwd = request.headers.get("x-forwarded-for") || "";
  const ip = fwd.split(",")[0].trim().slice(0, 64) || null;
  const userAgent = (request.headers.get("user-agent") || "").slice(0, 400) || null;
  // Vercel resolves this at the edge. Jurisdiction decides which rules apply to
  // a given record, so it belongs in the record.
  const country = request.headers.get("x-vercel-ip-country") || null;
  const referer = (request.headers.get("referer") || "").slice(0, 300) || null;

  const now = Date.now();
  const event = {
    consentId,
    subject: "anonymous",
    source: "marketing",
    consentVersion: version,
    // Which documents this acceptance covers, so a later policy change can be
    // matched against what was actually shown at the time.
    documents: ["privacy", "terms", "refund"],
    categories,
    granted,
    denied,
    rejectedAll: granted.length === 0,
    acceptedAll: denied.length === 0,
    method,
    ip,
    country,
    userAgent,
    referer,
    expiresAt: now + CONSENT_TTL_DAYS * 24 * 60 * 60 * 1000,
    createdAt: FieldValue.serverTimestamp(),
  };

  try {
    const db = getDb();
    const batch = db.batch();

    // Append-only proof trail. Never merged, never overwritten.
    batch.set(db.collection("consentEvents").doc(), event);

    // Current state for this browser, for lookup and for the admin summary.
    batch.set(
      db.collection("consentLog").doc(consentId),
      {
        ...event,
        createdAt: undefined,
        firstSeenAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        changeCount: FieldValue.increment(1),
      },
      { merge: true },
    );

    await batch.commit();
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[consent] write failed:", err);
    // Never surface a storage failure to the visitor. Their choice is already
    // applied client-side, and the banner must not look broken over an audit
    // write they did not ask for.
    return Response.json({ ok: false }, { status: 200 });
  }
}
