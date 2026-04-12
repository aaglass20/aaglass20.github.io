# Game Day Page — Google Sheet Setup

The `game-day.html` page reads your team's **Roster**, **Games**, and (optionally) **Depth Chart** from a Google Sheet. Lineups, stats, and plays are edited in the browser and saved to **LocalStorage**, then exported back to the sheet via a copy/paste block.

This README tells you exactly which tabs and columns to create.

---

## 1. Create the Google Sheet

1. Create a new Google Sheet — name it whatever you want (e.g. `BDU Game Day 2026`).
2. Click **Share → General access → Anyone with the link → Viewer**.
3. Copy the **Sheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/<<<THIS PART>>>/edit
   ```
4. Open `BDU/game-day.html` and find the line:
   ```js
   const SHEET_ID = 'YOUR_SHEET_ID_HERE';
   ```
   Replace `YOUR_SHEET_ID_HERE` with your sheet ID. Save and commit.

> The page uses Google's public `gviz` JSON endpoint. No API key needed, but the sheet **must** be link-viewable.

---

## 2. Required Tabs

Create the following tabs (lower bar of Sheets). Tab names are **case-sensitive** and must match exactly.

### Tab: `Roster`

| Column                | Type           | Example          | Notes                                                  |
| --------------------- | -------------- | ---------------- | ------------------------------------------------------ |
| `Name`                | text           | `Ava`            | Required. The label that shows on the field.           |
| `Number`              | number         | `7`              | Optional jersey number.                                |
| `PreferredPositions`  | text (CSV)     | `CM,LM,RM`       | Optional. Comma-separated. Used for hints later.       |
| `Active`              | TRUE / FALSE   | `TRUE`           | Optional. Leave blank or `TRUE` to include this season. Set `FALSE` to hide. |

**Position codes used everywhere:** `GK`, `LD`, `CD`, `RD`, `LM`, `CM`, `RM`, `LF`, `RF`. Formation is **3-3-2 + GK**.

### Tab: `Games`

| Column      | Type         | Example                  | Notes                                                          |
| ----------- | ------------ | ------------------------ | -------------------------------------------------------------- |
| `GameID`    | text         | `G01`, `T03`             | Required. Unique. Use `G##` for league, `T##` for tournament. |
| `Date`      | date         | `2026-04-15`             | Optional but recommended — drives sort order.                  |
| `Opponent`  | text         | `Eagles`                 |                                                                |
| `Location`  | text         | `North Park Field 2`     |                                                                |
| `HomeAway`  | text         | `Home` or `Away`         |                                                                |
| `Type`      | text         | `League` / `Tournament` / `Friendly` | Tournament games show with `(T)` in the dropdown. |
| `Notes`     | text         | `Bring corner flags`     |                                                                |

Pre-populate the 8 league games. For tournaments, you can either add the games here ahead of time, or use the **+ Game** button on the page to add them on the fly (they save locally and can be exported back to this tab later).

### Tab: `DepthChart` *(optional, used as initial seed)*

| Column     | Type   | Example     | Notes                                                |
| ---------- | ------ | ----------- | ---------------------------------------------------- |
| `Position` | text   | `CM`        | One of the position codes above.                     |
| `Rank`     | number | `1`         | 1 = top depth choice, 2 = second, etc.               |
| `Player`   | text   | `Whitney`   | Must match a `Name` from `Roster`.                   |

If you skip this tab, the depth chart starts empty and you build it by dragging in the browser.

### Tab: `Lineups` *(write target — populated by Save / Export)*

You don't need to populate this manually — the **Save** button (or Export) writes to it. Each position has a starter and zero or more subs; both are stored as rows distinguished by `Role`:

| Column      | Type   | Example |
| ----------- | ------ | ------- |
| `GameID`    | text   | `G01`   |
| `Half`      | `1` or `2` | `1` |
| `Position`  | text   | `CM`    |
| `Role`      | `Starter` or `Sub` | `Starter` |
| `Player`    | text   | `Whitney` |

> **If you previously created this tab without `Role`** (4-column schema), the Apps Script will detect that and rewrite the header next time you click Save.

### Tab: `Stats` *(write target — paste from Export button)*

| Column      | Type   |
| ----------- | ------ |
| `GameID`    | text   |
| `Minute`    | number |
| `Type`      | `Goal` or `Assist` |
| `Player`    | text   |

---

## 3. How the page works

### Toolbar

- **Game dropdown** — pick which game you're working on. All other tabs (Lineup, Stats, Plays) update for that game.
- **+ Game** — add a tournament/extra game without leaving the page. Saved locally; export to push back to `Games`.
- **Sheet** — re-fetch `Roster`, `Games`, and `DepthChart` from Google. Run this any time you update the sheet.
- **Export** — opens a modal with TSV blocks for `Lineups`, `Stats`, `DepthChart`, and any local-only games. Click **Copy All**, then paste into the matching tabs in your sheet.

### Tabs

| Tab          | What it does                                                                                                          |
| ------------ | --------------------------------------------------------------------------------------------------------------------- |
| **Warmup**   | Plays the existing `vid/gametimewarmup.mp4` video.                                                                    |
| **Lineup**   | 1st Half / 2nd Half sub-tabs. Drag a player from the roster onto a position circle. Tap a filled slot to clear it. On mobile, tap a player then tap a slot. |
| **Depth Chart** | One card per position. Drag from the roster pool at the top, or move players between position cards.              |
| **Stats**    | Tap **+ Goal** or **+ Assist**, optionally enter a minute, pick the player. Running totals at the top.                |
| **Plays**    | Whiteboard on a soccer field. Pen / Arrow / Dot / Erase. Save plays per game and reload them later.                   |

### Where data lives

| Data                          | Source                       | Saved where                              |
| ----------------------------- | ---------------------------- | ---------------------------------------- |
| Roster                        | Google Sheet `Roster` tab    | LocalStorage cache                       |
| Game schedule                 | Google Sheet `Games` tab     | LocalStorage cache                       |
| Depth chart (initial)         | Google Sheet `DepthChart`    | LocalStorage cache                       |
| Lineups (per game per half)   | **Browser only**             | LocalStorage → export to sheet manually  |
| Stats (goals/assists)         | **Browser only**             | LocalStorage → export to sheet manually  |
| Plays (drawings)              | **Browser only**             | LocalStorage as PNG data URLs            |
| Custom games (added in-page)  | **Browser only**             | LocalStorage → export to sheet manually  |

> **Heads up on LocalStorage:** all in-browser edits live in *that* browser. If you edit on your phone and want it on your laptop, export → paste to sheet → load sheet on the other device. Clearing browser data will wipe lineups/stats/plays — export anything you want to keep.

---

## 4. Quick start checklist

- [ ] Create Google Sheet, set sharing to "Anyone with link – Viewer"
- [ ] Add tabs: `Roster`, `Games`, `DepthChart`, `Lineups`, `Stats` (case-sensitive)
- [ ] Fill in `Roster` with player names + jersey numbers
- [ ] Fill in `Games` with the 8 league games
- [ ] Copy your Sheet ID into `game-day.html` (`SHEET_ID` constant)
- [ ] Open the page, click **Sheet** to verify loading
- [ ] Pick a game, drag players onto the field
- [ ] Click **Export** → Copy All → paste blocks into matching sheet tabs

---

## 5. Two-way sync with Apps Script (recommended)

Setting this up replaces the Export-and-paste workflow with one-click **Save** and **Pull** buttons. Lineups, stats, and depth-chart edits go straight to the sheet — and any other device that opens the page will see them.

### Setup (one time, ~5 minutes)

1. Open your Game Day Google Sheet.
2. **Extensions → Apps Script**. Delete any starter code in `Code.gs`.
3. Open `BDU/game-day-apps-script.gs` from this repo. Copy the entire contents and paste into `Code.gs` in the Apps Script editor.
4. Click the **disk icon** to save. (Project name doesn't matter — `BDU Game Day Sync` is fine.)
5. Click **Deploy → New deployment**.
   - Click the gear icon → **Web app**
   - **Description:** `BDU Game Day sync`
   - **Execute as:** `Me (your account)`
   - **Who has access:** `Anyone` ← required so the page can call it without logging in
   - Click **Deploy**
6. Google will prompt to authorize. Review the scopes (it only touches *this* sheet) → **Allow**.
7. Copy the **Web app URL** Google gives you (it ends in `/exec`).
8. Open `BDU/game-day.html`, find:
   ```js
   const WEBAPP_URL = '';
   ```
   Paste your URL between the quotes:
   ```js
   const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycb.../exec';
   ```
9. Commit & deploy the page.

### Using it

| Button | What it does |
| ------ | ------------ |
| **Pull** | Reads `Roster`, `Games`, `DepthChart` via the public endpoint *and* — if `WEBAPP_URL` is set — pulls `Lineups` and `Stats` via the web app. Replaces local state with what's in the sheet. |
| **Save** | POSTs current lineups, stats, depth chart, and locally-added games to the web app. Overwrites the `Lineups` / `Stats` / `DepthChart` tabs and appends any new games to the `Games` tab. |
| **Export** | Still works as a manual fallback if Save fails (offline, sheet down, etc.). |

If `WEBAPP_URL` is left empty, the Save button is hidden and the workflow falls back to manual Export.

### Typical workflow

- **Tuesday at home:** open page on laptop, set the lineup → **Save**
- **Saturday at the field:** open page on phone → **Pull** (gets your saved lineup) → tap goals/assists during game → **Save** at halftime/final whistle
- **Sunday on tablet:** open page → **Pull** → review stats, prep next game

### Updating the script

If you ever change `game-day-apps-script.gs`, you must redeploy the script for the change to take effect:

1. Apps Script editor → **Deploy → Manage deployments**
2. Pencil icon next to the existing deployment
3. **Version:** New version → **Deploy**

The web app URL stays the same — no need to update `WEBAPP_URL`.

### Troubleshooting

| Symptom | Fix |
| ------- | --- |
| Status bar says "Save failed: …" | Check that the script is deployed with **Who has access: Anyone** (not "Anyone with Google account"). Most common cause. |
| `pullFromWebApp` returns 401/403 | Same — re-deploy with public access. |
| You changed the script but nothing's different | You didn't redeploy as a new version (see above). |
| CORS errors in the browser console | The page uses `Content-Type: text/plain` to avoid preflight; do not change that line. |

---

## 6. Future enhancements (not built yet)

- Per-player season stat rollups across games.
- Position-preference highlights when dragging (using `PreferredPositions` from `Roster`).
- Live multi-device updates (would need a polling refresh on the page).

Ask if you want any of these added.
