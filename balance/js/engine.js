(() => {
/* Balance — pure logic: dates, occurrences, timeline events, flags, actions.
   No DOM here. Everything takes plain rows and returns plain objects. */

const DAY = 86400000;

const D = {
  parse(s) { if (!s) return null; const [y, m, d] = String(s).slice(0, 10).split('-').map(Number); return new Date(y, m - 1, d); },
  iso(dt) { const y = dt.getFullYear(), m = String(dt.getMonth() + 1).padStart(2, '0'), d = String(dt.getDate()).padStart(2, '0'); return `${y}-${m}-${d}`; },
  today() { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate()); },
  addDays(dt, n) { const x = new Date(dt); x.setDate(x.getDate() + n); return x; },
  // add months keeping the anchor day, clamped to month length (Jan 31 → Feb 28)
  addMonths(dt, n, anchorDay = dt.getDate()) {
    const y = dt.getFullYear(), m = dt.getMonth() + n;
    const last = new Date(y, m + 1, 0).getDate();
    return new Date(y, m, Math.min(anchorDay, last));
  },
  diffDays(a, b) { return Math.round((a - b) / DAY); },
  monthKey(dt) { return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`; },
  monthStart(dt) { return new Date(dt.getFullYear(), dt.getMonth(), 1); },
  monthEnd(dt) { return new Date(dt.getFullYear(), dt.getMonth() + 1, 0); },
};

const money = (n, cents = true) => (n < 0 ? '−' : '') + '$' + Math.abs(n).toLocaleString('en-US',
  { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 });

function monthlyEq(r) {
  return Number(r.amount || 0) * (CADENCE[r.cadence]?.perMonth ?? 1);
}

/* Amount actually charged on a given date (promo price changes apply) */
function amountOn(r, dt) {
  const promoEnd = D.parse(r.promo_end_date);
  if (promoEnd && r.promo_amount != null && r.promo_amount !== '' && dt >= promoEnd) return Number(r.promo_amount);
  return Number(r.amount || 0);
}

/* Is the charge live on this date given status / start / end / pause? */
function chargesOn(r, dt) {
  const today = D.today();
  const start = D.parse(r.start_date), end = D.parse(r.end_date);
  if (start && dt < start) return false;
  if (end && dt > end) return false;
  if (r.status === 'cancelled') {
    const c = D.parse(r.cancelled_on) || today;
    return dt < c;
  }
  if (r.status === 'paused') {
    const until = D.parse(r.paused_until);
    if (dt >= today && (!until || dt < until)) return false;
  }
  return true;
}

/* Billing dates of r between from..to (inclusive) */
function occurrences(r, from, to) {
  const anchor = D.parse(r.anchor_date);
  if (!anchor) return [];
  const step = { weekly: [0, 7], monthly: [1, 0], quarterly: [3, 0], yearly: [12, 0] }[r.cadence] || [1, 0];
  const at = k => step[0] ? D.addMonths(anchor, k * step[0], anchor.getDate()) : D.addDays(anchor, k * step[1]);
  // jump close to `from` then walk
  const approxDays = step[0] ? step[0] * 30.44 : step[1];
  let k = Math.floor((from - anchor) / DAY / approxDays) - 1;
  while (at(k) > from) k--;
  const out = [];
  for (let guard = 0; guard < 600; guard++, k++) {
    const dt = at(k);
    if (dt > to) break;
    if (dt >= from && chargesOn(r, dt)) out.push({ date: dt, amount: amountOn(r, dt) });
  }
  return out;
}

function nextCharge(r, after = D.today()) {
  const occ = occurrences(r, after, D.addDays(after, 400));
  return occ[0] || null;
}

/* ── Timeline events ─────────────────────────────── */
function buildEvents(recurring, spend, from, to) {
  const ev = [];
  const inRange = dt => dt && dt >= from && dt <= to;
  for (const r of recurring) {
    for (const o of occurrences(r, from, to)) {
      ev.push({ kind: 'charge', date: o.date, amount: o.amount, rec: r, title: r.name });
    }
    const ms = [
      ['renewal', r.renewal_date, `${r.name} renews`],
      ['cancel-by', r.cancel_by, `Decide on ${r.name} — cancel-by date`],
      ['promo', r.promo_end_date, `${r.name} promo ends → ${r.promo_amount ? money(Number(r.promo_amount)) : 'new price'}`],
      ['drop', r.end_date, `${r.name} payments end — saves ${money(monthlyEq(r))}/mo`],
      ['resume', r.status === 'paused' ? r.paused_until : null, `${r.name} resumes`],
    ];
    for (const [kind, s, title] of ms) {
      const dt = D.parse(s);
      if (inRange(dt) && !(kind !== 'drop' && r.status === 'cancelled')) ev.push({ kind, date: dt, rec: r, title });
    }
  }
  for (const s of spend) {
    const dt = D.parse(s.spent_on);
    if (inRange(dt)) ev.push({ kind: 'spend', date: dt, amount: Number(s.amount), spend: s, title: s.merchant || SPEND_CATS[s.category]?.label || 'Spending' });
  }
  const order = { 'cancel-by': 0, promo: 1, renewal: 2, drop: 3, resume: 4, charge: 5, spend: 6 };
  ev.sort((a, b) => a.date - b.date || order[a.kind] - order[b.kind]);
  return ev;
}

/* ── "Doesn't make sense" flags per recurring charge ── */
function flagsFor(r, all) {
  if (r.status === 'cancelled') return [];
  const cfg = window.BALANCE_CONFIG;
  const f = [];
  const today = D.today();
  if (r.worth && r.worth <= 2) f.push({ key: 'worth', text: `Rated ${r.worth}/5 worth it` });
  if (!String(r.justification || '').trim()) f.push({ key: 'nojust', text: 'No justification written' });
  const lu = D.parse(r.last_used);
  if (lu && D.diffDays(today, lu) >= cfg.UNUSED_DAYS) f.push({ key: 'unused', text: `Not used in ${D.diffDays(today, lu)} days` });
  if (r.prev_amount && Number(r.amount) > Number(r.prev_amount)) f.push({ key: 'hike', text: `Price went up ${money(Number(r.amount) - Number(r.prev_amount))}` });
  if (r.verdict === 'cancel' && r.status === 'active') f.push({ key: 'zombie', text: 'Marked “cancel” but still paying' });
  if (r.category === 'streaming' && r.status === 'active') {
    const n = all.filter(x => x.category === 'streaming' && x.status === 'active').length;
    if (n > cfg.STREAMING_STACK_LIMIT) f.push({ key: 'stack', text: `${n} streaming services at once — rotate?` });
  }
  return f;
}

/* ── Dashboard actions: things to do something about ── */
function buildActions(recurring, spend, targets, dismissed = {}) {
  const cfg = window.BALANCE_CONFIG;
  const today = D.today();
  const horizon = D.addDays(today, cfg.ACTION_HORIZON_DAYS);
  const acts = [];
  const sev = days => days < 0 ? 'critical' : days <= 3 ? 'critical' : days <= 7 ? 'serious' : 'warning';
  const push = (a) => { if (!dismissed[a.key]) acts.push(a); };

  for (const r of recurring) {
    if (r.status === 'cancelled') continue;
    const me = monthlyEq(r);
    const check = (field, kind, mk) => {
      const dt = D.parse(r[field]);
      if (!dt || dt > horizon) return;
      const days = D.diffDays(dt, today);
      const a = mk(days, dt);
      if (a) push({ kind, rec: r, date: dt, days, severity: a.severity || sev(days), key: `${r.id}:${kind}:${r[field]}`, ...a });
    };
    check('cancel_by', 'cancel-by', (days) => ({
      title: days < 0 ? `Cancel-by date passed for ${r.name}` : `Cancel ${r.name} ${rel(days)}`,
      detail: `Decide before it bills again · ${money(me)}/mo`, cta: 'cancel', severity: days < 0 ? 'critical' : sev(days),
    }));
    check('renewal_date', 'renewal', (days) => days < -3 ? null : ({
      title: `${r.name} renews ${rel(days)}`,
      detail: `${money(Number(r.amount))}/${CADENCE[r.cadence].label} — shop around or cancel before it locks in`, cta: 'edit',
    }));
    check('promo_end_date', 'promo', (days) => days < -3 ? null : ({
      title: `${r.name} price jumps ${rel(days)}`,
      detail: r.promo_amount ? `${money(Number(r.amount))} → ${money(Number(r.promo_amount))} (+${money(Number(r.promo_amount) - Number(r.amount))})` : 'Intro price ends',
      cta: 'edit',
    }));
    check('end_date', 'drop', (days) => days < -30 ? null : ({
      title: days < 0 ? `Confirm ${r.name} actually stopped` : `${r.name} payments end ${rel(days)}`,
      detail: `Frees up ${money(me)}/mo — make sure it doesn't keep billing`, cta: 'edit', severity: 'good',
    }));
    if (r.status === 'paused') check('paused_until', 'resume', (days) => days > 14 ? null : ({
      title: `${r.name} resumes ${rel(days)}`, detail: 'Still want it back? Extend the pause or cancel.', cta: 'edit',
    }));
    // big yearly charge coming
    if (r.cadence === 'yearly' && r.status === 'active') {
      const nc = nextCharge(r);
      if (nc && nc.date <= horizon && !(r.renewal_date && D.iso(nc.date) === r.renewal_date)) {
        const days = D.diffDays(nc.date, today);
        push({ kind: 'annual', rec: r, date: nc.date, days, severity: sev(days), key: `${r.id}:annual:${D.iso(nc.date)}`,
          title: `${r.name} annual charge ${rel(days)}`, detail: `${money(nc.amount)} hits at once`, cta: 'edit' });
      }
    }
    if (r.verdict === 'cancel' && r.status === 'active') {
      const nc = nextCharge(r);
      const days = nc ? D.diffDays(nc.date, today) : 99;
      push({ kind: 'zombie', rec: r, date: nc?.date || today, days, severity: days <= 7 ? 'critical' : 'serious', key: `${r.id}:zombie`,
        title: `You marked ${r.name} “cancel” — still paying`, detail: `Next charge ${nc ? rel(days) : '—'} · ${money(me * 12, false)}/yr`, cta: 'cancel' });
    }
  }

  // spending over comfort targets this month
  const mk = D.monthKey(today);
  const totals = {};
  for (const s of spend) if (s.spent_on?.slice(0, 7) === mk) totals[s.category] = (totals[s.category] || 0) + Number(s.amount);
  for (const [cat, target] of Object.entries(targets || {})) {
    if (!target || !totals[cat]) continue;
    const pct = totals[cat] / target;
    if (pct >= 0.9) push({ kind: 'over', cat, date: today, days: 0, severity: pct >= 1 ? 'serious' : 'warning', key: `over:${cat}:${mk}:${pct >= 1 ? 1 : 0}`,
      title: `${SPEND_CATS[cat]?.label || cat} ${pct >= 1 ? 'over' : 'near'} your comfort level`,
      detail: `${money(totals[cat], false)} of ${money(target, false)} this month (${Math.round(pct * 100)}%)`, cta: 'spend' });
  }

  const rank = { critical: 0, serious: 1, warning: 2, good: 3 };
  acts.sort((a, b) => rank[a.severity] - rank[b.severity] || a.days - b.days);
  return acts;
}

function rel(days) {
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days === -1) return 'yesterday';
  if (days < 0) return `${-days} days ago`;
  if (days < 14) return `in ${days} days`;
  return `in ${Math.round(days / 7)} weeks`;
}

/* Monthly totals for a range of months: { key, recurring, spend } */
function monthSeries(recurring, spend, monthsBack, monthsFwd) {
  const today = D.today();
  const out = [];
  for (let i = -monthsBack; i <= monthsFwd; i++) {
    const m0 = D.addMonths(D.monthStart(today), i, 1);
    const m1 = D.monthEnd(m0);
    let rec = 0;
    for (const r of recurring) for (const o of occurrences(r, m0, m1)) rec += o.amount;
    let sp = 0;
    const key = D.monthKey(m0);
    for (const s of spend) if (s.spent_on?.slice(0, 7) === key) sp += Number(s.amount);
    out.push({ key, date: m0, recurring: rec, spend: sp, future: m0 > today, current: i === 0 });
  }
  return out;
}

/* Money no longer going out: cancelled since cancelled_on + paused months */
function savedSoFar(recurring) {
  const today = D.today();
  let total = 0;
  for (const r of recurring) {
    if (r.status !== 'cancelled' || !r.cancelled_on) continue;
    const c = D.parse(r.cancelled_on);
    const ghost = { ...r, status: 'active', end_date: null };
    for (const o of occurrences(ghost, c, today)) total += o.amount;
  }
  return total;
}

window.Engine = { D, money, monthlyEq, occurrences, nextCharge, buildEvents, flagsFor, buildActions, monthSeries, savedSoFar, rel };
})();
