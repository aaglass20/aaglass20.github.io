'use strict';
const {
  app, BrowserWindow, Menu, Tray, clipboard, desktopCapturer, dialog, globalShortcut,
  ipcMain, nativeImage, screen, session, shell, systemPreferences,
} = require('electron');
const { execFile } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { pathToFileURL } = require('url');

const SMOKE = !!process.env.SCREENCAP_SMOKE;
const MODES = {
  region: 'Region',
  scroll: 'Scrolling region',
  window: 'Window or app',
  screen: 'Entire screen',
  video: 'Record video',
};
const DEFAULTS = {
  shortcuts: {
    region: 'Control+Shift+1',
    scroll: 'Control+Shift+2',
    window: 'Control+Shift+3',
    screen: 'Control+Shift+4',
    video: 'Control+Shift+5',
  },
  saveDir: '',
  copyToClipboard: true,
  openEditor: true,
};
const PREFS = {
  preload: path.join(__dirname, 'preload.js'),
  contextIsolation: true,
  backgroundThrottling: false,
};

let settings = structuredClone(DEFAULTS);
let shortcutFailures = [];
let mainWin = null;
let mainReady = Promise.resolve();
let panelWin = null;
let panelMode = null;
let borderWin = null;
let tray = null;
let busy = false;
let streamDisplayId = null;
let video = null; // { file, fd }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const settingsFile = () => path.join(app.getPath('userData'), 'settings.json');

// ---------- settings ----------
function loadSettings() {
  try {
    const saved = JSON.parse(fs.readFileSync(settingsFile(), 'utf8'));
    settings = { ...DEFAULTS, ...saved, shortcuts: { ...DEFAULTS.shortcuts, ...(saved.shortcuts || {}) } };
  } catch { /* first run */ }
}
function saveSettings() {
  if (SMOKE) return;
  fs.mkdirSync(path.dirname(settingsFile()), { recursive: true });
  fs.writeFileSync(settingsFile(), JSON.stringify(settings, null, 2));
}
function saveDir() {
  const dir = settings.saveDir || path.join(app.getPath('pictures'), 'ScreenCap');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}
function screenStatus() {
  return process.platform === 'darwin' ? systemPreferences.getMediaAccessStatus('screen') : 'granted';
}
function publicState() {
  return { settings, saveDir: saveDir(), permission: screenStatus(), modes: MODES, failures: shortcutFailures };
}
function stamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} at ${p(d.getHours())}.${p(d.getMinutes())}.${p(d.getSeconds())}`;
}
function newFile(ext) {
  const dir = saveDir();
  let file = path.join(dir, `ScreenCap ${stamp()}.${ext}`);
  for (let i = 2; fs.existsSync(file); i++) file = path.join(dir, `ScreenCap ${stamp()} (${i}).${ext}`);
  return file;
}

// ---------- shortcuts + tray ----------
function registerShortcuts() {
  globalShortcut.unregisterAll();
  shortcutFailures = [];
  for (const [mode, acc] of Object.entries(settings.shortcuts)) {
    if (!acc || !MODES[mode]) continue;
    try {
      if (!globalShortcut.register(acc, () => startCapture(mode))) shortcutFailures.push(mode);
    } catch { shortcutFailures.push(mode); }
  }
  buildTray();
}
function buildTray() {
  if (!tray) {
    tray = new Tray(nativeImage.createEmpty());
    tray.setTitle('◎');
    tray.setToolTip('ScreenCap');
  }
  const items = Object.entries(MODES).map(([mode, label]) => {
    const acc = settings.shortcuts[mode];
    const item = { label, click: () => startCapture(mode) };
    if (acc && !shortcutFailures.includes(mode)) item.accelerator = acc;
    return item;
  });
  tray.setContextMenu(Menu.buildFromTemplate([
    ...items,
    { type: 'separator' },
    { label: 'Open ScreenCap', click: () => showMain() },
    { label: 'Open captures folder', click: () => shell.openPath(saveDir()) },
    { type: 'separator' },
    { label: 'Quit ScreenCap', role: 'quit' },
  ]));
}
function buildAppMenu() {
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label: 'ScreenCap', submenu: [{ role: 'about' }, { type: 'separator' }, { role: 'hide' }, { role: 'hideOthers' }, { type: 'separator' }, { role: 'quit' }] },
    { label: 'Edit', submenu: [{ role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' }] },
    { label: 'View', submenu: [{ role: 'reload' }, { role: 'toggleDevTools' }] },
    { label: 'Window', submenu: [{ role: 'minimize' }, { role: 'close' }] },
  ]));
}

// ---------- windows ----------
function showMain() {
  if (mainWin && !mainWin.isDestroyed()) {
    mainWin.show();
    mainWin.focus();
    return mainReady;
  }
  mainWin = new BrowserWindow({
    width: 880, height: 740, minWidth: 640, minHeight: 480,
    title: 'ScreenCap', backgroundColor: '#15171c', show: false, webPreferences: PREFS,
  });
  const win = mainWin;
  mainReady = new Promise((res) => win.webContents.once('did-finish-load', res));
  win.loadFile(path.join(__dirname, 'src/index.html'));
  win.once('ready-to-show', () => win.show());
  win.on('closed', () => { if (mainWin === win) mainWin = null; });
  return mainReady;
}
function sendMain(channel, ...args) {
  if (mainWin && !mainWin.isDestroyed()) mainWin.webContents.send(channel, ...args);
}
async function hideMain() {
  if (mainWin && !mainWin.isDestroyed() && mainWin.isVisible()) {
    mainWin.hide();
    await sleep(280);
  }
}

function openEditor(file, scale) {
  let size = { width: 800, height: 500 };
  try { size = nativeImage.createFromPath(file).getSize(); } catch { /* keep default */ }
  const s = scale || screen.getPrimaryDisplay().scaleFactor || 1;
  const wa = screen.getDisplayNearestPoint(screen.getCursorScreenPoint()).workArea;
  const width = Math.round(Math.min(Math.max(size.width / s + 48, 860), wa.width * 0.92));
  const height = Math.round(Math.min(Math.max(size.height / s + 120, 480), wa.height * 0.92));
  const win = new BrowserWindow({
    width, height, minWidth: 640, minHeight: 360,
    title: path.basename(file), backgroundColor: '#15171c', show: false, webPreferences: PREFS,
  });
  win.loadFile(path.join(__dirname, 'src/editor.html'), { query: { file, scale: String(s) } });
  win.once('ready-to-show', () => { win.show(); win.focus(); });
  win.on('close', (e) => {
    if (!win.dirty || win.forceClose) return;
    e.preventDefault();
    const r = dialog.showMessageBoxSync(win, {
      type: 'question', buttons: ['Save', 'Don’t Save', 'Cancel'], defaultId: 0, cancelId: 2,
      message: 'Save your markup before closing?',
    });
    if (r === 0) win.webContents.send('editor:saveAndClose');
    else if (r === 1) { win.forceClose = true; win.close(); }
  });
  return win;
}

// ---------- capture primitives ----------
async function grabDisplay(display) {
  const s = display.scaleFactor;
  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: { width: Math.round(display.size.width * s), height: Math.round(display.size.height * s) },
  });
  const src = sources.find((x) => x.display_id === String(display.id)) || sources[0];
  if (!src || src.thumbnail.isEmpty()) throw new Error('Could not read the screen. Check Screen Recording permission in System Settings.');
  return src.thumbnail;
}

function selectRegion(display, image, mode) {
  return new Promise((resolve) => {
    const b = display.bounds;
    const win = new BrowserWindow({
      x: b.x, y: b.y, width: b.width, height: b.height,
      frame: false, show: false, resizable: false, movable: false, minimizable: false, maximizable: false,
      fullscreenable: false, skipTaskbar: true, hasShadow: false, enableLargerThanScreen: true,
      roundedCorners: false, acceptFirstMouse: true, backgroundColor: '#000000', webPreferences: PREFS,
    });
    win.setAlwaysOnTop(true, 'screen-saver');
    win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true, skipTransformProcessType: true });
    let done = false;
    const finish = (rect) => {
      if (done) return;
      done = true;
      ipcMain.removeListener('overlay:done', onDone);
      ipcMain.removeListener('overlay:ready', onReady);
      if (!win.isDestroyed()) win.destroy();
      resolve(rect);
    };
    const onDone = (e, rect) => { if (!win.isDestroyed() && e.sender === win.webContents) finish(rect); };
    const onReady = (e) => {
      if (win.isDestroyed() || e.sender !== win.webContents) return;
      win.setBounds(b);
      win.show();
      win.focus();
      app.focus({ steal: true });
    };
    ipcMain.on('overlay:done', onDone);
    ipcMain.on('overlay:ready', onReady);
    win.on('closed', () => finish(null));
    win.webContents.once('did-finish-load', () => {
      win.webContents.send('overlay:init', {
        jpeg: image.toJPEG(90), mode, x: b.x, y: b.y, width: b.width, height: b.height,
      });
    });
    win.loadFile(path.join(__dirname, 'src/overlay.html'));
  });
}

async function finishCapture(imageOrBuffer, scale) {
  const buf = Buffer.isBuffer(imageOrBuffer) ? imageOrBuffer : imageOrBuffer.toPNG();
  const file = newFile('png');
  fs.writeFileSync(file, buf);
  if (settings.copyToClipboard) clipboard.writeImage(nativeImage.createFromBuffer(buf));
  sendMain('recents:changed');
  if (settings.openEditor) openEditor(file, scale);
  else await showMain();
  return file;
}

// ---------- window capture ----------
async function startWindowPick() {
  const own = BrowserWindow.getAllWindows().map((w) => w.getMediaSourceId());
  const sources = await desktopCapturer.getSources({ types: ['window'], thumbnailSize: { width: 480, height: 320 } });
  const list = sources
    .filter((s) => !own.includes(s.id) && !s.thumbnail.isEmpty())
    .map((s) => ({ id: s.id, name: s.name, thumb: s.thumbnail.toDataURL() }));
  await showMain();
  sendMain('window:list', list);
}

function captureWindowNative(sourceId) {
  // sourceId looks like "window:<CGWindowID>:0" — macOS's own tool gives a pixel-perfect shot.
  return new Promise((resolve, reject) => {
    const wid = String(sourceId).split(':')[1];
    if (process.platform !== 'darwin' || !/^\d+$/.test(wid || '')) return reject(new Error('no window id'));
    const tmp = path.join(os.tmpdir(), `screencap-${Date.now()}.png`);
    execFile('/usr/sbin/screencapture', ['-x', '-o', '-l', wid, tmp], (err) => {
      try {
        if (err) throw err;
        const buf = fs.readFileSync(tmp);
        fs.unlinkSync(tmp);
        if (!buf.length) throw new Error('empty');
        resolve(buf);
      } catch (e) { reject(e); }
    });
  });
}

async function captureWindow(sourceId) {
  await hideMain();
  const primary = screen.getPrimaryDisplay();
  let shot;
  try {
    shot = await captureWindowNative(sourceId);
  } catch {
    const s = primary.scaleFactor;
    const sources = await desktopCapturer.getSources({
      types: ['window'],
      thumbnailSize: { width: Math.round(primary.size.width * s), height: Math.round(primary.size.height * s) },
    });
    const src = sources.find((x) => x.id === sourceId);
    if (!src || src.thumbnail.isEmpty()) throw new Error('That window is no longer available.');
    shot = src.thumbnail;
  }
  await finishCapture(shot, primary.scaleFactor);
}

// ---------- recording / scroll panel ----------
function openPanel(mode, display, sel) {
  const b = display.bounds;
  const wa = display.workArea;
  const W = 420;
  const H = 60;
  const abs = { x: b.x + sel.x, y: b.y + sel.y, width: sel.width, height: sel.height };
  let y = abs.y + abs.height + 12;
  if (y + H > wa.y + wa.height) y = abs.y - H - 12;
  if (y < wa.y) y = abs.y + abs.height - H - 12;
  const x = Math.round(Math.min(Math.max(abs.x + abs.width / 2 - W / 2, wa.x + 8), wa.x + wa.width - W - 8));

  borderWin = new BrowserWindow({
    x: abs.x - 3, y: abs.y - 3, width: abs.width + 6, height: abs.height + 6,
    frame: false, transparent: true, hasShadow: false, focusable: false, resizable: false,
    skipTaskbar: true, enableLargerThanScreen: true, roundedCorners: false, show: false, webPreferences: PREFS,
  });
  borderWin.setIgnoreMouseEvents(true);
  borderWin.setAlwaysOnTop(true, 'screen-saver');
  borderWin.setContentProtection(true);
  borderWin.loadFile(path.join(__dirname, 'src/border.html'));
  const bw = borderWin;
  bw.once('ready-to-show', () => { if (!bw.isDestroyed()) bw.showInactive(); });

  panelMode = mode;
  streamDisplayId = display.id;
  panelWin = new BrowserWindow({
    x, y: Math.round(y), width: W, height: H,
    frame: false, resizable: false, minimizable: false, maximizable: false, fullscreenable: false,
    skipTaskbar: true, acceptFirstMouse: true, backgroundColor: '#1d2027', show: false, webPreferences: PREFS,
  });
  const pw = panelWin;
  pw.setAlwaysOnTop(true, 'screen-saver');
  pw.setContentProtection(true);
  pw.loadFile(path.join(__dirname, 'src/panel.html'));
  pw.webContents.once('did-finish-load', () => {
    if (pw.isDestroyed()) return;
    pw.showInactive();
    pw.webContents.send('panel:init', { mode, sel, display: display.size, scaleFactor: display.scaleFactor });
  });
  pw.on('closed', () => {
    if (panelWin === pw) { panelWin = null; panelMode = null; }
    if (borderWin && !borderWin.isDestroyed()) borderWin.destroy();
    borderWin = null;
    discardVideo();
  });
}
function closePanel() {
  if (panelWin && !panelWin.isDestroyed()) panelWin.destroy();
}
function discardVideo() {
  if (!video) return;
  try { fs.closeSync(video.fd); } catch { /* already closed */ }
  try { fs.unlinkSync(video.file); } catch { /* nothing written */ }
  video = null;
}

// ---------- main entry for every capture mode ----------
async function startCapture(mode) {
  if (panelWin) {
    // Pressing the shortcut again finishes what is running.
    if (mode === panelMode) panelWin.webContents.send('panel:stop');
    return;
  }
  if (busy) return;
  busy = true;
  try {
    if (screenStatus() === 'denied') {
      await showMain();
      sendMain('state:changed');
      return;
    }
    if (mode === 'window') { await startWindowPick(); return; }
    const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
    await hideMain();
    const img = await grabDisplay(display);
    if (mode === 'screen') { await finishCapture(img, display.scaleFactor); return; }
    const sel = await selectRegion(display, img, mode);
    if (!sel) return;
    if (mode === 'region') {
      const k = img.getSize().width / display.size.width;
      const crop = img.crop({
        x: Math.round(sel.x * k), y: Math.round(sel.y * k),
        width: Math.max(1, Math.round(sel.width * k)), height: Math.max(1, Math.round(sel.height * k)),
      });
      await finishCapture(crop, k);
      return;
    }
    await sleep(150); // let the selection overlay leave the screen
    openPanel(mode, display, sel);
  } catch (err) {
    dialog.showErrorBox('ScreenCap', String((err && err.message) || err));
  } finally {
    busy = false;
  }
}

// ---------- IPC ----------
function setupIpc() {
  ipcMain.handle('state:get', () => publicState());
  ipcMain.handle('settings:set', (_e, patch) => {
    const p = patch || {};
    if (p.shortcuts) settings.shortcuts = { ...settings.shortcuts, ...p.shortcuts };
    for (const k of ['copyToClipboard', 'openEditor']) if (typeof p[k] === 'boolean') settings[k] = p[k];
    if (typeof p.saveDir === 'string') settings.saveDir = p.saveDir;
    saveSettings();
    registerShortcuts();
    return publicState();
  });
  ipcMain.handle('shortcuts:suspend', () => globalShortcut.unregisterAll());
  ipcMain.handle('shortcuts:resume', () => { registerShortcuts(); return publicState(); });
  ipcMain.handle('dir:choose', async () => {
    const r = await dialog.showOpenDialog(mainWin, { properties: ['openDirectory', 'createDirectory'], defaultPath: saveDir() });
    if (r.canceled || !r.filePaths[0]) return publicState();
    settings.saveDir = r.filePaths[0];
    saveSettings();
    return publicState();
  });
  ipcMain.handle('permission:open', () =>
    shell.openExternal('x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture'));

  ipcMain.on('capture:start', (_e, mode) => { if (MODES[mode]) startCapture(mode); });
  ipcMain.on('window:pick', (_e, id) => {
    captureWindow(id).catch((err) => dialog.showErrorBox('ScreenCap', String(err.message || err)));
  });

  ipcMain.handle('recents:list', () => {
    const dir = saveDir();
    return fs.readdirSync(dir)
      .filter((n) => /\.(png|mp4|webm)$/i.test(n))
      .map((name) => {
        const file = path.join(dir, name);
        const st = fs.statSync(file);
        return { path: file, name, video: !/\.png$/i.test(name), mtime: st.mtimeMs, url: `${pathToFileURL(file).href}?t=${Math.round(st.mtimeMs)}` };
      })
      .sort((a, b) => b.mtime - a.mtime)
      .slice(0, 60);
  });
  ipcMain.on('file:open', (_e, file) => {
    if (/\.png$/i.test(file)) openEditor(file);
    else shell.openPath(file);
  });
  ipcMain.on('file:reveal', (_e, file) => shell.showItemInFolder(file));
  ipcMain.handle('file:trash', async (_e, file) => {
    if (path.dirname(file) === saveDir()) await shell.trashItem(file);
  });

  ipcMain.handle('editor:read', (_e, file) => fs.readFileSync(file));
  ipcMain.handle('editor:save', (_e, file, bytes) => {
    if (!/\.png$/i.test(file)) throw new Error('Only PNG files can be saved.');
    fs.writeFileSync(file, Buffer.from(bytes));
    sendMain('recents:changed');
    return file;
  });
  ipcMain.handle('editor:saveAs', async (e, file, bytes) => {
    const win = BrowserWindow.fromWebContents(e.sender);
    const r = await dialog.showSaveDialog(win, { defaultPath: file, filters: [{ name: 'PNG image', extensions: ['png'] }] });
    if (r.canceled || !r.filePath) return null;
    fs.writeFileSync(r.filePath, Buffer.from(bytes));
    sendMain('recents:changed');
    return r.filePath;
  });
  ipcMain.handle('editor:copy', (_e, bytes) => clipboard.writeImage(nativeImage.createFromBuffer(Buffer.from(bytes))));
  ipcMain.on('editor:dirty', (e, dirty) => {
    const win = BrowserWindow.fromWebContents(e.sender);
    if (win) { win.dirty = !!dirty; win.setDocumentEdited(!!dirty); }
  });
  ipcMain.on('editor:close', (e) => {
    const win = BrowserWindow.fromWebContents(e.sender);
    if (win) { win.forceClose = true; win.close(); }
  });

  ipcMain.handle('panel:videoStart', (_e, ext) => {
    discardVideo();
    const file = newFile(ext === 'mp4' ? 'mp4' : 'webm');
    video = { file, fd: fs.openSync(file, 'w') };
    return file;
  });
  ipcMain.on('panel:videoChunk', (_e, bytes) => { if (video) fs.writeSync(video.fd, Buffer.from(bytes)); });
  ipcMain.handle('panel:videoEnd', async () => {
    const v = video;
    video = null;
    if (v) fs.closeSync(v.fd);
    closePanel();
    await showMain();
    sendMain('recents:changed');
    return v && v.file;
  });
  ipcMain.handle('panel:scrollDone', async (_e, bytes, scale) => {
    closePanel();
    await finishCapture(Buffer.from(bytes), scale);
  });
  ipcMain.on('panel:cancel', () => closePanel());
  ipcMain.on('panel:error', (_e, msg) => {
    closePanel();
    dialog.showErrorBox('ScreenCap', String(msg));
  });
}

// ---------- boot ----------
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => showMain());
  app.on('window-all-closed', () => { /* keep running in the menu bar */ });
  app.on('activate', () => showMain());
  app.on('will-quit', () => globalShortcut.unregisterAll());

  if (SMOKE) {
    app.on('web-contents-created', (_e, wc) => {
      wc.on('console-message', (e, _level, message) => console.log('[renderer]', e.message ?? message));
      wc.on('preload-error', (_ev, _p, err) => console.log('[preload-error]', err));
      wc.on('did-fail-load', (_ev, code, desc, url) => console.log('[load-failed]', code, desc, url));
      wc.on('render-process-gone', (_ev, d) => console.log('[renderer-gone]', d.reason));
    });
  }

  app.whenReady().then(async () => {
    loadSettings();
    if (SMOKE) {
      settings.saveDir = fs.mkdtempSync(path.join(os.tmpdir(), 'screencap-smoke-'));
      settings.copyToClipboard = false;
    }
    session.defaultSession.setDisplayMediaRequestHandler(async (_request, callback) => {
      try {
        const sources = await desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: 0, height: 0 } });
        const src = sources.find((s) => s.display_id === String(streamDisplayId)) || sources[0];
        callback({ video: src });
      } catch { callback({}); }
    });
    setupIpc();
    buildAppMenu();
    registerShortcuts();
    await showMain();

    if (SMOKE) {
      console.log('[smoke] shortcut failures:', JSON.stringify(shortcutFailures));
      const px = Buffer.alloc(640 * 400 * 4, 180);
      await finishCapture(nativeImage.createFromBitmap(px, { width: 640, height: 400 }), 2);
      setTimeout(() => { console.log('[smoke] done'); app.exit(0); }, 4000);
    }
  });
}
