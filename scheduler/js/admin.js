(function () {
  const SESSION_KEY = 'scheduler-admin-pin';

  const state = {
    pin: sessionStorage.getItem(SESSION_KEY) || '',
    weekStart: ymd(startOfWeek(new Date())),
    blWeekStart: ymd(startOfWeek(new Date())),
    selectedDayIndex: defaultDayIndex(ymd(startOfWeek(new Date()))),
    clickMode: 'schedule', // 'schedule' | 'book'
    week: null,
    config: null
  };

  const $login = document.getElementById('loginWrap');
  const $adminApp = document.getElementById('adminApp');
  const $banner = document.getElementById('banner');
  const $modal = document.getElementById('modalRoot');

  // ---------- Login ----------

  document.getElementById('loginBtn').addEventListener('click', doLogin);
  document.getElementById('pinInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') doLogin();
  });
  document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem(SESSION_KEY);
    state.pin = '';
    showLogin();
  });

  async function doLogin() {
    const pin = document.getElementById('pinInput').value.trim();
    const $err = document.getElementById('loginErr');
    $err.innerHTML = '';
    if (!pin) return;
    const res = await API.verifyPin(pin);
    if (res.error || !res.ok) {
      $err.innerHTML = `<div class="banner banner-error">Invalid PIN</div>`;
      return;
    }
    state.pin = pin;
    sessionStorage.setItem(SESSION_KEY, pin);
    showApp();
  }

  function showLogin() {
    $login.style.display = '';
    $adminApp.style.display = 'none';
  }

  function showApp() {
    $login.style.display = 'none';
    $adminApp.style.display = '';
    load();
  }

  // ---------- Tabs ----------

  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const t = btn.dataset.tab;
      document.getElementById('panel-' + t).classList.add('active');
      if (t === 'bookings') renderBookingList();
      if (t === 'settings') renderSettings();
    });
  });

  // ---------- Availability ----------

  document.getElementById('prevWeek').addEventListener('click', () => {
    state.weekStart = ymd(addDays(parseYMD(state.weekStart), -7));
    state.selectedDayIndex = defaultDayIndex(state.weekStart);
    load();
  });
  document.getElementById('nextWeek').addEventListener('click', () => {
    state.weekStart = ymd(addDays(parseYMD(state.weekStart), 7));
    state.selectedDayIndex = defaultDayIndex(state.weekStart);
    load();
  });
  document.getElementById('todayBtn').addEventListener('click', () => {
    state.weekStart = ymd(startOfWeek(new Date()));
    state.selectedDayIndex = defaultDayIndex(state.weekStart);
    load();
  });

  onBreakpointChange(() => { if (state.week) renderGrid(); });

  document.getElementById('clearWeek').addEventListener('click', () => bulkSetWeek(false));
  document.getElementById('openAllWeek').addEventListener('click', () => bulkSetWeek(true));

  document.querySelectorAll('#modeToggle button').forEach(btn => {
    btn.addEventListener('click', () => setClickMode(btn.dataset.mode));
  });

  function setClickMode(mode) {
    state.clickMode = mode;
    document.querySelectorAll('#modeToggle button').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
    document.getElementById('adminApp').classList.toggle('book-mode', mode === 'book');
  }

  document.getElementById('blPrev').addEventListener('click', () => { state.blWeekStart = ymd(addDays(parseYMD(state.blWeekStart), -7)); renderBookingList(); });
  document.getElementById('blNext').addEventListener('click', () => { state.blWeekStart = ymd(addDays(parseYMD(state.blWeekStart), 7)); renderBookingList(); });
  document.getElementById('blToday').addEventListener('click', () => { state.blWeekStart = ymd(startOfWeek(new Date())); renderBookingList(); });

  async function load() {
    const res = await API.getWeek(state.weekStart);
    if (res.error) { showBanner('error', res.error); return; }
    state.week = res;
    state.config = res.config;
    renderStatusLine();
    renderGrid();
  }

  function renderStatusLine() {
    const c = state.config;
    const pub = c.site_published ? '<strong style="color:var(--success)">Published</strong>' : '<strong style="color:var(--warning)">Unpublished</strong>';
    document.getElementById('statusLine').innerHTML = `${pub} · Advance-booking window: ${c.advance_days} day${c.advance_days === 1 ? '' : 's'}`;
  }

  function renderGrid() {
    const cfg = state.config;
    const allDates = state.week.dates;
    const mobile = isMobile();
    if (state.selectedDayIndex >= allDates.length) state.selectedDayIndex = 0;
    const dates = mobile ? [allDates[state.selectedDayIndex]] : allDates;
    const availableSet = new Set(state.week.available);
    const bookings = state.week.bookings;
    const todayStr = todayYMD();

    document.getElementById('weekRange').textContent = formatRange(state.weekStart);

    const $weekInfo = document.getElementById('weekInfo');
    if (!isWeekBookable(state.weekStart)) {
      const opens = weekOpensOn(state.weekStart);
      $weekInfo.innerHTML = `<div class="banner banner-info">This week is not yet open for consumers. It opens Sunday, ${escapeHtml(formatFullDate(opens))}. You can still set availability now.</div>`;
    } else {
      $weekInfo.innerHTML = '';
    }

    renderDayPicker(document.getElementById('dayPicker'), allDates, state.selectedDayIndex, (idx) => {
      state.selectedDayIndex = idx;
      renderGrid();
    });

    const groups = groupDaysByHours(dates, cfg);
    const $grid = document.getElementById('grid');
    $grid.innerHTML = groups.map(g => renderAdminBlock(g, availableSet, bookings, todayStr)).join('');

    $grid.querySelectorAll('.slot').forEach(el => {
      el.addEventListener('click', () => onSlotClick(el));
    });
  }

  function renderAdminBlock(group, availableSet, bookings, todayStr) {
    const { startHour, endHour, dates } = group;
    const times = slotTimes(startHour, endHour);
    const cols = `72px repeat(${dates.length}, minmax(0, 1fr))`;
    const parts = [];

    parts.push(`<div class="grid-block" style="grid-template-columns: ${cols}; --cols: ${dates.length};">`);

    parts.push('<div class="cell head"></div>');
    dates.forEach((d, i) => {
      const h = formatDayHeader(d);
      const last = i === dates.length - 1 ? 'last-col' : '';
      parts.push(`<div class="cell head ${d === todayStr ? 'today' : ''} ${last}">
        <div class="dow">${h.dow}</div>
        <div class="dnum">${h.dnum}</div>
      </div>`);
    });

    times.forEach(t => {
      parts.push(`<div class="cell time-label">${formatTimeLabel(t)}</div>`);
      dates.forEach((d, i) => {
        const last = i === dates.length - 1 ? 'last-col' : '';
        const key = d + '|' + t;
        const booking = bookings[key];
        let cls;
        let label = '';
        if (booking) { cls = 'booked'; label = escapeHtml(booking.name); }
        else if (availableSet.has(key)) cls = 'available';
        else cls = 'locked';
        parts.push(`<div class="cell ${last}"><div class="slot ${cls}" data-date="${d}" data-time="${t}">${label}</div></div>`);
      });
    });

    parts.push('</div>');
    return parts.join('');
  }

  async function onSlotClick(el) {
    const date = el.dataset.date;
    const time = el.dataset.time;
    const key = date + '|' + time;

    if (el.classList.contains('booked')) {
      openBookingDetail(date, time);
      return;
    }

    // Book-on-behalf mode: only available slots are actionable.
    if (state.clickMode === 'book') {
      if (el.classList.contains('available')) {
        openAdminBookingModal(date, time);
      }
      return;
    }

    // Schedule mode: toggle availability.
    const isAvail = el.classList.contains('available');
    const willBe = !isAvail;
    // Optimistic UI
    el.classList.toggle('available', willBe);
    el.classList.toggle('locked', !willBe);
    const res = await API.adminSetSlot(state.pin, date, time, willBe);
    if (res.error) {
      showBanner('error', res.error);
      // revert
      el.classList.toggle('available', !willBe);
      el.classList.toggle('locked', willBe);
      return;
    }
    // Update local state
    if (willBe) state.week.available.push(key);
    else state.week.available = state.week.available.filter(k => k !== key);
  }

  async function bulkSetWeek(available) {
    const cfg = state.config;
    const times = slotTimes(cfg.start_hour, cfg.end_hour);
    const dates = state.week.dates;
    const bookings = state.week.bookings;
    const slots = [];
    dates.forEach(d => {
      times.forEach(t => {
        const key = d + '|' + t;
        if (bookings[key]) return; // never touch booked slots
        slots.push({ date: d, time: t, available });
      });
    });
    const res = await API.adminSetWeek(state.pin, state.weekStart, slots);
    if (res.error) { showBanner('error', res.error); return; }
    load();
  }

  function openAdminBookingModal(date, time) {
    $modal.innerHTML = `
      <div class="modal-backdrop" id="mb">
        <div class="modal" role="dialog" aria-modal="true">
          <h2>Book on behalf</h2>
          <div class="slot-label">${escapeHtml(formatFullDate(date))} at ${formatTimeLabel(time)}</div>

          <div class="field">
            <label>Name <span class="required">*</span></label>
            <input id="f-name" autofocus autocomplete="name" />
          </div>
          <div class="field">
            <label>Phone <span style="color:var(--muted); font-weight:400;">(optional)</span></label>
            <input id="f-phone" type="tel" inputmode="numeric" autocomplete="tel" maxlength="14" placeholder="(555) 555-5555" />
          </div>
          <div class="field">
            <label>Team <span style="color:var(--muted); font-weight:400;">(optional)</span></label>
            <input id="f-team" />
          </div>

          <div id="f-err"></div>

          <div class="modal-actions">
            <button class="btn" id="f-cancel" type="button">Cancel</button>
            <button class="btn btn-primary" id="f-save" type="button">Save booking</button>
          </div>
        </div>
      </div>
    `;

    const close = () => { $modal.innerHTML = ''; };
    document.getElementById('f-cancel').onclick = close;
    document.getElementById('mb').addEventListener('click', e => { if (e.target.id === 'mb') close(); });

    const $phone = document.getElementById('f-phone');
    $phone.addEventListener('input', () => { $phone.value = formatPhone($phone.value); });

    document.getElementById('f-save').onclick = async () => {
      const name = document.getElementById('f-name').value.trim();
      const phone = $phone.value.trim();
      const team = document.getElementById('f-team').value.trim();
      const $err = document.getElementById('f-err');
      $err.innerHTML = '';
      if (!name) {
        $err.innerHTML = `<div class="banner banner-error">Name is required.</div>`;
        return;
      }
      if (phone && phone.replace(/\D/g, '').length !== 10) {
        $err.innerHTML = `<div class="banner banner-error">If filled in, phone must be 10 digits.</div>`;
        return;
      }
      const $btn = document.getElementById('f-save');
      $btn.disabled = true;
      $btn.textContent = 'Saving…';
      const res = await API.adminBook(state.pin, date, time, name, phone, team);
      if (res.error) {
        $err.innerHTML = `<div class="banner banner-error">${escapeHtml(res.error)}</div>`;
        $btn.disabled = false;
        $btn.textContent = 'Save booking';
        return;
      }
      close();
      showBanner('success', `Booked ${name} for ${formatFullDate(date)} at ${formatTimeLabel(time)}.`);
      load();
    };
  }

  async function openBookingDetail(date, time) {
    const res = await API.adminGetBookings(state.pin, state.weekStart);
    if (res.error) { showBanner('error', res.error); return; }
    const booking = (res.bookings || []).find(b => b.date === date && b.time === time);
    if (!booking) { showBanner('error', 'Booking not found'); return; }

    $modal.innerHTML = `
      <div class="modal-backdrop" id="mb">
        <div class="modal" role="dialog" aria-modal="true">
          <h2>Booking Details</h2>
          <div class="slot-label">${escapeHtml(formatFullDate(date))} at ${formatTimeLabel(time)}</div>

          <div class="detail-row"><div class="k">Name</div><div class="v">${escapeHtml(booking.name)}</div></div>
          <div class="detail-row"><div class="k">Phone</div><div class="v"><a href="tel:${escapeAttr(booking.phone)}">${escapeHtml(booking.phone)}</a></div></div>
          <div class="detail-row"><div class="k">Team</div><div class="v">${booking.team ? escapeHtml(booking.team) : '<span style="color:var(--muted)">—</span>'}</div></div>
          <div class="detail-row"><div class="k">Booked at</div><div class="v">${escapeHtml(formatTimestamp(booking.timestamp))}</div></div>

          <div class="modal-actions">
            <button class="btn btn-danger" id="f-delete">Cancel booking</button>
            <button class="btn btn-primary" id="f-close">Close</button>
          </div>
        </div>
      </div>
    `;
    const close = () => { $modal.innerHTML = ''; };
    document.getElementById('f-close').onclick = close;
    document.getElementById('mb').addEventListener('click', e => { if (e.target.id === 'mb') close(); });
    document.getElementById('f-delete').onclick = async () => {
      if (!confirm(`Cancel ${booking.name}'s booking on ${formatFullDate(date)} at ${formatTimeLabel(time)}?`)) return;
      const r = await API.adminDeleteBooking(state.pin, date, time);
      if (r.error) { showBanner('error', r.error); return; }
      close();
      showBanner('success', 'Booking canceled.');
      load();
    };
  }

  // ---------- Bookings list ----------

  async function renderBookingList() {
    document.getElementById('blRange').textContent = formatRange(state.blWeekStart);
    const $list = document.getElementById('bookingList');
    $list.innerHTML = '<div class="booking-empty">Loading…</div>';
    const res = await API.adminGetBookings(state.pin, state.blWeekStart);
    if (res.error) { $list.innerHTML = `<div class="booking-empty">${escapeHtml(res.error)}</div>`; return; }
    const bookings = res.bookings || [];
    if (!bookings.length) {
      $list.innerHTML = '<div class="booking-empty">No bookings this week.</div>';
      return;
    }
    // Group by date
    const byDate = {};
    bookings.forEach(b => { (byDate[b.date] = byDate[b.date] || []).push(b); });
    const dates = Object.keys(byDate).sort();
    const parts = [];
    dates.forEach(d => {
      parts.push(`<div class="booking-list-day">${escapeHtml(formatFullDate(d))}</div>`);
      byDate[d].forEach(b => {
        parts.push(`
          <div class="booking-row" data-date="${b.date}" data-time="${b.time}">
            <div class="time">${formatTimeLabel(b.time)}</div>
            <div class="name"><strong>${escapeHtml(b.name)}</strong></div>
            <div class="phone"><a href="tel:${escapeAttr(b.phone)}">${escapeHtml(b.phone)}</a></div>
            <div class="team">${b.team ? escapeHtml(b.team) : '<span class="muted">no team</span>'}</div>
            <div><button class="btn btn-ghost" data-act="view">View</button></div>
          </div>
        `);
      });
    });
    $list.innerHTML = parts.join('');
    $list.querySelectorAll('button[data-act="view"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = btn.closest('.booking-row');
        openBookingDetail(row.dataset.date, row.dataset.time);
      });
    });
  }

  // ---------- Settings ----------

  async function renderSettings() {
    const $list = document.getElementById('settingsList');
    $list.innerHTML = '<div class="booking-empty">Loading…</div>';
    const cfg = await API.adminGetConfig(state.pin);
    if (cfg.error) { $list.innerHTML = `<div class="booking-empty">${escapeHtml(cfg.error)}</div>`; return; }

    const published = String(cfg.site_published).toLowerCase() === 'true' || cfg.site_published === true;
    const noGaps = String(cfg.no_gaps).toLowerCase() === 'true' || cfg.no_gaps === true;
    const viewOnly = String(cfg.view_only).toLowerCase() === 'true' || cfg.view_only === true;

    $list.innerHTML = `
      <div class="setting-row">
        <div>
          <div class="label">Site published</div>
          <div class="desc">When on, consumers can see open slots and book. When off, they see a “not yet open” message.</div>
        </div>
        <label class="switch">
          <input type="checkbox" id="s-pub" ${published ? 'checked' : ''} />
          <span class="slider"></span>
        </label>
      </div>

      <div class="setting-row">
        <div>
          <div class="label">No gaps</div>
          <div class="desc">When on, consumers can only book slots adjacent to existing bookings (after the first booking in a contiguous block). Prevents holes in your schedule.</div>
        </div>
        <label class="switch">
          <input type="checkbox" id="s-nogaps" ${noGaps ? 'checked' : ''} />
          <span class="slider"></span>
        </label>
      </div>

      <div class="setting-row">
        <div>
          <div class="label">View only</div>
          <div class="desc">When on, consumers can see the schedule but cannot book. You (admin) can still book on behalf via the Book mode.</div>
        </div>
        <label class="switch">
          <input type="checkbox" id="s-viewonly" ${viewOnly ? 'checked' : ''} />
          <span class="slider"></span>
        </label>
      </div>

      <div class="setting-row">
        <div>
          <div class="label">Advance-booking window (days)</div>
          <div class="desc">0 = same-day OK, 1 = earliest is tomorrow, 2 = earliest is day after tomorrow.</div>
        </div>
        <input type="number" min="0" max="30" id="s-adv" value="${escapeAttr(cfg.advance_days)}" />
      </div>

      <div class="setting-row" style="display:block;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:16px; margin-bottom: 12px;">
          <div>
            <div class="label">Hours per day</div>
            <div class="desc">Hours run from start (inclusive, 0–23) to end (exclusive, 1–24). Days that share the same hours are rendered as a single column group.</div>
          </div>
          <button type="button" class="btn btn-ghost" id="s-copy-weekday">Copy Mon → Tue–Fri</button>
        </div>
        <div class="day-hours-grid">
          ${['mon','tue','wed','thu','fri','sat','sun'].map(d => `
            <div class="day-hours-row">
              <span class="day-name">${d.charAt(0).toUpperCase() + d.slice(1)}</span>
              <input type="number" min="0" max="23" data-day="${d}" data-key="start" value="${escapeAttr(getCfgHour(cfg, d, 'start', 8))}" />
              <span class="dash">–</span>
              <input type="number" min="1" max="24" data-day="${d}" data-key="end" value="${escapeAttr(getCfgHour(cfg, d, 'end', 21))}" />
            </div>
          `).join('')}
        </div>
      </div>

      <div class="setting-row">
        <div>
          <div class="label">Admin PIN</div>
          <div class="desc">Changing this will sign you out on other devices.</div>
        </div>
        <input type="text" id="s-pin" value="${escapeAttr(cfg.admin_pin)}" />
      </div>

      <div style="display:flex; justify-content:flex-end; gap:8px;">
        <button class="btn btn-primary" id="s-save">Save settings</button>
      </div>
    `;

    document.getElementById('s-save').addEventListener('click', saveSettings);
    document.getElementById('s-copy-weekday').addEventListener('click', () => {
      const monStart = document.querySelector('.day-hours-row input[data-day="mon"][data-key="start"]').value;
      const monEnd = document.querySelector('.day-hours-row input[data-day="mon"][data-key="end"]').value;
      ['tue','wed','thu','fri'].forEach(d => {
        document.querySelector(`.day-hours-row input[data-day="${d}"][data-key="start"]`).value = monStart;
        document.querySelector(`.day-hours-row input[data-day="${d}"][data-key="end"]`).value = monEnd;
      });
    });
  }

  function getCfgHour(cfg, day, key, fallback) {
    const direct = cfg[day + '_' + key];
    if (direct !== undefined && direct !== null && direct !== '') return direct;
    const legacy = key === 'start' ? cfg.start_hour : cfg.end_hour;
    if (legacy !== undefined && legacy !== null && legacy !== '') return legacy;
    return fallback;
  }

  async function saveSettings() {
    const pub = document.getElementById('s-pub').checked;
    const adv = parseInt(document.getElementById('s-adv').value, 10);
    const pin = document.getElementById('s-pin').value.trim();

    if (isNaN(adv) || adv < 0) return showBanner('error', 'Advance days must be 0 or more.');
    if (!pin) return showBanner('error', 'PIN cannot be empty.');

    const noGaps = document.getElementById('s-nogaps').checked;
    const viewOnly = document.getElementById('s-viewonly').checked;

    // Per-day hours
    const days = ['mon','tue','wed','thu','fri','sat','sun'];
    const dayHourPairs = [];
    for (const d of days) {
      const sh = parseInt(document.querySelector(`.day-hours-row input[data-day="${d}"][data-key="start"]`).value, 10);
      const eh = parseInt(document.querySelector(`.day-hours-row input[data-day="${d}"][data-key="end"]`).value, 10);
      if (isNaN(sh) || sh < 0 || sh > 23) return showBanner('error', `${d.toUpperCase()} start hour must be 0–23.`);
      if (isNaN(eh) || eh <= sh || eh > 24) return showBanner('error', `${d.toUpperCase()} end hour must be greater than start hour.`);
      dayHourPairs.push([d + '_start', String(sh)]);
      dayHourPairs.push([d + '_end', String(eh)]);
    }

    const steps = [
      ['site_published', String(pub)],
      ['no_gaps', String(noGaps)],
      ['view_only', String(viewOnly)],
      ['advance_days', String(adv)],
      ...dayHourPairs,
      ['admin_pin', pin]
    ];

    for (const [k, v] of steps) {
      const r = await API.adminSetConfig(state.pin, k, v);
      if (r.error) { showBanner('error', `Failed to save ${k}: ${r.error}`); return; }
    }

    // If PIN changed, update session
    if (pin !== state.pin) {
      state.pin = pin;
      sessionStorage.setItem(SESSION_KEY, pin);
    }
    showBanner('success', 'Settings saved.');
    load();
  }

  // ---------- Utilities ----------

  function showBanner(kind, msg) {
    $banner.innerHTML = `<div class="banner banner-${kind}">${escapeHtml(msg)}</div>`;
    setTimeout(() => { if ($banner.firstChild) $banner.innerHTML = ''; }, 4000);
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }
  function escapeAttr(s) { return escapeHtml(s); }

  function formatTimestamp(ts) {
    if (!ts) return '—';
    const d = new Date(ts);
    if (isNaN(d.getTime())) return String(ts);
    return d.toLocaleString();
  }

  // ---------- Boot ----------

  if (state.pin) {
    // Verify still-valid in case PIN was rotated elsewhere
    API.verifyPin(state.pin).then(r => {
      if (r && r.ok) showApp();
      else { sessionStorage.removeItem(SESSION_KEY); state.pin = ''; showLogin(); }
    });
  } else {
    showLogin();
  }
})();
