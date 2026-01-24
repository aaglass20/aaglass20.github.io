# Binho Finger Soccer League - Design Document

## Overview
A new section for the BDU site to track Binho finger soccer games between family members. Features a season schedule, score entry, and standings.

## Teams
- Grady
- Austin
- Jordan
- Mom
- Dad

## Schedule Format
- Round-robin: each team plays every other team twice (home and away)
- 20 total games
- Simple list format, played at your own pace
- No ties - always a winner

## Standings
- Basic format: Wins, Losses, Points
- 3 points for a win, 0 for a loss
- Sorted by points, then wins as tiebreaker

---

## Page Structure (binho.html)

### 1. Header
- BDU shield logo
- Title: "Binho Finger Soccer League"

### 2. Standings Table
| Rank | Team | W | L | Pts |
|------|------|---|---|-----|
| 1 | Team | 0 | 0 | 0 |

- Auto-sorted by points
- Leader gets subtle highlight

### 3. Season Schedule
- 20 game cards in list format
- Each card shows: Home Team vs Away Team
- Unplayed: muted "vs" styling
- Completed: shows score, winner highlighted
- Click to open score entry modal

### 4. Score Entry Modal
- Popup overlay
- Team names displayed
- Two number inputs (0-99)
- Save and Cancel buttons
- Loading spinner while saving
- Success/error feedback

---

## Google Sheets Backend

### Sheet 1: "Schedule"
| GameID | HomeTeam | AwayTeam | HomeScore | AwayScore |
|--------|----------|----------|-----------|-----------|
| 1 | Grady | Austin | | |
| 2 | Jordan | Mom | | |

- 20 rows pre-populated with round-robin matchups
- Scores blank until played

### Sheet 2: "Teams"
| TeamName | Wins | Losses | Points |
|----------|------|--------|--------|
| Grady | 0 | 0 | 0 |

- Standings calculated via formulas (COUNTIF on Schedule)

### Google Apps Script
```javascript
doGet() - Returns schedule and standings as JSON
doPost() - Updates game result (GameID, HomeScore, AwayScore)
```

---

## Navigation
- Add "Binho League" link to shared-footer.html in the Resources column

---

## Visual Design
- Matches existing BDU site styling (css/styles.css)
- Gradient cards similar to defensive-plan.html day-cards
- Responsive: table scrolls on mobile, cards stack vertically

---

## Files to Create/Modify
1. **Create:** `BDU/binho.html` - Main page
2. **Modify:** `BDU/menus/shared-footer.html` - Add footer link
3. **Create:** Google Sheet with Apps Script (manual setup)