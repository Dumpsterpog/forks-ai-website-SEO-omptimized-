// The FORKSAI Android beta: its links, and a QR code that opens
// forksai.app/android (both steps of joining) on a phone. The QR is made with
// the site's own encoder (lib/formatToolsQr.js) when the module loads, as one
// SVG path, so it costs no image request and stays sharp at any size.
import { encodeQr } from "@/lib/formatToolsQr";

export const ANDROID_BETA = {
  page: "https://forksai.app/android",
  // The testers' Google Group: anyone can join, with the Google account on
  // their phone. Google Play only lets members of it become testers.
  group: "https://groups.google.com/g/forksai-android-testers",
  // Google Play's testing page: "Become a tester", then install.
  play: "https://play.google.com/apps/testing/app.forksai",
  version: "1.1.0",
};

const QR = encodeQr(ANDROID_BETA.page, { ecl: "M" });
let path = "";
for (let y = 0; y < QR.size; y += 1) {
  let x = 0;
  while (x < QR.size) {
    if (QR.modules[y][x]) {
      const start = x;
      while (x < QR.size && QR.modules[y][x]) x += 1;
      path += `M${start} ${y}h${x - start}v1H${start}z`;
    } else x += 1;
  }
}

export default function AndroidQr({ size = 120, ink = "#11002e", paper = "#ffffff", style }) {
  const pad = 2;
  const dim = QR.size + pad * 2;
  return (
    <svg width={size} height={size} viewBox={`${-pad} ${-pad} ${dim} ${dim}`} shapeRendering="crispEdges" role="img" aria-label="QR code that opens forksai.app/android" style={{ display: "block", ...style }}>
      <rect x={-pad} y={-pad} width={dim} height={dim} fill={paper} />
      <path d={path} fill={ink} />
    </svg>
  );
}

// Google Play's own triangle, which people look for before tapping.
export function PlayMark({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path fill="#34A853" d="M3.6 2.3 13.4 12 3.6 21.7c-.4-.2-.6-.6-.6-1.1V3.4c0-.5.2-.9.6-1.1z" />
      <path fill="#FBBC04" d="m16.7 15.3-3.3-3.3 3.3-3.3 3.7 2.1c1 .6 1 1.9 0 2.4z" />
      <path fill="#4285F4" d="M3.6 2.3c.3-.2.8-.2 1.2 0l11.9 6.4-3.3 3.3z" />
      <path fill="#EA4335" d="M3.6 21.7 13.4 12l3.3 3.3-11.9 6.4c-.4.2-.9.2-1.2 0z" />
    </svg>
  );
}
