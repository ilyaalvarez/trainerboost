-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 006 — Avatars storage bucket
--
-- Paste into the Supabase SQL editor and Run.
--
-- Creates the 'avatars' bucket for profile picture uploads.
-- Files are stored at avatars/{user_id}.{ext}
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. CREATE BUCKET ─────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. POLICIES ──────────────────────────────────────────────────────────────────
-- Anyone can view avatars (public bucket)
DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;
CREATE POLICY "Public read avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Users can upload/replace their own avatar
DROP POLICY IF EXISTS "Users upload own avatar" ON storage.objects;
CREATE POLICY "Users upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = split_part(storage.filename(name), '.', 1)
  );

-- Users can update (overwrite) their own avatar
DROP POLICY IF EXISTS "Users update own avatar" ON storage.objects;
CREATE POLICY "Users update own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = split_part(storage.filename(name), '.', 1)
  );

-- Users can delete their own avatar
DROP POLICY IF EXISTS "Users delete own avatar" ON storage.objects;
CREATE POLICY "Users delete own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = split_part(storage.filename(name), '.', 1)
  );
