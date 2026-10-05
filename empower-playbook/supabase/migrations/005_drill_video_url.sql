-- ============================================================
-- Migration: 005_drill_video_url.sql
--
-- Adds an optional video URL to drills (YouTube, Vimeo, or
-- a Supabase Storage public URL from the drill-videos bucket).
--
-- SAFE TO RE-RUN: uses IF NOT EXISTS guard.
--
-- STORAGE SETUP (one-time, in Supabase Dashboard):
--   1. Storage → New bucket → Name: drill-videos
--   2. Toggle "Public bucket" ON  (videos are read by anyone)
--   3. Save — no RLS policies needed for a public bucket
-- ============================================================

ALTER TABLE ep_drills
  ADD COLUMN IF NOT EXISTS video_url text;
