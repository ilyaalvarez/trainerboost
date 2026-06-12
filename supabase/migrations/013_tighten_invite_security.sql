-- Elimina la política que exponía TODAS las invitaciones públicamente.
-- Con el nuevo endpoint /api/invite/accept (service_role) no se necesita
-- lectura client-side de invitaciones.
DROP POLICY IF EXISTS "Anyone can read invitations by code" ON public.invitations;

-- Los clientes autenticados pueden leer la invitación vinculada a su email,
-- solo para mostrar información del entrenador antes de aceptar.
CREATE POLICY "Clients can read own invitation" ON public.invitations
  FOR SELECT USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR trainer_id = auth.uid()
  );
