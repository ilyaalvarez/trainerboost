-- grant_beta_plan(email, expires_at)
-- Otorga plan Pro gratuito a un usuario por email hasta la fecha indicada.
-- Uso desde el SQL Editor de Supabase:
--   SELECT grant_beta_plan('usuario@email.com', '2026-10-31');
--
-- El trigger enforce_client_limit() usará max_clients = 30 automáticamente.

CREATE OR REPLACE FUNCTION grant_beta_plan(
  p_email     TEXT,
  p_expires   DATE DEFAULT (CURRENT_DATE + INTERVAL '90 days')
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Resolve auth.users.id from email (requires service_role context)
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = lower(trim(p_email))
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RETURN 'ERROR: usuario con email ' || p_email || ' no encontrado. ¿Ya se registró?';
  END IF;

  INSERT INTO subscriptions (
    user_id,
    status,
    plan,
    max_clients,
    current_period_end
  )
  VALUES (
    v_user_id,
    'active',
    'pro',
    30,
    p_expires::TIMESTAMPTZ + INTERVAL '23 hours 59 minutes'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    status             = 'active',
    plan               = 'pro',
    max_clients        = 30,
    current_period_end = EXCLUDED.current_period_end;

  RETURN 'OK: plan Pro concedido a ' || p_email || ' hasta ' || p_expires::TEXT;
END;
$$;

-- Solo el rol service_role puede llamar esta función (el SQL Editor de Supabase corre como service_role)
REVOKE ALL ON FUNCTION grant_beta_plan(TEXT, DATE) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION grant_beta_plan(TEXT, DATE) TO service_role;
