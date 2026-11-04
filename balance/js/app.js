/* Balance — UI + storage (Supabase with auth, or local sample mode) */

const { D, money, monthlyEq, occurrences, nextCharge, buildEvents, flagsFor, buildActions, monthSeries, savedSoFar, rel } = Engine;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtDate = (dt, opts = { month: 'short', day: 'numeric' }) => dt.toLocaleDateString('en-US', opts);
const monthName = dt => dt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

const state = {
  recurring: [], spend: [], targets: {},
  tab: 'dashboard',
  monthCursor: D.monthStart(D.today()),
  timeline: { back: 3, fwd: 12, show: { charge: true, milestone: true, spend: false } },
  recFilter: { status: 'live', verdict: '' },
  spendMonth: D.monthStart(D.today()),
};

/* ────────────────────────────────────────────────
   Storage
──────────────────────────────────────────────── */
const DATE_FIELDS = ['anchor_date', 'start_date', 'end_date', 'renewal_date', 'promo_end_date', 'cancel_by', 'paused_until', 'cancelled_on', 'last_used', 'spent_on'];
const NUM_FIELDS = ['amount', 'prev_amount', 'promo_amount', 'worth'];
function clean(row) {
  const out = { ...row };
  for (const k of DATE_FIELDS) if (k in out && !out[k]) out[k] = null;
  for (const k of NUM_FIELDS) if (k in out) out[k] = out[k] === '' || out[k] == null ? null : Number(out[k]);
  if ('worth_it' in out && !out.worth_it) out.worth_it = null;
  if ('amount' in out && out.amount == null) out.amount = 0;
  return out;
}

let sb = null;
const store = {
  mode: null,
  async load() {
    if (this.mode === 'demo') {
      let db = JSON.parse(localStorage.getItem('balance-demo') || 'null');
      if (!db) { db = buildDemoData(); localStorage.setItem('balance-demo', JSON.stringify(db)); }
      Object.assign(state, { recurring: db.recurring, spend: db.spend, targets: db.targets || {} });
      return;
    }
    const [rec, sp, st] = await Promise.all([
      run(sb.from('balance_recurring').select('*').order('name')),
      run(sb.from('balance_spend').select('*').order('spent_on', { ascending: false })),
      run(sb.from('balance_settings').select('*').eq('id', 1).maybeSingle()),
    ]);
    Object.assign(state, { recurring: rec, spend: sp, targets: st?.targets || {} });
  },
  persistDemo() {
    localStorage.setItem('balance-demo', JSON.stringify({ recurring: state.recurring, spend: state.spend, targets: state.targets }));
    flashSync();
  },
  async upsert(table, row) {
    const list = table === 'recurring' ? state.recurring : state.spend;
    row = clean(row);
    if (this.mode === 'demo') {
      if (!row.id) row.id = 'local-' + Date.now() + Math.random().toString(36).slice(2, 6);
      const i = list.findIndex(x => x.id === row.id);
      if (i >= 0) list[i] = { ...list[i], ...row }; else list.push(row);
      this.persistDemo();
      return;
    }
    const t = 'balance_' + table;
    const { id, created_at, updated_at, ...body } = row;
    const saved = id
      ? await run(sb.from(t).update(body).eq('id', id).select().single())
      : await run(sb.from(t).insert(body).select().single());
    const i = list.findIndex(x => x.id === saved.id);
    if (i >= 0) list[i] = saved; else list.push(saved);
  },
  async remove(table, id) {
    const key = table === 'recurring' ? 'recurring' : 'spend';
    if (this.mode !== 'demo') await run(sb.from('balance_' + table).delete().eq('id', id));
    state[key] = state[key].filter(x => x.id !== id);
    if (this.mode === 'demo') this.persistDemo();
  },
  async saveTargets(targets) {
    state.targets = targets;
    if (this.mode === 'demo') return this.persistDemo();
    await run(sb.from('balance_settings').upsert({ id: 1, targets, updated_at: new Date().toISOString() }));
  },
};

function setSync(s) {
  const el = $('#syncIndicator');
  el.className = `sync-indicator ${s}`;
  el.title = { idle: 'Ready', syncing: 'Saving…', ok: 'Saved ✓', error: 'Save failed' }[s] || '';
}
function flashSync() { setSync('ok'); }

async function run(promise) {
  setSync('syncing');
  const { data, error } = await promise;
  if (error) {
    setSync('error');
    console.error(error);
    if (error.code === 'PGRST205' || error.code === '42P01') {
      showBanner('Balance tables not found. Run <code>balance/setup.sql</code> once in the Supabase SQL editor, then reload.');
    } else if (error.code === '42501' || /row-level security/i.test(error.message)) {
      showBanner('Signed in, but this email isn’t on the household list. Add it to <code>balance_members</code> in Supabase.');
    } else {
      showBanner(`Save failed: ${esc(error.message)}`);
    }
    throw error;
  }
  setSync('ok');
  return data;
}

function showBanner(html) { const b = $('#banner'); b.innerHTML = html; b.classList.remove('hidden'); }
function hideBanner() { $('#banner').classList.add('hidden'); }

/* ────────────────────────────────────────────────
   Boot / auth
──────────────────────────────────────────────── */
async function boot() {
  wireStatic();
  const params = new URLSearchParams(location.search);
  if (params.has('demo') || localStorage.getItem('balance-mode') === 'demo') return startDemo();

  const cfg = window.BALANCE_CONFIG;
  if (typeof supabase === 'undefined') { showLogin('Could not load Supabase. Check your connection — or try sample mode.'); return; }
  sb = supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
  const { data: { session } } = await sb.auth.getSession();
  sb.auth.onAuthStateChange((evt, s) => { if (evt === 'SIGNED_IN' && store.mode !== 'cloud') startCloud(s); });
  if (session) startCloud(session); else showLogin();
}

function showLogin(msg = '') {
  $('#login').classList.remove('hidden');
  $('#app').classList.add('hidden');
  $('#loginMsg').textContent = msg;
}

async function startCloud(session) {
  store.mode = 'cloud';
  $('#login').classList.add('hidden');
  $('#app').classList.remove('hidden');
  $('#modeBadge').classList.add('hidden');
  $('#signOutBtn').title = `Sign out ${session.user.email}`;
  try { await store.load(); hideBanner(); } catch { /* banner shown */ }
  renderAll();
}

async function startDemo() {
  store.mode = 'demo';
  localStorage.setItem('balance-mode', 'demo');
  $('#login').classList.add('hidden');
  $('#app').classList.remove('hidden');
  $('#modeBadge').classList.remove('hidden');
  $('#signOutBtn').title = 'Leave sample mode';
  await store.load();
  renderAll();
}

/* ────────────────────────────────────────────────
   Render
──────────────────────────────────────────────── */
function renderAll() {
  renderDashboard(); renderTimeline(); renderMonth(); renderRecurring(); renderSpending(); renderReview();
  updateReviewBadge();
}

const catOf = r => RECURRING_CATS[r.category] || RECURRING_CATS.other;
const spCatOf = s => SPEND_CATS[s.category] || SPEND_CATS.other;
const live = () => state.recurring.filter(r => r.status !== 'cancelled');
const active = () => state.recurring.filter(r => r.status === 'active');

function getDismissed() { return JSON.parse(localStorage.getItem('balance-dismissed') || '{}'); }
function dismiss(key, days = null) {
  const d = getDismissed(); d[key] = days ? Date.now() + days * 86400000 : true;
  localStorage.setItem('balance-dismissed', JSON.stringify(d));
}
function activeDismissed() {
  const d = getDismissed(), now = Date.now(), out = {};
  for (const [k, v] of Object.entries(d)) if (v === true || v > now) out[k] = true;
  return out;
}

const SEV_ICON = { critical: '⛔', serious: '⚠️', warning: '🔔', good: '✅' };
const SEV_LABEL = { critical: 'Urgent', serious: 'This week', warning: 'Coming up', good: 'Good news' };

/* ── Dashboard ── */
function renderDashboard() {
  const el = $('#tab-dashboard');
  const today = D.today();
  const act = active();
  const perMonth = act.reduce((s, r) => s + monthlyEq(r), 0);
  const mk = D.monthKey(today), lastMk = D.monthKey(D.addMonths(D.monthStart(today), -1, 1));
  const spendIn = k => state.spend.filter(s => s.spent_on?.slice(0, 7) === k).reduce((a, s) => a + Number(s.amount), 0);
  const spThis = spendIn(mk), spLast = spendIn(lastMk);
  // same point last month for a fair comparison
  const dayN = today.getDate();
  const spLastToDate = state.spend.filter(s => s.spent_on?.slice(0, 7) === lastMk && Number(s.spent_on.slice(8, 10)) <= dayN).reduce((a, s) => a + Number(s.amount), 0);
  const flagged = live().filter(r => flagsFor(r, state.recurring).length);
  const leakRec = flagged.filter(r => r.status === 'active').reduce((s, r) => s + monthlyEq(r), 0);
  const leakSpend = state.spend.filter(s => s.spent_on?.slice(0, 7) === mk && s.worth_it === 'no').reduce((a, s) => a + Number(s.amount), 0);
  const saved = savedSoFar(state.recurring);
  const pausedSave = state.recurring.filter(r => r.status === 'paused').reduce((s, r) => s + monthlyEq(r), 0);

  const actions = buildActions(state.recurring, state.spend, state.targets, activeDismissed());
  const delta = spThis - spLastToDate;

  el.innerHTML = `
    <div class="dash-grid">
      <section class="card actions-card">
        <header class="card-head"><h2>Action needed</h2><span class="muted small">next ${BALANCE_CONFIG.ACTION_HORIZON_DAYS} days</span></header>
        ${actions.length ? `<ul class="action-list${state.showAllActions ? '' : ' capped'}">${actions.map(a => actionItem(a)).join('')}</ul>
          ${actions.length > 5 ? `<button class="link" id="toggleActions">${state.showAllActions ? 'Show fewer' : `Show ${actions.length - 5} more`}</button>` : ''}`
          : `<p class="empty">✅ Nothing needs a decision right now.</p>`}
      </section>

      <div class="tiles">
        ${tile('Recurring / month', money(perMonth, false), `${act.length} active · ${money(perMonth * 12, false)}/yr`)}
        ${tile('Fun money this month', money(spThis, false),
          spLastToDate ? `<span class="${delta > 0 ? 'up-bad' : 'down-good'}">${delta > 0 ? '▲' : '▼'} ${money(Math.abs(delta), false)}</span> vs same day last month` : `Last month: ${money(spLast, false)}`)}
        ${tile('Leak watch', money(leakRec + leakSpend, false), `${money(leakRec, false)}/mo flagged charges + ${money(leakSpend, false)} “not worth it”`, 'leak')}
        ${tile('Saved by cancelling', money(saved, false), pausedSave ? `+ ${money(pausedSave, false)}/mo paused right now` : 'Since each cancel date', 'saved')}
      </div>

      <section class="card span2">
        <header class="card-head"><h2>Month by month</h2><span class="muted small">Recurring + fun money · 6 months back, 6 ahead</span></header>
        <div id="trendChart" class="chart"></div>
      </section>

      <section class="card">
        <header class="card-head"><h2>Fun money · ${fmtDate(today, { month: 'long' })}</h2>
          <button class="link" data-goto="spending">Comfort levels →</button></header>
        <div id="spendCatChart"></div>
      </section>

      <section class="card">
        <header class="card-head"><h2>Recurring by type</h2><span class="muted small">per month</span></header>
        <div id="recCatChart"></div>
      </section>

      <section class="card span2">
        <header class="card-head"><h2>Coming up · next 14 days</h2><button class="link" data-goto="timeline">Full timeline →</button></header>
        ${upcomingList(14)}
      </section>
    </div>`;

  $('#toggleActions')?.addEventListener('click', () => { state.showAllActions = !state.showAllActions; renderDashboard(); });

  // trend chart
  const rows = monthSeries(state.recurring, state.spend, 6, 6).map(m => ({
    label: m.date.toLocaleDateString('en-US', { month: 'short' }),
    values: { recurring: m.recurring, spend: m.future ? 0 : m.spend },
    future: m.future, current: m.current,
    tip: `<b>${monthName(m.date)}</b>${m.future ? ' <span class="muted">(projected)</span>' : ''}<br>
      <i class="sw s1"></i>Recurring ${money(m.recurring, false)}<br>
      ${m.future ? '' : `<i class="sw s2"></i>Fun money ${money(m.spend, false)}<br><b>Total ${money(m.recurring + m.spend, false)}</b>`}`,
  }));
  Charts.stackedColumns($('#trendChart'), rows, [
    { key: 'recurring', label: 'Recurring', cls: 's1' },
    { key: 'spend', label: 'Fun money', cls: 's2' },
  ]);

  const byCat = {};
  for (const s of state.spend) if (s.spent_on?.slice(0, 7) === mk) byCat[s.category] = (byCat[s.category] || 0) + Number(s.amount);
  const cats = Object.keys({ ...byCat, ...Object.fromEntries(Object.entries(state.targets).filter(([, v]) => v)) });
  Charts.hbars($('#spendCatChart'), cats.map(c => ({
    label: (SPEND_CATS[c] || SPEND_CATS.other).label, icon: (SPEND_CATS[c] || SPEND_CATS.other).icon,
    value: byCat[c] || 0, target: Number(state.targets[c]) || null,
    tip: `<b>${(SPEND_CATS[c] || SPEND_CATS.other).label}</b><br>${money(byCat[c] || 0)} this month${state.targets[c] ? `<br>Comfort level ${money(Number(state.targets[c]), false)}` : ''}`,
  })).sort((a, b) => b.value - a.value), { cls: 's2', empty: 'No spending logged this month.' });

  const recCat = {};
  for (const r of act) recCat[r.category] = (recCat[r.category] || 0) + monthlyEq(r);
  Charts.hbars($('#recCatChart'), Object.entries(recCat).map(([c, v]) => ({
    label: (RECURRING_CATS[c] || RECURRING_CATS.other).label, icon: (RECURRING_CATS[c] || RECURRING_CATS.other).icon, value: v,
    tip: `<b>${(RECURRING_CATS[c] || RECURRING_CATS.other).label}</b><br>${money(v)}/mo · ${money(v * 12, false)}/yr<br>` +
      act.filter(r => r.category === c).map(r => esc(r.name)).join(', '),
  })).sort((a, b) => b.value - a.value), { cls: 's1', empty: 'Add your first recurring charge.' });
}

function tile(label, value, sub, cls = '') {
  return `<div class="tile ${cls}"><div class="tile-label">${label}</div><div class="tile-value">${value}</div><div class="tile-sub">${sub}</div></div>`;
}

function actionItem(a) {
  const btns = [];
  if (a.cta === 'cancel' && a.rec) {
    if (a.rec.cancel_url) btns.push(`<a class="btn sm" href="${esc(a.rec.cancel_url)}" target="_blank" rel="noopener">Open cancel page</a>`);
    btns.push(`<button class="btn sm" data-act="mark-cancelled" data-id="${a.rec.id}">Mark cancelled</button>`);
    if (a.rec.category === 'streaming') btns.push(`<button class="btn sm" data-act="pause" data-id="${a.rec.id}">Pause 2 mo</button>`);
  }
  if (a.rec) btns.push(`<button class="btn sm ghost" data-act="edit" data-id="${a.rec.id}">Edit</button>`);
  if (a.cta === 'spend') btns.push(`<button class="btn sm ghost" data-goto="spending">See spending</button>`);
  btns.push(`<button class="btn sm ghost" data-act="snooze" data-key="${esc(a.key)}" title="Hide for 7 days">Snooze</button>`);
  btns.push(`<button class="btn sm ghost" data-act="dismiss" data-key="${esc(a.key)}" title="Handled — hide it">Done</button>`);
  return `<li class="action sev-${a.severity}">
    <span class="sev" title="${SEV_LABEL[a.severity]}">${SEV_ICON[a.severity]} <span class="sev-label">${SEV_LABEL[a.severity]}</span></span>
    <div class="action-body">
      <div class="action-title">${a.rec ? catOf(a.rec).icon + ' ' : ''}${esc(a.title)}</div>
      <div class="action-detail">${esc(a.detail)}${a.rec?.notes ? ` · <em>${esc(a.rec.notes)}</em>` : ''}</div>
      <div class="action-btns">${btns.join('')}</div>
    </div>
    <span class="action-date">${fmtDate(a.date)}</span>
  </li>`;
}

function upcomingList(days) {
  const today = D.today();
  const ev = buildEvents(state.recurring, [], today, D.addDays(today, days));
  if (!ev.length) return '<p class="empty">Nothing scheduled.</p>';
  const total = ev.filter(e => e.kind === 'charge').reduce((s, e) => s + e.amount, 0);
  return `<ul class="mini-events">${ev.map(eventRow).join('')}</ul>
    <p class="muted small right">${money(total)} in charges over the next ${days} days</p>`;
}

const KIND = {
  charge: { icon: '💳', label: 'Charge' }, renewal: { icon: '🔄', label: 'Renewal' }, 'cancel-by': { icon: '✂️', label: 'Cancel by' },
  promo: { icon: '📈', label: 'Price change' }, drop: { icon: '🎉', label: 'Payment ends' }, resume: { icon: '▶️', label: 'Resumes' },
  spend: { icon: '🧾', label: 'Spent' },
};

function eventRow(e) {
  const today = D.today();
  const isPast = e.date < today;
  const icon = e.kind === 'charge' ? catOf(e.rec).icon : e.kind === 'spend' ? spCatOf(e.spend).icon : KIND[e.kind].icon;
  const flags = e.rec && e.kind === 'charge' ? flagsFor(e.rec, state.recurring) : [];
  const sub = e.kind === 'charge'
    ? `${catOf(e.rec).label}${e.rec.justification ? ' · ' + esc(e.rec.justification) : ''}`
    : e.kind === 'spend' ? `${spCatOf(e.spend).label}${e.spend.worth_it ? ' · ' + { yes: '👍 worth it', meh: '😐 meh', no: '👎 not worth it' }[e.spend.worth_it] : ''}`
    : KIND[e.kind].label;
  const data = e.rec ? `data-act="edit" data-id="${e.rec.id}"` : `data-act="edit-spend" data-id="${e.spend.id}"`;
  return `<li class="ev kind-${e.kind}${isPast ? ' past' : ''}${flags.length ? ' flagged' : ''}" ${data} tabindex="0">
    <span class="ev-date"><b>${e.date.getDate()}</b><small>${e.date.toLocaleDateString('en-US', { weekday: 'short' })}</small></span>
    <span class="ev-icon">${icon}</span>
    <span class="ev-main"><span class="ev-title">${esc(e.title)}${flags.length ? ` <span class="flag-dot" title="${esc(flags.map(f => f.text).join(' · '))}">⚑</span>` : ''}</span>
      <span class="ev-sub">${sub}</span></span>
    <span class="ev-amt">${e.amount != null ? money(e.amount) : ''}</span>
  </li>`;
}

/* ── Timeline (scrolling) ── */
function renderTimeline() {
  const el = $('#tab-timeline');
  const today = D.today();
  const { back, fwd, show } = state.timeline;
  const from = D.addMonths(D.monthStart(today), -back, 1);
  const to = D.monthEnd(D.addMonths(D.monthStart(today), fwd, 1));
  const ev = buildEvents(state.recurring, state.spend, from, to).filter(e =>
    e.kind === 'charge' ? show.charge : e.kind === 'spend' ? show.spend : show.milestone);

  const byMonth = new Map();
  for (let i = -back; i <= fwd; i++) byMonth.set(D.monthKey(D.addMonths(D.monthStart(today), i, 1)), []);
  ev.forEach(e => byMonth.get(D.monthKey(e.date))?.push(e));

  const todayKey = D.monthKey(today);
  let html = `<div class="tl-controls">
      <div class="chip-row">
        ${chip('charge', '💳 Charges', show.charge)}${chip('milestone', '📌 Renewals & dates', show.milestone)}${chip('spend', '🧾 Spending', show.spend)}
      </div>
      <button class="btn sm" id="tlToday">Jump to today</button>
    </div>
    <button class="btn block ghost" id="tlEarlier">↑ Show earlier months</button>
    <div class="timeline">`;
  for (const [key, list] of byMonth) {
    const [y, m] = key.split('-').map(Number);
    const mdt = new Date(y, m - 1, 1);
    const charges = list.filter(e => e.kind === 'charge').reduce((s, e) => s + e.amount, 0);
    const sp = list.filter(e => e.kind === 'spend').reduce((s, e) => s + e.amount, 0);
    const future = mdt > today;
    html += `<section class="tl-month${key === todayKey ? ' current' : ''}" data-month="${key}">
      <header class="tl-head"><h3>${monthName(mdt)}</h3>
        <span class="tl-totals"><span><i class="sw s1"></i>${money(charges, false)} recurring${future ? ' (projected)' : ''}</span>
        ${show.spend && !future ? `<span><i class="sw s2"></i>${money(sp, false)} fun money</span>` : ''}</span></header>
      <ul class="tl-list">`;
    let todayPlaced = key !== todayKey;
    for (const e of list) {
      if (!todayPlaced && e.date >= today) { html += todayMarker(); todayPlaced = true; }
      html += eventRow(e);
    }
    if (!todayPlaced) html += todayMarker();
    if (!list.length) html += `<li class="muted small pad">Nothing scheduled.</li>`;
    html += `</ul></section>`;
  }
  html += `</div><button class="btn block ghost" id="tlLater">↓ Show later months</button>`;
  el.innerHTML = html;

  $$('.chip[data-k]', el).forEach(c => c.addEventListener('click', () => { show[c.dataset.k] = !show[c.dataset.k]; renderTimeline(); }));
  $('#tlEarlier', el).onclick = () => { state.timeline.back += 3; renderTimeline(); };
  $('#tlLater', el).onclick = () => { state.timeline.fwd += 6; renderTimeline(); };
  $('#tlToday', el).onclick = () => scrollToToday();
}
const chip = (k, label, on) => `<button class="chip${on ? ' on' : ''}" data-k="${k}" aria-pressed="${on}">${label}</button>`;
const todayMarker = () => `<li class="today-marker" id="todayMarker"><span>Today · ${fmtDate(D.today(), { weekday: 'short', month: 'short', day: 'numeric' })}</span></li>`;
function scrollToToday(behavior = 'smooth') { $('#todayMarker')?.scrollIntoView({ block: 'center', behavior }); }

/* ── Month view ── */
function renderMonth() {
  const el = $('#tab-month');
  const m0 = state.monthCursor, m1 = D.monthEnd(m0);
  const today = D.today();
  const ev = buildEvents(state.recurring, state.spend, m0, m1);
  const charges = ev.filter(e => e.kind === 'charge');
  const spends = ev.filter(e => e.kind === 'spend');
  const recTotal = charges.reduce((s, e) => s + e.amount, 0);
  const spTotal = spends.reduce((s, e) => s + e.amount, 0);
  const milestones = ev.filter(e => !['charge', 'spend'].includes(e.kind));

  const byDay = {};
  ev.forEach(e => (byDay[e.date.getDate()] ||= []).push(e));
  const lead = m0.getDay();
  let cells = '';
  for (let i = 0; i < lead; i++) cells += `<div class="cal-cell empty"></div>`;
  for (let d = 1; d <= m1.getDate(); d++) {
    const list = byDay[d] || [];
    const dt = new Date(m0.getFullYear(), m0.getMonth(), d);
    const amt = list.filter(e => e.amount != null).reduce((s, e) => s + e.amount, 0);
    cells += `<div class="cal-cell${+dt === +today ? ' today' : ''}${dt < today ? ' past' : ''}" data-day="${d}">
      <span class="cal-d">${d}</span>
      ${list.slice(0, 3).map(e => `<span class="cal-ev kind-${e.kind}" title="${esc(e.title)}${e.amount != null ? ' ' + money(e.amount) : ''}">${e.kind === 'charge' ? catOf(e.rec).icon : e.kind === 'spend' ? spCatOf(e.spend).icon : KIND[e.kind].icon} ${esc(e.title)}</span>`).join('')}
      ${list.length > 3 ? `<span class="cal-more">+${list.length - 3} more</span>` : ''}
      ${amt ? `<span class="cal-amt">${money(amt, false)}</span>` : ''}
    </div>`;
  }

  el.innerHTML = `
    <div class="month-nav">
      <button class="btn" id="mPrev">‹</button>
      <h2>${monthName(m0)}</h2>
      <button class="btn" id="mNext">›</button>
      <button class="btn sm ghost" id="mToday">This month</button>
    </div>
    <div class="tiles">
      ${tile('Recurring charges', money(recTotal, false), `${charges.length} charges`)}
      ${tile('Fun money', money(spTotal, false), `${spends.length} entries`)}
      ${tile('Total', money(recTotal + spTotal, false), m0 > today ? 'Projected' : '')}
      ${tile('Key dates', String(milestones.length), milestones.map(e => KIND[e.kind].label).filter((v, i, a) => a.indexOf(v) === i).join(', ') || 'None')}
    </div>
    <div class="cal">
      ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => `<div class="cal-dow">${d}</div>`).join('')}
      ${cells}
    </div>
    <section class="card">
      <header class="card-head"><h2>Everything this month</h2></header>
      ${ev.length ? `<ul class="mini-events">${ev.map(eventRow).join('')}</ul>` : '<p class="empty">Nothing this month.</p>'}
    </section>`;
  $('#mPrev').onclick = () => { state.monthCursor = D.addMonths(m0, -1, 1); renderMonth(); };
  $('#mNext').onclick = () => { state.monthCursor = D.addMonths(m0, 1, 1); renderMonth(); };
  $('#mToday').onclick = () => { state.monthCursor = D.monthStart(D.today()); renderMonth(); };
}

/* ── Recurring list ── */
function renderRecurring() {
  const el = $('#tab-recurring');
  const f = state.recFilter;
  let list = state.recurring.filter(r =>
    (f.status === 'live' ? r.status !== 'cancelled' : !f.status || r.status === f.status) && (!f.verdict || r.verdict === f.verdict));
  const groups = {};
  list.forEach(r => (groups[r.category] ||= []).push(r));
  const order = Object.keys(RECURRING_CATS);
  const sumMo = list.filter(r => r.status === 'active').reduce((s, r) => s + monthlyEq(r), 0);

  el.innerHTML = `
    <div class="toolbar">
      <label>Show <select id="rfStatus">
        <option value="live">Active + paused</option><option value="active">Active</option><option value="paused">Paused</option>
        <option value="cancelled">Cancelled</option><option value="">Everything</option></select></label>
      <label>Verdict <select id="rfVerdict"><option value="">Any</option>
        ${Object.entries(VERDICTS).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}</select></label>
      <span class="spacer"></span>
      <span class="muted">${list.length} items · ${money(sumMo)}/mo active</span>
    </div>
    ${list.length ? order.filter(c => groups[c]).map(c => `
      <section class="rec-group">
        <h3>${RECURRING_CATS[c].icon} ${RECURRING_CATS[c].label}
          <span class="muted small">${money(groups[c].filter(r => r.status === 'active').reduce((s, r) => s + monthlyEq(r), 0))}/mo</span></h3>
        <div class="rec-grid">${groups[c].sort((a, b) => monthlyEq(b) - monthlyEq(a)).map(recCard).join('')}</div>
      </section>`).join('') : `<p class="empty">No recurring charges match. <button class="link" id="emptyAdd">Add one →</button></p>`}`;
  $('#rfStatus').value = f.status; $('#rfVerdict').value = f.verdict;
  $('#rfStatus').onchange = e => { f.status = e.target.value; renderRecurring(); };
  $('#rfVerdict').onchange = e => { f.verdict = e.target.value; renderRecurring(); };
  $('#emptyAdd')?.addEventListener('click', () => openRec());
}

function recCard(r) {
  const flags = flagsFor(r, state.recurring);
  const nc = nextCharge(r);
  const me = monthlyEq(r);
  const stars = r.worth ? '★'.repeat(r.worth) + '☆'.repeat(5 - r.worth) : '—';
  const status = r.status === 'paused' ? `Paused${r.paused_until ? ' until ' + fmtDate(D.parse(r.paused_until)) : ''}`
    : r.status === 'cancelled' ? `Cancelled${r.cancelled_on ? ' ' + fmtDate(D.parse(r.cancelled_on), { month: 'short', day: 'numeric', year: 'numeric' }) : ''}` : '';
  const dates = [
    nc && `Next ${fmtDate(nc.date)}${nc.amount !== Number(r.amount) ? ` (${money(nc.amount)})` : ''}`,
    r.cancel_by && `✂️ Cancel by ${fmtDate(D.parse(r.cancel_by))}`,
    r.renewal_date && `🔄 Renews ${fmtDate(D.parse(r.renewal_date))}`,
    r.promo_end_date && `📈 Promo ends ${fmtDate(D.parse(r.promo_end_date))}`,
    r.end_date && `🎉 Ends ${fmtDate(D.parse(r.end_date), { month: 'short', year: 'numeric' })}`,
  ].filter(Boolean);
  return `<article class="rec-card status-${r.status}${flags.length ? ' flagged' : ''}">
    <header>
      <div><h4>${esc(r.name)}</h4>
        <div class="rec-price"><b>${money(Number(r.amount))}</b>/${CADENCE[r.cadence].label}
          ${r.cadence !== 'monthly' ? `<span class="muted">· ${money(me)}/mo</span>` : `<span class="muted">· ${money(me * 12, false)}/yr</span>`}</div></div>
      <span class="verdict v-${r.verdict}">${VERDICTS[r.verdict]?.label || ''}</span>
    </header>
    ${status ? `<div class="status-line">${status}</div>` : ''}
    <dl>
      <dt>Why</dt><dd>${r.justification ? esc(r.justification) : '<span class="muted">No justification yet</span>'}</dd>
      ${r.uses ? `<dt>Use / watch</dt><dd>${esc(r.uses)}</dd>` : ''}
      <dt>Worth</dt><dd><span class="stars" aria-label="${r.worth || 0} of 5">${stars}</span>${r.who ? ` <span class="muted">· ${esc(r.who)}</span>` : ''}</dd>
    </dl>
    ${dates.length ? `<div class="rec-dates">${dates.map(d => `<span>${d}</span>`).join('')}</div>` : ''}
    ${flags.length ? `<ul class="flags">${flags.map(f => `<li>⚑ ${esc(f.text)}</li>`).join('')}</ul>` : ''}
    <footer>
      <button class="btn sm" data-act="edit" data-id="${r.id}">Edit</button>
      ${r.status === 'active' ? `<button class="btn sm ghost" data-act="pause" data-id="${r.id}" title="Pause 2 months — saves ${money(me * 2, false)}">Pause</button>
        <button class="btn sm ghost" data-act="mark-cancelled" data-id="${r.id}">Cancelled it</button>` : ''}
      ${r.status !== 'active' ? `<button class="btn sm ghost" data-act="reactivate" data-id="${r.id}">Resubscribe</button>` : ''}
      <button class="btn sm ghost" data-act="used-today" data-id="${r.id}" title="Set last used to today">Used today</button>
      ${r.cancel_url ? `<a class="btn sm ghost" href="${esc(r.cancel_url)}" target="_blank" rel="noopener">Manage ↗</a>` : ''}
    </footer>
  </article>`;
}

/* ── Spending ── */
function renderSpending() {
  const el = $('#tab-spending');
  const m0 = state.spendMonth, key = D.monthKey(m0);
  const list = state.spend.filter(s => s.spent_on?.slice(0, 7) === key).sort((a, b) => b.spent_on.localeCompare(a.spent_on));
  const total = list.reduce((s, x) => s + Number(x.amount), 0);
  const byCat = {};
  list.forEach(s => (byCat[s.category] = (byCat[s.category] || 0) + Number(s.amount)));
  const worthSplit = { yes: 0, meh: 0, no: 0, none: 0 };
  list.forEach(s => (worthSplit[s.worth_it || 'none'] += Number(s.amount)));

  el.innerHTML = `
    <div class="month-nav">
      <button class="btn" id="sPrev">‹</button><h2>${monthName(m0)}</h2><button class="btn" id="sNext">›</button>
      <span class="spacer"></span><button class="btn primary" id="sAdd">+ Log spending</button>
    </div>
    <div class="quick-add card">
      <span class="muted small">Quick add:</span>
      ${Object.entries(SPEND_CATS).map(([k, c]) => `<button class="chip" data-quick="${k}">${c.icon} ${c.label}</button>`).join('')}
    </div>
    <div class="spend-grid">
      <section class="card">
        <header class="card-head"><h2>By category</h2><b>${money(total)}</b></header>
        <table class="cat-table">
          <thead><tr><th>Category</th><th class="num">Spent</th><th class="num">Comfort level / mo</th><th></th></tr></thead>
          <tbody>${Object.entries(SPEND_CATS).map(([k, c]) => {
            const v = byCat[k] || 0, t = Number(state.targets[k]) || 0;
            const pct = t ? Math.min(100, (v / t) * 100) : 0;
            return `<tr><td>${c.icon} ${c.label}</td><td class="num">${money(v, false)}</td>
              <td class="num"><input class="target-input" type="number" min="0" step="5" data-target="${k}" value="${t || ''}" placeholder="—" aria-label="${c.label} comfort level"></td>
              <td class="meter-cell">${t ? `<span class="meter"><span class="${v > t ? 'over' : v > t * 0.9 ? 'near' : ''}" style="width:${pct}%"></span></span>` : ''}</td></tr>`;
          }).join('')}</tbody>
        </table>
        <p class="muted small">Comfort levels aren't a budget — they're the point where it stops feeling balanced.</p>
      </section>
      <section class="card">
        <header class="card-head"><h2>Was it worth it?</h2></header>
        ${total ? `<div class="segbar">${[['yes', '👍 Worth it', 'w-yes'], ['meh', '😐 Meh', 'w-meh'], ['no', '👎 Not worth it', 'w-no'], ['none', 'Not rated', 'w-none']]
          .filter(([k]) => worthSplit[k]).map(([k, l, c]) => `<span class="${c}" style="flex:${worthSplit[k]}" title="${l}: ${money(worthSplit[k])}"></span>`).join('')}</div>
          <ul class="legend-list">${[['yes', '👍 Worth it', 'w-yes'], ['meh', '😐 Meh', 'w-meh'], ['no', '👎 Not worth it', 'w-no'], ['none', 'Not rated', 'w-none']]
          .filter(([k]) => worthSplit[k]).map(([k, l, c]) => `<li><span><i class="sw ${c}"></i>${l}</span><b>${money(worthSplit[k], false)}</b><span class="muted">${Math.round(worthSplit[k] / total * 100)}%</span></li>`).join('')}</ul>`
          : '<p class="empty">Nothing logged this month.</p>'}
      </section>
    </div>
    <section class="card">
      <header class="card-head"><h2>Entries</h2><span class="muted small">${list.length}</span></header>
      ${list.length ? `<ul class="mini-events">${list.map(s => eventRow({ kind: 'spend', date: D.parse(s.spent_on), amount: Number(s.amount), spend: s, title: s.merchant || spCatOf(s).label })).join('')}</ul>`
        : '<p class="empty">Nothing logged. Tap a quick-add button above.</p>'}
    </section>`;
  $('#sPrev').onclick = () => { state.spendMonth = D.addMonths(m0, -1, 1); renderSpending(); };
  $('#sNext').onclick = () => { state.spendMonth = D.addMonths(m0, 1, 1); renderSpending(); };
  $('#sAdd').onclick = () => openSpend();
  $$('[data-quick]', el).forEach(b => b.onclick = () => openSpend({ category: b.dataset.quick }));
  $$('.target-input', el).forEach(inp => inp.addEventListener('change', async () => {
    const t = { ...state.targets, [inp.dataset.target]: inp.value ? Number(inp.value) : 0 };
    await store.saveTargets(t);
    renderSpending(); renderDashboard();
  }));
}

/* ── Review: things that don't make sense ── */
function renderReview() {
  const el = $('#tab-review');
  const items = live().map(r => ({ r, flags: flagsFor(r, state.recurring) })).filter(x => x.flags.length)
    .sort((a, b) => b.flags.length - a.flags.length || monthlyEq(b.r) - monthlyEq(a.r));
  const cut = state.recurring.filter(r => r.status === 'active' && ['cancel', 'review', 'rotate'].includes(r.verdict));
  const cutMo = cut.reduce((s, r) => s + monthlyEq(r), 0);
  const streaming = active().filter(r => r.category === 'streaming');
  const noWorthSpend = {};
  const sixAgo = D.iso(D.addMonths(D.monthStart(D.today()), -5, 1));
  state.spend.filter(s => s.worth_it === 'no' && s.spent_on >= sixAgo).forEach(s => {
    const k = (s.merchant || spCatOf(s).label).trim();
    (noWorthSpend[k] ||= { n: 0, amt: 0, cat: s.category }); noWorthSpend[k].n++; noWorthSpend[k].amt += Number(s.amount);
  });
  const repeats = Object.entries(noWorthSpend).filter(([, v]) => v.n >= 2).sort((a, b) => b[1].amt - a[1].amt);

  el.innerHTML = `
    <div class="tiles">
      ${tile('Flagged charges', String(items.length), `${money(items.filter(x => x.r.status === 'active').reduce((s, x) => s + monthlyEq(x.r), 0), false)}/mo`, 'leak')}
      ${tile('If you cut Review / Rotate / Cancel', money(cutMo * 12, false) + '/yr', `${cut.length} charges · ${money(cutMo, false)}/mo`, 'saved')}
      ${tile('Streaming at once', String(streaming.length), money(streaming.reduce((s, r) => s + monthlyEq(r), 0), false) + '/mo')}
    </div>
    ${streaming.length > 1 ? `<section class="card">
      <header class="card-head"><h2>📺 Streaming rotation</h2><span class="muted small">Keep one or two, rotate the rest by season</span></header>
      <table class="rot-table"><thead><tr><th>Service</th><th>Worth</th><th>What we watch</th><th>Last used</th><th class="num">/mo</th><th></th></tr></thead>
      <tbody>${streaming.sort((a, b) => (a.worth || 0) - (b.worth || 0)).map(r => `<tr>
        <td><b>${esc(r.name)}</b></td><td>${r.worth ? '★'.repeat(r.worth) : '—'}</td><td>${esc(r.uses) || '<span class="muted">—</span>'}</td>
        <td>${r.last_used ? rel(D.diffDays(D.parse(r.last_used), D.today())) : '<span class="muted">—</span>'}</td>
        <td class="num">${money(monthlyEq(r))}</td>
        <td class="right"><button class="btn sm" data-act="pause" data-id="${r.id}">Pause 2 mo</button></td></tr>`).join('')}</tbody></table>
    </section>` : ''}
    <section class="card">
      <header class="card-head"><h2>Recurring charges that don't add up</h2></header>
      ${items.length ? `<ul class="review-list">${items.map(({ r, flags }) => `<li>
        <div><b>${catOf(r).icon} ${esc(r.name)}</b> <span class="muted">${money(monthlyEq(r))}/mo · ${money(monthlyEq(r) * 12, false)}/yr</span>
          <ul class="flags">${flags.map(f => `<li>⚑ ${esc(f.text)}</li>`).join('')}</ul></div>
        <div class="btns"><button class="btn sm" data-act="edit" data-id="${r.id}">Justify / edit</button>
          ${r.status === 'active' ? `<button class="btn sm ghost" data-act="mark-cancelled" data-id="${r.id}">Cancelled it</button>` : ''}</div>
      </li>`).join('')}</ul>` : '<p class="empty">✅ Every recurring charge has a reason. Nice.</p>'}
    </section>
    <section class="card">
      <header class="card-head"><h2>Repeat “not worth it” spending</h2><span class="muted small">last 6 months</span></header>
      ${repeats.length ? `<ul class="review-list">${repeats.map(([k, v]) => `<li><div><b>${(SPEND_CATS[v.cat] || SPEND_CATS.other).icon} ${esc(k)}</b>
        <span class="muted">${v.n} times · ${money(v.amt, false)}</span></div></li>`).join('')}</ul>`
        : '<p class="empty">Rate spending 👍 / 😐 / 👎 when you log it and patterns show up here.</p>'}
    </section>`;
}

function updateReviewBadge() {
  const n = live().filter(r => flagsFor(r, state.recurring).length).length;
  const a = buildActions(state.recurring, state.spend, state.targets, activeDismissed()).filter(x => x.severity !== 'good').length;
  $('[data-tab="review"]').innerHTML = `Review${n ? ` <span class="badge">${n}</span>` : ''}`;
  $('[data-tab="dashboard"]').innerHTML = `Dashboard${a ? ` <span class="badge hot">${a}</span>` : ''}`;
}

/* ────────────────────────────────────────────────
   Editors
──────────────────────────────────────────────── */
let editingRec = null, editingSpend = null;

function openRec(r = null) {
  editingRec = r;
  const f = $('#recForm');
  f.reset();
  const vals = r || { cadence: 'monthly', status: 'active', verdict: 'keep', category: 'streaming', anchor_date: D.iso(D.today()) };
  for (const el of f.elements) if (el.name && vals[el.name] != null) el.value = vals[el.name];
  $('#recTitle').textContent = r ? `Edit ${r.name}` : 'New recurring charge';
  $('#recDelete').classList.toggle('hidden', !r);
  $('#recDialog').showModal();
}

function openSpend(s = {}) {
  editingSpend = s.id ? s : null;
  const f = $('#spendForm');
  f.reset();
  const vals = { category: 'restaurants', spent_on: D.iso(D.today()), ...s };
  for (const el of f.elements) if (el.name && vals[el.name] != null) el.value = vals[el.name];
  setSpendCat(vals.category);
  setWorth(vals.worth_it || '');
  $('#spendTitle').textContent = editingSpend ? 'Edit spending' : 'Log spending';
  $('#spendDelete').classList.toggle('hidden', !editingSpend);
  $('#spendDialog').showModal();
  setTimeout(() => f.amount.focus(), 30);
}
function setSpendCat(k) {
  $('#spendForm').category.value = k;
  $$('#spendCatChips .chip').forEach(c => c.classList.toggle('on', c.dataset.cat === k));
}
function setWorth(v) {
  $('#spendForm').worth_it.value = v;
  $$('#worthSeg button').forEach(b => b.classList.toggle('on', b.dataset.v === v));
}

async function quickUpdate(id, patch) {
  const r = state.recurring.find(x => x.id === id);
  if (!r) return;
  await store.upsert('recurring', { ...r, ...patch });
  renderAll();
}

/* ────────────────────────────────────────────────
   Wiring
──────────────────────────────────────────────── */
function wireStatic() {
  // tabs
  $$('.tabs button').forEach(b => b.addEventListener('click', () => goto(b.dataset.tab)));

  // selects
  $('#recForm').category.innerHTML = Object.entries(RECURRING_CATS).map(([k, c]) => `<option value="${k}">${c.icon} ${c.label}</option>`).join('');
  $('#recForm').verdict.innerHTML = Object.entries(VERDICTS).map(([k, v]) => `<option value="${k}">${v.label} — ${v.hint}</option>`).join('');
  $('#spendCatChips').innerHTML = Object.entries(SPEND_CATS).map(([k, c]) => `<button type="button" class="chip" data-cat="${k}">${c.icon} ${c.label}</button>`).join('');
  $$('#spendCatChips .chip').forEach(c => c.onclick = () => setSpendCat(c.dataset.cat));
  $$('#worthSeg button').forEach(b => b.onclick = () => setWorth($('#spendForm').worth_it.value === b.dataset.v ? '' : b.dataset.v));

  $('#addRecurringBtn').onclick = () => openRec();
  $('#addSpendBtn').onclick = () => openSpend();
  $$('[data-close]').forEach(b => b.onclick = () => b.closest('dialog').close());

  $('#recForm').addEventListener('submit', async e => {
    e.preventDefault();
    const row = Object.fromEntries(new FormData(e.target));
    if (row.status === 'cancelled' && !row.cancelled_on) row.cancelled_on = D.iso(D.today());
    await store.upsert('recurring', editingRec ? { ...editingRec, ...row } : row);
    $('#recDialog').close();
    renderAll();
  });
  $('#recDelete').onclick = async () => {
    if (!editingRec || !confirm(`Delete ${editingRec.name}? Consider marking it cancelled instead so it counts toward “saved”.`)) return;
    await store.remove('recurring', editingRec.id);
    $('#recDialog').close(); renderAll();
  };
  $('#spendForm').addEventListener('submit', async e => {
    e.preventDefault();
    const row = Object.fromEntries(new FormData(e.target));
    await store.upsert('spend', editingSpend ? { ...editingSpend, ...row } : row);
    $('#spendDialog').close();
    renderAll();
  });
  $('#spendDelete').onclick = async () => {
    if (!editingSpend || !confirm('Delete this entry?')) return;
    await store.remove('spend', editingSpend.id);
    $('#spendDialog').close(); renderAll();
  };

  // delegated actions
  document.addEventListener('click', async e => {
    const g = e.target.closest('[data-goto]');
    if (g) { goto(g.dataset.goto); return; }
    const t = e.target.closest('[data-act]');
    if (!t) return;
    const { act, id, key } = t.dataset;
    const today = D.iso(D.today());
    if (act === 'edit') openRec(state.recurring.find(r => r.id === id));
    else if (act === 'edit-spend') openSpend(state.spend.find(s => s.id === id));
    else if (act === 'mark-cancelled') await quickUpdate(id, { status: 'cancelled', cancelled_on: today, verdict: 'cancel' });
    else if (act === 'pause') await quickUpdate(id, { status: 'paused', paused_until: D.iso(D.addMonths(D.today(), 2)), verdict: 'rotate' });
    else if (act === 'reactivate') await quickUpdate(id, { status: 'active', paused_until: null, cancelled_on: null, anchor_date: today });
    else if (act === 'used-today') await quickUpdate(id, { last_used: today });
    else if (act === 'dismiss') { dismiss(key); renderDashboard(); updateReviewBadge(); }
    else if (act === 'snooze') { dismiss(key, 7); renderDashboard(); updateReviewBadge(); }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.matches('li.ev[data-act]')) e.target.click();
  });

  // auth
  $('#loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const email = e.target.email.value.trim();
    $('#loginMsg').textContent = 'Sending…';
    const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin + location.pathname, shouldCreateUser: true } });
    $('#loginMsg').textContent = error ? `Couldn't send: ${error.message}` : `Check ${email} for a sign-in link.`;
  });
  $('#demoBtn').onclick = () => startDemo();
  $('#signOutBtn').onclick = async () => {
    if (store.mode === 'demo') {
      if (!confirm('Leave sample mode? (Sample data stays in this browser.)')) return;
      localStorage.removeItem('balance-mode');
      location.href = location.pathname;
      return;
    }
    await sb.auth.signOut();
    location.reload();
  };

  const setTopH = () => document.documentElement.style.setProperty('--topbar-h', ($('.topbar').offsetHeight || 58) + 'px');
  new ResizeObserver(setTopH).observe($('.topbar'));
  let rs; addEventListener('resize', () => { clearTimeout(rs); rs = setTimeout(() => state.tab === 'dashboard' && renderDashboard(), 150); });
}

function goto(tab) {
  state.tab = tab;
  $$('.tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  $$('.tab').forEach(s => s.classList.toggle('active', s.id === 'tab-' + tab));
  if (tab === 'dashboard') renderDashboard();      // re-measure chart width
  scrollTo({ top: 0 });
  if (tab === 'timeline') requestAnimationFrame(() => scrollToToday('auto'));
}

boot();
