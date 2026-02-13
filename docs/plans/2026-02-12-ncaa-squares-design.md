# NCAA Tournament 100 Squares - Design Document

## Overview

A single-page web app for running an NCAA Tournament 100 Squares pool. Uses Google Sheets as a backend (same pattern as binho.html). Lives in a new `ncaa/` folder as `ncaa/index.html`.

## Architecture

- **Frontend:** Single HTML file with tabbed navigation (Grid, Configuration, Score Entry, Results)
- **Backend:** Google Sheets + Google Apps Script (doGet/doPost)
- **Styling:** Self-contained CSS, March Madness themed (orange/blue), mobile responsive
- **No external dependencies** beyond Google Fonts and Font Awesome (CDN)

## Google Sheet Structure

### Tab 1: "Grid" (10x10)
- Row 1: Header (Col A empty, Cols B-K for column indices 0-9, show "?" until numbers generated)
- Rows 2-11: Row label in Col A ("?" until generated), names in B-K
- Empty cells = unclaimed squares

### Tab 2: "Numbers"
- Row 1: `RowNumbers` | comma-separated shuffled 0-9 (e.g., "3,7,1,9,0,5,2,8,4,6")
- Row 2: `ColNumbers` | comma-separated shuffled 0-9
- Row 3: `Generated` | TRUE/FALSE

### Tab 3: "Config"
| Round | GamesCount | Amount | InverseAmount |
|-------|-----------|--------|---------------|
| First Four | 4 | 0 | 0 |
| First Round | 32 | 0 | 0 |
| Second Round | 16 | 0 | 0 |
| Sweet 16 | 8 | 0 | 0 |
| Elite Eight | 4 | 0 | 0 |
| Final Four | 2 | 0 | 0 |
| Championship | 1 | 0 | 0 |

### Tab 4: "Games" (67 rows)
| GameID | Round | Team1 | Team2 | Score1 | Score2 |
|--------|-------|-------|-------|--------|--------|

Pre-populated with 67 game slots organized by round. Team names and scores entered as tournament progresses.

## UI Design

### Tab 1: Grid
- 10x10 grid table with row/column headers
- Row headers = winning team's last digit, Column headers = losing team's last digit
- Headers show "?" before number generation, actual digits after
- Click empty cell → prompt for name → saves to sheet
- Claimed cells display name (not editable)
- Admin section: "Generate Random Numbers" button (one-time use, saves to sheet)
- Unlimited squares per person

### Tab 2: Configuration
- Table listing all 7 rounds with editable dollar amounts
- Normal amount and Inverse amount columns
- Games count per round (read-only display)
- Save button persists to sheet
- Total payout summary at bottom

### Tab 3: Score Entry
- Collapsible sections per round
- Each game: Team 1 name input, Team 2 name input, Score 1, Score 2, Save button
- After saving: displays winner digit, loser digit, normal square owner, inverse square owner
- Visual indicator for completed vs pending games

### Tab 4: Results (Readonly)
- Two sub-sections: Normal Results, Inverse Results
- Game-by-game results table: Round, Teams, Score, Digits, Square Owner, Payout
- Leaderboard: aggregated by name (case-insensitive), sorted by total winnings
- Separate leaderboards for Normal, Inverse, and Combined

## Key Logic

### Score-to-Square Matching
- Score `54-33` (winner 54, loser 33) → Winner digit = 4, Loser digit = 3
- Normal: Grid[row where number=4, col where number=3]
- Inverse: Grid[row where number=3, col where number=4]

### Number Generation
- Independently shuffle 0-9 for rows and 0-9 for columns
- Save to "Numbers" tab, mark Generated = TRUE
- One-time operation, button disabled after

### Name Matching
- Case-insensitive grouping for leaderboard
- Trim whitespace

## Apps Script API

### doGet
Returns all data: grid, numbers, config, games

### doPost Actions
- `claimSquare`: { row, col, name } → writes name to Grid tab
- `generateNumbers`: shuffles and saves row/col numbers
- `saveConfig`: { rounds[] } → updates Config tab
- `saveScore`: { gameId, team1, team2, score1, score2 } → updates Games tab

## File Structure
```
ncaa/
  index.html          (single page with all tabs, styles, and scripts)
  ncaa-squares-setup.md  (Google Sheet setup instructions)
```