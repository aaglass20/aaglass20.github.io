import SportPage from '../components/SportPage.jsx'
import { DRILL_TABS, DRILLS, PLAN_TABS, PLANS, EQUIPMENT } from '../data/football.js'

export default function Football() {
  return (
    <SportPage
      icon="🏈"
      badge="🏈 Football Program"
      name="Football"
      heroSubtitle="Throwing, catching, and running — touchdowns for everyone"
      overviewSubtitle="Two tiers built around big plays and bigger celebrations"
      youngsTier={{
        label: '🌱 Youngs',
        title: 'Full Drill Session',
        text: 'Full 75-minute drill session covering throwing, catching, agility, and games — with coach and volunteer support throughout.',
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
        text: 'One or two focused drills followed by a 40-minute scrimmage. Coaches serve as QB for both teams simultaneously.',
        items: [
          'Warm-up & Introduction (10 min)',
          'Drill 1 (10 min)',
          'Water Break (5 min)',
          'Scrimmage (40 min)',
          '3–5 ES players + 1–2 peers/team',
          'Coaches play QB and coach simultaneously',
        ],
      }}
      drillSubtitle="8 drills across 4 categories — throwing, catching, agility, and games"
      drillTabs={DRILL_TABS}
      drills={DRILLS}
      planSubtitle="Three-week rotation — side-by-side view of Youngs and Advanced sessions"
      planMeta={[
        { icon: '⏱', label: 'Session Length:', value: '1 hr 15 min (6:00 – 7:15)' },
        { icon: '🌱', label: 'Youngs:', value: '4 drills × 12 min' },
        { icon: '⭐', label: 'Advanced:', value: '1–2 drills + 40 min scrimmage' },
      ]}
      planTabs={PLAN_TABS}
      plans={PLANS}
      scrimmageCard={{
        icon: '🏟️',
        title: 'Advanced Scrimmage Format',
        text: '3–5 ES players + 1–2 peer volunteers per team. Coaches serve as QB for both teams — calling plays and coaching simultaneously. Touchdowns are celebrated with maximum energy. Every score is a moment — make it one.',
      }}
      equipment={EQUIPMENT}
      footerText="Football Program Playbook"
    />
  )
}
