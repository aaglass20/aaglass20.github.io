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
const COLORIZABLE = new Set(['player', 'cone', 'hoop', 'pinnie'])

// Default colors match each object's original source image
const DEFAULT_COLORS = { player: '#ef4444', cone: '#ef4444', hoop: '#3b82f6', pinnie: '#ef4444' }

const CATALOG = [
  { type: 'ball',   label: 'Soccer Ball', src: 'soccerball.png' },
  { type: 'player', label: 'Player',      src: 'player1.png'    },
  { type: 'cone',   label: 'Cone',        src: 'cone.png'       },
  { type: 'hoop',   label: 'Hoop',        src: 'hoop.png'       },
  { type: 'pinnie', label: 'Pinnie',      src: 'pinnie.png'     },
  { type: 'pole',   label: 'Pole',        src: 'pole.png'       },
]

const FIELD_CATALOG = [
  { id: 'full',      label: 'Full Field',       src: null           },
  { id: 'half',      label: 'Half Field',        src: 'halfield.png' },
  { id: 'half-flip', label: 'Half Field (flip)', src: 'halfield.png' },
  { id: 'middle',    label: 'Middle Third',      src: null           },
  { id: 'blank',     label: 'Blank',             src: null           },
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

// ── Equipment image processing ────────────────────────────────────────────────
// Knocks out white background + shadow pixels and bakes a 1px black outline.
// Cached by image object reference (stable after load).
const _equipmentCache = new Map()

// Returns the tight bounding box of non-transparent pixels in a canvas context.
function contentBounds(ctx, w, h) {
  const data = ctx.getImageData(0, 0, w, h).data
  let top = h, bottom = 0, left = w, right = 0
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 20) {
        if (y < top)    top    = y
        if (y > bottom) bottom = y
        if (x < left)   left   = x
        if (x > right)  right  = x
      }
    }
  }
  return top <= bottom ? { top, bottom, left, right } : null
}

function processEquipmentImage(srcImg) {
  if (_equipmentCache.has(srcImg)) return _equipmentCache.get(srcImg)

  // Step 1: pixel knockout onto temp canvas
  const temp = document.createElement('canvas')
  temp.width  = srcImg.width
  temp.height = srcImg.height
  const tCtx = temp.getContext('2d')
  tCtx.drawImage(srcImg, 0, 0)

  const imageData = tCtx.getImageData(0, 0, temp.width, temp.height)
  const data      = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3]
    if (a < 10) continue
    // Near-white/gray background — threshold 160 catches grey rows (180,180,180)
    // while preserving saturated colors (yellow pole b≈13, orange cone b≈0, etc.)
    if (r > 160 && g > 160 && b > 160) { data[i+3] = 0; continue }
    if (r < 50  && g < 50  && b < 50)  { data[i+3] = 0; continue }  // shadow/baseline
  }
  tCtx.putImageData(imageData, 0, 0)

  // Step 2: crop to content bounding box — removes artifact rows/columns at any edge
  const bounds = contentBounds(tCtx, temp.width, temp.height)
  const cropW  = bounds ? bounds.right  - bounds.left + 1 : temp.width
  const cropH  = bounds ? bounds.bottom - bounds.top  + 1 : temp.height
  const offX   = bounds ? bounds.left : 0
  const offY   = bounds ? bounds.top  : 0

  const cropped = document.createElement('canvas')
  cropped.width  = cropW
  cropped.height = cropH
  const cCtx = cropped.getContext('2d')
  cCtx.drawImage(temp, -offX, -offY)

  // Step 3: black silhouette from cropped content
  const sil  = document.createElement('canvas')
  sil.width  = cropped.width
  sil.height = cropped.height
  const sCtx = sil.getContext('2d')
  sCtx.drawImage(cropped, 0, 0)
  sCtx.globalCompositeOperation = 'source-in'
  sCtx.fillStyle = '#000000'
  sCtx.fillRect(0, 0, sil.width, sil.height)

  // Step 4: outline composition
  const T      = 1
  const canvas = document.createElement('canvas')
  canvas.width  = cropped.width  + T * 2
  canvas.height = cropped.height + T * 2
  const ctx = canvas.getContext('2d')
  for (let dx = -T; dx <= T; dx++) {
    for (let dy = -T; dy <= T; dy++) {
      if (dx === 0 && dy === 0) continue
      ctx.drawImage(sil, T + dx, T + dy)
    }
  }
  ctx.drawImage(cropped, T, T)

  _equipmentCache.set(srcImg, canvas)
  return canvas
}

// ── Jersey colorization ───────────────────────────────────────────────────────
// Module-level cache — persists for the session, keyed by hex color
const _playerColorCache = new Map()

function hexToRgb(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  }
}

// Recolors the red jersey in player1.png, knocks out white background,
// and bakes a 1px black outline using the silhouette-offset technique.
function getColorizedPlayer(srcImg, hexColor) {
  if (_playerColorCache.has(hexColor)) return _playerColorCache.get(hexColor)

  // Step 1: colorize + knock out white background onto a temp canvas
  const temp = document.createElement('canvas')
  temp.width  = srcImg.width
  temp.height = srcImg.height
  const tCtx = temp.getContext('2d')
  tCtx.drawImage(srcImg, 0, 0)

  const imageData = tCtx.getImageData(0, 0, temp.width, temp.height)
  const data      = imageData.data
  const target    = hexToRgb(hexColor)

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3]
    if (a < 10) continue
    if (r > 160 && g > 160 && b > 160) { data[i + 3] = 0; continue }  // white/gray bg (catches 180,180,180 border rows)
    if (r < 50  && g < 50  && b < 50)  { data[i + 3] = 0; continue }  // shadow/baseline
    if (r > 120 && r > g * 1.4 && r > b * 1.4) {
      const lum   = r / 255
      data[i]     = Math.round(target.r * lum)
      data[i + 1] = Math.round(target.g * lum)
      data[i + 2] = Math.round(target.b * lum)
    }
  }
  tCtx.putImageData(imageData, 0, 0)

  // Step 2: build a solid black silhouette from the colorized figure
  const sil  = document.createElement('canvas')
  sil.width  = temp.width
  sil.height = temp.height
  const sCtx = sil.getContext('2d')
  sCtx.drawImage(temp, 0, 0)
  sCtx.globalCompositeOperation = 'source-in'
  sCtx.fillStyle = '#000000'
  sCtx.fillRect(0, 0, sil.width, sil.height)

  // Step 3: draw silhouette shifted in 8 directions, then the colorized figure on top
  const T      = 1   // outline thickness in px
  const canvas = document.createElement('canvas')
  canvas.width  = temp.width  + T * 2
  canvas.height = temp.height + T * 2
  const ctx = canvas.getContext('2d')

  for (let dx = -T; dx <= T; dx++) {
    for (let dy = -T; dy <= T; dy++) {
      if (dx === 0 && dy === 0) continue
      ctx.drawImage(sil, T + dx, T + dy)
    }
  }
  ctx.drawImage(temp, T, T)

  _playerColorCache.set(hexColor, canvas)
  return canvas
}

// ── Equipment colorization ────────────────────────────────────────────────────
// Recolors saturated pixels (any hue — works for red cones and blue hoops).
// Cached by `type|hexColor` so each object type gets its own color entries.
const _colorizedEquipCache = new Map()

function getColorizedEquipment(type, srcImg, hexColor) {
  const key = `${type}|${hexColor}`
  if (_colorizedEquipCache.has(key)) return _colorizedEquipCache.get(key)

  const temp = document.createElement('canvas')
  temp.width  = srcImg.width
  temp.height = srcImg.height
  const tCtx = temp.getContext('2d')
  tCtx.drawImage(srcImg, 0, 0)

  const imageData = tCtx.getImageData(0, 0, temp.width, temp.height)
  const data      = imageData.data
  const target    = hexToRgb(hexColor)

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3]
    if (a < 10) continue
    if (r > 160 && g > 160 && b > 160) { data[i+3] = 0; continue }  // near-white/gray bg
    if (r < 50  && g < 50  && b < 50)  { data[i+3] = 0; continue }  // shadow
    // Recolor any saturated pixel — works regardless of original hue
    const maxC = Math.max(r, g, b)
    const minC = Math.min(r, g, b)
    if (maxC > 0 && (maxC - minC) / maxC > 0.15) {
      const lum   = maxC / 255
      data[i]     = Math.round(target.r * lum)
      data[i + 1] = Math.round(target.g * lum)
      data[i + 2] = Math.round(target.b * lum)
    }
  }
  tCtx.putImageData(imageData, 0, 0)

  // Crop to content bounding box
  const bounds = contentBounds(tCtx, temp.width, temp.height)
  const cropW  = bounds ? bounds.right  - bounds.left + 1 : temp.width
  const cropH  = bounds ? bounds.bottom - bounds.top  + 1 : temp.height
  const offX   = bounds ? bounds.left : 0
  const offY   = bounds ? bounds.top  : 0

  const cropped = document.createElement('canvas')
  cropped.width  = cropW
  cropped.height = cropH
  cropped.getContext('2d').drawImage(temp, -offX, -offY)

  // Silhouette + 1px outline
  const sil  = document.createElement('canvas')
  sil.width  = cropped.width
  sil.height = cropped.height
  const sCtx = sil.getContext('2d')
  sCtx.drawImage(cropped, 0, 0)
  sCtx.globalCompositeOperation = 'source-in'
  sCtx.fillStyle = '#000000'
  sCtx.fillRect(0, 0, sil.width, sil.height)

  const T      = 1
  const canvas = document.createElement('canvas')
  canvas.width  = cropped.width  + T * 2
  canvas.height = cropped.height + T * 2
  const ctx = canvas.getContext('2d')
  for (let dx = -T; dx <= T; dx++) {
    for (let dy = -T; dy <= T; dy++) {
      if (dx === 0 && dy === 0) continue
      ctx.drawImage(sil, T + dx, T + dy)
    }
  }
  ctx.drawImage(cropped, T, T)

  _colorizedEquipCache.set(key, canvas)
  return canvas
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

  // UI state
  const [activePanel, setActivePanel] = useState(null)
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false)
  const [contextMenu, setContextMenu] = useState(null)   // { x, y, objId }
  const [images, setImages]       = useState({})   // { [type]: HTMLImageElement, field_half: ... }
  const [currentField, setCurrentField] = useState('full')

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
    const id = nextId.current++
    const initPos = {
      x: aCX + (Math.random() - 0.5) * 120,
      y: aCY + (Math.random() - 0.5) * 80,
    }
    setPlacedObjects(prev => [...prev, {
      id,
      type,
      size: DEFAULT_SIZE,
      rotation: 0,
      ...(DEFAULT_COLORS[type] ? { color: DEFAULT_COLORS[type] } : {}),
    }])
    setFrames(prev => prev.map(f => ({
      ...f,
      positions: { ...f.positions, [id]: { ...initPos } },
    })))
  }, [aCX, aCY])

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
    setPlacedObjects(prev => prev.map(o =>
      o.id === id ? { ...o, rotation: (o.rotation + 90) % 360 } : o
    ))
  }, [])

  const duplicateObject = useCallback((id) => {
    const newId = nextId.current++
    setPlacedObjects(prev => {
      const src = prev.find(o => o.id === id)
      return src ? [...prev, { ...src, id: newId }] : prev
    })
    setFrames(prev => prev.map(f => {
      const orig = f.positions[id] ?? { x: aCX, y: aCY }
      return { ...f, positions: { ...f.positions, [newId]: { x: orig.x + 28, y: orig.y + 28 } } }
    }))
    setContextMenu(null)
  }, [])

  const resizeObject = useCallback((id, size) => {
    setPlacedObjects(prev => prev.map(o => o.id === id ? { ...o, size } : o))
  }, [])

  const setObjectColor = useCallback((id, color) => {
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

  // ── Frame controls ───────────────────────────────────────────────────────────

  const selectFrame = useCallback((idx) => {
    if (isPlaying) return
    setCurrentFrame(idx)
  }, [isPlaying])

  // New frame copies current frame's object positions
  const addFrame = useCallback(() => {
    if (isPlaying) return
    const copy = { ...frames[currentFrame].positions }
    setFrames(prev => [...prev, { positions: copy }])
    setCurrentFrame(frames.length)   // frames.length is pre-update = new frame's index
  }, [frames, currentFrame, isPlaying])

  const deleteFrame = useCallback((idx) => {
    if (frames.length <= 1 || isPlaying) return
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
        const t = Math.min((now - startTime) / FRAME_MS, 1)
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
  }, [frames, isPlaying, freePaths])

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
    // Player: runs the colorize + outline pipeline
    if (obj.type === 'player' && images.player) {
      const color  = obj.color ?? DEFAULT_COLORS.player
      const canvas = getColorizedPlayer(images.player, color)
      const scale  = (r * 2) / canvas.height
      return {
        fillPatternImage:  canvas,
        fillPatternOffset: { x: canvas.width / 2, y: canvas.height / 2 },
        fillPatternScale:  { x: scale, y: scale },
        fillPatternRepeat: 'no-repeat',
      }
    }
    // Ball: non-uniform scale — image fills the full circle
    if (obj.type === 'ball' && images.ball) {
      const img = images.ball
      return {
        fillPatternImage:  img,
        fillPatternOffset: { x: img.width / 2, y: img.height / 2 },
        fillPatternScale:  { x: (r * 2) / img.width, y: (r * 2) / img.height },
        fillPatternRepeat: 'no-repeat',
      }
    }
    // Equipment — colorizable types use getColorizedEquipment, others use processEquipmentImage
    const img = images[obj.type]
    if (img) {
      const canvas = COLORIZABLE.has(obj.type)
        ? getColorizedEquipment(obj.type, img, obj.color ?? DEFAULT_COLORS[obj.type])
        : processEquipmentImage(img)
      const s = (r * 2) / Math.max(canvas.width, canvas.height)
      return {
        fillPatternImage:  canvas,
        fillPatternOffset: { x: canvas.width / 2, y: canvas.height / 2 },
        fillPatternScale:  { x: s, y: s },
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
          imgSrc={`${import.meta.env.BASE_URL}soccerball.png`}
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
        <div className="panel-header">Fields</div>
        <div className="field-list">
          {FIELD_CATALOG.map(f => (
            <button
              key={f.id}
              className={`field-card${currentField === f.id ? ' active' : ''}`}
              onClick={() => setCurrentField(f.id)}
              title={f.label}
            >
              <div className="field-preview" data-field={f.id}>
                {f.src && <img src={`${import.meta.env.BASE_URL}${f.src}`} alt={f.label} />}
              </div>
              <span className="field-card-label">{f.label}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* ── Objects panel — always in DOM, slides in/out via class ── */}
      <aside className={`objects-panel${activePanel === 'objects' ? ' open' : ''}`}>
        <div className="panel-header">Objects</div>
        <div className="object-grid">
          {CATALOG.map(item => (
            <button
              key={item.type}
              className="object-card"
              onClick={() => addToField(item.type)}
              title={`Add ${item.label}`}
            >
              <img src={`${import.meta.env.BASE_URL}${item.src}`} alt={item.label} />
              <span>{item.label}</span>
            </button>
          ))}
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
          <h1>Soccer Tactics Board</h1>
          <div className="header-right">
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
            <FieldBackground field={currentField} halfImg={images['field_half']} fieldW={aFW} fieldH={aFH} />

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
              const r   = getRadius(obj.size)
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
                  rotation={obj.rotation}
                  {...getObjectFill(obj, r)}
                  strokeEnabled={obj.type === 'ball'}
                  stroke="#1a1a1a"
                  strokeWidth={1.5}
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
                  dragBoundFunc={(p) => ({
                    x: Math.max(PAD - GBUF + r, Math.min(p.x, PAD + aFW + GBUF - r)),
                    y: isFullField
                      ? Math.max(PAD - GOAL_D - GBUF + r, Math.min(p.y, PAD + aFH + GOAL_D + GBUF - r))
                      : Math.max(PAD - GBUF + r, Math.min(p.y, PAD + aFH + GBUF - r)),
                  })}
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
              top:  Math.min(contextMenu.y, viewH - 320),
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

            <button className="ctx-btn" onClick={() => rotateObject(contextMenu.objId)}>
              <span className="ctx-icon">↻</span> Rotate 90°
            </button>
            <button className="ctx-btn" onClick={() => duplicateObject(contextMenu.objId)}>
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

function FieldBackground({ field, halfImg, fieldW, fieldH }) {
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
