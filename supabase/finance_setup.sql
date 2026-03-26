create extension if not exists pgcrypto;

create or replace function public.set_current_timestamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  amount numeric(12, 2) not null,
  type text not null check (type in ('income', 'expense')),
  category text not null,
  date timestamptz not null default now(),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  limit_amount numeric(12, 2) not null,
  spent numeric(12, 2) not null default 0,
  color text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saving_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  target_amount numeric(12, 2) not null,
  saved_amount numeric(12, 2) not null default 0,
  deadline timestamptz not null,
  emoji text not null,
  color text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.transactions add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.budgets add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.saving_goals add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.transactions add column if not exists created_at timestamptz not null default now();
alter table public.transactions add column if not exists updated_at timestamptz not null default now();
alter table public.budgets add column if not exists created_at timestamptz not null default now();
alter table public.budgets add column if not exists updated_at timestamptz not null default now();
alter table public.saving_goals add column if not exists created_at timestamptz not null default now();
alter table public.saving_goals add column if not exists updated_at timestamptz not null default now();

alter table public.budgets drop constraint if exists budgets_category_key;

create unique index if not exists budgets_user_category_key
  on public.budgets(user_id, category);

create index if not exists transactions_user_id_date_idx
  on public.transactions(user_id, date desc);

create index if not exists budgets_user_id_idx
  on public.budgets(user_id);

create index if not exists saving_goals_user_id_deadline_idx
  on public.saving_goals(user_id, deadline asc);

drop trigger if exists set_transactions_updated_at on public.transactions;
create trigger set_transactions_updated_at
before update on public.transactions
for each row
execute function public.set_current_timestamp_updated_at();

drop trigger if exists set_budgets_updated_at on public.budgets;
create trigger set_budgets_updated_at
before update on public.budgets
for each row
execute function public.set_current_timestamp_updated_at();

drop trigger if exists set_saving_goals_updated_at on public.saving_goals;
create trigger set_saving_goals_updated_at
before update on public.saving_goals
for each row
execute function public.set_current_timestamp_updated_at();

alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.saving_goals enable row level security;

drop policy if exists "transactions_select_own" on public.transactions;
create policy "transactions_select_own"
on public.transactions
for select
using (auth.uid() = user_id);

drop policy if exists "transactions_insert_own" on public.transactions;
create policy "transactions_insert_own"
on public.transactions
for insert
with check (auth.uid() = user_id);

drop policy if exists "transactions_update_own" on public.transactions;
create policy "transactions_update_own"
on public.transactions
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "transactions_delete_own" on public.transactions;
create policy "transactions_delete_own"
on public.transactions
for delete
using (auth.uid() = user_id);

drop policy if exists "budgets_select_own" on public.budgets;
create policy "budgets_select_own"
on public.budgets
for select
using (auth.uid() = user_id);

drop policy if exists "budgets_insert_own" on public.budgets;
create policy "budgets_insert_own"
on public.budgets
for insert
with check (auth.uid() = user_id);

drop policy if exists "budgets_update_own" on public.budgets;
create policy "budgets_update_own"
on public.budgets
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "budgets_delete_own" on public.budgets;
create policy "budgets_delete_own"
on public.budgets
for delete
using (auth.uid() = user_id);

drop policy if exists "saving_goals_select_own" on public.saving_goals;
create policy "saving_goals_select_own"
on public.saving_goals
for select
using (auth.uid() = user_id);

drop policy if exists "saving_goals_insert_own" on public.saving_goals;
create policy "saving_goals_insert_own"
on public.saving_goals
for insert
with check (auth.uid() = user_id);

drop policy if exists "saving_goals_update_own" on public.saving_goals;
create policy "saving_goals_update_own"
on public.saving_goals
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "saving_goals_delete_own" on public.saving_goals;
create policy "saving_goals_delete_own"
on public.saving_goals
for delete
using (auth.uid() = user_id);
