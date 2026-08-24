/* ────────────────────────────────────────────────
   USDA MyPlate daily goals (~2,000 cal / active 12-yr-old)
──────────────────────────────────────────────── */
const DAILY_GOALS = { grains: 6, veggies: 2.5, fruit: 2, dairy: 3, protein: 5.5 };

const FG_DEFS = [
  { key: 'grains',  label: '🌾 Grains',      unit: 'oz',   color: '#d97706' },
  { key: 'veggies', label: '🥦 Vegetables',   unit: 'cups', color: '#16a34a' },
  { key: 'fruit',   label: '🍎 Fruits',       unit: 'cups', color: '#dc2626' },
  { key: 'dairy',   label: '🥛 Dairy',        unit: 'cups', color: '#2563eb' },
  { key: 'protein', label: '🍗 Protein',      unit: 'oz',   color: '#7c3aed' },
];

/* ────────────────────────────────────────────────
   State
──────────────────────────────────────────────── */
let state = {
  currentDate:    todayKey(),
  weekStart:      sundayOf(new Date()),  // Date — Sunday of the displayed week
  wakeTime:       '07:00',
  bedTime:        '21:30',
  trackHydration: true,
  schedule:       {},
  activeTab:      'meals',
  favorites:      { meal: [], snack: [], workout: [] },
  userId:         null,
  selectedItem:   null,
};

let sbClient = null;
let paletteQuery = '';
let syncDebounceTimer = null;
const slotSortables = new Map();

/* ────────────────────────────────────────────────
   Supabase
──────────────────────────────────────────────── */
function initSupabase() {
  try {
    const cfg = window.FUELUP_CONFIG;
    if (!cfg || typeof supabase === 'undefined') return;
    sbClient = supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
    setSyncStatus('idle');
  } catch {}
}

function getSyncStatus() { return document.getElementById('syncIndicator'); }
function setSyncStatus(s) {
  const el  = document.getElementById('syncIndicator');
  const lbl = document.getElementById('syncLabel');
  if (!el) return;
  el.className = `sync-indicator ${s}`;
  el.title = { idle: 'Cloud sync ready', syncing: 'Saving to cloud…', ok: 'Saved to cloud ✓', error: 'Cloud unavailable — saved locally' }[s] || '';
  if (!lbl) return;
  if (s === 'ok') {
    lbl.textContent = 'Saved ✓';
    lbl.classList.add('visible');
    clearTimeout(lbl._hide);
    lbl._hide = setTimeout(() => lbl.classList.remove('visible'), 3000);
  } else if (s === 'syncing') {
    lbl.textContent = 'Saving…';
    lbl.classList.add('visible');
  } else {
    lbl.classList.remove('visible');
  }
}

async function syncDayToSupabase() {
  if (!sbClient || !state.userId) return;
  setSyncStatus('syncing');
  try {
    await sbClient.from('fuelup_plans').upsert(
      { user_id: state.userId, plan_date: state.currentDate, schedule: state.schedule, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,plan_date' }
    );
    setSyncStatus('ok');
  } catch {
    setSyncStatus('error');
    showToast('⚠️ Cloud save failed — data saved locally');
  }
}

function scheduleSyncDay() {
  clearTimeout(syncDebounceTimer);
  syncDebounceTimer = setTimeout(syncDayToSupabase, 1500);
}

async function syncSettingsToSupabase() {
  if (!sbClient || !state.userId) return;
  try {
    await sbClient.from('fuelup_user_settings').upsert(
      { user_id: state.userId, wake_time: state.wakeTime, bed_time: state.bedTime, favorites: state.favorites, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
  } catch {}
}

async function loadFromSupabase() {
  if (!sbClient || !state.userId) return;
  setSyncStatus('syncing');
  try {
    const [{ data: settings }, { data: plan }] = await Promise.all([
      sbClient.from('fuelup_user_settings').select('*').eq('user_id', state.userId).maybeSingle(),
      sbClient.from('fuelup_plans').select('schedule').eq('user_id', state.userId).eq('plan_date', state.currentDate).maybeSingle(),
    ]);

    if (settings) {
      state.wakeTime  = settings.wake_time  || state.wakeTime;
      state.bedTime   = settings.bed_time   || state.bedTime;
      state.favorites = settings.favorites  || state.favorites;
      document.getElementById('wakeTime').value = state.wakeTime;
      document.getElementById('bedTime').value  = state.bedTime;
      saveSettings(); saveFavorites();
    }
    if (plan?.schedule) {
      state.schedule = plan.schedule;
      saveDay();
    }

    // Pre-cache rest of week
    const weekKeys = getWeekDates().map(dateStr).filter(k => k !== state.currentDate);
    const { data: weekPlans } = await sbClient.from('fuelup_plans')
      .select('plan_date,schedule').eq('user_id', state.userId).in('plan_date', weekKeys);
    (weekPlans || []).forEach(p => localStorage.setItem(`fuelup_day_${p.plan_date}`, JSON.stringify(p.schedule || {})));

    setSyncStatus('ok');
  } catch { setSyncStatus('error'); }
}

/* ────────────────────────────────────────────────
   Date helpers
──────────────────────────────────────────────── */
function todayKey() { return new Date().toISOString().split('T')[0]; }

function sundayOf(d) {
  const s = new Date(d);
  s.setHours(0, 0, 0, 0);
  s.setDate(s.getDate() - s.getDay());
  return s;
}

function getWeekDates() {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(state.weekStart);
    date.setDate(state.weekStart.getDate() + i);
    return date;
  });
}

function shiftWeek(delta) {
  state.weekStart = new Date(state.weekStart);
  state.weekStart.setDate(state.weekStart.getDate() + delta * 7);
  renderWeekNav();
}

function weekRangeLabel() {
  const days = getWeekDates();
  const first = days[0], last = days[6];
  const mo = (d) => d.toLocaleDateString('en-US', { month: 'short' });
  return first.getMonth() === last.getMonth()
    ? `${mo(first)} ${first.getDate()}–${last.getDate()}`
    : `${mo(first)} ${first.getDate()} – ${mo(last)} ${last.getDate()}`;
}

function dateStr(d) { return d.toISOString().split('T')[0]; }

/* ────────────────────────────────────────────────
   Time helpers
──────────────────────────────────────────────── */
function toMin(t) { const [h, m] = t.split(':').map(Number); return h * 60 + m; }
function fromMin(min) { const h = Math.floor(min/60), m = min%60; return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`; }
function fmt(t) { const [h, m] = t.split(':').map(Number); return `${h%12||12}:${String(m).padStart(2,'0')} ${h>=12?'PM':'AM'}`; }

function slots() {
  const out = []; let cur = toMin(state.wakeTime); const end = toMin(state.bedTime);
  if (cur >= end) return out;
  while (cur <= end) { out.push(fromMin(cur)); cur += 30; }
  return out;
}

/* ────────────────────────────────────────────────
   Storage
──────────────────────────────────────────────── */
function saveSettings() { localStorage.setItem('fuelup_settings', JSON.stringify({ wakeTime: state.wakeTime, bedTime: state.bedTime, trackHydration: state.trackHydration })); }
function saveDay()      { localStorage.setItem(`fuelup_day_${state.currentDate}`, JSON.stringify(state.schedule)); }
function saveFavorites(){ localStorage.setItem('fuelup_favorites', JSON.stringify(state.favorites)); }

function save() {
  saveSettings(); saveDay();
  scheduleSyncDay(); // debounced cloud sync
}

function loadSettings() {
  try {
    const s = JSON.parse(localStorage.getItem('fuelup_settings') || '{}');
    if (s.wakeTime) state.wakeTime = s.wakeTime;
    if (s.bedTime)  state.bedTime  = s.bedTime;
    if (s.trackHydration !== undefined) state.trackHydration = s.trackHydration;
    document.getElementById('wakeTime').value = state.wakeTime;
    document.getElementById('bedTime').value  = state.bedTime;
    document.getElementById('trackHydration').checked = state.trackHydration;
  } catch {}
}

function loadDay(key) {
  state.currentDate = key;
  try { state.schedule = JSON.parse(localStorage.getItem(`fuelup_day_${key}`) || '{}'); }
  catch { state.schedule = {}; }
}

function loadFavorites() {
  try {
    const f = JSON.parse(localStorage.getItem('fuelup_favorites') || '{}');
    state.favorites.meal    = f.meal    || [];
    state.favorites.snack   = f.snack   || [];
    state.favorites.workout = f.workout || [];
  } catch {}
}

function isFav(type, id) { return (state.favorites[type] || []).includes(id); }

function toggleFavorite(type, id) {
  const arr = state.favorites[type] || [];
  const idx = arr.indexOf(id);
  if (idx === -1) arr.push(id); else arr.splice(idx, 1);
  state.favorites[type] = arr;
  saveFavorites();
  syncSettingsToSupabase();
  renderPalette();
}

/* ────────────────────────────────────────────────
   Toast
──────────────────────────────────────────────── */
let _toastTimer;
function showToast(msg, dur = 2800) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('visible');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('visible'), dur);
}

/* ────────────────────────────────────────────────
   Tap-to-add mode
──────────────────────────────────────────────── */
function selectItem(type, item, el) {
  if (state.selectedItem?.item.id === item.id && state.selectedItem?.type === type) {
    clearSelection(); return;
  }
  clearSelection();
  state.selectedItem = { type, item };
  el.classList.add('selected-for-add');
  document.getElementById('tlHeaderLabel').textContent = `Tap a time slot to add "${item.name}"`;
  showToast(`Tap a time slot to add ${item.name}`, 5000);
}

function clearSelection() {
  state.selectedItem = null;
  document.querySelectorAll('.palette-item.selected-for-add').forEach(e => e.classList.remove('selected-for-add'));
  document.getElementById('tlHeaderLabel').textContent = 'Your Day — drag or tap to add';
}

function addSelectedToSlot(slot) {
  if (!state.selectedItem) return;
  if (!state.schedule[slot]) state.schedule[slot] = [];
  state.schedule[slot].push({ ...state.selectedItem });
  save();
  clearSelection();
  renderTimeline();
  renderDaySummary();
  renderWeekNav();
  evalAndRender();
}

/* ────────────────────────────────────────────────
   Week navigator + day preview
──────────────────────────────────────────────── */
function quickStatus(schedule) {
  const all = Object.values(schedule || {}).flat();
  if (!all.length) return '';
  const meals = all.filter(i => i.type === 'meal').length;
  if (meals >= 3) return 'green';
  if (meals >= 1 || all.filter(i => i.type === 'workout').length) return 'yellow';
  return 'red';
}

let _previewTimer;
function showDayPreview(date, key, btn) {
  clearTimeout(_previewTimer);
  const sched    = key === state.currentDate ? state.schedule : JSON.parse(localStorage.getItem(`fuelup_day_${key}`) || '{}');
  const all      = Object.values(sched).flat();
  const meals    = all.filter(i => i.type === 'meal').length;
  const snacks   = all.filter(i => i.type === 'snack' && !i.item?.water && !i.item?.treat).length;
  const treats   = all.filter(i => i.item?.treat).length;
  const workouts = all.filter(i => i.type === 'workout').length;
  const water    = all.filter(i => i.item?.water).length;
  const status   = quickStatus(sched);

  const el = document.getElementById('dayPreview');
  if (!all.length) {
    el.innerHTML = `<div class="dp-day">${date.toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'})}</div><div class="dp-empty">No plan yet</div>`;
  } else {
    const badge = {green:'🌟 Green Day!', yellow:'💪 Getting there', red:'🔧 Needs work'}[status] || '';
    const parts = [meals&&`🍽 ${meals}`,snacks&&`🍎 ${snacks}`,treats&&`🍦 ${treats}`,workouts&&`💪 ${workouts}`,water&&`💧 ${water}`].filter(Boolean);
    el.innerHTML = `
      <div class="dp-day">${date.toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'})}</div>
      <div class="dp-status ${status}">${badge}</div>
      <div class="dp-counts">${parts.join(' · ')}</div>`;
  }

  const rect = btn.getBoundingClientRect();
  el.style.left = `${rect.left + rect.width/2}px`;
  el.style.top  = `${rect.bottom + 8}px`;
  el.classList.add('visible');
}

function hideDayPreview() {
  _previewTimer = setTimeout(() => document.getElementById('dayPreview').classList.remove('visible'), 120);
}

function renderWeekNav() {
  const nav = document.getElementById('weekNav'), todayK = todayKey();
  nav.innerHTML = '';

  // ‹ Prev arrow
  const prev = document.createElement('button');
  prev.className = 'week-arrow';
  prev.textContent = '‹';
  prev.title = 'Previous week';
  prev.addEventListener('click', () => shiftWeek(-1));
  nav.appendChild(prev);

  // Week range label
  const lbl = document.createElement('div');
  lbl.className = 'week-label';
  lbl.textContent = weekRangeLabel();
  nav.appendChild(lbl);

  // Day buttons
  getWeekDates().forEach(date => {
    const key     = dateStr(date);
    const isToday = key === todayK, isActive = key === state.currentDate;
    const sched   = key === state.currentDate ? state.schedule : JSON.parse(localStorage.getItem(`fuelup_day_${key}`) || '{}');
    const dot     = quickStatus(sched);

    const btn = document.createElement('button');
    btn.className = `week-day${isActive?' active':''}${isToday?' today':''}`;
    btn.innerHTML = `<div class="wd-name">${date.toLocaleDateString('en-US',{weekday:'short'})}</div><div class="wd-num">${date.getDate()}</div><div class="wd-dot ${dot}"></div>`;
    btn.addEventListener('click',      () => { if (!isActive) switchDay(key); });
    btn.addEventListener('mouseenter', () => showDayPreview(date, key, btn));
    btn.addEventListener('mouseleave', hideDayPreview);
    nav.appendChild(btn);
  });

  // › Next arrow
  const next = document.createElement('button');
  next.className = 'week-arrow';
  next.textContent = '›';
  next.title = 'Next week';
  next.addEventListener('click', () => shiftWeek(1));
  nav.appendChild(next);
}

function switchDay(key) {
  saveDay();
  loadDay(key);
  renderWeekNav(); renderTimeline(); renderDaySummary(); evalAndRender(); scrollToNow();
  // Load from cloud for this day
  if (sbClient && state.userId) {
    sbClient.from('fuelup_plans').select('schedule').eq('user_id', state.userId).eq('plan_date', key).maybeSingle()
      .then(({ data }) => {
        if (data?.schedule) { state.schedule = data.schedule; saveDay(); renderTimeline(); renderDaySummary(); evalAndRender(); }
      }).catch(() => {});
  }
}

/* ────────────────────────────────────────────────
   Copy Day modal
──────────────────────────────────────────────── */
let copySelections = new Set();

function openCopyModal()  { copySelections.clear(); renderCopyGrid(); document.getElementById('copyModal').classList.add('open'); }
function closeCopyModal() { document.getElementById('copyModal').classList.remove('open'); copySelections.clear(); }

function renderCopyGrid() {
  const grid = document.getElementById('copyDayGrid'); grid.innerHTML = '';
  getWeekDates().forEach(date => {
    const key    = dateStr(date), isSelf = key === state.currentDate;
    const sched  = JSON.parse(localStorage.getItem(`fuelup_day_${key}`) || '{}');
    const dot    = quickStatus(sched);
    const btn    = document.createElement('button');
    btn.className = `copy-day-btn${copySelections.has(key)?' selected':''}`;
    if (isSelf) btn.disabled = true;
    btn.innerHTML = `<div class="cbd-name">${date.toLocaleDateString('en-US',{weekday:'short'})}</div><div class="cbd-num">${date.getDate()}</div><div class="cbd-dot ${dot}"></div>`;
    btn.addEventListener('click', () => {
      if (copySelections.has(key)) copySelections.delete(key); else copySelections.add(key);
      btn.classList.toggle('selected', copySelections.has(key));
    });
    grid.appendChild(btn);
  });
}

function confirmCopy() {
  if (!copySelections.size) { closeCopyModal(); return; }
  const snap = JSON.parse(JSON.stringify(state.schedule));
  copySelections.forEach(key => {
    localStorage.setItem(`fuelup_day_${key}`, JSON.stringify(snap));
    // Sync each copied day to Supabase
    if (sbClient && state.userId) {
      sbClient.from('fuelup_plans').upsert(
        { user_id: state.userId, plan_date: key, schedule: snap, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,plan_date' }
      ).catch(() => {});
    }
  });
  closeCopyModal(); renderWeekNav();
  const n = copySelections.size;
  showToast(`✅ Copied to ${n} day${n!==1?'s':''}!`);
}

/* ────────────────────────────────────────────────
   Day summary strip
──────────────────────────────────────────────── */
function renderDaySummary() {
  const el = document.getElementById('daySummary');
  const all = Object.values(state.schedule).flat();
  if (!all.length) { el.innerHTML = '<span class="ds-pill empty-day">Drag or tap items to plan your day</span>'; return; }
  const meals    = all.filter(i => i.type === 'meal').length;
  const snacks   = all.filter(i => i.type === 'snack' && !i.item.treat && !i.item.water).length;
  const treats   = all.filter(i => i.type === 'snack' && i.item.treat).length;
  const sides    = all.filter(i => i.type === 'side').length;
  const workouts = all.filter(i => i.type === 'workout').length;
  const water    = all.filter(i => i.item?.water).length;
  el.innerHTML = [
    meals    && `<span class="ds-pill meals">${meals} meal${meals!==1?'s':''}</span>`,
    sides    && `<span class="ds-pill sides">${sides} side${sides!==1?'s':''}</span>`,
    snacks   && `<span class="ds-pill snacks">${snacks} snack${snacks!==1?'s':''}</span>`,
    treats   && `<span class="ds-pill treats">${treats} treat${treats!==1?'s':''}</span>`,
    workouts && `<span class="ds-pill workouts">${workouts} workout${workouts!==1?'s':''}</span>`,
    `<span class="ds-pill water">💧 ${water} water${water!==1?'s':''}</span>`,
  ].filter(Boolean).join('');
}

/* ────────────────────────────────────────────────
   Palette
──────────────────────────────────────────────── */
function makePaletteItem(type, item) {
  const favored = isFav(type, item.id);
  const div = document.createElement('div');
  div.className = `palette-item${item.treat?' treat-item':''}${favored?' favorited':''}`;
  div.draggable = true;
  div.dataset.payload = JSON.stringify({ type, item });

  let meta = '';
  if (type === 'workout') meta = `<div class="pi-meta">⏱ ${item.duration} min${item.halftime?' · halftime':''}</div>`;
  else if (item.treat)    meta = '<div class="pi-treat-badge">treat — great in moderation ✓</div>';
  else if (item.preGame)  meta = `<div class="pi-meta pi-pregame">⚡ Pre-game pick${item.note?' — '+item.note:''}</div>`;
  else if (item.note)     meta = `<div class="pi-meta">${item.note}</div>`;

  div.innerHTML = `
    <span class="pi-emoji">${item.emoji}</span>
    <div class="pi-info"><div class="pi-name">${item.name}</div>${meta}</div>
    <button class="pi-fav ${favored?'active':''}" title="${favored?'Unfavorite':'Favorite'}">♥</button>
  `;

  div.querySelector('.pi-fav').addEventListener('click', e => { e.stopPropagation(); toggleFavorite(type, item.id); });
  div.addEventListener('click', e => { if (!e.target.classList.contains('pi-fav')) selectItem(type, item, div); });
  return div;
}

function sectionHeader(label, cls = '') {
  const h = document.createElement('div');
  h.className = `palette-section-header${cls?' '+cls:''}`;
  h.textContent = label;
  return h;
}

function itemMatchesQuery(type, item, q) {
  const tags = [item.name.toLowerCase()];
  if (item.note)        tags.push(item.note.toLowerCase());
  if (item.fruit)       tags.push('fruit', 'fruits');
  if (item.veggie)      tags.push('vegetable', 'vegetables', 'veggie', 'veggies', 'veg');
  if (item.dairy)       tags.push('dairy');
  if (item.protein)     tags.push('protein');
  if (item.carbs)       tags.push('carb', 'carbs', 'grain', 'grains');
  if (item.treat)       tags.push('treat', 'treats', 'dessert', 'sweets');
  if (item.water)       tags.push('water', 'hydration', 'hydrate', 'drink');
  if (item.preGame)     tags.push('pregame', 'pre-game', 'pre game', 'game day');
  if (item.postWorkout) tags.push('recovery', 'post workout', 'post-workout', 'postworkout');
  if (item.mealType)    tags.push(item.mealType);
  if (item.fg?.grains)  tags.push('grain', 'grains');
  if (item.fg?.dairy)   tags.push('dairy');
  if (item.fg?.fruit)   tags.push('fruit', 'fruits');
  if (item.fg?.veggies) tags.push('vegetable', 'vegetables', 'veggie', 'veggies', 'veg');
  if (type === 'side')    tags.push('side', 'sides');
  if (type === 'snack')   tags.push('snack', 'snacks');
  if (type === 'meal')    tags.push('meal', 'meals');
  if (type === 'workout') tags.push('workout', 'exercise', 'training');
  if (item.sport)       tags.push('sport', 'sports', 'game', 'match', 'meet');
  if (item.intensity === 'high')   tags.push('intense', 'high intensity');
  if (item.intensity === 'medium') tags.push('medium');
  if (item.intensity === 'low')    tags.push('light', 'easy', 'low');
  return tags.some(tag => tag.includes(q));
}

function renderPalette() {
  const el = document.getElementById('paletteContent');
  if (el._sortable) { try { el._sortable.destroy(); } catch {} el._sortable = null; }
  el.innerHTML = '';

  // ── Search mode: filter across all items on all tabs ──────────────────────
  if (paletteQuery) {
    const q = paletteQuery.toLowerCase();
    const hits = [
      ...MEALS.map(i => ({ type: 'meal', item: i })),
      ...SIDES.map(i => ({ type: 'side', item: i })),
      ...SNACKS.map(i => ({ type: 'snack', item: i })),
      ...WORKOUTS.map(i => ({ type: 'workout', item: i })),
    ].filter(({ type, item }) => itemMatchesQuery(type, item, q));

    if (!hits.length) {
      el.innerHTML = '<div class="empty-state">No items match your search</div>';
    } else {
      hits.forEach(({ type, item }) => el.appendChild(makePaletteItem(type, item)));
    }
    if (typeof Sortable !== 'undefined') initPaletteSortable();
    return;
  }

  if (state.activeTab === 'meals') {
    const favMeals = MEALS.filter(m => isFav('meal', m.id));
    if (favMeals.length) { el.appendChild(sectionHeader('⭐ Favorites')); favMeals.forEach(i => el.appendChild(makePaletteItem('meal', i))); }
    [
      { label: 'Breakfast', f: m => m.mealType === 'breakfast', hint: '🌅 These work at lunch or dinner too!' },
      { label: 'Lunch',     f: m => m.mealType === 'lunch'     },
      { label: 'Dinner',    f: m => m.mealType === 'dinner'    },
    ].forEach(({ label, f, hint }) => {
      el.appendChild(sectionHeader(label));
      if (hint) {
        const h = document.createElement('div');
        h.className = 'palette-side-hint';
        h.textContent = hint;
        el.appendChild(h);
      }
      MEALS.filter(f).forEach(i => el.appendChild(makePaletteItem('meal', i)));
    });
    el.appendChild(sectionHeader('🥗 Sides — add to any meal slot'));
    const sideHint = document.createElement('div');
    sideHint.className = 'palette-side-hint';
    sideHint.textContent = 'Drop a side onto the same time slot as a meal to balance it';
    el.appendChild(sideHint);
    el.appendChild(sectionHeader('🥩 Protein Add-ons'));
    SIDES.filter(s => s.protein && !s.dairy).forEach(item => el.appendChild(makePaletteItem('side', item)));
    el.appendChild(sectionHeader('Fruit'));
    SIDES.filter(s => s.fruit).forEach(item => el.appendChild(makePaletteItem('side', item)));
    el.appendChild(sectionHeader('Vegetables'));
    SIDES.filter(s => s.veggie).forEach(item => el.appendChild(makePaletteItem('side', item)));
    el.appendChild(sectionHeader('Dairy'));
    SIDES.filter(s => s.dairy).forEach(item => el.appendChild(makePaletteItem('side', item)));
    el.appendChild(sectionHeader('Carbs'));
    SIDES.filter(s => s.carbs && !s.protein).forEach(item => el.appendChild(makePaletteItem('side', item)));

  } else if (state.activeTab === 'snacks') {
    const favSnacks = SNACKS.filter(s => isFav('snack', s.id));
    if (favSnacks.length) { el.appendChild(sectionHeader('⭐ Favorites')); favSnacks.forEach(i => el.appendChild(makePaletteItem('snack', i))); }
    el.appendChild(sectionHeader('💧 Hydration'));
    SNACKS.filter(s => s.water).forEach(i => el.appendChild(makePaletteItem('snack', i)));
    el.appendChild(sectionHeader('⚡ Pre-Game Picks'));
    SNACKS.filter(s => s.preGame).forEach(i => el.appendChild(makePaletteItem('snack', i)));
    el.appendChild(sectionHeader('Healthy Snacks'));
    SNACKS.filter(s => !s.treat && !s.water && !s.preGame).forEach(i => el.appendChild(makePaletteItem('snack', i)));
    el.appendChild(sectionHeader('✨ Treats — OK in Moderation!', 'treat'));
    SNACKS.filter(s => s.treat).forEach(i => el.appendChild(makePaletteItem('snack', i)));

  } else if (state.activeTab === 'workouts') {
    const favWork = WORKOUTS.filter(w => isFav('workout', w.id));
    if (favWork.length) { el.appendChild(sectionHeader('⭐ Favorites')); favWork.forEach(i => el.appendChild(makePaletteItem('workout', i))); }
    el.appendChild(sectionHeader('Sports & Games'));
    WORKOUTS.filter(w =>  w.sport).forEach(i => el.appendChild(makePaletteItem('workout', i)));
    el.appendChild(sectionHeader('Training & Fitness'));
    WORKOUTS.filter(w => !w.sport).forEach(i => el.appendChild(makePaletteItem('workout', i)));
  }

  if (typeof Sortable !== 'undefined') initPaletteSortable();
}

/* ────────────────────────────────────────────────
   SortableJS
──────────────────────────────────────────────── */
function initPaletteSortable() {
  const el = document.getElementById('paletteContent');
  if (el._sortable) { try { el._sortable.destroy(); } catch {} }
  el._sortable = new Sortable(el, {
    group: { name: 'fuelup', pull: 'clone', put: false },
    sort: false,
    filter: '.palette-section-header, .pi-fav',
    preventOnFilter: false,
    animation: 120,
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
  });
}

function initSlotSortables() {
  slotSortables.forEach(s => { try { s.destroy(); } catch {} });
  slotSortables.clear();

  document.querySelectorAll('.slot-drop-zone').forEach(zone => {
    const slot = zone.dataset.slot;
    const s = new Sortable(zone, {
      group: { name: 'fuelup', pull: false, put: true },
      sort: false,
      animation: 120,
      ghostClass: 'sortable-ghost',
      onAdd(evt) {
        const payload = evt.item.dataset.payload;
        if (payload) {
          try {
            const data = JSON.parse(payload);
            if (!state.schedule[slot]) state.schedule[slot] = [];
            state.schedule[slot].push(data);
            save();
          } catch {}
        }
        evt.item.remove(); // remove SortableJS clone, re-render from state
        renderTimeline();
        renderDaySummary();
        renderWeekNav();
        evalAndRender();
      },
    });
    slotSortables.set(slot, s);
  });
}

/* ────────────────────────────────────────────────
   Timeline
──────────────────────────────────────────────── */
function itemCssClass(type, item) {
  if (type === 'meal')    return 'type-meal';
  if (type === 'workout') return 'type-workout';
  if (type === 'side')    return 'type-side';
  if (item.water)         return 'type-water';
  return item.treat ? 'type-snack-treat' : 'type-snack-good';
}

function renderTimeline() {
  // Destroy slot Sortables before rebuilding DOM
  slotSortables.forEach(s => { try { s.destroy(); } catch {} });
  slotSortables.clear();

  const tl = document.getElementById('timeline');
  tl.innerHTML = '';

  slots().forEach(slot => {
    const row  = document.createElement('div');
    const isHr = toMin(slot) % 60 === 0;
    row.className = `time-slot${isHr?' hour-mark':''}`;

    const label = document.createElement('div');
    label.className = 'time-label';
    label.textContent = isHr ? fmt(slot) : '';

    const zone = document.createElement('div');
    zone.className = 'slot-drop-zone';
    zone.dataset.slot = slot;

    (state.schedule[slot] || []).forEach((placed, idx) => {
      const { type, item } = placed;
      const chip = document.createElement('div');
      chip.className = `slot-item ${itemCssClass(type, item)}`;
      chip.innerHTML = `
        <span class="si-emoji">${item.emoji}</span>
        <span class="si-name">${item.name}</span>
        ${type==='workout'?`<span class="si-badge">${item.duration}m</span>`:''}
        <button class="si-remove" title="Remove">×</button>
      `;
      chip.querySelector('.si-remove').addEventListener('click', () => {
        state.schedule[slot].splice(idx, 1);
        if (!state.schedule[slot].length) delete state.schedule[slot];
        save(); renderTimeline(); renderDaySummary(); renderWeekNav(); evalAndRender();
      });
      zone.appendChild(chip);
    });

    // Tap-to-add (click on zone when an item is selected)
    zone.addEventListener('click', () => { if (state.selectedItem) addSelectedToSlot(slot); });

    // HTML5 DnD fallback (when SortableJS not available)
    if (typeof Sortable === 'undefined') {
      zone.addEventListener('dragover', e => { e.preventDefault(); row.classList.add('drag-active'); });
      zone.addEventListener('dragleave', e => { if (!row.contains(e.relatedTarget)) row.classList.remove('drag-active'); });
      zone.addEventListener('drop', e => {
        e.preventDefault(); row.classList.remove('drag-active');
        try {
          const data = JSON.parse(e.dataTransfer.getData('application/json'));
          if (!state.schedule[slot]) state.schedule[slot] = [];
          state.schedule[slot].push(data);
          save(); renderTimeline(); renderDaySummary(); renderWeekNav(); evalAndRender();
        } catch {}
      });
    }

    row.appendChild(label);
    row.appendChild(zone);
    tl.appendChild(row);
  });

  if (typeof Sortable !== 'undefined') initSlotSortables();
}

/* ────────────────────────────────────────────────
   Scroll to now
──────────────────────────────────────────────── */
function scrollToNow() {
  if (state.currentDate !== todayKey()) return;
  const now  = new Date();
  const snap = fromMin(now.getHours() * 60 + (now.getMinutes() >= 30 ? 30 : 0));
  document.querySelector(`.slot-drop-zone[data-slot="${snap}"]`)
    ?.closest('.time-slot')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* ────────────────────────────────────────────────
   Food groups
──────────────────────────────────────────────── */
function calcFoodGroups() {
  const totals = { grains: 0, veggies: 0, fruit: 0, dairy: 0, protein: 0 };
  Object.values(state.schedule).flat().forEach(placed => {
    const fg = placed.item?.fg;
    if (!fg) return;
    Object.keys(totals).forEach(k => { totals[k] = Math.round((totals[k] + (fg[k] || 0)) * 100) / 100; });
  });
  return totals;
}

function renderFoodGroups() {
  const el = document.getElementById('foodGroups');
  const totals = calcFoodGroups();
  const hasAny = Object.values(totals).some(v => v > 0);

  if (!hasAny) {
    el.innerHTML = '<div class="empty-state">Add meals to track food group goals</div>';
    return;
  }

  el.innerHTML = FG_DEFS.map(({ key, label, unit, color }) => {
    const actual = totals[key], goal = DAILY_GOALS[key];
    const pct    = Math.min(100, (actual / goal) * 100);
    const met    = actual >= goal;
    const display = Number.isInteger(actual) ? actual : actual.toFixed(1);
    const barColor = met ? color : color + 'bb';
    return `
      <div class="fg-row">
        <div class="fg-header">
          <span class="fg-name">${label}</span>
          <span class="fg-count${met ? ' fg-met' : ''}">${display} / ${goal} ${unit}${met ? ' ✓' : ''}</span>
        </div>
        <div class="fg-bar-track">
          <div class="fg-bar-fill" style="width:${pct.toFixed(1)}%;background:${barColor}"></div>
        </div>
      </div>`;
  }).join('');
}

/* ────────────────────────────────────────────────
   Meal period — time-based, not item-based
   Determines breakfast / lunch / dinner by when
   the slot falls relative to wake time, so
   "breakfast for dinner" is recognized as dinner.
──────────────────────────────────────────────── */
function mealPeriod(slotTime) {
  const elapsed = toMin(slotTime) - toMin(state.wakeTime);
  if (elapsed <= 180) return 'breakfast'; // first 3 hrs after waking
  if (elapsed <= 480) return 'lunch';     // 3–8 hrs after waking
  return 'dinner';
}

/* ────────────────────────────────────────────────
   Compliance engine
──────────────────────────────────────────────── */
function getAllItems() {
  return Object.keys(state.schedule).sort().flatMap(t => (state.schedule[t] || []).map(p => ({ time: t, ...p })));
}

function evaluate() {
  const all      = getAllItems();
  const meals    = all.filter(i => i.type === 'meal');
  const workouts = all.filter(i => i.type === 'workout');
  const fuel     = all.filter(i => i.type === 'meal' || i.type === 'snack' || i.type === 'side');
  const waters   = all.filter(i => i.item?.water);

  const rules = [], tips = [];
  if (!all.length) return { rules, tips, status: 'empty', passed: 0, total: 0 };

  // ── Breakfast ──────────────────────────────────
  const wakeMin   = toMin(state.wakeTime);
  const breakfast = meals.find(m => mealPeriod(m.time) === 'breakfast');
  if (!breakfast) {
    rules.push({ pass: false, label: 'Breakfast', desc: 'Add a breakfast meal — muscles rebuild overnight and need morning fuel' });
    tips.push('Start with breakfast within 60 min of waking — your body just ran an 8-hour fast!');
  } else {
    const gap = toMin(breakfast.time) - wakeMin, pass = gap <= 60;
    rules.push({ pass, label: 'Breakfast timing', desc: pass ? `Breakfast at ${fmt(breakfast.time)} ✓` : `Eat breakfast by ${fmt(fromMin(wakeMin+60))} (60 min of waking)` });
    if (!pass) tips.push(`Move breakfast earlier — aim for by ${fmt(fromMin(wakeMin+60))}`);
  }

  // ── 3 meals ────────────────────────────────────
  const mc = meals.length;
  rules.push({ pass: mc >= 3, label: '3 meals per day', desc: mc >= 3 ? `${mc} meals planned ✓` : `${mc} of 3 meals — add ${3-mc} more` });
  if (mc > 0 && mc < 3) tips.push(`Add ${3-mc} more meal${3-mc>1?'s':''} — consistent protein is key for muscle`);

  // ── No 4 hr gap ────────────────────────────────
  if (fuel.length >= 2) {
    let worst = 0, from = null, to = null;
    for (let i = 1; i < fuel.length; i++) {
      const g = toMin(fuel[i].time) - toMin(fuel[i-1].time);
      if (g > worst) { worst = g; from = fuel[i-1].time; to = fuel[i].time; }
    }
    const pass = worst <= 240;
    rules.push({ pass, label: 'No 4+ hour gap', desc: pass ? 'Consistent fueling ✓' : `Gap ${fmt(from)} → ${fmt(to)} — add a snack` });
    if (!pass) tips.push(`Long gap ${fmt(from)}–${fmt(to)} — add a snack around ${fmt(fromMin(Math.round((toMin(from)+toMin(to))/2)))}`);
  }

  // ── Hydration ──────────────────────────────────
  const hasHigh = workouts.some(w => w.item.intensity === 'high');
  if (state.trackHydration) {
    const waterGoal  = hasHigh ? 8 : 6;
    const waterCount = waters.length;
    rules.push({
      pass: waterCount >= waterGoal,
      label: `Hydration (${waterCount}/${waterGoal} glasses)`,
      desc: waterCount >= waterGoal ? `Great hydration ✓` : `Drink ${waterGoal-waterCount} more glass${waterGoal-waterCount!==1?'es':''} to hit your goal`,
    });
    if (waterCount < waterGoal) tips.push(`Drag 💧 Water from Snacks tab — athletes need ${waterGoal}+ glasses${hasHigh?' on hard workout days':' per day'}`);
  }

  // ── Meal balance (per slot) ────────────────────
  // Combine ALL meals + sides in a slot so mixing items (e.g. Pancakes + Eggs)
  // is evaluated as a whole rather than just the first meal found.
  Object.keys(state.schedule).sort().forEach(slot => {
    const slotItems = state.schedule[slot] || [];
    const slotMeals = slotItems.filter(i => i.type === 'meal');
    if (!slotMeals.length) return;

    const sides      = slotItems.filter(i => i.type === 'side');
    const combined   = [...slotMeals, ...sides];
    const hasProtein = combined.some(i => i.item.protein);
    const hasCarbs   = combined.some(i => i.item.carbs);
    const hasFruitVeg = slotMeals.some(m => m.item.veggie) || sides.some(i => i.item.fruit || i.item.veggie || i.item.dairy);

    const mealType  = mealPeriod(slot);
    const mealLabel = slotMeals.length === 1
      ? slotMeals[0].item.name
      : slotMeals.map(m => m.item.name).join(' + ');

    if (mealType === 'breakfast') {
      const pass = hasProtein && hasCarbs;
      rules.push({
        pass,
        label: `Balanced breakfast (${fmt(slot)})`,
        desc: pass
          ? `${mealLabel} — good start ✓`
          : `${mealLabel} — add ${!hasProtein ? 'a protein (eggs, yogurt, milk)' : 'carbs (toast, oatmeal, cereal)'}`,
      });
      if (!pass) tips.push(`Breakfast at ${fmt(slot)}: add ${!hasProtein ? 'protein like eggs or yogurt' : 'a carb like toast or oatmeal'} to fuel up properly`);

    } else {
      const missing = [];
      if (!hasProtein)  missing.push('protein (chicken, fish, beans, eggs)');
      if (!hasCarbs)    missing.push('carbs (rice, bread, pasta)');
      if (!hasFruitVeg) missing.push('a fruit or veggie side');
      const pass = missing.length === 0;
      rules.push({
        pass,
        label: `Balanced ${mealType} (${fmt(slot)})`,
        desc: pass
          ? `${mealLabel} — complete meal ✓`
          : `Missing: ${missing.join(' · ')}`,
      });
      if (!hasFruitVeg && hasProtein && hasCarbs) {
        tips.push(`${mealLabel} at ${fmt(slot)} — drop a 🥗 Side onto this slot (apple slices, carrot sticks, salad) to complete the meal`);
      } else if (!pass) {
        tips.push(`${mealLabel} at ${fmt(slot)} is missing ${missing.join(' and ')}`);
      }
    }
  });

  // ── Per-workout rules ──────────────────────────
  workouts.forEach(w => {
    const wMin = toMin(w.time), wEnd = wMin + (w.item.duration || 60);

    // General pre-fuel (all workouts: meal or snack within 90 min before)
    const preOk = fuel.some(f => { const fm = toMin(f.time); return fm < wMin && fm >= wMin - 90; });
    rules.push({ pass: preOk, label: `Pre-fuel: ${w.item.name}`, desc: preOk ? `Fueled before ${w.item.name} ✓` : `Eat 30-90 min before ${fmt(w.time)} ${w.item.name}` });
    if (!preOk) tips.push(`Eat a meal or snack around ${fmt(fromMin(wMin-60))} before your ${w.item.name}`);

    // ── Game-specific rules (sport: true) ────────
    if (w.item.sport) {
      // Pre-game meal: carb-rich meal 90-210 min before game (1.5-3.5 hrs)
      const preGameMeal = meals.some(f => { const fm = toMin(f.time); return fm < wMin && fm >= wMin - 210 && fm <= wMin - 90; });
      rules.push({
        pass: preGameMeal,
        label: `Pre-game meal: ${w.item.name}`,
        desc: preGameMeal
          ? `Pre-game meal timed perfectly ✓`
          : `Eat a carb-rich meal 1.5-3.5 hrs before ${fmt(w.time)} (around ${fmt(fromMin(wMin-150))})`,
      });
      if (!preGameMeal) tips.push(`${w.item.name} at ${fmt(w.time)} — eat a carb-heavy meal (pasta, rice, sandwich) around ${fmt(fromMin(wMin-150))} for maximum energy. Avoid heavy fat/protein within 2 hrs of game time.`);

      // Pre-game snack: light snack 20-60 min before game
      const preGameSnack = fuel.some(f => {
        const fm = toMin(f.time);
        return fm < wMin && fm >= wMin - 60 && fm <= wMin - 20 && f.item?.preGame;
      });
      // Also check for any easy snack in that window (not just preGame tagged)
      const anySnackInWindow = fuel.some(f => {
        const fm = toMin(f.time);
        return fm < wMin && fm >= wMin - 60 && fm <= wMin - 20;
      });
      rules.push({
        pass: anySnackInWindow,
        label: `Pre-game snack: ${w.item.name}`,
        desc: anySnackInWindow
          ? `Light pre-game snack planned ✓`
          : `Add a light snack 20-60 min before ${fmt(w.time)}`,
      });
      if (!anySnackInWindow) {
        const snackTime = fmt(fromMin(wMin - 40));
        tips.push(`${w.item.name} at ${fmt(w.time)} — eat a light snack around ${snackTime}. Best picks: 🍌 Banana, 🍞 Toast+Honey, 🍊 Orange slices, 🍫 Granola bar, or 🥜 Plain rice cakes. Avoid peanut butter, heavy proteins, or anything new right before a game!`);
      }
    }

    // Post-workout snack (within 30 min of end)
    const postOk = fuel.some(f => { const fm = toMin(f.time); return fm >= wEnd && fm <= wEnd + 30; });
    rules.push({ pass: postOk, label: `Post-fuel: ${w.item.name}`, desc: postOk ? `Recovery snack ✓` : `Snack within 30 min after ${w.item.name} ends (~${fmt(fromMin(wEnd))})` });
    if (!postOk) tips.push(`Add a snack by ${fmt(fromMin(wEnd+30))} after ${w.item.name} — try 🥛 chocolate milk, 🍎 apple+PB, or 💪 a protein bar`);

    // Halftime snack
    if (w.item.halftime) {
      const htMin = wMin + Math.floor((w.item.duration || 90) / 2);
      const htOk  = fuel.some(f => Math.abs(toMin(f.time) - htMin) <= 15);
      rules.push({ pass: htOk, label: `Halftime snack: ${w.item.name}`, desc: htOk ? 'Halftime snack planned ✓' : `Add a snack around ${fmt(fromMin(htMin))} for halftime` });
      if (!htOk) tips.push(`${w.item.name} at ${fmt(w.time)} — plan a halftime snack around ${fmt(fromMin(htMin))} (🍊 orange slices, 🍌 banana, or crackers)`);
    }
  });

  // ── Evening snack (dinner before 7:30 PM) ─────
  const dinnerMeals = meals.filter(m => mealPeriod(m.time) === 'dinner');
  if (dinnerMeals.length) {
    const lastDinner = dinnerMeals[dinnerMeals.length - 1];
    const dinnerMin  = toMin(lastDinner.time);
    if (dinnerMin < toMin('19:30')) {
      const hasEveningSnack = fuel.some(f => f.type === 'snack' && toMin(f.time) > dinnerMin);
      rules.push({
        pass: hasEveningSnack,
        label: 'Evening snack',
        desc: hasEveningSnack
          ? 'Evening snack after dinner ✓'
          : `Dinner at ${fmt(lastDinner.time)} is early — add a light snack before bed`
      });
      if (!hasEveningSnack) tips.push(`Dinner at ${fmt(lastDinner.time)} is early — add a light evening snack before bed (🧀 string cheese, 🥛 milk, or 🍎 apple slices)`);
    }
  }

  const passed = rules.filter(r => r.pass).length, total = rules.length;
  const ratio  = passed / total;
  const status = ratio >= 1 ? 'green' : ratio >= 0.55 ? 'yellow' : 'red';
  return { rules, tips, status, passed, total };
}

/* ────────────────────────────────────────────────
   Compliance render
──────────────────────────────────────────────── */
function evalAndRender() {
  renderFoodGroups();
  const { rules, tips, status, passed, total } = evaluate();

  const dot = document.getElementById('statusDot'), lbl = document.getElementById('statusLabel');
  dot.className = `status-dot ${status === 'empty' ? '' : status}`;
  lbl.textContent = { empty:'Plan your day ↗', green:'🌟 Green Day! Perfectly fueled!', yellow:`💪 Getting there! (${passed}/${total})`, red:`🔧 Needs work (${passed}/${total})` }[status] || '';

  const rulesEl = document.getElementById('complianceRules');
  rulesEl.innerHTML = !rules.length
    ? '<div class="empty-state">Add meals, snacks, and workouts to see your daily check</div>'
    : rules.map(r => `<div class="rule-row ${r.pass?'pass':'fail'}"><span class="rule-icon">${r.pass?'✅':'❌'}</span><div><div class="rule-label">${r.label}</div><div class="rule-desc">${r.desc}</div></div></div>`).join('');

  const tipsEl = document.getElementById('suggestions');
  tipsEl.innerHTML = !tips.length
    ? `<div class="empty-state">${status==='green'?"🎉 Perfect plan! You're fully fueled.":'Add items to get personalized tips'}</div>`
    : tips.map(t => `<div class="suggestion-row">💡 ${t}</div>`).join('');
}

/* ────────────────────────────────────────────────
   Mobile panel toggles
──────────────────────────────────────────────── */
function initMobileToggles() {
  // FAB opens palette
  document.getElementById('mobileFab').addEventListener('click', () => {
    const p = document.getElementById('palette');
    p.classList.toggle('mobile-open');
    if (p.classList.contains('mobile-open')) showToast('Tap an item, then tap a time slot to add it', 4000);
  });

  // Check FAB opens compliance panel
  document.getElementById('mobileCheckFab').addEventListener('click', () => {
    document.getElementById('compliancePanel').classList.toggle('mobile-open');
  });

  document.getElementById('compliancePanelClose').addEventListener('click', () => {
    document.getElementById('compliancePanel').classList.remove('mobile-open');
  });
}

/* ────────────────────────────────────────────────
   Init
──────────────────────────────────────────────── */
async function init() {
  document.getElementById('currentDate').textContent =
    new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });

  // Generate / load persistent user ID
  // If ?uid= is in the URL, adopt that ID (cross-device sync link)
  const urlUid = new URLSearchParams(window.location.search).get('uid');
  let uid = urlUid || localStorage.getItem('fuelup_uid');
  if (!uid) { uid = (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)+Date.now()); }
  localStorage.setItem('fuelup_uid', uid);
  state.userId = uid;
  // Strip uid param from URL bar without reloading
  if (urlUid) { const u = new URL(window.location); u.searchParams.delete('uid'); history.replaceState(null, '', u); }

  loadSettings();
  loadFavorites();
  loadDay(state.currentDate);

  initSupabase();
  initMobileToggles();

  // Palette tabs
  document.querySelectorAll('.palette-tabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.palette-tabs .tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.activeTab = tab.dataset.tab;
      renderPalette();
    });
  });

  // Wake / bed time
  document.getElementById('wakeTime').addEventListener('change', e => {
    state.wakeTime = e.target.value; save(); syncSettingsToSupabase(); renderTimeline(); evalAndRender();
  });
  document.getElementById('bedTime').addEventListener('change', e => {
    state.bedTime = e.target.value; save(); syncSettingsToSupabase(); renderTimeline(); evalAndRender();
  });

  // Hydration toggle
  document.getElementById('trackHydration').addEventListener('change', e => {
    state.trackHydration = e.target.checked; saveSettings(); evalAndRender();
  });

  // Palette search
  const searchInput = document.getElementById('paletteSearch');
  const searchClear = document.getElementById('paletteSearchClear');
  searchInput.addEventListener('input', () => {
    paletteQuery = searchInput.value.trim();
    searchClear.classList.toggle('visible', paletteQuery.length > 0);
    renderPalette();
  });
  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    paletteQuery = '';
    searchClear.classList.remove('visible');
    searchInput.focus();
    renderPalette();
  });

  // Copy day
  document.getElementById('copyDay').addEventListener('click', openCopyModal);
  document.getElementById('copyCancel').addEventListener('click', closeCopyModal);
  document.getElementById('copyConfirm').addEventListener('click', confirmCopy);
  document.getElementById('copyModal').addEventListener('click', e => { if (e.target.id === 'copyModal') closeCopyModal(); });

  // Clear day
  document.getElementById('clearDay').addEventListener('click', () => {
    if (confirm("Clear all items from today's plan?")) {
      state.schedule = {}; save(); renderWeekNav(); renderTimeline(); renderDaySummary(); evalAndRender();
    }
  });

  // Sync link button
  document.getElementById('syncLinkBtn').addEventListener('click', () => {
    const url = `${window.location.origin}${window.location.pathname}?uid=${state.userId}`;
    navigator.clipboard.writeText(url).then(() => showToast('📋 Sync link copied! Open it on your other device.'));
  });

  // Help modal
  document.getElementById('helpBtn').addEventListener('click', () => document.getElementById('helpModal').classList.add('open'));
  document.getElementById('helpModalClose').addEventListener('click', () => document.getElementById('helpModal').classList.remove('open'));
  document.getElementById('helpModal').addEventListener('click', e => { if (e.target.id === 'helpModal') document.getElementById('helpModal').classList.remove('open'); });

  // ESC clears tap-to-add selection and closes modals
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      clearSelection();
      document.getElementById('helpModal').classList.remove('open');
    }
  });

  renderWeekNav();
  renderPalette();
  renderTimeline();
  renderDaySummary();
  evalAndRender();
  setTimeout(scrollToNow, 100);

  // Load cloud data in background, refresh if newer
  if (sbClient) await loadFromSupabase().then(() => { renderTimeline(); renderDaySummary(); renderWeekNav(); evalAndRender(); }).catch(() => {});
}

document.addEventListener('DOMContentLoaded', init);
