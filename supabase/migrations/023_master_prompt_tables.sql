-- ============================================================
-- Migration 023 — Tablas del Master Prompt v1.0
-- Añade: workout_templates, workout_sessions, challenges,
--        habits, habit_logs, weekly_check_ins,
--        trainer_public_profiles, achievements, client_achievements
-- ============================================================

-- ─── WORKOUT TEMPLATES ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS workout_templates (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  description      TEXT,
  category         TEXT CHECK (category IN ('fuerza','cardio','hiit','rehabilitación','funcional','flexibilidad')),
  difficulty       TEXT CHECK (difficulty IN ('principiante','intermedio','avanzado')),
  duration_minutes INTEGER,
  exercises        JSONB NOT NULL DEFAULT '[]',
  -- [{ name, sets, reps, weight_kg, rest_seconds, notes, order }]
  tags             TEXT[] DEFAULT '{}',
  times_used       INTEGER DEFAULT 0,
  is_public        BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers own workout_templates" ON workout_templates
  FOR ALL USING (trainer_id = auth.uid());

-- ─── WORKOUT SESSIONS ────────────────────────────────────────
-- Registro de sesiones realmente completadas por el cliente
CREATE TABLE IF NOT EXISTS workout_sessions (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  routine_id       UUID REFERENCES routines(id) ON DELETE SET NULL,
  client_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  trainer_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scheduled_for    TIMESTAMPTZ,
  completed_at     TIMESTAMPTZ,
  duration_minutes INTEGER,
  exercises_log    JSONB DEFAULT '[]',
  -- [{ exercise_id, name, sets: [{ reps, weight_kg, completed }], notes }]
  client_notes     TEXT,
  trainer_notes    TEXT,
  effort_level     INTEGER CHECK (effort_level BETWEEN 1 AND 10),
  status           TEXT DEFAULT 'completed' CHECK (status IN ('completed','skipped','cancelled')),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workout_sessions_client ON workout_sessions(client_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_trainer ON workout_sessions(trainer_id, completed_at DESC);

ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers own workout_sessions" ON workout_sessions
  FOR ALL USING (trainer_id = auth.uid());

CREATE POLICY "Clients see own workout_sessions" ON workout_sessions
  FOR SELECT USING (client_id = auth.uid());

-- ─── CHALLENGES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS challenges (
  id                       UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id               UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name                     TEXT NOT NULL,
  description              TEXT,
  type                     TEXT DEFAULT 'individual' CHECK (type IN ('individual','group')),
  duration_days            INTEGER NOT NULL,
  start_date               DATE,
  end_date                 DATE,
  price                    NUMERIC(10,2) DEFAULT 0,
  max_participants         INTEGER,
  workout_template_id      UUID REFERENCES workout_templates(id) ON DELETE SET NULL,
  goals                    TEXT[] DEFAULT '{}',
  cover_image_url          TEXT,
  is_active                BOOLEAN DEFAULT TRUE,
  created_at               TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_challenges_trainer ON challenges(trainer_id);

ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers own challenges" ON challenges
  FOR ALL USING (trainer_id = auth.uid());

-- ─── CHALLENGE PARTICIPANTS ───────────────────────────────────
CREATE TABLE IF NOT EXISTS challenge_participants (
  id                       UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id             UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  client_id                UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  enrolled_at              TIMESTAMPTZ DEFAULT NOW(),
  completed_at             TIMESTAMPTZ,
  progress_pct             INTEGER DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  payment_status           TEXT DEFAULT 'paid' CHECK (payment_status IN ('pending','paid','refunded')),
  UNIQUE(challenge_id, client_id)
);

ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;

-- El entrenador ve todos sus participantes
CREATE POLICY "Trainers read challenge_participants" ON challenge_participants
  FOR SELECT USING (
    challenge_id IN (SELECT id FROM challenges WHERE trainer_id = auth.uid())
  );

CREATE POLICY "Trainers update challenge_participants" ON challenge_participants
  FOR UPDATE USING (
    challenge_id IN (SELECT id FROM challenges WHERE trainer_id = auth.uid())
  );

-- El cliente ve su propia participación
CREATE POLICY "Clients see own challenge_participants" ON challenge_participants
  FOR SELECT USING (client_id = auth.uid());

-- ─── HABITS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS habits (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  icon                TEXT DEFAULT '✅',
  target_days_per_week INTEGER DEFAULT 7 CHECK (target_days_per_week BETWEEN 1 AND 7),
  reminder_time       TIME,
  is_active           BOOLEAN DEFAULT TRUE,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_habits_client ON habits(client_id, is_active);
CREATE INDEX IF NOT EXISTS idx_habits_trainer ON habits(trainer_id);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers own habits" ON habits
  FOR ALL USING (trainer_id = auth.uid());

CREATE POLICY "Clients see own habits" ON habits
  FOR SELECT USING (client_id = auth.uid());

-- ─── HABIT LOGS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS habit_logs (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id    UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  client_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed   BOOLEAN DEFAULT TRUE,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, logged_date)
);

CREATE INDEX IF NOT EXISTS idx_habit_logs_client ON habit_logs(client_id, logged_date DESC);

ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients own habit_logs" ON habit_logs
  FOR ALL USING (client_id = auth.uid());

CREATE POLICY "Trainers read habit_logs" ON habit_logs
  FOR SELECT USING (
    habit_id IN (SELECT id FROM habits WHERE trainer_id = auth.uid())
  );

-- ─── WEEKLY CHECK-INS ────────────────────────────────────────
-- Sustituye al check-in diario simple; añade las 7 preguntas del Master Prompt
CREATE TABLE IF NOT EXISTS weekly_checkins (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_start          DATE NOT NULL,
  energy_level        INTEGER CHECK (energy_level BETWEEN 1 AND 5),
  mood                INTEGER CHECK (mood BETWEEN 1 AND 5),
  sleep_hours         NUMERIC(3,1) CHECK (sleep_hours BETWEEN 0 AND 24),
  adherence_pct       INTEGER CHECK (adherence_pct BETWEEN 0 AND 100),
  biggest_win         TEXT,
  biggest_challenge   TEXT,
  questions_for_trainer TEXT,
  trainer_response    TEXT,
  photos              TEXT[] DEFAULT '{}',
  submitted_at        TIMESTAMPTZ DEFAULT NOW(),
  responded_at        TIMESTAMPTZ,
  UNIQUE(client_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_weekly_checkins_client ON weekly_checkins(client_id, week_start DESC);
CREATE INDEX IF NOT EXISTS idx_weekly_checkins_trainer ON weekly_checkins(trainer_id, submitted_at DESC);

ALTER TABLE weekly_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients own weekly_checkins" ON weekly_checkins
  FOR ALL USING (client_id = auth.uid());

CREATE POLICY "Trainers read and respond weekly_checkins" ON weekly_checkins
  FOR ALL USING (trainer_id = auth.uid());

-- ─── TRAINER PUBLIC PROFILES ─────────────────────────────────
CREATE TABLE IF NOT EXISTS trainer_public_profiles (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  slug             TEXT UNIQUE NOT NULL,
  headline         TEXT,
  about            TEXT,
  services         JSONB DEFAULT '[]',
  -- [{ name, description, price, duration, type: 'presencial'|'online' }]
  testimonials     JSONB DEFAULT '[]',
  -- [{ name, text, stars, avatar_url, verified }]
  gallery_urls     TEXT[] DEFAULT '{}',
  booking_enabled  BOOLEAN DEFAULT TRUE,
  contact_method   TEXT DEFAULT 'form' CHECK (contact_method IN ('form','whatsapp','email')),
  contact_value    TEXT,
  calendly_url     TEXT,
  social_links     JSONB DEFAULT '{}',
  -- { instagram, youtube, tiktok, web }
  seo_title        TEXT,
  seo_description  TEXT,
  is_published     BOOLEAN DEFAULT FALSE,
  views_count      INTEGER DEFAULT 0,
  leads_count      INTEGER DEFAULT 0,
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trainer_public_profiles_slug ON trainer_public_profiles(slug);

ALTER TABLE trainer_public_profiles ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede leer perfiles publicados
CREATE POLICY "Public can read published profiles" ON trainer_public_profiles
  FOR SELECT USING (is_published = TRUE);

-- El entrenador gestiona su propio perfil
CREATE POLICY "Trainers own public profile" ON trainer_public_profiles
  FOR ALL USING (trainer_id = auth.uid());

-- ─── ACHIEVEMENTS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS achievements (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key         TEXT UNIQUE NOT NULL, -- 'first_week', 'sessions_10', 'streak_30', etc.
  name        TEXT NOT NULL,
  description TEXT NOT NULL,
  icon        TEXT NOT NULL,       -- emoji o nombre de icono
  category    TEXT CHECK (category IN ('sesiones','racha','progreso','habitos','social')),
  threshold   INTEGER,             -- valor numérico para desbloquear
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Sin RLS — tabla pública de referencia
ALTER TABLE achievements DISABLE ROW LEVEL SECURITY;

-- Logros iniciales
INSERT INTO achievements (key, name, description, icon, category, threshold) VALUES
  ('first_session',  'Primera sesión',         'Completaste tu primera sesión de entrenamiento', '🏆', 'sesiones', 1),
  ('sessions_10',    '10 sesiones',             'Has completado 10 sesiones de entrenamiento',     '💪', 'sesiones', 10),
  ('sessions_50',    '50 sesiones',             'Has completado 50 sesiones de entrenamiento',     '🔥', 'sesiones', 50),
  ('sessions_100',   '100 sesiones',            '¡100 sesiones! Un auténtico campeón',             '👑', 'sesiones', 100),
  ('streak_7',       'Racha de 7 días',         'Siete días seguidos entrenando',                  '📅', 'racha',    7),
  ('streak_14',      'Racha de 14 días',        'Dos semanas sin parar. ¡Brutal!',                 '⚡', 'racha',    14),
  ('streak_30',      'Racha de 30 días',        'Un mes completo de disciplina',                   '🌟', 'racha',    30),
  ('streak_100',     'Racha de 100 días',       'La élite del entrenamiento constante',            '🦁', 'racha',    100),
  ('first_week',     'Primera semana',          'Completaste tu primera semana completa',          '🎯', 'sesiones', 1),
  ('weight_loss_3',  '-3 kg',                   'Has perdido 3 kg desde que empezaste',            '📉', 'progreso', 3),
  ('weight_loss_10', '-10 kg',                  'Has perdido 10 kg. Una transformación real',      '🎊', 'progreso', 10),
  ('habits_7',       '7 días de hábitos',       'Completaste todos tus hábitos 7 días seguidos',  '✅', 'habitos',  7),
  ('year_anniversary','1 año contigo',          'Llevas un año entrenando. ¡Imparable!',           '🎂', 'sesiones', 365)
ON CONFLICT (key) DO NOTHING;

-- ─── CLIENT ACHIEVEMENTS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS client_achievements (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_client_achievements_client ON client_achievements(client_id);

ALTER TABLE client_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients see own achievements" ON client_achievements
  FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "System inserts achievements" ON client_achievements
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ─── TRIGGERS updated_at ────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_workout_templates_updated_at'
  ) THEN
    CREATE TRIGGER update_workout_templates_updated_at
      BEFORE UPDATE ON workout_templates
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_trainer_public_profiles_updated_at'
  ) THEN
    CREATE TRIGGER update_trainer_public_profiles_updated_at
      BEFORE UPDATE ON trainer_public_profiles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;
