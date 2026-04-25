/**
 * Scheduler backend (Google Apps Script).
 *
 * Sheets expected in the bound spreadsheet:
 *
 *   Config        : Key | Value
 *                   admin_pin         default 1234
 *                   advance_days      default 1      (0 = same-day OK, 1 = tomorrow+, 2 = day-after+, ...)
 *                   site_published    default false  (consumers see empty week when false)
 *                   start_hour        default 8      (inclusive, 0-23)
 *                   end_hour          default 21     (exclusive, 0-24)
 *
 *   Availability  : Date (YYYY-MM-DD) | Time (HH:MM)
 *                   One row per slot the admin has opened. Missing row = locked.
 *
 *   Bookings      : Date (YYYY-MM-DD) | Time (HH:MM) | Name | Phone | Team | Timestamp
 *                   One row per confirmed booking.
 *
 * Deploy as a web app (Execute as: Me, Access: Anyone).
 */

const CONFIG_SHEET = 'Config';
const AVAIL_SHEET = 'Availability';
const BOOKINGS_SHEET = 'Bookings';

const DEFAULTS = {
  admin_pin: '1234',
  advance_days: '1',
  site_published: 'false',
  no_gaps: 'false',
  view_only: 'false',
  start_hour: '8',
  end_hour: '21',
  mon_start: '8', mon_end: '21',
  tue_start: '8', tue_end: '21',
  wed_start: '8', wed_end: '21',
  thu_start: '8', thu_end: '21',
  fri_start: '8', fri_end: '21',
  sat_start: '9', sat_end: '21',
  sun_start: '9', sun_end: '21'
};

/**
 * One-time setup: creates all three tabs with correct headers, freezes the
 * header row, seeds Config defaults, and widens columns so the sheet is
 * readable. Safe to run more than once — existing data is preserved.
 *
 * How to run:
 *   1. In the Apps Script editor, pick `setup` from the function dropdown.
 *   2. Click Run. Authorize when prompted.
 *   3. Check the spreadsheet — Config / Availability / Bookings tabs appear.
 */
function setup() {
  const ss = SpreadsheetApp.getActive();

  ensureSheet_(ss, CONFIG_SHEET, ['Key', 'Value'], [120, 200]);
  ensureSheet_(ss, AVAIL_SHEET, ['Date', 'Time'], [120, 80]);
  ensureSheet_(ss, BOOKINGS_SHEET,
    ['Date', 'Time', 'Name', 'Phone', 'Team', 'Timestamp'],
    [110, 70, 180, 140, 160, 170]);

  // Seed Config defaults only for missing keys.
  const cfg = ss.getSheetByName(CONFIG_SHEET);
  const existingKeys = {};
  const values = cfg.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][0]) existingKeys[String(values[i][0]).trim()] = true;
  }
  const toAdd = [];
  Object.keys(DEFAULTS).forEach(k => {
    if (!existingKeys[k]) toAdd.push([k, DEFAULTS[k]]);
  });
  if (toAdd.length) {
    cfg.getRange(cfg.getLastRow() + 1, 1, toAdd.length, 2).setValues(toAdd);
  }

  // Delete the default "Sheet1" if it's empty and not one of ours.
  const extras = ss.getSheets().filter(s =>
    [CONFIG_SHEET, AVAIL_SHEET, BOOKINGS_SHEET].indexOf(s.getName()) === -1
  );
  extras.forEach(s => {
    const r = s.getDataRange();
    if (r.getNumRows() <= 1 && r.getNumColumns() <= 1 && !r.getValue()) {
      if (ss.getSheets().length > 1) ss.deleteSheet(s);
    }
  });

  SpreadsheetApp.getUi &&
    SpreadsheetApp.getUi().alert('Scheduler setup complete. Tabs ready: Config, Availability, Bookings.');
}

function ensureSheet_(ss, name, headers, widths) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);

  const existingHeaders = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const needsHeaders = headers.some((h, i) => existingHeaders[i] !== h);
  if (needsHeaders) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers])
      .setFontWeight('bold')
      .setBackground('#f1f5f9');
  }
  sheet.setFrozenRows(1);
  if (widths) widths.forEach((w, i) => sheet.setColumnWidth(i + 1, w));

  // Format Date and Time columns as plain text so YYYY-MM-DD / HH:MM round-trip cleanly.
  headers.forEach((h, i) => {
    if (h === 'Date' || h === 'Time') {
      sheet.getRange(2, i + 1, Math.max(sheet.getMaxRows() - 1, 1), 1)
        .setNumberFormat('@');
    }
    if (h === 'Timestamp') {
      sheet.getRange(2, i + 1, Math.max(sheet.getMaxRows() - 1, 1), 1)
        .setNumberFormat('yyyy-mm-dd hh:mm:ss');
    }
  });

  return sheet;
}

/**
 * Convenience menu — adds a “Scheduler” menu to the spreadsheet with a
 * one-click Setup item so you don’t need to open the script editor again.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Scheduler')
    .addItem('Run setup / repair tabs', 'setup')
    .addToUi();
}

function doGet(e) {
  return handle(e.parameter.action, e.parameter);
}

function doPost(e) {
  let body = {};
  try {
    body = JSON.parse(e.postData.contents || '{}');
  } catch (err) {
    body = {};
  }
  return handle(body.action, body);
}

function handle(action, p) {
  let result;
  try {
    switch (action) {
      case 'getConfig':         result = getPublicConfig(); break;
      case 'getWeek':           result = getWeek(p.weekStart); break;
      case 'book':              result = book(p.date, p.time, p.name, p.phone, p.team); break;
      case 'verifyPin':         result = { ok: verifyPin(p.pin) }; break;
      case 'adminGetConfig':    result = requirePin(p.pin, getAllConfig); break;
      case 'adminSetConfig':    result = requirePin(p.pin, () => setConfig(p.key, p.value)); break;
      case 'adminSetSlot':      result = requirePin(p.pin, () => setSlot(p.date, p.time, p.available)); break;
      case 'adminSetWeek':      result = requirePin(p.pin, () => setWeek(p.weekStart, p.slots)); break;
      case 'adminGetBookings':  result = requirePin(p.pin, () => getWeekBookings(p.weekStart)); break;
      case 'adminDeleteBooking':result = requirePin(p.pin, () => deleteBooking(p.date, p.time)); break;
      case 'adminBook':         result = requirePin(p.pin, () => adminBook(p.date, p.time, p.name, p.phone, p.team)); break;
      default: result = { error: 'Unknown action: ' + action };
    }
  } catch (err) {
    result = { error: err.message || String(err) };
  }
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function requirePin(pin, fn) {
  if (!verifyPin(pin)) return { error: 'Invalid PIN' };
  return fn();
}

/* ----------------------- Config ----------------------- */

function getConfigSheet_() {
  const ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(CONFIG_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG_SHEET);
    sheet.getRange(1, 1, 1, 2).setValues([['Key', 'Value']]);
    const rows = Object.keys(DEFAULTS).map(k => [k, DEFAULTS[k]]);
    sheet.getRange(2, 1, rows.length, 2).setValues(rows);
  }
  return sheet;
}

function getAllConfig() {
  const sheet = getConfigSheet_();
  const values = sheet.getDataRange().getValues();
  const map = Object.assign({}, DEFAULTS);
  for (let i = 1; i < values.length; i++) {
    const [k, v] = values[i];
    if (k) map[String(k).trim()] = String(v);
  }
  return map;
}

function getPublicConfig() {
  const all = getAllConfig();
  const startFallback = parseIntOr_(all.start_hour, 8);
  const endFallback = parseIntOr_(all.end_hour, 21);
  const days = ['sun','mon','tue','wed','thu','fri','sat'];
  const day_hours = {};
  days.forEach(d => {
    day_hours[d] = {
      start: parseIntOr_(all[d + '_start'], startFallback),
      end: parseIntOr_(all[d + '_end'], endFallback)
    };
  });
  return {
    advance_days: parseInt(all.advance_days, 10) || 0,
    site_published: String(all.site_published).toLowerCase() === 'true',
    no_gaps: String(all.no_gaps || 'false').toLowerCase() === 'true',
    view_only: String(all.view_only || 'false').toLowerCase() === 'true',
    start_hour: startFallback,
    end_hour: endFallback,
    day_hours: day_hours
  };
}

function setConfig(key, value) {
  if (!key) return { error: 'Missing key' };
  const sheet = getConfigSheet_();
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]).trim() === key) {
      sheet.getRange(i + 1, 2).setValue(value);
      return { ok: true };
    }
  }
  sheet.appendRow([key, value]);
  return { ok: true };
}

function verifyPin(pin) {
  const all = getAllConfig();
  return pin && String(pin) === String(all.admin_pin);
}

/* ----------------------- Availability ----------------------- */

function getAvailSheet_() {
  const ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(AVAIL_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(AVAIL_SHEET);
    sheet.getRange(1, 1, 1, 2).setValues([['Date', 'Time']]);
  }
  return sheet;
}

function setSlot(date, time, available) {
  if (!date || !time) return { error: 'Missing date/time' };
  const sheet = getAvailSheet_();
  const values = sheet.getDataRange().getValues();
  let existingRow = -1;
  for (let i = 1; i < values.length; i++) {
    if (fmtDate_(values[i][0]) === date && fmtTime_(values[i][1]) === time) {
      existingRow = i + 1;
      break;
    }
  }
  if (available && existingRow === -1) {
    sheet.appendRow([date, time]);
  } else if (!available && existingRow !== -1) {
    sheet.deleteRow(existingRow);
  }
  return { ok: true };
}

function setWeek(weekStart, slots) {
  // slots: [{ date, time, available }]
  if (!Array.isArray(slots)) return { error: 'slots must be an array' };
  const sheet = getAvailSheet_();
  const values = sheet.getDataRange().getValues();
  const existing = {};
  for (let i = 1; i < values.length; i++) {
    const key = fmtDate_(values[i][0]) + '|' + fmtTime_(values[i][1]);
    existing[key] = i + 1;
  }
  const toAdd = [];
  const toDelete = [];
  slots.forEach(s => {
    const key = s.date + '|' + s.time;
    if (s.available && !existing[key]) toAdd.push([s.date, s.time]);
    if (!s.available && existing[key]) toDelete.push(existing[key]);
  });
  toDelete.sort((a, b) => b - a).forEach(r => sheet.deleteRow(r));
  if (toAdd.length) {
    sheet.getRange(sheet.getLastRow() + 1, 1, toAdd.length, 2).setValues(toAdd);
  }
  return { ok: true };
}

/* ----------------------- Bookings ----------------------- */

function getBookingsSheet_() {
  const ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(BOOKINGS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(BOOKINGS_SHEET);
    sheet.getRange(1, 1, 1, 6).setValues([['Date', 'Time', 'Name', 'Phone', 'Team', 'Timestamp']]);
  }
  return sheet;
}

function getWeek(weekStart) {
  // weekStart = Monday YYYY-MM-DD
  if (!weekStart) return { error: 'Missing weekStart' };
  const cfg = getPublicConfig();
  const dates = weekDates_(weekStart);
  const dateSet = {};
  dates.forEach(d => dateSet[d] = true);

  const availSheet = getAvailSheet_();
  const availRows = availSheet.getDataRange().getValues();
  const available = {};
  for (let i = 1; i < availRows.length; i++) {
    const d = fmtDate_(availRows[i][0]);
    const t = fmtTime_(availRows[i][1]);
    if (dateSet[d]) available[d + '|' + t] = true;
  }

  const bookSheet = getBookingsSheet_();
  const bookRows = bookSheet.getDataRange().getValues();
  const bookings = {};
  for (let i = 1; i < bookRows.length; i++) {
    const d = fmtDate_(bookRows[i][0]);
    const t = fmtTime_(bookRows[i][1]);
    if (dateSet[d]) bookings[d + '|' + t] = { name: String(bookRows[i][2] || '') };
  }

  return {
    weekStart: weekStart,
    dates: dates,
    config: cfg,
    available: Object.keys(available),
    bookings: bookings
  };
}

function book(date, time, name, phone, team) {
  if (!date || !time) return { error: 'Missing date/time' };
  if (!name || !String(name).trim()) return { error: 'Name is required' };

  const cfg = getPublicConfig();
  if (!cfg.site_published) return { error: 'Booking is not open yet' };
  if (cfg.view_only) return { error: 'Booking is currently view-only' };

  const tz = SpreadsheetApp.getActive().getSpreadsheetTimeZone();
  const today = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');

  const weekMon = mondayOf_(date);
  const bookableMon = bookableMondayFor_(today);
  if (weekMon > bookableMon) {
    const opens = ymd_(new Date(parseYMD_(weekMon).getFullYear(), parseYMD_(weekMon).getMonth(), parseYMD_(weekMon).getDate() - 1));
    return { error: 'This week is not yet open for booking — opens Sunday ' + opens };
  }

  const daysOut = dateDiffDays_(today, date);
  if (daysOut < cfg.advance_days) {
    return { error: 'This slot is not yet open for booking' };
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const availSheet = getAvailSheet_();
    const availRows = availSheet.getDataRange().getValues();
    let isAvailable = false;
    for (let i = 1; i < availRows.length; i++) {
      if (fmtDate_(availRows[i][0]) === date && fmtTime_(availRows[i][1]) === time) {
        isAvailable = true;
        break;
      }
    }
    if (!isAvailable) return { error: 'Slot is not available' };

    const bookSheet = getBookingsSheet_();
    const bookRows = bookSheet.getDataRange().getValues();
    const bookedTimesOnDay = {};
    for (let i = 1; i < bookRows.length; i++) {
      if (fmtDate_(bookRows[i][0]) === date) {
        const tt = fmtTime_(bookRows[i][1]);
        if (tt === time) return { error: 'Slot already booked' };
        bookedTimesOnDay[tt] = true;
      }
    }

    if (cfg.no_gaps) {
      const opensOnDay = [];
      for (let i = 1; i < availRows.length; i++) {
        if (fmtDate_(availRows[i][0]) === date) opensOnDay.push(fmtTime_(availRows[i][1]));
      }
      if (!isNoGapsBookable_(time, opensOnDay, bookedTimesOnDay)) {
        return { error: 'This slot is not currently bookable. An adjacent slot must be booked first.' };
      }
    }

    bookSheet.appendRow([date, time, String(name).trim(), String(phone).trim(), String(team || '').trim(), new Date()]);
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

// Admin booking — bypasses consumer-facing rules (site_published, view_only,
// week-bookable, advance_days, no_gaps). Still requires the slot to be open
// and not double-booked.
function adminBook(date, time, name, phone, team) {
  if (!date || !time) return { error: 'Missing date/time' };
  if (!name || !String(name).trim()) return { error: 'Name is required' };

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const availSheet = getAvailSheet_();
    const availRows = availSheet.getDataRange().getValues();
    let isAvailable = false;
    for (let i = 1; i < availRows.length; i++) {
      if (fmtDate_(availRows[i][0]) === date && fmtTime_(availRows[i][1]) === time) {
        isAvailable = true;
        break;
      }
    }
    if (!isAvailable) return { error: 'Slot is not available' };

    const bookSheet = getBookingsSheet_();
    const bookRows = bookSheet.getDataRange().getValues();
    for (let i = 1; i < bookRows.length; i++) {
      if (fmtDate_(bookRows[i][0]) === date && fmtTime_(bookRows[i][1]) === time) {
        return { error: 'Slot already booked' };
      }
    }

    bookSheet.appendRow([date, time, String(name).trim(), String(phone || '').trim(), String(team || '').trim(), new Date()]);
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

function getWeekBookings(weekStart) {
  const dates = weekDates_(weekStart);
  const dateSet = {};
  dates.forEach(d => dateSet[d] = true);
  const sheet = getBookingsSheet_();
  const rows = sheet.getDataRange().getValues();
  const out = [];
  for (let i = 1; i < rows.length; i++) {
    const d = fmtDate_(rows[i][0]);
    if (!dateSet[d]) continue;
    out.push({
      date: d,
      time: fmtTime_(rows[i][1]),
      name: String(rows[i][2] || ''),
      phone: String(rows[i][3] || ''),
      team: String(rows[i][4] || ''),
      timestamp: rows[i][5] instanceof Date ? rows[i][5].toISOString() : String(rows[i][5] || '')
    });
  }
  out.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  return { bookings: out };
}

function deleteBooking(date, time) {
  const sheet = getBookingsSheet_();
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (fmtDate_(rows[i][0]) === date && fmtTime_(rows[i][1]) === time) {
      sheet.deleteRow(i + 1);
      return { ok: true };
    }
  }
  return { error: 'Booking not found' };
}

/* ----------------------- Helpers ----------------------- */

function fmtDate_(v) {
  if (v instanceof Date) {
    const tz = SpreadsheetApp.getActive().getSpreadsheetTimeZone();
    return Utilities.formatDate(v, tz, 'yyyy-MM-dd');
  }
  return String(v).trim();
}

function fmtTime_(v) {
  if (v instanceof Date) {
    const tz = SpreadsheetApp.getActive().getSpreadsheetTimeZone();
    return Utilities.formatDate(v, tz, 'HH:mm');
  }
  // Normalize "9:00" -> "09:00"
  const s = String(v).trim();
  const m = s.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return s;
  const h = m[1].padStart(2, '0');
  return h + ':' + m[2];
}

function weekDates_(weekStart) {
  const d = parseYMD_(weekStart);
  const out = [];
  for (let i = 0; i < 7; i++) {
    const dt = new Date(d.getTime() + i * 86400000);
    out.push(ymd_(dt));
  }
  return out;
}

function parseYMD_(s) {
  const [y, m, d] = String(s).split('-').map(x => parseInt(x, 10));
  return new Date(y, m - 1, d);
}

function ymd_(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function dateDiffDays_(fromYMD, toYMD) {
  const a = parseYMD_(fromYMD).getTime();
  const b = parseYMD_(toYMD).getTime();
  return Math.round((b - a) / 86400000);
}

function mondayOf_(dateYMD) {
  const d = parseYMD_(dateYMD);
  const dow = d.getDay(); // 0=Sun..6=Sat
  const delta = (dow === 0) ? -6 : (1 - dow);
  return ymd_(new Date(d.getFullYear(), d.getMonth(), d.getDate() + delta));
}

function bookableMondayFor_(todayYMD) {
  const d = parseYMD_(todayYMD);
  // Most recent Sunday (including today if Sunday) + 1 day
  return ymd_(new Date(d.getFullYear(), d.getMonth(), d.getDate() - d.getDay() + 1));
}

// Returns true if `time` is currently bookable under the no-gaps rule, given
// the list of admin-opened times on the same day and the map of already-booked
// times on the same day.
function isNoGapsBookable_(time, opensOnDay, bookedMap) {
  const opens = opensOnDay.slice().sort();
  const idx = opens.indexOf(time);
  if (idx === -1) return false;

  // Walk left/right from this slot to find the contiguous block boundaries.
  let lo = idx, hi = idx;
  while (lo > 0 && toMin_(opens[lo]) - toMin_(opens[lo - 1]) === 30) lo--;
  while (hi < opens.length - 1 && toMin_(opens[hi + 1]) - toMin_(opens[hi]) === 30) hi++;

  let blockHasBooking = false;
  for (let i = lo; i <= hi; i++) {
    if (bookedMap[opens[i]]) { blockHasBooking = true; break; }
  }
  if (!blockHasBooking) return true;

  const prev = idx > lo ? opens[idx - 1] : null;
  const next = idx < hi ? opens[idx + 1] : null;
  return (prev && bookedMap[prev]) || (next && bookedMap[next]);
}

function parseIntOr_(v, fallback) {
  const n = parseInt(v, 10);
  return isNaN(n) ? fallback : n;
}

function toMin_(hhmm) {
  const parts = String(hhmm).split(':');
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}
