import { sportById } from './sports'

// Display helpers for the (mocked) signed-in account: { name, email, sport }

export function initialsOf(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'CA'
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

export function firstNameOf(name = '') {
  return name.trim().split(/\s+/)[0] || 'Coach'
}

// e.g. "⚽ Soccer" — falls back when the account has no sport yet
export function sportLabelOf(account) {
  const s = sportById(account?.sport)
  return s ? `${s.icon} ${s.label}` : 'No sport selected'
}
