import SportPage from '../components/SportPage.jsx'
import { DRILL_TABS, DRILLS, PLAN_TABS, PLANS, EQUIPMENT, SCRIMMAGE_RULES } from '../data/kickball.js'

export default function Kickball() {
  return (
    <SportPage
      icon="🔴"
      badge="🔴 Kickball Program"
      name="Kickball"
      heroSubtitle="The most accessible program — kick, run, and celebrate every at-bat"
      overviewSubtitle="Two groups, staggered start times — simple, immediate, and endlessly fun"
      youngsTier={{
        label: '🌱 Youngs & Intermediate',
        title: '60-Minute Session',
        text: 'A quick warm-up and two focused drills, then straight into 40 minutes of scrimmage. The game is the point — drills are just a runway to get there.',
        items: [
          'Intro / Warm-up (5 min)',
          'Fielding Bucket Drill (5 min)',
          'Base Running (5 min)',
          'Water Break (5 min)',
          'Scrimmage (40 min)',
        ],
        note: 'Sessions start at 5:30 PM.',
      }}
      advancedTier={{
        label: '⭐ Advanced',
        title: '60-Minute Session',
        text: 'Warm-up and water break, then the full session is scrimmage. For Advanced, the game IS the program — 50 minutes of pure kickball.',
        items: [
          'Intro / Warm-up (5 min)',
          'Water Break (5 min)',
          'Scrimmage (50 min)',
        ],
        note: 'Sessions start at 6:30 PM. Youngs finish just as Advanced arrives.',
      }}
      tierAlert="Kickball uses a unique staggered schedule — Youngs sessions run 5:30–6:30 PM and Advanced sessions run 6:30–7:30 PM. Youngs finish just as Advanced arrives, allowing staff to transition smoothly between groups."
      drillSubtitle="3 drills across 3 categories — fielding, base running, and game"
      drillTabs={DRILL_TABS}
      drills={DRILLS}
      planSubtitle="The same structure runs every week — simple, consistent, and built around the scrimmage"
      planMeta={[
        { icon: '⏱', label: 'Session Length:', value: '60 min (both groups)' },
        { icon: '🕡', label: 'Youngs Start:', value: '5:30 PM' },
        { icon: '🕡', label: 'Advanced Start:', value: '6:30 PM' },
        { icon: '🔴', label: 'Format:', value: 'Quick drills → scrimmage' },
      ]}
      planTabs={PLAN_TABS}
      plans={PLANS}
      youngsTimeNote="(5:30 PM)"
      advancedTimeNote="(6:30 PM)"
      scrimmageRules={SCRIMMAGE_RULES}
      equipment={EQUIPMENT}
      footerText="Kickball Program Playbook"
    />
  )
}
