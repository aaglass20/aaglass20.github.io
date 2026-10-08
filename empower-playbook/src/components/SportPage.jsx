import DrillCard from './DrillCard.jsx'
import SectionHeader from './SectionHeader.jsx'
import TabGroup from './TabGroup.jsx'
import PlanRow from './PlanRow.jsx'

export default function SportPage({
  icon, badge, name, heroSubtitle,
  overviewSubtitle,
  youngsTier, advancedTier,
  tierAlert,
  drillSubtitle, drillTabs, drills,
  planSubtitle, planMeta = [], planTabs, plans,
  youngsTimeNote, advancedTimeNote,
  scrimmageCard,
  scrimmageRules,
  equipment, footerText,
}) {
  return (
    <main>
      <section className="hero">
        <div className="hero-badge">{badge}</div>
        <span className="hero-sport-icon">{icon}</span>
        <h1><span>{name}</span></h1>
        <p>{heroSubtitle}</p>
      </section>

      <div className="container-wide">
        <SectionHeader title="Program Overview" subtitle={overviewSubtitle} style={{ marginTop: '2.5rem' }} />

        <div className="tier-grid">
          <TierCard tier={youngsTier} variant="youngs" />
          <TierCard tier={advancedTier} variant="advanced" />
        </div>

        {tierAlert && (
          <div className="alert alert-blue" style={{ marginTop: '1.25rem' }}>
            <span>📅</span>
            <span><strong>Staggered Schedule:</strong> {tierAlert}</span>
          </div>
        )}

        <SectionHeader title="Drills Library" subtitle={drillSubtitle} style={{ marginTop: '3.5rem' }} />

        <section data-testid="drills-section">
          <TabGroup tabs={drillTabs}>
            {Object.values(drills).map((categoryDrills, i) => (
              <div key={i} className="drill-grid">
                {categoryDrills.map(drill => <DrillCard key={drill.name} {...drill} />)}
              </div>
            ))}
          </TabGroup>
        </section>

        <SectionHeader title="Practice Plans" subtitle={planSubtitle} style={{ marginTop: '3.5rem' }} />

        {planMeta.length > 0 && (
          <div className="plan-meta-strip">
            {planMeta.map(({ icon: ic, label, value }) => (
              <div key={label} className="meta-item">{ic} <strong>{label}</strong> {value}</div>
            ))}
          </div>
        )}

        <section data-testid="plans-section">
          <TabGroup tabs={planTabs}>
            {plans.map((plan, i) => (
              <div key={i} className="plan-columns">
                <div>
                  <div className="plan-column-header">
                    <h4>
                      {youngsTier.label}
                      {youngsTimeNote && <small style={{ fontWeight: 500, opacity: .75 }}> {youngsTimeNote}</small>}
                    </h4>
                  </div>
                  <div className="plan-column-body">
                    {plan.youngs.map((row, j) => <PlanRow key={j} {...row} />)}
                  </div>
                </div>
                <div>
                  <div className="plan-column-header advanced-col">
                    <h4>
                      {advancedTier.label}
                      {advancedTimeNote && <small style={{ fontWeight: 500, opacity: .75 }}> {advancedTimeNote}</small>}
                    </h4>
                  </div>
                  <div className="plan-column-body">
                    {plan.advanced.map((row, j) => <PlanRow key={j} {...row} />)}
                  </div>
                </div>
              </div>
            ))}
          </TabGroup>
        </section>

        {scrimmageCard && (
          <div className="scrimmage-card">
            <div className="sc-icon">{scrimmageCard.icon}</div>
            <div>
              <h4>{scrimmageCard.title}</h4>
              <p>{scrimmageCard.text}</p>
            </div>
          </div>
        )}

        {scrimmageRules && (
          <div className="card card-orange" style={{ marginTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--blue)', marginBottom: '.85rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              🔴 Scrimmage Rules
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '.45rem' }}>
              {scrimmageRules.map((rule, i) => (
                <li key={i} style={{ fontSize: '.9rem', color: 'var(--gray-700)', paddingLeft: '1.2rem', position: 'relative', lineHeight: 1.55 }}>
                  <span style={{ position: 'absolute', left: 0, color: 'var(--orange)', fontWeight: 700 }}>→</span>
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        )}

        <SectionHeader title="Equipment Checklist" subtitle="Gather before each session — check off as you set up" style={{ marginTop: '3.5rem' }} />

        <div className="equipment-grid">
          {equipment.map(({ icon: ic, label }) => (
            <div key={label} className="equipment-item">
              <span className="eq-icon">{ic}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <footer className="page-footer">
        <strong>Empower Sports</strong> — {footerText}
      </footer>
    </main>
  )
}

function TierCard({ tier, variant }) {
  return (
    <div className={`tier-card ${variant}`}>
      <div className="tier-label">{tier.label}</div>
      <h3>{tier.title}</h3>
      <p>{tier.text}</p>
      <ul>{tier.items.map((item, i) => <li key={i}>{item}</li>)}</ul>
      {tier.note && <p style={{ marginTop: '.65rem', fontSize: '.85rem', color: 'var(--gray-400)' }}>{tier.note}</p>}
    </div>
  )
}
