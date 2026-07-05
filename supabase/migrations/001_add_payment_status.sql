-- Add payment_status column to track Stripe billing state
alter table public.users
  add column if not exists payment_status text default 'active',
  add column if not exists onboarded boolean default false;
