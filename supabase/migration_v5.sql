-- Protocol cycles
CREATE TABLE IF NOT EXISTS protocol_cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  started_at date NOT NULL DEFAULT CURRENT_DATE,
  ended_at date,
  duration_weeks integer,
  calorie_goal integer,
  protein_goal_g numeric,
  carb_goal_g numeric,
  fat_goal_g numeric,
  weight_goal_kg numeric,
  custom_goals jsonb DEFAULT '{}',
  active_rules jsonb DEFAULT '[]',
  report jsonb,
  created_at timestamptz DEFAULT now()
);

-- Cycle templates
CREATE TABLE IF NOT EXISTS cycle_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  is_predefined boolean DEFAULT false,
  config jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Custom exercises
CREATE TABLE IF NOT EXISTS custom_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  category text,
  muscle_group text,
  created_at timestamptz DEFAULT now()
);

-- Workout sessions
CREATE TABLE IF NOT EXISTS workout_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  cycle_id uuid REFERENCES protocol_cycles,
  session_date date NOT NULL DEFAULT CURRENT_DATE,
  format text NOT NULL,
  name text,
  result text,
  rpe integer CHECK (rpe BETWEEN 1 AND 10),
  notes text,
  duration_minutes integer,
  exercises jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- Personal records
CREATE TABLE IF NOT EXISTS personal_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  exercise_name text NOT NULL,
  record_type text CHECK (record_type IN ('weight', 'time', 'reps', 'rounds')),
  value numeric NOT NULL,
  unit text,
  achieved_at date NOT NULL DEFAULT CURRENT_DATE,
  session_id uuid REFERENCES workout_sessions,
  created_at timestamptz DEFAULT now()
);

-- Workout templates
CREATE TABLE IF NOT EXISTS workout_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  format text NOT NULL,
  is_predefined boolean DEFAULT false,
  structure jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Extend profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS home_layout jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS active_modules text[] DEFAULT '{"hydration","nutrition","sleep","measurements","habits"}',
  ADD COLUMN IF NOT EXISTS age integer,
  ADD COLUMN IF NOT EXISTS sex text CHECK (sex IN ('M', 'F')),
  ADD COLUMN IF NOT EXISTS activity_level text DEFAULT 'very_active',
  ADD COLUMN IF NOT EXISTS focus_goals text[] DEFAULT '{}';

-- RLS
ALTER TABLE protocol_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycle_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cycles_own" ON protocol_cycles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "cycle_templates_own" ON cycle_templates FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "custom_exercises_own" ON custom_exercises FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "workout_sessions_own" ON workout_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "personal_records_own" ON personal_records FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "workout_templates_own" ON workout_templates FOR ALL USING (auth.uid() = user_id);
