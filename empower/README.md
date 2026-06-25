# BDU × Empower Sports — iCan Soccer 2026

3-page static site for BDU's partnership with Empower Sports. No build step — push HTML/CSS/JS directly to GitHub Pages.

---

## Pages

| File | Purpose |
|---|---|
| `index.html` | Welcome page + coach letter |
| `signup.html` | Team slot signup (Supabase-backed) |
| `practice.html` | Weekly session plans (gated by `PLANS_LIVE` flag) |

---

## Publishing Practice Plans

Practice plan content is written but hidden. When you're ready to show it:

1. Open `practice.html`
2. Find line ~553 (near the top of the `<script>` block):
   ```js
   const PLANS_LIVE = false;
   ```
3. Change it to:
   ```js
   const PLANS_LIVE = true;
   ```
4. Save and push to GitHub.

To hide plans again, flip it back to `false`.

---

## Supabase Setup

**Project:** `fpnmnlrwhwnuefbnehuf.supabase.co` (same project as `/schedule/`)

Run `supabase-setup.sql` in the [Supabase SQL Editor](https://supabase.com/dashboard/project/fpnmnlrwhwnuefbnehuf/editor) to create the table and RLS policies. Only needs to be done once.

If the table already exists and you just need to add policies, run:

```sql
alter table empower_signups enable row level security;

create policy "Anyone can read signups"   on empower_signups for select using (true);
create policy "Anyone can sign up"        on empower_signups for insert with check (true);
create policy "Anyone can update a signup" on empower_signups for update using (true) with check (true);
create policy "Anyone can delete a signup" on empower_signups for delete using (true);
```

### Table schema

```sql
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
```

---

## Session Dates (2026)

| Week | Date | Theme |
|---|---|---|
| 1 | August 22 | Ball Basics |
| 2 | August 29 | Dribbling |
| 3 | September 5 | Shooting |
| 4 | September 12 | Teamwork |
| 5 | September 26 | All-Stars (Final) |

> **No session September 19.**  
> All sessions: 10:00–11:15 AM · Independence Field House Fields

---

## Deploy

```bash
git add empower/
git commit -m "update empower site"
git push
```

GitHub Pages serves it automatically at `aaglass20.github.io/empower/`.
