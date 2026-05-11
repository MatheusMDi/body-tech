-- ============================================================
-- Body Tech — Migration v3
-- Adds: user_settings (onboarding), meal photo columns
-- Run after migration_v2.sql
-- ============================================================

-- ── User Settings (onboarding data + protocol overrides) ────
CREATE TABLE IF NOT EXISTS public.user_settings (
  id                        uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   uuid         REFERENCES auth.users ON DELETE CASCADE NOT NULL UNIQUE,

  -- Profile
  name                      text,
  weight_kg                 numeric(5,2),
  height_cm                 numeric(5,2),
  goal_weight_kg            numeric(5,2),

  -- Fasting protocol
  fasting_protocol          text         DEFAULT '18:6',
  fast_start_time           time         DEFAULT '20:00',
  fast_end_time             time         DEFAULT '14:00',

  -- Daily goals
  water_goal_liters         numeric(4,2) DEFAULT 4.0,
  protein_goal_g            numeric(6,2),

  -- Training
  trains                    boolean      DEFAULT false,
  training_modality         text,
  training_time             time,
  training_days_per_week    integer,

  -- Active supplements
  active_supplements        text[]       DEFAULT '{}',

  -- Notifications
  notifications_enabled     boolean      DEFAULT true,
  notification_preferences  jsonb        DEFAULT '{}',

  -- Onboarding state
  onboarding_completed      boolean      DEFAULT false,
  onboarding_step           integer      DEFAULT 1,

  -- Appearance
  theme                     text         DEFAULT 'dark',

  created_at                timestamptz  DEFAULT now(),
  updated_at                timestamptz  DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_settings_user_idx ON public.user_settings (user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_settings_updated_at ON public.user_settings;
CREATE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ── Meal photo columns ───────────────────────────────────────
ALTER TABLE public.meals
  ADD COLUMN IF NOT EXISTS photo_url  text,
  ADD COLUMN IF NOT EXISTS photo_path text;

-- ── RLS ─────────────────────────────────────────────────────
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their own settings" ON public.user_settings;
CREATE POLICY "Users manage their own settings"
  ON public.user_settings FOR ALL
  USING (auth.uid() = user_id);

-- ── Storage bucket for meal photos ──────────────────────────
INSERT INTO storage.buckets (id, name, public)
  VALUES ('meal-photos', 'meal-photos', false)
  ON CONFLICT DO NOTHING;

DROP POLICY IF EXISTS "meal_photos_own" ON storage.objects;
CREATE POLICY "meal_photos_own"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'meal-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
