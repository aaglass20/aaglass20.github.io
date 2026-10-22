// Mock data for the Adaptive Sports profile.
// Hierarchy: Program → Events (one per week) → Practice Plan → Drills.
// Nothing is persisted — programs live in App state and events are derived from them.

import { addDays, todayISO } from './dates'

// ── Drill library, grouped by the sport a program focuses on ──
export const DRILLS = {
  soccer: [
    { id: 'sc-1', name: 'Buddy Warm-Up (walk / roll / jog)', minutes: 10, focus: 'Warm-up' },
    { id: 'sc-2', name: 'Big-Target Passing Gates',          minutes: 12, focus: 'Passing' },
    { id: 'sc-3', name: 'Cone Dribble Choice Course',        minutes: 12, focus: 'Dribbling' },
    { id: 'sc-4', name: 'Beep-Ball Shooting Lane',           minutes: 10, focus: 'Shooting' },
    { id: 'sc-5', name: 'Small-Sided Inclusive Scrimmage',   minutes: 15, focus: 'Game play' },
    { id: 'sc-6', name: 'Breathing & Stretch Cool-Down',     minutes: 6,  focus: 'Cool-down' },
  ],
  basketball: [
    { id: 'bb-1', name: 'Chair Skills Warm-Up',              minutes: 10, focus: 'Warm-up' },
    { id: 'bb-2', name: 'Push & Dribble Relay',              minutes: 12, focus: 'Ball handling' },
    { id: 'bb-3', name: 'Chest Pass Partner Ladder',         minutes: 10, focus: 'Passing' },
    { id: 'bb-4', name: 'Lowered-Hoop Shooting Stations',    minutes: 15, focus: 'Shooting' },
    { id: 'bb-5', name: '3-on-3 Half Court',                 minutes: 15, focus: 'Game play' },
  ],
  track: [
    { id: 'tf-1', name: 'Dynamic Mobility Circuit',          minutes: 10, focus: 'Warm-up' },
    { id: 'tf-2', name: 'Guide-Runner Starts',               minutes: 12, focus: 'Sprinting' },
    { id: 'tf-3', name: 'Seated Throw Technique',            minutes: 12, focus: 'Throwing' },
    { id: 'tf-4', name: '200m Pace Intervals',               minutes: 15, focus: 'Endurance' },
    { id: 'tf-5', name: 'Balance & Cool-Down Walk',          minutes: 8,  focus: 'Cool-down' },
  ],
  tennis: [
    { id: 'tn-1', name: 'Racquet Ready Warm-Up',             minutes: 8,  focus: 'Warm-up' },
    { id: 'tn-2', name: 'Two-Bounce Rally',                  minutes: 15, focus: 'Rallying' },
    { id: 'tn-3', name: 'Target Serve Practice',             minutes: 12, focus: 'Serving' },
    { id: 'tn-4', name: 'Mini-Court Games',                  minutes: 15, focus: 'Game play' },
  ],
}

const THEMES = {
  soccer:     ['Getting Comfortable', 'Moving With the Ball', 'Passing & Movement', 'Shooting Fun', 'Teamwork', 'Small-Sided Games', 'Skill Challenge', 'Celebration Day'],
  basketball: ['Chair & Ball Basics', 'Dribbling', 'Passing', 'Shooting Form', 'Team Play', 'Mini Tournament'],
  track:      ['Starts & Form', 'Throwing Basics', 'Pacing', 'Relays', 'Personal Bests'],
  tennis:     ['Grip & Ready Position', 'Rallying', 'Serving', 'Match Play'],
}

export const PROGRAM_SPORTS = [
  { id: 'soccer',     label: 'Soccer' },
  { id: 'basketball', label: 'Basketball' },
  { id: 'track',      label: 'Track & Field' },
  { id: 'tennis',     label: 'Tennis' },
]

// ── Practice plan for session n: theme rotates, drills rotate through the library ──
function planFor(sport, n) {
  const drills = DRILLS[sport] ?? DRILLS.soccer
  const themes = THEMES[sport] ?? THEMES.soccer
  // Always open with the warm-up and close with the last drill; rotate the middle
  const middle = drills.slice(1, -1)
  const picks = [drills[0], middle[(n - 1) % middle.length], middle[n % middle.length], drills[drills.length - 1]]
  return {
    title: themes[(n - 1) % themes.length],
    drills: picks,
    minutes: picks.reduce((sum, d) => sum + d.minutes, 0),
  }
}

// ── One event per week, starting on the program's start date ──
export function eventsFor(program) {
  return Array.from({ length: program.weeks }, (_, i) => ({
    id: `${program.id}-s${i + 1}`,
    programId: program.id,
    programName: program.name,
    session: i + 1,
    totalSessions: program.weeks,
    date: addDays(program.startDate, i * 7),
    time: program.time,
    location: program.location,
    plan: planFor(program.sport, i + 1),
  }))
}

export function allEvents(programs) {
  return programs
    .flatMap(eventsFor)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
}

export function upcomingEvents(programs) {
  const today = todayISO()
  return allEvents(programs).filter(e => e.date >= today)
}

// ── Seed programs, dated relative to today so the demo always looks current ──
// Independence Soccer started two weeks before tomorrow → Session 3 is tomorrow (the next event).
export function seedPrograms() {
  const t = todayISO()
  return [
    {
      id: 'p-independence',
      name: 'Independence Soccer',
      sport: 'soccer',
      weeks: 8,
      startDate: addDays(t, -13),
      time: '10:00 AM',
      location: 'Independence Park · Field 2',
    },
    {
      id: 'p-track',
      name: 'Track & Field Pathways',
      sport: 'track',
      weeks: 10,
      startDate: addDays(t, -4),
      time: '5:30 PM',
      location: 'North High Stadium',
    },
    {
      id: 'p-wheelchair-bb',
      name: 'Wheelchair Basketball Clinic',
      sport: 'basketball',
      weeks: 6,
      startDate: addDays(t, 4),
      time: '6:00 PM',
      location: 'Community Rec Center · Gym A',
    },
    {
      id: 'p-tennis',
      name: 'Inclusive Tennis Intro',
      sport: 'tennis',
      weeks: 4,
      startDate: addDays(t, -60),
      time: '9:00 AM',
      location: 'Riverside Courts',
    },
  ]
}

// Summary used by the Programs list
export function programStatus(program) {
  const today = todayISO()
  const events = eventsFor(program)
  const done = events.filter(e => e.date < today).length
  const next = events.find(e => e.date >= today)
  const endDate = events[events.length - 1].date
  const state = done === 0 ? 'upcoming' : next ? 'active' : 'complete'
  return { done, total: events.length, next, endDate, state }
}
