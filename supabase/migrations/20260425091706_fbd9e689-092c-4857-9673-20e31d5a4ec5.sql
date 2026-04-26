
-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  preferred_currency text not null default 'USD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Users view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), new.raw_user_meta_data->>'avatar_url');
  return new;
end; $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger profiles_updated before update on public.profiles
for each row execute procedure public.set_updated_at();

-- Transaction type
create type public.txn_type as enum ('income', 'expense');

-- Categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  icon text not null default 'circle',
  color text not null default '#10b981',
  type public.txn_type not null default 'expense',
  created_at timestamptz not null default now()
);
alter table public.categories enable row level security;
create policy "own categories" on public.categories for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Transactions
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(18,2) not null,
  currency text not null default 'USD',
  type public.txn_type not null,
  category text,
  description text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table public.transactions enable row level security;
create policy "own transactions" on public.transactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index transactions_user_date on public.transactions(user_id, occurred_at desc);

-- Goals
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  target_amount numeric(18,2) not null,
  current_amount numeric(18,2) not null default 0,
  currency text not null default 'USD',
  deadline date,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.goals enable row level security;
create policy "own goals" on public.goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger goals_updated before update on public.goals
for each row execute procedure public.set_updated_at();

-- Upcoming transactions (bills)
create table public.upcoming_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  amount numeric(18,2) not null,
  currency text not null default 'USD',
  type public.txn_type not null default 'expense',
  due_date date not null,
  icon text default 'zap',
  created_at timestamptz not null default now()
);
alter table public.upcoming_transactions enable row level security;
create policy "own upcoming" on public.upcoming_transactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
