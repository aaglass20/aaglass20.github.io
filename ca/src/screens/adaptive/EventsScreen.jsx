import { useMemo, useState } from 'react'
import { upcomingEvents } from '../../data/adaptiveMock'
import { todayISO, fmtLong } from '../../data/dates'
import DayStrip from '../../components/DayStrip'
import EventCard from './EventCard'
import '../Screen.css'
import '../shared.css'

export default function EventsScreen({ programs }) {
  const events = useMemo(() => upcomingEvents(programs), [programs])
  const today = todayISO()

  // Dates that have at least one event
  const eventDates = useMemo(() => new Set(events.map(e => e.date)), [events])

  // Start on the next available event date
  const [selected, setSelected] = useState(events[0]?.date ?? today)

  const dayEvents = events.filter(e => e.date === selected)
  const later = events.filter(e => e.date > selected)

  return (
    <div className="screen">
      <div className="screen-header">
        <div className="header-eyebrow">Schedule</div>
        <h1>Events</h1>
      </div>

      {/* Horizontal calendar — days with events get a dot; tap to jump */}
      <DayStrip selected={selected} onSelect={setSelected} eventDates={eventDates} />

      <section className="section">
        <h2 className="section-title">{fmtLong(selected)}</h2>
        {dayEvents.length
          ? <div className="event-list">{dayEvents.map(e => <EventCard key={e.id} event={e} highlight />)}</div>
          : <div className="card empty-note">No events this day.</div>}
      </section>

      <section className="section">
        <h2 className="section-title">Coming Up</h2>
        <div className="event-list">
          {later.slice(0, 12).map(e => <EventCard key={e.id} event={e} />)}
        </div>
      </section>
    </div>
  )
}
