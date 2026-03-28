/* ============================================
   MyBracketly Design System - Shared Utilities
   ============================================ */

export function generateId() {
    return 't_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
}

export function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

export function showStatus(msg, type, containerId = 'statusMsg') {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.className = 'status-msg ' + type;
    el.innerHTML = '<i class="fas fa-' + (type === 'success' ? 'check-circle' : 'exclamation-circle') + '"></i> ' + msg;
    el.style.display = 'flex';
    setTimeout(function () {
        el.style.display = 'none';
    }, 3500);
}

export function showLoading(text) {
    const el = document.getElementById('loading-overlay');
    if (!el) return;
    if (text) {
        const p = el.querySelector('p');
        if (p) p.textContent = text;
    }
    el.classList.add('active');
}

export function hideLoading() {
    const el = document.getElementById('loading-overlay');
    if (el) el.classList.remove('active');
}

export function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
}

export function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
}

export function switchTab(tabId, tabBarSelector = '.tab-bar') {
    document.querySelectorAll('.tab-content').forEach(function (c) {
        c.classList.remove('active');
    });
    document.querySelectorAll(tabBarSelector + ' .tab-btn').forEach(function (b) {
        b.classList.remove('active');
    });
    const content = document.getElementById('tab-' + tabId);
    if (content) content.classList.add('active');
    const btn = document.querySelector(tabBarSelector + ' .tab-btn[data-tab="' + tabId + '"]');
    if (btn) btn.classList.add('active');
}

export function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
        d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
