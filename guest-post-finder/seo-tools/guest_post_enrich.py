#!/usr/bin/env python3
"""
Enrich a list of guest-post candidate domains with Ahrefs DR + organic traffic,
then filter by quality thresholds.

Usage: python3 guest_post_enrich.py <candidate_domains.csv>
Input CSV columns: domain,guest_post_url,source_query
Output: guest_post_opportunities.csv (filtered + enriched, sorted by DR desc)
"""

import csv
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

# ── .env loader ──────────────────────────────────────────────────────────────

def load_env() -> None:
    p = Path(__file__).parent / ".env"
    if not p.exists():
        return
    for raw in p.read_text().splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


load_env()
AHREFS_KEY = os.environ.get("AHREFS_API_KEY")
if not AHREFS_KEY:
    sys.exit("ERROR: AHREFS_API_KEY not found. Add it to .env")

# ── Config ───────────────────────────────────────────────────────────────────

AHREFS_BASE   = "https://api.ahrefs.com/v3"
TODAY         = date.today().strftime("%Y-%m-%d")
MIN_DR        = 20
MIN_TRAFFIC   = 500
MAX_DOMAINS   = 100      # safety cap to control API spend
OUT_FILE      = Path(__file__).parent / "guest_post_opportunities.csv"

# Same junk-domain set as the competitor tool — never enrich these.
JUNK_DOMAINS = {
    "youtube.com", "youtu.be", "vimeo.com", "dailymotion.com",
    "twitter.com", "x.com", "facebook.com", "instagram.com",
    "linkedin.com", "pinterest.com", "tiktok.com", "snapchat.com",
    "t.me", "telegram.org", "telegram.me",
    "plus.google.com", "reddit.com", "quora.com",
    "medium.com", "substack.com", "tumblr.com",
    "wordpress.com", "blogger.com", "blogspot.com",
    "hashnode.com", "dev.to",
    "goo.gl", "bit.ly", "tinyurl.com", "ow.ly", "buff.ly",
    "google.com", "google.co.uk", "sites.google.com",
    "developers.google.com", "support.google.com",
    "squarespace.com", "wix.com", "weebly.com", "webflow.io",
    "notion.site", "ghost.io",
    "flipboard.com", "feedly.com", "pocket.com", "paper.li",
    "scoop.it", "alltop.com", "news.ycombinator.com",
}


# ── HTTP / Ahrefs ────────────────────────────────────────────────────────────

def http_get(url: str, headers: dict, timeout: int = 30) -> dict:
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        body = e.read().decode()[:400]
        raise RuntimeError(f"HTTP {e.code}: {body}")


def ahrefs_get(path: str, params: dict) -> dict:
    url = f"{AHREFS_BASE}{path}?" + urllib.parse.urlencode(params)
    return http_get(url, {
        "Authorization": f"Bearer {AHREFS_KEY}",
        "Accept": "application/json",
    })


def root_domain(d: str) -> str:
    return (d or "").lower().removeprefix("www.").strip(".")


def is_junk(domain: str) -> bool:
    d = root_domain(domain)
    return any(d == j or d.endswith(f".{j}") for j in JUNK_DOMAINS)


def fetch_metrics(domain: str) -> tuple[float, int]:
    """Return (domain_rating, organic_traffic). One Ahrefs call via /domain-rating
    plus one via /metrics if needed."""
    # DR
    dr_data = ahrefs_get("/site-explorer/domain-rating", {
        "target":   domain,
        "mode":     "domain",
        "protocol": "both",
        "date":     TODAY,
    })
    dr_obj = dr_data.get("domain_rating") or dr_data
    dr = float(dr_obj.get("domain_rating") if isinstance(dr_obj, dict) else (dr_obj or 0) or 0)

    # Traffic
    m_data = ahrefs_get("/site-explorer/metrics", {
        "target":       domain,
        "mode":         "domain",
        "protocol":     "both",
        "date":         TODAY,
        "volume_mode":  "monthly",
    })
    metrics = m_data.get("metrics") or {}
    traffic = int(metrics.get("org_traffic") or metrics.get("organic_traffic") or 0)

    return dr, traffic


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    if len(sys.argv) < 2:
        sys.exit("Usage: python3 guest_post_enrich.py <candidate_domains.csv>")

    in_path = Path(sys.argv[1])
    if not in_path.exists():
        sys.exit(f"ERROR: input file not found: {in_path}")

    # Load + dedupe
    candidates: dict[str, dict] = {}
    with open(in_path) as f:
        reader = csv.DictReader(f)
        for row in reader:
            d = root_domain(row.get("domain") or "")
            if not d:
                continue
            if is_junk(d):
                continue
            if d in candidates:
                continue
            candidates[d] = row

    print(f"📋  {len(candidates)} unique non-junk candidates")

    if len(candidates) > MAX_DOMAINS:
        skipped = len(candidates) - MAX_DOMAINS
        print(f"⚠️  Capping at {MAX_DOMAINS} (skipping {skipped}). Edit MAX_DOMAINS to change.")
        candidates = dict(list(candidates.items())[:MAX_DOMAINS])

    print(f"💸  Estimated API cost: ~{len(candidates) * 2} calls\n")

    # Enrich
    rows: list[dict] = []
    fails = 0
    for i, (domain, info) in enumerate(candidates.items(), 1):
        print(f"  [{i}/{len(candidates)}] {domain} ...", end=" ", flush=True)
        try:
            dr, traffic = fetch_metrics(domain)
        except Exception as e:
            print(f"ERROR: {e}")
            fails += 1
            continue

        kept = dr >= MIN_DR and traffic >= MIN_TRAFFIC
        mark = "✓" if kept else "✗"
        print(f"DR {dr:>4.0f}  traffic {traffic:>8,}/mo  {mark}")

        if kept:
            rows.append({
                "DR":             int(dr),
                "Traffic":        traffic,
                "Domain":         domain,
                "Guest Post URL": info.get("guest_post_url", ""),
                "Source Query":   info.get("source_query", ""),
            })

    if not rows:
        print(f"\n⚠️  No domains passed DR ≥ {MIN_DR} & traffic ≥ {MIN_TRAFFIC}/mo")
        if fails:
            print(f"⚠️  {fails} API failures — partial run, consider re-running")
        return

    rows.sort(key=lambda r: (r["DR"], r["Traffic"]), reverse=True)

    with open(OUT_FILE, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f, fieldnames=["DR", "Traffic", "Domain", "Guest Post URL", "Source Query"]
        )
        writer.writeheader()
        writer.writerows(rows)

    print("─" * 60)
    print(f"✅  {len(rows)} qualifying sites (DR ≥ {MIN_DR}, traffic ≥ {MIN_TRAFFIC}/mo)")
    if fails:
        print(f"⚠️  {fails} API failures during run")
    print(f"📁  {OUT_FILE}\n")
    print("Top 10:")
    for r in rows[:10]:
        print(f"  DR {r['DR']:>3}  {r['Traffic']:>8,}/mo  {r['Domain']}")


if __name__ == "__main__":
    main()
