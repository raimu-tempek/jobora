create table applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  position text not null,
  type text not null,
  date date not null,
  status text not null,
  platform text not null,
  screenshot_url text, -- unused, kept nullable per ARCHITECTURE-Jobora.md
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table applications enable row level security;

create policy "Users can view own applications" on applications
  for select using (auth.uid() = user_id);
create policy "Users can insert own applications" on applications
  for insert with check (auth.uid() = user_id);
create policy "Users can update own applications" on applications
  for update using (auth.uid() = user_id);
create policy "Users can delete own applications" on applications
  for delete using (auth.uid() = user_id);

-- keep updated_at current on any row change
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger applications_set_updated_at
  before update on applications
  for each row execute function set_updated_at();
