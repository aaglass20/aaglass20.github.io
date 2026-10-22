// Sports an account can plan for. One sport per account for now (see NOTES.md).
// `id` is what gets stored on the account — it will drive the sport-specific menu later.

export const SPORTS = [
  { id: 'soccer',     label: 'Soccer',          icon: '⚽' },
  { id: 'softball',   label: 'Softball',        icon: '🥎' },
  { id: 'baseball',   label: 'Baseball',        icon: '⚾' },
  { id: 'football',   label: 'Football',        icon: '🏈' },
  { id: 'basketball', label: 'Basketball',      icon: '🏀' },
  { id: 'adaptive',   label: 'Adaptive Sports', icon: '♿', blurb: 'Inclusive programs for every athlete' },
]

export const sportById = id => SPORTS.find(s => s.id === id)
