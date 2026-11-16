-- =====================================================================
--  BDU — The Indy Way drill library: HS badge
--
--  Run ONCE in the Supabase SQL Editor (the table already exists):
--  https://supabase.com/dashboard/project/fpnmnlrwhwnuefbnehuf/sql
--
--  Adds a from_hs column ("came from the high school program"), lets the
--  page's Edit drill form save it, and marks the 17 drills that came from
--  the high school program (igs-takeaways.html) plus their 14 younger-age
--  versions. The page shows a small HS badge on those. Tick "From the high
--  school program" on a drill's edit form to change any.
--
--  Safe to run again. Your PIN and your drills are not touched.
-- =====================================================================
alter table bdu_drills add column if not exists from_hs boolean not null default false;

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

update bdu_drills set from_hs = true where id in (
  'pass-tap-pass-back',
  'cone-passing',
  'movement-skill-reset',
  'gates-competition-passing',
  'long-passes-4',
  'get-open',
  'gates-competition-dribbling',
  'bumper-keepaway',
  'across-the-river',
  '3-team-keepaway',
  'block-or-one-time',
  'closing-fast-shot-fast',
  '4-point-shooting',
  '3v2-transition',
  '4-person-movement-warmup',
  'circle-passing-warmup',
  'pierce-the-circle',
  -- their younger-age versions (indy-drills-younger-versions.sql)
  'cone-passing-u8',
  'movement-skill-reset-u8',
  'gates-competition-passing-u8',
  'get-open-u8',
  'gates-competition-dribbling-u8',
  'bumper-keepaway-u8',
  '3-team-keepaway-u8',
  'long-passes-4-u10',
  'across-the-river-u10',
  'pierce-the-circle-u10',
  'block-or-one-time-u10',
  'closing-fast-shot-fast-u10',
  '3v2-transition-u10',
  '4-point-shooting-u12'
);
