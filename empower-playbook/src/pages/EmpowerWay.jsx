import { Link } from 'react-router-dom'

export default function EmpowerWay() {
  return (
    <main>
      <section className="hero" style={{ padding: '3.5rem 1.5rem 3rem' }}>
        <div className="hero-badge">Event Management</div>
        <h1>Build It <span>The Empower Way</span></h1>
        <p>Build Programs, Create Plans, add Drills, and set up a successful Empower Sports event — everything you need in one place.</p>
      </section>

      <div data-testid="empower-way-home">
        <div className="ew-intro">
          <h2>Your Complete Event Toolkit</h2>
          <p>Great events are built on great structure. The Empower Way gives every coordinator a clear starting point: organized programs, purpose-built plans, a drill library tailored to adaptive sports, and easy location management.</p>
        </div>

        <div className="ew-grid">

          <Link to="/programs" className="ew-card" data-testid="nav-card-programs">
            <span className="ew-card-icon">📁</span>
            <h2>Programs</h2>
            <p>Organize your season into programs — set groups, assign weekly plans, and track everything from one dashboard.</p>
            <span className="ew-card-cta">→ Open Programs</span>
          </Link>

          <Link to="/plan-library" className="ew-card" data-testid="nav-card-practice-builder">
            <span className="ew-card-icon">📋</span>
            <h2>Plan Builder</h2>
            <p>Pick a sport and session length, then assemble drills into a timed practice plan you can share with your team.</p>
            <span className="ew-card-cta">→ Open Builder</span>
          </Link>

          <Link to="/drill-admin" className="ew-card" data-testid="nav-card-drill-admin">
            <span className="ew-card-icon">🗂️</span>
            <h2>Drill Library</h2>
            <p>Browse and manage all adaptive sports drills by category. Add videos, tips, and volunteer cues to each drill.</p>
            <span className="ew-card-cta">→ Browse Drills</span>
          </Link>

          <Link to="/locations" className="ew-card" data-testid="nav-card-locations">
            <span className="ew-card-icon">📍</span>
            <h2>Locations</h2>
            <p>Save and manage your event venues — fields, gyms, and courts. Attach locations to programs for quick reference.</p>
            <span className="ew-card-cta">→ Manage Locations</span>
          </Link>

        </div>
      </div>

      <footer className="page-footer">
        <strong>Empower Sports</strong> — The Empower Way
      </footer>
    </main>
  )
}
