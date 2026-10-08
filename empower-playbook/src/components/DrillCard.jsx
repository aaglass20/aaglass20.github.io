export default function DrillCard({ icon, name, description, purpose, tags = [], equipment = [], coachTip }) {
  return (
    <div className="drill-card">
      <div className="drill-card-header">
        <span className="drill-card-icon">{icon}</span>
        <h4>{name}</h4>
      </div>
      <p className="drill-description">{description}</p>
      <p className="drill-purpose">Purpose: {purpose}</p>
      <div className="drill-meta">
        {tags.map(tag => (
          <span key={tag} className={`drill-tag ${tag.toLowerCase()}`}>{tag}</span>
        ))}
        {equipment.map(eq => (
          <span key={eq} className="equip-pill">{eq}</span>
        ))}
      </div>
      {coachTip && (
        <div className="coach-tip">
          <span>💡</span>
          <span>{coachTip}</span>
        </div>
      )}
    </div>
  )
}
