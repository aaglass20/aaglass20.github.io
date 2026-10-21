import './Screen.css'

export default function RosterScreen() {
  return (
    <div className="screen">
      <div className="screen-header space-between">
        <div>
          <div className="header-eyebrow">Team</div>
          <h1>Roster</h1>
        </div>
        <button className="btn-primary">+ Athlete</button>
      </div>

      <div className="tab-bar">
        <div className="tab active">Players</div>
        <div className="tab">Lineups</div>
        <div className="tab">Stats</div>
      </div>

      <section className="section">
        <div className="roster-grid">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="athlete-card">
              <div className="athlete-avatar" />
              <div className="placeholder-chip short" />
              <div className="placeholder-chip short narrow" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
