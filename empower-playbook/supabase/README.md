# Empower Playbook — Supabase

## Current project

`fpnmnlrwhwnuefbnehuf.supabase.co` — shared with `/empower/`, `/schedule/`, `/fuelup/`.
Dashboard: https://supabase.com/dashboard/project/fpnmnlrwhwnuefbnehuf

All empower-playbook tables are prefixed `ep_` to avoid conflicts with the
existing tables in this project (`empower_signups`, `fuelup_plans`, etc.).

---

## Running migrations

1. Open the Supabase dashboard → SQL Editor → New query
2. Open the migration file and paste the entire contents
3. Click Run

All migrations are **safe to re-run** — they use `IF NOT EXISTS` and drop/re-create
policies so you can apply the same file multiple times without errors.

### Order

| File | What it does |
|---|---|
| `migrations/001_initial_schema.sql` | Creates all 5 `ep_*` tables, indexes, trigger, and RLS policies |

---

## Moving to a dedicated Supabase project

When the site moves off the shared project:

1. Create a new Supabase project
2. Copy the new URL and anon key into `empower-playbook/js/config.js`
3. Run each migration file in order against the new project
4. Optionally run the data export → import steps below

That's it — the migration files are the complete DDL for the schema.

### Export existing data (optional)

Run in the current project's SQL Editor:

```sql
-- Export locations
SELECT row_to_json(t) FROM ep_locations t;

-- Export programs + weeks
SELECT row_to_json(p), (
  SELECT json_agg(row_to_json(w)) FROM ep_program_weeks w WHERE w.program_id = p.id
) AS weeks
FROM ep_programs p;

-- Export plans
SELECT row_to_json(t) FROM ep_plans t;

-- Export custom drills
SELECT row_to_json(t) FROM ep_drills t;
```

Then insert the JSON into the new project using the API or SQL Editor.

---

## Tables

| Table | Description |
|---|---|
| `ep_locations` | Facilities (address, lat/lon, notes, optional photo) |
| `ep_programs` | Programs — sport, season, groups, linked location |
| `ep_program_weeks` | One row per (program × week); holds optional session date |
| `ep_plans` | Practice plan for one (program × week × group) cell; `blocks` is JSONB |
| `ep_drills` | Custom drills from drill-admin; built-in drills are still hardcoded |

## Future schema changes (not yet written)

- `ep_rosters` / `ep_participants` — athlete roster per plan
- `ep_coaches` / `ep_volunteers` — staff assignments
- `ep_locations.image_url` — rename `image_data` once Supabase Storage is configured
- Auth — user-scoped RLS policies replacing the current open policies
