import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { drillsForSport, drillById, emptyPlan } from '../../data/teamMock'
import { setupFor, formatLabel } from '../../data/sportFormats'
import { fmtLong } from '../../data/dates'
import { useTeams } from './TeamContext'
import '../Screen.css'
import '../shared.css'
import './team.css'

// /plan/:eventId — edit the one plan attached to a practice or game. Changes save as you go (in memory).
export default function PlanEditor() {
  const { eventId } = useParams()
  const { eventById, planFor, savePlan, teamById } = useTeams()
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
  const plan = { ...emptyPlan(event), ...planFor(event) }
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
        : <PracticePlan team={team} plan={plan} onChange={save} />}
    </div>
  )
}

// ── Practice: title + ordered drills picked from the library ──
function PracticePlan({ team, plan, onChange }) {
  const library = drillsForSport(team.sport)
  const drills = plan.drillIds.map(drillById).filter(Boolean)
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
        {!library.length && <div className="card empty-note">A drill library for this sport is coming soon.</div>}
        <div className="drill-picker">
          {library.filter(d => !plan.drillIds.includes(d.id)).map(d => (
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
      {tab === 'points' && <GamePoints team={team} plan={plan} onChange={onChange} />}
      {tab === 'stats'  && <Stats team={team} plan={plan} onChange={onChange} />}
    </>
  )
}

function Lineup({ team, plan, onChange }) {
  const { rosterOf } = useTeams()
  const roster = rosterOf(team)
  const byId = Object.fromEntries(roster.map(p => [p.id, p]))
  const inLineup = new Set(team.units.flatMap(u => u.positions.map(p => plan.lineup[p.id])).filter(Boolean))
  const bench = roster.filter(p => !inLineup.has(p.id))
  const batting = setupFor(team.sport).battingOrder

  const setSlot = (slotId, playerId) => onChange({ ...plan, lineup: { ...plan.lineup, [slotId]: playerId || undefined } })

  return (
    <>
      <div className="lineup-format">
        {formatLabel(team)} <Link to={`/teams/${team.id}`} className="lineup-edit">Edit positions</Link>
      </div>

      {batting && <BattingOrder roster={roster} byId={byId} plan={plan} onChange={onChange} />}

      {team.units.map(u => {
        // A player can be in more than one unit (two-way football players), but only once per unit
        const used = new Set(u.positions.map(p => plan.lineup[p.id]).filter(Boolean))
        return (
          <section key={u.id} className="section lineup-unit">
            {(team.units.length > 1 || batting) && <h2 className="section-title">{u.label}</h2>}
            <div className="lineup-grid">
              {u.positions.map(pos => (
                <label key={pos.id} className="lineup-slot">
                  <span className="lineup-pos">{pos.label}</span>
                  <select value={byId[plan.lineup[pos.id]] ? plan.lineup[pos.id] : ''} onChange={e => setSlot(pos.id, e.target.value)}>
                    <option value="">— Select player —</option>
                    {roster.map(p => (
                      <option key={p.id} value={p.id} disabled={used.has(p.id) && plan.lineup[pos.id] !== p.id}>
                        {p.number ? `#${p.number} ` : ''}{p.name}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </section>
        )
      })}

      {!roster.length && <div className="card empty-note">This team has no players yet. <Link to={`/teams/${team.id}`}>Add your roster</Link>.</div>}

      <section className="section">
        <h2 className="section-title">Bench · {bench.length}</h2>
        <div className="bench">
          {bench.map(p => <span key={p.id} className="bench-chip">{p.number ? `#${p.number} ` : ''}{p.name}</span>)}
          {!bench.length && roster.length > 0 && <span className="empty-note">Everyone is in the lineup.</span>}
        </div>
      </section>
    </>
  )
}

// Softball / baseball: batting order is its own list (everyone can bat, even players not in the field)
function BattingOrder({ roster, byId, plan, onChange }) {
  const order = plan.battingOrder.filter(id => byId[id])
  const rest = roster.filter(p => !order.includes(p.id))
  const setOrder = ids => onChange({ ...plan, battingOrder: ids })
  const move = (i, dir) => {
    const ids = [...order]
    const j = i + dir
    if (j < 0 || j >= ids.length) return
    ;[ids[i], ids[j]] = [ids[j], ids[i]]
    setOrder(ids)
  }

  return (
    <section className="section">
      <div className="section-title-row">
        <h2 className="section-title">Batting Order · {order.length}</h2>
        {rest.length > 0 && <button type="button" className="section-link link-btn" onClick={() => setOrder([...order, ...rest.map(p => p.id)])}>Add everyone</button>}
      </div>
      {order.length > 0 && (
        <ol className="plan-drills">
          {order.map((id, i) => (
            <li key={id} className="plan-drill">
              <span className="plan-drill-num">{i + 1}</span>
              <span className="plan-drill-main">
                <span className="plan-drill-name">{byId[id].number ? `#${byId[id].number} ` : ''}{byId[id].name}</span>
              </span>
              <span className="plan-drill-tools">
                <button type="button" onClick={() => move(i, -1)} aria-label="Move up" disabled={i === 0}>↑</button>
                <button type="button" onClick={() => move(i, 1)} aria-label="Move down" disabled={i === order.length - 1}>↓</button>
                <button type="button" onClick={() => setOrder(order.filter(x => x !== id))} aria-label="Remove">✕</button>
              </span>
            </li>
          ))}
        </ol>
      )}
      {rest.length > 0 && (
        <div className="bench batting-add">
          {rest.map(p => (
            <button key={p.id} type="button" className="bench-chip is-add" onClick={() => setOrder([...order, p.id])}>
              + {p.number ? `#${p.number} ` : ''}{p.name}
            </button>
          ))}
        </div>
      )}
    </section>
  )
}

const POINTS = [
  { id: 'focus',    label: 'Focus',              hint: 'The 1–2 things we want to see today' },
  { id: 'strategy', label: 'Strategy' },
  { id: 'opponent', label: 'About the opponent', hint: 'Key players, tendencies, what worked last time' },
]

function GamePoints({ team, plan, onChange }) {
  return (
    <div className="points">
      {POINTS.map(p => (
        <label key={p.id} className="np-field point-field">
          <span>{p.label}</span>
          <textarea
            rows={3}
            placeholder={p.hint ?? setupFor(team.sport).strategyHint}
            value={plan.points[p.id]}
            onChange={e => onChange({ ...plan, points: { ...plan.points, [p.id]: e.target.value } })}
          />
        </label>
      ))}
    </div>
  )
}

function Stats({ team, plan, onChange }) {
  const { rosterOf } = useTeams()
  const roster = rosterOf(team)
  const STAT_COLS = setupFor(team.sport).stats
  const starters = new Set(team.units.flatMap(u => u.positions.map(p => plan.lineup[p.id])).filter(Boolean))
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
        {[['us', 'Us'], ['them', 'Opponent']].map(([key, label]) => (
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
              <span className="stats-player" role="cell">{p.number ? `#${p.number} ` : ''}{p.name}</span>
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
