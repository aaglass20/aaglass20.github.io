// Saves an account's teams, players, plans and added events in this browser (localStorage),
// keyed by email, until real accounts exist. Reads/writes fail quietly (private mode, blocked storage).

const keyFor = email => `ca.teamData.v1:${email || 'guest'}`

export function loadTeamData(email) {
  try {
    const raw = localStorage.getItem(keyFor(email))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveTeamData(email, data) {
  try {
    localStorage.setItem(keyFor(email), JSON.stringify(data))
  } catch {
    // storage unavailable — data stays in memory for this session
  }
}

export function clearTeamData(email) {
  try {
    localStorage.removeItem(keyFor(email))
  } catch {
    // nothing to clear
  }
}

export const newId = prefix => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
