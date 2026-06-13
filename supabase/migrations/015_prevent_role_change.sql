-- Prevents authenticated users from changing their own role after account creation.
-- The profiles UPDATE RLS policy has no WITH CHECK clause, and RLS cannot compare
-- OLD vs NEW column values, so a BEFORE UPDATE trigger is the correct enforcement point.
CREATE OR REPLACE FUNCTION public.prevent_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    RAISE EXCEPTION 'role_immutable'
      USING HINT = 'Role cannot be changed after account creation',
            ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_role_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_change();
