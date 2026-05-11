-- ============================================================
-- Body Tech — Supabase Database Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists public.profiles (
  id            uuid references auth.users on delete cascade primary key,
  fasting_start time not null default '20:00',
  fasting_end   time not null default '14:00',
  protein_goal  int  not null default 160,
  water_goal_ml int  not null default 4000,
  workout_hour  int  not null default 18,
  weight_goal   numeric(5,2)  default 91,
  created_at    timestamptz   default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- MEALS
-- ============================================================
create table if not exists public.meals (
  id                uuid         primary key default gen_random_uuid(),
  user_id           uuid         references auth.users on delete cascade not null,
  description       text         not null,
  protein_g         numeric(6,2) not null default 0,
  water_ml          int          not null default 0,
  logged_at         timestamptz  not null default now(),
  is_outside_window boolean      not null default false,
  created_at        timestamptz  default now()
);

create index if not exists meals_user_logged_idx on public.meals (user_id, logged_at);

-- ============================================================
-- MEAL FLAGS
-- ============================================================
create table if not exists public.meal_flags (
  id         uuid        primary key default gen_random_uuid(),
  meal_id    uuid        references public.meals on delete cascade not null,
  flag       text        not null,
  created_at timestamptz default now()
);

create index if not exists meal_flags_meal_idx on public.meal_flags (meal_id);
create index if not exists meal_flags_flag_idx  on public.meal_flags (flag);

-- ============================================================
-- DAILY RECORDS
-- Auto-populated by backend jobs + direct updates
-- ============================================================
create table if not exists public.daily_records (
  id               uuid         primary key default gen_random_uuid(),
  user_id          uuid         references auth.users on delete cascade not null,
  date             date         not null,
  fast_complete    boolean      not null default false,
  fast_hours       numeric(4,2) not null default 0,
  total_protein_g  numeric(6,2) not null default 0,
  total_water_ml   int          not null default 0,
  proteina_batida  boolean      not null default false,
  agua_batida      boolean      not null default false,
  treino_feito     boolean      not null default false,
  caminhada_feita  boolean      not null default false,
  flags            jsonb        not null default '[]',
  created_at       timestamptz  default now(),
  constraint daily_records_user_date_unique unique (user_id, date)
);

create index if not exists daily_records_user_date_idx on public.daily_records (user_id, date);

-- ============================================================
-- BODY METRICS
-- ============================================================
create table if not exists public.body_metrics (
  id          uuid         primary key default gen_random_uuid(),
  user_id     uuid         references auth.users on delete cascade not null,
  measured_at date         not null,
  weight_kg   numeric(5,2),
  waist_cm    numeric(5,2),
  created_at  timestamptz  default now(),
  constraint body_metrics_user_date_unique unique (user_id, measured_at)
);

create index if not exists body_metrics_user_idx on public.body_metrics (user_id, measured_at);

-- ============================================================
-- PUSH SUBSCRIPTIONS
-- ============================================================
create table if not exists public.push_subscriptions (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        references auth.users on delete cascade not null,
  subscription jsonb       not null,
  endpoint     text        not null,
  created_at   timestamptz default now(),
  constraint push_subscriptions_endpoint_unique unique (endpoint)
);

create index if not exists push_subs_user_idx on public.push_subscriptions (user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles           enable row level security;
alter table public.meals              enable row level security;
alter table public.meal_flags         enable row level security;
alter table public.daily_records      enable row level security;
alter table public.body_metrics       enable row level security;
alter table public.push_subscriptions enable row level security;

-- Profiles
create policy "Users can view their own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- Meals
create policy "Users can CRUD their own meals"
  on public.meals for all using (auth.uid() = user_id);

-- Meal flags (via meal ownership)
create policy "Users can view flags for their meals"
  on public.meal_flags for select
  using (exists (select 1 from public.meals m where m.id = meal_id and m.user_id = auth.uid()));
create policy "Users can insert flags for their meals"
  on public.meal_flags for insert
  with check (exists (select 1 from public.meals m where m.id = meal_id and m.user_id = auth.uid()));
create policy "Users can delete flags for their meals"
  on public.meal_flags for delete
  using (exists (select 1 from public.meals m where m.id = meal_id and m.user_id = auth.uid()));

-- Daily records
create policy "Users can view their own daily records"
  on public.daily_records for select using (auth.uid() = user_id);
create policy "Users can upsert their own daily records"
  on public.daily_records for all using (auth.uid() = user_id);

-- Body metrics
create policy "Users can CRUD their own metrics"
  on public.body_metrics for all using (auth.uid() = user_id);

-- Push subscriptions
create policy "Users can manage their own subscriptions"
  on public.push_subscriptions for all using (auth.uid() = user_id);
