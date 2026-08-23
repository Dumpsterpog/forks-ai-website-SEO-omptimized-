"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/next";
import { applyConsent, grantedCategories } from "../lib/consent";

// Vercel Analytics is its own script and ignores Google Consent Mode, so the
// only way to honour a refusal is to keep it out of the tree. Also replays the
// stored choice on mount, so a returning visitor who declined is denied again
// before the Google tag has a chance to act on its defaults.
export default function ConsentedAnalytics() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const sync = () => {
      const granted = grantedCategories();
      applyConsent(granted);
      setAllowed(granted.analytics === true);
    };
    sync();
    window.addEventListener("forksai:consent", sync);
    return () => window.removeEventListener("forksai:consent", sync);
  }, []);

  return allowed ? <Analytics /> : null;
}
