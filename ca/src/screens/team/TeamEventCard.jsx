import { Link } from 'react-router-dom'
import EventCard, { DrillList } from '../../components/EventCard'
import { teamById, drillById, planSummary } from '../../data/teamMock'
import { fmtRelative } from '../../data/dates'
import { useTeams } from './TeamContext'

// A practice or game for one team, with its plan summary. Practices expand to show drills.
export default function TeamEventCard({ event, highlight = false, defaultOpen = false }) {
  const { planFor } = useTeams()
  const team = teamById(event.teamId)
  const plan = planFor(event)
  const isGame = event.type === 'game'

  const title = isGame ? `vs ${event.opponent}` : 'Practice'
  const badge = <span className={`type-pill is-${event.type}`}>{isGame ? (event.home ? 'Home game' : 'Away game') : 'Practice'}</span>

  return (
    <EventCard
      eyebrow={<><span className="team-dot" style={{ background: team.color }} />{team.name}</>}
      badge={badge}
      title={title}
      meta={[`${fmtRelative(event.date)} · ${event.time}`, event.location]}
      plan={planSummary(event, plan)}
      highlight={highlight}
      defaultOpen={defaultOpen}
    >
      {plan?.type === 'practice' && plan.drillIds.length > 0 && <DrillList drills={plan.drillIds.map(drillById)} />}
      <div className="event-actions">
        <Link to={`/plan/${event.id}`} className="btn-primary">
          {plan ? 'Open plan' : `Plan this ${isGame ? 'game' : 'practice'}`}
        </Link>
      </div>
    </EventCard>
  )
}
