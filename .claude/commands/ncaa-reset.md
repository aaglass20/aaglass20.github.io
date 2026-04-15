# /ncaa-reset — Set up or reset NCAA squares for a new tournament year

Use this when starting a fresh NCAA tournament squares pool, or to audit the current state of the board.

## Files involved
- `ncaa/index.html` — the app (all logic inline)
- `ncaa/ncaa-squares-setup.md` — full Google Sheets schema and Apps Script code

## Google Sheets tabs required
1. **Grid** (B2:K11) — 10x10 square owner names
2. **Numbers** — row/column number assignments (generated once, then locked)
3. **Config** — payout amounts per round (First Four, R64, R32, Sweet 16, Elite 8, Final Four, Championship)
4. **PaidUsers** — Name | Paid (TRUE/FALSE) | Notes
5. **Games** — ESPN game IDs, round, scores, locked status
6. **PaidPayouts** — tracks which winners have been paid out

## Year-over-year reset checklist
When the user says "reset for new year" or "start fresh":
1. Clear the Grid tab (B2:K11 → all empty)
2. Clear the Numbers tab → set Generated to FALSE, clear B1 and B2
3. Reset Config amounts (ask user for new payout structure if changed)
4. Clear PaidUsers (or keep paying users from last year if pool carries over)
5. Clear Games tab — reload with new ESPN game IDs for current tournament
6. Clear PaidPayouts tab
7. Update the year in `ncaa/index.html` title and header (search for "2026" and update to new year)

## Payout config format (Config tab)
| Round | GamesCount | Amount | InverseAmount | ExcludeNormal | ExcludeInverse |
- ExcludeNormal: TRUE = this round excluded from normal pool
- ExcludeInverse: TRUE = excluded from inverse pool
- First Four: both excluded by default
- R64, R32: inverse excluded by default

## After any code changes
```
git add ncaa/index.html
git commit -m "ncaa: <what changed>"
git push
```
