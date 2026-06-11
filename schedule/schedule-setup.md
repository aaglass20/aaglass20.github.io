# Schedule — Setup Guide

A two-page availability scheduler backed by Supabase.

- **Public page** (`index.html`) — anyone can view weekly availability
- **Admin page** (`admin.html`) — PIN-gated, edit availability with a drag-to-paint grid

## 1. Create a Supabase project

1. Go to https://supabase.com and create a free project.
2. Once it's ready, go to **Project Settings → API**. Copy:
   - **Project URL** (e.g. `https://abcxyz.supabase.co`)
   - **anon public key** (a long JWT string)

## 2. Create the table

In Supabase, open the **SQL Editor** and run:

```sql
create table availability_slots (
  slot_date  date not null,
  slot_index smallint not null check (slot_index >= 0 and slot_index < 24),
  state      text not null check (state in ('available', 'maybe', 'blocked')),
  updated_at timestamptz default now(),
  primary key (slot_date, slot_index)
);

alter table availability_slots enable row level security;

-- Anyone can read availability (public consumer page).
create policy "public read"
  on availability_slots for select
  using (true);

-- Anyone can write (admin UI is gated client-side by PIN — see security note below).
create policy "public write"
  on availability_slots for insert
  with check (true);

create policy "public update"
  on availability_slots for update
  using (true) with check (true);

create policy "public delete"
  on availability_slots for delete
  using (true);
```

**Slot index → time mapping:** 30-minute slots from 7:00 AM to 7:00 PM. Index 0 = 7:00, index 1 = 7:30, …, index 23 = 6:30 PM (ends 7:00 PM). Available is the default — only `maybe` and `blocked` slots are stored as rows; available slots have no row.

## 3. Configure the app

Edit `js/config.js`:

```js
window.SCHEDULE_CONFIG = {
  SUPABASE_URL: 'https://abcxyz.supabase.co',
  SUPABASE_ANON_KEY: 'ey...your-anon-key...',
  ADMIN_PIN: '4729',          // pick any short code
  PERSON_NAME: 'Jordan',
};
```

## 4. Deploy

This is a plain static site. Commit the `schedule/` folder and push to GitHub — it'll be served at:

- `https://aaglass20.github.io/schedule/` — public availability
- `https://aaglass20.github.io/schedule/admin.html` — admin

## How to use

**Admin page:**
- Enter the PIN to unlock.
- Click a slot to cycle: **Available → Maybe → Blocked → Available**.
- Click + drag to paint multiple slots with the new state.
- Each change auto-saves to Supabase.
- Use the week nav to move between weeks.

**Public page:**
- Shows Sun–Sat, defaulting to the current week.
- Each day card lists time ranges that are **Available** (green) or **Maybe — ask** (amber).
- If a day has no overrides, it shows as fully available 7am–7pm.
- If every slot in a day is blocked, it shows "Not available this day".

## Security note

The admin PIN is checked client-side, and the Supabase anon key is exposed in the page source. The RLS policies above allow anyone with the key to write to the table directly. This is acceptable for a personal scheduling tool — the worst case is someone messes up the schedule, which you can fix.

If you want stronger protection later, options include:
- Replace the PIN gate with Supabase Auth (email/password) and tighten RLS to require an authenticated user for writes.
- Put writes behind a Supabase Edge Function that requires a server-side secret.
