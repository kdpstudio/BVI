-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  country text check (country in ('UK', 'US', 'CA')) default 'UK',
  currency text check (currency in ('GBP', 'USD', 'CAD')) default 'GBP',
  city text default 'London',
  business_name text,
  business_type text,
  tier text check (tier in ('free', 'solo', 'studio', 'agency')) default 'free',
  billing_cycle text check (billing_cycle in ('monthly', 'annual', 'lifetime')) default 'monthly',
  stripe_customer_id text,
  stripe_subscription_id text,
  payment_status text default 'active',
  onboarded boolean default false,
  created_at timestamptz default now()
);

-- Transactions table
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  date date not null,
  description text not null,
  amount decimal(12,2) not null,
  currency text not null default 'GBP',
  amount_gbp decimal(12,2),
  category text,
  type text check (type in ('income', 'expense')) not null,
  is_flagged boolean default false,
  finn_note text,
  created_at timestamptz default now()
);

-- Agent logs table
create table public.agent_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  agent text check (agent in ('FINN', 'SAGE', 'ARIA', 'MAX', 'REX')) not null,
  action text not null,
  result text,
  created_at timestamptz default now()
);

-- Agent chats table
create table public.agent_chats (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  agent text check (agent in ('FINN', 'SAGE', 'ARIA', 'MAX', 'REX')) not null,
  role text check (role in ('user', 'assistant')) not null,
  content text not null,
  created_at timestamptz default now()
);

-- Reports table
create table public.reports (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  type text check (type in ('pl', 'tax', 'health', 'growth')) not null,
  period text not null,
  data jsonb default '{}',
  created_at timestamptz default now()
);

-- Daily briefs table
create table public.daily_briefs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  date date not null,
  weather jsonb default '{}',
  news jsonb default '[]',
  aria_brief text,
  health_score decimal(3,1) default 0,
  created_at timestamptz default now(),
  unique(user_id, date)
);

-- Row Level Security
alter table public.users enable row level security;
alter table public.transactions enable row level security;
alter table public.agent_logs enable row level security;
alter table public.agent_chats enable row level security;
alter table public.reports enable row level security;
alter table public.daily_briefs enable row level security;

-- RLS Policies
create policy "Users can view own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.users for insert with check (auth.uid() = id);

create policy "Users can view own transactions" on public.transactions for select using (auth.uid() = user_id);
create policy "Users can insert own transactions" on public.transactions for insert with check (auth.uid() = user_id);
create policy "Users can update own transactions" on public.transactions for update using (auth.uid() = user_id);
create policy "Users can delete own transactions" on public.transactions for delete using (auth.uid() = user_id);

create policy "Users can view own agent logs" on public.agent_logs for select using (auth.uid() = user_id);
create policy "Users can insert own agent logs" on public.agent_logs for insert with check (auth.uid() = user_id);

create policy "Users can view own chats" on public.agent_chats for select using (auth.uid() = user_id);
create policy "Users can insert own chats" on public.agent_chats for insert with check (auth.uid() = user_id);

create policy "Users can view own reports" on public.reports for select using (auth.uid() = user_id);
create policy "Users can insert own reports" on public.reports for insert with check (auth.uid() = user_id);

create policy "Users can view own briefs" on public.daily_briefs for select using (auth.uid() = user_id);
create policy "Users can insert own briefs" on public.daily_briefs for insert with check (auth.uid() = user_id);
create policy "Users can update own briefs" on public.daily_briefs for update using (auth.uid() = user_id);

-- Indexes
create index transactions_user_id_idx on public.transactions(user_id);
create index transactions_date_idx on public.transactions(date);
create index agent_logs_user_id_idx on public.agent_logs(user_id);
create index agent_chats_user_id_agent_idx on public.agent_chats(user_id, agent);
create index daily_briefs_user_date_idx on public.daily_briefs(user_id, date);

-- Trigger: auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
