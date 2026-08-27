# aaglass20.github.io — Claude Code Reference

This is a GitHub Pages mono-repo containing 8 independent projects. Most are static HTML/JS with Google Sheets + Apps Script backends. Two (`softball`, `soundtrack`) are React/Vite/CRA apps with npm build pipelines.

---

## Project Map

### /BDU — Soccer Coaching Resource Library
- **What:** 100+ HTML pages covering drills, tactics, fitness, game management for youth soccer coaching
- **Stack:** Vanilla HTML, CSS, jQuery; Python search indexer; Google Apps Script for game-day sync
- **Key files:** `scripts/update-search-index.py`, `search-index.json`, `SoccerSessionTracker.js`
- **After adding/editing pages:** Run `python3 scripts/update-search-index.py` to regenerate `search-index.json`
- **Game-day:** LocalStorage for lineups/stats; two-way sync with Google Sheets via Apps Script
- **Conventions:** Collapsible sections auto-indexed by the Python script; don't manually edit `search-index.json`

### /brackets — Tournament Bracket Generator
- **What:** Single/double elimination bracket creation and management
- **Stack:** Vanilla HTML/JS; Google Sheets + Apps Script for persistence
- **Key files:** `index.html`, `brackets-setup.md` (setup guide)
- **Deploy:** None — browser-based; Apps Script deployment required for data sync
- **Conventions:** Multi-tournament support via separate sheet tabs; see `brackets-setup.md` for sheet schema

### /mybracketly — Brackets + Squares Hub
- **What:** Combined NCAA bracket competition and 100-squares pool games with ESPN data
- **Stack:** Vanilla HTML/CSS/JS; Google Sheets + Apps Script backend
- **Key files:** `brackets.html`, `squares.html`, `headtohead.html`, `index.html`; `js/`, `css/`, `docs/`, `setup/`
- **Deploy:** Static HTML on GitHub Pages; Apps Script handles all data persistence
- **Conventions:** Supports both elimination brackets and squares games; ESPN API for live scores

### /fantasy-baseball — Fantasy Baseball Draft Tool
- **What:** Player ranking and draft preparation tool
- **Stack:** Vanilla HTML/JS; JSON data files (no backend, no build)
- **Key files:** `index.html`, `data.json`, `top300.json`
- **Deploy:** Static — push to GitHub
- **Conventions:** Update `data.json` and `top300.json` to refresh player data

### /ncaa — NCAA Tournament Squares Pool
- **What:** 100-squares pool for NCAA tournament — square ownership, scoring, payouts
- **Stack:** Vanilla HTML/JS; Google Sheets + Apps Script backend; offline mode via LocalStorage
- **Key files:** `index.html`, `ncaa-squares-setup.md` (sheet schema + Apps Script)
- **Deploy:** Static HTML; Apps Script deployment required
- **Conventions:** Complex payout logic; locked games; PaidPayouts tracking; see `ncaa-squares-setup.md`

### /empower — BDU × Empower Sports iCan Soccer
- **What:** 3-page site for BDU's iCan Soccer volunteer program — intro letter, team signup, weekly practice plans
- **Stack:** Vanilla HTML/CSS/JS; Supabase backend (reuses `/schedule/` project: `fpnmnlrwhwnuefbnehuf.supabase.co`)
- **Key files:** `index.html`, `signup.html`, `practice.html`, `practice-print.html`
- **Sync rule:** `practice-print.html` is the print-optimized mirror of `practice.html`. **Any content change to `practice.html` (session blocks, times, station cards, drill text) MUST be applied to `practice-print.html` as well.** The two files share the same session data but use different HTML structures — practice.html uses `.timeline-item` / `.timeline-content`, practice-print.html uses `.block` / `.block-body`.
- **Toggle practice plans live:** In `practice.html`, set `const PLANS_LIVE = true` (~line 553 in the script block) to publish; `false` to hide
- **Conventions:** BDU colors — `#003366` (blue) + `#FFD700` (gold); no build step; sessions are 75 min (10:00–11:15)

### /fuelup — Athlete Nutrition Meal Planner
- **What:** Drag-and-drop daily nutrition planner with compliance engine, food group tracking (USDA MyPlate), and Supabase sync
- **Stack:** Vanilla HTML/CSS/JS; SortableJS (CDN); Supabase (`fpnmnlrwhwnuefbnehuf.supabase.co`, same project as `/empower/` and `/schedule/`)
- **Key files:** `index.html`, `css/styles.css`, `js/app.js`, `js/data.js`, `js/config.js`, `setup.sql`
- **Run setup.sql once** in Supabase SQL editor to create `fuelup_plans` and `fuelup_user_settings` tables
- **No build step** — open `index.html` directly or `npx serve fuelup/`

#### Data conventions — adding new food items to `js/data.js`

**Item types:**
- `MEALS` — breakfast/lunch/dinner; shown in Meals palette tab; drive meal-balance compliance rules
- `SNACKS` — shown in Snacks palette tab; includes hydration, pre-game picks, healthy snacks, treats
- `SIDES` — attach to a meal slot without counting as a snack; shown at bottom of Meals tab; contribute to meal balance check

**MEALS flags:**
| Field | Rule |
|---|---|
| `mealType` | `'breakfast'` / `'lunch'` / `'dinner'` — pick whichever meal it's primarily eaten at |
| `allDay: true` | Add to breakfast items that are reasonable at any time of day (eggs, pancakes, yogurt, etc.) — shows "works at lunch or dinner too!" hint in palette |
| `protein: true` | Contains ≥ 7g protein (≈ 1 egg, 1 oz meat/fish/cheese, 2 tbsp PB) |
| `carbs: true` | Has a meaningful starchy/grain carb source (bread, rice, pasta, potato, tortilla) — not just added sugar |
| `veggie: true` | Dish **inherently** contains ≥ 0.5 cup vegetables — not just a garnish or optional topping |
| `fg` | USDA MyPlate serving estimates (see below) — required on every MEAL |

**SNACKS flags:**
| Field | Rule |
|---|---|
| `treat: true` | High added sugar/fat, low nutrients — no `fg` credit; shown in Treats section |
| `water: true` | Counts toward hydration goal; shown in Hydration section |
| `preGame: true` | Light, carb-forward, easy to digest — safe 20–60 min before activity |
| `postWorkout: true` | Has meaningful protein + carbs — good for 30-min recovery window |
| `protein` / `carbs` | Same thresholds as meals |
| `fg` | Required on non-treat, non-water snacks |

**SIDES flags:**
| Field | Rule |
|---|---|
| `fruit: true` | It's a fruit or 100% fruit juice |
| `veggie: true` | It's a vegetable |
| `dairy: true` | It's a dairy product |
| `carbs: true` | Grain/starchy carb not covered above (bread, rice, fries) |
| `protein: true` | Add when the side meaningfully contributes protein (e.g. Glass of Milk) |
| `fg` | Required on all sides |

**`fg` serving estimates (USDA oz-equivalents / cups):**
```
fg: { grains, veggies, fruit, dairy, protein }
```
- `grains` (oz-eq): 1 slice bread = 1 · ½ cup cooked rice/pasta = 1 · 1 bagel = 3 · 1 tortilla (8") = 2
- `protein` (oz-eq): 1 egg = 1 · 1 oz cooked meat/fish = 1 · 2 tbsp PB = 2 · ¼ cup beans = 1
- `dairy` (cups): 1 cup milk or yogurt = 1 · 1.5 oz hard cheese = 1 · 1 oz cheese slice ≈ 0.67
- `veggies` (cups): 1 cup cooked = 1 · 2 cups raw leafy greens = 1 · ½ cup chopped = 0.5
- `fruit` (cups): 1 medium banana = 1 · 1 cup berries = 1 · ½ cup sliced = 0.5
- Omit keys with 0 value to keep lines short; summing code handles missing keys as 0
- Treats and plain water get no `fg` property

**Fractional / "mini" portion items:**
When a food is a smaller-than-standard portion (e.g. mini muffin, mini bagel, cocktail meatballs), add it as a separate item — do **not** overload the full-size item's `fg` values. Convention:
- Set `fg` to the actual fractional value (½ of the full-size item's grains/protein/etc.)
- Add a `note` that tells the athlete how many to grab for a full serving — e.g. `note: '½ serving each — grab 2 for a full serving'`
- Keep flags (`protein`, `carbs`, etc.) honest based on the fractional portion — a mini bagel alone doesn't clear the 7g protein bar, so `protein: false` even if the full bagel + cream cheese entry has `protein: true`
- Compliance engine and totals sum linearly, so dropping 2 minis produces the same food-group credit as 1 full item — no special-case code needed

Examples: `mini-muffin` (`grains: 1`, half of `muffin`'s 2), `mini-bagel` (`grains: 1.5`, half of `bagel-cream`'s 3), `side-cream-cheese` (`dairy: 0.25`, a solo cream-cheese schmear for any bagel).

**SDET note — test coverage for fractional items:**
- **P0 positive:** dropping 2 mini muffins onto breakfast totals grains = 2 (matches 1 full muffin), and 1 mini bagel + 1 side-cream-cheese totals grains = 1.5, dairy = 0.25
- **P1 edge:** the `note` field renders in the palette card so the "grab 2" cue is visible — regression watch on any palette-render refactor
- **Boundary:** the fractional item alone should NOT satisfy a compliance rule that a full-size item would (e.g. breakfast-balance still needs a protein source; 1 mini muffin alone shouldn't fool the meal-balance check into passing)
- **Negative:** removing one of a paired mini item (e.g. deleting 1 of 2 mini muffins) should halve the food-group total without triggering any other rule flip

**Daily goals (USDA MyPlate, ~2,000 cal / active 12-yr-old):**
`DAILY_GOALS = { grains: 6, veggies: 2.5, fruit: 2, dairy: 3, protein: 5.5 }` — defined in `js/app.js`

#### Compliance engine rules (in `evaluate()` in `js/app.js`)
1. Breakfast present + within 60 min of wake time
2. 3 meals per day
3. No 4+ hour gap between fuel items
4. Hydration goal (opt-outable via toggle)
5. Per-slot meal balance: breakfast needs protein + carbs; lunch/dinner needs protein + carbs + fruit/veg (via meal flags or sides)
6. Pre-fuel within 90 min before any workout
7. Pre-game meal 1.5–3.5 hrs before sport events
8. Pre-game snack 20–60 min before sport events
9. Post-workout fuel within 30 min of workout end
10. Halftime snack for sports with `halftime: true`

When adding a new compliance rule: add to `evaluate()`, return it in the `rules` array with `{ pass, label, desc }`, optionally push a tip to `tips`. The engine auto-calculates pass ratio and status (green/yellow/red).

### /signs — Google Sheets Form Utility
- **What:** Small utility/form that integrates with Google Sheets
- **Stack:** HTML + Google Apps Script (`Code.gs`)
- **Key files:** `index.html`, `Code.gs`
- **Deploy:** Apps Script web app deployment

### /softball — Animated Softball Situational Training
- **What:** Canvas-based app to visualize and animate softball plays (fielders, runners, situations)
- **Stack:** React 19 + Vite + Konva (canvas); no backend
- **Key files:** `package.json`, `vite.config.js`, `src/components/`, `src/data/sampleSituations.js`
- **Dev:** `npm run dev` (Vite, port 5173)
- **Deploy:** `npm run deploy` — builds with Vite, overwrites `index.html` + `assets/` for GitHub Pages
- **Restore for dev:** `npm run restore` — reverts GitHub Pages build artifacts
- **Conventions:** All situation data in `src/data/sampleSituations.js` as JSON; animations use interpolation; Konva canvas

### /soundtrack — Musical Autobiography / Social Timeline App
- **What:** Users build a personal song timeline by year, rank favorites, follow friends, view shared soundtracks
- **Stack:** React 19 + React Router (HashRouter) + @hello-pangea/dnd; Express server (`server/`); MongoDB Atlas; Spotify API
- **Key files:** `src/config.js` (API URLs), `server/server.js` (Express API), `apps-script/Code.gs`
- **Dev:** Start Express server: `cd server && node server.js` (port 3001); start React: `npm start` (port 3000)
- **Deploy:** `npm run deploy` — builds with react-scripts, copies `build/*` to repo root for GitHub Pages
- **Backend:** Express API on Render (`https://soundtrack-api.onrender.com`); MongoDB Atlas for data
- **Auth:** Multi-user PIN auth; social follow groups; activity feed
- **Spotify:** Client ID/Secret stored in Render environment variables
- **Conventions:** HashRouter required for GitHub Pages; `src/data/topSongsByYear.json` for chart data (25 songs/year)

---

## Common Patterns

### Google Sheets + Apps Script projects (brackets, mybracketly, ncaa, signs, BDU game-day)
- All data persistence goes through Apps Script web app endpoints
- Apps Script must be deployed separately in Google Apps Script console
- Sheet schema and endpoint docs are in each project's `*-setup.md` or `Code.gs`

### GitHub Pages deployment
- **React apps** (softball, soundtrack): `npm run deploy` — builds and overwrites root/subdir files
- **Static projects**: push HTML/JS/CSS directly; no build step
- **Never commit** `node_modules/`, build artifacts that aren't for GitHub Pages

### Dev servers
- `softball`: `cd softball && npm run dev`
- `soundtrack`: `cd soundtrack && npm start` + `cd soundtrack/server && node server.js`
- All others: open HTML directly in browser or serve with `npx serve`

---

## Repo Root
- `index.html` — main landing/reference page
- `css/`, `js/`, `images/` — shared assets
- Miscellaneous `.html` files are reference/notes pages (katalon, selenium, testRail, etc.)
