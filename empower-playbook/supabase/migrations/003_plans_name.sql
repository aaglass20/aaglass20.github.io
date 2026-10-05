-- ============================================================
-- Empower Sports Playbook — Migration: 003_plans_name.sql
--
-- Adds a 'name' column to ep_plans so plans can be titled
-- independently of their program/week/group context.
--
-- SAFE TO RE-RUN: uses IF NOT EXISTS.
-- Run AFTER 001_initial_schema.sql.
-- ============================================================

ALTER TABLE ep_plans ADD COLUMN IF NOT EXISTS name text;
