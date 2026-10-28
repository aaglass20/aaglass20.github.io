# Soccer Tactics Board — Design Rules

## Field

- Canvas size: **928 × 632px** (field 840×544 + 44px padding on each side)
- Field color: `#2d8b2d` (grass green)
- All field lines: white, 2–2.5px stroke
- Field dimensions at **8px per meter** (105m × 68m standard)
- Goals render as semi-transparent white rectangles extending beyond the field boundary

## Sports (`SPORTS`, dropdown at the left of the header)

- **Soccer** and **Basketball**. The sport picks the field drawing, the object list and the player kit.
- Each `CATALOG` entry lists its `sports`. Shared: Player / Player 1 / Player 2, Team 1 / Team 2, Cone, Pinnie. Soccer only: Soccer Ball, Goal, Hoop, Pole, Pop-up Goal, Free Kick, Arch. Basketball only: Basketball.
- Switching sport **clears the board and undo history** (after a confirm if anything is on it), so objects never cross sports.
- Saved plays store `sport`; older files without it open as soccer.
- Players take `kit = sport`: basketball draws a sleeveless tank (`tankPath`) with bare arms (`armsPath`) and contrast trim (white, or dark on light colors) instead of the sleeved jersey.
- The sidebar Objects icon and the Fields panel title/labels follow the sport (Courts: Full Court, Half Court, Half Court (flip), Mid Court, Blank).

## Basketball Court (`BasketballCourt`)

- NBA geometry in **feet** (50 × 94): drawn inside a scaled Konva Group with line width `2.2px / scale`.
- Floor: soft orange maple planks (`getFloorPattern`, tiled), lighter tint inside the boundary, key + center circle painted `COURT_PAINT`. White lines; orange rim, white backboard.
- `CourtEnd` draws one end with the baseline at y = 0 (key 16×19, FT circle solid/dashed halves, lane hash marks + block, 3-pt corner lines at 3 ft meeting a 23.75 ft arc, 4 ft restricted arc). The far end is the same component mirrored.
- Views reuse the soccer canvases and drag bounds:
  - **Full Court**: portrait 544×840, court fit to height (centered, floor apron at the sides).
  - **Half Court**: landscape 840×544, basket at the bottom (`scaleY` negative), half-court line on the top edge. **Flip** puts the basket at the top.
  - **Mid Court**: landscape, court turned 90° and centered on the half-court line; ends are clipped. Planks rotate with it.
  - **Blank**: floor only.
- Field-panel thumbnails for basketball are CSS-only (`.field-preview[data-sport="basketball"]`).

## Object Model

Every placed object has:

| Field      | Type    | Notes |
|------------|---------|-------|
| `id`       | number  | Auto-incrementing integer; never reused within a session |
| `type`     | string  | `'ball'` or `'player'` (more types TBD) |
| `size`     | 1–6     | Maps to radius via `SIZE_RADII = [10, 13, 17, 22, 27, 34]`; default 3 |
| `rotation` | 0–359   | Degrees; increments by 90 via context menu |
| `color`    | hex     | Players only; jersey color; default `#ef4444` (red) |

**Position is NOT stored on the object** — it lives in the frame system.

## Drag Bounds

An object's **center** is clamped to the green area (field + `GBUF` border, plus the goal depth on the full field), so any object can sit right at the edge and hang up to half off. The video export records the stage, so anything past it is simply cropped, and nothing can be lost off-screen.

Konva's `dragBoundFunc` works in **absolute (on-screen) coordinates**, so the stage-unit bounds are multiplied by `fieldScale`. (Before this fix, a scaled-down board stopped objects short of the left/top edges and let them leave the board on the right/bottom.)

## Save / Open

**💾 Save** writes the whole play to a `.json` file; **📂 Open** loads one (both disabled while playing).

- **File:** `{ format: 'tactics-board', version: 1, savedAt, field, playSpeed, placedObjects, frames, freePaths, drawings, shapes, textItems, nextIds: { object, draw, shape, text } }`
- **Save:** uses the native Save dialog (`showSaveFilePicker`, Chrome/Edge) to pick the name and folder; other browsers get a name prompt and a download. The last used name (`playName`) is suggested next time.
- **Open:** a hidden file input. It validates `format` and that `frames` is non-empty (otherwise an alert, and the board is untouched), then clears the board, **resets undo history**, restores everything, and sets each ID counter to the larger of the saved value and max-id + 1 so new objects never collide.
- Bump `SAVE_VERSION` and handle the old shape in `openAnimation` if the format changes.

## Frame System

- Each frame is `{ positions: { [objectId]: { x, y } } }`
- Positions use **stage coordinates** (layer offset `PAD=44` is already baked in — drag constraints use `PAD+r` as the minimum)
- Adding a new frame copies the **current frame's** positions as the starting point
- Adding a new object registers its random initial position in **all existing frames**
- Deleting an object removes it from all frames

## Animation

- Segment duration: **900ms** (`FRAME_MS`)
- Easing: ease-in-out (`t < 0.5 ? 2t² : -1 + (4-2t)t`)
- Animation bypasses React re-renders — uses direct `node.position()` + `layer.batchDraw()` at 60fps
- React state (`currentFrame`) is updated only at segment boundaries, where values already match Konva's position — no visual snap
- Objects absent from either `fromPos` or `toPos` in a segment are skipped (no crash)

## Motion Trails

- Shown only when NOT playing and there are 2+ frames
- Dashed yellow line (`rgba(255,220,0,0.4)`, 2px, dash `[8,6]`) connecting each object's position across consecutive frames
- `listening={false}` — not interactive

## Context Menu

Triggered by **double-click** on any object. Contains:

1. **Color** — 8 color swatches (types in `COLORIZABLE`)
2. **Facing** — compass grid (3D models only: goals, pop-up goal, free-kick mannequin, arch)
3. **Size** — 6 dot buttons, visually sized to match their radius
4. **Rotate 90°** — increments `rotation` by 90 mod 360 (only the pinnie now; everything else is `isUpright` — it stays upright or uses Facing)
5. **Layer** — Front / Forward / Backward / Back (`reorderObject(id, mode)`). Layer order is the object's position in `placedObjects` (later entries draw on top); buttons disable at the top/bottom. Undoable, and saved with the play.
6. **Duplicate** — copies all metadata + positions in every frame, offset +28px
7. **Delete** — removes from all frames

Closes on: overlay click, Escape key, or after Delete/Duplicate.

**Dimensional styling** (block at the end of `App.css`, all scoped to `.ctx-menu`, so the same controls elsewhere are unaffected). Light comes from the top left, like the field objects:
- Panel: a vertical gradient with an inset top highlight and bottom edge, plus a layered drop shadow, so it looks lifted
- Dividers: grooves (a dark line with a 1px light line under it)
- Color swatches: glossy beads (an inset bottom shade, a drop shadow, and a `::after` radial highlight; the swatch color stays an inline `background`)
- Size dots: shaded spheres; the active one is a green sphere
- Compass keys: raised buttons (a top highlight and 2px bottom ledge) that move down 2px and go inset-shaded when pressed or active
- Action rows: a soft raised strip on hover

## Object Rendering

All objects render as Konva `Circle` with `fillPatternImage`. The circle clips the image automatically — no separate Konva mask needed.

### Adding a new object type

Every object is now drawn in code on a canvas (no source images), in the shared style: light from the upper left, a soft shadow cast down-right on the grass, a dark outline baked in.

1. Add `{ type, label, src: null }` to `CATALOG` in `App.jsx`
2. Write a renderer. For simple equipment, add `drawX(ctx, S, hex)` and register it in `EQUIP_RENDERERS` (it gets caching, the catalog preview and the fill automatically). Bigger families have their own: `getPlayerCanvas`, `getMarkerCanvas`, `getGoalCanvas`.
3. Add the type to `DEFAULT_COLORS` + `COLORIZABLE` if it takes a color
4. If its shading shouldn't spin, make sure `isUpright(type)` returns true (hides Rotate 90° and forces `rotation=0`)
5. Update `DESIGN.md`

### Fill props contract (`getObjectFill`)

Every type must return one of:
- `{ fillPatternImage, fillPatternOffset, fillPatternScale, fillPatternRepeat: 'no-repeat' }` — for image-based objects
- `{ fill }` — fallback while image is loading

Scale the image so its **height** fills the circle diameter: `scale = (r * 2) / canvas.height`. This keeps the figure proportional and fully visible within the circle.

Offset centers the image on the circle origin: `{ x: canvas.width / 2, y: canvas.height / 2 }`.

### Stroke rule

- All objects: `strokeEnabled={false}`. Every renderer bakes its own outline into the canvas.
- New types: use `strokeEnabled={false}` if the canvas pipeline bakes an outline; use a stroke if it doesn't

---

## Player Figure (`player`, `player-t1`, `player-t2`)

Generated by `getPlayerCanvas(hexColor, number = null)` on a 192×192 canvas (`PLAYER_PX`), with no source image. Cached by `hex|number`. It replaced the old `player1.png` recolor pipeline.

A head-and-jersey bust (same silhouette as the old icon) drawn as a shaded figurine, in this order:
1. **Ground shadow:** a blurred ellipse cast down-right (light from the upper left)
2. **Outline:** the jersey, head and neck paths stroked wide in dark `rgba(0,0,0,0.8)` first, so the fills sit inside a crisp border
3. **Neck:** a skin rounded-rect that fills the collar opening, darker under the chin
4. **Jersey:** `jerseyPath()` traces shoulders, short sleeves and a collar dip in unit coords. It's filled with the object color, then clipped shading on top: a horizontal gradient (highlight left-of-center, shade on the right) for a cylindrical look, a vertical gradient (lighter shoulders, darker hem), darker sleeve cuffs, faint sleeve seams, and the head's shadow on the chest. A collar band follows in a 40% darker shade.
5. **Number** *(optional)*: centered on the chest, white with a dark stroke (dark with a light stroke on light jerseys, luminance > 170). Smaller for 2-digit numbers.
6. **Head:** a sphere radial gradient in skin tones (`PLAYER_SKIN`) with a rim highlight at the upper left

### Types (`PLAYER_TYPES`)
| Type | Card label | Number | Default color |
|------|-----------|--------|---------------|
| `player`    | Player   | none | Blue `#3b82f6` |
| `player-t1` | Player 1 | 1–20 | Blue `#3b82f6` |
| `player-t2` | Player 2 | 1–20 | Yellow `#facc15` |

- **Numbering:** `player-t1` and `player-t2` are in `NUMBERED_TYPES` with the markers, and follow the same rules (`nextFreeNumber`): each type counts separately, a new one takes the lowest free number, Duplicate takes the next free number, and the card + Duplicate disable at `NUMBER_MAX = 20`. Player numbers are separate from marker numbers.
- **Default size:** `PLAYER_DEFAULT_SIZE = 4` for all player types (one step up from the shared default of 3) so chest numbers are readable
- **No rotation:** Rotate is hidden and rendering forces `rotation=0` so the figure stays upright
- **Catalog cards:** `playerPreview()` for the plain player; `numberedPreview(type, n)` for the teams (shows the next number)

## Generated Equipment (`ball`, `basketball`, `cone`, `hoop`, `pole`, `pinnie`)

`getEquipCanvas(type, hexColor)` dispatches to `EQUIP_RENDERERS[type]` on a 192×192 canvas (`EQUIP_PX`). Cached by `type|hex`, previewed on catalog cards by `equipPreview(type)`. These replaced the photo-based images and the old knockout/recolor/outline pixel pipeline.

Shared helpers: `softShadow(ctx, S, draw, dx, dy, blur, alpha)` (solid shape on a scratch canvas, composited blurred and offset), `sideShade(...)` (a light→dark gradient across a shape), `luminance(hex)`, and `OUTLINE` (`rgba(0,0,0,0.8)`).

**View:** the ball, hoop and pinnie are seen from above. The cone and pole use a lower, more side-on view than the goals so their shape reads at small sizes. Their ground circles become ellipses `EQUIP_SQUASH = 0.5` as tall as they are wide. (Through the goals' steep camera, a squat disc cone is just a circle.)

| Type | Default | Drawing |
|------|---------|---------|
| `ball`   | White `#f9fafb` (the classic ball) | Shaded sphere: a center pentagon plus 5 rim pentagons squashed by the curve, seams between them, a radial shade, a blurred specular highlight and an outline. **Color = ball base**; patches are black, or white when the base is dark (luminance < 110), so every swatch keeps a visible pattern |
| `basketball` | Orange `#e8742a` | Shaded sphere with a pebble-dot grain and black channels (equator, meridian, two curved side seams), tilted slightly toward the light. Channels turn white on very dark colors (luminance < 70) |
| `cone`   | Red `#ef4444`    | Side-on disc cone (frustum): side shading, 2 ridge rings across the front (a dark groove with a light edge), an open top drawn as a dark hole with a lit far rim |
| `hoop`   | Blue `#3b82f6`   | A tube ring on the grass: outline ring, color ring, then the same ring shifted down-right (shade) and up-left (highlight), so the lit side stays consistent all the way round |
| `pole`   | Yellow `#facc15` | Disc base (a short cylinder with a lit top face), an upright rod lit on the left with a rounded cap, and a collar at the join. Its shadow stretches across the grass to the lower right |
| `pinnie` | Red `#ef4444`    | A flat mesh vest: outline, side shading, a dot mesh texture, 2 soft folds (crease + highlight), and contrast trim on the neck, armholes and wavy hem (gold, or dark on light colors with luminance > 170). Drawn at 90% so the hem stays inside the circular clip |

- **Rotation:** ball, cone, hoop and pole are upright (`isUpright`), so Rotate is hidden. The pinnie lies flat and keeps Rotate 90°.
- `soccerball.png` is still used as the sidebar's Objects icon for soccer (basketball uses the generated ball). The other old images (`cone.png`, `hoop.png`, `pinnie.png`, `pole.png`, `player1.png`, `popup-goal*`) are no longer used by the app.

## Object Colors (8 swatches, `OBJECT_COLORS`)

| Color   | Hex       |
|---------|-----------|
| Red     | `#ef4444` |
| Blue    | `#3b82f6` |
| Yellow  | `#facc15` |
| Green   | `#22c55e` |
| White   | `#f9fafb` |
| Black   | `#1f2937` |
| Orange  | `#f97316` |
| Purple  | `#a855f7` |

## Clear Button

- Resets: `placedObjects → []`, `frames → [{positions:{}}]`, `currentFrame → 0`
- Also: cancels any active animation, closes context menu
- Does NOT reset `nextId` (avoids any ID collision with stale Konva refs)

## Sidebar

- Fixed 66px wide; icon buttons toggle panels
- Currently active panel: `objects` (shows catalog grid)
- Disabled panels: Zones, Text, Draw (future)

## Catalog / Objects Panel

- `CATALOG` drives the panel grid and `addToField()` dispatch. Each entry is `{ type, label, src }`, and `src` is `null` for every type now (all generated). The startup image loader skips null sources.
- Card images are generated previews: `playerPreview`, `numberedPreview` (shows the next number), `goalPreview` (on a grass patch), `equipPreview`
- Clicking an object card adds one instance; clicking multiple times adds multiple

### Current catalog

| Type | Renderer | Canvas | Notes |
|------|----------|--------|-------|
| `ball`   | `drawBall`     | 192×192 | Classic white by default; color = base |
| `player` | `getPlayerCanvas` | 192×192 | Shaded head-and-jersey figurine, no number |
| `player-t1` / `player-t2` | `getPlayerCanvas` | 192×192 | Same figurine, numbered 1–20 per team |
| `marker` / `marker2` | `getMarkerCanvas` | 160×160 | Beveled numbered pucks, Team 1 / Team 2 |
| `goal`   | `getGoalCanvas` | 256×256 | 3D full-size goal, 8 facings |
| `popup-goal` | `getGoalCanvas` | 256×256 | 3D pop-up goal, 8 facings |
| `freekick` | `getGoalCanvas` | 256×256 | 3D free-kick mannequin, 8 facings, front/back cues |
| `arch`   | `getGoalCanvas` | 256×256 | 3D training arch, 8 facings (symmetric) |
| `cone`   | `drawCone`     | 192×192 | Side-on disc cone |
| `hoop`   | `drawHoop`     | 192×192 | Tube ring |
| `pinnie` | `drawPinnie`   | 192×192 | Mesh vest, keeps Rotate 90° |
| `pole`   | `drawPole`     | 192×192 | Base + upright pole |

## Numbered Team Markers (`marker` = Team 1, `marker2` = Team 2)

Generated on a canvas by `getMarkerCanvas(hexColor, number)`, so there's no source image. Cached by `hex|number`.

- **Types:** both are in `MARKER_TYPES` (render checks) and `NUMBERED_TYPES` (numbering, shared with the numbered players). A Team 3 only needs a `CATALOG` entry, a `DEFAULT_COLORS` entry, and to be added to `MARKER_TYPES` + `NUMBERED_TYPES` + `COLORIZABLE`.
- **Numbering:** each team counts separately. A new marker takes the **lowest number its own team isn't using**, 1–20 (`nextFreeNumber(objects, type)`). If you delete #3, the next one added is #3. Duplicate also takes the next free number. Once 20 are on the field, the catalog card and Duplicate are disabled.
- **Object field:** `number` (marker only)
- **Default colors:** Team 1 Blue `#3b82f6`, Team 2 Yellow `#facc15`. Both recolor with the same 8 swatches as Player
- **Look:** dark outline → dark base (shows as a bevel rim along the bottom) → top face shifted up with a radial highlight → white number (dark `#111827` on light colors, luminance > 170)
- **Konva drop shadow** (marker only): black, blur 5, offsetY 3, opacity 0.45
- **No rotation:** Rotate is hidden in the context menu and rendering forces `rotation=0` so numbers stay upright
- The catalog card shows a live preview with the next number (`numberedPreview`)

## 3D Models (`goal`, `popup-goal`, `freekick`, `arch`)

All are generated by one renderer, `getGoalCanvas(type, hexColor, facing)`, with no source images. They're cached by `type|hex|facing`. `MODEL_TYPES` lists them (renamed from `GOAL_TYPES` when the mannequin joined), and every 3D-model check uses `MODEL_TYPES.has(type)`.

### Camera + facing
- **Camera:** a fixed oblique view from the south-southeast and above: `screen = (x − z·GOAL_SKEW, y − z·GOAL_TILT)` with `GOAL_TILT = 0.6` and `GOAL_SKEW = 0.25`. The sideways lean keeps height visible when a goal faces E/W (without it, the vertical arch or posts collapse into a line).
- **Facing:** the `facing` field is a compass heading in degrees for the model's front: a goal's mouth, the mannequin's front face (0 = N, 90 = E, 180 = S default). It steps in 45° increments (8 directions). Facing rotates the **model** (yaw), never the Konva node (`rotation` is forced to 0), so shading, shadow side and perspective stay consistent.
- **Scale:** `goalFit(model)` computes one center + scale per model from the largest extent across all 8 facings, so a goal doesn't change size as it rotates. On the field, goals render at `GOAL_RADIUS_MULT = 2`× the shared size radii. Default sizes are in `GOAL_DEFAULT_SIZE` (`goal: 4` ≈ true scale on the full field, `popup-goal: 3`).

### Model format (`GOAL_MODELS`)
Local coords: `u` across the mouth, `v` forward (the net sits at negative `v`), `z` up. All widths are in model units, so they scale with the goal.
- `bars`: polylines `{ pts, w, color: 'frame' | hex, dark? }`. `'frame'` uses the object's color; `dark` makes it 25% darker (used for back and ground bars)
- `nets`: grids (rows of 3D points). The mesh draws along both directions, and the fill uses the grid's outline. `quadGrid(p0..p3, step)` builds one from a flat quad.
- `joints`: dots `{ p, r, color }`
- `plates`: solid boards `{ pts, normal, t, front?, back? }`: a polygon, its local normal (the front side) and its thickness. Drawn as a stack of 6 slices along the normal (outline around all of them, the far ones in a 45% darker edge color, the near face on top), so the board has a visible edge when turned. The visible face is whichever side's normal has a positive component along the camera's view direction `VIEW = (GOAL_SKEW, GOAL_TILT, 1)`. It's lit by that face's normal against `LIGHT` (upper left), with a top-light gradient. `front` / `back` hold details drawn only on that face: `dots` (perforations), `bands` (dark filled shapes), `ribs` (raised lines), `shade` (extra lighten/darken).
- `netLine` / `netFill`: mesh and fill colors

**Painting:** soft ground shadow first (light from the upper left; net outlines and bars projected onto the grass, then blurred), then nets, bars and joints sorted far → near by `y + z·0.5`. Bars get a dark outline, their color, and a highlight along the upper-left edge so they read as tubes.

### `goal` — full-size goal (`BOX_GOAL_MODEL`)
Width 6, height 2, roof depth 1, base depth 2.2. It has front posts + crossbar (thick), roof supports, a top-back bar, slanted back stanchions and ground bars (thin, darker), plus 4 net quads (roof, back, sides) with a white mesh. Default color white `#f9fafb`.

### `popup-goal` — pop-up goal (`POPUP_GOAL_MODEL`)
Replaced the old photo-based pop-up (8 image positions A–H with flips/rotations). This one is modeled on the half-moon style pop-up:
- Front **arch**: a semi-ellipse in the mouth plane (width 4, height 2.3), as a thick fabric-sleeve bar
- **Ground hoop**: a semi-ellipse lying flat behind it (depth 2.4), as a sleeve bar (darker)
- **Net**: a ruled surface from arch to hoop, billowed up/back by `sin(πs)`, with a dark mesh (`rgba(17,24,39,0.6)`) like the real net
- **Strap**: a black bar across the front on the ground, with a frame-colored clip dot at the center and gray corner joints at the feet
- Default color orange `#f97316` (sleeves + clip)

The old `popup-goal*.jpg/png` files in `public/` are no longer used by the app.

### `freekick` — free-kick mannequin (`FREEKICK_MODEL`)
Modeled on a wall mannequin used for free-kick practice (branding left off). Everything except the base is a flat plate (thickness 0.035):
- **Torso:** a shouldered panel (width ~0.5, z 0.95–1.47) with perforations in a 2-row block above the chest band and a larger block below it
- **Head loop:** a U-shaped plate (outer and inner arches) rising from the shoulders to z ≈ 1.72
- **Legs:** two strips splaying from the base (±0.09–0.135) up to the torso corners (±0.2)
- **Base:** a dark ground bar with two gray spike holes
- **Direction cue:** the real thing looks the same from both sides, so the front (facing the kicker) gets a **black chest band**, and the back gets **raised ribs** (vertical + 2 horizontal) and is 14% darker. Facing N and S therefore look different.
- Default color neon yellow `#d9f21f` (not one of the 8 swatches; any swatch recolors it). Default size 3 (≈ the height of a player figure).

### `arch` — training arch (`ARCH_MODEL`)
Built from bars only (tube shading, like the goal posts):
- **Arch:** one polyline — straight legs from the connector (z 0.12) up to z 0.46, then a semicircle of radius 0.5 (width 1.0, top ≈ 0.96)
- **Feet:** at each side, an orange foot tube running front-to-back (±0.24) with a black T hub, black end caps and a black connector sleeve up to the arch leg
- Symmetric front/back, so facings 180° apart look the same (4 distinct orientations)
- Default color orange `#f97316` (tubes; black parts stay black). Default size 3.

### Context menu + catalog
- A **Facing** compass (3×3 grid: NW N NE / W ↻ E / SW S SE; tooltips "Faces N" etc.). The center ↻ rotates 45° clockwise. It replaces Rotate 90° for all 3D models, and the menu clamps higher on screen because it's taller.
- Catalog cards show a 3/4 view (`GOAL_PREVIEW_FACING = 135`, SE) on a rounded patch of field grass (`goalPreview(type)`), so light frames and dark nets both read against the dark card.
