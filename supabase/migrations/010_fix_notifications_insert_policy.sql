-- Fix: notifications INSERT was too permissive (any authenticated user could insert
-- for any user_id). Replace with scoped policies:
--   1. Users can notify themselves
--   2. Trainers can notify their active clients
--   3. Clients can notify their active trainer
-- Cron/server jobs use service_role which bypasses RLS — no change needed there.

DROP POLICY IF EXISTS "Authenticated can insert notifications" ON notifications;

CREATE POLICY "Users insert own notifications" ON notifications
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Trainers insert notifications for their clients" ON notifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM trainer_clients
      WHERE trainer_id = auth.uid()
        AND client_id = notifications.user_id
        AND status = 'active'
    )
  );

CREATE POLICY "Clients insert notifications for their trainer" ON notifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM trainer_clients
      WHERE client_id = auth.uid()
        AND trainer_id = notifications.user_id
        AND status = 'active'
    )
  );
