-- Migration: Create Finance Tracker Tables
-- Description: Financial accounts, categories, transactions, transfers, and budgets with RLS

-- 1. Financial Accounts
create table if not exists financial_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null default 'cash', -- 'cash', 'bank', 'ewallet', 'investment', 'other'
  initial_balance bigint not null default 0, -- IDR in integer (no floating points)
  color text,
  icon text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table financial_accounts enable row level security;

create policy "Users can view own financial accounts" on financial_accounts
  for select using (auth.uid() = user_id);
create policy "Users can insert own financial accounts" on financial_accounts
  for insert with check (auth.uid() = user_id);
create policy "Users can update own financial accounts" on financial_accounts
  for update using (auth.uid() = user_id);
create policy "Users can delete own financial accounts" on financial_accounts
  for delete using (auth.uid() = user_id);

create trigger financial_accounts_set_updated_at
  before update on financial_accounts
  for each row execute function set_updated_at();

-- 2. Financial Categories
create table if not exists financial_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null, -- 'income' or 'expense'
  icon text,
  color text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table financial_categories enable row level security;

create policy "Users can view own financial categories" on financial_categories
  for select using (auth.uid() = user_id);
create policy "Users can insert own financial categories" on financial_categories
  for insert with check (auth.uid() = user_id);
create policy "Users can update own financial categories" on financial_categories
  for update using (auth.uid() = user_id);
create policy "Users can delete own financial categories" on financial_categories
  for delete using (auth.uid() = user_id);

create trigger financial_categories_set_updated_at
  before update on financial_categories
  for each row execute function set_updated_at();

-- 3. Financial Transactions
create table if not exists financial_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  type text not null, -- 'income' or 'expense'
  amount bigint not null check (amount >= 0),
  date date not null,
  category_id uuid references financial_categories(id) on delete set null,
  account_id uuid not null references financial_accounts(id) on delete cascade,
  payment_method text,
  description text,
  receipt_url text,
  receipt_data jsonb,
  input_source text not null default 'manual', -- 'manual' or 'receipt_ocr'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table financial_transactions enable row level security;

create policy "Users can view own transactions" on financial_transactions
  for select using (auth.uid() = user_id);
create policy "Users can insert own transactions" on financial_transactions
  for insert with check (auth.uid() = user_id);
create policy "Users can update own transactions" on financial_transactions
  for update using (auth.uid() = user_id);
create policy "Users can delete own transactions" on financial_transactions
  for delete using (auth.uid() = user_id);

create index if not exists idx_financial_transactions_user_date
  on financial_transactions (user_id, date desc);

create trigger financial_transactions_set_updated_at
  before update on financial_transactions
  for each row execute function set_updated_at();

-- 4. Financial Internal Transfers
create table if not exists financial_transfers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  from_account_id uuid not null references financial_accounts(id) on delete cascade,
  to_account_id uuid not null references financial_accounts(id) on delete cascade,
  amount bigint not null check (amount > 0),
  fee bigint not null default 0 check (fee >= 0),
  transfer_date date not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table financial_transfers enable row level security;

create policy "Users can view own transfers" on financial_transfers
  for select using (auth.uid() = user_id);
create policy "Users can insert own transfers" on financial_transfers
  for insert with check (auth.uid() = user_id);
create policy "Users can update own transfers" on financial_transfers
  for update using (auth.uid() = user_id);
create policy "Users can delete own transfers" on financial_transfers
  for delete using (auth.uid() = user_id);

create trigger financial_transfers_set_updated_at
  before update on financial_transfers
  for each row execute function set_updated_at();

-- 5. Financial Budgets
create table if not exists financial_budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references financial_categories(id) on delete cascade,
  month text not null, -- format 'YYYY-MM'
  amount bigint not null check (amount > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, category_id, month)
);

alter table financial_budgets enable row level security;

create policy "Users can view own budgets" on financial_budgets
  for select using (auth.uid() = user_id);
create policy "Users can insert own budgets" on financial_budgets
  for insert with check (auth.uid() = user_id);
create policy "Users can update own budgets" on financial_budgets
  for update using (auth.uid() = user_id);
create policy "Users can delete own budgets" on financial_budgets
  for delete using (auth.uid() = user_id);

create trigger financial_budgets_set_updated_at
  before update on financial_budgets
  for each row execute function set_updated_at();
