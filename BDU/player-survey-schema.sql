-- =====================================================================
--  BDU 2026 Player Survey — Supabase Schema
--
--  Run this in the Supabase SQL Editor (one time):
--  https://supabase.com/dashboard/project/fpnmnlrwhwnuefbnehuf/sql
-- =====================================================================

CREATE TABLE IF NOT EXISTS bdu_player_survey (
  id                    BIGSERIAL   PRIMARY KEY,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  season                TEXT        NOT NULL DEFAULT '2026',

  -- Identity
  full_name             TEXT        NOT NULL,

  -- Positions
  pos_primary           TEXT        NOT NULL,
  pos_secondary         TEXT,
  pos_avoid             TEXT[]      NOT NULL DEFAULT '{}',
  goalie_interest       TEXT,

  -- Goals & Mindset
  season_goals          TEXT,
  skill_to_improve      TEXT,
  confidence            SMALLINT    CHECK (confidence IS NULL OR confidence BETWEEN 1 AND 10),
  competitive_interest  TEXT,

  -- Fun / Personal
  song1_title           TEXT,
  song1_artist          TEXT,
  song2_title           TEXT,
  song2_artist          TEXT,
  song3_title           TEXT,
  song3_artist          TEXT,
  favorite_pro          TEXT,
  plays_outside         TEXT[]      NOT NULL DEFAULT '{}',

  -- Coaching & Feedback
  favorite_thing        TEXT,
  dislikes              TEXT,
  feedback_style        TEXT,
  injury_notes          TEXT,
  coach_should_know     TEXT
);

CREATE INDEX IF NOT EXISTS bdu_player_survey_season_created_idx
  ON bdu_player_survey (season, created_at DESC);

-- Allow anonymous read/write (matches existing BDU pattern in tryout2026, game-day)
ALTER TABLE bdu_player_survey ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all" ON bdu_player_survey;
CREATE POLICY "anon_all" ON bdu_player_survey
  FOR ALL TO anon
  USING (true)
  WITH CHECK (true);
