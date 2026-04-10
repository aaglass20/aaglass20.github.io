/**
 * Google Apps Script for Softball Wristband Creator
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com and create a new project
 * 2. Paste this entire file into Code.gs
 * 3. Run the "setup" function once (it will create all tabs and columns)
 * 4. Click Deploy > New deployment > Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the web app URL and paste it into signs/index.html where it says PASTE_YOUR_SCRIPT_URL_HERE
 */

// Run this once to create all sheets and headers
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // --- SavedWristbands tab ---
  var wbSheet = ss.getSheetByName('SavedWristbands');
  if (!wbSheet) {
    wbSheet = ss.insertSheet('SavedWristbands');
  }
  wbSheet.getRange('A1:K1').setValues([[
    'ID', 'Title', 'AgeGroup', 'NumCols', 'NumRows',
    'RowEnds', 'Columns', 'Selections', 'CreatedAt', 'Name', 'TextStyle'
  ]]);
  wbSheet.getRange('A1:K1').setFontWeight('bold');
  wbSheet.setFrozenRows(1);
  wbSheet.setColumnWidth(1, 140);  // ID
  wbSheet.setColumnWidth(2, 120);  // Title
  wbSheet.setColumnWidth(3, 80);   // AgeGroup
  wbSheet.setColumnWidth(4, 80);   // NumCols
  wbSheet.setColumnWidth(5, 80);   // NumRows
  wbSheet.setColumnWidth(6, 200);  // RowEnds
  wbSheet.setColumnWidth(7, 300);  // Columns
  wbSheet.setColumnWidth(8, 400);  // Selections
  wbSheet.setColumnWidth(9, 160);  // CreatedAt
  wbSheet.setColumnWidth(10, 180); // Name
  wbSheet.setColumnWidth(11, 300); // TextStyle

  // --- CustomTerms tab ---
  var ctSheet = ss.getSheetByName('CustomTerms');
  if (!ctSheet) {
    ctSheet = ss.insertSheet('CustomTerms');
  }
  ctSheet.getRange('A1').setValue('Term');
  ctSheet.getRange('A1').setFontWeight('bold');
  ctSheet.setFrozenRows(1);
  ctSheet.setColumnWidth(1, 200);

  // --- Templates tab ---
  var tplSheet = ss.getSheetByName('Templates');
  if (!tplSheet) {
    tplSheet = ss.insertSheet('Templates');
  }
  tplSheet.getRange('A1:I1').setValues([[
    'Key', 'Title', 'AgeGroup', 'NumCols', 'NumRows',
    'RowEnds', 'Columns', 'Selections', 'CreatedAt'
  ]]);
  tplSheet.getRange('A1:I1').setFontWeight('bold');
  tplSheet.setFrozenRows(1);
  tplSheet.setColumnWidth(1, 80);
  tplSheet.setColumnWidth(2, 120);
  tplSheet.setColumnWidth(3, 80);
  tplSheet.setColumnWidth(4, 80);
  tplSheet.setColumnWidth(5, 80);
  tplSheet.setColumnWidth(6, 200);
  tplSheet.setColumnWidth(7, 300);
  tplSheet.setColumnWidth(8, 400);
  tplSheet.setColumnWidth(9, 160);

  // --- Settings tab (key/value user prefs) ---
  var setSheet = ss.getSheetByName('Settings');
  if (!setSheet) {
    setSheet = ss.insertSheet('Settings');
  }
  setSheet.getRange('A1:B1').setValues([['Key', 'Value']]);
  setSheet.getRange('A1:B1').setFontWeight('bold');
  setSheet.setFrozenRows(1);
  setSheet.setColumnWidth(1, 160);
  setSheet.setColumnWidth(2, 500);

  // Remove default Sheet1 if it exists and is empty
  var sheet1 = ss.getSheetByName('Sheet1');
  if (sheet1 && sheet1.getLastRow() <= 1 && sheet1.getLastColumn() <= 1) {
    ss.deleteSheet(sheet1);
  }

  SpreadsheetApp.flush();
  Logger.log('Setup complete! Tabs created: SavedWristbands, CustomTerms, Templates');
}

// Web app entry point for GET requests
function doGet(e) {
  var action = e.parameter.action;
  var result;

  switch (action) {
    case 'getWristbands':
      result = getWristbands();
      break;
    case 'getCustomTerms':
      result = getCustomTerms();
      break;
    case 'getTemplates':
      result = getTemplates();
      break;
    case 'getSettings':
      result = getSettings();
      break;
    default:
      result = { error: 'Unknown action: ' + action };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// Web app entry point for POST requests
function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var action = data.action;
  var result;

  switch (action) {
    case 'saveWristband':
      result = saveWristband(data.wristband);
      break;
    case 'updateWristband':
      result = updateWristband(data.wristband);
      break;
    case 'deleteWristband':
      result = deleteWristband(data.id);
      break;
    case 'saveCustomTerm':
      result = saveCustomTerm(data.term);
      break;
    case 'deleteCustomTerm':
      result = deleteCustomTerm(data.term);
      break;
    case 'saveTemplate':
      result = saveTemplate(data.key, data.template);
      break;
    case 'saveSetting':
      result = saveSetting(data.key, data.value);
      break;
    case 'renameWristband':
      result = renameWristband(data.id, data.name);
      break;
    default:
      result = { error: 'Unknown action: ' + action };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---- Saved Wristbands ----

function getWristbands() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SavedWristbands');
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var lastCol = Math.max(sheet.getLastColumn(), 11);

  var data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  return data.map(function(row) {
    var textStyle = null;
    if (row[10]) {
      try { textStyle = JSON.parse(row[10]); } catch (e) { textStyle = null; }
    }
    return {
      id: row[0],
      title: row[1],
      ageGroup: row[2],
      numCols: row[3],
      numRows: row[4],
      rowEnds: JSON.parse(row[5] || '[]'),
      columns: JSON.parse(row[6] || '[]'),
      selections: JSON.parse(row[7] || '{}'),
      createdAt: row[8],
      name: row[9] || row[1],
      textStyle: textStyle
    };
  });
}

function wristbandRowValues(wb) {
  return [
    wb.id,
    wb.title,
    wb.ageGroup,
    wb.numCols,
    wb.numRows,
    JSON.stringify(wb.rowEnds),
    JSON.stringify(wb.columns),
    JSON.stringify(wb.selections),
    wb.createdAt,
    wb.name || wb.title,
    wb.textStyle ? JSON.stringify(wb.textStyle) : ''
  ];
}

function saveWristband(wb) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SavedWristbands');
  sheet.appendRow(wristbandRowValues(wb));
  return { success: true };
}

function updateWristband(wb) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SavedWristbands');
  var lastRow = sheet.getLastRow();
  var values = wristbandRowValues(wb);
  for (var r = 2; r <= lastRow; r++) {
    if (String(sheet.getRange(r, 1).getValue()) === String(wb.id)) {
      sheet.getRange(r, 1, 1, values.length).setValues([values]);
      return { success: true };
    }
  }
  // Fallback: append if the row wasn't found
  sheet.appendRow(values);
  return { success: true, appended: true };
}

function renameWristband(id, name) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SavedWristbands');
  var lastRow = sheet.getLastRow();
  for (var r = 2; r <= lastRow; r++) {
    if (String(sheet.getRange(r, 1).getValue()) === String(id)) {
      sheet.getRange(r, 10).setValue(name);
      return { success: true };
    }
  }
  return { error: 'Not found' };
}

function deleteWristband(id) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SavedWristbands');
  var lastRow = sheet.getLastRow();
  // Search from bottom up so row numbers don't shift
  for (var r = lastRow; r >= 2; r--) {
    if (String(sheet.getRange(r, 1).getValue()) === String(id)) {
      sheet.deleteRow(r);
      return { success: true };
    }
  }
  return { error: 'Not found' };
}

// ---- Custom Terms ----

function getCustomTerms() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('CustomTerms');
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  var data = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  return data.map(function(row) { return row[0]; }).filter(function(t) { return t; });
}

function saveCustomTerm(term) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('CustomTerms');
  // Check for duplicates
  var lastRow = sheet.getLastRow();
  if (lastRow >= 2) {
    var existing = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
    if (existing.includes(term)) {
      return { error: 'Term already exists' };
    }
  }
  sheet.appendRow([term]);
  return { success: true };
}

function deleteCustomTerm(term) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('CustomTerms');
  var lastRow = sheet.getLastRow();
  for (var r = lastRow; r >= 2; r--) {
    if (sheet.getRange(r, 1).getValue() === term) {
      sheet.deleteRow(r);
      return { success: true };
    }
  }
  return { error: 'Not found' };
}

// ---- Templates ----

function getTemplates() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Templates');
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return {};

  var data = sheet.getRange(2, 1, lastRow - 1, 9).getValues();
  var templates = {};
  data.forEach(function(row) {
    templates[row[0]] = {
      title: row[1],
      ageGroup: row[2],
      numCols: row[3],
      numRows: row[4],
      rowEnds: JSON.parse(row[5] || '[]'),
      columns: JSON.parse(row[6] || '[]'),
      selections: JSON.parse(row[7] || '{}'),
      createdAt: row[8]
    };
  });
  return templates;
}

// ---- Settings (key/value user prefs) ----

function getSettings() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Settings');
  if (!sheet) return {};
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return {};

  var data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
  var settings = {};
  data.forEach(function(row) {
    if (!row[0]) return;
    var raw = row[1];
    try {
      settings[row[0]] = JSON.parse(raw);
    } catch (e) {
      settings[row[0]] = raw;
    }
  });
  return settings;
}

function saveSetting(key, value) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Settings');
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Settings');
    sheet.getRange('A1:B1').setValues([['Key', 'Value']]);
    sheet.getRange('A1:B1').setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  var serialized = (typeof value === 'string') ? value : JSON.stringify(value);
  var lastRow = sheet.getLastRow();

  for (var r = 2; r <= lastRow; r++) {
    if (sheet.getRange(r, 1).getValue() === key) {
      sheet.getRange(r, 2).setValue(serialized);
      return { success: true };
    }
  }
  sheet.appendRow([key, serialized]);
  return { success: true };
}

function saveTemplate(key, tpl) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Templates');
  var lastRow = sheet.getLastRow();

  // Update if key exists, otherwise append
  for (var r = 2; r <= lastRow; r++) {
    if (sheet.getRange(r, 1).getValue() === key) {
      sheet.getRange(r, 1, 1, 9).setValues([[
        key, tpl.title, tpl.ageGroup, tpl.numCols, tpl.numRows,
        JSON.stringify(tpl.rowEnds), JSON.stringify(tpl.columns),
        JSON.stringify(tpl.selections), tpl.createdAt || new Date().toLocaleString()
      ]]);
      return { success: true };
    }
  }

  sheet.appendRow([
    key, tpl.title, tpl.ageGroup, tpl.numCols, tpl.numRows,
    JSON.stringify(tpl.rowEnds), JSON.stringify(tpl.columns),
    JSON.stringify(tpl.selections), tpl.createdAt || new Date().toLocaleString()
  ]);
  return { success: true };
}
