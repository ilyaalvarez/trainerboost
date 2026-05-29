-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 002 — Billing integrity & server-side client-limit enforcement
--
-- Apply with: supabase db push   (or paste into the Supabase SQL editor)
--
-- Adds:
--   1. stripe_events   — webhook idempotency (dedupe replayed Stripe events)
--   2. enforce_client_limit() trigger — hard server-side cap on active clients
--      per trainer, based on their subscription.max_clients. This is the
--      authoritative enforcement; the UI checks are only a fast-fail UX layer.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Idempotency table for the Stripe webhook ────────────────────────────────
CREATE TABLE IF NOT EXISTS stripe_events (
  id           TEXT PRIMARY KEY,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Only the service role (webhook) touches this table; lock it down.
ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;
-- No policies → anon/authenticated cannot read or write; service role bypasses RLS.

-- 2. Server-side client-limit enforcement ────────────────────────────────────
CREATE OR REPLACE FUNCTION enforce_client_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_active INTEGER;
  allowed_max    INTEGER;
BEGIN
  -- Only count toward the limit when adding/activating an active relation.
  IF (NEW.status IS DISTINCT FROM 'active') THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(max_clients, 0) INTO allowed_max
  FROM subscriptions
  WHERE user_id = NEW.trainer_id;

  IF allowed_max IS NULL THEN
    allowed_max := 0;
  END IF;

  SELECT COUNT(*) INTO current_active
  FROM trainer_clients
  WHERE trainer_id = NEW.trainer_id
    AND status = 'active'
    AND id IS DISTINCT FROM NEW.id;

  IF current_active >= allowed_max THEN
    RAISE EXCEPTION 'client_limit_reached: trainer % has reached their plan limit of % clients', NEW.trainer_id, allowed_max
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_client_limit ON trainer_clients;
CREATE TRIGGER trg_enforce_client_limit
  BEFORE INSERT OR UPDATE OF status, trainer_id ON trainer_clients
  FOR EACH ROW
  EXECUTE FUNCTION enforce_client_limit();
