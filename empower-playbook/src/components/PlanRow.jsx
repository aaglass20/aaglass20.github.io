export default function PlanRow({ time, duration, name, desc, type }) {
  const cls = [
    'plan-row',
    type === 'water'     && 'water-break',
    type === 'scrimmage' && 'scrimmage-block',
  ].filter(Boolean).join(' ')

  return (
    <div className={cls}>
      <div className="plan-time">{time}</div>
      <div className="plan-duration">{duration ?? ''}</div>
      <div className="plan-activity">
        <div className="plan-activity-name">{name}</div>
        {desc && <div className="plan-activity-desc">{desc}</div>}
      </div>
    </div>
  )
}
