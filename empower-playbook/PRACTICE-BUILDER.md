# Practice Builder — Dev Log

Tracks what's been built, what's next, and decisions made.  
File: `empower-playbook/practice-builder.html`

---

## Status: v0.1 — MVP complete

---

## What's built (v0.1 — 2026-08-29)

### Wizard (3 steps + summary)
- **Step 1** — Sport picker: 6 sport cards (Basketball, Softball, Football, Pickleball, Soccer, Kickball)
- **Step 2** — Duration: preset pills (30/45/60/75/90 min) + custom input
- **Step 3** — Warmup: Yes / No toggle
- **Step 4** — Summary card + "Build My Plan" CTA

### Plan Builder
- Sticky header: sport icon + name, time chips (total / used / left), progress bar
- Vertical timeline of plan blocks
- Per-block: icon, name, description, purpose, volunteer tip, duration badge, remove button
- Border-left color coded by block type (orange=warmup, blue=drill, purple=rotation, teal=break, green=closing)
- Remaining time indicator (clickable to open modal, turns green when full, red when over)
- "+ Add Block" button (disabled when over budget)
- "New Plan" button with confirmation

### Add Block Modal — 4 block types
| Type | Flow |
|---|---|
| **Warmup** | Pick from sport warmup bank → set duration → Add |
| **Drill** | Category filter tabs → single or rotational toggle → set time → Add |
| **Break** | Preset (2/5/10 min) or custom + custom label |
| **Closing** | Name input + duration |

### Rotational Drill flow
- Toggle "Rotational" checkbox in drill panel
- Drill cards switch to multi-select mode
- "Time per drill" input
- Live calc: N drills × time = total — shows in real time
- Adds as a single "Rotation Stations" block with drill tags listed inside

### Data
- **6 sports** all have warmup bank entries
- **Soccer** has the most complete drill bank (11 drills across Dribbling, Passing, Shooting, Mini Game, Multi-Skill categories)
- All other sports have 3–5 drills seeded from Empower playbook content
- Drill cards show: name, category, description, purpose, volunteer tip (matches practice.html style)

### Persistence
- LocalStorage key: `empowerPracticePlan`
- Auto-saves on every block add/remove
- Auto-restores on page load (bypasses wizard if a plan exists)

### Nav
- Plan Builder link (📋) added to all 9 empower-playbook pages (index + 6 sports + volunteer + practice-builder itself)

---

## Known gaps / not yet built

- [ ] **Reorder blocks** — drag or up/down arrows to reorder the timeline
- [ ] **Edit block duration** — inline edit without removing and re-adding
- [ ] **Supabase sync** — save named plans, load previous plans; drill bank backed by Supabase (planned — see Future Plans below)
- [ ] **React conversion** — full SPA rewrite planned (see Future Plans below)
- [ ] **Start time** — optional session start time; shows clock times on each block
- [ ] **More drills for non-soccer sports** — basketball/softball/football/pickleball/kickball need more rich-schema drills
- [ ] **Scrimmage block type** — dedicated type with team composition notes
- [ ] **Equipment checklist** — auto-generated from drills in the plan

## Future Plans (noted for design)

- **Supabase persistence** — `empowerDrillBank` and `empowerPracticePlan` both move to Supabase; user auth (PIN or email); named plans
- **React conversion** — SPA with React + Vite; drill admin becomes a proper CRUD UI; plan builder uses component state

---

## Design decisions

- **LocalStorage first** — no backend for v0.1; fast to iterate
- **No external dependencies** — pure vanilla JS, shares existing `css/styles.css`
- **Drill data in-file** — no JSON fetch; keeps it self-contained and offline-friendly
- **Empower color palette** — blue `#003B8E` + orange `#F97316` from shared stylesheet
- **Generic sport** — wizard asks sport upfront, filters warmup/drill banks accordingly; not soccer-specific

---

## Source material for demo drills

- `empower-playbook/soccer.html` — 9 drills (Dribbling Agility, Passing Lines, Partner Passing, Pass to Shot, Dribble to Shot, Penalty Shooting, Construction Zone, Longest Shot, Scrimmage)
- `empower/practice.html` — Ball Roll Tag, Sole Taps, Partner Passing, Dribble to Music, Dribble Pass Score, Small-Sided Games

---

## Session log

| Date | What happened |
|---|---|
| 2026-08-29 | v0.1 created: full wizard + builder + modal + 6-sport demo data + LocalStorage |
| 2026-08-30 | v0.2: Rich drill schema (steps/why/volunteerTip/facilitatorTip); soccer bank updated with Week 1+2 drills (16 soccer drills total); drill-admin.html created with form + live preview + library; station-card CSS added to shared stylesheet; print view updated for rich format; LocalStorage drill merge from drill-admin → practice-builder |
