-- ============================================================
-- Balance — recurring charges + "where does it leak" tracker
-- Project: fpnmnlrwhwnuefbnehuf.supabase.co
-- (same project as /schedule/, /empower/, /fuelup/, /wip/)
--
-- HOW TO RUN:
--   1. https://supabase.com/dashboard → project fpnmnlrwhwnuefbnehuf
--   2. SQL Editor → New query → paste this file → Run
--   3. EDIT the two emails in the "members" block at the bottom first
--      (only those emails can read/write this data).
--   4. Authentication → URL Configuration → add your site URL to
--      "Redirect URLs", e.g.  https://aaglass20.github.io/balance/
--      (and http://localhost:8765/balance/ for local testing)
--
-- Safe to run multiple times.
--
-- Unlike the other tables in this project, this data is NOT public:
-- money data sits behind Supabase Auth (email magic link) and an
-- allow-list of household members.
-- ============================================================


-- ------------------------------------------------------------
-- Members allow-list — who in the household can see the data
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS balance_members (
  email      text PRIMARY KEY,
  name       text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE OR REPLACE FUNCTION balance_is_member() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM balance_members
    WHERE lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;


-- ------------------------------------------------------------
-- Recurring charges (streaming, phone, insurance, loans …)
-- anchor_date = any real billing date; occurrences are generated
-- from it forward/backward by cadence.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS balance_recurring (
  id             uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  name           text          NOT NULL,
  category       text          NOT NULL DEFAULT 'other',
  amount         numeric(10,2) NOT NULL DEFAULT 0,
  prev_amount    numeric(10,2),             -- last price, to catch price hikes
  cadence        text          NOT NULL DEFAULT 'monthly'
                 CHECK (cadence IN ('weekly','monthly','quarterly','yearly')),
  anchor_date    date          NOT NULL DEFAULT current_date,
  start_date     date,                      -- first charge (optional)
  end_date       date,                      -- payment drops off (payoff, contract end)
  renewal_date   date,                      -- contract / annual renewal
  promo_end_date date,                      -- intro price ends
  promo_amount   numeric(10,2),             -- price after promo ends
  cancel_by      date,                      -- decide/cancel before this date
  status         text          NOT NULL DEFAULT 'active'
                 CHECK (status IN ('active','paused','cancelled')),
  paused_until   date,                      -- resubscribe date when rotating
  cancelled_on   date,
  verdict        text          NOT NULL DEFAULT 'keep'
                 CHECK (verdict IN ('keep','review','rotate','cancel')),
  worth          smallint      CHECK (worth BETWEEN 1 AND 5),
  justification  text          NOT NULL DEFAULT '',  -- why we pay for it
  uses           text          NOT NULL DEFAULT '',  -- shows we watch / what we use it for
  who            text          NOT NULL DEFAULT '',  -- who uses it
  last_used      date,
  cancel_url     text          NOT NULL DEFAULT '',
  notes          text          NOT NULL DEFAULT '',
  created_at     timestamptz   DEFAULT now(),
  updated_at     timestamptz   DEFAULT now()
);


-- ------------------------------------------------------------
-- Discretionary spending log (restaurants, treats, beer …)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS balance_spend (
  id         uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  spent_on   date          NOT NULL DEFAULT current_date,
  category   text          NOT NULL DEFAULT 'other',
  amount     numeric(10,2) NOT NULL DEFAULT 0,
  merchant   text          NOT NULL DEFAULT '',
  note       text          NOT NULL DEFAULT '',
  worth_it   text          CHECK (worth_it IN ('yes','meh','no')),
  who        text          NOT NULL DEFAULT '',
  created_at timestamptz   DEFAULT now()
);

CREATE INDEX IF NOT EXISTS balance_spend_date_idx ON balance_spend (spent_on);


-- ------------------------------------------------------------
-- Settings — one row: monthly "comfort" targets per category
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS balance_settings (
  id         int  PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  targets    jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);
INSERT INTO balance_settings (id) VALUES (1) ON CONFLICT DO NOTHING;


-- ------------------------------------------------------------
-- updated_at trigger
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION balance_touch() RETURNS trigger AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS balance_recurring_touch ON balance_recurring;
CREATE TRIGGER balance_recurring_touch BEFORE UPDATE ON balance_recurring
  FOR EACH ROW EXECUTE FUNCTION balance_touch();


-- ------------------------------------------------------------
-- Row Level Security — signed-in household members only
-- ------------------------------------------------------------
ALTER TABLE balance_members   ENABLE ROW LEVEL SECURITY;
ALTER TABLE balance_recurring ENABLE ROW LEVEL SECURITY;
ALTER TABLE balance_spend     ENABLE ROW LEVEL SECURITY;
ALTER TABLE balance_settings  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS balance_members_read   ON balance_members;
DROP POLICY IF EXISTS balance_recurring_all  ON balance_recurring;
DROP POLICY IF EXISTS balance_spend_all      ON balance_spend;
DROP POLICY IF EXISTS balance_settings_all   ON balance_settings;

CREATE POLICY balance_members_read  ON balance_members   FOR SELECT TO authenticated USING (balance_is_member());
CREATE POLICY balance_recurring_all ON balance_recurring FOR ALL    TO authenticated USING (balance_is_member()) WITH CHECK (balance_is_member());
CREATE POLICY balance_spend_all     ON balance_spend     FOR ALL    TO authenticated USING (balance_is_member()) WITH CHECK (balance_is_member());
CREATE POLICY balance_settings_all  ON balance_settings  FOR ALL    TO authenticated USING (balance_is_member()) WITH CHECK (balance_is_member());


-- ------------------------------------------------------------
-- Members — EDIT THESE before running
-- ------------------------------------------------------------
INSERT INTO balance_members (email, name) VALUES
  ('you@example.com',     'Me'),
  ('partner@example.com', 'Partner')
ON CONFLICT (email) DO NOTHING;


SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name LIKE 'balance%'
ORDER BY table_name;
