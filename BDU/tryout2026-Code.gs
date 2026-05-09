// ===================================================================
//  BDU 2026 Tryout Evaluations — Google Apps Script
//
//  SETUP STEPS:
//  1. Open your Google Sheet
//  2. Extensions → Apps Script → paste this code
//  3. Run setupSheet() once to create headers + pre-populate players
//  4. Deploy → New deployment → Web app
//       Execute as: Me  |  Who has access: Anyone
//  5. Copy the web app URL into tryout2026.html (SCRIPT_URL variable)
// ===================================================================

const SHEET_NAME = 'Tryout2026';

const HEADERS = [
  'Name', 'Age_Group', 'Jersey',
  'Speed', 'Control', 'Shot_Accuracy', 'Touch', 'Shot_Power',
  'Long_Pass_Accuracy', 'Short_Pass_Accuracy', 'Hustle',
  'Notes', 'Last_Updated'
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
//  setupSheet() — run this ONCE from the Apps Script editor to
//  initialize the sheet with headers and all player rows.
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

  // Write headers
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);

  // Style header row
  const hdr = sheet.getRange(1, 1, 1, HEADERS.length);
  hdr.setBackground('#1a1a2e');
  hdr.setFontColor('#00ff88');
  hdr.setFontWeight('bold');
  hdr.setFontSize(11);
  hdr.setHorizontalAlignment('center');

  // Pre-populate players (columns A + B only)
  INITIAL_PLAYERS.forEach(([name, age], i) => {
    sheet.getRange(i + 2, 1).setValue(name);
    sheet.getRange(i + 2, 2).setValue(age);
  });

  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, HEADERS.length);

  // Sort by age group then name
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
//  doGet — load a player's saved row
//  Called with ?action=get&name=Player%20Name
// -------------------------------------------------------------------
function doGet(e) {
  try {
    const action = e.parameter.action;
    const name   = e.parameter.name;

    if (action === 'get' && name) {
      const rowNum = findRow(name);
      if (rowNum) {
        return ok({ row: getRowObj(rowNum) });
      }
      return ok({ row: null });
    }

    return ok({ row: null });
  } catch (err) {
    return fail(err.toString());
  }
}

// -------------------------------------------------------------------
//  doPost — save evaluation | save jersey | add player
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
      if (row) getSheet().getRange(row, 3).setValue(data.jersey || '');
      return ok({});
    }

    if (action === 'addPlayer') {
      if (!findRow(data.name)) {
        const sheet  = getSheet();
        const newRow = sheet.getLastRow() + 1;
        sheet.getRange(newRow, 1).setValue(data.name);
        sheet.getRange(newRow, 2).setValue(data.ageGroup);
      }
      return ok({});
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
  const sheet = getSheet();
  let rowNum  = findRow(data.name);

  if (!rowNum) {
    rowNum = sheet.getLastRow() + 1;
  }

  const values = [
    data.name,
    data.ageGroup         || '',
    data.jersey           || '',
    data['Speed']         || '',
    data['Control']       || '',
    data['Shot_Accuracy'] || '',
    data['Touch']         || '',
    data['Shot_Power']    || '',
    data['Long_Pass_Accuracy']  || '',
    data['Short_Pass_Accuracy'] || '',
    data['Hustle']        || '',
    data.notes            || '',
    new Date().toLocaleString(),
  ];

  sheet.getRange(rowNum, 1, 1, HEADERS.length).setValues([values]);
  colorRatingCells(sheet, rowNum);
}

function colorRatingCells(sheet, rowNum) {
  // Rating columns are D–K (indices 4–11, i.e. 1-based col 4 to 11)
  const palette = ['', '#fc8181', '#f6ad55', '#faf089', '#9ae6b4', '#00ff88'];
  for (let col = 4; col <= 11; col++) {
    const cell = sheet.getRange(rowNum, col);
    const val  = parseInt(cell.getValue());
    cell.setBackground((!val || val < 1 || val > 5) ? null : palette[val]);
    if (val >= 1 && val <= 5) cell.setFontWeight('bold');
  }
}

function getRowObj(rowNum) {
  const sheet  = getSheet();
  const values = sheet.getRange(rowNum, 1, 1, HEADERS.length).getValues()[0];
  const obj    = {};
  HEADERS.forEach((h, i) => { obj[h] = values[i]; });
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
