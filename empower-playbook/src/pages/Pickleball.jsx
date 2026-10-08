import SportPage from '../components/SportPage.jsx'
import { DRILL_TABS, DRILLS, PLAN_TABS, PLANS, EQUIPMENT } from '../data/pickleball.js'

export default function Pickleball() {
  return (
    <SportPage
      icon="🏓"
      badge="🏓 Pickleball Program"
      name="Pickleball"
      heroSubtitle="Paddle skills, volleys, and serving — one of our fastest-growing programs"
      overviewSubtitle="Two tiers, one court — adapted for every ability level"
      youngsTier={{
        label: '🌱 Youngs & Intermediate',
        title: 'Full Drill Session',
        text: 'Players spend the full 75-minute session rotating through structured drills with coach and volunteer support at every station.',
        items: [
          'Warm-up & Introduction (15 min)',
          'Water Break',
          'Drill 1 (12 min)',
          'Drill 2 (12 min)',
          'Water Break',
          'Drill 3 (12 min)',
          'Drill 4 (12 min)',
        ],
        note: 'Start with balloon drills and paddle work before introducing the actual ball and court.',
      }}
      advancedTier={{
        label: '⭐ Advanced',
        title: 'Drill + Scrimmage Session',
        text: 'Experienced players run 1–2 focused drills then move straight into a 40-minute scrimmage with peer volunteers on the court.',
        items: [
          'Warm-up (10 min)',
          '1–2 Drills (10 min each)',
          'Water Break',
          'Scrimmage (40 min)',
        ],
        note: '1–2 ES players + 1–2 peers per team on court. Small court format.',
      }}
      drillSubtitle="All pickleball drills organized by category — click a tab to explore"
      drillTabs={DRILL_TABS}
      drills={DRILLS}
      planSubtitle="Week-by-week session schedules for both tiers"
      planMeta={[
        { icon: '⏱', label: 'Session Length:', value: '75 min (Youngs) · 65 min (Advanced)' },
        { icon: '📍', label: 'Format:', value: 'Drills + Water Breaks · Drill + Scrimmage' },
        { icon: '🏓', label: 'Court:', value: 'Small court format for scrimmage' },
      ]}
      planTabs={PLAN_TABS}
      plans={PLANS}
      scrimmageCard={{
        icon: '🏓',
        title: 'Scrimmage Format',
        text: '1–2 ES players + 1–2 peer volunteers per team on court. Coaches play alongside and coach simultaneously. Rotate players frequently so everyone gets court time. Celebrate every point!',
      }}
      equipment={EQUIPMENT}
      footerText="Pickleball Program Playbook"
    />
  )
}
