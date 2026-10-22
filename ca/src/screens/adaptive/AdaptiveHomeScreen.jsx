import { Link } from 'react-router-dom'
import { firstNameOf, sportLabelOf } from '../../data/account'
import { upcomingEvents } from '../../data/adaptiveMock'
import EventCard from './EventCard'
import '../Screen.css'
import '../shared.css'
import './adaptive.css'

const QUICK_ACTIONS = [
  { to: '/programs', label: 'Programs',       icon: '▦' },
  { to: '/practice', label: 'Practice Plans', icon: '☰' },
  { to: '/drills',   label: 'Drills',         icon: '◎' },
]

export default function AdaptiveHomeScreen({ account, programs }) {
  const upcoming = upcomingEvents(programs)
  const next = upcoming[0]

  return (
    <div className="screen">
      <div className="screen-header">
        <div className="header-eyebrow">Welcome, {firstNameOf(account?.name)} · {sportLabelOf(account)}</div>
        <h1>Dashboard</h1>
      </div>

      <section className="section">
        <div className="section-title-row">
          <h2 className="section-title">Next Event</h2>
          <Link to="/events" className="section-link">All events ›</Link>
        </div>
        {next
          ? <EventCard event={next} highlight defaultOpen />
          : <div className="card empty-note">No upcoming events. Create a program to schedule sessions.</div>}
      </section>

      <section className="section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions quick-actions-3">
          {QUICK_ACTIONS.map(a => (
            <Link key={a.to} to={a.to} className="action-tile action-link">
              <div className="action-icon action-icon-glyph" aria-hidden="true">{a.icon}</div>
              <div className="action-name">{a.label}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Recent Activity</h2>
        <div className="placeholder-row" />
        <div className="placeholder-row" />
        <div className="placeholder-row" />
      </section>
    </div>
  )
}
