// Thin wrapper around the Apps Script web-app endpoint.
//
// To wire this up: deploy Code.gs as a web app, then set API_URL below to the
// /exec URL. For local dev we leave it blank and the pages fall back to a
// demo/mock layer (see demo.js).

const API_URL = 'https://script.google.com/macros/s/AKfycbzc2lvyZ9oC5Yw00PCy4gp_WM3345Wy6hFJ-IKqJPleFYywFG8-Kp39XtUYtfXL_NO4/exec';

async function apiGet(action, params) {
  if (!API_URL) return demoApi(action, params || {});
  const u = new URL(API_URL);
  u.searchParams.set('action', action);
  Object.keys(params || {}).forEach(k => {
    if (params[k] !== undefined && params[k] !== null) u.searchParams.set(k, params[k]);
  });
  const r = await fetch(u.toString(), { method: 'GET' });
  return r.json();
}

async function apiPost(action, body) {
  if (!API_URL) return demoApi(action, body || {});
  const payload = Object.assign({ action }, body || {});
  // text/plain avoids the CORS preflight against Apps Script.
  const r = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload)
  });
  return r.json();
}

// Public
const API = {
  getConfig: () => apiGet('getConfig'),
  getWeek: (weekStart) => apiGet('getWeek', { weekStart }),
  book: (date, time, name, phone, team) => apiPost('book', { date, time, name, phone, team }),

  // Admin
  verifyPin: (pin) => apiGet('verifyPin', { pin }),
  adminGetConfig: (pin) => apiGet('adminGetConfig', { pin }),
  adminSetConfig: (pin, key, value) => apiPost('adminSetConfig', { pin, key, value }),
  adminSetSlot: (pin, date, time, available) => apiPost('adminSetSlot', { pin, date, time, available }),
  adminSetWeek: (pin, weekStart, slots) => apiPost('adminSetWeek', { pin, weekStart, slots }),
  adminGetBookings: (pin, weekStart) => apiGet('adminGetBookings', { pin, weekStart }),
  adminDeleteBooking: (pin, date, time) => apiPost('adminDeleteBooking', { pin, date, time }),
  adminBook: (pin, date, time, name, phone, team) => apiPost('adminBook', { pin, date, time, name, phone, team })
};
