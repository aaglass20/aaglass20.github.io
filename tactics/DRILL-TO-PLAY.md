# Drill → Play: drawing a drill from its text

Paste a drill's write-up (setup, directions, variations…) to Claude and it draws it as a tactics-board play you open with **📂 Open**: players, cones, the ball moving step by step, arrows, and a caption that changes each frame. No video needed.

**Ask Claude:** `/drill-to-play` followed by the drill text, or just "draw this drill as a tactics play" plus the text. (The `/drill-to-play` command lives in `.claude/commands/`, which isn't in git; this guide is the source of truth, so if the command is ever lost, point Claude here.)

---

## How it works

1. Claude writes a short **spec** — `tactics/plays/specs/<drill-name>.json` — describing who's where on each step.
2. `python3 tactics/scripts/build-play.py tactics/plays/specs/<drill-name>.json` turns it into the play file `tactics/plays/<drill-name>.json`.
3. Open it in the board (📂 Open). Everything stays editable — move players, edit words, add frames — and you can Save over it.

When the board opens a file it fills in what a hand-made file leaves out: each label's width (fitted to its words, on every frame), default text styling, and `anchor: "center"` labels placed by their middle.

## Spec format

```jsonc
{
  "title": "50 Touches — Long · Short · Turn",   // big label at the top (optional)
  "sport": "soccer",
  "field": "blank",          // blank / horizontal / half / half-flip / middle: 840 × 544 wide · full: 544 × 840 tall
  "speed": 0.75,             // play speed (1 = normal; 0.75 reads well)
  "objects": [               // every object, with a key you use below
    { "key": "A", "type": "player-t1", "label": "A" },   // label = letter/number on the jersey
    { "key": "D1", "type": "player-t2", "label": "1" },  // team 2 (yellow)
    { "key": "c1", "type": "cone" },
    { "key": "ball", "type": "ball" }
  ],
  "frames": [                // one per step; "at" lists only what moves (the rest stays put)
    { "caption": "Setup: …", "at": { "A": [210, 290], "c1": [210, 324], "ball": [232, 304] } },   // frame 1 places everything
    { "caption": "1. A plays a long pass to C", "at": { "ball": [608, 304] }, "speed": 0.75 }    // optional per-move speed
  ],
  "arrows": [                // drawn on every frame
    { "kind": "arrow", "color": "white", "from": [240, 228], "to": [600, 228] },   // arrow / dashed-arrow / line / dashed / T / dashed-T
  ],
  "labels": [                // small extra text, placed by its middle
    { "text": "long (strong foot)", "at": [420, 200] }   // size 14 italic white by default; color, size, style, bg
  ],
  "notes": { "title": "…", "ages": "…", "variations": ["…"], "coaching": ["…"] },   // kept in the file, not shown
  "out": "tactics/plays/custom-name.json"                 // optional output path
}
```

- **Coordinates** are field pixels from the top-left of the field. On the wide fields (840 × 544) about **16 px ≈ 1 yd** reads well for small-sided drills (25 yd ≈ 420 px); use the full field (544 × 840, ≈ 7.3 px/yd) for whole-field work.
- **Object types** (soccer): `player-t1` (blue, team 1), `player-t2` (yellow, team 2), `player` (unlabeled), `pos-t1` / `pos-t2`, `marker` / `marker2` (numbered discs), `ball`, `cone`, `goal`, `popup-goal`, `freekick`, `arch`, `pole`, `pinnie`, `hoop`. Optional per object: `color` (blue, yellow, red, green, orange, purple, white, black or a hex), `size` (1–6), `facing` (goals, degrees), `locked`.
- **Captions:** each frame's `caption` becomes the bottom label's words on that frame; it types in during playback (`"captionTransition": "fade" | "dissolve" | "type" | "none"` at the top level to change).

## Drawing tips (what worked)

- One frame per direction step; put the **ball at the feet** of whoever has it (≈ 22 px in front, 14 px down) and move it to the receiver's feet on the pass.
- Show runs by moving the player on the same frame the ball arrives (e.g. B checks toward the ball as C passes).
- Arrows: long passes above the line, short passes below, runs dashed; color-code by step and label the important ones.
- Cones under each player's starting spot (≈ 34 px below). Don't lock cones — the padlock badges sit right under the players.
- Last frame: the reset / rotation, with a caption like "Repeat · rotate every 10 passes".
- Wide fields are best on a computer or a sideways tablet; a phone held upright cuts off the right side.

## Examples

- `tactics/plays/specs/50-touches.json` → `tactics/plays/50-touches.json` — 3-player long/short/turn warm-up, 5 frames.
