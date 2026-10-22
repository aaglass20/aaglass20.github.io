import { useState } from 'react'
import { PROGRAM_SPORTS, programStatus } from '../../data/adaptiveMock'
import { todayISO, fmtShort, fmtRelative } from '../../data/dates'
import '../Screen.css'
import '../shared.css'
import './adaptive.css'

const STATE_LABEL = { active: 'In progress', upcoming: 'Starts soon', complete: 'Complete' }

export default function ProgramsScreen({ programs, onCreate }) {
  const [query, setQuery]       = useState('')
  const [creating, setCreating] = useState(false)

  const q = query.trim().toLowerCase()
  const shown = programs.filter(p => !q || p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q))

  return (
    <div className="screen">
      <div className="screen-header space-between">
        <div>
          <div className="header-eyebrow">Adaptive Sports</div>
          <h1>Programs</h1>
        </div>
        {!creating && <button className="btn-primary" onClick={() => setCreating(true)}>+ New Program</button>}
      </div>

      {creating && (
        <NewProgramForm
          onCancel={() => setCreating(false)}
          onSave={p => { onCreate(p); setCreating(false); setQuery('') }}
        />
      )}

      <input
        type="search"
        className="search-input"
        placeholder="Search programs"
        value={query}
        onChange={e => setQuery(e.target.value)}
        aria-label="Search programs"
      />

      <div className="program-list">
        {shown.map(p => {
          const s = programStatus(p)
          return (
            <div key={p.id} className="program-card">
              <div className="program-card-top">
                <div className="program-name">{p.name}</div>
                <span className={`status-pill is-${s.state}`}>{STATE_LABEL[s.state]}</span>
              </div>
              <div className="program-meta">
                {p.weeks} weeks · {fmtShort(p.startDate)} – {fmtShort(s.endDate)} · {p.time}
              </div>
              <div className="program-meta">{p.location}</div>

              <div className="program-progress" aria-label={`${s.done} of ${s.total} sessions done`}>
                <div className="program-progress-fill" style={{ width: `${(s.done / s.total) * 100}%` }} />
              </div>
              <div className="program-foot">
                <span>{s.done} / {s.total} sessions</span>
                {s.next && <span>Next: Session {s.next.session} · {fmtRelative(s.next.date)}</span>}
              </div>
            </div>
          )
        })}
        {!shown.length && <div className="card empty-note">No programs match “{query}”.</div>}
      </div>
    </div>
  )
}

function NewProgramForm({ onCancel, onSave }) {
  const [name, setName]         = useState('')
  const [sport, setSport]       = useState(PROGRAM_SPORTS[0].id)
  const [weeks, setWeeks]       = useState(6)
  const [startDate, setStart]   = useState(todayISO())
  const [time, setTime]         = useState('10:00')
  const [location, setLocation] = useState('')

  const valid = name.trim() && weeks >= 1 && startDate

  function submit(e) {
    e.preventDefault()
    if (!valid) return
    const [h, m] = time.split(':').map(Number)
    onSave({
      id: `p-${Date.now()}`,
      name: name.trim(),
      sport,
      weeks: Number(weeks),
      startDate,
      time: new Date(2000, 0, 1, h, m).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
      location: location.trim() || 'Location TBD',
    })
  }

  return (
    <form className="card new-program" onSubmit={submit}>
      <h2 className="new-program-title">New Program</h2>
      <p className="new-program-sub">Each week becomes an event with its own practice plan.</p>

      <label className="np-field np-full">
        <span>Program name</span>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Spring Adaptive Soccer" autoFocus />
      </label>

      <label className="np-field">
        <span>Sport</span>
        <select value={sport} onChange={e => setSport(e.target.value)}>
          {PROGRAM_SPORTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </label>

      <label className="np-field">
        <span>Weeks</span>
        <input type="number" min="1" max="52" value={weeks} onChange={e => setWeeks(e.target.value)} />
      </label>

      <label className="np-field">
        <span>Start date</span>
        <input type="date" value={startDate} onChange={e => setStart(e.target.value)} />
      </label>

      <label className="np-field">
        <span>Time</span>
        <input type="time" value={time} onChange={e => setTime(e.target.value)} />
      </label>

      <label className="np-field np-full">
        <span>Location</span>
        <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Optional" />
      </label>

      <div className="np-actions np-full">
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={!valid}>
          Create {weeks >= 1 ? `${weeks} event${weeks == 1 ? '' : 's'}` : 'program'}
        </button>
      </div>
    </form>
  )
}
