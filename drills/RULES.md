# Drill Lab (`/drills`) — Project Rules

A review library of drills, gathered by Claude from across the web, for the
**Coach Approach** app (`/ca`). Browse by sport, search, decide what to keep,
and copy a drill's export straight into Coach Approach.

> **Self-maintaining doc.** Claude updates this file whenever a rule changes,
> and updates `CANDIDATES.md` whenever drills are added, skipped, or found.

---

## Goals
1. Collect **many** good drills per sport (Coach Approach's biggest content need).
2. Keep only the **best** ones — clear, age-appropriate, easy to run, coachable.
3. Every drill uses the same fields so it can drop into Coach Approach unchanged.

## Ground rules
- **All code, no database.** Drills live in `data/<sport>.js`. No Supabase, no Sheets, no fetch.
- **No build step.** Plain HTML/CSS/JS; works from `file://` and GitHub Pages. That's why
  data files are `.js` (they assign to `window.DRILL_DATA`) instead of `.json` — `fetch` of
  local JSON fails on `file://`.
- **Write in our own words.** Drills come from many sources; never paste a site's text.
  Rewrite, combine the best ideas from several sources, and list them in `sources`.
- **No duplicates.** Check `CANDIDATES.md` and the sport's data file before adding.
  The same drill under another name → add the name to `altNames` instead.
- Brand follows Coach Approach (`ca/NOTES.md`): navy `#0F1D2E`, orange `#FF6B1A`,
  teal `#00BDB0`, Barlow Condensed headlines.

## Files
| File | What |
|---|---|
| `index.html` | The review UI (sport tabs, search, filters, drill detail, copy export) |
| `css/styles.css` | Styles |
| `js/sports.js` | Sports list + each sport's categories (`window.SPORTS`) |
| `js/app.js` | UI logic |
| `data/<sport>.js` | Drills for one sport — `DRILL_DATA.<sport> = [ … ]` |
| `CANDIDATES.md` | Index of drill ideas to research + where to find them, with status |
| `scripts/validate.js` | Checks every data file against the data model |
| `RULES.md` | This file |

**Adding a sport:** add it to `js/sports.js`, create `data/<id>.js`, and add a
`<script src="data/<id>.js">` tag in `index.html`.

---

## Drill data model

```js
{
  id: 'rondo-4v1',                 // kebab-case, unique within the sport, never renamed
  name: 'Rondo 4v1',
  altNames: ['Monkey in the Middle', 'Keep Away'],
  objective: 'One or two sentences: what the drill trains and why.',
  setup: ['Grid: 10x10 yd square', 'Players: 4 outside, 1 defender inside'],
  directions: ['Step 1 …', 'Step 2 …'],            // Directions (sequence of play), in order
  variations: ['Easier: …', 'Harder: …'],          // label progressions Easier/Harder when it fits
  coachingPoints: ['Open body to the field', '…'],
  equipment: ['1 ball', '4 cones', '1 pinnie'],
  ages: ['U8', 'U10', 'U12'],                      // from AGE_BANDS below
  categories: ['Possession', 'Passing'],           // from the sport's list in js/sports.js; first = primary
  // ── optional ──
  players: '5 per group',                          // how many it needs
  duration: '10–15 min',
  adaptations: ['…'],                              // how to adjust for athletes with disabilities / mixed ability
  sportFocus: ['Any', 'Soccer'],                   // which program sports it fits — list in js/sports.js (SPORT_FOCUS); mainly for Adaptive
  status: 'candidate',                             // 'candidate' (default) | 'approved' | 'rejected'
  sources: [{ name: 'Site or book', url: 'https://…' }],
  notes: 'Why we picked it / anything to watch.'
}
```

### Field rules
- **Required:** `id, name, altNames, objective, setup, directions, variations,
  coachingPoints, equipment, ages, categories`. Use `[]` when there truly are none.
- **Lists are arrays of short strings** — one idea per line, no paragraphs.
- **`directions`** read as a sequence of play: start → how it runs → scoring/rotation → end.
- **`coachingPoints`**: 3–6 short cues a coach can shout ("Eyes up", "Low and wide").
- **`categories`**: 1–3, primary first. Only names from that sport's list in `js/sports.js`.
  Need a new category? Add it to `js/sports.js` and note it in the decision log below.
- **Adaptive Sports drills** always fill `adaptations` (wheelchair, visual/hearing, sensory, buddy support) and `sportFocus`
  (`Any` for general movement; a sport when it builds toward that sport, e.g. Basket Drop → Basketball).
- **`ages`** use the shared bands: `U6, U8, U10, U12, U14, HS, Adult`.
- **`status`** starts as `candidate`. Aaron decides; Claude flips to `approved`/`rejected`
  when told. Rejected drills stay in the file (so we don't re-add them) but are hidden by default.

### Softball + baseball pairs
- Most diamond drills live in **both** `data/softball.js` and `data/baseball.js` with the **same `id`**,
  adjusted per sport (ball, base distance, pitching style).
- When you edit or add one, check whether its twin in the other file should change too.
- Sport-only drills: windmill pitching / slap hitting (softball); overhand pitching (balance point, towel, stride direction), PFP, pickoffs, leadoffs (baseball).

## Choosing the "best" drills
Prefer drills that:
- Have **lots of touches / reps** and little standing in line.
- Are **game-like** (decisions, opponents, direction) over pure technique where possible.
- Scale cleanly with **Easier / Harder** variations across ages.
- Need **common equipment** (balls, cones, pinnies, goals).
- Are **well-known** (several sources describe them) — or clearly excellent if not.

Skip drills that are unsafe for youth, need special gear, or duplicate one we have.

## Drills Aaron pastes in
- Reshape into the data model; keep his sequence and coaching points, tighten the wording.
- Fill any missing fields (`altNames`, `setup`, `variations`, `ages`, `categories`) and say so in `notes`.
- `sources`: the name he gives (e.g. "Drill Vault (shared by Aaron)"). Check for duplicates first.
- Append under the `// ── Added by Aaron ──` section of the sport's data file.

## Export (copy to clipboard)
- **Copy JSON** — the drill object exactly as in the data file, minus review-only fields
  (`status`, `notes`), plus `sport`. This is what gets pasted into Coach Approach.
- **Copy Text** — a plain-text version for notes, emails, or practice plans.
- **Shortlist** (★) is saved in this browser only (localStorage) — a convenience while reviewing.
  "Copy shortlist" exports all starred drills as one JSON array. Final decisions go in `status`.

## Gathering workflow (for Claude)
1. Pick a sport + category from `CANDIDATES.md` (or add new ideas found while searching).
2. Search several sources; pick the strongest version; merge good ideas.
3. Write the drill in the data model above, in our own words, with `sources`.
4. Mark it ✅ in `CANDIDATES.md` (or ❌ with a reason if skipped).
5. Run `node drills/scripts/validate.js` (required fields, unique ids, valid categories/ages).
6. Open `index.html` and check it renders; keep the counts in `CANDIDATES.md` current.
7. Only link a source URL that was actually found/opened — otherwise list the source by name only.

---

## Decision log
| Date | Decision |
|---|---|
| 2026-10-29 | Created `/drills`. UI first; sports match Coach Approach (`ca/src/data/sports.js`). |
| 2026-10-29 | Drills can have several categories (primary first) so 1v1 + Attacking style tags both work. |
| 2026-10-29 | Soccer batch 1: 31 drills added (36 total). Heading drills are U12+ only (US Soccer rules). |
| 2026-10-29 | Soccer batch 2: 32 drills from BDU pages + 15 from the web (83 total). BDU sources link as `../BDU/<page>.html`. BDU technique videos skipped (moves, not drills). |
| 2026-10-29 | Adaptive batch 1: 29 drills (30 total). Added optional `sportFocus` (Coach Approach adaptive programs have a sport focus). |
| 2026-10-29 | Renamed `instructions` → `directions` (field, UI label, Copy Text, JSON export). |
| 2026-10-29 | Basketball batch 1: 38 drills (40 total), covering every basketball category. |
| 2026-10-29 | Softball + baseball batch 1: 26 softball / 27 baseball drills added (27 / 28 total); shared drills kept as same-`id` pairs. |
| 2026-10-30 | Adaptive batch 2: 18 drills, 49 total. Filled thin sport focuses (Football, Baseball/Softball, Volleyball, Tennis, Hockey) and thin categories (Striking, Cool Down, Balance); added blind/low-vision games (beep baseball, goalball). |
| 2026-10-30 | Baseball batch 2: 19 drills, 47 total. 12 are same-id pairs of softball drills (adjusted for baseball); 7 are baseball-only (balance point, towel, stride direction, fielding finish, pickoffs, leads, first to third). Lead/pickoff/steal drills note that many Little League divisions ban leadoffs. |
| 2026-10-30 | Softball batch 2: 19 softball-only drills, 46 total (windmill pitching progressions, catcher, short game, outfield, softball baserunning). None paired with baseball. |
| 2026-10-29 | Basketball batch 2: 22 drills filling thin categories, 62 total (Rebounding, Post Play, Team Offense, Small-Sided Game, 2v1/3v2, Conditioning). Contact box-outs flagged U12+. |
| 2026-10-29 | Soccer batch 3: 16 drills filling thin categories, 100 total (Heading, Conditioning, Transition, 2v1/3v1/3v2). Heading drills are U12+ with a light ball and low volume, and note league heading rules. |
| 2026-10-29 | Football batch: 36 drills covering every football category (flag + tackle). Tackling drills follow USA Football's Shoulder Tackling System (near foot, near shoulder; bags/wheels, limited live contact); notes say "Flag", "Tackle", or both. |
| 2026-10-29 | Added optional `adaptations` field to support Coach Approach's Adaptive Sports profile. |
