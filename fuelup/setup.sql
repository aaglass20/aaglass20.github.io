-- ============================================================
-- FuelUp — Supabase table setup
-- Project: fpnmnlrwhwnuefbnehuf.supabase.co
-- (same project as /schedule/ and /empower/)
--
-- HOW TO RUN:
--   1. Go to https://supabase.com/dashboard
--   2. Open project fpnmnlrwhwnuefbnehuf
--   3. Left sidebar → SQL Editor → New query
--   4. Paste this entire file → Run
--
-- Safe to run multiple times (uses IF NOT EXISTS / DO blocks).
-- ============================================================


-- ------------------------------------------------------------
-- Table 1: fuelup_plans
-- One row per user per calendar day.
-- schedule is the full JSON of placed items, keyed by HH:MM.
-- user_id is a device UUID stored in localStorage (no auth needed).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fuelup_plans (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     text        NOT NULL,
  plan_date   date        NOT NULL,
  schedule    jsonb       NOT NULL DEFAULT '{}',
  updated_at  timestamptz DEFAULT now(),

  CONSTRAINT fuelup_plans_user_date UNIQUE (user_id, plan_date)
);

-- Index so loading a user's week is fast
CREATE INDEX IF NOT EXISTS fuelup_plans_user_idx ON fuelup_plans (user_id, plan_date);


-- ------------------------------------------------------------
-- Table 2: fuelup_user_settings
-- One row per user — wake/bed times and favorited items.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fuelup_user_settings (
  user_id     text        PRIMARY KEY,
  wake_time   text        NOT NULL DEFAULT '07:00',
  bed_time    text        NOT NULL DEFAULT '21:30',
  favorites   jsonb       NOT NULL DEFAULT '{"meal":[],"snack":[],"workout":[]}',
  updated_at  timestamptz DEFAULT now()
);


-- ------------------------------------------------------------
-- Row Level Security
-- Public anon key access — consistent with empower_signups
-- and availability_slots in this project.
-- ------------------------------------------------------------
ALTER TABLE fuelup_plans         ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuelup_user_settings ENABLE ROW LEVEL SECURITY;

-- Drop policies first so this script is re-runnable
DO $$ BEGIN
  DROP POLICY IF EXISTS "fuelup_plans_public"    ON fuelup_plans;
  DROP POLICY IF EXISTS "fuelup_settings_public" ON fuelup_user_settings;
END $$;

CREATE POLICY "fuelup_plans_public"
  ON fuelup_plans FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "fuelup_settings_public"
  ON fuelup_user_settings FOR ALL
  USING (true) WITH CHECK (true);


-- ------------------------------------------------------------
-- Verify (optional — shows the new tables)
-- ------------------------------------------------------------
SELECT table_name, pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) AS size
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'fuelup%'
ORDER BY table_name;
