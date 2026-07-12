/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: import.meta.dirname,
  },
  async rewrites() {
    // Multi-zone fallback: any path not owned by this app (the dashboard SPA,
    // /login, /api/*, /assets/*) proxies through to the existing Vite app.
    // See: docs/multi-zones.md — "Incremental adoption of Next.js"
    const oldAppOrigin = process.env.OLD_APP_ORIGIN || "http://localhost:5173";
    return {
      fallback: [
        {
          source: "/:path*",
          destination: `${oldAppOrigin}/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
