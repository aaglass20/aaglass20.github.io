import SportPage from '../components/SportPage.jsx'
import { DRILL_TABS, DRILLS, PLAN_TABS, PLANS, EQUIPMENT } from '../data/softball.js'

export default function Softball() {
  return (
    <SportPage
      icon="🥎"
      badge="🥎 Softball Program"
      name="Softball"
      heroSubtitle="Catching, fielding, hitting, and running — big smiles guaranteed"
      overviewSubtitle="Two tiers with a scrimmage focus — every batter gets a tee and every player gets on base"
      youngsTier={{
        label: '🌱 Youngs & Intermediate',
        title: 'Warm-Up + Drills + Scrimmage',
        text: '1 hr 15 min session. Warm-up followed by 1–2 drills, then a 35–40 minute scrimmage with coach-supported batting tee.',
        items: [
          'Warm-up & Introduction (10 min)',
          'Drill 1 (10–15 min)',
          'Drill 2 (10 min, some weeks)',
          'Water Break (5 min)',
          'Scrimmage (35–40 min)',
          'Tee available for every batter',
        ],
      }}
      advancedTier={{
        label: '⭐ Experienced',
        title: 'Catching Drill + Scrimmage',
        text: '1 hr 15 min session. Quick warm-up and partner catching drill, then maximum scrimmage time.',
        items: [
          'Warm-up & Introduction (5–10 min)',
          'Partner Catching (10 min, most weeks)',
          'Water Break (5 min)',
          'Scrimmage (50–55 min)',
          'Week 3: Full scrimmage session (55 min)',
        ],
      }}
      drillSubtitle="5 drills across 3 categories — fielding, hitting, and base running"
      drillTabs={DRILL_TABS}
      drills={DRILLS}
      planSubtitle="Four-week rotation — Youngs builds skills before scrimmage; Experienced gets maximum game time"
      planMeta={[
        { icon: '⏱', label: 'Session Length:', value: '1 hr 15 min (6:00 – 7:15)' },
        { icon: '🌱', label: 'Youngs:', value: 'Drills + 35–40 min scrimmage' },
        { icon: '⭐', label: 'Experienced:', value: '50–55 min scrimmage' },
      ]}
      planTabs={PLAN_TABS}
      plans={PLANS}
      scrimmageCard={{
        icon: '🏟️',
        title: 'Scrimmage Format',
        text: 'All players take an at-bat before sides switch. Coaches are on the field at all times. A batting tee is available for every batter — no one sits down without swinging. Celebrate every hit and every out equally!',
      }}
      equipment={EQUIPMENT}
      footerText="Softball Program Playbook"
    />
  )
}
