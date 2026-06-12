-- 1. Enable realtime for the tables that need live updates
--    The publication had no tables, breaking all postgres_changes subscriptions.
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- 2. Add trainer-internal notes column (not exposed to clients)
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS trainer_notes TEXT;

-- 3. Allow clients to INSERT appointment requests
--    trainer_id must be their active trainer, client_id must be themselves
CREATE POLICY "Clients can request appointments" ON appointments
  FOR INSERT
  WITH CHECK (
    client_id = auth.uid()
    AND trainer_id IN (
      SELECT trainer_id FROM trainer_clients
      WHERE client_id = auth.uid() AND status = 'active'
    )
  );
