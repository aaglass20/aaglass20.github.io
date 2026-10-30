// Basketball drills. Schema + rules: drills/RULES.md
window.DRILL_DATA = window.DRILL_DATA || {};
window.DRILL_DATA.basketball = [
  {
    id: 'mikan-drill',
    name: 'Mikan Drill',
    altNames: ['Mikan Layups', 'Alternating Layups'],
    objective: 'Build soft touch and footwork around the rim by finishing continuous layups with both hands.',
    setup: [
      'One player under the basket with a ball',
      'One basket per 1–2 players',
    ],
    instructions: [
      'Start on the right block; shoot a right-handed layup off the backboard.',
      'Catch the ball out of the net without letting it hit the floor.',
      'Step to the left side and shoot a left-handed layup.',
      'Keep alternating for 30–60 seconds; count makes.',
    ],
    variations: [
      'Easier: let the ball bounce once before catching.',
      'Harder: reverse Mikan — reverse layups from under the rim.',
      'Harder: ball stays above the shoulders the whole time.',
    ],
    coachingPoints: [
      'Keep the ball high — chin to forehead.',
      'Shoot off the top corner of the square.',
      'Right hand on the right side, left hand on the left side.',
      'Quick feet — one step across, then go up.',
    ],
    equipment: ['1 ball', '1 basket'],
    ages: ['U10', 'U12', 'U14', 'HS', 'Adult'],
    categories: ['Finishing', 'Footwork', 'Warmup'],
    players: '1–2 per basket',
    duration: '3–5 min',
    status: 'candidate',
    sources: [{ name: 'Named for George Mikan; standard big-man finishing drill' }],
  },
  {
    id: 'knockout',
    name: 'Knockout',
    altNames: ['Lightning', 'Bump'],
    objective: 'Shoot under game-like pressure in a fun elimination game.',
    setup: [
      'All players in one line at the free-throw line (closer for younger players)',
      'First two players in line each have a ball',
    ],
    instructions: [
      'First player shoots; the second may shoot as soon as the first shot leaves the hand.',
      'If you miss, rebound and keep shooting from anywhere until you score.',
      'If the player behind you scores before you, you are knocked out.',
      'After scoring, pass the ball to the next player in line and go to the back.',
      'Last player standing wins.',
    ],
    variations: [
      'Easier: shoot from the block or a closer spot.',
      'Players who are knocked out do a quick skill station and rejoin (no long sit-outs).',
      'Harder: misses must be finished with the weak hand.',
    ],
    coachingPoints: [
      'Square up and use your normal form even when rushed.',
      'Follow your shot — be first to the rebound.',
      'Pass crisply to the next player so the game keeps moving.',
    ],
    equipment: ['2 balls', '1 basket'],
    ages: ['U8', 'U10', 'U12', 'U14', 'HS'],
    categories: ['Shooting', 'Fun'],
    players: '4–15',
    duration: '5–10 min',
    status: 'candidate',
    sources: [{ name: 'Classic shooting game' }],
  },
];
