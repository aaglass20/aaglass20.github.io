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
