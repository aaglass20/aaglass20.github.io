-- Run this once in the Supabase SQL editor
-- Project: fpnmnlrwhwnuefbnehuf.supabase.co

create table if not exists bdu_tailgate_items (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  item        text not null,
  category    text not null default 'Food',
  quantity    text,
  notes       text,
  created_at  timestamptz not null default now()
);

-- Open read/write for anon (public signup page)
alter table bdu_tailgate_items enable row level security;

create policy "Anyone can view tailgate items"
  on bdu_tailgate_items for select using (true);

create policy "Anyone can add tailgate items"
  on bdu_tailgate_items for insert with check (true);

create policy "Anyone can delete their own item by id"
  on bdu_tailgate_items for delete using (true);
