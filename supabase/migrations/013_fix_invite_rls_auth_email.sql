-- Fix "Clients can read own invitation" policy:
-- The previous version used a subquery on auth.users which the authenticated
-- role cannot access, causing SELECT to fail after INSERT and breaking the
-- invite code modal for trainers.
-- Replace with auth.email() which is a security-definer function.

DROP POLICY IF EXISTS "Clients can read own invitation" ON invitations;

CREATE POLICY "Clients can read own invitation" ON invitations
  FOR SELECT
  USING (email = auth.email() OR trainer_id = auth.uid());
