/* ============================================
   MyBracketly Storage Layer
   localStorage + Project Registry
   ============================================ */

const NAMESPACE = 'mybracketly_';
const INDEX_KEY = NAMESPACE + 'projects_index';
const SHEETS_URL_KEY = NAMESPACE + 'sheets_url';

// --- localStorage helpers ---

export function getItem(key) {
    try {
        const raw = localStorage.getItem(NAMESPACE + key);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

export function setItem(key, value) {
    try {
        localStorage.setItem(NAMESPACE + key, JSON.stringify(value));
    } catch (e) {
        console.error('Storage error:', e);
    }
}

export function removeItem(key) {
    localStorage.removeItem(NAMESPACE + key);
}

// --- Google Sheets URL config ---

export function getSheetsUrl() {
    return localStorage.getItem(SHEETS_URL_KEY) || '';
}

export function setSheetsUrl(url) {
    localStorage.setItem(SHEETS_URL_KEY, url || '');
}

export function isSheetsConfigured() {
    return !!getSheetsUrl();
}

// --- Project Registry ---

function getIndex() {
    try {
        const raw = localStorage.getItem(INDEX_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

function saveIndex(index) {
    localStorage.setItem(INDEX_KEY, JSON.stringify(index));
}

export function listProjects() {
    return getIndex();
}

export function createProject(type, metadata) {
    const id = 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    const now = new Date().toISOString();
    const project = {
        id: id,
        type: type,
        name: metadata.name || 'Untitled',
        sport: metadata.sport || null,
        status: 'active',
        participantCount: metadata.participantCount || 0,
        createdAt: now,
        updatedAt: now
    };
    const index = getIndex();
    index.unshift(project);
    saveIndex(index);
    return project;
}

export function updateProject(id, updates) {
    const index = getIndex();
    const proj = index.find(function (p) { return p.id === id; });
    if (!proj) return null;
    Object.assign(proj, updates, { updatedAt: new Date().toISOString() });
    saveIndex(index);
    return proj;
}

export function deleteProject(id) {
    let index = getIndex();
    index = index.filter(function (p) { return p.id !== id; });
    saveIndex(index);
    removeItem('bracket_' + id);
    removeItem('squares_' + id);
}

export function archiveProject(id) {
    return updateProject(id, { status: 'archived' });
}

export function getProject(id) {
    const index = getIndex();
    return index.find(function (p) { return p.id === id; }) || null;
}

// --- Project data (bracket/squares specific data) ---

export function getProjectData(id) {
    return getItem('data_' + id);
}

export function setProjectData(id, data) {
    setItem('data_' + id, data);
    updateProject(id, {});
}
