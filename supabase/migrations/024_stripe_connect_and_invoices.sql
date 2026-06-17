-- ============================================================
-- Migration 024 — Stripe Connect + Invoices
-- Adds: stripe_connect_account_id/status to profiles,
--       invoices table for trainer→client billing
-- ============================================================

-- ─── Stripe Connect on trainer profiles ──────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'profiles'
                 AND column_name = 'stripe_connect_account_id') THEN
    ALTER TABLE profiles ADD COLUMN stripe_connect_account_id TEXT;
    ALTER TABLE profiles ADD COLUMN stripe_connect_status TEXT DEFAULT 'not_connected'
      CHECK (stripe_connect_status IN ('not_connected', 'pending', 'active', 'restricted'));
  END IF;
END $$;

-- ─── Invoices table ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id            UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_payment_link   TEXT,
  stripe_price_id       TEXT,
  stripe_product_id     TEXT,
  amount_cents          INTEGER NOT NULL CHECK (amount_cents > 0),
  currency              TEXT NOT NULL DEFAULT 'eur',
  description           TEXT NOT NULL,
  status                TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'cancelled', 'expired')),
  due_date              DATE,
  paid_at               TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_trainer ON invoices(trainer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_client  ON invoices(client_id, created_at DESC);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Trainer can manage own invoices
DROP POLICY IF EXISTS "trainer_manages_invoices" ON invoices;
CREATE POLICY "trainer_manages_invoices" ON invoices
  FOR ALL USING (trainer_id = auth.uid());

-- Client can see invoices addressed to them
DROP POLICY IF EXISTS "client_sees_own_invoices" ON invoices;
CREATE POLICY "client_sees_own_invoices" ON invoices
  FOR SELECT USING (client_id = auth.uid());

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_invoices_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_invoices_updated_at ON invoices;
CREATE TRIGGER trg_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_invoices_updated_at();
