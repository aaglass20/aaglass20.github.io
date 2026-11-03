// Demo data + plan helpers for team-based profiles.
// Hierarchy: Account → Players (account-wide) → Teams (setup + roster) → Events (practice | game) → Plan (one per event).
// Players live on the account so a roster can roll over to next season's team and keep the same kids.
// Demo events are dated relative to today; teams, players, plans and added events are saved by teamStore.js.

import { addDays, todayISO } from './dates'
import { unitsFor, setupFor } from './sportFormats'

// ── Demo teams (Soccer demo login) ──
const DEMO_TEAMS = [
  { id: 't-u13', name: 'BDU U13 2026', ageGroup: 'U13', season: 'Fall 2026',   formatId: '11v11', color: '#00BDB0' },
  { id: 't-u12', name: 'BDU U12 2025', ageGroup: 'U12', season: 'Fall 2026',   formatId: '9v9',   color: '#FF6B1A' },
  { id: 't-u11', name: 'BDU U11 2024', ageGroup: 'U11', season: 'Fall 2026',   formatId: '9v9',   color: '#3B6FD8' },
  { id: 't-u10', name: 'BDU U10 2025', ageGroup: 'U10', season: 'Fall 2026',   formatId: '7v7',   color: '#8E5BD0' },
  // Last season's team — most of these kids rolled over to U13 2026
  { id: 't-u12s', name: 'BDU U12 Spring', ageGroup: 'U12', season: 'Spring 2026', formatId: '9v9', color: '#5C7878', archived: true },
]

const FIRST = ['Aiden', 'Mason', 'Leo', 'Owen', 'Eli', 'Jayden', 'Lucas', 'Noah', 'Gavin', 'Isaac', 'Carter', 'Mateo', 'Ryan', 'Caleb', 'Diego', 'Henry', 'Jonah', 'Miles', 'Nolan', 'Theo', 'Asher', 'Ezra', 'Kai', 'Luca']
const LAST  = 'ABCDEFGHJKLMNPRSTW'

export function seedTeamData() {
  const players = {}
  const teams = DEMO_TEAMS.map((t, ti) => {
    let roster
    if (t.id === 't-u12s') {
      // 13 of U13's players (different numbers last season) + 2 who didn't come back
      roster = Array.from({ length: 13 }, (_, i) => ({ playerId: `t-u13-p${i + 1}`, number: ((i * 5 + 4) % 23) + 2 }))
      ;['Sam R.', 'Wyatt D.'].forEach((name, i) => {
        const id = `t-u12s-p${i + 1}`
        players[id] = { id, name }
        roster.push({ playerId: id, number: 30 + i })
      })
    } else {
      const size = [16, 14, 14, 12][ti]
      roster = Array.from({ length: size }, (_, i) => {
        const id = `${t.id}-p${i + 1}`
        players[id] = { id, name: `${FIRST[(i * 5 + ti * 7) % FIRST.length]} ${LAST[(i * 3 + ti) % LAST.length]}.` }
        return { playerId: id, number: ((i * 7 + ti * 3) % 23) + 2 }
      })
    }
    return { ...t, sport: 'soccer', units: unitsFor('soccer', t.formatId), roster }
  })
  return { teams, players, plans: seedPlans(teams), events: [] }
}

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
// Only soccer has a practice drill library so far
export const drillsForSport = sport => (sport === 'soccer' ? SOCCER_DRILLS : [])

const OPPONENTS = ['Riverside United', 'North Valley SC', 'Lakeview FC', 'Eastside Rovers', 'Hillcrest Athletic', 'Prairie City FC']

// Day offsets from today. The overall next event is BDU U13's practice tomorrow (nothing today).
const SCHEDULE = {
  't-u13': { practice: [1, 6, 8, 13, 15, 20], game: [3, 10, 17], pTime: '6:00 PM', gTime: '9:00 AM' },
  't-u12': { practice: [2, 7, 9, 14, 16],     game: [4, 11, 18], pTime: '5:30 PM', gTime: '11:00 AM' },
  't-u11': { practice: [2, 5, 9, 12, 16],     game: [3, 10, 17], pTime: '6:30 PM', gTime: '1:00 PM' },
  't-u10': { practice: [5, 12, 19],           game: [4, 11, 18], pTime: '5:00 PM', gTime: '10:00 AM' },
}

// Demo schedule for whichever demo teams still exist on the account
export function seedTeamEvents(teams) {
  const t = todayISO()
  const events = []
  teams.forEach((team, ti) => {
    const s = SCHEDULE[team.id]
    if (!s) return
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
  return events
}

export const sortEvents = events =>
  [...events].sort((a, b) => (a.date + toSortTime(a.time)).localeCompare(b.date + toSortTime(b.time)))

// "6:00 PM" → "18:00" so times sort correctly
function toSortTime(t) {
  const [, h, m, ap] = t.match(/(\d+):(\d+)\s*(AM|PM)/i) ?? [, 0, 0, 'AM']
  const hh = (Number(h) % 12) + (ap.toUpperCase() === 'PM' ? 12 : 0)
  return `${String(hh).padStart(2, '0')}:${m}`
}

// "18:30" (from <input type="time">) → "6:30 PM"
export function fromInputTime(v) {
  const [h, m] = v.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

// ── Plans: one per event, keyed by event id ──
export function emptyPlan(event) {
  if (event.type === 'practice') return { type: 'practice', title: '', drillIds: [] }
  return {
    type: 'game',
    lineup: {},                                   // position slot id → playerId
    battingOrder: [],                             // playerIds (softball / baseball)
    points: { focus: '', strategy: '', opponent: '' },
    stats: { us: 0, them: 0, players: {} },       // playerId → { [stat id]: count }
  }
}

function seedPlans(teams) {
  const u13 = teams.find(t => t.id === 't-u13')
  const slotIds = u13.units[0].positions.map(p => p.id)
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
      lineup: Object.fromEntries(slotIds.map((s, i) => [s, u13.roster[i].playerId])),
      battingOrder: [],
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
export function planSummary(event, plan, team) {
  if (!plan) return { label: event.type === 'game' ? 'Game Plan' : 'Practice Plan', title: 'Not planned yet', empty: true }
  if (plan.type === 'practice') {
    const drills = plan.drillIds.map(drillById).filter(Boolean)
    return {
      label: 'Practice Plan',
      title: plan.title || 'Untitled plan',
      meta: `${drills.reduce((s, d) => s + d.minutes, 0)} min · ${drills.length} drills`,
    }
  }
  const slotIds = team.units.flatMap(u => u.positions.map(p => p.id))
  const filled = slotIds.filter(id => plan.lineup[id]).length
  const notes = Object.values(plan.points).filter(v => v.trim()).length
  const order = setupFor(team.sport).battingOrder ? ` · ${plan.battingOrder?.length ?? 0} batting` : ''
  return {
    label: 'Game Plan',
    title: filled === slotIds.length ? 'Lineup set' : `Lineup ${filled}/${slotIds.length}`,
    meta: `${notes}/3 game points${order}`,
  }
}
