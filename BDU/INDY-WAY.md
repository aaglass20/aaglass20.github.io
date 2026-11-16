# The Indy Way — Living Reference

> **Self-maintaining doc.** Claude should update this file whenever a new drill is transferred, a rule is changed, or a new source page is fully harvested. Keep it current — it is the single source of truth for the Indy Way feature.

---

## What Is The Indy Way?

A coaching toolkit inside the BDU site that lets coaches build their own soccer practice plans. It lives at `/BDU/indy-way.html` and consists of three pages:

| File | Purpose | Status |
|---|---|---|
| `indy-way.html` | Landing hub | ✅ Live |
| `indy-drill-library.html` | Card grid of all drills, category filters, video modal | ✅ Live |
| `indy-practice-builder.html` | Wizard → builder → printable plan | ✅ Live |
| `indy-season-plan.html` | Season Plan: which weekly program to run in which block, per age group, and every week's theme | ✅ Live |
| `indy-player-pathway.html` | Player Pathway: what to teach at each age (four stages, training ratio, a card per age group U8–U9 … U16–U18) | ✅ Live |

Storage: **LocalStorage** (key: `bdu_indy_plan_v1`). Supabase integration planned for future.

### SQL files, in the order to run them

1. `indy-drills-setup.sql` — table, PIN, save functions, video bucket, the first 40 drills
2. `indy-drills-younger-versions.sql` — 32 younger-age versions
3. `indy-drills-hs-badge.sql` — `from_hs` + the HS badge
4. `indy-drills-focus-areas.sql` — `focus_areas`, `max_age`, the Goalkeeping category, focus areas for the first 72
5. `drill-imports/2026-11-16-drill-lab-soccer-125-drills.sql` — 125 Drill Lab drills
6. `drill-imports/2026-11-16-set-pieces-pressing-gap-drills-24.sql` — 24 gap drills
7. any later `drill-imports/*.sql`, in date order

All are safe to run again.

### Focus areas, age range, Goalkeeping (2026-11-16)

- **`focus_areas text[]`** — what a drill works on. A drill has **one category** (where it's filed) but **several focus areas**, and **practice plans are built by focus area**. The list (`FOCUS_AREAS` in the library page, the checker and the skill): Warmup · Fun · Ball Mastery · Dribbling · 1v1 · Aggression · Passing · First Touch · Combination Play · Possession · Numbers Up · Attacking · Finishing · Crossing · Heading · Defending · Pressing · Transition · Set Pieces · Goalkeeping · Small-Sided Game · Team Shape · Speed & Agility · Conditioning. Library: a **Focus** select beside the Age pills, tags in the drill view, ticks on the edit form, and search matches them.
- **`max_age`** — the oldest group a drill suits (null = no upper limit). The Age filter shows drills whose range includes the picked age; the card chip reads "U8–U10" or "U10+". The builder's age groups follow it.
- **Goalkeeping** is a category (was folded into Shooting).
- **Drill Lab import (125 drills):** `/drills/data/soccer.js` already uses our layout, so the text was carried over as written. Category = the Lab's first category mapped onto ours (1v1 / Receiving / Heading → Technical · 2v1 / 3v1 / 3v2 / Attacking / Defending / Transition → Tactical · Small-Sided Game / Fun → Games · Conditioning → Fitness); focus areas = all the Lab's categories + Set Pieces, Crossing, Pressing, Aggression, Ball Mastery, Speed & Agility, Team Shape, Combination Play by hand; `min_age` = youngest Lab age (U6 → U8), `max_age` only when the Lab's ages stop at U8 / U10 / U12; skill level from the age and type; duration = the higher number. **35 drills that the Lab built from BDU pages keep that page's video** (`video_file`, e.g. `practice/shooterVsDef.mp4`). None are HS. No younger-age versions (the Lab drills carry their own age range and Easier variations). Not imported: Animal Soccer (U6 only), Gates Dribbling and Partner Gate Passing (already in as the U8 gates versions).
- **The other BDU drill pages** (1v1 moves, turns, body feints, ball control, defensive, goalie, passing, shooting…): every section that is a real drill was already in the Drill Lab and came in with it. What's left on those pages is ~125 **technique clips and tips** (La Croqueta, Cruyff turn, jockey stance, set position…), not drills — not imported. They'd fit a "skill moves" library later.
- **Gap drills (24, written 2026-11-16, 221 drills in all):** the library had no free kicks, throw-ins, goal kicks, kickoffs or team pressing, and almost nothing that starts at U14 / U16. Added: **free kicks** (Tap and Shoot U8–U12 · Target Practice · Attacking Routines · Wide Delivery and Runs · Build the Wall · Quick Free Kick Game), **throw-ins** (Technique Pairs · Keep-It Game · Attacking Patterns), **goal kicks** (Build-Out · Playing Out Against the Press · Long Goal Kick and Second Ball), **Kickoff Routines**, **pressing** (Win It Back! U8–U12 · Press on the Trigger · High Press the Goal Kick · Sideline Pressing Trap · Team Press: Walk-Through to Live), **Cutback and Finish** (a first cross, U10), and **U14–U16**: Protect the Lead · Chase the Game · Rest Defense and Counterpress · Position Finishing Circuit · Set-Piece Scrimmage (U12+). All written from scratch (not HS, no video, no younger-age versions — each was written for the age it starts at).
- **Still thin:** Heading (nothing below U12, on purpose — US Soccer limits heading for younger players), Crossing at U8, and goalkeeper drills that start at U14+.

### Weekly programs (2026-11-16)

Four-week programs by age group that build **one focus area** week by week. They show on **`indy-saved-plans.html`**, in a "Weekly Programs" section above the single-session plans (the page's age buttons and search filter both; `?age=U12` opens on an age, which the Player Pathway page links to).

- **Data:** `scripts/indy-programs.js` (`window.INDY_PROGRAMS`) — edit that file to add or change a program. A program: `id, title, focus, ages[], minutes, goal, weeks[]`; a week: `theme, objective, keys[], twist, check, blocks[]`; a block: `W(id, min)` warmup · `D(id, min)` drill · `B(min)` water break · `C(min)` closing huddle. **Blocks are drill ids** — the page reads the drills from `bdu_drills`, so editing a drill in the library updates every program that uses it.
- **The arc every program follows:** Week 1 learn it (technique, low pressure) → Week 2 add pressure → Week 3 game situations → Week 4 put it in the game. Each session: warmup → 2 drills → water break → game-like drill → game or scrimmage with **this week's twist** (a scoring rule that rewards the focus) → huddle with one question.
- **Session length by age:** U8 and U10 60 min · U12 75 · U14 and U16 90 (the Player Pathway's numbers). A program may have an optional `note` shown under its goal.
- **What's there (48 programs, 192 sessions):** **Finishing**, **Aggression** (competing, 1v1, winning the ball back, pressing), **Possession**, **Defending** and **Transition** for U8, U10, U12, U14, U16 · **Set Pieces**, **Dribbling** (dribbling and 1v1 attacking), **Passing & First Touch**, **Fitness** and **Goalkeeping** for U8, U10, U12, U14–U16 · **Crossing & Heading** for U10 (no heading), U12 (heading introduced in one week, light ball), U14–U16. Goalkeeping programs are **keeper blocks** (30–45 min) to run beside team practice; their last drill each week is one the keepers join the team for. Fitness programs test in Week 1 and re-test in Week 4 (beep test) from U10 up.
- **On the page:** each program card lists its weeks; a week opens to show what to coach, the timed session, the twist and the huddle question. **Open Week N in the builder** writes the session to the builder's `bdu_indy_plan_v1` (asks first if a plan is already there) with the full drill info on each block. **Print program** prints all four weeks.
- **Check before committing a change:** `node BDU/scripts/check-programs.mjs` — every drill id exists (live table or an import file not yet run), every drill suits the program's ages, and each session adds up to the program's minutes.
- **Not yet:** saving a coach's own edited program (a week opened in the builder is the coach's copy on that device only); programs editable on the page (they live in the file).

### Season plans (2026-11-16)

`indy-season-plan.html` lays the weekly programs out across a year for each age group (tabs **U8–U9 · U10 · U11–U12 · U13–U14 · U15–U18**, kept in the address as `#u12`; prints).

- **Shape:** six 4-week blocks — Pre-season · Early season · Mid-season · Winter / indoor · Spring start · Spring finish (24 weeks) — with **two focused sessions a week**: Session A = the block's main program, Session B = its second. Each block says **why now**. The page shows the six blocks, then a **week-by-week table** of both sessions' themes for all 24 weeks.
- **Keepers:** the age's goalkeeping program runs beside team practice in the blocks listed in `keeperBlocks` (twice a year from U10; once at U8, where it's a whole-team block).
- **Second time:** blocks 5–6 repeat the programs that matter most for that age; the page marks them "second time" and tells coaches to use the drills' Harder variations.
- **Data:** `scripts/indy-seasons.js` (`window.INDY_SEASONS`): `age, label, summary, sessions, keeperProgram, keeperBlocks, blocks[{ name, when, a, b, why }]` — `a` / `b` are program ids from `indy-programs.js`. U16 reuses the U14–U16 programs where there is no separate U16 one.
- **Links:** a program on the season page opens `indy-saved-plans.html?age=U12#prog-<id>`, which filters to that age, scrolls to the program and opens its first week. The hub, the menu, the Saved Plans page and each Player Pathway card link to the season page.
- **Check:** `node BDU/scripts/check-programs.mjs` also checks the seasons (six blocks, programs exist and suit the age, and notes any program an age never uses).
- **Not yet:** real calendar dates per team; one-session-a-week and three-session-a-week layouts (the page only says how to adapt); a coach's own edited season.

### Player Pathway page (2026-11-16)

`indy-player-pathway.html` is the Indy Way version of `player-development.html` (which is left as it was). Plain static HTML — edit the text in the page.

- **Layout:** the four stages (U5–U9, U10–U12, U13–U14, U15–U18) → a technical / tactical ratio bar per age → one card per age group, picked with tabs (kept in the address as `#u12`; all ages print). Each card: theme, game format, sessions, training ratio, **Technical Focus · Tactical Concepts · Physical · Mental · Social**, **Attack Mentality**, "By the end of the season, a player…", "Coaching this age", and a link to the drill library filtered to that age (`indy-drill-library.html?age=U12`).
- **From the sheet:** the stage chart, and U10–U15's theme, technical focus, tactical concepts, mental / physical and training ratio (U10 also had psychosocial, social skills and attack mentality).
- **Filled in:** the whole **U8–U9** and **U16–U18** cards; Social and Attack Mentality for U11–U15; game format, session length, season goals and coaching notes for every age; Physical for Stage 2 and Psychosocial for Stage 4 on the chart; a few extra lines per age (weak-foot passing at U11, the offside line at U13, set pieces at U14…). Ages were corrected to one birth year per group (the sheet had U11 as 10–11 and U12 as 11–12).
- **Age → drill filter:** U8–U9 → U8 · U10, U11 → U10 · U12, U13 → U12 · U14, U15 → U14 · U16–U18 → U16.

### Drill library is in Supabase (2026-11-16)

First step of the BDU academy tool chest: **`indy-drill-library.html` no longer has a hard-coded `DRILLS` list.** It reads the `bdu_drills` table (project `fpnmnlrwhwnuefbnehuf`, the one the other BDU pages use) and coaches add / edit / delete drills on the page.

- **Setup:** run `BDU/indy-drills-setup.sql` once in the SQL Editor, **changing the coach PIN line in the editor first** (never save the real PIN in the file — the repo is public). It makes the table, the PIN-checked functions, the video bucket and seeds the 40 drills. Re-running never overwrites a drill or the PIN. Until it has run, the page says the library couldn't load.
- **Drill layout (every drill):** description → **Setup** (bullets) → **Directions** (numbered) → **Variations** ("Easier:" / "Harder:", or the old Age Modifications) → **Coaching Points** → **Equipment**. Columns: `id, name, icon, category, skill_level, min_age, duration, players, description, setup[], directions[], variations[], coaching_points[], equipment[], video_file, video_url, extra, sort_order`. `id`s are the same as before, so the practice builder still matches.
- **Reshaping:** the 17 drills that had `setup / howToPlay / coachingPoints / modifications` keep their words (How to Play → Directions, Age Modifications → Variations; Pierce the Circle had no modifications, so its Variations were written). The 23 that were a paragraph + 3 cues had Setup, Directions and Variations **written out — check them against the videos** (least certain: Pass, Tap, Pass Back · 10 Person Continuous · 4 Point Shooting · Block or One Time · 3v2 Transition). `players` was filled in for all 40.
- **Editing:** anyone can read; `bdu_drills` has no write policies. Saves go through `bdu_drill_save(p_pin, p_drill)` / `bdu_drill_delete(p_pin, p_id)`, which check the PIN against a hash in `bdu_drill_admin` (no policies, so the page can't read it). The page asks for the PIN once per visit (`sessionStorage`).
- **Video:** `video_file` = a file already on the site (`vid/` or `tactics/`, same resolver as before) and is left alone. A drill with no video can get an **upload** (bucket `bdu-drill-videos`, public, 50 MB, MP4 / WebM / MOV) or a pasted link → `video_url`.
- **The practice builder reads the same table (2026-11-16):** `indy-practice-builder.html` no longer has a hard-coded `DRILL_BANK`. `loadDrillBank()` reads `bdu_drills` and `drillFromRow()` turns each row into the shape the builder always used (`variants.default` = description, first 3 coaching points as the cues, `setup`, `howToPlay` = Directions, `variations`, `coachingPoints`). So a drill added or edited on the library page shows in the builder on the next load. All 40 drills are in the picker now (it used to leave out the warmups and scrimmages). `WARMUP_BANK` and `CLOSING_BANK` are still hard-coded.
- **Age-specific versions** live in `extra.variants` (`{ "U10": { "desc": "…", "coaching": ["…"] } }`) — only 1v1 Attacking Duel, Beep Test and 1 Mile Run have any; part 6 of the setup file adds them. There's no form for them yet (edit in the Supabase Table Editor).
- **No signal:** the builder keeps the last good load on the device (`localStorage` `bdu_indy_drills_cache_v1`) and uses it when Supabase can't be reached; with nothing saved it says the drills couldn't load, with a try again link. Plans already built keep their own copy of each drill's text, so they never change or break.
- **Younger-age versions (2026-11-16):** 32 drills have a separate version for a younger or less experienced group — `BDU/indy-drills-younger-versions.sql`, run once after the setup file (72 drills in all). Each version has the easier setup built into Setup and Directions: id `<original id>-u12` (or `-u10`, `-u8`), name "<Original> (U12 Version)", same video, placed right after its original, and its Variations end with "Ready for more: … — the full <Original>". **The originals are unchanged.** 16 come from a variation that named the younger group ("U12/Introductory: …", "U10/Beginners: …"; skill level one step down); 16 come from drills that only had "Easier:" variations and are one age group below the original (skill level Beginner). No version for drills already at U8, or for the 7v7 / 9v9 / 11v11 scrimmages (the smaller scrimmage is the younger version). A new drill aimed at an older group should get a younger version the same way.
- **HS badge (2026-11-16):** `bdu_drills.from_hs` = the drill came from the high school program; the library shows a small navy-and-gold **HS** badge on its card and in its view. Set for the 17 drills from `igs-takeaways.html` **and their 14 younger-age versions** (31 drills) by `BDU/indy-drills-hs-badge.sql` — run it after the younger-versions file (safe to run again; the setup file has the column for a fresh table). Change it with the **From the high school program** tick on the edit form. Before the SQL runs, no badge shows and the tick isn't saved.
- **Age filter (2026-11-16):** the library's Age row shows the drills a team of that age can run (`min_age` at or below it); counts on both pill rows follow each other.
- **To add or change a drill now: use the library page** (+ Add drill / Edit drill), or **`/new-bdu-drill`** — it asks whether the drill is from the high school program, shapes the write-up into this layout (plus a younger-age version when it starts at U10 or older), writes `BDU/drill-imports/<date>-<slug>.sql` for the user to run in the SQL Editor, and checks it with `node BDU/scripts/check-drill-import.mjs <file>` (field rules + a read-only duplicate check against the live table). Never the HTML. The Drill Data Model, Drill Registry and Adding a New Drill sections below describe the old hard-coded lists and are kept for history — the table is the source of truth, and the registry is no longer kept up.

---

## Drill Data Model

All drills live in the `DRILL_BANK` constant inside `indy-practice-builder.html` (and mirrored as `DRILLS` in `indy-drill-library.html`). Every drill must follow this schema exactly.

### Required fields

```js
{
  id: 'kebab-case-id',           // unique slug, never change after first use
  name: 'Display Name',          // title case, concise
  icon: '⚽',                    // single emoji representing drill type
  category: 'Technical',         // see Category Rules below
  minAge: 'U10',                 // lowest age group the drill is appropriate for
  defaultDuration: 15,           // minutes (integer)
  videoFile: 'filename.mp4',     // filename only (lives in BDU/vid/); null if no video
  equipment: ['Cones', 'Balls'], // array of strings, title case
  purpose: 'One sentence.',      // benefit of the drill for the plan header tooltip
  ageGroups: ['U10', 'U12', 'U14', 'U16', 'Mixed'], // all groups the drill works for
  variants: {
    default: {
      desc: 'Full description of the drill.',
      coaching: ['Cue 1', 'Cue 2', 'Cue 3'], // exactly 3 coaching cues
      // optional structured fields — add when the drill warrants detailed breakdown
      setup: ['Grid: ...', 'Players: ...', 'Equipment: ...'],       // shown in 📋 Drill info modal
      howToPlay: ['Rule 1: ...', 'Rule 2: ...', 'Scoring: ...'],    // shown in 📋 Drill info modal
      coachingPoints: ['Point 1: ...', 'Point 2: ...', 'Point 3: ...'], // shown in 📋 Drill info modal
    },
    // optional age-specific variants (U8, U10, U12, U14, U16, Mixed)
    U8: { desc: '...', coaching: ['...', '...', '...'] },
  },
}
```

### Rules

- **`id`** — kebab-case, stable forever. Once a drill is in the registry it can never be renamed (breaks localStorage saves).
- **`category`** — must be one of the 7 valid categories (see below). One category per drill — pick the primary intent.
- **`minAge`** — if a drill is appropriate for U8+, set `minAge: 'U8'`. The builder filters the drill bank to only show drills whose `ageGroups` array contains the selected age or higher.
- **`videoFile`** — filename only, with extension. Files live in `BDU/vid/`. Spaces in filenames are OK (browsers handle them). Set to `null` if no video exists.
- **`equipment`** — title case, specific. "Cones" not "cones". "Pinnies" not "vests/bibs".
- **`purpose`** — one sentence, no period required. Shows up as a tooltip/subtext in the library.
- **`desc`** — can come verbatim from the source BDU page. Keep the original wording — coaches know these drills by their existing descriptions.
- **`coaching`** — exactly 3 bullet points. Format: `'Role/focus: specific cue'`. Lead with player role when relevant (e.g. `'Attacker: head up...'`, `'Defenders: press as a unit...'`).
- **`setup` / `howToPlay` / `coachingPoints`** — optional arrays of strings inside a variant. Add them when the drill has enough structural complexity to warrant a breakdown (e.g. size of grid, player roles, scoring rules). When present, the plan builder shows a "📋 Drill info" button on the block that opens a formatted modal. Drills without these fields fall back gracefully (info button hidden, desc + coaching shown instead). All three fields are optional independently.
- **Age variants** — only write them when the drill meaningfully changes for that age group (different setup, different rules, added complexity). Do not write near-identical variants just to have them. Every drill must have a `default` variant even if no age-specific variants exist.

---

## Category Rules

| Category | When to use |
|---|---|
| **Warmup** | Primary purpose is warming up the body/ball before the main session |
| **Fitness** | Primary purpose is athletic development: agility, speed, conditioning, footwork — no ball required |
| **Technical** | Individual skill focus: first touch, ball mastery, 1v1 moves, control |
| **Passing** | Primary emphasis is passing accuracy, weight, combination, or distance |
| **Dribbling** | Primary emphasis is dribbling speed, control, or decision-making |
| **Possession** | Keep-away, rondos, maintaining the ball under pressure; team-based |
| **Shooting** | Finishing, shooting under pressure, goalkeeper training included |
| **Tactical** | Transitions, pressing, shape, numbers-up/down scenarios |
| **Games** | Competitive game formats with unique rules or themes (Soccer Baseball, Attack vs. Defense) — distinct structure beyond a standard scrimmage |
| **Scrimmage** | Standard free-play formats: 4v4 through 11v11, overload scrimmages — minimal rules, applied game time |

If a drill spans two categories (e.g. passing + possession), pick whichever is the **primary training outcome**. Don't create sub-categories.

---

## Age Group Rules

Valid values: `U8` | `U10` | `U12` | `U14` | `U16` | `Mixed`

- **`minAge`** sets the floor — the builder hides drills below this age.
- **`ageGroups`** lists every group the drill is appropriate for. Always include `Mixed` if the drill works across multiple ages.
- **Default age variant** applies when no specific variant exists for the selected age. The builder falls back: tries the selected age → tries lower ages → falls back to `default`.
- IGS takeaway drills are high school level — default `minAge: 'U10'` for most, `'U12'` for tactical/complex drills, `'U14'` for advanced shooting drills.

---

## Practice Plan Block Rules

The builder has two separate banks:

### WARMUP_BANK
Used when a coach adds a **Warmup block** (first slot in a plan). Items are simpler — just `id`, `name`, `icon`, `videoFile`, `desc`. No variants, no category. Items here can also appear in `DRILL_BANK` if they're full drill-library items.

### DRILL_BANK
All 17+ drills. Used for Drill blocks. Full schema required.

### CLOSING_BANK
Used for the closing block. Same simple schema as WARMUP_BANK. Currently: Team Huddle & Recap, Cool-Down Stretch, Finishing Game. New closings can be added here — no video required.

---

## Drill Registry

All drills currently in `DRILL_BANK`. When adding from a source page, **check this table first** to avoid duplicates.

| ID | Name | Category | Min Age | Video | Source Page |
|---|---|---|---|---|---|
| `1v1-basic` | 1v1 Attacking Duel | Technical | U8 | None | *(original example)* |
| `pass-tap-pass-back` | Pass, Tap, Pass Back | Technical | U8 | `Pass, tap, pass back, 3 distances.mp4` | `igs-takeaways.html` |
| `cone-passing` | Cone Passing | Technical | U10 | `cone passing.mp4` | `igs-takeaways.html` |
| `movement-skill-reset` | 10 Person Continuous | Technical | U10 | `MovementSkillResetFindTarget.mp4` | `igs-takeaways.html` |
| `three-group-continuous` | Three-Group Continuous | Technical | U10 | `10 Person Continuous - 3 way.webm` | *(user-submitted)* |
| `gates-competition-passing` | Gates Competition Passing | Passing | U10 | `Gates competition passing.mp4` | `igs-takeaways.html` |
| `long-passes-4` | Long Passes (4 People) | Passing | U12 | `long passes 4 people.mp4` | `igs-takeaways.html` |
| `get-open` | Get Open | Passing | U10 | `get open.mp4` | `igs-takeaways.html` |
| `gates-competition-dribbling` | Gates Competition Dribbling | Dribbling | U10 | `Gates competition dribbling.mp4` | `igs-takeaways.html` |
| `target-dribbling` | Target Dribbling | Dribbling | U10 | `Target Dribbling.webm` | *(user-submitted)* |
| `bumper-keepaway` | Bumper Keepaway | Possession | U10 | `bumper Keepaway.mp4` | `igs-takeaways.html` |
| `across-the-river` | Across The River | Possession | U12 | `across the river.mp4` | `igs-takeaways.html` |
| `3-team-keepaway` | 3 Team Keep Away | Possession | U10 | `3 Team Keep Away.mp4` | `igs-takeaways.html` |
| `block-or-one-time` | Block Or One Time | Shooting | U12 | `block or one time.mp4` | `igs-takeaways.html` |
| `closing-fast-shot-fast` | Closing Fast, Shot Fast | Shooting | U12 | `closingFastShotFast.mp4` | `igs-takeaways.html` |
| `4-point-shooting` | 4 Point Shooting | Shooting | U14 | `4 point shooting.mp4` | `igs-takeaways.html` |
| `3v2-transition` | 3v2 Transition | Tactical | U12 | `3v2 Transition.mp4` | `igs-takeaways.html` |
| `4-person-movement-warmup` | 4 Person Movement Warmup | Warmup | U8 | `4 person Movement Warmup.mp4` | `igs-takeaways.html` |
| `circle-passing-warmup` | Circle Passing Warmup | Warmup | U8 | `circlePassingWarmup.mp4` | `igs-takeaways.html` |
| `pierce-the-circle` | Pierce The Circle | Possession | U12 | `tactics/Pierce the Circle.webm` ¹ | `igs-takeaways.html` |
| `small-sided-4v4` | 4v4 Small-Sided Game | Scrimmage | U8 | None | *(original)* |
| `overload-scrimmage` | Overload Scrimmage | Scrimmage | U10 | None | *(original)* |
| `attack-vs-defense` | Attack vs. Defense | Games | U10 | None | *(original)* |
| `scrimmage-7v7` | 7v7 Scrimmage | Scrimmage | U10 | None | *(original)* |
| `scrimmage-9v9` | 9v9 Scrimmage | Scrimmage | U12 | None | *(original)* |
| `scrimmage-11v11` | 11v11 Full Field Scrimmage | Scrimmage | U14 | None | *(original)* |
| `parallel-corridor-footwork` | Parallel Corridor Footwork | Fitness | U8 | `tactics/Lateral Movement.webm` ¹ | *(user-submitted)* |
| `shadow-dribbling` | Shadow Dribbling | Warmup | U8 | None | *(original)* |
| `around-the-horn` | Around the Horn | Tactical | U12 | `The Spine.mp4` | *(original)* |
| `king-of-the-end-zones` | King of the End Zones | Tactical | U12 | `King of the End Zones.mp4` | *(original)* |
| `receive-turn-finish` | Receive, Turn & Finish | Shooting | U12 | `Charge Touch Shoot.mp4` | *(user-submitted)* |
| `rock-the-river` | Rock the River | Tactical | U12 | `tactics/Rock the River.webm` | *(user-submitted)* |
| `lateral-shadow` | Lateral Shadow | Tactical | U12 | `Lateral Shadow.webm` | *(user-submitted)* |
| `soccer-baseball` | Soccer Baseball | Games | U10 | `tactics/baseball.webm` | *(user-submitted)* |
| `agility-ladder` | Agility Ladder | Fitness | U8 | None | *(user-submitted)* |
| `one-mile-run` | 1 Mile Run | Fitness | U10 | None | *(user-submitted)* |
| `circular-pyramid-intervals` | Circular Pyramid Intervals | Fitness | U10 | None | *(user-submitted)* |
| `tag-and-release-relay` | Tag-and-Release Relay | Fitness | U10 | None | *(user-submitted)* |
| `beep-test` | Beep Test | Fitness | U10 | None | *(user-submitted)* |
| `peripheral-possession` | Peripheral Possession with Forbidden Returns | Possession | U12 | `tactics/Peripheral Possession with Forbidden Returns.webm` ¹ | *(user-submitted)* |

**Total: 40 drills**

¹ This drill's video lives in `BDU/tactics/` (webm), not `BDU/vid/` (mp4). The path resolver handles this: `videoFile.includes('/') ? videoFile : 'vid/' + videoFile`.

---

## Source Pages — Transfer Status

Pages on the main BDU site that contain drills. Check this before adding new drills to know where to look and what has already been harvested.

| Source Page | Topic | Transfer Status |
|---|---|---|
| `igs-takeaways.html` | IGS high school takeaway drills | ✅ Fully transferred (17 drills + 1 layout section skipped) |
| `1v1-moves.html` | 1v1 moves with video | ⬜ Not transferred (1v1-basic covers the concept; page has video drills) |
| `ball-control.html` | Ball control drills | ⬜ Not transferred |
| `body-feints.html` | Body feint moves | ⬜ Not transferred |
| `conditioning-drills.html` | Conditioning | ⬜ Not transferred |
| `defensive-drills.html` | Defensive drills | ⬜ Not transferred |
| `dribbling.html` | Dribbling drills | ⬜ Not transferred |
| `fun.html` | Fun/game drills | ⬜ Not transferred |
| `goalie-drills.html` | Goalkeeper drills | ⬜ Not transferred |
| `partner-drills.html` | Partner drills | ⬜ Not transferred |
| `passing.html` | Passing drills | ⬜ Not transferred |
| `possession.html` | Possession drills | ⬜ Not transferred |
| `shooting.html` | Shooting drills | ⬜ Not transferred |
| `small-sided.html` | Small-sided games | ⬜ Not transferred |
| `team-drills.html` | Team drills | ⬜ Not transferred |
| `turns.html` | Turning drills | ⬜ Not transferred |
| `warm-up-drills.html` | Warmup drills | ⬜ Not transferred |

Pages intentionally skipped (practice plans / non-drill content):
- `current-practice.html`, `practice-*.html`, `u13-season-plan-*.html`, `individual-plans.html`, `position-plans.html`, `attacking-plan.html`, `defensive-plan-*.html`

---

## Adding a New Drill — Checklist

When the user asks to add drills from a BDU source page:

1. **Check the registry** — read the Drill Registry table above. If a drill is already there, skip it and tell the user it was already transferred.
2. **Read the source page** — use the file at `/Users/aaronglass/git/aaglass20.github.io/BDU/<page>.html`. Extract each `collapsible-section`: the `section-title` text is the drill name, and the `drill-summary` text is the description.
3. **Check for video** — look for a `<source src="vid/...">` inside the section. Note the exact filename.
4. **Assign category + minAge** — follow the Category Rules and Age Group Rules above.
5. **Write 3 coaching cues** — infer from the description. Keep them action-oriented.
6. **Add to DRILL_BANK** in `indy-practice-builder.html` — follow the data model schema exactly.
7. **Mirror to DRILLS array** in `indy-drill-library.html` — same data, simplified schema (no variants needed in library).
8. **Update this registry** — add a row to the Drill Registry table with the drill ID, name, category, minAge, videoFile, and source page.
9. **Update the source page transfer status** — mark ✅ Fully transferred or 🔄 Partially transferred.
10. **Update the drill count** in `indy-drill-library.html` hero text ("17 drills" → new total).

---

## Rules for the Practice Builder Wizard

- Age groups: `U8` (Ages 6–8) | `U10` (Ages 8–10) | `U12` (Ages 10–12) | `U14` (Ages 12–14) | `U16` (Ages 14–16) | `Mixed` (Multi-age)
- Duration presets: 45 | 60 | **75 (default)** | 90 min + custom (15–180 min)
- Block types: `warmup` | `drill` | `break` | `closing`
- Time chips: total / used / remaining — goes red when over
- LocalStorage key: `bdu_indy_plan_v1` — do not change this key (would break saved plans)
- The "▶ Watch video" link on plan blocks hides on print (`@media print`)

---

## Future Features (not yet built)

- [ ] Supabase sync to save named plans
- [ ] Saved Plans page (`indy-saved-plans.html`)
- [ ] Age-specific drill variant badges in the library view
- [ ] Equipment checklist auto-generated from selected drills
- [ ] "Add to Plan" shortcut from the drill library directly into a builder session
