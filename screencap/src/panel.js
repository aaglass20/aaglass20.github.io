'use strict';
const dot = document.getElementById('dot');
const statusEl = document.getElementById('status');
const stopBtn = document.getElementById('stop');
const cancelBtn = document.getElementById('cancel');
const MAX_SCROLL_PX = 20000;

let cfg = null;
let stream = null;
let video = null;
let crop = null;
let scale = 1;
let onStop = () => api.send('panel:cancel');
let finished = false;

const even = (n) => Math.max(2, n - (n % 2));
function releaseStream() {
  if (stream) stream.getTracks().forEach((t) => t.stop());
  stream = null;
}

api.on('panel:init', async (c) => {
  cfg = c;
  stopBtn.textContent = c.mode === 'video' ? 'Stop' : 'Done';
  try {
    await start();
  } catch (err) {
    releaseStream();
    api.send('panel:error', `Could not start the capture: ${(err && err.message) || err}`);
  }
});
api.on('panel:stop', () => onStop());
stopBtn.onclick = () => onStop();
cancelBtn.onclick = () => { finished = true; releaseStream(); api.send('panel:cancel'); };

async function start() {
  stream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30 }, audio: false });
  video = document.createElement('video');
  video.muted = true;
  video.srcObject = stream;
  await video.play();
  await new Promise((r) => setTimeout(r, 350));
  scale = video.videoWidth / cfg.display.width;
  const x = Math.min(Math.round(cfg.sel.x * scale), video.videoWidth - 2);
  const y = Math.min(Math.round(cfg.sel.y * scale), video.videoHeight - 2);
  crop = {
    x, y,
    w: even(Math.min(Math.round(cfg.sel.width * scale), video.videoWidth - x)),
    h: even(Math.min(Math.round(cfg.sel.height * scale), video.videoHeight - y)),
  };
  if (cfg.mode === 'video') await startVideo();
  else startScroll();
}

// ---------- region video ----------
async function startVideo() {
  const canvas = document.createElement('canvas');
  canvas.width = crop.w;
  canvas.height = crop.h;
  const ctx = canvas.getContext('2d', { alpha: false });
  const draw = () => ctx.drawImage(video, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);
  draw();
  const drawTimer = setInterval(draw, 1000 / 30);

  const mime = ['video/mp4;codecs=avc1.640028', 'video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm']
    .find((m) => MediaRecorder.isTypeSupported(m));
  if (!mime) throw new Error('No supported video format.');
  await api.invoke('panel:videoStart', mime.startsWith('video/mp4') ? 'mp4' : 'webm');

  const rec = new MediaRecorder(canvas.captureStream(30), { mimeType: mime, videoBitsPerSecond: 8_000_000 });
  let queue = Promise.resolve();
  rec.ondataavailable = (e) => {
    if (!e.data.size) return;
    queue = queue.then(async () => api.send('panel:videoChunk', new Uint8Array(await e.data.arrayBuffer())));
  };
  rec.onstop = () => {
    clearInterval(drawTimer);
    clearInterval(clock);
    releaseStream();
    queue.then(() => api.invoke('panel:videoEnd'));
  };
  rec.onerror = (e) => api.send('panel:error', `Recording failed: ${e.error || 'unknown error'}`);
  rec.start(1000);

  const t0 = Date.now();
  dot.classList.add('live');
  const tick = () => {
    const s = Math.floor((Date.now() - t0) / 1000);
    statusEl.textContent = `Recording  ${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  };
  tick();
  const clock = setInterval(tick, 500);
  onStop = () => {
    if (finished) return;
    finished = true;
    statusEl.textContent = 'Saving…';
    rec.stop();
  };
}

// ---------- scrolling capture ----------
// Grab the region repeatedly while the user scrolls, work out how far the content moved
// between frames, and append only the new rows.
function startScroll() {
  const W = crop.w;
  const H = crop.h;
  const work = document.createElement('canvas');
  work.width = W;
  work.height = H;
  const wctx = work.getContext('2d', { willReadFrequently: true, alpha: false });
  const COLS = 32;
  const x0 = Math.floor(W * 0.03);
  const x1 = Math.floor(W * 0.93); // skip the right edge where scrollbars appear
  const colX = Array.from({ length: COLS }, (_, i) => x0 + Math.floor(((x1 - x0) * i) / (COLS - 1)));

  function grab() {
    wctx.drawImage(video, crop.x, crop.y, W, H, 0, 0, W, H);
    const d = wctx.getImageData(0, 0, W, H).data;
    const sig = new Uint8Array(H * COLS);
    for (let yy = 0; yy < H; yy++) {
      for (let c = 0; c < COLS; c++) {
        const i = (yy * W + colX[c]) * 4;
        sig[yy * COLS + c] = (d[i] * 3 + d[i + 1] * 6 + d[i + 2]) / 10;
      }
    }
    return sig;
  }
  // Mean difference between rows [dy..H) of `a` and rows [0..H-dy) of `b`; bails out early past `limit`.
  function diff(a, b, dy, limit) {
    const rows = H - dy;
    const step = Math.max(1, Math.floor(rows / 160));
    const total = Math.ceil(rows / step) * COLS;
    const cap = limit * total;
    let sum = 0;
    for (let r = 0; r < rows; r += step) {
      const ao = (r + dy) * COLS;
      const bo = r * COLS;
      for (let c = 0; c < COLS; c++) sum += Math.abs(a[ao + c] - b[bo + c]);
      if (sum > cap) return Infinity;
    }
    return sum / total;
  }

  let prev = grab();
  const pieces = [wctx.getImageData(0, 0, W, H)];
  let totalH = H;
  let misses = 0;
  let timer = null;
  const maxDy = H - Math.max(24, Math.floor(H * 0.12));

  const show = (warn) => {
    dot.classList.toggle('warn', !!warn);
    statusEl.textContent = warn
      ? 'Lost my place — scroll back up a little, then go slower'
      : `Scroll down slowly  ·  ${Math.round(totalH / scale).toLocaleString()} px captured`;
  };
  show(false);

  function tick() {
    if (finished) return;
    const cur = grab();
    if (diff(prev, cur, 0, 1.0) >= 1.0) {
      let best = Infinity;
      let bestDy = 0;
      for (let dy = 1; dy <= maxDy; dy++) {
        const e = diff(prev, cur, dy, Math.min(best - 0.3, 6));
        if (e < best - 0.3) { best = e; bestDy = dy; }
      }
      if (bestDy > 0 && best < 5) {
        pieces.push(wctx.getImageData(0, H - bestDy, W, bestDy));
        totalH += bestDy;
        prev = cur;
        misses = 0;
        show(false);
        if (totalH >= MAX_SCROLL_PX) return finish();
      } else if (++misses >= 4) {
        show(true);
      }
    }
    timer = setTimeout(tick, 90);
  }
  timer = setTimeout(tick, 90);

  function finish() {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    releaseStream();
    statusEl.textContent = 'Building image…';
    const out = document.createElement('canvas');
    out.width = W;
    out.height = totalH;
    const octx = out.getContext('2d');
    let yy = 0;
    for (const p of pieces) { octx.putImageData(p, 0, yy); yy += p.height; }
    out.toBlob(async (blob) => {
      try {
        await api.invoke('panel:scrollDone', new Uint8Array(await blob.arrayBuffer()), scale);
      } catch (err) {
        api.send('panel:error', `Could not save the scrolling capture: ${err.message || err}`);
      }
    }, 'image/png');
  }
  onStop = finish;
}
