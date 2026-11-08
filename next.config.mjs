/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: import.meta.dirname,
  },
  async redirects() {
    return [
  // One address for every page. Vercel did this at its edge; on Cloudflare
  // both names reach the same Worker, so the app does it.
  // The home page on its own: with no path to fill in, the catch-all below
  // sent `:path*` through literally on Cloudflare.
  {
    "source": "/",
    "has": [{ "type": "host", "value": "www.forksai.app" }],
    "destination": "https://forksai.app/",
    "permanent": true
  },
  {
    "source": "/:path*",
    "has": [{ "type": "host", "value": "www.forksai.app" }],
    "destination": "https://forksai.app/:path*",
    "permanent": true
  },
  {
    "source": "/spaced-repetition",
    "destination": "/blog/spaced-repetition",
    "permanent": true
  },
  {
    "source": "/notes-maker",
    "destination": "/notes",
    "permanent": true
  },
  {
    "source": "/blog/remnote-alternative",
    "destination": "/remnote-alternative",
    "permanent": true
  },
  {
    "source": "/blog/ai-summarizer-for-students",
    "destination": "/ai-summarizer",
    "permanent": true
  },
  // Short policy addresses, as older emails and people type them. /privacy
  // fell through to the app fallback and answered a server error.
  { "source": "/privacy", "destination": "/privacy-policy", "permanent": true },
  { "source": "/refund", "destination": "/refund-policy", "permanent": true },
  { "source": "/terms-of-service", "destination": "/terms", "permanent": true },
  // Payment returns. Dodo sent students back here, where the app fallback
  // answered a server error after they paid; the app is on the dashboard
  // domain. The query (payment=success, billing=updated) carries over.
  { "source": "/dashboard", "has": [{ "type": "query", "key": "payment" }], "destination": "https://dashboard.forksai.app/", "permanent": false },
  { "source": "/settings", "destination": "https://dashboard.forksai.app/settings", "permanent": false },
  { "source": "/paid-for-you", "destination": "https://dashboard.forksai.app/paid-for-you", "permanent": false }
];
  },
  async rewrites() {
    // Multi-zone fallback: any path not owned by this app (the dashboard SPA,
    // /login, /api/*, /assets/*) proxies through to the existing Vite app.
    // See: docs/multi-zones.md — "Incremental adoption of Next.js"
    const oldAppOrigin = process.env.OLD_APP_ORIGIN || "http://localhost:5173";
    return {
      // AI agents that ask for markdown get llms.txt at the home page. This
      // was proxy.js, but Node middleware does not run on Cloudflare Workers.
      beforeFiles: [
        {
          source: "/",
          has: [{ type: "header", key: "accept", value: ".*text/markdown.*" }],
          destination: "/llms.txt",
        },
      ],
      fallback: [
        {
          source: "/:path*",
          destination: `${oldAppOrigin}/:path*`,
        },
      ],
    };
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Link", value: '</llms.txt>; rel="alternate"; type="text/markdown"' },
          { key: "Vary", value: "Accept" },
        ],
      },
    ];
  },
};

export default nextConfig;
