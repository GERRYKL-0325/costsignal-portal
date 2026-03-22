-- ============================================================
-- 005_stripe.sql
-- Add Stripe billing fields to users table + profiles view
-- Paste into Supabase SQL Editor → Run
-- ============================================================

-- Add Stripe columns to users table
alter table users
  add column if not exists stripe_customer_id text unique,
  add column if not exists stripe_subscription_id text unique,
  add column if not exists stripe_subscription_status text default 'none'
    check (stripe_subscription_status in ('none','active','past_due','canceled','trialing','unpaid','incomplete','incomplete_expired','paused')),
  add column if not exists plan_updated_at timestamptz;

-- Index for webhook lookups by customer ID
create index if not exists users_stripe_customer_id_idx on users(stripe_customer_id);

-- Convenience view: profiles (maps user_id = clerk_user_id for webhook upserts)
-- The webhook uses user_id (Clerk user ID string) not the UUID primary key.
-- We expose a "profiles" alias that upserts via clerk_user_id.

-- Drop + recreate profiles view if it exists
drop view if exists profiles;
create view profiles as
  select
    clerk_user_id as user_id,
    id,
    email,
    plan,
    plan_started_at,
    plan_updated_at,
    stripe_customer_id,
    stripe_subscription_id,
    stripe_subscription_status,
    created_at
  from users;

-- Note: The webhook upserts directly to `users` table using clerk_user_id.
-- If you prefer the view approach, use an instead-of trigger or upsert to users directly.
