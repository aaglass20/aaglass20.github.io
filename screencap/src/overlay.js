'use strict';
const shot = document.getElementById('shot');
const sel = document.getElementById('sel');
const dim = document.getElementById('dim');
const sizeLabel = document.getElementById('size');
const hint = document.getElementById('hint');
const HINTS = {
  region: 'Drag to choose the area to capture',
  scroll: 'Drag over the scrolling content (leave out fixed headers and footers)',
  video: 'Drag to choose the area to record',
};
let cfg = null;
let start = null;

// The window may sit slightly off the display origin (menu bar), so keep the frozen image aligned to the real screen.
const offset = () => ({ x: window.screenX - cfg.x, y: window.screenY - cfg.y });
function layout() {
  const o = offset();
  shot.style.left = `${-o.x}px`;
  shot.style.top = `${-o.y}px`;
  shot.style.width = `${cfg.width}px`;
  shot.style.height = `${cfg.height}px`;
}
function rectFrom(a, b) {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  return { x, y, width: Math.abs(a.x - b.x), height: Math.abs(a.y - b.y) };
}
function done(rect) { api.send('overlay:done', rect); }

api.on('overlay:init', (c) => {
  cfg = c;
  hint.textContent = `${HINTS[c.mode] || HINTS.region}  ·  Enter = whole screen  ·  Esc = cancel`;
  shot.onload = () => { layout(); api.send('overlay:ready'); };
  shot.src = URL.createObjectURL(new Blob([c.jpeg], { type: 'image/jpeg' }));
});

window.addEventListener('mousedown', (e) => {
  if (!cfg || e.button !== 0) return;
  layout();
  start = { x: e.clientX, y: e.clientY };
  hint.hidden = true;
});
window.addEventListener('mousemove', (e) => {
  if (!start) return;
  const r = rectFrom(start, { x: e.clientX, y: e.clientY });
  dim.hidden = true;
  sel.hidden = false;
  Object.assign(sel.style, { left: `${r.x}px`, top: `${r.y}px`, width: `${r.width}px`, height: `${r.height}px` });
  sizeLabel.textContent = `${Math.round(r.width)} × ${Math.round(r.height)}`;
});
window.addEventListener('mouseup', (e) => {
  if (!start) return;
  const r = rectFrom(start, { x: e.clientX, y: e.clientY });
  start = null;
  if (r.width < 5 || r.height < 5) { sel.hidden = true; dim.hidden = false; hint.hidden = false; return; }
  const o = offset();
  const x = Math.max(0, Math.round(r.x + o.x));
  const y = Math.max(0, Math.round(r.y + o.y));
  done({
    x, y,
    width: Math.min(Math.round(r.width), cfg.width - x),
    height: Math.min(Math.round(r.height), cfg.height - y),
  });
});
window.addEventListener('keydown', (e) => {
  if (!cfg) return;
  if (e.key === 'Escape') done(null);
  if (e.key === 'Enter') done({ x: 0, y: 0, width: cfg.width, height: cfg.height });
});
window.addEventListener('contextmenu', (e) => { e.preventDefault(); done(null); });
