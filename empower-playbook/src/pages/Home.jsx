import { Link } from 'react-router-dom'

const SPORTS = [
  { id: 'basketball', icon: '🏀', name: 'Basketball', desc: 'Dribbling, passing, and shooting skills in a fun, adapted format. Features relay races, obstacle courses, and scrimmages.', drills: 16, cats: 4, tiers: 'Youngs / Advanced' },
  { id: 'softball',   icon: '🥎', name: 'Softball',   desc: 'Partner catching, fielding ground balls, tee hitting, and base running. Scrimmage-focused for experienced players.',     drills: 5,  cats: 3, tiers: 'Youngs / Experienced' },
  { id: 'football',   icon: '🏈', name: 'Football',   desc: 'QB throwing, wide receiver routes, running back agility, and classic games like Red Light Green Light with a football twist.', drills: 7, cats: 4, tiers: 'Youngs / Advanced' },
  { id: 'pickleball', icon: '🏓', name: 'Pickleball', desc: 'Paddle work, balloon drills, serving into buckets, and volleys. One of our fastest-growing and most accessible programs.', drills: 7, cats: 3, tiers: 'Youngs / Advanced' },
  { id: 'soccer',     icon: '⚽', name: 'Soccer',     desc: 'Dribbling agility, passing lines, shooting challenges, and creative mini-games like Construction Zone and Longest Shot.',  drills: 9,  cats: 4, tiers: 'Youngs / Advanced' },
  { id: 'kickball',   icon: '🔴', name: 'Kickball',   desc: 'The most accessible program — fielding, base running, and scrimmage. Simple to learn, immediately rewarding, endlessly fun.', drills: 3, cats: 2, tiers: 'Youngs / Advanced' },
]

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="hero-badge">⚡ The Empower Way</div>
        <span className="hero-sport-icon">🏆</span>
        <h1>The <span>Empower Sports</span><br />Program Playbook</h1>
        <p>Everything coaches, volunteers, and staff need to run our adaptive sports programs — drills, practice plans, and the Empower philosophy all in one place.</p>
        <div className="hero-cta">
          <Link to="/volunteer" className="btn btn-primary btn-lg">🤝 Volunteer Guide</Link>
          <a href="#programs" className="btn btn-outline btn-lg">📋 Browse Programs</a>
        </div>
      </section>

      <div className="container-wide">

        <div className="philosophy-banner" style={{ marginTop: '3rem' }}>
          <blockquote>
            Empower Sports provides adapted athletic, fitness, recreational, and social opportunities for individuals with physical, sensory, or developmental disabilities.
          </blockquote>
        </div>

        <div className="section-header" style={{ marginTop: '3rem' }}>
          <h2>The Empower Way</h2>
          <div className="section-divider"></div>
          <p>Four principles that guide everything we do on and off the field</p>
        </div>

        <div className="principle-grid">
          <div className="principle-card">
            <span className="principle-icon">🎯</span>
            <h3>Participation Over Perfection</h3>
            <p>Every attempt matters. We celebrate effort, not just outcomes. A ball touched is a success. A laugh shared is a victory.</p>
          </div>
          <div className="principle-card">
            <span className="principle-icon">🌱</span>
            <h3>Meet Them Where They Are</h3>
            <p>No two participants are the same. Adapt every drill, every interaction, every expectation to the individual in front of you.</p>
          </div>
          <div className="principle-card">
            <span className="principle-icon">🤝</span>
            <h3>Connection First</h3>
            <p>The sport is the vehicle, not the destination. The friendships and connections built on the field last far longer than any game.</p>
          </div>
          <div className="principle-card">
            <span className="principle-icon">🎉</span>
            <h3>Celebrate Everything</h3>
            <p>Loud, genuine, enthusiastic celebration. Every small win deserves the same energy as a championship moment. Be the hype team.</p>
          </div>
        </div>

        <div className="section-header" id="programs" style={{ marginTop: '4rem' }}>
          <h2>Our Programs</h2>
          <div className="section-divider"></div>
          <p>Six sports, two skill tiers, one mission — adapted for every ability level</p>
        </div>

        <div className="sport-grid">
          {SPORTS.map(s => (
            <Link key={s.id} to={`/${s.id}`} className="sport-card">
              <div className="sport-card-header">
                <span className="sport-card-icon">{s.icon}</span>
                <h3>{s.name}</h3>
              </div>
              <div className="sport-card-body">
                <p>{s.desc}</p>
                <div className="sport-meta">
                  <span className="sport-tag">{s.drills} Drills</span>
                  <span className="sport-tag blue">{s.cats} Categories</span>
                  <span className="sport-tag">{s.tiers}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ marginTop: '4rem', background: 'var(--white)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-md)', padding: '2.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap', borderTop: '5px solid var(--orange)' }}>
          <div>
            <div className="hero-badge" style={{ marginBottom: '.75rem', display: 'inline-flex' }}>🤝 Volunteers</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--blue)', marginBottom: '.4rem' }}>New to Empower Sports?</h2>
            <p style={{ color: 'var(--gray-400)', maxWidth: 520 }}>The Volunteer Guide covers person-first language, working with different abilities, communication strategies, do's &amp; don'ts, and how to make every participant feel like a champion.</p>
          </div>
          <Link to="/volunteer" className="btn btn-primary btn-lg" style={{ flexShrink: 0 }}>Read the Guide →</Link>
        </div>

        <div className="section-header" style={{ marginTop: '4rem' }}>
          <h2>How Sessions Work</h2>
          <div className="section-divider"></div>
          <p>Consistent structure across every sport — easy to learn, easy to run</p>
        </div>

        <div className="tier-grid">
          <div className="tier-card youngs">
            <div className="tier-label">🌱 Youngs &amp; Intermediate</div>
            <h3>Drills-Focused Session</h3>
            <p>Newer and younger participants spend the full session rotating through 4 structured drills with coach and volunteer support.</p>
            <ul>
              <li>Warm-up &amp; Introduction (10–15 min)</li>
              <li>Water Break</li>
              <li>Drill 1 (12 min)</li>
              <li>Drill 2 (12 min)</li>
              <li>Water Break</li>
              <li>Drill 3 (12 min)</li>
              <li>Drill 4 / Game (12 min)</li>
            </ul>
          </div>
          <div className="tier-card advanced">
            <div className="tier-label">⭐ Advanced / Experienced</div>
            <h3>Drill + Scrimmage Session</h3>
            <p>Experienced players do 1–2 focused drills then move into a 35–55 minute scrimmage with peer volunteers on the court/field.</p>
            <ul>
              <li>Warm-up &amp; Introduction (10 min)</li>
              <li>Drill 1 (10 min)</li>
              <li>Drill 2 (10 min, some sports)</li>
              <li>Water Break</li>
              <li>Scrimmage (35–55 min)</li>
            </ul>
          </div>
          <div className="tier-card combined">
            <div className="tier-label">🔄 Combined Sessions</div>
            <h3>Both Groups Together</h3>
            <p>Some weeks run staggered combined sessions — Youngs/Intermediate drill first, then Advanced joins for scrimmage when they arrive.</p>
            <ul>
              <li>Youngs drill session (6:00–7:13)</li>
              <li>Advanced arrives at 7:15</li>
              <li>Advanced drills while Youngs scrimmage</li>
              <li>Full group scrimmage together</li>
            </ul>
          </div>
        </div>

        <div className="section-header" style={{ marginTop: '4rem' }}>
          <h2>Scrimmage Format</h2>
          <div className="section-divider"></div>
          <p>How games are structured across all Empower Sports programs</p>
        </div>

        <div className="scrimmage-card">
          <div className="sc-icon">🏟️</div>
          <div>
            <h4>Standard Scrimmage Setup</h4>
            <p>Each team consists of 3–7 Empower Sports (ES) players and 1–2 peer/volunteer players. Coaches are on the court/field at all times. The director periodically pauses play for brief coaching moments. The tone is always positive — coaches celebrate both teams.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.25rem' }}>
          {[
            { icon: '🏀', name: 'Basketball', note: '3–5 ES + 1–2 peers/team' },
            { icon: '🏓', name: 'Pickleball', note: '1–2 ES + 1–2 peers/team' },
            { icon: '⚽', name: 'Soccer',     note: '5–7 ES + 1–2 peers/team' },
            { icon: '🏈', name: 'Football',   note: '3–5 ES + 1–2 peers/team' },
          ].map(s => (
            <div key={s.name} className="card card-green" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '.4rem' }}>{s.icon}</div>
              <div style={{ fontWeight: 700, color: 'var(--blue)', fontSize: '.95rem' }}>{s.name}</div>
              <div style={{ fontSize: '.82rem', color: 'var(--gray-400)' }}>{s.note}</div>
            </div>
          ))}
        </div>

      </div>

      <footer className="page-footer">
        <strong>Empower Sports</strong> Program Playbook — Adapted Athletic, Fitness &amp; Recreational Programs
      </footer>
    </main>
  )
}
