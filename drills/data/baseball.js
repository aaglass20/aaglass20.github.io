// Baseball drills. Schema + rules: drills/RULES.md
window.DRILL_DATA = window.DRILL_DATA || {};
window.DRILL_DATA.baseball = [
  {
    id: 'four-corners',
    name: 'Four Corners',
    altNames: ['Around the Horn', 'Box Throwing'],
    objective: 'Practice catching, quick footwork, and accurate throws to a base under time pressure.',
    setup: [
      'One player at each base (home, 1st, 2nd, 3rd); extra players line up behind them',
      'Start with one ball at home',
    ],
    directions: [
      'Home throws to 1st; 1st catches, turns, and throws to 2nd; continue around the bases.',
      'After throwing, the player goes to the back of the line at the next base.',
      'Count how many full trips around the bases the group makes in 60 seconds.',
      'Reverse direction for the next round.',
    ],
    variations: [
      'Easier: shorten the distance by placing cones inside the bases.',
      'Harder: add a second ball starting at 2nd.',
      'Harder: receivers must tag the base as they catch.',
    ],
    coachingPoints: [
      'Give a target with your glove before the throw.',
      'Catch with two hands and turn your glove-side shoulder to the next base.',
      'Footwork first, then throw — don\'t rush the arm.',
      'Throw chest-high to your teammate.',
    ],
    equipment: ['1–2 balls', 'Gloves', 'Bases'],
    ages: ['U10', 'U12', 'U14', 'HS'],
    categories: ['Throwing', 'Catching', 'Infield'],
    players: '4–12',
    duration: '8–10 min',
    status: 'candidate',
    sources: [{ name: 'Standard team throwing drill' }],
  },
];
