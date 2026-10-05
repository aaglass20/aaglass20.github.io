-- ============================================================
-- Migration: 004_slot_plans_jsonb.sql
--
-- Moves the program→plan slot mapping from ep_plans rows
-- (program_id / week_num / group_name columns) onto the
-- program row itself as a JSONB map:
--
--   slot_plans: { "w1-Competitive": "<plan-uuid>",
--                 "w2-Competitive": "<plan-uuid>", ... }
--
-- Multiple slots can reference the same plan UUID.
-- Plans no longer need to store their program association
-- for slot-lookup purposes.
--
-- SAFE TO RE-RUN: uses IF NOT EXISTS / IF EXISTS guards.
-- ============================================================

ALTER TABLE ep_programs
  ADD COLUMN IF NOT EXISTS slot_plans jsonb DEFAULT '{}'::jsonb;
