-- Migration: Create Recruitment Events and Application Status History Tables
-- Description: Supports Kanban status tracking history and Recruitment Calendar scheduling

-- 1. Recruitment Events Table
create table if not exists recruitment_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid references applications(id) on delete cascade,
  title text not null,
  event_type text not null, -- 'HR Interview', 'User Interview', 'Technical Interview', 'Assessment Deadline', 'Application Deadline', 'Follow-up Reminder', 'Other Recruitment Events'
  start_time timestamptz not null,
  end_time timestamptz,
  is_all_day boolean not null default false,
  location text, -- URL or room/place
  notes text,
  is_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table recruitment_events enable row level security;

create policy "Users can view own recruitment events" on recruitment_events
  for select using (auth.uid() = user_id);
create policy "Users can insert own recruitment events" on recruitment_events
  for insert with check (auth.uid() = user_id);
create policy "Users can update own recruitment events" on recruitment_events
  for update using (auth.uid() = user_id);
create policy "Users can delete own recruitment events" on recruitment_events
  for delete using (auth.uid() = user_id);

create index if not exists idx_recruitment_events_user_start
  on recruitment_events (user_id, start_time asc);
create index if not exists idx_recruitment_events_application
  on recruitment_events (application_id);

create trigger recruitment_events_set_updated_at
  before update on recruitment_events
  for each row execute function set_updated_at();

-- 2. Application Status History Table
create table if not exists application_status_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid not null references applications(id) on delete cascade,
  previous_status text not null,
  new_status text not null,
  created_at timestamptz not null default now()
);

alter table application_status_history enable row level security;

create policy "Users can view own application status history" on application_status_history
  for select using (auth.uid() = user_id);
create policy "Users can insert own application status history" on application_status_history
  for insert with check (auth.uid() = user_id);
create policy "Users can delete own application status history" on application_status_history
  for delete using (auth.uid() = user_id);

create index if not exists idx_status_history_application
  on application_status_history (application_id, created_at desc);
