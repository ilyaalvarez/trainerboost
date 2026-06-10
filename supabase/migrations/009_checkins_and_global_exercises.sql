-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 009 — Weekly check-ins + Global exercise catalog
--
-- Adds:
--   1. trainer_clients.checkins_enabled  — flag to enable weekly check-ins per client
--   2. weekly_checkins                   — client weekly check-in submissions
--   3. global_exercises                  — platform-wide exercise catalog (200+ exercises)
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 1. checkins_enabled column ──────────────────────────────────────────────
ALTER TABLE trainer_clients
  ADD COLUMN IF NOT EXISTS checkins_enabled BOOLEAN NOT NULL DEFAULT false;

-- ─── 2. weekly_checkins table ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS weekly_checkins (
  id                UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id         UUID         NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  trainer_id        UUID         NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_start        DATE         NOT NULL,
  energy            SMALLINT     CHECK (energy BETWEEN 1 AND 10),
  has_pain          BOOLEAN      NOT NULL DEFAULT false,
  pain_description  TEXT,
  routine_adherence SMALLINT     CHECK (routine_adherence IN (0, 25, 50, 75, 100)),
  diet_adherence    SMALLINT     CHECK (diet_adherence BETWEEN 1 AND 10),
  weight_kg         DECIMAL(5,2),
  client_note       TEXT,
  reviewed_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE(client_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_weekly_checkins_client  ON weekly_checkins(client_id);
CREATE INDEX IF NOT EXISTS idx_weekly_checkins_trainer ON weekly_checkins(trainer_id);
CREATE INDEX IF NOT EXISTS idx_weekly_checkins_week    ON weekly_checkins(week_start DESC);

ALTER TABLE weekly_checkins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients insert own weekly checkin"       ON weekly_checkins;
DROP POLICY IF EXISTS "Clients view own weekly checkins"        ON weekly_checkins;
DROP POLICY IF EXISTS "Trainers view their client checkins"     ON weekly_checkins;

CREATE POLICY "Clients insert own weekly checkin"   ON weekly_checkins
  FOR INSERT WITH CHECK (client_id = auth.uid());

CREATE POLICY "Clients view own weekly checkins"    ON weekly_checkins
  FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "Trainers view their client checkins" ON weekly_checkins
  FOR SELECT USING (trainer_id = auth.uid());

-- ─── 3. global_exercises table ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS global_exercises (
  id                UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name              TEXT         NOT NULL,
  category          TEXT,        -- pecho | espalda | piernas | hombros | biceps | triceps | core | cardio | gluteos | full_body
  muscle_group      TEXT,        -- primary muscle display name
  muscles_secondary TEXT[]       NOT NULL DEFAULT '{}',
  equipment         TEXT,        -- barra | mancuernas | maquina | bodyweight | cable | kettlebell
  difficulty        TEXT         CHECK (difficulty IN ('principiante', 'intermedio', 'avanzado')),
  description       TEXT,
  default_sets      SMALLINT,
  default_reps      TEXT,
  default_rest      SMALLINT,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_global_exercises_category   ON global_exercises(category);
CREATE INDEX IF NOT EXISTS idx_global_exercises_equipment  ON global_exercises(equipment);
CREATE INDEX IF NOT EXISTS idx_global_exercises_difficulty ON global_exercises(difficulty);

ALTER TABLE global_exercises ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read global exercises" ON global_exercises;
CREATE POLICY "Authenticated users can read global exercises" ON global_exercises
  FOR SELECT USING (auth.role() = 'authenticated');

-- ─── 4. Seed data — 210 exercises ────────────────────────────────────────────
INSERT INTO global_exercises (name, category, muscle_group, muscles_secondary, equipment, difficulty, description, default_sets, default_reps, default_rest) VALUES

-- ── PECHO ─────────────────────────────────────────────────────────────────────
('Press banca plano con barra',     'pecho', 'Pecho',   ARRAY['Tríceps','Hombros'], 'barra',        'intermedio', 'Ejercicio rey del pecho. Baja la barra hasta el esternón con codos a 75°.',                                         4, '6-10',   120),
('Press banca inclinado con barra', 'pecho', 'Pecho',   ARRAY['Hombros','Tríceps'], 'barra',        'intermedio', 'Banco a 30-45°. Activa más el pecho superior y la cabeza clavicular del pectoral.',                                4, '8-12',   90),
('Press banca declinado con barra', 'pecho', 'Pecho',   ARRAY['Tríceps'],           'barra',        'intermedio', 'Banco con ligera declinación. Enfatiza la porción inferior del pectoral.',                                          3, '8-12',   90),
('Press banca plano con mancuernas','pecho', 'Pecho',   ARRAY['Tríceps','Hombros'], 'mancuernas',   'principiante','Mayor rango de movimiento que con barra. Lleva las mancuernas a la altura del pecho.',                            4, '8-12',   90),
('Press banca inclinado mancuernas','pecho', 'Pecho',   ARRAY['Hombros'],           'mancuernas',   'principiante','Banco a 30-45°. Muy efectivo para el pecho superior.',                                                            3, '10-12',  90),
('Aperturas planas con mancuernas', 'pecho', 'Pecho',   ARRAY['Hombros'],           'mancuernas',   'principiante','Movimiento de abrazo controlado. Codos ligeramente flexionados en todo momento.',                                3, '12-15',  60),
('Aperturas inclinadas mancuernas', 'pecho', 'Pecho',   ARRAY['Hombros'],           'mancuernas',   'principiante','Banco a 30°. Mayor énfasis en la cabeza clavicular del pectoral.',                                                3, '12-15',  60),
('Crossover con cable bajo',        'pecho', 'Pecho',   ARRAY['Tríceps'],           'cable',        'principiante','Cable desde polea baja. Activa la porción superior del pectoral.',                                                3, '12-15',  60),
('Crossover con cable alto',        'pecho', 'Pecho',   ARRAY['Tríceps'],           'cable',        'principiante','Cable desde polea alta. Activa la porción inferior del pectoral.',                                                3, '12-15',  60),
('Fondos en paralelas (pecho)',     'pecho', 'Pecho',   ARRAY['Tríceps','Hombros'], 'bodyweight',   'intermedio', 'Inclínate hacia delante para enfatizar el pecho. Bajar hasta 90° de flexión.',                                     4, '8-15',   90),
('Flexiones',                       'pecho', 'Pecho',   ARRAY['Tríceps','Core'],    'bodyweight',   'principiante','Manos a la anchura de los hombros. Cuerpo recto como una tabla.',                                                 3, '15-20',  60),
('Flexiones declinadas',            'pecho', 'Pecho',   ARRAY['Hombros','Tríceps'], 'bodyweight',   'principiante','Pies elevados. Mayor activación del pecho superior.',                                                              3, '12-15',  60),
('Flexiones diamante',              'pecho', 'Tríceps', ARRAY['Pecho'],             'bodyweight',   'intermedio', 'Manos formando un diamante. Mayor activación del tríceps.',                                                         3, '12-15',  60),
('Press en máquina pecho',          'pecho', 'Pecho',   ARRAY['Tríceps'],           'maquina',      'principiante','Ideal para principiantes. Trayectoria guiada y segura.',                                                           3, '12-15',  60),
('Pec deck (mariposa)',             'pecho', 'Pecho',   ARRAY[]::TEXT[],                    'maquina',      'principiante','Aislamiento total del pectoral. No rotes las muñecas.',                                                            3, '12-15',  60),
('Press con kettlebell plano',      'pecho', 'Pecho',   ARRAY['Hombros','Core'],    'kettlebell',   'intermedio', 'El agarre neutro reduce la tensión en el hombro.',                                                                  3, '10-12',  90),
('Aperturas en cable cruzado',      'pecho', 'Pecho',   ARRAY['Hombros'],           'cable',        'principiante','Tensión constante a lo largo del movimiento completo.',                                                            3, '12-15',  60),
('Press banca agarre cerrado',      'pecho', 'Tríceps', ARRAY['Pecho'],             'barra',        'intermedio', 'Manos a la anchura de los hombros. Gran activador del tríceps lateral.',                                           4, '8-12',   90),
('Pullover con mancuerna',          'pecho', 'Pecho',   ARRAY['Espalda','Tríceps'], 'mancuernas',   'intermedio', 'Expansión de la caja torácica. Mantén los codos semiflexionados.',                                                  3, '12-15',  60),
('Svend press',                     'pecho', 'Pecho',   ARRAY[]::TEXT[],                    'mancuernas',   'principiante','Comprime dos discos o mancuernas juntos mientras extiendes los brazos.',                                           3, '12-15',  45),

-- ── ESPALDA ───────────────────────────────────────────────────────────────────
('Dominadas agarre prono',          'espalda','Espalda', ARRAY['Bíceps','Core'],     'bodyweight',  'avanzado',   'El ejercicio de espalda más completo. Agarre más amplio que los hombros.',                                          4, '5-10',   120),
('Dominadas agarre supino',         'espalda','Espalda', ARRAY['Bíceps'],            'bodyweight',  'avanzado',   'Mayor activación del bíceps. Palmas mirando hacia ti.',                                                              4, '6-10',   120),
('Jalón al pecho con polea',        'espalda','Espalda', ARRAY['Bíceps'],            'cable',       'principiante','Agarre prono. Lleva la barra hasta la clavícula manteniendo la espalda recta.',                                    4, '10-12',  90),
('Jalón al pecho agarre estrecho',  'espalda','Espalda', ARRAY['Bíceps'],            'cable',       'principiante','Agarre supino o neutro. Activa más el dorsal inferior.',                                                           3, '10-12',  90),
('Remo con barra',                  'espalda','Espalda', ARRAY['Bíceps','Trapecios'],'barra',       'intermedio', 'Torso a 45° o paralelo al suelo. Lleva la barra al ombligo o al esternón.',                                        4, '6-10',   120),
('Remo con mancuerna a 1 brazo',    'espalda','Espalda', ARRAY['Bíceps','Core'],     'mancuernas',  'principiante','Apoya la rodilla y la mano en el banco. Lleva la mancuerna a la cadera.',                                          4, '10-12',  90),
('Remo en polea baja',              'espalda','Espalda', ARRAY['Bíceps','Trapecios'],'cable',       'principiante','Espalda erguida. Lleva el mango al ombligo sin redondear lumbar.',                                                 4, '10-12',  90),
('Remo en máquina',                 'espalda','Espalda', ARRAY['Bíceps'],            'maquina',     'principiante','Pecho apoyado. Trayectoria guiada ideal para trabajar en aislamiento.',                                            3, '12-15',  60),
('Remo con barra en T',             'espalda','Espalda', ARRAY['Bíceps','Trapecios'],'barra',       'intermedio', 'Agarre neutro. Gran activador del espesor de la espalda.',                                                          4, '8-12',   90),
('Peso muerto convencional',        'espalda','Espalda', ARRAY['Glúteos','Isquios','Core'],'barra', 'avanzado',   'Ejercicio multi-articular rey. Mantén la espalda neutra y empuja el suelo.',                                       4, '4-6',    180),
('Peso muerto rumano',              'espalda','Isquios', ARRAY['Glúteos','Espalda'], 'barra',       'intermedio', 'Rodillas ligeramente flexionadas. Bisagra de cadera pura.',                                                          4, '8-12',   120),
('Buenos días',                     'espalda','Espalda', ARRAY['Isquios','Glúteos'], 'barra',       'intermedio', 'Barra en trapecios. Bisagra de cadera manteniendo la espalda recta.',                                               3, '10-12',  90),
('Hiperextensiones',                'espalda','Espalda', ARRAY['Glúteos','Isquios'], 'maquina',     'principiante','Banco romano. Extiende hasta alinear el cuerpo, no hiperextiendas.',                                               3, '12-15',  60),
('Face pull con cable',             'espalda','Trapecios',ARRAY['Hombros','Manguito'],'cable',      'principiante','Polea alta. Lleva el mango a la cara separando los codos.',                                                         3, '15-20',  60),
('Encogimientos con barra',         'espalda','Trapecios',ARRAY[]::TEXT[],                   'barra',       'principiante','Encoge los hombros verticalmente. No gires el cuello.',                                                             4, '12-15',  60),
('Encogimientos con mancuernas',    'espalda','Trapecios',ARRAY[]::TEXT[],                   'mancuernas',  'principiante','Mayor rango de movimiento que con barra.',                                                                          3, '12-15',  60),
('Remo con mancuerna inclinado',    'espalda','Espalda', ARRAY['Bíceps'],            'mancuernas',  'principiante','Torso inclinado a 45°. Lleva los codos hacia atrás y arriba.',                                                     3, '12-15',  90),
('Jalón tras nuca',                 'espalda','Espalda', ARRAY['Bíceps'],            'cable',       'avanzado',   'Solo para personas con movilidad de hombro. Riesgo si se ejecuta mal.',                                             3, '10-12',  90),
('Superman en el suelo',            'espalda','Espalda', ARRAY['Glúteos'],           'bodyweight',  'principiante','Boca abajo. Levanta brazos y piernas simultáneamente 2-3 segundos.',                                               3, '12-15',  45),
('Remo con banda elástica',         'espalda','Espalda', ARRAY['Bíceps'],            'bodyweight',  'principiante','Ancla la banda. Útil para activación y calentamiento.',                                                             3, '15-20',  45),
('Dominadas asistidas',             'espalda','Espalda', ARRAY['Bíceps'],            'maquina',     'principiante','Máquina de asistencia o banda de resistencia. Para progresar hacia dominadas.',                                   3, '8-12',   90),

-- ── PIERNAS ───────────────────────────────────────────────────────────────────
('Sentadilla con barra',            'piernas','Piernas',  ARRAY['Glúteos','Core'],    'barra',       'avanzado',   'El rey del tren inferior. Desciende hasta que los muslos queden paralelos al suelo.',                              4, '5-8',    180),
('Sentadilla frontal',              'piernas','Piernas',  ARRAY['Core','Glúteos'],    'barra',       'avanzado',   'Mayor activación del cuádriceps. Requiere buena movilidad de tobillo y hombro.',                                   4, '6-8',    180),
('Sentadilla goblet',               'piernas','Piernas',  ARRAY['Core','Glúteos'],    'kettlebell',  'principiante','Mancuerna o kettlebell al pecho. Perfecta para aprender la mecánica de la sentadilla.',                          3, '12-15',  90),
('Prensa de piernas',               'piernas','Piernas',  ARRAY['Glúteos'],           'maquina',     'principiante','Pies a la anchura de caderas. Baja hasta 90° sin despegar el lumbar.',                                            4, '10-12',  90),
('Extensiones de piernas',          'piernas','Piernas',  ARRAY[]::TEXT[],                    'maquina',     'principiante','Aislamiento del cuádriceps. Mantén el pie en dorsiflexión.',                                                      3, '12-15',  60),
('Curl femoral tumbado',            'piernas','Isquios',  ARRAY[]::TEXT[],                    'maquina',     'principiante','Aislamiento del bíceps femoral. No levantes las caderas.',                                                         3, '12-15',  60),
('Curl femoral sentado',            'piernas','Isquios',  ARRAY[]::TEXT[],                    'maquina',     'principiante','Activa el bíceps femoral con mayor longitud muscular.',                                                             3, '12-15',  60),
('Zancadas con mancuernas',         'piernas','Piernas',  ARRAY['Glúteos','Core'],    'mancuernas',  'principiante','Paso largo, rodilla trasera a 2-3 cm del suelo. Torso erguido.',                                                  3, '10-12',  90),
('Zancadas con barra',              'piernas','Piernas',  ARRAY['Glúteos','Core'],    'barra',       'intermedio', 'Mayor carga. Mantén el torso erguido y el core activo.',                                                            4, '8-10',   90),
('Zancadas caminando',              'piernas','Piernas',  ARRAY['Glúteos','Core'],    'mancuernas',  'principiante','Desplazamiento hacia delante. Trabaja el equilibrio además de la fuerza.',                                        3, '10-12',  90),
('Sentadilla búlgara',              'piernas','Piernas',  ARRAY['Glúteos','Core'],    'mancuernas',  'intermedio', 'Pie trasero en banco. Gran activador del cuádriceps y glúteo.',                                                     4, '8-10',   90),
('Peso muerto sumo',                'piernas','Isquios',  ARRAY['Glúteos','Espalda'], 'barra',       'intermedio', 'Pies separados, punta de pies hacia afuera. Mayor activación del aductor.',                                        4, '6-8',    150),
('Hip thrust con barra',            'piernas','Glúteos',  ARRAY['Isquios','Core'],    'barra',       'intermedio', 'Hombros apoyados en banco. Empuje de caderas hasta la extensión completa.',                                         4, '10-12',  90),
('Elevaciones de talones de pie',   'piernas','Gemelos',  ARRAY[]::TEXT[],                    'maquina',     'principiante','Rango completo. Pausa de 1 segundo en la parte alta.',                                                             4, '15-20',  45),
('Elevaciones de talones sentado',  'piernas','Sóleo',    ARRAY['Gemelos'],           'maquina',     'principiante','Trabaja el sóleo más que el gastrocnemio. Rodillas a 90°.',                                                       4, '15-20',  45),
('Sentadilla hack',                 'piernas','Piernas',  ARRAY['Glúteos'],           'maquina',     'principiante','Posición de pies alta activa más el glúteo, baja activa más el cuádriceps.',                                      4, '10-12',  90),
('Step-up con mancuernas',          'piernas','Piernas',  ARRAY['Glúteos','Core'],    'mancuernas',  'principiante','Sube y baja controlado. Empuja desde el talón.',                                                                   3, '12-15',  60),
('Sentadilla sumo con mancuerna',   'piernas','Isquios',  ARRAY['Glúteos','Aductores'],'mancuernas', 'principiante','Una sola mancuerna entre las piernas. Gran activador de aductores.',                                              3, '12-15',  60),
('Patada trasera en cable',         'piernas','Glúteos',  ARRAY['Isquios'],           'cable',       'principiante','Polea baja. Mantén el core activo. Extensión controlada de cadera.',                                              3, '15-20',  45),
('Abducción de cadera en máquina',  'piernas','Glúteos',  ARRAY['Aductores'],         'maquina',     'principiante','Trabaja glúteo medio y tensor de la fascia lata.',                                                                 3, '15-20',  45),
('Aducción de cadera en máquina',   'piernas','Aductores',ARRAY[]::TEXT[],                    'maquina',     'principiante','Trabaja los músculos aductores de la cadera.',                                                                    3, '15-20',  45),
('Nordic curl',                     'piernas','Isquios',  ARRAY[]::TEXT[],                    'bodyweight',  'avanzado',   'Desciende controlado hacia el suelo. Muy efectivo para prevenir lesiones de isquios.',                             3, '5-8',    120),

-- ── GLUTEOS ───────────────────────────────────────────────────────────────────
('Hip thrust con mancuerna',        'gluteos','Glúteos',  ARRAY['Isquios'],           'mancuernas',  'principiante','Versión accesible del hip thrust. Hombros en banco, mancuerna en cadera.',                                       3, '12-15',  60),
('Puente de glúteos',               'gluteos','Glúteos',  ARRAY['Isquios'],           'bodyweight',  'principiante','Tumbado boca arriba. Empuje de caderas manteniendo la posición 1-2 segundos.',                                   3, '15-20',  45),
('Patada trasera con cable',        'gluteos','Glúteos',  ARRAY['Isquios'],           'cable',       'principiante','Extensión de cadera en polea baja. Mantén el core estable.',                                                     3, '15-20',  45),
('Clamshell con banda',             'gluteos','Glúteos',  ARRAY['Aductores'],         'bodyweight',  'principiante','Tumbado de lado con banda. Abre y cierra la cadera como una almeja.',                                             3, '15-20',  45),
('Sentadilla con banda lateral',    'gluteos','Glúteos',  ARRAY['Piernas'],           'bodyweight',  'principiante','Banda por encima de las rodillas. Activa el glúteo medio durante la sentadilla.',                                 3, '15-20',  45),
('Patada lateral en cable',         'gluteos','Glúteos',  ARRAY['Aductores'],         'cable',       'principiante','Abducción de cadera en polea baja. Activa glúteo medio y mayor.',                                                 3, '15-20',  45),
('Hip thrust a una pierna',         'gluteos','Glúteos',  ARRAY['Isquios','Core'],    'bodyweight',  'intermedio', 'Progresión del hip thrust. Mayor trabajo de estabilización de cadera.',                                            3, '10-12',  60),
('Reverse lunge con barra',         'gluteos','Glúteos',  ARRAY['Piernas','Core'],    'barra',       'intermedio', 'Zancada hacia atrás. Mayor énfasis en glúteo que la zancada adelante.',                                            4, '10-12',  90),
('Sentadilla con cajón (box squat)','gluteos','Glúteos',  ARRAY['Piernas'],           'barra',       'intermedio', 'Siéntate sobre el cajón y levanta. Enseña a empujar desde los talones.',                                           4, '6-8',    120),
('Good morning rumano',             'gluteos','Glúteos',  ARRAY['Isquios','Espalda'], 'barra',       'intermedio', 'Mayor flexión de cadera que el buenos días tradicional.',                                                           3, '10-12',  90),
('Cable pull through',              'gluteos','Glúteos',  ARRAY['Isquios','Core'],    'cable',       'principiante','Bisagra de cadera con cable entre las piernas. Activa glúteo y cadena posterior.',                               3, '12-15',  60),
('Frog pump',                       'gluteos','Glúteos',  ARRAY[]::TEXT[],                    'bodyweight',  'principiante','Tumbado boca arriba, plantas de pies juntas. Empuje rápido de caderas.',                                          3, '20-25',  45),
('Bulgarian split squat con barra', 'gluteos','Glúteos',  ARRAY['Piernas','Core'],    'barra',       'avanzado',   'Mayor carga que con mancuernas. Exige mucho equilibrio y estabilidad.',                                            4, '6-8',    120),
('Patada de mula con cable',        'gluteos','Glúteos',  ARRAY['Core'],              'cable',       'principiante','En cuadrupedia con polea baja. Extensión de cadera con rodilla flexionada.',                                     3, '15-20',  45),
('Abducción lateral con banda',     'gluteos','Glúteos',  ARRAY[]::TEXT[],                    'bodyweight',  'principiante','De pie con banda en tobillos. Paso lateral manteniendo la tensión.',                                              3, '15-20',  45),

-- ── HOMBROS ───────────────────────────────────────────────────────────────────
('Press militar con barra',         'hombros','Hombros',  ARRAY['Tríceps','Core'],    'barra',       'intermedio', 'De pie o sentado. Empuja la barra por encima de la cabeza con las escápulas en neutro.',                           4, '6-10',   120),
('Press de hombros con mancuernas', 'hombros','Hombros',  ARRAY['Tríceps'],           'mancuernas',  'principiante','Sentado o de pie. Mayor rango de movimiento y estabilización que la barra.',                                     4, '10-12',  90),
('Elevaciones laterales',           'hombros','Hombros',  ARRAY[]::TEXT[],                    'mancuernas',  'principiante','Activa el deltoides medio. Sube hasta 90° con el codo ligeramente flexionado.',                                  4, '12-15',  60),
('Elevaciones frontales',           'hombros','Hombros',  ARRAY[]::TEXT[],                    'mancuernas',  'principiante','Activa el deltoides anterior. Alterna brazos para mayor control.',                                               3, '12-15',  60),
('Pájaro (elevaciones posteriores)','hombros','Hombros',  ARRAY['Trapecios'],         'mancuernas',  'principiante','Torso paralelo al suelo. Activa el deltoides posterior.',                                                         4, '12-15',  60),
('Press Arnold',                    'hombros','Hombros',  ARRAY['Tríceps'],           'mancuernas',  'principiante','Rotación del antebrazo durante el press. Activa los tres haces del deltoides.',                                  3, '10-12',  90),
('Elevaciones laterales en cable',  'hombros','Hombros',  ARRAY[]::TEXT[],                    'cable',       'principiante','Tensión constante. Más efectivo que con mancuernas para aislar el deltoides medio.',                             3, '12-15',  60),
('Remo al mentón',                  'hombros','Hombros',  ARRAY['Trapecios','Bíceps'],'barra',       'intermedio', 'Agarre estrecho. Sube codos por encima de las muñecas hasta la barbilla.',                                         4, '10-12',  90),
('Press de hombros en máquina',     'hombros','Hombros',  ARRAY['Tríceps'],           'maquina',     'principiante','Trayectoria guiada. Seguro para empezar con cargas altas.',                                                       3, '12-15',  60),
('Elevaciones laterales maquina',   'hombros','Hombros',  ARRAY[]::TEXT[],                    'maquina',     'principiante','Tensión constante sin perder la trayectoria correcta.',                                                           3, '12-15',  60),
('Face pull en polea',              'hombros','Hombros',  ARRAY['Trapecios','Manguito'],'cable',     'principiante','Polea alta con cuerda. Lleva a la cara separando los codos. Salud del hombro.',                                  3, '15-20',  45),
('Press empuje (push press)',       'hombros','Hombros',  ARRAY['Tríceps','Piernas'], 'barra',       'intermedio', 'Ligera flexión de rodillas e impulso para superar el punto de bloqueo.',                                           4, '5-8',    120),
('Elevaciones frontales con barra', 'hombros','Hombros',  ARRAY[]::TEXT[],                    'barra',       'intermedio', 'Barra al frente. Activa el haz anterior del deltoides y el pectoral clavicular.',                                  3, '10-12',  60),
('Press sentado con mancuernas',    'hombros','Hombros',  ARRAY['Tríceps'],           'mancuernas',  'principiante','Respaldo recto. Más estabilidad para cargar más peso.',                                                           4, '10-12',  90),
('Encogimiento de hombros con cables','hombros','Trapecios',ARRAY[]::TEXT[],                  'cable',       'principiante','Tensión constante del cable. Encoge verticalmente sin girar el cuello.',                                          3, '12-15',  60),

-- ── BICEPS ────────────────────────────────────────────────────────────────────
('Curl de bíceps con barra',        'biceps', 'Bíceps',   ARRAY['Braquial'],          'barra',       'principiante','Agarre prono. Codos pegados al cuerpo, sube la barra hasta los hombros.',                                        4, '8-12',   60),
('Curl de bíceps con mancuernas',   'biceps', 'Bíceps',   ARRAY['Braquial'],          'mancuernas',  'principiante','Alterna brazos o simultáneo. Rota el antebrazo (supinación) en la subida.',                                     4, '10-12',  60),
('Curl concentrado',                'biceps', 'Bíceps',   ARRAY[]::TEXT[],                    'mancuernas',  'principiante','Codo apoyado en la cara interna del muslo. Máximo pico del bíceps.',                                             3, '12-15',  45),
('Curl martillo',                   'biceps', 'Braquial', ARRAY['Bíceps'],            'mancuernas',  'principiante','Agarre neutro. Activa más el braquial y el braquiorradial.',                                                     4, '10-12',  60),
('Curl en polea baja',              'biceps', 'Bíceps',   ARRAY['Braquial'],          'cable',       'principiante','Tensión constante en toda la fase concéntrica y excéntrica.',                                                    3, '12-15',  60),
('Curl predicador',                 'biceps', 'Bíceps',   ARRAY[]::TEXT[],                    'barra',       'principiante','Brazo sobre el banco scott. Elimina el balanceo del torso.',                                                     3, '10-12',  60),
('Curl spider',                     'biceps', 'Bíceps',   ARRAY[]::TEXT[],                    'barra',       'intermedio', 'Pecho apoyado en banco inclinado. Mayor tensión en la parte baja del movimiento.',                                 3, '10-12',  60),
('Curl inclinado con mancuernas',   'biceps', 'Bíceps',   ARRAY['Braquial'],          'mancuernas',  'intermedio', 'Sentado en banco inclinado. Estira el bíceps al máximo en la posición baja.',                                    3, '10-12',  60),
('Curl con barra Z (EZ)',            'biceps','Bíceps',   ARRAY['Braquial'],          'barra',       'principiante','Agarre en barra EZ. Reduce la tensión en las muñecas.',                                                           4, '10-12',  60),
('Curl Zottman',                    'biceps', 'Bíceps',   ARRAY['Braquiorradial'],    'mancuernas',  'intermedio', 'Sube con agarre supino, baja con agarre prono. Trabaja toda la cadena anterior.',                                  3, '10-12',  60),
('Curl de 21s',                     'biceps', 'Bíceps',   ARRAY[]::TEXT[],                    'barra',       'principiante','7 reps bottom to mid + 7 reps mid to top + 7 completas. Alta intensidad.',                                      3, '21',     90),
('Chin-ups',                        'biceps', 'Bíceps',   ARRAY['Espalda'],           'bodyweight',  'avanzado',   'Agarre supino en barra. Activa bíceps y dorsal ancho.',                                                            4, '6-10',   120),
('Curl con kettlebell',             'biceps', 'Bíceps',   ARRAY['Core'],              'kettlebell',  'principiante','El peso del kettlebell cambia la mecánica. Buen complemento.',                                                    3, '12-15',  60),

-- ── TRICEPS ───────────────────────────────────────────────────────────────────
('Press francés con barra',         'triceps','Tríceps',  ARRAY[]::TEXT[],                    'barra',       'intermedio', 'Tumbado. Baja la barra hacia la frente con los codos fijos apuntando al techo.',                                  4, '10-12',  90),
('Press francés con mancuernas',    'triceps','Tríceps',  ARRAY[]::TEXT[],                    'mancuernas',  'principiante','Dos mancuernas. Menor estrés en las muñecas que con barra.',                                                     3, '10-12',  90),
('Extensión de tríceps en polea',   'triceps','Tríceps',  ARRAY[]::TEXT[],                    'cable',       'principiante','Polea alta con cuerda o barra. Codos pegados al cuerpo, extiende completamente.',                                4, '12-15',  60),
('Patada de tríceps',               'triceps','Tríceps',  ARRAY[]::TEXT[],                    'mancuernas',  'principiante','Torso inclinado, codo fijo. Extiende el antebrazo hacia atrás.',                                                  3, '12-15',  60),
('Fondos en banco',                 'triceps','Tríceps',  ARRAY['Hombros','Pecho'],   'bodyweight',  'principiante','Manos en banco detrás del cuerpo. Baja hasta 90° de flexión en el codo.',                                       3, '12-15',  60),
('Press agarre cerrado (tríceps)',  'triceps','Tríceps',  ARRAY['Pecho'],             'barra',       'intermedio', 'Agarre a la anchura de los hombros. Codos pegados al cuerpo.',                                                    4, '8-10',   90),
('Extensión de tríceps sobre cabeza','triceps','Tríceps', ARRAY[]::TEXT[],                    'mancuernas',  'principiante','Con una mancuerna sobre la cabeza. Trabaja la cabeza larga del tríceps.',                                        3, '12-15',  90),
('Extensión en polea con cuerda',   'triceps','Tríceps',  ARRAY[]::TEXT[],                    'cable',       'principiante','Al final del movimiento, abre la cuerda para mayor contracción.',                                                3, '12-15',  60),
('Skullcrusher con EZ',             'triceps','Tríceps',  ARRAY[]::TEXT[],                    'barra',       'intermedio', 'Baja la barra EZ hasta la frente. Mayor comodidad que con barra recta.',                                          4, '10-12',  90),
('Fondos en paralelas estrechas',   'triceps','Tríceps',  ARRAY['Pecho','Hombros'],   'bodyweight',  'avanzado',   'Torso erguido para enfatizar el tríceps. Bajar hasta 90° de flexión.',                                            4, '8-12',   90),
('Extensión con mancuerna 1 brazo', 'triceps','Tríceps',  ARRAY[]::TEXT[],                    'mancuernas',  'principiante','Sentado o de pie. Corrige desbalances entre brazos.',                                                             3, '12-15',  60),

-- ── CORE ──────────────────────────────────────────────────────────────────────
('Plancha frontal',                 'core',   'Core',     ARRAY['Hombros','Glúteos'], 'bodyweight',  'principiante','Cuerpo recto. No dejes caer las caderas ni subir el trasero.',                                                    3, '30-60s', 60),
('Plancha lateral',                 'core',   'Core',     ARRAY['Aductores'],         'bodyweight',  'principiante','Apoya el antebrazo. Cuerpo recto desde cabeza a talones.',                                                        3, '20-40s', 60),
('Crunch abdominal',                'core',   'Core',     ARRAY[]::TEXT[],                    'bodyweight',  'principiante','Contrae el abdomen. No jales el cuello con las manos.',                                                           3, '15-20',  60),
('Crunch en polea',                 'core',   'Core',     ARRAY[]::TEXT[],                    'cable',       'principiante','Polea alta con cuerda. Dobla el torso contrayendo el abdomen.',                                                   3, '15-20',  60),
('Elevación de piernas tumbado',    'core',   'Core',     ARRAY['Flexores de cadera'],'bodyweight',  'intermedio', 'Espalda plana. Sube las piernas rectas hasta los 90° sin balancear.',                                              3, '12-15',  60),
('Elevación de piernas en barra',   'core',   'Core',     ARRAY['Flexores de cadera'],'bodyweight',  'avanzado',   'Colgado de una barra. Sube las rodillas al pecho o las piernas rectas.',                                          3, '10-12',  90),
('Rueda abdominal (ab wheel)',      'core',   'Core',     ARRAY['Hombros','Espalda'], 'bodyweight',  'avanzado',   'Extiende la rueda controlando la espalda. No dejes caer los lumbares.',                                            3, '8-12',   90),
('Russian twist',                   'core',   'Core',     ARRAY['Oblicuos'],          'bodyweight',  'principiante','Sentado con torso a 45°. Rota hacia ambos lados con o sin peso.',                                                 3, '20-30',  60),
('Mountain climbers',               'core',   'Core',     ARRAY['Cardio','Hombros'],  'bodyweight',  'principiante','En posición de plancha. Alterna rodillas al pecho a ritmo controlado.',                                           3, '30-45s', 60),
('Dead bug',                        'core',   'Core',     ARRAY[]::TEXT[],                    'bodyweight',  'principiante','Tumbado boca arriba. Extiende brazo y pierna opuesta manteniendo la espalda pegada al suelo.',                   3, '10-12',  60),
('Pallof press',                    'core',   'Core',     ARRAY['Hombros'],           'cable',       'intermedio', 'Cable a la altura del pecho. Resiste la rotación mientras extiendes los brazos.',                                  3, '12-15',  60),
('Dragon flag',                     'core',   'Core',     ARRAY['Espalda'],           'bodyweight',  'avanzado',   'En banco. Mantén el cuerpo recto y baja lentamente.',                                                              3, '5-8',    120),
('Hollow body hold',                'core',   'Core',     ARRAY['Flexores de cadera'],'bodyweight',  'intermedio', 'Tumbado boca arriba. Espalda pegada al suelo, brazos y piernas elevados.',                                        3, '20-30s', 60),
('Plank con elevación de brazo',    'core',   'Core',     ARRAY['Hombros'],           'bodyweight',  'intermedio', 'Desde plancha alta. Alterna la elevación de brazos manteniendo las caderas niveladas.',                            3, '10-12',  60),
('Rotación de cadera en plancha',   'core',   'Core',     ARRAY['Oblicuos'],          'bodyweight',  'intermedio', 'Desde plancha. Rota la cadera hacia cada lado sin perder la alineación.',                                          3, '12-15',  60),
('V-up',                            'core',   'Core',     ARRAY['Flexores de cadera'],'bodyweight',  'intermedio', 'Sube brazos y piernas simultáneamente tocando los pies en el punto alto.',                                        3, '10-15',  60),
('Bicycle crunch',                  'core',   'Core',     ARRAY['Oblicuos'],          'bodyweight',  'principiante','Alterna codo con rodilla opuesta. Extiende la pierna contraria.',                                                 3, '20-30',  60),
('Plancha con peso',                'core',   'Core',     ARRAY['Glúteos'],           'mancuernas',  'intermedio', 'Disco o mancuerna sobre la espalda. Aumenta la dificultad de la plancha.',                                        3, '30-45s', 90),
('Ab rollout con barra',            'core',   'Core',     ARRAY['Hombros'],           'barra',       'avanzado',   'Barra con discos pequeños en cada extremo. Mayor inestabilidad.',                                                  3, '8-10',   120),
('Ángel de hierro',                 'core',   'Core',     ARRAY['Hombros'],           'bodyweight',  'avanzado',   'Desde plancha alta. Desliza los brazos hacia adelante y atrás.',                                                   3, '6-8',    90),

-- ── CARDIO ────────────────────────────────────────────────────────────────────
('Burpees',                         'cardio', 'Full Body',ARRAY['Core','Cardio'],     'bodyweight',  'intermedio', 'Flexión + salto. Mantén el ritmo constante. Modifica sin salto si es necesario.',                                  4, '10-15',  60),
('Saltos a la comba',               'cardio', 'Cardio',   ARRAY['Gemelos','Core'],    'bodyweight',  'principiante','Calentamiento o HIIT. Mantén los codos pegados al cuerpo.',                                                       3, '45-60s', 45),
('Box jumps',                       'cardio', 'Cardio',   ARRAY['Piernas','Glúteos'], 'bodyweight',  'intermedio', 'Aterriza suavemente con las rodillas alineadas. Baja al suelo de forma controlada.',                               4, '8-10',   90),
('Sprints en cinta',                'cardio', 'Cardio',   ARRAY['Piernas'],           'maquina',     'intermedio', '20-30s al 90% + 40-60s recuperación. Método HIIT efectivo.',                                                       6, '20-30s', 40),
('Bicicleta estática HIIT',         'cardio', 'Cardio',   ARRAY['Piernas'],           'maquina',     'principiante','Alterna 20s máxima intensidad con 40s suave. 8-10 rondas.',                                                       8, '20s',    40),
('Remo en máquina (cardio)',         'cardio','Cardio',   ARRAY['Espalda','Piernas'], 'maquina',     'principiante','Trabajo aeróbico y de fuerza. Mantén la espalda recta en todo momento.',                                          3, '4-6min', 90),
('Jumping jacks',                   'cardio', 'Cardio',   ARRAY['Hombros','Piernas'], 'bodyweight',  'principiante','Calentamiento clásico. Brazos y piernas coordinados.',                                                             3, '30-45s', 30),
('Escaladores de montaña',          'cardio', 'Cardio',   ARRAY['Core','Hombros'],    'bodyweight',  'principiante','Ritmo rápido. Mantén las caderas bajas y el core activo.',                                                        4, '30-45s', 45),
('High knees',                      'cardio', 'Cardio',   ARRAY['Core','Piernas'],    'bodyweight',  'principiante','Rodillas al pecho alternadas. Brazos activos como al correr.',                                                    4, '30-45s', 45),
('Saltos de tijera explosivos',     'cardio', 'Cardio',   ARRAY['Piernas','Glúteos'], 'bodyweight',  'intermedio', 'Alterna la posición de pies y brazos en el aire. Aterrizaje suave.',                                               4, '20-30s', 45),
('Battle ropes',                    'cardio', 'Cardio',   ARRAY['Hombros','Core'],    'bodyweight',  'intermedio', 'Ondas alternas o simultáneas. Muy efectivo para acondicionamiento.',                                               4, '30-45s', 60),
('Slam balls',                      'cardio', 'Full Body',ARRAY['Core','Hombros'],    'bodyweight',  'intermedio', 'Lanza el balón contra el suelo con toda la fuerza. Efecto psicológico liberador.',                                 4, '10-12',  60),
('Elíptica',                        'cardio', 'Cardio',   ARRAY['Piernas'],           'maquina',     'principiante','Baja impacto. Ideal para días de recuperación activa.',                                                            1, '20-30min',0),
('Caminata en inclinación',         'cardio', 'Cardio',   ARRAY['Glúteos','Piernas'], 'maquina',     'principiante','Cinta al 10-15% de inclinación a 5-6 km/h. Efectivo y de bajo impacto.',                                         1, '20-30min',0),

-- ── FULL BODY / FUNCIONAL ─────────────────────────────────────────────────────
('Peso muerto con mancuernas',      'full_body','Espalda', ARRAY['Piernas','Glúteos'],'mancuernas',  'principiante','Versión accesible del peso muerto. Ideal para aprender la bisagra de cadera.',                                   4, '10-12',  90),
('Thruster con mancuernas',         'full_body','Full Body',ARRAY['Core'],            'mancuernas',  'intermedio', 'Sentadilla + press de hombros en un movimiento fluido. Alta demanda metabólica.',                                  4, '8-10',   90),
('Turkish get-up',                  'full_body','Full Body',ARRAY['Core','Hombros'],  'kettlebell',  'avanzado',   'Ejercicio de suelo. Combinación de fuerza, movilidad y coordinación.',                                             3, '3-5',    120),
('Swing con kettlebell',            'full_body','Glúteos', ARRAY['Isquios','Core'],   'kettlebell',  'principiante','Bisagra de cadera explosiva. El impulso viene de los glúteos, no de los brazos.',                               4, '15-20',  60),
('Clean con mancuerna',             'full_body','Full Body',ARRAY['Piernas','Hombros'],'mancuernas', 'intermedio', 'Levantamiento olímpico simplificado. Potencia de piernas y caderas.',                                               4, '5-6',    120),
('Snatch con kettlebell',           'full_body','Full Body',ARRAY['Core','Hombros'],  'kettlebell',  'avanzado',   'Movimiento balístico completo. Alta coordinación y potencia.',                                                     4, '5-6',    120),
('Farmer walk',                     'full_body','Trapecios',ARRAY['Core','Antebrazos'],'mancuernas', 'principiante','Camina cargando el mayor peso posible. Excelente para la fuerza de agarre.',                                     4, '20-30m', 90),
('Deadlift con mancuernas a 1 pierna','full_body','Glúteos',ARRAY['Isquios','Core'],  'mancuernas',  'intermedio', 'Trabaja el equilibrio y la fuerza de glúteo por separado.',                                                        3, '10-12',  60),
('Box step-up con press',           'full_body','Full Body',ARRAY['Piernas','Hombros'],'mancuernas', 'principiante','Subir al cajón + press arriba. Trabajo coordinado de tren superior e inferior.',                                 3, '10-12',  60),
('Renegade row',                    'full_body','Espalda', ARRAY['Core','Bíceps'],    'mancuernas',  'avanzado',   'Plancha alta con mancuernas. Rema alternando brazos sin rotar las caderas.',                                       4, '8-10',   90),
('Man maker',                       'full_body','Full Body',ARRAY['Core'],            'mancuernas',  'avanzado',   'Plancha + remo + remo + sentadilla + press. Ejercicio metabólico total.',                                          3, '5-8',    120),
('Zercher squat',                   'full_body','Piernas', ARRAY['Core','Espalda'],   'barra',       'avanzado',   'Barra en el pliegue del codo. Exige mucho core y postura erguida.',                                               4, '6-8',    120),
('Sumo deadlift con kettlebell',    'full_body','Glúteos', ARRAY['Piernas','Espalda'],'kettlebell',  'principiante','Posición sumo con kettlebell. Accesible y muy efectivo.',                                                          4, '12-15',  90),
('Sentadilla overhead con barra',   'full_body','Hombros', ARRAY['Core','Piernas'],   'barra',       'avanzado',   'Barra sobre la cabeza. Exige movilidad extrema de hombro y tobillo.',                                             4, '4-6',    150),
('Power clean',                     'full_body','Full Body',ARRAY['Piernas','Espalda'],'barra',      'avanzado',   'Levantamiento olímpico. Alta técnica y potencia explosiva.',                                                       5, '3-4',    180),
('Sit and reach con kettlebell',    'full_body','Core',    ARRAY['Isquios'],           'kettlebell',  'principiante','Sentado con las piernas en mariposa. Extiende los brazos hacia adelante.',                                       3, '12-15',  45),
('Bear crawl',                      'full_body','Core',    ARRAY['Hombros','Piernas'], 'bodyweight',  'principiante','En cuadrupedia. Arrastra el cuerpo hacia adelante manteniendo las rodillas a 2 cm del suelo.',                  3, '20-30m', 60);
