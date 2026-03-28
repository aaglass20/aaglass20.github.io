# MyBracketly - Google Sheets Backend Setup

This guide explains how to connect MyBracketly to Google Sheets for persistent data storage across devices.

## Overview

MyBracketly uses localStorage by default. Google Sheets adds:
- **Cross-device sync** — access your data from any browser
- **Data backup** — your competitions are saved in your Google account
- **Shared access** — others can view/interact with your boards

## Quick Start (3 steps)

### Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. Name it something like "MyBracketly Data"

### Step 2: Add the Apps Script

1. In your Google Sheet, go to **Extensions → Apps Script**
2. Delete the default code and paste the **Unified Apps Script** below
3. Click **Save** (name the project "MyBracketly Backend")
4. Click **Deploy → New deployment**
5. Select **Web app** as the type
6. Set **Execute as**: Me
7. Set **Who has access**: Anyone
8. Click **Deploy**, authorize when prompted, and **copy the web app URL**

### Step 3: Configure MyBracketly

1. Go to your MyBracketly hub page
2. Expand **Google Sheets Settings** at the bottom
3. Paste your Apps Script URL and click **Save**
4. All tabs and columns are created automatically on first use — no manual setup needed!

---

## Unified Apps Script

This single script handles **both** brackets and squares. All tabs are auto-created on first use.

```javascript
/* ============================================
   MyBracketly - Unified Google Sheets Backend
   Handles Brackets + Squares
   Tabs are auto-created on first use
   ============================================ */

// =============================================
// AUTO-SETUP: Creates all tabs and headers
// =============================================

function initBracketTabs(ss) {
  // TournamentIndex tab
  var indexSheet = ss.getSheetByName('TournamentIndex');
  if (!indexSheet) {
    indexSheet = ss.insertSheet('TournamentIndex');
    indexSheet.getRange('A1:G1').setValues([['ID', 'Name', 'Type', 'Status', 'ParticipantCount', 'CreatedAt', 'UpdatedAt']]);
    indexSheet.setFrozenRows(1);
    indexSheet.getRange('A1:G1').setFontWeight('bold').setBackground('#002B5C').setFontColor('#FFFFFF');
    indexSheet.setColumnWidth(1, 200);
    indexSheet.setColumnWidth(2, 200);
    indexSheet.setColumnWidth(6, 180);
    indexSheet.setColumnWidth(7, 180);
  }
  return indexSheet;
}

function initSquaresTabs(ss, roundPreset) {
  // Grid tab (10x10)
  var gridSheet = ss.getSheetByName('Grid');
  if (!gridSheet) {
    gridSheet = ss.insertSheet('Grid');
    // Column A: row labels (0-9)
    gridSheet.getRange('A1').setValue('Row / Col');
    for (var i = 0; i < 10; i++) {
      gridSheet.getRange(i + 2, 1).setValue(i);
    }
    // Row 1: column labels (0-9) in B1:K1
    for (var j = 0; j < 10; j++) {
      gridSheet.getRange(1, j + 2).setValue(j);
    }
    // Style headers
    gridSheet.getRange('A1:K1').setFontWeight('bold').setBackground('#002B5C').setFontColor('#FFFFFF').setHorizontalAlignment('center');
    gridSheet.getRange('A1:A11').setFontWeight('bold').setBackground('#002B5C').setFontColor('#FFFFFF').setHorizontalAlignment('center');
    // Set cell sizes for grid feel
    for (var c = 2; c <= 11; c++) {
      gridSheet.setColumnWidth(c, 90);
    }
    for (var r = 2; r <= 11; r++) {
      gridSheet.setRowHeight(r, 30);
    }
    gridSheet.getRange('B2:K11').setHorizontalAlignment('center');
    gridSheet.setFrozenRows(1);
    gridSheet.setFrozenColumns(1);
  }

  // Numbers tab
  var numbersSheet = ss.getSheetByName('Numbers');
  if (!numbersSheet) {
    numbersSheet = ss.insertSheet('Numbers');
    numbersSheet.getRange('A1:A3').setValues([['RowNumbers'], ['ColNumbers'], ['Generated']]);
    numbersSheet.getRange('B3').setValue(false);
    numbersSheet.getRange('A1:A3').setFontWeight('bold');
  }

  // Config tab
  var configSheet = ss.getSheetByName('Config');
  if (!configSheet) {
    configSheet = ss.insertSheet('Config');
    configSheet.getRange('A1:F1').setValues([['Round', 'GamesCount', 'Amount', 'InverseAmount', 'ExcludeNormal', 'ExcludeInverse']]);
    configSheet.getRange('A1:F1').setFontWeight('bold').setBackground('#002B5C').setFontColor('#FFFFFF');
    configSheet.setFrozenRows(1);
    configSheet.setColumnWidth(1, 250);

    // If a round preset was provided, populate it
    if (roundPreset && roundPreset.length > 0) {
      for (var i = 0; i < roundPreset.length; i++) {
        var rp = roundPreset[i];
        configSheet.getRange(i + 2, 1, 1, 6).setValues([[
          rp.round || ('Round ' + (i + 1)),
          rp.gamesCount || 1,
          0,
          0,
          rp.excludeNormal || false,
          rp.excludeInverse || false
        ]]);
      }
    }
  }

  // Games tab
  var gamesSheet = ss.getSheetByName('Games');
  if (!gamesSheet) {
    gamesSheet = ss.insertSheet('Games');
    gamesSheet.getRange('A1:F1').setValues([['GameID', 'Round', 'Team1', 'Team2', 'Score1', 'Score2']]);
    gamesSheet.getRange('A1:F1').setFontWeight('bold').setBackground('#002B5C').setFontColor('#FFFFFF');
    gamesSheet.setFrozenRows(1);

    // Auto-populate game rows from config rounds
    if (roundPreset && roundPreset.length > 0) {
      var gameId = 1;
      for (var i = 0; i < roundPreset.length; i++) {
        var count = roundPreset[i].gamesCount || 1;
        for (var g = 0; g < count; g++) {
          gamesSheet.getRange(gameId + 1, 1, 1, 6).setValues([[
            gameId,
            roundPreset[i].round || ('Round ' + (i + 1)),
            '', '', '', ''
          ]]);
          gameId++;
        }
      }
    }
  }

  // LinkedGames tab
  var linkedSheet = ss.getSheetByName('LinkedGames');
  if (!linkedSheet) {
    linkedSheet = ss.insertSheet('LinkedGames');
    linkedSheet.getRange('A1:B1').setValues([['GameID', 'ApiGameID']]);
    linkedSheet.getRange('A1:B1').setFontWeight('bold').setBackground('#002B5C').setFontColor('#FFFFFF');
    linkedSheet.setFrozenRows(1);
  }

  // LockedGames tab
  var lockedSheet = ss.getSheetByName('LockedGames');
  if (!lockedSheet) {
    lockedSheet = ss.insertSheet('LockedGames');
    lockedSheet.getRange('A1').setValue('GameID');
    lockedSheet.getRange('A1').setFontWeight('bold').setBackground('#002B5C').setFontColor('#FFFFFF');
    lockedSheet.setFrozenRows(1);
  }

  // PaidUsers tab
  var paidSheet = ss.getSheetByName('PaidUsers');
  if (!paidSheet) {
    paidSheet = ss.insertSheet('PaidUsers');
    paidSheet.getRange('A1:C1').setValues([['Name', 'Paid', 'Notes']]);
    paidSheet.getRange('A1:C1').setFontWeight('bold').setBackground('#002B5C').setFontColor('#FFFFFF');
    paidSheet.setFrozenRows(1);
    paidSheet.setColumnWidth(3, 300);
  }

  // PayoutGroups tab
  var payoutSheet = ss.getSheetByName('PayoutGroups');
  if (!payoutSheet) {
    payoutSheet = ss.insertSheet('PayoutGroups');
    payoutSheet.getRange('A1:B1').setValues([['UserKey', 'PayoutRecipientKey']]);
    payoutSheet.getRange('A1:B1').setFontWeight('bold').setBackground('#002B5C').setFontColor('#FFFFFF');
    payoutSheet.setFrozenRows(1);
  }

  // Delete the default "Sheet1" if it still exists and we created other sheets
  var defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defaultSheet); } catch(e) { /* ignore if it's the only sheet */ }
  }
}

// =============================================
// GET HANDLER
// =============================================

function doGet(e) {
  if (!e || !e.parameter) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'ok',
      message: 'MyBracketly API ready. Use ?action=init&type=brackets or ?action=init&type=squares to set up tabs.'
    })).setMimeType(ContentService.MimeType.JSON);
  }

  try {
    var action = e.parameter.action;
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // --- Initialize / Setup ---
    if (action === 'init') {
      var type = e.parameter.type || 'all';
      if (type === 'brackets' || type === 'all') {
        initBracketTabs(ss);
      }
      if (type === 'squares' || type === 'all') {
        var preset = [];
        try { preset = JSON.parse(e.parameter.preset || '[]'); } catch(err) {}
        initSquaresTabs(ss, preset);
      }
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Tabs initialized for: ' + type
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // --- Bracket Actions ---
    if (action === 'listTournaments') {
      return getBracketIndex(ss);
    }
    if (action === 'getTournament') {
      return getBracketData(ss, e.parameter.id);
    }

    // --- Squares Actions (GET = load all data) ---
    if (action === 'getData') {
      return getSquaresData(ss);
    }

    return ContentService.createTextOutput(JSON.stringify({error: 'Unknown action: ' + action}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// =============================================
// POST HANDLER
// =============================================

function doPost(e) {
  if (!e || !e.postData) {
    return ContentService.createTextOutput(JSON.stringify({error: 'No data received'}))
      .setMimeType(ContentService.MimeType.JSON);
  }

  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // --- Bracket Actions ---
    if (action === 'saveTournament') {
      initBracketTabs(ss); // ensure tabs exist
      saveBracketData(ss, data.id, data.data);
      return jsonOk('Tournament saved');
    }
    if (action === 'deleteTournament') {
      deleteBracketData(ss, data.id);
      return jsonOk('Tournament deleted');
    }
    if (action === 'archiveTournament') {
      updateBracketStatus(ss, data.id, 'archived');
      return jsonOk('Tournament archived');
    }
    if (action === 'unarchiveTournament') {
      updateBracketStatus(ss, data.id, 'active');
      return jsonOk('Tournament unarchived');
    }

    // --- Squares Actions ---
    if (action === 'initSquares') {
      var preset = data.preset || [];
      initSquaresTabs(ss, preset);
      return jsonOk('Squares tabs initialized');
    }
    if (action === 'claimSquare') {
      var gridSheet = ss.getSheetByName('Grid');
      if (!gridSheet) { initSquaresTabs(ss, []); gridSheet = ss.getSheetByName('Grid'); }
      gridSheet.getRange(data.row + 2, data.col + 2).setValue(data.name);
      return jsonOk('Square claimed');
    }
    if (action === 'generateNumbers') {
      var numbersSheet = ss.getSheetByName('Numbers');
      if (!numbersSheet) { initSquaresTabs(ss, []); numbersSheet = ss.getSheetByName('Numbers'); }
      numbersSheet.getRange('B1').setValue(data.rowNumbers);
      numbersSheet.getRange('B2').setValue(data.colNumbers);
      numbersSheet.getRange('B3').setValue(true);
      return jsonOk('Numbers generated');
    }
    if (action === 'saveConfig') {
      var configSheet = ss.getSheetByName('Config');
      if (!configSheet) return jsonError('Config tab not found');
      var rounds = data.rounds;
      for (var i = 0; i < rounds.length; i++) {
        configSheet.getRange(i + 2, 3).setValue(rounds[i].amount);
        configSheet.getRange(i + 2, 4).setValue(rounds[i].inverseAmount);
        configSheet.getRange(i + 2, 5).setValue(rounds[i].excludeNormal === true);
        configSheet.getRange(i + 2, 6).setValue(rounds[i].excludeInverse === true);
      }
      return jsonOk('Config saved');
    }
    if (action === 'saveExclusions') {
      var configSheet = ss.getSheetByName('Config');
      if (!configSheet) return jsonError('Config tab not found');
      var exclusions = data.exclusions;
      for (var i = 0; i < exclusions.length; i++) {
        configSheet.getRange(i + 2, 5).setValue(exclusions[i].excludeNormal === true);
        configSheet.getRange(i + 2, 6).setValue(exclusions[i].excludeInverse === true);
      }
      return jsonOk('Exclusions saved');
    }
    if (action === 'saveScore') {
      var gamesSheet = ss.getSheetByName('Games');
      if (!gamesSheet) return jsonError('Games tab not found');
      var gamesData = gamesSheet.getDataRange().getValues();
      for (var j = 1; j < gamesData.length; j++) {
        if (gamesData[j][0] == data.gameId) {
          gamesSheet.getRange(j + 1, 3).setValue(data.team1);
          gamesSheet.getRange(j + 1, 4).setValue(data.team2);
          gamesSheet.getRange(j + 1, 5).setValue(data.score1);
          gamesSheet.getRange(j + 1, 6).setValue(data.score2);
          break;
        }
      }
      return jsonOk('Score saved');
    }
    if (action === 'savePaidUsers') {
      var paidSheet = ss.getSheetByName('PaidUsers');
      if (!paidSheet) { initSquaresTabs(ss, []); paidSheet = ss.getSheetByName('PaidUsers'); }
      var lastRow = paidSheet.getLastRow();
      if (lastRow > 1) paidSheet.getRange(2, 1, lastRow - 1, 3).clearContent();
      var paidUsers = data.paidUsers;
      var userNotes = data.userNotes || {};
      var names = Object.keys(paidUsers);
      Object.keys(userNotes).forEach(function(n) { if (names.indexOf(n) === -1) names.push(n); });
      for (var p = 0; p < names.length; p++) {
        paidSheet.getRange(p + 2, 1).setValue(names[p]);
        paidSheet.getRange(p + 2, 2).setValue(paidUsers[names[p]] === true);
        paidSheet.getRange(p + 2, 3).setValue(userNotes[names[p]] || '');
      }
      return jsonOk('Paid users saved');
    }
    if (action === 'saveLockedGames') {
      var lockedSheet = ss.getSheetByName('LockedGames');
      if (!lockedSheet) { initSquaresTabs(ss, []); lockedSheet = ss.getSheetByName('LockedGames'); }
      var lastRow = lockedSheet.getLastRow();
      if (lastRow > 1) lockedSheet.getRange(2, 1, lastRow - 1, 1).clearContent();
      var ids = data.lockedGameIds || [];
      for (var lk = 0; lk < ids.length; lk++) {
        lockedSheet.getRange(lk + 2, 1).setValue(Number(ids[lk]));
      }
      return jsonOk('Locked games saved');
    }
    if (action === 'saveLinkedGames') {
      var linkedSheet = ss.getSheetByName('LinkedGames');
      if (!linkedSheet) { initSquaresTabs(ss, []); linkedSheet = ss.getSheetByName('LinkedGames'); }
      var lastRow = linkedSheet.getLastRow();
      if (lastRow > 1) linkedSheet.getRange(2, 1, lastRow - 1, 2).clearContent();
      var lgData = data.linkedGames || {};
      var gameIds = Object.keys(lgData);
      for (var lg = 0; lg < gameIds.length; lg++) {
        linkedSheet.getRange(lg + 2, 1).setValue(Number(gameIds[lg]));
        linkedSheet.getRange(lg + 2, 2).setValue(lgData[gameIds[lg]]);
      }
      return jsonOk('Linked games saved');
    }
    if (action === 'savePayoutGroups') {
      var payoutSheet = ss.getSheetByName('PayoutGroups');
      if (!payoutSheet) { initSquaresTabs(ss, []); payoutSheet = ss.getSheetByName('PayoutGroups'); }
      var lastRow = payoutSheet.getLastRow();
      if (lastRow > 1) payoutSheet.getRange(2, 1, lastRow - 1, 2).clearContent();
      var pgData = data.payoutGroups || {};
      var pgKeys = Object.keys(pgData);
      for (var pg = 0; pg < pgKeys.length; pg++) {
        payoutSheet.getRange(pg + 2, 1).setValue(pgKeys[pg]);
        payoutSheet.getRange(pg + 2, 2).setValue(pgData[pgKeys[pg]]);
      }
      return jsonOk('Payout groups saved');
    }

    return jsonError('Unknown action: ' + action);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// =============================================
// BRACKET FUNCTIONS
// =============================================

function getBracketIndex(ss) {
  var sheet = ss.getSheetByName('TournamentIndex');
  if (!sheet) {
    initBracketTabs(ss);
    return ContentService.createTextOutput('[]').setMimeType(ContentService.MimeType.JSON);
  }
  var data = sheet.getDataRange().getValues();
  var tournaments = [];
  for (var i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    tournaments.push({
      id: data[i][0], name: data[i][1], type: data[i][2],
      status: data[i][3], participantCount: data[i][4],
      createdAt: data[i][5], updatedAt: data[i][6]
    });
  }
  return ContentService.createTextOutput(JSON.stringify(tournaments))
    .setMimeType(ContentService.MimeType.JSON);
}

function getBracketData(ss, id) {
  var sheet = ss.getSheetByName('T_' + id);
  if (!sheet) return ContentService.createTextOutput('{}').setMimeType(ContentService.MimeType.JSON);
  var data = sheet.getRange('A1').getValue();
  return ContentService.createTextOutput(data || '{}').setMimeType(ContentService.MimeType.JSON);
}

function saveBracketData(ss, id, jsonData) {
  var sheetName = 'T_' + id;
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);
  sheet.getRange('A1').setValue(jsonData);

  var parsed = JSON.parse(jsonData);
  updateBracketIndex(ss, id, parsed.name, parsed.type, 'active',
    parsed.participants ? parsed.participants.length : 0);
}

function deleteBracketData(ss, id) {
  var sheet = ss.getSheetByName('T_' + id);
  if (sheet) ss.deleteSheet(sheet);
  removeBracketFromIndex(ss, id);
}

function updateBracketStatus(ss, id, status) {
  var sheet = ss.getSheetByName('TournamentIndex');
  if (!sheet) return;
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.getRange(i + 1, 4).setValue(status);
      sheet.getRange(i + 1, 7).setValue(new Date().toISOString());
      break;
    }
  }
}

function updateBracketIndex(ss, id, name, type, status, count) {
  var sheet = ss.getSheetByName('TournamentIndex');
  if (!sheet) sheet = initBracketTabs(ss);
  var data = sheet.getDataRange().getValues();
  var now = new Date().toISOString();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.getRange(i + 1, 2, 1, 6).setValues([[name, type, status, count, data[i][5], now]]);
      return;
    }
  }
  sheet.appendRow([id, name, type, status, count, now, now]);
}

function removeBracketFromIndex(ss, id) {
  var sheet = ss.getSheetByName('TournamentIndex');
  if (!sheet) return;
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
}

// =============================================
// SQUARES FUNCTIONS
// =============================================

function getSquaresData(ss) {
  // Auto-init if tabs don't exist
  var gridSheet = ss.getSheetByName('Grid');
  if (!gridSheet) {
    initSquaresTabs(ss, []);
    gridSheet = ss.getSheetByName('Grid');
  }

  // Grid
  var gridValues = gridSheet.getRange('B2:K11').getValues();
  var grid = gridValues.map(function(row) {
    return row.map(function(cell) { return cell === '' ? '' : String(cell); });
  });

  // Numbers
  var numbersSheet = ss.getSheetByName('Numbers');
  var numbersData = numbersSheet.getRange('B1:B3').getValues();
  var numbers = {
    rowNumbers: numbersData[0][0] ? String(numbersData[0][0]) : '',
    colNumbers: numbersData[1][0] ? String(numbersData[1][0]) : '',
    generated: numbersData[2][0] === true || numbersData[2][0] === 'TRUE'
  };

  // Config
  var configSheet = ss.getSheetByName('Config');
  var config = [];
  if (configSheet && configSheet.getLastRow() > 1) {
    var configData = configSheet.getDataRange().getValues();
    for (var i = 1; i < configData.length; i++) {
      config.push({
        round: configData[i][0],
        gamesCount: configData[i][1],
        amount: configData[i][2] || 0,
        inverseAmount: configData[i][3] || 0,
        excludeNormal: configData[i][4] === true || configData[i][4] === 'TRUE',
        excludeInverse: configData[i][5] === true || configData[i][5] === 'TRUE'
      });
    }
  }

  // Games
  var gamesSheet = ss.getSheetByName('Games');
  var games = [];
  if (gamesSheet && gamesSheet.getLastRow() > 1) {
    var gamesData = gamesSheet.getDataRange().getValues();
    for (var j = 1; j < gamesData.length; j++) {
      games.push({
        gameId: gamesData[j][0],
        round: gamesData[j][1],
        team1: gamesData[j][2] || '',
        team2: gamesData[j][3] || '',
        score1: gamesData[j][4] === '' ? null : gamesData[j][4],
        score2: gamesData[j][5] === '' ? null : gamesData[j][5]
      });
    }
  }

  // LinkedGames
  var linkedGames = {};
  var linkedSheet = ss.getSheetByName('LinkedGames');
  if (linkedSheet && linkedSheet.getLastRow() > 1) {
    var linkedData = linkedSheet.getDataRange().getValues();
    for (var lg = 1; lg < linkedData.length; lg++) {
      if (linkedData[lg][0] && linkedData[lg][1]) {
        linkedGames[String(linkedData[lg][0])] = String(linkedData[lg][1]);
      }
    }
  }

  // LockedGames
  var lockedGameIds = [];
  var lockedSheet = ss.getSheetByName('LockedGames');
  if (lockedSheet && lockedSheet.getLastRow() > 1) {
    var lockedData = lockedSheet.getDataRange().getValues();
    for (var lk = 1; lk < lockedData.length; lk++) {
      if (lockedData[lk][0]) lockedGameIds.push(Number(lockedData[lk][0]));
    }
  }

  // PaidUsers
  var paidUsers = {};
  var userNotes = {};
  var paidSheet = ss.getSheetByName('PaidUsers');
  if (paidSheet && paidSheet.getLastRow() > 1) {
    var paidData = paidSheet.getDataRange().getValues();
    for (var p = 1; p < paidData.length; p++) {
      var nameKey = paidData[p][0];
      if (nameKey) {
        paidUsers[String(nameKey)] = paidData[p][1] === true || paidData[p][1] === 'TRUE';
        if (paidData[p][2]) userNotes[String(nameKey)] = String(paidData[p][2]);
      }
    }
  }

  // PayoutGroups
  var payoutGroups = {};
  var payoutSheet = ss.getSheetByName('PayoutGroups');
  if (payoutSheet && payoutSheet.getLastRow() > 1) {
    var payoutData = payoutSheet.getDataRange().getValues();
    for (var pg = 1; pg < payoutData.length; pg++) {
      if (payoutData[pg][0] && payoutData[pg][1]) {
        payoutGroups[String(payoutData[pg][0])] = String(payoutData[pg][1]);
      }
    }
  }

  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    grid: grid,
    numbers: numbers,
    config: config,
    games: games,
    linkedGames: linkedGames,
    lockedGameIds: lockedGameIds,
    paidUsers: paidUsers,
    userNotes: userNotes,
    payoutGroups: payoutGroups
  })).setMimeType(ContentService.MimeType.JSON);
}

// =============================================
// HELPERS
// =============================================

function jsonOk(message) {
  return ContentService.createTextOutput(JSON.stringify({success: true, message: message}))
    .setMimeType(ContentService.MimeType.JSON);
}

function jsonError(message) {
  return ContentService.createTextOutput(JSON.stringify({success: false, error: message}))
    .setMimeType(ContentService.MimeType.JSON);
}
```

---

## How Auto-Setup Works

When MyBracketly sends its first request to your Apps Script:

**For Brackets:** The `TournamentIndex` tab is created automatically with formatted headers (ID, Name, Type, Status, ParticipantCount, CreatedAt, UpdatedAt). Individual tournament data tabs (`T_{id}`) are created as you create tournaments.

**For Squares:** All 8 tabs are created automatically:

| Tab | Purpose | Auto-populated |
|-----|---------|---------------|
| **Grid** | 10x10 square grid (B2:K11) | Row/column labels, formatted cells |
| **Numbers** | Random number assignments | Header labels, Generated=FALSE |
| **Config** | Round payouts & rules | Headers + sport-specific round presets |
| **Games** | Game scores | Headers + game rows from round presets |
| **LinkedGames** | ESPN live game links | Headers only |
| **LockedGames** | Locked score IDs | Headers only |
| **PaidUsers** | Payment tracking | Headers only |
| **PayoutGroups** | Payout recipients | Headers only |

All tabs get styled headers (dark blue background, white text, frozen header rows) and appropriate column widths.

The default "Sheet1" tab is automatically removed after setup.

---

## Initializing Tabs Manually

You can also trigger setup manually by visiting your script URL with parameters:

- **All tabs:** `YOUR_SCRIPT_URL?action=init&type=all`
- **Brackets only:** `YOUR_SCRIPT_URL?action=init&type=brackets`
- **Squares only:** `YOUR_SCRIPT_URL?action=init&type=squares`
- **Squares with round preset:** `YOUR_SCRIPT_URL?action=init&type=squares&preset=[{"round":"Wild Card","gamesCount":6},{"round":"Divisional","gamesCount":4}]`

---

## Redeploying After Changes

If you update the Apps Script code:
1. Go to **Deploy → Manage deployments**
2. Click the pencil icon to edit
3. Change **Version** to "New version"
4. Click **Deploy**

---

## Tips

- One Google Sheet handles both brackets and squares
- The Apps Script URL is shared across all your MyBracketly projects
- localStorage is always the primary store — Sheets syncs in the background
- If Sheets is unavailable, the app works fully offline
- Tabs are only created once — re-running init won't overwrite existing data
