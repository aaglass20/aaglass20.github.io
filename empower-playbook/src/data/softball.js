export const DRILL_TABS = [
  { id: 'fielding',    label: '🧤 Fielding' },
  { id: 'hitting',     label: '🏏 Hitting' },
  { id: 'baserunning', label: '🏃 Base Running' },
]

export const DRILLS = {
  fielding: [
    {
      icon: '⚾',
      name: 'Ground Ball',
      description: 'Players form a line in the infield. Coach rolls ground balls one at a time. A volunteer is positioned at first base. Each player fields the grounder and throws to first.',
      purpose: 'Build basic fielding mechanics — footwork, glove position, and throwing to a base.',
      tags: ['Skill'],
      equipment: ['🥎 Softballs', '📍 Cones'],
    },
    {
      icon: '☁️',
      name: 'Pop Flies',
      description: 'Players form a line in the outfield. Coach tosses a fly ball up in the air. Player tracks and catches it, then throws back to coach.',
      purpose: 'Develop the ability to track and catch balls hit in the air — a key confidence-builder.',
      tags: ['Skill'],
      equipment: ['🥎 Softballs', '📍 Cones'],
    },
    {
      icon: '🤝',
      name: 'Partner Catching',
      description: 'Partners play catch starting close together (5–8 ft), then gradually move apart as comfort increases. Focus on proper catching form — two hands, soft hands, track the ball.',
      purpose: 'Build throwing and catching distance gradually. The go-to warmup drill for every session.',
      tags: ['Skill', 'Team'],
      equipment: ['🥎 Softballs'],
    },
    {
      icon: '↔️',
      name: 'Partner Ground Balls',
      description: 'Partners face each other and take turns rolling ground balls across to the other. Work on getting in front of the ball and using proper fielding position.',
      purpose: 'Develop fielding footwork and glove-to-throwing-hand transfer with a partner.',
      tags: ['Skill', 'Team'],
      equipment: ['🥎 Softballs'],
    },
  ],
  hitting: [
    {
      icon: '🎯',
      name: 'Tee Hitting',
      description: 'Tee is set up near the fence. Players take turns hitting the ball into the fence — one at a time with coach support. Coach teaches fundamentals: grip, stance, swing path.',
      purpose: 'Core hitting mechanics in a no-pressure environment. Every participant can make contact.',
      tags: ['Skill'],
      equipment: ['🥎 Softballs', '🏏 Tee', '🪵 Bat'],
      coachTip: 'Let participants feel the contact first — adjust grip and form gradually once they\'ve experienced success. Celebrate every solid hit!',
    },
  ],
  baserunning: [
    {
      icon: '🏃',
      name: 'Base Running',
      description: 'Players line up at home plate. Coaches and volunteers are stationed at each base to provide direction and encouragement. Players are sent one at a time around all four bases.',
      purpose: 'Learn the base paths and the feeling of scoring — everyone crosses home plate.',
      tags: ['Skill', 'Fun'],
      equipment: ['⬡ Bases (4)'],
      coachTip: 'Station a volunteer at each base who gives enthusiastic high-fives and encouragement. The round-trip around the bases should feel like a victory lap!',
    },
  ],
}

export const PLAN_TABS = [
  { id: 'w1', label: 'Week 1' },
  { id: 'w2', label: 'Week 2' },
  { id: 'w3', label: 'Week 3' },
  { id: 'w4', label: 'Week 4' },
]

export const PLANS = [
  {
    youngs: [
      { time: '6:00', duration: '10m', name: 'Intro & Warm-Up', desc: 'Introductions, light stretching, throw to loosen arms' },
      { time: '6:10', duration: '10m', name: 'Partner Catching', desc: 'Start 5–8 ft apart, gradually increase distance' },
      { time: '6:20', duration: '10m', name: 'Base Running', desc: 'One at a time around all four bases with coach at each' },
      { time: '6:30', duration: '5m',  name: '💧 Water Break', type: 'water' },
      { time: '6:35', duration: '40m', name: '🏟️ Scrimmage', desc: 'All players bat before sides switch. Tee available every at-bat.', type: 'scrimmage' },
      { time: '7:15', name: 'END' },
    ],
    advanced: [
      { time: '6:00', duration: '10m', name: 'Intro & Warm-Up', desc: 'Introductions, light stretching, throw to loosen arms' },
      { time: '6:10', duration: '10m', name: 'Partner Catching', desc: 'Start 5–8 ft apart, push distance as warm-up' },
      { time: '6:20', duration: '5m',  name: '💧 Water Break', type: 'water' },
      { time: '6:25', duration: '50m', name: '🏟️ Scrimmage', desc: 'All players bat before sides switch. Tee available every at-bat.', type: 'scrimmage' },
      { time: '7:15', name: 'END' },
    ],
  },
  {
    youngs: [
      { time: '6:00', duration: '10m', name: 'Intro & Warm-Up', desc: 'Introductions, light stretching, throw to loosen arms' },
      { time: '6:10', duration: '15m', name: 'Ground Ball', desc: 'Coach rolls grounders; player fields and throws to first' },
      { time: '6:25', duration: '10m', name: 'Pop Flies', desc: 'Coach tosses fly balls; player tracks and catches' },
      { time: '6:35', duration: '5m',  name: '💧 Water Break', type: 'water' },
      { time: '6:40', duration: '35m', name: '🏟️ Scrimmage', desc: 'All players bat before sides switch. Tee available every at-bat.', type: 'scrimmage' },
      { time: '7:15', name: 'END' },
    ],
    advanced: [
      { time: '6:00', duration: '10m', name: 'Intro & Warm-Up', desc: 'Introductions, light stretching, throw to loosen arms' },
      { time: '6:10', duration: '10m', name: 'Partner Catching', desc: 'Start 5–8 ft apart, push distance as warm-up' },
      { time: '6:20', duration: '5m',  name: '💧 Water Break', type: 'water' },
      { time: '6:25', duration: '50m', name: '🏟️ Scrimmage', desc: 'All players bat before sides switch. Tee available every at-bat.', type: 'scrimmage' },
      { time: '7:15', name: 'END' },
    ],
  },
  {
    youngs: [
      { time: '6:00', duration: '10m', name: 'Intro & Warm-Up', desc: 'Introductions, light stretching, throw to loosen arms' },
      { time: '6:10', duration: '15m', name: 'Base Running', desc: 'One at a time around all four bases with coach at each' },
      { time: '6:25', duration: '10m', name: 'Partner Catching', desc: 'Partners play catch, gradually increase distance' },
      { time: '6:35', duration: '5m',  name: '💧 Water Break', type: 'water' },
      { time: '6:40', duration: '35m', name: '🏟️ Scrimmage', desc: 'All players bat before sides switch. Tee available every at-bat.', type: 'scrimmage' },
      { time: '7:15', name: 'END' },
    ],
    advanced: [
      { time: '6:00', duration: '5m',  name: 'Intro & Warm-Up', desc: 'Quick introductions, light stretching' },
      { time: '6:05', duration: '5m',  name: '💧 Water Break', type: 'water' },
      { time: '6:10', duration: '55m', name: '🏟️ Scrimmage', desc: 'Full session scrimmage. All players bat. Tee available every at-bat.', type: 'scrimmage' },
      { time: '7:05', name: 'END' },
    ],
  },
  {
    youngs: [
      { time: '6:00', duration: '10m', name: 'Intro & Warm-Up', desc: 'Introductions, light stretching, throw to loosen arms' },
      { time: '6:10', duration: '10m', name: 'Partner Ground Balls', desc: 'Partners roll grounders across to each other' },
      { time: '6:20', duration: '15m', name: 'Tee Hitting', desc: 'Hit into fence from tee — coach teaches grip, stance, swing' },
      { time: '6:35', duration: '5m',  name: '💧 Water Break', type: 'water' },
      { time: '6:40', duration: '35m', name: '🏟️ Scrimmage', desc: 'All players bat before sides switch. Tee available every at-bat.', type: 'scrimmage' },
      { time: '7:15', name: 'END' },
    ],
    advanced: [
      { time: '6:00', duration: '10m', name: 'Intro & Warm-Up', desc: 'Introductions, light stretching, throw to loosen arms' },
      { time: '6:10', duration: '10m', name: 'Ground Ball', desc: 'Coach rolls grounders; player fields and throws to first' },
      { time: '6:20', duration: '5m',  name: '💧 Water Break', type: 'water' },
      { time: '6:25', duration: '50m', name: '🏟️ Scrimmage', desc: 'All players bat before sides switch. Tee available every at-bat.', type: 'scrimmage' },
      { time: '7:15', name: 'END' },
    ],
  },
]

export const EQUIPMENT = [
  { icon: '🥎', label: 'Softballs (6–10)' },
  { icon: '🏏', label: 'Batting Tees (1–2)' },
  { icon: '🪵', label: 'Bats (2–3)' },
  { icon: '⬡', label: 'Bases (4)' },
  { icon: '📍', label: 'Cones' },
  { icon: '🧤', label: 'Gloves for coaches/volunteers' },
  { icon: '🏗️', label: 'Fence / Backstop' },
]
