import { useState, useRef, useCallback, useEffect } from 'react'
import { Stage, Layer, Rect, Circle, Line, Path, Arrow, Group, Image as KonvaImage, Ellipse, Transformer, Text as KonvaText } from 'react-konva'
import './App.css'

// Full field (portrait): 68m wide × 105m tall at 8px/m
const FW = 544, FH = 840, PAD = 44
const SW = FW + PAD * 2, SH = FH + PAD * 2
const CX = FW / 2, CY = FH / 2
const PA_HW = 162, PA_D = 132, GA_HW = 73, GA_D = 44
const PS_D = 88, CIRCLE_R = 73, ARC_X = 58.3
const GOAL_HW = 30, GOAL_D = 20
const GBUF = 14   // green border around all fields

// Image-based fields (half, blank) use a larger landscape canvas
const LW = 840, LH = 544
const LSW = LW + PAD * 2, LSH = LH + PAD * 2

const SIZE_RADII   = [10, 13, 17, 22, 27, 34]
const DEFAULT_SIZE = 3
const getRadius    = (size) => SIZE_RADII[(size ?? DEFAULT_SIZE) - 1]

const FRAME_MS  = 900
const SPEED_OPTIONS = [
  { label: 'Normal', value: 1 },
  { label: 'Slow',   value: 0.55 },
  { label: 'V. Slow', value: 0.32 },
]
const easeInOut = (t) => t < 0.5 ? 2*t*t : -1 + (4 - 2*t) * t

// Walk a flat [x0,y0, x1,y1,...] polyline at progress t (0→1), returning {x,y}.
// Arc-length parameterised so easing produces even speed along curved paths.
function walkPath(points, t) {
  const n = points.length >> 1
  if (n < 2) return { x: points[0] ?? 0, y: points[1] ?? 0 }
  const lens = [0]
  for (let i = 1; i < n; i++) {
    const dx = points[i*2] - points[(i-1)*2], dy = points[i*2+1] - points[(i-1)*2+1]
    lens.push(lens[i-1] + Math.sqrt(dx*dx + dy*dy))
  }
  const total = lens[n-1]
  if (total === 0) return { x: points[0], y: points[1] }
  const target = total * Math.min(t, 1)
  for (let i = 1; i < n; i++) {
    if (lens[i] >= target || i === n-1) {
      const sl = lens[i] - lens[i-1]
      const st = sl > 0 ? (target - lens[i-1]) / sl : 0
      return {
        x: points[(i-1)*2]   + (points[i*2]   - points[(i-1)*2])   * st,
        y: points[(i-1)*2+1] + (points[i*2+1] - points[(i-1)*2+1]) * st,
      }
    }
  }
  return { x: points[(n-1)*2], y: points[(n-1)*2+1] }
}

const OBJECT_COLORS = ['#ef4444','#3b82f6','#facc15','#22c55e','#f9fafb','#1f2937','#f97316','#a855f7']

// Types that support per-instance color picking
const COLORIZABLE = new Set(['player', 'player-t1', 'player-t2', 'marker', 'marker2', 'goal', 'popup-goal', 'freekick', 'arch', 'ball', 'basketball', 'cone', 'hoop', 'pinnie', 'pole'])

// Default colors match each object's original source image
const DEFAULT_COLORS = { player: '#3b82f6', 'player-t1': '#3b82f6', 'player-t2': '#facc15', marker: '#3b82f6', marker2: '#facc15', goal: '#f9fafb', 'popup-goal': '#f97316', freekick: '#d9f21f', arch: '#f97316', ball: '#f9fafb', basketball: '#e8742a', cone: '#ef4444', hoop: '#3b82f6', pinnie: '#ef4444', pole: '#facc15' }

// Sports — each has its own court/field drawing and object list (switching clears the board)
const SPORTS = [
  { id: 'soccer',     label: '⚽ Soccer'     },
  { id: 'basketball', label: '🏀 Basketball' },
]
const BOTH = ['soccer', 'basketball']

const CATALOG = [
  { type: 'ball',       label: 'Soccer Ball', src: null, sports: ['soccer']     },
  { type: 'basketball', label: 'Basketball',  src: null, sports: ['basketball'] },
  { type: 'player',     label: 'Player',      src: null, sports: BOTH           },
  { type: 'player-t1',  label: 'Player 1',    src: null, sports: BOTH           },
  { type: 'player-t2',  label: 'Player 2',    src: null, sports: BOTH           },
  { type: 'marker',     label: 'Team 1',      src: null, sports: BOTH           },
  { type: 'marker2',    label: 'Team 2',      src: null, sports: BOTH           },
  { type: 'goal',       label: 'Goal',        src: null, sports: ['soccer']     },
  { type: 'cone',       label: 'Cone',        src: null, sports: BOTH           },
  { type: 'hoop',       label: 'Hoop',        src: null, sports: ['soccer']     },
  { type: 'pinnie',     label: 'Pinnie',      src: null, sports: BOTH           },
  { type: 'pole',       label: 'Pole',        src: null, sports: ['soccer']     },
  { type: 'popup-goal', label: 'Pop-up Goal', src: null, sports: ['soccer']     },
  { type: 'freekick',   label: 'Free Kick',   src: null, sports: ['soccer']     },
  { type: 'arch',       label: 'Arch',        src: null, sports: ['soccer']     },
]

// Numbered objects (one type per team) — each new one takes the lowest number
// not already used by its own type. Markers and players number independently.
const MARKER_TYPES   = new Set(['marker', 'marker2'])
const PLAYER_TYPES   = new Set(['player', 'player-t1', 'player-t2'])   // 'player' is unnumbered
const NUMBERED_TYPES = new Set([...MARKER_TYPES, 'player-t1', 'player-t2'])
const NUMBER_MAX     = 20
const PLAYER_DEFAULT_SIZE = 4   // one step up from the shared default so chest numbers stay readable

// Same five views for every sport; `courtLabel` names them for basketball
const FIELD_CATALOG = [
  { id: 'full',      label: 'Full Field',        courtLabel: 'Full Court',        src: null           },
  { id: 'half',      label: 'Half Field',        courtLabel: 'Half Court',        src: 'halfield.png' },
  { id: 'half-flip', label: 'Half Field (flip)', courtLabel: 'Half Court (flip)', src: 'halfield.png' },
  { id: 'middle',    label: 'Middle Third',      courtLabel: 'Mid Court',         src: null           },
  { id: 'blank',     label: 'Blank',             courtLabel: 'Blank',             src: null           },
]

const DRAW_TYPES = [
  { id: 'line',         label: 'Line'     },
  { id: 'arrow',        label: 'Arrow'    },
  { id: 'dashed',       label: 'Dashed'   },
  { id: 'dashed-arrow', label: 'Dash →'   },
  { id: 'T',            label: 'T-Line'   },
  { id: 'dashed-T',     label: 'Dash T'   },
]
const DRAW_COLORS     = ['#ffffff','#facc15','#ef4444','#3b82f6','#22c55e','#f97316','#a855f7','#000000']
const DRAW_THICKNESSES = [1, 2, 3, 4, 5]

function ShapeTypeIcon({ type }) {
  const c = 'rgba(255,255,255,0.75)'
  const sw = 2
  if (type === 'rect')
    return <svg width="36" height="26"><rect x="3" y="4" width="30" height="18" fill="none" stroke={c} strokeWidth={sw} rx="2"/></svg>
  if (type === 'ellipse')
    return <svg width="36" height="26"><ellipse cx="18" cy="13" rx="15" ry="9" fill="none" stroke={c} strokeWidth={sw}/></svg>
  if (type === 'triangle')
    return <svg width="36" height="26"><polygon points="18,3 33,23 3,23" fill="none" stroke={c} strokeWidth={sw}/></svg>
  return null
}

const SHAPE_STYLES = [
  { id: 'fill',    label: 'Filled'   },
  { id: 'semi',    label: 'Tinted'   },
  { id: 'outline', label: 'Outline'  },
  { id: 'dashed',  label: 'Dashed'   },
]

function ShapeStyleIcon({ id, active }) {
  const c = active ? '#4ade80' : 'rgba(255,255,255,0.65)'
  const sw = 1.5
  if (id === 'fill')
    return <svg width="36" height="22"><rect x="3" y="3" width="30" height="16" fill={c} rx="2"/></svg>
  if (id === 'semi')
    return <svg width="36" height="22"><rect x="3" y="3" width="30" height="16" fill={c} fillOpacity="0.35" stroke={c} strokeWidth={sw} rx="2"/></svg>
  if (id === 'outline')
    return <svg width="36" height="22"><rect x="3" y="3" width="30" height="16" fill="none" stroke={c} strokeWidth={sw} rx="2"/></svg>
  if (id === 'dashed')
    return <svg width="36" height="22"><rect x="3" y="3" width="30" height="16" fill="none" stroke={c} strokeWidth={sw} strokeDasharray="4,3" rx="2"/></svg>
  return null
}

function DrawTypeIcon({ type, active }) {
  const c  = active ? '#4ade80' : 'rgba(255,255,255,0.65)'
  const sw = 2
  if (type === 'line')
    return <svg width="38" height="14"><line x1="3" y1="7" x2="35" y2="7" stroke={c} strokeWidth={sw} strokeLinecap="round"/></svg>
  if (type === 'arrow')
    return <svg width="38" height="14"><line x1="3" y1="7" x2="28" y2="7" stroke={c} strokeWidth={sw} strokeLinecap="round"/><polygon points="27,3.5 35,7 27,10.5" fill={c}/></svg>
  if (type === 'dashed')
    return <svg width="38" height="14"><line x1="3" y1="7" x2="35" y2="7" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeDasharray="5,4"/></svg>
  if (type === 'dashed-arrow')
    return <svg width="38" height="14"><line x1="3" y1="7" x2="28" y2="7" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeDasharray="5,4"/><polygon points="27,3.5 35,7 27,10.5" fill={c}/></svg>
  if (type === 'T')
    return <svg width="38" height="18"><line x1="3" y1="9" x2="30" y2="9" stroke={c} strokeWidth={sw} strokeLinecap="round"/><line x1="30" y1="2" x2="30" y2="16" stroke={c} strokeWidth={sw} strokeLinecap="round"/></svg>
  if (type === 'dashed-T')
    return <svg width="38" height="18"><line x1="3" y1="9" x2="30" y2="9" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeDasharray="5,4"/><line x1="30" y1="2" x2="30" y2="16" stroke={c} strokeWidth={sw} strokeLinecap="round"/></svg>
  return null
}

function hexToRgb(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  }
}

// ── Player figure ─────────────────────────────────────────────────────────────
// Head-and-jersey bust drawn as a shaded figurine: soft ground shadow, dark outline,
// cylindrical light→dark shading on the jersey (light from the upper left), collar,
// sleeve cuffs, shaded head. Optional jersey number on the chest.
// `kit` 'basketball' swaps the jersey for a sleeveless tank with bare arms and trim.
// Cached by `hexColor|number|kit`.
const _playerCache = new Map()
const PLAYER_PX    = 192
const PLAYER_SKIN  = { light: '#ffe2c2', mid: '#eab988', dark: '#c98d5a' }

// Jersey outline in unit coords (0–1 of the canvas), traced clockwise from the left of the collar
function jerseyPath(ctx, S) {
  const P = (u, v) => [u * S, v * S]
  ctx.beginPath()
  ctx.moveTo(...P(0.40, 0.415))
  ctx.quadraticCurveTo(...P(0.27, 0.43), ...P(0.22, 0.47))     // left shoulder
  ctx.lineTo(...P(0.115, 0.585))                               // left sleeve top
  ctx.quadraticCurveTo(...P(0.13, 0.64), ...P(0.185, 0.675))   // left cuff
  ctx.lineTo(...P(0.275, 0.615))                               // left armpit
  ctx.lineTo(...P(0.285, 0.86))                                // left side
  ctx.quadraticCurveTo(...P(0.5, 0.895), ...P(0.715, 0.86))    // hem
  ctx.lineTo(...P(0.725, 0.615))                               // right armpit
  ctx.lineTo(...P(0.815, 0.675))
  ctx.quadraticCurveTo(...P(0.87, 0.64), ...P(0.885, 0.585))   // right cuff
  ctx.lineTo(...P(0.78, 0.47))
  ctx.quadraticCurveTo(...P(0.73, 0.43), ...P(0.60, 0.415))    // right shoulder
  ctx.quadraticCurveTo(...P(0.5, 0.50), ...P(0.40, 0.415))     // collar dip
  ctx.closePath()
}

// Basketball tank: shoulder straps, deep armholes, scoop neck
function tankPath(ctx, S) {
  const P = (u, v) => [u * S, v * S]
  ctx.beginPath()
  ctx.moveTo(...P(0.405, 0.415))
  ctx.lineTo(...P(0.325, 0.43))                                // left strap
  ctx.quadraticCurveTo(...P(0.35, 0.56), ...P(0.285, 0.625))   // left armhole
  ctx.lineTo(...P(0.29, 0.86))                                 // left side
  ctx.quadraticCurveTo(...P(0.5, 0.895), ...P(0.71, 0.86))     // hem
  ctx.lineTo(...P(0.715, 0.625))                               // right side
  ctx.quadraticCurveTo(...P(0.65, 0.56), ...P(0.675, 0.43))    // right armhole
  ctx.lineTo(...P(0.595, 0.415))                               // right strap
  ctx.quadraticCurveTo(...P(0.5, 0.54), ...P(0.405, 0.415))    // scoop neck
  ctx.closePath()
}

// Bare upper arms + shoulders that show around a tank (mirrored for the right side)
function armsPath(ctx, S) {
  ctx.beginPath()
  ;[0, 1].forEach(side => {
    const P = (u, v) => [(side ? 1 - u : u) * S, v * S]
    ctx.moveTo(...P(0.34, 0.425))
    ctx.quadraticCurveTo(...P(0.25, 0.43), ...P(0.205, 0.48))   // shoulder
    ctx.lineTo(...P(0.125, 0.60))                               // outer arm
    ctx.quadraticCurveTo(...P(0.13, 0.665), ...P(0.19, 0.69))   // elbow
    ctx.lineTo(...P(0.30, 0.625))                               // armpit
    ctx.closePath()
  })
}

function getPlayerCanvas(hexColor, number = null, kit = 'soccer') {
  const key = `${hexColor}|${number ?? ''}|${kit}`
  if (_playerCache.has(key)) return _playerCache.get(key)

  const S = PLAYER_PX
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = S
  const ctx = canvas.getContext('2d')
  const head = { x: 0.5 * S, y: 0.265 * S, r: 0.135 * S }
  const headPath = () => { ctx.beginPath(); ctx.arc(head.x, head.y, head.r, 0, Math.PI * 2) }
  const neckPath = () => { ctx.beginPath(); ctx.roundRect(0.435 * S, 0.33 * S, 0.13 * S, 0.15 * S, 0.03 * S) }
  const tank = kit === 'basketball'
  const bodyPath = () => (tank ? tankPath : jerseyPath)(ctx, S)

  // 1. Soft ground shadow, cast down-right
  ctx.save()
  ctx.filter = 'blur(4px)'
  ctx.fillStyle = 'rgba(0,0,0,0.35)'
  ctx.beginPath(); ctx.ellipse(0.55 * S, 0.885 * S, 0.27 * S, 0.055 * S, 0, 0, Math.PI * 2); ctx.fill()
  ctx.restore()

  // 2. Outline — strokes the silhouette wide before the fills go on top
  ctx.lineJoin = 'round'
  ctx.strokeStyle = 'rgba(0,0,0,0.8)'
  ctx.lineWidth = 0.035 * S
  if (tank) { armsPath(ctx, S); ctx.stroke() }
  bodyPath(); ctx.stroke()
  headPath(); ctx.stroke()
  neckPath(); ctx.stroke()

  // Neck — shows through the collar opening, shaded darker under the chin
  const neck = ctx.createLinearGradient(0, 0.36 * S, 0, 0.48 * S)
  neck.addColorStop(0, PLAYER_SKIN.dark)
  neck.addColorStop(1, PLAYER_SKIN.mid)
  neckPath(); ctx.fillStyle = neck; ctx.fill()

  // Bare arms (tank only) — lit from the upper left like the head
  if (tank) {
    const arm = ctx.createLinearGradient(0.12 * S, 0, 0.88 * S, 0)
    arm.addColorStop(0,   PLAYER_SKIN.mid)
    arm.addColorStop(0.2, PLAYER_SKIN.light)
    arm.addColorStop(0.5, PLAYER_SKIN.mid)
    arm.addColorStop(1,   PLAYER_SKIN.dark)
    armsPath(ctx, S); ctx.fillStyle = arm; ctx.fill()
    ctx.save()
    armsPath(ctx, S); ctx.clip()
    const armDown = ctx.createLinearGradient(0, 0.45 * S, 0, 0.7 * S)
    armDown.addColorStop(0, 'rgba(0,0,0,0)')
    armDown.addColorStop(1, 'rgba(0,0,0,0.18)')
    ctx.fillStyle = armDown; ctx.fillRect(0, 0, S, S)
    ctx.restore()
  }

  // 3. Jersey: base color, then cylindrical + top-down shading clipped to the shape
  bodyPath()
  ctx.fillStyle = hexColor; ctx.fill()
  ctx.save()
  bodyPath(); ctx.clip()
  const side = ctx.createLinearGradient(0.11 * S, 0, 0.89 * S, 0)
  side.addColorStop(0,    'rgba(255,255,255,0.10)')
  side.addColorStop(0.3,  'rgba(255,255,255,0.28)')
  side.addColorStop(0.55, 'rgba(255,255,255,0)')
  side.addColorStop(1,    'rgba(0,0,0,0.38)')
  ctx.fillStyle = side; ctx.fillRect(0, 0, S, S)
  const down = ctx.createLinearGradient(0, 0.42 * S, 0, 0.9 * S)
  down.addColorStop(0,   'rgba(255,255,255,0.12)')
  down.addColorStop(0.5, 'rgba(0,0,0,0)')
  down.addColorStop(1,   'rgba(0,0,0,0.25)')
  ctx.fillStyle = down; ctx.fillRect(0, 0, S, S)
  if (!tank) {
    // Sleeve cuffs + seams where the sleeves meet the body
    ctx.strokeStyle = shadeHex(hexColor, -0.35)
    ctx.lineWidth = 0.022 * S
    ctx.beginPath()
    ctx.moveTo(0.11 * S, 0.60 * S); ctx.lineTo(0.20 * S, 0.69 * S)
    ctx.moveTo(0.89 * S, 0.60 * S); ctx.lineTo(0.80 * S, 0.69 * S)
    ctx.stroke()
    ctx.strokeStyle = 'rgba(0,0,0,0.18)'
    ctx.lineWidth = 0.01 * S
    ctx.beginPath()
    ctx.moveTo(0.26 * S, 0.47 * S); ctx.quadraticCurveTo(0.25 * S, 0.55 * S, 0.275 * S, 0.615 * S)
    ctx.moveTo(0.74 * S, 0.47 * S); ctx.quadraticCurveTo(0.75 * S, 0.55 * S, 0.725 * S, 0.615 * S)
    ctx.stroke()
  }
  // Shadow the head casts on the chest
  ctx.fillStyle = 'rgba(0,0,0,0.22)'
  ctx.beginPath(); ctx.ellipse(0.53 * S, 0.44 * S, 0.13 * S, 0.05 * S, 0, 0, Math.PI * 2); ctx.fill()
  ctx.restore()

  ctx.lineCap = 'round'
  if (tank) {
    // Contrast trim around the neck and armholes — white, or dark on a light tank
    ctx.strokeStyle = luminance(hexColor) > 170 ? shadeHex(hexColor, -0.45) : 'rgba(255,255,255,0.9)'
    ctx.lineWidth = 0.022 * S
    ctx.beginPath()
    ctx.moveTo(0.41 * S, 0.425 * S); ctx.quadraticCurveTo(0.5 * S, 0.53 * S, 0.59 * S, 0.425 * S)
    ctx.moveTo(0.335 * S, 0.44 * S); ctx.quadraticCurveTo(0.355 * S, 0.56 * S, 0.295 * S, 0.62 * S)
    ctx.moveTo(0.665 * S, 0.44 * S); ctx.quadraticCurveTo(0.645 * S, 0.56 * S, 0.705 * S, 0.62 * S)
    ctx.stroke()
  } else {
    // Collar band
    ctx.strokeStyle = shadeHex(hexColor, -0.4)
    ctx.lineWidth = 0.028 * S
    ctx.beginPath()
    ctx.moveTo(0.405 * S, 0.425 * S); ctx.quadraticCurveTo(0.5 * S, 0.49 * S, 0.595 * S, 0.425 * S)
    ctx.stroke()
  }

  // 4. Optional jersey number
  if (number != null) {
    const { r, g, b } = hexToRgb(hexColor)
    const light = (0.299 * r + 0.587 * g + 0.114 * b) > 170
    ctx.font = `800 ${number >= 10 ? 0.2 * S : 0.23 * S}px system-ui, -apple-system, 'Segoe UI', Arial, sans-serif`
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.lineWidth = 0.025 * S
    ctx.strokeStyle = light ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.55)'
    ctx.strokeText(String(number), 0.5 * S, 0.665 * S)
    ctx.fillStyle = light ? '#111827' : '#ffffff'
    ctx.fillText(String(number), 0.5 * S, 0.665 * S)
  }

  // 5. Head: sphere shading + rim highlight
  const skin = ctx.createRadialGradient(head.x - head.r * 0.35, head.y - head.r * 0.4, head.r * 0.1, head.x, head.y, head.r)
  skin.addColorStop(0,   PLAYER_SKIN.light)
  skin.addColorStop(0.6, PLAYER_SKIN.mid)
  skin.addColorStop(1,   PLAYER_SKIN.dark)
  headPath(); ctx.fillStyle = skin; ctx.fill()
  ctx.beginPath(); ctx.arc(head.x, head.y, head.r * 0.82, Math.PI * 1.1, Math.PI * 1.55)
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 0.014 * S; ctx.stroke()

  _playerCache.set(key, canvas)
  return canvas
}

const _playerPreview = new Map()
const playerPreview = (kit) => {
  if (!_playerPreview.has(kit)) _playerPreview.set(kit, getPlayerCanvas(DEFAULT_COLORS.player, null, kit).toDataURL())
  return _playerPreview.get(kit)
}

// ── Numbered marker ──────────────────────────────────────────────────────────
// Draws a beveled puck: darker base shows as a rim at the bottom (depth), lighter
// top face with a soft top-left highlight, number centered on the face.
// Cached by `hexColor|number`.
const _markerCache = new Map()
const MARKER_PX    = 160   // render size — crisp at size 6 on 2× displays

function shadeHex(hex, amt) {
  const { r, g, b } = hexToRgb(hex)
  const f = (c) => Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt)
  return `rgb(${f(r)},${f(g)},${f(b)})`
}

function getMarkerCanvas(hexColor, number) {
  const key = `${hexColor}|${number}`
  if (_markerCache.has(key)) return _markerCache.get(key)

  const S = MARKER_PX, R = S / 2
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = S
  const ctx = canvas.getContext('2d')

  // Outer dark outline
  ctx.beginPath(); ctx.arc(R, R, R, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0,0,0,0.85)'; ctx.fill()

  // Base / side of the puck — dark, gradient so the bottom rim reads as thickness
  const base = ctx.createLinearGradient(0, 0, 0, S)
  base.addColorStop(0,   shadeHex(hexColor, -0.35))
  base.addColorStop(1,   shadeHex(hexColor, -0.6))
  ctx.beginPath(); ctx.arc(R, R, R - 3, 0, Math.PI * 2)
  ctx.fillStyle = base; ctx.fill()

  // Top face — smaller and shifted up, exposing the bevel along the bottom
  const fr = R * 0.84, fx = R, fy = R - R * 0.1
  const face = ctx.createRadialGradient(fx - fr * 0.35, fy - fr * 0.4, fr * 0.1, fx, fy, fr)
  face.addColorStop(0,   shadeHex(hexColor, 0.35))
  face.addColorStop(0.6, hexColor)
  face.addColorStop(1,   shadeHex(hexColor, -0.15))
  ctx.beginPath(); ctx.arc(fx, fy, fr, 0, Math.PI * 2)
  ctx.fillStyle = face; ctx.fill()

  // Thin highlight ring around the top edge of the face
  ctx.beginPath(); ctx.arc(fx, fy, fr - 2, Math.PI * 1.05, Math.PI * 1.95)
  ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 3; ctx.stroke()

  // Number — dark on light colors, white on everything else
  const { r, g, b } = hexToRgb(hexColor)
  const light = (0.299 * r + 0.587 * g + 0.114 * b) > 170
  ctx.font = `800 ${number >= 10 ? fr * 0.95 : fr * 1.1}px system-ui, -apple-system, 'Segoe UI', Arial, sans-serif`
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.shadowColor = light ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)'
  ctx.shadowOffsetY = 3; ctx.shadowBlur = 4
  ctx.fillStyle = light ? '#111827' : '#ffffff'
  ctx.fillText(String(number), fx, fy + fr * 0.06)

  _markerCache.set(key, canvas)
  return canvas
}

// Lowest number (1–NUMBER_MAX) not already used by that type, or null if full
function nextFreeNumber(objects, type) {
  const used = new Set(objects.filter(o => o.type === type).map(o => o.number))
  for (let n = 1; n <= NUMBER_MAX; n++) if (!used.has(n)) return n
  return null
}

// Data URL of a numbered type in its default color for the catalog card (shows the next number)
const _numberedPreviewCache = new Map()
function numberedPreview(type, number, kit) {
  const key = `${type}|${number}|${kit}`
  if (!_numberedPreviewCache.has(key)) {
    const canvas = PLAYER_TYPES.has(type)
      ? getPlayerCanvas(DEFAULT_COLORS[type], number, kit)
      : getMarkerCanvas(DEFAULT_COLORS[type], number)
    _numberedPreviewCache.set(key, canvas.toDataURL())
  }
  return _numberedPreviewCache.get(key)
}

// ── 3D models (goals, free-kick mannequin) ────────────────────────────────────
// Small 3D models drawn through a fixed oblique camera looking down from the
// south-southeast. Facing changes the model's yaw, not the Konva node's rotation, so
// lighting and depth stay correct in every direction.
// `facing` is a compass heading in degrees for the model's front (a goal's mouth, the
// mannequin's front face): 0 = N, 90 = E.
const MODEL_TYPES = new Set(['goal', 'popup-goal', 'freekick', 'arch'])   // everything drawn by getGoalCanvas
const GOAL_FACINGS = [
  { deg: 315, label: 'NW' }, { deg:   0, label: 'N' }, { deg:  45, label: 'NE' },
  { deg: 270, label: 'W'  }, null,                     { deg:  90, label: 'E'  },
  { deg: 225, label: 'SW' }, { deg: 180, label: 'S' }, { deg: 135, label: 'SE' },
]
const GOAL_DEFAULT_FACING = 180
const GOAL_DEFAULT_SIZE   = { goal: 4, 'popup-goal': 3, freekick: 3, arch: 3 }   // goal ≈ true scale on the full field; freekick ≈ player height
const GOAL_PREVIEW_FACING = 135    // 3/4 view for the catalog card
const GOAL_RADIUS_MULT    = 2      // goals render at 2× the shared size radii
const GOAL_PX             = 256
const GOAL_TILT           = 0.6    // screen-y lift per unit of height (camera elevation)
const GOAL_SKEW           = 0.25   // screen-x lean per unit of height (camera slightly to the east)

// Model format — local coords: u across the mouth, v forward (net sits at negative v), z up.
// All widths are in model units so they scale with the goal.
//   bars:   polylines { pts, w, color: 'frame' | hex, dark? }  — dark = 25% darker frame color
//   nets:   grids (rows of points); mesh lines run along both directions
//   plates: solid boards { pts, normal, t, front?, back? } — polygon + local normal (front
//           side) + thickness. Lit by which way the visible face points; front/back hold
//           face-only details: { dots: [{ p, r }], bands: [pts], ribs: [[p0, p1]], shade }
//   joints: dots { p, r, color }
//   netLine / netFill: mesh and fill colors

const lerp3 = (a, b, t) => a.map((c, i) => c + (b[i] - c) * t)

// Quad → grid with ~`step` spacing between mesh lines
function quadGrid(p0, p1, p2, p3, step) {
  const nu = Math.max(2, Math.round(Math.hypot(...p0.map((c, i) => c - p1[i])) / step))
  const nv = Math.max(2, Math.round(Math.hypot(...p1.map((c, i) => c - p2[i])) / step))
  const rows = []
  for (let j = 0; j <= nv; j++) {
    const a = lerp3(p0, p3, j / nv), b = lerp3(p1, p2, j / nv)
    const row = []
    for (let i = 0; i <= nu; i++) row.push(lerp3(a, b, i / nu))
    rows.push(row)
  }
  return rows
}

// Full-size goal: posts + crossbar, roof supports, slanted back stanchions, box net
const BOX_GOAL_MODEL = (() => {
  const w = 3, h = 2, dTop = 1, dBase = 2.2
  const P = {
    FL: [-w, 0, 0], FR: [w, 0, 0], FLt: [-w, 0, h], FRt: [w, 0, h],
    BLt: [-w, -dTop, h], BRt: [w, -dTop, h], BLg: [-w, -dBase, 0], BRg: [w, -dBase, 0],
  }
  const front = (a, b) => ({ pts: [P[a], P[b]], w: 0.225, color: 'frame' })
  const back  = (a, b) => ({ pts: [P[a], P[b]], w: 0.125, color: 'frame', dark: true })
  const q = (a, b, c, d) => quadGrid(P[a], P[b], P[c], P[d], 0.35)
  return {
    nets: [q('FLt', 'FRt', 'BRt', 'BLt'), q('BLt', 'BRt', 'BRg', 'BLg'), q('FL', 'FLt', 'BLt', 'BLg'), q('FR', 'FRt', 'BRt', 'BRg')],
    bars: [
      front('FL', 'FLt'), front('FR', 'FRt'), front('FLt', 'FRt'),
      back('FLt', 'BLt'), back('FRt', 'BRt'), back('BLt', 'BRt'),
      back('BLt', 'BLg'), back('BRt', 'BRg'), back('BLg', 'BRg'), back('FL', 'BLg'), back('FR', 'BRg'),
    ],
    joints:  [],
    netLine: 'rgba(255,255,255,0.5)',
    netFill: 'rgba(255,255,255,0.14)',
  }
})()

// Pop-up goal: sleeved front arch + matching ground hoop behind it, net billowing
// between them, black strap across the front with a clip, gray corner joints
const POPUP_GOAL_MODEL = (() => {
  const w = 2, h = 2.3, d = 2.4, N = 24, S = 8
  const arch   = (t) => [-w * Math.cos(t), 0, h * Math.sin(t)]
  const ground = (t) => [-w * Math.cos(t), -d * Math.sin(t), 0]
  const ts = Array.from({ length: N + 1 }, (_, i) => (i / N) * Math.PI)
  const net = []
  for (let j = 0; j <= S; j++) {
    const s = j / S, bulge = Math.sin(Math.PI * s)
    net.push(ts.map(t => {
      const [u, v, z] = lerp3(arch(t), ground(t), s)
      return [u, v - bulge * 0.15 * d * Math.sin(t), z + bulge * 0.25 * h * Math.sin(t)]
    }))
  }
  const sleeve = 0.24
  return {
    nets: [net],
    bars: [
      { pts: ts.map(arch),   w: sleeve, color: 'frame' },
      { pts: ts.map(ground), w: sleeve, color: 'frame', dark: true },
      { pts: [[-w, 0, 0.02], [w, 0, 0.02]], w: 0.09, color: '#1f2937' },
    ],
    joints: [
      { p: [-w, 0, 0.05], r: 0.13, color: '#9ca3af' },
      { p: [ w, 0, 0.05], r: 0.13, color: '#9ca3af' },
      { p: [ 0, 0, 0.02], r: 0.09, color: 'frame' },
    ],
    netLine: 'rgba(17,24,39,0.6)',
    netFill: 'rgba(255,255,255,0.10)',
  }
})()

// Free-kick mannequin: flat plastic board on a ground bar — head loop, shouldered torso
// with perforations, two splayed legs. Front (facing the kicker) has the chest band;
// the back has stiffening ribs, so you can tell which way it faces.
const FREEKICK_MODEL = (() => {
  const N = [0, 1, 0], t = 0.035
  const flat = (uz) => uz.map(([u, z]) => [u, 0, z])
  const arch = (cz, ru, rz, from, to, n = 12) =>
    Array.from({ length: n + 1 }, (_, i) => { const a = from + (to - from) * i / n; return [ru * Math.cos(a), cz + rz * Math.sin(a)] })
  const torso = flat([[-0.215, 0.95], [0.215, 0.95], [0.25, 1.33], [0.245, 1.4], [0.13, 1.47], [-0.13, 1.47], [-0.245, 1.4], [-0.25, 1.33]])
  const loop = flat([
    [0.085, 1.44], ...arch(1.58, 0.085, 0.14, 0, Math.PI), [-0.085, 1.44],
    [-0.045, 1.44], ...arch(1.58, 0.045, 0.1, Math.PI, 0), [0.045, 1.44],
  ])
  const leg = (sx) => flat([[sx * 0.09, 0.04], [sx * 0.135, 0.04], [sx * 0.2, 0.97], [sx * 0.155, 0.97]])
  // Perforations: a 2-row block above the chest band, a larger block below it
  const dots = []
  const rowsOf = (z0, z1, half) => { for (let z = z0; z <= z1 + 1e-6; z += 0.03) for (let u = -half; u <= half + 1e-6; u += 0.034) dots.push({ p: [u, 0, z], r: 0.008 }) }
  rowsOf(1.4, 1.42, 0.136)
  rowsOf(1.0, 1.24, 0.17)
  return {
    nets: [],
    plates: [
      { pts: torso, normal: N, t,
        front: { dots, bands: [flat([[-0.2, 1.28], [0.2, 1.28], [0.215, 1.375], [-0.215, 1.375]])] },
        back:  { dots, shade: -0.14, ribs: [[[0, 0, 0.99], [0, 0, 1.43]], [[-0.21, 0, 1.3], [0.21, 0, 1.3]], [[-0.18, 0, 1.0], [0.18, 0, 1.0]]] } },
      { pts: loop,     normal: N, t },
      { pts: leg(-1),  normal: N, t },
      { pts: leg(1),   normal: N, t },
    ],
    bars:   [{ pts: [[-0.21, 0, 0.03], [0.21, 0, 0.03]], w: 0.09, color: '#1f2937' }],
    joints: [{ p: [-0.045, 0, 0.035], r: 0.018, color: '#9ca3af' }, { p: [0.045, 0, 0.035], r: 0.018, color: '#9ca3af' }],
    netLine: 'transparent',
    netFill: 'transparent',
  }
})()

// Training arch: tube arch on straight legs, black T-connectors into foot tubes with
// black end caps. Symmetric front/back, so facings 180° apart look the same.
const ARCH_MODEL = (() => {
  const w = 0.5, hub = 0.12, legTop = 0.46, foot = 0.24, tube = 0.06, black = '#1f2937'
  const curve = Array.from({ length: 25 }, (_, i) => { const a = Math.PI - (i / 24) * Math.PI; return [w * Math.cos(a), 0, legTop + w * Math.sin(a)] })
  const side = (sx) => [
    { pts: [[sx * w, -foot, 0.035], [sx * w, foot, 0.035]], w: tube, color: 'frame' },                     // foot tube
    { pts: [[sx * w, -foot - 0.02, 0.035], [sx * w, -foot, 0.035]], w: tube * 1.1, color: black },         // end caps
    { pts: [[sx * w, foot, 0.035], [sx * w, foot + 0.02, 0.035]], w: tube * 1.1, color: black },
    { pts: [[sx * w, -0.03, 0.035], [sx * w, 0.03, 0.035]], w: tube * 1.2, color: black },                 // T hub
    { pts: [[sx * w, 0, 0.035], [sx * w, 0, hub]], w: tube * 1.2, color: black },                          // connector sleeve
  ]
  return {
    nets: [],
    bars: [
      ...side(-1), ...side(1),
      { pts: [[-w, 0, hub], ...curve, [w, 0, hub]], w: tube, color: 'frame' },
    ],
    joints: [],
    netLine: 'transparent',
    netFill: 'transparent',
  }
})()

const GOAL_MODELS = { goal: BOX_GOAL_MODEL, 'popup-goal': POPUP_GOAL_MODEL, freekick: FREEKICK_MODEL, arch: ARCH_MODEL }

// Local → world (x east, y south, z up) for a given facing
function goalWorld([u, v, z], deg) {
  const a = deg * Math.PI / 180
  const fx = Math.sin(a), fy = -Math.cos(a)   // facing direction
  const rx = Math.cos(a), ry =  Math.sin(a)   // across the mouth
  return [u * rx + v * fx, u * ry + v * fy, z]
}
const goalScreen = ([x, y, z]) => [x - z * GOAL_SKEW, y - z * GOAL_TILT]

// Per model: a center and one scale for every facing, so the goal doesn't change size as it rotates
const _goalFit = new Map()
function goalFit(model) {
  if (_goalFit.has(model)) return _goalFit.get(model)
  const pts = [...model.bars.flatMap(b => b.pts), ...model.nets.flat(2), ...(model.plates ?? []).flatMap(pl => pl.pts)]
  const lo = [0, 1, 2].map(i => Math.min(...pts.map(p => p[i])))
  const hi = [0, 1, 2].map(i => Math.max(...pts.map(p => p[i])))
  const center = lo.map((c, i) => (c + hi[i]) / 2)
  let max = 0
  for (let deg = 0; deg < 360; deg += 45) {
    const [cx, cy] = goalScreen(goalWorld(center, deg))
    pts.forEach(p => {
      const [sx, sy] = goalScreen(goalWorld(p, deg))
      max = Math.max(max, Math.hypot(sx - cx, sy - cy))
    })
  }
  const fit = { center, scale: (GOAL_PX / 2 - 10) / max }
  _goalFit.set(model, fit)
  return fit
}

const _goalCache = new Map()

function getGoalCanvas(type, hexColor, facing) {
  const key = `${type}|${hexColor}|${facing}`
  if (_goalCache.has(key)) return _goalCache.get(key)

  const model = GOAL_MODELS[type]
  const { center, scale } = goalFit(model)
  const S = GOAL_PX
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = S
  const ctx = canvas.getContext('2d')

  const [cx, cy] = goalScreen(goalWorld(center, facing))
  const toPx    = (w) => { const [sx, sy] = goalScreen(w); return [S / 2 + (sx - cx) * scale, S / 2 + (sy - cy) * scale] }
  const px      = (p) => toPx(goalWorld(p, facing))
  // Light from the upper left, so raised points cast down-right onto the grass
  const shadow  = (p) => { const [x, y, z] = goalWorld(p, facing); return toPx([x + z * 0.45, y + z * 0.3, 0]) }
  const depth   = (pts) => pts.reduce((d, p) => { const [, y, z] = goalWorld(p, facing); return d + y + z * 0.5 }, 0) / pts.length
  const path    = (c, pts, close) => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); if (close) c.closePath() }
  const outline = (rows) => [...rows[0], ...rows.map(r => r[r.length - 1]), ...[...rows[rows.length - 1]].reverse(), ...rows.map(r => r[0]).reverse()]
  const colorOf = (c, dark) => c === 'frame' ? (dark ? shadeHex(hexColor, -0.25) : hexColor) : c

  // 1. Ground shadow — solid on a scratch canvas, then composited soft
  const sh = document.createElement('canvas')
  sh.width = sh.height = S
  const sctx = sh.getContext('2d')
  sctx.fillStyle = sctx.strokeStyle = 'black'
  sctx.lineCap = sctx.lineJoin = 'round'
  model.nets.forEach(rows => { path(sctx, outline(rows).map(shadow), true); sctx.fill() })
  model.bars.forEach(b => { path(sctx, b.pts.map(shadow)); sctx.lineWidth = b.w * scale; sctx.stroke() })
  ;(model.plates ?? []).forEach(pl => { path(sctx, pl.pts.map(shadow), true); sctx.fill() })
  ctx.save()
  ctx.globalAlpha = 0.3
  ctx.filter = 'blur(3px)'
  ctx.drawImage(sh, 0, 0)
  ctx.restore()

  // 2. Nets, bars and joints painted far → near (nearer = further south and higher up)
  const items = [
    ...model.nets.map(rows => ({ kind: 'net', rows, d: depth(rows.flat()) })),
    ...model.bars.map(b => ({ kind: 'bar', b, d: depth(b.pts) + (b.dark ? 0 : 0.01) })),
    ...model.joints.map(j => ({ kind: 'joint', j, d: depth([j.p]) + 0.02 })),
    ...(model.plates ?? []).map(pl => ({ kind: 'plate', pl, d: depth(pl.pts) })),
  ].sort((a, b) => a.d - b.d)

  // Plates: the camera looks along -VIEW (points along VIEW collapse to one screen spot),
  // so a face is visible when its normal has a positive VIEW component
  const VIEW  = [GOAL_SKEW, GOAL_TILT, 1]
  const LIGHT = (() => { const l = [-0.45, -0.55, 0.7], n = Math.hypot(...l); return l.map(c => c / n) })()
  const dot3  = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
  const drawPlate = (pl) => {
    const nW    = goalWorld(pl.normal, facing)
    const front = dot3(nW, VIEW) > 0
    const sgn   = front ? 1 : -1
    const at    = (p, o) => p.map((c, i) => c + pl.normal[i] * o)
    const face  = (o) => pl.pts.map(p => px(at(p, o)))
    const SLICES = 5
    const slices = Array.from({ length: SLICES + 1 }, (_, k) => face(sgn * (-pl.t / 2 + pl.t * k / SLICES)))
    // Outline around the whole slab, then the edge (stacked slices), then the near face
    slices.forEach(f => { path(ctx, f, true); ctx.strokeStyle = 'rgba(0,0,0,0.75)'; ctx.lineWidth = 0.03 * scale; ctx.stroke() })
    ctx.fillStyle = shadeHex(hexColor, -0.45)
    slices.slice(0, -1).forEach(f => { path(ctx, f, true); ctx.fill() })
    const near = slices[SLICES]
    const lit    = dot3(front ? nW : nW.map(c => -c), LIGHT)
    const detail = front ? pl.front : pl.back
    path(ctx, near, true); ctx.fillStyle = shadeHex(hexColor, 0.2 * lit + 0.18 + (detail?.shade ?? 0)); ctx.fill()
    ctx.save()
    path(ctx, near, true); ctx.clip()
    const ys = near.map(p => p[1]), top = Math.min(...ys), bot = Math.max(...ys)
    const g = ctx.createLinearGradient(0, top, 0, bot)
    g.addColorStop(0, 'rgba(255,255,255,0.22)'); g.addColorStop(1, 'rgba(0,0,0,0.18)')
    ctx.fillStyle = g; ctx.fillRect(0, 0, S, S)
    // Face-only details sit on the near face
    const o = sgn * (pl.t / 2 + 0.002)
    if (detail) {
      ctx.fillStyle = 'rgba(17,24,39,0.85)'
      ;(detail.bands ?? []).forEach(b => { path(ctx, b.map(p => px(at(p, o))), true); ctx.fill() })
      ;(detail.ribs ?? []).forEach(([a, b]) => {
        const [p0, p1] = [px(at(a, o)), px(at(b, o))]
        path(ctx, [p0, p1]); ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 0.05 * scale; ctx.stroke()
        path(ctx, [p0, p1]); ctx.strokeStyle = shadeHex(hexColor, 0.05); ctx.lineWidth = 0.034 * scale; ctx.stroke()
        path(ctx, [p0, p1].map(([x, y]) => [x - 0.008 * scale, y - 0.008 * scale])); ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 0.01 * scale; ctx.stroke()
      })
      ctx.fillStyle = shadeHex(hexColor, -0.6)
      ;(detail.dots ?? []).forEach(d => { const [x, y] = px(at(d.p, o)); ctx.beginPath(); ctx.arc(x, y, d.r * scale, 0, Math.PI * 2); ctx.fill() })
    }
    ctx.restore()
  }

  ctx.lineCap = ctx.lineJoin = 'round'
  items.forEach(item => {
    if (item.kind === 'plate') {
      drawPlate(item.pl)
    } else if (item.kind === 'net') {
      const rows = item.rows.map(r => r.map(px))
      path(ctx, outline(rows), true)
      ctx.fillStyle = model.netFill
      ctx.fill()
      ctx.strokeStyle = model.netLine
      ctx.lineWidth = 0.035 * scale
      rows.forEach(r => { path(ctx, r); ctx.stroke() })
      rows[0].forEach((_, i) => { path(ctx, rows.map(r => r[i])); ctx.stroke() })
    } else if (item.kind === 'bar') {
      const { b } = item
      const pts = b.pts.map(px), w = b.w * scale
      path(ctx, pts)
      ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = w + 0.075 * scale; ctx.stroke()
      ctx.strokeStyle = colorOf(b.color, b.dark); ctx.lineWidth = w; ctx.stroke()
      // Tube highlight along the upper-left edge
      path(ctx, pts.map(([x, y]) => [x - w * 0.18, y - w * 0.18]))
      ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = w * 0.3; ctx.stroke()
    } else {
      const { j } = item
      const [x, y] = px(j.p), r = j.r * scale
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fillStyle = colorOf(j.color); ctx.fill()
      ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 0.04 * scale; ctx.stroke()
    }
  })

  _goalCache.set(key, canvas)
  return canvas
}

// Catalog card image: the goal on a rounded patch of field grass so light frames
// and dark nets both read against the dark card
const _goalPreview = new Map()
function goalPreview(type) {
  if (!_goalPreview.has(type)) {
    const goal = getGoalCanvas(type, DEFAULT_COLORS[type], GOAL_PREVIEW_FACING)
    const c = document.createElement('canvas')
    c.width = c.height = GOAL_PX
    const ctx = c.getContext('2d')
    ctx.fillStyle = '#2d8b2d'
    ctx.beginPath(); ctx.roundRect(0, 0, GOAL_PX, GOAL_PX, GOAL_PX * 0.12); ctx.fill()
    ctx.drawImage(goal, 0, 0)
    _goalPreview.set(type, c.toDataURL())
  }
  return _goalPreview.get(type)
}

// ── Equipment (generated) ─────────────────────────────────────────────────────
// Ball, cone, hoop, pole and pinnie drawn in the same style as the goals and players:
// light from the upper left, soft shadow cast down-right on the grass, dark outline.
// Cached by `type|hexColor`.
const EQUIP_PX = 192
const _equipCache = new Map()

const luminance = (hex) => { const { r, g, b } = hexToRgb(hex); return 0.299 * r + 0.587 * g + 0.114 * b }

// Small upright equipment (cone, pole) uses a lower, more side-on view than the goals
// so its shape reads at small sizes: ground circles become ellipses this flat
const EQUIP_SQUASH = 0.5

// Draws `draw(sctx)` solid black on a scratch canvas, then composites it soft and offset
function softShadow(ctx, S, draw, dx, dy, blur = 4, alpha = 0.32) {
  const sh = document.createElement('canvas')
  sh.width = sh.height = S
  const sctx = sh.getContext('2d')
  sctx.fillStyle = sctx.strokeStyle = 'black'
  sctx.lineCap = sctx.lineJoin = 'round'
  draw(sctx)
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.filter = `blur(${blur}px)`
  ctx.drawImage(sh, dx, dy)
  ctx.restore()
}

// Light→dark gradient across a shape, lit from the upper left
function sideShade(ctx, S, x0, y0, x1, y1, light = 0.3, dark = 0.38) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1)
  g.addColorStop(0,    `rgba(255,255,255,${light})`)
  g.addColorStop(0.45, 'rgba(255,255,255,0)')
  g.addColorStop(1,    `rgba(0,0,0,${dark})`)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, S, S)
}

const OUTLINE = 'rgba(0,0,0,0.8)'

// Soccer ball — the color is the ball's base; patches are black, or white on dark balls
function drawBall(ctx, S, hex) {
  const cx = 0.47 * S, cy = 0.47 * S, R = 0.43 * S
  const patch = luminance(hex) < 110 ? '#f9fafb' : '#111827'

  softShadow(ctx, S, (c) => { c.beginPath(); c.ellipse(cx, cy, R * 0.95, R * 0.85, 0, 0, Math.PI * 2); c.fill() }, 0.06 * S, 0.07 * S, 5, 0.35)

  const ball = () => { ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2) }
  ball(); ctx.fillStyle = hex; ctx.fill()

  ctx.save()
  ball(); ctx.clip()
  // Pentagon patches: one in the middle, five around the rim squashed by the sphere's curve
  const deg = Math.PI / 180
  const poly = (pts) => { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath() }
  const center = [0, 1, 2, 3, 4].map(k => { const a = (-90 + k * 72) * deg; return [cx + Math.cos(a) * R * 0.33, cy + Math.sin(a) * R * 0.33] })
  const outer = [0, 1, 2, 3, 4].map(k => {
    const d = (-90 + k * 72) * deg, ux = Math.cos(d), uy = Math.sin(d)
    const pc = [cx + ux * R * 0.88, cy + uy * R * 0.88]
    const pts = [0, 1, 2, 3, 4].map(j => {
      const a = d + Math.PI + j * 72 * deg
      const vx = Math.cos(a) * R * 0.36, vy = Math.sin(a) * R * 0.36
      const radial = vx * ux + vy * uy
      const tx = vx - radial * ux, ty = vy - radial * uy
      return [pc[0] + radial * 0.55 * ux + tx * 0.9, pc[1] + radial * 0.55 * uy + ty * 0.9]
    })
    return { pc, pts }
  })
  ctx.fillStyle = patch
  poly(center); ctx.fill()
  outer.forEach(o => { poly(o.pts); ctx.fill() })
  // Seams: center → each rim patch, and between neighbouring rim patches
  ctx.strokeStyle = patch
  ctx.lineWidth = 0.022 * S
  ctx.lineCap = 'round'
  const nearest = (pts, [x, y]) => pts.slice(1).reduce((best, p) => Math.hypot(p[0] - x, p[1] - y) < Math.hypot(best[0] - x, best[1] - y) ? p : best)
  ctx.beginPath()
  outer.forEach((o, k) => {
    ctx.moveTo(...center[k]); ctx.lineTo(...o.pts[0])
    const n = outer[(k + 1) % 5]
    ctx.moveTo(...nearest(o.pts, n.pc)); ctx.lineTo(...nearest(n.pts, o.pc))
  })
  ctx.stroke()
  // Sphere shading + specular highlight
  const g = ctx.createRadialGradient(cx - R * 0.4, cy - R * 0.45, R * 0.05, cx, cy, R)
  g.addColorStop(0,    'rgba(255,255,255,0.45)')
  g.addColorStop(0.45, 'rgba(255,255,255,0)')
  g.addColorStop(0.8,  'rgba(0,0,0,0.12)')
  g.addColorStop(1,    'rgba(0,0,0,0.45)')
  ctx.fillStyle = g; ctx.fillRect(0, 0, S, S)
  ctx.filter = 'blur(2px)'
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.beginPath(); ctx.ellipse(cx - R * 0.42, cy - R * 0.48, R * 0.16, R * 0.09, -0.6, 0, Math.PI * 2); ctx.fill()
  ctx.restore()

  ball(); ctx.strokeStyle = OUTLINE; ctx.lineWidth = 0.03 * S; ctx.stroke()
}

// Basketball — pebbled orange sphere with black channels (two meridians + the curved side seams)
function drawBasketball(ctx, S, hex) {
  const cx = 0.47 * S, cy = 0.47 * S, R = 0.43 * S
  const seam = luminance(hex) < 70 ? 'rgba(255,255,255,0.8)' : '#1c1007'

  softShadow(ctx, S, (c) => { c.beginPath(); c.ellipse(cx, cy, R * 0.95, R * 0.85, 0, 0, Math.PI * 2); c.fill() }, 0.06 * S, 0.07 * S, 5, 0.35)

  const ball = () => { ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2) }
  ball(); ctx.fillStyle = hex; ctx.fill()

  ctx.save()
  ball(); ctx.clip()
  // Pebble grain — tiny darker dots
  ctx.fillStyle = 'rgba(0,0,0,0.1)'
  for (let i = 0; i < 260; i++) {
    const a = i * 2.39996, d = Math.sqrt(i / 260) * R
    ctx.beginPath(); ctx.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 0.006 * S, 0, Math.PI * 2); ctx.fill()
  }
  // Channels, tilted a little so the ball looks turned toward the light
  ctx.translate(cx, cy); ctx.rotate(-0.35)
  ctx.strokeStyle = seam
  ctx.lineWidth = 0.024 * S
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(-R, 0); ctx.quadraticCurveTo(0, R * 0.16, R, 0)                     // equator
  ctx.moveTo(0, -R); ctx.quadraticCurveTo(-R * 0.12, 0, 0, R)                    // meridian
  ctx.moveTo(-R * 0.62, -R * 0.8); ctx.quadraticCurveTo(-R * 0.18, 0, -R * 0.62, R * 0.8)   // left side seam
  ctx.moveTo(R * 0.62, -R * 0.8);  ctx.quadraticCurveTo(R * 0.18, 0, R * 0.62, R * 0.8)     // right side seam
  ctx.stroke()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  // Sphere shading + specular highlight
  const g = ctx.createRadialGradient(cx - R * 0.4, cy - R * 0.45, R * 0.05, cx, cy, R)
  g.addColorStop(0,    'rgba(255,255,255,0.4)')
  g.addColorStop(0.45, 'rgba(255,255,255,0)')
  g.addColorStop(0.8,  'rgba(0,0,0,0.15)')
  g.addColorStop(1,    'rgba(0,0,0,0.5)')
  ctx.fillStyle = g; ctx.fillRect(0, 0, S, S)
  ctx.filter = 'blur(2px)'
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.beginPath(); ctx.ellipse(cx - R * 0.42, cy - R * 0.48, R * 0.16, R * 0.09, -0.6, 0, Math.PI * 2); ctx.fill()
  ctx.restore()

  ball(); ctx.strokeStyle = OUTLINE; ctx.lineWidth = 0.03 * S; ctx.stroke()
}

// Disc cone — side-on frustum with an open top and ridge rings
function drawCone(ctx, S, hex) {
  const bx = 0.5 * S, by = 0.68 * S, rb = 0.4 * S, rt = 0.11 * S, h = 0.24 * S
  const ty = by - h
  const ell = (y, r) => [bx, y, r, r * EQUIP_SQUASH]
  const body = () => {
    ctx.beginPath()
    ctx.moveTo(bx - rb, by)
    ctx.lineTo(bx - rt, ty)
    ctx.ellipse(...ell(ty, rt), 0, Math.PI, Math.PI * 2)        // back rim of the top
    ctx.lineTo(bx + rb, by)
    ctx.ellipse(...ell(by, rb), 0, 0, Math.PI)                  // front of the base
    ctx.closePath()
  }

  softShadow(ctx, S, (c) => { c.beginPath(); c.ellipse(...ell(by, rb), 0, 0, Math.PI * 2); c.fill() }, 0.05 * S, 0.02 * S, 5, 0.38)

  body(); ctx.strokeStyle = OUTLINE; ctx.lineWidth = 0.035 * S; ctx.lineJoin = 'round'; ctx.stroke()
  body(); ctx.fillStyle = hex; ctx.fill()
  ctx.save()
  body(); ctx.clip()
  sideShade(ctx, S, bx - rb, 0, bx + rb, 0, 0.32, 0.42)
  // Ridge rings across the front
  ;[0.3, 0.62].forEach(f => {
    const y = by - h * f, r = rb + (rt - rb) * f
    ctx.beginPath(); ctx.ellipse(...ell(y, r), 0, 0, Math.PI)
    ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 0.012 * S; ctx.stroke()
    ctx.beginPath(); ctx.ellipse(...ell(y + 0.01 * S, r), 0, 0.15, Math.PI - 0.15)
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 0.008 * S; ctx.stroke()
  })
  ctx.restore()
  // Open top: dark hole with a lit rim on the far side
  ctx.beginPath(); ctx.ellipse(...ell(ty, rt), 0, 0, Math.PI * 2)
  ctx.fillStyle = shadeHex(hex, -0.6); ctx.fill()
  ctx.strokeStyle = shadeHex(hex, -0.15); ctx.lineWidth = 0.02 * S; ctx.stroke()
  ctx.beginPath(); ctx.ellipse(...ell(ty, rt), 0, Math.PI * 1.1, Math.PI * 1.7)
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 0.012 * S; ctx.stroke()
}

// Agility hoop — a round tube lying on the grass
function drawHoop(ctx, S, hex) {
  const cx = 0.48 * S, cy = 0.48 * S, R = 0.39 * S, t = 0.04 * S
  const ring = (dx = 0, dy = 0) => { ctx.beginPath(); ctx.arc(cx + dx, cy + dy, R, 0, Math.PI * 2) }

  softShadow(ctx, S, (c) => { c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.lineWidth = t * 2; c.stroke() }, 0.03 * S, 0.025 * S, 3, 0.4)

  ring(); ctx.strokeStyle = OUTLINE; ctx.lineWidth = t * 2 + 0.03 * S; ctx.stroke()
  ring(); ctx.strokeStyle = hex; ctx.lineWidth = t * 2; ctx.stroke()
  // Shifting the ring down-right / up-left keeps the shade / highlight on the same side of the tube all the way round
  ring(t * 0.35, t * 0.35); ctx.strokeStyle = shadeHex(hex, -0.4); ctx.lineWidth = t * 0.7; ctx.stroke()
  ring(-t * 0.38, -t * 0.38); ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = t * 0.35; ctx.stroke()
}

// Agility pole — weighted disc base with a tall upright pole
function drawPole(ctx, S, hex) {
  const bx = 0.5 * S, by = 0.84 * S, rb = 0.2 * S, hb = 0.05 * S, r = 0.035 * S, top = 0.1 * S
  const ell = (y, rad) => [bx, y, rad, rad * EQUIP_SQUASH]

  // Shadow: the base, plus the pole's shadow stretched across the grass to the lower right
  softShadow(ctx, S, (c) => {
    c.beginPath(); c.ellipse(...ell(by, rb), 0, 0, Math.PI * 2); c.fill()
    c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + 0.42 * S, by + 0.08 * S); c.lineWidth = r * 2; c.stroke()
  }, 0.03 * S, 0.01 * S, 3, 0.35)

  // Base: a short cylinder
  const base = () => {
    ctx.beginPath()
    ctx.moveTo(bx - rb, by - hb)
    ctx.ellipse(...ell(by - hb, rb), 0, Math.PI, Math.PI * 2)
    ctx.lineTo(bx + rb, by)
    ctx.ellipse(...ell(by, rb), 0, 0, Math.PI)
    ctx.closePath()
  }
  base(); ctx.strokeStyle = OUTLINE; ctx.lineWidth = 0.03 * S; ctx.stroke()
  base(); ctx.fillStyle = shadeHex(hex, -0.25); ctx.fill()
  ctx.beginPath(); ctx.ellipse(...ell(by - hb, rb), 0, 0, Math.PI * 2)
  const face = ctx.createLinearGradient(bx - rb, 0, bx + rb, 0)
  face.addColorStop(0, shadeHex(hex, 0.3)); face.addColorStop(1, shadeHex(hex, -0.1))
  ctx.fillStyle = face; ctx.fill()

  // Pole: lit on the left, rounded top cap
  const rod = () => { ctx.beginPath(); ctx.roundRect(bx - r, top, r * 2, by - hb - top, [r, r, 0, 0]) }
  rod(); ctx.strokeStyle = OUTLINE; ctx.lineWidth = 0.025 * S; ctx.stroke()
  rod(); ctx.fillStyle = hex; ctx.fill()
  ctx.save()
  rod(); ctx.clip()
  sideShade(ctx, S, bx - r, 0, bx + r, 0, 0.5, 0.45)
  ctx.restore()
  // Collar where the pole meets the base
  ctx.beginPath(); ctx.ellipse(bx, by - hb, r * 1.6, r * 1.6 * EQUIP_SQUASH, 0, 0, Math.PI * 2)
  ctx.fillStyle = shadeHex(hex, -0.35); ctx.fill()
  ctx.strokeStyle = OUTLINE; ctx.lineWidth = 0.012 * S; ctx.stroke()
  // Rod again over the collar so it sits inside it
  ctx.save()
  ctx.beginPath(); ctx.rect(0, 0, S, by - hb); ctx.clip()
  rod(); ctx.fillStyle = hex; ctx.fill()
  rod(); ctx.clip()
  sideShade(ctx, S, bx - r, 0, bx + r, 0, 0.5, 0.45)
  ctx.restore()
}

// Pinnie — mesh training vest lying flat, contrast trim on the neck, armholes and hem
function drawPinnie(ctx, S, hex) {
  const trim = luminance(hex) > 170 ? '#1f2937' : '#facc15'
  const P = (u, v) => [u * S, v * S]
  // Segments traced clockwise; trimmed ones get the contrast binding
  const segs = [
    { trim: false, d: (c) => { c.moveTo(...P(0.30, 0.17)); c.lineTo(...P(0.40, 0.15)) } },
    { trim: true,  d: (c) => { c.moveTo(...P(0.40, 0.15)); c.quadraticCurveTo(...P(0.5, 0.33), ...P(0.60, 0.15)) } },
    { trim: false, d: (c) => { c.moveTo(...P(0.60, 0.15)); c.lineTo(...P(0.70, 0.17)) } },
    { trim: true,  d: (c) => { c.moveTo(...P(0.70, 0.17)); c.quadraticCurveTo(...P(0.70, 0.43), ...P(0.82, 0.47)) } },
    { trim: false, d: (c) => { c.moveTo(...P(0.82, 0.47)); c.lineTo(...P(0.86, 0.84)) } },
    { trim: true,  d: (c) => {
      c.moveTo(...P(0.86, 0.84))
      c.quadraticCurveTo(...P(0.72, 0.90), ...P(0.58, 0.85))
      c.quadraticCurveTo(...P(0.44, 0.80), ...P(0.30, 0.87))
      c.quadraticCurveTo(...P(0.20, 0.91), ...P(0.14, 0.84))
    } },
    { trim: false, d: (c) => { c.moveTo(...P(0.14, 0.84)); c.lineTo(...P(0.18, 0.47)) } },
    { trim: true,  d: (c) => { c.moveTo(...P(0.18, 0.47)); c.quadraticCurveTo(...P(0.30, 0.43), ...P(0.30, 0.17)) } },
  ]
  // One continuous outline: replay each segment without its leading moveTo
  const vest = (c) => {
    c.beginPath()
    let first = true
    segs.forEach(sg => {
      const rec = { moveTo: (x, y) => { if (first) { c.moveTo(x, y); first = false } }, lineTo: c.lineTo.bind(c), quadraticCurveTo: c.quadraticCurveTo.bind(c) }
      sg.d(rec)
    })
    c.closePath()
  }

  // Shrink a touch about the center so the hem corners stay inside the circular clip
  ctx.save()
  ctx.translate(S / 2, S / 2); ctx.scale(0.9, 0.9); ctx.translate(-S / 2, -S / 2)

  softShadow(ctx, S, (c) => { vest(c); c.fill() }, 0.035 * S, 0.035 * S, 4, 0.35)

  vest(ctx); ctx.strokeStyle = OUTLINE; ctx.lineWidth = 0.035 * S; ctx.lineJoin = 'round'; ctx.stroke()
  vest(ctx); ctx.fillStyle = hex; ctx.fill()
  ctx.save()
  vest(ctx); ctx.clip()
  sideShade(ctx, S, 0.14 * S, 0.15 * S, 0.86 * S, 0.9 * S, 0.28, 0.4)
  // Mesh texture
  ctx.fillStyle = 'rgba(0,0,0,0.13)'
  const step = 0.026 * S
  for (let y = 0; y < S; y += step) for (let x = (y / step) % 2 ? step / 2 : 0; x < S; x += step) {
    ctx.beginPath(); ctx.arc(x, y, 0.0045 * S, 0, Math.PI * 2); ctx.fill()
  }
  // Soft folds: shadow creases with a highlight just above each
  ctx.lineCap = 'round'
  ;[[0.26, 0.58, 0.5, 0.52, 0.74, 0.6], [0.3, 0.72, 0.52, 0.66, 0.7, 0.74]].forEach(([x0, y0, qx, qy, x1, y1]) => {
    ctx.beginPath(); ctx.moveTo(x0 * S, y0 * S); ctx.quadraticCurveTo(qx * S, qy * S, x1 * S, y1 * S)
    ctx.strokeStyle = 'rgba(0,0,0,0.22)'; ctx.lineWidth = 0.02 * S; ctx.stroke()
    ctx.beginPath(); ctx.moveTo(x0 * S, (y0 - 0.025) * S); ctx.quadraticCurveTo(qx * S, (qy - 0.025) * S, x1 * S, (y1 - 0.025) * S)
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 0.014 * S; ctx.stroke()
  })
  ctx.restore()
  // Trim binding with a thin dark edge
  ctx.lineCap = 'round'
  segs.filter(sg => sg.trim).forEach(sg => {
    ctx.beginPath(); sg.d(ctx)
    ctx.strokeStyle = OUTLINE; ctx.lineWidth = 0.05 * S; ctx.stroke()
    ctx.strokeStyle = trim; ctx.lineWidth = 0.032 * S; ctx.stroke()
  })
  ctx.restore()
}

const EQUIP_RENDERERS = { ball: drawBall, basketball: drawBasketball, cone: drawCone, hoop: drawHoop, pole: drawPole, pinnie: drawPinnie }

function getEquipCanvas(type, hexColor) {
  const key = `${type}|${hexColor}`
  if (_equipCache.has(key)) return _equipCache.get(key)
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = EQUIP_PX
  EQUIP_RENDERERS[type](canvas.getContext('2d'), EQUIP_PX, hexColor)
  _equipCache.set(key, canvas)
  return canvas
}

// Shading is baked for light from the upper left, so these never rotate (they use
// Facing or simply stay upright). The pinnie lies flat, so it keeps Rotate 90°.
const isUpright = (type) =>
  MARKER_TYPES.has(type) || PLAYER_TYPES.has(type) || MODEL_TYPES.has(type) || (type in EQUIP_RENDERERS && type !== 'pinnie')

const _equipPreview = new Map()
function equipPreview(type) {
  if (!_equipPreview.has(type)) _equipPreview.set(type, getEquipCanvas(type, DEFAULT_COLORS[type]).toDataURL())
  return _equipPreview.get(type)
}

// ── Sidebar button ────────────────────────────────────────────────────────────
function SidebarBtn({ label, icon, imgSrc, active, onClick, disabled }) {
  return (
    <button
      className={`sidebar-btn${active ? ' active' : ''}${disabled ? ' disabled' : ''}`}
      onClick={onClick}
      title={label}
    >
      <div className="sidebar-icon">
        {imgSrc ? <img src={imgSrc} alt={label} /> : <span>{icon}</span>}
      </div>
      <span className="sidebar-label">{label}</span>
    </button>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  // Object metadata — type, size, rotation, color (NOT position; positions live in frames)
  const [placedObjects, setPlacedObjects] = useState([])

  // Frame system — each frame stores { positions: { [id]: {x,y} } } for every object
  const [frames, setFrames]             = useState([{ positions: {} }])
  const [currentFrame, setCurrentFrame] = useState(0)
  const [isPlaying, setIsPlaying]       = useState(false)
  const [playSpeed, setPlaySpeed]       = useState(1)

  // UI state
  const [activePanel, setActivePanel] = useState(null)
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false)
  const [contextMenu, setContextMenu] = useState(null)   // { x, y, objId }
  const [images, setImages]       = useState({})   // { [type]: HTMLImageElement, field_half: ... }
  const [currentField, setCurrentField] = useState('full')
  const [sport, setSport]               = useState('soccer')

  const [isExporting, setIsExporting]   = useState(false)
  const [exportBlob,  setExportBlob]    = useState(null)   // ready-to-save recording
  const [exportName,  setExportName]    = useState('play')

  const [viewW, setViewW] = useState(() => window.innerWidth)
  const [viewH, setViewH] = useState(() => window.innerHeight)

  const [drawings,    setDrawings]    = useState([])
  const [currentDraw, setCurrentDraw] = useState(null)
  const [drawTool,    setDrawTool]    = useState({ type: 'line', mode: 'straight', color: '#ffffff', thickness: 2 })
  const [drawCtxMenu, setDrawCtxMenu] = useState(null)   // { x, y, id }

  const [freePaths,    setFreePaths]    = useState({})   // { "f-t": { [objId]: [x,y,...] } }
  const [freePathMode, setFreePathMode] = useState(false)

  const [shapes,          setShapes]          = useState([])
  const [selectedShapeId, setSelectedShapeId] = useState(null)
  const [shapeTool,       setShapeTool]       = useState({ type: 'rect', color: '#3b82f6', style: 'outline', keepRatio: false })
  const [shapeCtxMenu,    setShapeCtxMenu]    = useState(null)

  const [textItems,      setTextItems]      = useState([])
  const [selectedTextId, setSelectedTextId] = useState(null)
  const [editingText,    setEditingText]    = useState(null)  // { id, x, y, width, height }
  const [textTool,       setTextTool]       = useState({
    fontSize: 18,
    bold: false,
    italic: false,
    fill: '#ffffff',
    background: 'transparent',
    align: 'left',
  })
  const [textCtxMenu,    setTextCtxMenu]    = useState(null)

  // Active canvas dims — must be computed before any callbacks that reference them
  const isFullField = currentField === 'full'
  const aFW = isFullField ? FW : LW
  const aFH = isFullField ? FH : LH
  const aSW = isFullField ? SW : LSW
  const aSH = isFullField ? SH : LSH
  const aCX = aFW / 2
  const aCY = aFH / 2

  // Scale the stage to fit available viewport space; never enlarges past 1
  const isMobile = viewW < 640
  const fieldScale = Math.min(
    (viewW - (isMobile ? 16 : 66 + 40)) / aSW,   // sidebar + main h-padding
    (viewH - (isMobile ? 192 : 148))    / aSH,   // header + bottom-bar + mobile-nav + gaps
    1
  )

  // ── History (undo) ───────────────────────────────────────────────────────────
  const historyRef         = useRef([])
  const placedObjectsRef   = useRef([])
  const framesRef          = useRef([])
  const freePathsRef       = useRef({})
  placedObjectsRef.current = placedObjects
  framesRef.current        = frames
  freePathsRef.current     = freePaths

  const nextId           = useRef(0)
  const nextDrawId       = useRef(0)
  const recordingPath    = useRef(null)   // { objId, segKey, points } during free-path drag
  const previewLineRef   = useRef(null)   // direct Konva Line node for live path preview
  const objRefs          = useRef({})
  const rafRef           = useRef(null)
  const stageRef         = useRef(null)
  const recorderRef      = useRef(null)
  const exportStartedRef = useRef(false)  // flips true once isPlaying goes true during export
  const shapeRefs      = useRef({})
  const transformerRef = useRef(null)
  const nextShapeId    = useRef(0)
  const shapesRef      = useRef([])  // mirrors shapes state for use inside event handlers
  const textGroupRefs  = useRef({})
  const textNodeRefs   = useRef({})
  const textTransRef   = useRef(null)
  const nextTextId     = useRef(0)
  const textEditRef    = useRef(null)

  // Load all catalog + field images once
  useEffect(() => {
    CATALOG.forEach(({ type, src }) => {
      if (!src) return
      const img = new window.Image()
      img.src = `${import.meta.env.BASE_URL}${src}`
      img.onload = () => setImages(prev => ({ ...prev, [type]: img }))
    })
    // Deduplicate by src so halfield.png only loads once; both half and half-flip share the same image
    const seenSrcs = new Map()
    FIELD_CATALOG.filter(f => f.src).forEach(({ id, src }) => {
      if (!seenSrcs.has(src)) {
        const img = new window.Image()
        img.src = `${import.meta.env.BASE_URL}${src}`
        img.onload = () => setImages(prev => {
          const updates = {}
          FIELD_CATALOG.filter(f => f.src === src).forEach(f => { updates[`field_${f.id}`] = img })
          return { ...prev, ...updates }
        })
        seenSrcs.set(src, true)
      }
    })
  }, [])

  // Close context menu on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setContextMenu(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Track viewport size for stage scaling
  useEffect(() => {
    const onResize = () => { setViewW(window.innerWidth); setViewH(window.innerHeight) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Keep shapesRef in sync with shapes state
  useEffect(() => { shapesRef.current = shapes }, [shapes])

  // Attach/detach Konva Transformer to selected shape node
  useEffect(() => {
    const tr = transformerRef.current
    if (!tr) return
    const node = selectedShapeId !== null ? shapeRefs.current[selectedShapeId] : null
    tr.nodes(node ? [node] : [])
    tr.getLayer()?.batchDraw()
  }, [selectedShapeId])

  // Attach/detach Konva Transformer to selected text node
  useEffect(() => {
    const tr = textTransRef.current
    if (!tr) return
    const node = selectedTextId !== null ? textGroupRefs.current[selectedTextId] : null
    tr.nodes(node ? [node] : [])
    tr.getLayer()?.batchDraw()
  }, [selectedTextId])

  // Stop the recorder once the animation finishes during export
  useEffect(() => {
    if (!isExporting) return
    if (isPlaying) { exportStartedRef.current = true; return }
    if (!exportStartedRef.current) return  // export hasn't started playing yet
    if (recorderRef.current?.state === 'recording') {
      // Small delay so the final frame is flushed to the canvas before we stop
      setTimeout(() => {
        recorderRef.current?.stop()
        exportStartedRef.current = false
        setIsExporting(false)
      }, 200)
    }
  }, [isPlaying, isExporting])

  // ── Object mutations ─────────────────────────────────────────────────────────

  const addToField = useCallback((type) => {
    const isNumbered = NUMBERED_TYPES.has(type)
    const number     = isNumbered ? nextFreeNumber(placedObjects, type) : null
    if (isNumbered && number == null) return
    pushHistory()
    const id = nextId.current++
    const initPos = {
      x: aCX + (Math.random() - 0.5) * 120,
      y: aCY + (Math.random() - 0.5) * 80,
    }
    setPlacedObjects(prev => [...prev, {
      id,
      type,
      size: GOAL_DEFAULT_SIZE[type] ?? (PLAYER_TYPES.has(type) ? PLAYER_DEFAULT_SIZE : DEFAULT_SIZE),
      rotation: 0,
      ...(DEFAULT_COLORS[type] ? { color: DEFAULT_COLORS[type] } : {}),
      ...(isNumbered ? { number } : {}),
      ...(MODEL_TYPES.has(type) ? { facing: GOAL_DEFAULT_FACING } : {}),
    }])
    setFrames(prev => prev.map(f => ({
      ...f,
      positions: { ...f.positions, [id]: { ...initPos } },
    })))
  }, [aCX, aCY, placedObjects])

  // Called onDragMove / onDragEnd — updates only the current frame
  const moveObject = useCallback((id, x, y) => {
    setFrames(prev => {
      const updated = [...prev]
      updated[currentFrame] = {
        ...updated[currentFrame],
        positions: { ...updated[currentFrame].positions, [id]: { x, y } },
      }
      return updated
    })
  }, [currentFrame])

  const deleteObject = useCallback((id) => {
    pushHistory()
    setPlacedObjects(prev => prev.filter(o => o.id !== id))
    setFrames(prev => prev.map(f => {
      const positions = { ...f.positions }
      delete positions[id]
      return { ...f, positions }
    }))
    setFreePaths(prev => {
      const next = {}
      Object.entries(prev).forEach(([key, seg]) => {
        const updated = { ...seg }
        delete updated[id]
        if (Object.keys(updated).length) next[key] = updated
      })
      return next
    })
    setContextMenu(null)
  }, [])

  const rotateObject = useCallback((id) => {
    pushHistory()
    setPlacedObjects(prev => prev.map(o =>
      o.id !== id ? o
        : MODEL_TYPES.has(o.type) ? { ...o, facing: ((o.facing ?? GOAL_DEFAULT_FACING) + 45) % 360 }
        : { ...o, rotation: (o.rotation + 90) % 360 }
    ))
  }, [])

  const setGoalFacing = useCallback((id, facing) => {
    pushHistory()
    setPlacedObjects(prev => prev.map(o => o.id === id ? { ...o, facing } : o))
  }, [])

  const duplicateObject = useCallback((id) => {
    const src = placedObjects.find(o => o.id === id)
    if (!src) return
    // Duplicated numbered objects take the next free number rather than copying it
    const isNumbered = NUMBERED_TYPES.has(src.type)
    const number     = isNumbered ? nextFreeNumber(placedObjects, src.type) : null
    if (isNumbered && number == null) return
    pushHistory()
    const newId = nextId.current++
    setPlacedObjects(prev => [...prev, { ...src, id: newId, ...(number != null ? { number } : {}) }])
    setFrames(prev => prev.map(f => {
      const orig = f.positions[id] ?? { x: aCX, y: aCY }
      return { ...f, positions: { ...f.positions, [newId]: { x: orig.x + 28, y: orig.y + 28 } } }
    }))
    setContextMenu(null)
  }, [placedObjects])

  // Layer order = position in placedObjects (later entries draw on top)
  const reorderObject = useCallback((id, mode) => {
    const from = placedObjects.findIndex(o => o.id === id)
    if (from < 0) return
    const last = placedObjects.length - 1
    const to = { front: last, forward: Math.min(from + 1, last), backward: Math.max(from - 1, 0), back: 0 }[mode]
    if (to === from) return
    pushHistory()
    setPlacedObjects(prev => {
      const next = [...prev]
      const [obj] = next.splice(from, 1)
      next.splice(to, 0, obj)
      return next
    })
  }, [placedObjects])

  const resizeObject = useCallback((id, size) => {
    pushHistory()
    setPlacedObjects(prev => prev.map(o => o.id === id ? { ...o, size } : o))
  }, [])

  const setObjectColor = useCallback((id, color) => {
    pushHistory()
    setPlacedObjects(prev => prev.map(o => o.id === id ? { ...o, color } : o))
  }, [])

  // ── Draw tool ────────────────────────────────────────────────────────────────

  const getLayerPos = useCallback(() => {
    const layer = stageRef.current?.getLayers()?.[0]
    return layer?.getRelativePointerPosition() ?? { x: 0, y: 0 }
  }, [])

  const handleDrawStart = useCallback(() => {
    const pos = getLayerPos()
    setCurrentDraw({
      id: nextDrawId.current++,
      type: drawTool.type,
      mode: drawTool.mode,
      color: drawTool.color,
      thickness: drawTool.thickness,
      points: [pos.x, pos.y, pos.x, pos.y],
    })
  }, [drawTool, getLayerPos])

  const handleDrawMove = useCallback(() => {
    const pos = getLayerPos()
    setCurrentDraw(prev => {
      if (!prev) return prev
      if (prev.mode === 'straight') {
        const pts = [...prev.points]
        pts[pts.length - 2] = pos.x
        pts[pts.length - 1] = pos.y
        return { ...prev, points: pts }
      } else {
        const last = prev.points.slice(-2)
        const dx = pos.x - last[0], dy = pos.y - last[1]
        if (dx * dx + dy * dy < 4) return prev   // skip if < 2px movement
        return { ...prev, points: [...prev.points, pos.x, pos.y] }
      }
    })
  }, [getLayerPos])

  const handleDrawEnd = useCallback(() => {
    pushHistory()
    setCurrentDraw(prev => {
      if (!prev) return prev
      const pts = prev.points
      const dx = pts[pts.length - 2] - pts[0]
      const dy = pts[pts.length - 1] - pts[1]
      if (Math.sqrt(dx * dx + dy * dy) > 5) {
        setDrawings(d => [...d, prev])
      }
      return null
    })
  }, [])

  const deleteDrawing = useCallback((id) => {
    setDrawings(prev => prev.filter(d => d.id !== id))
    setDrawCtxMenu(null)
  }, [])

  const moveDrawing = useCallback((id, dx, dy) => {
    setDrawings(prev => prev.map(d =>
      d.id !== id ? d : {
        ...d,
        points: d.points.map((v, i) => v + (i % 2 === 0 ? dx : dy)),
      }
    ))
  }, [])

  // ── Shape mutations ──────────────────────────────────────────────────────────

  const addShape = useCallback((type) => {
    const id = nextShapeId.current++
    const defaults = type === 'ellipse'
      ? { width: 90,  height: 90  }
      : type === 'triangle'
        ? { width: 100, height: 87  }
        : { width: 100, height: 100 }
    setShapes(prev => [...prev, {
      id, type,
      x: aCX + (Math.random() - 0.5) * 80,
      y: aCY + (Math.random() - 0.5) * 60,
      rotation: 0,
      color: shapeTool.color,
      style: shapeTool.style,
      ...defaults,
    }])
  }, [shapeTool, aCX, aCY])

  const deleteShape = useCallback((id) => {
    setShapes(prev => prev.filter(s => s.id !== id))
    setSelectedShapeId(prev => prev === id ? null : prev)
    setShapeCtxMenu(null)
  }, [])

  const handleShapeTransformEnd = useCallback((id, e) => {
    const node = e.target
    const shape = shapesRef.current.find(s => s.id === id)
    if (!shape) return
    const scX = node.scaleX(), scY = node.scaleY()
    const newW = Math.max(10, Math.abs(shape.width  * scX))
    const newH = Math.max(10, Math.abs(shape.height * scY))
    node.scaleX(1); node.scaleY(1)
    // Bake scale back into native Konva props to avoid flash before React re-renders
    if (shape.type === 'rect') {
      node.width(newW); node.height(newH)
      node.offsetX(newW / 2); node.offsetY(newH / 2)
    } else if (shape.type === 'ellipse') {
      node.radiusX(newW / 2); node.radiusY(newH / 2)
    } else if (shape.type === 'triangle') {
      node.points([0, -newH/2, newW/2, newH/2, -newW/2, newH/2])
    }
    setShapes(prev => prev.map(s =>
      s.id === id
        ? { ...s, x: node.x(), y: node.y(), width: newW, height: newH, rotation: node.rotation() }
        : s
    ))
  }, [])

  // ── Text tool ────────────────────────────────────────────────────────────────

  const openTextEdit = useCallback((id) => {
    const group = textGroupRefs.current[id]
    if (!group || !stageRef.current) return
    const stageEl = stageRef.current.container()
    const stageRect = stageEl.getBoundingClientRect()
    const rect = group.getClientRect({ relativeTo: stageRef.current })
    setSelectedTextId(null)
    setEditingText({
      id,
      x: stageRect.left + rect.x,
      y: stageRect.top  + rect.y,
      width:  Math.max(60,  rect.width),
      height: Math.max(24, rect.height),
    })
  }, [])

  const addText = useCallback(() => {
    const id = nextTextId.current++
    const fontStyle = [textTool.bold && 'bold', textTool.italic && 'italic'].filter(Boolean).join(' ') || 'normal'
    setTextItems(prev => [...prev, {
      id,
      x: aCX + (Math.random() - 0.5) * 120,
      y: aCY + (Math.random() - 0.5) * 80,
      text: 'Label',
      fontSize: textTool.fontSize,
      fontStyle,
      fill: textTool.fill,
      background: textTool.background,
      align: textTool.align,
      rotation: 0,
      scaleX: 1, scaleY: 1,
      width: 110,
    }])
    // Defer edit until node is mounted
    requestAnimationFrame(() => requestAnimationFrame(() => openTextEdit(id)))
  }, [textTool, aCX, aCY, openTextEdit])

  const deleteText = useCallback((id) => {
    setTextItems(prev => prev.filter(t => t.id !== id))
    setSelectedTextId(prev => prev === id ? null : prev)
    setTextCtxMenu(null)
  }, [])

  const handleTextTransformEnd = useCallback((id, e) => {
    const node = e.target
    setTextItems(prev => prev.map(t =>
      t.id === id
        ? { ...t, x: node.x(), y: node.y(), scaleX: node.scaleX(), scaleY: node.scaleY(), rotation: node.rotation() }
        : t
    ))
  }, [])

  // ── Free-path recording ──────────────────────────────────────────────────────

  const handleFreePathDragStart = useCallback((objId, x, y) => {
    pushHistory()
    if (!freePathMode || currentFrame === 0) return
    recordingPath.current = {
      objId,
      segKey: `${currentFrame - 1}-${currentFrame}`,
      points: [x, y],
    }
    previewLineRef.current?.points([x, y])
    previewLineRef.current?.getLayer()?.batchDraw()
  }, [freePathMode, currentFrame])

  const handleFreePathDragMove = useCallback((objId, x, y) => {
    if (!recordingPath.current || recordingPath.current.objId !== objId) return
    const pts = recordingPath.current.points
    const dx = x - pts[pts.length - 2], dy = y - pts[pts.length - 1]
    if (dx*dx + dy*dy >= 9) {
      pts.push(x, y)
      previewLineRef.current?.points([...pts])
      previewLineRef.current?.getLayer()?.batchDraw()
    }
  }, [])

  const handleFreePathDragEnd = useCallback((objId, x, y) => {
    if (!recordingPath.current || recordingPath.current.objId !== objId) return
    const { segKey, points } = recordingPath.current
    recordingPath.current = null
    points.push(x, y)
    previewLineRef.current?.points([])
    previewLineRef.current?.getLayer()?.batchDraw()
    if (points.length >= 6) {
      setFreePaths(prev => ({
        ...prev,
        [segKey]: { ...(prev[segKey] ?? {}), [objId]: points },
      }))
    }
  }, [])

  // Resets everything back to a blank board
  const clearBoard = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    setIsPlaying(false)
    setPlacedObjects([])
    setFrames([{ positions: {} }])
    setCurrentFrame(0)
    setContextMenu(null)
    setDrawings([])
    setCurrentDraw(null)
    setDrawCtxMenu(null)
    setFreePaths({})
    setShapes([])
    setSelectedShapeId(null)
    setShapeCtxMenu(null)
    setTextItems([])
    setSelectedTextId(null)
    setEditingText(null)
    setTextCtxMenu(null)
    recordingPath.current = null
    previewLineRef.current?.points([])
  }, [])

  // ── Save / Open ──────────────────────────────────────────────────────────────
  // A play is saved as a .json file holding everything on the board. Opening one
  // replaces the board and clears undo history.
  const SAVE_FORMAT  = 'tactics-board'
  const SAVE_VERSION = 1
  const fileInputRef = useRef(null)
  const [playName, setPlayName] = useState('play')

  const saveAnimation = useCallback(async () => {
    const data = {
      format: SAVE_FORMAT, version: SAVE_VERSION, savedAt: new Date().toISOString(),
      sport, field: currentField, playSpeed,
      placedObjects, frames, freePaths, drawings, shapes, textItems,
      nextIds: { object: nextId.current, draw: nextDrawId.current, shape: nextShapeId.current, text: nextTextId.current },
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    // Chrome/Edge: native Save dialog (pick name + folder). Elsewhere: ask for a name and download.
    if (window.showSaveFilePicker) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: `${playName}.json`,
          types: [{ description: 'Tactics play', accept: { 'application/json': ['.json'] } }],
        })
        const w = await handle.createWritable()
        await w.write(blob); await w.close()
        setPlayName(handle.name.replace(/\.json$/i, ''))
        return
      } catch (err) {
        if (err.name === 'AbortError') return
      }
    }
    const name = window.prompt('Save play as:', playName)
    if (!name) return
    const clean = name.trim().replace(/\.json$/i, '') || 'play'
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${clean}.json`
    a.click()
    URL.revokeObjectURL(a.href)
    setPlayName(clean)
  }, [sport, currentField, playSpeed, placedObjects, frames, freePaths, drawings, shapes, textItems, playName])

  // Each sport has its own objects, so switching starts a fresh board (after a confirm if it isn't empty)
  const changeSport = useCallback((next) => {
    if (next === sport) return
    const busy = placedObjects.length || drawings.length || shapes.length || textItems.length
    const label = SPORTS.find(sp => sp.id === next).label.replace(/^\S+\s/, '')
    if (busy && !window.confirm(`Switching to ${label} clears the board. Save first if you want to keep this play.\n\nSwitch anyway?`)) return
    clearBoard()
    historyRef.current = []
    setSport(next)
  }, [sport, placedObjects, drawings, shapes, textItems, clearBoard])

  const openAnimation = useCallback(async (file) => {
    if (!file) return
    let data
    try { data = JSON.parse(await file.text()) } catch { data = null }
    if (!data || data.format !== SAVE_FORMAT || !Array.isArray(data.frames) || !data.frames.length) {
      window.alert(`"${file.name}" isn't a saved tactics play.`)
      return
    }
    clearBoard()
    historyRef.current = []
    const maxId = (items) => items.reduce((m, it) => Math.max(m, Number(it.id) || 0), -1) + 1
    const objects = data.placedObjects ?? [], draws = data.drawings ?? [], shps = data.shapes ?? [], texts = data.textItems ?? []
    nextId.current      = Math.max(data.nextIds?.object ?? 0, maxId(objects))
    nextDrawId.current  = Math.max(data.nextIds?.draw   ?? 0, maxId(draws))
    nextShapeId.current = Math.max(data.nextIds?.shape  ?? 0, maxId(shps))
    nextTextId.current  = Math.max(data.nextIds?.text   ?? 0, maxId(texts))
    setSport(SPORTS.some(sp => sp.id === data.sport) ? data.sport : 'soccer')
    if (data.field) setCurrentField(data.field)
    if (data.playSpeed) setPlaySpeed(data.playSpeed)
    setPlacedObjects(objects)
    setFrames(data.frames)
    setFreePaths(data.freePaths ?? {})
    setDrawings(draws)
    setShapes(shps)
    setTextItems(texts)
    setCurrentFrame(0)
    setPlayName(file.name.replace(/\.json$/i, ''))
  }, [clearBoard])

  const pushHistory = useCallback(() => {
    historyRef.current = [
      ...historyRef.current.slice(-49),
      {
        placedObjects: placedObjectsRef.current,
        frames:        framesRef.current,
        freePaths:     freePathsRef.current,
      },
    ]
  }, [])

  const undo = useCallback(() => {
    if (historyRef.current.length === 0) return
    const snap = historyRef.current[historyRef.current.length - 1]
    historyRef.current = historyRef.current.slice(0, -1)
    setPlacedObjects(snap.placedObjects)
    setFrames(snap.frames)
    setFreePaths(snap.freePaths)
    setCurrentFrame(0)
    setContextMenu(null)
  }, [])

  // ── Frame controls ───────────────────────────────────────────────────────────

  const selectFrame = useCallback((idx) => {
    if (isPlaying) return
    setCurrentFrame(idx)
  }, [isPlaying])

  // New frame copies current frame's object positions
  const addFrame = useCallback(() => {
    if (isPlaying) return
    pushHistory()
    const copy = { ...frames[currentFrame].positions }
    setFrames(prev => [...prev, { positions: copy }])
    setCurrentFrame(frames.length)   // frames.length is pre-update = new frame's index
  }, [frames, currentFrame, isPlaying])

  const deleteFrame = useCallback((idx) => {
    if (frames.length <= 1 || isPlaying) return
    pushHistory()
    const updated = frames.filter((_, i) => i !== idx)
    setFrames(updated)
    setCurrentFrame(prev => Math.min(prev, updated.length - 1))
    setFreePaths(prev => {
      const next = {}
      Object.entries(prev).forEach(([key, seg]) => {
        const [a, b] = key.split('-').map(Number)
        if (a === idx || b === idx) return   // segment touched deleted frame — discard
        const na = a > idx ? a - 1 : a
        const nb = b > idx ? b - 1 : b
        next[`${na}-${nb}`] = seg
      })
      return next
    })
  }, [frames, isPlaying])

  // ── Playback ─────────────────────────────────────────────────────────────────

  const play = useCallback(() => {
    if (frames.length < 2 || isPlaying) return
    setSelectedShapeId(null)
    setSelectedTextId(null)
    setEditingText(null)

    const snap      = frames.map(f => ({ ...f.positions }))
    const pathsSnap = freePaths

    setIsPlaying(true)
    setCurrentFrame(0)

    Object.entries(snap[0]).forEach(([id, pos]) => {
      objRefs.current[Number(id)]?.position(pos)
    })

    const batchDraw = () => {
      const nodes = Object.values(objRefs.current)
      if (nodes.length) nodes[0].getLayer()?.batchDraw()
    }

    let seg = 0

    const runSegment = (startTime) => {
      if (seg >= snap.length - 1) {
        Object.entries(snap[snap.length - 1]).forEach(([id, pos]) => {
          objRefs.current[Number(id)]?.position(pos)
        })
        batchDraw()
        setCurrentFrame(snap.length - 1)
        setIsPlaying(false)
        return
      }

      const fromPos  = snap[seg]
      const toPos    = snap[seg + 1]
      const segPaths = pathsSnap[`${seg}-${seg + 1}`] ?? {}
      const ids = [...new Set([...Object.keys(fromPos), ...Object.keys(toPos)])].map(Number)

      const tick = (now) => {
        const t = Math.min((now - startTime) / (FRAME_MS / playSpeed), 1)
        const e = easeInOut(t)

        ids.forEach(id => {
          const from = fromPos[id]
          const to   = toPos[id]
          if (!from || !to) return
          const path = segPaths[id]
          objRefs.current[id]?.position(
            path
              ? walkPath(path, e)
              : { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e }
          )
        })
        batchDraw()

        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick)
        } else {
          seg++
          setCurrentFrame(seg)
          rafRef.current = requestAnimationFrame(runSegment)
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(runSegment)
  }, [frames, isPlaying, freePaths, playSpeed])

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    setIsPlaying(false)
    setCurrentFrame(0)
  }, [])

  // exportVideo must come AFTER play — it references play in its deps array
  const exportVideo = useCallback(() => {
    if (frames.length < 2 || isPlaying || isExporting) return
    const layer = stageRef.current?.getLayers()?.[0]
    if (!layer) return

    const canvas   = layer.getCanvas()._canvas
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm'
    const stream   = canvas.captureStream(30)
    const recorder = new MediaRecorder(stream, { mimeType })
    const chunks   = []

    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' })
      setExportBlob(blob)
    }

    recorderRef.current      = recorder
    exportStartedRef.current = false
    recorder.start()
    setIsExporting(true)
    // Defer play() one tick so isExporting state is set first
    setTimeout(() => play(), 0)
  }, [frames, isPlaying, isExporting, play])

  // ── Fill helpers ─────────────────────────────────────────────────────────────

  const getObjectFill = (obj, r) => {
    // Players: generated shaded figurine, numbered for the team types
    if (PLAYER_TYPES.has(obj.type)) {
      const canvas = getPlayerCanvas(obj.color ?? DEFAULT_COLORS[obj.type], obj.number ?? null, sport)
      const scale  = (r * 2) / canvas.width
      return {
        fillPatternImage:  canvas,
        fillPatternOffset: { x: canvas.width / 2, y: canvas.height / 2 },
        fillPatternScale:  { x: scale, y: scale },
        fillPatternRepeat: 'no-repeat',
      }
    }
    // Marker: generated beveled puck with its number
    if (MARKER_TYPES.has(obj.type)) {
      const canvas = getMarkerCanvas(obj.color ?? DEFAULT_COLORS[obj.type], obj.number ?? 1)
      const scale  = (r * 2) / canvas.width
      return {
        fillPatternImage:  canvas,
        fillPatternOffset: { x: canvas.width / 2, y: canvas.height / 2 },
        fillPatternScale:  { x: scale, y: scale },
        fillPatternRepeat: 'no-repeat',
      }
    }
    // Goals: 3D model rendered for its facing
    if (MODEL_TYPES.has(obj.type)) {
      const canvas = getGoalCanvas(obj.type, obj.color ?? DEFAULT_COLORS[obj.type], obj.facing ?? GOAL_DEFAULT_FACING)
      const scale  = (r * 2) / canvas.width
      return {
        fillPatternImage:  canvas,
        fillPatternOffset: { x: canvas.width / 2, y: canvas.height / 2 },
        fillPatternScale:  { x: scale, y: scale },
        fillPatternRepeat: 'no-repeat',
      }
    }
    // Equipment: generated ball / cone / hoop / pole / pinnie
    if (EQUIP_RENDERERS[obj.type]) {
      const canvas = getEquipCanvas(obj.type, obj.color ?? DEFAULT_COLORS[obj.type])
      const scale  = (r * 2) / canvas.width
      return {
        fillPatternImage:  canvas,
        fillPatternOffset: { x: canvas.width / 2, y: canvas.height / 2 },
        fillPatternScale:  { x: scale, y: scale },
        fillPatternRepeat: 'no-repeat',
      }
    }
    return { fill: 'white' }
  }

  const ctxObj  = contextMenu ? placedObjects.find(o => o.id === contextMenu.objId) : null
  const canPlay = !isPlaying && frames.length >= 2 && placedObjects.length > 0

  return (
    <div className={`app${mobileToolsOpen ? ' mobile-tools-open' : ''}`}>

      {/* ── Mobile bottom tab handle ── */}
      <button
        className={`mobile-tab-handle${mobileToolsOpen ? ' open' : activePanel ? ' panel-open' : ''}`}
        onClick={() => {
          if (mobileToolsOpen) { setMobileToolsOpen(false) }
          else { setMobileToolsOpen(true); setActivePanel(null) }
        }}
        aria-label="Toggle tools"
      >
        <div className="mobile-tab-grip" />
        <span className="mobile-tab-label">
          {mobileToolsOpen ? '▾ Tools' : activePanel ? `▾ ${activePanel}` : '▸ Tools'}
        </span>
      </button>

      {/* ── Sidebar ── */}
      <nav className="sidebar">
        <SidebarBtn
          label="Objects"
          imgSrc={sport === 'basketball' ? equipPreview('basketball') : `${import.meta.env.BASE_URL}soccerball.png`}
          active={activePanel === 'objects'}
          onClick={() => { setMobileToolsOpen(false); setActivePanel(p => p === 'objects' ? null : 'objects') }}
        />
        <SidebarBtn
          label="Fields"
          icon="⬚"
          active={activePanel === 'fields'}
          onClick={() => { setMobileToolsOpen(false); setActivePanel(p => p === 'fields' ? null : 'fields') }}
        />
        <SidebarBtn
          label="Shapes"
          icon="□"
          active={activePanel === 'shapes'}
          onClick={() => { setMobileToolsOpen(false); setActivePanel(p => p === 'shapes' ? null : 'shapes'); setSelectedShapeId(null) }}
        />
        <SidebarBtn
          label="Text"
          icon="T"
          active={activePanel === 'text'}
          onClick={() => { setMobileToolsOpen(false); setActivePanel(p => p === 'text' ? null : 'text'); setSelectedTextId(null) }}
        />
        <SidebarBtn
          label="Draw"
          icon="✏"
          active={activePanel === 'draw'}
          onClick={() => { setMobileToolsOpen(false); setActivePanel(p => p === 'draw' ? null : 'draw') }}
        />
      </nav>

      {/* ── Fields panel ── */}
      <aside className={`objects-panel${activePanel === 'fields' ? ' open' : ''}`}>
        <div className="panel-header">{sport === 'basketball' ? 'Courts' : 'Fields'}</div>
        <div className="field-list">
          {FIELD_CATALOG.map(f => {
            const label = sport === 'basketball' ? f.courtLabel : f.label
            return (
              <button
                key={f.id}
                className={`field-card${currentField === f.id ? ' active' : ''}`}
                onClick={() => setCurrentField(f.id)}
                title={label}
              >
                <div className="field-preview" data-field={f.id} data-sport={sport}>
                  {f.src && sport === 'soccer' && <img src={`${import.meta.env.BASE_URL}${f.src}`} alt={label} />}
                </div>
                <span className="field-card-label">{label}</span>
              </button>
            )
          })}
        </div>
      </aside>

      {/* ── Objects panel — always in DOM, slides in/out via class ── */}
      <aside className={`objects-panel${activePanel === 'objects' ? ' open' : ''}`}>
        <div className="panel-header">Objects</div>
        <div className="object-grid">
          {CATALOG.filter(item => item.sports.includes(sport)).map(item => {
            const isNumbered = NUMBERED_TYPES.has(item.type)
            const nextNum    = isNumbered ? nextFreeNumber(placedObjects, item.type) : null
            const full       = isNumbered && nextNum == null
            const imgSrc     = isNumbered
              ? numberedPreview(item.type, nextNum ?? NUMBER_MAX, sport)
              : MODEL_TYPES.has(item.type) ? goalPreview(item.type)
              : item.type === 'player' ? playerPreview(sport)
              : EQUIP_RENDERERS[item.type] ? equipPreview(item.type)
              : `${import.meta.env.BASE_URL}${item.src}`
            return (
              <button
                key={item.type}
                className="object-card"
                onClick={() => addToField(item.type)}
                disabled={full}
                title={full ? `All ${NUMBER_MAX} ${item.label} numbers placed` : `Add ${item.label}${nextNum ? ` #${nextNum}` : ''}`}
              >
                <img src={imgSrc} alt={item.label} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
      </aside>

      {/* ── Text panel ── */}
      <aside className={`objects-panel${activePanel === 'text' ? ' open' : ''}`}>
        <div className="panel-header">Text</div>
        <div className="draw-panel">

          <button className="add-text-btn" onClick={addText}>+ Add Text</button>

          <div className="draw-section-label">Size</div>
          <div className="text-size-row">
            {[12, 16, 20, 28, 40].map(sz => (
              <button
                key={sz}
                className={`text-size-btn${textTool.fontSize === sz ? ' active' : ''}`}
                onClick={() => setTextTool(t => ({ ...t, fontSize: sz }))}
                style={{ fontSize: Math.max(9, Math.round(sz * 0.55)) }}
              >Aa</button>
            ))}
          </div>

          <div className="draw-section-label">Style</div>
          <div className="draw-mode-toggle">
            <button
              className={`draw-mode-btn${!textTool.bold && !textTool.italic ? ' active' : ''}`}
              onClick={() => setTextTool(t => ({ ...t, bold: false, italic: false }))}
            >Normal</button>
            <button
              className={`draw-mode-btn${textTool.bold && !textTool.italic ? ' active' : ''}`}
              style={{ fontWeight: 'bold' }}
              onClick={() => setTextTool(t => ({ ...t, bold: !t.bold, italic: false }))}
            >Bold</button>
          </div>
          <div className="draw-mode-toggle">
            <button
              className={`draw-mode-btn${textTool.italic && !textTool.bold ? ' active' : ''}`}
              style={{ fontStyle: 'italic' }}
              onClick={() => setTextTool(t => ({ ...t, italic: !t.italic, bold: false }))}
            >Italic</button>
            <button
              className={`draw-mode-btn${textTool.bold && textTool.italic ? ' active' : ''}`}
              style={{ fontWeight: 'bold', fontStyle: 'italic' }}
              onClick={() => setTextTool(t => ({ ...t, bold: true, italic: true }))}
            >B+I</button>
          </div>

          <div className="draw-section-label">Align</div>
          <div className="draw-mode-toggle">
            <button
              className={`draw-mode-btn${textTool.align === 'left' ? ' active' : ''}`}
              onClick={() => setTextTool(t => ({ ...t, align: 'left' }))}
            >Left</button>
            <button
              className={`draw-mode-btn${textTool.align === 'center' ? ' active' : ''}`}
              onClick={() => setTextTool(t => ({ ...t, align: 'center' }))}
            >Center</button>
            <button
              className={`draw-mode-btn${textTool.align === 'right' ? ' active' : ''}`}
              onClick={() => setTextTool(t => ({ ...t, align: 'right' }))}
            >Right</button>
          </div>

          <div className="draw-section-label">Color</div>
          <div className="ctx-colors">
            {DRAW_COLORS.map(c => (
              <button
                key={c}
                className={`color-swatch${textTool.fill === c ? ' active' : ''}`}
                style={{ background: c }}
                onClick={() => setTextTool(t => ({ ...t, fill: c }))}
                title={c}
              />
            ))}
          </div>

          <div className="draw-section-label">Background</div>
          <div className="text-bg-row">
            {[
              { id: 'transparent',        label: 'None'  },
              { id: 'rgba(0,0,0,0.55)',   label: 'Dark'  },
              { id: 'rgba(0,20,60,0.6)',  label: 'Navy'  },
              { id: 'rgba(255,255,255,0.15)', label: 'Frost' },
            ].map(bg => (
              <button
                key={bg.id}
                className={`text-bg-btn${textTool.background === bg.id ? ' active' : ''}`}
                onClick={() => setTextTool(t => ({ ...t, background: bg.id }))}
                title={bg.label}
              >
                <span
                  className="text-bg-preview"
                  style={{ background: bg.id === 'transparent' ? 'none' : bg.id, border: bg.id === 'transparent' ? '1.5px dashed rgba(255,255,255,0.3)' : 'none' }}
                />
                <span>{bg.label}</span>
              </button>
            ))}
          </div>

        </div>
      </aside>

      {/* ── Shapes panel ── */}
      <aside className={`objects-panel${activePanel === 'shapes' ? ' open' : ''}`}>
        <div className="panel-header">Shapes</div>
        <div className="draw-panel">

          <div className="draw-section-label">Add Shape</div>
          <div className="shape-type-row">
            {(['rect','ellipse','triangle']).map(type => (
              <button
                key={type}
                className="shape-add-btn"
                onClick={() => { setShapeTool(t => ({ ...t, type })); addShape(type) }}
                title={type}
              >
                <ShapeTypeIcon type={type} />
                <span>{type === 'rect' ? 'Rect' : type === 'ellipse' ? 'Circle' : 'Triangle'}</span>
              </button>
            ))}
          </div>

          <div className="draw-section-label">Resize</div>
          <div className="draw-mode-toggle">
            <button
              className={`draw-mode-btn${!shapeTool.keepRatio ? ' active' : ''}`}
              onClick={() => setShapeTool(t => ({ ...t, keepRatio: false }))}
            >Free</button>
            <button
              className={`draw-mode-btn${shapeTool.keepRatio ? ' active' : ''}`}
              onClick={() => setShapeTool(t => ({ ...t, keepRatio: true }))}
            >Lock □</button>
          </div>

          <div className="draw-section-label">Style</div>
          <div className="shape-style-grid">
            {SHAPE_STYLES.map(s => (
              <button
                key={s.id}
                className={`shape-style-btn${shapeTool.style === s.id ? ' active' : ''}`}
                onClick={() => setShapeTool(t => ({ ...t, style: s.id }))}
                title={s.label}
              >
                <ShapeStyleIcon id={s.id} active={shapeTool.style === s.id} />
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          <div className="draw-section-label">Color</div>
          <div className="ctx-colors">
            {DRAW_COLORS.map(c => (
              <button
                key={c}
                className={`color-swatch${shapeTool.color === c ? ' active' : ''}`}
                style={{ background: c }}
                onClick={() => setShapeTool(t => ({ ...t, color: c }))}
                title={c}
              />
            ))}
          </div>

        </div>
      </aside>

      {/* ── Draw panel ── */}
      <aside className={`objects-panel draw-panel-aside${activePanel === 'draw' ? ' open' : ''}`}>
        <div className="panel-header">Draw</div>
        <div className="draw-panel">

          <div className="draw-section-label">Type</div>
          <div className="draw-type-grid">
            {DRAW_TYPES.map(dt => (
              <button
                key={dt.id}
                className={`draw-type-btn${drawTool.type === dt.id ? ' active' : ''}`}
                onClick={() => setDrawTool(t => ({ ...t, type: dt.id }))}
                title={dt.label}
              >
                <DrawTypeIcon type={dt.id} active={drawTool.type === dt.id} />
                <span>{dt.label}</span>
              </button>
            ))}
          </div>

          <div className="draw-section-label">Mode</div>
          <div className="draw-mode-toggle">
            <button
              className={`draw-mode-btn${drawTool.mode === 'straight' ? ' active' : ''}`}
              onClick={() => setDrawTool(t => ({ ...t, mode: 'straight' }))}
            >Straight</button>
            <button
              className={`draw-mode-btn${drawTool.mode === 'free' ? ' active' : ''}`}
              onClick={() => setDrawTool(t => ({ ...t, mode: 'free' }))}
            >Free</button>
          </div>

          <div className="draw-section-label">Color</div>
          <div className="ctx-colors">
            {DRAW_COLORS.map(c => (
              <button
                key={c}
                className={`color-swatch${drawTool.color === c ? ' active' : ''}`}
                style={{ background: c }}
                onClick={() => setDrawTool(t => ({ ...t, color: c }))}
                title={c}
              />
            ))}
          </div>

          <div className="draw-section-label">Thickness</div>
          <div className="draw-thickness-row">
            {DRAW_THICKNESSES.map(n => (
              <button
                key={n}
                className={`draw-thick-btn${drawTool.thickness === n ? ' active' : ''}`}
                onClick={() => setDrawTool(t => ({ ...t, thickness: n }))}
                title={`${n}px`}
              >
                <div className="draw-thick-preview" style={{ height: n + 1 }} />
              </button>
            ))}
          </div>

        </div>
      </aside>

      {/* ── Main ── */}
      <div className="main">
        <header className="header">
          <select
            className="sport-select"
            value={sport}
            onChange={(e) => changeSport(e.target.value)}
            disabled={isPlaying}
            title="Sport"
          >
            {SPORTS.map(sp => <option key={sp.id} value={sp.id}>{sp.label}</option>)}
          </select>
          <div className="header-right">
            <button className="file-btn" onClick={saveAnimation} disabled={isPlaying} title="Save this play to a file">
              💾 Save
            </button>
            <button className="file-btn" onClick={() => fileInputRef.current?.click()} disabled={isPlaying} title="Open a saved play">
              📂 Open
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              style={{ display: 'none' }}
              onChange={(e) => { openAnimation(e.target.files?.[0]); e.target.value = '' }}
            />
            <button
              className="undo-btn"
              onClick={undo}
              disabled={isPlaying}
              title="Undo last action"
            >
              ↩ Undo
            </button>
            <button
              className="export-btn"
              onClick={exportVideo}
              disabled={isPlaying || isExporting || frames.length < 2 || placedObjects.length === 0}
              title="Export animation as video"
            >
              {isExporting ? 'Recording…' : '⬇ Export'}
            </button>
            <button className="clear-btn" onClick={clearBoard} title="Clear board">
              Clear
            </button>
          </div>
        </header>

        <Stage
          ref={stageRef}
          width={Math.round(aSW * fieldScale)}
          height={Math.round(aSH * fieldScale)}
          scaleX={fieldScale}
          scaleY={fieldScale}
          onClick={() => { setContextMenu(null); setSelectedShapeId(null); setSelectedTextId(null) }}
        >
          <Layer x={PAD} y={PAD}>
            <FieldBackground sport={sport} field={currentField} halfImg={images['field_half']} fieldW={aFW} fieldH={aFH} />

            {/* Live preview line while recording a free path */}
            <Line
              ref={previewLineRef}
              points={[]}
              stroke="rgba(255,220,0,0.85)"
              strokeWidth={2}
              dash={[8, 6]}
              lineCap="round"
              listening={false}
            />

            {/* Motion trails — dashed lines (or curved paths) between frame positions */}
            {!isPlaying && !isExporting && frames.length > 1 && placedObjects.flatMap(obj =>
              frames.slice(0, -1).map((f, i) => {
                const from = f.positions[obj.id]
                const to   = frames[i + 1].positions[obj.id]
                if (!from || !to) return null
                const segPath = freePaths[`${i}-${i+1}`]?.[obj.id]
                return (
                  <Line
                    key={`trail-${obj.id}-${i}`}
                    points={segPath ?? [from.x, from.y, to.x, to.y]}
                    stroke="rgba(255,220,0,0.4)"
                    strokeWidth={2}
                    dash={[8, 6]}
                    lineCap="round"
                    listening={false}
                  />
                )
              })
            )}

            {/* Shapes */}
            {shapes.map(shape => {
              const interactive = !isPlaying && activePanel !== 'draw'
              const isDashed = shape.style === 'dashed'
              const fillColor = shape.style === 'fill'
                ? shape.color
                : shape.style === 'semi'
                  ? shape.color + '59'
                  : 'transparent'
              const common = {
                ref: (node) => { if (node) shapeRefs.current[shape.id] = node; else delete shapeRefs.current[shape.id] },
                x: shape.x, y: shape.y, rotation: shape.rotation,
                fill: fillColor,
                stroke: shape.color,
                strokeWidth: 2,
                ...(isDashed ? { dash: [10, 6] } : {}),
                draggable: interactive,
                onClick:    interactive ? (e) => { e.cancelBubble = true; setSelectedShapeId(shape.id); setSelectedTextId(null) } : undefined,
                onTap:      interactive ? (e) => { e.cancelBubble = true; setSelectedShapeId(shape.id); setSelectedTextId(null) } : undefined,
                onDragEnd:  (e) => setShapes(prev => prev.map(s => s.id === shape.id ? { ...s, x: e.target.x(), y: e.target.y() } : s)),
                onTransformEnd: (e) => handleShapeTransformEnd(shape.id, e),
                onDblClick: (e) => { e.cancelBubble = true; setShapeCtxMenu({ x: e.evt.clientX, y: e.evt.clientY, id: shape.id }) },
                onDblTap:   (e) => { e.cancelBubble = true; const t = e.evt.changedTouches?.[0]; if (t) setShapeCtxMenu({ x: t.clientX, y: t.clientY, id: shape.id }) },
              }
              if (shape.type === 'rect') {
                return (
                  <Rect key={shape.id} {...common}
                    width={shape.width} height={shape.height}
                    offsetX={shape.width / 2} offsetY={shape.height / 2}
                  />
                )
              }
              if (shape.type === 'ellipse') {
                return <Ellipse key={shape.id} {...common} radiusX={shape.width / 2} radiusY={shape.height / 2} />
              }
              // triangle
              return (
                <Line key={shape.id} {...common}
                  points={[0, -shape.height/2, shape.width/2, shape.height/2, -shape.width/2, shape.height/2]}
                  closed
                />
              )
            })}
            <Transformer
              ref={transformerRef}
              keepRatio={shapeTool.keepRatio}
              rotateEnabled={true}
              visible={!isPlaying}
              borderStroke="#4ade80"
              borderStrokeWidth={1}
              anchorFill="#fff"
              anchorStroke="#4ade80"
              anchorSize={8}
              anchorCornerRadius={2}
            />

            {/* Text items */}
            {textItems.map(t => {
              const isEditing = editingText?.id === t.id
              const hasBg     = t.background !== 'transparent'
              const interactive = !isPlaying && activePanel !== 'draw'
              return (
                <Group
                  key={t.id}
                  ref={node => { if (node) textGroupRefs.current[t.id] = node; else delete textGroupRefs.current[t.id] }}
                  x={t.x} y={t.y}
                  scaleX={t.scaleX ?? 1} scaleY={t.scaleY ?? 1}
                  rotation={t.rotation}
                  draggable={interactive}
                  visible={!isEditing}
                  onClick={interactive    ? (e) => { e.cancelBubble = true; setSelectedTextId(t.id); setSelectedShapeId(null) } : undefined}
                  onTap={interactive      ? (e) => { e.cancelBubble = true; setSelectedTextId(t.id); setSelectedShapeId(null) } : undefined}
                  onDragEnd={e => setTextItems(prev => prev.map(ti => ti.id === t.id ? { ...ti, x: e.target.x(), y: e.target.y() } : ti))}
                  onTransformEnd={e => handleTextTransformEnd(t.id, e)}
                  onDblClick={interactive ? (e) => { e.cancelBubble = true; openTextEdit(t.id) } : undefined}
                  onDblTap={interactive   ? (e) => { e.cancelBubble = true; openTextEdit(t.id) } : undefined}
                  onContextMenu={interactive ? (e) => { e.evt.preventDefault(); e.cancelBubble = true; setTextCtxMenu({ x: e.evt.clientX, y: e.evt.clientY, id: t.id }) } : undefined}
                >
                  {hasBg && (
                    <Rect
                      x={-6} y={-4}
                      width={t.width + 12} height={t.fontSize * 1.45 + 8}
                      fill={t.background} cornerRadius={4}
                      listening={false}
                    />
                  )}
                  <KonvaText
                    ref={node => { if (node) textNodeRefs.current[t.id] = node; else delete textNodeRefs.current[t.id] }}
                    text={t.text}
                    fontSize={t.fontSize}
                    fontFamily="Segoe UI, system-ui, -apple-system, sans-serif"
                    fontStyle={t.fontStyle}
                    fill={t.fill}
                    align={t.align}
                    width={t.width}
                    wrap="word"
                    shadowColor="rgba(0,0,0,0.7)"
                    shadowBlur={3}
                    shadowOffsetX={1}
                    shadowOffsetY={1}
                  />
                </Group>
              )
            })}
            <Transformer
              ref={textTransRef}
              keepRatio={false}
              rotateEnabled={true}
              visible={!isPlaying && !editingText}
              borderStroke="#60a5fa"
              borderStrokeWidth={1}
              anchorFill="#fff"
              anchorStroke="#60a5fa"
              anchorSize={8}
              anchorCornerRadius={2}
              enabledAnchors={['middle-left','middle-right','top-left','top-right','bottom-left','bottom-right','top-center','bottom-center']}
            />

            {/* Saved drawings — below objects so objects remain on top */}
            {[...drawings, ...(currentDraw ? [currentDraw] : [])].map(d => {
              const isDashed  = d.type.includes('dashed')
              const isArrow   = d.type === 'arrow' || d.type === 'dashed-arrow'
              const isT       = d.type === 'T' || d.type === 'dashed-T'
              const dashArr   = isDashed ? [d.thickness * 5, d.thickness * 3] : undefined
              const isPreview = d === currentDraw
              const lineProps = {
                stroke: d.color, strokeWidth: d.thickness,
                lineCap: 'round', lineJoin: 'round',
                ...(dashArr ? { dash: dashArr } : {}),
              }
              const dragHandlers = isPreview ? { listening: false } : {
                draggable: activePanel !== 'draw' && !isPlaying,
                onDragEnd: (e) => {
                  const dx = e.target.x(), dy = e.target.y()
                  e.target.position({ x: 0, y: 0 })
                  moveDrawing(d.id, dx, dy)
                },
                onDblClick: (e) => {
                  e.cancelBubble = true
                  setDrawCtxMenu({ x: e.evt.clientX, y: e.evt.clientY, id: d.id })
                },
                onDblTap: (e) => {
                  e.cancelBubble = true
                  const t = e.evt.changedTouches?.[0]
                  if (t) setDrawCtxMenu({ x: t.clientX, y: t.clientY, id: d.id })
                },
              }
              if (isArrow) {
                return (
                  <Arrow key={d.id}
                    points={d.points} fill={d.color}
                    pointerLength={Math.max(8, d.thickness * 4)}
                    pointerWidth={Math.max(6, d.thickness * 3)}
                    {...lineProps} {...dragHandlers}
                  />
                )
              }
              if (isT) {
                const pts = d.points, n = pts.length
                const x2 = pts[n-2], y2 = pts[n-1]
                const x1 = n >= 4 ? pts[n-4] : x2, y1 = n >= 4 ? pts[n-3] : y2
                const dirX = x2 - x1, dirY = y2 - y1
                const len  = Math.sqrt(dirX*dirX + dirY*dirY) || 1
                const nx = -dirY / len, ny = dirX / len
                const tLen = Math.max(14, d.thickness * 6)
                return (
                  <Group key={d.id} {...dragHandlers}>
                    <Line points={pts} {...lineProps} listening={false} />
                    <Line points={[x2+nx*tLen, y2+ny*tLen, x2-nx*tLen, y2-ny*tLen]}
                          stroke={d.color} strokeWidth={d.thickness} lineCap="round" listening={false} />
                  </Group>
                )
              }
              return <Line key={d.id} points={d.points} {...lineProps} {...dragHandlers} />
            })}

            {/* Placed objects */}
            {placedObjects.map(obj => {
              const pos = frames[currentFrame]?.positions[obj.id] ?? { x: CX, y: CY }
              const r   = getRadius(obj.size) * (MODEL_TYPES.has(obj.type) ? GOAL_RADIUS_MULT : 1)

              return (
                <Circle
                  key={obj.id}
                  ref={(node) => {
                    if (node) objRefs.current[obj.id] = node
                    else delete objRefs.current[obj.id]
                  }}
                  x={pos.x}
                  y={pos.y}
                  radius={r}
                  rotation={isUpright(obj.type) ? 0 : obj.rotation}
                  {...getObjectFill(obj, r)}
                  {...(MARKER_TYPES.has(obj.type) ? { shadowColor: 'black', shadowBlur: 5, shadowOffsetY: 3, shadowOpacity: 0.45 } : {})}
                  strokeEnabled={false}
                  draggable={!isPlaying && activePanel !== 'draw'}
                  onDragStart={(e) => handleFreePathDragStart(obj.id, e.target.x(), e.target.y())}
                  onDragMove={(e) => {
                    moveObject(obj.id, e.target.x(), e.target.y())
                    handleFreePathDragMove(obj.id, e.target.x(), e.target.y())
                  }}
                  onDragEnd={(e) => {
                    moveObject(obj.id, e.target.x(), e.target.y())
                    handleFreePathDragEnd(obj.id, e.target.x(), e.target.y())
                  }}
                  // The center stays on the green, so an object can sit right at the edge and hang
                  // up to half off it — the export crops anything past the canvas, but nothing gets lost.
                  // Konva passes absolute (on-screen) coords, so the stage-unit bounds are scaled by fieldScale.
                  dragBoundFunc={(p) => {
                    const k = fieldScale
                    const yMin = isFullField ? PAD - GOAL_D - GBUF : PAD - GBUF
                    const yMax = isFullField ? PAD + aFH + GOAL_D + GBUF : PAD + aFH + GBUF
                    return {
                      x: Math.max((PAD - GBUF) * k, Math.min(p.x, (PAD + aFW + GBUF) * k)),
                      y: Math.max(yMin * k, Math.min(p.y, yMax * k)),
                    }
                  }}
                  onDblClick={(e) => {
                    e.cancelBubble = true
                    setContextMenu({ x: e.evt.clientX, y: e.evt.clientY, objId: obj.id })
                  }}
                  onDblTap={(e) => {
                    e.cancelBubble = true
                    const t = e.evt.changedTouches?.[0]
                    if (t) setContextMenu({ x: t.clientX, y: t.clientY, objId: obj.id })
                  }}
                />
              )
            })}

            {/* Draw capture rect — on top of everything when draw panel is open */}
            {activePanel === 'draw' && (
              <Rect
                x={-GBUF} y={isFullField ? -(GOAL_D + GBUF) : -GBUF}
                width={aFW + GBUF * 2}
                height={isFullField ? aFH + (GOAL_D + GBUF) * 2 : aFH + GBUF * 2}
                fill="transparent"
                onMouseDown={handleDrawStart}
                onMouseMove={handleDrawMove}
                onMouseUp={handleDrawEnd}
                onMouseLeave={handleDrawEnd}
                onTouchStart={handleDrawStart}
                onTouchMove={handleDrawMove}
                onTouchEnd={handleDrawEnd}
              />
            )}
          </Layer>
        </Stage>

        {/* ── Bottom bar: playback + frame timeline ── */}
        <div className="bottom-bar">
          <div className="playback">
            <button className="play-btn" onClick={play}  disabled={!canPlay}   title="Play">▶</button>
            <button className="stop-btn" onClick={stop}  disabled={!isPlaying} title="Stop">■</button>
          </div>

          <div className="speed-select">
            {SPEED_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className={`speed-btn${playSpeed === opt.value ? ' active' : ''}`}
                onClick={() => setPlaySpeed(opt.value)}
                disabled={isPlaying}
              >{opt.label}</button>
            ))}
          </div>

          <button
            className={`free-path-btn${freePathMode ? ' active' : ''}`}
            onClick={() => setFreePathMode(p => !p)}
            disabled={isPlaying || frames.length < 2}
            title={freePathMode ? 'Free path ON — drag objects to record curved paths' : 'Free path OFF — animation moves in straight lines'}
          >
            〜 Free
          </button>

          <div className="frame-strip">
            {frames.map((_, i) => (
              <div key={i} className="frame-slot">
                <button
                  className={`frame-btn${currentFrame === i ? ' active' : ''}`}
                  onClick={() => selectFrame(i)}
                  disabled={isPlaying}
                >
                  {i + 1}
                </button>
                {frames.length > 1 && (
                  <button
                    className="frame-delete"
                    onClick={() => deleteFrame(i)}
                    disabled={isPlaying}
                    title="Delete frame"
                  >×</button>
                )}
              </div>
            ))}
          </div>

          <button className="add-frame-btn" onClick={addFrame} disabled={isPlaying}>
            + Frame
          </button>
        </div>
      </div>

      {/* ── Export save dialog ── */}
      {exportBlob && (
        <div className="export-overlay">
          <div className="export-dialog">
            <div className="export-dialog-title">Save Recording</div>
            <input
              className="export-name-input"
              value={exportName}
              onChange={e => setExportName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  const a = document.createElement('a')
                  a.href = URL.createObjectURL(exportBlob)
                  a.download = `${exportName || 'play'}.webm`
                  a.click()
                  URL.revokeObjectURL(a.href)
                  setExportBlob(null)
                }
              }}
              placeholder="File name"
              autoFocus
            />
            <div className="export-dialog-actions">
              <button className="export-save-btn" onClick={() => {
                const a = document.createElement('a')
                a.href = URL.createObjectURL(exportBlob)
                a.download = `${exportName || 'play'}.webm`
                a.click()
                URL.revokeObjectURL(a.href)
                setExportBlob(null)
              }}>
                Save
              </button>
              <button className="export-cancel-btn" onClick={() => setExportBlob(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Context menu ── */}
      {contextMenu && (
        <>
          <div className="ctx-overlay" onClick={() => setContextMenu(null)} />
          <div
            className="ctx-menu"
            style={{
              left: Math.min(contextMenu.x, viewW - 234),
              top:  Math.max(8, Math.min(contextMenu.y, viewH - (MODEL_TYPES.has(ctxObj?.type) ? 510 : 390))),
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Color picker — player, cone, hoop */}
            {ctxObj && COLORIZABLE.has(ctxObj.type) && (
              <>
                <div className="ctx-label">Color</div>
                <div className="ctx-colors">
                  {OBJECT_COLORS.map(color => (
                    <button
                      key={color}
                      className={`color-swatch${(ctxObj.color ?? DEFAULT_COLORS[ctxObj.type]) === color ? ' active' : ''}`}
                      style={{ background: color }}
                      onClick={() => setObjectColor(contextMenu.objId, color)}
                      title={color}
                    />
                  ))}
                </div>
                <div className="ctx-divider" />
              </>
            )}

            {MODEL_TYPES.has(ctxObj?.type) && (
              <>
                <div className="ctx-label">Facing</div>
                <div className="ctx-compass">
                  {GOAL_FACINGS.map((f, i) => f ? (
                    <button
                      key={f.label}
                      className={`compass-btn${(ctxObj.facing ?? GOAL_DEFAULT_FACING) === f.deg ? ' active' : ''}`}
                      onClick={() => setGoalFacing(contextMenu.objId, f.deg)}
                      title={`Faces ${f.label}`}
                    >{f.label}</button>
                  ) : (
                    <button key="rot" className="compass-btn rotate" onClick={() => rotateObject(contextMenu.objId)} title="Rotate 45°">↻</button>
                  ))}
                </div>
                <div className="ctx-divider" />
              </>
            )}

            <div className="ctx-label">Size</div>
            <div className="ctx-sizes">
              {SIZE_RADII.map((r, i) => {
                const s = i + 1
                return (
                  <button
                    key={s}
                    className={`size-dot${(ctxObj?.size ?? DEFAULT_SIZE) === s ? ' active' : ''}`}
                    style={{ width: r * 1.2, height: r * 1.2 }}
                    onClick={() => resizeObject(contextMenu.objId, s)}
                    title={`Size ${s}`}
                  />
                )
              })}
            </div>

            <div className="ctx-divider" />

            {isUpright(ctxObj?.type) ? null : (
              <button className="ctx-btn" onClick={() => rotateObject(contextMenu.objId)}>
                <span className="ctx-icon">↻</span> Rotate 90°
              </button>
            )}

            {(() => {
              const idx  = placedObjects.findIndex(o => o.id === contextMenu.objId)
              const top  = idx === placedObjects.length - 1
              const btm  = idx === 0
              return (
                <>
                  <div className="ctx-label">Layer</div>
                  <div className="ctx-layers">
                    <button className="layer-btn" disabled={top} onClick={() => reorderObject(contextMenu.objId, 'front')}    title="Bring to front">⤒<span>Front</span></button>
                    <button className="layer-btn" disabled={top} onClick={() => reorderObject(contextMenu.objId, 'forward')}  title="Bring forward one">↑<span>Forward</span></button>
                    <button className="layer-btn" disabled={btm} onClick={() => reorderObject(contextMenu.objId, 'backward')} title="Send backward one">↓<span>Backward</span></button>
                    <button className="layer-btn" disabled={btm} onClick={() => reorderObject(contextMenu.objId, 'back')}     title="Send to back">⤓<span>Back</span></button>
                  </div>
                  <div className="ctx-divider" />
                </>
              )
            })()}

            <button
              className="ctx-btn"
              onClick={() => duplicateObject(contextMenu.objId)}
              disabled={NUMBERED_TYPES.has(ctxObj?.type) && nextFreeNumber(placedObjects, ctxObj.type) == null}
            >
              <span className="ctx-icon">⧉</span> Duplicate
            </button>

            <div className="ctx-divider" />

            <button className="ctx-btn danger" onClick={() => deleteObject(contextMenu.objId)}>
              <span className="ctx-icon">✕</span> Delete
            </button>
          </div>
        </>
      )}

      {drawCtxMenu && (
        <>
          <div className="ctx-overlay" onClick={() => setDrawCtxMenu(null)} />
          <div
            className="ctx-menu"
            style={{
              left: Math.min(drawCtxMenu.x, viewW - 234),
              top:  Math.min(drawCtxMenu.y, viewH - 100),
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="ctx-btn danger" onClick={() => deleteDrawing(drawCtxMenu.id)}>
              <span className="ctx-icon">✕</span> Delete
            </button>
          </div>
        </>
      )}

      {shapeCtxMenu && (
        <>
          <div className="ctx-overlay" onClick={() => setShapeCtxMenu(null)} />
          <div
            className="ctx-menu"
            style={{
              left: Math.min(shapeCtxMenu.x, viewW - 234),
              top:  Math.min(shapeCtxMenu.y, viewH - 100),
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="ctx-btn danger" onClick={() => deleteShape(shapeCtxMenu.id)}>
              <span className="ctx-icon">✕</span> Delete
            </button>
          </div>
        </>
      )}

      {textCtxMenu && (
        <>
          <div className="ctx-overlay" onClick={() => setTextCtxMenu(null)} />
          <div
            className="ctx-menu"
            style={{
              left: Math.min(textCtxMenu.x, viewW - 234),
              top:  Math.min(textCtxMenu.y, viewH - 100),
            }}
            onClick={e => e.stopPropagation()}
          >
            <button className="ctx-btn" onClick={() => { openTextEdit(textCtxMenu.id); setTextCtxMenu(null) }}>
              <span className="ctx-icon">✎</span> Edit
            </button>
            <div className="ctx-divider" />
            <button className="ctx-btn danger" onClick={() => deleteText(textCtxMenu.id)}>
              <span className="ctx-icon">✕</span> Delete
            </button>
          </div>
        </>
      )}

      {editingText && (() => {
        const t = textItems.find(ti => ti.id === editingText.id)
        if (!t) return null
        return (
          <textarea
            key={editingText.id}
            ref={textEditRef}
            defaultValue={t.text}
            style={{
              position: 'fixed',
              left:   editingText.x,
              top:    editingText.y,
              width:  editingText.width,
              minHeight: editingText.height,
              fontSize:   `${t.fontSize * (t.scaleX ?? 1) * fieldScale}px`,
              fontFamily: 'Segoe UI, system-ui, -apple-system, sans-serif',
              fontWeight: t.fontStyle?.includes('bold')   ? 'bold'   : 'normal',
              fontStyle:  t.fontStyle?.includes('italic') ? 'italic' : 'normal',
              color:      t.fill,
              background: t.background === 'transparent' ? 'rgba(0,0,0,0.01)' : t.background,
              border:     '1.5px dashed #60a5fa',
              borderRadius: '3px',
              outline:    'none',
              resize:     'none',
              overflow:   'hidden',
              padding:    '2px 4px',
              lineHeight: 1.25,
              textAlign:  t.align,
              zIndex:     200,
              transform:  `rotate(${t.rotation}deg)`,
              transformOrigin: 'top left',
            }}
            onBlur={e => {
              const val = e.target.value.trim() || 'Label'
              setTextItems(prev => prev.map(ti => ti.id === editingText.id ? { ...ti, text: val } : ti))
              setEditingText(null)
            }}
            onKeyDown={e => {
              if (e.key === 'Escape') setEditingText(null)
            }}
            autoFocus
          />
        )
      })()}
    </div>
  )
}

// ── Field background switcher ─────────────────────────────────────────────────
// Half-field goal net overlay in rendered (840×544) space.
// Goal frame is the small rectangle that extends below the outer field line at the bottom center.
// Y measured from the top of the canvas; flip case mirrors to the top.
const HALF_GOAL_X = 378, HALF_GOAL_W = 76
const HALF_GOAL_Y = 521, HALF_GOAL_H = 18   // trimmed right + top to sit inside goal frame

function FieldBackground({ sport, field, halfImg, fieldW, fieldH }) {
  if (sport === 'basketball') return <BasketballCourt field={field} />
  const net = getNetPattern()
  const greenBorder = <Rect x={-GBUF} y={-GBUF} width={fieldW+GBUF*2} height={fieldH+GBUF*2} fill="#2d8b2d" cornerRadius={4} />

  if (field === 'blank') {
    return greenBorder
  }
  if (field === 'middle') {
    return <MiddleThirdField />
  }
  if (field === 'half' || field === 'half-flip') {
    if (!halfImg) return greenBorder
    const flipped = field === 'half-flip'
    // In 'half-flip' the image is rendered scaleY=-1 from y=fieldH, so image pixel at
    // source y maps to canvas y = fieldH - source_y. Goal at bottom → canvas top.
    const goalY = flipped ? fieldH - (HALF_GOAL_Y + HALF_GOAL_H) : HALF_GOAL_Y
    return (
      <>
        {greenBorder}
        <KonvaImage image={halfImg} y={flipped ? fieldH : 0} width={fieldW} height={fieldH} scaleY={flipped ? -1 : 1} />
        {/* Darken the image to match the full-field green shade (#2d8b2d) */}
        <Rect width={fieldW} height={fieldH} fill="rgba(0,0,0,0.26)" listening={false} />
        <Rect x={HALF_GOAL_X} y={goalY} width={HALF_GOAL_W} height={HALF_GOAL_H}
              fillPatternImage={net} fillPatternRepeat="repeat"
              fillPatternOffsetX={0} fillPatternOffsetY={0}
              stroke="rgba(255,255,255,0.5)" strokeWidth={1}
              listening={false} />
      </>
    )
  }
  // Full field always uses portrait FIFA constants (FW=544, FH=840)
  return <SoccerField />
}

// ── Net pattern — tiled 5×5 grid cell, created once ─────────────────────────
let _netPattern = null
function getNetPattern() {
  if (_netPattern) return _netPattern
  const size = 5
  const c = document.createElement('canvas')
  c.width = size; c.height = size
  const ctx = c.getContext('2d')
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'
  ctx.lineWidth = 0.8
  ctx.beginPath()
  // Right edge of cell
  ctx.moveTo(size - 0.5, 0); ctx.lineTo(size - 0.5, size)
  // Bottom edge of cell
  ctx.moveTo(0, size - 0.5); ctx.lineTo(size, size - 0.5)
  ctx.stroke()
  _netPattern = c
  return c
}

// ── Middle third field (landscape, same canvas as half field) ────────────────
// Shows only the center band: sidelines + halfway line + center circle.
// Left/right edges are open cuts — no goal lines drawn.
function MiddleThirdField() {
  const LCX = LW / 2
  const LCY = LH / 2
  return (
    <>
      <Rect x={-GBUF} y={-GBUF} width={LW+GBUF*2} height={LH+GBUF*2} fill="#2d8b2d" cornerRadius={4} />
      {/* Sidelines only — no left/right goal lines */}
      <Line points={[0, 0, LW, 0]}   stroke="white" strokeWidth={2.5} />
      <Line points={[0, LH, LW, LH]} stroke="white" strokeWidth={2.5} />
      {/* Halfway line */}
      <Line points={[LCX, 0, LCX, LH]} stroke="white" strokeWidth={2} />
      {/* Center circle + spot */}
      <Circle x={LCX} y={LCY} radius={CIRCLE_R} stroke="white" strokeWidth={2} fill="transparent" />
      <Circle x={LCX} y={LCY} radius={3.5} fill="white" />
    </>
  )
}

// ── Soccer field (static) ─────────────────────────────────────────────────────
function SoccerField() {
  const net = getNetPattern()
  return (
    <>
      <Rect x={-GBUF} y={-(GOAL_D+GBUF)} width={FW+GBUF*2} height={FH+(GOAL_D+GBUF)*2} fill="#2d8b2d" cornerRadius={4} />
      <Rect width={FW} height={FH} stroke="white" strokeWidth={2.5} fill="transparent" />
      <Line points={[0, CY, FW, CY]} stroke="white" strokeWidth={2} />
      <Circle x={CX} y={CY} radius={CIRCLE_R} stroke="white" strokeWidth={2} fill="transparent" />
      <Circle x={CX} y={CY} radius={3.5} fill="white" />
      <Rect x={CX-PA_HW} y={0}       width={PA_HW*2} height={PA_D}   stroke="white" strokeWidth={2} fill="transparent" />
      <Rect x={CX-GA_HW} y={0}       width={GA_HW*2} height={GA_D}   stroke="white" strokeWidth={2} fill="transparent" />
      <Circle x={CX} y={PS_D}        radius={3.5} fill="white" />
      <Path data={`M ${CX+ARC_X} ${PA_D} A ${CIRCLE_R} ${CIRCLE_R} 0 0 1 ${CX-ARC_X} ${PA_D}`}
            stroke="white" strokeWidth={2} fill="transparent" />
      {/* Top goal — net fill */}
      <Rect x={CX-GOAL_HW} y={-GOAL_D} width={GOAL_HW*2} height={GOAL_D}
            stroke="white" strokeWidth={2}
            fillPatternImage={net} fillPatternRepeat="repeat"
            fillPatternOffsetX={0} fillPatternOffsetY={0} />
      <Rect x={CX-PA_HW} y={FH-PA_D} width={PA_HW*2} height={PA_D}   stroke="white" strokeWidth={2} fill="transparent" />
      <Rect x={CX-GA_HW} y={FH-GA_D} width={GA_HW*2} height={GA_D}   stroke="white" strokeWidth={2} fill="transparent" />
      <Circle x={CX} y={FH-PS_D}    radius={3.5} fill="white" />
      <Path data={`M ${CX+ARC_X} ${FH-PA_D} A ${CIRCLE_R} ${CIRCLE_R} 0 0 0 ${CX-ARC_X} ${FH-PA_D}`}
            stroke="white" strokeWidth={2} fill="transparent" />
      {/* Bottom goal — net fill */}
      <Rect x={CX-GOAL_HW} y={FH}   width={GOAL_HW*2} height={GOAL_D}
            stroke="white" strokeWidth={2}
            fillPatternImage={net} fillPatternRepeat="repeat"
            fillPatternOffsetX={0} fillPatternOffsetY={0} />
    </>
  )
}

// ── Basketball court ──────────────────────────────────────────────────────────
// NBA court (50 × 94 ft) drawn in feet inside a scaled Group, on a soft orange
// maple floor. The five views reuse the soccer canvases: full court fills the
// portrait canvas; half court is landscape with the basket at the bottom (or top
// when flipped); mid court turns the court sideways and crops at both ends.
const COURT_W = 50, COURT_L = 94
const COURT_LINE  = '#ffffff'
const COURT_PAINT = 'rgba(196,86,28,0.32)'    // key + center circle

// Maple planks running along the court — tiled pattern, created once
let _floorPattern = null
function getFloorPattern() {
  if (_floorPattern) return _floorPattern
  const PW = 18, W = PW * 8, H = 360
  const c = document.createElement('canvas')
  c.width = W; c.height = H
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#eaa66a'
  ctx.fillRect(0, 0, W, H)
  const tints = [0.05, -0.04, 0.02, -0.06, 0.07, -0.02, 0.03, -0.05]
  tints.forEach((t, i) => {
    ctx.fillStyle = t > 0 ? `rgba(255,236,210,${t * 1.6})` : `rgba(120,50,10,${-t})`
    ctx.fillRect(i * PW, 0, PW, H)
    // Plank seam + a staggered end joint
    ctx.fillStyle = 'rgba(110,50,15,0.16)'
    ctx.fillRect(i * PW, 0, 1, H)
    ctx.fillRect(i * PW, ((i * 137) % H), PW, 1)
  })
  _floorPattern = c
  return c
}

// One end of the court, baseline at y = 0, court running toward +y
function CourtEnd({ lw }) {
  const line = { stroke: COURT_LINE, strokeWidth: lw, listening: false }
  const arc3 = Math.sqrt(23.75 ** 2 - 22 ** 2) + 5.25   // where the 3-pt arc meets the corner lines
  return (
    <>
      <Rect x={17} y={0} width={16} height={19} fill={COURT_PAINT} {...line} />
      <Path data="M 19 19 A 6 6 0 0 0 31 19" {...line} />
      <Path data="M 19 19 A 6 6 0 0 1 31 19" {...line} dash={[1.1, 1.1]} />
      {[7, 8, 11, 14].map(y => (
        <Group key={y}>
          <Line points={[16.3, y, 17, y]} {...line} strokeWidth={y === 8 ? lw * 2.2 : lw} />
          <Line points={[33, y, 33.7, y]} {...line} strokeWidth={y === 8 ? lw * 2.2 : lw} />
        </Group>
      ))}
      <Path data={`M 3 0 L 3 ${arc3} A 23.75 23.75 0 0 0 47 ${arc3} L 47 0`} {...line} />
      <Path data="M 21 4 L 21 5.25 A 4 4 0 0 0 29 5.25 L 29 4" {...line} />
      {/* Basket: backboard, neck, rim */}
      <Line points={[22, 4, 28, 4]} {...line} strokeWidth={lw * 2.4} stroke="#f8fafc" />
      <Line points={[25, 4, 25, 4.5]} {...line} stroke="#9ca3af" />
      <Circle x={25} y={5.25} radius={0.75} {...line} stroke="#e8590c" strokeWidth={lw * 1.4} />
    </>
  )
}

function CourtLines({ lw }) {
  const line = { stroke: COURT_LINE, strokeWidth: lw, listening: false }
  return (
    <>
      <Rect width={COURT_W} height={COURT_L} fill="rgba(255,240,222,0.16)" listening={false} />
      <Circle x={25} y={47} radius={6} fill={COURT_PAINT} {...line} />
      <Circle x={25} y={47} radius={2} {...line} />
      <Line points={[0, 47, COURT_W, 47]} {...line} />
      <CourtEnd lw={lw} />
      <Group y={COURT_L} scaleY={-1}><CourtEnd lw={lw} /></Group>
      <Rect width={COURT_W} height={COURT_L} {...line} strokeWidth={lw * 1.3} />
    </>
  )
}

function BasketballCourt({ field }) {
  const floor = getFloorPattern()
  const full = field === 'full'
  const W = full ? FW : LW, H = full ? FH : LH
  const padY = full ? GOAL_D + GBUF : GBUF
  const backdrop = (
    <Rect x={-GBUF} y={-padY} width={W + GBUF * 2} height={H + padY * 2}
          fillPatternImage={floor} fillPatternRepeat="repeat"
          fillPatternRotation={field === 'middle' ? 90 : 0}
          cornerRadius={4} listening={false} />
  )
  if (field === 'blank') return backdrop

  const LINE_PX = 2.2
  let s, group
  if (full) {
    s = Math.min(FW / COURT_W, FH / COURT_L)
    group = { x: (FW - COURT_W * s) / 2, y: (FH - COURT_L * s) / 2, scaleX: s, scaleY: s }
  } else if (field === 'middle') {
    // Court turned sideways: length runs left→right, centered on the half-court line
    s = LH / COURT_W
    group = { x: LW / 2 + (COURT_L / 2) * s, y: 0, scaleX: s, scaleY: s, rotation: 90 }
  } else {
    // Half court: baseline along the bottom (top when flipped), half-court line at the far edge
    s = LH / (COURT_L / 2)
    const flip = field === 'half-flip'
    group = { x: (LW - COURT_W * s) / 2, y: flip ? 0 : LH, scaleX: s, scaleY: flip ? s : -s }
  }
  return (
    <>
      {backdrop}
      <Group clipX={-2} clipY={-2} clipWidth={W + 4} clipHeight={H + 4} listening={false}>
        <Group {...group}><CourtLines lw={LINE_PX / s} /></Group>
      </Group>
    </>
  )
}
