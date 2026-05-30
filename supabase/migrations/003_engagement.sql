-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 003 — Engagement & retention layer
--
-- Paste into the Supabase SQL editor and Run.
--
-- Adds:
--   1. notifications     — in-app notification center
--   2. set_logs          — per-set weight×reps workout logging
--   3. push_subscriptions— Web Push endpoints (PWA)
--   4. daily_checkins    — 1-tap daily mood/energy check-in
--   5. notify_on_message — trigger to auto-create a notification on new message
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. NOTIFICATIONS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,              -- 'message' | 'routine' | 'meal_plan' | 'appointment' | 'progress' | 'system'
  title      TEXT NOT NULL,
  body       TEXT,
  link       TEXT,                       -- in-app path to open
  read_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own notifications" ON notifications;
CREATE POLICY "Users read own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users update own notifications" ON notifications;
CREATE POLICY "Users update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Authenticated users may create notifications for anyone they interact with
-- (trainer ↔ client). Kept permissive on INSERT; reads are owner-only above.
DROP POLICY IF EXISTS "Authenticated can insert notifications" ON notifications;
CREATE POLICY "Authenticated can insert notifications" ON notifications
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 2. SET LOGS (per-set workout logging) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS set_logs (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exercise_id UUID NOT NULL REFERENCES routine_exercises(id) ON DELETE CASCADE,
  client_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  set_number  INTEGER NOT NULL,
  weight_kg   DECIMAL(6,2),
  reps        INTEGER,
  logged_at   DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_set_logs_client ON set_logs(client_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_set_logs_exercise ON set_logs(exercise_id, logged_at DESC);

ALTER TABLE set_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients manage own set logs" ON set_logs;
CREATE POLICY "Clients manage own set logs" ON set_logs
  FOR ALL USING (client_id = auth.uid()) WITH CHECK (client_id = auth.uid());

DROP POLICY IF EXISTS "Trainers view client set logs" ON set_logs;
CREATE POLICY "Trainers view client set logs" ON set_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM routine_exercises re
      JOIN routines r ON r.id = re.routine_id
      WHERE re.id = set_logs.exercise_id AND r.trainer_id = auth.uid()
    )
  );

-- 3. PUSH SUBSCRIPTIONS (Web Push / PWA) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint   TEXT NOT NULL UNIQUE,
  p256dh     TEXT NOT NULL,
  auth       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_push_user ON push_subscriptions(user_id);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own push subs" ON push_subscriptions;
CREATE POLICY "Users manage own push subs" ON push_subscriptions
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 4. DAILY CHECK-INS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_checkins (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  energy     INTEGER CHECK (energy BETWEEN 1 AND 5),
  mood       INTEGER CHECK (mood BETWEEN 1 AND 5),
  sleep_hours DECIMAL(3,1),
  note       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(client_id, checkin_date)
);

CREATE INDEX IF NOT EXISTS idx_checkins_client ON daily_checkins(client_id, checkin_date DESC);

ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients manage own checkins" ON daily_checkins;
CREATE POLICY "Clients manage own checkins" ON daily_checkins
  FOR ALL USING (client_id = auth.uid()) WITH CHECK (client_id = auth.uid());

DROP POLICY IF EXISTS "Trainers view client checkins" ON daily_checkins;
CREATE POLICY "Trainers view client checkins" ON daily_checkins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trainer_clients tc
      WHERE tc.client_id = daily_checkins.client_id AND tc.trainer_id = auth.uid()
    )
  );

-- 5. AUTO-NOTIFY ON NEW MESSAGE ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION notify_on_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sender_name TEXT;
  sender_role TEXT;
BEGIN
  SELECT full_name, role INTO sender_name, sender_role
  FROM profiles WHERE id = NEW.sender_id;

  INSERT INTO notifications (user_id, type, title, body, link)
  VALUES (
    NEW.receiver_id,
    'message',
    COALESCE(sender_name, 'Nuevo mensaje'),
    LEFT(NEW.content, 120),
    CASE WHEN sender_role = 'trainer' THEN '/client/messages' ELSE '/dashboard/messages' END
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_on_message ON messages;
CREATE TRIGGER trg_notify_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_message();
