# /fantasy-rankings — Update fantasy baseball player rankings

Update `data.json` and/or `top300.json` in `/fantasy-baseball/` with new player rankings, tier changes, injuries, or notes.

## Data files
- `fantasy-baseball/data.json` — full tiered rankings by position (C, 1B, 2B, SS, 3B, OF, SP, RP) with notes, sleepers, projected points
- `fantasy-baseball/top300.json` — flat list of top 300 players with rank, name, team, pos, posRk, mar2

## What to ask before updating
1. Which positions need changes?
2. New player additions, drops, or tier moves?
3. Any injury flags to add (`()` around name = injured, `^` = injury risk)?
4. Update `lastUpdated` date in `data.json`?

## data.json tier format
```json
"Tier 1 — The Elite": ["Player Name (projectedPts)", ...]
"Tier 2 — The Near-Elite": ["Player Name", { "name": "Player", "tag": "sleeper" }]
```
- Projected points in parentheses are optional
- Sleeper tag: use object format `{ "name": "...", "tag": "sleeper" }`
- Injured: wrap name in `()` — e.g., `"(Fernando Tatis Jr.)"`
- Injury risk: append `^` — e.g., `"Fernando Tatis Jr. ^"`

## top300.json format
```json
{ "rank": 1, "name": "Aaron Judge", "team": "Yankees", "pos": "OF", "posRk": 1, "mar2": 1 }
```

## After updating
```
git add fantasy-baseball/data.json fantasy-baseball/top300.json
git commit -m "update fantasy baseball rankings: <what changed>"
git push
```
