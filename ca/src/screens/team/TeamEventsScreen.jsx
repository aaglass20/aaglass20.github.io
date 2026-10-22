import { useEffect, useMemo, useState } from 'react'
import { todayISO, fmtLong } from '../../data/dates'
import DayStrip from '../../components/DayStrip'
import { useTeams } from './TeamContext'
import TeamScopeBar from './TeamScopeBar'
import TeamEventCard from './TeamEventCard'
import '../Screen.css'
import '../shared.css'
import './team.css'

const FILTERS = [
  { id: 'all',      label: 'All' },
  { id: 'practice', label: 'Practices' },
  { id: 'game',     label: 'Games' },
]

export default function TeamEventsScreen() {
  const { scopedUpcoming, teamId } = useTeams()
  const [type, setType] = useState('all')

  const events = useMemo(
    () => scopedUpcoming.filter(e => type === 'all' || e.type === type),
    [scopedUpcoming, type],
  )
  const eventDates = useMemo(() => new Set(events.map(e => e.date)), [events])
  const [selected, setSelected] = useState(events[0]?.date ?? todayISO())

  // Changing team or filter jumps to that scope's next event date
  useEffect(() => { setSelected(events[0]?.date ?? todayISO()) }, [teamId, type])

  const dayEvents = events.filter(e => e.date === selected)
  const later = events.filter(e => e.date > selected)

  return (
    <div className="screen">
      <div className="screen-header">
        <div className="header-eyebrow">Schedule</div>
        <h1>Events</h1>
      </div>

      <TeamScopeBar />

      <div className="filter-chips">
        {FILTERS.map(f => (
          <button key={f.id} type="button" className={`chip ${type === f.id ? 'active' : ''}`} onClick={() => setType(f.id)}>
            {f.label}
          </button>
        ))}
      </div>

      <DayStrip selected={selected} onSelect={setSelected} eventDates={eventDates} />

      <section className="section">
        <h2 className="section-title">{fmtLong(selected)}</h2>
        {dayEvents.length
          ? <div className="event-list">{dayEvents.map(e => <TeamEventCard key={e.id} event={e} highlight />)}</div>
          : <div className="card empty-note">No events this day.</div>}
      </section>

      <section className="section">
        <h2 className="section-title">Coming Up</h2>
        <div className="event-list">
          {later.slice(0, 15).map(e => <TeamEventCard key={e.id} event={e} />)}
        </div>
      </section>
    </div>
  )
}
