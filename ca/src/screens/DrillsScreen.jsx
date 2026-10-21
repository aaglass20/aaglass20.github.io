import './Screen.css'

export default function DrillsScreen() {
  return (
    <div className="screen">
      <div className="screen-header space-between">
        <div>
          <div className="header-eyebrow">Library</div>
          <h1>Drills</h1>
        </div>
        <button className="btn-primary">+ New</button>
      </div>

      <div className="search-bar-placeholder" />

      <div className="filter-chips">
        <div className="chip active">All</div>
        <div className="chip">Warm Up</div>
        <div className="chip">Skill</div>
        <div className="chip">Fitness</div>
        <div className="chip">Game</div>
      </div>

      <section className="section">
        <h2 className="section-title">Recently Added</h2>
        <div className="drill-list">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="drill-card">
              <div className="drill-thumb" />
              <div className="drill-info">
                <div className="placeholder-block short" />
                <div className="placeholder-chip" />
              </div>
              <div className="drill-arrow" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
