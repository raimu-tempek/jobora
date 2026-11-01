-- Migration: Create Feedback Table
-- Description: Supports user feedback, suggestions, and bug reports

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null, -- 'Kritik', 'Saran', 'Laporan Bug'
  message text not null,
  created_at timestamptz not null default now()
);

-- Row Level Security
alter table public.feedback enable row level security;

-- Grant permissions for authenticated users
grant select, insert on table public.feedback to authenticated;

-- Policies: Authenticated users can insert their own feedback
create policy "Users can insert own feedback" on public.feedback
  for insert with check (auth.uid() = user_id);

-- Policies: Authenticated users can view their own feedback
create policy "Users can view own feedback" on public.feedback
  for select using (auth.uid() = user_id);

-- Optional index for user lookup
create index if not exists idx_feedback_user_created
  on public.feedback (user_id, created_at desc);
