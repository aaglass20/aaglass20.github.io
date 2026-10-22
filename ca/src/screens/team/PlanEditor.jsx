import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { teamById, ROSTERS, SOCCER_DRILLS, drillById, formatFor, emptyPlan } from '../../data/teamMock'
import { fmtLong } from '../../data/dates'
import { useTeams } from './TeamContext'
import '../Screen.css'
import '../shared.css'
import './team.css'

// /plan/:eventId — edit the one plan attached to a practice or game. Changes save as you go (in memory).
export default function PlanEditor() {
  const { eventId } = useParams()
  const { eventById, planFor, savePlan } = useTeams()
  const event = eventById(eventId)

  if (!event) {
    return (
      <div className="screen">
        <Link to="/plan" className="back-link">‹ Plan</Link>
        <div className="card empty-note">That event wasn't found.</div>
      </div>
    )
  }

  const team = teamById(event.teamId)
  const plan = planFor(event) ?? emptyPlan(event)
  const save = next => savePlan(event.id, next)
  const isGame = event.type === 'game'

  return (
    <div className="screen">
      <Link to="/plan" className="back-link">‹ Plan</Link>

      <div className="screen-header">
        <div className="header-eyebrow">
          <span className="team-dot" style={{ background: team.color }} />{team.name} · {isGame ? 'Game Plan' : 'Practice Plan'}
        </div>
        <h1>{isGame ? `vs ${event.opponent}` : plan.title || 'Practice'}</h1>
        <div className="editor-meta">
          {fmtLong(event.date)} · {event.time} · {isGame ? (event.home ? 'Home' : 'Away') : event.location}
        </div>
      </div>

      {isGame
        ? <GamePlan team={team} plan={plan} onChange={save} />
        : <PracticePlan plan={plan} onChange={save} />}
    </div>
  )
}

// ── Practice: title + ordered drills picked from the library ──
function PracticePlan({ plan, onChange }) {
  const drills = plan.drillIds.map(drillById)
  const total = drills.reduce((s, d) => s + d.minutes, 0)

  const move = (i, dir) => {
    const ids = [...plan.drillIds]
    const j = i + dir
    if (j < 0 || j >= ids.length) return
    ;[ids[i], ids[j]] = [ids[j], ids[i]]
    onChange({ ...plan, drillIds: ids })
  }

  return (
    <>
      <label className="np-field editor-title">
        <span>Session focus</span>
        <input
          value={plan.title}
          placeholder="e.g. Pressing Triggers"
          onChange={e => onChange({ ...plan, title: e.target.value })}
        />
      </label>

      <section className="section">
        <div className="section-title-row">
          <h2 className="section-title">Session · {total} min</h2>
          <span className="section-meta">{drills.length} drills</span>
        </div>
        {drills.length ? (
          <ol className="plan-drills">
            {drills.map((d, i) => (
              <li key={d.id} className="plan-drill">
                <span className="plan-drill-num">{i + 1}</span>
                <span className="plan-drill-main">
                  <span className="plan-drill-name">{d.name}</span>
                  <span className="plan-drill-sub">{d.focus} · {d.minutes} min</span>
                </span>
                <span className="plan-drill-tools">
                  <button type="button" onClick={() => move(i, -1)} aria-label="Move up" disabled={i === 0}>↑</button>
                  <button type="button" onClick={() => move(i, 1)} aria-label="Move down" disabled={i === drills.length - 1}>↓</button>
                  <button type="button" onClick={() => onChange({ ...plan, drillIds: plan.drillIds.filter(x => x !== d.id) })} aria-label="Remove">✕</button>
                </span>
              </li>
            ))}
          </ol>
        ) : <div className="card empty-note">Add drills from the library below.</div>}
      </section>

      <section className="section">
        <h2 className="section-title">Drill Library</h2>
        <div className="drill-picker">
          {SOCCER_DRILLS.filter(d => !plan.drillIds.includes(d.id)).map(d => (
            <button key={d.id} type="button" className="drill-pick" onClick={() => onChange({ ...plan, drillIds: [...plan.drillIds, d.id] })}>
              <span className="drill-pick-add">+</span>
              <span className="plan-drill-main">
                <span className="plan-drill-name">{d.name}</span>
                <span className="plan-drill-sub">{d.focus} · {d.minutes} min</span>
              </span>
            </button>
          ))}
        </div>
      </section>
    </>
  )
}

// ── Game: Lineup / Game Points / Stats ──
const GAME_TABS = [
  { id: 'lineup', label: 'Lineup' },
  { id: 'points', label: 'Game Points' },
  { id: 'stats',  label: 'Stats' },
]

function GamePlan({ team, plan, onChange }) {
  const [tab, setTab] = useState('lineup')
  return (
    <>
      <div className="tab-bar" role="tablist">
        {GAME_TABS.map(t => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'lineup' && <Lineup team={team} plan={plan} onChange={onChange} />}
      {tab === 'points' && <GamePoints plan={plan} onChange={onChange} />}
      {tab === 'stats'  && <Stats team={team} plan={plan} onChange={onChange} />}
    </>
  )
}

function Lineup({ team, plan, onChange }) {
  const roster = ROSTERS[team.id]
  const fmt = formatFor(team)
  const used = new Set(Object.values(plan.lineup).filter(Boolean))
  const bench = roster.filter(p => !used.has(p.id))

  const setSlot = (pos, playerId) => onChange({ ...plan, lineup: { ...plan.lineup, [pos]: playerId || undefined } })

  return (
    <>
      <div className="lineup-format">{fmt.label} · {fmt.shape}</div>
      <div className="lineup-grid">
        {fmt.positions.map(pos => (
          <label key={pos} className="lineup-slot">
            <span className="lineup-pos">{pos}</span>
            <select value={plan.lineup[pos] ?? ''} onChange={e => setSlot(pos, e.target.value)}>
              <option value="">— Select player —</option>
              {roster.map(p => (
                <option key={p.id} value={p.id} disabled={used.has(p.id) && plan.lineup[pos] !== p.id}>
                  #{p.number} {p.name}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      <section className="section">
        <h2 className="section-title">Bench · {bench.length}</h2>
        <div className="bench">
          {bench.map(p => <span key={p.id} className="bench-chip">#{p.number} {p.name}</span>)}
          {!bench.length && <span className="empty-note">Everyone is in the lineup.</span>}
        </div>
      </section>
    </>
  )
}

const POINTS = [
  { id: 'focus',    label: 'Focus',              hint: 'The 1–2 things we want to see today' },
  { id: 'strategy', label: 'Strategy',           hint: 'Shape, pressing, build-up, set pieces' },
  { id: 'opponent', label: 'About the opponent', hint: 'Key players, tendencies, what worked last time' },
]

function GamePoints({ plan, onChange }) {
  return (
    <div className="points">
      {POINTS.map(p => (
        <label key={p.id} className="np-field point-field">
          <span>{p.label}</span>
          <textarea
            rows={3}
            placeholder={p.hint}
            value={plan.points[p.id]}
            onChange={e => onChange({ ...plan, points: { ...plan.points, [p.id]: e.target.value } })}
          />
        </label>
      ))}
    </div>
  )
}

const STAT_COLS = [
  { id: 'goals',   label: 'G' },
  { id: 'assists', label: 'A' },
  { id: 'shots',   label: 'Sh' },
  { id: 'saves',   label: 'Sv' },
]

function Stats({ team, plan, onChange }) {
  const roster = ROSTERS[team.id]
  const starters = new Set(Object.values(plan.lineup).filter(Boolean))
  // Starters first, then the bench
  const players = [...roster.filter(p => starters.has(p.id)), ...roster.filter(p => !starters.has(p.id))]

  const bump = (key, delta) => onChange({ ...plan, stats: { ...plan.stats, [key]: Math.max(0, plan.stats[key] + delta) } })
  const bumpPlayer = (pid, col, delta) => {
    const row = plan.stats.players[pid] ?? {}
    const nextRow = { ...row, [col]: Math.max(0, (row[col] ?? 0) + delta) }
    onChange({ ...plan, stats: { ...plan.stats, players: { ...plan.stats.players, [pid]: nextRow } } })
  }

  return (
    <>
      <div className="scoreboard">
        {[['us', 'BDU'], ['them', 'Opponent']].map(([key, label]) => (
          <div key={key} className="score-side">
            <span className="score-label">{label}</span>
            <div className="score-ctrl">
              <button type="button" onClick={() => bump(key, -1)} aria-label={`${label} minus one`}>−</button>
              <span className="score-num">{plan.stats[key]}</span>
              <button type="button" onClick={() => bump(key, 1)} aria-label={`${label} plus one`}>+</button>
            </div>
          </div>
        ))}
      </div>

      <div className="stats-table" role="table">
        <div className="stats-row stats-head" role="row">
          <span role="columnheader">Player</span>
          {STAT_COLS.map(c => <span key={c.id} role="columnheader">{c.label}</span>)}
        </div>
        {players.map(p => {
          const row = plan.stats.players[p.id] ?? {}
          return (
            <div key={p.id} className={`stats-row ${starters.has(p.id) ? 'is-starter' : ''}`} role="row">
              <span className="stats-player" role="cell">#{p.number} {p.name}</span>
              {STAT_COLS.map(c => (
                <button
                  key={c.id}
                  type="button"
                  role="cell"
                  className={`stat-cell ${row[c.id] ? 'has-value' : ''}`}
                  onClick={() => bumpPlayer(p.id, c.id, 1)}
                  onContextMenu={e => { e.preventDefault(); bumpPlayer(p.id, c.id, -1) }}
                  aria-label={`${p.name} ${c.label}: ${row[c.id] ?? 0}. Tap to add.`}
                >
                  {row[c.id] ?? 0}
                </button>
              ))}
            </div>
          )
        })}
      </div>
      <p className="stats-hint">Tap a cell to add one. Right-click (or long-press) to subtract.</p>
    </>
  )
}
