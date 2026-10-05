-- ============================================================
-- Empower Sports Playbook — Seed: Built-in Drills
-- Migration: 002_seed_drills.sql
--
-- Seeds all built-in DRILL_BANK drills from practice-builder.html.
-- source='builtin' — appear in Drill Library, cannot be deleted.
--
-- SAFE TO RE-RUN: uses ON CONFLICT DO UPDATE.
-- Run AFTER 001_initial_schema.sql.
-- ============================================================

-- ── Soccer (29 drills) ───────────────────────────

-- Ball Touch Station
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-soc-touch-ball',
  'soccer',
  'Ball Control',
  '🦶',
  'Ball Touch Station',
  'Foot-skill fundamentals — sole taps, rolls, and tick tocks in place.',
  'The more we touch the ball with our feet, the better our feet learn it. Lots of touches make soccer easier!',
  'Celebrate any ball contact as a win. For wheelchair participants, use hands or a ramp assist — any interaction counts!',
  'Demo each move slowly before participants try. Keep transitions between moves quick so everyone stays active.',
  ARRAY['⚽ Soccer balls (1 per player)'],
  '[{"icon":"⚽","text":"Sole Taps — tap the top of the ball alternating feet while stationary","tag":"skill"},{"icon":"↔️","text":"Side-to-Side Rolls — roll ball left and right with sole of foot"},{"icon":"🔵","text":"Toe-Ball-Toe — push ball forward with toe, pull back with sole, repeat in place"},{"icon":"🕰️","text":"Tick Tocks — tap ball back and forth between the insides of both feet, like a clock swinging","tag":"skill"},{"icon":"🌟","text":"BDU players demo first, then guide their partner through each move"}]'::jsonb,
  12,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Dribbling Agility Course
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-soc-drb-agility',
  'soccer',
  'Dribbling',
  '🔶',
  'Dribbling Agility Course',
  'Cones, ladders, and hurdles as an obstacle course — go through without ball first, then dribble.',
  'Dribbling through obstacles teaches our feet and eyes to work together — the same way we navigate defenders in a real game!',
  'Let participants run through without a ball first — removes dual-task pressure and builds spatial confidence.',
  'Set up multiple parallel courses so players aren''t waiting. Widen the course for beginners.',
  ARRAY['⚽ Soccer balls', '🔶 Cones', '🪜 Agility ladders or hurdles'],
  '[{"icon":"🔶","text":"Set up cones, ladders, or low hurdles in a course","tag":"skill"},{"icon":"🚶","text":"Players walk the path without a ball first to learn the layout"},{"icon":"⚽","text":"Then dribble through at their own pace — no timer, no pressure"},{"icon":"🌟","text":"BDU player runs alongside and celebrates each section completed"}]'::jsonb,
  12,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Dribble to Music
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-soc-drb-music',
  'soccer',
  'Dribbling',
  '🎵',
  'Dribble to Music',
  'Dribble freely while music plays — freeze and stop the ball when the music cuts.',
  'Music makes soccer fun! Freezing helps us learn to stop the ball fast — like when a coach yells STOP!',
  'Have your phone/speaker ready with 3-4 upbeat songs. Pause without warning so the freeze is a surprise every time.',
  'Vary the pause length — sometimes pause immediately, sometimes let it play longer. Shorter pauses build quicker reactions.',
  ARRAY['⚽ Soccer balls', '🔊 Speaker / music'],
  '[{"icon":"🎶","text":"Dribble on the Beat — dribble the ball around the space while music plays","tag":"fun"},{"icon":"🛑","text":"Freeze! — when the music stops, freeze your body AND stop the ball with your foot"},{"icon":"🐢","text":"Mix it up — slow songs = slow dribble, fast songs = quick feet"},{"icon":"🎉","text":"BDU players dribble too and freeze big and silly","tag":"team"}]'::jsonb,
  12,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Cone Dribbling Course
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-soc-drb-cone-course',
  'soccer',
  'Dribbling',
  '🌀',
  'Cone Dribbling Course',
  'Three side-by-side courses at increasing difficulty — participants choose their level.',
  'Dribbling through cones teaches our feet to control the ball while moving — the same skill real soccer players use to get past defenders!',
  'Set up all 3 courses before the session starts. Letting participants choose removes the fear of failure from the start.',
  'Walk each course yourself so volunteers understand the difficulty levels. Adjust cone spacing based on the group.',
  ARRAY['⚽ Soccer balls', '🔶 Cones (many — 3 parallel courses)'],
  '[{"icon":"🔶","text":"Set up 3 courses side by side: wide weave (easy), tight weave (harder), hoop course (dribble in, stop inside hoop)","tag":"skill"},{"icon":"⚽","text":"BDU player demos first, then participant picks their course — choice builds confidence"},{"icon":"⬆️","text":"Encourage moving up to the next course if they''re ready"},{"icon":"🏅","text":"Cheer loudly every time they reach the end!"}]'::jsonb,
  12,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Red Light / Green Light
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-soc-drb-red-green',
  'soccer',
  'Dribbling',
  '🚦',
  'Red Light / Green Light',
  'Color-coded dribbling commands — including a Color Dot variation for extra challenge.',
  'Learning to stop the ball quickly is one of the most important skills in soccer. When we control where the ball goes AND when it stops, we control the game!',
  'Call colors loudly and with energy. Give extra praise for clean stops — that''s the key skill.',
  'For the dot variant: keep dots close so nobody travels far. Vary the cadence of commands to keep players alert.',
  ARRAY['⚽ Soccer balls', '🟡 Colored spot markers'],
  '[{"icon":"🟢","text":"Green Light — dribble forward!","tag":"skill"},{"icon":"🔴","text":"Red Light — stop the ball with your sole (no hands)"},{"icon":"🟡","text":"Yellow Light — dribble in tiny circles"},{"icon":"💙","text":"Blue Light (bonus BDU round) — dribble backwards!"},{"icon":"🔵","text":"Color Dot variant: scatter multi-colored spot markers. Call a color (\"Go to RED!\") and everyone dribbles to that dot.","tag":"skill"},{"icon":"🎉","text":"BDU players play too — make it a shared experience","tag":"team"}]'::jsonb,
  12,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Make Your Move
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-soc-drb-make-move',
  'soccer',
  'Dribbling',
  '🌀',
  'Make Your Move',
  'Dribble toward a passive BDU "defender," pick one of 4 skill moves, execute it, then shoot.',
  'Real soccer players use moves to get past defenders — and now you know four of them! Pick the one that feels right for YOU. That''s what makes it YOUR move.',
  'The BDU "defender" should be completely passive — just standing still, maybe waving arms slowly. Never block or challenge — the goal is success every time. The head fake works great for wheelchair participants — no footwork needed.',
  'Let participants choose their move freely; ownership builds confidence. The 4 moves: Rollover (sole rolls ball sideways), Feint (lean hard one way, push off the other), Outside Tap (outside of foot past defender), Head Fake (look one way, go the other — works from a wheelchair).',
  ARRAY['⚽ Soccer balls', '🔶 Cones'],
  '[{"icon":"🎩","text":"BDU player demos all 4 moves first — slow and clear, one at a time. Participant picks their favorite","tag":"skill"},{"icon":"🦶","text":"Dribble toward the standing BDU \"defender,\" slow down, pull off the move — then shoot into the open goal!","tag":"skill"},{"icon":"🔁","text":"Every player gets multiple turns — try a different move each round","tag":"fun"},{"icon":"🎉","text":"Whole group cheers when someone pulls it off — \"That''s a REAL soccer move!\"","tag":"team"}]'::jsonb,
  12,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Passing Lines
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-soc-pas-lines',
  'soccer',
  'Passing',
  '↔️',
  'Passing Lines',
  'Two facing lines, one ball. Pass across and go to the back of the opposite line — constant rotation.',
  'Passing while moving is how real soccer works — this drill gets our feet and brains working together in real time!',
  'Keep lines short — longer lines mean too much waiting. 3-4 players per line max.',
  'Position yourself at one end to cue the pace and watch for form. Slow it down if passes are consistently off target.',
  ARRAY['⚽ Soccer balls'],
  '[{"icon":"🤝","text":"Two facing lines with one ball. First player passes to the front of the opposite line","tag":"skill"},{"icon":"🔁","text":"After passing, go to the back of the opposite line — constant movement"},{"icon":"📢","text":"Call \"Ready!\" before passing so the receiver is prepared"},{"icon":"💬","text":"BDU players celebrate every clean pass out loud"}]'::jsonb,
  12,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Partner Passing
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-soc-pas-partner',
  'soccer',
  'Passing',
  '🎯',
  'Partner Passing',
  'Partners facing each other — inside-of-foot passes, start close and build distance.',
  'Soccer is a team sport. Passing is how we share the ball with our friends and help them score!',
  'Adjust distance based on each participant''s ability. Closer is always fine — the goal is connection and touch, not distance.',
  'Station yourself between pairs to provide cues. Keep both partners moving — even the waiting partner should be lightly bouncing or engaged.',
  ARRAY['⚽ Soccer balls'],
  '[{"icon":"🟡","text":"Close Passes — 3-4 feet apart, inside-of-foot passes. Focus on stopping the ball.","tag":"skill"},{"icon":"📏","text":"Step Back — after 3 successful passes, each pair takes one step back. How far can you go?"},{"icon":"💬","text":"Encourage cheering between pairs — \"Great pass!\", \"You''ve got this!\""}]'::jsonb,
  12,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Passing Combinations
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-soc-pas-combinations',
  'soccer',
  'Passing',
  '🔁',
  'Passing Combinations',
  'Triangle passing + 1-2 wall pass combos — call names, move to space, finish on goal.',
  'Passing is how we talk on the soccer field. When we pass to a teammate, we''re saying "I see you and I trust you!" — and that makes the whole team better.',
  'Calling names builds connection. Participants will light up when their name is called before a pass!',
  'Triangle setup: 3 cones 5-8 ft apart. Rotate who plays which cone so everyone practices both sending and receiving.',
  ARRAY['⚽ Soccer balls', '🔶 Cones'],
  '[{"icon":"🔁","text":"Triangle Passing — 3-person triangles, pass and move to the open cone","tag":"skill"},{"icon":"📢","text":"Call name before passing — \"Sarah!\" then kick"},{"icon":"💛","text":"1-2 Combo — pass to BDU player, get it back (wall pass), then shoot. Simple but empowering!","tag":"skill"}]'::jsonb,
  12,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Pass to Shot
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-soc-sht-pass',
  'soccer',
  'Shooting',
  '⚡',
  'Pass to Shot',
  'Two lines in front of goal — one passes, the other receives, first-touches, and shoots.',
  'Scoring in a real game always comes after a pass. This drill ties the two together so the finish feels natural!',
  'Celebrate every shot regardless of outcome. The habit of shooting confidently matters more than accuracy.',
  'Keep the goal close for beginners. Position a volunteer at goal to return balls quickly and keep the pace up.',
  ARRAY['⚽ Soccer balls', '🥅 Goal'],
  '[{"icon":"🏃","text":"Two lines face each other in front of goal","tag":"skill"},{"icon":"⚽","text":"First player in line A passes to first player in line B"},{"icon":"🥅","text":"Line B player takes a first touch and shoots on goal","tag":"skill"},{"icon":"🎉","text":"Celebrate every shot — makes AND misses get the same energy!"}]'::jsonb,
  12,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Dribble to Shot
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-soc-sht-dribble',
  'soccer',
  'Shooting',
  '🏃',
  'Dribble to Shot',
  'Single line — each player dribbles through a small cone obstacle then shoots on goal.',
  'In real soccer, you dribble to create space, then shoot — this drill connects those two moments naturally!',
  'Keep the goal close and cones forgiving. Narrate every touch with energy.',
  'Run parallel lines if you have enough goals/cones so players aren''t waiting long.',
  ARRAY['⚽ Soccer balls', '🔶 Cones', '🥅 Goal'],
  '[{"icon":"🔶","text":"Set up a simple cone obstacle in front of goal — 2-3 cones is plenty","tag":"skill"},{"icon":"⚽","text":"Player dribbles through at their own pace"},{"icon":"🥅","text":"Shoot on goal at the end — any foot, any style","tag":"skill"},{"icon":"🌟","text":"BDU player narrates every touch: \"Great dribble! What a shot!\""}]'::jsonb,
  12,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Penalty Shooting
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-soc-sht-penalty',
  'soccer',
  'Shooting',
  '🎯',
  'Penalty Shooting',
  'Line up at the penalty spot — each player shoots while the keeper dives dramatically the wrong way.',
  'Shooting confidence comes from repetition. Every goal scored in practice makes the next one feel easier and more natural!',
  'The sillier the keeper dive, the better. Every participant should feel like a superstar scorer.',
  'Let the keeper be dramatic about saves they miss — it''s hilarious and empowering for the shooter! Move the shooting line closer for participants who need it.',
  ARRAY['⚽ Soccer balls', '🥅 Goal'],
  '[{"icon":"⚽","text":"Players line up at the penalty spot (or closer for beginners)","tag":"skill"},{"icon":"🤡","text":"BDU player is the \"silly goalkeeper\" — always dives the wrong way, always misses dramatically"},{"icon":"🥅","text":"Player shoots — any style, any power","tag":"skill"},{"icon":"🎉","text":"Crowd goes WILD for every single goal","tag":"team"},{"icon":"🔁","text":"Every player shoots multiple times — keep the line moving and the energy high"}]'::jsonb,
  12,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Pass & Finish
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-soc-sht-pass-finish',
  'soccer',
  'Shooting',
  '🎯',
  'Pass & Finish',
  'BDU players spread at 3–4 angles around goal — participant receives a pass and shoots first or second touch.',
  'In a real game, almost every goal starts with a pass. When we receive the ball and shoot right away, we''re doing exactly what happens in a real game!',
  'Keep passes slow, on the ground, and aimed right at the participant''s feet. Start with straight-on passes before adding angles.',
  'For wheelchair or low-mobility participants, have the BDU player place the ball one step in front of them — still counts as a receive!',
  ARRAY['⚽ Soccer balls', '🥅 Goal'],
  '[{"icon":"📍","text":"BDU players spread out at 3–4 spots around the goal — left side, right side, straight ahead","tag":"skill"},{"icon":"🤝","text":"BDU player passes to the participant, who receives and shoots first or second touch"},{"icon":"🔁","text":"Rotate which BDU player serves — each angle is a new challenge"},{"icon":"🌟","text":"Participants who need more time: BDU player sets the ball still so they can walk up and finish"},{"icon":"🎉","text":"Celebrate every finish — the receive AND the shot","tag":"team"}]'::jsonb,
  12,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Knock It Down
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-soc-sht-knock-down',
  'soccer',
  'Shooting',
  '🎳',
  'Knock It Down',
  'Stack foam pins inside the goal — each player gets 3 kicks to knock as many down as possible.',
  'Real shooting is about aiming — hitting what you''re looking at. When we knock those pins down, our brain is learning to aim the ball exactly where we want it!',
  'Place pins close together and close to the shooter — big satisfying crash on contact. Any contact counts.',
  'Foam pins are safer and easier to reset than anything rigid. For wheelchair or low-mobility participants, rolling or pushing the ball along the ground counts fully.',
  ARRAY['⚽ Soccer balls', '🥅 Goal', '🎳 Foam cones or plastic bottles'],
  '[{"icon":"🔶","text":"Stack 5–6 foam cones or plastic bottles inside the goal mouth as \"pins\"","tag":"fun"},{"icon":"⚽","text":"Each player gets 3 kicks — how many pins can they knock over?","tag":"skill"},{"icon":"🎉","text":"BDU player counts and celebrates every pin out loud — \"That''s 4! That''s a STRIKE!\"","tag":"team"},{"icon":"🔁","text":"Reset fast and rotate — every player gets multiple rounds"},{"icon":"🌟","text":"Try to beat your own record each round — personal best is the goal"}]'::jsonb,
  12,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Call Your Shot
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-soc-sht-call-shot',
  'soccer',
  'Shooting',
  '🌈',
  'Call Your Shot',
  'Goal divided into 3 colored zones — BDU calls a color, participant aims for that zone and shoots.',
  'In a real game, a good shooter picks a spot BEFORE they kick — they don''t just blast it and hope. Calling your shot is what makes the difference!',
  'If a participant struggles to aim, physically point at the target zone and say "kick it there!" — visual + verbal cues work best.',
  'Keep the goal close and zones wide — success rate matters more than difficulty. Zones can be marked with pinnies draped over the posts.',
  ARRAY['⚽ Soccer balls', '🥅 Goal', '📌 Colored pinnies (3 colors)'],
  '[{"icon":"🎨","text":"Divide the goal into 3 zones using colored pinnies or cones: Left (🔵), Middle (🟡), Right (🔴)","tag":"skill"},{"icon":"📢","text":"BDU player calls a color — \"BLUE!\" — participant aims for that zone and shoots"},{"icon":"🥅","text":"Any ball in the right zone is a WIN — distance and power don''t matter","tag":"skill"},{"icon":"🎉","text":"Hit the zone? Everyone celebrates — \"Called it AND scored!\"","tag":"team"},{"icon":"⬆️","text":"Ready for more? Participant calls their OWN color before kicking","tag":"fun"}]'::jsonb,
  12,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Goalie Introduction
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-soc-gk-intro',
  'soccer',
  'Goalkeeping',
  '🧤',
  'Goalie Introduction',
  'Scoop catches, 3-step sequence, and gentle saves — making every participant feel like a hero.',
  'Every team needs a goalkeeper — the hero who protects the net! Scooping and catching builds the bravery goalkeepers use in every real game!',
  'Keep shots gentle, slow, and aimed right at the participant — say "it''s coming to YOU!" first. Any stop counts: foot, hand, body block.',
  'For wheelchair participants, a hand stop or lean-in is a full save. Never rush progression — stay at each step until the participant is comfortable.',
  ARRAY['⚽ Soccer balls', '🔶 Cones (5)', '🥅 Goal'],
  '[{"icon":"🔶","text":"Cone Gap Warmup — 5 cones in a row with a gap between each. BDU player rolls ball slowly through each gap","tag":"skill"},{"icon":"🙌","text":"Participant scoops the ball as it rolls through — any method: two hands, one hand, arms cradle"},{"icon":"⬆️","text":"3-step sequence (when ready): bounce once → basket catch (arms wide) → full catch with both hands","tag":"skill"},{"icon":"🥅","text":"Light Saves — participant in front of goal while BDU player rolls a gentle ball toward the net","tag":"skill"},{"icon":"🛑","text":"Stop it any way you can — foot, hands, body. Every stop is a SAVE! Celebrate huge.","tag":"team"},{"icon":"📈","text":"Progression (if ready): BDU volunteer takes a soft kick-shot. Announce \"here it comes!\" first","tag":"fun"}]'::jsonb,
  12,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Dribble, Pass, Score!
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-soc-ml-dps',
  'soccer',
  'Multi-Skill',
  '🥅',
  'Dribble, Pass, Score!',
  'Player dribbles to a middle cone, passes to a BDU partner, then runs onto the set-up ball and shoots.',
  'Real soccer is dribble, then pass, then shoot — all together! This is how goals happen in a real game.',
  'Keep the goal close and the pass short. Every touch is a win — narrate it: "Great dribble! Nice pass! What a shot!"',
  'Have one BDU player stationed as the "setter" so participants can focus on their own run. Rotate that role every few turns.',
  ARRAY['⚽ Soccer balls', '🔶 Cones', '🥅 Small goal'],
  '[{"icon":"🌀","text":"Player dribbles from a start cone toward a middle cone","tag":"skill"},{"icon":"🤝","text":"At the middle cone, pass across to a BDU partner waiting on the side"},{"icon":"🥅","text":"Partner sets the ball up — player runs onto it and shoots into a small goal","tag":"skill"},{"icon":"🔁","text":"Every player gets several turns — rotate quickly, cheer every shot"}]'::jsonb,
  15,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Gate Goals → Shoot!
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-soc-ml-gates',
  'soccer',
  'Multi-Skill',
  '🚪',
  'Gate Goals → Shoot!',
  'Dribble through your assigned number of mini-gates, then finish on goal — dribbling with purpose.',
  'Real soccer is all about moving with the ball, finding space, and then finishing. Gates teach us to dribble with a purpose — and the shot at the end makes it feel just like a real game!',
  'Tune the number to each participant — 1 or 2 gates for beginners, 4-5 for confident dribblers. Keep the shot close to goal.',
  'BDU players count out loud so the whole space feels alive with energy. Keep gates spread so participants aren''t crowding each other.',
  ARRAY['⚽ Soccer balls', '🔶 Cones (gate pairs)', '🥅 Goal'],
  '[{"icon":"🔵","text":"Set up 6-8 pairs of cones as mini gates scattered near a real goal","tag":"skill"},{"icon":"🔢","text":"Give each participant a number — \"Your number is 3!\" — that''s how many gates to dribble through before shooting","tag":"fun"},{"icon":"⚽","text":"Participant dribbles through their gates in any order — BDU player counts aloud: \"1… 2… 3…\""},{"icon":"🥅","text":"Hit their number → BDU player calls \"SHOOT!\" → participant finishes on goal","tag":"skill"},{"icon":"🎉","text":"Whole group erupts for every goal — BDU players are the full hype squad","tag":"team"},{"icon":"⬆️","text":"Increase the number for confident participants — can you hit 5 gates before you shoot?"}]'::jsonb,
  12,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Team Challenges
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-soc-tm-team-challenges',
  'soccer',
  'Teamwork',
  '🎮',
  'Team Challenges',
  'Relay races and combined-pass target practice — silly rules, multiplier scoring, big team energy.',
  'Teamwork means working together to get something done. When we cheer each other on and celebrate together, we all get better — that''s how teams win!',
  'Lean into the silly relay rules — the sillier the better. Laughter is teamwork too.',
  'For the multiplier game, have BDU players count passes out loud so the whole group feels the build-up energy before each shot.',
  ARRAY['⚽ Soccer balls', '🔶 Cones', '🥅 Goal'],
  '[{"icon":"🏁","text":"Relay Race — dribble to cone and back, tag next teammate. Silly rules: weak foot only, hop, etc.","tag":"fun"},{"icon":"🎯","text":"Team Target Practice — team combines passes before shooting; each touch adds a multiplier to the goal","tag":"team"},{"icon":"📸","text":"Encourage BDU players to cheer for other teams too — model good sportsmanship"}]'::jsonb,
  12,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Build-a-Goal
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-soc-tm-build-goal',
  'soccer',
  'Teamwork',
  '🏗️',
  'Build-a-Goal',
  'Team must complete 3 passes before anyone can shoot — every person who touches the ball owns the goal.',
  'In real soccer, the best goals are built by the whole team — pass by pass. When everyone touches the ball before the shot, everyone owns the goal!',
  'Keep the passing area small and the goal close — this isn''t about athleticism, it''s about connection. BDU players counting aloud keeps energy up.',
  'If a pass chain breaks, reset with no pressure and try again. The rule is the fun — not a test to fail.',
  ARRAY['⚽ Soccer balls', '🥅 Goal'],
  '[{"icon":"📏","text":"Simple rule: complete 3 passes before anyone shoots — every touch must go to a different person","tag":"team"},{"icon":"🤝","text":"BDU players count the passes out loud as a group: \"One… two… THREE — SHOOT!\"","tag":"skill"},{"icon":"🥅","text":"When the shot goes in, the whole team scored that goal — not just the shooter","tag":"team"},{"icon":"⬆️","text":"Feeling it? Bump to 4 or 5 passes before the shot — how connected can the team get?","tag":"fun"},{"icon":"🎉","text":"Celebrate every successful pass chain AND every goal — both are wins"}]'::jsonb,
  12,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Calling All Teammates
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-soc-tm-calling',
  'soccer',
  'Teamwork',
  '📣',
  'Calling All Teammates',
  'Three balls in play — you can only receive a pass if you communicate for it first. Any signal counts.',
  'Great teammates communicate with each other! Your voice, your hands, your signal — whatever works for YOU — is how your teammates know you''re there!',
  'Any form of communication counts — voice, gesture, wave, noise, raised hand, eye contact, tapping someone''s arm. Celebrate every form of asking equally.',
  'BDU players should model a variety of signals first so participants see that no single style is "right." The goal is connection, not volume.',
  ARRAY['⚽ Soccer balls (3 in play)'],
  '[{"icon":"⚽","text":"Three balls in play at once across the team — controlled chaos!","tag":"fun"},{"icon":"📢","text":"Rule: you can only receive a pass if you communicate for the ball first — voice, wave, gesture, clap, point, or tap","tag":"team"},{"icon":"🌟","text":"BDU players model it first — shout it, wave it, sign it — so everyone sees there''s no one right way to ask","tag":"fun"},{"icon":"🎯","text":"The clearest communicator gets the ball — every style of asking counts equally","tag":"skill"},{"icon":"🎉","text":"Celebrate every signal just as much as every goal — the communication IS the skill here","tag":"team"}]'::jsonb,
  12,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Everybody Scores
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-soc-gm-everybody-scores',
  'soccer',
  'Game',
  '⭐',
  'Everybody Scores',
  'Small-sided game where every player on the team must score before the team can win.',
  'Games are the fun part of soccer! We use everything we learned — touching, dribbling, passing, and scoring — and we cheer for our team!',
  'Celebrate both teams equally — every goal from either side gets the same cheer.',
  'Best with the Advanced group. The "everybody scores" rule naturally creates dramatic and inclusive moments.',
  ARRAY['⚽ Soccer balls', '🥅 Small goals (2)'],
  '[{"icon":"🔵","text":"Pick a size based on numbers (3v3, 5v5, or 7v7). Small goals, no goalkeeper. Every player must score before the team can win","tag":"team"},{"icon":"🎉","text":"BDU players celebrate every goal (for either team!) with maximum energy"},{"icon":"🤝","text":"Rotate BDU players onto both teams to keep numbers even and energy high"},{"icon":"⏱️","text":"Short games with quick restarts — keep it moving and upbeat"}]'::jsonb,
  17,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Hungry Hungry Hippos
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-soc-gm-hungry-hippos',
  'soccer',
  'Game',
  '🦛',
  'Hungry Hungry Hippos',
  'Ball pile in the center — pick one, do a skill, then dribble or pass it to your goal.',
  'Games are the fun part of soccer! We use everything we learned — touching, dribbling, passing, and scoring — and we cheer for our team!',
  'Keep the skill simple and change it each round. The goal is lots of ball touches with a fun finish — not perfection!',
  'Best with the Beginners group. As soon as all balls are scored, cheer loudly and reset immediately to keep momentum.',
  ARRAY['⚽ Soccer balls (many)', '🥅 Goals (2)'],
  '[{"icon":"🥅","text":"Two goals on each end. Pile all balls in the middle of the space","tag":"fun"},{"icon":"🦶","text":"Player picks a ball and does a skill first — BDU player calls one (toe taps, sole rolls, tick tocks)","tag":"skill"},{"icon":"⚽","text":"Then dribble or pass the ball into their goal — any style, any speed"},{"icon":"🔁","text":"Repeat until all balls are gone — each new ball gets a different skill called out"},{"icon":"🎉","text":"Count the goals out loud together as a team — how many did we get?!","tag":"team"}]'::jsonb,
  17,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Treasure Hunt Dribble
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-soc-gm-treasure-hunt',
  'soccer',
  'Game',
  '🏴‍☠️',
  'Treasure Hunt Dribble',
  'Collect treasure (balls) from the center pile by dribbling them one at a time to your team''s chest.',
  'In a real game, everything comes together — dribbling, controlling, moving. This is our chance to use every skill we practiced today!',
  'No wrong speed, no wrong style — any dribble counts. Narrate every single ball like it''s the winning goal!',
  'Best with the Beginners group. The treasure framing is engaging and removes intimidation around goals/scoring.',
  ARRAY['⚽ Soccer balls (many)', '🔶 Cones'],
  '[{"icon":"💰","text":"Pile all balls in the center — that''s the treasure!","tag":"fun"},{"icon":"⚽","text":"Players dribble one ball at a time from the pile to their team''s \"treasure chest\" (goal or cone area)","tag":"skill"},{"icon":"🔁","text":"Return to the pile and get another — keep going until all treasure is collected"},{"icon":"📢","text":"BDU player counts aloud and cheers every delivery: \"That''s 4 gold coins!\"","tag":"team"}]'::jsonb,
  17,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Construction Zone
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-soc-gm-construction',
  'soccer',
  'Game',
  '🚧',
  'Construction Zone',
  'Cones scattered randomly — dribble around knocking them all over, then reset and repeat.',
  'Free-form dribbling in all directions builds real ball confidence — soccer requires changing direction on the fly!',
  'Coaches may reset cones during play to keep it continuous and exciting.',
  'Time each round and celebrate new "records." The unpredictability keeps all skill levels engaged.',
  ARRAY['⚽ Soccer balls', '🔶 Cones (many)'],
  '[{"icon":"🔶","text":"Scatter cones and pylons randomly across the field","tag":"fun"},{"icon":"⚽","text":"Every player dribbles around knocking cones over — any direction, any pace"},{"icon":"🔁","text":"Once all cones are down, BDU players reset and do it again"},{"icon":"🏅","text":"Count how fast the whole team can knock them all down!"}]'::jsonb,
  12,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Longest Shot Competition
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-soc-gm-longest',
  'soccer',
  'Game',
  '📏',
  'Longest Shot Competition',
  'Shoot from the same starting line — after each round the line moves back one step.',
  'Shooting power and confidence from distance — and it teaches players to aim, not just kick hard!',
  'Make a huge deal of every distance marker — "Can you score from HERE?!"',
  'Don''t move the line back until most players have succeeded at the current distance. The goal is confidence, not failure.',
  ARRAY['⚽ Soccer balls', '🥅 Goal'],
  '[{"icon":"⚽","text":"All players line up at the same starting distance from goal","tag":"skill"},{"icon":"📏","text":"Everyone shoots — celebrate every goal loudly!"},{"icon":"⬅️","text":"After each round, the line moves back one big step"},{"icon":"🏆","text":"See how far back the group can score from — make a HUGE deal of every new \"long shot\" goal"}]'::jsonb,
  12,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Scrimmage
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-soc-gm-scrimmage',
  'soccer',
  'Game',
  '🏟️',
  'Scrimmage',
  '5-7 ES players + 1-2 peer volunteers per team. Coaches on field with both teams at all times.',
  'This is what soccer is all about — playing together, competing with heart, and cheering for everyone on the field!',
  'Celebrate both teams equally — every goal from either side gets the same cheer.',
  'Keep the rotation fair and the energy high. The goal isn''t a final score — it''s that every participant walks off feeling like an All-Star.',
  ARRAY['⚽ Soccer balls', '🥅 Goals (2)', '📌 Pinnies (team colors)'],
  '[{"icon":"⚖️","text":"Divide into 2 balanced teams — sprinkle BDU volunteers evenly across both","tag":"team"},{"icon":"🔄","text":"Rotate players every 10-12 minutes so everyone gets quality field time"},{"icon":"🌟","text":"BDU players on the sideline cheer loudly for both teams — no silent subs"},{"icon":"🎉","text":"Celebrate every goal, every save, every great pass — ALL of it counts","tag":"team"}]'::jsonb,
  40,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Ready, Aim, Fire!
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-soc-gm-ready-aim-fire',
  'soccer',
  'Game',
  '🔫',
  'Ready, Aim, Fire!',
  '4 teams line up, director calls "Ready… Aim… FIRE!" and all four shoot simultaneously at one dramatic keeper.',
  'This is the firing squad — and the goalkeeper has NO chance! All that shooting practice leads to this — let it ALL go. Ready… Aim… FIRE!',
  'Set balls up for participants who need it before calling "Ready." Keep the call slow and dramatic to build tension before every volley.',
  'The keeper''s job is pure entertainment — dive early, miss dramatically, look horrified. The score is real but the losing keeper is the star of the show.',
  ARRAY['⚽ Soccer balls (4+)', '🥅 Goal'],
  '[{"icon":"👥","text":"Split into 4 teams — each team forms a line behind their ball, equal distance from goal","tag":"team"},{"icon":"📢","text":"Director calls slow and loud: \"READY…\" — everyone gets set. \"AIM…\" — eyes on goal. \"FIRE!\" — all four shoot at the same time","tag":"fun"},{"icon":"🧤","text":"One BDU volunteer is the \"goalkeeper\" — faces the whole firing squad alone. Huge dramatic reactions on every goal","tag":"fun"},{"icon":"🏆","text":"Keep score by team — each goal counts. Run 5–6 rounds, then crown a champion","tag":"team"},{"icon":"🔁","text":"Next player in each line steps up after every round — quick rotation, everyone fires multiple times"},{"icon":"🎉","text":"BDU players on the sideline go WILD for every goal — the louder the better","tag":"team"}]'::jsonb,
  17,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- 100 Goals Together
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-soc-gm-100-goals',
  'soccer',
  'Game',
  '🎊',
  '100 Goals Together',
  'The whole group chases one shared number — every goal anyone scores counts toward a team total of 100.',
  'This isn''t about one person scoring — it''s about ALL of us scoring together. Every single goal counts for the whole team. Let''s get to 100!',
  'Set balls up fast and keep the energy moving — the countdown is the engine. Celebrate each milestone (25, 50, 75) with escalating reactions.',
  'If the group is small, start at 50 instead of 100. Every participant''s goal counts equally — that''s the whole point.',
  ARRAY['⚽ Soccer balls (many)', '🥅 Goals', '📋 Whiteboard or marker'],
  '[{"icon":"🔢","text":"Write 100 on a whiteboard or call it out loud — that''s the team''s goal for the whole group","tag":"team"},{"icon":"⚽","text":"Every goal scored by anyone counts toward the total — BDU players narrate the running tally: \"That''s 47! Only 53 more!\"","tag":"fun"},{"icon":"🚀","text":"Keep balls flowing fast — the moment one goes in, the next player is already shooting. No waiting, just goals","tag":"fun"},{"icon":"📣","text":"Every 10 goals, BDU players lead a big group cheer — energy builds as the number climbs","tag":"team"},{"icon":"🏆","text":"When you hit 100, the whole group celebrates like a championship — it''s EVERYONE''S record","tag":"team"}]'::jsonb,
  17,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- ── Basketball (21 drills) ───────────────────────

-- Individual Dribbling Practice
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-bball-drb-station',
  'basketball',
  'Dribbling',
  '🏀',
  'Individual Dribbling Practice',
  'Players practice stationary skills: ball slams, wrap-arounds (head/waist/knees), figure-8 dribbling, both hands, and crossovers. Each player learns at their own pace.',
  'Hand-eye coordination and ball confidence are the foundation of every basketball skill. Starting stationary removes the distraction of movement so players can focus on the feel of the ball.',
  'Model each move alongside your player — they''ll imitate what they see. Celebrate every wrap-around and crossover, no matter how wobbly.',
  'Players who master a move quickly can try it with their non-dominant hand. Keep energy upbeat — there''s no wrong way to start.',
  ARRAY['🏀 Basketballs (1 per player)'],
  '[]'::jsonb,
  10,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Dribbling Relay Race
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-bball-drb-relay',
  'basketball',
  'Dribbling',
  '🏁',
  'Dribbling Relay Race',
  'Teams of 5 line up at the baseline. First player dribbles to the far cone and back, then gently passes to the next teammate.',
  'Dribbling while moving is a critical skill. Competition adds motivation while teammates cheering from the sideline builds community.',
  'Dribble alongside your player on the first run to show the path. On the return, let them lead.',
  'Shorten the course for players who need it — the goal is moving with the ball, not the distance.',
  ARRAY['🏀 Basketballs', '📍 Cones or floor spots'],
  '[]'::jsonb,
  10,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Dribbling Hungry Hippos
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-bball-drb-hippos',
  'basketball',
  'Dribbling',
  '🦛',
  'Dribbling Hungry Hippos',
  'Two teams on opposite baselines. Players dribble to the center, pick up one color dot, and return it to their baseline. Team with the most dots wins.',
  'Direction changes, stopping, starting, and ball control in an open environment — all while having too much fun to notice they''re learning.',
  'Help your player track how many dots their team has — the count is part of the excitement.',
  'Run multiple short rounds so every player gets several trips. Celebrate the team total, not individual hauls.',
  ARRAY['🟡 Color dots (20+)', '🏀 Basketballs (1 per player)'],
  '[]'::jsonb,
  12,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Dribbling Obstacle Course
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-bball-drb-cone',
  'basketball',
  'Dribbling',
  '🪜',
  'Dribbling Obstacle Course',
  'Players dribble through an agility ladder and hurdle setup. Start with one foot per square, then increase complexity as players improve.',
  'Agility training builds the footwork and body awareness that translates directly to game movement. It''s accessible and adaptable for any ability level.',
  'Walk through the course with your player first, pointing out each marker. Stay close on the first run to guide foot placement.',
  'Offer a simplified path for players who need it — even two ladders and one hurdle is a real accomplishment.',
  ARRAY['🪜 Agility ladders', '🚧 Hurdles', '🔶 Cones'],
  '[]'::jsonb,
  12,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Stationary Partner Passing
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-bball-pas-partner',
  'basketball',
  'Passing',
  '🤝',
  'Stationary Partner Passing',
  'Partners stand 10–15 feet apart on marked spots and pass back and forth. Coaches encourage verbal and nonverbal communication.',
  'Learning a teammate''s name while catching a pass from them creates social connection through shared activity — one of the core goals of the program.',
  'Keep your pass gentle and at chest height. Call your partner''s name before every pass.',
  'Watch for players holding the ball too long — encourage a rhythm: catch, pause, pass. Switch up partners mid-drill.',
  ARRAY['🟡 Floor spots', '🏀 Basketballs'],
  '[]'::jsonb,
  10,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Partner Passing with Movement
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-bball-pas-move',
  'basketball',
  'Passing',
  '🏃',
  'Partner Passing with Movement',
  'Partners stand 5 feet apart and pass while moving toward the basket. At the end, one partner shoots.',
  'Passing while moving mirrors real game action. The shot at the end creates a natural payoff that makes the movement feel purposeful.',
  'Match your player''s pace — walk if they walk. Keep the pass soft and at chest height.',
  'If coordination is hard, have players stop briefly before passing rather than passing on the run.',
  ARRAY['🏀 Basketballs', '🔶 Cones'],
  '[]'::jsonb,
  10,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Pass, Cut, and Shoot
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-bball-pas-pcs',
  'basketball',
  'Passing',
  '✂️',
  'Pass, Cut, and Shoot',
  'One line at the top of the key, another on the wing. Player 1 passes to Player 2, then cuts to the basket. Player 2 passes back for a shot. Players rotate positions.',
  '"Pass and stand" is the most common habit to break in youth basketball. This drill makes "pass, then move" feel automatic.',
  'After your player passes, signal them to cut toward the basket — a point or wave is all it takes. Be loud when they get the return pass.',
  'The coach can play a light defender role — walking toward the passer to show why the cut matters. Keep it instructive, not intimidating.',
  ARRAY['🏀 Basketballs', '📍 Floor spots'],
  '[]'::jsonb,
  12,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Passing into Target Nets
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-bball-pas-target',
  'basketball',
  'Passing',
  '🎯',
  'Passing into Target Nets',
  'Players line up in front of a target net and get 3 chances to pass the ball into it. Can be competitive or skill-based.',
  'Accuracy under a little pressure — aiming for a target — develops the control and focus that distinguish a skilled pass from just throwing the ball.',
  'Help your player find a comfortable stance before each attempt. Celebrate all three tries regardless of result.',
  'Start targets close and move them back as players succeed. Don''t rush — players who take their time often hit more.',
  ARRAY['🏀 Basketballs', '📍 Floor spots', '🎯 Target nets'],
  '[]'::jsonb,
  10,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Circle Passing
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-bball-pas-circle',
  'basketball',
  'Passing',
  '⭕',
  'Circle Passing',
  'Players stand in a circle with one basketball and pass to teammates. Practice chest passes, bounce passes, and overhead passes.',
  'Passing in a group means reading where teammates are and communicating — skills that build both basketball IQ and social confidence.',
  'Prompt players to say the receiver''s name before passing. Keep the habit going every round.',
  'Try a different pass type each round. Increase pace as the group gets comfortable.',
  ARRAY['🏀 Basketballs', '🔶 Cones'],
  '[]'::jsonb,
  10,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Chest Pass Lines
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-bball-pas-chest',
  'basketball',
  'Passing',
  '👐',
  'Chest Pass Lines',
  'Two lines facing each other. Chest-pass back and forth. Focus on catching with two hands.',
  'The chest pass is the most reliable pass in basketball — getting the mechanics right early builds the foundation for every other passing skill.',
  'Hold your hands out as a target for your partner — it gives them something to aim at.',
  'Use a foam ball if the regulation ball is too heavy. Focus on the stepping motion, not power.',
  ARRAY['🏀 Basketballs (or foam balls)'],
  '[]'::jsonb,
  10,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Around the World
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-bball-sht-aroundworld',
  'basketball',
  'Shooting',
  '🌍',
  'Around the World',
  'Players move from spot to spot around the key or three-point line, shooting from each marked location.',
  'Shooting from different spots builds spatial awareness and confidence — players learn their range and stop avoiding shots outside their comfort zone.',
  'Help your player set their feet for each shot — a stable base makes every attempt better. Cheer the release, not just the make.',
  'Let players choose their own spots. A close-range make is as worth celebrating as a long-range one — the movement between spots is the real skill.',
  ARRAY['🟡 Color dots or cones', '🏀 Basketballs'],
  '[]'::jsonb,
  12,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- 5-4-3-2-1 Shooting
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-bball-sht-54321',
  'basketball',
  'Shooting',
  '🔢',
  '5-4-3-2-1 Shooting',
  'Players shoot from numbered spots — 5 (closest) through 1 (farthest) or vice versa. Can be individual or a team challenge.',
  'A countdown format creates fun pressure and adds a game-within-the-game that keeps focus high while building shooting repetition.',
  'Count down out loud with the group. Your energy sets the room''s energy.',
  'Run the drill in both directions (5-to-1 and 1-to-5) so players shoot from every spot. More reps builds more confidence.',
  ARRAY['🔢 Number spots (5)', '🏀 Basketballs'],
  '[]'::jsonb,
  12,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Layup / Shooting Lines
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-bball-sht-layup',
  'basketball',
  'Shooting',
  '🥅',
  'Layup / Shooting Lines',
  'Two lines on each wing: one shooting/layup line and one rebounding line. After each turn, players switch lines.',
  'Layups are the highest-percentage shot in basketball. Repetition builds the footwork and finishing muscle memory that create confidence near the basket.',
  'Stay in the rebounding line and set balls up for the next shooter — quick resets keep energy high.',
  'Accept walk-up layups — the footwork matters more than the speed. Give individual coaching moments at the basket.',
  ARRAY['🏀 Basketballs', '🔶 Cones'],
  '[]'::jsonb,
  12,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Dribble, Pass, and Shoot
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-bball-sht-dps',
  'basketball',
  'Shooting',
  '🔗',
  'Dribble, Pass, and Shoot',
  'Baseline line dribbles through cones. Wing line cuts to the basket. The dribbler passes to the cutter, who shoots.',
  'Stringing skills together — dribble, pass, receive, shoot — simulates real game sequences and teaches players how skills connect.',
  'As the wing cutter, read your partner''s dribble and time your cut. Over-communicate — call for the ball by name.',
  'If timing is hard to coordinate, pause and walk both lines through the sequence slowly before running at pace.',
  ARRAY['🏀 Basketballs', '🔶 Cones'],
  '[]'::jsonb,
  12,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Hustle Drill
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-bball-gm-hustle',
  'basketball',
  'Game',
  '💥',
  'Hustle Drill',
  'Two players lie on their backs on opposite sides of the key. Coach rolls a ball toward half court. On "go," both race to it. Player who gets the ball is on offense — the other plays defense.',
  'Every basketball game has loose-ball moments. This drill builds the competitive instinct to go for it — and the sportsmanship to accept the result.',
  'Cheer loudly for whichever player gets the ball — the hustle is what we celebrate, not who wins.',
  'Control the pace with your voice — "ready... ready... GO!" Vary the timing to keep both players alert.',
  ARRAY['🏀 Basketball'],
  '[]'::jsonb,
  10,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Freeze Tag
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-bball-gm-freeze',
  'basketball',
  'Game',
  '🧊',
  'Freeze Tag',
  'Players dribble around the gym. When tagged by a coach, they freeze. A partner must complete a pass to unfreeze them.',
  'The unfreeze mechanic creates a reason to pass that''s intrinsic and immediate — players help teammates because they want to, not because a coach said to.',
  'Stay close to your player and be ready to receive a quick pass. Call to them if they get tagged: "I''m open!"',
  'Start with only one coach as the shark. Add more sharks as players improve. Enforce the rule: only a completed pass unfreezes.',
  ARRAY['🏀 Basketballs (1 per player)'],
  '[]'::jsonb,
  10,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Red Light, Green Light
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-bball-gm-rlgl',
  'basketball',
  'Game',
  '🚦',
  'Red Light, Green Light',
  'Players dribble from one baseline to the other. They freeze on "red light" and dribble on "green light." First to the far baseline wins.',
  'Following verbal commands while maintaining ball control requires listening and motor multitasking — exactly the kind of game-awareness basketball demands.',
  'Dribble alongside your player and stop when they stop — you''re both playing. Make it silly.',
  'Add yellow light (slow dribble) once players handle two commands easily. Vary the cadence unpredictably to keep everyone alert.',
  ARRAY['🏀 Basketballs', '🔴 Red sign', '🟢 Green sign'],
  '[]'::jsonb,
  10,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Sharks and Minnows
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-bball-gm-sharks',
  'basketball',
  'Game',
  '🦈',
  'Sharks and Minnows',
  'Players dribble from baseline to baseline while avoiding the "shark." In Version 2, tagged players become sharks too.',
  'Dribbling while aware of defenders is the core challenge of live basketball. This game makes ball protection feel like an adventure rather than a skill.',
  'Help your player keep their head up while dribbling — they need to see the shark coming. Celebrate every successful crossing loudly.',
  'Version 1 (everyone gets across regardless) is great for early sessions. Move to Version 2 (tagged become sharks) as confidence builds.',
  ARRAY['🏀 Basketballs (1 per player)'],
  '[]'::jsonb,
  10,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Relay Race
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-bball-gm-relay',
  'basketball',
  'Game',
  '🏁',
  'Relay Race',
  'Two teams on the baseline. Players dribble through cones, shoot a layup, then dribble back and pass to the next teammate. First team to finish wins.',
  'Combining dribbling, layups, and passing in a team competition builds all three skills at once and creates shared stakes — the team wins or tries again together.',
  'Cheer every layup attempt — misses grab the ball and dribble back too. The effort is the win.',
  'Keep teams balanced in ability. If one team is dominating, adjust lanes or give a head start — the fun comes from a close finish.',
  ARRAY['🏀 Basketballs', '🔶 Cones'],
  '[]'::jsonb,
  12,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Agility Practice
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-bball-gm-agility',
  'basketball',
  'Game',
  '🏃',
  'Agility Practice',
  'Players form a line and take turns running through agility ladders, hurdles, and cone paths. Coaches set the layout and adjust complexity per player.',
  'Footwork and agility are the hidden foundation of every sport skill. Better balance and foot speed make dribbling, passing, and cutting all easier.',
  'Walk through each station with your player before they go at pace. Clap a rhythm to help with timing.',
  'Adapt the course for each player — remove hurdles or widen ladder spacing as needed. Progression, not perfection, is the goal.',
  ARRAY['🔶 Cones', '🪜 Agility ladders', '🚧 Hurdles'],
  '[]'::jsonb,
  10,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Scrimmage
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-bball-gm-scrimmage',
  'basketball',
  'Game',
  '🏟️',
  'Scrimmage',
  '3–5 ES players + 1–2 peer volunteers per team. Coaches on court. Director pauses play for coaching moments.',
  'Everything else is preparation. The scrimmage is where players apply skills in a live setting, experience the game socially, and feel what basketball actually feels like.',
  'Stay active on the court — pass, call for the ball, set up plays for your player. You''re their partner in the game, not a bystander.',
  'Pause the game every few minutes for a coaching moment. Celebrate every basket from both teams equally.',
  ARRAY['🏀 Basketballs', '🏀 Basketball hoops (2)'],
  '[]'::jsonb,
  30,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- ── Softball (6 drills) ──────────────────────────

-- Partner Catching
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-soft-fld-catch',
  'softball',
  'Fielding',
  '🥎',
  'Partner Catching',
  'Players partner with a teammate or volunteer and play catch. Start close together and gradually move farther apart. Focus on proper catching technique.',
  'Playing catch is the most fundamental two-person skill in the sport. Starting close and moving apart builds confidence and arm strength at the player''s own pace.',
  'Start at arm''s length if needed. Toss at belly height — easy to catch, easy to succeed. Celebrate every catch.',
  'Partners find a comfortable distance and own it. Not everyone needs to move back — the connection matters more than the distance.',
  ARRAY['🥎 Softballs (foam)', '🧤 Mitts (optional)'],
  '[]'::jsonb,
  10,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Ground Ball
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-soft-fld-ground',
  'softball',
  'Fielding',
  '⬇️',
  'Ground Ball',
  'Players form an infield line. A coach rolls ground balls to each player, who fields and throws to a volunteer at first base.',
  'Fielding a ground ball and making a throw to a base is the core defensive play in softball. Repetition builds the reaction time and footwork to do it instinctively.',
  'Station yourself at first base and call to your player when they field — "throw it here!" The target makes the throw feel like a real play.',
  'Roll slowly and close first. Move back and increase pace as players improve. The goal is fielding position — the throw is secondary.',
  ARRAY['🥎 Softballs (foam)', '🔶 Cones', '🧤 Mitts (optional)'],
  '[]'::jsonb,
  10,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Pop Flies
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-soft-fld-popfly',
  'softball',
  'Fielding',
  '🌤️',
  'Pop Flies',
  'Players form a line in the outfield. A coach tosses a fly ball to each player one at a time. After catching (or attempting), the player throws back.',
  'Tracking and catching a ball coming down from above is a completely different skill from fielding grounders — and a huge confidence-builder when it connects.',
  'Position yourself close to your player as they track the ball. Encourage them to call "I got it!" — communication is part of the skill.',
  'Start with very short, low tosses. Height increases once players are comfortable. A successful catch from any height gets the same celebration.',
  ARRAY['🥎 Softballs (foam)', '🔶 Cones', '🧤 Mitts (optional)'],
  '[]'::jsonb,
  10,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Partner Ground Balls
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-soft-fld-partner-ground',
  'softball',
  'Fielding',
  '🔄',
  'Partner Ground Balls',
  'Players pair up with a teammate or volunteer. Partners stand across from each other and roll ground balls back and forth to practice fielding technique.',
  'Rolling ground balls to each other gives both partners active repetitions and builds the anticipation and body positioning that make fielding feel natural.',
  'Start with slow, straight rolls right at your partner''s feet. Speed and angle can increase as they get comfortable.',
  'Encourage players to get low — bent knees, glove to the ground. Building the habit of "getting down" is the most important early goal.',
  ARRAY['🥎 Softballs (foam)'],
  '[]'::jsonb,
  10,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Tee Hitting
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-soft-hit-tee',
  'softball',
  'Hitting',
  '⚾',
  'Tee Hitting',
  'A tee is set up near the fence. One at a time, players step up and hit the ball. Coaches teach hitting fundamentals while players swing away.',
  'A stationary ball removes timing pressure entirely so players can focus on stance, grip, and swing path — the mechanical foundation of hitting.',
  'Stand behind and to the side of the hitter — never in front. Cheer the swing, not just clean contact. Every attempt counts.',
  'Adjust tee height per player. A ball hit into the fence counts just as much as a line drive. Keep a clear area in front of the tee.',
  ARRAY['🥎 Softballs (foam)', '⚾ Batting tee', '🏏 Bat'],
  '[]'::jsonb,
  12,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Base Running
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-soft-run-bases',
  'softball',
  'Base Running',
  '🏃',
  'Base Running',
  'Players line up at home plate. Coaches or volunteers stand at each base to guide players. The coach at home sends players running the bases.',
  'Knowing which base to run to and in what order seems simple — but for players encountering softball for the first time, it''s the rule that unlocks the whole game.',
  'Run alongside your player the first time. Point to each base as you approach so they know where to go next.',
  'Station coaches at every base for continuous guidance. Make every home plate arrival feel like a championship moment.',
  ARRAY['⬛ Base markers (4)'],
  '[]'::jsonb,
  10,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- ── Football (8 drills) ──────────────────────────

-- QB Throwing Nets
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-foot-qb-throw',
  'football',
  'Throwing',
  '🏈',
  'QB Throwing Nets',
  'Players take turns throwing from marked spots toward a target net. Start close, then move farther back as the drill progresses. Competitive version: two nets, race to hit the most targets.',
  'A target net gives players an immediate feedback loop — hit the net, win the moment. Aiming is more motivating than throwing to open space.',
  'Stand behind the net and react to every throw — a miss that clips the edge is still a reason to cheer.',
  'Start players close. The goal is making contact with the net, not distance. Move back as players find their release point.',
  ARRAY['🏈 Footballs (foam)', '🎯 Throwing nets'],
  '[]'::jsonb,
  10,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Circle Passing
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-foot-cir-pass',
  'football',
  'Throwing',
  '⭕',
  'Circle Passing',
  'Players sit or stand in a circle with one football. They call out a teammate''s name and pass them the ball.',
  'Calling a teammate''s name before passing creates social connection through the sport — players learn each other''s names and practice communication in a supportive setting.',
  'Receive the pass with both hands and celebrate the catch before passing on. Your enthusiasm is contagious.',
  'Keep the circle tight so throws are manageable. Encourage different pass types (overhand, underhand, lateral) as players get comfortable.',
  ARRAY['🏈 Footballs (foam)'],
  '[]'::jsonb,
  10,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- WR Route Running
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-foot-wr-routes',
  'football',
  'Catching',
  '🏃',
  'WR Route Running',
  'Coaches set up cones and colored spots as route markers. Players pick a spot, run to it, and catch a pass from the coach-QB. After catching, they run into the end zone and celebrate.',
  'Running to a specific spot and catching a pass teaches two foundational skills at once — and scoring a "touchdown" after every rep makes each one memorable.',
  'Call your player''s name as you throw — it gets their attention and builds the habit of looking for the ball.',
  'Let players pick their own color spot to run to — ownership of the choice makes the route feel personal. Keep passes short and catchable.',
  ARRAY['🏈 Footballs (foam)', '🔶 Cones', '🟡 Color spots'],
  '[]'::jsonb,
  10,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Running Back Agility
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-foot-rb-agility',
  'football',
  'Agility',
  '🪜',
  'Running Back Agility',
  'Players form a line. A coach hands the ball off to each player, who then runs through agility ladders or hurdles and scores in the end zone.',
  'The handoff + run + touchdown sequence is pure football magic. The agility course is the obstacle between players and the end zone — and every player scores on every rep.',
  'Hand off the ball with energy. Point toward the end zone and cheer loudly all the way through.',
  'Adapt the course per player — remove hurdles or simplify the ladder as needed. Every player crosses the goal line.',
  ARRAY['🏈 Footballs (foam)', '🪜 Agility ladders', '🚧 Hurdles'],
  '[]'::jsonb,
  10,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Color Spot Agility
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-foot-spot-agility',
  'football',
  'Agility',
  '🟡',
  'Color Spot Agility',
  'Coaches spread color spots around the field. Each player holds a football. The coach calls out a color, and players quickly run to stand on that spot.',
  'Reacting to verbal commands while holding a ball trains listening and coordination simultaneously — skills that matter in every play of a real football game.',
  'Move with your player to the correct spot — even if they hesitate, your movement gives them a cue to follow.',
  'Call colors at a pace that lets everyone succeed at first. Increase speed and unpredictability as players get better at reacting.',
  ARRAY['🟡 Color spots', '🏈 Footballs (foam)'],
  '[]'::jsonb,
  10,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Red Light, Green Light
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-foot-rl-gl',
  'football',
  'Game',
  '🚦',
  'Red Light, Green Light',
  'Each player starts with a football at one goal line. Players run on "green light" and freeze when the coach yells "red light." First to reach the far goal line wins.',
  'Carrying a football while reacting to commands develops ball security and body awareness at the same time. Listening skills matter as much as athletic ones.',
  'Run alongside your player and stop when they stop — model the behavior and make it fun.',
  'Go slow on eliminations — keep everyone engaged. The drill is better when everyone runs the whole time.',
  ARRAY['🏈 Footballs (foam)', '🔴 Red sign', '🟢 Green sign'],
  '[]'::jsonb,
  10,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Sharks and Minnows
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-foot-gm-sharks',
  'football',
  'Game',
  '🦈',
  'Sharks and Minnows',
  'Players line up on the goal line with their own football. The coach starts as the "shark." Players (minnows) run across without getting tagged. Version 2: tagged players become sharks.',
  'Running while protecting the ball and avoiding being tagged builds ball security, spatial awareness, and full-field vision — all in a game players love.',
  'Cheer every player who makes it across regardless of whether they got tagged. The crossing is the victory.',
  'Version 1 (everyone crosses) works best early on. Move to Version 2 as confidence builds. Start as the shark yourself — players love chasing a coach.',
  ARRAY['🏈 Footballs (foam)'],
  '[]'::jsonb,
  10,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Scrimmage
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-foot-gm-scrimmage',
  'football',
  'Game',
  '🏟️',
  'Scrimmage',
  '3–5 ES players + 1–2 peer volunteers per team. Coaches play QB for both teams. Flag football format — coaches and volunteers on field throughout. Director pauses for coaching moments.',
  'Flag football gives every player a real game experience without contact. Coaches as QB means every player gets a catchable throw — success rate in the scrimmage matters.',
  'Stay active in the pattern — give your player something to react to and celebrate every play they make.',
  'Keep scores even with coaching adjustments. Pause for teaching moments whenever energy is right. The joy is the play, not the scoreboard.',
  ARRAY['🏈 Footballs (foam)', '📌 Flag belts', '🟡 Pylons', '📌 Pinnies'],
  '[]'::jsonb,
  30,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- ── Pickleball (8 drills) ────────────────────────

-- Balloon Drills
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-pick-balloon',
  'pickleball',
  'Fundamentals',
  '🎈',
  'Balloon Drills',
  'Each player has a paddle and balloon. Coach instructs different activities: hitting repeatedly in the air, keeping it off the ground, partner passing, etc.',
  'Balloons move slowly and predictably — they create a no-fail environment where players build paddle contact confidence without any pressure to perform.',
  'Play alongside your player — hit your own balloon and count out loud. Competing for "most in a row" adds excitement without stakes.',
  'Try partner passing once individuals are comfortable with solo tapping. A balloon that barely moves counts — contact is the point.',
  ARRAY['🏓 Pickleball paddles', '🎈 Balloons (1 per player)'],
  '[]'::jsonb,
  10,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Paddle Work
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-pick-paddle-work',
  'pickleball',
  'Fundamentals',
  '🏓',
  'Paddle Work',
  'Each player finds open space with a paddle and ball. Activities: bounce the ball on the paddle, balance the ball, walk around while pushing it on the floor ("walking the dog").',
  'Dexterity challenges with the paddle build hand-eye coordination and paddle confidence in a playful self-challenge format — players set their own goals.',
  'Try the challenges alongside your player. Competing for most bounces in a row turns it into a shared game rather than a drill.',
  'Introduce one challenge at a time. Let players progress at their own pace — some will master one and try to teach it to others, which is a win.',
  ARRAY['🏓 Pickleball paddles', '🟡 Pickleballs'],
  '[]'::jsonb,
  10,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Wall Ball
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-pick-wall-ball',
  'pickleball',
  'Fundamentals',
  '🧱',
  'Wall Ball',
  'Players find a spot along the wall with paddle and ball. A target can be placed on the wall for visual reference. Players hit the ball against the wall and eventually rally with themselves.',
  'Hitting against a wall means every shot comes right back — unlimited reps, no partner needed, and instant feedback on placement and contact.',
  'Stand alongside your player and cheer every wall contact. Help them find a slow, controlled rhythm — that beats a fast miss every time.',
  'Place tape or a sticker target on the wall at a good strike height. Celebrate each new personal best: one hit, then two consecutive, then three.',
  ARRAY['🏓 Pickleball paddles', '🟡 Pickleballs'],
  '[]'::jsonb,
  10,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Throwing to Targets
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-pick-throw-target',
  'pickleball',
  'Fundamentals',
  '🎯',
  'Throwing to Targets',
  'Players stand at the kitchen line and throw pickleballs underhand at a target on the opposite kitchen line. Underhand throw to reinforce correct technique.',
  'Throwing underhand at a target trains the same arc and release mechanics used in serving — without the paddle variable, so players focus entirely on aim and trajectory.',
  'Help your player find the right underhand release — elbow below shoulder, gentle arc. Celebrate accuracy at any range.',
  'Place targets at kitchen-line distance. Underhand throws only — remind players this reinforces the serving motion they''ll use in the game.',
  ARRAY['🟡 Pickleballs', '🟡 Color dots or targets'],
  '[]'::jsonb,
  10,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Serving Into Buckets
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-pick-serve-bucket',
  'pickleball',
  'Serving',
  '🪣',
  'Serving Into Buckets',
  'Players start on one side of the court with 2–3 large buckets placed across the net. Players take turns serving pickleballs and attempting to land them in the buckets.',
  'A target gives players an immediate feedback loop — the ball either lands in the bucket or it doesn''t, and both outcomes teach something. Aiming makes serving feel purposeful.',
  'Cheer every serve that clears the net regardless of where it lands. Getting over the net is the first win.',
  'Start with a large bucket close to the net. Move it back and use smaller containers as accuracy improves.',
  ARRAY['🏓 Pickleball paddles', '🟡 Pickleballs', '🪣 Buckets (2–3)'],
  '[]'::jsonb,
  10,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Partner Volley
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-pick-volley',
  'pickleball',
  'Volley',
  '🏓',
  'Partner Volley',
  'Players partner with a teammate or volunteer and volley back and forth — either across the net or in open space. Focus on making contact and reacting to incoming shots.',
  'A back-and-forth rally is the social heartbeat of pickleball. The shared goal of keeping the ball going creates teamwork without any competitive pressure.',
  'Match your partner''s pace — slow the rally down if needed. Count consecutive hits out loud: "that''s five!" The number builds excitement.',
  'Set a group record for consecutive hits. A new high score from any pair gets a group cheer.',
  ARRAY['🏓 Pickleball paddles', '🟡 Pickleballs', '🥅 Net'],
  '[]'::jsonb,
  10,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Reacting to Returns
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-pick-react-return',
  'pickleball',
  'Volley',
  '↩️',
  'Reacting to Returns',
  'Players line up on one side of the court. A coach or volunteer on the other side serves to each player, who must react and return it over the net. 2–3 serves per player before rotating.',
  'Reacting to a serve and hitting it back is the closest thing to real game play — and doing it successfully for the first time is a genuine breakthrough moment.',
  'Stand near the player during their turn. Encourage them to watch the ball — "eyes on the ball!" is the best single cue.',
  'Serve gently and directly to the player. 2–3 serves per player before rotating keeps the line moving and maximizes reps.',
  ARRAY['🏓 Pickleball paddles', '🟡 Pickleballs', '🥅 Net'],
  '[]'::jsonb,
  10,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Scrimmage
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-pick-gm-scrimmage',
  'pickleball',
  'Game',
  '🏟️',
  'Scrimmage',
  '1–2 ES players + 1–2 peer volunteers per team on the court. Coaches and volunteers play alongside. Director pauses play for coaching moments. Rotate players for court time.',
  'Everything practiced individually comes together in a real game. Playing alongside peer volunteers creates the shared experience that is at the heart of the Empower Sports program.',
  'Narrate the play for your player — "good return!", "move to the net!" Your voice keeps them oriented and engaged.',
  'Rotate players frequently so everyone gets court time. Celebrate every point — making contact over the net is a win at any stage.',
  ARRAY['🏓 Pickleball paddles', '🟡 Pickleballs', '🥅 Net'],
  '[]'::jsonb,
  25,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- ── Kickball (3 drills) ──────────────────────────

-- Fielding Bucket Drill
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-kick-fld-ground',
  'kickball',
  'Fielding',
  '🔴',
  'Fielding Bucket Drill',
  'Players form an infield line. One coach manages the line; one manages a bucket at first base. Coach rolls the kickball to each player, who fields it and deposits it in the bucket.',
  'The bucket drill teaches the exact mechanic used in the scrimmage — field the ball, deposit it in the bucket to record the out. It''s not a generic drill; it''s practice for the specific rule that makes kickball work.',
  'Stand by the bucket at first base and call to the fielder — "put it in!" The verbal cue reinforces the mechanic.',
  'One coach manages the line, one manages the bucket. Keep the roll gentle — the goal is fielding position, not catching speed.',
  ARRAY['🔴 Kickball', '🪣 Bucket', '⬛ Bases'],
  '[]'::jsonb,
  10,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Base Running
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-kick-run-bases',
  'kickball',
  'Base Running',
  '🏃',
  'Base Running',
  'Players line up at home plate. Coaches or volunteers stand at each base to guide players. The coach at home sends players running the bases one at a time.',
  'Running the bases sounds simple but it''s genuinely disorienting the first time. Knowing where to go and when to run unlocks the whole game.',
  'Run one step behind your player on their first lap, pointing to the next base and cheering as they touch each one.',
  'Station a coach or volunteer at every base. Make home plate the biggest celebration of all — every run matters.',
  ARRAY['⬛ Bases', '🔴 Kickball (optional)'],
  '[]'::jsonb,
  10,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Scrimmage
INSERT INTO ep_drills
  (id, sport, category, icon, name, description,
   purpose, volunteer_tip, facilitator_tip,
   equipment, steps, default_time, source)
VALUES (
  'd-kick-gm-scrimmage',
  'kickball',
  'Game',
  '🏟️',
  'Scrimmage',
  'Players divided into two teams. Coaches and volunteers on the field throughout. All players take an at-bat before switching to the field. The bucket drill becomes the out mechanic — field it, deposit it, that''s the out.',
  'The scrimmage brings the bucket drill and base running together into a real game. Every player kicks, everyone fields, and peer volunteers play alongside — that shared experience is the whole point.',
  'Be active in the field — position yourself to help collect the ball and get it to the bucket. Encourage your player through every kick and run.',
  'All players kick before sides switch. No strikeouts — every player kicks until they make contact. Celebrate every run home loudly.',
  ARRAY['🔴 Kickball', '🪣 Buckets', '⬛ Bases'],
  '[]'::jsonb,
  30,
  'builtin'
)
ON CONFLICT (id) DO UPDATE SET
  sport           = EXCLUDED.sport,
  category        = EXCLUDED.category,
  icon            = EXCLUDED.icon,
  name            = EXCLUDED.name,
  description     = EXCLUDED.description,
  purpose         = EXCLUDED.purpose,
  volunteer_tip   = EXCLUDED.volunteer_tip,
  facilitator_tip = EXCLUDED.facilitator_tip,
  equipment       = EXCLUDED.equipment,
  steps           = EXCLUDED.steps,
  default_time    = EXCLUDED.default_time,
  source          = EXCLUDED.source;

-- Total seeded: 75 drills
