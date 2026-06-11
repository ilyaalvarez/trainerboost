-- El trigger handle_new_user() fallaba con "relation profiles does not exist"
-- porque GoTrue ejecuta el trigger en el contexto del schema auth y sin
-- SET search_path = public no encuentra las tablas en el schema public.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'role', 'trainer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
