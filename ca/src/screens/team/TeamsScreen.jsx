import { Link } from 'react-router-dom'
import { formatLabel } from '../../data/sportFormats'
import { fmtRelative } from '../../data/dates'
import { useTeams } from './TeamContext'
import '../Screen.css'
import '../shared.css'
import './team.css'

// /teams — every team on the account (active + archived) and the way into New Team setup.
export default function TeamsScreen() {
  const { teams, activeTeams, upcomingFor, resetDemo, sport } = useTeams()
  const archived = teams.filter(t => t.archived)

  return (
    <div className="screen">
      <div className="screen-header space-between">
        <div>
          <div className="header-eyebrow">Setup</div>
          <h1>Teams</h1>
        </div>
        <Link to="/teams/new" className="btn-primary">+ New Team</Link>
      </div>

      <section className="section">
        <h2 className="section-title">Active · {activeTeams.length}</h2>
        {activeTeams.length ? (
          <div className="team-list">
            {activeTeams.map(t => <TeamLink key={t.id} team={t} next={upcomingFor(t.id)[0]} />)}
          </div>
        ) : (
          <div className="card empty-note">
            No teams yet. <Link to="/teams/new">Set up your first team</Link> — you'll pick how many play at a time, positions, and your roster.
          </div>
        )}
      </section>

      {archived.length > 0 && (
        <section className="section">
          <h2 className="section-title">Past seasons · {archived.length}</h2>
          <div className="team-list">
            {archived.map(t => <TeamLink key={t.id} team={t} />)}
          </div>
        </section>
      )}

      {sport === 'soccer' && (
        <button
          type="button"
          className="link-btn reset-demo"
          onClick={() => window.confirm('Reset to the demo teams? Teams, rosters and plans you made will be removed.') && resetDemo()}
        >
          Reset demo data
        </button>
      )}
    </div>
  )
}

function TeamLink({ team, next }) {
  return (
    <Link to={`/teams/${team.id}`} className={`team-card ${team.archived ? 'is-archived' : ''}`} style={{ '--team': team.color }}>
      <span className="team-badge">{team.ageGroup}</span>
      <span className="team-card-main">
        <span className="team-name">{team.name}</span>
        <span className="team-sub">{team.season ? `${team.season} · ` : ''}{formatLabel(team)} · {team.roster.length} players</span>
        {next && (
          <span className="team-next">Next: {next.type === 'game' ? `vs ${next.opponent}` : 'Practice'} · {fmtRelative(next.date)}</span>
        )}
      </span>
      <span className="team-check" aria-hidden="true">›</span>
    </Link>
  )
}
