// Louder Than Life — Spotify Playlist Builder
// Single-page app, PKCE auth, idempotent playlist sync with diff tracking.

// Public Spotify Client ID (not a secret — PKCE flow uses no client_secret).
const DEFAULT_CLIENT_ID = "86d37036b28445fcb3dba2269c80d048";

const DAYS = ["Thursday", "Friday", "Saturday", "Sunday"];
const SCOPES = [
  "playlist-modify-public",
  "playlist-modify-private",
  "playlist-read-private",
  "user-read-private",
].join(" ");
const AUTH_URL = "https://accounts.spotify.com/authorize";
const TOKEN_URL = "https://accounts.spotify.com/api/token";
const API = "https://api.spotify.com/v1";

const LS = {
  clientId: "ltl_client_id",
  year: "ltl_year",
  accessToken: "ltl_access_token",
  refreshToken: "ltl_refresh_token",
  tokenExpiresAt: "ltl_token_expires_at",
  pkceVerifier: "ltl_pkce_verifier",
  oauthState: "ltl_oauth_state",
  userId: "ltl_user_id",
  syncState: "ltl_sync_state",     // persisted per year
  lineupDraft: "ltl_lineup_draft", // textarea drafts per year
};

// -------- utilities --------

const $ = (sel) => document.querySelector(sel);
const redirectUri = () => location.origin + location.pathname;

function log(msg, level = "") {
  const el = $("#log");
  const line = document.createElement("div");
  if (level) line.className = level;
  line.textContent = msg;
  el.appendChild(line);
  el.scrollTop = el.scrollHeight;
}

function clearLog() { $("#log").innerHTML = ""; }

function randomString(len = 64) {
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => ("0" + b.toString(16)).slice(-2)).join("").slice(0, len);
}

function base64url(bytes) {
  const b64 = btoa(String.fromCharCode(...new Uint8Array(bytes)));
  return b64.replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

async function sha256(str) {
  const data = new TextEncoder().encode(str);
  return crypto.subtle.digest("SHA-256", data);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Spotify's search is sensitive to diacritics / punctuation. Normalize for comparisons.
function normalize(s) {
  return s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "");
}

// -------- state (per-year sync state) --------

function getSyncState(year) {
  const all = JSON.parse(localStorage.getItem(LS.syncState) || "{}");
  return all[year] || {
    year,
    // per day: { playlistId, playlistName, artists: { [artistId]: { name, trackUris: [] } } }
    days: Object.fromEntries(DAYS.map((d) => [d, { playlistId: null, playlistName: null, artists: {} }])),
    // mapping of normalized-input-name → resolved artistId (cache across syncs)
    resolved: {},
  };
}

function saveSyncState(state) {
  const all = JSON.parse(localStorage.getItem(LS.syncState) || "{}");
  all[state.year] = state;
  localStorage.setItem(LS.syncState, JSON.stringify(all));
}

// -------- PKCE + auth --------

async function startAuthFlow() {
  const clientId = $("#client-id").value.trim();
  if (!clientId) { log("Enter your Spotify Client ID first.", "err"); return; }
  localStorage.setItem(LS.clientId, clientId);

  const verifier = randomString(96);
  const challenge = base64url(await sha256(verifier));
  const state = randomString(32);
  localStorage.setItem(LS.pkceVerifier, verifier);
  localStorage.setItem(LS.oauthState, state);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri(),
    code_challenge_method: "S256",
    code_challenge: challenge,
    state,
    scope: SCOPES,
  });
  location.href = `${AUTH_URL}?${params.toString()}`;
}

async function handleRedirect() {
  const params = new URLSearchParams(location.search);
  const code = params.get("code");
  const state = params.get("state");
  const error = params.get("error");

  if (error) {
    log(`Spotify auth error: ${error}`, "err");
    history.replaceState({}, "", redirectUri());
    return;
  }
  if (!code) return;

  const storedState = localStorage.getItem(LS.oauthState);
  if (!storedState || storedState !== state) {
    log("OAuth state mismatch — refusing token exchange.", "err");
    history.replaceState({}, "", redirectUri());
    return;
  }
  const verifier = localStorage.getItem(LS.pkceVerifier);
  const clientId = localStorage.getItem(LS.clientId);

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri(),
    client_id: clientId,
    code_verifier: verifier,
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    log(`Token exchange failed: ${res.status} ${await res.text()}`, "err");
    return;
  }
  const tok = await res.json();
  persistTokens(tok);
  localStorage.removeItem(LS.pkceVerifier);
  localStorage.removeItem(LS.oauthState);
  history.replaceState({}, "", redirectUri());
  log("Connected to Spotify.", "ok");
  await loadMe();
  renderAuthStatus();
}

function persistTokens(tok) {
  localStorage.setItem(LS.accessToken, tok.access_token);
  if (tok.refresh_token) localStorage.setItem(LS.refreshToken, tok.refresh_token);
  localStorage.setItem(LS.tokenExpiresAt, String(Date.now() + tok.expires_in * 1000));
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem(LS.refreshToken);
  const clientId = localStorage.getItem(LS.clientId);
  if (!refreshToken || !clientId) throw new Error("No refresh token");
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error(`Refresh failed: ${res.status}`);
  persistTokens(await res.json());
}

function isAuthed() {
  return !!localStorage.getItem(LS.accessToken);
}

async function tokenIfFresh() {
  const exp = Number(localStorage.getItem(LS.tokenExpiresAt) || 0);
  if (Date.now() > exp - 30_000) await refreshAccessToken();
  return localStorage.getItem(LS.accessToken);
}

function disconnect() {
  for (const k of [LS.accessToken, LS.refreshToken, LS.tokenExpiresAt, LS.userId]) {
    localStorage.removeItem(k);
  }
  renderAuthStatus();
  log("Disconnected.", "muted");
}

async function loadMe() {
  const me = await api("/me");
  localStorage.setItem(LS.userId, me.id);
  return me;
}

// -------- generic API call with refresh + 429 handling --------

async function api(path, opts = {}) {
  let token = await tokenIfFresh();
  const doFetch = () => fetch(path.startsWith("http") ? path : API + path, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
    body: opts.body && typeof opts.body !== "string" ? JSON.stringify(opts.body) : opts.body,
  });

  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await doFetch();
    if (res.status === 401 && attempt === 0) {
      await refreshAccessToken();
      token = localStorage.getItem(LS.accessToken);
      continue;
    }
    if (res.status === 429) {
      const wait = Number(res.headers.get("Retry-After") || 1) * 1000;
      log(`Rate limited, waiting ${wait}ms…`, "warn");
      await sleep(wait);
      continue;
    }
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`${res.status} ${path}: ${text}`);
    }
    if (res.status === 204) return null;
    const ct = res.headers.get("Content-Type") || "";
    return ct.includes("application/json") ? res.json() : res.text();
  }
  throw new Error(`Gave up after retries: ${path}`);
}

// -------- lineup parsing --------

// -------- fetch lineup from louderthanlifefestival.com --------

// The festival site is behind Cloudflare, so browsers can't fetch it directly (CORS + WAF).
// codetabs' public proxy passes the Cloudflare check where corsproxy.io / allorigins do not.
const LTL_URL = "https://louderthanlifefestival.com/lineup/";
const CORS_PROXY = "https://api.codetabs.com/v1/proxy?quest=";

// Parse the lineup page HTML and return:
//   { lineup: { Thursday: [name,...], ... }, resolved: { normalizedName: {id,name,popularity} } }
// Artist cards on the page carry data-name, data-day-playing, and (sometimes) data-spotify
// with a direct "https://open.spotify.com/artist/{id}" URL — when present we skip Spotify search.
function parseLineupHtml(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const cards = doc.querySelectorAll("[data-day-playing][data-name]");
  const byDay = Object.fromEntries(DAYS.map((d) => [d, new Map()])); // name key → display name
  const resolved = {};
  let withId = 0;
  for (const el of cards) {
    const name = (el.getAttribute("data-name") || "").trim();
    const dayRaw = (el.getAttribute("data-day-playing") || "").trim().toLowerCase();
    if (!name || !dayRaw) continue;
    const day = DAYS.find((d) => d.toLowerCase() === dayRaw);
    if (!day) continue;
    const key = normalize(name);
    if (!byDay[day].has(key)) byDay[day].set(key, name);
    const spotifyUrl = el.getAttribute("data-spotify") || "";
    const m = spotifyUrl.match(/open\.spotify\.com\/artist\/([A-Za-z0-9]+)/);
    if (m && !resolved[key]) {
      resolved[key] = { id: m[1], name, popularity: 100 };
      withId++;
    }
  }
  const lineup = Object.fromEntries(DAYS.map((d) => [d, [...byDay[d].values()].sort((a, b) => a.localeCompare(b))]));
  return { lineup, resolved, total: cards.length, withId };
}

async function fetchLineupFromLtl() {
  const btn = $("#fetch-lineup-btn");
  const status = $("#fetch-status");
  btn.disabled = true;
  status.textContent = "Fetching…";
  try {
    const res = await fetch(CORS_PROXY + encodeURIComponent(LTL_URL));
    if (!res.ok) throw new Error(`proxy returned ${res.status}`);
    const html = await res.text();
    const { lineup, resolved, total, withId } = parseLineupHtml(html);
    const sum = DAYS.reduce((s, d) => s + lineup[d].length, 0);
    if (!sum) throw new Error("no artists found in page (site layout may have changed)");

    for (const d of DAYS) $(`#lineup-${d}`).value = lineup[d].join("\n");
    updateDayCounts();
    saveDrafts();

    // Pre-populate the resolved cache on the current year's sync state so sync skips search for these.
    const year = Number($("#year").value);
    const state = getSyncState(year);
    state.resolved = { ...(state.resolved || {}), ...resolved };
    saveSyncState(state);

    status.textContent = `${total} cards, ${sum} artists across ${DAYS.filter((d) => lineup[d].length).length} days, ${withId} with embedded Spotify ID`;
    log(`Fetched ${sum} artists from LTL site (${withId} pre-resolved via embedded Spotify IDs).`, "ok");
    for (const d of DAYS) log(`  ${d}: ${lineup[d].length}`, "muted");
  } catch (e) {
    status.textContent = `failed: ${e.message}`;
    log(`Fetch failed: ${e.message}. The CORS proxy may be down — try again, or paste the lineup manually.`, "err");
  } finally {
    btn.disabled = false;
  }
}

function readLineup() {
  const lineup = {};
  for (const day of DAYS) {
    const raw = $(`#lineup-${day}`).value;
    const names = raw
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const seen = new Set();
    lineup[day] = [];
    for (const n of names) {
      const key = normalize(n);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      lineup[day].push(n);
    }
  }
  return lineup;
}

function updateDayCounts() {
  for (const day of DAYS) {
    const ta = $(`#lineup-${day}`);
    const count = ta.value.split("\n").map((l) => l.trim()).filter(Boolean).length;
    ta.parentElement.querySelector(".day-count").textContent = count;
  }
}

// -------- diff engine --------

// prevArtistsByDay: { day: [resolvedName, ...] }, from sync state
// newLineup: { day: [inputName, ...] }
// Uses normalized keys to match; "moved" = same normalized key changed days.
function computeDiff(prevArtistsByDay, newLineup) {
  const prev = {}, next = {};
  for (const day of DAYS) {
    prev[day] = new Map((prevArtistsByDay[day] || []).map((n) => [normalize(n), n]));
    next[day] = new Map((newLineup[day] || []).map((n) => [normalize(n), n]));
  }
  // find location per key in prev/next
  const locationIn = (obj, key) => {
    for (const d of DAYS) if (obj[d].has(key)) return d;
    return null;
  };
  const allKeys = new Set();
  for (const d of DAYS) {
    for (const k of prev[d].keys()) allKeys.add(k);
    for (const k of next[d].keys()) allKeys.add(k);
  }
  const adds = Object.fromEntries(DAYS.map((d) => [d, []]));     // [name]
  const removes = Object.fromEntries(DAYS.map((d) => [d, []]));  // [name]
  const moves = [];                                              // {name, from, to}
  for (const key of allKeys) {
    const pLoc = locationIn(prev, key);
    const nLoc = locationIn(next, key);
    if (pLoc && nLoc && pLoc !== nLoc) {
      moves.push({ name: next[nLoc].get(key), from: pLoc, to: nLoc });
    } else if (!pLoc && nLoc) {
      adds[nLoc].push(next[nLoc].get(key));
    } else if (pLoc && !nLoc) {
      removes[pLoc].push(prev[pLoc].get(key));
    }
  }
  return { adds, removes, moves };
}

function renderDiff(diff, isFirstSync) {
  const body = $("#diff-body");
  body.innerHTML = "";

  if (isFirstSync) {
    const p = document.createElement("p");
    p.className = "no-changes";
    p.textContent = "First sync — everything below will be added.";
    body.appendChild(p);
  }

  let anyChange = false;
  for (const day of DAYS) {
    const adds = diff.adds[day], removes = diff.removes[day];
    const movesTo = diff.moves.filter((m) => m.to === day);
    const movesFrom = diff.moves.filter((m) => m.from === day);
    if (!adds.length && !removes.length && !movesTo.length && !movesFrom.length) continue;
    anyChange = true;

    const wrap = document.createElement("div");
    wrap.className = "day-diff";
    const h = document.createElement("h4");
    h.textContent = day;
    wrap.appendChild(h);
    const ul = document.createElement("ul");
    for (const n of adds) ul.insertAdjacentHTML("beforeend", `<li class="add">${escapeHtml(n)}</li>`);
    for (const n of removes) ul.insertAdjacentHTML("beforeend", `<li class="remove">${escapeHtml(n)}</li>`);
    for (const m of movesTo) ul.insertAdjacentHTML("beforeend", `<li class="move">${escapeHtml(m.name)} <span class="muted">(from ${m.from})</span></li>`);
    for (const m of movesFrom) ul.insertAdjacentHTML("beforeend", `<li class="move">${escapeHtml(m.name)} <span class="muted">(→ ${m.to})</span></li>`);
    wrap.appendChild(ul);
    body.appendChild(wrap);
  }

  if (!anyChange && !isFirstSync) {
    const p = document.createElement("p");
    p.className = "no-changes";
    p.textContent = "No changes from the last sync.";
    body.appendChild(p);
  }
  $("#diff-section").hidden = false;
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// -------- artist lookup + top tracks --------

// Return { id, name, popularity } or null
async function searchArtist(name, cache) {
  const key = normalize(name);
  if (cache[key]) return cache[key];
  const q = encodeURIComponent(name);
  const data = await api(`/search?q=${q}&type=artist&limit=5`);
  const candidates = data.artists?.items || [];
  if (!candidates.length) return null;
  // Prefer exact normalized name match; otherwise highest popularity.
  let best = candidates.find((a) => normalize(a.name) === key);
  if (!best) best = candidates.slice().sort((a, b) => (b.popularity || 0) - (a.popularity || 0))[0];
  const result = { id: best.id, name: best.name, popularity: best.popularity || 0 };
  cache[key] = result;
  return result;
}

async function getTopTrackUris(artistId, limit = 5) {
  const data = await api(`/artists/${artistId}/top-tracks?market=US`);
  return (data.tracks || []).slice(0, limit).map((t) => t.uri);
}

// -------- playlist sync --------

function playlistName(year, day) { return `LTL${year}${day}`; }

async function findPlaylistByName(name) {
  let url = `/me/playlists?limit=50`;
  while (url) {
    const page = await api(url);
    const match = (page.items || []).find((p) => p.name === name && p.owner?.id === localStorage.getItem(LS.userId));
    if (match) return match.id;
    url = page.next ? page.next.replace(API, "") : null;
  }
  return null;
}

async function createPlaylist(name) {
  const userId = localStorage.getItem(LS.userId);
  const desc = `Auto-generated by LTL Playlist Builder. Top tracks for artists performing on ${name.match(/\D+$/)?.[0] || ""}.`;
  const res = await api(`/users/${userId}/playlists`, {
    method: "POST",
    body: { name, public: false, description: desc },
  });
  return res.id;
}

async function addTracksToPlaylist(playlistId, uris) {
  for (let i = 0; i < uris.length; i += 100) {
    const chunk = uris.slice(i, i + 100);
    await api(`/playlists/${playlistId}/tracks`, { method: "POST", body: { uris: chunk } });
  }
}

async function removeTracksFromPlaylist(playlistId, uris) {
  const unique = [...new Set(uris)];
  for (let i = 0; i < unique.length; i += 100) {
    const chunk = unique.slice(i, i + 100).map((uri) => ({ uri }));
    await api(`/playlists/${playlistId}/tracks`, { method: "DELETE", body: { tracks: chunk } });
  }
}

// Full sync: resolve artists, diff, add/remove tracks per day, persist state.
async function syncToSpotify() {
  if (!isAuthed()) { log("Connect to Spotify first.", "err"); return; }
  const year = Number($("#year").value);
  if (!year) { log("Enter a festival year.", "err"); return; }
  saveDrafts();

  const lineup = readLineup();
  const state = getSyncState(year);

  // Ensure we have userId
  if (!localStorage.getItem(LS.userId)) await loadMe();

  clearLog();
  log(`Starting sync for LTL ${year}…`);

  // Ensure a playlist exists for each day that has artists (or had them previously).
  for (const day of DAYS) {
    const needed = (lineup[day].length > 0) || Object.keys(state.days[day].artists).length > 0;
    if (!needed) continue;
    if (!state.days[day].playlistId) {
      const name = playlistName(year, day);
      let id = await findPlaylistByName(name);
      if (!id) {
        log(`Creating playlist ${name}…`);
        id = await createPlaylist(name);
      } else {
        log(`Reusing existing playlist ${name} (${id})`, "muted");
      }
      state.days[day].playlistId = id;
      state.days[day].playlistName = name;
    }
  }

  // Resolve every artist in the new lineup to a Spotify artist id + top tracks.
  // Cache resolutions in state.resolved to avoid re-searching known-stable names.
  const resolvedCache = { ...(state.resolved || {}) };
  const resolved = {}; // day → [{ inputName, artistId, name, trackUris }]
  for (const day of DAYS) {
    resolved[day] = [];
    for (const input of lineup[day]) {
      try {
        const hit = await searchArtist(input, resolvedCache);
        if (!hit) { log(`✗ Not found: ${input}`, "err"); continue; }
        const exact = normalize(hit.name) === normalize(input);
        log(`${exact ? "✓" : "?"} ${input}${exact ? "" : ` → ${hit.name}`} (${hit.id})`, exact ? "ok" : "warn");
        const uris = await getTopTrackUris(hit.id, 5);
        if (!uris.length) { log(`  no top tracks for ${hit.name}`, "warn"); continue; }
        resolved[day].push({ inputName: input, artistId: hit.id, name: hit.name, trackUris: uris });
      } catch (e) {
        log(`✗ ${input}: ${e.message}`, "err");
      }
    }
  }
  state.resolved = resolvedCache;

  // Build sets of artistIds per day for diffing against prior state.
  const prevByDay = {};
  for (const day of DAYS) prevByDay[day] = Object.keys(state.days[day].artists);
  const newByDay = {};
  for (const day of DAYS) newByDay[day] = resolved[day].map((r) => r.artistId);

  // Per-day: artistIds to add, to remove. (Moves are handled as remove-from-old + add-to-new.)
  const addIdsByDay = {}, removeIdsByDay = {};
  for (const day of DAYS) {
    const prev = new Set(prevByDay[day]);
    const next = new Set(newByDay[day]);
    addIdsByDay[day] = [...next].filter((id) => !prev.has(id));
    removeIdsByDay[day] = [...prev].filter((id) => !next.has(id));
  }

  // Apply to Spotify: remove old artists' tracks, add new.
  for (const day of DAYS) {
    const ds = state.days[day];
    if (!ds.playlistId) continue;

    if (removeIdsByDay[day].length) {
      const urisToRemove = removeIdsByDay[day].flatMap((id) => ds.artists[id]?.trackUris || []);
      if (urisToRemove.length) {
        log(`${day}: removing ${urisToRemove.length} tracks from ${removeIdsByDay[day].length} artists`);
        await removeTracksFromPlaylist(ds.playlistId, urisToRemove);
      }
      for (const id of removeIdsByDay[day]) delete ds.artists[id];
    }

    if (addIdsByDay[day].length) {
      const toAdd = resolved[day].filter((r) => addIdsByDay[day].includes(r.artistId));
      const urisToAdd = toAdd.flatMap((r) => r.trackUris);
      if (urisToAdd.length) {
        log(`${day}: adding ${urisToAdd.length} tracks from ${toAdd.length} artists`);
        await addTracksToPlaylist(ds.playlistId, urisToAdd);
      }
      for (const r of toAdd) ds.artists[r.artistId] = { name: r.name, trackUris: r.trackUris };
    }
  }

  saveSyncState(state);
  log(`Sync complete for LTL ${year}.`, "ok");
  renderDiff(
    computeDiff(
      // for the post-sync diff we show what we just applied
      Object.fromEntries(DAYS.map((d) => [d, prevByDay[d].map((id) => state.days[d].artists[id]?.name || id)])),
      Object.fromEntries(DAYS.map((d) => [d, resolved[d].map((r) => r.name)]))
    ),
    Object.values(prevByDay).every((a) => a.length === 0)
  );
}

// Preview: compute diff without touching Spotify.
function previewChanges() {
  const year = Number($("#year").value);
  const state = getSyncState(year);
  const lineup = readLineup();
  saveDrafts();
  const prevByDay = {};
  for (const day of DAYS) prevByDay[day] = Object.values(state.days[day].artists).map((a) => a.name);
  const isFirst = Object.values(prevByDay).every((a) => a.length === 0);
  const diff = computeDiff(prevByDay, lineup);
  renderDiff(diff, isFirst);
  log("Preview rendered (no Spotify calls made).", "muted");
}

// -------- drafts & export/import --------

function saveDrafts() {
  const year = Number($("#year").value);
  const drafts = JSON.parse(localStorage.getItem(LS.lineupDraft) || "{}");
  drafts[year] = Object.fromEntries(DAYS.map((d) => [d, $(`#lineup-${d}`).value]));
  localStorage.setItem(LS.lineupDraft, JSON.stringify(drafts));
}

function loadDrafts() {
  const year = Number($("#year").value);
  const drafts = JSON.parse(localStorage.getItem(LS.lineupDraft) || "{}");
  const d = drafts[year] || {};
  for (const day of DAYS) $(`#lineup-${day}`).value = d[day] || "";
  updateDayCounts();
}

function exportState() {
  const payload = {
    exportedAt: new Date().toISOString(),
    syncState: JSON.parse(localStorage.getItem(LS.syncState) || "{}"),
    drafts: JSON.parse(localStorage.getItem(LS.lineupDraft) || "{}"),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ltl-playlist-state-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

async function importState(file) {
  const text = await file.text();
  const data = JSON.parse(text);
  if (data.syncState) localStorage.setItem(LS.syncState, JSON.stringify(data.syncState));
  if (data.drafts) localStorage.setItem(LS.lineupDraft, JSON.stringify(data.drafts));
  loadDrafts();
  log("State imported.", "ok");
}

// -------- UI wiring --------

function renderAuthStatus() {
  const authed = isAuthed();
  const pill = $("#auth-status");
  pill.textContent = authed ? "Connected" : "Not connected";
  pill.classList.toggle("pill-on", authed);
  pill.classList.toggle("pill-off", !authed);
  $("#connect-btn").hidden = authed;
  $("#disconnect-btn").hidden = !authed;
  $("#sync-btn").disabled = !authed;
}

function wireUI() {
  $("#redirect-uri").textContent = redirectUri();
  $("#copy-redirect").addEventListener("click", async () => {
    await navigator.clipboard.writeText(redirectUri());
    log("Redirect URI copied.", "muted");
  });

  const storedClient = localStorage.getItem(LS.clientId) || DEFAULT_CLIENT_ID;
  $("#client-id").value = storedClient;
  $("#client-id").addEventListener("change", (e) => localStorage.setItem(LS.clientId, e.target.value.trim()));

  const storedYear = localStorage.getItem(LS.year);
  if (storedYear) $("#year").value = storedYear;
  $("#year-label").textContent = $("#year").value;
  $("#year").addEventListener("change", (e) => {
    localStorage.setItem(LS.year, e.target.value);
    $("#year-label").textContent = e.target.value;
    loadDrafts();
  });

  for (const day of DAYS) {
    $(`#lineup-${day}`).addEventListener("input", () => { updateDayCounts(); saveDrafts(); });
  }

  $("#fetch-lineup-btn").addEventListener("click", fetchLineupFromLtl);
  $("#connect-btn").addEventListener("click", startAuthFlow);
  $("#disconnect-btn").addEventListener("click", disconnect);
  $("#preview-btn").addEventListener("click", previewChanges);
  $("#sync-btn").addEventListener("click", async () => {
    $("#sync-btn").disabled = true;
    try { await syncToSpotify(); }
    catch (e) { log(`Sync failed: ${e.message}`, "err"); }
    finally { $("#sync-btn").disabled = !isAuthed(); }
  });
  $("#export-btn").addEventListener("click", exportState);
  $("#import-file").addEventListener("change", (e) => {
    if (e.target.files[0]) importState(e.target.files[0]);
    e.target.value = "";
  });
}

async function init() {
  wireUI();
  loadDrafts();
  renderAuthStatus();
  if (location.search.includes("code=") || location.search.includes("error=")) {
    await handleRedirect();
  }
}

init();
