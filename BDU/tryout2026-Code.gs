// ===================================================================
//  BDU 2026 Tryout Evaluations — Google Apps Script
//
//  SETUP STEPS:
//  1. Open your Google Sheet
//  2. Extensions → Apps Script → paste this code
//  3. Run setupSheet() once to create headers + pre-populate players
//  4. Deploy → New deployment → Web app
//       Execute as: Me  |  Who has access: Anyone
//  5. Copy the web app URL into tryout2026.html, scrimmage2026.html,
//     and results2026.html (SCRIPT_URL constant in each file)
// ===================================================================

const SHEET_NAME = 'Tryout2026';

const HEADERS = [
  'Name', 'Age_Group', 'Jersey',
  'Speed', 'Control', 'Shot_Accuracy', 'Touch', 'Shot_Power',
  'Long_Pass_Accuracy', 'Short_Pass_Accuracy', 'Hustle',
  'Notes', 'Scrimmage_Points', 'Last_Updated'
];

const RATING_KEYS = [
  'Speed', 'Control', 'Shot_Accuracy', 'Touch', 'Shot_Power',
  'Long_Pass_Accuracy', 'Short_Pass_Accuracy', 'Hustle'
];

const INITIAL_PLAYERS = [
  ['Carson Bellanger',   'Age 8'],
  ['Gabrielle Loerch',   'Age 8'],
  ['Kelsey Ketvertis',   'Age 8'],
  ['Austin Bellanger',   'Age 9'],
  ['Gabriella Beastrom', 'Age 9'],
  ['Haylie Hujarski',    'Age 9'],
  ['Felicity Nash',      'Age 10'],
  ['Alena Rodgers',      'Age 11'],
  ['Isla Zdolshek',      'Age 11'],
  ['Layla Kandzer',      'Age 11'],
  ['Lilly Karim',        'Age 11'],
  ['Olivia Karim',       'Age 11'],
];

// -------------------------------------------------------------------
//  setupSheet() — run this ONCE from the Apps Script editor
// -------------------------------------------------------------------
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  } else {
    sheet.clearContents();
    sheet.clearFormats();
  }

  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);

  const hdr = sheet.getRange(1, 1, 1, HEADERS.length);
  hdr.setBackground('#1a1a2e');
  hdr.setFontColor('#00ff88');
  hdr.setFontWeight('bold');
  hdr.setFontSize(11);
  hdr.setHorizontalAlignment('center');

  INITIAL_PLAYERS.forEach(([name, age], i) => {
    sheet.getRange(i + 2, 1).setValue(name);
    sheet.getRange(i + 2, 2).setValue(age);
    sheet.getRange(i + 2, 13).setValue(0); // Scrimmage_Points default
  });

  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, HEADERS.length);

  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, HEADERS.length)
         .sort([{ column: 2, ascending: true }, { column: 1, ascending: true }]);
  }

  SpreadsheetApp.getUi().alert(
    'Setup complete! ' + INITIAL_PLAYERS.length + ' players added to ' + SHEET_NAME
  );
}

// -------------------------------------------------------------------
//  addScrimmageColumn() — run this if you set up the sheet BEFORE
//  Scrimmage_Points was added (migration helper)
// -------------------------------------------------------------------
function addScrimmageColumn() {
  const sheet = getSheet();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  if (headers.indexOf('Scrimmage_Points') >= 0) {
    SpreadsheetApp.getUi().alert('Scrimmage_Points column already exists.');
    return;
  }
  // Insert before Last_Updated, or append
  const lastUpdatedIdx = headers.indexOf('Last_Updated');
  let newCol;
  if (lastUpdatedIdx >= 0) {
    sheet.insertColumnBefore(lastUpdatedIdx + 1);
    newCol = lastUpdatedIdx + 1;
  } else {
    newCol = sheet.getLastColumn() + 1;
  }
  sheet.getRange(1, newCol).setValue('Scrimmage_Points');
  const hdr = sheet.getRange(1, newCol);
  hdr.setBackground('#1a1a2e');
  hdr.setFontColor('#00ff88');
  hdr.setFontWeight('bold');

  // Default existing rows to 0
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    for (let r = 2; r <= lastRow; r++) {
      sheet.getRange(r, newCol).setValue(0);
    }
  }
  SpreadsheetApp.getUi().alert('Scrimmage_Points column added!');
}

// -------------------------------------------------------------------
//  doGet
//  ?action=get&name=...       → single player row
//  ?action=getAllPlayers      → all players with all data
// -------------------------------------------------------------------
function doGet(e) {
  try {
    const action = e.parameter.action;
    const name   = e.parameter.name;

    if (action === 'get' && name) {
      const rowNum = findRow(name);
      return ok({ row: rowNum ? getRowObj(rowNum) : null });
    }

    if (action === 'getAllPlayers') {
      ensureScrimmageColumn();
      return ok({ players: getAllPlayers() });
    }

    return ok({ row: null });
  } catch (err) {
    return fail(err.toString());
  }
}

// -------------------------------------------------------------------
//  doPost
//  { action: 'save', ... }              → save tryout evaluation
//  { action: 'saveJersey', ... }        → save jersey only
//  { action: 'addPlayer', ... }         → add new player row
//  { action: 'setScrimmagePoints', ... }→ set absolute scrimmage tally
// -------------------------------------------------------------------
function doPost(e) {
  try {
    const data   = JSON.parse(e.postData.contents);
    const action = data.action;

    if (action === 'save') {
      upsertEvaluation(data);
      return ok({});
    }

    if (action === 'saveJersey') {
      const row = findRow(data.name);
      if (row) {
        const col = getColIndex('Jersey');
        if (col) getSheet().getRange(row, col).setValue(data.jersey || '');
      }
      return ok({});
    }

    if (action === 'addPlayer') {
      if (!findRow(data.name)) {
        ensureScrimmageColumn();
        const sheet  = getSheet();
        const newRow = sheet.getLastRow() + 1;
        sheet.getRange(newRow, 1).setValue(data.name);
        sheet.getRange(newRow, 2).setValue(data.ageGroup);
        const spCol = getColIndex('Scrimmage_Points');
        if (spCol) sheet.getRange(newRow, spCol).setValue(0);
      }
      return ok({});
    }

    if (action === 'setScrimmagePoints') {
      ensureScrimmageColumn();
      const lock = LockService.getScriptLock();
      lock.waitLock(10000);
      try {
        const sheet  = getSheet();
        const rowNum = findRow(data.name);
        if (!rowNum) return fail('Player not found: ' + data.name);
        const spCol = getColIndex('Scrimmage_Points');
        const luCol = getColIndex('Last_Updated');
        const points = Math.max(0, parseInt(data.points) || 0);
        if (spCol) sheet.getRange(rowNum, spCol).setValue(points);
        if (luCol) sheet.getRange(rowNum, luCol).setValue(new Date().toLocaleString());
        return ok({ points });
      } finally {
        lock.releaseLock();
      }
    }

    return fail('Unknown action: ' + action);
  } catch (err) {
    return fail(err.toString());
  }
}

// -------------------------------------------------------------------
//  Internal helpers
// -------------------------------------------------------------------
function upsertEvaluation(data) {
  const sheet  = getSheet();
  let rowNum   = findRow(data.name);
  let existingScrimmage = 0;

  if (rowNum) {
    // Preserve existing scrimmage points
    const spCol = getColIndex('Scrimmage_Points');
    if (spCol) existingScrimmage = parseInt(sheet.getRange(rowNum, spCol).getValue()) || 0;
  } else {
    rowNum = sheet.getLastRow() + 1;
  }

  const values = [
    data.name,
    data.ageGroup              || '',
    data.jersey                || '',
    data['Speed']              || '',
    data['Control']            || '',
    data['Shot_Accuracy']      || '',
    data['Touch']              || '',
    data['Shot_Power']         || '',
    data['Long_Pass_Accuracy'] || '',
    data['Short_Pass_Accuracy']|| '',
    data['Hustle']             || '',
    data.notes                 || '',
    existingScrimmage,
    new Date().toLocaleString(),
  ];

  sheet.getRange(rowNum, 1, 1, HEADERS.length).setValues([values]);
  colorRatingCells(sheet, rowNum);
}

function getAllPlayers() {
  const sheet   = getSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  const lastCol   = sheet.getLastColumn();
  const headers   = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const dataRange = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  return dataRange
    .filter(row => row[0])
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i]; });
      return obj;
    });
}

function colorRatingCells(sheet, rowNum) {
  const palette = ['', '#fc8181', '#f6ad55', '#faf089', '#9ae6b4', '#00ff88'];
  RATING_KEYS.forEach(key => {
    const col = getColIndex(key);
    if (!col) return;
    const cell = sheet.getRange(rowNum, col);
    const val  = parseInt(cell.getValue());
    cell.setBackground((!val || val < 1 || val > 5) ? null : palette[val]);
    if (val >= 1 && val <= 5) cell.setFontWeight('bold');
  });
}

function getRowObj(rowNum) {
  const sheet   = getSheet();
  const lastCol = sheet.getLastColumn();
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const values  = sheet.getRange(rowNum, 1, 1, lastCol).getValues()[0];
  const obj = {};
  headers.forEach((h, i) => { obj[h] = values[i]; });
  return obj;
}

function findRow(name) {
  const sheet   = getSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;
  const names = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let i = 0; i < names.length; i++) {
    if (names[i][0] === name) return i + 2;
  }
  return null;
}

function getColIndex(headerName) {
  const sheet   = getSheet();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const idx     = headers.indexOf(headerName);
  return idx >= 0 ? idx + 1 : null;
}

function ensureScrimmageColumn() {
  const sheet   = getSheet();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  if (headers.indexOf('Scrimmage_Points') >= 0) return;

  const lastUpdatedIdx = headers.indexOf('Last_Updated');
  let newCol;
  if (lastUpdatedIdx >= 0) {
    sheet.insertColumnBefore(lastUpdatedIdx + 1);
    newCol = lastUpdatedIdx + 1;
  } else {
    newCol = sheet.getLastColumn() + 1;
  }
  sheet.getRange(1, newCol).setValue('Scrimmage_Points');
  const hdr = sheet.getRange(1, newCol);
  hdr.setBackground('#1a1a2e');
  hdr.setFontColor('#00ff88');
  hdr.setFontWeight('bold');

  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, newCol, lastRow - 1, 1)
         .setValues(Array(lastRow - 1).fill([0]));
  }
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
}

function ok(extra) {
  return ContentService
    .createTextOutput(JSON.stringify({ success: true, ...extra }))
    .setMimeType(ContentService.MimeType.JSON);
}

function fail(msg) {
  return ContentService
    .createTextOutput(JSON.stringify({ success: false, error: msg }))
    .setMimeType(ContentService.MimeType.JSON);
}
