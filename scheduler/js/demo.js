// Demo / offline backend. Persists to localStorage so the UI is usable
// before the real Apps Script is deployed. Mirrors the Code.gs API.

const DEMO_KEY = 'scheduler-demo-v1';

function demoState() {
  const raw = localStorage.getItem(DEMO_KEY);
  if (raw) return JSON.parse(raw);
  const init = {
    config: {
      admin_pin: '1234',
      advance_days: 1,
      site_published: false,
      no_gaps: false,
      view_only: false,
      start_hour: 8,
      end_hour: 21,
      mon_start: 8, mon_end: 21,
      tue_start: 8, tue_end: 21,
      wed_start: 8, wed_end: 21,
      thu_start: 8, thu_end: 21,
      fri_start: 8, fri_end: 21,
      sat_start: 9, sat_end: 21,
      sun_start: 9, sun_end: 21
    },
    available: {},   // key "date|time" -> true
    bookings: {}     // key "date|time" -> { name, phone, team, timestamp }
  };
  localStorage.setItem(DEMO_KEY, JSON.stringify(init));
  return init;
}

function demoSave(s) { localStorage.setItem(DEMO_KEY, JSON.stringify(s)); }

function demoPublicConfig(s) {
  const intOr = (v, f) => { const n = parseInt(v, 10); return isNaN(n) ? f : n; };
  const startFallback = intOr(s.config.start_hour, 8);
  const endFallback = intOr(s.config.end_hour, 21);
  const days = ['sun','mon','tue','wed','thu','fri','sat'];
  const day_hours = {};
  days.forEach(d => {
    day_hours[d] = {
      start: intOr(s.config[d + '_start'], startFallback),
      end: intOr(s.config[d + '_end'], endFallback)
    };
  });
  return {
    advance_days: parseInt(s.config.advance_days, 10) || 0,
    site_published: !!s.config.site_published,
    no_gaps: !!s.config.no_gaps,
    view_only: !!s.config.view_only,
    start_hour: startFallback,
    end_hour: endFallback,
    day_hours: day_hours
  };
}

function demoApi(action, p) {
  return new Promise(resolve => {
    setTimeout(() => resolve(demoDispatch(action, p)), 60);
  });
}

function demoDispatch(action, p) {
  const s = demoState();
  const pinOK = () => String(p.pin || '') === String(s.config.admin_pin);

  switch (action) {
    case 'getConfig':
      return demoPublicConfig(s);

    case 'getWeek': {
      const dates = weekDates(p.weekStart);
      const dateSet = new Set(dates);
      const available = Object.keys(s.available).filter(k => dateSet.has(k.split('|')[0]));
      const bookings = {};
      Object.keys(s.bookings).forEach(k => {
        if (dateSet.has(k.split('|')[0])) bookings[k] = { name: s.bookings[k].name };
      });
      return {
        weekStart: p.weekStart,
        dates,
        config: demoPublicConfig(s),
        available,
        bookings
      };
    }

    case 'book': {
      const cfg = demoPublicConfig(s);
      if (!cfg.site_published) return { error: 'Booking is not open yet' };
      if (cfg.view_only) return { error: 'Booking is currently view-only' };
      if (!p.name || !String(p.name).trim()) return { error: 'Name is required' };
      const weekMon = ymd(startOfWeek(parseYMD(p.date)));
      if (!isWeekBookable(weekMon)) {
        return { error: `This week isn't open yet — booking opens Sunday, ${formatFullDate(weekOpensOn(weekMon))}.` };
      }
      if (isBlockedByAdvance(p.date, cfg.advance_days)) return { error: 'This slot is not yet open for booking' };
      const key = p.date + '|' + p.time;
      if (!s.available[key]) return { error: 'Slot is not available' };
      if (s.bookings[key]) return { error: 'Slot already booked' };

      if (cfg.no_gaps) {
        const opens = Object.keys(s.available)
          .filter(k => k.startsWith(p.date + '|'))
          .map(k => k.split('|')[1])
          .sort();
        const booked = new Set(
          Object.keys(s.bookings)
            .filter(k => k.startsWith(p.date + '|'))
            .map(k => k.split('|')[1])
        );
        const ok = noGapsBookableTimes(opens, booked);
        if (!ok.has(p.time)) {
          return { error: 'This slot is not currently bookable. An adjacent slot must be booked first.' };
        }
      }
      s.bookings[key] = {
        name: p.name.trim(),
        phone: p.phone.trim(),
        team: (p.team || '').trim(),
        timestamp: new Date().toISOString()
      };
      demoSave(s);
      return { ok: true };
    }

    case 'verifyPin':
      return { ok: pinOK() };

    case 'adminGetConfig':
      if (!pinOK()) return { error: 'Invalid PIN' };
      return Object.assign({}, s.config);

    case 'adminSetConfig': {
      if (!pinOK()) return { error: 'Invalid PIN' };
      let v = p.value;
      if (p.key === 'site_published' || p.key === 'no_gaps') v = (v === true || v === 'true');
      else if (/_start$|_end$/.test(p.key) || p.key === 'advance_days' || p.key === 'start_hour' || p.key === 'end_hour') {
        v = parseInt(v, 10);
      }
      s.config[p.key] = v;
      demoSave(s);
      return { ok: true };
    }

    case 'adminSetSlot': {
      if (!pinOK()) return { error: 'Invalid PIN' };
      const key = p.date + '|' + p.time;
      if (p.available) s.available[key] = true;
      else delete s.available[key];
      demoSave(s);
      return { ok: true };
    }

    case 'adminSetWeek': {
      if (!pinOK()) return { error: 'Invalid PIN' };
      (p.slots || []).forEach(sl => {
        const key = sl.date + '|' + sl.time;
        if (sl.available) s.available[key] = true;
        else delete s.available[key];
      });
      demoSave(s);
      return { ok: true };
    }

    case 'adminGetBookings': {
      if (!pinOK()) return { error: 'Invalid PIN' };
      const dates = new Set(weekDates(p.weekStart));
      const out = [];
      Object.keys(s.bookings).forEach(k => {
        const [date, time] = k.split('|');
        if (!dates.has(date)) return;
        const b = s.bookings[k];
        out.push({ date, time, name: b.name, phone: b.phone, team: b.team, timestamp: b.timestamp });
      });
      out.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
      return { bookings: out };
    }

    case 'adminDeleteBooking': {
      if (!pinOK()) return { error: 'Invalid PIN' };
      const key = p.date + '|' + p.time;
      if (!s.bookings[key]) return { error: 'Booking not found' };
      delete s.bookings[key];
      demoSave(s);
      return { ok: true };
    }

    case 'adminBook': {
      if (!pinOK()) return { error: 'Invalid PIN' };
      if (!p.name || !String(p.name).trim()) return { error: 'Name is required' };
      const key = p.date + '|' + p.time;
      if (!s.available[key]) return { error: 'Slot is not available' };
      if (s.bookings[key]) return { error: 'Slot already booked' };
      s.bookings[key] = {
        name: p.name.trim(),
        phone: (p.phone || '').trim(),
        team: (p.team || '').trim(),
        timestamp: new Date().toISOString()
      };
      demoSave(s);
      return { ok: true };
    }

    default:
      return { error: 'Unknown action: ' + action };
  }
}
