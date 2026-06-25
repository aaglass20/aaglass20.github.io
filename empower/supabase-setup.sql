-- Empower Sports × BDU iCan Soccer — Supabase Table Setup
-- Run this in: https://supabase.com/dashboard/project/fpnmnlrwhwnuefbnehuf/editor

create table empower_signups (
  id            uuid default gen_random_uuid() primary key,
  session_date  text not null,
  slot          integer not null check (slot in (1, 2)),
  team_name     text not null,
  coach_name    text not null,
  contact_email text,
  player_count  integer,
  notes         text,
  created_at    timestamp with time zone default now(),
  unique (session_date, slot)
);

-- Allow anyone (anon key) to read all signups and submit new ones.
-- This is a public signup form so no auth is needed.
alter table empower_signups enable row level security;

create policy "Anyone can read signups"
  on empower_signups for select
  using (true);

create policy "Anyone can sign up"
  on empower_signups for insert
  with check (true);

create policy "Anyone can update a signup"
  on empower_signups for update
  using (true)
  with check (true);

create policy "Anyone can delete a signup"
  on empower_signups for delete
  using (true);
