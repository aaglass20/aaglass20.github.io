'use strict';
const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};
const ICONS = { region: '⬚', scroll: '⇵', window: '▭', screen: '▣', video: '●' };
const SYMBOLS = { Command: '⌘', Cmd: '⌘', CommandOrControl: '⌘', Control: '⌃', Ctrl: '⌃', Alt: '⌥', Option: '⌥', Shift: '⇧' };
const pretty = (acc) => (acc ? acc.split('+').map((k) => SYMBOLS[k] || k).join(' ') : 'Not set');

let state = null;
let recording = null; // mode whose shortcut is being recorded

function renderModes() {
  const box = $('modes');
  box.replaceChildren();
  for (const [mode, label] of Object.entries(state.modes)) {
    const b = el('button', `mode ${mode}`);
    b.append(el('span', 'ico', ICONS[mode]), el('span', 'lbl', label), el('span', 'key', pretty(state.settings.shortcuts[mode])));
    b.onclick = () => api.send('capture:start', mode);
    box.append(b);
  }
}

function renderSettings() {
  const box = $('settings');
  box.replaceChildren();
  for (const [mode, label] of Object.entries(state.modes)) {
    const failed = state.failures.includes(mode);
    const btn = el('button', 'keybtn' + (failed ? ' bad' : ''), recording === mode ? 'Press keys…' : pretty(state.settings.shortcuts[mode]));
    if (recording === mode) btn.classList.add('rec');
    if (failed) btn.title = 'macOS or another app already uses this shortcut — pick a different one.';
    btn.onclick = () => startRecording(mode);
    const cell = el('div');
    cell.append(btn);
    if (failed) cell.append(el('span', 'path', 'In use by another app'));
    box.append(el('div', 'k', `${label} shortcut`), cell);
  }

  const dirCell = el('div');
  const change = el('button', '', 'Change…');
  change.onclick = async () => { state = await api.invoke('dir:choose'); render(); };
  dirCell.append(change, el('span', 'path', state.saveDir));
  box.append(el('div', 'k', 'Save captures to'), dirCell);

  for (const [key, text] of [['copyToClipboard', 'Copy each screenshot to the clipboard'], ['openEditor', 'Open the markup editor after each screenshot']]) {
    const lab = el('label', 'chk');
    const cb = el('input');
    cb.type = 'checkbox';
    cb.checked = !!state.settings[key];
    cb.onchange = async () => { state = await api.invoke('settings:set', { [key]: cb.checked }); };
    lab.append(cb, el('span', '', text));
    box.append(el('div', 'k', ''), lab);
  }
}

async function renderRecents() {
  const list = await api.invoke('recents:list');
  const box = $('recents');
  box.replaceChildren();
  if (!list.length) {
    box.append(el('div', 'empty', 'Nothing yet — take a capture with a button above or a shortcut.'));
    return;
  }
  for (const item of list) {
    const tile = el('div', 'tile');
    const thumb = el('div', 'thumb');
    const media = el(item.video ? 'video' : 'img');
    media.src = item.url;
    if (item.video) { media.muted = true; media.preload = 'metadata'; tile.append(el('span', 'badge', 'VIDEO')); }
    thumb.append(media);
    const acts = el('div', 'acts');
    const reveal = el('button', '', 'Show');
    reveal.title = 'Show in Finder';
    reveal.onclick = (e) => { e.stopPropagation(); api.send('file:reveal', item.path); };
    const trash = el('button', '', '✕');
    trash.title = 'Move to Trash';
    trash.onclick = async (e) => { e.stopPropagation(); await api.invoke('file:trash', item.path); renderRecents(); };
    acts.append(reveal, trash);
    tile.append(thumb, el('div', 'name', item.name), acts);
    tile.title = item.video ? 'Open video' : 'Open in markup editor';
    tile.onclick = () => api.send('file:open', item.path);
    box.append(tile);
  }
}

function render() {
  $('perm').hidden = state.permission !== 'denied';
  renderModes();
  renderSettings();
}

// ----- shortcut recorder -----
function keyName(e) {
  const c = e.code;
  if (/^Key[A-Z]$/.test(c)) return c.slice(3);
  if (/^Digit\d$/.test(c)) return c.slice(5);
  if (/^F\d{1,2}$/.test(c)) return c;
  const map = {
    Space: 'Space', Enter: 'Return', Tab: 'Tab', ArrowUp: 'Up', ArrowDown: 'Down', ArrowLeft: 'Left', ArrowRight: 'Right',
    Minus: '-', Equal: '=', BracketLeft: '[', BracketRight: ']', Backslash: '\\', Semicolon: ';', Quote: "'",
    Comma: ',', Period: '.', Slash: '/', Backquote: '`', Home: 'Home', End: 'End', PageUp: 'PageUp', PageDown: 'PageDown',
  };
  return map[c] || null;
}
async function startRecording(mode) {
  if (recording) return;
  recording = mode;
  await api.invoke('shortcuts:suspend');
  renderSettings();
}
async function stopRecording(patch) {
  recording = null;
  state = patch ? await api.invoke('settings:set', { shortcuts: patch }) : await api.invoke('shortcuts:resume');
  render();
}
window.addEventListener('keydown', (e) => {
  if (!recording) return;
  e.preventDefault();
  const mods = [];
  if (e.metaKey) mods.push('Command');
  if (e.ctrlKey) mods.push('Control');
  if (e.altKey) mods.push('Alt');
  if (e.shiftKey) mods.push('Shift');
  if (e.code === 'Escape') return stopRecording(null);
  if ((e.code === 'Backspace' || e.code === 'Delete') && !mods.length) return stopRecording({ [recording]: '' });
  const key = keyName(e);
  if (!key) return; // modifier on its own, keep waiting
  if (!mods.length && !/^F\d+$/.test(key)) return; // need a modifier
  const acc = [...mods, key].join('+');
  const patch = { [recording]: acc };
  for (const [m, a] of Object.entries(state.settings.shortcuts)) if (m !== recording && a === acc) patch[m] = '';
  stopRecording(patch);
}, true);
window.addEventListener('blur', () => { if (recording) stopRecording(null); });

// ----- window picker -----
api.on('window:list', (list) => {
  const grid = $('pickGrid');
  grid.replaceChildren();
  if (!list.length) grid.append(el('div', 'empty', 'No windows found. If windows are open, check Screen Recording permission.'));
  for (const w of list) {
    const tile = el('div', 'tile');
    const thumb = el('div', 'thumb');
    const img = el('img');
    img.src = w.thumb;
    thumb.append(img);
    tile.append(thumb, el('div', 'name', w.name));
    tile.onclick = () => { $('picker').hidden = true; api.send('window:pick', w.id); };
    grid.append(tile);
  }
  $('picker').hidden = false;
  $('picker').scrollIntoView({ block: 'start' });
});
$('pickCancel').onclick = () => { $('picker').hidden = true; };
$('permBtn').onclick = () => api.invoke('permission:open');
$('openDir').onclick = () => api.send('file:reveal', state.saveDir);

api.on('recents:changed', renderRecents);
api.on('state:changed', async () => { state = await api.invoke('state:get'); render(); });
window.addEventListener('focus', async () => {
  if (recording) return;
  state = await api.invoke('state:get');
  render();
  renderRecents();
});

(async () => {
  state = await api.invoke('state:get');
  render();
  renderRecents();
})();
