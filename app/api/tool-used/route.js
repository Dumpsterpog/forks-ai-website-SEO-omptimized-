// Free tool usage counter.
//
// Stores one integer per tool and nothing else. The whole document is
// { count, updatedAt }, keyed by the tool slug, and the request body it
// accepts is { tool: "<slug>" }. There is deliberately no events collection:
// per-event rows would be a log of who did what and when, which is exactly
// what these tools promise not to keep. Aggregate counters cannot be
// correlated back to anyone because there is nothing in them to correlate.
//
// Nothing about the caller is read: no uid, no IP, no user agent, no referrer.
// The request is not even parsed beyond the slug.

import { ALL_TOOLS } from "@/app/tools/toolGroups";
import { FieldValue } from "firebase-admin/firestore";
import { getDb } from "@/lib/firebaseAdmin";

// The Admin SDK is not edge-compatible.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Read out of the lists that already own the tools, so the endpoint can only
// ever touch a document that corresponds to a real page. Without this the URL
// would let anyone create arbitrary documents in the collection.
const KNOWN_SLUGS = new Set(ALL_TOOLS.map((tool) => tool.href.replace(/^\//, "")));

export async function POST(request) {
  let tool;
  try {
    ({ tool } = await request.json());
  } catch {
    return new Response(null, { status: 400 });
  }

  if (typeof tool !== "string" || !KNOWN_SLUGS.has(tool)) {
    return new Response(null, { status: 400 });
  }

  try {
    const db = getDb();
    // No credentials configured: the tool still worked, so this is not an error
    // the visitor should ever see.
    if (!db) return new Response(null, { status: 204 });

    await db
      .collection("toolUsage")
      .doc(tool)
      .set(
        {
          count: FieldValue.increment(1),
          // Collection level, not per event, so it says "this tool is still in
          // use" without recording when any individual person used it.
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
  } catch (err) {
    console.error("tool-used counter failed:", err?.message);
  }

  return new Response(null, { status: 204 });
}
