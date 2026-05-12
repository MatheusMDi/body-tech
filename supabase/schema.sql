-- ============================================================
-- Body Tech — Schema completo (único arquivo, idempotente)
-- Execute este arquivo em uma instância limpa OU sobre
-- um banco existente — todos os statements usam IF NOT EXISTS
-- e DROP POLICY IF EXISTS para não quebrar re-execuções.
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Função auxiliar: atualiza updated_at automaticamente
-- ============================================================
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================
-- PROFILES
-- Central de configurações do usuário.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id                        uuid         PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,

  -- Identidade
  name                      text,
  height_cm                 numeric(5,2),
  age                       integer,
  sex                       text         CHECK (sex IN ('M', 'F')),

  -- Peso
  weight_goal               numeric(5,2),
  goal_weight_kg            numeric(5,2),

  -- Jejum
  fasting_protocol          text         DEFAULT '18:6',
  fasting_start             time         DEFAULT '20:00',
  fasting_end               time         DEFAULT '14:00',

  -- Metas diárias
  protein_goal              integer      DEFAULT 160,
  water_goal_ml             integer      DEFAULT 4000,

  -- Treino
  trains                    boolean      DEFAULT false,
  training_modality         text,
  training_time             time,
  training_days_per_week    integer,

  -- Suplementos e notificações
  active_supplements        text[]       DEFAULT '{}',
  notifications_enabled     boolean      DEFAULT true,
  notification_preferences  jsonb        DEFAULT '{}',

  -- Onboarding
  onboarding_completed      boolean      DEFAULT false,
  onboarding_step           integer      DEFAULT 1,
  focus_goals               text[]       DEFAULT '{}',

  -- Módulos e layout
  active_modules            text[]       DEFAULT '{"hydration","nutrition","sleep","measurements","habits"}',
  home_layout               jsonb        DEFAULT '[]',

  -- Ciclos e nutrição
  activity_level            text         DEFAULT 'very_active',

  -- Aparência
  theme                     text         DEFAULT 'dark',

  -- Legado (mantido para compatibilidade)
  workout_hour              integer      DEFAULT 18,

  created_at                timestamptz  DEFAULT now()
);

-- Trigger: cria perfil vazio ao criar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- MEALS
-- Refeições e registros de água (is_water = true).
-- ============================================================
CREATE TABLE IF NOT EXISTS public.meals (
  id                uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid         REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  description       text         NOT NULL,
  protein_g         numeric(6,2) NOT NULL DEFAULT 0,
  carb_g            numeric(6,2) DEFAULT 0,
  water_ml          integer      NOT NULL DEFAULT 0,
  is_water          boolean      DEFAULT false,
  is_outside_window boolean      NOT NULL DEFAULT false,
  photo_url         text,
  photo_path        text,
  logged_at         timestamptz  NOT NULL DEFAULT now(),
  created_at        timestamptz  DEFAULT now()
);

CREATE INDEX IF NOT EXISTS meals_user_logged_idx ON public.meals (user_id, logged_at);
CREATE INDEX IF NOT EXISTS meals_water_idx        ON public.meals (user_id, is_water, logged_at);

-- ============================================================
-- MEAL FLAGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.meal_flags (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id    uuid        REFERENCES public.meals ON DELETE CASCADE NOT NULL,
  flag       text        NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS meal_flags_meal_idx ON public.meal_flags (meal_id);
CREATE INDEX IF NOT EXISTS meal_flags_flag_idx  ON public.meal_flags (flag);

-- ============================================================
-- MEAL FAVORITES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.meal_favorites (
  id           uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid         REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  description  text         NOT NULL,
  protein_g    numeric(6,2) DEFAULT 0,
  carb_g       numeric(6,2) DEFAULT 0,
  use_count    integer      DEFAULT 1,
  last_used_at timestamptz  DEFAULT now(),
  created_at   timestamptz  DEFAULT now(),
  UNIQUE(user_id, description)
);

CREATE INDEX IF NOT EXISTS meal_favorites_user_idx ON public.meal_favorites (user_id, use_count DESC);

-- ============================================================
-- DAILY RECORDS
-- Registro diário consolidado por usuário.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.daily_records (
  id               uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid         REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  date             date         NOT NULL,
  fast_complete    boolean      NOT NULL DEFAULT false,
  fast_hours       numeric(4,2) NOT NULL DEFAULT 0,
  total_protein_g  numeric(6,2) NOT NULL DEFAULT 0,
  total_water_ml   integer      NOT NULL DEFAULT 0,
  proteina_batida  boolean      NOT NULL DEFAULT false,
  agua_batida      boolean      NOT NULL DEFAULT false,
  treino_feito     boolean      NOT NULL DEFAULT false,
  caminhada_feita  boolean      NOT NULL DEFAULT false,
  flags            jsonb        NOT NULL DEFAULT '[]',
  created_at       timestamptz  DEFAULT now(),
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS daily_records_user_date_idx ON public.daily_records (user_id, date);

-- ============================================================
-- BODY METRICS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.body_metrics (
  id          uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid         REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  measured_at date         NOT NULL,
  weight_kg   numeric(5,2),
  waist_cm    numeric(5,2),
  abdomen_cm  numeric(5,2),
  notes       text,
  created_at  timestamptz  DEFAULT now(),
  UNIQUE(user_id, measured_at)
);

CREATE INDEX IF NOT EXISTS body_metrics_user_idx ON public.body_metrics (user_id, measured_at);

-- ============================================================
-- SLEEP LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sleep_logs (
  id          uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid         REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  log_date    date         NOT NULL,
  hours_slept numeric(4,1) NOT NULL,
  quality     integer      CHECK (quality BETWEEN 1 AND 5),
  notes       text,
  created_at  timestamptz  DEFAULT now(),
  UNIQUE(user_id, log_date)
);

CREATE INDEX IF NOT EXISTS sleep_logs_user_idx ON public.sleep_logs (user_id, log_date DESC);

-- ============================================================
-- PUSH SUBSCRIPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  subscription jsonb       NOT NULL,
  endpoint     text        NOT NULL,
  created_at   timestamptz DEFAULT now(),
  UNIQUE(endpoint)
);

CREATE INDEX IF NOT EXISTS push_subs_user_idx ON public.push_subscriptions (user_id);

-- ============================================================
-- ACHIEVEMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.achievements (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid        REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  achievement_key   text        NOT NULL,
  is_custom         boolean     DEFAULT false,
  custom_condition  jsonb,
  points            integer     DEFAULT 0,
  progress          integer     DEFAULT 0,
  target            integer     DEFAULT 1,
  unlocked_at       timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_key)
);

CREATE INDEX IF NOT EXISTS achievements_user_idx ON public.achievements (user_id);

-- ============================================================
-- USER RULES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_rules (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid        REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name              text        NOT NULL,
  emoji             text        DEFAULT '🚫',
  type              text        CHECK (type IN ('restriction', 'habit', 'bonus')) NOT NULL DEFAULT 'restriction',
  is_predefined     boolean     DEFAULT false,
  predefined_key    text,
  points_on_success integer     DEFAULT 5,
  points_on_failure integer     DEFAULT 5,
  is_active         boolean     DEFAULT true,
  sort_order        integer     DEFAULT 0,
  created_at        timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_rules_user_idx ON public.user_rules (user_id, is_active);

-- ============================================================
-- DAILY SCORES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.daily_scores (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  score_date      date        NOT NULL,
  base_score      integer     DEFAULT 100,
  bonus_points    integer     DEFAULT 0,
  penalty_points  integer     DEFAULT 0,
  final_score     integer     DEFAULT 100,
  breakdown       jsonb       DEFAULT '{}',
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  UNIQUE(user_id, score_date)
);

CREATE INDEX IF NOT EXISTS daily_scores_user_idx ON public.daily_scores (user_id, score_date DESC);

DROP TRIGGER IF EXISTS daily_scores_updated_at ON public.daily_scores;
CREATE TRIGGER daily_scores_updated_at
  BEFORE UPDATE ON public.daily_scores
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============================================================
-- DAILY RULES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.daily_rules (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  rule_id         uuid        REFERENCES public.user_rules ON DELETE CASCADE NOT NULL,
  rule_date       date        NOT NULL,
  status          text        CHECK (status IN ('completed', 'failed', 'skipped')) NOT NULL,
  points_applied  integer     DEFAULT 0,
  created_at      timestamptz DEFAULT now(),
  UNIQUE(user_id, rule_id, rule_date)
);

CREATE INDEX IF NOT EXISTS daily_rules_user_idx ON public.daily_rules (user_id, rule_date DESC);

-- ============================================================
-- PROTOCOL CYCLES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.protocol_cycles (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name            text        NOT NULL,
  type            text        NOT NULL,
  status          text        DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  started_at      date        NOT NULL DEFAULT CURRENT_DATE,
  ended_at        date,
  duration_weeks  integer,
  calorie_goal    integer,
  protein_goal_g  numeric,
  carb_goal_g     numeric,
  fat_goal_g      numeric,
  weight_goal_kg  numeric,
  custom_goals    jsonb       DEFAULT '{}',
  active_rules    jsonb       DEFAULT '[]',
  report          jsonb,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS protocol_cycles_user_idx ON public.protocol_cycles (user_id, status);

-- ============================================================
-- CYCLE TEMPLATES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cycle_templates (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name          text        NOT NULL,
  type          text        NOT NULL,
  is_predefined boolean     DEFAULT false,
  config        jsonb       NOT NULL,
  created_at    timestamptz DEFAULT now()
);

-- ============================================================
-- CUSTOM EXERCISES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.custom_exercises (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name          text        NOT NULL,
  category      text,
  muscle_group  text,
  created_at    timestamptz DEFAULT now()
);

-- ============================================================
-- WORKOUT SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.workout_sessions (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  cycle_id         uuid        REFERENCES public.protocol_cycles ON DELETE SET NULL,
  session_date     date        NOT NULL DEFAULT CURRENT_DATE,
  format           text        NOT NULL,
  name             text,
  result           text,
  rpe              integer     CHECK (rpe BETWEEN 1 AND 10),
  notes            text,
  duration_minutes integer,
  exercises        jsonb       NOT NULL DEFAULT '[]',
  created_at       timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS workout_sessions_user_idx ON public.workout_sessions (user_id, session_date DESC);

-- ============================================================
-- PERSONAL RECORDS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.personal_records (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  exercise_name text        NOT NULL,
  record_type   text        CHECK (record_type IN ('weight', 'time', 'reps', 'rounds')),
  value         numeric     NOT NULL,
  unit          text,
  achieved_at   date        NOT NULL DEFAULT CURRENT_DATE,
  session_id    uuid        REFERENCES public.workout_sessions ON DELETE SET NULL,
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS personal_records_user_idx ON public.personal_records (user_id, exercise_name);

-- ============================================================
-- WORKOUT TEMPLATES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.workout_templates (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name          text        NOT NULL,
  format        text        NOT NULL,
  is_predefined boolean     DEFAULT false,
  structure     jsonb       NOT NULL,
  created_at    timestamptz DEFAULT now()
);

-- ============================================================
-- STORAGE — meal-photos
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
  VALUES ('meal-photos', 'meal-photos', false)
  ON CONFLICT DO NOTHING;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Habilitar RLS
ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_flags         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_favorites     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_records      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_metrics       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_logs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rules         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_scores       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_rules        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocol_cycles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycle_templates    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_exercises   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_records   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_templates  ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas antes de recriar (idempotente)
DROP POLICY IF EXISTS "Users can view their own profile"    ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_own"                        ON public.profiles;
DROP POLICY IF EXISTS "Users can CRUD their own meals"      ON public.meals;
DROP POLICY IF EXISTS "meals_own"                           ON public.meals;
DROP POLICY IF EXISTS "Users can view flags for their meals"   ON public.meal_flags;
DROP POLICY IF EXISTS "Users can insert flags for their meals" ON public.meal_flags;
DROP POLICY IF EXISTS "Users can delete flags for their meals" ON public.meal_flags;
DROP POLICY IF EXISTS "meal_flags_own"                         ON public.meal_flags;
DROP POLICY IF EXISTS "Users can CRUD their own favorites"  ON public.meal_favorites;
DROP POLICY IF EXISTS "meal_favorites_own"                  ON public.meal_favorites;
DROP POLICY IF EXISTS "Users can view their own daily records"  ON public.daily_records;
DROP POLICY IF EXISTS "Users can upsert their own daily records" ON public.daily_records;
DROP POLICY IF EXISTS "daily_records_own"                   ON public.daily_records;
DROP POLICY IF EXISTS "Users can CRUD their own metrics"    ON public.body_metrics;
DROP POLICY IF EXISTS "body_metrics_own"                    ON public.body_metrics;
DROP POLICY IF EXISTS "Users can CRUD their own sleep logs" ON public.sleep_logs;
DROP POLICY IF EXISTS "sleep_logs_own"                      ON public.sleep_logs;
DROP POLICY IF EXISTS "Users can manage their own subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "push_subscriptions_own"              ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can view their achievements"   ON public.achievements;
DROP POLICY IF EXISTS "Service can insert achievements"     ON public.achievements;
DROP POLICY IF EXISTS "achievements_own"                    ON public.achievements;
DROP POLICY IF EXISTS "user_rules_own"                      ON public.user_rules;
DROP POLICY IF EXISTS "daily_scores_own"                    ON public.daily_scores;
DROP POLICY IF EXISTS "daily_rules_own"                     ON public.daily_rules;
DROP POLICY IF EXISTS "cycles_own"                          ON public.protocol_cycles;
DROP POLICY IF EXISTS "cycle_templates_own"                 ON public.cycle_templates;
DROP POLICY IF EXISTS "custom_exercises_own"                ON public.custom_exercises;
DROP POLICY IF EXISTS "workout_sessions_own"                ON public.workout_sessions;
DROP POLICY IF EXISTS "personal_records_own"                ON public.personal_records;
DROP POLICY IF EXISTS "workout_templates_own"               ON public.workout_templates;
DROP POLICY IF EXISTS "meal_photos_own"                     ON storage.objects;

-- Criar políticas novas
CREATE POLICY "profiles_own"
  ON public.profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "meals_own"
  ON public.meals FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "meal_flags_own"
  ON public.meal_flags FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.meals m
    WHERE m.id = meal_id AND m.user_id = auth.uid()
  ));

CREATE POLICY "meal_favorites_own"
  ON public.meal_favorites FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "daily_records_own"
  ON public.daily_records FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "body_metrics_own"
  ON public.body_metrics FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "sleep_logs_own"
  ON public.sleep_logs FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "push_subscriptions_own"
  ON public.push_subscriptions FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "achievements_own"
  ON public.achievements FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "user_rules_own"
  ON public.user_rules FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "daily_scores_own"
  ON public.daily_scores FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "daily_rules_own"
  ON public.daily_rules FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "cycles_own"
  ON public.protocol_cycles FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "cycle_templates_own"
  ON public.cycle_templates FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "custom_exercises_own"
  ON public.custom_exercises FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "workout_sessions_own"
  ON public.workout_sessions FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "personal_records_own"
  ON public.personal_records FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "workout_templates_own"
  ON public.workout_templates FOR ALL
  USING (auth.uid() = user_id);

-- Storage: meal photos
CREATE POLICY "meal_photos_own"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'meal-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
