// Date helpers — events use local calendar dates stored as 'YYYY-MM-DD'.

export function toISO(d) {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export function fromISO(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(iso, n) {
  const d = fromISO(iso)
  d.setDate(d.getDate() + n)
  return toISO(d)
}

export const todayISO = () => toISO(new Date())

export const fmtWeekday = iso => fromISO(iso).toLocaleDateString(undefined, { weekday: 'short' })
export const fmtDay     = iso => fromISO(iso).getDate()
export const fmtMonth   = iso => fromISO(iso).toLocaleDateString(undefined, { month: 'short' })
export const fmtLong    = iso => fromISO(iso).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
export const fmtShort   = iso => fromISO(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

// "Today" / "Tomorrow" / "Thu, Oct 23"
export function fmtRelative(iso) {
  const t = todayISO()
  if (iso === t) return 'Today'
  if (iso === addDays(t, 1)) return 'Tomorrow'
  return fromISO(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}
