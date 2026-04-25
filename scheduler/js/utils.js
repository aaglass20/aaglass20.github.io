// Date / time helpers shared by consumer and admin pages.

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function pad2(n) { return String(n).padStart(2, '0'); }

function ymd(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function parseYMD(s) {
  const [y, m, d] = s.split('-').map(x => parseInt(x, 10));
  return new Date(y, m - 1, d);
}

function todayYMD() { return ymd(new Date()); }

// Monday of the week containing date d.
function startOfWeek(d) {
  const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dow = copy.getDay(); // 0=Sun ... 6=Sat
  const delta = (dow === 0) ? -6 : 1 - dow;
  copy.setDate(copy.getDate() + delta);
  return copy;
}

function addDays(d, n) {
  const c = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  c.setDate(c.getDate() + n);
  return c;
}

function weekDates(weekStartYMD) {
  const start = parseYMD(weekStartYMD);
  const out = [];
  for (let i = 0; i < 7; i++) out.push(ymd(addDays(start, i)));
  return out;
}

function formatRange(weekStartYMD) {
  const start = parseYMD(weekStartYMD);
  const end = addDays(start, 6);
  const sameMonth = start.getMonth() === end.getMonth();
  const sameYear = start.getFullYear() === end.getFullYear();
  if (sameMonth) {
    return `${MONTHS[start.getMonth()]} ${start.getDate()}–${end.getDate()}, ${start.getFullYear()}`;
  }
  if (sameYear) {
    return `${MONTHS[start.getMonth()]} ${start.getDate()} – ${MONTHS[end.getMonth()]} ${end.getDate()}, ${start.getFullYear()}`;
  }
  return `${MONTHS[start.getMonth()]} ${start.getDate()}, ${start.getFullYear()} – ${MONTHS[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
}

function formatDayHeader(ymdStr) {
  const d = parseYMD(ymdStr);
  const dow = DAYS[(d.getDay() + 6) % 7]; // adjust so Mon is 0
  return { dow, dnum: d.getDate(), month: MONTHS[d.getMonth()] };
}

function formatFullDate(ymdStr) {
  const d = parseYMD(ymdStr);
  const dow = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()];
  return `${dow}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

// Return array of "HH:MM" for every 30-min slot between start_hour and end_hour.
function slotTimes(startHour, endHour) {
  const out = [];
  for (let h = startHour; h < endHour; h++) {
    out.push(`${pad2(h)}:00`);
    out.push(`${pad2(h)}:30`);
  }
  return out;
}

function formatTimeLabel(hhmm) {
  const [h, m] = hhmm.split(':').map(x => parseInt(x, 10));
  const ampm = h >= 12 ? 'pm' : 'am';
  const h12 = h === 0 ? 12 : (h > 12 ? h - 12 : h);
  return m === 0 ? `${h12} ${ampm}` : `${h12}:${pad2(m)} ${ampm}`;
}

function isPast(dateYMD) {
  return dateYMD < todayYMD();
}

function isToday(dateYMD) {
  return dateYMD === todayYMD();
}

// Is this date blocked by advance_days rule?
// advance=0 means same-day booking OK.
// advance=1 means earliest bookable day is tomorrow.
function isBlockedByAdvance(dateYMD, advanceDays) {
  const today = parseYMD(todayYMD());
  const target = parseYMD(dateYMD);
  const diffDays = Math.round((target - today) / 86400000);
  return diffDays < advanceDays;
}

// Monday YMD of the currently bookable week. The "bookable" week is the one
// that opened on the most recent Sunday (including today if today is Sunday),
// i.e. Monday = (last Sunday + 1 day). Future weeks stay locked until their
// Sunday arrives.
function bookableWeekStart(todayStr) {
  const d = parseYMD(todayStr || todayYMD());
  const lastSun = addDays(d, -d.getDay()); // if today is Sunday, lastSun=today
  return ymd(addDays(lastSun, 1));
}

// Is the Mon-Sun week starting on weekMondayYMD already open for booking?
function isWeekBookable(weekMondayYMD, todayStr) {
  return weekMondayYMD <= bookableWeekStart(todayStr);
}

// The Sunday (YMD) on which a given week opens for booking — always the day
// before that week's Monday.
function weekOpensOn(weekMondayYMD) {
  return ymd(addDays(parseYMD(weekMondayYMD), -1));
}

// Given a sorted array of "HH:MM" admin-opened times for one day, plus a Set
// of booked "HH:MM" times, return the Set of times that are currently
// bookable under the no-gaps rule:
//
//  - Group times into contiguous blocks (consecutive 30-min slots).
//  - In a block with no bookings yet, all slots are bookable (first user
//    can pick anywhere).
//  - In a block with one or more bookings, only slots immediately adjacent
//    (±30 min) to at least one booked slot are bookable.
function noGapsBookableTimes(openTimesSorted, bookedSet) {
  const bookable = new Set();
  const blocks = [];
  let current = [];
  for (let i = 0; i < openTimesSorted.length; i++) {
    const t = openTimesSorted[i];
    if (current.length === 0) {
      current.push(t);
    } else if (toMinutes_(t) - toMinutes_(current[current.length - 1]) === 30) {
      current.push(t);
    } else {
      blocks.push(current);
      current = [t];
    }
  }
  if (current.length) blocks.push(current);

  blocks.forEach(block => {
    const hasBooking = block.some(t => bookedSet.has(t));
    if (!hasBooking) {
      block.forEach(t => bookable.add(t));
      return;
    }
    for (let i = 0; i < block.length; i++) {
      const t = block[i];
      if (bookedSet.has(t)) continue;
      const prev = i > 0 ? block[i - 1] : null;
      const next = i < block.length - 1 ? block[i + 1] : null;
      if ((prev && bookedSet.has(prev)) || (next && bookedSet.has(next))) {
        bookable.add(t);
      }
    }
  });
  return bookable;
}

function toMinutes_(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

// Format a raw string as a US phone number while the user types.
// Accepts any input, keeps up to 10 digits, returns "(XXX) XXX-XXXX" chunks.
function formatPhone(value) {
  const d = String(value || '').replace(/\D/g, '').slice(0, 10);
  if (d.length === 0) return '';
  if (d.length <= 3) return '(' + d;
  if (d.length <= 6) return '(' + d.slice(0, 3) + ') ' + d.slice(3);
  return '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6);
}

const DAY_KEYS = ['sun','mon','tue','wed','thu','fri','sat'];

// Look up { startHour, endHour } for a single date based on cfg.day_hours,
// falling back to legacy cfg.start_hour / cfg.end_hour when per-day is missing.
function getDayHoursFromCfg(cfg, dateYMD) {
  const dow = parseYMD(dateYMD).getDay(); // 0=Sun..6=Sat
  const dayKey = DAY_KEYS[dow];
  const dh = cfg && cfg.day_hours && cfg.day_hours[dayKey];
  if (dh && Number.isFinite(dh.start) && Number.isFinite(dh.end)) {
    return { startHour: dh.start, endHour: dh.end };
  }
  return {
    startHour: parseInt(cfg.start_hour, 10) || 8,
    endHour: parseInt(cfg.end_hour, 10) || 21
  };
}

// Group an ordered list of dates into runs that share the same day-hours.
// Each group: { startHour, endHour, dates: [...] }.
function groupDaysByHours(dates, cfg) {
  const groups = [];
  let cur = null;
  dates.forEach(d => {
    const h = getDayHoursFromCfg(cfg, d);
    if (cur && cur.startHour === h.startHour && cur.endHour === h.endHour) {
      cur.dates.push(d);
    } else {
      cur = { startHour: h.startHour, endHour: h.endHour, dates: [d] };
      groups.push(cur);
    }
  });
  return groups;
}

const MOBILE_QUERY = '(max-width: 640px)';

function isMobile() {
  return window.matchMedia(MOBILE_QUERY).matches;
}

function onBreakpointChange(cb) {
  const mq = window.matchMedia(MOBILE_QUERY);
  const handler = () => cb();
  if (mq.addEventListener) mq.addEventListener('change', handler);
  else mq.addListener(handler);
}

// Pick a sensible default day index for a given week: today if in week, else 0.
function defaultDayIndex(weekStartYMD) {
  const today = todayYMD();
  const dates = weekDates(weekStartYMD);
  const idx = dates.indexOf(today);
  return idx === -1 ? 0 : idx;
}

// Render a horizontal day-picker into `container`. `onSelect(idx)` is called
// when a pill is tapped. Pass the currently selected index to highlight it.
function renderDayPicker(container, dates, selectedIdx, onSelect) {
  const todayStr = todayYMD();
  container.innerHTML = dates.map((d, i) => {
    const h = formatDayHeader(d);
    const classes = ['day-pill'];
    if (d === todayStr) classes.push('today');
    if (i === selectedIdx) classes.push('selected');
    return `<button class="${classes.join(' ')}" data-idx="${i}" type="button">
      <div class="dow">${h.dow}</div>
      <div class="dnum">${h.dnum}</div>
    </button>`;
  }).join('');
  container.querySelectorAll('.day-pill').forEach(el => {
    el.addEventListener('click', () => onSelect(parseInt(el.dataset.idx, 10)));
  });
}
