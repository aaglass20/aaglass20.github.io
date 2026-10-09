create table if not exists ep_social_stories (
  id          uuid        primary key default gen_random_uuid(),
  plan_id     text        not null,
  title       text,
  sport       text,
  frames      jsonb       not null default '[]',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists ep_social_stories_plan_id_idx on ep_social_stories (plan_id);
