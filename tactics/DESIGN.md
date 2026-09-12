# Soccer Tactics Board — Design Rules

## Field

- Canvas size: **928 × 632px** (field 840×544 + 44px padding on each side)
- Field color: `#2d8b2d` (grass green)
- All field lines: white, 2–2.5px stroke
- Field dimensions at **8px per meter** (105m × 68m standard)
- Goals render as semi-transparent white rectangles extending beyond the field boundary

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

1. **Jersey Color** — 8 color swatches (players only); luminance-preserving recolor of jersey pixels
2. **Size** — 6 dot buttons, visually sized to match their radius
3. **Rotate 90°** — increments `rotation` by 90 mod 360
4. **Duplicate** — copies all metadata + positions in every frame, offset +28px
5. **Delete** — removes from all frames

Closes on: overlay click, Escape key, or after Delete/Duplicate.

## Object Rendering

All objects render as Konva `Circle` with `fillPatternImage`. The circle clips the image automatically — no separate Konva mask needed.

### Adding a new object type

1. Add `{ type, label, src }` to `CATALOG` in `App.jsx` — `src` is relative to `public/`
2. Load the image in the `useEffect` that loads `ballImage` / `playerImage`; store in state
3. Add a case to `getObjectFill(obj, r)` returning the Konva fill props
4. If the object has per-instance style options (e.g. color), add the field to the object in `addToField()` and a setter handler
5. Expose any style controls in the context menu, gated by `ctxObj.type`
6. Update `DESIGN.md`

### Fill props contract (`getObjectFill`)

Every type must return one of:
- `{ fillPatternImage, fillPatternOffset, fillPatternScale, fillPatternRepeat: 'no-repeat' }` — for image-based objects
- `{ fill }` — fallback while image is loading

Scale the image so its **height** fills the circle diameter: `scale = (r * 2) / canvas.height`. This keeps the figure proportional and fully visible within the circle.

Offset centers the image on the circle origin: `{ x: canvas.width / 2, y: canvas.height / 2 }`.

### Stroke rule

- **Ball**: `stroke="#1a1a1a" strokeWidth={1.5}` — thin dark ring
- **Player** (and any image with a baked outline): `strokeEnabled={false}` — the outline is drawn into the canvas itself (see pipeline below)
- New types: use `strokeEnabled={false}` if the canvas pipeline bakes an outline; use a stroke if it doesn't

---

## Player Object Pipeline

Source: `player1.png` — 82×96 RGBA PNG, red jersey icon

`getColorizedPlayer(srcImg, hexColor)` runs in three stages and caches the result by hex color.

### Stage 1 — Pixel manipulation (on a temp canvas)

Process every pixel of the source image in a single pass, in priority order:

| Check | Action | Reason |
|-------|--------|--------|
| `a < 10` | skip | already transparent |
| `r > 220 && g > 220 && b > 220` | `alpha = 0` | knock out white background |
| `r < 50 && g < 50 && b < 50` | `alpha = 0` | knock out shadow/baseline artifacts (e.g. drop-shadow line under feet) |
| `r > 120 && r > g*1.4 && r > b*1.4` | recolor | jersey pixels — luminance-preserving recolor to target hex |
| anything else | unchanged | skin, hair, details |

### Equipment pipeline pixel pass

Same priority order but no recolor step, and a **lower gray knockout threshold**:

| Check | Action | Reason |
|-------|--------|--------|
| `a < 10` | skip | already transparent |
| `r > 160 && g > 160 && b > 160` | `alpha = 0` | knocks out white (250+) AND gray (180) background rows; safe because saturated equipment colors (yellow pole b≈13, orange cone b≈0) never have all three channels > 160 |
| `r < 50 && g < 50 && b < 50` | `alpha = 0` | shadow/baseline artifacts |

After the pixel pass, a **bounding-box crop** trims any remaining transparent-bordered rows/columns before the silhouette step.

**Luminance-preserving recolor**: `newChannel = round(targetChannel × (originalRed / 255))`. Scales each target channel by the original pixel's brightness so highlights and shadows survive.

### Stage 2 — Black silhouette

Draw the temp canvas onto a new same-size canvas, then apply `globalCompositeOperation = 'source-in'` + solid black fill. Result: a pure black shape with the same alpha contour as the figure.

### Stage 3 — Outline composition (final canvas)

Final canvas is **2px larger** in each dimension (`width + 2`, `height + 2`) to give room for the outline.

1. Draw the silhouette at all **8 neighbor offsets** (±1px in x and y, excluding center) — creates a 1px black outline
2. Draw the colorized temp canvas centered on top

### Cache

`_playerColorCache: Map<hex, HTMLCanvasElement>` — module-level, keyed by hex color string. Populated lazily, lives for the browser session. **Hard refresh required** after changing the pipeline to clear stale entries.

### Adding a new color

Add the hex string to `JERSEY_COLORS`. No other changes needed — the cache handles the rest.

## Jersey Colors (8 swatches)

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

- `CATALOG` array drives both the panel grid, `addToField()` dispatch, and image loading
- Each entry: `{ type, label, src }` — `src` is relative to `public/`
- Images are loaded at startup by iterating `CATALOG` — no separate load call needed when adding a new type
- Clicking an object card adds one instance; clicking multiple times adds multiple

### Current catalog

| Type     | File            | Size      | Fill strategy |
|----------|-----------------|-----------|---------------|
| `ball`   | soccerball.png  | 488×513   | Non-uniform scale — fills full circle diameter |
| `player` | player1.png     | 82×96     | Colorize + outline pipeline; uniform scale by height |
| `cone`   | cone.png        | 122×108   | Equipment pipeline (white knockout + outline); uniform scale by max dimension |
| `hoop`   | hoop.png        | 120×118   | Equipment pipeline (white knockout + outline); uniform scale by max dimension |
| `pole`   | pole.png        | 74×114    | Equipment pipeline (white knockout + outline); uniform scale by max dimension |

### Equipment pipeline (`processEquipmentImage`)

Same 3-stage approach as the player pipeline, without recoloring:

1. **Pixel pass**: knock out white/near-white (`r > 220 && g > 220 && b > 220`) and shadow/baseline (`r < 50 && g < 50 && b < 50`) pixels
2. **Silhouette**: `source-in` + black fill to get the shape as solid black
3. **Outline**: draw silhouette at 8 neighbor offsets (±1px), then draw processed image on top

Cached by image object reference (`_equipmentCache: Map<HTMLImageElement, HTMLCanvasElement>`).
