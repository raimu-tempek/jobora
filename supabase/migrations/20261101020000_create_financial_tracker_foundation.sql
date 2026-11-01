-- Migration: Jobora Financial Tracker Foundation & Security (Phase 1)
-- Description: Financial Accounts, Categories, Transactions, Transfers, and Budgets with strict RLS, cross-tenant isolation, atomic transfer RPC, and system default categories.

-- 0. Reusable Trigger Function for updated_at timestamps
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 1. Financial Accounts Table
create table if not exists public.financial_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  type text not null default 'cash' check (type in ('cash', 'bank', 'ewallet', 'investment', 'other')),
  initial_balance bigint not null default 0 check (initial_balance >= 0),
  color text,
  icon text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger updated_at
drop trigger if exists financial_accounts_set_updated_at on public.financial_accounts;
create trigger financial_accounts_set_updated_at
  before update on public.financial_accounts
  for each row execute function public.set_updated_at();

-- Indexes for financial_accounts
create index if not exists idx_financial_accounts_user on public.financial_accounts (user_id);

-- RLS for financial_accounts
alter table public.financial_accounts enable row level security;
revoke all on public.financial_accounts from anon;
grant select, insert, update, delete on public.financial_accounts to authenticated;

drop policy if exists "Users can view own financial accounts" on public.financial_accounts;
create policy "Users can view own financial accounts" on public.financial_accounts
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own financial accounts" on public.financial_accounts;
create policy "Users can insert own financial accounts" on public.financial_accounts
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own financial accounts" on public.financial_accounts;
create policy "Users can update own financial accounts" on public.financial_accounts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can delete own financial accounts" on public.financial_accounts;
create policy "Users can delete own financial accounts" on public.financial_accounts
  for delete using (auth.uid() = user_id);


-- 2. Financial Categories Table
create table if not exists public.financial_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade, -- NULL for shared system default categories
  name text not null check (char_length(trim(name)) > 0),
  type text not null check (type in ('income', 'expense')),
  icon text,
  color text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger updated_at
drop trigger if exists financial_categories_set_updated_at on public.financial_categories;
create trigger financial_categories_set_updated_at
  before update on public.financial_categories
  for each row execute function public.set_updated_at();

-- Indexes for financial_categories
create index if not exists idx_financial_categories_user on public.financial_categories (user_id);
create index if not exists idx_financial_categories_type on public.financial_categories (type);
create unique index if not exists idx_financial_categories_sys_uniq on public.financial_categories (lower(name), type) where user_id is null;
create unique index if not exists idx_financial_categories_user_uniq on public.financial_categories (user_id, lower(name), type) where user_id is not null;

-- RLS for financial_categories
alter table public.financial_categories enable row level security;
revoke all on public.financial_categories from anon;
grant select, insert, update, delete on public.financial_categories to authenticated;

drop policy if exists "Users can view own and system categories" on public.financial_categories;
create policy "Users can view own and system categories" on public.financial_categories
  for select using (auth.uid() = user_id or user_id is null);

drop policy if exists "Users can insert own categories" on public.financial_categories;
create policy "Users can insert own categories" on public.financial_categories
  for insert with check (auth.uid() = user_id and user_id is not null);

drop policy if exists "Users can update own categories" on public.financial_categories;
create policy "Users can update own categories" on public.financial_categories
  for update using (auth.uid() = user_id and user_id is not null)
  with check (auth.uid() = user_id and user_id is not null);

drop policy if exists "Users can delete own categories" on public.financial_categories;
create policy "Users can delete own categories" on public.financial_categories
  for delete using (auth.uid() = user_id and user_id is not null);


-- 3. Financial Transactions Table
create table if not exists public.financial_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  type text not null check (type in ('income', 'expense')),
  amount bigint not null check (amount >= 0),
  date date not null,
  category_id uuid references public.financial_categories(id) on delete set null,
  account_id uuid not null references public.financial_accounts(id) on delete restrict,
  payment_method text,
  description text,
  receipt_url text,
  receipt_data jsonb,
  input_source text not null default 'manual' check (input_source in ('manual', 'receipt_ocr')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger updated_at
drop trigger if exists financial_transactions_set_updated_at on public.financial_transactions;
create trigger financial_transactions_set_updated_at
  before update on public.financial_transactions
  for each row execute function public.set_updated_at();

-- Indexes for financial_transactions
create index if not exists idx_financial_transactions_user_date on public.financial_transactions (user_id, date desc);
create index if not exists idx_financial_transactions_account on public.financial_transactions (account_id);
create index if not exists idx_financial_transactions_category on public.financial_transactions (category_id);
create index if not exists idx_financial_transactions_user_type on public.financial_transactions (user_id, type);

-- RLS for financial_transactions (With Cross-Tenant Relational Ownership Validation)
alter table public.financial_transactions enable row level security;
revoke all on public.financial_transactions from anon;
grant select, insert, update, delete on public.financial_transactions to authenticated;

drop policy if exists "Users can view own transactions" on public.financial_transactions;
create policy "Users can view own transactions" on public.financial_transactions
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own transactions" on public.financial_transactions;
create policy "Users can insert own transactions" on public.financial_transactions
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.financial_accounts a
      where a.id = account_id and a.user_id = auth.uid()
    )
    and (
      category_id is null or exists (
        select 1 from public.financial_categories c
        where c.id = category_id and (c.user_id = auth.uid() or c.user_id is null)
      )
    )
  );

drop policy if exists "Users can update own transactions" on public.financial_transactions;
create policy "Users can update own transactions" on public.financial_transactions
  for update using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.financial_accounts a
      where a.id = account_id and a.user_id = auth.uid()
    )
    and (
      category_id is null or exists (
        select 1 from public.financial_categories c
        where c.id = category_id and (c.user_id = auth.uid() or c.user_id is null)
      )
    )
  );

drop policy if exists "Users can delete own transactions" on public.financial_transactions;
create policy "Users can delete own transactions" on public.financial_transactions
  for delete using (auth.uid() = user_id);


-- 4. Financial Internal Transfers Table
create table if not exists public.financial_transfers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  from_account_id uuid not null references public.financial_accounts(id) on delete restrict,
  to_account_id uuid not null references public.financial_accounts(id) on delete restrict,
  amount bigint not null check (amount > 0),
  fee bigint not null default 0 check (fee >= 0),
  transfer_date date not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_financial_transfers_distinct_accounts check (from_account_id <> to_account_id)
);

-- Trigger updated_at
drop trigger if exists financial_transfers_set_updated_at on public.financial_transfers;
create trigger financial_transfers_set_updated_at
  before update on public.financial_transfers
  for each row execute function public.set_updated_at();

-- Indexes for financial_transfers
create index if not exists idx_financial_transfers_user_date on public.financial_transfers (user_id, transfer_date desc);
create index if not exists idx_financial_transfers_from on public.financial_transfers (from_account_id);
create index if not exists idx_financial_transfers_to on public.financial_transfers (to_account_id);

-- RLS for financial_transfers (With Cross-Tenant Relational Ownership Validation)
alter table public.financial_transfers enable row level security;
revoke all on public.financial_transfers from anon;
grant select, insert, update, delete on public.financial_transfers to authenticated;

drop policy if exists "Users can view own transfers" on public.financial_transfers;
create policy "Users can view own transfers" on public.financial_transfers
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own transfers" on public.financial_transfers;
create policy "Users can insert own transfers" on public.financial_transfers
  for insert with check (
    auth.uid() = user_id
    and from_account_id <> to_account_id
    and exists (
      select 1 from public.financial_accounts a
      where a.id = from_account_id and a.user_id = auth.uid()
    )
    and exists (
      select 1 from public.financial_accounts a
      where a.id = to_account_id and a.user_id = auth.uid()
    )
  );

drop policy if exists "Users can update own transfers" on public.financial_transfers;
create policy "Users can update own transfers" on public.financial_transfers
  for update using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and from_account_id <> to_account_id
    and exists (
      select 1 from public.financial_accounts a
      where a.id = from_account_id and a.user_id = auth.uid()
    )
    and exists (
      select 1 from public.financial_accounts a
      where a.id = to_account_id and a.user_id = auth.uid()
    )
  );

drop policy if exists "Users can delete own transfers" on public.financial_transfers;
create policy "Users can delete own transfers" on public.financial_transfers
  for delete using (auth.uid() = user_id);


-- 5. Financial Budgets Table
create table if not exists public.financial_budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.financial_categories(id) on delete cascade,
  month text not null check (month ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  amount bigint not null check (amount > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_financial_budgets_user_cat_month unique (user_id, category_id, month)
);

-- Trigger updated_at
drop trigger if exists financial_budgets_set_updated_at on public.financial_budgets;
create trigger financial_budgets_set_updated_at
  before update on public.financial_budgets
  for each row execute function public.set_updated_at();

-- Indexes for financial_budgets
create index if not exists idx_financial_budgets_user_month on public.financial_budgets (user_id, month);
create index if not exists idx_financial_budgets_category on public.financial_budgets (category_id);

-- RLS for financial_budgets (With Category Relational Ownership Validation)
alter table public.financial_budgets enable row level security;
revoke all on public.financial_budgets from anon;
grant select, insert, update, delete on public.financial_budgets to authenticated;

drop policy if exists "Users can view own budgets" on public.financial_budgets;
create policy "Users can view own budgets" on public.financial_budgets
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own budgets" on public.financial_budgets;
create policy "Users can insert own budgets" on public.financial_budgets
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.financial_categories c
      where c.id = category_id and (c.user_id = auth.uid() or c.user_id is null)
    )
  );

drop policy if exists "Users can update own budgets" on public.financial_budgets;
create policy "Users can update own budgets" on public.financial_budgets
  for update using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.financial_categories c
      where c.id = category_id and (c.user_id = auth.uid() or c.user_id is null)
    )
  );

drop policy if exists "Users can delete own budgets" on public.financial_budgets;
create policy "Users can delete own budgets" on public.financial_budgets
  for delete using (auth.uid() = user_id);


-- 6. Atomic Transfer RPC Function (Internal Transfer Processor)
create or replace function public.execute_financial_transfer(
  p_from_account_id uuid,
  p_to_account_id uuid,
  p_amount bigint,
  p_fee bigint default 0,
  p_transfer_date date default current_date,
  p_notes text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_from_acc record;
  v_to_acc record;
  v_transfer_id uuid;
  v_result jsonb;
begin
  -- 1. Ensure authenticated caller
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Unauthorized: User is not authenticated';
  end if;

  -- 2. Validate input parameters
  if p_from_account_id = p_to_account_id then
    raise exception 'Transfer gagal: Rekening asal dan rekening tujuan tidak boleh sama';
  end if;

  if p_amount <= 0 then
    raise exception 'Transfer gagal: Nominal transfer harus lebih dari 0';
  end if;

  if coalesce(p_fee, 0) < 0 then
    raise exception 'Transfer gagal: Biaya transfer tidak boleh bernilai negatif';
  end if;

  -- 3. Lock both accounts with row-level locks and verify ownership
  select * into v_from_acc
  from public.financial_accounts
  where id = p_from_account_id and user_id = v_user_id
  for update;

  if not found then
    raise exception 'Transfer gagal: Rekening asal tidak ditemukan atau bukan milik pengguna';
  end if;

  select * into v_to_acc
  from public.financial_accounts
  where id = p_to_account_id and user_id = v_user_id
  for update;

  if not found then
    raise exception 'Transfer gagal: Rekening tujuan tidak ditemukan atau bukan milik pengguna';
  end if;

  -- 4. Atomically insert transfer record
  insert into public.financial_transfers (
    user_id,
    from_account_id,
    to_account_id,
    amount,
    fee,
    transfer_date,
    notes
  ) values (
    v_user_id,
    p_from_account_id,
    p_to_account_id,
    p_amount,
    coalesce(p_fee, 0),
    coalesce(p_transfer_date, current_date),
    p_notes
  ) returning id into v_transfer_id;

  -- 5. Construct return object
  v_result := jsonb_build_object(
    'success', true,
    'transfer_id', v_transfer_id,
    'from_account_id', p_from_account_id,
    'to_account_id', p_to_account_id,
    'amount', p_amount,
    'fee', coalesce(p_fee, 0),
    'transfer_date', coalesce(p_transfer_date, current_date),
    'notes', p_notes
  );

  return v_result;
end;
$$;

revoke all on function public.execute_financial_transfer from public;
grant execute on function public.execute_financial_transfer to authenticated;


-- 7. View: Real-Time Account Current Balances (With Dynamic Calculation)
create or replace view public.view_financial_account_balances
with (security_invoker = true) as
select
  a.id,
  a.user_id,
  a.name,
  a.type,
  a.initial_balance,
  a.color,
  a.icon,
  a.created_at,
  a.updated_at,
  coalesce(a.initial_balance, 0)
    + coalesce(tx.net_income, 0)
    + coalesce(tr_in.total_in, 0)
    - coalesce(tr_out.total_out, 0) as current_balance
from public.financial_accounts a
left join lateral (
  select
    sum(case when t.type = 'income' then t.amount when t.type = 'expense' then -t.amount else 0 end) as net_income
  from public.financial_transactions t
  where t.account_id = a.id
) tx on true
left join lateral (
  select
    sum(tr.amount) as total_in
  from public.financial_transfers tr
  where tr.to_account_id = a.id
) tr_in on true
left join lateral (
  select
    sum(tr.amount + tr.fee) as total_out
  from public.financial_transfers tr
  where tr.from_account_id = a.id
) tr_out on true;

revoke all on public.view_financial_account_balances from anon;
grant select on public.view_financial_account_balances to authenticated;


-- 8. Seed Standard Default System Categories (Without User Data / Without Dummy Accounts)
-- Only system categories are inserted (user_id IS NULL).
-- No dummy accounts, dummy balances, or dummy transactions are ever created!
insert into public.financial_categories (user_id, name, type, icon, color, is_default)
values
  -- Income Categories
  (null, 'Gaji (Salary)', 'income', 'briefcase', '#10b981', true),
  (null, 'Freelance', 'income', 'laptop', '#06b6d4', true),
  (null, 'Bisnis', 'income', 'trending-up', '#8b5cf6', true),
  (null, 'Investasi', 'income', 'piggy-bank', '#f59e0b', true),
  (null, 'Pemasukan Lainnya', 'income', 'plus-circle', '#6b7280', true),
  -- Expense Categories
  (null, 'Makanan & Minuman', 'expense', 'utensils', '#f97316', true),
  (null, 'Transportasi', 'expense', 'car', '#3b82f6', true),
  (null, 'Belanja', 'expense', 'shopping-bag', '#ec4899', true),
  (null, 'Tagihan & Utilitas', 'expense', 'receipt', '#eab308', true),
  (null, 'Hiburan', 'expense', 'film', '#a855f7', true),
  (null, 'Kesehatan & Pribadi', 'expense', 'heart-pulse', '#ef4444', true),
  (null, 'Pendidikan', 'expense', 'graduation-cap', '#14b8a6', true),
  (null, 'Tempat Tinggal', 'expense', 'home', '#6366f1', true),
  (null, 'Langganan', 'expense', 'repeat', '#84cc16', true),
  (null, 'Pengeluaran Lainnya', 'expense', 'more-horizontal', '#64748b', true)
on conflict (lower(name), type) where user_id is null do nothing;
