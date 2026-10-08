import SportPage from '../components/SportPage.jsx'
import { DRILL_TABS, DRILLS, PLAN_TABS, PLANS, EQUIPMENT } from '../data/basketball.js'

export default function Basketball() {
  return (
    <SportPage
      icon="🏀"
      badge="🏀 Basketball Program"
      name="Basketball"
      heroSubtitle="Dribbling, passing, shooting — built for every ability level"
      overviewSubtitle="Two tiers built for different experience levels — drills-focused for newer players, scrimmage-heavy for experienced ones"
      youngsTier={{
        label: '🌱 Youngs & Intermediate',
        title: 'Drills-Only Session',
        text: 'Full 75-minute drill session with coach and volunteer support at every station.',
        items: [
          'Warm-up & Introduction (15 min)',
          'Water Break (6 min)',
          'Drill 1 (12 min)',
          'Drill 2 (12 min)',
          'Water Break (6 min)',
          'Drill 3 (12 min)',
          'Drill 4 / Game (12 min)',
          'Total: 1 hr 15 min',
        ],
      }}
      advancedTier={{
        label: '⭐ Advanced',
        title: 'Drill + Scrimmage Session',
        text: 'Two focused drills followed by a 40-minute scrimmage with peer volunteers on the court.',
        items: [
          'Warm-up & Introduction (10 min)',
          'Drill 1 (10 min)',
          'Drill 2 (10 min)',
          'Water Break (5 min)',
          'Scrimmage (40 min)',
          '3–5 ES players + 1–2 peers/team',
          'Coaches on court at all times',
        ],
      }}
      drillSubtitle="20 drills across 4 categories — dribbling, passing, shooting, and games"
      drillTabs={DRILL_TABS}
      drills={DRILLS}
      planSubtitle="Three-week rotation — side-by-side view of Youngs and Advanced sessions"
      planMeta={[
        { icon: '⏱', label: 'Session Length:', value: '1 hr 15 min (6:00 – 7:15)' },
        { icon: '🌱', label: 'Youngs:', value: '4 drills × 12 min' },
        { icon: '⭐', label: 'Advanced:', value: '2 drills + 40 min scrimmage' },
      ]}
      planTabs={PLAN_TABS}
      plans={PLANS}
      scrimmageCard={{
        icon: '🏟️',
        title: 'Advanced Scrimmage Format',
        text: '3–5 ES players + 1–2 peer volunteers per team. Coaches on court at all times. Director pauses play periodically for coaching moments. Celebrate both teams — every basket is a victory!',
      }}
      equipment={EQUIPMENT}
      footerText="Basketball Program Playbook"
    />
  )
}
