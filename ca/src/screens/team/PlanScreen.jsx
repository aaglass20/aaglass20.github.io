import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { teamById, planSummary } from '../../data/teamMock'
import { fmtRelative } from '../../data/dates'
import { useTeams } from './TeamContext'
import TeamScopeBar from './TeamScopeBar'
import '../Screen.css'
import '../shared.css'
import './team.css'

// Plan tab: start a new practice/game plan, and see upcoming events with their plan status.
export default function PlanScreen() {
  const { scopedUpcoming, planFor } = useTeams()
  const [creating, setCreating] = useState(false)

  const planned   = scopedUpcoming.filter(e => planFor(e))
  const unplanned = scopedUpcoming.filter(e => !planFor(e)).slice(0, 8)

  return (
    <div className="screen">
      <div className="screen-header space-between">
        <div>
          <div className="header-eyebrow">Builder</div>
          <h1>Plan</h1>
        </div>
        {!creating && <button className="btn-primary" onClick={() => setCreating(true)}>+ New Plan</button>}
      </div>

      <TeamScopeBar />

      {creating && <NewPlan onCancel={() => setCreating(false)} />}

      <section className="section">
        <h2 className="section-title">Upcoming Plans</h2>
        {planned.length
          ? <div className="plan-rows">{planned.map(e => <PlanRow key={e.id} event={e} />)}</div>
          : <div className="card empty-note">No plans yet. Tap + New Plan to start one.</div>}
      </section>

      <section className="section">
        <h2 className="section-title">Needs a Plan</h2>
        <div className="plan-rows">{unplanned.map(e => <PlanRow key={e.id} event={e} />)}</div>
      </section>
    </div>
  )
}

function PlanRow({ event }) {
  const { planFor } = useTeams()
  const team = teamById(event.teamId)
  const s = planSummary(event, planFor(event))
  return (
    <Link to={`/plan/${event.id}`} className="plan-row">
      <span className={`type-pill is-${event.type}`}>{event.type === 'game' ? 'Game' : 'Practice'}</span>
      <span className="plan-row-main">
        <span className="plan-row-title">
          {event.type === 'game' ? `vs ${event.opponent}` : s.empty ? 'Practice' : s.title}
        </span>
        <span className="plan-row-sub">
          <span className="team-dot" style={{ background: team.color }} />{team.name} · {fmtRelative(event.date)} · {event.time}
        </span>
      </span>
      <span className={`plan-row-status ${s.empty ? 'is-empty' : ''}`}>{s.empty ? 'Plan' : s.meta}</span>
      <span className="chevron">›</span>
    </Link>
  )
}

// New plan: choose Practice or Game → team (if none selected) → which event
function NewPlan({ onCancel }) {
  const { teams, team, upcomingFor, ensurePlan } = useTeams()
  const navigate = useNavigate()
  const [type, setType]     = useState(null)
  const [pickTeam, setPick] = useState(team?.id ?? null)
  const teamIdForPlan = team?.id ?? pickTeam

  const options = teamIdForPlan ? upcomingFor(teamIdForPlan).filter(e => e.type === type) : []

  function start(event) {
    ensurePlan(event)
    navigate(`/plan/${event.id}`)
  }

  return (
    <div className="card new-plan">
      <div className="new-plan-head">
        <h2 className="new-plan-title">New Plan</h2>
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
      </div>

      <div className="np-step-label">1 · What are you planning?</div>
      <div className="type-choice">
        {[
          { id: 'practice', label: 'Practice', sub: 'Drills, timing, focus' },
          { id: 'game',     label: 'Game',     sub: 'Lineup, game points, stats' },
        ].map(o => (
          <button
            key={o.id}
            type="button"
            className={`type-option is-${o.id} ${type === o.id ? 'is-selected' : ''}`}
            onClick={() => setType(o.id)}
          >
            <span className="type-option-icon" aria-hidden="true">{o.id === 'game' ? '🏆' : '📋'}</span>
            <span className="type-option-label">{o.label}</span>
            <span className="type-option-sub">{o.sub}</span>
          </button>
        ))}
      </div>

      {type && !team && (
        <>
          <div className="np-step-label">2 · Which team?</div>
          <div className="filter-chips">
            {teams.map(t => (
              <button key={t.id} type="button" className={`chip ${pickTeam === t.id ? 'active' : ''}`} onClick={() => setPick(t.id)}>
                {t.name}
              </button>
            ))}
          </div>
        </>
      )}

      {type && teamIdForPlan && (
        <>
          <div className="np-step-label">{team ? '2' : '3'} · Which {type}?</div>
          <div className="plan-rows">
            {options.map(e => (
              <button key={e.id} type="button" className="plan-row" onClick={() => start(e)}>
                <span className={`type-pill is-${e.type}`}>{e.type === 'game' ? 'Game' : 'Practice'}</span>
                <span className="plan-row-main">
                  <span className="plan-row-title">{e.type === 'game' ? `vs ${e.opponent}` : 'Practice'}</span>
                  <span className="plan-row-sub">{fmtRelative(e.date)} · {e.time} · {e.location}</span>
                </span>
                <span className="chevron">›</span>
              </button>
            ))}
            {!options.length && <div className="empty-note">No upcoming {type}s for this team.</div>}
          </div>
        </>
      )}
    </div>
  )
}
