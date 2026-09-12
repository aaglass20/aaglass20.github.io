import { useState, useRef, useCallback, useEffect } from 'react'
import { Stage, Layer, Rect, Circle, Line, Path } from 'react-konva'
import './App.css'

// Field at 8px/m — 105m × 68m
const FW = 840, FH = 544, PAD = 44
const SW = FW + PAD * 2, SH = FH + PAD * 2
const CX = FW / 2, CY = FH / 2
const PA_HW = 162, PA_D = 132, GA_HW = 73, GA_D = 44
const PS_D = 88, CIRCLE_R = 73, ARC_X = 58.3
const GOAL_HW = 30, GOAL_D = 20

const SIZE_RADII   = [10, 13, 17, 22, 27, 34]
const DEFAULT_SIZE = 3
const getRadius    = (size) => SIZE_RADII[(size ?? DEFAULT_SIZE) - 1]

const FRAME_MS  = 900
const easeInOut = (t) => t < 0.5 ? 2*t*t : -1 + (4 - 2*t) * t

const OBJECT_COLORS = ['#ef4444','#3b82f6','#facc15','#22c55e','#f9fafb','#1f2937','#f97316','#a855f7']

// Types that support per-instance color picking
const COLORIZABLE = new Set(['player', 'cone', 'hoop'])

// Default colors match each object's original source image
const DEFAULT_COLORS = { player: '#ef4444', cone: '#ef4444', hoop: '#3b82f6' }

const CATALOG = [
  { type: 'ball',   label: 'Soccer Ball', src: 'soccerball.png' },
  { type: 'player', label: 'Player',      src: 'player1.png'    },
  { type: 'cone',   label: 'Cone',        src: 'cone.png'       },
  { type: 'hoop',   label: 'Hoop',        src: 'hoop.png'       },
  { type: 'pole',   label: 'Pole',        src: 'pole.png'       },
]

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
  const [contextMenu, setContextMenu] = useState(null)   // { x, y, objId }
  const [images, setImages] = useState({})   // { [type]: HTMLImageElement }

  const nextId  = useRef(0)
  const objRefs = useRef({})   // { [id]: Konva node } — populated via callback refs
  const rafRef  = useRef(null)

  // Load all catalog images once
  useEffect(() => {
    CATALOG.forEach(({ type, src }) => {
      const img = new window.Image()
      img.src = `${import.meta.env.BASE_URL}${src}`
      img.onload = () => setImages(prev => ({ ...prev, [type]: img }))
    })
  }, [])

  // Close context menu on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setContextMenu(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // ── Object mutations ─────────────────────────────────────────────────────────

  const addToField = useCallback((type) => {
    const id = nextId.current++
    const initPos = {
      x: CX + (Math.random() - 0.5) * 120,
      y: CY + (Math.random() - 0.5) * 80,
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
  }, [])

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
      const orig = f.positions[id] ?? { x: CX, y: CY }
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

  // Resets everything back to a blank board
  const clearBoard = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    setIsPlaying(false)
    setPlacedObjects([])
    setFrames([{ positions: {} }])
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
    const copy = { ...frames[currentFrame].positions }
    setFrames(prev => [...prev, { positions: copy }])
    setCurrentFrame(frames.length)   // frames.length is pre-update = new frame's index
  }, [frames, currentFrame, isPlaying])

  const deleteFrame = useCallback((idx) => {
    if (frames.length <= 1 || isPlaying) return
    const updated = frames.filter((_, i) => i !== idx)
    setFrames(updated)
    setCurrentFrame(prev => Math.min(prev, updated.length - 1))
  }, [frames, isPlaying])

  // ── Playback ─────────────────────────────────────────────────────────────────

  const play = useCallback(() => {
    if (frames.length < 2 || isPlaying) return

    const snap = frames.map(f => ({ ...f.positions }))

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

      const fromPos = snap[seg]
      const toPos   = snap[seg + 1]
      const ids = [...new Set([...Object.keys(fromPos), ...Object.keys(toPos)])].map(Number)

      const tick = (now) => {
        const t = Math.min((now - startTime) / FRAME_MS, 1)
        const e = easeInOut(t)

        ids.forEach(id => {
          const from = fromPos[id]
          const to   = toPos[id]
          if (!from || !to) return
          objRefs.current[id]?.position({
            x: from.x + (to.x - from.x) * e,
            y: from.y + (to.y - from.y) * e,
          })
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
  }, [frames, isPlaying])

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    setIsPlaying(false)
    setCurrentFrame(0)
  }, [])

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
    <div className="app">

      {/* ── Sidebar ── */}
      <nav className="sidebar">
        <SidebarBtn
          label="Objects"
          imgSrc={`${import.meta.env.BASE_URL}soccerball.png`}
          active={activePanel === 'objects'}
          onClick={() => setActivePanel(p => p === 'objects' ? null : 'objects')}
        />
        <SidebarBtn label="Zones" icon="⬜" disabled onClick={() => {}} />
        <SidebarBtn label="Text"  icon="T"  disabled onClick={() => {}} />
        <SidebarBtn label="Draw"  icon="✏"  disabled onClick={() => {}} />
      </nav>

      {/* ── Objects panel ── */}
      {activePanel === 'objects' && (
        <aside className="objects-panel">
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
      )}

      {/* ── Main ── */}
      <div className="main">
        <header className="header">
          <h1>Soccer Tactics Board</h1>
          <button className="clear-btn" onClick={clearBoard} title="Clear board">
            Clear
          </button>
        </header>

        <Stage width={SW} height={SH} onClick={() => setContextMenu(null)}>
          <Layer x={PAD} y={PAD}>
            <SoccerField />

            {/* Motion trails — dashed lines between frame positions, hidden during playback */}
            {!isPlaying && frames.length > 1 && placedObjects.flatMap(obj =>
              frames.slice(0, -1).map((f, i) => {
                const from = f.positions[obj.id]
                const to   = frames[i + 1].positions[obj.id]
                if (!from || !to) return null
                return (
                  <Line
                    key={`trail-${obj.id}-${i}`}
                    points={[from.x, from.y, to.x, to.y]}
                    stroke="rgba(255,220,0,0.4)"
                    strokeWidth={2}
                    dash={[8, 6]}
                    lineCap="round"
                    listening={false}
                  />
                )
              })
            )}

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
                  draggable={!isPlaying}
                  onDragMove={(e) => moveObject(obj.id, e.target.x(), e.target.y())}
                  onDragEnd={(e)  => moveObject(obj.id, e.target.x(), e.target.y())}
                  dragBoundFunc={(p) => ({
                    x: Math.max(PAD + r, Math.min(p.x, PAD + FW - r)),
                    y: Math.max(PAD + r, Math.min(p.y, PAD + FH - r)),
                  })}
                  onDblClick={(e) => {
                    e.cancelBubble = true
                    setContextMenu({ x: e.evt.clientX, y: e.evt.clientY, objId: obj.id })
                  }}
                />
              )
            })}
          </Layer>
        </Stage>

        {/* ── Bottom bar: playback + frame timeline ── */}
        <div className="bottom-bar">
          <div className="playback">
            <button className="play-btn" onClick={play}  disabled={!canPlay}   title="Play">▶</button>
            <button className="stop-btn" onClick={stop}  disabled={!isPlaying} title="Stop">■</button>
          </div>

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

      {/* ── Context menu ── */}
      {contextMenu && (
        <>
          <div className="ctx-overlay" onClick={() => setContextMenu(null)} />
          <div
            className="ctx-menu"
            style={{ left: contextMenu.x, top: contextMenu.y }}
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
    </div>
  )
}

// ── Soccer field (static) ─────────────────────────────────────────────────────
function SoccerField() {
  return (
    <>
      <Rect width={FW} height={FH} fill="#2d8b2d" cornerRadius={2} />
      <Rect width={FW} height={FH} stroke="white" strokeWidth={2.5} fill="transparent" />
      <Line points={[0, CY, FW, CY]} stroke="white" strokeWidth={2} />
      <Circle x={CX} y={CY} radius={CIRCLE_R} stroke="white" strokeWidth={2} fill="transparent" />
      <Circle x={CX} y={CY} radius={3.5} fill="white" />
      <Rect x={CX-PA_HW} y={0}       width={PA_HW*2} height={PA_D}   stroke="white" strokeWidth={2} fill="transparent" />
      <Rect x={CX-GA_HW} y={0}       width={GA_HW*2} height={GA_D}   stroke="white" strokeWidth={2} fill="transparent" />
      <Circle x={CX} y={PS_D}        radius={3.5} fill="white" />
      <Path data={`M ${CX+ARC_X} ${PA_D} A ${CIRCLE_R} ${CIRCLE_R} 0 0 1 ${CX-ARC_X} ${PA_D}`}
            stroke="white" strokeWidth={2} fill="transparent" />
      <Rect x={CX-GOAL_HW} y={-GOAL_D} width={GOAL_HW*2} height={GOAL_D}
            stroke="white" strokeWidth={2} fill="rgba(255,255,255,0.07)" />
      <Rect x={CX-PA_HW} y={FH-PA_D} width={PA_HW*2} height={PA_D}   stroke="white" strokeWidth={2} fill="transparent" />
      <Rect x={CX-GA_HW} y={FH-GA_D} width={GA_HW*2} height={GA_D}   stroke="white" strokeWidth={2} fill="transparent" />
      <Circle x={CX} y={FH-PS_D}    radius={3.5} fill="white" />
      <Path data={`M ${CX+ARC_X} ${FH-PA_D} A ${CIRCLE_R} ${CIRCLE_R} 0 0 0 ${CX-ARC_X} ${FH-PA_D}`}
            stroke="white" strokeWidth={2} fill="transparent" />
      <Rect x={CX-GOAL_HW} y={FH}   width={GOAL_HW*2} height={GOAL_D}
            stroke="white" strokeWidth={2} fill="rgba(255,255,255,0.07)" />
    </>
  )
}
