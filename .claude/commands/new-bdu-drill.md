# /new-bdu-drill — Add a drill to the Indy Way Drill Library

Add a new soccer drill to the BDU Indy Way drill library and practice builder.

## Key files
- `BDU/indy-drill-library.html` — `DRILLS` array + modal rendering
- `BDU/indy-practice-builder.html` — `DRILL_BANK` array (full schema)
- `BDU/INDY-WAY.md` — registry, source-page status, data model reference

## Step 0 — Preflight
1. Read `BDU/INDY-WAY.md` → check the **Drill Registry** table. If the drill is already listed, stop and tell the user.
2. Read the **Pierce The Circle** entry in `indy-practice-builder.html` as the gold-standard template — it has every field including `setup`, `howToPlay`, `coachingPoints`, and is the reference for quality.

## Step 1 — Gather drill details
If not provided by the user, ask for:
- **Name** of the drill
- **Description** — what happens in 1–2 sentences
- **Video file** — exact filename in `BDU/vid/` (e.g. `my drill.mp4`), or a subdir path (e.g. `tactics/drill.webm`), or `null`
- **Equipment** needed

Everything else (category, skillLevel, minAge, duration, age variants, coaching cues, setup, howToPlay, coachingPoints, modifications) is **auto-evaluated** below — do not ask the user for these.

## Step 2 — Auto-evaluate (Claude decides, no prompting)

### Category
Pick the single best fit from: Warmup · Technical · Passing · Dribbling · Possession · Shooting · Tactical · Scrimmage.
If two categories apply equally, pick the primary training outcome.

### Skill level
Assign one of three values based on rules + cognitive load:
- `'Beginner'` — U8 floor, ≤ 2 rules, single technical action (e.g. pass, dribble through cones)
- `'Intermediate'` — U10–U12 floor, 2–4 rules, moderate decision-making (e.g. keep-away with scoring rule)
- `'Advanced'` — U12+ floor, tactical elements or multiple simultaneous decisions (e.g. transition, overloads, positional shape)

### minAge
- Warmup, simple Technical, Dribbling gates → `'U8'`
- Possession, Passing combos, moderate Technical → `'U10'`
- Tactical, complex Possession, Shooting with goalkeeper → `'U12'`
- High-decision Tactical, advanced Shooting → `'U14'`

### defaultDuration
- Warmup: 8–12 min · Technical/Passing/Dribbling: 10–15 min · Possession/Tactical: 15–20 min · Shooting: 15–20 min · Scrimmage: 20–35 min

### ageGroups
Start from `minAge` and go up to U16 + Mixed:
- `U8` min → `['U8', 'U10', 'U12', 'U14', 'U16', 'Mixed']`
- `U10` min → `['U10', 'U12', 'U14', 'U16', 'Mixed']`
- `U12` min → `['U12', 'U14', 'U16', 'Mixed']`
- `U14` min → `['U14', 'U16', 'Mixed']`

### Icon
Pick one emoji that fits the drill type (⚽ 🎯 🔄 🏃 ⚡ ↔️ 🚪 🔵 🌊 🥅 🏹 🏟️ ⚔️ etc.).

### id
kebab-case slug from the drill name. Once set, never change it.

## Step 3 — Build the drill object

### Variants — default (always required)

Write full structured detail modeled on Pierce The Circle:

```js
default: {
  desc: 'One clear sentence describing what the drill is.',
  coaching: [           // exactly 3 cues; format: 'Role/focus: specific cue'
    'Attacker: ...',
    'Defender: ...',
    'All: ...',
  ],
  setup: [              // 3–5 items: grid size, player count, equipment config
    'Grid: ...',
    'Players: ...',
    'Equipment: ...',
  ],
  howToPlay: [          // 3–5 items: the rules, how to score, time/round format
    'Objective: ...',
    'Scoring: ...',
    'Game Length: ...',
  ],
  coachingPoints: [     // 3 items; format: 'Heading: explanation'
    'Point 1: ...',
    'Point 2: ...',
    'Point 3: ...',
  ],
  modifications: [      // 2–5 items showing how to adapt for different ages
    'U8/Beginners: simplify by ...',
    'U10–U12: standard game as described above.',
    'U14+/Advanced: challenge by ...',
    'Large groups (10+): ...',   // only if relevant
  ],
}
```

### Variants — age-specific (only when rules meaningfully change)
Write a variant when the drill needs a different setup or rule set for that age — not just minor tweaks.
Each age variant needs `desc` + `coaching` (3 cues). `setup`, `howToPlay`, `coachingPoints`, `modifications` are optional on variants.

Example:
```js
U8: {
  desc: 'Simplified version: smaller grid, no defenders, focus on pass technique only.',
  coaching: ['...', '...', '...'],
},
```

## Step 4 — Add to `DRILL_BANK` in `indy-practice-builder.html`

Place the entry inside the correct category comment block (e.g. `// ── Possession ──`). Full schema:

```js
{
  id: 'kebab-case-id',
  name: 'Display Name',
  icon: '⚽',
  category: 'Possession',
  skillLevel: 'Intermediate',
  minAge: 'U10',
  defaultDuration: 15,
  videoFile: 'filename.mp4',   // null if no video
  equipment: ['Cones', 'Balls'],
  purpose: 'One sentence benefit shown as tooltip.',
  ageGroups: ['U10', 'U12', 'U14', 'U16', 'Mixed'],
  variants: {
    default: { ... },
    U8: { ... },   // only if needed
  },
},
```

## Step 5 — Add to `DRILLS` in `indy-drill-library.html`

Simplified flat schema — no variants needed. One object, place in the matching category section.

```js
{ id: '...', name: '...', icon: '...', category: '...', skillLevel: '...', minAge: '...', duration: N, videoFile: '...', equipment: [...], desc: '...', coaching: [...], setup: [...], howToPlay: [...], coachingPoints: [...], modifications: [...] },
```

### Render `skillLevel` chip — first-time setup check
Grep for `drill.skillLevel` in `indy-drill-library.html`. If it's **not already there**, make these one-time updates:

**In `openModal()` — add chip to the chips row:**
```js
chips.innerHTML = `
  <span class="vid-chip vc-cat cat-${drill.category}">${drill.category}</span>
  <span class="vid-chip vc-age">${drill.minAge}+</span>
  <span class="vid-chip vc-dur">${drill.duration} min</span>
  ${drill.skillLevel ? `<span class="vid-chip vc-skill vc-skill-${drill.skillLevel.toLowerCase()}">${drill.skillLevel}</span>` : ''}
`;
```

**In `buildCards()` — add badge to card-top:**
```html
<div class="card-top">
  <span class="cat-badge cat-${drill.category}">${drill.category}</span>
  <span class="age-chip">${drill.minAge}+</span>
  ${drill.skillLevel ? `<span class="skill-badge skill-${drill.skillLevel.toLowerCase()}">${drill.skillLevel}</span>` : ''}
</div>
```

**Add CSS (inside the `<style>` block):**
```css
.skill-badge {
  font-size: .72rem; font-weight: 700; padding: .15rem .55rem;
  border-radius: 99px; text-transform: uppercase; letter-spacing: .06em;
}
.skill-beginner, .vc-skill-beginner   { background: #d4f5e9; color: #1a7f5a; }
.skill-intermediate, .vc-skill-intermediate { background: #fef9c3; color: #927200; }
.skill-advanced, .vc-skill-advanced   { background: #fee2e2; color: #c0392b; }
.vc-skill { border-radius: 99px; padding: .2rem .65rem; font-size: .75rem; font-weight: 700; }
```

**In `openModal()` — render Modifications section** (after the `coachingPoints` push):
```js
if (drill.modifications) sections.push({ icon: '🔧', label: 'Age Modifications', items: drill.modifications });
```

## Step 6 — Update the hero drill count
Grep the current count in `indy-drill-library.html` (pattern: `"N drills"`). Increment by 1.

## Step 7 — Update `BDU/INDY-WAY.md`
- Add a row to the **Drill Registry** table: `| \`id\` | Name | Category | minAge | video or None | source |`
- Bump the `**Total: N drills**` line
- If the drill came from a source page listed in the Source Pages table, update its transfer status

## Step 8 — Confirm with user
Show a summary card:
```
✅ Drill added: <Name>
   Category: <X>  |  Skill Level: <X>  |  Min Age: <X>  |  Duration: <X> min
   Age variants: <list or 'default only'>
   Modifications: <count> entries
   Video: <filename or none>
```
Then ask: "Commit now, or do you want to review first?"

## Commit (when user confirms)
```
git add BDU/indy-drill-library.html BDU/indy-practice-builder.html BDU/INDY-WAY.md
git commit -m "add BDU drill: <Name>"
```
