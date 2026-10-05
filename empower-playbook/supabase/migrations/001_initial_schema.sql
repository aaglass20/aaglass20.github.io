-- ============================================================
-- Empower Sports Playbook — Initial Schema
-- Migration: 001_initial_schema.sql
--
-- Current project:  fpnmnlrwhwnuefbnehuf.supabase.co
--   (shared with /empower/, /schedule/, /fuelup/)
-- Future project:   your-new-project.supabase.co
--   (dedicated instance — run this file again, nothing else needed)
--
-- HOW TO RUN:
--   1. https://supabase.com/dashboard → open the project
--   2. Left sidebar → SQL Editor → New query
--   3. Paste this entire file → Run
--
-- SAFE TO RE-RUN: all DDL uses IF NOT EXISTS; policies use
--   DROP IF EXISTS before CREATE so you can apply patches.
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1. ep_locations
--    Facilities, fields, and courts used across programs.
--    image_data stores base64 for now; becomes a Supabase
--    Storage URL (image_url TEXT) once Storage is configured.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ep_locations (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name        text        NOT NULL,
  address     text,
  lat         float8,
  lon         float8,
  notes       text,
  image_data  text,       -- base64 → will rename to image_url when Storage lands
  created_at  timestamptz DEFAULT now()
);


-- ────────────────────────────────────────────────────────────
-- 2. ep_programs
--    Top-level container: season, sport, location, groups.
--    groups is an ordered TEXT array (e.g. '{Competitive,Skills}').
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ep_programs (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name        text        NOT NULL,
  sport       text        NOT NULL,
  sport_icon  text,
  sport_name  text,
  location_id uuid        REFERENCES ep_locations(id) ON DELETE SET NULL,
  num_weeks   int         NOT NULL DEFAULT 8,
  groups      text[]      NOT NULL DEFAULT '{}',
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ep_programs_location_idx ON ep_programs (location_id);


-- ────────────────────────────────────────────────────────────
-- 3. ep_program_weeks
--    One row per (program × week_num).
--    session_date is optional — assigned later from the dashboard.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ep_program_weeks (
  id            uuid  DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id    uuid  NOT NULL REFERENCES ep_programs(id) ON DELETE CASCADE,
  week_num      int   NOT NULL,
  session_date  date,

  UNIQUE (program_id, week_num)
);

CREATE INDEX IF NOT EXISTS ep_program_weeks_prog_idx ON ep_program_weeks (program_id);


-- ────────────────────────────────────────────────────────────
-- 4. ep_plans
--    Practice plan for one (program, week_num, group_name) cell.
--    blocks is the full ordered JSON array of plan blocks.
--    A null program_id means a standalone plan (no program context).
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ep_plans (
  id               uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id       uuid    REFERENCES ep_programs(id) ON DELETE CASCADE,
  week_num         int,
  group_name       text,
  sport            text    NOT NULL,
  sport_icon       text,
  sport_name       text,
  duration_minutes int     NOT NULL DEFAULT 75,
  has_warmup       boolean DEFAULT true,
  blocks           jsonb   NOT NULL DEFAULT '[]',
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ep_plans_program_idx
  ON ep_plans (program_id, week_num, group_name);

-- Auto-bump updated_at on every row update
CREATE OR REPLACE FUNCTION ep_touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ep_plans_updated_at ON ep_plans;
CREATE TRIGGER ep_plans_updated_at
  BEFORE UPDATE ON ep_plans
  FOR EACH ROW EXECUTE FUNCTION ep_touch_updated_at();


-- ────────────────────────────────────────────────────────────
-- 5. ep_drills
--    All drills — both seeded built-ins (source='builtin') and
--    user-created custom drills (source='user').
--    id is TEXT so existing localStorage string IDs are preserved.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ep_drills (
  id               text        PRIMARY KEY,
  sport            text        NOT NULL,
  category         text,
  icon             text,
  name             text        NOT NULL,
  description      text,
  purpose          text,       -- the "why this drill" explanation
  volunteer_tip    text,
  facilitator_tip  text,
  equipment        text[]      DEFAULT '{}',
  steps            jsonb       DEFAULT '[]',
  default_time     int         DEFAULT 12,
  source           text        DEFAULT 'user',
  created_at       timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ep_drills_sport_idx ON ep_drills (sport);

-- Add columns for existing installations (safe to re-run)
ALTER TABLE ep_drills ADD COLUMN IF NOT EXISTS icon         text;
ALTER TABLE ep_drills ADD COLUMN IF NOT EXISTS default_time int  DEFAULT 12;
ALTER TABLE ep_drills ADD COLUMN IF NOT EXISTS source       text DEFAULT 'user';


-- ────────────────────────────────────────────────────────────
-- 6. Row Level Security
--    Public anon-key access — consistent with empower_signups,
--    fuelup_plans, and availability_slots already in this project.
--    Tighten to user-scoped policies when auth is added.
-- ────────────────────────────────────────────────────────────
ALTER TABLE ep_locations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE ep_programs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE ep_program_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ep_plans         ENABLE ROW LEVEL SECURITY;
ALTER TABLE ep_drills        ENABLE ROW LEVEL SECURITY;

-- Drop first so this block is safe to re-run
DO $$ BEGIN
  DROP POLICY IF EXISTS "ep_locations_public"      ON ep_locations;
  DROP POLICY IF EXISTS "ep_programs_public"       ON ep_programs;
  DROP POLICY IF EXISTS "ep_program_weeks_public"  ON ep_program_weeks;
  DROP POLICY IF EXISTS "ep_plans_public"          ON ep_plans;
  DROP POLICY IF EXISTS "ep_drills_public"         ON ep_drills;
END $$;

CREATE POLICY "ep_locations_public"
  ON ep_locations     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "ep_programs_public"
  ON ep_programs      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "ep_program_weeks_public"
  ON ep_program_weeks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "ep_plans_public"
  ON ep_plans         FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "ep_drills_public"
  ON ep_drills        FOR ALL USING (true) WITH CHECK (true);


-- ────────────────────────────────────────────────────────────
-- Verify — shows all ep_ tables and their current size
-- ────────────────────────────────────────────────────────────
SELECT
  table_name,
  pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) AS size
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'ep_%'
ORDER BY table_name;
