(function () {
  const S = window.Schedule;
  const cfg = window.SCHEDULE_CONFIG;

  document.getElementById('page-title').textContent = `${cfg.PERSON_NAME}'s Availability`;
  document.title = `${cfg.PERSON_NAME}'s Lesson Availability`;

  const content = document.getElementById('content');
  const weekLabelEl = document.getElementById('week-label');
  const todayBtn = document.getElementById('today-btn');
  const prevBtn = document.getElementById('prev-week');
  const nextBtn = document.getElementById('next-week');

  let currentWeekStart = S.sundayOf(new Date());
  let supabase;

  try {
    supabase = S.makeSupabase();
  } catch (e) {
    showError('Could not connect to the schedule. Check your config.');
    return;
  }

  prevBtn.addEventListener('click', () => {
    currentWeekStart = S.addDays(currentWeekStart, -7);
    render();
  });
  nextBtn.addEventListener('click', () => {
    currentWeekStart = S.addDays(currentWeekStart, 7);
    render();
  });
  todayBtn.addEventListener('click', () => {
    currentWeekStart = S.sundayOf(new Date());
    render();
  });

  function showError(msg) {
    content.innerHTML = `<div class="error">${msg}</div>`;
  }

  function showLoading() {
    content.innerHTML = `<div class="loading"><div class="spinner"></div>Loading availability…</div>`;
  }

  function renderDay(date, overridesForDay) {
    const today = S.sameYmd(date, new Date());
    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
    const ranges = S.collapseRanges(overridesForDay || {});

    // Filter to displayable: available + maybe (skip blocked, skip available if entire day is available with no maybe/blocked? show "All day available" then).
    const display = ranges.filter(r => r.state === 'available' || r.state === 'maybe');

    // If no overrides at all, the entire day is one big "available" range — show "All day available".
    const hasOverrides = overridesForDay && Object.keys(overridesForDay).length > 0;

    let body = '';
    if (!hasOverrides) {
      body = `
        <div class="range available">
          <span class="range-dot"></span>
          <span>All day · ${S.formatSlotStart(0)} – ${S.formatSlotEnd(S.SLOTS_PER_DAY - 1)}</span>
        </div>`;
    } else if (display.length === 0) {
      body = `<div class="no-availability">Not available this day</div>`;
    } else {
      body = `<div class="range-list">` + display.map(r => {
        const label = S.formatRange(r);
        if (r.state === 'maybe') {
          return `<div class="range maybe">
            <span class="range-dot"></span>
            <span>${label}</span>
            <span class="range-suffix">Ask</span>
          </div>`;
        }
        return `<div class="range available">
          <span class="range-dot"></span>
          <span>${label}</span>
        </div>`;
      }).join('') + `</div>`;
    }

    return `
      <div class="day-card ${today ? 'is-today' : ''} ${isPast && !today ? 'is-past' : ''}">
        <div class="day-header">
          <div>
            <div class="day-name">${S.dayName(date)}${today ? '<span class="today-badge">Today</span>' : ''}</div>
          </div>
          <div class="day-date">${S.prettyDate(date)}</div>
        </div>
        ${body}
      </div>
    `;
  }

  async function render() {
    weekLabelEl.textContent = S.weekLabel(currentWeekStart);
    const days = S.weekDates(currentWeekStart);
    const startYmd = S.ymd(days[0]);
    const endYmd = S.ymd(days[6]);
    showLoading();

    try {
      const overrides = await S.fetchOverrides(supabase, startYmd, endYmd);
      const cards = days.map(d => renderDay(d, overrides[S.ymd(d)] || {})).join('');
      content.innerHTML = `<div class="days-grid">${cards}</div>`;
    } catch (e) {
      console.error(e);
      showError('Could not load availability. Try again in a moment.');
    }
  }

  render();
})();
