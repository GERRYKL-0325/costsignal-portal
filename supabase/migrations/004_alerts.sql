-- CostSignal Portal — Series Alerts Table
-- Run via: supabase db push OR paste into Supabase SQL editor

create table if not exists series_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  series_slug text not null,
  series_label text not null default '',
  operator text not null check (operator in ('>', '<', '>=', '<=')),
  threshold numeric not null,
  notification_email text not null,
  enabled boolean default true,
  triggered_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists series_alerts_user_id_idx on series_alerts(user_id);
create index if not exists series_alerts_enabled_idx on series_alerts(enabled) where enabled = true;

alter table series_alerts enable row level security;

create policy "series_alerts_select_own" on series_alerts
  for select using (
    user_id = (select id from users where clerk_user_id = auth.uid()::text)
  );
