-- ============================================================
-- TRAINERBOOST — Schema inicial completo
-- ============================================================

-- PROFILES (extiende auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('trainer', 'client')),
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  phone TEXT,
  bio TEXT,
  specialties TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RELACIÓN TRAINER ↔ CLIENTE
CREATE TABLE IF NOT EXISTS trainer_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  UNIQUE(trainer_id, client_id)
);

-- INVITACIONES
CREATE TABLE IF NOT EXISTS invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(8), 'hex'),
  email TEXT,
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RUTINAS
CREATE TABLE IF NOT EXISTS routines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  frequency TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  starts_at DATE,
  ends_at DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EJERCICIOS DENTRO DE RUTINA
CREATE TABLE IF NOT EXISTS routine_exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  routine_id UUID NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sets INTEGER,
  reps TEXT,
  rest_seconds INTEGER,
  notes TEXT,
  video_url TEXT,
  order_index INTEGER NOT NULL DEFAULT 0
);

-- COMPLETADOS DE EJERCICIOS (cliente marca como hecho)
CREATE TABLE IF NOT EXISTS exercise_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exercise_id UUID NOT NULL REFERENCES routine_exercises(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  completed_at DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE(exercise_id, client_id, completed_at)
);

-- PLANES NUTRICIONALES
CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  calories_target INTEGER,
  protein_target INTEGER,
  carbs_target INTEGER,
  fat_target INTEGER,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- COMIDAS DEL PLAN
CREATE TABLE IF NOT EXISTS meals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_plan_id UUID NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  time TEXT,
  foods JSONB NOT NULL DEFAULT '[]',
  order_index INTEGER NOT NULL DEFAULT 0
);

-- REGISTRO DE PROGRESO
CREATE TABLE IF NOT EXISTS progress_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  logged_at DATE NOT NULL DEFAULT CURRENT_DATE,
  weight_kg DECIMAL(5,2),
  body_fat_pct DECIMAL(4,1),
  muscle_mass_kg DECIMAL(5,2),
  notes TEXT,
  photos TEXT[] DEFAULT '{}'
);

-- CITAS
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  type TEXT NOT NULL DEFAULT 'presencial' CHECK (type IN ('presencial', 'online', 'llamada')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'done', 'cancelled')),
  location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MENSAJERÍA
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUSCRIPCIONES (Stripe sync)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'inactive',
  plan TEXT CHECK (plan IN ('starter', 'pro', 'unlimited')),
  max_clients INTEGER DEFAULT 0,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_trainer_clients_trainer ON trainer_clients(trainer_id);
CREATE INDEX IF NOT EXISTS idx_trainer_clients_client ON trainer_clients(client_id);
CREATE INDEX IF NOT EXISTS idx_routines_trainer ON routines(trainer_id);
CREATE INDEX IF NOT EXISTS idx_routines_client ON routines(client_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_client ON meal_plans(client_id);
CREATE INDEX IF NOT EXISTS idx_progress_client ON progress_logs(client_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_trainer ON appointments(trainer_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_client ON appointments(client_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invitations_code ON invitations(code);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Trainers can view their clients profiles" ON profiles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM trainer_clients
    WHERE trainer_id = auth.uid() AND client_id = profiles.id
  ));
CREATE POLICY "Clients can view their trainer profile" ON profiles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM trainer_clients
    WHERE client_id = auth.uid() AND trainer_id = profiles.id
  ));
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- TRAINER_CLIENTS policies
CREATE POLICY "Trainers can manage their clients" ON trainer_clients
  FOR ALL USING (trainer_id = auth.uid());
CREATE POLICY "Clients can view their trainer relation" ON trainer_clients
  FOR SELECT USING (client_id = auth.uid());

-- INVITATIONS policies
CREATE POLICY "Trainers can manage invitations" ON invitations
  FOR ALL USING (trainer_id = auth.uid());
CREATE POLICY "Anyone can read invitations by code" ON invitations
  FOR SELECT USING (true);

-- ROUTINES policies
CREATE POLICY "Trainers can manage routines" ON routines
  FOR ALL USING (trainer_id = auth.uid());
CREATE POLICY "Clients can view their routines" ON routines
  FOR SELECT USING (client_id = auth.uid());

-- ROUTINE_EXERCISES policies
CREATE POLICY "Trainers can manage routine exercises" ON routine_exercises
  FOR ALL USING (
    EXISTS (SELECT 1 FROM routines WHERE id = routine_exercises.routine_id AND trainer_id = auth.uid())
  );
CREATE POLICY "Clients can view their routine exercises" ON routine_exercises
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM routines WHERE id = routine_exercises.routine_id AND client_id = auth.uid())
  );

-- EXERCISE_COMPLETIONS policies
CREATE POLICY "Clients can manage their completions" ON exercise_completions
  FOR ALL USING (client_id = auth.uid());
CREATE POLICY "Trainers can view client completions" ON exercise_completions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM routine_exercises re
      JOIN routines r ON r.id = re.routine_id
      WHERE re.id = exercise_completions.exercise_id AND r.trainer_id = auth.uid()
    )
  );

-- MEAL_PLANS policies
CREATE POLICY "Trainers can manage meal plans" ON meal_plans
  FOR ALL USING (trainer_id = auth.uid());
CREATE POLICY "Clients can view their meal plans" ON meal_plans
  FOR SELECT USING (client_id = auth.uid());

-- MEALS policies
CREATE POLICY "Trainers can manage meals" ON meals
  FOR ALL USING (
    EXISTS (SELECT 1 FROM meal_plans WHERE id = meals.meal_plan_id AND trainer_id = auth.uid())
  );
CREATE POLICY "Clients can view their meals" ON meals
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM meal_plans WHERE id = meals.meal_plan_id AND client_id = auth.uid())
  );

-- PROGRESS_LOGS policies
CREATE POLICY "Clients can manage their progress" ON progress_logs
  FOR ALL USING (client_id = auth.uid());
CREATE POLICY "Trainers can view client progress" ON progress_logs
  FOR SELECT USING (trainer_id = auth.uid());
CREATE POLICY "Trainers can insert progress for clients" ON progress_logs
  FOR INSERT WITH CHECK (trainer_id = auth.uid());

-- APPOINTMENTS policies
CREATE POLICY "Trainers can manage appointments" ON appointments
  FOR ALL USING (trainer_id = auth.uid());
CREATE POLICY "Clients can view their appointments" ON appointments
  FOR SELECT USING (client_id = auth.uid());
CREATE POLICY "Clients can update appointment status" ON appointments
  FOR UPDATE USING (client_id = auth.uid());

-- MESSAGES policies
CREATE POLICY "Users can view their messages" ON messages
  FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());
CREATE POLICY "Users can mark messages as read" ON messages
  FOR UPDATE USING (receiver_id = auth.uid());

-- SUBSCRIPTIONS policies
CREATE POLICY "Users can view their subscription" ON subscriptions
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Service role manages subscriptions" ON subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- TRIGGER: auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'role', 'trainer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- TRIGGER: update updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
