-- ============================================================
-- 002_plans.sql
-- Add plan support, saved configs, and download history
-- Paste into Supabase SQL Editor → Run
-- ============================================================

-- Add plan to users table
alter table users add column if not exists plan text not null default 'free'
  check (plan in ('free', 'pro', 'api'));
alter table users add column if not exists plan_started_at timestamptz;

-- Saved configurations (Builder presets)
create table if not exists saved_configs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  name text not null,
  description text,
  series_slugs text[] not null,
  from_year int,
  to_year int,
  format text default 'wide',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table saved_configs enable row level security;

drop policy if exists "users_own_configs" on saved_configs;
create policy "users_own_configs" on saved_configs for all
  using (user_id = (select id from users where clerk_user_id = auth.uid()::text));

-- Download history
create table if not exists download_history (
  id bigserial primary key,
  user_id uuid references users(id) on delete cascade,
  series_slugs text[],
  format text,
  from_year int,
  to_year int,
  downloaded_at timestamptz default now()
);
alter table download_history enable row level security;

drop policy if exists "users_own_downloads" on download_history;
create policy "users_own_downloads" on download_history for all
  using (user_id = (select id from users where clerk_user_id = auth.uid()::text));

create index if not exists saved_configs_user_id_idx on saved_configs(user_id);
create index if not exists download_history_user_id_idx on download_history(user_id);
