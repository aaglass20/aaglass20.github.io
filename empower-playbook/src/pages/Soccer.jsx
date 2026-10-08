import DrillCard from '../components/DrillCard.jsx'
import SectionHeader from '../components/SectionHeader.jsx'
import TabGroup from '../components/TabGroup.jsx'
import PlanRow from '../components/PlanRow.jsx'
import { DRILL_TABS, DRILLS, PLAN_TABS, PLANS, EQUIPMENT } from '../data/soccer.js'

export default function Soccer() {
  return (
    <main>
      <section className="hero">
        <div className="hero-badge">⚽ Soccer Program</div>
        <span className="hero-sport-icon">⚽</span>
        <h1><span>Soccer</span></h1>
        <p>Dribbling, passing, shooting — the beautiful game, adapted for everyone</p>
      </section>

      <div className="container-wide">
        <SectionHeader
          title="Program Overview"
          subtitle="Two tiers, one field — adapted for every ability level"
          style={{ marginTop: '2.5rem' }}
        />

        <div className="tier-grid">
          <div className="tier-card youngs">
            <div className="tier-label">🌱 Youngs &amp; Intermediate</div>
            <h3>Full Drill Session</h3>
            <p>Players spend the full 75-minute session rotating through structured drills with coach and volunteer support at every station.</p>
            <ul>
              <li>Warm-up &amp; Introduction (15 min)</li>
              <li>Water Break</li>
              <li>Drill 1 (12 min)</li>
              <li>Drill 2 (12 min)</li>
              <li>Water Break</li>
              <li>Drill 3 (12 min)</li>
              <li>Drill 4 / Mini Game (12 min)</li>
            </ul>
            <p style={{ marginTop: '.65rem', fontSize: '.85rem', color: 'var(--gray-400)' }}>Focus on individual skills and fun mini-games throughout the session.</p>
          </div>

          <div className="tier-card advanced">
            <div className="tier-label">⭐ Advanced</div>
            <h3>Drill + Scrimmage Session</h3>
            <p>Experienced players run 1–2 focused drills then move into a 40-minute scrimmage with peer volunteers on the field.</p>
            <ul>
              <li>Warm-up (10 min)</li>
              <li>1–2 Drills (10 min each)</li>
              <li>Water Break</li>
              <li>Scrimmage (40 min)</li>
            </ul>
            <p style={{ marginTop: '.65rem', fontSize: '.85rem', color: 'var(--gray-400)' }}>5–7 ES players + 1–2 peers per team. Coaches on field at all times.</p>
          </div>
        </div>

        <SectionHeader
          title="Drills Library"
          subtitle="All soccer drills organized by category — click a tab to explore"
          style={{ marginTop: '3.5rem' }}
        />

        <section data-testid="drills-section">
          <TabGroup tabs={DRILL_TABS}>
            {Object.values(DRILLS).map((categoryDrills, i) => (
              <div key={i} className="drill-grid">
                {categoryDrills.map(drill => (
                  <DrillCard key={drill.name} {...drill} />
                ))}
              </div>
            ))}
          </TabGroup>
        </section>

        <SectionHeader
          title="Practice Plans"
          subtitle="Week-by-week session schedules for both tiers"
          style={{ marginTop: '3.5rem' }}
        />

        <div className="plan-meta-strip">
          <div className="meta-item">⏱ <span>Session Length: <strong>75 min (Youngs) · 65 min (Advanced)</strong></span></div>
          <div className="meta-item">📍 <span>Format: <strong>Drills + Water Breaks · Drill + Scrimmage</strong></span></div>
          <div className="meta-item">⚽ <span>Field: <strong>Coaches on field with both teams during scrimmage</strong></span></div>
        </div>

        <section data-testid="plans-section">
        <TabGroup tabs={PLAN_TABS}>
          {PLANS.map((plan, i) => (
            <div key={i} className="plan-columns">
              <div>
                <div className="plan-column-header"><h4>🌱 Youngs &amp; Intermediate</h4></div>
                <div className="plan-column-body">
                  {plan.youngs.map((row, j) => <PlanRow key={j} {...row} />)}
                </div>
              </div>
              <div>
                <div className="plan-column-header advanced-col"><h4>⭐ Advanced</h4></div>
                <div className="plan-column-body">
                  {plan.advanced.map((row, j) => <PlanRow key={j} {...row} />)}
                </div>
              </div>
            </div>
          ))}
        </TabGroup>
        </section>

        <div className="scrimmage-card">
          <div className="sc-icon">⚽</div>
          <div>
            <h4>Scrimmage Format</h4>
            <p>5–7 ES players + 1–2 peer volunteers per team on the field. Coaches on field with both teams. Rotate positions to give everyone playing time in different roles. Every goal is celebrated by everyone!</p>
          </div>
        </div>

        <SectionHeader
          title="Equipment Checklist"
          subtitle="Everything you need to run a soccer session"
          style={{ marginTop: '3.5rem' }}
        />

        <div className="equipment-grid">
          {EQUIPMENT.map(({ icon, label }) => (
            <div key={label} className="equipment-item">
              <span className="eq-icon">{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <footer className="page-footer">
        <strong>Empower Sports</strong> — Soccer Program Playbook
      </footer>
    </main>
  )
}
