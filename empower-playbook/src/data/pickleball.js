export const DRILL_TABS = [
  { id: 'fundamentals', label: '🎈 Fundamentals' },
  { id: 'serving',      label: '🎯 Serving' },
  { id: 'volleys',      label: '🏓 Volleys' },
  { id: 'games',        label: '🎮 Games' },
]

export const DRILLS = {
  fundamentals: [
    {
      icon: '🎈',
      name: 'Balloon Drills',
      description: "Each player has a paddle and balloon. Coach calls different activities: keep balloon up with paddle, partner passing with balloon, don't let it touch the ground.",
      purpose: 'Paddle-to-object contact in a low-pressure, slow-moving format.',
      tags: ['Fun', 'Skill'],
      equipment: ['🎈 balloons', '🏓 paddles'],
      coachTip: "Balloons are magic — they move slowly enough for everyone to track and react. Don't rush past this drill; it builds the paddle-confidence needed for everything else.",
    },
    {
      icon: '🏓',
      name: 'Paddle Work',
      description: 'Players bounce ball on paddle repeatedly (dribble it), balance it, or "walk the dog" — push ball along floor line while walking forward with the paddle.',
      purpose: 'Paddle control and eye-hand coordination.',
      tags: ['Skill', 'Agility'],
      equipment: ['🟡 pickleballs', '🏓 paddles'],
    },
    {
      icon: '🧱',
      name: 'Wall Ball',
      description: 'Players hit ball against wall with an optional target for focus. Work toward self-rallying — multiple consecutive hits against the wall.',
      purpose: 'Striking mechanics and tracking.',
      tags: ['Skill'],
      equipment: ['🟡 pickleballs', '🏓 paddles', '🎯 optional target'],
    },
  ],
  serving: [
    {
      icon: '🪣',
      name: 'Serving Into Buckets',
      description: 'Players on one side of court with 2–3 large buckets placed across the net. Take turns serving underhand into buckets.',
      purpose: 'Serve mechanics and accuracy.',
      tags: ['Skill', 'Fun'],
      equipment: ['🟡 pickleballs', '🏓 paddles', '🪣 buckets (2–3)'],
      coachTip: 'Position buckets at different distances for different ability levels. Closer bucket = beginner. Far bucket = bonus challenge. Both count!',
    },
  ],
  volleys: [
    {
      icon: '🤝',
      name: 'Partner Volley',
      description: 'Partners across from each other (or across net), volley back and forth. Start close, increase distance as confidence builds.',
      purpose: 'Volley timing and tracking.',
      tags: ['Skill', 'Team'],
      equipment: ['🟡 pickleballs', '🏓 paddles'],
    },
    {
      icon: '⚡',
      name: 'Reacting to Returns',
      description: 'Coach serves to each player on opposite side. Player must react and return ball over net. 2–3 serves per player before rotating.',
      purpose: 'Real-game reaction and return mechanics.',
      tags: ['Skill'],
      equipment: ['🟡 pickleballs', '🏓 paddles'],
    },
    {
      icon: '🎯',
      name: 'Throwing to Targets',
      description: 'Players stand on kitchen line, throw pickleballs underhand at targets on opposite kitchen line.',
      purpose: 'Build accuracy and court awareness without paddle pressure.',
      tags: ['Skill', 'Fun'],
      equipment: ['🟡 pickleballs', '🔴 color dots/targets'],
    },
  ],
  games: [
    {
      icon: '🏟️',
      name: 'Scrimmage',
      description: 'Players divided into two teams — 1–2 ES players + 1–2 peer volunteers per team on the court. Coaches and volunteers play alongside and coach simultaneously. Director periodically pauses play for coaching moments.',
      purpose: 'Apply skills in a real game setting. Playing alongside peer volunteers creates shared experiences that benefit everyone on the court.',
      tags: ['Game', 'Team'],
      equipment: ['🟡 Pickleballs', '🏓 Paddles'],
      coachTip: 'Rotate players frequently so everyone gets court time. Celebrate every point — making contact over the net is a win at any stage.',
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
      { time: '6:21', duration: '12m', name: 'Balloon Drills', desc: 'Paddle-to-balloon contact in low-pressure format' },
      { time: '6:33', duration: '12m', name: 'Paddle Work', desc: 'Dribble, balance, walk the dog' },
      { time: '6:45', duration: '6m',  name: '💧 Water Break', type: 'water' },
      { time: '6:51', duration: '12m', name: 'Serving Into Buckets', desc: 'Underhand serve accuracy, varied bucket distances' },
      { time: '7:03', duration: '12m', name: 'Throwing to Targets', desc: 'Accuracy and court awareness without paddle pressure' },
      { time: '7:15', name: 'END' },
    ],
    advanced: [
      { time: '6:00', duration: '10m', name: 'Intro / Warm-up', desc: 'Introductions, light movement, stretch' },
      { time: '6:10', duration: '10m', name: 'Serving Into Buckets', desc: 'Serve mechanics and accuracy drill' },
      { time: '6:20', duration: '5m',  name: '💧 Water Break', type: 'water' },
      { time: '6:25', duration: '40m', name: '🏓 Scrimmage', desc: '1–2 ES players + 1–2 peers per team on court', type: 'scrimmage' },
      { time: '7:05', name: 'END' },
    ],
  },
  {
    youngs: [
      { time: '6:00', duration: '15m', name: 'Intro / Warm-up', desc: 'Introductions, light movement, stretch' },
      { time: '6:15', duration: '6m',  name: '💧 Water Break', type: 'water' },
      { time: '6:21', duration: '12m', name: 'Balloon Drills', desc: 'Paddle-to-balloon contact in low-pressure format' },
      { time: '6:33', duration: '12m', name: 'Paddle Work', desc: 'Dribble, balance, walk the dog' },
      { time: '6:45', duration: '6m',  name: '💧 Water Break', type: 'water' },
      { time: '6:51', duration: '12m', name: 'Throwing to Targets', desc: 'Accuracy and court awareness without paddle pressure' },
      { time: '7:03', duration: '12m', name: 'Serving Into Buckets', desc: 'Underhand serve accuracy, varied bucket distances' },
      { time: '7:15', name: 'END' },
    ],
    advanced: [
      { time: '6:00', duration: '10m', name: 'Intro / Warm-up', desc: 'Introductions, light movement, stretch' },
      { time: '6:10', duration: '10m', name: 'Reacting to Returns', desc: 'Real-game reaction and return mechanics' },
      { time: '6:20', duration: '5m',  name: '💧 Water Break', type: 'water' },
      { time: '6:25', duration: '40m', name: '🏓 Scrimmage', desc: '1–2 ES players + 1–2 peers per team on court', type: 'scrimmage' },
      { time: '7:05', name: 'END' },
    ],
  },
  {
    youngs: [
      { time: '6:00', duration: '15m', name: 'Intro / Warm-up', desc: 'Introductions, light movement, stretch' },
      { time: '6:15', duration: '6m',  name: '💧 Water Break', type: 'water' },
      { time: '6:21', duration: '12m', name: 'Wall Ball', desc: 'Striking mechanics, tracking, self-rally challenge' },
      { time: '6:33', duration: '12m', name: 'Partner Volley', desc: 'Volley timing and tracking with a partner' },
      { time: '6:45', duration: '6m',  name: '💧 Water Break', type: 'water' },
      { time: '6:51', duration: '12m', name: 'Serving Into Buckets', desc: 'Underhand serve accuracy, varied bucket distances' },
      { time: '7:03', duration: '12m', name: 'Throwing to Targets', desc: 'Accuracy and court awareness without paddle pressure' },
      { time: '7:15', name: 'END' },
    ],
    advanced: [
      { time: '6:00', duration: '10m', name: 'Intro / Warm-up', desc: 'Introductions, light movement, stretch' },
      { time: '6:10', duration: '10m', name: 'Serving Into Buckets', desc: 'Serve mechanics and accuracy drill' },
      { time: '6:20', duration: '5m',  name: '💧 Water Break', type: 'water' },
      { time: '6:25', duration: '40m', name: '🏓 Scrimmage', desc: '1–2 ES players + 1–2 peers per team on court', type: 'scrimmage' },
      { time: '7:05', name: 'END' },
    ],
  },
]

export const EQUIPMENT = [
  { icon: '🟡', label: 'Pickleballs (10–15)' },
  { icon: '🏓', label: 'Paddles (enough for all + extras)' },
  { icon: '🎈', label: 'Balloons (10+)' },
  { icon: '🪣', label: 'Buckets (2–3 large)' },
  { icon: '🔴', label: 'Color dots / targets' },
  { icon: '🥅', label: 'Portable net or existing court net' },
]
