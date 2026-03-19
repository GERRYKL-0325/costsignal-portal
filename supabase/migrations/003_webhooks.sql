-- CostSignal Portal — Webhooks Table
-- Run via: supabase db push OR paste into Supabase SQL editor

create table if not exists webhooks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  url text not null,
  secret text not null,
  events text[] not null default '{}',
  label text default '',
  enabled boolean default true,
  last_triggered_at timestamptz,
  last_status_code int,
  created_at timestamptz default now()
);

create index if not exists webhooks_user_id_idx on webhooks(user_id);

alter table webhooks enable row level security;

-- Service role handles all writes; anon reads own
create policy "webhooks_select_own" on webhooks
  for select using (
    user_id = (select id from users where clerk_user_id = auth.uid()::text)
  );
