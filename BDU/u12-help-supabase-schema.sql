-- =====================================================================
--  BDU U13 → U12 Help — Supabase Schema
--
--  Run this in the Supabase SQL Editor (one time — safe to re-run):
--  https://supabase.com/dashboard/project/fpnmnlrwhwnuefbnehuf/sql
--
--  Tables:
--    u12_help_players       — U13 roster (managed by coach on admin page)
--    u12_help_games         — U12 game schedule (managed by coach)
--    u12_help_availability  — Player self-signup: "I can play this game"
--    u12_help_selected      — Coach-set: "These players ARE playing"
-- =====================================================================

-- ---------------- Roster ----------------
CREATE TABLE IF NOT EXISTS u12_help_players (
  id         BIGSERIAL   PRIMARY KEY,
  name       TEXT        NOT NULL,
  active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (name)
);

-- ---------------- Games (coach-populated) ----------------
CREATE TABLE IF NOT EXISTS u12_help_games (
  id           BIGSERIAL   PRIMARY KEY,
  game_number  TEXT        NOT NULL DEFAULT '',
  game_date    DATE        NOT NULL,
  game_day     TEXT        NOT NULL DEFAULT '',    -- Thu, Sun, etc
  game_time    TEXT        NOT NULL DEFAULT '',
  home_team    TEXT        NOT NULL DEFAULT '',
  visitor_team TEXT        NOT NULL DEFAULT '',
  opponent     TEXT        NOT NULL DEFAULT '',    -- convenience: whichever team is not us
  location     TEXT        NOT NULL DEFAULT '',
  home_away    TEXT        NOT NULL DEFAULT '',    -- 'Home' or 'Away' for our team
  notes        TEXT        NOT NULL DEFAULT '',
  needed_count INTEGER     NOT NULL DEFAULT 3,     -- how many U13 players are needed
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_u12_games_date ON u12_help_games (game_date);

-- Upgrade path if you ran an earlier version of this file
ALTER TABLE u12_help_games ADD COLUMN IF NOT EXISTS game_number  TEXT NOT NULL DEFAULT '';
ALTER TABLE u12_help_games ADD COLUMN IF NOT EXISTS game_day     TEXT NOT NULL DEFAULT '';
ALTER TABLE u12_help_games ADD COLUMN IF NOT EXISTS home_team    TEXT NOT NULL DEFAULT '';
ALTER TABLE u12_help_games ADD COLUMN IF NOT EXISTS visitor_team TEXT NOT NULL DEFAULT '';

-- ---------------- Availability (player self-signup) ----------------
CREATE TABLE IF NOT EXISTS u12_help_availability (
  id         BIGSERIAL   PRIMARY KEY,
  game_id    BIGINT      NOT NULL REFERENCES u12_help_games (id) ON DELETE CASCADE,
  player_id  BIGINT      NOT NULL REFERENCES u12_help_players (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (game_id, player_id)
);
CREATE INDEX IF NOT EXISTS idx_u12_avail_game ON u12_help_availability (game_id);

-- ---------------- Selected (coach picks who plays) ----------------
CREATE TABLE IF NOT EXISTS u12_help_selected (
  id         BIGSERIAL   PRIMARY KEY,
  game_id    BIGINT      NOT NULL REFERENCES u12_help_games (id) ON DELETE CASCADE,
  player_id  BIGINT      NOT NULL REFERENCES u12_help_players (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (game_id, player_id)
);
CREATE INDEX IF NOT EXISTS idx_u12_selected_game ON u12_help_selected (game_id);

-- ---------------- RLS (anon read/write — matches existing BDU pattern) ----------------
ALTER TABLE u12_help_players      ENABLE ROW LEVEL SECURITY;
ALTER TABLE u12_help_games        ENABLE ROW LEVEL SECURITY;
ALTER TABLE u12_help_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE u12_help_selected     ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all" ON u12_help_players;
DROP POLICY IF EXISTS "anon_all" ON u12_help_games;
DROP POLICY IF EXISTS "anon_all" ON u12_help_availability;
DROP POLICY IF EXISTS "anon_all" ON u12_help_selected;

CREATE POLICY "anon_all" ON u12_help_players      FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON u12_help_games        FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON u12_help_availability FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON u12_help_selected     FOR ALL TO anon USING (true) WITH CHECK (true);

-- =====================================================================
--  Seed the 2026 U12 schedule (Independence is our team)
--  Idempotent — safe to re-run; won't duplicate rows with the same game_number.
-- =====================================================================
INSERT INTO u12_help_games
  (game_number, game_date,      game_day, game_time, home_team,           visitor_team,   opponent,             home_away, location,                                                                    needed_count)
SELECT v.* FROM (VALUES
  ('8401', DATE '2026-08-20', 'Thu', '6:30 PM', 'Independence',       'Twinsburg Blue', 'Twinsburg Blue',       'Home', 'Elmwood Park (Field 4)',                                                     3),
  ('8419', DATE '2026-08-23', 'Sun', '2:30 PM', 'Independence',       'Stow Mar',       'Stow Mar',             'Home', 'Elmwood Park (Field 4)',                                                     3),
  ('8407', DATE '2026-08-25', 'Tue', '6:30 PM', 'Independence',       'Kenston',        'Kenston',              'Home', 'Elmwood Park (Field 4)',                                                     3),
  ('8410', DATE '2026-09-02', 'Wed', '6:30 PM', 'Cuyahoga Falls GL',  'Independence',   'Cuyahoga Falls GL',    'Away', 'Waterworks Park (Waterworks 9V9 - Field 2)',                                 3),
  ('8413', DATE '2026-09-13', 'Sun', '4:30 PM', 'Independence',       'Kent TS',        'Kent TS',              'Home', 'Elmwood Park (Field 4)',                                                     3),
  ('8416', DATE '2026-09-20', 'Sun', '2:30 PM', 'Twinsburg Blue',     'Independence',   'Twinsburg Blue',       'Away', 'Liberty Park (Lower)',                                                       3),
  ('8404', DATE '2026-10-08', 'Thu', '6:00 PM', 'Stow Mar',           'Independence',   'Stow Mar',             'Away', 'Silver Springs Park (11v11 / 9v9 - Field 2, far from road)',                 3),
  ('8422', DATE '2026-10-12', 'Mon', '6:00 PM', 'Kenston',            'Independence',   'Kenston',              'Away', 'River Road Park (9v9 West)',                                                 3)
) AS v(game_number, game_date, game_day, game_time, home_team, visitor_team, opponent, home_away, location, needed_count)
WHERE NOT EXISTS (
  SELECT 1 FROM u12_help_games g WHERE g.game_number = v.game_number
);
