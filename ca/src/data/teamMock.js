// Mock data for team-based profiles (Soccer for now).
// Hierarchy: Account → Teams → Events (practice | game) → Plan (one per event).
// Everything is dated relative to today so the demo always looks current. Nothing is persisted.

import { addDays, todayISO } from './dates'

// ── Small-sided format by age group (US Youth Soccer style) ──
const FORMATS = {
  '7v7':   { label: '7v7',   shape: '2-3-1', positions: ['GK', 'LB', 'RB', 'LM', 'CM', 'RM', 'ST'] },
  '9v9':   { label: '9v9',   shape: '3-3-2', positions: ['GK', 'LB', 'CB', 'RB', 'LM', 'CM', 'RM', 'LS', 'RS'] },
  '11v11': { label: '11v11', shape: '4-3-3', positions: ['GK', 'LB', 'LCB', 'RCB', 'RB', 'LCM', 'CDM', 'RCM', 'LW', 'ST', 'RW'] },
}

export const formatFor = team => FORMATS[team.format]

export const TEAMS = [
  { id: 't-u13', name: 'BDU U13 2026', age: 'U13', format: '11v11', color: '#00BDB0' },
  { id: 't-u12', name: 'BDU U12 2025', age: 'U12', format: '9v9',   color: '#FF6B1A' },
  { id: 't-u11', name: 'BDU U11 2024', age: 'U11', format: '9v9',   color: '#3B6FD8' },
  { id: 't-u10', name: 'BDU U10 2025', age: 'U10', format: '7v7',   color: '#8E5BD0' },
]

export const teamById = id => TEAMS.find(t => t.id === id)

// ── Rosters — generated from a name pool so each team has 14–16 players ──
const FIRST = ['Aiden', 'Mason', 'Leo', 'Owen', 'Eli', 'Jayden', 'Lucas', 'Noah', 'Gavin', 'Isaac', 'Carter', 'Mateo', 'Ryan', 'Caleb', 'Diego', 'Henry', 'Jonah', 'Miles', 'Nolan', 'Theo', 'Asher', 'Ezra', 'Kai', 'Luca']
const LAST  = 'ABCDEFGHJKLMNPRSTW'

export const ROSTERS = Object.fromEntries(TEAMS.map((t, ti) => {
  const size = [16, 14, 14, 12][ti]
  return [t.id, Array.from({ length: size }, (_, i) => ({
    id: `${t.id}-p${i + 1}`,
    name: `${FIRST[(i * 5 + ti * 7) % FIRST.length]} ${LAST[(i * 3 + ti) % LAST.length]}.`,
    number: ((i * 7 + ti * 3) % 23) + 2,
  }))]
}))

// ── Soccer drill library for practice plans ──
export const SOCCER_DRILLS = [
  { id: 'd-dyn',    name: 'Dynamic Warm-Up + Ball Mastery', minutes: 10, focus: 'Warm-up' },
  { id: 'd-rondo',  name: 'Rondo 4v2',                      minutes: 12, focus: 'Possession' },
  { id: 'd-ypass',  name: 'Y-Passing Pattern',              minutes: 12, focus: 'Passing' },
  { id: 'd-1v1',    name: '1v1 to Gates',                   minutes: 10, focus: 'Attacking' },
  { id: 'd-press',  name: '6v4 Pressing Triggers',          minutes: 15, focus: 'Defending' },
  { id: 'd-trans',  name: '5v5+2 Transition Game',          minutes: 15, focus: 'Transition' },
  { id: 'd-finish', name: 'Finishing Waves',                minutes: 12, focus: 'Shooting' },
  { id: 'd-setp',   name: 'Corner & Free Kick Walk-Through',minutes: 10, focus: 'Set pieces' },
  { id: 'd-ssg',    name: 'Small-Sided Scrimmage',          minutes: 20, focus: 'Game play' },
  { id: 'd-cool',   name: 'Cool-Down & Huddle',             minutes: 5,  focus: 'Cool-down' },
]

export const drillById = id => SOCCER_DRILLS.find(d => d.id === id)

const OPPONENTS = ['Riverside United', 'North Valley SC', 'Lakeview FC', 'Eastside Rovers', 'Hillcrest Athletic', 'Prairie City FC']

// Day offsets from today. The overall next event is BDU U13's practice tomorrow (nothing today).
const SCHEDULE = {
  't-u13': { practice: [1, 6, 8, 13, 15, 20], game: [3, 10, 17], pTime: '6:00 PM', gTime: '9:00 AM' },
  't-u12': { practice: [2, 7, 9, 14, 16],     game: [4, 11, 18], pTime: '5:30 PM', gTime: '11:00 AM' },
  't-u11': { practice: [2, 5, 9, 12, 16],     game: [3, 10, 17], pTime: '6:30 PM', gTime: '1:00 PM' },
  't-u10': { practice: [5, 12, 19],           game: [4, 11, 18], pTime: '5:00 PM', gTime: '10:00 AM' },
}

export function seedTeamEvents() {
  const t = todayISO()
  const events = []
  TEAMS.forEach((team, ti) => {
    const s = SCHEDULE[team.id]
    s.practice.forEach((off, i) => events.push({
      id: `${team.id}-pr${i + 1}`, teamId: team.id, type: 'practice',
      date: addDays(t, off), time: s.pTime, location: 'BDU Training Grounds · Field ' + (ti + 1),
    }))
    s.game.forEach((off, i) => {
      const home = (i + ti) % 2 === 0
      events.push({
        id: `${team.id}-g${i + 1}`, teamId: team.id, type: 'game',
        date: addDays(t, off), time: s.gTime,
        opponent: OPPONENTS[(i * 2 + ti) % OPPONENTS.length], home,
        location: home ? 'BDU Stadium' : 'Away',
      })
    })
  })
  return sortEvents(events)
}

export const sortEvents = events =>
  [...events].sort((a, b) => (a.date + toSortTime(a.time)).localeCompare(b.date + toSortTime(b.time)))

// "6:00 PM" → "18:00" so times sort correctly
function toSortTime(t) {
  const [, h, m, ap] = t.match(/(\d+):(\d+)\s*(AM|PM)/i) ?? [, 0, 0, 'AM']
  const hh = (Number(h) % 12) + (ap.toUpperCase() === 'PM' ? 12 : 0)
  return `${String(hh).padStart(2, '0')}:${m}`
}

// ── Plans: one per event, keyed by event id ──
export function emptyPlan(event) {
  if (event.type === 'practice') return { type: 'practice', title: '', drillIds: [] }
  return {
    type: 'game',
    lineup: {},                                   // position → playerId
    points: { focus: '', strategy: '', opponent: '' },
    stats: { us: 0, them: 0, players: {} },       // playerId → { goals, assists, shots, saves }
  }
}

export function seedPlans() {
  const u13 = ROSTERS['t-u13']
  const pos = FORMATS['11v11'].positions
  return {
    // Tomorrow's practice — the demo's "Next Event"
    't-u13-pr1': {
      type: 'practice',
      title: 'Pressing Triggers',
      drillIds: ['d-dyn', 'd-rondo', 'd-press', 'd-trans', 'd-ssg', 'd-cool'],
    },
    // Saturday's game — lineup + game points started
    't-u13-g1': {
      type: 'game',
      lineup: Object.fromEntries(pos.map((p, i) => [p, u13[i].id])),
      points: {
        focus: 'Win the ball back within 5 seconds. Compact between the lines.',
        strategy: '4-3-3, high press on their center backs. Switch play early to the weak side.',
        opponent: 'Riverside United — quick #9, likes to play long. Keeper struggles with low shots.',
      },
      stats: { us: 0, them: 0, players: {} },
    },
    't-u12-pr1': { type: 'practice', title: 'Playing Out of the Back', drillIds: ['d-dyn', 'd-ypass', 'd-rondo', 'd-ssg', 'd-cool'] },
  }
}

// Summary for an event card's plan strip
export function planSummary(event, plan) {
  if (!plan) return { label: event.type === 'game' ? 'Game Plan' : 'Practice Plan', title: 'Not planned yet', empty: true }
  if (plan.type === 'practice') {
    const drills = plan.drillIds.map(drillById)
    return {
      label: 'Practice Plan',
      title: plan.title || 'Untitled plan',
      meta: `${drills.reduce((s, d) => s + d.minutes, 0)} min · ${drills.length} drills`,
    }
  }
  const team = teamById(event.teamId)
  const slots = FORMATS[team.format].positions.length
  const filled = Object.values(plan.lineup).filter(Boolean).length
  const notes = Object.values(plan.points).filter(v => v.trim()).length
  return {
    label: 'Game Plan',
    title: filled === slots ? 'Lineup set' : `Lineup ${filled}/${slots}`,
    meta: `${notes}/3 game points`,
  }
}
