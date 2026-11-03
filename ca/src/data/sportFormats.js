// Team setup options per sport: formats (how many play at once) → units (offense/defense,
// or one unit for the whole field) → formations → default positions.
// A team copies the default positions when it's created and can rename, add or remove them.

// Turn position labels into slots with ids that stay put when a label is renamed.
// Lineups are keyed by slot id, so renaming "LS" → "ST" keeps the player in that spot.
const slots = (unit, labels) => labels.map((label, i) => ({ id: `${unit}${i + 1}`, label }))

const field   = (label, formations) => ({ id: 'f', label, formations })
const offense = formations => ({ id: 'o', label: 'Offense', formations })
const defense = formations => ({ id: 'd', label: 'Defense', formations })

export const SPORT_SETUP = {
  soccer: {
    defaultFormat: age => (ageNum(age) <= 8 ? '4v4' : ageNum(age) <= 10 ? '7v7' : ageNum(age) <= 12 ? '9v9' : '11v11'),
    formats: [
      { id: '4v4', label: '4v4', sub: 'U6–U8 · no keeper', units: [field('On the field', [
        { id: '1-2-1', label: 'Diamond 1-2-1', positions: ['D', 'LM', 'RM', 'F'] },
        { id: '2-2',   label: 'Box 2-2',       positions: ['LD', 'RD', 'LF', 'RF'] },
      ])] },
      { id: '7v7', label: '7v7', sub: 'U9–U10', units: [field('On the field', [
        { id: '2-3-1', label: '2-3-1', positions: ['GK', 'LB', 'RB', 'LM', 'CM', 'RM', 'ST'] },
        { id: '3-2-1', label: '3-2-1', positions: ['GK', 'LB', 'CB', 'RB', 'LM', 'RM', 'ST'] },
      ])] },
      { id: '9v9', label: '9v9', sub: 'U11–U12', units: [field('On the field', [
        { id: '3-3-2', label: '3-3-2', positions: ['GK', 'LB', 'CB', 'RB', 'LM', 'CM', 'RM', 'LS', 'RS'] },
        { id: '3-2-3', label: '3-2-3', positions: ['GK', 'LB', 'CB', 'RB', 'LCM', 'RCM', 'LW', 'ST', 'RW'] },
      ])] },
      { id: '11v11', label: '11v11', sub: 'U13+', units: [field('On the field', [
        { id: '4-3-3',   label: '4-3-3',   positions: ['GK', 'LB', 'LCB', 'RCB', 'RB', 'LCM', 'CDM', 'RCM', 'LW', 'ST', 'RW'] },
        { id: '4-4-2',   label: '4-4-2',   positions: ['GK', 'LB', 'LCB', 'RCB', 'RB', 'LM', 'LCM', 'RCM', 'RM', 'LS', 'RS'] },
        { id: '4-2-3-1', label: '4-2-3-1', positions: ['GK', 'LB', 'LCB', 'RCB', 'RB', 'LDM', 'RDM', 'LW', 'CAM', 'RW', 'ST'] },
        { id: '3-5-2',   label: '3-5-2',   positions: ['GK', 'LCB', 'CB', 'RCB', 'LWB', 'LCM', 'CDM', 'RCM', 'RWB', 'LS', 'RS'] },
      ])] },
    ],
    stats: [{ id: 'goals', label: 'G' }, { id: 'assists', label: 'A' }, { id: 'shots', label: 'Sh' }, { id: 'saves', label: 'Sv' }],
    strategyHint: 'Shape, pressing, build-up, set pieces',
  },

  football: {
    defaultFormat: age => (ageNum(age) <= 8 ? '5v5' : ageNum(age) <= 10 ? '7v7' : ageNum(age) <= 12 ? '8v8' : '11v11'),
    formats: [
      { id: '5v5', label: '5v5', sub: 'Flag', units: [
        offense([{ id: 'trips', label: 'Trips', positions: ['QB', 'C', 'X', 'Y', 'Z'] }]),
        defense([{ id: '1-4',   label: 'Rusher + 4', positions: ['Rusher', 'LCB', 'RCB', 'LB', 'S'] }]),
      ] },
      { id: '7v7', label: '7v7', sub: 'Flag or tackle', units: [
        offense([
          { id: 'spread', label: 'Spread', positions: ['QB', 'C', 'RB', 'X', 'Y', 'Z', 'H'] },
          { id: 'i',      label: 'I-Form', positions: ['QB', 'C', 'FB', 'TB', 'TE', 'X', 'Z'] },
        ]),
        defense([
          { id: '3-2-2', label: '3-2-2', positions: ['LDE', 'NT', 'RDE', 'LB', 'LB', 'CB', 'CB'] },
          { id: '2-3-2', label: '2-3-2 (cover)', positions: ['LB', 'MLB', 'LB', 'LCB', 'RCB', 'FS', 'SS'] },
        ]),
      ] },
      { id: '8v8', label: '8v8', sub: 'Youth tackle', units: [
        offense([{ id: 'i', label: 'I-Form', positions: ['QB', 'FB', 'TB', 'LG', 'C', 'RG', 'TE', 'WR'] }]),
        defense([{ id: '4-2-2', label: '4-2-2', positions: ['LDE', 'LDT', 'RDT', 'RDE', 'LB', 'LB', 'CB', 'CB'] }]),
      ] },
      { id: '11v11', label: '11v11', sub: 'Tackle', units: [
        offense([
          { id: 'pro-i',  label: 'Pro I',  positions: ['QB', 'FB', 'TB', 'LT', 'LG', 'C', 'RG', 'RT', 'TE', 'X', 'Z'] },
          { id: 'spread', label: 'Spread', positions: ['QB', 'RB', 'LT', 'LG', 'C', 'RG', 'RT', 'X', 'H', 'Y', 'Z'] },
        ]),
        defense([
          { id: '4-3', label: '4-3', positions: ['LDE', 'LDT', 'RDT', 'RDE', 'SLB', 'MLB', 'WLB', 'LCB', 'RCB', 'FS', 'SS'] },
          { id: '3-4', label: '3-4', positions: ['LDE', 'NT', 'RDE', 'LOLB', 'LILB', 'RILB', 'ROLB', 'LCB', 'RCB', 'FS', 'SS'] },
          { id: '5-3', label: '5-3', positions: ['LDE', 'LDT', 'NG', 'RDT', 'RDE', 'LB', 'MLB', 'LB', 'LCB', 'RCB', 'S'] },
        ]),
      ] },
    ],
    stats: [{ id: 'td', label: 'TD' }, { id: 'tackles', label: 'Tkl' }, { id: 'ints', label: 'INT' }, { id: 'sacks', label: 'Sk' }],
    strategyHint: 'Base plays, protections, coverages, special teams',
  },

  basketball: {
    defaultFormat: age => (ageNum(age) <= 8 ? '4v4' : '5v5'),
    formats: [
      { id: '3v3', label: '3v3', sub: 'Half court', units: [field('On the court', [
        { id: 'std', label: 'Guard–Wing–Post', positions: ['G', 'W', 'Post'] },
      ])] },
      { id: '4v4', label: '4v4', sub: 'U8 and under', units: [field('On the court', [
        { id: 'std', label: '2 guards, 2 forwards', positions: ['PG', 'G', 'F', 'F'] },
      ])] },
      { id: '5v5', label: '5v5', sub: 'Full court', units: [field('On the court', [
        { id: 'std',   label: 'Traditional', positions: ['PG', 'SG', 'SF', 'PF', 'C'] },
        { id: '4-out', label: '4-out 1-in',  positions: ['PG', 'G', 'Wing', 'Wing', 'Post'] },
        { id: '5-out', label: '5-out',       positions: ['1', '2', '3', '4', '5'] },
      ])] },
    ],
    stats: [{ id: 'points', label: 'Pts' }, { id: 'rebounds', label: 'Reb' }, { id: 'assists', label: 'Ast' }, { id: 'steals', label: 'Stl' }],
    strategyHint: 'Offense sets, defense (man / zone), press, out-of-bounds plays',
  },

  softball: {
    defaultFormat: age => (ageNum(age) <= 8 ? '10' : '9'),
    battingOrder: true,
    formats: [
      { id: '9', label: '9 fielders', sub: 'Standard', units: [defense([
        { id: 'std', label: 'Standard', positions: ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF'] },
      ])] },
      { id: '10', label: '10 fielders', sub: 'Rec / younger', units: [defense([
        { id: '4of', label: '4 outfielders', positions: ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'LCF', 'RCF', 'RF'] },
        { id: 'sf',  label: 'Short fielder', positions: ['P', 'C', '1B', '2B', '3B', 'SS', 'SF', 'LF', 'CF', 'RF'] },
      ])] },
    ],
    stats: [{ id: 'hits', label: 'H' }, { id: 'runs', label: 'R' }, { id: 'rbi', label: 'RBI' }, { id: 'walks', label: 'BB' }],
    strategyHint: 'Pitching plan, bunt defense, steals, who plays where each inning',
  },

  baseball: {
    defaultFormat: age => (ageNum(age) <= 8 ? '10' : '9'),
    battingOrder: true,
    formats: [
      { id: '9', label: '9 fielders', sub: 'Standard', units: [defense([
        { id: 'std', label: 'Standard', positions: ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF'] },
      ])] },
      { id: '10', label: '10 fielders', sub: 'Coach pitch / T-ball', units: [defense([
        { id: '4of', label: '4 outfielders', positions: ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'LCF', 'RCF', 'RF'] },
      ])] },
    ],
    stats: [{ id: 'hits', label: 'H' }, { id: 'runs', label: 'R' }, { id: 'rbi', label: 'RBI' }, { id: 'walks', label: 'BB' }],
    strategyHint: 'Pitch counts, bunt defense, first-and-third, who plays where each inning',
  },
}

export const CUSTOM_FORMAT = { id: 'custom', label: 'Custom', sub: 'Pick a number' }

export const AGE_GROUPS = ['U6', 'U7', 'U8', 'U9', 'U10', 'U11', 'U12', 'U13', 'U14', 'U15', 'U16', 'U17', 'U18', 'U19', 'HS', 'Adult']

export const TEAM_COLORS = ['#00BDB0', '#FF6B1A', '#3B6FD8', '#8E5BD0', '#E0457B', '#2E9E4F', '#D9A400', '#0F1D2E']

// "U12" → 12; HS / Adult count as older than any U-age
function ageNum(age = '') {
  const m = age.match(/U(\d+)/)
  return m ? Number(m[1]) : 99
}

export const setupFor = sport => SPORT_SETUP[sport] ?? SPORT_SETUP.soccer
export const formatsFor = sport => [...setupFor(sport).formats, CUSTOM_FORMAT]

// Units with their default positions for a format + chosen formation per unit.
// formationIds: { [unitId]: formationId } — missing ones use the unit's first formation.
export function unitsFor(sport, formatId, formationIds = {}, customCount = 7) {
  if (formatId === 'custom') {
    // Same unit split as the sport's first format (e.g. football keeps Offense + Defense)
    const base = setupFor(sport).formats[0].units
    return base.map(u => ({
      id: u.id, label: u.label, formationId: 'custom',
      positions: slots(u.id, Array.from({ length: customCount }, (_, i) => `Pos ${i + 1}`)),
    }))
  }
  const fmt = setupFor(sport).formats.find(f => f.id === formatId)
  return fmt.units.map(u => {
    const formation = u.formations.find(f => f.id === formationIds[u.id]) ?? u.formations[0]
    return { id: u.id, label: u.label, formationId: formation.id, positions: slots(u.id, formation.positions) }
  })
}

export const formationsFor = (sport, formatId, unitId) =>
  setupFor(sport).formats.find(f => f.id === formatId)?.units.find(u => u.id === unitId)?.formations ?? []

// e.g. "11v11 · 4-3-3" or "11v11 · Pro I / 4-3"
export function formatLabel(team) {
  const fmt = formatsFor(team.sport).find(f => f.id === team.formatId)
  const count = team.units[0]?.positions.length ?? 0
  if (team.formatId === 'custom') return `Custom · ${count} on the field`
  const shapes = team.units.map(u => formationsFor(team.sport, team.formatId, u.id).find(f => f.id === u.formationId)?.label ?? 'Custom')
  return `${fmt?.label ?? team.formatId} · ${shapes.join(' / ')}`
}
