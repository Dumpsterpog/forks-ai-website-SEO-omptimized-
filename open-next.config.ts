// Every page on the marketing site is prerendered, so the pages are served
// straight from Workers static assets. No R2 bucket (which needs billing on
// the account) and no revalidation.
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
