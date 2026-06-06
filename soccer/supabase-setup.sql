-- Soccer Scenario Builder — Supabase Setup
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- Create scenarios table
CREATE TABLE IF NOT EXISTS scenarios (
  id           TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  description  TEXT DEFAULT '',
  category     TEXT DEFAULT 'Other',
  game_format  TEXT DEFAULT '11v11',
  formation    TEXT DEFAULT '4-3-3',
  data         JSONB NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER scenarios_updated_at
  BEFORE UPDATE ON scenarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable Row Level Security (optional but recommended)
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anonymous users (public app — adjust if you add auth)
CREATE POLICY "Allow all for anon"
  ON scenarios
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);
