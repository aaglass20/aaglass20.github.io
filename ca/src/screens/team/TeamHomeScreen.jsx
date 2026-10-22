import { useState } from 'react'
import { firstNameOf, sportLabelOf } from '../../data/account'
import { ROSTERS, formatFor } from '../../data/teamMock'
import { fmtRelative } from '../../data/dates'
import { useTeams } from './TeamContext'
import TeamEventCard from './TeamEventCard'
import '../Screen.css'
import '../shared.css'
import './team.css'

export default function TeamHomeScreen({ account }) {
  const { teams, team, teamId, setTeamId, scopedUpcoming, upcomingFor } = useTeams()
  const [query, setQuery] = useState('')

  const next = scopedUpcoming[0]
  const q = query.trim().toLowerCase()
  const shown = teams.filter(t => !q || t.name.toLowerCase().includes(q))

  return (
    <div className="screen">
      <div className="screen-header">
        <div className="header-eyebrow">Welcome, {firstNameOf(account?.name)} · {sportLabelOf(account)}</div>
        <h1>{team ? team.name : 'Dashboard'}</h1>
      </div>

      <section className="section">
        <div className="section-title-row">
          <h2 className="section-title">{team ? 'Next for this team' : 'Next Event · all teams'}</h2>
          {team && <button type="button" className="section-link link-btn" onClick={() => setTeamId(null)}>All teams ✕</button>}
        </div>
        {next
          ? <TeamEventCard key={next.id} event={next} highlight defaultOpen />
          : <div className="card empty-note">Nothing scheduled.</div>}
      </section>

      <section className="section">
        <h2 className="section-title">Your Teams</h2>
        <input
          type="search"
          className="search-input"
          placeholder="Search teams"
          value={query}
          onChange={e => setQuery(e.target.value)}
          aria-label="Search teams"
        />

        <div className="team-list" role="list">
          {shown.map(t => {
            const upcoming = upcomingFor(t.id)
            const nextUp = upcoming[0]
            const selected = t.id === teamId
            return (
              <button
                key={t.id}
                type="button"
                role="listitem"
                aria-pressed={selected}
                className={`team-card ${selected ? 'is-selected' : ''}`}
                style={{ '--team': t.color }}
                onClick={() => setTeamId(selected ? null : t.id)}
              >
                <span className="team-badge">{t.age}</span>
                <span className="team-card-main">
                  <span className="team-name">{t.name}</span>
                  <span className="team-sub">
                    {formatFor(t).label} · {ROSTERS[t.id].length} players
                  </span>
                  {nextUp && (
                    <span className="team-next">
                      Next: {nextUp.type === 'game' ? `vs ${nextUp.opponent}` : 'Practice'} · {fmtRelative(nextUp.date)}
                    </span>
                  )}
                </span>
                <span className="team-check" aria-hidden="true">{selected ? '✓' : '›'}</span>
              </button>
            )
          })}
          {!shown.length && <div className="card empty-note">No teams match “{query}”.</div>}
        </div>
      </section>
    </div>
  )
}
