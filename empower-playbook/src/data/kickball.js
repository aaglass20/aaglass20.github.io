export const DRILL_TABS = [
  { id: 'fielding',    label: '🧤 Fielding' },
  { id: 'baserunning', label: '🏃 Base Running' },
  { id: 'game',        label: '🎮 Game' },
]

export const DRILLS = {
  fielding: [
    {
      icon: '🪣',
      name: 'Fielding Bucket Drill',
      description: 'Players line up in the infield. Coach rolls a kickball to each player one at a time. Player picks it up and places it in a bucket next to first base — that\'s the out mechanic. Requires 3 coaches: one managing the line, one managing the bucket, one rolling the ball.',
      purpose: 'Fielding mechanics and understanding the out mechanic in a no-pressure environment.',
      tags: ['Skill'],
      equipment: ['⬛ bases', '🪣 bucket', '🔴 kickballs'],
      coachTip: 'The bucket is a genius adaptation — it eliminates the throwing challenge of making an out and lets everyone successfully record an "out." Celebrate every successful bucket deposit!',
    },
  ],
  baserunning: [
    {
      icon: '🏃',
      name: 'Base Running',
      description: 'Players line up at home plate. Coaches and volunteers are stationed at each base (1st, 2nd, 3rd, home) to guide and cheer. Players are sent one at a time around all four bases.',
      purpose: 'Learning base paths, scoring, and the structure of the game.',
      tags: ['Skill', 'Fun'],
      equipment: ['⬛ bases'],
      coachTip: 'Station the most enthusiastic volunteer at home plate to celebrate the "score" — high fives, cheers, the works. Make it feel like winning the championship every single time.',
    },
  ],
  game: [
    {
      icon: '🔴',
      name: 'Scrimmage',
      description: 'Players divided into two teams. Coaches and volunteers are on the field throughout the game. All players take an at-bat before sides switch to the field. The bucket drill becomes the out mechanic — field it, deposit it in the bucket, that\'s the out.',
      purpose: 'Teach players how to play kickball in a real game setting. Playing alongside peer volunteers creates shared experiences that benefit everyone involved.',
      tags: ['Game', 'Team'],
      equipment: ['🔴 Kickballs', '🪣 Buckets', '⬛ Bases'],
      coachTip: 'No strikeouts — every player kicks until they make contact. Celebrate every runner who crosses home plate. Loudly.',
    },
  ],
}

export const PLAN_TABS = [
  { id: 'w1', label: 'Week 1' },
  { id: 'w2', label: 'Week 2' },
  { id: 'w3', label: 'Week 3' },
  { id: 'w4', label: 'Week 4' },
]

const YOUNGS_WEEK = [
  { time: '5:30', duration: '5m',  name: 'Intro / Warm-up', desc: 'Introductions, light movement' },
  { time: '5:35', duration: '5m',  name: 'Fielding Bucket Drill', desc: 'Roll, pick up, deposit in bucket — the out mechanic' },
  { time: '5:40', duration: '5m',  name: 'Base Running', desc: 'Around all four bases with coaches at every stop' },
  { time: '5:45', duration: '5m',  name: '💧 Water Break', type: 'water' },
  { time: '5:50', duration: '40m', name: '🔴 Scrimmage', desc: 'Everyone kicks — bucket drill is the out mechanic', type: 'scrimmage' },
  { time: '6:30', name: 'END' },
]

const ADVANCED_WEEK = [
  { time: '6:30', duration: '5m',  name: 'Intro / Warm-up', desc: 'Introductions, light movement' },
  { time: '6:35', duration: '5m',  name: '💧 Water Break', type: 'water' },
  { time: '6:40', duration: '50m', name: '🔴 Scrimmage', desc: 'Full scrimmage — the game IS the session', type: 'scrimmage' },
  { time: '7:30', name: 'END' },
]

export const PLANS = [
  { youngs: YOUNGS_WEEK, advanced: ADVANCED_WEEK },
  { youngs: YOUNGS_WEEK, advanced: ADVANCED_WEEK },
  { youngs: YOUNGS_WEEK, advanced: ADVANCED_WEEK },
  { youngs: YOUNGS_WEEK, advanced: ADVANCED_WEEK },
]

export const EQUIPMENT = [
  { icon: '🔴', label: 'Kickballs (4–6)' },
  { icon: '⬛', label: 'Bases (4)' },
  { icon: '🪣', label: 'Buckets (1–2 large)' },
  { icon: '🔶', label: 'Cones' },
  { icon: '📣', label: 'Whistle' },
]

export const SCRIMMAGE_RULES = [
  'All players take an at-bat before sides switch to field',
  'Coaches and volunteers position themselves in the field alongside participants',
  'The fielding bucket drill becomes the out mechanic during scrimmage — field it, bucket it, out!',
  'No strikeouts — every player gets to kick until they make contact',
  'Every runner who crosses home plate is celebrated — loudly and enthusiastically',
]
