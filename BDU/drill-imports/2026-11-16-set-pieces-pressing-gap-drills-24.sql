-- BDU drill import: 24 drills that fill gaps in the library
-- (free kicks, throw-ins, goal kicks and playing out, kickoffs, pressing, crossing for U10, and U14–U16 game management)
-- Run ONCE in the Supabase SQL Editor, AFTER indy-drills-focus-areas.sql:
-- https://supabase.com/dashboard/project/fpnmnlrwhwnuefbnehuf/sql
-- Adds these drills to the Indy Way drill library. A drill that is already there is left alone
-- (change it on the page with Edit drill). No PIN needed. None are marked HS; none have a video yet.
with incoming as (
  select * from jsonb_to_recordset($drills$
[
 {
  "id": "free-kick-tap-and-shoot",
  "name": "Free Kick: Tap and Shoot",
  "icon": "🥅",
  "category": "Shooting",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": "U12",
  "duration": 10,
  "players": "Pairs (4–12 players)",
  "description": "A first free kick for young players: one taps the ball, the other runs on and shoots — so every player learns that a free kick is a chance to score.",
  "setup": [
   "One goal (small goal, or a full-size goal with a goalkeeper)",
   "A line of cones 10–12 yds from goal — the free kick spots",
   "Pairs line up behind a spot with a ball"
  ],
  "directions": [
   "The coach blows the whistle like a referee.",
   "Player 1 taps the ball a yard to the side.",
   "Player 2 runs on and shoots first time.",
   "The pair collects the ball and joins the next line. Swap roles each turn.",
   "Count goals as a team and try to beat the score next round."
  ],
  "variations": [
   "Easier: Player 2 may take a touch before shooting.",
   "Easier: move the spots closer to goal.",
   "Harder: add two \"wall\" players standing 8 yds away who may not move.",
   "Harder: the pair chooses — tap and shoot, or shoot directly."
  ],
  "coaching_points": [
   "Wait for the whistle, then go quickly",
   "Tap it gently into your partner's path — not behind them",
   "Shooter: run onto the ball and strike through the middle of it"
  ],
  "equipment": [
   "Balls",
   "Cones",
   "Goal"
  ],
  "focus_areas": [
   "Set Pieces",
   "Finishing",
   "Fun"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "free-kick-target-practice",
  "name": "Free Kick Target Practice",
  "icon": "🎯",
  "category": "Shooting",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 15,
  "players": "4–10 plus a goalkeeper",
  "description": "Direct free kick technique: strike a still ball over or around a wall at a target in the goal, from different spots around the box.",
  "setup": [
   "Full-size goal with a goalkeeper (or targets hung in the corners)",
   "Three free kick spots 18–25 yds out: left, center, right",
   "A wall 10 yds from the ball: mannequins, tall cones or poles (never players)",
   "A supply of balls at each spot"
  ],
  "directions": [
   "Each player places their own ball and takes the same steps back every time — a routine.",
   "Take 3 kicks from the spot: one for power, one for placement, one of your choice.",
   "Score 3 points for a top corner, 2 for any goal, 1 for on target.",
   "Collect your balls and rotate to the next spot.",
   "After every spot, the top scorer picks the spot for a one-kick final."
  ],
  "variations": [
   "Easier: move the spots in to 16 yds and take the wall away.",
   "Easier: no goalkeeper — hang a pinnie in each top corner as the target.",
   "Harder: the goalkeeper sets the wall and the kicker has 10 seconds from the whistle.",
   "Harder: weaker foot from the center spot."
  ],
  "coaching_points": [
   "Same routine every time: place the ball, step back, breathe, pick your target",
   "Plant foot beside the ball, toes at the target; lock the ankle",
   "Up and over the wall: strike low on the ball with the inside of the laces and follow through high"
  ],
  "equipment": [
   "Balls (many)",
   "Cones",
   "Mannequins or poles",
   "Full-size goal"
  ],
  "focus_areas": [
   "Set Pieces",
   "Finishing"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "attacking-free-kick-routines",
  "name": "Attacking Free Kick Routines",
  "icon": "♟️",
  "category": "Tactical",
  "skill_level": "Advanced",
  "min_age": "U12",
  "max_age": null,
  "duration": 20,
  "players": "8–16 plus a goalkeeper",
  "description": "Rehearse three attacking free kick routines around the box — a direct shot, a lay-off and a pass behind the wall — so the team has a plan and a signal for each.",
  "setup": [
   "Final third with a full-size goal and goalkeeper",
   "Attackers in the team's free kick roles: two over the ball, runners, one player on the edge of the box, two staying back",
   "Defenders form a wall and mark up (walk-through pace to start)",
   "Free kick spots marked centrally and to each side, 20–25 yds out"
  ],
  "directions": [
   "Routine 1 — Shot: two players over the ball; one runs over it as a dummy, the other shoots. Runners follow in for the rebound.",
   "Routine 2 — Lay-off: the first player rolls it square to a teammate at the side of the wall, who shoots first time.",
   "Routine 3 — Behind the wall: the kicker slides a pass down the side of the wall for a runner arriving from outside.",
   "Walk each routine through twice, then run it at full speed against live defenders.",
   "Give each routine a name or hand signal. Finish with 6 live free kicks where the taker calls the routine."
  ],
  "variations": [
   "Easier: no defenders — rehearse the timing against cones and a mannequin wall.",
   "Easier: learn one routine per session.",
   "Harder: defenders are live from the whistle and counter-attack to a halfway gate if they win it.",
   "Harder: the coach calls the spot and the team has 15 seconds to organize."
  ],
  "coaching_points": [
   "Everyone knows the call before the whistle — no talking it through at the ball",
   "Runners time it to arrive, not wait: move as the kicker starts the run-up",
   "Always keep two players back and one on the edge of the box for the clearance"
  ],
  "equipment": [
   "Balls",
   "Cones",
   "Pinnies",
   "Full-size goal"
  ],
  "focus_areas": [
   "Set Pieces",
   "Attacking",
   "Combination Play",
   "Finishing"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "wide-free-kick-delivery",
  "name": "Wide Free Kick: Delivery and Runs",
  "icon": "↗️",
  "category": "Tactical",
  "skill_level": "Intermediate",
  "min_age": "U12",
  "max_age": null,
  "duration": 15,
  "players": "8–14 plus a goalkeeper",
  "description": "Free kicks from wide areas: a quality delivery into the space between the defenders and the goalkeeper, with three runners attacking near post, far post and the penalty spot.",
  "setup": [
   "Full-size goal with a goalkeeper",
   "Free kick spots wide on each side, level with the 18-yd line and 5 yds in from the touchline",
   "Three attackers start on the edge of the box; a fourth waits at the top of the D",
   "3–4 defenders start level with the ball, on the line they would hold in a game"
  ],
  "directions": [
   "The taker raises an arm, then delivers: driven and curling toward goal, between the defensive line and the goalkeeper.",
   "Runner 1 attacks the near post, Runner 2 the far post, Runner 3 the penalty spot.",
   "The player on the D wins anything cleared and shoots or recycles.",
   "Defenders hold their line until the kick, then defend it live.",
   "Take 5 from one side, rotate roles, then switch sides."
  ],
  "variations": [
   "Easier: no defenders — work on the delivery and the timing of the three runs.",
   "Easier: under-12s finish with feet, thigh or chest instead of heading.",
   "Harder: add a defender for each runner.",
   "Harder: out-swinging delivery from the same spot with the other foot."
  ],
  "coaching_points": [
   "Delivery: pace and height the goalkeeper can't come for — aim for the corner of the 6-yd box",
   "Runners: start late and arrive at speed; never stand waiting under the ball",
   "Attack the ball in front of your defender — first contact wins"
  ],
  "equipment": [
   "Balls",
   "Cones",
   "Pinnies",
   "Full-size goal"
  ],
  "focus_areas": [
   "Set Pieces",
   "Crossing",
   "Attacking",
   "Heading"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "defending-free-kicks-the-wall",
  "name": "Defending Free Kicks: Build the Wall",
  "icon": "🧱",
  "category": "Tactical",
  "skill_level": "Intermediate",
  "min_age": "U12",
  "max_age": null,
  "duration": 15,
  "players": "8–14 plus a goalkeeper",
  "description": "The team learns to organize quickly against a free kick: the goalkeeper sets the wall, everyone knows their job, and nobody switches off before the whistle.",
  "setup": [
   "Full-size goal with a goalkeeper",
   "Free kick spots marked around the box: central, each side, and wide",
   "Defending team of 6–8; attackers of 4–6 with the balls",
   "One player is named the \"post player\" who lines the wall up"
  ],
  "directions": [
   "The coach places a ball on a spot and calls \"free kick\".",
   "The goalkeeper shouts the number for the wall: 4–5 central, 3 from an angle, 2 from wide.",
   "The post player stands on the line between the ball and the near post; the wall forms from them toward the middle, and the goalkeeper adjusts it left or right.",
   "The other defenders mark runners, with one player ready to charge the ball if it is rolled square.",
   "Attackers take the kick live. Reset on a new spot. The defense scores a point for every kick kept out."
  ],
  "variations": [
   "Easier: walk it through with no kick — time how fast the team gets set (target: 8 seconds).",
   "Easier: one spot only until the jobs are clear.",
   "Harder: the attackers may take it quickly if the defense is not set.",
   "Harder: the attackers use routines — dummy runs, a square pass, a ball behind the wall."
  ],
  "coaching_points": [
   "Goalkeeper: one loud voice — number, then \"left\", \"right\", \"hold\"",
   "Wall: shoulder to shoulder, stay on your feet, don't turn your back, protect yourself with your hands",
   "First job for everyone else: stand on the ball side of your player and watch for the quick one"
  ],
  "equipment": [
   "Balls",
   "Cones",
   "Pinnies",
   "Full-size goal"
  ],
  "focus_areas": [
   "Set Pieces",
   "Defending",
   "Goalkeeping",
   "Team Shape"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "quick-free-kick-game",
  "name": "Quick Free Kick Game",
  "icon": "⚡",
  "category": "Games",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 15,
  "players": "8–14",
  "description": "A small-sided game where the coach whistles for free kicks all the time — the team that restarts fastest gets the advantage, and the team that reacts fastest stops it.",
  "setup": [
   "Field about 40×30 yds with a goal at each end (goalkeepers optional)",
   "Two teams of 4–7 in pinnies",
   "Coach with a whistle and spare balls"
  ],
  "directions": [
   "Play a normal game.",
   "Every 30–45 seconds the coach blows the whistle and points: free kick to that team, where the ball is.",
   "The attacking team may play at once — a pass, a shot, anything.",
   "The defending team must get 5 yds from the ball and behind it as fast as they can.",
   "A goal scored within 8 seconds of a free kick counts double."
  ],
  "variations": [
   "Easier: the defenders freeze for 2 seconds on the whistle.",
   "Easier: bigger field.",
   "Harder: the free kick must be taken within 3 seconds or it goes to the other team.",
   "Harder: the coach sometimes gives it against the team in possession, so both teams must react."
  ],
  "coaching_points": [
   "Attackers: one player on the ball immediately, the rest run to get open",
   "Defenders: sprint goal-side first, argue never",
   "Look for the forward pass before the other team is set"
  ],
  "equipment": [
   "Balls",
   "Cones",
   "Pinnies",
   "2 goals"
  ],
  "focus_areas": [
   "Set Pieces",
   "Transition",
   "Small-Sided Game"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "throw-in-technique-pairs",
  "name": "Throw-In Technique Pairs",
  "icon": "🤾",
  "category": "Technical",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": null,
  "duration": 8,
  "players": "Pairs",
  "description": "Partners learn a legal throw-in — two hands, behind the head, both feet down — and to control the ball that comes from one.",
  "setup": [
   "Pairs with 1 ball, 6–8 yds apart",
   "The thrower stands behind a line (a touchline or a row of cones)"
  ],
  "directions": [
   "Thrower: both hands behind the ball, take it behind the head, both feet on the ground, and throw to your partner's feet.",
   "Receiver: control it and pass it back along the ground.",
   "After 5 throws, swap roles.",
   "Round 2: throw to the thigh or chest; the receiver controls and passes back.",
   "Round 3: the receiver starts 5 yds further away, checks toward the thrower and gets it on the move."
  ],
  "variations": [
   "Easier: throw from the knees first to feel the ball come from behind the head.",
   "Easier: stand closer.",
   "Harder: take two steps and drag the back foot for a longer throw.",
   "Harder: the receiver plays it back first time to the thrower, who has stepped onto the field."
  ],
  "coaching_points": [
   "Ball starts behind the head and is released above it",
   "Both feet stay on the ground, on or behind the line",
   "Throw it where your teammate can control it — feet first, then thigh or chest"
  ],
  "equipment": [
   "Balls",
   "Cones"
  ],
  "focus_areas": [
   "Set Pieces",
   "First Touch",
   "Warmup"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "throw-in-keep-it",
  "name": "Throw-In Keep-It Game",
  "icon": "🔄",
  "category": "Possession",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 12,
  "players": "6 per group",
  "description": "Keep the ball from your own throw-in: three attackers plus the thrower against two defenders in a box beside the touchline.",
  "setup": [
   "A 15×12 yd box with one long side on the touchline",
   "3 attackers and 2 defenders inside; 1 thrower on the line with the balls",
   "A cone gate at the far side of the box as a target"
  ],
  "directions": [
   "The attackers move to get open: one checks to the thrower, one runs down the line, one drops behind.",
   "The thrower throws to whoever is free, then steps into the box to make it 4v2.",
   "The attackers score 1 point for 4 passes, or 2 points for dribbling through the far gate.",
   "If the defenders win the ball, they dribble it out of the box for a point.",
   "Take 5 throws, then rotate the thrower and the defenders."
  ],
  "variations": [
   "Easier: one defender only.",
   "Easier: the defenders may not challenge the first touch.",
   "Harder: add a third defender.",
   "Harder: the thrower has 5 seconds to throw."
  ],
  "coaching_points": [
   "Movement before the throw: check away, then come back — or swap places with a teammate",
   "Thrower: throw to the foot furthest from the defender, then get on the field",
   "First touch away from pressure or straight back to the thrower"
  ],
  "equipment": [
   "Balls",
   "Cones",
   "Pinnies"
  ],
  "focus_areas": [
   "Set Pieces",
   "Possession",
   "Numbers Up"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "attacking-throw-in-patterns",
  "name": "Attacking Throw-In Patterns",
  "icon": "♟️",
  "category": "Tactical",
  "skill_level": "Intermediate",
  "min_age": "U12",
  "max_age": null,
  "duration": 15,
  "players": "8–12 plus a goalkeeper",
  "description": "Three simple patterns from a throw-in in the attacking third — down the line, bounce and switch, and the long throw — so a throw near the box becomes a chance.",
  "setup": [
   "Attacking third with a full-size goal and goalkeeper",
   "Throw-in spot level with the 18-yd line",
   "Attackers: thrower, a near player, a line runner, a player inside, two in the box",
   "3–4 defenders marking loosely to start"
  ],
  "directions": [
   "Pattern 1 — Down the line: the near player checks short and takes a defender away; the throw goes over them down the line for the runner, who crosses.",
   "Pattern 2 — Bounce and switch: throw to the near player's feet; they set it back to the thrower, who plays inside to switch the field.",
   "Pattern 3 — Into the box: a longer throw toward the near post; one player flicks it on, two attack the second ball.",
   "Walk through each pattern twice, then run it at speed.",
   "Finish live: the thrower picks the pattern from what the defenders give them."
  ],
  "variations": [
   "Easier: no defenders.",
   "Easier: one pattern per session.",
   "Harder: defenders are live and counter to a gate on halfway.",
   "Harder: 6 seconds to take the throw."
  ],
  "coaching_points": [
   "Two movements for every throw: one player comes short, one goes long",
   "Throw early when a teammate is free — a quick throw beats an organized defense",
   "After the throw, the thrower is the free player: get back in the game"
  ],
  "equipment": [
   "Balls",
   "Cones",
   "Pinnies",
   "Full-size goal"
  ],
  "focus_areas": [
   "Set Pieces",
   "Attacking",
   "Combination Play",
   "Crossing"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "goal-kick-build-out",
  "name": "Goal Kick Build-Out",
  "icon": "🧤",
  "category": "Tactical",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 15,
  "players": "8–10 including a goalkeeper",
  "description": "Play out from a goal kick instead of kicking it long: the goalkeeper and back players spread out, make a short pass and work the ball over a line.",
  "setup": [
   "Half a field (7v7 or 9v9 size) with a goal and goalkeeper",
   "A line of cones across the field 25–30 yds out — the target line (the build-out line at 7v7)",
   "Building team: goalkeeper, 2–3 defenders, 2 midfielders",
   "Pressing team: 3 players who start behind the target line"
  ],
  "directions": [
   "The goalkeeper places the ball for a goal kick. Defenders split wide to the edges of the box; a midfielder shows in the middle.",
   "The goalkeeper plays a short pass. The pressing players may go as soon as the ball is kicked.",
   "The building team scores by dribbling or passing to a teammate over the target line.",
   "If the pressers win the ball they have 6 seconds to score in the goal.",
   "Take 6 goal kicks, then rotate the pressers."
  ],
  "variations": [
   "Easier: two pressers instead of three.",
   "Easier: pressers wait until the first pass has been received.",
   "Harder: four pressers.",
   "Harder: the building team has 10 seconds to get over the line."
  ],
  "coaching_points": [
   "Get wide and get open before the kick — make the field big",
   "Receive side-on so you can see the field and play forward",
   "Goalkeeper stays involved: after the pass, move to be the spare player behind the ball"
  ],
  "equipment": [
   "Balls",
   "Cones",
   "Pinnies",
   "Goal"
  ],
  "focus_areas": [
   "Set Pieces",
   "Possession",
   "Team Shape",
   "Goalkeeping"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "playing-out-against-the-press",
  "name": "Playing Out Against the Press",
  "icon": "♟️",
  "category": "Tactical",
  "skill_level": "Advanced",
  "min_age": "U12",
  "max_age": null,
  "duration": 20,
  "players": "12–15 including a goalkeeper",
  "description": "Build from the goalkeeper through the thirds against organized pressure, and recognize when to play short, when to switch and when to go long.",
  "setup": [
   "Half a field plus 10 yds, with a full-size goal and goalkeeper",
   "Three small goals (or gates) on the far line: left, center, right",
   "Building team: goalkeeper, back four, 2–3 midfielders",
   "Pressing team: 5–6 players"
  ],
  "directions": [
   "Every rep starts with the goalkeeper — a goal kick, or a ball the coach plays back.",
   "The building team scores by passing into any of the three small goals.",
   "The pressing team scores in the big goal within 8 seconds of winning the ball.",
   "After each rep, reset quickly: the goalkeeper calls the shape.",
   "Play 3-minute blocks. Between blocks, ask the building team: where was the free player?"
  ],
  "variations": [
   "Easier: the pressing team plays with one fewer.",
   "Easier: the first pass from the goalkeeper is free.",
   "Harder: equal numbers.",
   "Harder: the building team must score within 20 seconds.",
   "Harder: a goal in the opposite small goal from where the build started counts double (switch of play)."
  ],
  "coaching_points": [
   "Find the free player: against one presser it is the other center back; against two, a midfielder or the goalkeeper",
   "Body shape and the first touch decide it — receive on the back foot, facing forward",
   "If the press is set and nothing is on, go long to the far small goal and squeeze up behind it"
  ],
  "equipment": [
   "Balls",
   "Cones",
   "Pinnies",
   "Full-size goal",
   "Small goals"
  ],
  "focus_areas": [
   "Possession",
   "Team Shape",
   "Pressing",
   "Goalkeeping",
   "Transition"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "long-goal-kick-second-ball",
  "name": "Long Goal Kick and Second Ball",
  "icon": "💥",
  "category": "Tactical",
  "skill_level": "Intermediate",
  "min_age": "U14",
  "max_age": null,
  "duration": 15,
  "players": "12–16 including 2 goalkeepers",
  "description": "Win the long goal kick as a team: one player challenges for the first ball, and everyone around them hunts the second ball.",
  "setup": [
   "Full-size goal and goalkeeper at one end; a target zone 10 yds deep either side of halfway",
   "Two teams of 6–7 packed around the target zone: each with a target player, players in front and players behind",
   "A small goal or gate at each end of the zone for the team that wins the second ball"
  ],
  "directions": [
   "The goalkeeper takes a long goal kick into the target zone.",
   "The two target players compete for the first ball.",
   "Everyone else reads the flight and reacts: front players expect the flick-on, back players expect the knock-down.",
   "Whoever wins the second ball attacks the far small goal; the other team defends at once.",
   "Play each ball to a finish (maximum 15 seconds), then reset. Alternate which goalkeeper kicks."
  ],
  "variations": [
   "Easier: the coach throws or volleys the ball in from 20 yds so it is easier to judge.",
   "Easier: the first ball is uncontested — one target player only.",
   "Harder: after winning the second ball the team must score in the full-size goal.",
   "Harder: play it as the restart in an 8v8 game."
  ],
  "coaching_points": [
   "Target player: get under the ball early, jump first, use your arms for balance not for pushing",
   "Second ball: move before it lands — guess where it will drop and get there on your toes",
   "Whole team squeezes toward the ball: no big gaps for the other team to play in"
  ],
  "equipment": [
   "Balls",
   "Cones",
   "Pinnies",
   "Full-size goal",
   "Small goals"
  ],
  "focus_areas": [
   "Set Pieces",
   "Aggression",
   "Heading",
   "Team Shape"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "kickoff-routines",
  "name": "Kickoff Routines",
  "icon": "🏁",
  "category": "Tactical",
  "skill_level": "Beginner",
  "min_age": "U10",
  "max_age": null,
  "duration": 10,
  "players": "The whole team",
  "description": "Give the team two kickoffs it can run without thinking — one that keeps the ball and one that attacks early — and a shape to defend the other team's kickoff.",
  "setup": [
   "The center circle and your own half, with the team in its formation",
   "A second group (or cones) standing in as the opponent in the other half",
   "One ball on the center spot"
  ],
  "directions": [
   "Kickoff 1 — Keep it: play back to a center midfielder, who switches it to a full back; the team moves up together.",
   "Kickoff 2 — Go early: play back, then a long diagonal ball toward the corner for a winger who started running on the whistle.",
   "Walk each one through, then run it against the opponent group at full speed.",
   "Defending a kickoff: front players start on the edge of the circle and press the first pass; the back line holds at the top of its own third.",
   "Finish with a game: restart with a kickoff every 2 minutes, alternating teams."
  ],
  "variations": [
   "Easier: no opponents — rehearse the passes and the runs.",
   "Easier: one kickoff only for younger teams.",
   "Harder: the opponent group presses at full speed.",
   "Harder: the captain chooses the kickoff with a hand signal."
  ],
  "coaching_points": [
   "Everyone in their own half and still until the ball is kicked",
   "The first pass is firm and to feet — never give the ball away from your own kickoff",
   "When the other team kicks off, the nearest two players close the ball together"
  ],
  "equipment": [
   "Balls",
   "Cones",
   "Pinnies"
  ],
  "focus_areas": [
   "Set Pieces",
   "Team Shape",
   "Attacking"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "win-it-back",
  "name": "Win It Back!",
  "icon": "🔥",
  "category": "Games",
  "skill_level": "Beginner",
  "min_age": "U8",
  "max_age": "U12",
  "duration": 10,
  "players": "6–12",
  "description": "The first pressing game: when your team loses the ball, everyone has five seconds to win it back — and a goal scored straight after winning it counts double.",
  "setup": [
   "Field about 30×20 yds with a small goal at each end",
   "Two teams of 3–5 in pinnies",
   "Coach on the side with spare balls, counting out loud"
  ],
  "directions": [
   "Play a normal small-sided game.",
   "When a team loses the ball, the coach counts \"5-4-3-2-1\" out loud.",
   "If they win it back before \"1\", they get a point.",
   "A goal scored within 5 seconds of winning the ball back counts double.",
   "Play 3-minute games. Celebrate the win-backs as loudly as the goals."
  ],
  "variations": [
   "Easier: count from 8.",
   "Easier: play 3v3 so there is more space.",
   "Harder: count from 3.",
   "Harder: only the nearest two players may press; the others must get behind the ball."
  ],
  "coaching_points": [
   "The player nearest the ball goes right away — fast feet, then slow down as you arrive",
   "Everyone else moves closer to the ball too",
   "Stay on your feet and poke the ball away; don't dive in"
  ],
  "equipment": [
   "Balls",
   "Cones",
   "Pinnies",
   "Small goals"
  ],
  "focus_areas": [
   "Pressing",
   "Aggression",
   "Transition",
   "Fun"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "press-on-the-trigger",
  "name": "Press on the Trigger",
  "icon": "🚨",
  "category": "Tactical",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 15,
  "players": "8–10",
  "description": "Defenders learn when to press and to go together: on a bad touch, a back pass or a pass to the sideline, three press as a unit and score if they win it.",
  "setup": [
   "Field about 35×25 yds, split in half by a line of cones, with a small goal at one end",
   "Four attackers play keep-away in the far half",
   "Three defenders wait on the halfway line; another group of three waits behind the small goal"
  ],
  "directions": [
   "The coach plays a ball to the four attackers, who pass it around in their half.",
   "The defenders hold their line and slide across with the ball.",
   "Triggers: a heavy touch, a pass backward, a pass to a player on the sideline, or a player receiving with their back turned. On a trigger, the nearest defender shouts \"go\" and all three press.",
   "If the defenders win it, they attack the small goal behind them at once. The attackers score with 6 passes.",
   "Play 5 balls, then the next three defenders come in."
  ],
  "variations": [
   "Easier: the coach calls \"go\" for the first few balls.",
   "Easier: one trigger only — the pass to the sideline.",
   "Harder: the attackers score by dribbling over the halfway line.",
   "Harder: four defenders against five attackers on a bigger field."
  ],
  "coaching_points": [
   "Go together or don't go: one player pressing alone is easy to play around",
   "First presser shuts off the way forward; the second and third take away the nearest passes",
   "Sprint to close the space, then slow down and stay on your feet"
  ],
  "equipment": [
   "Balls",
   "Cones",
   "Pinnies",
   "Small goal"
  ],
  "focus_areas": [
   "Pressing",
   "Defending",
   "Transition"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "high-press-the-goal-kick",
  "name": "High Press the Goal Kick",
  "icon": "🧲",
  "category": "Tactical",
  "skill_level": "Advanced",
  "min_age": "U12",
  "max_age": null,
  "duration": 20,
  "players": "11–14 including a goalkeeper",
  "description": "Press the other team's goal kick as a unit: set a trap, force the ball to one side, win it high and finish within seconds.",
  "setup": [
   "Half a field with a full-size goal and goalkeeper",
   "Building team: goalkeeper, 4 defenders, 2 midfielders; they score by dribbling over the halfway line",
   "Pressing team: 5–6 players in the shape of your front and midfield lines",
   "A line of cones down the middle of the half to show the two sides"
  ],
  "directions": [
   "The building team takes a goal kick. The pressing team starts in its shape, 5 yds outside the box.",
   "The front player curves the run to show the ball to one side.",
   "Once the ball goes to that side, everyone shifts across and locks it there: winger presses the full back, midfielders mark the short options, the far-side winger tucks in.",
   "Win it and score in the full-size goal within 8 seconds.",
   "Take 6 goal kicks, talk about what worked, then swap roles."
  ],
  "variations": [
   "Easier: the building team must play its first pass to a full back.",
   "Easier: walk through the shifts with no ball first.",
   "Harder: the building team may go long to a target player on halfway.",
   "Harder: after winning it the pressing team has 5 seconds."
  ],
  "coaching_points": [
   "The front player sets the trap: curve the run so there is only one pass on",
   "When the ball travels, everyone travels — move while it is in flight",
   "Leave the far side: nobody marks the player furthest from the ball"
  ],
  "equipment": [
   "Balls",
   "Cones",
   "Pinnies",
   "Full-size goal"
  ],
  "focus_areas": [
   "Pressing",
   "Team Shape",
   "Defending",
   "Transition",
   "Set Pieces"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "sideline-pressing-trap",
  "name": "Sideline Pressing Trap",
  "icon": "🪤",
  "category": "Tactical",
  "skill_level": "Advanced",
  "min_age": "U14",
  "max_age": null,
  "duration": 20,
  "players": "12–16",
  "description": "Use the touchline as an extra defender: steer the ball wide in the middle third, then close the trap with three players and counter.",
  "setup": [
   "Middle third of the field, full width, with a small goal on each end line",
   "Two teams of 6–8, each in two lines (for example a back four and a midfield three)",
   "A 12-yd channel marked down each touchline — the trap zones"
  ],
  "directions": [
   "Play a normal game across the middle third.",
   "The defending team stays compact in the center and leaves the pass into the channels open.",
   "When the ball enters a trap zone, the defending team springs it: the nearest player presses to stop the forward pass, a second cuts off the pass inside, a third takes away the pass back.",
   "A ball won in a trap zone and scored within 10 seconds counts triple.",
   "Play 4-minute games."
  ],
  "variations": [
   "Easier: the attacking team is limited to 3 touches.",
   "Easier: freeze the first two traps and walk players into their positions.",
   "Harder: the attackers get a point for switching play out of a trap zone.",
   "Harder: no touch limit and a narrower channel."
  ],
  "coaching_points": [
   "Patience first: stay compact and let them play wide",
   "The press starts while the ball is traveling to the channel",
   "Show them down the line, never back inside; the far-side players squeeze over to the middle"
  ],
  "equipment": [
   "Balls",
   "Cones",
   "Pinnies",
   "Small goals"
  ],
  "focus_areas": [
   "Pressing",
   "Defending",
   "Team Shape",
   "Aggression"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "team-press-walk-to-live",
  "name": "Team Press: Walk-Through to Live",
  "icon": "🧩",
  "category": "Tactical",
  "skill_level": "Advanced",
  "min_age": "U14",
  "max_age": null,
  "duration": 25,
  "players": "16–22 including goalkeepers",
  "description": "The whole team learns its pressing shape in three steps — walking, at half pace, then live — so every player knows where to be when the ball moves.",
  "setup": [
   "Three-quarters of a full field with a full-size goal and goalkeeper at each end",
   "Your team in its formation; a second team as the opponent building from its goalkeeper",
   "Flat markers showing the line your team starts its press from"
  ],
  "directions": [
   "Step 1 — Walk: the opponent passes slowly across its back line. Your team walks to its positions on each pass; the coach stops play and corrects.",
   "Step 2 — Half pace: the opponent may now play forward; your team presses at jogging speed and calls \"go\" on the triggers (back pass, heavy touch, pass to a full back).",
   "Step 3 — Live: full speed. Your team scores in the big goal after winning the ball; the opponent scores by reaching your pressing line with the ball under control.",
   "Reset from the opponent's goalkeeper every time.",
   "Finish with 10 minutes of normal play and count how many times the press wins the ball."
  ],
  "variations": [
   "Easier: stay on Step 1 and Step 2 for the first session.",
   "Easier: the opponent plays with two fewer.",
   "Harder: the opponent may play long over the press — the back line must judge when to drop.",
   "Harder: change the starting line: high press, then a mid-block."
  ],
  "coaching_points": [
   "One player triggers, everyone goes: the back line pushes up as the front line presses",
   "Distances: no more than 10–12 yds between your lines",
   "If the press is beaten, drop quickly and get compact again — don't chase from behind"
  ],
  "equipment": [
   "Balls",
   "Flat markers",
   "Pinnies",
   "2 full-size goals"
  ],
  "focus_areas": [
   "Pressing",
   "Team Shape",
   "Defending"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "cutback-and-finish",
  "name": "Cutback and Finish",
  "icon": "↩️",
  "category": "Shooting",
  "skill_level": "Intermediate",
  "min_age": "U10",
  "max_age": null,
  "duration": 12,
  "players": "6–12 plus a goalkeeper",
  "description": "The first cross to teach: dribble to the end line and pull the ball back along the ground for a teammate arriving to finish.",
  "setup": [
   "Full-size or medium goal with a goalkeeper",
   "A wide line of players with balls on each side, 25 yds from the end line",
   "A central line at the top of the box",
   "A cone on each side where the box meets the end line — the cutback spot"
  ],
  "directions": [
   "A wide player dribbles at speed down the side toward the cutback spot.",
   "The central player times a run toward the penalty spot.",
   "At the end line, the wide player cuts the ball back along the ground, away from the goalkeeper.",
   "The runner finishes first time.",
   "The wide player joins the central line and the finisher joins the other wide line. Alternate sides."
  ],
  "variations": [
   "Easier: no goalkeeper, and the runner may take a touch.",
   "Easier: start the wide player closer to the end line.",
   "Harder: add a second runner — one near post, one penalty spot — and the wide player chooses.",
   "Harder: add a recovering defender who chases the wide player."
  ],
  "coaching_points": [
   "Wide player: head up before the cutback — pick out the runner",
   "Pull it back, not across: the pass goes away from the goalkeeper and defenders",
   "Runner: hold your run, then arrive as the ball does; side-foot it into the corner"
  ],
  "equipment": [
   "Balls",
   "Cones",
   "Goal"
  ],
  "focus_areas": [
   "Crossing",
   "Finishing",
   "Attacking",
   "Combination Play"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "protect-the-lead",
  "name": "Protect the Lead",
  "icon": "🛡️",
  "category": "Games",
  "skill_level": "Advanced",
  "min_age": "U14",
  "max_age": null,
  "duration": 20,
  "players": "14–22 including goalkeepers",
  "description": "Game management: one team is a goal up with ten minutes left and has to see the game out; the other has to find a way through.",
  "setup": [
   "Field sized for the numbers (8v8 up to 11v11) with full-size goals and goalkeepers",
   "Two teams in their formations",
   "A visible clock, or the coach calling the time every 2 minutes"
  ],
  "directions": [
   "Start at 1–0 with 10 minutes to play.",
   "The leading team wins by not conceding. It may score a second goal, but its job is the result.",
   "The trailing team wins by scoring twice, and draws by scoring once.",
   "Play it out with normal rules and restarts.",
   "Debrief for 2 minutes: what did the leading team do with the ball? Then swap roles and play again."
  ],
  "variations": [
   "Easier: the leading team has an extra player.",
   "Easier: play 6 minutes.",
   "Harder: the leading team is a player down.",
   "Harder: the leading team must keep the ball in the opponent's half for 30 seconds to score a bonus point."
  ],
  "coaching_points": [
   "With the ball: keep it in their half, play to the corners, no risks in your own third",
   "Without the ball: compact, patient, no cheap fouls near the box",
   "Leaders talk: count down the time and manage the restarts"
  ],
  "equipment": [
   "Balls",
   "Cones",
   "Pinnies",
   "2 full-size goals"
  ],
  "focus_areas": [
   "Team Shape",
   "Defending",
   "Possession"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "chase-the-game",
  "name": "Chase the Game",
  "icon": "⏱️",
  "category": "Games",
  "skill_level": "Advanced",
  "min_age": "U14",
  "max_age": null,
  "duration": 20,
  "players": "14–22 including goalkeepers",
  "description": "The other side of game management: a goal down with eight minutes left, the team raises the tempo, presses higher and commits numbers — without losing its head.",
  "setup": [
   "Field sized for the numbers (8v8 up to 11v11) with full-size goals and goalkeepers",
   "Two teams in their formations; spare balls behind each goal and on the sidelines for fast restarts",
   "A visible clock"
  ],
  "directions": [
   "Start with one team 1–0 down and 8 minutes to play.",
   "The chasing team may change its shape: push a defender into midfield, or go to two strikers.",
   "Every restart for the chasing team is taken within 5 seconds, using the nearest spare ball.",
   "A goal ends the round. If time runs out, the leading team wins the round.",
   "Play 3 rounds, swapping roles. Between rounds the chasing team gets 60 seconds to agree its plan."
  ],
  "variations": [
   "Easier: the chasing team has an extra player.",
   "Easier: play 10 minutes.",
   "Harder: the chasing team needs two goals in 10 minutes.",
   "Harder: the leading team gets a point for every counter-attack that ends in a shot."
  ],
  "coaching_points": [
   "Urgency without panic: quick restarts and forward passes, but keep your shape behind the ball",
   "Get the ball wide and into the box early; get three players in the box for every cross",
   "Win it back at once when you lose it — don't give them a rest"
  ],
  "equipment": [
   "Balls (many)",
   "Cones",
   "Pinnies",
   "2 full-size goals"
  ],
  "focus_areas": [
   "Attacking",
   "Pressing",
   "Aggression",
   "Team Shape"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "rest-defense-and-counterpress",
  "name": "Rest Defense and Counterpress",
  "icon": "⚖️",
  "category": "Tactical",
  "skill_level": "Advanced",
  "min_age": "U16",
  "max_age": null,
  "duration": 20,
  "players": "14–18 including goalkeepers",
  "description": "While the team attacks, the players behind the ball set up to stop the counter: stay connected, mark the outlets, and win the ball back within five seconds of losing it.",
  "setup": [
   "Two-thirds of a field with a full-size goal and goalkeeper at one end and two small counter goals on the far line",
   "Attacking team of 8: front players, plus three or four staying behind the ball (the rest defense)",
   "Defending team of 6–7, with two strikers left high as outlets"
  ],
  "directions": [
   "The attacking team builds and tries to score in the full-size goal.",
   "While it attacks, the players behind the ball hold their positions: two center backs touch-tight on the outlet strikers and a midfielder screening in front.",
   "When the ball is lost, the nearest three attackers counterpress for 5 seconds.",
   "The defending team scores by passing into either counter goal within 10 seconds of winning the ball.",
   "Play 3-minute blocks; a goal in the big goal is 1 point, a counter goal is 2."
  ],
  "variations": [
   "Easier: one outlet striker only.",
   "Easier: the counter must go through a pass to an outlet striker first.",
   "Harder: three counter goals, spread across the field.",
   "Harder: the attacking team must have both full backs ahead of the ball when it shoots."
  ],
  "coaching_points": [
   "Before the shot or cross, look behind you: who has their striker, who is screening?",
   "Counterpress toward the ball and forward — close the passes that go to the outlets",
   "If the first five seconds fail, drop off together and delay"
  ],
  "equipment": [
   "Balls",
   "Cones",
   "Pinnies",
   "Full-size goal",
   "Small goals"
  ],
  "focus_areas": [
   "Transition",
   "Pressing",
   "Team Shape",
   "Defending"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "position-finishing-circuit",
  "name": "Position Finishing Circuit",
  "icon": "🥅",
  "category": "Shooting",
  "skill_level": "Intermediate",
  "min_age": "U14",
  "max_age": null,
  "duration": 20,
  "players": "9–15 plus a goalkeeper",
  "description": "Each group finishes the way its position scores in games: strikers in and around the box, wingers cutting in and crossing, midfielders arriving late from the edge.",
  "setup": [
   "Full-size goal with a goalkeeper; a server with balls at the top of the box",
   "Station A — strikers: on the penalty spot, back to goal",
   "Station B — wingers: wide on each side, 30 yds out",
   "Station C — midfielders: 25 yds out, centrally"
  ],
  "directions": [
   "Strikers: receive a firm pass with back to goal, turn or set it for themselves, and finish in two touches.",
   "Wingers: drive at a mannequin, cut inside and shoot far post — the next rep, go outside and cross for the strikers.",
   "Midfielders: play a pass into a striker, follow it, and strike the lay-off first time from the edge of the box.",
   "Run the stations in turn so the goalkeeper faces one ball at a time: A, B, C, then a combined rep where the winger crosses and all three groups arrive.",
   "After 6 minutes, players may move to a second position."
  ],
  "variations": [
   "Easier: no mannequins and an extra touch for everyone.",
   "Easier: run each station on its own for 3 minutes.",
   "Harder: add a passive defender at each station.",
   "Harder: every finish with the weaker foot.",
   "Harder: score the session — first group to 10 goals."
  ],
  "coaching_points": [
   "Finish like your position: strikers quick and low, wingers across the goalkeeper, midfielders through the ball from distance",
   "Every shot is followed in for the rebound",
   "Train the weak side as well: both feet and both sides of the field"
  ],
  "equipment": [
   "Balls (many)",
   "Cones",
   "Mannequins or poles",
   "Full-size goal"
  ],
  "focus_areas": [
   "Finishing",
   "Crossing",
   "Combination Play"
  ],
  "video_file": null,
  "video_url": null,
  "from_hs": false,
  "after_id": null
 },
 {
  "id": "set-piece-scrimmage",
  "name": "Set-Piece Scrimmage",
  "icon": "🏟️",
  "category": "Scrimmage",
  "skill_level": "Intermediate",
  "min_age": "U12",
  "max_age": null,
  "duration": 25,
  "players": "14–22 including goalkeepers",
  "description": "A scrimmage that keeps stopping for set pieces, so the team practices its free kicks, corners, throw-ins and goal kicks at game speed, attacking and defending.",
  "setup": [
   "Field sized for the numbers with goals and goalkeepers",
   "Two teams in their formations",
   "Coach with a whistle and a list of restarts to call"
  ],
  "directions": [
   "Play a normal game.",
   "Every 60–90 seconds the coach stops play and calls a restart for one team: free kick (and where), corner, throw-in, goal kick or kickoff.",
   "Both teams organize as they would in a match; the team has 15 seconds to take it.",
   "A goal scored from a set piece, or within 10 seconds of one, counts double.",
   "Make sure both teams get the same restarts. Finish with 5 minutes of open play."
  ],
  "variations": [
   "Easier: call only one type of restart per game (for example, only corners).",
   "Easier: allow 30 seconds to organize.",
   "Harder: the team must use a named routine.",
   "Harder: the defending team scores double if it clears and counter-attacks to a shot."
  ],
  "coaching_points": [
   "Attacking: everyone knows their job before the ball is placed",
   "Defending: organize fast — a loud goalkeeper and no ball-watching",
   "Stay switched on for the second ball; most set-piece goals come from it"
  ],
  "equipment": [
   "Balls",
   "Cones",
   "Pinnies",
   "2 goals"
  ],
  "focus_areas": [
   "Set Pieces",
   "Team Shape",
   "Small-Sided Game"
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
