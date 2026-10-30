// Sports and their drill categories. Matches Coach Approach's sport list (ca/src/data/sports.js).
// A drill's `categories` must come from its sport's list here — see RULES.md.

window.AGE_BANDS = ['U6', 'U8', 'U10', 'U12', 'U14', 'HS', 'Adult'];

// Optional `sportFocus` on a drill: which program sports it fits (mainly Adaptive). See RULES.md.
window.SPORT_FOCUS = ['Any', 'Soccer', 'Basketball', 'Baseball/Softball', 'Football', 'Volleyball', 'Tennis', 'Hockey'];

window.SPORTS = [
  {
    id: 'soccer', label: 'Soccer', icon: '⚽',
    categories: ['Warmup', 'Dribbling', 'Passing', 'Receiving', 'Heading', 'Possession', 'Defending',
      'Attacking', 'Shooting', 'Goalkeeping', 'Transition', 'Conditioning', 'Fun',
      '1v1', '2v1', '3v1', '3v2', 'Small-Sided Game'],
  },
  {
    id: 'basketball', label: 'Basketball', icon: '🏀',
    categories: ['Warmup', 'Ball Handling', 'Passing', 'Shooting', 'Finishing', 'Rebounding', 'Footwork',
      'Defense', 'Post Play', 'Transition', 'Team Offense', 'Conditioning', 'Fun',
      '1v1', '2v1', '3v2', 'Small-Sided Game'],
  },
  {
    id: 'softball', label: 'Softball', icon: '🥎',
    categories: ['Warmup', 'Throwing', 'Catching', 'Infield', 'Outfield', 'Hitting', 'Bunting', 'Pitching',
      'Catcher', 'Baserunning', 'Team Defense', 'Conditioning', 'Fun'],
  },
  {
    id: 'baseball', label: 'Baseball', icon: '⚾',
    categories: ['Warmup', 'Throwing', 'Catching', 'Infield', 'Outfield', 'Hitting', 'Bunting', 'Pitching',
      'Catcher', 'Baserunning', 'Team Defense', 'Conditioning', 'Fun'],
  },
  {
    id: 'football', label: 'Football', icon: '🏈',
    categories: ['Warmup', 'Passing', 'Catching', 'Route Running', 'Ball Carrying', 'Ball Security',
      'Blocking', 'Tackling', 'Flag Pulling', 'Coverage', 'Quarterback', 'Agility', 'Special Teams',
      'Conditioning', 'Fun'],
  },
  {
    id: 'adaptive', label: 'Adaptive Sports', icon: '♿',
    categories: ['Warmup', 'Locomotor', 'Balance & Coordination', 'Ball Skills', 'Throwing & Catching',
      'Kicking', 'Striking', 'Following Directions', 'Teamwork', 'Sensory-Friendly', 'Fun', 'Cool Down'],
  },
];
