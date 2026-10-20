"use client";

import { useEffect } from "react";
import { captureSource } from "@/lib/attribution";

// Notes a tagged link (?source=tiktok) on whichever page a visitor lands, so
// a later sign-up can carry it to the dashboard. Renders nothing.
export default function SourceCapture() {
  useEffect(() => { captureSource(); }, []);
  return null;
}
