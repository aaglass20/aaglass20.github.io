import { Link } from 'react-router-dom'
import { useTeams } from './TeamContext'

// Shows which team the tab is scoped to, with a way back to "all teams".
export default function TeamScopeBar() {
  const { team, setTeamId } = useTeams()

  if (!team) {
    return (
      <div className="scope-bar">
        <span className="scope-label">Showing <strong>all teams</strong></span>
        <Link to="/" className="scope-action">Pick a team</Link>
      </div>
    )
  }

  return (
    <div className="scope-bar is-team" style={{ '--team': team.color }}>
      <span className="team-dot" style={{ background: team.color }} />
      <span className="scope-label"><strong>{team.name}</strong></span>
      <button type="button" className="scope-action" onClick={() => setTeamId(null)}>All teams ✕</button>
    </div>
  )
}
