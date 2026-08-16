// Free tool usage counting.
//
// The free tools are the SEO surface, and the only question worth answering
// about them is which ones people actually use. That needs one number per
// tool, so one number per tool is all this sends.
//
// What leaves the browser is a single JSON object: { "tool": "<slug>" }. The
// slug is read off location.pathname, so it names a page, never a person and
// never anything typed, pasted or uploaded into the tool. No identifier, no
// session id, no timestamp, no file, no input. The tools stay entirely
// client-side: nothing here reads or forwards what the visitor is working on.
//
// Cost matters too, because these pages are built for volume. A visitor who
// compresses forty images must not cost forty Firestore writes, so a
// sessionStorage guard caps it at one write per tool per session. Everything
// is fire and forget and every failure is swallowed: a tool must work
// identically with this endpoint down, blocked by an ad blocker, or removed.

const SESSION_PREFIX = "forks_tool_counted_";

// The slug is validated server side against the real tool list, so an
// unexpected pathname costs a rejected request rather than a stray document.
const SLUG_PATTERN = /^[a-z0-9-]{2,64}$/;

// Result panels render on the first paint too, and several calculators ship
// with prefilled defaults, so counting a rendered result alone would count
// page views. This flag separates "the page loaded" from "someone used it".
let interacted = false;
let listening = false;

function listen() {
  if (listening || typeof document === "undefined") return;
  listening = true;
  const mark = () => {
    interacted = true;
  };
  // Capture phase, so the flag is set before React processes the same event
  // and re-renders the result.
  for (const type of ["input", "change", "keydown", "pointerdown"]) {
    document.addEventListener(type, mark, { capture: true, passive: true });
  }
}

if (typeof document !== "undefined") listen();

function currentSlug() {
  return window.location.pathname.replace(/^\/+|\/+$/g, "");
}

/**
 * Records that the tool on the current page was genuinely used. Call it from
 * the moment the visitor gets output: a download, a copy, a generated result.
 */
export function countToolUse() {
  try {
    if (typeof window === "undefined") return;

    const slug = currentSlug();
    if (!SLUG_PATTERN.test(slug)) return;

    const key = SESSION_PREFIX + slug;
    if (window.sessionStorage.getItem(key)) return;
    // Written before the request, not after, so a slow network cannot let a
    // second action through while the first is still in flight.
    window.sessionStorage.setItem(key, "1");

    fetch("/api/tool-used", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tool: slug }),
      // No cookies, and the request must not hold the page open.
      credentials: "omit",
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* private mode blocks sessionStorage, or the fetch was blocked */
  }
}

/**
 * The same thing for tools whose output is a live result panel rather than a
 * download. Only counts once the visitor has actually touched an input, so a
 * calculator that shows a result for its default values does not count the
 * page view.
 */
export function countToolUseOnResult() {
  if (!interacted) return;
  countToolUse();
}
