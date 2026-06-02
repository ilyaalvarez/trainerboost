-- Latest active routine per client
-- security_invoker ensures RLS from the underlying tables is respected
CREATE OR REPLACE VIEW latest_routine_per_client
  WITH (security_invoker = true)
AS
SELECT DISTINCT ON (client_id)
  client_id,
  created_at AS latest_routine_at
FROM routines
WHERE status = 'active'
ORDER BY client_id, created_at DESC;

-- Latest progress log per client
CREATE OR REPLACE VIEW latest_progress_per_client
  WITH (security_invoker = true)
AS
SELECT DISTINCT ON (client_id)
  client_id,
  logged_at AS latest_progress_at
FROM progress_logs
ORDER BY client_id, logged_at DESC;
