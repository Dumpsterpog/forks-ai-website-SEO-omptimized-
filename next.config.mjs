/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: import.meta.dirname,
  },
  async redirects() {
    return [
  // One address for every page. Vercel did this at its edge; on Cloudflare
  // both names reach the same Worker, so the app does it.
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
  }
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
