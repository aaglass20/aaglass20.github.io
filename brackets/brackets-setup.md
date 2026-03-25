# Tournament Bracket Generator - Google Sheets Setup Guide

## Overview

This app uses Google Sheets as a backend via Google Apps Script. The script creates its own tab and manages all columns automatically.

---

## Step 1: Open the Google Sheet

**Google Sheet:** https://docs.google.com/spreadsheets/d/1W8WownlaX4sX41LjUomERsX7glCoy9eyGuwCfZAUv7M/edit

The Apps Script will automatically create the tabs it needs (`TournamentData` and `MatchLog`) inside this sheet.

---

## Step 2: Add the Apps Script

1. In your Google Sheet, go to **Extensions > Apps Script**
2. Delete any existing code and paste the following:

```javascript
// ============================================
// Tournament Bracket Generator - Apps Script
// ============================================

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

// Tab name for tournament data
const TAB_NAME = 'TournamentData';

function getOrCreateSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(TAB_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(TAB_NAME);

    // Set up header row
    const headers = [
      'Key',           // A - data key identifier
      'Value',         // B - JSON data value
      'LastUpdated'    // C - timestamp
    ];

    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    // Format header row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#002B5C');
    headerRange.setFontColor('#FFFFFF');

    // Set column widths
    sheet.setColumnWidth(1, 200);  // Key
    sheet.setColumnWidth(2, 600);  // Value
    sheet.setColumnWidth(3, 200);  // LastUpdated

    // Freeze header row
    sheet.setFrozenRows(1);

    // Initialize data rows
    const initialKeys = [
      'tournament_name',
      'tournament_type',
      'participants',
      'matches',
      'rr_matches',
      'rr_advance_count',
      'phase',
      'settings'
    ];

    initialKeys.forEach((key, i) => {
      sheet.getRange(i + 2, 1).setValue(key);
      sheet.getRange(i + 2, 2).setValue('');
      sheet.getRange(i + 2, 3).setValue('');
    });

    // Also create a MatchLog tab for detailed match history
    let logSheet = ss.getSheetByName('MatchLog');
    if (!logSheet) {
      logSheet = ss.insertSheet('MatchLog');
      const logHeaders = [
        'MatchID',     // A
        'Round',       // B
        'Bracket',     // C
        'Player1',     // D
        'Player2',     // E
        'Score1',      // F
        'Score2',      // G
        'Winner',      // H
        'Timestamp'    // I
      ];
      logSheet.getRange(1, 1, 1, logHeaders.length).setValues([logHeaders]);
      const logHeaderRange = logSheet.getRange(1, 1, 1, logHeaders.length);
      logHeaderRange.setFontWeight('bold');
      logHeaderRange.setBackground('#002B5C');
      logHeaderRange.setFontColor('#FFFFFF');
      logSheet.setFrozenRows(1);
    }
  }

  return sheet;
}

function doGet(e) {
  const action = e.parameter.action;

  if (action === 'getTournament') {
    return getTournamentData();
  }

  return ContentService.createTextOutput(JSON.stringify({ error: 'Unknown action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;

    if (action === 'saveTournament') {
      return saveTournamentData(payload.data);
    }

    if (action === 'resetTournament') {
      return resetTournamentData();
    }

    return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Unknown action' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getTournamentData() {
  const sheet = getOrCreateSheet();
  const data = sheet.getDataRange().getValues();

  const result = {};
  for (let i = 1; i < data.length; i++) {
    const key = data[i][0];
    const value = data[i][1];
    if (key && value) {
      try {
        result[key] = JSON.parse(value);
      } catch (e) {
        result[key] = value;
      }
    }
  }

  // Map to tournament object
  const tournament = {
    name: result.tournament_name || '',
    type: result.tournament_type || '',
    participants: result.participants || [],
    matches: result.matches || [],
    rrMatches: result.rr_matches || [],
    rrAdvanceCount: result.rr_advance_count || 4,
    phase: result.phase || 'rr'
  };

  return ContentService.createTextOutput(JSON.stringify(tournament))
    .setMimeType(ContentService.MimeType.JSON);
}

function saveTournamentData(dataStr) {
  const tournament = JSON.parse(dataStr);
  const sheet = getOrCreateSheet();
  const now = new Date().toISOString();

  // Map tournament fields to sheet rows
  const keyValuePairs = [
    ['tournament_name', JSON.stringify(tournament.name)],
    ['tournament_type', JSON.stringify(tournament.type)],
    ['participants', JSON.stringify(tournament.participants)],
    ['matches', JSON.stringify(tournament.matches)],
    ['rr_matches', JSON.stringify(tournament.rrMatches || [])],
    ['rr_advance_count', JSON.stringify(tournament.rrAdvanceCount || 4)],
    ['phase', JSON.stringify(tournament.phase || 'rr')],
    ['settings', JSON.stringify({ adminPassword: tournament.adminPassword || '' })]
  ];

  // Update each row
  const data = sheet.getDataRange().getValues();
  for (const [key, value] of keyValuePairs) {
    let found = false;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === key) {
        sheet.getRange(i + 1, 2).setValue(value);
        sheet.getRange(i + 1, 3).setValue(now);
        found = true;
        break;
      }
    }
    if (!found) {
      const newRow = data.length + 1;
      sheet.getRange(newRow, 1).setValue(key);
      sheet.getRange(newRow, 2).setValue(value);
      sheet.getRange(newRow, 3).setValue(now);
      data.push([key, value, now]);
    }
  }

  // Update MatchLog tab with completed matches
  updateMatchLog(tournament);

  return ContentService.createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function resetTournamentData() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // Clear TournamentData values (keep headers and keys)
  const sheet = ss.getSheetByName(TAB_NAME);
  if (sheet) {
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      // Clear Value and LastUpdated columns, keep Key column
      sheet.getRange(2, 2, lastRow - 1, 2).clearContent();
    }
  }

  // Clear MatchLog data (keep header)
  const logSheet = ss.getSheetByName('MatchLog');
  if (logSheet) {
    const logLastRow = logSheet.getLastRow();
    if (logLastRow > 1) {
      logSheet.getRange(2, 1, logLastRow - 1, 9).clearContent();
    }
  }

  return ContentService.createTextOutput(JSON.stringify({ success: true, action: 'reset' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function updateMatchLog(tournament) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let logSheet = ss.getSheetByName('MatchLog');
  if (!logSheet) return;

  // Clear existing data (keep header)
  const lastRow = logSheet.getLastRow();
  if (lastRow > 1) {
    logSheet.getRange(2, 1, lastRow - 1, 9).clearContent();
  }

  const now = new Date().toISOString();
  const rows = [];

  // Log elimination matches
  if (tournament.matches) {
    for (const match of tournament.matches) {
      if (match.winner && match.slot1 && match.slot2) {
        if (match.slot1.name === 'BYE' || match.slot2.name === 'BYE') continue;
        rows.push([
          match.id,
          match.roundName || 'Round ' + match.round,
          match.bracket || 'winners',
          match.slot1.name,
          match.slot2.name,
          match.slot1.score,
          match.slot2.score,
          match.winner,
          now
        ]);
      }
    }
  }

  // Log round robin matches
  if (tournament.rrMatches) {
    for (const match of tournament.rrMatches) {
      if (match.completed) {
        rows.push([
          'RR-' + match.id,
          'RR Round ' + match.round,
          'round_robin',
          match.p1,
          match.p2,
          match.p1Score,
          match.p2Score,
          match.p1Score > match.p2Score ? match.p1 : (match.p2Score > match.p1Score ? match.p2 : 'Draw'),
          now
        ]);
      }
    }
  }

  if (rows.length > 0) {
    logSheet.getRange(2, 1, rows.length, 9).setValues(rows);
  }
}
```

3. Click **Save** (Ctrl+S / Cmd+S)

---

## Step 3: Deploy as Web App

1. Click **Deploy > New deployment**
2. Click the gear icon next to "Select type" and choose **Web app**
3. Configure:
   - **Description**: "Tournament Bracket API"
   - **Execute as**: Me
   - **Who has access**: Anyone
4. Click **Deploy**
5. **Authorize** the script when prompted (review permissions, click "Allow")
6. Copy the **Web app URL** — it looks like: `https://script.google.com/macros/s/AKfycb.../exec`

---

## Step 4: Connect the App

1. Open the Tournament Bracket app
2. Create your tournament and go to the **Settings** tab
3. Paste the Web app URL in the "Apps Script URL" field
4. Click **Save**

---

## Google Sheets Tab Structure

The script automatically creates two tabs:

### TournamentData Tab
| Column | Purpose |
|--------|---------|
| A - Key | Data identifier (tournament_name, tournament_type, participants, matches, etc.) |
| B - Value | JSON-encoded data value |
| C - LastUpdated | ISO timestamp of last update |

### MatchLog Tab
| Column | Purpose |
|--------|---------|
| A - MatchID | Unique match identifier |
| B - Round | Round name |
| C - Bracket | winners / losers / round_robin / grand_final |
| D - Player1 | First participant name |
| E - Player2 | Second participant name |
| F - Score1 | Player 1 score |
| G - Score2 | Player 2 score |
| H - Winner | Winner name (or "Draw" for RR ties) |
| I - Timestamp | When the result was recorded |

---

## Troubleshooting

- **CORS errors**: The app uses `mode: 'no-cors'` for writes (fire-and-forget). Reads use standard fetch.
- **Permission errors**: Make sure the web app is set to "Anyone" for access.
- **Data not syncing**: Check the Apps Script execution log (Extensions > Apps Script > Executions).
- **Need to redeploy**: After code changes, go to Deploy > Manage deployments > Edit > New version > Deploy.
