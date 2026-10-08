export const DRILL_TABS = [
  { id: 'throwing', label: '🏈 Throwing' },
  { id: 'catching', label: '🙌 Catching' },
  { id: 'agility',  label: '⚡ Agility' },
  { id: 'games',    label: '🎮 Games' },
]

export const DRILLS = {
  throwing: [
    {
      icon: '🎯',
      name: 'QB Throwing Nets',
      description: 'Players throw from marked spots at a target net. Start close, move back as the drill advances. Competitive version: two nets, teams race to hit the most targets.',
      purpose: 'Build QB throwing mechanics and grow confidence with distance in a no-failure format.',
      tags: ['Skill', 'Fun'],
      equipment: ['🏈 Footballs', '🥅 Throwing nets (2)'],
    },
    {
      icon: '⭕',
      name: 'Circle Passing',
      description: "Players sit or stand in a circle. Before each pass, the thrower calls out the name of the person they're throwing to, then delivers the ball.",
      purpose: 'Practice throwing accuracy and build communication skills within the group.',
      tags: ['Team', 'Skill'],
      equipment: ['🏈 Footballs'],
    },
  ],
  catching: [
    {
      icon: '🏃',
      name: 'WR Route Running',
      description: 'Cones and color spots set up as route markers from the 10-yard line to the goal line. Each player runs to a spot of their choice, coach throws as QB, player catches the ball and scores in the end zone — with a full celebration every time.',
      purpose: 'Introduce route concepts and catching while moving. The end zone celebration is the most important part.',
      tags: ['Skill', 'Fun', 'Team'],
      equipment: ['📍 Cones', '🔵 Color spots', '🏈 Footballs'],
      coachTip: 'Let players pick their own route spot — ownership increases buy-in. The end zone celebration is the most important part!',
    },
  ],
  agility: [
    {
      icon: '🏃',
      name: 'Running Back Agility',
      description: 'Coach hands off the ball. Player runs through the agility ladder and over hurdles, then scores a touchdown in the end zone.',
      purpose: 'Develop ball security and agility skills while building toward one of the best moments in football — scoring.',
      tags: ['Agility', 'Fun'],
      equipment: ['🪜 Agility ladders', '🚧 Hurdles', '🏈 Footballs'],
    },
    {
      icon: '🌈',
      name: 'Color Spot Agility',
      description: 'Color spots are spread randomly around the field. Players hold footballs. Coach calls a color — all players sprint to the nearest spot of that color. First there wins the round.',
      purpose: 'Build reaction time, listening skills, and movement with the ball in hand.',
      tags: ['Agility', 'Fun'],
      equipment: ['🔵 Color spots (20+)', '🏈 Footballs'],
    },
  ],
  games: [
    {
      icon: '🚦',
      name: 'Red Light, Green Light',
      description: 'Players run with football from goal line to the opposite goal line. Freeze in place on "red light." First player to reach the far side wins.',
      purpose: 'Practice ball security while running and develop stop-and-start control in a competitive race.',
      tags: ['Fun', 'Game'],
      equipment: ['🏈 Footballs'],
    },
    {
      icon: '🦈',
      name: 'Sharks and Minnows',
      description: 'Players run from baseline to baseline carrying a football, avoiding the "shark" (coach). If tagged, that player becomes a shark and joins the coach in the middle.',
      purpose: 'Practice running with the ball and develop spatial awareness under light pressure. High energy, big laughs.',
      tags: ['Fun', 'Game'],
      equipment: ['🏈 Footballs'],
    },
    {
      icon: '🏟️',
      name: 'Scrimmage',
      description: 'Two teams compete in a standard play format. Coaches play QB for both teams. Every touchdown is celebrated with maximum energy from coaches and volunteers alike.',
      purpose: 'Apply all skills in a real game environment. Every score is a moment — make it one.',
      tags: ['Game', 'Team'],
      equipment: ['🏈 Footballs', '🟡 Pylons', '🦺 Pinnies'],
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
      { time: '6:00', duration: '15m', name: 'Intro & Warm-Up', desc: 'Introductions, light stretching, throwing warm-up' },
      { time: '6:15', duration: '6m',  name: '💧 Water Break', type: 'water' },
      { time: '6:21', duration: '12m', name: 'QB Throwing Nets', desc: 'Throw from marked spots at target nets; move back as drill advances' },
      { time: '6:33', duration: '12m', name: 'WR Route Running', desc: 'Pick a route spot, receive pass from QB coach, score and celebrate' },
      { time: '6:45', duration: '6m',  name: '💧 Water Break', type: 'water' },
      { time: '6:51', duration: '12m', name: 'Color Spot Agility', desc: 'Coach calls a color — sprint to that spot while carrying football' },
      { time: '7:03', duration: '12m', name: 'Sharks and Minnows', desc: 'Run baseline to baseline with football, avoid the shark' },
      { time: '7:15', name: 'END' },
    ],
    advanced: [
      { time: '6:00', duration: '10m', name: 'Intro & Warm-Up', desc: 'Introductions, light stretching, throwing warm-up' },
      { time: '6:10', duration: '10m', name: 'WR Route Running', desc: 'Pick a route spot, receive pass from QB coach, score and celebrate' },
      { time: '6:20', duration: '5m',  name: '💧 Water Break', type: 'water' },
      { time: '6:25', duration: '40m', name: '🏟️ Scrimmage', desc: '3–5 ES players + 1–2 peers per team. Coaches QB both sides.', type: 'scrimmage' },
      { time: '7:05', name: 'Wrap', desc: 'Cool down, celebrate, group huddle' },
      { time: '7:15', name: 'END' },
    ],
  },
  {
    youngs: [
      { time: '6:00', duration: '15m', name: 'Intro & Warm-Up', desc: 'Introductions, light stretching, throwing warm-up' },
      { time: '6:15', duration: '6m',  name: '💧 Water Break', type: 'water' },
      { time: '6:21', duration: '12m', name: 'Circle Passing', desc: "Call teammate's name, then pass; rotate pass types" },
      { time: '6:33', duration: '12m', name: 'Running Back Agility', desc: 'Handoff → agility ladder → hurdles → touchdown' },
      { time: '6:45', duration: '6m',  name: '💧 Water Break', type: 'water' },
      { time: '6:51', duration: '12m', name: 'WR Route Running', desc: 'Pick a route spot, receive pass from QB coach, score and celebrate' },
      { time: '7:03', duration: '12m', name: 'Red Light, Green Light', desc: 'Run with football goal line to goal line; freeze on red' },
      { time: '7:15', name: 'END' },
    ],
    advanced: [
      { time: '6:00', duration: '10m', name: 'Intro & Warm-Up', desc: 'Introductions, light stretching, throwing warm-up' },
      { time: '6:10', duration: '10m', name: 'Running Back Agility', desc: 'Handoff → agility ladder → hurdles → touchdown' },
      { time: '6:20', duration: '5m',  name: '💧 Water Break', type: 'water' },
      { time: '6:25', duration: '40m', name: '🏟️ Scrimmage', desc: '3–5 ES players + 1–2 peers per team. Coaches QB both sides.', type: 'scrimmage' },
      { time: '7:05', name: 'Wrap', desc: 'Cool down, celebrate, group huddle' },
      { time: '7:15', name: 'END' },
    ],
  },
  {
    youngs: [
      { time: '6:00', duration: '15m', name: 'Intro & Warm-Up', desc: 'Introductions, light stretching, throwing warm-up' },
      { time: '6:15', duration: '6m',  name: '💧 Water Break', type: 'water' },
      { time: '6:21', duration: '12m', name: 'QB Throwing Nets', desc: 'Throw from marked spots at target nets; competitive two-net version' },
      { time: '6:33', duration: '12m', name: 'Circle Passing', desc: "Call teammate's name, then pass; rotate pass types" },
      { time: '6:45', duration: '6m',  name: '💧 Water Break', type: 'water' },
      { time: '6:51', duration: '12m', name: 'Running Back Agility', desc: 'Handoff → agility ladder → hurdles → touchdown' },
      { time: '7:03', duration: '12m', name: 'Color Spot Agility', desc: 'Coach calls a color — sprint to that spot while carrying football' },
      { time: '7:15', name: 'END' },
    ],
    advanced: [
      { time: '6:00', duration: '10m', name: 'Intro & Warm-Up', desc: 'Introductions, light stretching, throwing warm-up' },
      { time: '6:10', duration: '10m', name: 'QB Throwing Nets', desc: 'Throw from marked spots at nets; competitive two-net race' },
      { time: '6:20', duration: '5m',  name: '💧 Water Break', type: 'water' },
      { time: '6:25', duration: '40m', name: '🏟️ Scrimmage', desc: '3–5 ES players + 1–2 peers per team. Coaches QB both sides.', type: 'scrimmage' },
      { time: '7:05', name: 'Wrap', desc: 'Cool down, celebrate, group huddle' },
      { time: '7:15', name: 'END' },
    ],
  },
]

export const EQUIPMENT = [
  { icon: '🏈', label: 'Footballs (6–10)' },
  { icon: '🥅', label: 'Throwing Nets (2)' },
  { icon: '🔵', label: 'Color Spots (20+)' },
  { icon: '🪜', label: 'Agility Ladders' },
  { icon: '🚧', label: 'Hurdles' },
  { icon: '🟡', label: 'Pylons (8+)' },
  { icon: '📍', label: 'Cones' },
  { icon: '🦺', label: 'Pinnies / Vests' },
]
