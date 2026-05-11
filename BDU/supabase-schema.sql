-- =====================================================================
--  BDU 2026 Tryout Evaluations — Supabase Schema
--
--  Run this in the Supabase SQL Editor (one time):
--  https://supabase.com/dashboard/project/fpnmnlrwhwnuefbnehuf/sql
-- =====================================================================

CREATE TABLE IF NOT EXISTS tryout2026 (
  id                  BIGSERIAL PRIMARY KEY,
  name                TEXT        NOT NULL,
  age_group           TEXT,
  jersey              TEXT,
  speed               SMALLINT    CHECK (speed               IS NULL OR speed               BETWEEN 1 AND 5),
  control             SMALLINT    CHECK (control             IS NULL OR control             BETWEEN 1 AND 5),
  shot_accuracy       SMALLINT    CHECK (shot_accuracy       IS NULL OR shot_accuracy       BETWEEN 1 AND 5),
  touch               SMALLINT    CHECK (touch               IS NULL OR touch               BETWEEN 1 AND 5),
  shot_power          SMALLINT    CHECK (shot_power          IS NULL OR shot_power          BETWEEN 1 AND 5),
  long_pass_accuracy  SMALLINT    CHECK (long_pass_accuracy  IS NULL OR long_pass_accuracy  BETWEEN 1 AND 5),
  short_pass_accuracy SMALLINT    CHECK (short_pass_accuracy IS NULL OR short_pass_accuracy BETWEEN 1 AND 5),
  hustle              SMALLINT    CHECK (hustle              IS NULL OR hustle              BETWEEN 1 AND 5),
  tackling            SMALLINT    CHECK (tackling            IS NULL OR tackling            BETWEEN 1 AND 5),
  positioning         SMALLINT    CHECK (positioning         IS NULL OR positioning         BETWEEN 1 AND 5),
  one_v_one           SMALLINT    CHECK (one_v_one           IS NULL OR one_v_one           BETWEEN 1 AND 5),
  communication       SMALLINT    CHECK (communication       IS NULL OR communication       BETWEEN 1 AND 5),
  shadow              SMALLINT    CHECK (shadow              IS NULL OR shadow              BETWEEN 1 AND 5),
  notes               TEXT,
  scrimmage_points    INTEGER     NOT NULL DEFAULT 0,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (name)
);

-- Allow anonymous read/write (matches current "Anyone" Apps Script access)
ALTER TABLE tryout2026 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_all" ON tryout2026
  FOR ALL TO anon
  USING (true)
  WITH CHECK (true);

-- Seed initial players
INSERT INTO tryout2026 (name, age_group) VALUES
  ('Carson Bellanger',    'Age 8'),
  ('Gabrielle Loerch',    'Age 8'),
  ('Kelsey Ketvertis',    'Age 8'),
  ('Austin Bellanger',    'Age 9'),
  ('Gabriella Beastrom',  'Age 9'),
  ('Haylie Hujarski',     'Age 9'),
  ('Felicity Nash',       'Age 10'),
  ('Alena Rodgers',       'Age 11'),
  ('Isla Zdolshek',       'Age 11'),
  ('Layla Kandzer',       'Age 11'),
  ('Lilly Karim',         'Age 11'),
  ('Olivia Karim',        'Age 11')
ON CONFLICT (name) DO NOTHING;
