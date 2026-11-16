-- BDU drill import: 125 soccer drills from the Drill Lab (aaglass20.github.io/drills)
-- Run ONCE in the Supabase SQL Editor, AFTER indy-drills-focus-areas.sql:
-- https://supabase.com/dashboard/project/fpnmnlrwhwnuefbnehuf/sql
-- Adds these drills to the Indy Way drill library. A drill that is already there is left alone
-- (change it on the page with Edit drill). No PIN needed.
--
-- 35 of them came from BDU pages and keep that page's video. None are marked HS.
-- Not imported: Gates Dribbling — same game as Gates Competition Dribbling (U8 Version); Partner Gate Passing — same game as Gates Competition Passing (U8 Version); Animal Soccer — U6 only.
with incoming as (
  select * from jsonb_to_recordset($drills$
[
 {
  "id": "rondo-4v1",
  "name": "Rondo 4v1",
  "icon": "🔄",
  "category": "Possession",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": null,
  "duration": 15,
  "players": "5 per group",
  "description": "Keep possession under light pressure by passing quickly and moving to open angles. Builds first touch, body shape, and passing under pressure.",
  "setup": [
   "Grid: 8x8 yd square for U8–U10, 10x10 yd for older players",
   "Players: 4 attackers on the outside edges, 1 defender in the middle",
   "Start with the ball at one attacker's feet"
  ],
  "directions": [
   "Attackers pass the ball around and across the square; they may move along their edge but not into the grid.",
   "Defender tries to win the ball or knock it out of the grid.",
   "Count consecutive passes — 10 passes in a row scores a point for the attackers.",
   "If the defender wins it (or the ball leaves the grid), the attacker who made the mistake swaps into the middle.",
   "Play 60–90 second rounds so every player defends at least once."
  ],
  "variations": [
   "Easier: make the grid bigger, or allow unlimited touches.",
   "Harder: two-touch, then one-touch limit.",
   "Harder: 5v2 with a bigger grid; a split pass between the two defenders counts double.",
   "Defender who wins it must dribble out of the grid to earn the point."
  ],
  "coaching_points": [
   "Open your body so you can see the next pass before you receive.",
   "Receive across your body with the back foot.",
   "Move along your line to make a passing angle — don't hide behind the defender.",
   "Pass to the foot away from the defender.",
   "Defender: curve your run to cut off one passing lane."
  ],
  "equipment": [
   "1 ball per group",
   "4 cones per grid",
   "1 pinnie per group"
  ],
  "focus_areas": [
   "Possession",
   "Passing",
   "First Touch"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "sharks-and-minnows",
  "name": "Sharks and Minnows",
  "icon": "⚡",
  "category": "Dribbling",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": "U10",
  "duration": 10,
  "players": "8–16",
  "description": "Dribble with close control and keep the ball protected while escaping defenders. A high-energy game that also teaches tackling.",
  "setup": [
   "Grid: 20x30 yd rectangle with an end line on each short side",
   "Players: every \"minnow\" has a ball; 1–2 \"sharks\" without a ball start in the middle"
  ],
  "directions": [
   "Minnows line up on one end line with a ball each.",
   "On the coach's call (\"Fishy, fishy, cross my sea!\"), minnows dribble to the far end line.",
   "Sharks try to kick minnows' balls out of the grid.",
   "A minnow who loses their ball becomes a shark for the next crossing.",
   "Keep crossing until one minnow is left — they start as the shark next game."
  ],
  "variations": [
   "Easier: sharks must walk, or hold a pinnie in their hand to \"tag\" the ball.",
   "Harder: minnows must stop the ball on the end line with the sole to be safe.",
   "Harder: shrink the grid width, or add a third shark.",
   "Use a specific move (scissors, pull-back) to earn a \"free life\".",
   "Passing version (BDU): 3 sharks vs 4 minnows; a minnow who loses their ball becomes a stationary passing option for the others."
  ],
  "coaching_points": [
   "Keep the ball close — small touches when a shark is near.",
   "Eyes up to find open space.",
   "Change speed and direction to escape.",
   "Put your body between the shark and the ball."
  ],
  "equipment": [
   "1 ball per player",
   "4–6 cones",
   "Pinnies for sharks"
  ],
  "focus_areas": [
   "Dribbling",
   "Fun",
   "Warmup"
  ],
  "video_file": "practice/sharksandminos.mp4",
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "1v1-to-goal",
  "name": "1v1 to Goal",
  "icon": "🎯",
  "category": "Technical",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": null,
  "duration": 15,
  "players": "6–12",
  "description": "Attack a defender with confidence and finish; defenders practice closing down and staying on their feet.",
  "setup": [
   "Grid: 15x20 yd channel with a small goal (or pop-up goal) at one end",
   "Players: attackers in a line at the far end with balls; defenders in a line next to the goal"
  ],
  "directions": [
   "Defender passes the ball to the first attacker, then sprints out to defend.",
   "Attacker takes a positive first touch forward and tries to beat the defender and score.",
   "Play until a goal, the defender wins it and dribbles over the far line, or the ball goes out.",
   "Players switch lines after each rep (attacker joins the defender line and vice versa)."
  ],
  "variations": [
   "Easier: defender starts on the goal line (more time for the attacker).",
   "Harder: two goals for the attacker to choose from — forces the defender to show one way.",
   "Harder: 6-second time limit to score.",
   "Add a second attacker joining late to make it 2v1."
  ],
  "coaching_points": [
   "Attacker: first touch forward, at speed, into space.",
   "Attack the defender's front foot, then change pace past them.",
   "Defender: close down fast, slow down as you arrive, sideways stance.",
   "Defender: show the attacker away from goal; be patient — don't dive in."
  ],
  "equipment": [
   "Balls",
   "1 small goal",
   "4 cones"
  ],
  "focus_areas": [
   "1v1",
   "Attacking",
   "Defending",
   "Aggression"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "2v1-to-goal",
  "name": "2v1 to Goal",
  "icon": "♟️",
  "category": "Tactical",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 15,
  "players": "6–12 + GK",
  "description": "Use a numbers-up attack to decide when to dribble and when to pass, finishing with a shot.",
  "setup": [
   "Grid: 20x25 yd with a goal and goalkeeper at one end",
   "Players: two attacking lines at the far end, one defender line by the goal"
  ],
  "directions": [
   "Defender passes to one of the two front attackers and steps out.",
   "The two attackers combine to beat the defender and shoot.",
   "Rep ends on a goal, save, defender win, or ball out of play.",
   "Rotate: attackers go to the defender line, defender joins an attacking line."
  ],
  "variations": [
   "Easier: defender must start from the goal line.",
   "Harder: a recovering second defender starts behind the attackers after a 2-second delay.",
   "Harder: attackers must score within 3 passes or 8 seconds."
  ],
  "coaching_points": [
   "Ball carrier: dribble at the defender to commit them, then pass.",
   "Supporting player: stay wide and level or slightly ahead — give a clear angle.",
   "If the defender doesn't commit, keep going and shoot.",
   "Pass to the front foot of your teammate so they can shoot first time."
  ],
  "equipment": [
   "Balls",
   "1 full-size or small goal",
   "4 cones",
   "Pinnies"
  ],
  "focus_areas": [
   "Numbers Up",
   "Attacking",
   "Finishing"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "rondo-5v2",
  "name": "Rondo 5v2",
  "icon": "🔄",
  "category": "Possession",
  "skill_level": "Advanced",
  "min_age": "U12",
  "max_age": null,
  "duration": 15,
  "players": "7 per group",
  "description": "Keep the ball against two defenders; find passes that split them. Trains angles of support, one- and two-touch passing, and defensive teamwork.",
  "setup": [
   "Grid: 12x12 yd (U12) up to 15x15 yd (HS)",
   "Players: 5 attackers on the edges (one may play inside), 2 defenders in pinnies inside"
  ],
  "directions": [
   "Attackers keep possession around the grid; two-touch limit to start.",
   "Defenders work together to win the ball or force it out.",
   "10 passes in a row = 1 point; a pass that splits the two defenders = 1 bonus point.",
   "When defenders win it, the attacker who lost it and the one who passed to them go in; the two defenders go out."
  ],
  "variations": [
   "Easier: unlimited touches or a bigger grid.",
   "Harder: one-touch only.",
   "Harder: defenders who win the ball must complete a pass between themselves to score.",
   "Make it 6v3 with an 18x18 grid for bigger groups."
  ],
  "coaching_points": [
   "Players next to the ball give two options — left and right.",
   "Scan before receiving; know your next pass.",
   "Weight of pass: firm to the far foot.",
   "Defenders: one presses, one covers the split — talk to each other."
  ],
  "equipment": [
   "1 ball per group (spares nearby)",
   "4 cones",
   "2 pinnies"
  ],
  "focus_areas": [
   "Possession",
   "Passing",
   "Defending",
   "Pressing"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "3v1-keep-away",
  "name": "3v1 Keep Away",
  "icon": "♟️",
  "category": "Tactical",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": "U12",
  "duration": 10,
  "players": "4 per group",
  "description": "First possession game for young players: move to make a triangle so the ball carrier always has two passing options.",
  "setup": [
   "Grid: 10x10 yd square",
   "Players: 3 attackers, 1 defender"
  ],
  "directions": [
   "Three attackers keep the ball from one defender inside the square; attackers may move anywhere.",
   "Count passes; 5 in a row = 1 point.",
   "If the defender touches the ball, they swap with the attacker who lost it.",
   "Rounds of 60 seconds; rotate the defender each round."
  ],
  "variations": [
   "Easier: defender may only walk, or must keep one hand on head.",
   "Harder: shrink the grid to 8x8 yd.",
   "Harder: attackers must stay on the outside lines (true rondo)."
  ],
  "coaching_points": [
   "Make a triangle — never stand in a line with the defender between you.",
   "Move after you pass to make the triangle again.",
   "Pass to the foot away from the defender.",
   "Talk: call for the ball."
  ],
  "equipment": [
   "1 ball per group",
   "4 cones",
   "1 pinnie"
  ],
  "focus_areas": [
   "Numbers Up",
   "Possession",
   "Passing"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "hot-box-passing",
  "name": "Hot Box Passing",
  "icon": "↔️",
  "category": "Passing",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 15,
  "players": "8–10",
  "description": "Pass and receive quickly in a crowded center area, then play out to a teammate on the outside. Builds scanning and first touch under pressure.",
  "setup": [
   "Grid: 20x20 yd outer square with a 10x10 yd \"hot box\" in the middle",
   "Players: 4 servers on the outer edges (one per side), 3–4 players inside the hot box, 1–2 defenders in the box"
  ],
  "directions": [
   "An outside server passes into a player in the hot box.",
   "The receiver controls and plays out to a different server (not the one who passed in).",
   "Defenders try to win the ball inside the box.",
   "After 90 seconds, inside players swap with servers."
  ],
  "variations": [
   "Easier: no defenders — focus on technique and turning.",
   "Harder: two-touch inside the box.",
   "Harder: receiver must play out to the server opposite the one who passed in."
  ],
  "coaching_points": [
   "Check your shoulder before the ball arrives.",
   "Open body — receive on the back foot and turn in one touch.",
   "Move away from defenders to show for the ball.",
   "Servers: pass to the player who is open, not the one closest."
  ],
  "equipment": [
   "3–4 balls",
   "8 cones",
   "Pinnies"
  ],
  "focus_areas": [
   "Passing",
   "First Touch",
   "Possession"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "ball-mastery-circuit",
  "name": "Ball Mastery Circuit",
  "icon": "⚡",
  "category": "Dribbling",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": null,
  "duration": 10,
  "players": "Any",
  "description": "Get hundreds of touches in a few minutes to build comfort and control with every surface of both feet.",
  "setup": [
   "Each player has a ball in their own space (about 3x3 yd)",
   "Players face the coach so they can copy the demo"
  ],
  "directions": [
   "Coach demos a move; players do it for 30 seconds, rest 15 seconds.",
   "Suggested order: toe taps → inside-inside rolls (tic-tocs) → sole rolls across → pull-push → V-pull → step-over.",
   "Repeat the circuit twice, faster the second time.",
   "Finish with a 30-second \"free style\" where players show their favorite move."
  ],
  "variations": [
   "Easier: slow tempo, each move only with the strong foot.",
   "Harder: eyes up — players call out how many fingers the coach holds up.",
   "Harder: move while traveling across a 15-yd grid.",
   "Count touches in 30 seconds and try to beat it next week."
  ],
  "coaching_points": [
   "Light on your toes, knees bent.",
   "Soft touches — the ball stays close.",
   "Use both feet equally.",
   "Head up between touches."
  ],
  "equipment": [
   "1 ball per player"
  ],
  "focus_areas": [
   "Dribbling",
   "Warmup",
   "Ball Mastery"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "red-light-green-light-soccer",
  "name": "Red Light, Green Light",
  "icon": "⚡",
  "category": "Dribbling",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": "U8",
  "duration": 8,
  "players": "Any",
  "description": "Dribble with control and stop the ball on command. Great first-day game for listening and close control.",
  "setup": [
   "Grid: 20x25 yd; start line at one end",
   "Each player has a ball; coach stands at the far end"
  ],
  "directions": [
   "Green light = dribble toward the coach; yellow = slow dribble; red = stop the ball with the sole.",
   "Players caught moving on red go back 5 steps.",
   "First player to reach the coach's line becomes the traffic light."
  ],
  "variations": [
   "Add colors: blue = turn around, purple = toe taps, orange = sit on the ball.",
   "Use colored cards only (no voice) to work on eyes up.",
   "Harder: on red, players must do a move before stopping."
  ],
  "coaching_points": [
   "Small touches so you can stop quickly.",
   "Stop the ball with the bottom of your foot.",
   "Look up to see the light."
  ],
  "equipment": [
   "1 ball per player",
   "4 cones",
   "Colored cards (optional)"
  ],
  "focus_areas": [
   "Dribbling",
   "Fun",
   "Warmup",
   "Ball Mastery"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "freeze-tag-with-ball",
  "name": "Freeze Tag with Ball",
  "icon": "⚡",
  "category": "Dribbling",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": "U10",
  "duration": 10,
  "players": "8–20",
  "description": "Dribble with eyes up and change direction to avoid taggers; teammates rescue each other with a pass.",
  "setup": [
   "Grid: 20x20 yd",
   "Every player has a ball except 2 taggers in pinnies"
  ],
  "directions": [
   "Taggers try to tag dribblers with a hand.",
   "Tagged players freeze, pick up their ball, and stand with legs wide.",
   "A teammate unfreezes them by passing a ball through their legs.",
   "Play 60–90 seconds; count frozen players; switch taggers."
  ],
  "variations": [
   "Easier: one tagger only.",
   "Harder: taggers also dribble a ball while tagging.",
   "Harder: unfreeze only by dribbling a full circle around the frozen player."
  ],
  "coaching_points": [
   "Eyes up to see the taggers.",
   "Change speed and direction to escape.",
   "Look for frozen teammates and rescue them."
  ],
  "equipment": [
   "1 ball per player",
   "4 cones",
   "2 pinnies"
  ],
  "focus_areas": [
   "Dribbling",
   "Fun",
   "Warmup"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "tail-tag",
  "name": "Tail Tag",
  "icon": "⚡",
  "category": "Dribbling",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": "U8",
  "duration": 8,
  "players": "Any",
  "description": "Dribble while protecting your \"tail\" and steal others' — builds agility, awareness, and close control.",
  "setup": [
   "Grid: 15x20 yd",
   "Each player has a ball and a pinnie tucked into the back of their shorts as a tail"
  ],
  "directions": [
   "Everyone dribbles inside the grid and tries to grab other players' tails.",
   "Players must keep dribbling — no picking up the ball or standing still.",
   "If you lose your tail, do 5 toe taps and keep playing (you can still steal tails).",
   "After 60 seconds, the player with the most tails wins."
  ],
  "variations": [
   "Easier: play without balls first to learn the game.",
   "Harder: shrink the grid.",
   "Team version: two colors of tails — steal only the other team's."
  ],
  "coaching_points": [
   "Keep the ball close so your hands are free.",
   "Turn your body to protect your tail.",
   "Eyes up!"
  ],
  "equipment": [
   "1 ball per player",
   "1 pinnie per player",
   "4 cones"
  ],
  "focus_areas": [
   "Fun",
   "Dribbling",
   "Warmup"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "frogger",
  "name": "Frogger",
  "icon": "⚡",
  "category": "Dribbling",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": "U10",
  "duration": 10,
  "players": "8–16",
  "description": "Dribble through lanes of defenders with low pressure to build confidence going past opponents.",
  "setup": [
   "Grid: 20 yd wide x 30 yd long, split into 3–4 lanes across the field",
   "One defender (\"car\") in each lane, who must stay in their lane; dribblers each have a ball at one end"
  ],
  "directions": [
   "Dribblers (\"frogs\") try to get across all lanes to the far end line.",
   "Cars try to kick balls away but may only move side to side in their lane.",
   "A frog who loses their ball goes back to the start and tries again.",
   "Count crossings in 2 minutes; rotate cars."
  ],
  "variations": [
   "Easier: cars walk, or cars have no ball and only block.",
   "Harder: two cars in the middle lane.",
   "Harder: frogs must dribble back home too."
  ],
  "coaching_points": [
   "Look for the space the car is not in.",
   "Fake one way, go the other.",
   "Speed up once you get past."
  ],
  "equipment": [
   "1 ball per player",
   "10–12 cones",
   "Pinnies for cars"
  ],
  "focus_areas": [
   "Dribbling",
   "Fun",
   "1v1"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "pirate-treasure",
  "name": "Pirate Treasure",
  "icon": "⚡",
  "category": "Dribbling",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": "U8",
  "duration": 10,
  "players": "8–16",
  "description": "Dribble to collect \"treasure\" (balls) and bring it home; teaches dribbling with purpose and changing direction.",
  "setup": [
   "Grid: 25x25 yd with a 5x5 yd home base in each corner",
   "All balls start in the center circle; 4 teams of 2–4 players, one per home base"
  ],
  "directions": [
   "On \"go,\" one player from each team runs out, takes a ball, and dribbles it back to their base.",
   "Next player goes once the first is home (relay style).",
   "When the middle is empty, players may steal from other bases — no defending your base.",
   "After 2 minutes, the team with the most balls wins."
  ],
  "variations": [
   "Easier: everyone on the team can go at once.",
   "Harder: balls must be stopped dead with the sole inside the base to count.",
   "Harder: one \"pirate\" defender can knock away balls in transit."
  ],
  "coaching_points": [
   "Dribble, don't kick — keep it close.",
   "Look up to find which base has the most treasure.",
   "Quick turns when you get the ball."
  ],
  "equipment": [
   "15–20 balls",
   "20 cones",
   "Pinnies (4 colors)"
  ],
  "focus_areas": [
   "Fun",
   "Dribbling"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "cone-weave-relay",
  "name": "Cone Weave Relay",
  "icon": "⚡",
  "category": "Dribbling",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": "U10",
  "duration": 8,
  "players": "6–16",
  "description": "Dribble through tight cones with both feet at speed in a team race.",
  "setup": [
   "3–4 lines of 3–4 players; each line has 6 cones in a row, 1–2 yd apart",
   "A turning cone 5 yd past the last cone"
  ],
  "directions": [
   "First player in each line weaves through the cones, rounds the turning cone, and dribbles straight back.",
   "Stop the ball for the next player with the sole; they go.",
   "First team to have everyone finish sits down and wins.",
   "Run 3–4 races, changing the rule each time."
  ],
  "variations": [
   "Use only the weak foot / only the outside of the foot.",
   "Harder: cones closer together.",
   "Harder: weave back through the cones on the return."
  ],
  "coaching_points": [
   "Tiny touches between the cones.",
   "Use inside and outside of the foot.",
   "Control first, then speed — knocked cones cost time."
  ],
  "equipment": [
   "1 ball per line",
   "7 cones per line"
  ],
  "focus_areas": [
   "Dribbling",
   "Fun",
   "Speed & Agility"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "numbers-game",
  "name": "Numbers Game",
  "icon": "🎯",
  "category": "Technical",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": "U12",
  "duration": 12,
  "players": "8–16",
  "description": "Compete in 1v1, 2v2, or 3v3 battles to goal with instant reactions — fun, competitive, and game-like.",
  "setup": [
   "Field: 20x30 yd with a small goal at each end (or GKs in full goals for older ages)",
   "Two teams line up on opposite sidelines; each player has a number (1, 2, 3…) matching a player on the other team",
   "Coach stands at midfield with the balls"
  ],
  "directions": [
   "Coach calls one or more numbers and plays a ball into the field.",
   "Players with those numbers sprint on and play until a goal or the ball goes out.",
   "Players go back to their line; coach calls new numbers.",
   "Keep score by team."
  ],
  "variations": [
   "Call two or three numbers for 2v2 / 3v3.",
   "Call uneven numbers (2v1) to practice overloads.",
   "Harder: coach plays the ball toward one team to force the other to defend first."
  ],
  "coaching_points": [
   "React fast — first to the ball wins.",
   "Attack quickly before the defender is ready.",
   "Defender: get between the ball and your goal."
  ],
  "equipment": [
   "10+ balls",
   "2 small goals",
   "Cones",
   "Pinnies"
  ],
  "focus_areas": [
   "1v1",
   "Fun",
   "Attacking",
   "Aggression"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "triangle-passing",
  "name": "Triangle Passing",
  "icon": "↔️",
  "category": "Passing",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": null,
  "duration": 10,
  "players": "4–5 per triangle",
  "description": "Pass and move: play the ball, follow your pass, and receive on the back foot to keep the ball moving.",
  "setup": [
   "Three cones in a triangle, 10 yd apart",
   "Players: 4–5 per triangle — 2 at the starting cone, 1 at each other cone"
  ],
  "directions": [
   "Player at cone A passes to cone B, then jogs to cone B.",
   "B receives across the body, passes to C, and follows the pass.",
   "Continue around the triangle for 60 seconds, then switch direction.",
   "Count passes per round; try to beat the score."
  ],
  "variations": [
   "Two-touch, then one-touch.",
   "Add a second ball once players are comfortable.",
   "Harder: receiver must call \"turn\" or \"man on\" and receive accordingly.",
   "Double triangle: two triangles linked — receiver chooses which way to play."
  ],
  "coaching_points": [
   "Receive with the foot farthest from the ball (open body).",
   "First touch out of your feet toward the next cone.",
   "Pass with the inside of the foot, ankle locked.",
   "Move after you pass!"
  ],
  "equipment": [
   "1–2 balls per triangle",
   "3 cones per triangle"
  ],
  "focus_areas": [
   "Passing",
   "First Touch",
   "Warmup",
   "Combination Play"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "y-passing",
  "name": "Y-Passing Pattern",
  "icon": "↔️",
  "category": "Passing",
  "skill_level": "Intermediate",
  "min_age": "U12",
  "max_age": null,
  "duration": 10,
  "players": "6–8 per pattern",
  "description": "Rehearse a game-like passing pattern with a wall pass and third-player run.",
  "setup": [
   "Cones in a Y shape: A (base), B 15 yd ahead, C and D 10 yd diagonally beyond B to each side",
   "Players: 6–8, with balls at A"
  ],
  "directions": [
   "A passes to B, who checks toward the ball.",
   "B lays it back to A (wall pass); A plays a first-time pass into C.",
   "B spins and runs to C; C passes to B in stride; B finishes at D or dribbles to D.",
   "Each player follows the ball to the next cone; alternate sides each rep."
  ],
  "variations": [
   "Easier: remove the lay-off — A passes, B turns and plays to C.",
   "Harder: one-touch everywhere.",
   "Finish with a shot on goal instead of a pass to D."
  ],
  "coaching_points": [
   "Check away, then check to the ball.",
   "Lay-off pass soft and into the runner's path.",
   "Pass in front of moving players, not behind them.",
   "Talk: \"Set!\", \"Turn!\", \"Man on!\""
  ],
  "equipment": [
   "4–6 balls",
   "4 cones"
  ],
  "focus_areas": [
   "Passing",
   "First Touch",
   "Combination Play"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "diamond-passing",
  "name": "Diamond Passing",
  "icon": "↔️",
  "category": "Passing",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 10,
  "players": "5–8",
  "description": "Receive and turn in a continuous passing square, practicing open-body receiving to both sides.",
  "setup": [
   "Four cones in a diamond, 12 yd apart",
   "Players: 2 at the starting cone, 1–2 at each other cone"
  ],
  "directions": [
   "Pass clockwise around the diamond; each player follows their pass.",
   "Receivers open their body and take a first touch toward the next cone.",
   "After 90 seconds, switch to counter-clockwise (works the other foot).",
   "Add a second ball once the rhythm is smooth."
  ],
  "variations": [
   "Pass across the diamond, then back around (adds a diagonal pass).",
   "Harder: wall pass with the next player before each forward pass.",
   "Harder: one-touch only."
  ],
  "coaching_points": [
   "Check away and back before receiving.",
   "Receive on the back foot; first touch across your body.",
   "Pass with pace — no \"dying\" passes."
  ],
  "equipment": [
   "2 balls",
   "4 cones"
  ],
  "focus_areas": [
   "Passing",
   "First Touch",
   "Warmup",
   "Combination Play"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "receiving-back-to-goal",
  "name": "Receiving with Back to Goal",
  "icon": "🎯",
  "category": "Technical",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 12,
  "players": "3 per group",
  "description": "Receive with a defender behind you and decide: turn, shield, or play back.",
  "setup": [
   "Grid: 15x20 yd with a small goal (or end line) for the receiver to attack",
   "Server with balls at one end; receiver facing the server; defender behind the receiver"
  ],
  "directions": [
   "Server passes to the receiver, who has their back to goal.",
   "Defender starts passive (one step off), then live.",
   "Receiver turns and scores if there is space, or shields and plays back to the server if tight.",
   "If played back, the server can pass again or make a 2v1 run.",
   "Rotate roles every 4 reps."
  ],
  "variations": [
   "Easier: defender passive the whole time.",
   "Harder: the defender may tackle from the first touch.",
   "Harder: add a second goal so the receiver can turn either way."
  ],
  "coaching_points": [
   "Check your shoulder to see where the defender is.",
   "Low and wide when shielding — arm out, body between ball and defender.",
   "If the defender is far, turn; if close, shield or play back.",
   "First touch away from the defender."
  ],
  "equipment": [
   "Balls",
   "1 small goal",
   "4 cones",
   "Pinnies"
  ],
  "focus_areas": [
   "First Touch",
   "1v1",
   "Attacking"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "juggling-ladder",
  "name": "Juggling Ladder",
  "icon": "🎯",
  "category": "Technical",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": null,
  "duration": 8,
  "players": "Any",
  "description": "Develop touch and receiving with all surfaces by juggling in levels.",
  "setup": [
   "Each player with a ball in their own space"
  ],
  "directions": [
   "Level 1: drop, one touch with the foot, catch.",
   "Level 2: two touches (foot–foot) then catch; then three, four, five.",
   "Level 3: alternate feet; then thigh–foot–thigh.",
   "Players record their best streak and try to beat it each practice."
  ],
  "variations": [
   "Easier: let the ball bounce once between touches.",
   "Partner juggling: two touches, then volley to a partner.",
   "Harder: juggle while walking a 10-yd line."
  ],
  "coaching_points": [
   "Lock the ankle, toe slightly up, foot flat under the ball.",
   "Soft, small touches — waist height.",
   "Use both feet."
  ],
  "equipment": [
   "1 ball per player"
  ],
  "focus_areas": [
   "First Touch",
   "Warmup",
   "Ball Mastery"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "hit-the-coach",
  "name": "Hit the Coach",
  "icon": "↔️",
  "category": "Passing",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": "U8",
  "duration": 8,
  "players": "Any",
  "description": "Dribble and pass at a moving target — a silly, high-energy way to practice passing accuracy.",
  "setup": [
   "Grid: 20x20 yd",
   "Every player has a ball; coach moves around inside the grid"
  ],
  "directions": [
   "Players dribble and try to hit the coach below the knees with a pass.",
   "Each hit = 1 point; the coach reacts dramatically.",
   "Players must collect their ball and dribble again before the next shot.",
   "Play 2 minutes; then a player becomes the target."
  ],
  "variations": [
   "Weak foot only for 1 minute.",
   "Hits must come from at least 5 yd away.",
   "Two coaches/parents as targets."
  ],
  "coaching_points": [
   "Inside of the foot for accuracy.",
   "Plant foot next to the ball, pointing at the target.",
   "Dribble close, look up, then pass."
  ],
  "equipment": [
   "1 ball per player",
   "4 cones"
  ],
  "focus_areas": [
   "Passing",
   "Fun"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "toss-and-head",
  "name": "Toss and Head",
  "icon": "🎯",
  "category": "Technical",
  "skill_level": "Intermediate",
  "min_age": "U12",
  "max_age": null,
  "duration": 8,
  "players": "Pairs",
  "description": "Learn safe heading technique — forehead contact, eyes open, neck firm — with soft, low-volume reps.",
  "setup": [
   "Partners 3–5 yd apart; one ball per pair (a lighter or slightly under-inflated ball is best)"
  ],
  "directions": [
   "Seated: partner tosses softly; header uses the forehead to send it back to the partner's hands (5 reps).",
   "Kneeling: same, using the upper body to generate power (5 reps).",
   "Standing: step into the header and aim back to the tosser's hands (5 reps).",
   "Switch roles. Keep total headers low (about 10–15 per player per week)."
  ],
  "variations": [
   "Harder: header aims down at the tosser's feet (like a header on goal).",
   "Harder: jumping header from a high toss.",
   "Use a balloon or beach ball for beginners."
  ],
  "coaching_points": [
   "Eyes open, mouth closed.",
   "Hit the ball with your forehead (hairline), not the top of your head.",
   "Firm neck; power comes from the trunk.",
   "Attack the ball — don't let it hit you."
  ],
  "equipment": [
   "1 ball per pair (light/soft)"
  ],
  "focus_areas": [
   "Heading"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "3v2-to-goal",
  "name": "3v2 to Goal",
  "icon": "♟️",
  "category": "Tactical",
  "skill_level": "Advanced",
  "min_age": "U12",
  "max_age": null,
  "duration": 15,
  "players": "10–15 + GK",
  "description": "Use width and support to create a free player in a 3v2 attack and finish.",
  "setup": [
   "Field: 30x35 yd with a goal and GK at one end",
   "Three attacking lines at midfield (left, center, right); two defending lines by the goal posts"
  ],
  "directions": [
   "Center attacker dribbles forward; wide players run with them.",
   "Two defenders step out to defend.",
   "Attackers have 15 seconds to score.",
   "If defenders win it, they counter to two small goals or the halfway line.",
   "Rotate lines after each rep."
  ],
  "variations": [
   "Easier: 3v1 to start, then add the second defender.",
   "Harder: a third defender recovers from midfield after 3 seconds.",
   "Harder: limit attackers to 3 touches each."
  ],
  "coaching_points": [
   "Stay wide — stretch the defenders.",
   "Ball carrier: attack at speed, commit a defender.",
   "Third player: overlap or underlap to create the free player.",
   "Shoot early when there's a window."
  ],
  "equipment": [
   "Balls",
   "1 goal + GK",
   "2 small counter goals",
   "Cones",
   "Pinnies"
  ],
  "focus_areas": [
   "Numbers Up",
   "Attacking",
   "Finishing"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "world-cup",
  "name": "World Cup",
  "icon": "🥅",
  "category": "Shooting",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": null,
  "duration": 15,
  "players": "8–16",
  "description": "Finish under pressure in a fun knockout tournament.",
  "setup": [
   "One goal with GK (or coach in goal); 18x25 yd field in front of it",
   "Players in pairs; each pair picks a country"
  ],
  "directions": [
   "Coach throws a ball in; everyone plays every pair for themselves.",
   "When a player scores, their pair is through to the next round and steps off.",
   "The last pair without a goal is out.",
   "Play rounds until one pair (the World Cup winner) remains."
  ],
  "variations": [
   "Solo version for smaller groups (every player for themselves).",
   "Eliminated pairs become extra keepers or field defenders.",
   "Harder: goals only count from first-time finishes."
  ],
  "coaching_points": [
   "Shoot early — don't take an extra touch.",
   "Follow your shot for rebounds.",
   "Work with your partner: combine to score."
  ],
  "equipment": [
   "10+ balls",
   "1 goal",
   "Pinnies (one color per pair)"
  ],
  "focus_areas": [
   "Finishing",
   "Fun"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "shooting-gallery",
  "name": "Shooting Gallery",
  "icon": "🥅",
  "category": "Shooting",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 10,
  "players": "6–12 + GK",
  "description": "Strike the ball cleanly on goal from a lay-off, with many reps and fast turnover.",
  "setup": [
   "Goal with GK; a server/target player standing at the top of the 18",
   "Two shooting lines 25 yd out, left and right of center, with balls"
  ],
  "directions": [
   "Shooter passes into the target player and follows.",
   "Target lays the ball off into the shooter's path.",
   "Shooter strikes first time or after one touch from 16–20 yd.",
   "Shooter retrieves the ball and swaps lines; alternate sides each rep."
  ],
  "variations": [
   "Easier: coach rolls the ball in front of the shooter.",
   "Harder: a defender chases from behind after the lay-off.",
   "Weak-foot round: right-side line shoots left-footed."
  ],
  "coaching_points": [
   "Plant foot beside the ball, pointing at the target.",
   "Strike with the laces, toe down, ankle locked.",
   "Body over the ball to keep it low.",
   "Aim for the corners — low and away from the keeper."
  ],
  "equipment": [
   "10+ balls",
   "1 goal + GK",
   "Cones"
  ],
  "focus_areas": [
   "Finishing"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "finishing-wave-crosses",
  "name": "Crossing and Finishing Wave",
  "icon": "🥅",
  "category": "Shooting",
  "skill_level": "Advanced",
  "min_age": "U12",
  "max_age": null,
  "duration": 15,
  "players": "8–14 + GK",
  "description": "Deliver crosses from wide areas and make attacking runs to finish (near post, far post, top of box).",
  "setup": [
   "Goal with GK; full or half field width",
   "Wide players with balls on each wing; strikers in two lines at the top of the 18"
  ],
  "directions": [
   "Winger dribbles down the line toward the end line and crosses.",
   "Two strikers time their runs: one near post, one far post.",
   "Finish first time if possible.",
   "Next wave starts from the other wing; players rotate positions."
  ],
  "variations": [
   "Easier: crosses from a stationary position (cutback from the edge of the box).",
   "Harder: add 1–2 defenders in the box.",
   "Add a third runner to the penalty spot for cutbacks."
  ],
  "coaching_points": [
   "Winger: look up before crossing; aim between GK and defenders.",
   "Strikers: arrive late and at speed — don't stand and wait.",
   "Attack the near post; far post player stays behind the ball.",
   "Side-foot volleys for accuracy."
  ],
  "equipment": [
   "10+ balls",
   "1 goal + GK",
   "Cones"
  ],
  "focus_areas": [
   "Attacking",
   "Finishing",
   "Crossing"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "jockey-mirror",
  "name": "Jockey Mirror Drill",
  "icon": "♟️",
  "category": "Tactical",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 10,
  "players": "Pairs",
  "description": "Learn defensive footwork — sideways stance, short steps, and staying goal-side — without the ball, then with it.",
  "setup": [
   "Channel: 5 yd wide x 10 yd long per pair",
   "Pairs: one attacker, one defender facing each other"
  ],
  "directions": [
   "Without a ball: attacker moves forward, side to side, and changes pace; defender mirrors while backpedaling in a sideways stance.",
   "30 seconds per round, switch roles.",
   "With a ball: attacker dribbles to cross the far line; defender jockeys and only tackles when the touch is too big.",
   "Defender wins a point by stopping the attacker before the line."
  ],
  "variations": [
   "Easier: attacker walks.",
   "Harder: wider channel (8 yd) so the defender must force one way.",
   "Harder: defender must force the attacker to the weak foot."
  ],
  "coaching_points": [
   "Stay on your toes, knees bent, low center of gravity.",
   "Sideways stance — show the attacker one way.",
   "Arm's length away; don't cross your feet.",
   "Be patient: tackle on a heavy touch."
  ],
  "equipment": [
   "1 ball per pair",
   "4 cones per channel"
  ],
  "focus_areas": [
   "Defending",
   "1v1"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "pressure-cover-2v2",
  "name": "Pressure and Cover 2v2",
  "icon": "♟️",
  "category": "Tactical",
  "skill_level": "Advanced",
  "min_age": "U12",
  "max_age": null,
  "duration": 15,
  "players": "8–12",
  "description": "Teach two defenders to work together: the first presses the ball, the second covers at an angle behind.",
  "setup": [
   "Field: 20x25 yd with two small goals (or end line) for attackers; defenders defend a line or goal",
   "2 attackers vs 2 defenders; extras wait at each end"
  ],
  "directions": [
   "Coach serves to the attackers.",
   "Nearest defender pressures the ball; the second defender takes a cover position about 3–5 yd behind at an angle.",
   "Attackers try to score; defenders try to win it and dribble over the attackers' end line.",
   "When the ball switches to the other attacker, defenders swap roles.",
   "Rotate in new pairs after each rep."
  ],
  "variations": [
   "Easier: attackers limited to walking pace on the first few reps.",
   "Start with a 2-defender cone drill: shuttle between cones to practice pressure/cover positions.",
   "Harder: 3v3 to add the third defender (balance)."
  ],
  "coaching_points": [
   "First defender: close down fast, slow down as you arrive, force them to your teammate.",
   "Second defender: angle behind — close enough to help, far enough to stop the pass behind.",
   "Talk: \"I've got ball!\", \"Cover!\", \"Force left!\"",
   "Swap roles quickly when the ball moves."
  ],
  "equipment": [
   "Balls",
   "2 small goals",
   "6 cones",
   "Pinnies"
  ],
  "focus_areas": [
   "Defending",
   "Pressing"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "four-goal-game",
  "name": "4 Goal Game",
  "icon": "🎲",
  "category": "Games",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": null,
  "duration": 20,
  "players": "8–10",
  "description": "Find the open goal: teams attack two goals each, which rewards switching play and scanning.",
  "setup": [
   "Field: 25x35 yd; two small goals on each end line, near the corners",
   "Two teams of 4 (no GKs)"
  ],
  "directions": [
   "Play 4v4; each team can score in either of the two goals they attack.",
   "Restarts: kick-ins from the sideline, corners from the end line.",
   "Play 3–4 minute games; rest 1 minute."
  ],
  "variations": [
   "Harder: goal only counts after a switch of play (a pass from one half to the other).",
   "Harder: 2-touch limit.",
   "Add neutral players on the sidelines to help the team in possession."
  ],
  "coaching_points": [
   "Width: stay spread out so you can attack both goals.",
   "If one goal is blocked, switch to the other.",
   "Defenders: shift together toward the ball."
  ],
  "equipment": [
   "Balls",
   "4 small goals",
   "Cones",
   "Pinnies"
  ],
  "focus_areas": [
   "Small-Sided Game",
   "Attacking",
   "Possession"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "end-zone-game",
  "name": "End Zone Game",
  "icon": "🎲",
  "category": "Games",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": null,
  "duration": 15,
  "players": "6–10",
  "description": "Keep possession and time a pass into the end zone for a running teammate — teaches penetrating passes and runs.",
  "setup": [
   "Field: 20x25 yd with a 2–3 yd end zone at each end",
   "Two teams of 3–5"
  ],
  "directions": [
   "Teams score by passing into the end zone to a teammate who runs onto it and stops it inside the zone.",
   "The receiver may not enter the zone before the ball (like offside).",
   "After a score, the scoring team keeps the ball and attacks the other end.",
   "Play 4-minute games."
  ],
  "variations": [
   "Easier: allow one teammate to wait in the zone (max 5 seconds).",
   "Easier: score by dribbling into the zone.",
   "Harder: 5 passes before a team may score."
  ],
  "coaching_points": [
   "Ball carrier: head up — look for the run.",
   "Runner: time your run, curve it to stay onside.",
   "Support the ball when you don't have a run."
  ],
  "equipment": [
   "Balls",
   "8 cones",
   "Pinnies"
  ],
  "focus_areas": [
   "Small-Sided Game",
   "Possession",
   "Attacking"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "counter-attack-4v4",
  "name": "4v4 + GKs Transition Game",
  "icon": "♟️",
  "category": "Tactical",
  "skill_level": "Advanced",
  "min_age": "U12",
  "max_age": null,
  "duration": 20,
  "players": "12–14 + 2 GK",
  "description": "React quickly when the ball changes hands: attack fast after winning it, recover fast after losing it.",
  "setup": [
   "Field: 30x40 yd with full-size or medium goals and GKs",
   "Two teams of 4 + a third team waiting behind one goal"
  ],
  "directions": [
   "Play 4v4. A goal scored within 6 seconds of winning the ball counts double.",
   "When a team scores, the defending team leaves and the waiting team enters immediately with a ball from the GK.",
   "The scoring team must instantly defend.",
   "Play 6–8 minutes; keep score across rotations."
  ],
  "variations": [
   "Easier: no 6-second bonus; just play.",
   "Harder: when the ball is lost, the team must touch their own half before defending (forces recovery runs).",
   "Add neutral wide players for 4v4+2."
  ],
  "coaching_points": [
   "Win it → look forward first.",
   "Lose it → nearest player presses for 5 seconds, others recover goal-side.",
   "Run in behind when your team wins the ball."
  ],
  "equipment": [
   "10+ balls",
   "2 goals + GKs",
   "Cones",
   "Pinnies (3 colors)"
  ],
  "focus_areas": [
   "Transition",
   "Small-Sided Game",
   "Attacking"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "gk-diving-progression",
  "name": "Goalkeeper Diving Progression",
  "icon": "🧤",
  "category": "Goalkeeping",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 10,
  "players": "1–3 keepers",
  "description": "Teach keepers to dive safely and catch, starting low to the ground and building height.",
  "setup": [
   "Soft grass or mats; goal or two cones as a goal",
   "Coach with balls 3–5 yd from the keeper"
  ],
  "directions": [
   "Sitting: keeper sits, coach rolls a ball to the side; keeper falls onto their side and catches (5 each side).",
   "Kneeling: keeper on knees, coach throws at hip height to the side; keeper dives and catches (5 each side).",
   "Crouching (squat): same, pushing off the near foot.",
   "Standing: set position, coach serves to the side; keeper takes a step and dives."
  ],
  "variations": [
   "Easier: rolled balls only.",
   "Harder: dive, get up, and react to a second ball to the other side.",
   "Harder: low shots driven from 8 yd."
  ],
  "coaching_points": [
   "Land on your side, not your stomach or elbow.",
   "Hands W shape behind the ball; bottom hand behind, top hand on top.",
   "Push off the foot nearest the ball.",
   "Get up fast after the save."
  ],
  "equipment": [
   "6–10 balls",
   "GK gloves",
   "Goal or cones",
   "Mat (optional)"
  ],
  "focus_areas": [
   "Goalkeeping"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "gk-shot-stopping-gates",
  "name": "Goalkeeper Gate Battle",
  "icon": "🧤",
  "category": "Goalkeeping",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 10,
  "players": "2–4 keepers",
  "description": "Keepers face each other between two small goals, saving shots and distributing — reps of handling, footwork, and throwing.",
  "setup": [
   "Two goals (or cone goals 6 yd wide) facing each other 15–20 yd apart",
   "One keeper in each goal; balls next to each goal"
  ],
  "directions": [
   "Keepers take turns trying to score on each other by throwing, rolling, or kicking from their own goal line.",
   "Saves earn the right to shoot back immediately.",
   "First to 5 goals wins; rotate in other keepers."
  ],
  "variations": [
   "Easier: throws only, shorter distance.",
   "Harder: volleys or half-volleys only.",
   "Harder: field players shoot from the side; keepers must save and distribute."
  ],
  "coaching_points": [
   "Set position when the opponent is about to shoot.",
   "Catch and secure — \"eat the ball.\"",
   "Throw accurately with an overarm motion.",
   "Move side to side with shuffle steps, don't cross your feet."
  ],
  "equipment": [
   "10 balls",
   "2 goals or 4 cones",
   "GK gloves"
  ],
  "focus_areas": [
   "Goalkeeping",
   "Fun"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "dynamic-warmup",
  "name": "Dynamic Warm-up",
  "icon": "🔥",
  "category": "Warmup",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 15,
  "players": "Any",
  "description": "Prepare muscles and joints for play and reduce injury risk with running, strength, and balance moves.",
  "setup": [
   "Two lines of cones 15–20 yd apart",
   "Players in pairs or small groups at the start cones"
  ],
  "directions": [
   "Jog out and back.",
   "Hip out (open the gate), hip in (close the gate).",
   "Side shuffle, carioca (grapevine), high knees, butt kicks.",
   "Strength: 5 squats, 5 walking lunges, 3 slow Nordic lowers (older ages).",
   "Balance: single-leg stand 15 seconds each leg, passing a ball with a partner.",
   "Finish with 2 runs at 75% and 1 at 90% speed."
  ],
  "variations": [
   "Younger players: animal moves (bear crawl, frog jumps, crab walk).",
   "Add a ball for each player and do the moves while dribbling."
  ],
  "coaching_points": [
   "Knees over toes — don't let knees collapse inward.",
   "Land softly on the balls of your feet.",
   "Quality over speed."
  ],
  "equipment": [
   "8–10 cones",
   "Balls (optional)"
  ],
  "focus_areas": [
   "Warmup"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "two-touch-tennis",
  "name": "Two Touch Tennis",
  "icon": "🎯",
  "category": "Technical",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 15,
  "players": "2 or 4 per court",
  "description": "Control a bouncing ball and play it back over a net in two touches — builds first touch, volleys, and juggling skill in a fun game.",
  "setup": [
   "Court: 8x16 yd split by a \"net\" (row of cones, rope, or a bench)",
   "1v1 or 2v2; one ball"
  ],
  "directions": [
   "Server drops the ball and kicks it over the net into the opponent's half.",
   "Ball may bounce once; receiver controls with the first touch and plays it back over with the second.",
   "Doubles: team gets up to 3 touches total, one per player.",
   "Point lost for: two bounces, ball out, too many touches, or failing to clear the net. Play to 7."
  ],
  "variations": [
   "Easier: allow two bounces, or catch-and-volley for beginners.",
   "Harder: one touch only (direct volley).",
   "Harder: no bounces allowed.",
   "Head-only point: the return must be a header (U12+)."
  ],
  "coaching_points": [
   "Get your body behind the ball early.",
   "Cushion the first touch so it pops up in front of you.",
   "Use thigh, chest, and both feet.",
   "Aim for the open space on their side."
  ],
  "equipment": [
   "1 ball per court",
   "Cones / rope / or bench for the net"
  ],
  "focus_areas": [
   "First Touch",
   "Fun"
  ],
  "video_file": "2touchtenis.mp4",
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "roly-poly",
  "name": "Roly Poly",
  "icon": "🎲",
  "category": "Games",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": null,
  "duration": 5,
  "players": "Any",
  "description": "A silly team-building challenge: kick the ball up, do a forward roll, and catch it before it lands. Builds coordination and laughs.",
  "setup": [
   "Open grass; each player (or pair) has a ball"
  ],
  "directions": [
   "Player kicks (or tosses then kicks) the ball straight up as high as they can.",
   "They do a forward somersault, pop up, and try to catch the ball before it lands.",
   "Count successful catches; team challenge — how many can the whole team get in 2 minutes?"
  ],
  "variations": [
   "Easier: catch after one bounce, or toss with hands instead of kicking.",
   "Harder: control the ball with the foot instead of catching.",
   "Partner version: one kicks, the other rolls and catches."
  ],
  "coaching_points": [
   "Kick it high and straight with the laces.",
   "Tuck your chin for the roll.",
   "Eyes find the ball fast after the roll."
  ],
  "equipment": [
   "1 ball per player or pair"
  ],
  "focus_areas": [
   "Fun"
  ],
  "video_file": "rollyPolly.mp4",
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "champions-court",
  "name": "Champions Court",
  "icon": "🎲",
  "category": "Games",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": null,
  "duration": 20,
  "players": "8–24",
  "description": "Short, intense small-sided games where winners move up a field and losers move down — maximum competition and touches.",
  "setup": [
   "3–5 small fields side by side (about 15x20 yd each) with small goals",
   "Field 1 = Champions Court on one end, lowest field on the other",
   "Teams of 1, 2, or 3 depending on space"
  ],
  "directions": [
   "All fields play 2-minute games at the same time.",
   "When the whistle blows, winners move up one field, losers move down one.",
   "Ties: rock-paper-scissors or a 1-shot shootout.",
   "Winners on the top field stay; losers on the bottom field stay.",
   "Play 6–8 rounds; the team on Champions Court at the end wins."
  ],
  "variations": [
   "Change format by round: 1v1, then 2v2, then 3v3.",
   "Add a condition per round (weak foot only, must score from a pass).",
   "Individual version: shuffle partners each round so players are ranked, not teams."
  ],
  "coaching_points": [
   "Compete every second — games are short.",
   "Shoot early in small fields.",
   "Win the ball back immediately when you lose it."
  ],
  "equipment": [
   "Balls",
   "6–10 small goals or cones",
   "Pinnies"
  ],
  "focus_areas": [
   "Small-Sided Game",
   "Fun",
   "1v1",
   "Aggression"
  ],
  "video_file": "worldCupWithPromoAndDemo.mp4",
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "tic-tac-toe-relay",
  "name": "Tic Tac Toe Relay",
  "icon": "⚡",
  "category": "Dribbling",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": "U12",
  "duration": 10,
  "players": "6–10",
  "description": "Combine a dribbling (or sprint) relay with quick team decisions — race to get three in a row.",
  "setup": [
   "3x3 grid of cones (or hoops) 15–20 yd from the start line",
   "Two teams of 3–5 in lines; each team has 3 pinnies of one color",
   "Optional slalom cones between the start and the grid"
  ],
  "directions": [
   "On \"go,\" the first player from each team dribbles through the slalom to the grid and places a pinnie on a cone.",
   "They dribble back and tag the next player.",
   "After all 3 pinnies are placed, players may move one of their own pinnies to a new spot each turn.",
   "First team with three in a row wins the round."
  ],
  "variations": [
   "No-ball version as a warm-up sprint.",
   "Harder: the player must stop the ball in the grid with the sole before placing the pinnie.",
   "Harder: weak foot only on the slalom."
  ],
  "coaching_points": [
   "Close control through the slalom — speed after it.",
   "Team talk: plan the next move before your turn.",
   "Quick, clean hand-offs."
  ],
  "equipment": [
   "Balls",
   "9 cones or hoops",
   "Slalom cones",
   "Pinnies (2 colors / 3 each)"
  ],
  "focus_areas": [
   "Fun",
   "Dribbling",
   "Warmup",
   "Speed & Agility"
  ],
  "video_file": "ticTacToeRaceWithConesNoBall.mp4",
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "two-touch-box",
  "name": "Two Touch Box",
  "icon": "🎯",
  "category": "Technical",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": null,
  "duration": 10,
  "players": "3 per group",
  "description": "Middle player receives and plays out the other side in exactly two touches — directional first touch and passing rhythm.",
  "setup": [
   "3x3 yd box in the middle, with a server 10 yd away on each side",
   "Groups of 3: one inside the box, two servers outside"
  ],
  "directions": [
   "Server A passes into the middle player.",
   "Middle player's first touch turns the ball toward Server B; second touch passes to B.",
   "B passes back in; repeat for 45–60 seconds.",
   "Rotate so everyone plays the middle."
  ],
  "variations": [
   "Easier: allow three touches.",
   "Harder: one-touch lay-off back to the passer, then receive from the other side.",
   "Harder: a passive defender behind the middle player.",
   "Servers call \"turn\" or \"back\" to tell the middle player what to do."
  ],
  "coaching_points": [
   "Open your body toward the next server before the ball arrives.",
   "First touch across your body, out of your feet.",
   "Check your shoulder.",
   "Firm, accurate second touch."
  ],
  "equipment": [
   "1–2 balls per group",
   "4 cones"
  ],
  "focus_areas": [
   "First Touch",
   "Passing"
  ],
  "video_file": "twoTouchBoxDrill.mp4",
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "left-right-drop",
  "name": "Left, Right, Drop",
  "icon": "🎯",
  "category": "Technical",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 8,
  "players": "Pairs",
  "description": "React to a call, turn, and receive — trains communication, reaction time, and a controlled first touch out to the side.",
  "setup": [
   "Pairs: coach/server and player 8–10 yd apart",
   "Player faces away from the server, bouncing on their toes"
  ],
  "directions": [
   "Server calls \"Left,\" \"Right,\" or \"Drop\" as they pass.",
   "Player turns to face the ball.",
   "\"Left\": first touch out to their left, then pass back. \"Right\": touch to the right, pass back.",
   "\"Drop\": one-touch pass straight back.",
   "10 reps, then switch roles."
  ],
  "variations": [
   "Harder: a defender closes in on \"Left\"/\"Right\" calls.",
   "Harder: call later (when the ball is halfway).",
   "Add \"Turn\" = turn and dribble away."
  ],
  "coaching_points": [
   "Stay on your toes — no flat feet.",
   "Turn quickly and find the ball early.",
   "Touch to the side with control, not too far.",
   "Listen to the call — this is how teammates talk in games."
  ],
  "equipment": [
   "1 ball per pair"
  ],
  "focus_areas": [
   "First Touch",
   "Warmup",
   "Speed & Agility"
  ],
  "video_file": "practice/reaction_with_ball.mp4",
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "diagonal-cone-dribbling",
  "name": "Diagonal Cone Dribbling Series",
  "icon": "⚡",
  "category": "Dribbling",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": null,
  "duration": 10,
  "players": "2–3 per line",
  "description": "Five progressive dribbling techniques through the same zig-zag cone line: strong foot, weak foot, alternating, pull-push, and step-over.",
  "setup": [
   "6–8 cones in a zig-zag (diagonal) pattern, 3–4 yd apart",
   "2–3 players per line, each with a ball"
  ],
  "directions": [
   "Round 1: right foot only, cutting at each cone.",
   "Round 2: left foot only.",
   "Round 3: alternate feet — inside of one foot, then the other.",
   "Round 4: pull-push — sole pull back, then push to the next cone.",
   "Round 5: step-over at each cone, then cut away.",
   "Jog back on the outside; 2 reps per round."
  ],
  "variations": [
   "Easier: cones wider apart; walk through first.",
   "Harder: race a partner on a mirrored line.",
   "Harder: finish with a shot on goal."
  ],
  "coaching_points": [
   "Small touches into the cone, big touch out of it.",
   "Lean and push off at each change of direction.",
   "Eyes up between cones."
  ],
  "equipment": [
   "1 ball per player",
   "6–8 cones per line"
  ],
  "focus_areas": [
   "Dribbling",
   "Warmup",
   "Ball Mastery"
  ],
  "video_file": "5dibblingimprove.mp4",
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "figure-8-control",
  "name": "Figure 8 Cone Control",
  "icon": "⚡",
  "category": "Dribbling",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": "U12",
  "duration": 8,
  "players": "Any",
  "description": "Tight dribbling around two cones using every surface of the foot.",
  "setup": [
   "Two cones 3 yd apart per player",
   "Each player has a ball"
  ],
  "directions": [
   "Dribble in a figure 8 around the cones for 30 seconds per surface.",
   "Order: right foot only → left foot only → insides → outsides → sole rolls → scissors at each cone → V-turns.",
   "15-second rest between sets."
  ],
  "variations": [
   "Harder: count laps in 30 seconds and try to beat it.",
   "Harder: eyes up — call out the coach's fingers.",
   "Cones closer together for tighter control."
  ],
  "coaching_points": [
   "Ball stays within a step of your feet.",
   "Lean into the turn.",
   "Light, quick touches."
  ],
  "equipment": [
   "1 ball per player",
   "2 cones per player"
  ],
  "focus_areas": [
   "Dribbling",
   "Warmup",
   "Ball Mastery"
  ],
  "video_file": "figure8_1_4.mp4",
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "defensive-containment-progression",
  "name": "Defensive Containment Progression",
  "icon": "♟️",
  "category": "Tactical",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 12,
  "players": "Pairs",
  "description": "Teach defenders to shift their hips with the attacker, step across the body, and tackle with the body first instead of poking.",
  "setup": [
   "Channels 5 yd wide x 15 yd long",
   "Pairs: one attacker with a ball, one defender"
  ],
  "directions": [
   "Warm-up: attacker dribbles slowly; defender shadows (\"running like a defender\") down the channel.",
   "Defender shifts hips every time the attacker changes direction.",
   "Coach calls \"Attack!\": defender steps across the attacker's body — arm first, post on the body — and tackles.",
   "Then live without the coach's call: defender looks for openings to win the ball.",
   "Switch roles after each rep."
  ],
  "variations": [
   "Easier: attacker walks.",
   "Harder: attacker can go at full speed and score by crossing the end line.",
   "Harder: wider channel."
  ],
  "coaching_points": [
   "Don't poke — body up.",
   "Step across the body; even if you miss, you slow the attacker.",
   "Shift hips, stay low, stay patient.",
   "Be confident when you commit."
  ],
  "equipment": [
   "1 ball per pair",
   "4 cones per channel"
  ],
  "focus_areas": [
   "Defending",
   "1v1"
  ],
  "video_file": "practice/defensive attack technique.mp4",
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "get-out-of-the-zone",
  "name": "Can You Get Out of the Zone?",
  "icon": "🎯",
  "category": "Technical",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 10,
  "players": "Pairs",
  "description": "Attacker tries to escape a tight zone; defender stays in position and picks the right moment to tackle.",
  "setup": [
   "Small square (6x6 yd) inside a larger area",
   "Attacker with a ball starts inside; defender starts inside too"
  ],
  "directions": [
   "Attacker tries to dribble out of any side of the zone under control.",
   "Defender tries to keep them in and win the ball.",
   "20-second rounds; attacker scores 1 point for escaping, defender 1 point for winning it.",
   "Switch roles."
  ],
  "variations": [
   "Easier: bigger zone for the attacker.",
   "Harder: attacker may only escape through two marked sides.",
   "Harder: after escaping, attacker must pass to a target player."
  ],
  "coaching_points": [
   "Defender: stay balanced and in position before tackling.",
   "Defender: make an educated decision — tackle on a heavy touch.",
   "Attacker: use your body to shield; change speed to escape."
  ],
  "equipment": [
   "1 ball per pair",
   "4 cones per zone"
  ],
  "focus_areas": [
   "1v1",
   "Defending",
   "Dribbling",
   "Aggression"
  ],
  "video_file": "canYouGetOutOfTheZone.mp4",
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "touch-and-feel",
  "name": "Touch & Feel",
  "icon": "🎯",
  "category": "Technical",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 8,
  "players": "4 per group",
  "description": "Pass and receive while a player runs in and touches you — learn to keep composure when you feel pressure.",
  "setup": [
   "Two passers 10 yd apart; two pressure players each by a cone 5 yd off to the side",
   "Groups of 4"
  ],
  "directions": [
   "Passers pass back and forth.",
   "As a player receives, the pressure player on that side runs from their cone and touches them on the back.",
   "Receiver controls and passes back; the pressure player returns to their cone.",
   "Continue; after 60 seconds swap passers and pressure players."
  ],
  "variations": [
   "Harder: pressure player may tackle lightly instead of just touching.",
   "Harder: receiver must turn away from the pressure side before passing.",
   "One-touch passing round."
  ],
  "coaching_points": [
   "Feel the pressure — keep your body between it and the ball.",
   "First touch away from the pressure.",
   "Stay calm; accurate pass still matters."
  ],
  "equipment": [
   "1 ball per group",
   "2 cones"
  ],
  "focus_areas": [
   "First Touch",
   "Passing"
  ],
  "video_file": "touchAndFeel.mp4",
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "multi-ball-deception",
  "name": "Multi-Ball Deception Game",
  "icon": "🎯",
  "category": "Technical",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 10,
  "players": "2 + GK per rep",
  "description": "Attacker uses fakes to choose one of several balls and shoot; defender stays in front to block.",
  "setup": [
   "4–5 cones each with a ball on top, spread across the top of the box (18–20 yd out)",
   "Goal with a GK; one attacker and one defender"
  ],
  "directions": [
   "Attacker moves between the balls, faking toward one and then going to another.",
   "Defender shuffles to stay in front of the attacker.",
   "When the attacker gets a step on the defender, they strike the nearest ball at goal.",
   "Each round ends after 3 shots; switch roles."
  ],
  "variations": [
   "Easier: defender may only shuffle (no tackling).",
   "Harder: attacker has 10 seconds per shot.",
   "Use only 3 balls closer together."
  ],
  "coaching_points": [
   "Attacker: sell the fake with your body and eyes.",
   "Attacker: shoot as soon as there's a window.",
   "Defender: stay square, small steps, stay between ball and goal."
  ],
  "equipment": [
   "5 balls",
   "5 cones",
   "1 goal + GK"
  ],
  "focus_areas": [
   "1v1",
   "Finishing",
   "Defending",
   "Aggression"
  ],
  "video_file": "shooting_defending_game.mp4",
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "two-touch-passing-game",
  "name": "Two Touch Passing Game",
  "icon": "↔️",
  "category": "Passing",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": null,
  "duration": 8,
  "players": "Pairs",
  "description": "Partners compete to pass through a cone gate using strict two-touch: touch wide, then pass through the middle.",
  "setup": [
   "Two players 10–12 yd apart with a 2-yd gate of cones in the middle"
  ],
  "directions": [
   "Players pass to each other through the middle gate.",
   "Receiver must take the first touch wide (outside the line of the gate), then pass back through the gate.",
   "Lose a point for hitting a cone, taking more than two touches, or missing the gate.",
   "First to 5 wins; rotate partners."
  ],
  "variations": [
   "Easier: wider gate.",
   "Harder: narrower gate or longer distance.",
   "Harder: weak foot only."
  ],
  "coaching_points": [
   "First touch sets up the pass — out of your feet and wide.",
   "Lock your ankle; pass with the inside of the foot.",
   "Follow through toward the gate."
  ],
  "equipment": [
   "1 ball per pair",
   "2 cones per pair"
  ],
  "focus_areas": [
   "Passing",
   "First Touch",
   "Fun"
  ],
  "video_file": "practice/two_touch_passing_game.mp4",
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "side-to-side-first-touch",
  "name": "Side to Side First Touch",
  "icon": "🎯",
  "category": "Technical",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": null,
  "duration": 6,
  "players": "Pairs",
  "description": "Receive while moving laterally: touch left and pass, shuffle, touch right and pass.",
  "setup": [
   "Two cones 5 yd apart; server 8 yd in front"
  ],
  "directions": [
   "Player starts at the left cone; server passes to them.",
   "Player touches left (away from the middle) and passes back.",
   "Player shuffles to the right cone; server passes; touch right, pass back.",
   "Continue 30–45 seconds; switch roles."
  ],
  "variations": [
   "Easier: two touches allowed each way.",
   "Harder: server serves in the air (thigh / chest control).",
   "Harder: one touch only."
  ],
  "coaching_points": [
   "Move to the ball — don't wait for it.",
   "First touch in the direction you're going.",
   "On your toes for the shuffle."
  ],
  "equipment": [
   "1 ball per pair",
   "2 cones per pair"
  ],
  "focus_areas": [
   "First Touch",
   "Passing",
   "Warmup"
  ],
  "video_file": "sideToSideBetterFirstTouchDrill.mp4",
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "feint-dribble-shoot-relay",
  "name": "Feint, Dribble, Shoot Relay",
  "icon": "⚡",
  "category": "Dribbling",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": null,
  "duration": 10,
  "players": "6–12",
  "description": "Practice a feint at a \"defender\" (wall/mannequin), a controlled dribble, and a placed side-foot shot — with a speed dribble back for fitness.",
  "setup": [
   "Two lines 25 yd from goal; a pole, mannequin, or tall cone 10 yd in front of each line",
   "Goal (with or without GK)"
  ],
  "directions": [
   "Player dribbles at the pole and feints (one line feints left, the other right).",
   "Controlled dribble toward goal; low side-foot shot.",
   "Player collects the ball, speed-dribbles back around the outside, and rejoins the line.",
   "Make it a relay: first line to 5 goals wins."
  ],
  "variations": [
   "Swap feint sides every round.",
   "Harder: live defender instead of the pole.",
   "Use a different feint each round (body feint, step-over, scissors)."
  ],
  "coaching_points": [
   "Feint 2 yd before the pole — not too early, not too late.",
   "Burst after the feint.",
   "Placement over power: low and to the corner."
  ],
  "equipment": [
   "Balls",
   "2 poles or tall cones",
   "1 goal"
  ],
  "focus_areas": [
   "Dribbling",
   "Finishing",
   "Fun"
  ],
  "video_file": "practice/feint_dribbler_controled_shot.mp4",
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "passing-ladder-two-touch",
  "name": "Two-Touch Passing Ladder",
  "icon": "↔️",
  "category": "Passing",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": null,
  "duration": 8,
  "players": "Pairs",
  "description": "Quick-footed passing with both feet on a partner line — move to the ball, stay on your toes.",
  "setup": [
   "Partners 8–10 yd apart; a line of 3 cones (2 yd apart) on each player's side to move along"
  ],
  "directions": [
   "Partner passes; player moves up a cone to meet it, receives with the right foot, passes back.",
   "Player moves back a cone, receives with the left foot, passes back.",
   "Coach calls \"one touch\" or \"two touch\" to change the rule.",
   "45 seconds each, switch roles."
  ],
  "variations": [
   "Easier: two touch only.",
   "Harder: coach switches the call every 10 seconds.",
   "Add a third player as a passive defender."
  ],
  "coaching_points": [
   "Move to the ball — don't wait.",
   "On your toes, light feet.",
   "Use both feet equally.",
   "Urgent and focused."
  ],
  "equipment": [
   "1 ball per pair",
   "6 cones per pair"
  ],
  "focus_areas": [
   "Passing",
   "First Touch",
   "Warmup"
  ],
  "video_file": "practice/passing ladder.mp4",
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "three-zone-touch",
  "name": "Three Zone Touch",
  "icon": "↔️",
  "category": "Passing",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 8,
  "players": "Pairs",
  "description": "Move sideways through three zones with a different touch rule in each — both feet, quick decisions, head up.",
  "setup": [
   "Three side-by-side grids (3x3 yd each) facing a server 8 yd away"
  ],
  "directions": [
   "Zone 1: two-touch, left foot.",
   "Zone 2: one-touch.",
   "Zone 3: two-touch, right foot.",
   "Player shuffles from zone to zone after each pass, then reverses (3 → 2 → 1).",
   "Coach holds up fingers; player calls out the number while playing."
  ],
  "variations": [
   "Easier: no number call.",
   "Harder: server switches the order of zones.",
   "Harder: add a fourth zone (receive and turn)."
  ],
  "coaching_points": [
   "Head up between passes.",
   "Move quickly between zones.",
   "Use the right foot for each zone."
  ],
  "equipment": [
   "1 ball per pair",
   "8 cones"
  ],
  "focus_areas": [
   "Passing",
   "First Touch"
  ],
  "video_file": "practice/2L 1 2R.mp4",
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "fifty-touches",
  "name": "50 Touches",
  "icon": "🔥",
  "category": "Warmup",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 8,
  "players": "3 per group",
  "description": "A fast warm-up with a long pass, short pass, turn, and weak-foot pass on repeat — constant movement and coming to the ball.",
  "setup": [
   "Groups of 3 in a line: A and C on the ends (25 yd apart), B in the middle"
  ],
  "directions": [
   "A plays a long pass (dominant foot) to C.",
   "C plays a short pass into B, who checks toward the ball.",
   "B turns and plays a short pass with the non-dominant foot to A.",
   "Rotate positions every 10 passes; aim for 50 total touches each."
  ],
  "variations": [
   "Harder: one-touch for the middle player.",
   "Harder: long pass must be in the air.",
   "Easier: shorten the long pass to 15 yd."
  ],
  "coaching_points": [
   "Come to the ball instead of waiting.",
   "On your toes the whole time.",
   "Open up before you turn."
  ],
  "equipment": [
   "1 ball per group",
   "3 cones"
  ],
  "focus_areas": [
   "Warmup",
   "Passing",
   "First Touch"
  ],
  "video_file": "practice/new 50 touches.mp4",
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "circle-receive-turn",
  "name": "Circle Receive and Turn",
  "icon": "🎯",
  "category": "Technical",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": null,
  "duration": 8,
  "players": "6–8",
  "description": "Receive, turn, and pass to the next player around a circle — continuous turning reps.",
  "setup": [
   "6–8 cones in a circle, 10 yd apart; one player at each cone",
   "One or two balls"
  ],
  "directions": [
   "Player 1 passes to player 2.",
   "Player 2 receives, turns (coach names the turn: inside, outside, drag back, Cruyff), and passes to player 3.",
   "Continue around the circle; switch direction after 1 minute.",
   "Add a second ball once the rhythm is good."
  ],
  "variations": [
   "Easier: receive and pass without the turn.",
   "Harder: one player defends in the middle.",
   "Harder: skip a player (pass across the circle)."
  ],
  "coaching_points": [
   "Don't turn blind — look before the ball arrives.",
   "On your toes, no flat feet.",
   "Avoid a heavy first touch."
  ],
  "equipment": [
   "1–2 balls",
   "6–8 cones"
  ],
  "focus_areas": [
   "First Touch",
   "Passing",
   "Warmup"
  ],
  "video_file": "turn3.mp4",
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "break-the-line",
  "name": "Break the Line",
  "icon": "🔄",
  "category": "Possession",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 12,
  "players": "10–12",
  "description": "Move the ball across a line until a gap opens, then pass through the defenders to the far zone.",
  "setup": [
   "Field: 20 yd wide, split into three 10-yd zones",
   "Rows of 4 in each end zone (attackers), 2–3 defenders in the middle zone"
  ],
  "directions": [
   "Top row passes horizontally until they find a gap in the middle defenders.",
   "They play a pass through to the bottom row = 1 point.",
   "Bottom row repeats the other direction.",
   "Defenders who intercept switch with the passer. 4-minute rounds."
  ],
  "variations": [
   "Easier: only 2 defenders.",
   "Harder: two-touch limit.",
   "Harder: one attacker may dribble into the middle to create a 2v1."
  ],
  "coaching_points": [
   "Move the ball quickly to shift the defenders.",
   "Look for the gap before you receive.",
   "Pass firm and on the ground through the gap.",
   "Defenders: shift together, stay compact."
  ],
  "equipment": [
   "2–3 balls",
   "8 cones",
   "Pinnies"
  ],
  "focus_areas": [
   "Possession",
   "Passing",
   "Defending",
   "Team Shape"
  ],
  "video_file": "breakTheLock.mp4",
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "player-chess",
  "name": "Player Chess",
  "icon": "↔️",
  "category": "Passing",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": null,
  "duration": 10,
  "players": "6–10",
  "description": "A team-building puzzle: pass, then move — the team must get every player into the target circles.",
  "setup": [
   "Area 30x30 yd with 4–5 hoop/cone circles scattered inside",
   "One team (6–10 players), one ball"
  ],
  "directions": [
   "Turns alternate: first a pass, then one player without the ball makes a move.",
   "The goal is to receive the ball inside a circle.",
   "A player who receives in a circle is \"through\" and steps out.",
   "Team finishes when all players are through; time it and try to beat the time."
  ],
  "variations": [
   "Harder: add 1–2 defenders who can intercept.",
   "Harder: silent round — no talking.",
   "Easier: fewer players, more circles."
  ],
  "coaching_points": [
   "Talk and plan together.",
   "Move to where you can receive.",
   "Pass to feet so teammates can control in the circle."
  ],
  "equipment": [
   "1 ball",
   "4–5 hoops or cone circles"
  ],
  "focus_areas": [
   "Passing",
   "Fun",
   "Possession"
  ],
  "video_file": "passMoveTalk.mp4",
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "striking-windows",
  "name": "Striking Windows",
  "icon": "🥅",
  "category": "Shooting",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 10,
  "players": "2 + GK",
  "description": "Striker moves along the 18 and shoots only when a window opens; defender can only shuffle and block.",
  "setup": [
   "5 balls spread along the 18-yd line",
   "Striker on one side of the balls, defender on the goal side; GK in goal"
  ],
  "directions": [
   "Striker runs side to side along the line of balls.",
   "Defender may only shuffle and get their body in front — no tackling.",
   "Striker shoots any ball when they find an opening.",
   "Round ends when all 5 balls are used; switch roles."
  ],
  "variations": [
   "Harder: 15-second limit for all 5 shots.",
   "Harder: defender may also step to block the ball.",
   "Easier: 3 balls, closer together."
  ],
  "coaching_points": [
   "Striker: quick shot — no extra touch.",
   "Striker: change speed to wrong-foot the defender.",
   "Defender: urgency closing in; body in front of the ball."
  ],
  "equipment": [
   "5 balls",
   "1 goal + GK"
  ],
  "focus_areas": [
   "Finishing",
   "Defending"
  ],
  "video_file": "practice/shooterVsDef.mp4",
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "striker-series-four-phase",
  "name": "Striker Series (4 Shots)",
  "icon": "🥅",
  "category": "Shooting",
  "skill_level": "Intermediate",
  "min_age": "U12",
  "max_age": null,
  "duration": 12,
  "players": "4–8 + GK",
  "description": "Four finishing types in one rep: dribble and shoot, cut in left, cut in right, and a combination volley — great for strikers and keepers.",
  "setup": [
   "Two center cones and two wide cones 20–25 yd from goal; GK in goal",
   "Coach/server with 4 balls"
  ],
  "directions": [
   "Ball 1: dribble past the center cone and shoot on the dribble.",
   "Ball 2: run outside the left cone, cut in, shoot with the left foot.",
   "Ball 3: run outside the right cone, cut in, shoot with the right foot.",
   "Ball 4: check to the other center cone, lay off to the coach, receive a ball in the air, and finish.",
   "Next striker goes; rotate keepers."
  ],
  "variations": [
   "Easier: remove ball 4.",
   "Harder: a recovering defender chases each rep.",
   "Harder: all 4 shots within 20 seconds."
  ],
  "coaching_points": [
   "Placement first, then power.",
   "Use the correct foot on the cut-ins.",
   "Keep moving between shots."
  ],
  "equipment": [
   "8+ balls",
   "4 cones",
   "1 goal + GK"
  ],
  "focus_areas": [
   "Finishing",
   "Attacking",
   "Goalkeeping"
  ],
  "video_file": "practice/4_action_finish.mov",
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "post-up-flip-hit",
  "name": "Post Up, Flip, Hit",
  "icon": "🥅",
  "category": "Shooting",
  "skill_level": "Intermediate",
  "min_age": "U12",
  "max_age": null,
  "duration": 10,
  "players": "3 + GK per group",
  "description": "Forwards receive with back to goal, post up on a defender, turn sharply, and shoot quickly.",
  "setup": [
   "Top of the box; GK in goal",
   "Coach/server with balls 20 yd out; forward with a defender behind them"
  ],
  "directions": [
   "Coach passes to the forward.",
   "Forward posts on the defender (shields), feels where they are.",
   "Forward turns quickly away from the defender and shoots.",
   "Defender starts passive, then live. Rotate roles every 3 reps."
  ],
  "variations": [
   "Easier: passive defender only.",
   "Harder: forward has 3 seconds to shoot.",
   "Harder: add a lay-off option to a supporting player."
  ],
  "coaching_points": [
   "Low and wide when posting; arm out.",
   "Feel the defender, then turn the other way.",
   "Shoot quickly — the space closes fast."
  ],
  "equipment": [
   "Balls",
   "1 goal + GK",
   "Pinnies"
  ],
  "focus_areas": [
   "Finishing",
   "First Touch",
   "Attacking"
  ],
  "video_file": "practice/runposttranshit.mp4",
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "bounce-through-finish",
  "name": "Bounce, Through Ball, Finish",
  "icon": "🥅",
  "category": "Shooting",
  "skill_level": "Intermediate",
  "min_age": "U12",
  "max_age": null,
  "duration": 12,
  "players": "6–12 + GK",
  "description": "Combination finish: bounce pass to a partner, run in behind, receive the through ball, and finish first time.",
  "setup": [
   "Two lines 30 yd from goal: passers at the center, partners at a cone 10 yd ahead",
   "GK in goal"
  ],
  "directions": [
   "Player A passes into B (checking toward the ball).",
   "B bounces (lays) it back to A.",
   "A plays a through ball into space; B spins and sprints onto it — or B plays it and A runs.",
   "Runner finishes first time. Switch lines."
  ],
  "variations": [
   "Easier: two touches before the finish.",
   "Harder: recovering defender starts on the halfway line.",
   "Ireland version: drop pass → checking run → explosive sprint → finish."
  ],
  "coaching_points": [
   "Check in sharply, then spin away.",
   "Lay-off pass soft and in front of the passer.",
   "Through ball into space, weighted for the runner.",
   "Side foot for accuracy on the first-time finish."
  ],
  "equipment": [
   "Balls",
   "2 cones",
   "1 goal + GK"
  ],
  "focus_areas": [
   "Finishing",
   "Passing",
   "Attacking",
   "Combination Play"
  ],
  "video_file": "liverpoolFinishingDrill.mp4",
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "reaction-finishing",
  "name": "Reaction Finishing",
  "icon": "🥅",
  "category": "Shooting",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 8,
  "players": "3–6 + GK",
  "description": "Find the ball quickly and finish first time (or within two bounces) when it drops from behind.",
  "setup": [
   "Striker 12–14 yd from goal facing the goal; coach behind them with balls",
   "GK in goal"
  ],
  "directions": [
   "Coach tosses a ball over the striker's head at varying heights and speeds.",
   "Striker finds the ball and shoots first time or within two bounces.",
   "5 balls each; rotate."
  ],
  "variations": [
   "Easier: coach calls \"now\" when tossing.",
   "Harder: toss to either side so the striker must adjust.",
   "Harder: add a defender who also chases the drop."
  ],
  "coaching_points": [
   "Find the ball early.",
   "Adjust your feet to it — don't reach.",
   "If you're in the box, shoot it."
  ],
  "equipment": [
   "10 balls",
   "1 goal + GK"
  ],
  "focus_areas": [
   "Finishing"
  ],
  "video_file": "reactionFinishing.mp4",
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "shoot-and-defend-transition",
  "name": "Shoot and Track Back",
  "icon": "♟️",
  "category": "Tactical",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 12,
  "players": "8–14 + GK",
  "description": "After shooting, the shooter must transition immediately to defend the other team's attack.",
  "setup": [
   "Goal with GK; field 25x30 yd",
   "Red team in one line, yellow team in another, both 25 yd out"
  ],
  "directions": [
   "A red player dribbles and shoots on goal, then sprints to touch the goal post.",
   "When they touch the post, a yellow player attacks with a ball; the red player becomes the defender.",
   "When that play ends, the yellow player touches the post and the next red player attacks.",
   "Continue alternating; keep score by team."
  ],
  "variations": [
   "Easier: defender only needs to delay (no tackling).",
   "Harder: 2v1 — two attackers against the recovering defender.",
   "Harder: attacker has 6 seconds to shoot."
  ],
  "coaching_points": [
   "Shoot, then switch on immediately to defend.",
   "Defender: sprint to get goal-side, then slow down and jockey.",
   "Attacker: go quickly before the defender is set."
  ],
  "equipment": [
   "10+ balls",
   "1 goal + GK",
   "Pinnies (2 colors)"
  ],
  "focus_areas": [
   "Transition",
   "Finishing",
   "Defending"
  ],
  "video_file": "transitionalShooting.mp4",
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "three-station-finishing",
  "name": "3 Station Finishing",
  "icon": "🥅",
  "category": "Shooting",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 15,
  "players": "6–12 + GK",
  "description": "A rotating finishing circuit: open shot, then 1v1, then 2v1 — the shooter becomes the next defender.",
  "setup": [
   "Goal with GK; three lines 20–25 yd out (left, center, right)"
  ],
  "directions": [
   "Station 1: player takes a two-touch open shot.",
   "Station 2: that player becomes the defender in a 1v1 against the next attacker.",
   "Station 3: the same defender now defends a 2v1.",
   "Players rotate to the back of the next line."
  ],
  "variations": [
   "Easier: remove station 3.",
   "Harder: time limit on each attack.",
   "Harder: a second defender joins station 3 late (2v2)."
  ],
  "coaching_points": [
   "Every shot on target — make the keeper work.",
   "Attackers: commit the defender, then pass or shoot.",
   "Defender: delay and force the attacker wide."
  ],
  "equipment": [
   "10+ balls",
   "1 goal + GK",
   "Cones"
  ],
  "focus_areas": [
   "Finishing",
   "1v1",
   "Numbers Up"
  ],
  "video_file": "3stationFinishing.mp4",
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "around-the-world-shooting",
  "name": "Around the World",
  "icon": "🥅",
  "category": "Shooting",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": null,
  "duration": 10,
  "players": "2–8",
  "description": "Score from every cone around the box in order — accuracy under a little pressure.",
  "setup": [
   "5–10 cones in a semicircle around the goal box, 10–16 yd out",
   "GK optional; one ball per player"
  ],
  "directions": [
   "Shoot from the first cone; if you score, move to the next.",
   "Miss and you start over (or go back one cone for younger players).",
   "First player to score from every cone wins."
  ],
  "variations": [
   "Easier: miss = stay at the same cone.",
   "Harder: weak foot from the cones on the weak side.",
   "Harder: one touch to set and shoot from a pass."
  ],
  "coaching_points": [
   "Pick a corner before you shoot.",
   "Placement over power.",
   "Plant foot next to the ball, pointing at the target."
  ],
  "equipment": [
   "Balls",
   "5–10 cones",
   "1 goal"
  ],
  "focus_areas": [
   "Finishing",
   "Fun"
  ],
  "video_file": "aroundTheWorld.mp4",
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "gk-angle-play",
  "name": "Goalkeeper Angle Play",
  "icon": "🧤",
  "category": "Goalkeeping",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 12,
  "players": "1–3 keepers + shooters",
  "description": "Teach keepers to move along an arc and position between ball and goal to make the target as small as possible.",
  "setup": [
   "Goal; cones marking an arc 2–4 yd off the goal line",
   "Servers/shooters with balls at 5–6 positions around the 18"
  ],
  "directions": [
   "Coach points to a shooter; keeper shuffles along the arc and gets set on the line between ball and center of goal.",
   "Coach checks the position (look from behind the ball: are both posts equally covered?).",
   "Add live shots: shooter shoots after the keeper is set.",
   "Progress to shooters moving the ball across the 18 so the keeper adjusts constantly."
  ],
  "variations": [
   "Easier: rope tied from post to the ball spot to show the angle.",
   "Harder: a quick pass between shooters, then a first-time shot.",
   "Add \"6 at the 18\": keeper steps to the 6-yd line when the ball is at the 18 (older keepers)."
  ],
  "coaching_points": [
   "Set position: feet shoulder-width, weight forward, hands ready.",
   "Shuffle — don't cross your feet.",
   "Stand on the line from the ball to the middle of the goal.",
   "Be set before the shot."
  ],
  "equipment": [
   "10 balls",
   "1 goal",
   "6–8 cones",
   "GK gloves"
  ],
  "focus_areas": [
   "Goalkeeping"
  ],
  "video_file": "defendSmallestGoalPossibleGoalie.mp4",
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "gk-breakaway-1v1",
  "name": "Goalkeeper Breakaway 1v1",
  "icon": "🧤",
  "category": "Goalkeeping",
  "skill_level": "Intermediate",
  "min_age": "U12",
  "max_age": null,
  "duration": 10,
  "players": "1–2 keepers + attackers",
  "description": "Keepers learn when to come out, how to stay big, and how to use a leg block or smother on a breakaway.",
  "setup": [
   "Goal with GK; attackers in a line 25 yd out with balls"
  ],
  "directions": [
   "Attacker dribbles toward goal at 70% speed.",
   "Keeper comes out to narrow the angle, gets set when the attacker is about to shoot.",
   "Keeper uses a leg block (one knee down, body spread) or smothers if the touch is too big.",
   "Progress to full-speed breakaways; rotate keepers every 5 reps."
  ],
  "variations": [
   "Easier: walking attackers; keeper practices the shape only.",
   "Harder: attacker starts from a wider angle.",
   "Harder: recovering defender chasing the attacker."
  ],
  "coaching_points": [
   "Come out on the attacker's heavy touch.",
   "Stay big — don't dive early.",
   "Set before the shot; hands low and wide.",
   "Smother with hands, protect your head."
  ],
  "equipment": [
   "10 balls",
   "1 goal",
   "GK gloves"
  ],
  "focus_areas": [
   "Goalkeeping",
   "1v1",
   "Aggression"
  ],
  "video_file": "legBlockBreakawayGoalie.mp4",
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "gk-scoop-and-cover",
  "name": "Goalkeeper Scoop and Cover",
  "icon": "🧤",
  "category": "Goalkeeping",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": null,
  "duration": 8,
  "players": "1–3 keepers",
  "description": "Securely collect rolled and low shots using a scoop, then protect the ball against the body.",
  "setup": [
   "Keeper in goal or between cones; server 8–10 yd away with balls"
  ],
  "directions": [
   "Server rolls the ball straight at the keeper: keeper scoops (pinky fingers together) and brings it to the chest.",
   "Server rolls to the side: keeper shuffles, gets behind the ball, scoops.",
   "Server hits low, firm shots: keeper uses the knee-down (K-barrier) scoop.",
   "8–10 reps each, then rotate."
  ],
  "variations": [
   "Harder: bouncing balls.",
   "Harder: after the save, distribute with a roll to a target.",
   "Easier: slower, closer rolls."
  ],
  "coaching_points": [
   "Get your body behind the ball.",
   "Hands together, fingers down, scoop up to the chest.",
   "Cover the ball — \"eat it.\""
  ],
  "equipment": [
   "10 balls",
   "Goal or cones",
   "GK gloves"
  ],
  "focus_areas": [
   "Goalkeeping",
   "Warmup"
  ],
  "video_file": "goalie_scoop_cover.mp4",
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "monster-turns",
  "name": "Monster Turns",
  "icon": "⚡",
  "category": "Dribbling",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": "U8",
  "duration": 8,
  "players": "Any",
  "description": "Young players dribble toward a \"monster,\" then turn away with the ball when it wakes up — first lesson in turning away from pressure.",
  "setup": [
   "Grid: 20x20 yd; players with a ball on one end line",
   "Coach (the monster) stands at the far end, \"asleep\""
  ],
  "directions": [
   "Players dribble slowly toward the sleeping monster.",
   "When the monster \"wakes up\" (roars), players turn with the ball and dribble back to the safe end line.",
   "Anyone the monster tags (or whose ball the monster steals) becomes a monster helper.",
   "Repeat; coach names a turn to use (pull-back, inside cut)."
  ],
  "variations": [
   "Easier: monster only walks.",
   "Harder: monster wakes up at random (fake wake-ups).",
   "Harder: specific turn required each round."
  ],
  "coaching_points": [
   "Keep the ball close when sneaking up.",
   "Turn fast and use your body to protect the ball.",
   "Speed up after the turn."
  ],
  "equipment": [
   "1 ball per player",
   "4 cones"
  ],
  "focus_areas": [
   "Dribbling",
   "Fun",
   "Ball Mastery"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "simon-says-ball",
  "name": "Simon Says (with a Ball)",
  "icon": "⚡",
  "category": "Dribbling",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": "U8",
  "duration": 8,
  "players": "Any",
  "description": "Close control and listening: players only do the ball move if \"Simon says.\"",
  "setup": [
   "Grid: 15x15 yd; each player with a ball"
  ],
  "directions": [
   "Players dribble freely.",
   "Coach calls commands: \"Simon says toe taps,\" \"Simon says stop with your sole,\" \"Simon says left foot only.\"",
   "If the coach gives a command without \"Simon says\" and a player does it, they do 5 toe taps and rejoin.",
   "Let players take turns as Simon."
  ],
  "variations": [
   "Add body parts: \"Simon says stop the ball with your knee/elbow/bottom.\"",
   "Harder: faster commands, more moves (pull-back, step-over)."
  ],
  "coaching_points": [
   "Small touches so you can react.",
   "Listen carefully.",
   "Try moves with both feet."
  ],
  "equipment": [
   "1 ball per player",
   "4 cones"
  ],
  "focus_areas": [
   "Dribbling",
   "Fun",
   "Warmup",
   "Ball Mastery"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "follow-the-leader-dribble",
  "name": "Follow the Leader",
  "icon": "⚡",
  "category": "Dribbling",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": "U10",
  "duration": 6,
  "players": "Any",
  "description": "Dribble while copying a leader's path and moves — eyes up and changes of direction.",
  "setup": [
   "Grid: 20x20 yd",
   "Pairs or groups of 3, each player with a ball"
  ],
  "directions": [
   "Leader dribbles anywhere in the grid, changing speed, direction, and moves.",
   "Followers copy exactly while staying a few yards behind.",
   "Switch leaders every 45 seconds."
  ],
  "variations": [
   "Harder: leader must do a new move every 10 seconds.",
   "Mirror version: partners face each other, follower mirrors the leader.",
   "Coach as the leader for the whole group (younger ages)."
  ],
  "coaching_points": [
   "Eyes up to see the leader.",
   "Keep the ball close so you can change direction.",
   "Leaders: be creative!"
  ],
  "equipment": [
   "1 ball per player",
   "4 cones"
  ],
  "focus_areas": [
   "Dribbling",
   "Fun",
   "Warmup",
   "Ball Mastery"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "1v1-dribble-box",
  "name": "1v1 Dribble Box",
  "icon": "🎯",
  "category": "Technical",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": null,
  "duration": 10,
  "players": "Pairs",
  "description": "Beat a defender 1v1 by dribbling over their end line under control.",
  "setup": [
   "Box: 10x15 yd per pair",
   "Attacker and defender face each other on opposite end lines"
  ],
  "directions": [
   "Defender passes to the attacker and closes down.",
   "Attacker scores by stopping the ball on the defender's end line.",
   "Defender scores by winning it and dribbling over the attacker's line.",
   "Play 3 reps, then switch roles."
  ],
  "variations": [
   "Easier: wider box.",
   "Harder: narrower box (forces moves, not speed).",
   "Score through one of two small cone gates on the end line instead."
  ],
  "coaching_points": [
   "Attack the defender at speed.",
   "Use a move when you're 1–2 yd away.",
   "Explode past them after the move.",
   "Defender: sideways stance, force them one way."
  ],
  "equipment": [
   "1 ball per pair",
   "4 cones per box"
  ],
  "focus_areas": [
   "1v1",
   "Dribbling",
   "Defending",
   "Aggression"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "give-and-go",
  "name": "Give-and-Go (Wall Pass)",
  "icon": "♟️",
  "category": "Tactical",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 12,
  "players": "3 per group",
  "description": "Beat a defender with a quick pass-and-run combination.",
  "setup": [
   "Channel 15x25 yd; small goal or end line at the far end",
   "Attacker with ball, a \"wall\" player (teammate) to the side, one defender"
  ],
  "directions": [
   "Stage 1 (no defender): attacker passes to the wall, runs past a cone, receives the return pass.",
   "Stage 2: passive defender; attacker dribbles at the defender, passes to the wall, sprints around the defender, receives and scores.",
   "Stage 3: live defender; attacker chooses wall pass or dribble.",
   "Rotate roles every 3 reps."
  ],
  "variations": [
   "Easier: wall player is the coach.",
   "Harder: wall player is also limited to one touch.",
   "Harder: two defenders, two wall players (2v2 + combinations)."
  ],
  "coaching_points": [
   "Draw the defender in before you pass.",
   "Pass and sprint — go right away.",
   "Wall: one-touch return into the space ahead of the runner."
  ],
  "equipment": [
   "Balls",
   "Cones",
   "1 small goal",
   "Pinnies"
  ],
  "focus_areas": [
   "Numbers Up",
   "Passing",
   "Attacking",
   "Combination Play"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "flighted-ball-receiving",
  "name": "2v2 + 1 Flighted Receiving",
  "icon": "🎯",
  "category": "Technical",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 12,
  "players": "5 per field",
  "description": "Control lofted balls (thigh, chest, instep) and play on in a small game.",
  "setup": [
   "Grid 20x30 yd with two small goals",
   "2v2 plus one neutral server outside who only plays balls in the air"
  ],
  "directions": [
   "Every restart comes from the neutral server with a lofted pass.",
   "The team that controls it attacks the opposite goal.",
   "Goal scored after controlling an aerial ball = 2 points.",
   "Rotate the server every 2 minutes."
  ],
  "variations": [
   "Easier: server throws the ball in.",
   "Harder: receiver must control and pass in two touches.",
   "Technique stage: pairs serve to each other and control with thigh, chest, instep (no game)."
  ],
  "coaching_points": [
   "Get in line with the ball early.",
   "Cushion — give with the body part as the ball arrives.",
   "Control it into space, away from the defender."
  ],
  "equipment": [
   "Balls",
   "2 small goals",
   "Cones",
   "Pinnies"
  ],
  "focus_areas": [
   "First Touch",
   "Small-Sided Game"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "cover-me",
  "name": "Cover Me",
  "icon": "♟️",
  "category": "Tactical",
  "skill_level": "Advanced",
  "min_age": "U12",
  "max_age": null,
  "duration": 12,
  "players": "11",
  "description": "Defenders learn to shift as a line: nearest defender presses, teammates slide over to close passing gaps.",
  "setup": [
   "Field 30x20 yd; 3 defenders in a line in the middle zone",
   "4 attackers on each end line passing across"
  ],
  "directions": [
   "Attackers on one side try to pass through the defensive line to the other side.",
   "Nearest defender presses the ball; the other two shift to cover the gaps.",
   "If the ball gets through: 1 point to attackers; if intercepted: 1 point to defenders.",
   "Rotate defenders every 3 minutes."
  ],
  "variations": [
   "Easier: 2 defenders vs 3 attackers each side, smaller field.",
   "Harder: attackers may dribble into the zone.",
   "Harder: add a 4th defender and a target player."
  ],
  "coaching_points": [
   "Press the ball; teammates shift toward it.",
   "Stay connected — no big gaps.",
   "Talk: \"Pressure!\", \"Slide!\", \"Cover!\""
  ],
  "equipment": [
   "Balls",
   "Cones",
   "Pinnies"
  ],
  "focus_areas": [
   "Defending",
   "Pressing",
   "Team Shape"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "gladiators-arena",
  "name": "Gladiators Arena",
  "icon": "🎲",
  "category": "Games",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 20,
  "players": "8–16",
  "description": "Intense 4v4 games in a tight arena with quick rotations — attacking and defending duels everywhere.",
  "setup": [
   "Arena 20x25 yd with small goals (no GKs)",
   "Teams of 4; waiting teams outside acting as bumpers on the sidelines"
  ],
  "directions": [
   "Play 2–3 minute games.",
   "Sideline players are bumpers: they can pass back in to the team that played it to them (one touch).",
   "Winner stays; loser rotates out to the sideline."
  ],
  "variations": [
   "Harder: bumpers are neutral and play for whoever passes to them.",
   "Harder: goals only count from a 1-touch finish.",
   "Make it 3v3 for more touches."
  ],
  "coaching_points": [
   "Win your duel.",
   "Use the bumpers to escape pressure.",
   "Shoot early in small spaces."
  ],
  "equipment": [
   "Balls",
   "2 small goals",
   "Cones",
   "Pinnies"
  ],
  "focus_areas": [
   "Small-Sided Game",
   "Attacking",
   "Defending",
   "Aggression"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "rondo-transition-4v4-3",
  "name": "4v4 + 3 Possession Transition",
  "icon": "🔄",
  "category": "Possession",
  "skill_level": "Advanced",
  "min_age": "U12",
  "max_age": null,
  "duration": 15,
  "players": "11",
  "description": "Keep the ball with neutral players' help (7v4), and react immediately when possession changes.",
  "setup": [
   "Grid 20x20 yd",
   "Two teams of 4 + 3 neutral players (one in the middle, two on opposite sides)"
  ],
  "directions": [
   "Team in possession plays with the neutrals (7v4).",
   "8 passes = 1 point.",
   "When the defending team wins the ball, they immediately become the possession team with the neutrals.",
   "Play 3-minute rounds; rotate neutrals."
  ],
  "variations": [
   "Easier: bigger grid, 3 touches.",
   "Harder: neutrals one-touch only.",
   "Harder: after winning the ball, team must pass to a neutral within 3 seconds."
  ],
  "coaching_points": [
   "Lose it → press immediately (5-second rule).",
   "Win it → get wide and big quickly.",
   "Use the neutrals to switch play."
  ],
  "equipment": [
   "Balls",
   "4 cones",
   "Pinnies (3 colors)"
  ],
  "focus_areas": [
   "Possession",
   "Transition"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "switch-play-long-pass",
  "name": "Switch the Play",
  "icon": "↔️",
  "category": "Passing",
  "skill_level": "Intermediate",
  "min_age": "U12",
  "max_age": null,
  "duration": 15,
  "players": "12",
  "description": "Keep the ball in one zone, then switch with a long pass to teammates on the far side.",
  "setup": [
   "Field 40x30 yd split into two 15-yd wide zones with a 10-yd neutral channel between",
   "4v2 in each zone (or 3v1 for younger players)"
  ],
  "directions": [
   "Team keeps the ball in zone A against 2 defenders.",
   "After 3 passes, they may switch with a long pass to teammates in zone B = 1 point.",
   "Defenders shift: one defender from zone A runs to help in zone B (or stays).",
   "If defenders win it, they swap with the player who lost it."
  ],
  "variations": [
   "Easier: shorten the neutral channel.",
   "Harder: switch must be in the air.",
   "Harder: receiving team must control and play in two touches."
  ],
  "coaching_points": [
   "Look up and see the far side early.",
   "Long pass: strike through the middle-bottom of the ball with the laces/instep.",
   "Receiving team: spread wide before the switch."
  ],
  "equipment": [
   "Balls",
   "Cones",
   "Pinnies"
  ],
  "focus_areas": [
   "Passing",
   "Possession",
   "Team Shape"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "gk-distribution-targets",
  "name": "Goalkeeper Distribution Targets",
  "icon": "🧤",
  "category": "Goalkeeping",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 10,
  "players": "1–3 keepers",
  "description": "Distribute accurately with rolls, throws, drop kicks, and punts to targets at different distances.",
  "setup": [
   "Keeper at the edge of the box; cone gates or teammates at 15, 25, and 40 yd"
  ],
  "directions": [
   "Roll (bowling action) to the 15-yd gate (5 reps).",
   "Overarm throw to the 25-yd gate (5 reps).",
   "Drop kick or punt to the 40-yd target (5 reps).",
   "Score 1 point per accurate distribution; beat your score next time."
  ],
  "variations": [
   "Harder: a field player shoots, keeper saves, then distributes quickly to the target the coach calls.",
   "Harder: targets are moving players.",
   "Add ground passes with the feet for back-pass practice."
  ],
  "coaching_points": [
   "Roll: step toward target, low release like bowling.",
   "Throw: big arm circle, follow through to the target.",
   "Punt: drop the ball, don't toss it; lock the ankle.",
   "Look up to pick the target before you release."
  ],
  "equipment": [
   "10 balls",
   "6 cones",
   "GK gloves"
  ],
  "focus_areas": [
   "Goalkeeping"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "gk-high-balls",
  "name": "Goalkeeper High Balls and Crosses",
  "icon": "🧤",
  "category": "Goalkeeping",
  "skill_level": "Intermediate",
  "min_age": "U12",
  "max_age": null,
  "duration": 10,
  "players": "1–2 keepers + servers",
  "description": "Catch high balls at the highest point and claim crosses with confidence and a loud call.",
  "setup": [
   "Goal with keeper; servers on each wing with balls",
   "Optional: 1–2 passive attackers in the box"
  ],
  "directions": [
   "Stage 1: coach tosses high balls in front of the keeper; keeper calls \"Keeper!\" and catches at the highest point (W hands).",
   "Stage 2: crosses from the wings; keeper decides to come or stay.",
   "Stage 3: passive then live attackers; keeper claims or punches.",
   "Rotate keepers every 6 reps."
  ],
  "variations": [
   "Easier: thrown crosses.",
   "Harder: crosses with pace from the end line.",
   "Add the punch: two-fist punch high and wide when it's crowded."
  ],
  "coaching_points": [
   "Call early and loud: \"Keeper!\" or \"Away!\"",
   "Take off on one foot, raise the opposite knee for protection.",
   "Catch at the highest point, then bring it in.",
   "If you can't catch it cleanly, punch it high and wide."
  ],
  "equipment": [
   "10 balls",
   "1 goal",
   "GK gloves"
  ],
  "focus_areas": [
   "Goalkeeping",
   "Crossing"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "king-of-the-ring",
  "name": "King of the Ring",
  "icon": "🎯",
  "category": "Technical",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": null,
  "duration": 8,
  "players": "6–20",
  "description": "Shield your own ball while trying to knock others' balls out of the circle.",
  "setup": [
   "Circle or square about 15x15 yd (shrink as players are knocked out)",
   "Every player with a ball"
  ],
  "directions": [
   "Players dribble inside the area, protecting their ball while kicking others' balls out.",
   "If your ball leaves the area, collect it and do a quick challenge (10 toe taps) to return.",
   "Last-player-standing version: players who are out wait for the next round."
  ],
  "variations": [
   "Keep everyone playing: return after a challenge (best for young players).",
   "Harder: shrink the area every 30 seconds.",
   "Team version: two colors; knock out the other team only."
  ],
  "coaching_points": [
   "Body between the ball and the opponent.",
   "Arm out for balance, knees bent, low.",
   "Keep the ball on the foot farthest from the opponent.",
   "Look up for chances to attack."
  ],
  "equipment": [
   "1 ball per player",
   "Cones"
  ],
  "focus_areas": [
   "1v1",
   "Dribbling",
   "Fun",
   "Aggression"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "shuttle-with-ball",
  "name": "Shuttle Runs with Ball",
  "icon": "🏃",
  "category": "Fitness",
  "skill_level": "Intermediate",
  "min_age": "U12",
  "max_age": null,
  "duration": 10,
  "players": "Any",
  "description": "Conditioning with the ball: repeated dribble sprints to build game fitness while keeping touches clean.",
  "setup": [
   "Cones at 0, 5, 10, and 15 yd; one line per 2–3 players",
   "Each player with a ball"
  ],
  "directions": [
   "Dribble to the 5-yd cone, turn, back to start; then 10, then 15.",
   "Rest 30 seconds; repeat 4–6 sets.",
   "Use a different turn at each cone (pull-back, inside cut, outside cut)."
  ],
  "variations": [
   "Easier: fewer sets, longer rest.",
   "Harder: race a partner on a parallel line.",
   "Harder: finish each set with a shot on goal."
  ],
  "coaching_points": [
   "Push the ball out ahead when running, small touches near the cone.",
   "Low and quick through the turn.",
   "Keep good form as you tire."
  ],
  "equipment": [
   "1 ball per player",
   "4 cones per line"
  ],
  "focus_areas": [
   "Conditioning",
   "Dribbling",
   "Speed & Agility"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "overload-waves-3v2",
  "name": "Attack in Overload — 3v2 Waves",
  "icon": "♟️",
  "category": "Tactical",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": null,
  "duration": 25,
  "players": "10–14 + 2 GK",
  "description": "Use the extra attacker to score quickly, and practice defending outnumbered.",
  "setup": [
   "Field 30x40 yd with a goal (and GK) at each end",
   "Two teams; each team split into 3 attackers and 2 defenders",
   "Each team's 3 attackers attack the other team's 2 defenders"
  ],
  "directions": [
   "Team A's 3 attackers start with the ball at midfield and attack Team B's 2 defenders + GK.",
   "When the attack ends (goal, save, or ball out), Team B's 3 attackers start a 3v2 the other way.",
   "Keep it flowing; switch attackers and defenders every 4 minutes.",
   "Points: goal = 1; defenders win it and dribble over midfield = 1."
  ],
  "variations": [
   "Easier: 2v1 waves.",
   "Harder: 8-second limit to shoot.",
   "Harder: a defender who wins it can counter right away against the attackers."
  ],
  "coaching_points": [
   "Attackers: go at a defender to pull them, then pass to the free player.",
   "Use width — stretch the two defenders.",
   "Defenders: delay, stay compact, protect the middle."
  ],
  "equipment": [
   "Balls",
   "2 goals",
   "Cones",
   "Pinnies"
  ],
  "focus_areas": [
   "Numbers Up",
   "Attacking",
   "Defending"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "3v2-to-4v3-transition",
  "name": "3v2 to 4v3 Transition",
  "icon": "♟️",
  "category": "Tactical",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 20,
  "players": "8–12 + 2 GK",
  "description": "Attack an overload, then react when possession changes and a bigger game starts the other way.",
  "setup": [
   "Field 35x45 yd, goals at each end with GKs",
   "3 attackers vs 2 defenders in one half; 1 extra defender waits at midfield"
  ],
  "directions": [
   "3 attackers play 3v2 to goal.",
   "When the attack ends, the 2 defenders plus the waiting player (3) + one attacker who joins them break out as 4 against 3 the other way.",
   "Rotate groups every 3–4 reps.",
   "Score as normal; bonus point for a goal within 10 seconds of the transition."
  ],
  "variations": [
   "Easier: 2v1 into 3v2.",
   "Harder: the team that loses the ball must win it back within 5 seconds for a bonus.",
   "Leave the furthest player — the team out of possession must keep one player back."
  ],
  "coaching_points": [
   "Look up immediately when you win it.",
   "Leave the furthest player as a safety.",
   "First pass forward if it's on."
  ],
  "equipment": [
   "Balls",
   "2 goals",
   "Cones",
   "Pinnies"
  ],
  "focus_areas": [
   "Numbers Up",
   "Transition",
   "Attacking"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "rob-the-nest",
  "name": "Rob the Nest",
  "icon": "⚡",
  "category": "Dribbling",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": "U12",
  "duration": 10,
  "players": "8–20",
  "description": "A fast, fun game that builds dribbling, scanning, and fitness.",
  "setup": [
   "Center circle (or 10x10 yd square) filled with balls",
   "3–4 teams, each with a small cone square \"nest\" around the outside, 15 yd from the center"
  ],
  "directions": [
   "On \"go,\" one player at a time from each team runs to the center, dribbles a ball back to their nest, and tags the next teammate.",
   "When the center is empty, players may steal balls from other teams' nests (no defending the nest).",
   "Play 90 seconds; the team with the most balls wins.",
   "Rest and play again."
  ],
  "variations": [
   "Easier: everyone goes at once.",
   "Harder: weak foot only.",
   "Harder: must pass the ball into the nest from outside it."
  ],
  "coaching_points": [
   "Keep the ball close when you dribble.",
   "Look up — which nest has the most balls?",
   "Sprint back to your team."
  ],
  "equipment": [
   "Many balls",
   "Cones"
  ],
  "focus_areas": [
   "Fun",
   "Dribbling",
   "Conditioning"
  ],
  "video_file": "6BallsCaptureFlag.mp4",
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "3v1-rondo-breakout",
  "name": "3v1 Rondo Breakout",
  "icon": "♟️",
  "category": "Tactical",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 12,
  "players": "5 per group",
  "description": "Keep the ball 3v1 in a triangle and find the moment to play out of pressure.",
  "setup": [
   "Two 8x8 yd boxes, 10 yd apart",
   "3 attackers + 1 defender in box A; 1 defender waits in box B"
  ],
  "directions": [
   "3 attackers keep the ball from the defender in box A.",
   "After 5 passes, they may pass into box B and all three run into it.",
   "The box B defender presses; play 3v1 again.",
   "If a defender wins it, they swap with the attacker who lost it."
  ],
  "variations": [
   "Easier: bigger boxes.",
   "Harder: two-touch.",
   "Harder: only a split pass (between defenders) counts as a breakout."
  ],
  "coaching_points": [
   "Make a triangle — always two options.",
   "Body open, play across the body.",
   "Pass and move to support right away."
  ],
  "equipment": [
   "Balls",
   "Cones",
   "Pinnies"
  ],
  "focus_areas": [
   "Numbers Up",
   "Possession",
   "Transition"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "3v1-to-goal",
  "name": "3v1 to Goal",
  "icon": "♟️",
  "category": "Tactical",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": null,
  "duration": 10,
  "players": "4 per rep + GK",
  "description": "Combine with two teammates to beat one defender and finish.",
  "setup": [
   "Field 25x30 yd with a goal and GK",
   "3 attackers at midfield; 1 defender at the top of the box"
  ],
  "directions": [
   "Coach plays a ball to one of the 3 attackers.",
   "Attackers combine to beat the defender and score within 10 seconds.",
   "Defender scores a point by winning it and dribbling over the midfield line.",
   "Rotate so each player defends."
  ],
  "variations": [
   "Easier: defender starts further back.",
   "Harder: a recovering defender chases from behind (3v1 becomes 3v2).",
   "Harder: every attacker must touch the ball before a shot."
  ],
  "coaching_points": [
   "Wide players stay wide.",
   "Commit the defender, then pass.",
   "Shoot early when the defender is beaten."
  ],
  "equipment": [
   "Balls",
   "Goal",
   "Cones",
   "Pinnies"
  ],
  "focus_areas": [
   "Numbers Up",
   "Attacking",
   "Finishing"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "2v1-overlap-wide",
  "name": "2v1 Overlap Down the Wing",
  "icon": "♟️",
  "category": "Tactical",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 15,
  "players": "6–10 + GK",
  "description": "Beat a fullback 2v1 with an overlapping run, then cross or cut in.",
  "setup": [
   "Wide channel 15 yd wide along the touchline from midfield to the box; goal + GK; 1–2 target forwards in the box",
   "Winger and overlapping fullback; 1 defender in the channel"
  ],
  "directions": [
   "Winger dribbles at the defender.",
   "Fullback overlaps on the outside.",
   "Winger either releases the overlap or cuts inside if the defender follows the runner.",
   "Finish with a cross to the forwards or a shot."
  ],
  "variations": [
   "Easier: passive defender.",
   "Harder: underlap (inside run) option.",
   "Harder: a defender in the box marks the forward."
  ],
  "coaching_points": [
   "Dribble at the defender to commit them.",
   "Call the overlap (\"Around!\").",
   "Read the defender: release the runner or go yourself."
  ],
  "equipment": [
   "Balls",
   "Goal",
   "Cones",
   "Pinnies"
  ],
  "focus_areas": [
   "Numbers Up",
   "Attacking",
   "Passing",
   "Crossing",
   "Combination Play"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "heading-progression",
  "name": "Heading Progression (Light Ball)",
  "icon": "🎯",
  "category": "Technical",
  "skill_level": "Intermediate",
  "min_age": "U12",
  "max_age": null,
  "duration": 8,
  "players": "Pairs",
  "description": "Teach safe heading technique — forehead, eyes open, neck firm — in a few low-force reps.",
  "setup": [
   "Partners 3–4 yd apart; lightweight or size-down balls (or balloons/beach balls first)"
  ],
  "directions": [
   "Seated: partner tosses underhand; header uses the forehead and nods it back to the partner's hands.",
   "Kneeling: same, now using the upper body.",
   "Standing: step into the header, neck firm, eyes open.",
   "Keep it to about 5 headers per player in a session."
  ],
  "variations": [
   "Easier: balloons or beach balls.",
   "Harder: jump to head (one-foot takeoff).",
   "Add a neck/core strength warm-up (planks, partner neck resistance) before heading."
  ],
  "coaching_points": [
   "Forehead, not the top of the head.",
   "Eyes open, mouth closed.",
   "Neck firm, move the whole upper body.",
   "Low volume — quality over quantity."
  ],
  "equipment": [
   "Lightweight balls (or balloons/beach balls)"
  ],
  "focus_areas": [
   "Heading"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "throw-head-catch",
  "name": "Throw-Head-Catch",
  "icon": "🎯",
  "category": "Technical",
  "skill_level": "Intermediate",
  "min_age": "U12",
  "max_age": null,
  "duration": 10,
  "players": "8–12",
  "description": "A hand-passing game that rewards well-directed headers — fun and low-volume.",
  "setup": [
   "Field 20x30 yd with small goals; two teams of 4–6; lightweight ball"
  ],
  "directions": [
   "Pass by hand in sequence: throw → head → catch.",
   "A player throws to a teammate, who heads it to another teammate, who catches it.",
   "Drops or wrong order = turnover.",
   "Goals can only be scored with a header."
  ],
  "variations": [
   "Easier: throw-catch only, then add heading.",
   "Harder: diving headers into the goal (mats/grass only).",
   "Defenders may intercept only with the hands."
  ],
  "coaching_points": [
   "Head it with the forehead toward a teammate's hands.",
   "Call for the ball.",
   "Move to space to get open."
  ],
  "equipment": [
   "Lightweight ball",
   "2 small goals",
   "Pinnies",
   "Cones"
  ],
  "focus_areas": [
   "Heading",
   "Fun"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "headed-clearances",
  "name": "Defensive Headed Clearances",
  "icon": "🎯",
  "category": "Technical",
  "skill_level": "Intermediate",
  "min_age": "U12",
  "max_age": null,
  "duration": 8,
  "players": "2–6",
  "description": "Defenders clear crosses with headers that go high, far, and wide.",
  "setup": [
   "Defender stands near the penalty spot; server 10 yd away with lightweight balls",
   "Cones 15 yd out on each side as clearance targets"
  ],
  "directions": [
   "Server tosses a high ball.",
   "Defender attacks the ball and heads it up and out toward a target cone.",
   "4–5 headers per defender, then rotate.",
   "Progress: server crosses from the wing."
  ],
  "variations": [
   "Easier: tosses from closer.",
   "Harder: an attacker challenges (no contact first).",
   "Harder: crosses from the wing at game speed."
  ],
  "coaching_points": [
   "Attack the ball — head through the bottom half for height.",
   "Use the forehead; eyes open.",
   "High, far, wide."
  ],
  "equipment": [
   "Lightweight balls",
   "Cones"
  ],
  "focus_areas": [
   "Heading",
   "Defending",
   "Aggression"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "box-to-box-relay",
  "name": "Box-to-Box Ball Relay",
  "icon": "🏃",
  "category": "Fitness",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": null,
  "duration": 10,
  "players": "Teams of 3–4",
  "description": "Fitness with the ball: fast dribbling relays that add competition.",
  "setup": [
   "Teams of 3–4 in lines; cone 20–30 yd away for each team"
  ],
  "directions": [
   "First player dribbles to the cone, around it, and back, then passes to the next teammate.",
   "Repeat until everyone has gone twice.",
   "First team to finish wins; 3–4 races with rest in between."
  ],
  "variations": [
   "Easier: shorter distance.",
   "Harder: weak foot only, or a skill move at the cone.",
   "Harder: dribble out, pass back over 20 yd, sprint back."
  ],
  "coaching_points": [
   "Push the ball into space at speed; take more touches near the cone.",
   "Head up when you're running fast.",
   "Accurate pass to the next player."
  ],
  "equipment": [
   "1 ball per team",
   "Cones"
  ],
  "focus_areas": [
   "Conditioning",
   "Dribbling",
   "Fun",
   "Speed & Agility"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "fartlek-possession",
  "name": "Fartlek Possession",
  "icon": "🏃",
  "category": "Fitness",
  "skill_level": "Intermediate",
  "min_age": "U12",
  "max_age": null,
  "duration": 20,
  "players": "8–12",
  "description": "Conditioning through possession: high-intensity bursts and active rest, all with the ball.",
  "setup": [
   "Area 30x30 yd; two teams of 4–6"
  ],
  "directions": [
   "Play keep-away for 2 minutes at full intensity (10 passes = a point).",
   "Coach calls \"Rest\" — 1 minute of light juggling or passing in pairs.",
   "Repeat 4–6 sets.",
   "Coach calls \"Sprint\" mid-set: everyone sprints to a sideline and back, then play continues."
  ],
  "variations": [
   "Easier: bigger area, longer rest.",
   "Harder: smaller area, two-touch.",
   "Harder: 3 teams — 2 play, 1 rests and then rotates."
  ],
  "coaching_points": [
   "Win it back fast.",
   "Move to make passing lanes.",
   "Use the rest to recover — breathe and touch the ball."
  ],
  "equipment": [
   "Balls",
   "Cones",
   "Pinnies"
  ],
  "focus_areas": [
   "Conditioning",
   "Possession"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "dribble-gauntlet",
  "name": "Dribble Gauntlet",
  "icon": "🏃",
  "category": "Fitness",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": null,
  "duration": 10,
  "players": "8–16",
  "description": "Dribble at speed past defenders in zones while defenders work on recovery runs.",
  "setup": [
   "Field 20x40 yd split into 3 zones; one defender in each zone",
   "Attackers with balls on one end line"
  ],
  "directions": [
   "Attackers dribble through all 3 zones to the far end line.",
   "Each defender may only defend in their zone and kicks the ball out of the field to win it.",
   "Attackers who lose the ball sprint back and start again.",
   "Rotate defenders every 2 minutes."
  ],
  "variations": [
   "Easier: defenders walk.",
   "Harder: two defenders in the middle zone.",
   "Harder: attackers must finish on a small goal at the end."
  ],
  "coaching_points": [
   "Attackers: speed in space, close control near a defender.",
   "Defenders: close down fast, then slow down and win it.",
   "Clear it far, then recover."
  ],
  "equipment": [
   "1 ball per attacker",
   "Cones",
   "Pinnies"
  ],
  "focus_areas": [
   "Conditioning",
   "Dribbling",
   "Defending",
   "Aggression"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "three-team-possession",
  "name": "3-Team Possession",
  "icon": "🔄",
  "category": "Possession",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 12,
  "players": "9–12",
  "description": "Two teams combine to keep the ball from a third; whoever loses it becomes the defenders.",
  "setup": [
   "Area 25x25 yd; three teams of 3–4 in different colors"
  ],
  "directions": [
   "Two teams keep the ball together against the third team.",
   "If the defenders win it, the team that lost it becomes the defenders.",
   "Count passes: 10 = a point for the team in possession.",
   "Play 8–10 minutes."
  ],
  "variations": [
   "Easier: bigger area.",
   "Harder: two-touch.",
   "Harder: defenders must play 3 passes after winning it before they are \"safe.\""
  ],
  "coaching_points": [
   "Win it, then think about the next pass.",
   "Spread out; make the field big.",
   "Defend as a group — press together."
  ],
  "equipment": [
   "Balls",
   "Cones",
   "3 sets of pinnies"
  ],
  "focus_areas": [
   "Possession",
   "Transition",
   "Pressing"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "five-second-counterpress",
  "name": "5-Second Counterpress Game",
  "icon": "♟️",
  "category": "Tactical",
  "skill_level": "Advanced",
  "min_age": "U12",
  "max_age": null,
  "duration": 15,
  "players": "8–12",
  "description": "React immediately when the ball is lost and try to win it back within 5 seconds.",
  "setup": [
   "Field 30x40 yd; 2 small goals at each end; two teams of 4–6"
  ],
  "directions": [
   "Normal small-sided game.",
   "When a team loses the ball, they count down 5 seconds out loud and press.",
   "Win it back in 5 seconds = 1 bonus point.",
   "Goal = 1 point."
  ],
  "variations": [
   "Easier: 7 seconds.",
   "Harder: 3 seconds.",
   "Team that wins the ball scores by dribbling over the end line."
  ],
  "coaching_points": [
   "Closest player presses the ball right away.",
   "Teammates close passing lanes.",
   "If the press fails, drop and get compact."
  ],
  "equipment": [
   "Balls",
   "4 small goals",
   "Pinnies",
   "Cones"
  ],
  "focus_areas": [
   "Transition",
   "Defending",
   "Small-Sided Game",
   "Pressing",
   "Aggression"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "through-ball-3v3-targets",
  "name": "Through-Ball 3v3 with Targets",
  "icon": "♟️",
  "category": "Tactical",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 15,
  "players": "8",
  "description": "Find a target player with a through ball and support them to score.",
  "setup": [
   "Field 25x35 yd; target zone 5 yd deep at each end with one target player per team",
   "Teams of 3 in the middle"
  ],
  "directions": [
   "Teams play 3v3 in the middle.",
   "A pass to your target player in the end zone = 1 point.",
   "The passer then joins the target; they combine to score in a small goal (bonus point).",
   "Swap targets every 3 minutes."
  ],
  "variations": [
   "Easier: 3v2 in the middle.",
   "Harder: two-touch limit.",
   "Harder: target must play one-touch."
  ],
  "coaching_points": [
   "Look forward first.",
   "Weight the pass into the target's path.",
   "Support the target right away."
  ],
  "equipment": [
   "Balls",
   "2 small goals",
   "Cones",
   "Pinnies"
  ],
  "focus_areas": [
   "Attacking",
   "Passing",
   "Small-Sided Game",
   "Combination Play"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "penalty-shootout-ladder",
  "name": "Penalty Shootout Ladder",
  "icon": "🥅",
  "category": "Shooting",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": null,
  "duration": 10,
  "players": "Whole team",
  "description": "Practice penalties under pressure while every player gets a turn in goal.",
  "setup": [
   "Goal with a penalty spot; everyone in a line"
  ],
  "directions": [
   "Each player takes a penalty; the goalkeeper rotates after each kick.",
   "Score: stay in. Miss: move to the \"ladder\" and can only get back in by saving a penalty.",
   "Keep going until one player is left."
  ],
  "variations": [
   "Easier: closer spot.",
   "Harder: pick a corner and call it before shooting.",
   "Harder: weak foot rounds."
  ],
  "coaching_points": [
   "Pick your spot before the run-up.",
   "Don't change your mind.",
   "Keepers: stay big, react — don't guess early."
  ],
  "equipment": [
   "Balls",
   "Goal"
  ],
  "focus_areas": [
   "Finishing",
   "Goalkeeping",
   "Fun",
   "Set Pieces"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "gk-cross-claim",
  "name": "GK Cross and Claim",
  "icon": "🧤",
  "category": "Goalkeeping",
  "skill_level": "Intermediate",
  "min_age": "U12",
  "max_age": null,
  "duration": 12,
  "players": "1–2 GK + 2 servers",
  "description": "Goalkeepers judge, attack, and catch crosses at the highest point, then start the attack.",
  "setup": [
   "GK in goal; servers on each wing 20–25 yd out with balls",
   "Two small target gates near midfield for the GK's distribution"
  ],
  "directions": [
   "Server clips a cross into the box.",
   "GK calls \"Keeper!\", attacks the ball off one leg, and catches at the highest point.",
   "GK then throws or rolls out to a target gate.",
   "Alternate wings; 8–10 crosses each side."
  ],
  "variations": [
   "Easier: hand-tossed crosses from close range.",
   "Harder: add a passive attacker, then an active one.",
   "Harder: GK chooses to catch or punch based on traffic."
  ],
  "coaching_points": [
   "Start position: a step off the line, open to the field.",
   "Call early and loudly.",
   "Knee up for protection, catch high in a W grip."
  ],
  "equipment": [
   "Balls",
   "Goal",
   "Cones for gates"
  ],
  "focus_areas": [
   "Goalkeeping",
   "Crossing"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "gk-distribution-pressure",
  "name": "GK Distribution Under Pressure",
  "icon": "🧤",
  "category": "Goalkeeping",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 10,
  "players": "4–6",
  "description": "Goalkeepers receive a back pass under pressure and pick the right distribution.",
  "setup": [
   "GK in goal; 2 defenders wide at the edge of the box; 1–2 pressing attackers; target gates on the wings and center"
  ],
  "directions": [
   "Coach plays a back pass to the GK.",
   "Attacker presses the GK.",
   "GK passes to the open defender, or plays long to a target gate if both are marked.",
   "Point for a clean pass through a gate."
  ],
  "variations": [
   "Easier: attacker presses at walking speed.",
   "Harder: two pressing attackers.",
   "Harder: GK may use only one touch."
  ],
  "coaching_points": [
   "Scan before the ball arrives.",
   "First touch away from pressure.",
   "Safe option first; long only when needed."
  ],
  "equipment": [
   "Balls",
   "Goal",
   "Cones",
   "Pinnies"
  ],
  "focus_areas": [
   "Goalkeeping",
   "Passing"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "gk-three-goal-reaction",
  "name": "GK Three-Goal Reaction",
  "icon": "🧤",
  "category": "Goalkeeping",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 8,
  "players": "1–2 GK + coach",
  "description": "Footwork and reaction: GK moves quickly between a full goal and two angled mini-goals.",
  "setup": [
   "Full goal plus two mini-goals set at 45° about 15 yd out on each side",
   "Coach with balls at the top of the box"
  ],
  "directions": [
   "Coach calls a goal (left, center, right).",
   "GK shuffles, backpedals, or rushes to that goal and sets.",
   "Coach shoots or tosses to it; GK saves.",
   "Recover to the center and repeat; 6–8 reps."
  ],
  "variations": [
   "Easier: coach calls the goal earlier.",
   "Harder: coach points without calling (visual cue).",
   "Harder: two shots in a row."
  ],
  "coaching_points": [
   "Shuffle — don't cross your feet.",
   "Set before the shot.",
   "Hands ready, weight forward."
  ],
  "equipment": [
   "Balls",
   "1 goal + 2 mini-goals"
  ],
  "focus_areas": [
   "Goalkeeping",
   "Warmup"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "gk-set-position-footwork",
  "name": "GK Set Position and Footwork",
  "icon": "🧤",
  "category": "Goalkeeping",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": null,
  "duration": 8,
  "players": "1–3 GK",
  "description": "Young goalkeepers build a balanced set position, quick feet, and a secure catch.",
  "setup": [
   "Cones in a small arc in front of the goal; coach with balls 6–8 yd out"
  ],
  "directions": [
   "GK shuffles cone to cone along the arc.",
   "Coach calls \"Set!\" — GK stops in the ready position.",
   "Coach serves a ball at the chest, belly, or feet; GK catches with the right technique.",
   "10–12 reps."
  ],
  "variations": [
   "Easier: catches only, no footwork.",
   "Harder: faster serves, low to the side (collapse dive).",
   "Harder: hop over a mini-hurdle before setting."
  ],
  "coaching_points": [
   "Feet shoulder-width, on the toes, hands in front.",
   "Chest balls: W grip. Low balls: scoop.",
   "Body behind the ball."
  ],
  "equipment": [
   "Balls",
   "Cones",
   "Goal",
   "Mini-hurdles (optional)"
  ],
  "focus_areas": [
   "Goalkeeping",
   "Warmup"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "rondo-4v4-plus-1-corners",
  "name": "4v4 + 1 Corner Support Rondo",
  "icon": "🔄",
  "category": "Possession",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 20,
  "players": "9–12",
  "description": "Possession with support from the corners: find the free player, move to new angles.",
  "setup": [
   "15x15 yd square; 4v4 inside; one neutral in each corner (or one central neutral +1)"
  ],
  "directions": [
   "Team in possession uses the corner players to keep the ball.",
   "Corner players have two touches and can't be tackled.",
   "8 passes = 1 point.",
   "Lose it: the other team now uses the corners."
  ],
  "variations": [
   "Easier: bigger square or more neutrals.",
   "Harder: corner players one touch.",
   "Harder: point only for passing corner-to-corner through the middle."
  ],
  "coaching_points": [
   "Open body — see the corners and the middle.",
   "Move to make a triangle every time.",
   "Win it back fast."
  ],
  "equipment": [
   "Balls",
   "Cones",
   "Pinnies"
  ],
  "focus_areas": [
   "Possession",
   "Passing",
   "Transition"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "positional-grid-4v4-3",
  "name": "Positional Grid 4v4 + 3",
  "icon": "🔄",
  "category": "Possession",
  "skill_level": "Advanced",
  "min_age": "U12",
  "max_age": null,
  "duration": 20,
  "players": "11",
  "description": "Build possession with a permanent 7v4 overload and look to split the defenders.",
  "setup": [
   "30x25 yd area; 4v4 inside; 3 neutrals: one on each end line and one central"
  ],
  "directions": [
   "Team in possession plays with the 3 neutrals (7v4).",
   "10 passes in a row = 1 goal.",
   "A pass from one end neutral, through the defense, to the other end neutral = 2 goals.",
   "Change roles when the defense wins it."
  ],
  "variations": [
   "Easier: unlimited touches.",
   "Harder: neutrals one touch.",
   "Harder: inside players two touches."
  ],
  "coaching_points": [
   "Width and depth — stretch the four defenders.",
   "Play through the lines when it's on.",
   "Scan before receiving."
  ],
  "equipment": [
   "Balls",
   "Cones",
   "Pinnies (3 colors)"
  ],
  "focus_areas": [
   "Possession",
   "Passing",
   "Small-Sided Game",
   "Team Shape"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "futsal-4v4",
  "name": "Futsal-Style 4v4",
  "icon": "🎲",
  "category": "Games",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": null,
  "duration": 20,
  "players": "8–10",
  "description": "Small, fast games with a low-bounce ball — lots of touches, quick decisions, and almost no heading.",
  "setup": [
   "Hard court or small field 20x30 yd; futsal goals or small goals; futsal (low-bounce) ball",
   "Two teams of 4 (+ GK optional)"
  ],
  "directions": [
   "Play 4v4; ball must stay below head height (high ball = turnover).",
   "Kick-ins from the sideline instead of throw-ins.",
   "4-second limit on restarts.",
   "Play 4–5 minute games and rotate teams."
  ],
  "variations": [
   "Easier: no restart limit.",
   "Harder: two-touch.",
   "Harder: rotating goalkeeper (any player can enter the box)."
  ],
  "coaching_points": [
   "Use the sole to control and move the ball.",
   "Keep it on the floor.",
   "Move after every pass."
  ],
  "equipment": [
   "Futsal ball",
   "Small goals",
   "Pinnies"
  ],
  "focus_areas": [
   "Small-Sided Game",
   "Possession",
   "Dribbling"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "corner-kick-attack",
  "name": "Corner Kick Routines (Attacking)",
  "icon": "🥅",
  "category": "Shooting",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 15,
  "players": "8–16 + GK",
  "description": "Run a simple corner routine: good delivery, timed runs, and attacking the ball.",
  "setup": [
   "Penalty box with a goal and GK; corner taker; attackers and defenders"
  ],
  "directions": [
   "Standard: 2 attackers near the 6-yd box, 1 just outside, the rest at the top of the 18.",
   "On the taker's signal, back players sprint in to attack the ball.",
   "Short version: a near-post player sprints toward the corner flag for a short pass.",
   "Run each routine 3–4 times, then add defenders."
  ],
  "variations": [
   "Easier: no defenders; walk-through.",
   "Harder: live defenders and a counter-attack if they clear it.",
   "Younger players: ground-ball corners only."
  ],
  "coaching_points": [
   "Delivery: in front of the GK, away from their hands.",
   "Run late and fast — arrive, don't wait.",
   "Everyone has a job (near post, far post, edge of box)."
  ],
  "equipment": [
   "Balls",
   "Goal",
   "Pinnies"
  ],
  "focus_areas": [
   "Attacking",
   "Finishing",
   "Heading",
   "Set Pieces"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "corner-kick-defense",
  "name": "Defending Corners",
  "icon": "♟️",
  "category": "Tactical",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 15,
  "players": "8–16 + GK",
  "description": "Defend corners with clear jobs: post players, zone players, and markers.",
  "setup": [
   "Penalty box with goal and GK; servers taking corners; attackers vs defenders"
  ],
  "directions": [
   "Assign jobs: a player at the near post, players in zones in the 6-yd box, others marking runners.",
   "Server takes corners; defenders clear the ball high, far, and wide.",
   "After the clear, defenders step out of the box together.",
   "Switch sides and roles."
  ],
  "variations": [
   "Easier: ground-ball corners.",
   "Harder: attackers run rehearsed routines.",
   "Harder: if defenders clear it, they counter to small goals at midfield."
  ],
  "coaching_points": [
   "Know your job before the kick.",
   "Attack the ball — don't wait for it.",
   "Step out as a line after the clear."
  ],
  "equipment": [
   "Balls",
   "Goal",
   "Pinnies",
   "Small goals (optional)"
  ],
  "focus_areas": [
   "Defending",
   "Heading",
   "Goalkeeping",
   "Set Pieces",
   "Team Shape"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "cross-arrive-on-time",
  "name": "Crossing — Arrive on Time",
  "icon": "🥅",
  "category": "Shooting",
  "skill_level": "Advanced",
  "min_age": "U12",
  "max_age": null,
  "duration": 15,
  "players": "6–10 + GK",
  "description": "Finish crosses by timing the run into the box instead of arriving early and standing.",
  "setup": [
   "Goal and GK; wide players at the wings with balls; 2 attackers starting 25 yd out"
  ],
  "directions": [
   "Wide player dribbles down the wing.",
   "Attackers start their runs as the winger looks up — one near post, one far post.",
   "Winger crosses; attackers finish first time.",
   "Rotate positions and wings."
  ],
  "variations": [
   "Easier: cutback (ground) crosses.",
   "Harder: add a defender in the box.",
   "Harder: third runner to the penalty spot for cutbacks."
  ],
  "coaching_points": [
   "Arrive on time — don't wait in the box.",
   "Near post, far post, top of the box.",
   "Crosser: look up, hit the bottom of the ball for height (or across the ground)."
  ],
  "equipment": [
   "Balls",
   "Goal",
   "Cones"
  ],
  "focus_areas": [
   "Attacking",
   "Finishing",
   "Passing",
   "Crossing"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "2v1-pick-a-side",
  "name": "2v1 Pick a Side",
  "icon": "♟️",
  "category": "Tactical",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 12,
  "players": "6–12 + GK",
  "description": "Read a 2v1: the player who receives attacks, the other becomes the defender — quick decisions every rep.",
  "setup": [
   "Goal and GK; coach with balls 30 yd out; 2 players side by side at 25 yd; 1 extra player as a supporting attacker"
  ],
  "directions": [
   "Coach passes to one of the two players.",
   "The player who receives attacks with the support player (2v1).",
   "The player who didn't receive becomes the defender and recovers.",
   "Attackers try to score; defender tries to win it and dribble out."
  ],
  "variations": [
   "Easier: defender starts behind the attackers.",
   "Harder: 3v2 version.",
   "Harder: 6-second limit to shoot."
  ],
  "coaching_points": [
   "Attack the defender, then pass at the right moment.",
   "Support player: stay wide and in view.",
   "Defender: delay and force one way."
  ],
  "equipment": [
   "Balls",
   "Goal",
   "Pinnies"
  ],
  "focus_areas": [
   "Numbers Up",
   "Attacking",
   "Transition"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "crossing-2v1-box",
  "name": "Crossing and Finishing 2v1 in the Box",
  "icon": "♟️",
  "category": "Tactical",
  "skill_level": "Intermediate",
  "min_age": "U12",
  "max_age": null,
  "duration": 12,
  "players": "6–10 + GK",
  "description": "Two attackers vs one defender in the box: use runs to get free and finish the cross.",
  "setup": [
   "Goal and GK; winger with balls on each side; 2 attackers vs 1 defender in the box"
  ],
  "directions": [
   "Winger dribbles and crosses.",
   "Two attackers make opposite runs (near/far) to beat the defender.",
   "Finish first time if possible.",
   "Rotate attackers, defender, and wingers."
  ],
  "variations": [
   "Easier: defender passive.",
   "Harder: 2v2.",
   "Harder: defender clears and counters to a small goal."
  ],
  "coaching_points": [
   "Split up — one near, one far.",
   "Check away, then attack the ball.",
   "Volleys and headers: keep it down."
  ],
  "equipment": [
   "Balls",
   "Goal",
   "Pinnies"
  ],
  "focus_areas": [
   "Numbers Up",
   "Finishing",
   "Attacking",
   "Crossing"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "1v1-recovery-run",
  "name": "1v1 Recovery Run",
  "icon": "♟️",
  "category": "Tactical",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 10,
  "players": "Pairs + GK",
  "description": "Defenders recover from behind an attacker, get goal-side, and defend the 1v1.",
  "setup": [
   "Goal and GK; attacker starts 30 yd out with the ball; defender starts 3–5 yd behind the attacker"
  ],
  "directions": [
   "On \"go,\" attacker dribbles at goal.",
   "Defender sprints to get goal-side (between the attacker and goal).",
   "Once goal-side, defender slows down and defends 1v1.",
   "Attacker scores; defender wins it and dribbles out the side."
  ],
  "variations": [
   "Easier: defender starts beside the attacker.",
   "Harder: defender starts farther behind.",
   "Harder: two attackers vs one recovering defender."
  ],
  "coaching_points": [
   "Sprint on the line between the ball and the goal.",
   "Get goal-side, then slow down — don't dive in.",
   "Show the attacker to the outside."
  ],
  "equipment": [
   "Balls",
   "Goal",
   "Cones"
  ],
  "focus_areas": [
   "Defending",
   "1v1",
   "Transition",
   "Aggression"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "interception-game",
  "name": "Interception Game",
  "icon": "♟️",
  "category": "Tactical",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 10,
  "players": "6–10",
  "description": "Defenders read the passer and step in front to intercept instead of tackling from behind.",
  "setup": [
   "20x20 yd box; pairs of passers on opposite sides; 2–3 defenders inside"
  ],
  "directions": [
   "Passers try to pass across the box to their partner.",
   "Defenders read the passer's body and step into the passing lane.",
   "Interception = 1 point; defender swaps with the passer who lost it.",
   "Play 60–90 second rounds."
  ],
  "variations": [
   "Easier: passers must use two touches.",
   "Harder: passers may move along their side.",
   "Harder: interceptor must play it to a teammate."
  ],
  "coaching_points": [
   "Watch the passer's hips and plant foot.",
   "Start a step off the receiver — then pounce.",
   "Win it, keep it."
  ],
  "equipment": [
   "Balls",
   "Cones",
   "Pinnies"
  ],
  "focus_areas": [
   "Defending",
   "Possession",
   "Pressing"
  ],
  "video_file": "vid/def/interceptionDrill.mp4",
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "continuous-2v2-conditioning",
  "name": "Continuous 2v2 Waves",
  "icon": "🏃",
  "category": "Fitness",
  "skill_level": "Intermediate",
  "min_age": "U12",
  "max_age": null,
  "duration": 20,
  "players": "8–12",
  "description": "High-intensity 2v2 to small goals — fitness and decision-making together.",
  "setup": [
   "Field 20x30 yd with a small goal at each end; teams of 2 waiting at each end line"
  ],
  "directions": [
   "Pair A attacks Pair B for up to 45 seconds.",
   "When a goal is scored or time runs out, a new pair enters and attacks the pair that just defended.",
   "Keep the waves going for 6–8 minutes.",
   "Rest 2 minutes; repeat."
  ],
  "variations": [
   "Easier: 3v3 for more rest.",
   "Harder: 30-second waves.",
   "Harder: a goal counts double after a give-and-go."
  ],
  "coaching_points": [
   "Work hard, then recover.",
   "Talk to your partner: \"Press!\" / \"Cover!\"",
   "Attack fast — score in the first 10 seconds."
  ],
  "equipment": [
   "Balls",
   "2 small goals",
   "Pinnies",
   "Timer"
  ],
  "focus_areas": [
   "Conditioning",
   "Small-Sided Game",
   "Transition"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "switch-game",
  "name": "Switch! Game",
  "icon": "♟️",
  "category": "Tactical",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": "U10",
  "duration": 12,
  "players": "4–8",
  "description": "A small-sided game where the coach’s \"Switch!\" sends a new ball the other way — young players learn to react fast when the ball changes teams.",
  "setup": [
   "20x15 yd field with two small goals (no keepers)",
   "Two teams of 2–4; coach on the sideline with a supply of balls"
  ],
  "directions": [
   "Play a normal small-sided game.",
   "At any moment the coach shouts \"Switch!\" and plays a new ball to the team that was defending.",
   "The old ball is dead — leave it. The team that had it must sprint to defend their goal.",
   "Normal goal = 1 point; goal within 5 seconds of a switch = 2 points."
  ],
  "variations": [
   "Easier: coach rolls the new ball into an open space so it’s a race.",
   "Harder: switch every 20–30 seconds no matter what.",
   "Harder: add a mini-goal on each side — winning team after a switch can score in any goal."
  ],
  "coaching_points": [
   "Ball changed? Change your brain — attack or defend NOW.",
   "Defenders: run back toward your goal first.",
   "Attackers: go forward fast before they get back."
  ],
  "equipment": [
   "Many balls",
   "2 small goals",
   "Pinnies",
   "Cones"
  ],
  "focus_areas": [
   "Transition",
   "Small-Sided Game",
   "Fun"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "attack-then-defend",
  "name": "Attack Then Defend",
  "icon": "♟️",
  "category": "Tactical",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": "U10",
  "duration": 10,
  "players": "6–12",
  "description": "A continuous 1v1 line game: you attack, and right after your shot you turn and defend the next attacker — transition built into every rep.",
  "setup": [
   "15x20 yd area, one small goal at each end (or one goal and an end-line gate)",
   "Two lines at opposite ends, each player with a ball"
  ],
  "directions": [
   "Player A dribbles at the far goal; Player B (first in the other line) steps out to defend.",
   "After A shoots (or loses the ball), B becomes the attacker and A must turn and defend B.",
   "After B finishes, B stays to defend the next player from A’s line; A goes to the back of B’s line.",
   "Keep it flowing; count goals per player."
  ],
  "variations": [
   "Easier: defender may only shadow (no tackling) for the first round.",
   "Harder: 2v2 — pairs attack, then defend.",
   "Harder: defender must win the ball, not just stop the shot, before switching."
  ],
  "coaching_points": [
   "Shot’s done? Turn and get goal-side right away.",
   "Attack fast — dribble at the defender.",
   "Defend: get between the ball and your goal."
  ],
  "equipment": [
   "1 ball per player",
   "2 small goals",
   "Cones"
  ],
  "focus_areas": [
   "Transition",
   "1v1",
   "Finishing",
   "Aggression"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "knock-down-the-cones",
  "name": "Knock Down the Cones",
  "icon": "🥅",
  "category": "Shooting",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": "U8",
  "duration": 8,
  "players": "Any",
  "description": "Players shoot at cones or tall markers set on a line to practice accurate, firm shots — a favorite for the youngest players.",
  "setup": [
   "A row of 6–10 tall cones (or plastic bottles) along a line",
   "Shooting line 6–10 yd away (closer for U6); every player with a ball"
  ],
  "directions": [
   "Players dribble to the shooting line and shoot to knock a cone down.",
   "Retrieve your ball and go again.",
   "Play until every cone is down; set them up and play again (or play teams vs coaches)."
  ],
  "variations": [
   "Easier: move closer; use bigger targets.",
   "Harder: weak foot only, or must use the laces.",
   "Harder: two teams — knock down the other team’s cones first."
  ],
  "coaching_points": [
   "Look at the target, then look at the ball.",
   "Plant foot next to the ball, pointing at the target.",
   "Kick with your laces for power; inside of the foot for aim."
  ],
  "equipment": [
   "1 ball per player",
   "6–10 tall cones or plastic bottles"
  ],
  "focus_areas": [
   "Finishing",
   "Fun"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "dribble-gate-shoot",
  "name": "Dribble, Gate, Shoot",
  "icon": "🥅",
  "category": "Shooting",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": "U10",
  "duration": 10,
  "players": "4–10",
  "description": "Players dribble through a gate in front of goal and shoot before the shooting line — teaches finishing off the dribble.",
  "setup": [
   "Goal (with or without a keeper)",
   "A 2-yd gate 12–15 yd from goal; a shooting line of cones 6–10 yd from goal",
   "One line of players with balls 10 yd behind the gate"
  ],
  "directions": [
   "Dribble through the gate.",
   "Take a big touch toward goal and shoot before reaching the shooting line.",
   "Collect your ball and join the line on the other side.",
   "Next player goes when the previous shot is taken."
  ],
  "variations": [
   "Easier: no gate — dribble and shoot from a spot.",
   "Harder: two gates at angles — coach calls which one.",
   "Harder: a defender chases from behind once the shooter passes the gate."
  ],
  "coaching_points": [
   "Touch it out of your feet, then shoot.",
   "Aim low in the corners.",
   "Follow your shot for a rebound."
  ],
  "equipment": [
   "1 ball per player",
   "1 goal",
   "Cones"
  ],
  "focus_areas": [
   "Finishing",
   "Dribbling"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "shooting-relay-race",
  "name": "Shooting Relay Race",
  "icon": "🥅",
  "category": "Shooting",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": "U10",
  "duration": 8,
  "players": "6–12",
  "description": "Teams race to score a set number of goals, one shooter at a time — lots of shots and lots of fun.",
  "setup": [
   "Two small goals side by side, 8–12 yd from two team lines",
   "Each player in line with a ball"
  ],
  "directions": [
   "First player dribbles to a cone halfway, then shoots.",
   "If they score, the team gets a point; either way they collect the ball and tag the next player.",
   "First team to 10 goals wins."
  ],
  "variations": [
   "Easier: shoot from the halfway cone straight away (no dribble).",
   "Harder: weak foot only, or shot must be taken first time from a coach’s pass.",
   "Harder: add a keeper (rotate every 2 minutes)."
  ],
  "coaching_points": [
   "Head over the ball keeps the shot low.",
   "Pick a corner before you shoot.",
   "Quick, but under control."
  ],
  "equipment": [
   "1 ball per player",
   "2 small goals",
   "Cones"
  ],
  "focus_areas": [
   "Finishing",
   "Fun"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "goalie-hands-basket-w",
  "name": "Goalie Hands: Basket and W",
  "icon": "🧤",
  "category": "Goalkeeping",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": "U10",
  "duration": 8,
  "players": "Pairs",
  "description": "Introduces the two basic goalkeeper catches — the \"basket\" for low balls and the \"W\" for high balls — through partner tosses.",
  "setup": [
   "Pairs 3–5 yd apart, one ball per pair",
   "Every player gets a turn as keeper"
  ],
  "directions": [
   "Teach the basket: elbows together, palms up, scoop the ball into your belly.",
   "Teach the W: thumbs almost touching, fingers spread, hands in front of your face.",
   "Partner rolls the ball — keeper scoops it with the basket. 10 reps.",
   "Partner tosses chest-to-face high — keeper catches with the W and pulls it into the chest. 10 reps.",
   "Partner mixes them up; switch roles."
  ],
  "variations": [
   "Easier: kneel and catch softer tosses; use a lighter ball.",
   "Harder: partner throws a bit to either side so the keeper shuffles first.",
   "Harder: partner volleys gently from hands."
  ],
  "coaching_points": [
   "Low ball: basket. High ball: W.",
   "Get your body behind the ball.",
   "Catch it, hug it.",
   "Soft hands — no slapping."
  ],
  "equipment": [
   "1 ball per pair",
   "Optional gloves"
  ],
  "focus_areas": [
   "Goalkeeping"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "everyone-keeps",
  "name": "Everyone Keeps",
  "icon": "🧤",
  "category": "Goalkeeping",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": "U10",
  "duration": 10,
  "players": "Pairs",
  "description": "Pairs take turns shooting and keeping in tiny cone goals — everyone gets dozens of keeper reps and shots.",
  "setup": [
   "Each pair has a cone goal 3–4 yd wide and a shooting line 5–8 yd away",
   "One ball per pair"
  ],
  "directions": [
   "Keeper stands in the goal in a ready position (feet apart, hands up).",
   "Shooter passes or shoots along the ground; keeper saves with the basket catch.",
   "Keeper rolls the ball back underhand to the shooter.",
   "Switch roles after 5 shots. Keep score: a save = 1 point for the keeper."
  ],
  "variations": [
   "Easier: shots must be passes along the ground.",
   "Harder: shooter may shoot higher; keeper uses the W catch.",
   "Harder: shooter dribbles in and shoots from anywhere before the line (keeper must move)."
  ],
  "coaching_points": [
   "Ready position: on your toes, hands out front.",
   "Move your feet to get behind the ball.",
   "Roll it back like bowling — that’s a keeper skill too."
  ],
  "equipment": [
   "1 ball per pair",
   "4 cones per pair"
  ],
  "focus_areas": [
   "Goalkeeping",
   "Finishing",
   "Fun"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "pounce-on-the-ball",
  "name": "Pounce on the Ball",
  "icon": "🧤",
  "category": "Goalkeeping",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": "U10",
  "duration": 8,
  "players": "Pairs or small groups",
  "description": "Young keepers learn to get down on rolling balls safely — from sitting, then kneeling, then crouching — before any real diving.",
  "setup": [
   "Soft grass or mats",
   "Keeper with a feeder 3–4 yd away; one ball"
  ],
  "directions": [
   "Keeper sits with legs out; feeder rolls the ball to one side; keeper falls sideways onto the side of the body, ball held with one hand behind and one on top.",
   "5 reps each side, then move to kneeling.",
   "From kneeling, repeat 5 per side.",
   "From a low crouch, repeat — the keeper \"pounces\" like a cat onto the ball."
  ],
  "variations": [
   "Easier: just practice the fall and hold with the ball already on the ground.",
   "Harder: feeder rolls a bit further away.",
   "Harder: after the save, bounce up and roll the ball to a target cone."
  ],
  "coaching_points": [
   "Land on your side, not your tummy or elbow.",
   "One hand behind the ball, one on top.",
   "Eyes on the ball until it’s hugged."
  ],
  "equipment": [
   "1 ball",
   "Soft ground or mat"
  ],
  "focus_areas": [
   "Goalkeeping"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "partners-vs-pirate",
  "name": "Partners vs Pirate",
  "icon": "♟️",
  "category": "Tactical",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": "U8",
  "duration": 8,
  "players": "5–11",
  "description": "Two partners share one ball and try to get it across the pirate’s ocean — the first 2v1 game for the youngest players.",
  "setup": [
   "15x15 yd area; start line and end line",
   "Pairs with one ball on the start line; one \"pirate\" defender in the middle"
  ],
  "directions": [
   "On \"Go\", a pair dribbles and passes to get across the end line with the ball under control.",
   "The pirate tries to steal the ball and kick it out.",
   "If the pair makes it, 1 point. If the pirate steals it, the pirate swaps with the player who lost it.",
   "Next pair goes as soon as the last one finishes."
  ],
  "variations": [
   "Easier: pirate may only walk.",
   "Harder: two pirates for some rounds (2v2).",
   "Harder: the pair must make at least one pass to score."
  ],
  "coaching_points": [
   "Pirate comes to you? Pass to your partner!",
   "Partner: stay away from your buddy so you’re open.",
   "Dribble right at the pirate to pull them in."
  ],
  "equipment": [
   "1 ball per pair",
   "Cones",
   "Pinnie for the pirate"
  ],
  "focus_areas": [
   "Numbers Up",
   "Passing",
   "Fun"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "two-v-one-gate-game",
  "name": "2v1 Gate Game",
  "icon": "♟️",
  "category": "Tactical",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": "U10",
  "duration": 10,
  "players": "6–12",
  "description": "Two attackers try to dribble through one of two end gates against one defender — they must decide to pass or dribble.",
  "setup": [
   "15x20 yd channel with two 2-yd gates on the far end line",
   "Attackers in pairs at one end; defenders in a line at the far end"
  ],
  "directions": [
   "Coach passes the ball to the attacking pair; the defender steps out to meet them.",
   "Attackers score by dribbling through either gate.",
   "If the defender wins it, they score by dribbling back over the start line.",
   "Rotate: one attacker becomes the next defender."
  ],
  "variations": [
   "Easier: defender starts on the end line and can’t come past halfway.",
   "Harder: one small goal instead of gates; add a keeper.",
   "Harder: a recovering second defender joins after 3 seconds."
  ],
  "coaching_points": [
   "Dribble at the defender to make them choose.",
   "If they come to you, pass; if they stay, keep going.",
   "Supporting player: stay wide and a little ahead."
  ],
  "equipment": [
   "Balls",
   "Cones for gates",
   "Pinnies"
  ],
  "focus_areas": [
   "Numbers Up",
   "Attacking",
   "Dribbling"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "three-v-two-end-line",
  "name": "3v2 End Line Game",
  "icon": "♟️",
  "category": "Tactical",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": "U10",
  "duration": 10,
  "players": "5–10",
  "description": "Three attackers try to stop the ball on the end line against two defenders — young players learn to spread out and find the free teammate.",
  "setup": [
   "20x25 yd area",
   "Three attackers start on one end line with a ball; two defenders start at the other end"
  ],
  "directions": [
   "Attackers score by dribbling the ball over the end line and stopping it with the sole of the foot.",
   "Defenders win the ball and score by kicking it over the attackers’ start line.",
   "Play 30 seconds or until a score; rotate groups.",
   "Coach asks: \"Who was the free player?\""
  ],
  "variations": [
   "Easier: defenders walk only, or play 3v1.",
   "Harder: score through one of two small goals instead of the line.",
   "Harder: when the defenders win it, a third defender joins and they counter 3v3."
  ],
  "coaching_points": [
   "Spread out: one left, one right, one middle.",
   "Two defenders can’t guard three — find the free one.",
   "Pass to space in front of your teammate."
  ],
  "equipment": [
   "Balls",
   "Cones",
   "Pinnies"
  ],
  "focus_areas": [
   "Numbers Up",
   "Attacking",
   "Passing"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "three-v-two-keep-away",
  "name": "3v2 Keep Away",
  "icon": "♟️",
  "category": "Tactical",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": "U10",
  "duration": 10,
  "players": "5 per group",
  "description": "Three players try to make 5 passes in a row against two defenders in a small box.",
  "setup": [
   "12x12 yd box (bigger for U6)",
   "Three attackers in different colors from two defenders; one ball"
  ],
  "directions": [
   "Attackers pass and move to keep the ball away.",
   "Count passes out loud — 5 in a row is 1 point.",
   "If a defender wins the ball or it leaves the box, the player who lost it swaps with that defender.",
   "Play 2-minute rounds."
  ],
  "variations": [
   "Easier: bigger box; 3 passes for a point.",
   "Harder: two-touch limit.",
   "Harder: smaller box; a pass between the two defenders counts double."
  ],
  "coaching_points": [
   "Make a triangle — don’t stand in a line.",
   "Move to where the passer can see you.",
   "Open your body to the field before the ball arrives."
  ],
  "equipment": [
   "1 ball per group",
   "Cones",
   "Pinnies"
  ],
  "focus_areas": [
   "Numbers Up",
   "Possession",
   "Passing"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "around-the-box-overlap-finish",
  "name": "Around-the-Box Overlap & Finish",
  "icon": "🥅",
  "category": "Shooting",
  "skill_level": "Intermediate",
  "min_age": "U12",
  "max_age": null,
  "duration": 10,
  "players": "8–12 + GK",
  "description": "High-tempo attacking pattern: switch the ball across the top of the box, overlap around the outside, and finish from a weighted through ball at match speed.",
  "setup": [
   "Station 1: line of players with balls in or near the center circle",
   "Stations 2 and 3: a cone (or pole) at each top corner of the 18-yd box, with a short line of players at each",
   "Full-size goal with a GK"
  ],
  "directions": [
   "Station 1 plays a firm pass to either flank (e.g. Station 2), then jogs to the back of that line.",
   "Station 2 takes a positive touch and plays a diagonal pass across the top of the box to Station 3.",
   "Right after passing, Station 2 sprints an overlapping run around the outside of Station 3 toward the box.",
   "Station 3 cushions the ball and slips a weighted through ball into the runner's path.",
   "The runner finishes in 1–2 touches.",
   "Rotation: Station 3 resets to their cone; the shooter collects the ball and returns to Station 1. Alternate the starting flank each rep."
  ],
  "variations": [
   "Easier: remove Station 1 — start the rep at Station 2 with a ball.",
   "Easier: allow the runner an extra touch before shooting.",
   "Harder: one-touch through ball from Station 3.",
   "Harder: add a recovering defender who starts at Station 3 and chases the overlap.",
   "Harder: Station 3 can choose to underlap and shoot instead of playing the runner in."
  ],
  "coaching_points": [
   "First pass firm and to feet so the wide player never has to step backward.",
   "Sprint on the release of your own pass; arc the overlap wide to stay onside and keep momentum.",
   "Through ball leads the runner into space so they strike without breaking stride.",
   "Finish low and to the corners — accuracy over power."
  ],
  "equipment": [
   "Balls",
   "Cones",
   "Poles",
   "Full-size goal + GK"
  ],
  "focus_areas": [
   "Finishing",
   "Attacking",
   "Passing",
   "Crossing",
   "Combination Play"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "four-quadrant-possession",
  "name": "4-Quadrant Possession",
  "icon": "🔄",
  "category": "Possession",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 20,
  "players": "8–14 (e.g. 5v5, 6v6, or 4v4 + 2)",
  "description": "Keep-away in a grid split into four boxes: a team scores by keeping the ball through all four quadrants, which rewards switching play away from pressure and finding open space.",
  "setup": [
   "Grid: 30x30 to 40x40 yd square, split into 4 equal quadrants with flat cones or a center cross",
   "Two teams in pinnies, e.g. 5v5, 6v6, or 4v4 + 2 neutral players who always play for the team with the ball",
   "Spare balls at the side of the grid for quick restarts"
  ],
  "directions": [
   "Coach starts the game by playing a ball into one team.",
   "The team in possession tries to keep the ball in each of the 4 quadrants: a completed pass and receive (or 1–2 completed passes) inside a box counts that box.",
   "Quadrants can be hit in any order — side to side, diagonally, or around the square.",
   "Once a team has hit all 4 quadrants, it scores 1 point and its count resets to zero; it keeps the ball and starts a new count.",
   "If the defenders win the ball or it goes out of bounds, the count resets and the other team attacks; out-of-bounds restarts with a coach ball or a pass-in.",
   "Play 3–4 minute rounds with short rests; most points wins."
  ],
  "variations": [
   "Easier: add a second neutral player, or make the grid bigger.",
   "Easier: one completed pass in any quadrant counts it.",
   "Harder: 2 passes required in each quadrant.",
   "Harder: limit touches (2-touch, then 1-touch).",
   "Harder: bonus point if the 4th quadrant is reached with a diagonal pass, or if all 4 are hit in under 10 passes.",
   "Harder: remove the neutral players for an even-numbers game."
  ],
  "coaching_points": [
   "If the box is crowded, play away from pressure — switch to an empty quadrant.",
   "Off the ball, get into an untouched quadrant before the ball arrives.",
   "Scan before you receive: know which boxes you still need.",
   "Open your body so you can play forward or switch.",
   "On a turnover, press right away — winning the ball wipes out their count."
  ],
  "equipment": [
   "Balls",
   "Flat cones",
   "Pinnies (2 colors + neutrals)"
  ],
  "focus_areas": [
   "Possession",
   "Passing",
   "Transition"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 }
]
$drills$::jsonb) as x(
    id text, name text, icon text, category text, skill_level text, min_age text, max_age text, duration int,
    players text, description text, setup jsonb, directions jsonb, variations jsonb,
    coaching_points jsonb, equipment jsonb, focus_areas jsonb, video_file text, video_url text, from_hs boolean, after_id text)
), added as (
  insert into bdu_drills (id, name, icon, category, skill_level, min_age, max_age, duration, players, description,
                          setup, directions, variations, coaching_points, equipment, focus_areas,
                          video_file, video_url, from_hs, sort_order)
  select i.id, i.name, coalesce(i.icon, '⚽'), i.category, coalesce(i.skill_level, ''), i.min_age, i.max_age, i.duration,
         coalesce(i.players, ''), coalesce(i.description, ''),
         array(select jsonb_array_elements_text(coalesce(i.setup, '[]'::jsonb))),
         array(select jsonb_array_elements_text(coalesce(i.directions, '[]'::jsonb))),
         array(select jsonb_array_elements_text(coalesce(i.variations, '[]'::jsonb))),
         array(select jsonb_array_elements_text(coalesce(i.coaching_points, '[]'::jsonb))),
         array(select jsonb_array_elements_text(coalesce(i.equipment, '[]'::jsonb))),
         array(select jsonb_array_elements_text(coalesce(i.focus_areas, '[]'::jsonb))),
         i.video_file, i.video_url, coalesce(i.from_hs, false),
         coalesce((select d.sort_order + 1 from bdu_drills d where d.id = i.after_id),
                  (select coalesce(max(d.sort_order), 0) + 10 from bdu_drills d))
  from incoming i
  on conflict (id) do nothing
  returning id
)
select i.name,
       case when a.id is not null then 'Added' else 'Already in the library — not changed' end as result
from incoming i left join added a on a.id = i.id;
