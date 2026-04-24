(function () {
  const state = {
    weekStart: ymd(startOfWeek(new Date())),
    week: null
  };

  const $grid = document.getElementById('grid');
  const $range = document.getElementById('weekRange');
  const $banner = document.getElementById('banner');
  const $modal = document.getElementById('modalRoot');

  document.getElementById('prevWeek').addEventListener('click', () => shiftWeek(-7));
  document.getElementById('nextWeek').addEventListener('click', () => shiftWeek(7));
  document.getElementById('todayBtn').addEventListener('click', () => {
    state.weekStart = ymd(startOfWeek(new Date()));
    load();
  });

  function shiftWeek(delta) {
    state.weekStart = ymd(addDays(parseYMD(state.weekStart), delta));
    load();
  }

  async function load() {
    $range.textContent = formatRange(state.weekStart);
    $grid.innerHTML = '<div style="padding:40px; grid-column:1/-1; text-align:center; color:var(--muted);">Loading…</div>';
    const res = await API.getWeek(state.weekStart);
    if (res.error) {
      $grid.innerHTML = '';
      showBanner('error', res.error);
      return;
    }
    state.week = res;
    renderBanner();
    renderGrid();
  }

  function renderBanner() {
    const cfg = state.week.config;
    $banner.innerHTML = '';
    if (!cfg.site_published) {
      showBanner('warn', 'Booking is not open yet — please check back later.');
    }
  }

  function showBanner(kind, msg) {
    $banner.innerHTML = `<div class="banner banner-${kind}">${escapeHtml(msg)}</div>`;
  }

  function renderGrid() {
    const cfg = state.week.config;
    const dates = state.week.dates;
    const times = slotTimes(cfg.start_hour, cfg.end_hour);
    const availableSet = new Set(state.week.available);
    const bookings = state.week.bookings;
    const todayStr = todayYMD();

    const parts = [];

    // Header row: empty corner + 7 day headers
    parts.push('<div class="cell head"></div>');
    dates.forEach(d => {
      const h = formatDayHeader(d);
      const today = d === todayStr;
      parts.push(`<div class="cell head ${today ? 'today' : ''}">
        <div class="dow">${h.dow}</div>
        <div class="dnum">${h.dnum}</div>
      </div>`);
    });

    // Time rows
    times.forEach(t => {
      parts.push(`<div class="cell time-label">${formatTimeLabel(t)}</div>`);
      dates.forEach(d => {
        const key = d + '|' + t;
        const cls = classifySlot(d, t, availableSet, bookings, cfg);
        const booking = bookings[key];
        const label = cls === 'booked' ? escapeHtml(booking.name) : '';
        parts.push(`<div class="cell"><div class="slot ${cls}" data-date="${d}" data-time="${t}">${label}</div></div>`);
      });
    });

    $grid.innerHTML = parts.join('');

    $grid.querySelectorAll('.slot.available').forEach(el => {
      el.addEventListener('click', () => openBookingModal(el.dataset.date, el.dataset.time));
    });
  }

  function classifySlot(date, time, availableSet, bookings, cfg) {
    const key = date + '|' + time;
    if (bookings[key]) return 'booked';
    if (isPast(date)) return 'past';
    if (!cfg.site_published) return 'blocked';
    if (isBlockedByAdvance(date, cfg.advance_days)) return 'blocked';
    if (availableSet.has(key)) return 'available';
    return 'locked';
  }

  function openBookingModal(date, time) {
    $modal.innerHTML = `
      <div class="modal-backdrop" id="mb">
        <div class="modal" role="dialog" aria-modal="true">
          <h2>Book a slot</h2>
          <div class="slot-label">${escapeHtml(formatFullDate(date))} at ${formatTimeLabel(time)}</div>

          <div class="field">
            <label>Name <span class="required">*</span></label>
            <input id="f-name" autofocus autocomplete="name" />
          </div>
          <div class="field">
            <label>Phone <span class="required">*</span></label>
            <input id="f-phone" type="tel" autocomplete="tel" placeholder="(555) 555-5555" />
          </div>
          <div class="field">
            <label>Team <span style="color:var(--muted); font-weight:400;">(optional)</span></label>
            <input id="f-team" />
          </div>

          <div id="f-err"></div>

          <div class="modal-actions">
            <button class="btn" id="f-cancel">Cancel</button>
            <button class="btn btn-primary" id="f-save">Book slot</button>
          </div>
        </div>
      </div>
    `;

    const close = () => { $modal.innerHTML = ''; };
    document.getElementById('f-cancel').onclick = close;
    document.getElementById('mb').addEventListener('click', (e) => {
      if (e.target.id === 'mb') close();
    });

    document.getElementById('f-save').onclick = async () => {
      const name = document.getElementById('f-name').value.trim();
      const phone = document.getElementById('f-phone').value.trim();
      const team = document.getElementById('f-team').value.trim();
      const $err = document.getElementById('f-err');
      $err.innerHTML = '';
      if (!name || !phone) {
        $err.innerHTML = `<div class="banner banner-error">Name and phone are required.</div>`;
        return;
      }
      const $btn = document.getElementById('f-save');
      $btn.disabled = true;
      $btn.textContent = 'Booking…';
      const res = await API.book(date, time, name, phone, team);
      if (res.error) {
        $err.innerHTML = `<div class="banner banner-error">${escapeHtml(res.error)}</div>`;
        $btn.disabled = false;
        $btn.textContent = 'Book slot';
        return;
      }
      close();
      showBanner('success', `Booked ${formatFullDate(date)} at ${formatTimeLabel(time)}.`);
      load();
    };
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  load();
})();
