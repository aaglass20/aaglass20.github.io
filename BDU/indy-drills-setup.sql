-- =====================================================================
--  BDU — The Indy Way drill library (indy-drill-library.html)
--
--  Run this ONCE in the Supabase SQL Editor:
--  https://supabase.com/dashboard/project/fpnmnlrwhwnuefbnehuf/sql
--
--  BEFORE YOU RUN IT: change the coach PIN on the line marked
--  "SET YOUR PIN HERE" (near the bottom of part 3). Change it in the
--  SQL Editor only — this file is in a public repo, so never save the
--  real PIN in it.
--
--  What it makes:
--   1. bdu_drills            — the drills (anyone can read, nobody can
--                              write directly)
--   2. bdu_drill_admin       — the coach PIN, stored hashed, readable by
--                              no one
--   3. bdu_drill_pin_ok / bdu_drill_save / bdu_drill_delete — the only
--                              way to change a drill; each checks the PIN
--   4. bdu-drill-videos      — storage bucket for videos uploaded to
--                              drills that have none
--   5. the 40 drills from the page, reshaped (Setup, Directions,
--      Variations, Coaching Points)
--
--  Safe to run again: it never overwrites a drill that already exists
--  and never changes a PIN that is already set.
-- =====================================================================

-- ---- 1. Drills -------------------------------------------------------
create table if not exists bdu_drills (
  id              text        primary key,            -- kebab-case, never changes (the practice builder uses it)
  name            text        not null check (char_length(btrim(name)) between 1 and 120),
  icon            text        not null default '⚽',
  category        text        not null check (category in
                    ('Warmup','Fitness','Technical','Passing','Dribbling','Possession','Shooting','Tactical','Games','Scrimmage')),
  skill_level     text        not null default '' check (skill_level in ('','Beginner','Intermediate','Advanced')),
  min_age         text        not null default 'U10' check (min_age in ('U8','U10','U12','U14','U16')),
  duration        int         not null default 15 check (duration between 1 and 180),
  players         text        not null default '',
  description     text        not null default '',
  setup           text[]      not null default '{}',
  directions      text[]      not null default '{}',
  variations      text[]      not null default '{}',
  coaching_points text[]      not null default '{}',
  equipment       text[]      not null default '{}',
  video_file      text,                                -- a file already on the site: "name.mp4" (BDU/vid/) or "tactics/name.webm"
  video_url       text check (video_url is null or video_url ~* '^https://\S+$'),  -- an uploaded video or a link
  extra           jsonb,                               -- odd extras, e.g. the Beep Test shuttle table
  from_hs         boolean     not null default false,  -- came from the high school program (shows the HS badge)
  sort_order      int         not null default 1000,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table bdu_drills enable row level security;
drop policy if exists "anyone can read drills" on bdu_drills;
create policy "anyone can read drills" on bdu_drills for select to anon, authenticated using (true);
-- no insert / update / delete policies: changes go through the functions below

-- ---- 2. Coach PIN (hashed; no policies, so the page can never read it) ----
create table if not exists bdu_drill_admin (
  id       int  primary key default 1 check (id = 1),
  pin_hash text not null
);
alter table bdu_drill_admin enable row level security;

-- ---- 3. Functions: the only way to change a drill --------------------
create or replace function bdu_drill_pin_ok(p_pin text)
returns boolean language plpgsql security definer set search_path = public as $$
declare ok boolean;
begin
  select a.pin_hash = encode(sha256(convert_to(coalesce(p_pin, ''), 'UTF8')), 'hex') into ok
    from bdu_drill_admin a where a.id = 1;
  if not coalesce(ok, false) then perform pg_sleep(0.5); end if;  -- slows down guessing
  return coalesce(ok, false);
end $$;

create or replace function bdu_drill_save(p_pin text, p_drill jsonb)
returns bdu_drills language plpgsql security definer set search_path = public as $$
declare
  v_id   text := nullif(btrim(coalesce(p_drill->>'id', '')), '');
  v_name text := btrim(coalesce(p_drill->>'name', ''));
  v_base text;
  v_n    int := 1;
  v_row  bdu_drills;
begin
  if not bdu_drill_pin_ok(p_pin) then raise exception 'Wrong PIN' using errcode = '28000'; end if;
  if v_name = '' then raise exception 'A drill needs a name'; end if;

  if v_id is null then
    -- new drill: make its id from the name ("Rock the River" → rock-the-river)
    v_base := nullif(btrim(regexp_replace(lower(v_name), '[^a-z0-9]+', '-', 'g'), '-'), '');
    v_base := coalesce(v_base, 'drill');
    v_id := v_base;
    while exists (select 1 from bdu_drills d where d.id = v_id) loop
      v_n := v_n + 1;
      v_id := v_base || '-' || v_n;
    end loop;
  end if;

  insert into bdu_drills as d (id, name, icon, category, skill_level, min_age, duration, players, description,
                               setup, directions, variations, coaching_points, equipment, video_file, video_url, from_hs)
  values (
    v_id, v_name,
    coalesce(nullif(btrim(p_drill->>'icon'), ''), '⚽'),
    p_drill->>'category',
    coalesce(p_drill->>'skill_level', ''),
    coalesce(nullif(p_drill->>'min_age', ''), 'U10'),
    coalesce((p_drill->>'duration')::int, 15),
    btrim(coalesce(p_drill->>'players', '')),
    btrim(coalesce(p_drill->>'description', '')),
    array(select jsonb_array_elements_text(coalesce(p_drill->'setup', '[]'::jsonb))),
    array(select jsonb_array_elements_text(coalesce(p_drill->'directions', '[]'::jsonb))),
    array(select jsonb_array_elements_text(coalesce(p_drill->'variations', '[]'::jsonb))),
    array(select jsonb_array_elements_text(coalesce(p_drill->'coaching_points', '[]'::jsonb))),
    array(select jsonb_array_elements_text(coalesce(p_drill->'equipment', '[]'::jsonb))),
    nullif(btrim(coalesce(p_drill->>'video_file', '')), ''),
    nullif(btrim(coalesce(p_drill->>'video_url', '')), ''),
    coalesce((p_drill->>'from_hs')::boolean, false)
  )
  on conflict (id) do update set
    name = excluded.name, icon = excluded.icon, category = excluded.category, skill_level = excluded.skill_level,
    min_age = excluded.min_age, duration = excluded.duration, players = excluded.players,
    description = excluded.description, setup = excluded.setup, directions = excluded.directions,
    variations = excluded.variations, coaching_points = excluded.coaching_points, equipment = excluded.equipment,
    video_file = excluded.video_file, video_url = excluded.video_url, from_hs = excluded.from_hs, updated_at = now()
  returning d.* into v_row;
  return v_row;
end $$;

create or replace function bdu_drill_delete(p_pin text, p_id text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not bdu_drill_pin_ok(p_pin) then raise exception 'Wrong PIN' using errcode = '28000'; end if;
  delete from bdu_drills where id = p_id;
end $$;

grant execute on function bdu_drill_pin_ok(text), bdu_drill_save(text, jsonb), bdu_drill_delete(text, text) to anon, authenticated;

-- SET YOUR PIN HERE (8 or more characters; a short phrase is best). Only used the first time.
insert into bdu_drill_admin (id, pin_hash)
values (1, encode(sha256(convert_to('CHANGE-ME-BEFORE-RUNNING', 'UTF8')), 'hex'))
on conflict (id) do nothing;

-- To change the PIN later, run just this (with your new PIN):
--   update bdu_drill_admin set pin_hash = encode(sha256(convert_to('new pin here', 'UTF8')), 'hex') where id = 1;

-- ---- 4. Video uploads ------------------------------------------------
-- Public bucket (videos play without a login), 50 MB a file, video files only.
-- Uploading is open like the other BDU pages; a video only shows on a drill
-- once the drill is saved, which needs the PIN.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('bdu-drill-videos', 'bdu-drill-videos', true, 52428800, array['video/mp4', 'video/webm', 'video/quicktime'])
on conflict (id) do nothing;

drop policy if exists "anon can upload bdu drill videos" on storage.objects;
create policy "anon can upload bdu drill videos" on storage.objects
  for insert to anon, authenticated with check (bucket_id = 'bdu-drill-videos');

-- ---- 5. The drills ---------------------------------------------------
-- From the hard-coded list the page used to have. Drills that only had a paragraph
-- and three cues had Setup, Directions and Variations written out — check those
-- against the videos and fix them on the page (Edit drill).
insert into bdu_drills (id, name, icon, category, skill_level, min_age, duration, players, description,
                        setup, directions, variations, coaching_points, equipment, video_file, extra, sort_order)
values
('4-person-movement-warmup', '4 Person Movement Warmup', '🏃', 'Warmup', '', 'U8', 10, 'Groups of 4', 'Ball-and-movement warmup in fours: constant motion while the group works up from two-touch passing to juggling without a bounce.',
   array['Groups of 4 with 1 ball per group', 'About a 15×15 yd area per group (cones optional)', 'Players spread out — no fixed spots'],
   array['All four players move continuously through the area, passing and then running into new space. Avoid circular patterns.', 'Round 1 (1–2 min): two-touch passing on the ground.', 'Round 2: one-touch passing.', 'Round 3: one-bounce juggle — keep the ball in the air between players, one bounce allowed.', 'Round 4: no-bounce juggle.', 'Rest 30 seconds between rounds.'],
   array['Easier: stay on the two-touch and one-touch rounds.', 'Easier: allow a catch and a self-serve on the juggling rounds.', 'Harder: headers only.', 'Harder: combination sequence before passing on — chest to thigh to foot.', 'Harder: two balls per group.'],
   array['Keep moving — no standing still', 'Progress the difficulty each round', 'Head up to see teammates early', 'Pass and move into a new space — never back to where you just were'],
   array['Balls', 'Cones'], '4 person Movement Warmup.mp4', null, 10),
('circle-passing-warmup', 'Circle Passing Warmup', '⭕', 'Warmup', '', 'U8', 10, '8–12', 'Pass-and-follow warmup around a circle of cones, with the coach feeding in more balls as the rhythm builds.',
   array['Circle of cones 15–20 yds across, one cone per player', 'One player at each cone', 'Coach near the circle with 5 balls'],
   array['The coach feeds the first ball to a player on the circle.', 'That player controls it, passes to the next cone in the set direction, then sprints to that cone.', 'The next player controls, passes on and follows the pass the same way.', 'As the rhythm develops, the coach feeds in more balls — up to 5 at once.', 'Work for 1–2 minutes, then reverse the direction.'],
   array['Easier: one ball only and a jog instead of a sprint.', 'Easier: unlimited touches.', 'Harder: one-touch passing.', 'Harder: receive with the back foot and pass with the other.', 'Harder: the coach calls "switch" to reverse direction at any time.'],
   array['Sprint to next cone after your pass', 'One or two touches max — keep the rhythm', 'Communicate before and after the ball'],
   array['Balls', 'Cones'], 'circlePassingWarmup.mp4', null, 20),
('agility-ladder', 'Agility Ladder', '🏃', 'Fitness', 'Intermediate', 'U8', 10, 'Any (1 ladder per 6 players)', 'Players work through a progression of agility ladder patterns — from single-leg runs and 2-in to lateral shuffles, Ickey Shuffle, Carioca, plyometric hops, and a ladder-to-sprint exit — building foot speed, coordination, and movement fluency before the main session.',
   array['Ladder: One agility ladder laid flat on the ground (10–12 rungs).', 'Players: Single-file line behind the start; 1 player runs at a time, jog back around the outside to rejoin the queue.', 'Spacing: Allow one player to finish before the next starts to avoid collisions.'],
   array['Phase 1 — Linear Basics: Run two patterns — single-leg run (one foot per box) and 2-in (both feet per box). 2 reps each.', 'Phase 2 — Lateral Patterns: Run two patterns — lateral in-and-outs (sideways, lead-in, trail-in, lead-out, trail-out) and Ickey Shuffle (in-in-out zigzag). 2 reps each.', 'Phase 3 — Rotational: Carioca/Grapevine sideways down the ladder (trail foot crosses front, then behind). 2 reps each direction.', 'Phase 4 — Plyometrics: Hopscotch (straddle-single-straddle) and lateral bunny hops (two feet in-out-in-out slalom). 2 reps each.', 'Phase 5 — Soccer Exit: Complete any pattern (e.g., 2-in or Ickey Shuffle) and explode into a 5–10 yd acceleration sprint off the final rung. Optional: partner serves a 1-touch ball at the exit. 2–3 reps.'],
   array['U8/Beginners: Run phases 1–2 only (single-leg run, 2-in, lateral in-and-outs). Walk through the pattern once before each run.', 'U10 standard: Phases 1–4 as described. Skip the soccer exit ball work.', 'U14+/Advanced: All 5 phases including sprint exit with partner ball serve. Add In-In-Out with 180° hip flip for recovery mechanics.', 'Large groups (12+): Set up 2–3 ladders running simultaneously; players rotate between ladders on the coach''s signal.'],
   array['Quiet Feet: Players who slap the rungs are landing flat-footed and absorbing ground contact instead of bouncing off it — cue "light as a feather" and demonstrate the difference between heavy and quick contacts.', 'Arms Drive the Legs: Foot turnover is limited by arm swing. Pump elbows at 90 degrees cheek-to-pocket — test it by having players run arms-crossed and feel the loss of speed.', 'Progress Then Speed: Teach the pattern correctly at 50% speed first, then build to full speed — rushing a pattern before it is clean produces sloppy footwork that reinforces bad habits.'],
   array['Agility ladder', 'Cones', 'Balls (optional)'], null, null, 30),
('beep-test', 'Beep Test', '📡', 'Fitness', 'Intermediate', 'U10', 20, 'Any', 'Players run 20m back-and-forth shuttles in time with an audio beep track that increases speed each level — they continue until they miss two consecutive beeps, and their final level/shuttle score is recorded as their aerobic fitness benchmark.',
   array['Course: Two parallel lines of cones exactly 20 meters apart on a flat, non-slip surface.', 'Audio: Load the standard 20m Multi-Stage Fitness Test (MSFT) audio on a phone or speaker. Calibrate before testing.', 'Players: All participants line up along one starting line.', 'Recording: Coach or assistant records each player''s last completed level and shuttle (e.g., "8.6" = Level 8, Shuttle 6).'],
   array['Start: All players sprint to the far line and touch it before the next beep, then sprint back on the next beep.', 'Shuttle Rule: Must reach and cross the 20m line with at least one foot before or on the beep. No early starts.', 'Warnings: First miss = warning; turn immediately and catch up. Second consecutive miss = eliminated.', 'Levels: Triple-beep signals level change — speed increases 0.5 km/h per level from 8.5 km/h. See Shuttle Reference Table for full data.', 'Scoring: Record as Level.Shuttle (e.g., 10.4 = Level 10, Shuttle 4). Repeat each season to track improvement.'],
   array['U10 standard: Stop at Level 5 regardless — focus on learning the protocol and pacing, not maximum score.', 'U12 standard: Full test to exhaustion. Record and compare scores each season.', 'U14+/Advanced: Set age-specific benchmarks (e.g., Level 10+ for field players, Level 8+ for GKs) as part of seasonal fitness assessment.', 'Mixed groups: All ages run simultaneously — slower players finish earlier and cheer teammates; no separate heat needed.'],
   array['Pacing Strategy: Players who sprint from beep 1 exhaust themselves by Level 6–7 — encourage a controlled, rhythmic stride in the early levels.', 'Line Discipline: Touching the line before the beep (not stopping on it, not three steps past) is a learnable skill that adds 1–2 levels without any fitness gain.', 'Mental Toughness: Levels 9–12 are where most youth players drop out — coach should call encouragement by name; many players can push 1–2 levels past where they think they''re done.'],
   array['Cones', 'Beep test audio', 'Stopwatch', 'Score sheet'], null, '{"shuttleData":[{"level":1,"kmh":8.5,"secPerLap":8.47,"shuttles":7},{"level":2,"kmh":9,"secPerLap":8,"shuttles":8},{"level":3,"kmh":9.5,"secPerLap":7.58,"shuttles":8},{"level":4,"kmh":10,"secPerLap":7.2,"shuttles":9},{"level":5,"kmh":10.5,"secPerLap":6.86,"shuttles":9},{"level":6,"kmh":11,"secPerLap":6.55,"shuttles":10},{"level":7,"kmh":11.5,"secPerLap":6.26,"shuttles":10},{"level":8,"kmh":12,"secPerLap":6,"shuttles":11},{"level":9,"kmh":12.5,"secPerLap":5.76,"shuttles":11},{"level":10,"kmh":13,"secPerLap":5.54,"shuttles":11},{"level":11,"kmh":13.5,"secPerLap":5.33,"shuttles":12},{"level":12,"kmh":14,"secPerLap":5.14,"shuttles":12},{"level":13,"kmh":14.5,"secPerLap":4.97,"shuttles":13},{"level":14,"kmh":15,"secPerLap":4.8,"shuttles":13},{"level":15,"kmh":15.5,"secPerLap":4.65,"shuttles":13},{"level":16,"kmh":16,"secPerLap":4.5,"shuttles":14},{"level":17,"kmh":16.5,"secPerLap":4.36,"shuttles":14},{"level":18,"kmh":17,"secPerLap":4.24,"shuttles":15},{"level":19,"kmh":17.5,"secPerLap":4.11,"shuttles":15},{"level":20,"kmh":18,"secPerLap":4,"shuttles":16},{"level":21,"kmh":18.5,"secPerLap":3.89,"shuttles":16}]}'::jsonb, 40),
('one-mile-run', '1 Mile Run', '🏃', 'Fitness', 'Beginner', 'U10', 15, 'Any', 'Players run one full mile at a self-selected sustainable pace, with the coach recording finish times to track fitness improvement across the season.',
   array['Course: 4 laps of a 400m track = 1 mile. On a full-size soccer field, 4 perimeter laps ≈ 1 mile.', 'Players: All players run together. Pair faster and slower runners for pacing support.', 'Timing: Stopwatch or phone timer; record each player''s finish time individually.'],
   array['Objective: Complete 1 mile (4 laps) as fast as possible at a sustainable pace.', 'Pacing: Coach calls out split times at each lap to help players self-regulate.', 'Finish: All players finish regardless of time — no one stops early. Coach records each time.', 'Tracking: Repeat at regular intervals (start, mid, end of season) and compare times — improvement is the goal.'],
   array['U10 standard: Run ¾ mile (3 laps) or set a 10-minute time limit — full mile is developmentally appropriate from U12 onward.', 'U12 standard: Full 1 mile as described.', 'U14+/Advanced: Set a time goal (e.g., sub-8 min for U14, sub-7:30 for U16) in addition to recording finish times.', 'Mixed groups: Send faster runners 30 seconds earlier so the field stays spread out.'],
   array['Pace Awareness: Most youth players go out too hard in the first 200m — coach should remind players to slow down early; a controlled first half produces a faster overall time.', 'Breathing Rhythm: Linking breathing to stride cadence (inhale 2 strides, exhale 2 strides) keeps effort at aerobic intensity without hyperventilating — teach before the run starts.', 'Progress Tracking: Record every finish time and share personal bests each test — competing against your own previous time is more motivating than comparing with teammates.'],
   array['Stopwatch', 'Score sheet', 'Cones (optional)'], null, null, 50),
('circular-pyramid-intervals', 'Circular Pyramid Intervals', '🔄', 'Fitness', 'Intermediate', 'U10', 20, '12–20 in pairs', 'Matched pairs start at evenly spaced cones around a large circle and run a pyramid interval sequence together — increasing the number of cone-lengths run each rep from 1 up to 5, then back down — with brief recovery pauses between each rep and a longer rest at the peak.',
   array['Circle: Place 6–10 cones evenly spaced around a large circle or indoor track perimeter (roughly 20–30 yd diameter).', 'Pairs: Match players by similar fitness/pace — one matched pair per cone station.', 'All pairs start simultaneously from their home cone facing the same direction around the loop.'],
   array['Rep 1: Each pair sprints 1 cone length → brief recovery pause (30–45 sec).', 'Reps 2–4: Increase by 1 cone length each rep with matching recovery pauses.', 'Peak Rep 5: Run 5 cone lengths → longer mid-ladder recovery (90 sec).', 'Descend: Run back down the ladder (4, 3, 2, 1 cone lengths) with matching recovery pauses.', 'All pairs move simultaneously; different start stations keep the circle clear of traffic.'],
   array['U10/Beginners: Use a 5-cone circle with a 1-3-1 pyramid (peak of 3 cone lengths). Longer recovery pauses.', 'U12 standard: Full 1-5-1 pyramid on a 6–8 cone circle as described.', 'U14+/Advanced: Run the pyramid twice with a 3-minute rest between pyramids, or compress recovery pauses to increase demand.', 'Large groups (16+): Use a 10-cone circle with two pairs per cone; stagger start times by 10 seconds.'],
   array['Partner Accountability: Matched pairs self-regulate pace together rather than chasing the fastest runner — improves consistency across all fitness levels.', 'Structured Recovery: Rest periods are not optional — call the rest time aloud and enforce it; shorter reps get shorter rests but longer reps need more recovery to maintain effort quality.', 'Traffic Flow: All pairs move in the same direction; remind players to return to their home cone after each rep so spacing stays consistent.'],
   array['Cones', 'Stopwatch'], null, null, 60),
('tag-and-release-relay', 'Tag-and-Release Relay', '⚡', 'Fitness', 'Intermediate', 'U10', 15, '10–18 in pairs', 'Pairs stationed at an odd-numbered cone circle sprint one cone length on a rolling "tag-and-release" trigger — as each arriving pair touches the destination cone, the waiting pair immediately explodes to the next cone — creating a continuous pursuit wave that runs for a set time block before a shared recovery rest.',
   array['Circle: Place an odd number of cones (5, 7, or 9) evenly spaced around a large circle or track loop.', 'Pairs: One matched pair stationed at each cone facing the same direction.', 'Cone count determines rest ratio: 5 cones ≈ 1:4 work-to-rest; 7 cones ≈ 1:6; 9 cones ≈ 1:8.'],
   array['1-Cone Relay: One pair sprints to the next cone; on arrival the waiting pair immediately explodes — wave rolls continuously.', 'Traffic Management: Arriving runners peel outside to recover; departing runners launch on the inside lane.', 'Duration: Run continuously for 4–5 minutes, then 2–3 minute active recovery. Repeat 2–3 sets.', '2-Cone Leapfrog (progression): Each pair runs 2 cone lengths — odd cone count rotates the load evenly through all stations.', '3–4 Cone Stages (advanced): Shifts energy system toward lactate tolerance and speed endurance.'],
   array['U10/Beginners: Use 5 cones, 1-cone relay only. Reduce sets to 2–3 minutes. Emphasize traffic lanes before starting.', 'U12 standard: 7 cones — 1-cone relay for set 1, 2-cone leapfrog for set 2.', 'U14+/Advanced: 9 cones, 2-cone leapfrog for sets 1–2, 3-cone stages for set 3. Compress rest to 90 sec between sets.', 'Large groups (16+): Run two separate relay circles simultaneously with the same start cue.'],
   array['Immediate Release: Waiting pair must explode on contact — a half-second delay breaks the wave and gives false rest; coach should call out slow releases immediately.', 'Odd Cone Count is Not Arbitrary: Prevents a permanent resting cone during 2-cone leapfrog — forces balanced load across all pairs.', 'Traffic Lane Discipline: Inside-lane launches and outside-lane finishes must be drilled from rep 1 — one collision early in training can stop the session.'],
   array['Cones', 'Stopwatch'], null, null, 70),
('parallel-corridor-footwork', 'Parallel Corridor Footwork', '↔️', 'Fitness', 'Intermediate', 'U8', 12, '8–14 in pairs', 'Two parallel cone corridors — pairs work through 5 progressive phases: mirror lateral shuffles, slalom weave, sole rollovers, creative dribbling, and a partner passing shuttle — building from pure movement into ball work and partner coordination.',
   array['Corridor: Set two parallel rows of 6–7 cones, spaced 5–10 yds apart across, with cones ~2 yds apart along each row.', 'Players: Split evenly into two lines — Line A at Row 1, Line B at Row 2, partners facing each other across the channel.', 'Balls: 1 ball per pair (phases 3–5); no ball needed for phases 1–2.'],
   array['Phase 1 — Mirror Lateral Shuffle: Both partners face each other and shuffle laterally cone-to-cone in sync, staying low with no crossover steps. 4 reps each.', 'Phase 2 — Forward Slalom Weave: Players slalom in and out of their own row of cones, emphasizing quick plant-and-push deceleration off the outside foot. 4 reps each.', 'Phase 3 — Linear Sole Rollovers: Each player has a ball and travels down the corridor using continuous sole rollovers (alternating feet), keeping hips square and ball within reach. 4 reps each.', 'Phase 4 — Creative Slalom Dribbling: Players dribble their own slalom using any technique (inside-outside cuts, sole rolls, La Croqueta), head up between touches, varying tempo through each cone. 4 reps each.', 'Phase 5 — Passing & Rollover Shuttle: With one ball per pair, Player A passes across to Player B at Cone 1. Player B executes a lateral rollover toward Cone 2 and plays back. The pair advances pass-by-pass down all 6–7 cones, then returns switching feet/direction.'],
   array['U8/Beginners: Run phases 1–3 only; skip phases 4–5 until movement patterns are comfortable. Keep the channel short (4 cones).', 'U10 standard: All 5 phases as described.', 'U14+/Advanced: In phase 5, require one-touch return passes — partner must play back immediately off the rollover without an extra settle touch.', 'Large groups (12+): Set up two corridors running simultaneously; rotate pairs between corridors between phases.'],
   array['Low Center of Gravity: All lateral movement phases require knees bent and weight on the balls of the feet — standing tall or heel-striking kills quickness and makes the shuffles sloppy.', 'Active Prep Touch: In phases 3 and 5, the rollover must be a purposeful, directional touch that sets the ball cleanly for the next action — players who stop the ball dead lose rhythm and slow the sequence.', 'Rhythm & Communication: Phase 5 only works if partners establish a passing rhythm and call each other — encourage them to find a cadence ("ready, yes, ready, yes") and maintain it down the full corridor.'],
   array['Cones', 'Balls'], 'tactics/Lateral Movement.webm', null, 80),
('shadow-dribbling', 'Shadow Dribbling', '👥', 'Warmup', 'Beginner', 'U8', 10, 'Pairs (up to 20 players)', 'In pairs, the leader dribbles freely within a grid while the follower mirrors their movements as closely as possible without touching; roles swap on the coach''s whistle.',
   array['Grid: 20×20 yd square marked with cones. Shrink to 15×15 for smaller groups or younger ages.', 'Players: Pairs spread across the grid — up to 10 pairs share a standard grid.'],
   array['The leader dribbles freely around the grid, making sudden changes of direction, speed, and angle.', 'The follower stays directly behind the leader, mirroring every movement as closely as possible without making contact.', 'If the follower loses the leader by more than 3 yards, the leader slows to a jog until the gap closes.', 'On the coach''s whistle, the leader stops, passes the ball to the follower, and roles reverse immediately.', 'Run 3–5 rounds of 60–90 seconds each.'],
   array['U8/Beginners: Leaders walk or jog only — no sprinting. Keep the grid large (20×20) and focus on gentle direction changes.', 'U10–U12: Standard format. Add a challenge: the pair that stays closest for a full 60-second round wins.', 'U14+/Advanced: Shrink the grid to 15×15 and allow full-speed running. Leaders may stop dead or execute a skill move (pull-back, scissor) at any time.', 'Large groups (12+): Give both partners a ball — leader and follower dribble simultaneously while maintaining their relative positions.'],
   array['Body Orientation: The follower should be reading the leader''s hips and shoulders — not the ball — to anticipate direction changes before they happen.', 'Close Control: Leaders should use all surfaces of the foot (inside, outside, sole) to keep the ball tight at high speed, making it harder to predict the next move.', 'Spatial Awareness: Both players must be aware of other pairs in the grid at all times — heads up is mandatory for safe play.'],
   array['Balls', 'Cones'], null, null, 90),
('1v1-basic', '1v1 Attacking Duel', '⚔️', 'Technical', '', 'U8', 15, 'Pairs (4–12 players)', 'Live 1v1 duels between two small goals: the attacker tries to beat the defender and score, the defender tries to win it and counter.',
   array['Two small goals (or cone gates) 15–20 yds apart', 'Channel about 10 yds wide marked with cones', 'Attackers line up at one goal with the balls, defenders at the other', 'Large groups: run several channels side by side'],
   array['The attacker starts with the ball and dribbles at the far goal.', 'The defender steps out to apply pressure on the attacker''s first touch.', 'The attacker scores by passing or dribbling the ball into the small goal.', 'If the defender wins the ball, they attack the other goal.', 'The duel ends on a goal, when the ball leaves the channel, or after about 10 seconds.', 'Switch roles after each duel.'],
   array['Easier: the defender starts further away or defends at half speed.', 'Easier: widen the channel.', 'Harder: the defender starts the duel by passing to the attacker, then closes down.', 'Harder: narrow the channel.', 'Harder: 6-second limit to score.'],
   array['Attacker: head up, read the defender''s body shape', 'Defender: stay on your feet, force to the weak side', 'Change of pace is key — slow then fast'],
   array['Balls', 'Cones', 'Small goals'], null, null, 100),
('pass-tap-pass-back', 'Pass, Tap, Pass Back', '👟', 'Technical', '', 'U8', 10, 'Pairs', 'Partner passing with a first touch across the body: receive on one side of a cone, drag the ball across it and play it back, at three distances.',
   array['Pairs with 1 ball, starting 5–8 yds apart', 'Three cones in a line between the partners, about 3 yds apart, pointing at the server', 'The working player stands just behind the front cone (the one nearest the server)'],
   array['The server passes to one side of the cone.', 'The working player receives on that side, drags the ball across the front of the cone and passes back with the other foot.', 'The server plays the next ball to the other side. Keep alternating.', 'Work for about a minute, then switch roles.', 'Remove the front cone. The working player drops back to the next cone, so the passes get longer.', 'Repeat until only one cone remains.'],
   array['Easier: stop the ball first, then drag it across.', 'Easier: start with the longest distance removed (two cones).', 'Harder: the server returns the ball one-touch.', 'Harder: drag with the sole only, or with the outside of the foot.', 'Harder: most clean reps in a minute wins.'],
   array['Sharp first touch across the cone — don''t let the ball run', 'Use both feet on the drag', 'Communicate — call "ready" when set to receive'],
   array['Balls', 'Cones'], 'Pass, tap, pass back, 3 distances.mp4', null, 110),
('cone-passing', 'Cone Passing', '🎯', 'Technical', '', 'U10', 15, '9–18 in 3 groups', 'Three color groups pass in a set color order across a field of cones, doing a skill before each pass and moving to an open cone after it.',
   array['Cones spread across half the field — more cones than players', 'Three groups in different colors (e.g. red, blue, yellow)', 'One ball for every 3 players', 'Every player starts at a cone'],
   array['Set the color rotation: red passes to blue, blue to yellow, yellow to red.', 'The player with the ball performs the set skill, then passes to a player of the next color.', 'After passing, the passer moves to an open cone.', 'Sets last 2–3 minutes with 1 minute of rest. Run 5 sets.', 'Change the skill and the type of pass each set.'],
   array['Easier: no skill before the pass — two touches only.', 'Easier: two colors instead of three.', 'Harder: one-touch passing.', 'Harder: the receiver must check away from their cone before the ball is played.', 'Harder: add more balls.'],
   array['Sharp skill before the pass — don''t rush the touch', 'Move immediately after passing', 'Awareness of color rotation'],
   array['Balls', 'Cones (many)', 'Pinnies (3 colors)'], 'cone passing.mp4', null, 120),
('movement-skill-reset', '10 Person Continuous', '🔄', 'Technical', '', 'U10', 15, 'About 10', 'Continuous check-receive-return work: run through the gate, call for the ball, play it back and reset, across a range of ground and aerial skills.',
   array['A cone gate 2–3 yds wide in the middle of a 20×20 yd area', 'Half the group spread around the outside, each with a ball', 'The other half work in the middle without a ball'],
   array['A working player runs through the gate and calls an outside teammate''s name to receive a pass.', 'The outside player serves the ball.', 'The working player plays it back while calling their own name.', 'They run through the gate again and find a different server.', 'Run each round for 1–2 minutes, then swap the groups.', 'Change the skill each round: two-touch, volleys, headers, chest trap, thigh trap, foot trap and turns.'],
   array['Easier: ground passes only, two-touch.', 'Easier: servers throw the ball underhand for aerial rounds.', 'Harder: one-touch returns.', 'Harder: receive, turn and play to a different outside player who has no ball.', 'Harder: count clean reps per round and beat your score.'],
   array['Eye contact before the pass — use their name', 'First touch must be out of your feet', 'Receive, play, reset — stay alert'],
   array['Balls', 'Cones'], 'MovementSkillResetFindTarget.mp4', null, 130),
('three-group-continuous', 'Three-Group Continuous', '🔄', 'Technical', 'Intermediate', 'U10', 15, '12–18 in 3 groups', 'Three groups rotate through a hub-and-rim circuit: central runners check out of a center hub toward outer cone stations, receive a served ball, execute the designated skill to play it across to their station partner, then reset to the hub and find the next open station.',
   array['Hub: Mark a center circle using cones or pinnies (~10 yd diameter).', 'Rim: Place 4–6 cones evenly spaced around the outside of the hub, each ~5–8 yds from the center.', 'Players: Three equal groups. Group 1 starts in the center hub without balls. Groups 2 & 3 pair up at the outer cone stations — one player 3 feet left of the cone, one 3 feet right.', 'Balls: One ball per station pair — the left-side player starts with the ball.'],
   array['Check & Call: A central player checks out of the hub toward a free station, makes eye contact, and calls for the ball.', 'Give-and-Go: The station player serves the ball to the central player, who executes the designated skill and plays it directly to the station partner.', 'Reset: The central player checks back through the hub, scans, and explodes to the next available station.', 'Rotation: Each 60-second round, the group in the hub is the working group. After the round, groups rotate — every group works the center once per skill set.', 'Progressions: Run each skill for one full rotation (3 × 60 sec) before advancing — ground (two-touch → one-touch), aerial (chest → thigh → header), striking (volley → half-volley → juggle-and-return), then Turn & Switch.'],
   array['U10/Introductory: Start with ground only (two-touch) and 4 outer cones; skip aerial progressions until the rotation pattern is learned.', 'U12 standard: Full ground + aerial progressions; introduce Turn & Switch at the end of the session.', 'U14+/Advanced: Add a competitive element — central players count clean reps in 60 sec; group with the most reps across all rotations wins.', 'Large groups (15+): Add a 4th or 5th outer station; keep the same rotation structure.'],
   array['Vocal & Physical Check: Central players must check at game speed with arms up and call the server''s name before the pass is made — silent or slow checks do not replicate game conditions.', 'Open Body Shape: Arrive at the station with hips angled to see the server, the partner, and the center field simultaneously — arriving square limits vision and slows distribution.', 'Scanning in the Hub: Players must lift their heads before they arrive in the center, not after — early scanning allows them to accelerate directly toward the next free station rather than stopping to look.'],
   array['Balls', 'Cones', 'Pinnies'], '10 Person Continuous - 3 way.webm', null, 140),
('gates-competition-passing', 'Gates Competition Passing', '🚪', 'Passing', '', 'U10', 12, 'Pairs', 'Pairs race the clock, passing to each other through as many cone gates as they can in a minute.',
   array['Many gates (two cones 2 yds apart) scattered across a 30×30 yd area — more gates than pairs', 'Evenly matched pairs, 1 ball per pair'],
   array['On the whistle, each pair passes to each other through as many gates as possible in 1 minute.', 'A pass through a gate to the partner on the other side scores 1 point. Not the same gate twice in a row.', 'Pairs keep a combined score.', 'Rest for 1 minute, then challenge another pair.', 'The lower-scoring pair completes a brief exercise.'],
   array['Easier: wider gates.', 'Easier: fewer pairs in the area.', 'Harder: one-touch passes through the gate.', 'Harder: weaker foot only.', 'Harder: narrower gates, or a different colored gate worth 2 points.'],
   array['Communicate — pick the gate together before moving', 'Sharp, firm passes — let the ball do the work', 'Head up to spot the next available gate'],
   array['Balls', 'Cones (many)'], 'Gates competition passing.mp4', null, 150),
('long-passes-4', 'Long Passes (4 People)', '↔️', 'Passing', '', 'U12', 15, 'Groups of 4', 'Long-range passing in fours: trap, lay off to the teammate beside you, and they drive it across — then lofted passes, chips and give-and-gos.',
   array['Groups of 4 with 1 ball', 'Two players on each side, facing each other 25–40 yds apart', 'Partners on the same side stand about 5 yds apart'],
   array['A player receives the long ball and traps it.', 'They lay it off to the teammate beside them, who drives the ball across to the other pair.', 'The other pair does the same: trap, lay off, drive.', 'Next, switch to lofted passes or chips.', 'Finally, add a give-and-go with your partner before the long pass.', 'Swap who traps and who strikes so everyone hits long balls.'],
   array['Easier: shorten the distance to 20 yds.', 'Easier: allow an extra touch before the layoff.', 'Harder: weaker foot only.', 'Harder: control the long ball in two touches or fewer.', 'Harder: one-touch layoff.'],
   array['Open body to receive — don''t receive across yourself', 'Lofted passes: follow through high, lean back', 'Communication: call before the pass arrives'],
   array['Balls', 'Cones'], 'long passes 4 people.mp4', null, 160),
('get-open', 'Get Open', '🏃', 'Passing', '', 'U10', 12, 'Groups of 3', 'Two players move side to side to get open and complete a pass through the middle, past a defender.',
   array['Two players 10–15 yds apart, each moving along their own line', 'One defender in the middle', '1 ball per group', 'Optional: a cone in the middle to create a designated passing lane'],
   array['The two outside players run back and forth along their lines, trying to get open.', 'The defender in the middle moves to block the pass.', 'The passer plays the ball through the middle when the lane opens.', 'If the defender wins the ball, they swap with the player who lost it.', 'Rotate the defender every 60–90 seconds if they haven''t won it.'],
   array['Easier: the defender can only walk.', 'Easier: place the cone in the middle so the defender can only block one lane at a time.', 'Harder: two-touch maximum.', 'Harder: shorten the lines so there is less room to get open.', 'Harder: count completed passes — first pair to 10 wins.'],
   array['Change direction with purpose — don''t just run sideways', 'Use a shoulder drop or change of pace to create separation', 'Passer: wait for the right moment — don''t force the pass'],
   array['Balls', 'Cones'], 'get open.mp4', null, 170),
('gates-competition-dribbling', 'Gates Competition Dribbling', '🚪', 'Dribbling', '', 'U10', 12, 'Pairs', 'One-minute dribbling race: dribble through as many cone gates as possible while your partner counts.',
   array['Many gates (two cones 2 yds apart) scattered across a 30×30 yd area — more gates than dribblers', 'Evenly matched pairs, 1 ball per pair'],
   array['One player dribbles through as many gates as possible in 1 minute while their partner counts.', 'Not the same gate twice in a row.', 'Rest for 1 minute, then switch.', 'The player with the lower total completes a brief exercise.', 'Also works as a team competition: add up each team''s scores.'],
   array['Easier: wider gates.', 'Easier: half the group at a time so there is less traffic.', 'Harder: weaker foot only.', 'Harder: perform a move (scissors or step-over) before each gate.', 'Harder: narrower gates.'],
   array['Head up — scan for the next gate before finishing the current one', 'Keep the ball tight — don''t overrun gates', 'Accelerate through the gate, don''t slow before it'],
   array['Balls', 'Cones (many)'], 'Gates competition dribbling.mp4', null, 180),
('target-dribbling', 'Target Dribbling', '🎯', 'Dribbling', 'Intermediate', 'U10', 12, '6–8 per grid', 'Players dribble freely inside a grid, scoring points by rolling the ball over flat pinnies — a high-value yellow penny in the center (3 pts) representing direct penetration, and lower-value red pennies on the perimeter (1 pt) representing wide outlets — while defenders try to intercept or force them wide.',
   array['Grid: 20×20 yd square marked with cones (adjust size based on player count).', 'Center target: Place 1 yellow pinnie flat in the center of the grid (3 points).', 'Perimeter targets: Place 4–6 red pinnies flat around the edges and corners of the grid (1 point each).', 'Players: Teams of 3–4 v 3–4 (or individual free-for-all for younger groups). Each player has their own ball.'],
   array['Objective: Dribble your ball directly over a target pinnie to score — the ball must roll cleanly over the flat pinnie, not past it.', 'Scoring: Yellow center penny = 3 points. Red perimeter penny = 1 point.', 'No-Repeat Rule: A player cannot score on the same penny back-to-back — after hitting the center yellow, they must score on a red perimeter penny before attacking the middle again.', 'Conquer & Flip (optional): When a player scores, their team flips the penny over (claims it). First team to claim the center plus a set number of wide targets wins the round.', 'Game Length: Play 60–90 second rounds with 30 sec rest; run 3–5 rounds, then swap defenders.'],
   array['U10/Beginners: Remove defenders — run as a solo time-trial where each player scores as many points as possible in 60 seconds. Focus on tight dribbling and scanning.', 'U12 standard: Full game with defenders as described — no-repeat rule active.', 'U14+/Advanced: Add a rule that the center yellow can only be scored off a directional change (must enter from a wide angle after touching a red penny — simulating a cut inside).', 'Large groups (12+): Split into two grids running simultaneously; winners from each grid compete in a final round.'],
   array['Directness & Forward Mentality: The 3-point center target rewards players who are bold enough to drive straight at the central corridor when a lane opens — hesitation hands the advantage to the defense.', 'Scanning & Decision-Making: When defenders pack the middle, the correct read is to escape wide — players who keep their heads up and recognize the overload early will consistently score more points than those who force.', 'Close Ball Control: Rolling the ball precisely over a flat pinnie demands tight, controlled touches; players quickly learn that overrunning the ball or using big touches causes them to miss the target and lose possession.'],
   array['Balls', 'Cones', 'Pinnies (yellow and red)'], 'Target Dribbling.webm', null, 190),
('bumper-keepaway', 'Bumper Keepaway', '🔵', 'Possession', '', 'U10', 15, '9–13', 'Keep-away with four gates and a neutral sideline bumper: score by passing or dribbling through a gate.',
   array['Grid about 30×25 yds', 'Four gates (two cones 2 yds apart) spread around the inside of the grid', 'Two equal teams (4v4 to 6v6) in pinnies', 'One neutral bumper player on the sideline'],
   array['The two teams play keep-away inside the grid.', 'Score a point by passing through a gate to a teammate, or by dribbling through one.', 'The bumper works along the sideline and plays for whichever team has the ball.', 'After a point, the same team keeps the ball and attacks a different gate.', 'Keep score. Rotate the bumper every few minutes.'],
   array['Easier: add a second bumper on the opposite sideline.', 'Easier: wider gates.', 'Harder: two-touch maximum.', 'Harder: the bumper has one touch.', 'Harder: only passes through a gate count — no dribbling.'],
   array['Move after your pass — don''t stand still', 'Use the bumper — they''re always available', 'Defenders: press as a unit, don''t ball-watch'],
   array['Balls', 'Cones', 'Pinnies'], 'bumper Keepaway.mp4', null, 200),
('across-the-river', 'Across the River', '🌊', 'Possession', '', 'U12', 15, '10–14', 'Two-grid keep-away: the bigger team keeps the ball while a pressing pair tries to win it and get it across to their teammates in the other grid.',
   array['Two grids of about 15×15 yds side by side', 'Two teams, one in each grid', 'The team without the ball sends 2 players into the other grid to defend (e.g. 5 vs. 2)', 'Spare balls with the coach'],
   array['The larger team plays keep-away in their grid against the pressing pair.', 'The pair tries to win the ball and pass it to their teammates in the opposite grid.', 'When the ball gets across, that team plays keep-away and the other team sends 2 defenders over.', 'If the larger team wins the ball straight back, they carry on.', 'If the pressing pair is struggling, they can call for reinforcements.'],
   array['Easier: bigger grids.', 'Easier: the pressing pair gets a third defender after 6 passes.', 'Harder: two-touch maximum for the team in possession.', 'Harder: smaller grids.', 'Harder: leave a gap between the grids so the transition pass has to travel — see Rock the River.'],
   array['Play away from pressure — see the switch before it''s needed', 'Quick first touch to beat the press', 'Defenders: cut passing lanes, don''t chase blindly'],
   array['Balls', 'Cones', 'Pinnies'], 'across the river.mp4', null, 210),
('3-team-keepaway', '3 Team Keep Away', '🔄', 'Possession', '', 'U10', 15, '12–15 in 3 teams', 'Keep-away with a neutral third team: score by completing a pass to a teammate through one of four gates.',
   array['Grid about 35×30 yds', 'Four cone gates spread around the grid', 'Three teams in different colors — two equal teams and a smaller neutral team (e.g. with 13 players: 5 blue, 5 yellow, 3 red)'],
   array['Blue and yellow play keep-away.', 'Red plays for whichever team has possession.', 'A team scores by completing a pass to a teammate through a gate.', 'After a point, play continues — attack a different gate next.', 'First to 5 wins. Then change the neutral team.'],
   array['Easier: wider gates.', 'Easier: neutral players can''t be tackled.', 'Harder: neutral players have two touches.', 'Harder: two-touch for everyone.', 'Harder: a point only counts if a neutral player was part of the move.'],
   array['Neutral team: read the game — which side needs you?', 'Scoring team: find the gates, create overloads', 'Communicate constantly — talk your team into position'],
   array['Balls', 'Cones', 'Pinnies (3 colors)'], '3 Team Keep Away.mp4', null, 220),
('peripheral-possession', 'Peripheral Possession with Forbidden Returns', '🔵', 'Possession', 'Advanced', 'U12', 20, '11–15', 'Perimeter players maintain possession around the outside of a rectangle against 3 central defenders, with two key restrictions: no passing to an adjacent teammate on the same touchline, and no returning the ball to the player who just served you.',
   array['Grid: 20×25 to 25×30 yard rectangle.', 'Players: 3 evenly spaced cones per touchline; up to 12 perimeter players (scale to 8 for smaller groups). 3 defenders inside.', 'Perimeter players stand one step outside the boundary and cannot enter the grid.'],
   array['Objective: Keep possession around the outside against 3 interior defenders.', 'No Same-Line Passes: Cannot pass to the immediate neighbor on the same touchline — ball must travel to another side.', 'No Bounce Back: Cannot return the ball to the teammate who just served you.', 'Defender Freedom: Defenders can break outside the grid to tackle on a heavy touch.', 'Swap Rule: Player who makes an error swaps into the grid as a defender.'],
   array['U12/Entry: Enforce only the no-same-line-pass rule initially — add no-bounce-back once scanning is consistent.', 'U14–U16/Standard: Full rules as described.', 'Advanced/Progression: Add a third restriction — receiving players must open hips to the far side before playing.', 'Small Groups (8 players): Use a 15×20 yard grid with 2 cones and 1 player per bay.'],
   array['Pre-Orientation & Scanning: Eyes must find cross-grid options before the ball arrives — no easy neighbor or return pass available.', 'Positive First Touch: Directional touch across the body opens a clean passing lane and keeps defenders from lunging over the boundary.', 'Defensive Triggers: Defenders learn to read body posture and press aggressively when a perimeter player takes a trapped touch near the boundary.'],
   array['Balls', 'Cones', 'Pinnies'], 'tactics/Peripheral Possession with Forbidden Returns.webm', null, 230),
('pierce-the-circle', 'Pierce the Circle', '🎯', 'Possession', '', 'U12', 15, '8–14', 'A possession-and-vision game where both teams operate outside a central circle and score by completing a ground pass directly through it to a teammate on the opposite side.',
   array['Grid: Use the regulation center circle, or mark a circle with cones (10–18 yds diameter). Smaller circles increase technical difficulty.', 'Players: Two equal teams — 4v4 up to 7v7.'],
   array['Perimeter Possession: Both teams operate entirely outside the circle in a continuous keep-away game.', 'Scoring: A team scores 1 point by completing a ground pass directly through the circle to a teammate on the opposite side.', 'Restricted Zone: The central circle is a no-entry dead zone. Stepping inside = immediate turnover. Ball stops inside = possession to opposing team.', 'Game Length: Play to 5 points, or run timed intervals of 3–5 minutes per round.'],
   array['Easier: use a bigger circle and allow 3 touches so players have time to find the lane.', 'Easier: add a neutral player who always plays for the team in possession.', 'Harder: two-touch maximum.', 'Harder: the pass through the circle must be played one-touch.', 'Harder: a point only counts if the receiver completes the next pass.'],
   array['Draw to Exploit: Bait defenders toward one flank with short passes before firing a line-breaking ball through the vacated central channel.', 'Off-Ball Movement: Players on the weak side must constantly adjust their angles to provide open passing lanes through the circle.', 'Pass Weight & Accuracy: Passes through the middle need firm pace to ensure they do not stall inside the dead zone.'],
   array['Balls', 'Cones', 'Pinnies (2 colors)'], 'tactics/Pierce the Circle.webm', null, 240),
('block-or-one-time', 'Block or One Time', '🥅', 'Shooting', '', 'U12', 15, '9–15 in 3 teams', 'Three-team finishing game: strikers try to score first time while the blocking team sprints off the post to get in the way.',
   array['One full-size goal', 'Three teams in different colors', 'One team (the blockers) starts at a goal post', 'The other two teams start at the top of the 18-yd box', 'Coach beside the box with the balls'],
   array['The coach plays a ball in to a striking team.', 'The strikers attempt to score — first time if they can.', 'The post team comes out to block.', 'If the strikers score, the defenders touch the post again before the next ball.', 'If the defense wins the ball, they become the strikers and the team that lost it goes to the post.'],
   array['Easier: strikers get two touches before the blockers leave the post.', 'Easier: start the strikers closer to goal.', 'Harder: one-touch finishes only.', 'Harder: add a goalkeeper.', 'Harder: 5 seconds to shoot once the ball is played in.'],
   array['Strikers: shoot early — don''t wait for the perfect moment', 'Defenders: get in the shooting lane, be brave', 'Call "mine!" when taking the block'],
   array['Balls', 'Pinnies', 'Full-size goal'], 'block or one time.mp4', null, 250),
('closing-fast-shot-fast', 'Closing Fast, Shot Fast', '🏹', 'Shooting', '', 'U12', 15, '8–12 plus 2 goalkeepers', 'Small-sided game in a tight space between two goals: everyone is always in range, so attackers shoot early and defenders close fast.',
   array['Two goals 20–25 yds apart, each with a goalkeeper', 'Area about 30 yds wide marked with cones', 'Two teams of 3 or 4, extra players rotate in', 'Spare balls in each goal'],
   array['Play a normal game in the tight area.', 'The team with the ball shoots quickly and often.', 'Defenders must close quickly to prevent shots.', 'After a goal or a ball out of play, the goalkeeper restarts straight away.', 'Play 2–3 minute games, then rotate teams.'],
   array['Easier: play 3v2 so the attackers have an extra player.', 'Easier: widen the area.', 'Harder: two-touch maximum.', 'Harder: one-touch finishes count double.', 'Harder: bring the goals closer together.'],
   array['Attackers: shoot the moment you''re in range — no extra touch', 'Defenders: close angle together, not solo', 'GK: set your feet before each shot — stay alert'],
   array['Balls', 'Cones', 'Pinnies', '2 goals'], 'closingFastShotFast.mp4', null, 260),
('4-point-shooting', '4 Point Shooting', '⚽', 'Shooting', '', 'U14', 20, '8–16 plus a goalkeeper', 'Four-line finishing circuit with a different finish at each line — turn and shoot, one-touch, move then shoot, and a cross — with every shooter staying in for rebounds.',
   array['Full-size goal with a goalkeeper', 'Four lines marked with cones, left to right, 18–25 yds from goal', 'Line 4 starts wide enough to cross', 'Coach near the top of the box with balls'],
   array['Line 1: receive a pass, turn and shoot.', 'Line 2: one-touch finish from the coach.', 'Line 3: move, then shoot.', 'Line 4: cross for a finish.', 'After each line shoots, they remain in play for rebounds.', 'Lines rotate left to right. Keep good tempo throughout.'],
   array['Easier: move the lines closer to goal.', 'Easier: no goalkeeper for the first round.', 'Harder: weaker foot only.', 'Harder: two-touch maximum at every line.', 'Harder: add a passive defender at Line 1.'],
   array['Anticipate the rebound — get in position before the shot', 'Attack the ball on the cross, don''t wait for it', 'Keep tempo high — reset quickly after each rep'],
   array['Balls', 'Cones', 'Full-size goal'], '4 point shooting.mp4', null, 270),
('receive-turn-finish', 'Receive, Turn & Finish', '🥅', 'Shooting', 'Intermediate', 'U12', 15, '6–12', 'Two lines sprint toward timing cones where the coach serves a ground pass; each player takes one directional touch to open toward their respective goal and finishes with a quick strike. Players rotate to the opposite line to train both feet.',
   array['Goals: Two goals set side-by-side or angled outward on the end line (full-size, intermediate, or pug goals — with or without keepers).', 'Players: Two lines at a starting cone near midfield or top of the center circle.', 'Timing cones: A second cone ~10–15 yards ahead of each line, roughly 20–25 yards from the respective goal.', 'Server: Coach positioned near the goals with a supply of balls, serving ground passes to each line in alternation.'],
   array['The Run: A player from one line sprints forward toward their timing cone.', 'The Delivery: The coach serves a firm ground pass timed to arrive as the player breaks past the timing cone.', 'The Touch & Turn: Left-line players open hips toward the left goal with a back-foot touch for a left-footed finish; right-line players do the same toward the right goal.', 'The Finish: Strike on target within 1–2 touches of receiving.', 'Rotation: Players rotate to the back of the opposite line so every player gets reps finishing with both feet.'],
   array['U12/Introductory: Reduce pace of the serve; allow players to take an extra touch before shooting.', 'U14 standard: Full-speed serve + directional touch as described; hold players to 2 touches maximum.', 'U16+/Advanced: Add a passive goalkeeper to each goal; require a placed finish (pick a corner before the touch).', 'Large groups (12+): Run both lines simultaneously — left and right players go at the same time to keep rep rate high.'],
   array['Weight of the Touch: A positive, forward-angled first touch sets up the shot — a dead stop kills momentum and allows the keeper to set.', 'Timing the Run: Players who arrive at the timing cone too fast are off-balance on the receive; a slight deceleration before the cone keeps hips and shoulders through the ball.', 'Hips & Plant Foot: The plant foot must point at the target corner — a misaligned plant sends the shot across the body and wide.'],
   array['Balls', 'Cones', '2 goals (full-size or pug)'], 'Charge Touch Shoot.mp4', null, 280),
('3v2-transition', '3v2 Transition', '⚡', 'Tactical', '', 'U12', 20, '10–14', 'Three-grid transition game: win the ball in a 3v2, break through the transition zone and connect with teammates in the far grid.',
   array['Three grids in a row', 'First grid: 3 attackers vs. 2 defenders', 'Second grid: the transition zone', 'Third grid: a 2v2', 'One team holds pinnies', 'Extra players wait beside the first grid'],
   array['Play 3v2 in the first grid.', 'When a defender wins the ball, they drop their pinnie and drive into the transition zone.', 'From there they pass to their teammates in the third grid.', 'A waiting player picks up the dropped pinnie to form the next 2v2.', 'Restart with a new ball in the first grid and keep it flowing.'],
   array['Easier: make the first grid bigger.', 'Easier: no pressure in the transition zone.', 'Harder: one attacker from the 3v2 can chase into the transition zone.', 'Harder: 5 seconds to play out of the transition zone.', 'Harder: two-touch in the first grid.'],
   array['When you win it, go immediately — no pause', 'Third man: check shoulder and be available in next grid', 'Defenders: deny the transition pass first, then recover'],
   array['Balls', 'Cones', 'Pinnies'], '3v2 Transition.mp4', null, 290),
('rock-the-river', 'Rock the River', '🌊', 'Tactical', 'Advanced', 'U12', 20, '10–12', 'Two teams each occupy a possession grid separated by a river of scattered balls ("rocks"); the team without the ball sends 2 defenders across to press, the possession team plays keep-away, and when defenders win it they must chip it over the river to teammates — forcing aerial technique on every transition.',
   array['Grids: Two equal boxes (15×15 to 20×20 yds), placed side by side with a 5–10 yd river channel running between them.', 'River: Scatter 8–12 spare balls across the river channel floor as "rocks."', 'Players: Two equal teams of 5–6 players — each team starts in their home grid.'],
   array['Possession: Coach serves the match ball into Team A''s grid. Team A plays keep-away; Team B sends 2 defenders across the river to press.', 'Reinforcement: If the pressing pair cannot win the ball within a set time (e.g. 8 passes by Team A), they may call for a 3rd defender to cross the river.', 'Transition: When defenders win the ball, they must chip or lift it across the river to their teammates — ground passes deflect off the rocks.', 'Role flip: Once Team B receives in their grid, they play keep-away and Team A sends 2 defenders across.', 'Out-of-bounds scramble: If the ball exits, the river goes live — any player may sprint in to claim a rock. The team that grabs one becomes the possession team; coach adjudicates ties.'],
   array['U12/Introductory: Narrow the river to 3–4 yds and use fewer rocks; allow a low-driven pass that rolls to the side of the rocks rather than requiring a true chip.', 'U14 standard: Full game as described — 5–10 yd river, 8–12 rocks, reinforcement rule active.', 'U16+/Advanced: Restrict the transition chip to one touch — receivers must redirect on first contact rather than controlling and then passing.', 'Large groups (14+): Split into two simultaneous games with separate rivers; rotate teams every 5 minutes.'],
   array['Aerial Technique: The river forces chips and driven air balls — focus on a clean instep contact, leaning back slightly, with a relaxed follow-through to control trajectory and distance.', 'Pressing Pair Organization: Two defenders must work as a unit — trap toward a corner, cut the pass back, and resist both chasing the ball blindly; call for the 3rd only when the ball is truly pinned.', 'First Touch Out of the Air: Receivers must read the flight early, position their body before contact, and cushion the ball into open space on the first touch to absorb immediate pressure.'],
   array['Balls (many)', 'Cones', 'Pinnies'], 'tactics/Rock the River.webm', null, 300),
('lateral-shadow', 'Lateral Shadow', '⚡', 'Tactical', 'Advanced', 'U12', 15, '6–12 plus a goalkeeper', 'The defender plays a ground pass to the attacker ~30 yards out, then sprints to close — decelerating into a side-on jockey stance 2 yards away; the defender shadows laterally to steer the attacker wide and waits for a heavy touch or hesitation before executing a block or poke tackle, with a goalkeeper behind to save any forced shots.',
   array['Field: 18-yard box area with a standard goal and goalkeeper.', 'Defender line: Positioned centrally or slightly staggered, 3–5 yards beyond the top of the 18, each player holding a ball.', 'Attacker line: Stationed at a cone ~10–12 yards further upfield (roughly 30–35 yards from goal), facing the defender.'],
   array['Service: The defender plays a firm ground pass to the feet of the attacker and immediately sprints to close.', 'Breakdown: Around 2–3 yards from the attacker, the defender drops their hips, chops strides, and assumes a side-on jockey stance.', 'Shadow & Steer: The defender shadows the attacker laterally — matching their rhythm and body feints — while opening their body to offer the outside/weak-foot lane and blocking the central route to goal.', 'Pounce: The defender waits for a heavy touch, hesitation, or head-down dribble before attempting a block or poke tackle. If the attacker shoots from a poor angle under pressure, the defender has done their job.', 'Rotation: Attacker retrieves their ball and joins the defender line; defender rotates to the attacker line.'],
   array['U12/Introductory: Remove the goalkeeper initially; defenders focus only on approach and jockey stance without worrying about the live shot. Add GK once technique is sound.', 'U14 standard: Full drill as described — live 1v1 with goalkeeper.', 'U16+/Advanced: Start the attacker facing away from goal (back-to-goal receive) so the defender must react to the turn — adding a recovery run element.', 'Large groups (12+): Run two parallel lines simultaneously; coach calls "go" to both pairs at once to increase rep rate.'],
   array['Fast Approach, Slow Arrival: Sprint while the ball is traveling to close distance quickly, but decelerate sharply 2 yards from the attacker — a flat-out arrival means the attacker can knock it past and run.', 'Surfer Stance: Hips angled ~45 degrees, knees bent, weight on the balls of the feet — this allows instant lateral push-off in either direction. Never stand chest-square or flat-footed.', 'Patience Over Heroics: The defender''s job is not to win the ball in the first two seconds — it is to deny a quality shot. A hurried, wide-angle attempt with the keeper set is a defensive win.'],
   array['Balls', 'Cones', 'Pinnies', 'Full-size goal'], 'Lateral Shadow.webm', null, 310),
('king-of-the-end-zones', 'King of the End Zones', '👑', 'Tactical', 'Advanced', 'U12', 20, '12–16 in 4 teams', 'Four equal teams compete with a central grid and end zones at each end — two teams battle in the middle while one waits in each end zone; the team that plays a penetrating pass into their target end zone immediately swaps with the waiting team there, creating a relentless cycle of transition.',
   array['Grid: Central playing area ~25×20 yds with an end zone (5–8 yds deep) at each end.', 'Players: 4 equal teams of 3–4 players in distinct colored pinnies (Red, Blue, Yellow, Green).', 'Starting positions: Two teams in the central grid (e.g. Red vs. Blue); one team in each end zone (Yellow north, Green south).'],
   array['Objective: The two teams in the middle each attack the opposite end zone — Red attacks south, Blue attacks north.', 'Scoring / Swap: A team scores by completing a controlled pass into their target end zone. The scoring team enters that end zone; the waiting team sprints into the grid and attacks in the opposite direction.', 'Turnover Rule: If possession is lost, the defending team takes over immediately. Coach can feed a fresh ball to the team that wins possession.', 'Out of Bounds: Opposing team restarts with a kick-in, or coach feeds a fresh ball to maintain tempo.', 'Game Length: Play continuously for 10–15 minutes, or first team to 5 swaps wins.'],
   array['U12/Introductory: Reduce to 3v3 in the middle with a 2-touch rule to slow the game and help players recognize passing lanes.', 'U14 standard: 4v4 in the middle, no touch restrictions, full-speed swaps as described.', 'U16+/Advanced: Allow the end-zone team one "target player" who can receive in the zone and play back out — adding a wall-pass / lay-off scoring option.', 'Large groups (20+): Run two grids simultaneously; top team from each grid meets in a challenge round.'],
   array['Vertical Penetration: The end zones reward teams that look forward first — players must scan and play the vertical pass as soon as it opens rather than recycling sideways.', 'Instant Transition: The moment a swap happens, the incoming team must shift from passive waiting to full-speed attack in the opposite direction — that disorganization window is where possession is lost.', 'Defensive Pressure: Press immediately after a swap — the new attacking team is temporarily disorganized, and that is the window to win the ball back.'],
   array['Balls', 'Cones', 'Pinnies (4 colors)'], 'King of the End Zones.mp4', null, 320),
('around-the-horn', 'Around the Horn', '↔️', 'Tactical', 'Advanced', 'U12', 20, '14–22 including 2 goalkeepers', 'Two teams defend side-by-side goals on the end line, separated by a cone spine the ball cannot cross — possession must loop around the far tip of the cones to switch flanks and attack, while players can cross the spine freely for blind-side runs and crosses.',
   array['Goals: Two full-size or intermediate goals side-by-side on the end line, each with a goalkeeper.', 'Spine: A line of cones runs from between the goals straight down the center of the pitch to midfield or three-quarter field.', 'Players: Two equal teams (7v7 to 11v11) — each team defends one goal.'],
   array['The Ball Rule: The ball may NOT cross or pass through the cone spine — teams must circulate around the far tip of the cones to switch flanks.', 'The Player Rule: Attacking and defending players CAN cross the spine freely at any time — use this for blind-side overlaps, crosses, and defensive recovery.', 'Scoring: A team scores by finishing past the opposing goalkeeper in their assigned goal.', 'Turnovers: If the ball crosses the spine, possession transfers immediately to the opposing team at the point of infringement.', 'Game Length: Play in 8–10 minute periods, or first to 5 goals.'],
   array['U12/Introductory: Shorten the cone spine to just past the 18-yard box to reduce circulation distance. Add a 3-touch rule to slow tempo.', 'U14–U16 standard: Full spine to midfield as described. No touch restrictions.', 'Advanced/U16+: Add a second ball — coach feeds a fresh ball to either goalkeeper while a goal is being contested, creating continuous two-goal attack pressure.', 'Small groups (6v6 or fewer): Use smaller intermediate goals and shorten the spine to two-thirds field.'],
   array['Width Before Penetration: The spine forces the ball wide, teaching players to build in the channels and create crossing opportunities before attempting to score.', 'Blind-Side Timing: Because the ball must travel the long route, central runners have time to check defenders, cross the spine, and arrive in the box from an unexpected angle — cross late, arrive fast.', 'Defensive Shape: Defenders must actively shift from one side of the spine to the other as the attack changes flanks — static defenders will be pulled apart by the wide circulation.'],
   array['Balls', 'Cones', 'Pinnies (2 colors)', '2 full-size goals'], 'The Spine.mp4', null, 330),
('small-sided-4v4', '4v4 Small-Sided Game', '🏟️', 'Scrimmage', '', 'U8', 20, '8–12', 'Free-play 4v4 on a small field with small goals — a closer that lets players apply what was trained in the session.',
   array['30×20 yd grid marked with cones', 'A small goal at each end', 'Two teams of 4 in pinnies, subs waiting at the side', 'Spare balls beside each goal'],
   array['Play 4v4 with no goalkeepers.', 'Free play — minimal coaching intervention.', 'When the ball goes out, restart quickly with a pass or dribble in.', 'Rotate subs every 2–3 minutes.'],
   array['Easier: bigger grid.', 'Easier: play 3v3 for more touches.', 'Harder: two-touch maximum.', 'Harder: a goal only counts when the whole team is over halfway.', 'Harder: goals that use the session theme count double.'],
   array['Apply the session theme — see it happen in a real game', 'Communicate — call names, call for the ball', 'Transition immediately when possession changes'],
   array['Balls', 'Cones', 'Pinnies', 'Small goals'], null, null, 340),
('overload-scrimmage', 'Overload Scrimmage', '🔢', 'Scrimmage', '', 'U10', 20, '8–10', 'Uneven-numbers scrimmage: the bigger team keeps the ball and finishes, the short-handed team presses and scores on transition.',
   array['Medium grid (about 40×30 yds) with a small goal at each end', '6v4 (or 5v3) in pinnies', 'Spare balls with the coach'],
   array['The larger team maintains possession and looks to finish.', 'The short-handed team presses to win the ball and score on transition.', 'Restart with the larger team after a goal or a ball out.', 'Swap the advantage every 3–4 minutes so both groups experience both roles.'],
   array['Easier: make the overload bigger (6v3).', 'Easier: bigger grid.', 'Harder: the larger team has two touches.', 'Harder: the larger team must complete 5 passes before scoring.', 'Harder: goals by the short-handed team count double.'],
   array['Bigger team: switch the point of attack to exploit the overload', 'Smaller team: press as a unit — create turnovers with numbers', 'Transition: go the moment possession changes'],
   array['Balls', 'Cones', 'Pinnies', 'Small goals'], null, null, 350),
('attack-vs-defense', 'Attack vs. Defense', '⚔️', 'Games', '', 'U10', 20, '12–16 plus a goalkeeper', 'Phase of play in the attacking third: the attack must combine and finish within 8 seconds of entry, the defense wins it and plays out to targets.',
   array['Attacking third of the field with a full-size goal and goalkeeper', 'Attackers set up in your team shape (e.g. the front third of a 4-3-3)', 'Defenders hold a back line', 'Two target cone gates on the sidelines near midfield', 'Coach at midfield with balls'],
   array['The coach plays a ball in to the attackers.', 'The attack must combine and finish within 8 seconds of entry.', 'If the defenders win the ball, they play to the target cones on the sideline.', 'Reset and play the next ball.', 'Rotate lines every 4 minutes.'],
   array['Easier: give the attack 12 seconds.', 'Easier: take one defender out.', 'Harder: add a recovering midfielder for the defense.', 'Harder: the attack has a touch limit.', 'Harder: the coach varies the entry — central, wide, or over the top.'],
   array['Attackers: combination play first — don''t shoot early into the block', 'Defenders: hold the line, communicate, step together on the trigger', 'GK: organize the shape constantly — be the eyes behind'],
   array['Balls', 'Cones', 'Pinnies', 'Full-size goal'], null, null, 360),
('scrimmage-7v7', '7v7 Scrimmage', '🟢', 'Scrimmage', '', 'U10', 25, '14 plus subs', '7v7 on a medium field, where positional shape begins to emerge without the full-field complexity.',
   array['Medium field, about 55×40 yds', 'A medium goal at each end', 'Each side: one goalkeeper, two defenders, two midfielders, two forwards'],
   array['Play 7v7 with standard restart rules.', 'Let the game run — coach the shape between periods, not during.', 'Rotate the goalkeeper each period.'],
   array['Easier: play without offside.', 'Easier: restart every ball from the goalkeeper so teams can build from the back.', 'Harder: two- or three-touch maximum.', 'Harder: a goal only counts if every outfield player is over halfway.', 'Harder: goals that use the session theme count double.'],
   array['Hold your position — resist the urge to all chase the ball', 'GK: claim your box and communicate the back line', 'Midfielders: connect defense to attack — be available both ways'],
   array['Balls', 'Cones', 'Pinnies', '2 medium goals'], null, null, 370),
('scrimmage-9v9', '9v9 Scrimmage', '🔵', 'Scrimmage', '', 'U12', 30, '18 plus subs', '9v9 on a reduced field to rehearse positional shape and team tactics without the demands of a full 11v11.',
   array['Reduced field, about 70×50 yds', 'A large goal at each end, each with a goalkeeper', 'Two teams of 9 in your formation'],
   array['Play 9v9 with standard rules.', 'The coach may freeze play once or twice to address the session theme.', 'Restart immediately after each freeze.', 'Rotate subs at natural stops.'],
   array['Easier: restart every ball from the goalkeeper so teams can build from the back.', 'Easier: widen the field.', 'Harder: three-touch maximum.', 'Harder: goals that use the session theme count double.', 'Harder: one team plays a player down for 5 minutes.'],
   array['Maintain your team shape — attack and defend as a unit', 'Switch the point of attack when the flank is crowded', 'Pressure, cover, balance — defensive shape starts with the front line'],
   array['Balls', 'Cones', 'Pinnies', '2 large goals'], null, null, 380),
('scrimmage-11v11', '11v11 Full Field Scrimmage', '🏟️', 'Scrimmage', '', 'U14', 35, '22 plus subs', 'Full 11v11 on a regulation field with minimal coaching stops — let the game run and teach itself. Ideal as the final block of a session.',
   array['Regulation field with full-size goals', 'Two teams of 11 in formation, each with a goalkeeper', 'Spare balls behind each goal and at midfield'],
   array['Play 11v11 with full rules.', 'Keep coaching stops to a minimum.', 'The coach may pause once per half to highlight the session theme, then restart with a free kick.', 'Rotate the goalkeeper each half.'],
   array['Easier: fewer than 22 players — play 10v10 or 9v9 on the full field rather than leaving positions empty on one side.', 'Harder: start from game situations — a goal down with 10 minutes left, or a player down.', 'Harder: every restart is a set piece (corner or free kick).', 'Harder: three-touch maximum in your own half.'],
   array['Let the game breathe — don''t over-coach from the sideline', 'GK: organize set pieces, command the box, be the loudest voice on the field', 'Captains: manage the game — call shape, call switches, lead'],
   array['Balls', 'Pinnies', '2 full-size goals'], null, null, 390),
('soccer-baseball', 'Soccer Baseball', '🏟️', 'Games', 'Intermediate', 'U10', 25, '10–20 plus a goalkeeper', 'Two teams compete simultaneously — one sprints a relay around the 18-yard box like baseball bases while the other fires rapid penalty kicks; every goal scored before the last runner finishes counts as a run. Teams switch roles after each half-inning; the team with the most runs after 3 innings wins.',
   array['Diamond: The 18-yard box serves as the baseball diamond — goalpost 1 is Home, near corner of the 18 on the goal line is 1st base, far top corner is 2nd base, opposite top corner is 3rd base, opposite goalpost/end line is Home again.', 'Teams: Two equal groups — one is the Running Team, one is the Shooting Team.', 'Shooting line: Penalty spot, or a cone line at 12–15 yards from goal.'],
   array['Relay: Runner 1 sprints the full perimeter of the 18 (Home → 1st → 2nd → 3rd → Home). Once Runner 1 rounds 2nd base (top-far corner), Runner 2 starts. Subsequent runners release as the teammate ahead rounds the same final corner (3rd base).', 'Shooting: While runners are going, the shooting team fires rapid PK shots from the spot or the cone line. Shooters shag their own balls and rejoin the queue immediately.', 'Scoring: Every goal the shooting team scores before the final runner crosses Home = 1 Run.', 'Inning: Once all runners have finished, teams swap roles (running ↔ shooting). Both halves of a swap = 1 inning.', 'Winner: Play 3 full innings, tally total runs each team scored while shooting, and crown the winner.'],
   array['U10/Introductory: Reduce to 1 full inning; allow a shorter running loop (penalty box only, not the full 18). Shooters shoot from a closer cone (8–10 yards).', 'U12 standard: Full 3-inning game as described — penalty spot, relay around the 18.', 'U14+/Advanced: Add a 2-touch rule for shooters (first touch set + shoot — no standing over the ball), or require the shooting team to receive a served ball before finishing rather than static PKs.', 'Large groups (16+): Run two shooting queues simultaneously to maximize rep rate and maintain pressure on runners.'],
   array['Conditioning Disguised as Competition: Runners sprint at 100% because the other team is scoring — this converts a fitness drill into a competitive game without a single "run a lap" command.', 'Composure Under Pressure: Shooters feel urgency from the runners'' pace, which mirrors in-game pressure — the coaching win is players who stop blasting and start placing shots.', 'Tempo Management: The drill lives or dies by pace — keep spare balls at the shooting line and loudly push shooters to reload and fire; any lull deflates the competitive tension.'],
   array['Balls (many)', 'Cones', 'Full-size goal'], 'tactics/baseball.webm', null, 400)
on conflict (id) do nothing;

-- ---- 6. Age-specific versions ---------------------------------------
-- Three drills read differently for some ages in the practice builder (1v1 Attacking Duel,
-- Beep Test, 1 Mile Run). Kept in extra.variants; added only where there are none yet.
update bdu_drills set extra = coalesce(extra, '{}'::jsonb) || '{"variants": {"U8": {"desc": "Larger grid (20×25 yds). Defender starts 2 yards back to give the attacker more time on the ball. Focus is on dribbling forward and taking a shot — no tackling yet.", "coaching": ["Head up when dribbling — where is the goal?", "Take your shot — be brave!", "Defender: stand up, don''t dive in"]}, "U10": {"desc": "Standard 15×20 yd grid. Introduce body feints before making the move. Attacker scores by dribbling through either of two gates; defender tries to win the ball and clear.", "coaching": ["Use a feint to shift the defender''s weight before you move", "Defender: track the ball, not the player''s upper body", "Keep the ball close under pressure"]}, "U12": {"desc": "15×20 yd grid, full intensity. After the duel ends, winner stays on for the next attacker — builds competitive pressure. Rotate through pairs.", "coaching": ["Explosive first step after the feint", "Defender: delay, don''t panic — make them predictable", "Attacker: keep a low center of gravity to protect the ball"]}, "U14": {"desc": "Smaller grid (10×15 yds), maximum intensity. Add a neutral target player who can receive a layoff — attacker must decide quickly: drive or pass. Loser becomes the next defender.", "coaching": ["Decision speed matters — pass or drive, commit early", "Defender: force to weak foot, cut off the layoff angle", "Attacker: after winning the duel, shield and protect possession"]}, "U16": {"desc": "Tight 10×12 yd grid with a full-size goal. High-press environment — attacker has 8 seconds to score. Defender wins the ball and transitions immediately to counter through cone gates.", "coaching": ["Attacker: exploit the first touch — get behind the defender early", "Defender: tackle timing is everything — patience then commitment", "Transition: when you win the ball, attack immediately"]}, "Mixed": {"desc": "Pair older and younger players as attacker and defender. Older player takes the more challenging role. Adjust the grid size to match the younger player''s comfort level.", "coaching": ["Older players: be a good training partner, not just a winner", "Focus on effort and improvement, not the score", "Coaches: rotate pairs frequently"]}}}'::jsonb
  where id = '1v1-basic' and not (coalesce(extra, '{}'::jsonb) ? 'variants');
update bdu_drills set extra = coalesce(extra, '{}'::jsonb) || '{"variants": {"U10": {"desc": "Players run the standard beep test but stop at Level 5 regardless of whether they''ve been eliminated — focus is on learning the protocol and pacing, not maximum effort.", "coaching": ["All: run at a comfortable rhythm — we''re learning the test today, not racing", "All: touch the line and pivot smoothly — practice the turn, it matters on the real test", "All: listen for the beep and stay in rhythm with it, not ahead of it"]}}}'::jsonb
  where id = 'beep-test' and not (coalesce(extra, '{}'::jsonb) ? 'variants');
update bdu_drills set extra = coalesce(extra, '{}'::jsonb) || '{"variants": {"U10": {"desc": "Players run ¾ mile (3 laps of the marked course) or run for 10 minutes — whichever comes first — at a comfortable, conversational pace.", "coaching": ["All: if you can''t talk while running, you''re going too fast — slow down to a pace you can hold", "All: arms loose and low, not clenched at the chest — relaxed arms mean a relaxed body", "All: finishing matters more than time — don''t stop, even if you need to slow to a jog"]}}}'::jsonb
  where id = 'one-mile-run' and not (coalesce(extra, '{}'::jsonb) ? 'variants');

-- ---- 7. High school program drills ----------------------------------
-- The drills that came from the high school program (igs-takeaways.html) get the HS badge,
-- and so do their younger-age versions once indy-drills-younger-versions.sql has run
-- (run indy-drills-hs-badge.sql after it to mark them).
update bdu_drills set from_hs = true where id in (
  'pass-tap-pass-back', 'cone-passing', 'movement-skill-reset', 'gates-competition-passing', 'long-passes-4', 'get-open', 'gates-competition-dribbling', 'bumper-keepaway', 'across-the-river', '3-team-keepaway', 'block-or-one-time', 'closing-fast-shot-fast', '4-point-shooting', '3v2-transition', '4-person-movement-warmup', 'circle-passing-warmup', 'pierce-the-circle',
  'cone-passing-u8', 'movement-skill-reset-u8', 'gates-competition-passing-u8', 'get-open-u8', 'gates-competition-dribbling-u8', 'bumper-keepaway-u8', '3-team-keepaway-u8', 'long-passes-4-u10', 'across-the-river-u10', 'pierce-the-circle-u10', 'block-or-one-time-u10', 'closing-fast-shot-fast-u10', '3v2-transition-u10', '4-point-shooting-u12'
) and not from_hs;
