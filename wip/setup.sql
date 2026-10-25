-- ============================================================
-- WIP Board — Supabase table setup
-- Project: fpnmnlrwhwnuefbnehuf.supabase.co
-- (same project as /schedule/, /empower/, /fuelup/)
--
-- HOW TO RUN:
--   1. Go to https://supabase.com/dashboard
--   2. Open project fpnmnlrwhwnuefbnehuf
--   3. Left sidebar → SQL Editor → New query
--   4. Paste this entire file → Run
--
-- Safe to run multiple times (uses IF NOT EXISTS / DO blocks).
--
-- Hierarchy:  Project → Epic → Item (ticket | bug)
-- Items may also be unlinked (epic_id NULL).
-- ============================================================


-- ------------------------------------------------------------
-- Table 1: wip_projects
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wip_projects (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  title       text        NOT NULL,
  description text        NOT NULL DEFAULT '',
  created_at  timestamptz DEFAULT now()
);


-- ------------------------------------------------------------
-- Table 2: wip_epics — every epic belongs to one project.
-- Deleting a project deletes its epics.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wip_epics (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id  uuid        NOT NULL REFERENCES wip_projects (id) ON DELETE CASCADE,
  title       text        NOT NULL,
  description text        NOT NULL DEFAULT '',
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS wip_epics_project_idx ON wip_epics (project_id);


-- ------------------------------------------------------------
-- Table 3: wip_items — tickets and bugs on the board.
-- Deleting an epic unlinks its items (they stay on the board).
-- done_at is stamped by trigger when status moves to 'done';
-- the board hides Done items older than 7 days.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wip_items (
  id          uuid             DEFAULT gen_random_uuid() PRIMARY KEY,
  epic_id     uuid             REFERENCES wip_epics (id) ON DELETE SET NULL,
  type        text             NOT NULL DEFAULT 'ticket' CHECK (type IN ('ticket', 'bug')),
  title       text             NOT NULL,
  description text             NOT NULL DEFAULT '',
  status      text             NOT NULL DEFAULT 'backlog'
                               CHECK (status IN ('backlog', 'in_progress', 'testing', 'done')),
  position    double precision NOT NULL DEFAULT 0,
  done_at     timestamptz,
  created_at  timestamptz      DEFAULT now(),
  updated_at  timestamptz      DEFAULT now()
);

CREATE INDEX IF NOT EXISTS wip_items_status_idx ON wip_items (status, position);
CREATE INDEX IF NOT EXISTS wip_items_epic_idx   ON wip_items (epic_id);


-- ------------------------------------------------------------
-- Trigger: keep done_at / updated_at in sync with status
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION wip_items_touch() RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  IF NEW.status = 'done' THEN
    IF TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'done' THEN
      NEW.done_at := now();
    END IF;
  ELSE
    NEW.done_at := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS wip_items_touch_trg ON wip_items;
CREATE TRIGGER wip_items_touch_trg
  BEFORE INSERT OR UPDATE ON wip_items
  FOR EACH ROW EXECUTE FUNCTION wip_items_touch();


-- ------------------------------------------------------------
-- Row Level Security
-- Public anon key access — consistent with the other tables
-- in this project.
-- ------------------------------------------------------------
ALTER TABLE wip_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE wip_epics    ENABLE ROW LEVEL SECURITY;
ALTER TABLE wip_items    ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "wip_projects_public" ON wip_projects;
  DROP POLICY IF EXISTS "wip_epics_public"    ON wip_epics;
  DROP POLICY IF EXISTS "wip_items_public"    ON wip_items;
END $$;

CREATE POLICY "wip_projects_public" ON wip_projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "wip_epics_public"    ON wip_epics    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "wip_items_public"    ON wip_items    FOR ALL USING (true) WITH CHECK (true);


-- ------------------------------------------------------------
-- Verify (optional — shows the new tables)
-- ------------------------------------------------------------
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'wip%'
ORDER BY table_name;
