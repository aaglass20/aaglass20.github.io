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

Storage: **LocalStorage** (key: `bdu_indy_plan_v1`). Supabase integration planned for future.

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
| **Technical** | Individual skill focus: first touch, ball mastery, 1v1 moves, control |
| **Passing** | Primary emphasis is passing accuracy, weight, combination, or distance |
| **Dribbling** | Primary emphasis is dribbling speed, control, or decision-making |
| **Possession** | Keep-away, rondos, maintaining the ball under pressure; team-based |
| **Shooting** | Finishing, shooting under pressure, goalkeeper training included |
| **Tactical** | Transitions, pressing, shape, numbers-up/down scenarios |

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
| `movement-skill-reset` | Movement Skill Reset | Technical | U10 | `MovementSkillResetFindTarget.mp4` | `igs-takeaways.html` |
| `gates-competition-passing` | Gates Competition Passing | Passing | U10 | `Gates competition passing.mp4` | `igs-takeaways.html` |
| `long-passes-4` | Long Passes (4 People) | Passing | U12 | `long passes 4 people.mp4` | `igs-takeaways.html` |
| `get-open` | Get Open | Passing | U10 | `get open.mp4` | `igs-takeaways.html` |
| `gates-competition-dribbling` | Gates Competition Dribbling | Dribbling | U10 | `Gates competition dribbling.mp4` | `igs-takeaways.html` |
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

**Total: 18 drills**

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
