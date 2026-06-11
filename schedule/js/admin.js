(function () {
  const S = window.Schedule;
  const cfg = window.SCHEDULE_CONFIG;
  const SESSION_KEY = 'schedule_admin_unlocked';

  document.getElementById('admin-title').textContent = `Manage ${cfg.PERSON_NAME}'s Availability`;
  document.title = `${cfg.PERSON_NAME} — Schedule Admin`;

  const gateView = document.getElementById('gate-view');
  const adminView = document.getElementById('admin-view');
  const pinInput = document.getElementById('pin-input');
  const gateSubmit = document.getElementById('gate-submit');
  const gateError = document.getElementById('gate-error');
  const logoutBtn = document.getElementById('logout-btn');

  function showGate() {
    gateView.style.display = '';
    adminView.style.display = 'none';
    setTimeout(() => pinInput.focus(), 50);
  }
  function showAdmin() {
    gateView.style.display = 'none';
    adminView.style.display = '';
    initAdmin();
  }

  function attemptUnlock() {
    if (pinInput.value === String(cfg.ADMIN_PIN)) {
      sessionStorage.setItem(SESSION_KEY, '1');
      gateError.style.display = 'none';
      showAdmin();
    } else {
      gateError.textContent = 'Incorrect PIN.';
      gateError.style.display = '';
      pinInput.value = '';
      pinInput.focus();
    }
  }

  gateSubmit.addEventListener('click', attemptUnlock);
  pinInput.addEventListener('keydown', e => { if (e.key === 'Enter') attemptUnlock(); });
  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem(SESSION_KEY);
    location.reload();
  });

  if (sessionStorage.getItem(SESSION_KEY) === '1') {
    showAdmin();
  } else {
    showGate();
  }

  // ----- Admin grid logic -----

  let adminInited = false;
  let supabase;
  let currentWeekStart = S.sundayOf(new Date());
  let overrides = {}; // { ymd: { idx: state } }
  let pendingSaves = 0;

  // Drag state
  let isDragging = false;
  let dragTargetState = null;

  function initAdmin() {
    if (adminInited) return;
    adminInited = true;

    try {
      supabase = S.makeSupabase();
    } catch (e) {
      setStatus('Config error', 'error');
      return;
    }

    document.getElementById('prev-week').addEventListener('click', () => {
      currentWeekStart = S.addDays(currentWeekStart, -7);
      loadWeek();
    });
    document.getElementById('next-week').addEventListener('click', () => {
      currentWeekStart = S.addDays(currentWeekStart, 7);
      loadWeek();
    });
    document.getElementById('today-btn').addEventListener('click', () => {
      currentWeekStart = S.sundayOf(new Date());
      loadWeek();
    });

    // Global mouseup/touchend ends drag
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
    document.addEventListener('mouseleave', endDrag);

    loadWeek();
  }

  function endDrag() {
    isDragging = false;
    dragTargetState = null;
  }

  function setStatus(text, cls) {
    const el = document.getElementById('save-status');
    el.textContent = text;
    el.className = 'save-status' + (cls ? ' ' + cls : '');
  }

  async function loadWeek() {
    const days = S.weekDates(currentWeekStart);
    document.getElementById('week-label').textContent = S.weekLabel(currentWeekStart);
    setStatus('Loading…');
    try {
      overrides = await S.fetchOverrides(supabase, S.ymd(days[0]), S.ymd(days[6]));
      renderGrid();
      setStatus('Ready');
    } catch (e) {
      console.error(e);
      setStatus('Load failed', 'error');
    }
  }

  function getSlotState(dateYmd, idx) {
    return (overrides[dateYmd] && overrides[dateYmd][idx]) || 'available';
  }

  function setSlotStateLocal(dateYmd, idx, state) {
    if (!overrides[dateYmd]) overrides[dateYmd] = {};
    if (state === 'available') {
      delete overrides[dateYmd][idx];
    } else {
      overrides[dateYmd][idx] = state;
    }
  }

  async function persistSlot(dateYmd, idx, state) {
    pendingSaves++;
    setStatus('Saving…', 'saving');
    try {
      await S.upsertSlot(supabase, dateYmd, idx, state);
      pendingSaves--;
      if (pendingSaves === 0) setStatus('Saved ✓', 'saved');
    } catch (e) {
      console.error(e);
      pendingSaves--;
      setStatus('Save failed', 'error');
    }
  }

  function applyState(dateYmd, idx, state, el) {
    setSlotStateLocal(dateYmd, idx, state);
    el.className = `slot ${state}` + (idx % 2 === 0 ? ' hour-start' : '');
    el.dataset.state = state;
    persistSlot(dateYmd, idx, state);
  }

  function onSlotMouseDown(e) {
    e.preventDefault();
    const el = e.currentTarget;
    const dateYmd = el.dataset.date;
    const idx = parseInt(el.dataset.idx, 10);
    const cur = el.dataset.state;
    const next = S.NEXT_STATE[cur];
    applyState(dateYmd, idx, next, el);
    isDragging = true;
    dragTargetState = next;
  }

  function onSlotMouseEnter(e) {
    if (!isDragging || !dragTargetState) return;
    const el = e.currentTarget;
    if (el.dataset.state === dragTargetState) return;
    const dateYmd = el.dataset.date;
    const idx = parseInt(el.dataset.idx, 10);
    applyState(dateYmd, idx, dragTargetState, el);
  }

  function renderGrid() {
    const grid = document.getElementById('grid');
    const days = S.weekDates(currentWeekStart);
    const todayYmd = S.ymd(new Date());

    const parts = [];
    // Top-left corner empty
    parts.push(`<div class="grid-head"></div>`);
    // Day headers
    for (const d of days) {
      const isToday = S.ymd(d) === todayYmd;
      parts.push(`<div class="grid-head ${isToday ? 'is-today' : ''}">
        <span class="head-day">${S.dayShort(d)}</span>
        <span class="head-date">${S.prettyDate(d)}</span>
      </div>`);
    }

    // Rows
    for (let i = 0; i < S.SLOTS_PER_DAY; i++) {
      const startMin = S.slotStartMinutes(i);
      const isHour = startMin % 60 === 0;
      const label = isHour ? S.formatMinutes(startMin) : '';
      parts.push(`<div class="time-label ${isHour ? 'hour' : ''}">${label}</div>`);
      for (const d of days) {
        const dateYmd = S.ymd(d);
        const state = getSlotState(dateYmd, i);
        parts.push(`<div class="slot ${state}${isHour ? ' hour-start' : ''}"
          data-date="${dateYmd}" data-idx="${i}" data-state="${state}"
          title="${S.dayShort(d)} ${S.formatSlotStart(i)}"></div>`);
      }
    }
    grid.innerHTML = parts.join('');

    // Wire up events on each slot. mousedown handles mouse + tap (browsers emit
    // a synthetic mousedown on tap). Drag-paint works on mouse only.
    const slots = grid.querySelectorAll('.slot');
    slots.forEach(el => {
      el.addEventListener('mousedown', onSlotMouseDown);
      el.addEventListener('mouseenter', onSlotMouseEnter);
    });
  }
})();
