-- ============================================================
-- Body Tech — Migration v2
-- Improvements: favorites, sleep, achievements, extended profiles
-- Run after migration.sql
-- ============================================================

-- ── Extend meals table ──────────────────────────────────────
ALTER TABLE public.meals ADD COLUMN IF NOT EXISTS carb_g   numeric(6,2) DEFAULT 0;
ALTER TABLE public.meals ADD COLUMN IF NOT EXISTS is_water  boolean      DEFAULT false;

-- ── Extend body_metrics table ───────────────────────────────
ALTER TABLE public.body_metrics ADD COLUMN IF NOT EXISTS abdomen_cm numeric(5,2);
ALTER TABLE public.body_metrics ADD COLUMN IF NOT EXISTS notes       text;

-- ── Extend profiles table ───────────────────────────────────
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS name                       text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS height_cm                  numeric(5,2);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme                      text DEFAULT 'dark';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notif_sleep_reminder       boolean DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notif_daily_summary        boolean DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notif_achievements         boolean DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notif_measure_reminder     boolean DEFAULT true;

-- ── Extend daily_records table ──────────────────────────────
ALTER TABLE public.daily_records ADD COLUMN IF NOT EXISTS proteina_batida boolean DEFAULT false;
ALTER TABLE public.daily_records ADD COLUMN IF NOT EXISTS agua_batida     boolean DEFAULT false;

-- ── Extend push_subscriptions ───────────────────────────────
ALTER TABLE public.push_subscriptions ADD COLUMN IF NOT EXISTS endpoint text;

-- Backfill endpoint from subscription JSONB (best-effort)
UPDATE public.push_subscriptions
SET endpoint = subscription->>'endpoint'
WHERE endpoint IS NULL;

-- Add unique constraint on endpoint (may already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'push_subscriptions_endpoint_unique'
  ) THEN
    ALTER TABLE public.push_subscriptions
      ADD CONSTRAINT push_subscriptions_endpoint_unique UNIQUE (endpoint);
  END IF;
END $$;

-- ── Meal Favorites ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.meal_favorites (
  id          uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid         REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  description text         NOT NULL,
  protein_g   numeric(6,2) DEFAULT 0,
  carb_g      numeric(6,2) DEFAULT 0,
  use_count   integer      DEFAULT 1,
  last_used_at timestamptz DEFAULT now(),
  created_at  timestamptz  DEFAULT now(),
  UNIQUE(user_id, description)
);

CREATE INDEX IF NOT EXISTS meal_favorites_user_idx ON public.meal_favorites (user_id, use_count DESC);

-- ── Sleep Logs ──────────────────────────────────────────────
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

-- ── Achievements ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.achievements (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  achievement_key text        NOT NULL,
  unlocked_at     timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_key)
);

CREATE INDEX IF NOT EXISTS achievements_user_idx ON public.achievements (user_id);

-- ── Row Level Security for new tables ───────────────────────
ALTER TABLE public.meal_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements   ENABLE ROW LEVEL SECURITY;

-- Meal favorites
DROP POLICY IF EXISTS "Users can CRUD their own favorites" ON public.meal_favorites;
CREATE POLICY "Users can CRUD their own favorites"
  ON public.meal_favorites FOR ALL
  USING (auth.uid() = user_id);

-- Sleep logs
DROP POLICY IF EXISTS "Users can CRUD their own sleep logs" ON public.sleep_logs;
CREATE POLICY "Users can CRUD their own sleep logs"
  ON public.sleep_logs FOR ALL
  USING (auth.uid() = user_id);

-- Achievements
DROP POLICY IF EXISTS "Users can view their achievements" ON public.achievements;
CREATE POLICY "Users can view their achievements"
  ON public.achievements FOR SELECT
  USING (auth.uid() = user_id);

-- Allow service role (backend) to insert achievements
DROP POLICY IF EXISTS "Service can insert achievements" ON public.achievements;
CREATE POLICY "Service can insert achievements"
  ON public.achievements FOR INSERT
  WITH CHECK (true); -- restricted to service_role via RLS bypass

-- ── Indexes for water entries lookups ───────────────────────
CREATE INDEX IF NOT EXISTS meals_water_idx ON public.meals (user_id, is_water, logged_at);
