export const DRILL_TABS = [
  { id: 'dribbling', label: '🌀 Dribbling' },
  { id: 'passing',   label: '🎯 Passing' },
  { id: 'shooting',  label: '🥅 Shooting' },
  { id: 'minigames', label: '🎮 Mini Games' },
]

export const DRILLS = {
  dribbling: [
    {
      icon: '🔶',
      name: 'Dribbling Agility',
      description: 'Cones, ladders, and hurdles set up as an obstacle course. Players first go through without ball to learn the path, then dribble through at their own pace. BDU/volunteer walks alongside.',
      purpose: 'Ball control at pace, agility, confidence with obstacles.',
      tags: ['Agility', 'Skill'],
      equipment: ['⚽ soccer balls', '🔶 cones', '🪜 agility ladders', '⛳ hurdles'],
      coachTip: 'Let participants run through without a ball first — this removes the dual-task pressure and builds spatial confidence before adding ball control.',
    },
  ],
  passing: [
    {
      icon: '↔️',
      name: 'Passing Lines',
      description: 'Two facing lines with one ball. First player passes across to first player in opposite line, then goes to back of that line. Constant rotation and movement.',
      purpose: 'Passing technique while moving; teamwork.',
      tags: ['Skill', 'Team'],
      equipment: ['⚽ soccer ball', '🔶 cones'],
    },
    {
      icon: '🤝',
      name: 'Partner Passing',
      description: 'Partners across from each other passing back and forth. Coaches circulate and offer individual instruction. Start close, gradually add distance as confidence grows.',
      purpose: 'Repetitive passing technique in a comfortable pairing.',
      tags: ['Skill', 'Team'],
      equipment: ['⚽ soccer balls'],
    },
  ],
  shooting: [
    {
      icon: '⚡',
      name: 'Pass to Shot',
      description: 'Two lines in front of goal: one line has balls and passes to the other line; receiver takes a first touch and shoots.',
      purpose: 'Combining receiving with finishing.',
      tags: ['Skill', 'Team'],
      equipment: ['⚽ soccer balls'],
    },
    {
      icon: '🏃',
      name: 'Dribble to Shot',
      description: 'Single line in front of goal with cones ahead. Each player dribbles through the cone obstacle then shoots on goal.',
      purpose: 'Dribbling into finishing.',
      tags: ['Skill'],
      equipment: ['⚽ soccer balls', '🔶 cones'],
    },
    {
      icon: '🎯',
      name: 'Penalty Shooting',
      description: 'Players line up at penalty spot and take turns shooting. Coach or volunteer plays goalkeeper. Competitive version: two teams race to make the most goals in a set time.',
      purpose: 'Shooting confidence and accuracy.',
      tags: ['Skill', 'Fun', 'Game'],
      equipment: ['⚽ soccer balls', '🔶 cones'],
      coachTip: 'Let the goalkeeper be dramatic about the saves they miss — falling dramatically when they "can\'t stop" a great shot is hilarious and empowering for the shooter!',
    },
  ],
  minigames: [
    {
      icon: '🚧',
      name: 'Construction Zone',
      description: 'Cones and pylons spread randomly across field. Every player dribbles around knocking them over. Once all are down, reset and repeat. Coaches may reset during play to keep it continuous.',
      purpose: 'Free-form dribbling in all directions with a playful goal.',
      tags: ['Fun', 'Agility'],
      equipment: ['⚽ soccer balls', '🔶 cones', '🟠 pylons'],
    },
    {
      icon: '📏',
      name: 'Longest Shot Competition',
      description: 'All players shoot from the same starting distance. After each round, the line moves back one step. Repeat until there\'s a winner.',
      purpose: 'Shooting power and confidence from distance.',
      tags: ['Fun', 'Game'],
      equipment: ['⚽ soccer balls', '🥅 goal'],
    },
    {
      icon: '🏟️',
      name: 'Scrimmage',
      description: '5–7 ES players + 1–2 peer volunteers per team. Coaches on field with both teams. Standard play with coaches coaching alongside.',
      purpose: 'Full game experience and team play.',
      tags: ['Game', 'Team'],
      equipment: ['⚽ soccer balls'],
    },
  ],
}

export const PLAN_TABS = [
  { id: 'w1', label: 'Week 1' },
  { id: 'w2', label: 'Week 2' },
  { id: 'w3', label: 'Week 3' },
]

export const PLANS = [
  {
    youngs: [
      { time: '6:00', duration: '15m', name: 'Intro / Warm-up', desc: 'Introductions, light movement, stretch' },
      { time: '6:15', duration: '6m',  name: '💧 Water Break', type: 'water' },
      { time: '6:21', duration: '12m', name: 'Dribbling Agility', desc: 'Cone/ladder/hurdle obstacle course' },
      { time: '6:33', duration: '12m', name: 'Partner Passing', desc: 'Repetitive passing technique in comfortable pairing' },
      { time: '6:45', duration: '6m',  name: '💧 Water Break', type: 'water' },
      { time: '6:51', duration: '12m', name: 'Dribble to Shot', desc: 'Dribble through cones, finish on goal' },
      { time: '7:03', duration: '12m', name: 'Construction Zone', desc: 'Free-form dribbling — knock all the cones over!' },
      { time: '7:15', name: 'END' },
    ],
    advanced: [
      { time: '6:00', duration: '10m', name: 'Intro / Warm-up', desc: 'Introductions, light movement, stretch' },
      { time: '6:10', duration: '10m', name: 'Dribbling Agility', desc: 'Cone/ladder/hurdle obstacle course' },
      { time: '6:20', duration: '5m',  name: '💧 Water Break', type: 'water' },
      { time: '6:25', duration: '40m', name: '⚽ Scrimmage', desc: '5–7 ES players + 1–2 peers per team; coaches on field', type: 'scrimmage' },
      { time: '7:05', name: 'END' },
    ],
  },
  {
    youngs: [
      { time: '6:00', duration: '15m', name: 'Intro / Warm-up', desc: 'Introductions, light movement, stretch' },
      { time: '6:15', duration: '6m',  name: '💧 Water Break', type: 'water' },
      { time: '6:21', duration: '12m', name: 'Dribbling Agility', desc: 'Cone/ladder/hurdle obstacle course' },
      { time: '6:33', duration: '12m', name: 'Partner Passing', desc: 'Repetitive passing technique in comfortable pairing' },
      { time: '6:45', duration: '6m',  name: '💧 Water Break', type: 'water' },
      { time: '6:51', duration: '12m', name: 'Pass to Shot', desc: 'Receive a pass then finish on goal' },
      { time: '7:03', duration: '12m', name: 'Longest Shot Competition', desc: 'Who can score from the furthest away?' },
      { time: '7:15', name: 'END' },
    ],
    advanced: [
      { time: '6:00', duration: '10m', name: 'Intro / Warm-up', desc: 'Introductions, light movement, stretch' },
      { time: '6:10', duration: '10m', name: 'Partner Passing', desc: 'Focused passing mechanics and movement' },
      { time: '6:20', duration: '5m',  name: '💧 Water Break', type: 'water' },
      { time: '6:25', duration: '40m', name: '⚽ Scrimmage', desc: '5–7 ES players + 1–2 peers per team; coaches on field', type: 'scrimmage' },
      { time: '7:05', name: 'END' },
    ],
  },
  {
    youngs: [
      { time: '6:00', duration: '15m', name: 'Intro / Warm-up', desc: 'Introductions, light movement, stretch' },
      { time: '6:15', duration: '6m',  name: '💧 Water Break', type: 'water' },
      { time: '6:21', duration: '12m', name: 'Passing Lines', desc: 'Two-line passing with constant rotation and movement' },
      { time: '6:33', duration: '12m', name: 'Dribbling Agility', desc: 'Cone/ladder/hurdle obstacle course' },
      { time: '6:45', duration: '6m',  name: '💧 Water Break', type: 'water' },
      { time: '6:51', duration: '12m', name: 'Penalty Shooting', desc: 'Shoot from penalty spot; dramatic keeper encouraged!' },
      { time: '7:03', duration: '12m', name: 'Construction Zone', desc: 'Free-form dribbling — knock all the cones over!' },
      { time: '7:15', name: 'END' },
    ],
    advanced: [
      { time: '6:00', duration: '10m', name: 'Intro / Warm-up', desc: 'Introductions, light movement, stretch' },
      { time: '6:10', duration: '10m', name: 'Passing Lines', desc: 'Two-line passing with constant rotation and movement' },
      { time: '6:20', duration: '5m',  name: '💧 Water Break', type: 'water' },
      { time: '6:25', duration: '40m', name: '⚽ Scrimmage', desc: '5–7 ES players + 1–2 peers per team; coaches on field', type: 'scrimmage' },
      { time: '7:05', name: 'END' },
    ],
  },
]

export const EQUIPMENT = [
  { icon: '⚽', label: 'Soccer balls (8–12)' },
  { icon: '🔶', label: 'Cones (20+)' },
  { icon: '🟠', label: 'Pylons (10+)' },
  { icon: '🪜', label: 'Agility ladders' },
  { icon: '⛳', label: 'Hurdles' },
  { icon: '🥅', label: 'Goal(s) or cone goals' },
  { icon: '📣', label: 'Whistle' },
]
