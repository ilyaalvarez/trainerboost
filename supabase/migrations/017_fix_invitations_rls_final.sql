-- Fixes the conflicting 013_* migrations that left invitations RLS in a broken state.
-- 013_tighten_invite_security.sql was applied last (alphabetically after
-- 013_fix_invite_rls_auth_email.sql) and uses a subquery on auth.users which fails
-- in newer Supabase versions. This migration restores the correct auth.email() approach.
DROP POLICY IF EXISTS "Clients can read own invitation" ON public.invitations;

CREATE POLICY "Clients can read own invitation" ON public.invitations
  FOR SELECT
  USING (email = auth.email() OR trainer_id = auth.uid());
