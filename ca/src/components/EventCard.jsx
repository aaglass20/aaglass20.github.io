import { useState } from 'react'

// Generic event card used by both profiles (styles in screens/shared.css).
// Header (eyebrow / title / meta), a plan summary strip, and optional expandable detail (children).
export default function EventCard({
  eyebrow, title, titleSuffix, meta = [], badge,
  plan, highlight = false, defaultOpen = false, children,
}) {
  const [open, setOpen] = useState(defaultOpen)
  const expandable = Boolean(children)

  const head = (
    <>
      <div className="event-card-main">
        <div className="event-program">{eyebrow}{badge}</div>
        <div className="event-title">
          {title}
          {titleSuffix && <span className="event-of"> {titleSuffix}</span>}
        </div>
        <div className="event-meta">
          {meta.filter(Boolean).map((m, i) => <span key={i}>{m}</span>)}
        </div>
      </div>
      {expandable && <span className={`event-chevron ${open ? 'is-open' : ''}`} aria-hidden="true">›</span>}
    </>
  )

  return (
    <div className={`event-card ${highlight ? 'is-highlight' : ''}`}>
      {expandable
        ? <button type="button" className="event-card-head" onClick={() => setOpen(o => !o)} aria-expanded={open}>{head}</button>
        : <div className="event-card-head">{head}</div>}

      {plan && (
        <div className={`event-plan ${plan.empty ? 'is-empty' : ''}`}>
          <span className="event-plan-label">{plan.label}</span>
          <span className="event-plan-title">{plan.title}</span>
          {plan.meta && <span className="event-plan-mins">{plan.meta}</span>}
        </div>
      )}

      {expandable && open && children}
    </div>
  )
}

// Numbered drill list for the expanded area of a practice event
export function DrillList({ drills }) {
  return (
    <ol className="event-drills">
      {drills.map(d => (
        <li key={d.id} className="event-drill">
          <span className="event-drill-name">{d.name}</span>
          <span className="event-drill-focus">{d.focus}</span>
          <span className="event-drill-mins">{d.minutes}′</span>
        </li>
      ))}
    </ol>
  )
}
