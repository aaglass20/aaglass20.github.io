/**
 * BDU Game Day — Google Apps Script web app
 * ------------------------------------------
 * Bound to the Game Day Google Sheet. Provides two-way sync for the
 * game-day.html page so coaches don't have to copy/paste.
 *
 * SETUP:
 *   1. Open your Game Day Google Sheet.
 *   2. Extensions → Apps Script. Delete any starter code.
 *   3. Paste this entire file in. Save (disk icon). Name the project anything.
 *   4. Click "Deploy" → "New deployment".
 *        Type:        Web app
 *        Description: BDU Game Day sync
 *        Execute as:  Me (your account)
 *        Who has access: Anyone        ← required so the page can call it
 *   5. Click Deploy. Google will prompt to authorize — review the scopes
 *      (it only touches THIS spreadsheet) and click Allow.
 *   6. Copy the Web app URL it gives you (ends in /exec).
 *   7. In BDU/game-day.html, find:
 *          const WEBAPP_URL = '';
 *      and paste the URL between the quotes. Commit & deploy the page.
 *
 * That's it. The page now Pulls and Saves directly to the sheet.
 *
 * NOTES:
 *   - This script writes to tabs: Lineups, Stats, DepthChart, Games.
 *     It will create them with headers if missing.
 *   - Roster is read by the page directly via the public gviz endpoint;
 *     this script never modifies it.
 *   - Save is destructive for Lineups / Stats / DepthChart (clears the
 *     existing rows and writes the current browser state). Games is
 *     append-only — it adds locally-created games but never removes any.
 *   - When you change the script, you must redeploy: Deploy → Manage
 *     deployments → pencil icon → Version: New version → Deploy.
 *     Otherwise the old code keeps serving.
 */

const TAB = {
  ROSTER:  'Roster',
  GAMES:   'Games',
  LINEUPS: 'Lineups',
  STATS:   'Stats',
  DEPTH:   'DepthChart',
};

const HEADERS = {
  [TAB.LINEUPS]: ['GameID', 'Half', 'Position', 'Role', 'Player'],
  [TAB.STATS]:   ['GameID', 'Minute', 'Type', 'Player'],
  [TAB.DEPTH]:   ['Position', 'Rank', 'Player'],
  [TAB.GAMES]:   ['GameID', 'Date', 'Opponent', 'Location', 'HomeAway', 'Type', 'Notes'],
  Plays:         ['GameID', 'Name', 'ImageData'],
};

// ---------- HTTP ENTRY POINTS ----------

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || '';
    if (action === 'pull') {
      return jsonResponse(pullAll());
    }
    return jsonResponse({ ok: true, hint: 'POST with {action:"sync", ...} or GET ?action=pull' });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.action === 'sync') {
      const written = {
        lineups: writeLineups(body.lineups || {}),
        stats:   writeStats(body.stats || {}),
        depth:   writeDepth(body.depth || {}),
        games:   appendGames(body.games || []),
        plays:   writePlays(body.plays || {}),
      };
      return jsonResponse({ ok: true, written: written });
    }
    return jsonResponse({ ok: false, error: 'unknown action: ' + body.action });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---------- PUSH (browser → sheet) ----------

function writeLineups(lineups) {
  const sh = getOrCreateSheet(TAB.LINEUPS);
  // Force-update the header to current schema (Role column) before writing
  const headers = HEADERS[TAB.LINEUPS];
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  // Clear any extra trailing columns from a prior schema
  if (sh.getLastColumn() > headers.length) {
    sh.getRange(1, headers.length + 1, Math.max(1, sh.getLastRow()), sh.getLastColumn() - headers.length).clearContent();
  }
  clearBody(sh, headers.length);
  const rows = [];
  Object.keys(lineups).forEach(function (gid) {
    const halves = lineups[gid] || {};
    ['1', '2', 'custom'].forEach(function (h) {
      const half = halves[h] || {};
      const halfLabel = h === 'custom' ? 'Custom' : h;
      if (h === 'custom' && half._formation) {
        rows.push([gid, 'Custom', '_formation', 'Meta', half._formation]);
      }
      Object.keys(half).forEach(function (pos) {
        if (pos.charAt(0) === '_') return;
        const val = half[pos];
        if (!val) return;
        if (typeof val === 'string') {
          rows.push([gid, halfLabel, pos, 'Starter', val]);
        } else {
          if (val.s) rows.push([gid, halfLabel, pos, 'Starter', val.s]);
          (val.subs || []).forEach(function (name) {
            if (name) rows.push([gid, halfLabel, pos, 'Sub', name]);
          });
        }
      });
    });
    // Out for game
    (halves.out || []).forEach(function (name) {
      if (name) rows.push([gid, '', 'OUT', 'Out', name]);
    });
  });
  if (rows.length) {
    sh.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
  return rows.length;
}

function writeStats(stats) {
  const sh = getOrCreateSheet(TAB.STATS);
  clearBody(sh, HEADERS[TAB.STATS].length);
  const rows = [];
  Object.keys(stats).forEach(function (gid) {
    (stats[gid] || []).forEach(function (s) {
      rows.push([gid, s.minute || '', s.type || '', s.player || '']);
    });
  });
  if (rows.length) {
    sh.getRange(2, 1, rows.length, HEADERS[TAB.STATS].length).setValues(rows);
  }
  return rows.length;
}

function writeDepth(depth) {
  const sh = getOrCreateSheet(TAB.DEPTH);
  clearBody(sh, HEADERS[TAB.DEPTH].length);
  const rows = [];
  Object.keys(depth).forEach(function (pos) {
    (depth[pos] || []).forEach(function (name, i) {
      rows.push([pos, i + 1, name]);
    });
  });
  if (rows.length) {
    sh.getRange(2, 1, rows.length, HEADERS[TAB.DEPTH].length).setValues(rows);
  }
  return rows.length;
}

function appendGames(games) {
  if (!games.length) return 0;
  const sh = getOrCreateSheet(TAB.GAMES);
  const lastRow = sh.getLastRow();
  const existing = lastRow > 1
    ? sh.getRange(2, 1, lastRow - 1, 1).getValues().map(function (r) { return String(r[0]); })
    : [];
  const existingSet = {};
  existing.forEach(function (id) { existingSet[id] = true; });

  const rows = games
    .filter(function (g) { return g && g.id && !existingSet[String(g.id)]; })
    .map(function (g) {
      return [
        g.id, g.date || '', g.opponent || '', g.location || '',
        g.homeAway || '', g.type || '', g.notes || ''
      ];
    });
  if (rows.length) {
    sh.getRange(sh.getLastRow() + 1, 1, rows.length, HEADERS[TAB.GAMES].length).setValues(rows);
  }
  return rows.length;
}

function writePlays(plays) {
  var sh = getOrCreateSheet('Plays');
  var headers = HEADERS['Plays'];
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  clearBody(sh, headers.length);
  var rows = [];
  Object.keys(plays).forEach(function (gid) {
    var gamePlays = plays[gid] || {};
    Object.keys(gamePlays).forEach(function (name) {
      var dataUrl = gamePlays[name];
      if (dataUrl && dataUrl.length < 50000) {
        rows.push([gid, name, dataUrl]);
      }
    });
  });
  if (rows.length) {
    sh.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
  return rows.length;
}

// ---------- PULL (sheet → browser) ----------

function pullAll() {
  return {
    ok: true,
    lineups: readLineups(),
    stats: readStats(),
    depth: readDepth(),
    plays: readPlays()
  };
}

function readLineups() {
  const sh = SpreadsheetApp.getActive().getSheetByName(TAB.LINEUPS);
  if (!sh || sh.getLastRow() < 2) return {};
  // Detect schema: with or without Role column
  const headerRow = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const hasRole = headerRow.indexOf('Role') === 3;
  const colCount = hasRole ? 5 : 4;
  const data = sh.getRange(2, 1, sh.getLastRow() - 1, colCount).getValues();
  const out = {};
  data.forEach(function (row) {
    var gid, half, pos, role, player;
    if (hasRole) {
      gid = row[0]; half = row[1]; pos = row[2]; role = row[3]; player = row[4];
    } else {
      gid = row[0]; half = row[1]; pos = row[2]; role = 'Starter'; player = row[3];
    }
    if (!gid || !pos || !player) return;
    const gKey = String(gid);
    // Map 'Custom' half label back to 'custom' key
    var hKey = String(half);
    if (hKey.toLowerCase() === 'custom') hKey = 'custom';
    if (!out[gKey]) out[gKey] = { '1': {}, '2': {}, custom: {} };
    if (!out[gKey][hKey]) out[gKey][hKey] = {};

    // Handle formation metadata
    if (String(role).toLowerCase() === 'meta' && pos === '_formation') {
      out[gKey][hKey]._formation = String(player);
      return;
    }
    if (!out[gKey][hKey][pos]) out[gKey][hKey][pos] = { s: '', subs: [] };
    if (String(role).toLowerCase() === 'out') {
      if (!out[gKey].out) out[gKey].out = [];
      out[gKey].out.push(String(player));
    } else if (String(role).toLowerCase() === 'sub') {
      out[gKey][hKey][pos].subs.push(String(player));
    } else {
      out[gKey][hKey][pos].s = String(player);
    }
  });
  return out;
}

function readStats() {
  const sh = SpreadsheetApp.getActive().getSheetByName(TAB.STATS);
  if (!sh || sh.getLastRow() < 2) return {};
  const data = sh.getRange(2, 1, sh.getLastRow() - 1, 4).getValues();
  const out = {};
  data.forEach(function (row) {
    const gid = row[0], min = row[1], type = row[2], player = row[3];
    if (!gid || !type || !player) return;
    const gKey = String(gid);
    if (!out[gKey]) out[gKey] = [];
    out[gKey].push({
      minute: min === '' || min === null ? '' : String(min),
      type: String(type),
      player: String(player)
    });
  });
  return out;
}

function readDepth() {
  const sh = SpreadsheetApp.getActive().getSheetByName(TAB.DEPTH);
  if (!sh || sh.getLastRow() < 2) return {};
  const data = sh.getRange(2, 1, sh.getLastRow() - 1, 3).getValues();
  data.sort(function (a, b) { return (Number(a[1]) || 99) - (Number(b[1]) || 99); });
  const out = {};
  data.forEach(function (row) {
    const pos = row[0], player = row[2];
    if (!pos || !player) return;
    if (!out[pos]) out[pos] = [];
    out[pos].push(String(player));
  });
  return out;
}

function readPlays() {
  var sh = SpreadsheetApp.getActive().getSheetByName('Plays');
  if (!sh || sh.getLastRow() < 2) return {};
  var data = sh.getRange(2, 1, sh.getLastRow() - 1, 3).getValues();
  var out = {};
  data.forEach(function (row) {
    var gid = row[0], name = row[1], img = row[2];
    if (!gid || !name || !img) return;
    var gKey = String(gid);
    if (!out[gKey]) out[gKey] = {};
    out[gKey][String(name)] = String(img);
  });
  return out;
}

// ---------- HELPERS ----------

function getOrCreateSheet(name) {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    if (HEADERS[name]) {
      sh.getRange(1, 1, 1, HEADERS[name].length).setValues([HEADERS[name]]);
      sh.setFrozenRows(1);
    }
  } else if (HEADERS[name] && sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, HEADERS[name].length).setValues([HEADERS[name]]);
    sh.setFrozenRows(1);
  }
  return sh;
}

function clearBody(sh, numCols) {
  const lastRow = sh.getLastRow();
  if (lastRow > 1) {
    sh.getRange(2, 1, lastRow - 1, numCols).clearContent();
  }
}
