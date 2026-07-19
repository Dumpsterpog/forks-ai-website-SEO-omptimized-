---
name: guest-posts
description: Find guest-post opportunities for a niche keyword. Runs ~20 Google footprint searches, dedupes domains, then filters by Ahrefs DR ≥ 20 + organic traffic ≥ 500/mo. Use this when the user types /guest-posts <niche> or asks to find guest posting sites for a niche.
---

# Guest post opportunity finder

Goal: hand the user a ranked list of high-quality sites in their niche that openly accept guest posts.

## Steps

1. **Get the niche keyword** from the user's arguments (e.g. `seo`, `ai content`, `email marketing`). If missing, ask before doing anything else.

2. **Run all 20 Google footprints in PARALLEL via WebSearch** (load WebSearch via ToolSearch first if its schema isn't already loaded). Substitute the niche keyword for `<niche>` in each:
   - `inurl: "guest post" "<niche>"`
   - `inurl: "write for us" "<niche>"`
   - `<niche> + write for us + guest post`
   - `submit guest post + <niche>`
   - `<niche> "write for us"`
   - `<niche> accepting guest posts`
   - `"<niche>" + "Write for us"`
   - `"<niche>" + "Submit your article"`
   - `"<niche>" + "write for us"`
   - `"<niche>" + "write for me"`
   - `"<niche>" + "become a contributor"`
   - `"<niche>" + "guest post"`
   - `"<niche>" + "blogging guidelines"`
   - `<niche> + "guest post guidelines"`
   - `"<niche>" + "contribute"`
   - `"<niche>" + "guest column"`
   - `"<niche>" + "submit a guest post"`
   - `"<niche>" + "accepting guest posts"`
   - `"<niche>" + "Now Accepting Guest Posts"`
   - `"<niche>" + "contribute to this site"`

3. **Collect results.** For each search result URL, extract the hostname (lowercase, strip `www.`). Keep one result per domain — the first guest-post URL seen wins. Skip results where the hostname is itself google.com / search engines.

4. **Write candidate CSV** to `seo-tools/candidate_domains.csv` with columns exactly: `domain,guest_post_url,source_query`. One row per unique domain.

5. **Run** `python3 seo-tools/guest_post_enrich.py seo-tools/candidate_domains.csv` from the project directory. The script reads the CSV, drops junk domains (social/UGC), enriches each domain with Ahrefs DR + organic traffic, filters to DR ≥ 20 and traffic ≥ 500/mo, and writes `seo-tools/guest_post_opportunities.csv`.

6. **If the script fails** (missing key, API error), show the error and stop. Do not retry.

7. **Summarize** the top 20 from `seo-tools/guest_post_opportunities.csv` as a markdown table:
   | DR | Traffic/mo | Domain | Guest Post Page |
   sorted by DR desc, then traffic desc.

8. If fewer than 5 sites pass the filter, tell the user and suggest broadening the niche keyword (e.g. `seo` → `digital marketing`).

Do not modify `guest_post_enrich.py`. Do not call any other APIs. Do not generate outreach emails unless the user explicitly asks.
