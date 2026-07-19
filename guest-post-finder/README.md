# Guest Post Finder — a Claude Code skill

Find high-quality sites in any niche that openly accept guest posts. It runs ~20 Google
"write for us" searches, dedupes the domains, then ranks them by **Ahrefs Domain Rating +
organic traffic** — so you get a clean, prioritized list instead of raw search noise.

## Setup (about 2 minutes)

1. **Install Claude Code** (if you haven't): https://claude.com/claude-code

2. **Add your Ahrefs API key.** The ranking step uses Ahrefs, which needs a paid API key.
   ```bash
   cd seo-tools
   cp .env.example .env
   ```
   Open `.env` and paste your key after `AHREFS_API_KEY=`.

   > No Ahrefs key? It still runs the searches and gives you a raw candidate list —
   > you just won't get the DR / traffic ranking.

3. **Python 3.9+** — already on most Macs. Check with `python3 --version`.
   (No extra packages to install — the script uses only the standard library.)

## Use it

Open **this folder** in Claude Code (run `claude` from here, or open the folder in the app),
then either:

- Type a slash command:  `/guest-posts ai seo`
- Or just ask in plain English:  *"find guest post sites for the dog grooming niche"*

Claude runs the searches, enriches each domain with Ahrefs, and hands you a ranked table.
Full results are saved to `seo-tools/guest_post_opportunities.csv`.

> **First time in this folder:** if `/guest-posts` doesn't show up, restart the session —
> Claude Code loads skills when it starts.

## What's inside

| File | Role |
|---|---|
| `.claude/skills/guest-posts/SKILL.md` | The skill — orchestrates searches → dedupe → enrich → rank |
| `seo-tools/guest_post_enrich.py` | Enriches domains with Ahrefs DR + traffic; keeps DR ≥ 20 & traffic ≥ 500/mo |
| `seo-tools/.env.example` | Template for your Ahrefs API key |

## Tuning

Want a stricter or looser list? Edit the thresholds near the top of
`seo-tools/guest_post_enrich.py`:

```python
MIN_DR      = 20     # minimum Domain Rating
MIN_TRAFFIC = 500    # minimum organic visits / month
MAX_DOMAINS = 100    # safety cap on how many domains to enrich (controls API spend)
```
