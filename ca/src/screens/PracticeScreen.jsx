import './Screen.css'

export default function PracticeScreen() {
  return (
    <div className="screen">
      <div className="screen-header space-between">
        <div>
          <div className="header-eyebrow">Builder</div>
          <h1>Practice Plans</h1>
        </div>
        <button className="btn-primary">+ New</button>
      </div>

      <section className="section">
        <h2 className="section-title">Current Plan</h2>
        <div className="card card-highlight">
          <div className="placeholder-block short" />
          <div className="placeholder-chip" />

          <div className="timeline">
            {['Warm Up', 'Skill Block', 'Drill Block', 'Scrimmage', 'Cool Down'].map((seg, i) => (
              <div key={i} className="timeline-seg">
                <div className="seg-time placeholder-chip short narrow" />
                <div className="seg-bar" />
                <div className="seg-label placeholder-chip wide" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Saved Plans</h2>
        <div className="placeholder-row" />
        <div className="placeholder-row" />
        <div className="placeholder-row" />
      </section>
    </div>
  )
}
