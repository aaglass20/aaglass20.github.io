-- =====================================================================
--  BDU — The Indy Way drill library: fill in thin details
--
--  Run ONCE in the Supabase SQL Editor:
--  https://supabase.com/dashboard/project/fpnmnlrwhwnuefbnehuf/sql
--
--  1. 32 drills had their whole Setup on one line ("Goal and GK; attacker
--     starts 30 yd out…"). Each is split into separate points so it reads
--     like every other drill. The words are the same; four short setups
--     gained a line (who has a ball, how far apart).
--  2. 24 drills had no skill level. Each gets Beginner, Intermediate or
--     Advanced.
--
--  Safe to run again. A drill is only changed if it still has the
--  one-line Setup / no skill level, so anything edited on the page since
--  is left alone.
-- =====================================================================
update bdu_drills d set setup = v.setup, updated_at = now()
from (values
  ('1v1-recovery-run', 'Goal and GK; attacker starts 30 yd out with the ball; defender starts 3–5 yd behind the attacker',
   array['Goal and GK', 'Attacker starts 30 yd out with the ball', 'Defender starts 3–5 yd behind the attacker']),
  ('2v1-pick-a-side', 'Goal and GK; coach with balls 30 yd out; 2 players side by side at 25 yd; 1 extra player as a supporting attacker',
   array['Goal and GK', 'Coach with balls 30 yd out', '2 players side by side at 25 yd', '1 extra player as a supporting attacker']),
  ('three-station-finishing', 'Goal with GK; three lines 20–25 yd out (left, center, right)',
   array['Goal with GK', 'Three lines 20–25 yd out (left, center, right)']),
  ('three-team-possession', 'Area 25x25 yd; three teams of 3–4 in different colors',
   array['Area 25x25 yd', 'Three teams of 3–4 in different colors']),
  ('rondo-4v4-plus-1-corners', '15x15 yd square; 4v4 inside; one neutral in each corner (or one central neutral +1)',
   array['15x15 yd square', '4v4 inside', 'One neutral in each corner (or one central neutral +1)']),
  ('five-second-counterpress', 'Field 30x40 yd; 2 small goals at each end; two teams of 4–6',
   array['Field 30x40 yd', '2 small goals at each end', 'Two teams of 4–6']),
  ('fifty-touches', 'Groups of 3 in a line: A and C on the ends (25 yd apart), B in the middle',
   array['Groups of 3 with 1 ball', 'Players in a line: A and C on the ends, 25 yd apart, B in the middle', 'A cone at each of the three spots']),
  ('box-to-box-relay', 'Teams of 3–4 in lines; cone 20–30 yd away for each team',
   array['Teams of 3–4 in lines', 'Cone 20–30 yd away for each team']),
  ('continuous-2v2-conditioning', 'Field 20x30 yd with a small goal at each end; teams of 2 waiting at each end line',
   array['Field 20x30 yd with a small goal at each end', 'Teams of 2 waiting at each end line']),
  ('corner-kick-attack', 'Penalty box with a goal and GK; corner taker; attackers and defenders',
   array['Penalty box with a goal and GK', 'Corner taker', 'Attackers and defenders']),
  ('cross-arrive-on-time', 'Goal and GK; wide players at the wings with balls; 2 attackers starting 25 yd out',
   array['Goal and GK', 'Wide players at the wings with balls', '2 attackers starting 25 yd out']),
  ('crossing-2v1-box', 'Goal and GK; winger with balls on each side; 2 attackers vs 1 defender in the box',
   array['Goal and GK', 'Winger with balls on each side', '2 attackers vs 1 defender in the box']),
  ('corner-kick-defense', 'Penalty box with goal and GK; servers taking corners; attackers vs defenders',
   array['Penalty box with goal and GK', 'Servers taking corners', 'Attackers vs defenders']),
  ('fartlek-possession', 'Area 30x30 yd; two teams of 4–6',
   array['Area 30x30 yd', 'Two teams of 4–6']),
  ('gk-distribution-pressure', 'GK in goal; 2 defenders wide at the edge of the box; 1–2 pressing attackers; target gates on the wings and center',
   array['GK in goal', '2 defenders wide at the edge of the box', '1–2 pressing attackers', 'Target gates on the wings and center']),
  ('gk-set-position-footwork', 'Cones in a small arc in front of the goal; coach with balls 6–8 yd out',
   array['Cones in a small arc in front of the goal', 'Coach with balls 6–8 yd out']),
  ('gk-breakaway-1v1', 'Goal with GK; attackers in a line 25 yd out with balls',
   array['Goal with GK', 'Attackers in a line 25 yd out with balls']),
  ('gk-distribution-targets', 'Keeper at the edge of the box; cone gates or teammates at 15, 25, and 40 yd',
   array['Keeper at the edge of the box', 'Cone gates or teammates at 15, 25, and 40 yd']),
  ('gk-scoop-and-cover', 'Keeper in goal or between cones; server 8–10 yd away with balls',
   array['Keeper in goal or between cones', 'Server 8–10 yd away with balls']),
  ('heading-progression', 'Partners 3–4 yd apart; lightweight or size-down balls (or balloons/beach balls first)',
   array['Partners 3–4 yd apart', 'Lightweight or size-down balls (or balloons/beach balls first)']),
  ('interception-game', '20x20 yd box; pairs of passers on opposite sides; 2–3 defenders inside',
   array['20x20 yd box', 'Pairs of passers on opposite sides', '2–3 defenders inside']),
  ('juggling-ladder', 'Each player with a ball in their own space',
   array['Each player with a ball in their own space', 'Spread out so nobody is within 3 yd of another player']),
  ('penalty-shootout-ladder', 'Goal with a penalty spot; everyone in a line',
   array['Goal with a penalty spot', 'Everyone in a line']),
  ('positional-grid-4v4-3', '30x25 yd area; 4v4 inside; 3 neutrals: one on each end line and one central',
   array['30x25 yd area', '4v4 inside', '3 neutrals: one on each end line and one central']),
  ('roly-poly', 'Open grass; each player (or pair) has a ball',
   array['Open grass', 'Each player (or pair) has a ball']),
  ('side-to-side-first-touch', 'Two cones 5 yd apart; server 8 yd in front',
   array['Two cones 5 yd apart', 'Server 8 yd in front']),
  ('simon-says-ball', 'Grid: 15x15 yd; each player with a ball',
   array['Grid: 15x15 yd', 'Each player with a ball']),
  ('three-zone-touch', 'Three side-by-side grids (3x3 yd each) facing a server 8 yd away',
   array['Three side-by-side grids (3x3 yd each) marked with cones', 'The working player starts in the first grid, facing a server 8 yd away', '1 ball per pair']),
  ('throw-head-catch', 'Field 20x30 yd with small goals; two teams of 4–6; lightweight ball',
   array['Field 20x30 yd with small goals', 'Two teams of 4–6', 'Lightweight ball']),
  ('toss-and-head', 'Partners 3–5 yd apart; one ball per pair (a lighter or slightly under-inflated ball is best)',
   array['Partners 3–5 yd apart', 'One ball per pair (a lighter or slightly under-inflated ball is best)']),
  ('two-touch-passing-game', 'Two players 10–12 yd apart with a 2-yd gate of cones in the middle',
   array['Two players 10–12 yd apart', 'A 2-yd gate of cones in the middle between them', '1 ball per pair']),
  ('passing-ladder-two-touch', 'Partners 8–10 yd apart; a line of 3 cones (2 yd apart) on each player''s side to move along',
   array['Partners 8–10 yd apart', 'A line of 3 cones (2 yd apart) on each player''s side to move along'])
) as v(id, old, setup)
where d.id = v.id and d.setup = array[v.old];

update bdu_drills d set skill_level = v.skill, updated_at = now()
from (values
  ('4-person-movement-warmup', 'Beginner'),
  ('circle-passing-warmup', 'Beginner'),
  ('1v1-basic', 'Beginner'),
  ('pass-tap-pass-back', 'Beginner'),
  ('cone-passing', 'Intermediate'),
  ('movement-skill-reset', 'Intermediate'),
  ('gates-competition-passing', 'Beginner'),
  ('long-passes-4', 'Intermediate'),
  ('get-open', 'Beginner'),
  ('gates-competition-dribbling', 'Beginner'),
  ('bumper-keepaway', 'Intermediate'),
  ('across-the-river', 'Intermediate'),
  ('3-team-keepaway', 'Intermediate'),
  ('pierce-the-circle', 'Intermediate'),
  ('block-or-one-time', 'Intermediate'),
  ('closing-fast-shot-fast', 'Intermediate'),
  ('4-point-shooting', 'Advanced'),
  ('3v2-transition', 'Advanced'),
  ('small-sided-4v4', 'Beginner'),
  ('overload-scrimmage', 'Intermediate'),
  ('attack-vs-defense', 'Intermediate'),
  ('scrimmage-7v7', 'Intermediate'),
  ('scrimmage-9v9', 'Intermediate'),
  ('scrimmage-11v11', 'Advanced')
) as v(id, skill)
where d.id = v.id and d.skill_level = '';
