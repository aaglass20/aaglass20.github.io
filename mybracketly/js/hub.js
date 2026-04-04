/* ============================================
   MyBracketly Hub - Home Page Logic
   ============================================ */

import { escapeHtml, showStatus, formatDate } from './design-system.js';
import { listProjects, createProject, deleteProject, archiveProject, updateProject, getSheetsUrl, setSheetsUrl } from './storage.js';
import { SPORTS_REGISTRY } from './espn.js';

let currentView = 'home';
let filterType = 'all';
let showArchived = false;
let selectedSport = null;

// --- Initialize ---
function init() {
    renderDashboard();
    loadSheetsConfig();
}

// --- Dashboard ---
function renderDashboard() {
    const projects = listProjects();
    const container = document.getElementById('projectList');
    const emptyState = document.getElementById('emptyState');
    const dashboardSection = document.getElementById('dashboardSection');
    const statsSection = document.getElementById('statsSection');

    const filtered = projects.filter(function (p) {
        if (!showArchived && p.status === 'archived') return false;
        if (filterType !== 'all' && p.type !== filterType) return false;
        return true;
    });

    if (projects.length === 0) {
        dashboardSection.style.display = 'none';
        statsSection.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    dashboardSection.style.display = 'block';
    if (emptyState) emptyState.style.display = 'none';

    // Stats
    const active = projects.filter(function (p) { return p.status === 'active'; }).length;
    const completed = projects.filter(function (p) { return p.status === 'completed'; }).length;
    const brackets = projects.filter(function (p) { return p.type === 'bracket'; }).length;
    const squares = projects.filter(function (p) { return p.type === 'squares'; }).length;

    if (statsSection) {
        statsSection.style.display = 'flex';
        statsSection.innerHTML =
            '<div class="stat-item"><div class="stat-value">' + projects.length + '</div><div class="stat-label">Total</div></div>' +
            '<div class="stat-item"><div class="stat-value">' + active + '</div><div class="stat-label">Active</div></div>' +
            '<div class="stat-item"><div class="stat-value">' + brackets + '</div><div class="stat-label">Brackets</div></div>' +
            '<div class="stat-item"><div class="stat-value">' + squares + '</div><div class="stat-label">Squares</div></div>';
    }

    // Sort: active first, then completed, then archived
    const sorted = filtered.slice().sort(function (a, b) {
        const order = { active: 0, completed: 1, archived: 2 };
        const diff = (order[a.status] || 0) - (order[b.status] || 0);
        if (diff !== 0) return diff;
        return new Date(b.updatedAt) - new Date(a.updatedAt);
    });

    if (sorted.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-filter"></i><h3>No matching projects</h3><p>Try changing your filters</p></div>';
        return;
    }

    let html = '';
    sorted.forEach(function (proj) {
        const typeIcon = proj.type === 'bracket' ? 'fa-sitemap' : proj.type === 'headtohead' ? 'fa-people-arrows' : 'fa-table-cells';
        const typeLabel = proj.type === 'bracket' ? 'Bracket' : proj.type === 'headtohead' ? 'Head to Head' : 'Squares';
        const sportConfig = proj.sport ? SPORTS_REGISTRY[proj.sport] : null;
        const sportLabel = sportConfig ? sportConfig.label : '';
        const sportIcon = sportConfig ? sportConfig.icon : '';

        html += '<div class="t-card' + (proj.status === 'archived' ? ' archived' : '') + '">';
        html += '<div class="t-card-status ' + proj.status + '">' + proj.status + '</div>';
        html += '<div class="t-card-header">';
        html += '<div class="t-card-type-icon"><i class="fas ' + typeIcon + '"></i></div>';
        html += '<div>';
        html += '<div class="t-card-name">' + escapeHtml(proj.name) + '</div>';
        if (sportLabel) {
            html += '<div class="t-card-sport"><i class="fas ' + sportIcon + '"></i> ' + escapeHtml(sportLabel) + '</div>';
        }
        html += '</div>';
        html += '</div>';
        html += '<div class="t-card-meta">';
        html += '<span><i class="fas ' + typeIcon + '"></i> ' + typeLabel + '</span>';
        if (proj.participantCount) {
            html += '<span><i class="fas fa-users"></i> ' + proj.participantCount + '</span>';
        }
        html += '<span><i class="fas fa-clock"></i> ' + formatDate(proj.updatedAt) + '</span>';
        html += '</div>';
        html += '<div class="t-card-actions">';
        html += '<button class="btn btn-primary btn-sm" onclick="window.hubApp.openProject(\'' + proj.id + '\', \'' + proj.type + '\')"><i class="fas fa-external-link-alt"></i> Open</button>';
        if (proj.status === 'active') {
            html += '<button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); window.hubApp.archiveProjectAction(\'' + proj.id + '\')"><i class="fas fa-archive"></i> Archive</button>';
        }
        html += '<button class="btn btn-danger btn-sm" onclick="event.stopPropagation(); window.hubApp.deleteProjectAction(\'' + proj.id + '\', \'' + escapeHtml(proj.name).replace(/'/g, "\\'") + '\')"><i class="fas fa-trash"></i></button>';
        html += '</div>';
        html += '</div>';
    });

    container.innerHTML = html;
}

// --- Project Actions ---
function openProject(id, type) {
    if (type === 'bracket') {
        window.location.href = 'brackets.html?id=' + id;
    } else if (type === 'squares') {
        window.location.href = 'squares.html?id=' + id;
    } else if (type === 'headtohead') {
        window.location.href = 'headtohead.html?id=' + id;
    }
}

function deleteProjectAction(id, name) {
    if (confirm('Delete "' + name + '"? This cannot be undone.')) {
        deleteProject(id);
        showStatus('Project deleted', 'success');
        renderDashboard();
    }
}

function archiveProjectAction(id) {
    archiveProject(id);
    showStatus('Project archived', 'success');
    renderDashboard();
}

// --- Wizard: Create Bracket ---
function startCreateBracket() {
    const proj = createProject('bracket', { name: 'New Tournament' });
    window.location.href = 'brackets.html?id=' + proj.id + '&new=1';
}

// --- Wizard: Create Squares ---
function showSquaresSetup() {
    document.getElementById('wizardSection').style.display = 'none';
    document.getElementById('squaresSetup').style.display = 'block';
    selectedSport = null;
    renderSportSelector();
}

function hideSquaresSetup() {
    document.getElementById('squaresSetup').style.display = 'none';
    document.getElementById('wizardSection').style.display = 'block';
}

function renderSportSelector() {
    const container = document.getElementById('sportGrid');
    let html = '';
    Object.keys(SPORTS_REGISTRY).forEach(function (key) {
        const sport = SPORTS_REGISTRY[key];
        html += '<div class="sport-option' + (selectedSport === key ? ' selected' : '') + '" onclick="window.hubApp.selectSport(\'' + key + '\')">';
        html += '<i class="fas ' + sport.icon + '"></i>';
        html += '<span>' + sport.label + '</span>';
        html += '</div>';
    });
    container.innerHTML = html;
}

function selectSport(key) {
    selectedSport = key;
    renderSportSelector();
}

function createSquaresProject() {
    const name = document.getElementById('squaresName').value.trim();
    if (!name) {
        showStatus('Please enter a name for your squares board', 'error');
        return;
    }
    if (!selectedSport) {
        showStatus('Please select a sport', 'error');
        return;
    }

    const proj = createProject('squares', {
        name: name,
        sport: selectedSport
    });

    window.location.href = 'squares.html?id=' + proj.id + '&new=1';
}

// --- Wizard: Create Head to Head ---
const H2H_MODES = {
    bestof: { label: 'Best-of Series', icon: 'fa-handshake', desc: 'Best of 1, 3, 5, or 7' },
    koth: { label: 'King of the Hill', icon: 'fa-crown', desc: 'Winner stays, challengers rotate' },
    swiss: { label: 'Swiss Format', icon: 'fa-scale-balanced', desc: 'Matched by similar records' },
    firstto: { label: 'First to X', icon: 'fa-bullseye', desc: 'First to reach target wins' },
    accumulation: { label: 'Score Accumulation', icon: 'fa-chart-line', desc: 'Points-based over multiple matches' },
    lives: { label: 'Elimination (Lives)', icon: 'fa-heart', desc: 'Lose a life each loss, last alive wins' },
    gauntlet: { label: 'Gauntlet Mode', icon: 'fa-bolt', desc: 'One player faces everyone in a row' },
    pushluck: { label: 'Push Your Luck', icon: 'fa-dice', desc: 'Roll, bank, or bust — race to a target score' },
    cornhole: { label: 'Cornhole', icon: 'fa-bullseye', desc: 'Round-by-round bag toss scoring to a target' },
    teamsport: { label: 'Team Sport', icon: 'fa-basketball', desc: 'Period-based scoring for basketball, football, soccer & more' }
};

let selectedH2HMode = null;

function showH2HSetup() {
    document.getElementById('wizardSection').style.display = 'none';
    document.getElementById('h2hSetup').style.display = 'block';
    selectedH2HMode = null;
    renderH2HModeSelector();
}

function hideH2HSetup() {
    document.getElementById('h2hSetup').style.display = 'none';
    document.getElementById('wizardSection').style.display = 'block';
}

function renderH2HModeSelector() {
    const container = document.getElementById('h2hModeGrid');
    let html = '';
    Object.keys(H2H_MODES).forEach(function (key) {
        const mode = H2H_MODES[key];
        html += '<div class="sport-option' + (selectedH2HMode === key ? ' selected' : '') + '" onclick="window.hubApp.selectH2HMode(\'' + key + '\')">';
        html += '<i class="fas ' + mode.icon + '"></i>';
        html += '<span>' + mode.label + '</span>';
        html += '</div>';
    });
    container.innerHTML = html;
}

function selectH2HMode(key) {
    selectedH2HMode = key;
    renderH2HModeSelector();
}

function createH2HProject() {
    const name = document.getElementById('h2hName').value.trim();
    if (!name) {
        showStatus('Please enter a session name', 'error');
        return;
    }
    if (!selectedH2HMode) {
        showStatus('Please select a mode', 'error');
        return;
    }

    const proj = createProject('headtohead', {
        name: name,
        mode: selectedH2HMode
    });

    window.location.href = 'headtohead.html?id=' + proj.id + '&mode=' + selectedH2HMode + '&new=1';
}

// --- Filters ---
function setFilter(type) {
    filterType = type;
    document.querySelectorAll('.filter-btn').forEach(function (b) {
        b.classList.toggle('active', b.dataset.filter === type);
    });
    renderDashboard();
}

function toggleArchived() {
    showArchived = !showArchived;
    renderDashboard();
}

// --- Google Sheets Config ---
function loadSheetsConfig() {
    const url = getSheetsUrl();
    const input = document.getElementById('globalSheetsUrl');
    if (input && url) input.value = url;
}

function saveSheetsConfig() {
    const url = document.getElementById('globalSheetsUrl').value.trim();
    setSheetsUrl(url);
    showStatus(url ? 'Google Sheets URL saved' : 'Google Sheets URL cleared', 'success');
}

// --- Expose to global scope for onclick handlers ---
window.hubApp = {
    openProject: openProject,
    deleteProjectAction: deleteProjectAction,
    archiveProjectAction: archiveProjectAction,
    startCreateBracket: startCreateBracket,
    showSquaresSetup: showSquaresSetup,
    hideSquaresSetup: hideSquaresSetup,
    selectSport: selectSport,
    createSquaresProject: createSquaresProject,
    showH2HSetup: showH2HSetup,
    hideH2HSetup: hideH2HSetup,
    selectH2HMode: selectH2HMode,
    createH2HProject: createH2HProject,
    setFilter: setFilter,
    toggleArchived: toggleArchived,
    saveSheetsConfig: saveSheetsConfig
};

// Boot
document.addEventListener('DOMContentLoaded', init);
