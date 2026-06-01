-- Contact / demo request leads from the /contact page
CREATE TABLE IF NOT EXISTS contact_requests (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL CHECK (char_length(name) <= 120),
  email      TEXT NOT NULL CHECK (char_length(email) <= 254),
  type       TEXT NOT NULL DEFAULT 'general' CHECK (type IN ('demo', 'pricing', 'support', 'general', 'other')),
  message    TEXT NOT NULL CHECK (char_length(message) <= 2000),
  resolved   BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- No RLS — public-facing form uses service role key from /api/contact
-- Admin reads via Supabase dashboard or a private admin route

CREATE INDEX IF NOT EXISTS contact_requests_created_at_idx ON contact_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS contact_requests_resolved_idx   ON contact_requests (resolved) WHERE resolved = false;
