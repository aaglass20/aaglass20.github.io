# Tournament Bracket Generator - Google Sheets Setup Guide

## Overview

This app uses Google Sheets as a backend via Google Apps Script. It supports multiple tournaments, each stored in its own pair of tabs. The script creates and manages all tabs automatically.

---

## Step 1: Open the Google Sheet

**Google Sheet:** https://docs.google.com/spreadsheets/d/1W8WownlaX4sX41LjUomERsX7glCoy9eyGuwCfZAUv7M/edit

The Apps Script will automatically create the tabs it needs inside this sheet.

---

## Step 2: Add the Apps Script

1. In your Google Sheet, go to **Extensions > Apps Script**
2. Delete any existing code and paste the following:

```javascript
// ============================================
// Tournament Bracket Generator - Apps Script
// Multi-Tournament Support
// ============================================

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
const INDEX_TAB = 'TournamentIndex';

// ---- Get or create the master index tab ----
function getOrCreateIndexSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(INDEX_TAB);

  if (!sheet) {
    sheet = ss.insertSheet(INDEX_TAB);
    const headers = ['TournamentID', 'Name', 'Type', 'Status', 'ParticipantCount', 'CreatedAt', 'UpdatedAt'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#002B5C');
    headerRange.setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 220);
    sheet.setColumnWidth(2, 250);
    sheet.setColumnWidth(3, 150);
    sheet.setColumnWidth(4, 100);
    sheet.setColumnWidth(5, 130);
    sheet.setColumnWidth(6, 200);
    sheet.setColumnWidth(7, 200);
  }

  return sheet;
}

// ---- Get or create per-tournament data tab ----
function getOrCreateTournamentSheet(tournamentId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const tabName = 'T_' + tournamentId.substring(0, 30) + '_Data';
  let sheet = ss.getSheetByName(tabName);

  if (!sheet) {
    sheet = ss.insertSheet(tabName);
    const headers = ['Key', 'Value', 'LastUpdated'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#002B5C');
    headerRange.setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 200);
    sheet.setColumnWidth(2, 600);
    sheet.setColumnWidth(3, 200);

    const initialKeys = [
      'tournament_name', 'tournament_type', 'participants',
      'matches', 'rr_matches', 'rr_advance_count', 'phase'
    ];
    initialKeys.forEach((key, i) => {
      sheet.getRange(i + 2, 1).setValue(key);
    });
  }

  return sheet;
}

// ---- Get or create per-tournament match log tab ----
function getOrCreateMatchLogSheet(tournamentId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const tabName = 'T_' + tournamentId.substring(0, 30) + '_Log';
  let sheet = ss.getSheetByName(tabName);

  if (!sheet) {
    sheet = ss.insertSheet(tabName);
    const headers = ['MatchID', 'Round', 'Bracket', 'Player1', 'Player2', 'Score1', 'Score2', 'Winner', 'Timestamp'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#002B5C');
    headerRange.setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
  }

  return sheet;
}

// ---- HTTP Handlers ----
function doGet(e) {
  const action = e.parameter.action;
  const id = e.parameter.id;

  if (action === 'listTournaments') {
    return listTournaments();
  }
  if (action === 'getTournament' && id) {
    return getTournamentData(id);
  }

  return ContentService.createTextOutput(JSON.stringify({ error: 'Unknown action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    const id = payload.id;

    if (action === 'saveTournament' && id) {
      return saveTournamentData(id, payload.data);
    }
    if (action === 'deleteTournament' && id) {
      return deleteTournamentData(id);
    }
    if (action === 'archiveTournament' && id) {
      return updateTournamentStatus(id, 'archived');
    }
    if (action === 'unarchiveTournament' && id) {
      return updateTournamentStatus(id, 'active');
    }
    if (action === 'resetTournament' && id) {
      return resetTournamentData(id);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Unknown action' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ---- List all tournaments from index ----
function listTournaments() {
  const sheet = getOrCreateIndexSheet();
  const data = sheet.getDataRange().getValues();
  const tournaments = [];

  for (let i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    tournaments.push({
      id: data[i][0],
      name: data[i][1],
      type: data[i][2],
      status: data[i][3],
      participantCount: data[i][4],
      createdAt: data[i][5],
      updatedAt: data[i][6]
    });
  }

  return ContentService.createTextOutput(JSON.stringify(tournaments))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---- Get a single tournament's data ----
function getTournamentData(tournamentId) {
  const sheet = getOrCreateTournamentSheet(tournamentId);
  const data = sheet.getDataRange().getValues();
  const result = {};

  for (let i = 1; i < data.length; i++) {
    const key = data[i][0];
    const value = data[i][1];
    if (key && value) {
      try { result[key] = JSON.parse(value); }
      catch (e) { result[key] = value; }
    }
  }

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

// ---- Save tournament data ----
function saveTournamentData(tournamentId, dataStr) {
  const tournament = JSON.parse(dataStr);
  const sheet = getOrCreateTournamentSheet(tournamentId);
  const now = new Date().toISOString();

  // Update or create index entry
  updateIndexEntry(tournamentId, tournament, now);

  // Write key-value pairs
  const pairs = [
    ['tournament_name', JSON.stringify(tournament.name)],
    ['tournament_type', JSON.stringify(tournament.type)],
    ['participants', JSON.stringify(tournament.participants)],
    ['matches', JSON.stringify(tournament.matches)],
    ['rr_matches', JSON.stringify(tournament.rrMatches || [])],
    ['rr_advance_count', JSON.stringify(tournament.rrAdvanceCount || 4)],
    ['phase', JSON.stringify(tournament.phase || 'rr')]
  ];

  const data = sheet.getDataRange().getValues();
  for (const [key, value] of pairs) {
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
      const newRow = sheet.getLastRow() + 1;
      sheet.getRange(newRow, 1).setValue(key);
      sheet.getRange(newRow, 2).setValue(value);
      sheet.getRange(newRow, 3).setValue(now);
    }
  }

  // Update match log
  updateMatchLog(tournamentId, tournament);

  return ContentService.createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---- Update index entry ----
function updateIndexEntry(tournamentId, tournament, now) {
  const indexSheet = getOrCreateIndexSheet();
  const data = indexSheet.getDataRange().getValues();

  // Check if entry exists
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === tournamentId) {
      // Update existing
      indexSheet.getRange(i + 1, 2).setValue(tournament.name);
      indexSheet.getRange(i + 1, 3).setValue(tournament.type);
      indexSheet.getRange(i + 1, 5).setValue(tournament.participants ? tournament.participants.length : 0);
      indexSheet.getRange(i + 1, 7).setValue(now);
      return;
    }
  }

  // Create new entry
  const newRow = indexSheet.getLastRow() + 1;
  indexSheet.getRange(newRow, 1, 1, 7).setValues([[
    tournamentId,
    tournament.name,
    tournament.type,
    'active',
    tournament.participants ? tournament.participants.length : 0,
    now,
    now
  ]]);
}

// ---- Update tournament status ----
function updateTournamentStatus(tournamentId, status) {
  const indexSheet = getOrCreateIndexSheet();
  const data = indexSheet.getDataRange().getValues();
  const now = new Date().toISOString();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === tournamentId) {
      indexSheet.getRange(i + 1, 4).setValue(status);
      indexSheet.getRange(i + 1, 7).setValue(now);
      break;
    }
  }

  return ContentService.createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---- Delete tournament ----
function deleteTournamentData(tournamentId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // Remove index entry
  const indexSheet = getOrCreateIndexSheet();
  const data = indexSheet.getDataRange().getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][0] === tournamentId) {
      indexSheet.deleteRow(i + 1);
      break;
    }
  }

  // Delete data tab
  const dataTabName = 'T_' + tournamentId.substring(0, 30) + '_Data';
  const dataSheet = ss.getSheetByName(dataTabName);
  if (dataSheet) ss.deleteSheet(dataSheet);

  // Delete match log tab
  const logTabName = 'T_' + tournamentId.substring(0, 30) + '_Log';
  const logSheet = ss.getSheetByName(logTabName);
  if (logSheet) ss.deleteSheet(logSheet);

  return ContentService.createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---- Reset tournament data (clear values, keep structure) ----
function resetTournamentData(tournamentId) {
  const sheet = getOrCreateTournamentSheet(tournamentId);
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 2, lastRow - 1, 2).clearContent();
  }

  // Clear match log
  const logSheet = getOrCreateMatchLogSheet(tournamentId);
  const logLastRow = logSheet.getLastRow();
  if (logLastRow > 1) {
    logSheet.getRange(2, 1, logLastRow - 1, 9).clearContent();
  }

  return ContentService.createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---- Update match log ----
function updateMatchLog(tournamentId, tournament) {
  const logSheet = getOrCreateMatchLogSheet(tournamentId);
  const lastRow = logSheet.getLastRow();
  if (lastRow > 1) {
    logSheet.getRange(2, 1, lastRow - 1, 9).clearContent();
  }

  const now = new Date().toISOString();
  const rows = [];

  if (tournament.matches) {
    for (const match of tournament.matches) {
      if (match.winner && match.slot1 && match.slot2) {
        if (match.slot1.name === 'BYE' || match.slot2.name === 'BYE') continue;
        rows.push([match.id, match.roundName || 'Round ' + match.round, match.bracket || 'winners', match.slot1.name, match.slot2.name, match.slot1.score, match.slot2.score, match.winner, now]);
      }
    }
  }

  if (tournament.rrMatches) {
    for (const match of tournament.rrMatches) {
      if (match.completed) {
        rows.push(['RR-' + match.id, 'RR Round ' + match.round, 'round_robin', match.p1, match.p2, match.p1Score, match.p2Score, match.p1Score > match.p2Score ? match.p1 : (match.p2Score > match.p1Score ? match.p2 : 'Draw'), now]);
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
2. On the Tournaments landing page, expand **Google Sheets Settings**
3. Paste the Web app URL and click **Save**

---

## Google Sheets Tab Structure

The script automatically creates and manages these tabs:

### TournamentIndex Tab (Master List)

| Column | Purpose |
|--------|---------|
| A - TournamentID | Unique identifier (e.g. `t_1711234567890_abc12`) |
| B - Name | Tournament name |
| C - Type | Format (single, double, roundrobin, rr_single, rr_double) |
| D - Status | active / completed / archived |
| E - ParticipantCount | Number of participants |
| F - CreatedAt | ISO timestamp |
| G - UpdatedAt | ISO timestamp |

### T_{id}_Data Tab (Per Tournament)

| Column | Purpose |
|--------|---------|
| A - Key | Data identifier (tournament_name, participants, matches, etc.) |
| B - Value | JSON-encoded data |
| C - LastUpdated | ISO timestamp |

### T_{id}_Log Tab (Per Tournament Match Log)

| Column | Purpose |
|--------|---------|
| A - MatchID | Unique match identifier |
| B - Round | Round name |
| C - Bracket | winners / losers / round_robin / grand_final |
| D - Player1 | First participant |
| E - Player2 | Second participant |
| F - Score1 | Player 1 score |
| G - Score2 | Player 2 score |
| H - Winner | Winner name (or "Draw") |
| I - Timestamp | When recorded |

---

## API Actions

### GET Requests
- `?action=listTournaments` — returns array of all tournaments from index
- `?action=getTournament&id=X` — returns full data for tournament X

### POST Requests
- `action: saveTournament, id: X, data: JSON` — save/update tournament data
- `action: deleteTournament, id: X` — remove tournament and its tabs
- `action: archiveTournament, id: X` — set status to archived
- `action: unarchiveTournament, id: X` — set status to active
- `action: resetTournament, id: X` — clear match data, keep structure

---

## Troubleshooting

- **CORS errors**: The app uses `mode: 'no-cors'` for writes (fire-and-forget). Reads use standard fetch.
- **Permission errors**: Make sure the web app is set to "Anyone" for access.
- **Data not syncing**: Check the Apps Script execution log (Extensions > Apps Script > Executions).
- **Need to redeploy**: After code changes, go to Deploy > Manage deployments > Edit > New version > Deploy.
- **Tab name limits**: Tab names are capped at ~30 characters from the tournament ID to stay under the 100-character limit.
