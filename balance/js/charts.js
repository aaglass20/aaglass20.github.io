/* Balance — tiny SVG/HTML charts (no library).
   Mark specs: ≤24px bars, 4px rounded data-end square at baseline,
   2px surface gap between stacked segments, hairline grid, hover tooltips. */

const Charts = (() => {
  const tip = () => document.getElementById('tooltip');

  function showTip(html, evt) {
    const t = tip();
    t.innerHTML = html;
    t.classList.remove('hidden');
    const pad = 12;
    const r = t.getBoundingClientRect();
    let x = evt.clientX + pad, y = evt.clientY + pad;
    if (x + r.width > innerWidth - 8) x = evt.clientX - r.width - pad;
    if (y + r.height > innerHeight - 8) y = evt.clientY - r.height - pad;
    t.style.left = x + 'px'; t.style.top = y + 'px';
  }
  const hideTip = () => tip().classList.add('hidden');

  // rect with rounded top corners only (data end), square baseline
  function topRounded(x, y, w, h, r) {
    if (h <= 0) return '';
    r = Math.min(r, h, w / 2);
    return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
  }

  function niceMax(v) {
    if (v <= 0) return 100;
    const p = Math.pow(10, Math.floor(Math.log10(v)));
    for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= v) return m * p;
    return 10 * p;
  }
  const compact = n => n >= 10000 ? (n / 1000).toFixed(0) + 'K' : n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '') + 'K' : String(Math.round(n));

  /* Stacked columns: rows = [{label, values:{a,b}, future, current, tip}] ; series = [{key,label,cls}] */
  function stackedColumns(el, rows, series, { height = 220 } = {}) {
    const W = Math.max(320, el.clientWidth || 640), H = height;
    const m = { t: 12, r: 8, b: 26, l: 44 };
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const max = niceMax(Math.max(...rows.map(r => series.reduce((s, k) => s + (r.values[k.key] || 0), 0))));
    const band = iw / rows.length;
    const bw = Math.min(24, band * 0.6);
    const y = v => m.t + ih - (v / max) * ih;
    let svg = `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" role="img" aria-label="Monthly totals">`;
    for (let i = 0; i <= 4; i++) {
      const v = (max / 4) * i, yy = y(v);
      svg += `<line class="grid" x1="${m.l}" x2="${W - m.r}" y1="${yy}" y2="${yy}"/>`;
      svg += `<text class="tick" x="${m.l - 6}" y="${yy + 4}" text-anchor="end">$${compact(v)}</text>`;
    }
    rows.forEach((r, i) => {
      const cx = m.l + band * i + band / 2, x = cx - bw / 2;
      let base = 0;
      const visible = series.filter(s => (r.values[s.key] || 0) > 0);
      visible.forEach((s, j) => {
        const v = r.values[s.key];
        const top = j === visible.length - 1;
        const y0 = y(base), y1 = y(base + v);
        const gap = j > 0 ? 2 : 0;          // surface gap between segments
        const h = Math.max(0, y0 - y1 - gap);
        const path = top ? topRounded(x, y1, bw, h, 4) : `M${x},${y1}h${bw}v${h}h${-bw}Z`;
        svg += `<path class="${s.cls}${r.future ? ' future' : ''}" d="${path}"/>`;
        base += v;
      });
      svg += `<text class="tick${r.current ? ' strong' : ''}" x="${cx}" y="${H - 8}" text-anchor="middle">${r.label}</text>`;
      svg += `<rect class="hit" data-i="${i}" x="${m.l + band * i}" y="${m.t}" width="${band}" height="${ih}"/>`;
    });
    svg += `<line class="axis" x1="${m.l}" x2="${W - m.r}" y1="${y(0)}" y2="${y(0)}"/></svg>`;
    const legend = `<div class="legend">${series.map(s => `<span><i class="sw ${s.cls}"></i>${s.label}</span>`).join('')}
      <span class="muted"><i class="sw future-sw"></i>Projected</span></div>`;
    el.innerHTML = legend + svg;
    el.querySelectorAll('.hit').forEach(h => {
      const r = rows[+h.dataset.i];
      h.addEventListener('mousemove', e => { h.classList.add('on'); showTip(r.tip, e); });
      h.addEventListener('mouseleave', () => { h.classList.remove('on'); hideTip(); });
    });
  }

  /* Horizontal bars with optional target marker: items = [{label, icon, value, target, tip}] */
  function hbars(el, items, { cls = 's1', empty = 'Nothing yet' } = {}) {
    if (!items.length) { el.innerHTML = `<p class="muted">${empty}</p>`; return; }
    const max = Math.max(...items.map(i => Math.max(i.value, i.target || 0))) || 1;
    el.innerHTML = `<div class="hbars">${items.map((it, i) => {
      const pct = (it.value / max) * 100;
      const tpct = it.target ? (it.target / max) * 100 : null;
      const over = it.target && it.value > it.target;
      return `<div class="hbar" data-i="${i}">
        <span class="hb-label">${it.icon || ''} ${it.label}</span>
        <span class="hb-track">
          <span class="hb-fill ${cls}" style="width:${pct}%"></span>
          ${tpct != null ? `<span class="hb-target" style="left:${tpct}%" title="Comfort level"></span>` : ''}
        </span>
        <span class="hb-val">${Engine.money(it.value, false)}${over ? ' <span class="over-tag" title="Over comfort level">▲</span>' : ''}</span>
      </div>`;
    }).join('')}</div>`;
    el.querySelectorAll('.hbar').forEach(row => {
      const it = items[+row.dataset.i];
      if (!it.tip) return;
      row.addEventListener('mousemove', e => showTip(it.tip, e));
      row.addEventListener('mouseleave', hideTip);
    });
  }

  return { stackedColumns, hbars, showTip, hideTip };
})();
window.Charts = Charts;
