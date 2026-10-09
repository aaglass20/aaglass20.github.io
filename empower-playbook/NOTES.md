# Empower Playbook — Project Notes

Standalone adaptive-sports resource for BDU × Empower Sports volunteers.
**Separate from `/empower/`** (the iCan Soccer signup/practice site).

---

## Pages

| File | What |
|---|---|
| `index.html` | Home — sport card grid + program intro |
| `basketball.html` | Basketball drills, rules, volunteer tips |
| `softball.html` | Softball drills, rules, volunteer tips |
| `football.html` | Football drills, rules, volunteer tips |
| `pickleball.html` | Pickleball drills, rules, volunteer tips |
| `soccer.html` | Soccer drills, rules, volunteer tips |
| `kickball.html` | Kickball drills, rules, volunteer tips |
| `volunteer.html` | General volunteer guide |
| `programs.html` | Programs hub — create wizard + dashboard (week × group grid) |
| `practice-builder.html` | Wizard + plan builder (see PRACTICE-BUILDER.md) |
| `drill-admin.html` | Drill library CRUD UI (LocalStorage → practice-builder) |

---

## Stack

- Vanilla HTML/CSS/JS — no build step
- Shared stylesheet: `css/styles.css`
- Colors: blue `#003B8E` + orange `#F97316`
- Fonts: Inter via Google Fonts
- No backend — LocalStorage for practice plans and programs
- No external JS dependencies

---

## LocalStorage Keys

| Key | What |
|---|---|
| `empowerPracticePlan` | Single standalone plan (practice-builder standalone flow) |
| `empowerPlans` | Object keyed by plan ID — all plans created from a program context |
| `empowerPrograms` | Array of Program objects (see schema below) |
| `empowerDrillBank` | Custom drills added via drill-admin.html |

### Program Schema
```js
{
  id: 'prog_timestamp_rand',
  name: 'Fall 2026 Soccer',
  sport: 'soccer',
  sportIcon: '⚽',
  sportName: 'Soccer',
  numWeeks: 8,
  weeks: [{ weekNum: 1, date: 'YYYY-MM-DD' | null }, ...],
  groups: ['Competitive', 'Skills A', 'Skills B'],
  plans: { 'w1-Competitive': 'plan_id', ... },
  createdAt: '2026-10-01T...',
}
```

### Plan Schema (program-context)
```js
{
  id: 'plan_timestamp_rand',
  programId: 'prog_...',      // null for standalone plans
  weekNum: 1,
  group: 'Competitive',
  sport: 'soccer',
  sportIcon: '⚽',
  sportName: 'Soccer',
  durationMinutes: 75,
  hasWarmup: true,
  blocks: [...],
  createdAt: '...',
  updatedAt: '...',
}
```

---

## Practice Builder

Full dev log in **PRACTICE-BUILDER.md**.

Current version: **v0.3 + program context**

Key facts:
- LocalStorage key: `empowerPracticePlan` (standalone) / `empowerPlans` (program-linked)
- Drill bank is inline in `practice-builder.html` (no JSON fetch)
- Drill admin (`drill-admin.html`) lets you add drills and merges them into LocalStorage for the builder
- Equipment checklist auto-generated from `DRILL_EQUIPMENT` lookup table
- Program context: launched via URL params `?programId=&week=&group=&sport=`; saves to `empowerPlans` and updates the program's `plans` map

Open gaps:
- Reorder blocks (drag or arrows)
- Edit block duration inline
- More drills for non-soccer sports
- Scrimmage block type
- Supabase sync / named plan saves (future)
- React/Vite conversion (future)

---

## Programs (programs.html)

Three views in a single page (no routing library):
1. **Home** — programs list; empty state with CTA
2. **Create Wizard** — 4 steps: Name+Sport → Sessions (+ optional dates) → Groups → Review
3. **Dashboard** — week × group grid; each cell links to practice-builder with URL params

Group count options:
- 1 group → defaults to `['Skills']` (editable)
- 2 groups → defaults to `['Competitive', 'Skills']`
- 3 groups → defaults to `['Competitive', 'Skills A', 'Skills B']`

URL param `?openProgram=<id>` goes straight to the dashboard for that program.

---

## Drill Data Model (practice-builder.html)

Each drill has:
```js
{
  id: 'unique-id',
  sport: 'soccer',          // filters in builder
  category: 'Dribbling',    // tab label in modal
  name: 'Cone Slalom',
  description: '...',
  purpose: '...',
  volunteerTip: '...',
  facilitatorTip: '...',    // optional
  equipment: ['cones'],     // matches DRILL_EQUIPMENT keys
  steps: ['...'],           // rich schema (v0.2+)
}
```

Warmup bank is separate (`warmupBank`) — same sport filter, used in Warmup block type only.

---

## Hosting & Infrastructure

- **New standalone site** — `empowersports.io` (or similar), separate from `aaglass20.github.io`
- **Own Supabase project** — dedicated DB, not shared with `/schedule/` or `/empower/`
- Stack stays: vanilla HTML/CSS/JS (or React/Vite when complexity warrants) + Supabase for all persistence
- GitHub Pages for static hosting; Supabase for data

### Supabase migration notes (future)
When the time comes, the LocalStorage schema maps directly to tables:
- `empowerPrograms` → `programs` table + `program_weeks` table
- `empowerPlans` → `plans` table (with `program_id`, `week_num`, `group_name` FK columns)
- `empowerDrillBank` → `drills` table

---

## Feature Roadmap (brainstorm — 2026-10-01)

### Practice Builder — Plan Creation
- [ ] **Drill search** — search/filter bar inside the Add Block modal so leaders can find drills quickly without scrolling category tabs
- [ ] **Edit volunteer notes inline** — editable per-block volunteer tip in the plan view; read-only now, will hook into DB when Supabase lands

### Programs
- [ ] **Edit program** — rename, add/remove weeks, change dates from the dashboard
- [ ] **Delete program** (with confirmation)
- [ ] **Copy program** — duplicate groups + week structure; plans start fresh

### Print / Output Formats
Three target audiences, three output forms:

| Format | Audience | Notes |
|---|---|---|
| **Condensed one-page print** | Drill leaders | Fits on one sheet; block names, durations, key cues only — no full descriptions |
| **Hard copy (full)** | Staff / archive | Current print view — all block details |
| **Large signs at event** | Athletes at stations | Big-font station card per drill; one drill per sign; equipment + cue only |

- [ ] Condensed print view — new `?print=compact` mode or a separate print stylesheet that collapses descriptions
- [ ] Large sign generator — per-drill printable card, oversized font, single cue, 1 per page

#### Print field toggles (before printing, user picks what to include)
- [ ] **Why we do this** (purpose field) — on/off toggle
- [ ] **Volunteer tips** — on/off toggle
- [ ] **Facilitator tips** — on/off toggle
- Toggling off any field collapses it from the print output; good for keeping condensed view tight
- Could be a small "Print options" panel that appears when you click Print

### Volunteer Management
- [ ] **Volunteer profiles** — name, region, experience level, skills, availability
- [ ] **Volunteer grade/rating** — system-assigned based on experience + past events + feedback (needs a comforting name too — "Experience Level"? "Readiness"?)
- [ ] **Region matching** — when building a plan, system filters volunteers by proximity to the facility
- [ ] **Suggest Volunteers button** — on a plan/event, shows a ranked list of available volunteers matched by: region + experience + the plan's support needs (Comfort Profile mix)
- [ ] **Need matching** — if roster has high-support participants, system prioritizes experienced volunteers
- Design note: think through the matching formula — region radius, experience weight, availability check

### Admin / User Roles
- [ ] **User base** — accounts (PIN or email); persisted via Supabase
- [ ] **Viewer role** — read-only access; can view plans, drills, social story; cannot edit or build
- [ ] **Plan Builder role** — can create/edit plans, add blocks, print; cannot edit drill content
- [ ] **Admin role** (implied) — full access: drill library, volunteer/facilitator tip edits, user management
- Drill content editing (volunteer tips, facilitator tips, purpose) stays locked for Viewer + Plan Builder until DB hookup lands

### Equipment
- Currently: equipment checklist is auto-generated at the bottom of the plan from `DRILL_EQUIPMENT` lookup — aggregated/deduplicated across all blocks
- [ ] **General equipment list** — show a master "what you'll need today" summary at the top of the plan (all drills combined, deduplicated)
- [ ] **Per-drill equipment breakdown** — option to show equipment inline on each plan block (not just in the footer checklist)
- [ ] Equipment also appears on print output — should respect the same drill-by-drill vs. summary toggle

### Social Story Schedule (share with families)
- Families of athletes with special needs benefit from a **visual schedule** sent home before the event
- Format: step-by-step "what will happen today" — sequential, plain-language, image-supported
- This is a recognized AAC/special needs communication tool ("social story" or "visual schedule")
- [ ] Digital social story — shareable link or PDF; each block becomes a visual step card (icon + 1-sentence plain-language description)
- [ ] **Video clips** — attach actual footage to each drill/activity step for the digital version; families can watch what to expect
- [ ] Print social story — same visual schedule, printable; families can review at home before the event
- [ ] Large event signs — matches the printed social story format; posted at stations day-of so athletes recognize the activity

### Output Matrix

| Need | Format | Owner |
|---|---|---|
| Run the session | Condensed 1-page print | Drill leader |
| Full reference | Hard copy (current print) | Staff |
| Pre-event prep | Digital social story (with video) | Families |
| Take-home visual | Print social story | Families |
| Day-of wayfinding | Large station signs | Athletes |

---

### Core Architecture — Programs > Groups > Plans

```
Program
 ├── name, sport, season
 ├── number of sessions (weeks)
 ├── weeks: [{ weekNum, date? }]
 ├── groups: string[]   // e.g. ['Competitive', 'Skills A', 'Skills B']
 └── plans: { 'w1-Competitive': planId, ... }
```

Plans are created from the dashboard by clicking a cell in the week × group grid.
The practice-builder is launched with URL params: `?programId=&week=&group=&sport=`

Future additions (not yet built):
- [ ] Roster per plan (Participants)
- [ ] Coach list per plan
- [ ] Volunteer assignments
- [ ] Facility inventory

### Participants / Roster
- [ ] Each plan has a **coach list** (coaches assigned to this session)
- [ ] Roster on a plan — import from a prior session or enter fresh

### Facility Inventory
- [ ] Each facility has a record of what's available: courts, fields, equipment on-site
- [ ] Plan builder uses facility inventory to validate equipment needs
- [ ] Map, directions, and access notes

### Participants
- [ ] **API research** — investigate registration system APIs (Special Olympics, ActiveNet, SportsEngine, etc.)
- [ ] **Competitive vs. non-competitive flag** — per participant; drives group placement

### Participant Support Profile ("Comfort Profile")
- Support needs (sensory, motor, communication, behavioral)
- Preferred activities / what they respond well to
- Things to avoid
- 1:1 support required?
- Overall profile tier (1 = largely independent → 3 = high support)

**System-driven outputs (formula, not manual math):**
- [ ] Auto-calculate: volunteers needed for this roster
- [ ] Auto-calculate: coaches needed
- [ ] Auto-calculate: equipment adjustments
- [ ] Flag drills that need modification for the roster's profile mix
- [ ] Staffing recommendation card per event

---

## Test Coverage

All tests use `window.__EMPOWER_NO_SUPABASE__ = true` (set via `addInitScript`) to force db.js to skip Supabase and use localStorage. No test ever hits the real database.

### Covered

| Spec | Scenarios |
|---|---|
| `smoke.spec.js` | Nav links, hero renders for every page |
| `sports.spec.js` | Hero + drills rendering for Basketball, Softball, Football, Pickleball |
| `soccer.spec.js` | Drills, plan week tabs, equipment, scrimmage card |
| `volunteer.spec.js` | Hero |
| `empower-way.spec.js` | Hero |
| `locations.spec.js` | Hero, page loads, add-location form (name, save btn, cancel) |
| `drill-admin.spec.js` | Hero, page loads, add-drill button |
| `practice-builder.spec.js` | Hero, wizard steps 1–4, builder view, Add Block modal |
| `plan-library.spec.js` | Hero, page loads, New Plan → navigate; seeded: card visible, view panel, edit overlay, close editor, plan name in bar |
| `programs.spec.js` | Hero, page loads, create button, wizard steps 1–2; seeded: program card, dashboard slide-in, assigned plan cell, plan view panel, pb-overlay via Edit Plan |

### Gaps — Tests to Write

**Programs**
- [ ] `programs — wizard creates program (mocked)` — complete steps 1-4 → click Create → expect program card on home; uses localStorage save (no network needed)
- [ ] `programs — plan assignment via Add Plan` — open dashboard, click empty slot "+ Add Plan", pick from list, verify cell fills; requires seeded plan + program
- [ ] `programs — delete program` — check a card, click Delete, confirm, verify card removed
- [ ] `programs — wizard steps 3 & 4 render` — navigate to groups step and review step to verify UI

**Plan Library**
- [ ] `plan-library — delete plan` — seeded card visible, click Delete, confirm, verify card removed

**Practice Builder**
- [ ] `practice-builder — edit existing plan (mocked)` — seed a plan in localStorage, open builder with `?planId=`, verify builder loads with correct plan name and blocks
- [ ] `practice-builder — save plan` — reach builder view, click Save button, verify success toast

**Locations**
- [ ] `locations — edit and delete (mocked)` — seed a location, verify edit form pre-fills, verify delete removes it

**Drill Admin**
- [ ] `drill-admin — create drill (mocked)` — fill add-drill form, save, verify drill card appears
- [ ] `drill-admin — edit/delete drill (mocked)` — seed a drill, edit name, delete, verify state

---

## Open Questions / To-Do

- [ ] Add more drills for basketball, softball, football, pickleball, kickball
- [ ] Scrimmage block type in practice builder
- [ ] Reorder / inline-edit blocks
- [ ] Start time field → clock times on timeline
- [ ] Supabase sync for named plans
- [ ] Edit/delete program from dashboard
- [ ] Copy program feature

---

## Session Log

| Date | What |
|---|---|
| 2026-08-29 | v0.1 — full wizard + builder + 6-sport demo data |
| 2026-08-30 | v0.2 — rich drill schema; soccer 16 drills; drill-admin.html |
| 2026-09-05 | v0.3 — equipment checklist |
| 2026-10-01 | Programs arch — programs.html (wizard + dashboard); practice-builder updated with program context (URL params, empowerPlans, context banner); Programs nav link added to all pages |
| 2026-10-07 | React+Vite scaffold — package.json, vite.config.js, HashRouter, 14 page stubs, Nav/Layout components, Playwright smoke suite (5 tests); dev port 5177, preview port 4177; legacy HTML preserved as *.legacy.html |
| 2026-10-07 | Soccer page converted — DrillCard, SectionHeader, TabGroup, PlanRow shared components; src/data/soccer.js; 10 soccer Playwright tests (drill tabs, plan week tabs, equipment, scrimmage card); 15/15 green |
| 2026-10-09 | pb-overlay — edit-in-place PracticeBuilder overlay on Programs page (editPlanId/editOverlayOpen state, .pb-overlay CSS, overlay bar with Close Editor + plan name); Supabase dual-persistence + try-catch fallback in db.js; mocked Playwright tests for plan-library and programs (dashboard, plan view, pb-overlay); all tests switched to window.__EMPOWER_NO_SUPABASE__ test flag in getSb() to prevent any real DB connections |
