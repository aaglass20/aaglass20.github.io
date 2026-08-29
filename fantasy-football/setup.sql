-- Fantasy Football Draft Tracker
-- Run once in Supabase SQL editor at:
-- https://fpnmnlrwhwnuefbnehuf.supabase.co/project/default/editor

create table if not exists ff_draft (
  session_id   text        not null,
  player_name  text        not null,
  drafted_at   timestamptz not null default now(),
  is_mine      boolean     not null default false,
  primary key (session_id, player_name)
);

-- Add is_mine column if upgrading from original schema
alter table ff_draft add column if not exists is_mine boolean not null default false;

alter table ff_draft enable row level security;

-- Public read/write — anon key is sufficient for a personal draft board
do $$ begin
  create policy "public_all" on ff_draft
    for all to anon using (true) with check (true);
exception when duplicate_object then null;
end $$;
