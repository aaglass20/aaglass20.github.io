-- =====================================================================
--  BDU Game Day — Supabase Schema
--
--  Run this in the Supabase SQL Editor (one time):
--  https://supabase.com/dashboard/project/fpnmnlrwhwnuefbnehuf/sql
--
--  After running, populate game_day_roster via the Table Editor in
--  Supabase, or insert rows manually below the seed comment.
-- =====================================================================

-- Roster (manage via Supabase Table Editor or insert rows here)
CREATE TABLE IF NOT EXISTS game_day_roster (
  id                  BIGSERIAL PRIMARY KEY,
  name                TEXT        NOT NULL,
  number              TEXT        NOT NULL DEFAULT '',
  preferred_positions TEXT        NOT NULL DEFAULT '',  -- comma-separated e.g. "GK,CD"
  active              BOOLEAN     NOT NULL DEFAULT TRUE,
  UNIQUE (name)
);

-- Games
CREATE TABLE IF NOT EXISTS game_day_games (
  game_id    TEXT        PRIMARY KEY,
  date       TEXT        NOT NULL DEFAULT '',
  opponent   TEXT        NOT NULL DEFAULT '',
  location   TEXT        NOT NULL DEFAULT '',
  home_away  TEXT        NOT NULL DEFAULT '',
  type       TEXT        NOT NULL DEFAULT 'League',
  notes      TEXT        NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Lineups  (game_id + half + position + role rows — destructive save per game)
CREATE TABLE IF NOT EXISTS game_day_lineups (
  id       BIGSERIAL PRIMARY KEY,
  game_id  TEXT NOT NULL,
  half     TEXT NOT NULL,
  position TEXT NOT NULL,
  role     TEXT NOT NULL DEFAULT 'Starter',
  player   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_lineups_game ON game_day_lineups (game_id);

-- Stats  (one row per event — destructive save per game)
CREATE TABLE IF NOT EXISTS game_day_stats (
  id      BIGSERIAL PRIMARY KEY,
  game_id TEXT NOT NULL,
  minute  TEXT NOT NULL DEFAULT '',
  type    TEXT NOT NULL,
  player  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_stats_game ON game_day_stats (game_id);

-- Depth chart  (full replace on every save)
CREATE TABLE IF NOT EXISTS game_day_depth (
  id       BIGSERIAL PRIMARY KEY,
  position TEXT    NOT NULL,
  rank     INTEGER NOT NULL,
  player   TEXT    NOT NULL
);

-- Plays  (canvas drawings stored as base64 data URLs, upserted by game+name)
CREATE TABLE IF NOT EXISTS game_day_plays (
  id         BIGSERIAL PRIMARY KEY,
  game_id    TEXT NOT NULL,
  name       TEXT NOT NULL,
  image_data TEXT,
  UNIQUE (game_id, name)
);

-- ---- Row Level Security (anon read/write — matches Apps Script "Anyone" access) ----
ALTER TABLE game_day_roster  ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_day_games   ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_day_lineups ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_day_stats   ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_day_depth   ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_day_plays   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_all" ON game_day_roster  FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON game_day_games   FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON game_day_lineups FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON game_day_stats   FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON game_day_depth   FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON game_day_plays   FOR ALL TO anon USING (true) WITH CHECK (true);

-- ---- Seed roster (edit names/numbers to match your current team) ----
-- INSERT INTO game_day_roster (name, number, preferred_positions) VALUES
--   ('Ava Smith',    '1',  'GK'),
--   ('Emma Johnson', '5',  'CD,CM'),
--   ('Lily Brown',   '10', 'LF,RF')
-- ON CONFLICT (name) DO NOTHING;
