// Drill Lab UI — browse drills by sport, search/filter, copy exports. Rules: drills/RULES.md
(function () {
  const SPORTS = window.SPORTS;
  const AGES = window.AGE_BANDS;
  const DATA = window.DRILL_DATA || {};
  const STAR_KEY = 'drillLab.shortlist';
  const REVIEW_ONLY = ['status', 'notes'];          // left out of the Coach Approach export

  const $ = sel => document.querySelector(sel);
  const els = {
    tabs: $('#sportTabs'), search: $('#search'), age: $('#ageFilter'), status: $('#statusFilter'),
    starOnly: $('#starOnly'), chips: $('#catChips'), list: $('#list'), count: $('#resultCount'),
    detail: $('#detail'), detailBody: $('#detailBody'), toast: $('#toast'),
    shortCount: $('#shortCount'), copyShortlist: $('#copyShortlist'),
  };

  const state = { sport: SPORTS[0].id, q: '', cats: new Set(), age: '', status: 'active', starOnly: false };

  // ── Shortlist (per-browser convenience; keys are "sport/id") ──
  let stars = new Set();
  try { stars = new Set(JSON.parse(localStorage.getItem(STAR_KEY) || '[]')); } catch (e) { /* storage blocked */ }
  const saveStars = () => {
    try { localStorage.setItem(STAR_KEY, JSON.stringify([...stars])); } catch (e) { /* storage blocked */ }
    els.shortCount.textContent = stars.size;
  };
  const starKey = (sport, d) => `${sport}/${d.id}`;
  const toggleStar = (sport, d) => {
    const k = starKey(sport, d);
    stars.has(k) ? stars.delete(k) : stars.add(k);
    saveStars();
  };

  // ── Helpers ──
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const drillsFor = sport => DATA[sport] || [];
  const statusOf = d => d.status || 'candidate';
  const sportById = id => SPORTS.find(s => s.id === id);

  const haystack = d => [
    d.name, ...(d.altNames || []), d.objective, ...(d.categories || []), ...(d.setup || []),
    ...(d.instructions || []), ...(d.variations || []), ...(d.coachingPoints || []),
    ...(d.equipment || []), ...(d.adaptations || []), ...(d.sportFocus || []), d.players, d.notes,
  ].join(' ').toLowerCase();

  const matchesStatus = d => {
    const s = statusOf(d);
    if (state.status === 'all') return true;
    if (state.status === 'active') return s !== 'rejected';
    return s === state.status;
  };

  // Everything except the category filter — used for chip counts too.
  const baseFiltered = () => {
    const terms = state.q.toLowerCase().split(/\s+/).filter(Boolean);
    return drillsFor(state.sport).filter(d =>
      matchesStatus(d) &&
      (!state.age || (d.ages || []).includes(state.age)) &&
      (!state.starOnly || stars.has(starKey(state.sport, d))) &&
      (!terms.length || (h => terms.every(t => h.includes(t)))(haystack(d)))
    );
  };
  const filtered = () => {
    const base = baseFiltered();
    if (!state.cats.size) return base;
    return base.filter(d => (d.categories || []).some(c => state.cats.has(c)));
  };

  // ── Exports ──
  const exportObj = (sport, d) => {
    const out = { sport };
    Object.keys(d).forEach(k => { if (!REVIEW_ONLY.includes(k)) out[k] = d[k]; });
    return out;
  };
  const exportJSON = (sport, d) => JSON.stringify(exportObj(sport, d), null, 2);
  const exportText = (sport, d) => {
    const list = (title, arr, numbered) => arr && arr.length
      ? `${title}\n${arr.map((x, i) => `${numbered ? `${i + 1}.` : '-'} ${x}`).join('\n')}\n` : '';
    return [
      d.name.toUpperCase(),
      d.altNames && d.altNames.length ? `Also called: ${d.altNames.join(', ')}` : '',
      `Sport: ${sportById(sport).label}`,
      `Category: ${(d.categories || []).join(', ')}`,
      `Ages: ${(d.ages || []).join(', ')}`,
      d.players ? `Players: ${d.players}` : '',
      d.duration ? `Duration: ${d.duration}` : '',
      d.sportFocus && d.sportFocus.length ? `Sport focus: ${d.sportFocus.join(', ')}` : '',
      `\nOBJECTIVE\n${d.objective}\n`,
      list('SETUP', d.setup),
      list('INSTRUCTIONS (SEQUENCE OF PLAY)', d.instructions, true),
      list('VARIATIONS', d.variations),
      list('COACHING POINTS', d.coachingPoints),
      list('EQUIPMENT', d.equipment),
      list('ADAPTATIONS', d.adaptations),
    ].filter(x => x !== '').join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
  };

  async function copy(text, msg) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    toast(msg);
  }
  let toastTimer;
  function toast(msg) {
    els.toast.textContent = msg;
    els.toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { els.toast.hidden = true; }, 1800);
  }

  // ── Render ──
  function renderTabs() {
    els.tabs.innerHTML = SPORTS.map(s => `
      <button class="sport-tab" type="button" role="tab" data-sport="${s.id}" aria-selected="${s.id === state.sport}">
        ${s.icon} ${esc(s.label)}<span class="n">${drillsFor(s.id).length}</span>
      </button>`).join('');
  }

  function renderChips() {
    const base = baseFiltered();
    const cats = sportById(state.sport).categories;
    els.chips.innerHTML = cats.map(c => {
      const n = base.filter(d => (d.categories || []).includes(c)).length;
      const on = state.cats.has(c);
      return `<button class="chip" type="button" data-cat="${esc(c)}" aria-pressed="${on}" ${!n && !on ? 'disabled' : ''}>${esc(c)}<span class="n">${n}</span></button>`;
    }).join('');
  }

  function card(d) {
    const st = statusOf(d);
    const starred = stars.has(starKey(state.sport, d));
    return `
      <div class="card" tabindex="0" role="button" data-id="${esc(d.id)}">
        <button class="star" type="button" data-star="${esc(d.id)}" aria-pressed="${starred}" aria-label="Shortlist ${esc(d.name)}">★</button>
        <h3>${esc(d.name)}</h3>
        ${d.altNames && d.altNames.length ? `<p class="alt">aka ${esc(d.altNames.join(' · '))}</p>` : ''}
        <p class="obj">${esc(d.objective)}</p>
        <div class="meta">
          ${(d.categories || []).map((c, i) => `<span class="tag${i === 0 ? ' primary' : ''}">${esc(c)}</span>`).join('')}
          <span class="tag age">${esc(ageRange(d.ages))}</span>
          ${st !== 'candidate' ? `<span class="tag status-${st}">${st}</span>` : ''}
        </div>
      </div>`;
  }

  // ['U8','U10','U12'] → "U8–U12"; non-contiguous lists are joined.
  function ageRange(ages) {
    if (!ages || !ages.length) return 'All ages';
    const idx = ages.map(a => AGES.indexOf(a)).sort((a, b) => a - b);
    const contiguous = idx.every((v, i) => i === 0 || v === idx[i - 1] + 1);
    return contiguous && idx.length > 1 ? `${AGES[idx[0]]}–${AGES[idx[idx.length - 1]]}` : ages.join(', ');
  }

  function renderList() {
    const items = filtered();
    const total = drillsFor(state.sport).length;
    els.count.textContent = `${items.length} of ${total} ${sportById(state.sport).label} drill${total === 1 ? '' : 's'}`;
    els.list.innerHTML = items.length
      ? items.map(card).join('')
      : `<p class="empty">${total ? 'No drills match these filters.' : 'No drills for this sport yet.'}</p>`;
  }

  function render() {
    renderTabs();
    renderChips();
    renderList();
  }

  // ── Detail ──
  let open = null; // { sport, drill }
  function section(title, arr, numbered) {
    if (!arr || !arr.length) return '';
    const tag = numbered ? 'ol' : 'ul';
    return `<section class="d-sec"><h4>${title}</h4><${tag}>${arr.map(x => `<li>${esc(x)}</li>`).join('')}</${tag}></section>`;
  }
  function openDetail(sport, d, push = true) {
    open = { sport, drill: d };
    const st = statusOf(d);
    const starred = stars.has(starKey(sport, d));
    els.detailBody.innerHTML = `
      <header class="d-head">
        <button class="close" type="button" data-close aria-label="Close">×</button>
        <h2 id="detailName">${esc(d.name)}</h2>
        ${d.altNames && d.altNames.length ? `<p class="alt">aka ${esc(d.altNames.join(' · '))}</p>` : ''}
        <div class="meta">
          ${(d.categories || []).map((c, i) => `<span class="tag${i === 0 ? ' primary' : ''}">${esc(c)}</span>`).join('')}
          <span class="tag status-${st}">${st}</span>
        </div>
        <div class="d-actions">
          <button class="btn" type="button" data-copy="json">Copy JSON</button>
          <button class="btn btn-light" type="button" data-copy="text">Copy Text</button>
          <button class="btn btn-ghost" type="button" data-star-detail aria-pressed="${starred}">★ ${starred ? 'Shortlisted' : 'Shortlist'}</button>
        </div>
      </header>
      <div class="d-body">
        <div class="d-facts">
          <div class="fact"><b>Ages</b>${esc((d.ages || []).join(', ') || 'All')}</div>
          ${d.players ? `<div class="fact"><b>Players</b>${esc(d.players)}</div>` : ''}
          ${d.duration ? `<div class="fact"><b>Duration</b>${esc(d.duration)}</div>` : ''}
          ${d.sportFocus && d.sportFocus.length ? `<div class="fact"><b>Sport focus</b>${esc(d.sportFocus.join(', '))}</div>` : ''}
        </div>
        <section class="d-sec"><h4>Objective</h4><p>${esc(d.objective)}</p></section>
        ${section('Setup', d.setup)}
        ${section('Instructions (Sequence of Play)', d.instructions, true)}
        ${section('Variations', d.variations)}
        ${section('Coaching Points', d.coachingPoints)}
        ${section('Equipment', d.equipment)}
        ${section('Adaptations', d.adaptations)}
        ${(d.sources && d.sources.length) || d.notes ? `
          <section class="d-sec review"><h4>Review notes</h4>
            ${d.notes ? `<p>${esc(d.notes)}</p>` : ''}
            ${d.sources && d.sources.length ? `<ul>${d.sources.map(s => `<li>${s.url ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name || s.url)}</a>` : esc(s.name)}</li>`).join('')}</ul>` : ''}
          </section>` : ''}
      </div>`;
    els.detail.hidden = false;
    document.body.style.overflow = 'hidden';
    els.detailBody.querySelector('[data-copy="json"]').focus();
    if (push) setHash(sport, d.id);
  }
  function closeDetail(push = true) {
    if (!open) return;
    const sport = open.sport;
    open = null;
    els.detail.hidden = true;
    document.body.style.overflow = '';
    if (push) setHash(sport);
  }

  // ── URL hash: #soccer or #soccer/rondo-4v1 ──
  function setHash(sport, id) {
    const h = id ? `#${sport}/${id}` : `#${sport}`;
    if (location.hash !== h) history.replaceState(null, '', h);
  }
  function readHash() {
    const [sport, id] = location.hash.replace(/^#/, '').split('/');
    if (sport && sportById(sport)) {
      if (sport !== state.sport) { state.sport = sport; state.cats.clear(); }
    }
    render();
    const d = id && drillsFor(state.sport).find(x => x.id === id);
    if (d) openDetail(state.sport, d, false); else closeDetail(false);
  }

  // ── Events ──
  els.tabs.addEventListener('click', e => {
    const b = e.target.closest('[data-sport]');
    if (!b || b.dataset.sport === state.sport) return;
    state.sport = b.dataset.sport;
    state.cats.clear();
    setHash(state.sport);
    render();
  });
  els.search.addEventListener('input', () => { state.q = els.search.value; renderChips(); renderList(); });
  els.age.addEventListener('change', () => { state.age = els.age.value; renderChips(); renderList(); });
  els.status.addEventListener('change', () => { state.status = els.status.value; renderChips(); renderList(); });
  els.starOnly.addEventListener('change', () => { state.starOnly = els.starOnly.checked; renderChips(); renderList(); });
  els.chips.addEventListener('click', e => {
    const b = e.target.closest('[data-cat]');
    if (!b) return;
    const c = b.dataset.cat;
    state.cats.has(c) ? state.cats.delete(c) : state.cats.add(c);
    renderChips(); renderList();
  });

  const drillFromEl = el => drillsFor(state.sport).find(d => d.id === el.dataset.id || d.id === el.dataset.star);
  els.list.addEventListener('click', e => {
    const s = e.target.closest('[data-star]');
    if (s) {
      toggleStar(state.sport, drillFromEl(s));
      if (state.starOnly) { renderChips(); renderList(); } else s.setAttribute('aria-pressed', s.getAttribute('aria-pressed') !== 'true');
      return;
    }
    const c = e.target.closest('.card');
    if (c) openDetail(state.sport, drillFromEl(c));
  });
  els.list.addEventListener('keydown', e => {
    const c = e.target.closest('.card');
    if (c && e.target === c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openDetail(state.sport, drillFromEl(c)); }
  });

  els.detail.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) return closeDetail();
    const cp = e.target.closest('[data-copy]');
    if (cp && open) {
      return cp.dataset.copy === 'json'
        ? copy(exportJSON(open.sport, open.drill), `Copied “${open.drill.name}” as JSON`)
        : copy(exportText(open.sport, open.drill), `Copied “${open.drill.name}” as text`);
    }
    const st = e.target.closest('[data-star-detail]');
    if (st && open) {
      toggleStar(open.sport, open.drill);
      const on = stars.has(starKey(open.sport, open.drill));
      st.setAttribute('aria-pressed', on);
      st.textContent = `★ ${on ? 'Shortlisted' : 'Shortlist'}`;
      renderChips(); renderList();
    }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDetail(); });

  els.copyShortlist.addEventListener('click', () => {
    const out = [];
    SPORTS.forEach(s => drillsFor(s.id).forEach(d => { if (stars.has(starKey(s.id, d))) out.push(exportObj(s.id, d)); }));
    if (!out.length) return toast('Shortlist is empty — tap ★ on a drill');
    copy(JSON.stringify(out, null, 2), `Copied ${out.length} shortlisted drill${out.length === 1 ? '' : 's'} as JSON`);
  });

  window.addEventListener('hashchange', readHash);

  // ── Init ──
  els.age.insertAdjacentHTML('beforeend', AGES.map(a => `<option value="${a}">${a}</option>`).join(''));
  saveStars();
  readHash();
})();
