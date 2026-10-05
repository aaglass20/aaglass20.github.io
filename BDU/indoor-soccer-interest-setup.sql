-- BDU Indoor Soccer Interest Registration
-- Run once in the Supabase SQL editor at https://supabase.com/dashboard

CREATE TABLE IF NOT EXISTS bdu_indoor_soccer_interest (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  timestamptz DEFAULT now(),
  player_name text        NOT NULL,
  phone       text,
  email       text,
  grade       text        NOT NULL,  -- 'K', '1'–'12'
  session_1   boolean     DEFAULT false,  -- begins Nov 1
  session_2   boolean     DEFAULT false   -- early 2027
);

-- Enable Row Level Security
ALTER TABLE bdu_indoor_soccer_interest ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public signup form)
CREATE POLICY "allow_public_insert"
  ON bdu_indoor_soccer_interest
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to read (admin view uses same anon key)
-- If you want to restrict the admin view, replace this with a service-role key check
CREATE POLICY "allow_public_select"
  ON bdu_indoor_soccer_interest
  FOR SELECT
  USING (true);
