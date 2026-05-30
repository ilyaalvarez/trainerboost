-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 005 — Client tags + body measurements
--
-- Paste into the Supabase SQL editor and Run.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. CLIENT TAGS ──────────────────────────────────────────────────────────────
-- Add a tags array to trainer_clients for organizing clients
ALTER TABLE trainer_clients ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- 2. BODY MEASUREMENTS ─────────────────────────────────────────────────────────
-- Extend progress_logs with circumference measurements (cm)
ALTER TABLE progress_logs ADD COLUMN IF NOT EXISTS waist_cm DECIMAL(5,1);
ALTER TABLE progress_logs ADD COLUMN IF NOT EXISTS chest_cm DECIMAL(5,1);
ALTER TABLE progress_logs ADD COLUMN IF NOT EXISTS arm_cm DECIMAL(5,1);
ALTER TABLE progress_logs ADD COLUMN IF NOT EXISTS thigh_cm DECIMAL(5,1);
ALTER TABLE progress_logs ADD COLUMN IF NOT EXISTS hip_cm DECIMAL(5,1);
