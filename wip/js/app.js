/* WIP Board — Project → Epic → Ticket/Bug kanban backed by Supabase */

const STATUSES = ['backlog', 'in_progress', 'testing', 'done'];
const STATUS_LABEL = { backlog: 'Backlog', in_progress: 'In Progress', testing: 'Testing', done: 'Done' };
const DAY_MS = 24 * 60 * 60 * 1000;

const state = {
  projects: [],
  epics: [],
  items: [],
  filters: { project: '', epic: '', type: '' },
  showArchived: false,
};

let sb = null;
let editingItem = null;    // item object or { new: true, ... }
let editingEntity = null;  // { kind: 'project'|'epic', row?, projectId? }

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* ────────────────────────────────────────────────
   Supabase
──────────────────────────────────────────────── */
function initSupabase() {
  const cfg = window.WIP_CONFIG;
  if (!cfg || typeof supabase === 'undefined') {
    showBanner('Supabase client failed to load. Check your connection and reload.');
    return false;
  }
  sb = supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
  return true;
}

function setSync(s) {
  const el = $('#syncIndicator');
  el.className = `sync-indicator ${s}`;
  el.title = { idle: 'Cloud sync ready', syncing: 'Saving…', ok: 'Saved ✓', error: 'Save failed' }[s] || '';
}

// Wraps a Supabase call: updates the sync dot and surfaces errors
async function run(promise) {
  setSync('syncing');
  const { data, error } = await promise;
  if (error) {
    setSync('error');
    console.error(error);
    if (error.code === 'PGRST205' || error.code === '42P01') {
      showBanner('WIP tables not found. Run <code>wip/setup.sql</code> once in the Supabase SQL editor, then reload.');
    } else {
      showBanner(`Save failed: ${escapeHtml(error.message)}`);
    }
    throw error;
  }
  setSync('ok');
  return data;
}

async function loadAll() {
  const [projects, epics, items] = await Promise.all([
    run(sb.from('wip_projects').select('*').order('created_at')),
    run(sb.from('wip_epics').select('*').order('created_at')),
    run(sb.from('wip_items').select('*').order('position')),
  ]);
  state.projects = projects;
  state.epics = epics;
  state.items = items;
  hideBanner();
  renderAll();
}

/* ────────────────────────────────────────────────
   Lookups
──────────────────────────────────────────────── */
const projectById = id => state.projects.find(p => p.id === id);
const epicById = id => state.epics.find(e => e.id === id);
const epicsOf = projectId => state.epics.filter(e => e.project_id === projectId);
const itemsOfEpic = epicId => state.items.filter(i => i.epic_id === epicId);

function isArchived(item) {
  if (item.status !== 'done' || !item.done_at) return false;
  return Date.now() - new Date(item.done_at).getTime() > window.WIP_CONFIG.DONE_VISIBLE_DAYS * DAY_MS;
}

function matchesFilters(item) {
  const { project, epic, type } = state.filters;
  if (type && item.type !== type) return false;
  if (epic === '__none') { if (item.epic_id) return false; }
  else if (epic && item.epic_id !== epic) return false;
  if (project) {
    const e = epicById(item.epic_id);
    if (!e || e.project_id !== project) return false;
  }
  return true;
}

/* ────────────────────────────────────────────────
   Rendering
──────────────────────────────────────────────── */
function renderAll() {
  renderFilters();
  renderBoard();
  renderHierarchy();
}

function renderFilters() {
  const pSel = $('#filterProject');
  pSel.innerHTML = '<option value="">All projects</option>' +
    state.projects.map(p => `<option value="${p.id}">${escapeHtml(p.title)}</option>`).join('');
  if (!projectById(state.filters.project)) state.filters.project = '';
  pSel.value = state.filters.project;

  const eSel = $('#filterEpic');
  const epics = state.filters.project ? epicsOf(state.filters.project) : state.epics;
  eSel.innerHTML = '<option value="">All epics</option>' +
    (state.filters.project ? '' : '<option value="__none">No epic</option>') +
    epics.map(e => `<option value="${e.id}">${escapeHtml(epicLabel(e))}</option>`).join('');
  const epicOk = state.filters.epic === '__none' ? !state.filters.project : epics.some(e => e.id === state.filters.epic);
  if (!epicOk) state.filters.epic = '';
  eSel.value = state.filters.epic;

  $('#filterType').value = state.filters.type;
}

function epicLabel(e) {
  if (state.filters.project) return e.title;
  const p = projectById(e.project_id);
  return p ? `${p.title} › ${e.title}` : e.title;
}

function renderBoard() {
  const visible = state.items.filter(matchesFilters);
  let archivedCount = 0;

  for (const status of STATUSES) {
    const col = $(`.column[data-status="${status}"]`);
    let list = visible.filter(i => i.status === status);
    if (status === 'done') {
      archivedCount = list.filter(isArchived).length;
      if (!state.showArchived) list = list.filter(i => !isArchived(i));
      // Most recently finished first
      list.sort((a, b) => new Date(b.done_at || 0) - new Date(a.done_at || 0));
    } else {
      list.sort((a, b) => a.position - b.position);
    }
    $('.cards', col).innerHTML = list.map(cardHtml).join('');
    $('.count', col).textContent = list.length;
  }
  $('#archivedCount').textContent = archivedCount ? `(${archivedCount})` : '';
}

function cardHtml(item) {
  const epic = epicById(item.epic_id);
  const project = epic && projectById(epic.project_id);
  const epicChip = epic
    ? `<button class="epic-chip" data-epic="${epic.id}" title="${escapeHtml(project ? project.title + ' › ' : '')}${escapeHtml(epic.title)} — click to filter">${escapeHtml(epic.title)}</button>`
    : '';
  const doneAgo = item.status === 'done' && item.done_at ? `<span class="done-ago">${timeAgo(item.done_at)}</span>` : '';
  return `
    <article class="card ${item.type}${isArchived(item) ? ' archived' : ''}" data-id="${item.id}">
      <div class="card-title">${escapeHtml(item.title)}</div>
      <div class="card-meta">
        <span class="badge ${item.type}">${item.type}</span>
        ${epicChip}
        ${doneAgo}
      </div>
    </article>`;
}

function renderHierarchy() {
  const list = $('#hierarchyList');
  if (!state.projects.length) {
    list.innerHTML = '<p class="empty">No projects yet. Create one to start grouping epics.</p>';
    return;
  }
  list.innerHTML = state.projects.map(p => {
    const epics = epicsOf(p.id);
    return `
      <div class="project">
        <div class="row">
          <span class="name" data-edit-project="${p.id}">${escapeHtml(p.title)}</span>
          <button class="btn small" data-new-epic="${p.id}">+ Epic</button>
        </div>
        ${epics.length ? `<ul class="epic-list">${epics.map(e => {
          const n = itemsOfEpic(e.id).length;
          return `<li class="row">
            <span class="name" data-edit-epic="${e.id}">${escapeHtml(e.title)}</span>
            <span class="tally">${n} item${n === 1 ? '' : 's'}</span>
          </li>`;
        }).join('')}</ul>` : '<p class="empty">No epics yet</p>'}
      </div>`;
  }).join('');
}

/* ────────────────────────────────────────────────
   Drag & drop
──────────────────────────────────────────────── */
function initSortables() {
  $$('.column .cards').forEach(el => {
    Sortable.create(el, {
      group: 'board',
      animation: 150,
      delay: 150,
      delayOnTouchOnly: true,
      onEnd: onDrop,
    });
  });
}

async function onDrop(evt) {
  const id = evt.item.dataset.id;
  const item = state.items.find(i => i.id === id);
  if (!item) return;
  const status = evt.to.closest('.column').dataset.status;
  if (status === item.status && evt.oldIndex === evt.newIndex) return;

  // Position = midpoint between neighbours in the destination column
  const prev = evt.item.previousElementSibling && state.items.find(i => i.id === evt.item.previousElementSibling.dataset.id);
  const next = evt.item.nextElementSibling && state.items.find(i => i.id === evt.item.nextElementSibling.dataset.id);
  let position;
  if (prev && next) position = (prev.position + next.position) / 2;
  else if (prev) position = prev.position + 1;
  else if (next) position = next.position - 1;
  else position = 0;

  const before = { status: item.status, position: item.position, done_at: item.done_at };
  Object.assign(item, { status, position });
  if (status === 'done' && before.status !== 'done') item.done_at = new Date().toISOString();
  if (status !== 'done') item.done_at = null;
  renderBoard();

  try {
    const [saved] = await run(sb.from('wip_items').update({ status, position }).eq('id', id).select());
    Object.assign(item, saved);
    renderBoard();
  } catch {
    Object.assign(item, before);
    renderBoard();
  }
}

function nextPosition(status) {
  const inCol = state.items.filter(i => i.status === status);
  return inCol.length ? Math.max(...inCol.map(i => i.position)) + 1 : 0;
}

/* ────────────────────────────────────────────────
   Item dialog
──────────────────────────────────────────────── */
function epicOptionsHtml() {
  let html = '<option value="">— No epic —</option>';
  for (const p of state.projects) {
    const epics = epicsOf(p.id);
    if (!epics.length) continue;
    html += `<optgroup label="${escapeHtml(p.title)}">` +
      epics.map(e => `<option value="${e.id}">${escapeHtml(e.title)}</option>`).join('') +
      '</optgroup>';
  }
  return html;
}

function openItem(item) {
  const form = $('#itemForm');
  editingItem = item;
  form.epic_id.innerHTML = epicOptionsHtml();
  form.type.value = item.type;
  form.title.value = item.title || '';
  form.description.value = item.description || '';
  form.epic_id.value = item.epic_id || '';
  form.status.value = item.status;
  $('#deleteItem').classList.toggle('hidden', !!item.new);

  const meta = [];
  if (!item.new) {
    meta.push(`Created ${new Date(item.created_at).toLocaleDateString()}`);
    if (item.done_at) meta.push(`done ${timeAgo(item.done_at)}`);
  }
  $('#itemMeta').textContent = meta.join(' · ');

  $('#itemDialog').showModal();
  form.title.focus();
}

function newItem(type, status = 'backlog') {
  // Pre-link to the epic currently being filtered, so items land where you're looking
  const epic = state.filters.epic && state.filters.epic !== '__none' ? state.filters.epic : null;
  openItem({ new: true, type, status, epic_id: epic, title: '', description: '' });
}

async function saveItem(e) {
  e.preventDefault();
  const form = e.target;
  const row = {
    type: form.type.value,
    title: form.title.value.trim(),
    description: form.description.value.trim(),
    epic_id: form.epic_id.value || null,
    status: form.status.value,
  };
  if (!row.title) return;

  try {
    if (editingItem.new) {
      row.position = nextPosition(row.status);
      const [saved] = await run(sb.from('wip_items').insert(row).select());
      state.items.push(saved);
    } else {
      if (row.status !== editingItem.status) row.position = nextPosition(row.status);
      const [saved] = await run(sb.from('wip_items').update(row).eq('id', editingItem.id).select());
      Object.assign(editingItem, saved);
    }
    $('#itemDialog').close();
    renderBoard();
    renderHierarchy();
  } catch {}
}

async function deleteItem() {
  if (!editingItem || editingItem.new) return;
  if (!confirm(`Delete "${editingItem.title}"?`)) return;
  try {
    await run(sb.from('wip_items').delete().eq('id', editingItem.id));
    state.items = state.items.filter(i => i.id !== editingItem.id);
    $('#itemDialog').close();
    renderBoard();
    renderHierarchy();
  } catch {}
}

/* ────────────────────────────────────────────────
   Project / epic dialog
──────────────────────────────────────────────── */
function openEntity(kind, row, projectId) {
  const form = $('#entityForm');
  editingEntity = { kind, row, projectId };
  $('#entityHeading').textContent = `${row ? 'Edit' : 'New'} ${kind}`;
  $('#entityProjectField').classList.toggle('hidden', kind !== 'epic');
  if (kind === 'epic') {
    form.project_id.innerHTML = state.projects.map(p => `<option value="${p.id}">${escapeHtml(p.title)}</option>`).join('');
    form.project_id.value = row ? row.project_id : projectId;
  }
  form.title.value = row ? row.title : '';
  form.description.value = row ? row.description : '';
  $('#deleteEntity').classList.toggle('hidden', !row);
  $('#entityDialog').showModal();
  form.title.focus();
}

async function saveEntity(e) {
  e.preventDefault();
  const form = e.target;
  const { kind, row: existing } = editingEntity;
  const table = kind === 'project' ? 'wip_projects' : 'wip_epics';
  const list = kind === 'project' ? state.projects : state.epics;
  const row = { title: form.title.value.trim(), description: form.description.value.trim() };
  if (kind === 'epic') row.project_id = form.project_id.value;
  if (!row.title) return;

  try {
    if (existing) {
      const [saved] = await run(sb.from(table).update(row).eq('id', existing.id).select());
      Object.assign(existing, saved);
    } else {
      const [saved] = await run(sb.from(table).insert(row).select());
      list.push(saved);
    }
    $('#entityDialog').close();
    renderAll();
  } catch {}
}

async function deleteEntity() {
  const { kind, row } = editingEntity;
  if (!row) return;
  let warning;
  if (kind === 'project') {
    const epics = epicsOf(row.id);
    const n = epics.reduce((sum, e) => sum + itemsOfEpic(e.id).length, 0);
    warning = `Delete project "${row.title}"?\n\nThis also deletes its ${epics.length} epic(s). ${n} ticket(s)/bug(s) will stay on the board, unlinked.`;
  } else {
    warning = `Delete epic "${row.title}"?\n\nIts ${itemsOfEpic(row.id).length} ticket(s)/bug(s) will stay on the board, unlinked.`;
  }
  if (!confirm(warning)) return;

  try {
    if (kind === 'project') {
      await run(sb.from('wip_projects').delete().eq('id', row.id));
      const epicIds = new Set(epicsOf(row.id).map(e => e.id));
      state.projects = state.projects.filter(p => p.id !== row.id);
      state.epics = state.epics.filter(e => !epicIds.has(e.id));
      state.items.forEach(i => { if (epicIds.has(i.epic_id)) i.epic_id = null; });
    } else {
      await run(sb.from('wip_epics').delete().eq('id', row.id));
      state.epics = state.epics.filter(e => e.id !== row.id);
      state.items.forEach(i => { if (i.epic_id === row.id) i.epic_id = null; });
    }
    $('#entityDialog').close();
    renderAll();
  } catch {}
}

/* ────────────────────────────────────────────────
   Drawer
──────────────────────────────────────────────── */
function toggleDrawer(open) {
  $('#hierarchy').classList.toggle('open', open);
  $('#hierarchy').setAttribute('aria-hidden', String(!open));
  $('#scrim').classList.toggle('hidden', !open);
}

/* ────────────────────────────────────────────────
   Helpers
──────────────────────────────────────────────── */
function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function timeAgo(iso) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / DAY_MS);
  if (days <= 0) return 'today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

function showBanner(html) { const b = $('#banner'); b.innerHTML = html; b.classList.remove('hidden'); }
function hideBanner() { $('#banner').classList.add('hidden'); }

/* ────────────────────────────────────────────────
   Wiring
──────────────────────────────────────────────── */
function bindEvents() {
  document.addEventListener('click', e => {
    const t = e.target;
    const newBtn = t.closest('[data-new-item]');
    if (newBtn) return newItem(newBtn.dataset.newItem, newBtn.dataset.status);

    const chip = t.closest('.epic-chip');
    if (chip) {
      const epic = epicById(chip.dataset.epic);
      state.filters.project = '';
      state.filters.epic = epic.id;
      renderFilters();
      renderBoard();
      return;
    }

    const card = t.closest('.card');
    if (card) return openItem(state.items.find(i => i.id === card.dataset.id));

    if (t.closest('[data-close]')) return t.closest('dialog').close();

    if (t.dataset.newEpic) return openEntity('epic', null, t.dataset.newEpic);
    if (t.dataset.editEpic) return openEntity('epic', epicById(t.dataset.editEpic));
    if (t.dataset.editProject) return openEntity('project', projectById(t.dataset.editProject));
  });

  $('#filterProject').addEventListener('change', e => { state.filters.project = e.target.value; renderFilters(); renderBoard(); });
  $('#filterEpic').addEventListener('change', e => { state.filters.epic = e.target.value; renderBoard(); });
  $('#filterType').addEventListener('change', e => { state.filters.type = e.target.value; renderBoard(); });
  $('#showArchived').addEventListener('change', e => { state.showArchived = e.target.checked; renderBoard(); });

  $('#itemForm').addEventListener('submit', saveItem);
  $('#deleteItem').addEventListener('click', deleteItem);
  $('#entityForm').addEventListener('submit', saveEntity);
  $('#deleteEntity').addEventListener('click', deleteEntity);

  $('#openHierarchy').addEventListener('click', () => toggleDrawer(true));
  $('#closeHierarchy').addEventListener('click', () => toggleDrawer(false));
  $('#scrim').addEventListener('click', () => toggleDrawer(false));
  $('#newProject').addEventListener('click', () => openEntity('project'));

  // Pick up changes made in other tabs/devices
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && sb) loadAll().catch(() => {});
  });
}

document.addEventListener('DOMContentLoaded', () => {
  bindEvents();
  initSortables();
  renderAll();
  if (initSupabase()) loadAll().catch(() => {});
});
