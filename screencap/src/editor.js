'use strict';
const $ = (id) => document.getElementById(id);
const query = new URLSearchParams(location.search);
let file = query.get('file');
const U = Number(query.get('scale')) || 1; // image pixels per screen point

const base = $('base');
const ink = $('ink');
const wrap = $('wrap');
const stage = $('stage');
const textIn = $('text');
const ictx = ink.getContext('2d');

const PALETTE = ['#ff3b30', '#ffd60a', '#34c759', '#0a84ff', '#000000', '#ffffff'];
const WIDTHS = [3, 5, 9];
const FONTS = [16, 24, 36];
const colors = { arrow: '#ff3b30', box: '#ff3b30', pen: '#ff3b30', text: '#ff3b30', hl: '#ffd60a' };

let W = 0;
let H = 0;
let zoom = 1;
let tool = 'arrow';
let size = 1;
let shapes = [];
let redoStack = [];
let cur = null;
let dirty = false;
let textAt = null;

// ---------- drawing ----------
function drawShape(ctx, s) {
  ctx.save();
  ctx.strokeStyle = s.c;
  ctx.fillStyle = s.c;
  ctx.lineWidth = s.w;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (s.t === 'arrow') {
    const dx = s.x2 - s.x1;
    const dy = s.y2 - s.y1;
    const len = Math.hypot(dx, dy);
    if (len > 0.5) {
      const head = Math.min(Math.max(14 * U, s.w * 4), len * 0.6);
      const ux = dx / len;
      const uy = dy / len;
      ctx.beginPath();
      ctx.moveTo(s.x1, s.y1);
      ctx.lineTo(s.x2 - ux * head * 0.7, s.y2 - uy * head * 0.7);
      ctx.stroke();
      const a = Math.atan2(dy, dx);
      ctx.beginPath();
      ctx.moveTo(s.x2, s.y2);
      ctx.lineTo(s.x2 - head * Math.cos(a - 0.45), s.y2 - head * Math.sin(a - 0.45));
      ctx.lineTo(s.x2 - head * Math.cos(a + 0.45), s.y2 - head * Math.sin(a + 0.45));
      ctx.closePath();
      ctx.fill();
    }
  } else if (s.t === 'hl') {
    ctx.globalAlpha = 0.38;
    ctx.fillRect(Math.min(s.x1, s.x2), Math.min(s.y1, s.y2), Math.abs(s.x2 - s.x1), Math.abs(s.y2 - s.y1));
  } else if (s.t === 'box') {
    ctx.strokeRect(Math.min(s.x1, s.x2), Math.min(s.y1, s.y2), Math.abs(s.x2 - s.x1), Math.abs(s.y2 - s.y1));
  } else if (s.t === 'pen') {
    ctx.beginPath();
    s.pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.stroke();
  } else if (s.t === 'text') {
    ctx.font = `600 ${s.size}px -apple-system, Helvetica, sans-serif`;
    ctx.textBaseline = 'top';
    ctx.fillText(s.text, s.x1, s.y1);
  }
  ctx.restore();
}
function render() {
  ictx.clearRect(0, 0, W, H);
  shapes.forEach((s) => drawShape(ictx, s));
  if (cur) drawShape(ictx, cur);
  $('undo').disabled = !shapes.length;
  $('redo').disabled = !redoStack.length;
}
function setDirty(v) {
  if (dirty === v) return;
  dirty = v;
  api.send('editor:dirty', v);
}
function addShape(s) {
  shapes.push(s);
  redoStack = [];
  setDirty(true);
  render();
}
function undo() {
  if (!shapes.length) return;
  redoStack.push(shapes.pop());
  setDirty(true);
  render();
}
function redo() {
  if (!redoStack.length) return;
  shapes.push(redoStack.pop());
  setDirty(true);
  render();
}

// ---------- pointer input ----------
function pos(e) {
  const r = ink.getBoundingClientRect();
  return { x: ((e.clientX - r.left) * W) / r.width, y: ((e.clientY - r.top) * H) / r.height };
}
ink.addEventListener('pointerdown', (e) => {
  if (e.button !== 0) return;
  e.preventDefault();
  if (tool === 'text') return placeText(e);
  commitText();
  const p = pos(e);
  cur = { t: tool, c: colors[tool], w: WIDTHS[size] * U, x1: p.x, y1: p.y, x2: p.x, y2: p.y, pts: [p] };
  ink.setPointerCapture(e.pointerId);
});
ink.addEventListener('pointermove', (e) => {
  if (!cur) return;
  const p = pos(e);
  if (cur.t !== 'pen' && e.shiftKey && cur.t === 'arrow') {
    // Shift snaps arrows to horizontal / vertical
    if (Math.abs(p.x - cur.x1) > Math.abs(p.y - cur.y1)) p.y = cur.y1; else p.x = cur.x1;
  }
  cur.x2 = p.x;
  cur.y2 = p.y;
  cur.pts.push(p);
  render();
});
function endStroke() {
  if (!cur) return;
  const s = cur;
  cur = null;
  const moved = Math.hypot(s.x2 - s.x1, s.y2 - s.y1) > 3 * U || (s.t === 'pen' && s.pts.length > 2);
  if (s.t !== 'pen') delete s.pts;
  if (moved) addShape(s); else render();
}
ink.addEventListener('pointerup', endStroke);
ink.addEventListener('pointercancel', endStroke);

// ---------- text tool ----------
function placeText(e) {
  commitText();
  const p = pos(e);
  const r = wrap.getBoundingClientRect();
  const px = FONTS[size] * U;
  textAt = { p, px, c: colors.text };
  textIn.value = '';
  textIn.hidden = false;
  Object.assign(textIn.style, {
    left: `${e.clientX - r.left - 3}px`,
    top: `${e.clientY - r.top - 1}px`,
    fontSize: `${(px * r.width) / W}px`,
    color: colors.text,
    width: `${Math.max(80, r.right - e.clientX - 6)}px`,
  });
  setTimeout(() => textIn.focus(), 0);
}
function commitText() {
  if (textIn.hidden || !textAt) return;
  const v = textIn.value.trim();
  const t = textAt;
  textAt = null;
  textIn.hidden = true;
  if (v) addShape({ t: 'text', c: t.c, x1: t.p.x, y1: t.p.y, text: v, size: t.px });
}
textIn.addEventListener('keydown', (e) => {
  e.stopPropagation();
  if (e.key === 'Enter') commitText();
  if (e.key === 'Escape') { textIn.value = ''; commitText(); }
});
textIn.addEventListener('blur', commitText);

// ---------- toolbar ----------
function refreshBar() {
  document.querySelectorAll('#tools button').forEach((b) => b.classList.toggle('on', b.dataset.tool === tool));
  document.querySelectorAll('#sizes button').forEach((b) => b.classList.toggle('on', Number(b.dataset.size) === size));
  document.querySelectorAll('#colors button').forEach((b) => b.classList.toggle('on', b.dataset.color === colors[tool]));
  ink.style.cursor = tool === 'text' ? 'text' : 'crosshair';
}
function setTool(t) { commitText(); tool = t; refreshBar(); }
document.querySelectorAll('#tools button').forEach((b) => { b.onclick = () => setTool(b.dataset.tool); });
document.querySelectorAll('#sizes button').forEach((b) => { b.onclick = () => { size = Number(b.dataset.size); refreshBar(); }; });
for (const c of PALETTE) {
  const b = document.createElement('button');
  b.className = 'sw';
  b.dataset.color = c;
  b.style.background = c;
  b.onclick = () => { colors[tool] = c; refreshBar(); };
  $('colors').append(b);
}
$('undo').onclick = undo;
$('redo').onclick = redo;

// ---------- zoom ----------
function setZoom(z) {
  zoom = Math.min(4, Math.max(0.05, z));
  wrap.style.width = `${(W / U) * zoom}px`;
  wrap.style.height = `${(H / U) * zoom}px`;
  $('zoomLbl').textContent = `${Math.round(zoom * 100)}%`;
}
function fit() {
  const availW = stage.clientWidth - 36;
  const availH = stage.clientHeight - 36;
  let z = Math.min(1, availW / (W / U));
  if (H / W < 2.5) z = Math.min(z, availH / (H / U)); // long scrolling captures fit width only
  setZoom(z);
}
$('zoomIn').onclick = () => setZoom(zoom * 1.25);
$('zoomOut').onclick = () => setZoom(zoom / 1.25);
$('zoomFit').onclick = fit;

// ---------- output ----------
let toastTimer = null;
function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 1600);
}
async function compose() {
  commitText();
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d');
  ctx.drawImage(base, 0, 0);
  ctx.drawImage(ink, 0, 0);
  const blob = await new Promise((res) => c.toBlob(res, 'image/png'));
  return new Uint8Array(await blob.arrayBuffer());
}
async function save() {
  try {
    await api.invoke('editor:save', file, await compose());
    setDirty(false);
    toast('Saved');
    return true;
  } catch (err) {
    toast(`Save failed: ${err.message || err}`);
    return false;
  }
}
async function saveAs() {
  const out = await api.invoke('editor:saveAs', file, await compose());
  if (!out) return;
  file = out;
  document.title = out.split('/').pop();
  setDirty(false);
  toast('Saved');
}
async function copyImage() {
  await api.invoke('editor:copy', await compose());
  toast('Copied to clipboard');
}
$('save').onclick = save;
$('saveAs').onclick = saveAs;
$('copy').onclick = copyImage;
$('reveal').onclick = () => api.send('file:reveal', file);
api.on('editor:saveAndClose', async () => { if (await save()) api.send('editor:close'); });

// ---------- keyboard ----------
const TOOL_KEYS = { a: 'arrow', h: 'hl', r: 'box', p: 'pen', t: 'text' };
window.addEventListener('keydown', (e) => {
  if (e.target === textIn) return;
  const k = e.key.toLowerCase();
  if (e.metaKey || e.ctrlKey) {
    if (k === 'z') { e.preventDefault(); if (e.shiftKey) redo(); else undo(); }
    if (k === 's') { e.preventDefault(); if (e.shiftKey) saveAs(); else save(); }
    return;
  }
  if (TOOL_KEYS[k]) setTool(TOOL_KEYS[k]);
});
document.addEventListener('copy', (e) => {
  if (e.target === textIn) return;
  e.preventDefault();
  copyImage();
});

// ---------- load ----------
(async () => {
  try {
    const bytes = await api.invoke('editor:read', file);
    const bmp = await createImageBitmap(new Blob([bytes], { type: 'image/png' }));
    W = bmp.width;
    H = bmp.height;
    base.width = ink.width = W;
    base.height = ink.height = H;
    base.getContext('2d').drawImage(bmp, 0, 0);
    document.title = file.split('/').pop();
    fit();
    refreshBar();
    render();
  } catch (err) {
    toast(`Could not open the image: ${err.message || err}`);
  }
})();
