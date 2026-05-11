-- ============================================================
-- Body Tech — Migration v4
-- Adds: rules system, daily scores, profiles protocol columns
-- Run after migration_v3.sql
-- ============================================================

-- ── Extend profiles with onboarding + protocol fields ───────
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_step       integer  DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fasting_start         time     DEFAULT '20:00';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fasting_end           time     DEFAULT '14:00';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS water_goal_ml         integer  DEFAULT 4000;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS protein_goal          integer  DEFAULT 160;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS weight_goal           numeric(5,2);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS goal_weight_kg        numeric(5,2);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trains                boolean  DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS training_modality     text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS training_time         time;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS training_days_per_week integer;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS active_supplements    text[]   DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notifications_enabled boolean  DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notification_preferences jsonb  DEFAULT '{}';

-- ── User Rules ───────────────────────────────────────────────
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

-- ── Daily Scores ─────────────────────────────────────────────
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

-- ── Daily Rules log ──────────────────────────────────────────
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

-- ── Expand achievements ──────────────────────────────────────
ALTER TABLE public.achievements ADD COLUMN IF NOT EXISTS is_custom        boolean DEFAULT false;
ALTER TABLE public.achievements ADD COLUMN IF NOT EXISTS custom_condition  jsonb;
ALTER TABLE public.achievements ADD COLUMN IF NOT EXISTS points           integer DEFAULT 0;
ALTER TABLE public.achievements ADD COLUMN IF NOT EXISTS progress         integer DEFAULT 0;
ALTER TABLE public.achievements ADD COLUMN IF NOT EXISTS target           integer DEFAULT 1;

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE public.user_rules   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_rules  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_rules_own"   ON public.user_rules;
DROP POLICY IF EXISTS "daily_scores_own" ON public.daily_scores;
DROP POLICY IF EXISTS "daily_rules_own"  ON public.daily_rules;

CREATE POLICY "user_rules_own"   ON public.user_rules   FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "daily_scores_own" ON public.daily_scores FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "daily_rules_own"  ON public.daily_rules  FOR ALL USING (auth.uid() = user_id);

-- Auto-update updated_at on daily_scores
DROP TRIGGER IF EXISTS daily_scores_updated_at ON public.daily_scores;
CREATE TRIGGER daily_scores_updated_at
  BEFORE UPDATE ON public.daily_scores
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
