// Shared helpers for the schedule app.

const FIRST_HOUR = 7;       // 7:00 AM
const LAST_HOUR = 19;       // 7:00 PM (exclusive — last slot starts 6:30 PM)
const SLOTS_PER_DAY = (LAST_HOUR - FIRST_HOUR) * 2; // 30-min slots

const STATES = ['available', 'maybe', 'blocked'];
const NEXT_STATE = { available: 'maybe', maybe: 'blocked', blocked: 'available' };

// --- Supabase client ---------------------------------------------------------

function makeSupabase() {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.SCHEDULE_CONFIG;
  if (!window.supabase) throw new Error('Supabase SDK not loaded');
  return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// --- Date math ---------------------------------------------------------------

function sundayOf(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Sun ... 6=Sat
  d.setDate(d.getDate() - day);
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function ymd(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function weekDates(weekStart) {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

function sameYmd(a, b) {
  return ymd(a) === ymd(b);
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function dayName(date) { return DAY_NAMES[date.getDay()]; }
function dayShort(date) { return DAY_SHORT[date.getDay()]; }
function prettyDate(date) { return `${MONTHS[date.getMonth()]} ${date.getDate()}`; }

function weekLabel(weekStart) {
  const weekEnd = addDays(weekStart, 6);
  const sameMonth = weekStart.getMonth() === weekEnd.getMonth();
  if (sameMonth) {
    return `${MONTHS[weekStart.getMonth()]} ${weekStart.getDate()}–${weekEnd.getDate()}, ${weekEnd.getFullYear()}`;
  }
  return `${MONTHS[weekStart.getMonth()]} ${weekStart.getDate()} – ${MONTHS[weekEnd.getMonth()]} ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`;
}

// --- Slot/time math ----------------------------------------------------------

function slotStartMinutes(idx) {
  return FIRST_HOUR * 60 + idx * 30;
}

function formatMinutes(totalMin) {
  const h24 = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function formatSlotStart(idx) {
  return formatMinutes(slotStartMinutes(idx));
}

function formatSlotEnd(idx) {
  return formatMinutes(slotStartMinutes(idx) + 30);
}

// Collapse contiguous slots of the same state into ranges.
// stateByIndex is an object { 0: 'maybe', 1: 'maybe', ... }; missing keys = 'available'.
// Returns: [{ state, startIdx, endIdx }]  (endIdx is exclusive)
function collapseRanges(stateByIndex) {
  const ranges = [];
  let cur = null;
  for (let i = 0; i < SLOTS_PER_DAY; i++) {
    const s = stateByIndex[i] || 'available';
    if (cur && cur.state === s) {
      cur.endIdx = i + 1;
    } else {
      if (cur) ranges.push(cur);
      cur = { state: s, startIdx: i, endIdx: i + 1 };
    }
  }
  if (cur) ranges.push(cur);
  return ranges;
}

function formatRange(r) {
  const start = formatSlotStart(r.startIdx);
  // end is the start of the slot at endIdx, which equals end of slot endIdx-1
  const end = formatMinutes(slotStartMinutes(r.endIdx - 1) + 30);
  return `${start} – ${end}`;
}

// --- Data access -------------------------------------------------------------

// Fetch all stored slot overrides between two dates (inclusive).
// Storage convention: only non-'available' states are persisted.
// Returns: { 'YYYY-MM-DD': { slotIdx: state } }
async function fetchOverrides(supabase, startYmd, endYmd) {
  const { data, error } = await supabase
    .from('availability_slots')
    .select('slot_date, slot_index, state')
    .gte('slot_date', startYmd)
    .lte('slot_date', endYmd);
  if (error) throw error;
  const map = {};
  for (const row of data || []) {
    if (!map[row.slot_date]) map[row.slot_date] = {};
    map[row.slot_date][row.slot_index] = row.state;
  }
  return map;
}

async function upsertSlot(supabase, dateYmd, slotIdx, state) {
  if (state === 'available') {
    const { error } = await supabase
      .from('availability_slots')
      .delete()
      .eq('slot_date', dateYmd)
      .eq('slot_index', slotIdx);
    if (error) throw error;
    return;
  }
  const { error } = await supabase
    .from('availability_slots')
    .upsert(
      { slot_date: dateYmd, slot_index: slotIdx, state, updated_at: new Date().toISOString() },
      { onConflict: 'slot_date,slot_index' }
    );
  if (error) throw error;
}

window.Schedule = {
  FIRST_HOUR, LAST_HOUR, SLOTS_PER_DAY, STATES, NEXT_STATE,
  makeSupabase,
  sundayOf, addDays, ymd, weekDates, sameYmd,
  dayName, dayShort, prettyDate, weekLabel,
  formatSlotStart, formatSlotEnd, formatMinutes, slotStartMinutes,
  collapseRanges, formatRange,
  fetchOverrides, upsertSlot,
};
