# /new-bdu-drill — Add a drill to the Indy Way Drill Library

Turn a drill write-up (rough notes, a paragraph, a pasted drill, one or many) into the BDU drill
format and write a **SQL import file** the user runs in Supabase. Works for any drill; drills
from the **high school program** get the HS badge.

The drills live in the Supabase table `bdu_drills` (project `fpnmnlrwhwnuefbnehuf`). The library
page (`BDU/indy-drill-library.html`) and the practice builder read from it — **never add drills
to the HTML**. Read `BDU/INDY-WAY.md` → "Drill library is in Supabase" before you start.

**Never run the SQL yourself, and never write the coach PIN anywhere.** The user runs the file.

## Step 1 — Get the drill and ask about high school

Needed from the user (ask only for what's missing):
- the drill's **name** and its write-up (anything from one sentence to a full description)
- a **video**, if there is one: a file name in `BDU/vid/` (or `tactics/name.webm`), or an https link

**Always ask, unless the user already said:** *"Is this from the high school program?"*
- Yes → `"from_hs": true` (the page shows the HS badge)
- No → `"from_hs": false`

With several drills, ask once for the batch ("all high school, none, or some?").

Everything else below is decided by you — don't ask for it.

## Step 2 — Shape it

Every drill has the same layout. Write for a coach with little experience: plain words, one
idea per line, numbers a coach can set up from (yards, players, minutes).

| Field | Rule |
|---|---|
| `name` | Title case, small words lowercase ("Rock the River"). |
| `id` | kebab-case from the name (`rock-the-river`). Never reuse or change an id. |
| `icon` | One emoji that fits (⚽ 🎯 🔄 🏃 ⚡ ↔️ 🚪 🔵 🌊 🥅 🏟️ ⚔️). |
| `category` | One of: Warmup · Fitness · Technical · Passing · Dribbling · Possession · Shooting · Tactical · Goalkeeping · Games · Scrimmage. Pick the main training outcome (rules in INDY-WAY.md → Category Rules). |
| `skill_level` | `Beginner` (≤ 2 rules, one technical action) · `Intermediate` (2–4 rules, some decisions) · `Advanced` (tactical, several decisions at once). |
| `min_age` | Youngest group that can run it as written: `U8` simple warmups / technical / gates · `U10` possession, passing combinations · `U12` tactical, shooting with a goalkeeper · `U14` high-decision tactical, advanced shooting. (`U16` exists but is rarely the floor.) |
| `max_age` | The oldest group it suits, or `null` for no upper limit (most drills). Set it for young-player games a U14 team wouldn't run (tag games, relays): `U8`, `U10` or `U12`. |
| `focus_areas` | 1–5 of: Warmup · Fun · Ball Mastery · Dribbling · 1v1 · Aggression · Passing · First Touch · Combination Play · Possession · Numbers Up · Attacking · Finishing · Crossing · Heading · Defending · Pressing · Transition · Set Pieces · Goalkeeping · Small-Sided Game · Team Shape · Speed & Agility · Conditioning. What the drill actually works on — practice plans are built from these, so be honest and specific. |
| `duration` | Whole minutes. Warmup 8–12 · Technical / Passing / Dribbling 10–15 · Possession / Tactical / Shooting 15–20 · Scrimmage 20–35. A range in the write-up → the higher number. |
| `players` | Short text: "Pairs", "Groups of 4", "8–12", "12–16 plus a goalkeeper". Goalkeepers go here, not in equipment. |
| `description` | One sentence: what the drill is and what it trains. |
| `setup` | 2–5 lines: area size, where players and balls start, goals. |
| `directions` | 3–6 steps in the order they happen, ending with the rotation or how long to play. |
| `variations` | 3–5 lines starting `Easier:` or `Harder:` — at least one of each. |
| `coaching_points` | 3–4 short cues. Lead with the role when it helps ("Defender: stay on your feet"). |
| `equipment` | List of items, title case, **no commas inside an item**: "Balls", "Cones", "Pinnies (2 colors)", "Full-size goal". |
| `video_file` / `video_url` | A file on the site → `video_file` ("name.mp4"). A link → `video_url`. None → both `null`. |
| `from_hs` | From Step 1. |

- **No list markers** in the lines (`-`, `•`, `1.`) — the page adds bullets and numbers.
- **Keep the user's own words** where they gave them. **Fill in what's missing** (setup sizes,
  steps, variations) so the drill can be run as written — and **list every fill-in** in Step 6.
- The reference for tone and length is the user's own example:

```
High-tempo attacking pattern: switch the ball across the top of the box, overlap around the
outside, and finish from a weighted through ball at match speed.
Setup       · Station 1: line of players with balls in or near the center circle · …
Directions  1. Station 1 plays a firm pass to either flank, then jogs to the back of that line. 2. …
Variations  · Easier: remove Station 1 — start the rep at Station 2 with a ball. · Harder: one-touch through ball from Station 3.
Coaching Points · First pass firm and to feet so the wide player never has to step backward. · …
Equipment   Balls, Cones, Poles, Full-size goals
```

## Step 3 — A younger-age version (when the drill starts at U10 or older)

A drill with `min_age` U10+ also gets a **separate drill one age group down** (U10 → U8,
U12 → U10, U14 → U12), so younger teams have something they can run as written:
- `name`: "<Original> (U8 Version)" · `id`: "<original id>-u8" · `after_id`: the original's id
- the easier setup **built into** `setup` and `directions` (smaller numbers, bigger space, wider
  gates, fewer rules, more touches, a neutral player, a slower defender…)
- `skill_level` one step down (not below Beginner); a shorter `duration` if it suits
- `variations`: one `Easier:`, one `Harder:`, then `Ready for more: <what changes> — the full <Original>.`
- same icon, category, equipment, focus areas, video and `from_hs` as the original

Skip it for a drill that starts at U8, and for plain scrimmages (the smaller scrimmage is the
younger version). Say in Step 6 if you skipped it and why.

## Step 4 — Write the file

`BDU/drill-imports/<YYYY-MM-DD>-<slug>.sql` — slug from the first drill's id (`-and-N-more` for a batch).

```sql
-- BDU drill import: Rock the River (+ U10 version)
-- Run ONCE in the Supabase SQL Editor: https://supabase.com/dashboard/project/fpnmnlrwhwnuefbnehuf/sql
-- Adds these drills to the Indy Way drill library. A drill that is already there is left alone
-- (change it on the page with Edit drill). No PIN needed.
with incoming as (
  select * from jsonb_to_recordset($drills$
[
  {
    "id": "rock-the-river",
    "name": "Rock the River",
    "icon": "🌊",
    "category": "Tactical",
    "skill_level": "Advanced",
    "min_age": "U12",
    "max_age": null,
    "duration": 20,
    "players": "10–12",
    "description": "…",
    "setup": ["…", "…"],
    "directions": ["…", "…"],
    "variations": ["Easier: …", "Harder: …"],
    "coaching_points": ["…", "…"],
    "equipment": ["Balls (many)", "Cones", "Pinnies"],
    "focus_areas": ["Possession", "Transition", "Pressing"],
    "video_file": null,
    "video_url": null,
    "from_hs": true,
    "after_id": null
  }
]
$drills$::jsonb) as x(
    id text, name text, icon text, category text, skill_level text, min_age text, max_age text, duration int,
    players text, description text, setup jsonb, directions jsonb, variations jsonb,
    coaching_points jsonb, equipment jsonb, focus_areas jsonb, video_file text, video_url text, from_hs boolean, after_id text)
), added as (
  insert into bdu_drills (id, name, icon, category, skill_level, min_age, max_age, duration, players, description,
                          setup, directions, variations, coaching_points, equipment, focus_areas,
                          video_file, video_url, from_hs, sort_order)
  select i.id, i.name, coalesce(i.icon, '⚽'), i.category, coalesce(i.skill_level, ''), i.min_age, i.max_age, i.duration,
         coalesce(i.players, ''), coalesce(i.description, ''),
         array(select jsonb_array_elements_text(coalesce(i.setup, '[]'::jsonb))),
         array(select jsonb_array_elements_text(coalesce(i.directions, '[]'::jsonb))),
         array(select jsonb_array_elements_text(coalesce(i.variations, '[]'::jsonb))),
         array(select jsonb_array_elements_text(coalesce(i.coaching_points, '[]'::jsonb))),
         array(select jsonb_array_elements_text(coalesce(i.equipment, '[]'::jsonb))),
         array(select jsonb_array_elements_text(coalesce(i.focus_areas, '[]'::jsonb))),
         i.video_file, i.video_url, coalesce(i.from_hs, false),
         coalesce((select d.sort_order + 1 from bdu_drills d where d.id = i.after_id),
                  (select coalesce(max(d.sort_order), 0) + 10 from bdu_drills d))
  from incoming i
  on conflict (id) do nothing
  returning id
)
select i.name,
       case when a.id is not null then 'Added' else 'Already in the library — not changed' end as result
from incoming i left join added a on a.id = i.id;
```

- Change only the comment's title and the JSON; keep the SQL around it exactly as above.
- Always an array. Valid JSON: escape `"` as `\"`; real characters (–, ’, ×, ¾) are fine.
- The text must not contain `$drills$`.
- Needs `indy-drills-hs-badge.sql` and `indy-drills-focus-areas.sql` to have run (the `from_hs`, `focus_areas` and `max_age` columns).

## Step 5 — Check it

```bash
node BDU/scripts/check-drill-import.mjs BDU/drill-imports/<file>.sql
```

It checks every field against the table's rules and looks the drill up in the live library
(read-only) so it isn't added twice. Fix what it reports and run it again. If it says the drill
is already in the library, stop and tell the user — they can edit it on the page instead.

## Step 6 — Tell the user

- One row per drill: name · HS or not · category · age · skill · minutes · players · video.
- **What you filled in or guessed** (sizes, steps, variations, the whole younger version), and
  anything you skipped.
- How to load it: open the file, paste it into the SQL Editor
  (https://supabase.com/dashboard/project/fpnmnlrwhwnuefbnehuf/sql), Run. Each row says
  `Added` or `Already in the library — not changed`.
- Video: a new video file goes in `BDU/vid/` and has to be pushed; or they can upload one on the
  page afterwards (Edit drill, up to 50 MB).
- Don't commit unless asked. When asked: commit the import file (and the video, if any).

No other files change: the page counts drills itself and INDY-WAY.md's old registry is no longer kept.
