-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 004 — Storage bucket + extras
--
-- Paste into the Supabase SQL editor and Run.
--
-- Adds:
--   1. progress-photos  — Supabase Storage bucket for client progress photos
--   2. exercise_library — reusable exercises pool for trainers
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. STORAGE BUCKET FOR PROGRESS PHOTOS ──────────────────────────────────────
-- Create the bucket (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('progress-photos', 'progress-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: clients can upload to their own folder (progress/{client_id}/*)
DROP POLICY IF EXISTS "Clients upload own progress photos" ON storage.objects;
CREATE POLICY "Clients upload own progress photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'progress-photos'
    AND auth.uid()::text = (storage.foldername(name))[2]
  );

-- Policy: anyone can view progress photos (they're linked from progress logs)
DROP POLICY IF EXISTS "Public read progress photos" ON storage.objects;
CREATE POLICY "Public read progress photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'progress-photos');

-- Policy: clients can delete their own photos
DROP POLICY IF EXISTS "Clients delete own progress photos" ON storage.objects;
CREATE POLICY "Clients delete own progress photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'progress-photos'
    AND auth.uid()::text = (storage.foldername(name))[2]
  );

-- 2. EXERCISE LIBRARY ──────────────────────────────────────────────────────────
-- Trainers can save reusable exercises to quickly add to routines
CREATE TABLE IF NOT EXISTS exercise_library (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  category    TEXT,          -- 'fuerza' | 'cardio' | 'flexibilidad' | 'funcional'
  muscle_group TEXT,         -- e.g. 'pecho', 'espalda', 'piernas'
  video_url   TEXT,
  default_sets   INTEGER,
  default_reps   TEXT,
  default_rest   INTEGER,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exercise_library_trainer ON exercise_library(trainer_id);

ALTER TABLE exercise_library ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Trainers manage own exercise library" ON exercise_library;
CREATE POLICY "Trainers manage own exercise library" ON exercise_library
  FOR ALL USING (trainer_id = auth.uid()) WITH CHECK (trainer_id = auth.uid());
