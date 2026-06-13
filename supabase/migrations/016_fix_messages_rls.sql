-- Restricts message sending to active trainer-client relationships.
-- The original "Users can send messages" policy only validated sender_id = auth.uid()
-- with no relationship check, allowing any authenticated user to message any other user.
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND (
      EXISTS (
        SELECT 1 FROM public.trainer_clients
        WHERE trainer_id = auth.uid()
          AND client_id  = messages.receiver_id
          AND status     = 'active'
      )
      OR
      EXISTS (
        SELECT 1 FROM public.trainer_clients
        WHERE client_id  = auth.uid()
          AND trainer_id = messages.receiver_id
          AND status     = 'active'
      )
    )
  );
