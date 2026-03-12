-- CostSignal Portal — Initial Schema
-- Run via: supabase db push OR paste into Supabase SQL editor

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text unique not null,
  email text not null,
  created_at timestamptz default now()
);

create table if not exists api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  key_prefix text not null,
  key_hash text not null unique,
  created_at timestamptz default now(),
  last_used_at timestamptz,
  revoked_at timestamptz,
  label text default 'Default'
);

create table if not exists usage_logs (
  id bigserial primary key,
  key_prefix text not null,
  user_id uuid references users(id),
  endpoint text not null,
  series_requested text[],
  status_code int,
  response_time_ms int,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists usage_logs_user_id_idx on usage_logs(user_id);
create index if not exists usage_logs_created_at_idx on usage_logs(created_at);

-- Row Level Security
alter table users enable row level security;
alter table api_keys enable row level security;
alter table usage_logs enable row level security;

-- RLS Policies (applied via service_role from Next.js server; anon has no access)
-- Users can only read their own row
create policy "users_select_own" on users
  for select using (auth.uid()::text = clerk_user_id);

-- API keys: users can read their own
create policy "api_keys_select_own" on api_keys
  for select using (
    user_id = (select id from users where clerk_user_id = auth.uid()::text)
  );

-- Usage logs: users can read their own
create policy "usage_logs_select_own" on usage_logs
  for select using (
    user_id = (select id from users where clerk_user_id = auth.uid()::text)
  );

-- NOTE: All writes go through service_role key (server-side only).
-- Client never writes directly.
