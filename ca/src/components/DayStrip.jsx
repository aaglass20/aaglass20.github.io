import { useEffect, useRef } from 'react'
import { addDays, todayISO, fmtWeekday, fmtDay, fmtMonth } from '../data/dates'

// Horizontal calendar starting today. Days in `eventDates` get a dot; the selected day scrolls into view.
export default function DayStrip({ selected, onSelect, eventDates, days = 42 }) {
  const ref = useRef(null)
  const today = todayISO()

  useEffect(() => {
    ref.current
      ?.querySelector(`[data-date="${selected}"]`)
      ?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [selected])

  return (
    <div className="day-strip" ref={ref} role="listbox" aria-label="Choose a date">
      {Array.from({ length: days }, (_, i) => addDays(today, i)).map(d => {
        const has = eventDates.has(d)
        const showMonth = d.endsWith('-01') || d === today
        return (
          <button
            key={d}
            type="button"
            data-date={d}
            role="option"
            aria-selected={d === selected}
            className={`day ${d === selected ? 'is-selected' : ''} ${has ? 'has-event' : ''} ${d === today ? 'is-today' : ''}`}
            onClick={() => onSelect(d)}
          >
            <span className="day-month">{showMonth ? fmtMonth(d) : ' '}</span>
            <span className="day-wd">{fmtWeekday(d)}</span>
            <span className="day-num">{fmtDay(d)}</span>
            <span className="day-dot" aria-hidden="true" />
          </button>
        )
      })}
    </div>
  )
}
