ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact request" ON public.contact_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
