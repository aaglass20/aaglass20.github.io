# NCAA Tournament 100 Squares Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a single-page NCAA Tournament 100 Squares pool app with Google Sheets backend, supporting grid entry, configuration, score tracking, inverse number payouts, and a readonly results leaderboard.

**Architecture:** Single HTML file (`ncaa/index.html`) with tabbed navigation between 4 views. Google Sheets stores all state via Apps Script doGet/doPost. Same pattern as the existing `BDU/binho.html`.

**Tech Stack:** Vanilla HTML/CSS/JS, Google Apps Script, Google Fonts, Font Awesome CDN

---

## Task 1: Create ncaa/ directory and HTML skeleton with tab navigation

**Files:**
- Create: `ncaa/index.html`

**Step 1: Create the directory**

```bash
mkdir -p ncaa
```

**Step 2: Write the HTML skeleton with tab navigation and all CSS**

Create `ncaa/index.html` with:
- DOCTYPE, head with meta viewport, Google Fonts (Roboto), Font Awesome CDN
- March Madness themed CSS (orange `#FF6D00` / navy `#002B5C` color scheme)
- Header: "NCAA Tournament 100 Squares" title
- Tab bar with 4 tabs: Grid, Configuration, Score Entry, Results
- 4 tab content divs (initially empty placeholders)
- Tab switching JS (show/hide divs, active tab styling)
- CSS for: tab bar, tab buttons, active states, container, responsive breakpoints

The CSS should include all styles needed for the entire app (grid table, config form, score entry cards, results tables, leaderboard, modals, loading states, responsive design). This prevents needing to modify CSS in later tasks.

**Step 3: Verify**

Open `ncaa/index.html` in browser. Confirm:
- Header renders with March Madness styling
- 4 tabs are visible and clickable
- Clicking each tab shows its content area and highlights the active tab
- Mobile responsive (tabs stack or scroll on small screens)

**Step 4: Commit**

```bash
git add ncaa/index.html
git commit -m "feat: create NCAA squares page skeleton with tab navigation"
```

---

## Task 2: Build the 10x10 Grid tab (offline mode)

**Files:**
- Modify: `ncaa/index.html`

**Step 1: Add Grid tab HTML and JS**

Inside the Grid tab content div, add:
- A 10x10 HTML table with id `squares-grid`
- Row headers (Col 0) showing "?" initially, Column headers (Row 0) showing "?"
- Each cell is clickable
- An admin section below the grid with a "Generate Random Numbers" button
- A status/count display showing "X/100 squares claimed"

**Step 2: Add grid data model and rendering**

Add JS for:
- `gridData` - 10x10 array of names (initially all empty strings)
- `rowNumbers` and `colNumbers` - arrays of 0-9 (initially null, meaning not generated)
- `numbersGenerated` - boolean flag
- `renderGrid()` - builds the table HTML:
  - Header row shows col numbers if generated, "?" otherwise
  - Each row's first cell shows row number if generated, "?" otherwise
  - Each data cell shows the name if claimed, or is empty/clickable
  - Empty cells have a hover effect and onclick handler
- `claimSquare(row, col)` - prompts for name, validates non-empty, updates `gridData`, calls `renderGrid()`, and (when sheets configured) POSTs to Apps Script
- `generateNumbers()` - shuffles 0-9 for rows and columns independently (Fisher-Yates shuffle), sets `numbersGenerated = true`, saves to sheet, re-renders grid, disables button

**Step 3: Verify**

Open in browser. Confirm:
- 10x10 grid renders with "?" headers
- Clicking empty cell prompts for name, name appears in cell after entry
- Clicking claimed cell does nothing (or shows who claimed it)
- "X/100 squares claimed" counter updates
- "Generate Random Numbers" button shuffles and reveals numbers 0-9 on headers
- Button is disabled after generating
- Grid is responsive on mobile (horizontal scroll or smaller cells)

**Step 4: Commit**

```bash
git add ncaa/index.html
git commit -m "feat: add 10x10 grid with square claiming and number generation"
```

---

## Task 3: Build the Configuration tab

**Files:**
- Modify: `ncaa/index.html`

**Step 1: Add Configuration tab HTML and JS**

Inside the Configuration tab content div, add:
- A table with columns: Round, Games, $ Per Game (Normal), $ Per Game (Inverse)
- 7 rows, one per round:
  - First Four (4 games)
  - First Round - Round of 64 (32 games)
  - Second Round - Round of 32 (16 games)
  - Sweet 16 (8 games)
  - Elite Eight (4 games)
  - Final Four (2 games)
  - Championship (1 game)
- Amount fields are `<input type="number" min="0" step="1">`
- "Save Configuration" button
- Summary section at bottom showing:
  - Total Normal Payout = sum of (games * amount) per round
  - Total Inverse Payout = sum of (games * inverseAmount) per round
  - Grand Total = Normal + Inverse

**Step 2: Add config data model and logic**

Add JS for:
- `configData` array with `{ round, gamesCount, amount, inverseAmount }` for each round
- `renderConfig()` - builds the config table, populates inputs from data
- Input `onchange` handlers that update `configData` and recalculate totals
- `saveConfig()` - POSTs config to Apps Script (when configured)
- `calculateTotals()` - computes and displays payout totals

**Step 3: Verify**

Open in browser, click Configuration tab. Confirm:
- All 7 rounds display with correct game counts
- Entering dollar amounts updates the total payout summary in real-time
- Save button shows success feedback

**Step 4: Commit**

```bash
git add ncaa/index.html
git commit -m "feat: add configuration tab with round amounts and payout totals"
```

---

## Task 4: Build the Score Entry tab

**Files:**
- Modify: `ncaa/index.html`

**Step 1: Add Score Entry tab HTML and JS**

Inside the Score Entry tab content div, add:
- Collapsible sections for each round (7 sections)
- Each section header shows: round name, games count, completed count
- Inside each section: a list of game cards
- Each game card has:
  - Game number label
  - Team 1 name input + Score 1 number input
  - "vs" separator
  - Team 2 name input + Score 2 number input
  - "Save Score" button
  - Result display area (hidden until score saved)

**Step 2: Add games data model and logic**

Add JS for:
- `gamesData` array with 67 game objects: `{ gameId, round, team1, team2, score1, score2 }`
  - Pre-populated with gameId 1-67 organized by round:
    - Games 1-4: First Four
    - Games 5-36: First Round
    - Games 37-52: Second Round
    - Games 53-60: Sweet 16
    - Games 61-64: Elite Eight
    - Games 65-66: Final Four
    - Game 67: Championship
- `renderScoreEntry()` - builds collapsible sections with game cards
- `saveGameScore(gameId)` - reads inputs, validates (both teams and scores filled), updates `gamesData`, POSTs to sheet
- After saving, display result info:
  - Winner (higher score team), Loser
  - Winner last digit, Loser last digit
  - Normal square: look up `gridData` at the position mapped by row/col numbers → show name and payout
  - Inverse square: look up swapped position → show name and payout
- Collapsible section toggle logic (click header to expand/collapse)

**Step 3: Add the score-to-square matching function**

```javascript
function getSquareOwner(winnerDigit, loserDigit) {
    // winnerDigit maps to row, loserDigit maps to column
    // Find which grid row has this number, which grid col has this number
    if (!numbersGenerated) return { name: 'Numbers not generated', row: -1, col: -1 };
    const gridRow = rowNumbers.indexOf(winnerDigit);
    const gridCol = colNumbers.indexOf(loserDigit);
    return { name: gridData[gridRow][gridCol] || '(unclaimed)', row: gridRow, col: gridCol };
}

function getInverseSquareOwner(winnerDigit, loserDigit) {
    // Swapped: loserDigit maps to row, winnerDigit maps to column
    return getSquareOwner(loserDigit, winnerDigit);
}
```

**Step 4: Verify**

Open in browser, click Score Entry tab. Confirm:
- 7 collapsible round sections render with correct game counts
- Clicking a section header expands/collapses it
- Can enter team names and scores for a game
- Save button persists data and shows result (winner digit, loser digit, square owner)
- Completed games show visual indicator (green border or checkmark)
- Score entry shows both normal and inverse square results

**Step 5: Commit**

```bash
git add ncaa/index.html
git commit -m "feat: add score entry tab with game cards and square matching"
```

---

## Task 5: Build the Results tab (Readonly)

**Files:**
- Modify: `ncaa/index.html`

**Step 1: Add Results tab HTML and JS**

Inside the Results tab content div, add:
- Sub-tab navigation or toggle: "Normal Results" | "Inverse Results" | "Combined"
- **Game Results Table** (per sub-tab):
  - Columns: Round, Game #, Teams, Score, Digit (W), Digit (L), Square Owner, Payout
  - Only shows completed games
  - Sorted by round order, then game number
- **Leaderboard Section**:
  - Aggregates winnings by name (case-insensitive, trimmed)
  - Columns: Rank, Name, Games Won, Total Winnings
  - Sorted by total winnings descending
  - Highlight the leader

**Step 2: Add results computation logic**

Add JS for:
- `computeResults()` - iterates all completed games, for each:
  - Determines winner/loser and their last digits
  - Looks up normal square owner and inverse square owner
  - Calculates payout based on the round's config amounts
  - Returns arrays of result objects
- `computeLeaderboard(results)` - groups results by name (case-insensitive trim), sums payouts, sorts by total
- `renderResults()` - renders game results table and leaderboard for each sub-tab
  - Normal: only normal square results
  - Inverse: only inverse square results
  - Combined: both, with leaderboard summing normal + inverse per person

**Step 3: Verify**

Open in browser. Enter some test data:
1. Claim several grid squares with different names
2. Generate numbers
3. Set config amounts (e.g., $5 per First Four game)
4. Enter a game score in Score Entry
5. Switch to Results tab

Confirm:
- Completed game appears in results table with correct square owner
- Payout matches config amount for that round
- Leaderboard aggregates correctly
- Same name in different cases (e.g., "Aaron" and "aaron") groups together
- Normal/Inverse/Combined sub-tabs show correct data

**Step 4: Commit**

```bash
git add ncaa/index.html
git commit -m "feat: add readonly results tab with leaderboards"
```

---

## Task 6: Add Google Sheets integration (Apps Script + fetch calls)

**Files:**
- Modify: `ncaa/index.html`
- Create: `ncaa/ncaa-squares-setup.md`

**Step 1: Add the SCRIPT_URL constant and SHEETS_CONFIGURED flag**

At the top of the script section in `index.html`, add:
```javascript
const SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
const SHEETS_CONFIGURED = false; // Set to true after deploying Apps Script
```

**Step 2: Add the loadData() function**

Fetches all data from Google Sheets on page load (same pattern as binho.html):
```javascript
async function loadData() {
    if (!SHEETS_CONFIGURED) { /* use offline defaults */ return; }
    const response = await fetch(`${SCRIPT_URL}?action=getData`);
    const data = await response.json();
    // Populate gridData, rowNumbers, colNumbers, numbersGenerated, configData, gamesData
    renderAll();
}
```

**Step 3: Add POST calls to all save functions**

Update `claimSquare`, `generateNumbers`, `saveConfig`, `saveGameScore` to POST to Apps Script when `SHEETS_CONFIGURED` is true. Use `mode: 'no-cors'` same as binho.html.

**Step 4: Create the setup documentation**

Create `ncaa/ncaa-squares-setup.md` with:
- Step-by-step Google Sheet creation (4 tabs with exact column headers)
- Complete Apps Script code for doGet and doPost
- Deployment instructions (same pattern as `BDU/binho-setup.md`)
- The Apps Script doGet returns JSON with: grid (10x10 array), numbers (row/col arrays + generated flag), config (7 rounds with amounts), games (67 game objects)
- The Apps Script doPost handles: claimSquare, generateNumbers, saveConfig, saveScore

**Step 5: Verify**

With `SHEETS_CONFIGURED = false`, confirm app still works fully in offline mode.

**Step 6: Commit**

```bash
git add ncaa/index.html ncaa/ncaa-squares-setup.md
git commit -m "feat: add Google Sheets integration and setup docs"
```

---

## Task 7: Polish and final verification

**Files:**
- Modify: `ncaa/index.html`

**Step 1: Mobile responsiveness check**

Test on mobile viewport sizes (375px, 414px). Fix any issues:
- Grid should horizontally scroll on small screens
- Tab bar should be scrollable or wrap
- Config table readable
- Score entry cards stack vertically
- Results tables horizontally scroll

**Step 2: Loading states**

Add loading spinners while data fetches from Google Sheets (same spinner pattern as binho.html).

**Step 3: Edge case handling**

- Empty grid: results tab shows "No games completed yet" message
- Numbers not generated: score entry shows note that square matching won't work until numbers are generated
- All 100 squares claimed: show "Grid Full" message, disable claiming

**Step 4: Verify complete flow**

Walk through the full user journey:
1. Open page → Grid tab loads with empty 10x10 grid
2. Click cells → enter names → squares claimed
3. Click "Generate Numbers" → headers reveal digits
4. Configuration tab → enter amounts → save
5. Score Entry → enter game scores → see square matches
6. Results → see game results and leaderboard

**Step 5: Commit**

```bash
git add ncaa/index.html
git commit -m "feat: polish NCAA squares with mobile support and edge cases"
```