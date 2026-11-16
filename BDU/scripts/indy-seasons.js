// The Indy Way — season plans (shown on indy-season-plan.html).
//
// A season plan lays the weekly programs (scripts/indy-programs.js) out across a year for one
// age group: six 4-week blocks, two focused sessions a week.
//   Session A = the block's main program · Session B = its second program
// A block is { name, when, a: program id, b: program id, why }.
// "keepers" lists the blocks (1–6) where the goalkeeping program runs beside team practice.
//
// To change a season, edit this file, then run:  node BDU/scripts/check-programs.mjs
// See BDU/INDY-WAY.md → "Season plans".
(function () {
  const BLOCKS = [
    ['Pre-season', 'Weeks 1–4 · the month before the first game'],
    ['Early season', 'Weeks 5–8'],
    ['Mid-season', 'Weeks 9–12'],
    ['Winter / indoor', 'Weeks 13–16'],
    ['Spring start', 'Weeks 17–20'],
    ['Spring finish', 'Weeks 21–24'],
  ];
  const season = (age, label, summary, sessions, keeperProgram, keeperBlocks, rows) => ({
    age, label, summary, sessions, keeperProgram, keeperBlocks,
    blocks: rows.map(([a, b, why], i) => ({ name: BLOCKS[i][0], when: BLOCKS[i][1], a, b, why })),
  });

  window.INDY_SEASONS = [
    season('U8', 'U8–U9', 'The ball first, and fun first. The year is built on dribbling, passing and shooting; tactics are no more than "go to goal" and "get it back".',
      'Two 60-minute sessions a week. With one session a week, run Session A only.', 'goalkeeping-u8', [4], [
        ['dribbling-u8', 'fitness-u8', 'Start with a ball at every foot and lots of movement. Confidence comes before everything else.'],
        ['passing-u8', 'compete-u8', 'Add a teammate (passing) and a defender (being brave with the ball).'],
        ['finishing-u8', 'defending-u8', 'Games are under way: learn to score, and to get the ball back.'],
        ['possession-u8', 'transition-u8', 'Indoor months suit small spaces: keeping the ball and reacting when it changes hands. The keeper block lets everyone try goal.'],
        ['dribbling-u8', 'restarts-u8', 'Second time through dribbling — use the Harder variations — plus throw-ins and free kicks before spring games.'],
        ['finishing-u8', 'compete-u8', 'Finish the year scoring goals and competing. Repeat programs with the Harder variations.'],
      ]),
    season('U10', 'U10', 'The foundation year: technique in every session, with 1v1 play and the first team ideas (spacing, support, basic positions) layered on.',
      'Two 60-minute sessions a week.', 'goalkeeping-u10', [2, 5], [
        ['passing-u10', 'fitness-u10', 'Sharpen the first touch and set a fitness starting point to beat later.'],
        ['dribbling-u10', 'possession-u10', 'Beat a player, then learn to keep the ball as a team.'],
        ['finishing-u10', 'defending-u10', 'Both ends of the field: shoot early, and defend your goal the right way.'],
        ['compete-u10', 'restarts-u10', 'Indoor months: win your 1v1, and learn every player\'s job at restarts.'],
        ['transition-u10', 'crossing-u10', 'React in three seconds, and start using the wide areas.'],
        ['dribbling-u10', 'finishing-u10', 'Second time through the two that matter most at this age. Use the Harder variations.'],
      ]),
    season('U12', 'U11–U12', 'Technique and tactics in balance. Players learn to keep the ball to go forward, defend in pairs, and finish moves at game speed.',
      'Two or three 75-minute sessions a week. With a third session, repeat the block\'s Session A or play a scrimmage.', 'goalkeeping-u12', [2, 5], [
        ['passing-u12', 'fitness-u12', 'Speed of play and an engine to sustain it.'],
        ['possession-u12', 'defending-u12', 'The two team ideas of the year: play through pressure, and pressure-cover-balance.'],
        ['finishing-u12', 'compete-u12', 'Turn possession into goals, and win the ball back to get more of it.'],
        ['dribbling-u12', 'transition-u12', 'Indoor months: take players on, and attack fast after a regain.'],
        ['crossing-u12', 'restarts-u12', 'Wide play and rehearsed restarts before the spring season.'],
        ['possession-u12', 'finishing-u12', 'Second time through, at a higher tempo. Use the Harder variations.'],
      ]),
    season('U14', 'U13–U14', 'The 11v11 years. Team shape, pressing and transition take the lead; technique work becomes position-specific.',
      'Three 90-minute sessions a week: Session A, Session B, and a third for position work and a full scrimmage.', 'goalkeeping-u14', [2, 5], [
        ['possession-u14', 'fitness-u14', 'Establish how the team plays with the ball, and get match fit.'],
        ['defending-u14', 'passing-u14', 'How the team defends as a unit, with passing quality to keep the ball once it is won.'],
        ['transition-u14', 'finishing-u14', 'Win it and punish the turnover; finish like your position.'],
        ['dribbling-u14', 'compete-u14', 'Off-season edge: win the 1v1 in the final third and compete for every ball.'],
        ['restarts-u14', 'crossing-u14', 'Restarts and wide service — where a lot of goals come from at this level.'],
        ['defending-u14', 'finishing-u14', 'Second time through the two that decide tight games.'],
      ]),
    season('U16', 'U15–U18 · High school', 'Performance. The team chooses how it plays and executes under pressure: game management, pressing, set pieces.',
      'Three or four 90-minute sessions a week. High school players: use these blocks around the school season.', 'goalkeeping-u14', [2, 5], [
        ['possession-u16', 'fitness-u14', 'Set the tempo with the ball and reach match fitness before the first game.'],
        ['defending-u16', 'transition-u16', 'How we defend — press, block or drop — and how we control both transitions.'],
        ['restarts-u14', 'finishing-u16', 'Own the restarts and take the decisive chance.'],
        ['passing-u14', 'dribbling-u14', 'Off-season: individual quality — precision passing and winning the 1v1.'],
        ['compete-u16', 'crossing-u14', 'Impose your game physically, and win the wide areas and the air.'],
        ['transition-u16', 'restarts-u14', 'Tournament and playoff preparation: the moments that decide knockout games.'],
      ]),
  ];
})();
