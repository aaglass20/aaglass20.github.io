import BaseEventCard, { DrillList } from '../../components/EventCard'
import { fmtRelative } from '../../data/dates'

// A program session with its practice plan. Tap to show the plan's drills.
export default function EventCard({ event, highlight = false, defaultOpen = false }) {
  const { plan } = event
  return (
    <BaseEventCard
      eyebrow={event.programName}
      title={`Session ${event.session}`}
      titleSuffix={`of ${event.totalSessions}`}
      meta={[`${fmtRelative(event.date)} · ${event.time}`, event.location]}
      plan={{ label: 'Practice Plan', title: plan.title, meta: `${plan.minutes} min · ${plan.drills.length} drills` }}
      highlight={highlight}
      defaultOpen={defaultOpen}
    >
      <DrillList drills={plan.drills} />
    </BaseEventCard>
  )
}
