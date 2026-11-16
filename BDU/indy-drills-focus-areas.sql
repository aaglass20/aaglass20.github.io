-- =====================================================================
--  BDU — The Indy Way drill library: focus areas, age range, Goalkeeping
--
--  Run ONCE in the Supabase SQL Editor, after the setup, younger-versions
--  and HS-badge files, and BEFORE any file in drill-imports/ dated
--  2026-11-16 or later:
--  https://supabase.com/dashboard/project/fpnmnlrwhwnuefbnehuf/sql
--
--  1. focus_areas — what a drill works on (1v1, Finishing, Pressing, Set
--     Pieces …). A drill has one category but can have several focus areas;
--     practice plans are built by focus area.
--  2. max_age — the oldest group a drill suits (empty = no upper limit), so
--     a tag game for U8s doesn't show up for a U14 team.
--  3. A new category: Goalkeeping.
--  4. The save function learns the two new fields.
--  5. Focus areas for the 72 drills already in the library.
--
--  Safe to run again. Your PIN and drill text are not touched.
-- =====================================================================
alter table bdu_drills add column if not exists focus_areas text[] not null default '{}';
alter table bdu_drills add column if not exists max_age text;
alter table bdu_drills drop constraint if exists bdu_drills_max_age_check;
alter table bdu_drills add constraint bdu_drills_max_age_check check (max_age is null or max_age in ('U8','U10','U12','U14','U16'));
alter table bdu_drills drop constraint if exists bdu_drills_category_check;
alter table bdu_drills add constraint bdu_drills_category_check check (category in
  ('Warmup','Fitness','Technical','Passing','Dribbling','Possession','Shooting','Tactical','Goalkeeping','Games','Scrimmage'));

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
                               setup, directions, variations, coaching_points, equipment, video_file, video_url, from_hs, focus_areas, max_age)
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
    coalesce((p_drill->>'from_hs')::boolean, false),
    array(select jsonb_array_elements_text(coalesce(p_drill->'focus_areas', '[]'::jsonb))),
    nullif(p_drill->>'max_age', '')
  )
  on conflict (id) do update set
    name = excluded.name, icon = excluded.icon, category = excluded.category, skill_level = excluded.skill_level,
    min_age = excluded.min_age, duration = excluded.duration, players = excluded.players,
    description = excluded.description, setup = excluded.setup, directions = excluded.directions,
    variations = excluded.variations, coaching_points = excluded.coaching_points, equipment = excluded.equipment,
    video_file = excluded.video_file, video_url = excluded.video_url, from_hs = excluded.from_hs,
    focus_areas = excluded.focus_areas, max_age = excluded.max_age, updated_at = now()
  returning d.* into v_row;
  return v_row;
end $$;

-- Focus areas for the drills already there (only where none are set yet).
-- A younger-age version takes its original's.
update bdu_drills d set focus_areas = v.focus
from (values
  ('4-person-movement-warmup', array['Warmup', 'Passing', 'First Touch']),
  ('circle-passing-warmup', array['Warmup', 'Passing']),
  ('agility-ladder', array['Speed & Agility', 'Warmup']),
  ('beep-test', array['Conditioning']),
  ('one-mile-run', array['Conditioning']),
  ('circular-pyramid-intervals', array['Conditioning']),
  ('tag-and-release-relay', array['Conditioning', 'Speed & Agility']),
  ('parallel-corridor-footwork', array['Speed & Agility', 'Dribbling', 'Warmup']),
  ('shadow-dribbling', array['Dribbling', 'Warmup']),
  ('1v1-basic', array['1v1', 'Aggression', 'Dribbling', 'Defending']),
  ('pass-tap-pass-back', array['First Touch', 'Passing']),
  ('cone-passing', array['Passing', 'First Touch']),
  ('movement-skill-reset', array['Passing', 'First Touch']),
  ('three-group-continuous', array['Passing', 'First Touch']),
  ('gates-competition-passing', array['Passing', 'Fun']),
  ('long-passes-4', array['Passing', 'First Touch']),
  ('get-open', array['Passing', 'Numbers Up']),
  ('gates-competition-dribbling', array['Dribbling', 'Fun']),
  ('target-dribbling', array['Dribbling', '1v1']),
  ('bumper-keepaway', array['Possession', 'Passing']),
  ('across-the-river', array['Possession', 'Transition', 'Pressing']),
  ('3-team-keepaway', array['Possession', 'Passing']),
  ('peripheral-possession', array['Possession', 'Passing']),
  ('pierce-the-circle', array['Possession', 'Passing']),
  ('block-or-one-time', array['Finishing', 'Defending', 'Aggression']),
  ('closing-fast-shot-fast', array['Finishing', 'Defending', 'Small-Sided Game']),
  ('4-point-shooting', array['Finishing', 'Crossing']),
  ('receive-turn-finish', array['Finishing', 'First Touch']),
  ('3v2-transition', array['Transition', 'Numbers Up']),
  ('rock-the-river', array['Possession', 'Transition', 'Pressing']),
  ('lateral-shadow', array['Defending', '1v1']),
  ('king-of-the-end-zones', array['Transition', 'Possession']),
  ('around-the-horn', array['Attacking', 'Crossing', 'Small-Sided Game']),
  ('small-sided-4v4', array['Small-Sided Game']),
  ('overload-scrimmage', array['Small-Sided Game', 'Possession', 'Transition']),
  ('attack-vs-defense', array['Attacking', 'Defending', 'Team Shape']),
  ('scrimmage-7v7', array['Small-Sided Game', 'Team Shape']),
  ('scrimmage-9v9', array['Team Shape']),
  ('scrimmage-11v11', array['Team Shape']),
  ('soccer-baseball', array['Fun', 'Finishing', 'Conditioning'])
) as v(id, focus)
where (d.id = v.id or d.id ~ ('^' || v.id || '-u(8|10|12|14)$')) and d.focus_areas = '{}';
