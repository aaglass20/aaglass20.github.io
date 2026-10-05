-- ============================================================
-- Migration: 006_storage_drill_videos.sql
--
-- Creates the drill-videos storage bucket and sets policies
-- so anyone can upload and read video files.
--
-- Run this in Supabase SQL Editor.
-- SAFE TO RE-RUN: ON CONFLICT / DROP IF EXISTS guards.
-- ============================================================

-- 1. Create bucket (public = files are readable without auth)
INSERT INTO storage.buckets (id, name, public)
VALUES ('drill-videos', 'drill-videos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Allow anonymous uploads
DROP POLICY IF EXISTS "anon can upload drill videos" ON storage.objects;
CREATE POLICY "anon can upload drill videos"
ON storage.objects FOR INSERT TO anon
WITH CHECK (bucket_id = 'drill-videos');

-- 3. Allow public reads (redundant with public=true but explicit)
DROP POLICY IF EXISTS "public read drill videos" ON storage.objects;
CREATE POLICY "public read drill videos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'drill-videos');

-- 4. Allow anonymous deletes (optional — lets future cleanup work)
DROP POLICY IF EXISTS "anon can delete drill videos" ON storage.objects;
CREATE POLICY "anon can delete drill videos"
ON storage.objects FOR DELETE TO anon
USING (bucket_id = 'drill-videos');
