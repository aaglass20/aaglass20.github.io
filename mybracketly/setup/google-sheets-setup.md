# MyBracketly - Google Sheets Backend Setup

This guide explains how to connect MyBracketly to Google Sheets for persistent data storage across devices.

## Overview

MyBracketly uses localStorage by default. Google Sheets adds:
- **Cross-device sync** — access your data from any browser
- **Data backup** — your competitions are saved in your Google account
- **Shared access** — others can view/interact with your boards

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. Name it something like "MyBracketly Data"

## Step 2: Set Up the Apps Script

1. In your Google Sheet, go to **Extensions → Apps Script**
2. Delete the default code and paste the script below
3. Click **Deploy → New deployment**
4. Select **Web app** as the type
5. Set **Execute as**: Me
6. Set **Who has access**: Anyone
7. Click **Deploy** and copy the web app URL

## Step 3: Configure MyBracketly

1. Go to your MyBracketly hub page
2. Expand **Google Sheets Settings** at the bottom
3. Paste your Apps Script URL and click **Save**

## Apps Script Code

### For Brackets

This handles tournament bracket data storage. Create the following tabs in your sheet:

- **TournamentIndex** — columns: ID, Name, Type, Status, ParticipantCount, CreatedAt, UpdatedAt

```javascript
function doGet(e) {
  var action = e.parameter.action;
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (action === 'listTournaments') {
    return getIndexData(ss);
  } else if (action === 'getTournament') {
    var id = e.parameter.id;
    return getTournamentData(ss, id);
  }

  return ContentService.createTextOutput(JSON.stringify({error: 'Unknown action'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var action = data.action;
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (action === 'saveTournament') {
    saveTournamentData(ss, data.id, data.data);
  } else if (action === 'deleteTournament') {
    deleteTournamentData(ss, data.id);
  } else if (action === 'archiveTournament') {
    updateTournamentStatus(ss, data.id, 'archived');
  } else if (action === 'unarchiveTournament') {
    updateTournamentStatus(ss, data.id, 'active');
  }

  return ContentService.createTextOutput(JSON.stringify({success: true}))
    .setMimeType(ContentService.MimeType.JSON);
}

function getIndexData(ss) {
  var sheet = ss.getSheetByName('TournamentIndex');
  if (!sheet) return ContentService.createTextOutput('[]').setMimeType(ContentService.MimeType.JSON);

  var data = sheet.getDataRange().getValues();
  var tournaments = [];
  for (var i = 1; i < data.length; i++) {
    tournaments.push({
      id: data[i][0], name: data[i][1], type: data[i][2],
      status: data[i][3], participantCount: data[i][4],
      createdAt: data[i][5], updatedAt: data[i][6]
    });
  }
  return ContentService.createTextOutput(JSON.stringify(tournaments))
    .setMimeType(ContentService.MimeType.JSON);
}

function getTournamentData(ss, id) {
  var sheet = ss.getSheetByName('T_' + id);
  if (!sheet) return ContentService.createTextOutput('{}').setMimeType(ContentService.MimeType.JSON);

  var data = sheet.getRange('A1').getValue();
  return ContentService.createTextOutput(data || '{}').setMimeType(ContentService.MimeType.JSON);
}

function saveTournamentData(ss, id, jsonData) {
  // Update or create data tab
  var sheetName = 'T_' + id;
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);
  sheet.getRange('A1').setValue(jsonData);

  // Update index
  var parsed = JSON.parse(jsonData);
  updateIndex(ss, id, parsed.name, parsed.type, 'active',
    parsed.participants ? parsed.participants.length : 0);
}

function deleteTournamentData(ss, id) {
  var sheet = ss.getSheetByName('T_' + id);
  if (sheet) ss.deleteSheet(sheet);
  removeFromIndex(ss, id);
}

function updateTournamentStatus(ss, id, status) {
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

function updateIndex(ss, id, name, type, status, count) {
  var sheet = ss.getSheetByName('TournamentIndex');
  if (!sheet) {
    sheet = ss.insertSheet('TournamentIndex');
    sheet.getRange('A1:G1').setValues([['ID', 'Name', 'Type', 'Status', 'ParticipantCount', 'CreatedAt', 'UpdatedAt']]);
  }

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

function removeFromIndex(ss, id) {
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
```

### For Squares

This handles squares board data. Create these tabs:

- **Grid** — 10x10 grid (B2:K11)
- **Numbers** — Row B1 (row numbers CSV), B2 (col numbers CSV), B3 (generated flag)
- **Config** — Round configuration rows
- **Games** — Game data rows
- **LinkedGames** — ESPN game ID mappings
- **LockedGames** — Locked game IDs
- **PaidUsers** — User payment tracking
- **PayoutGroups** — Payout recipient mappings

See the existing `/ncaa/ncaa-squares-setup.md` for the detailed Apps Script code for squares boards. The same script works — just deploy it and paste the URL into MyBracketly settings.

## Tips

- You can use one Google Sheet with separate tabs for brackets and squares
- The Apps Script URL is shared across all your MyBracketly projects
- localStorage is always the primary store — Sheets syncs in the background
- If Sheets is unavailable, the app continues working offline
