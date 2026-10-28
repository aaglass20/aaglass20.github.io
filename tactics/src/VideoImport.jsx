import { useState, useRef, useEffect } from 'react'
import Anthropic from '@anthropic-ai/sdk'

// ── Lab: draft a play from a video clip ──────────────────────────────────────
// Pulls still frames from a clip in the browser, sends them to Claude with the board's
// object catalog and field views, and turns the reply into a normal play file (objects,
// one frame per step of the drill, optional arrows). Nothing leaves the browser except
// the frames, and only to the Claude API with the user's own key.

const MODEL      = 'claude-opus-5-5'
const KEY_STORE  = 'tacticsLabKey'
const FRAME_W    = 960            // frames are scaled down to this width before sending
const FRAME_OPTIONS = [8, 12, 16, 24, 32]

// Palette names the model picks from → board colors (objects / arrows)
const COLOR_NAMES = ['red', 'blue', 'yellow', 'green', 'white', 'black', 'orange', 'purple']
const OBJECT_HEX  = { red: '#ef4444', blue: '#3b82f6', yellow: '#facc15', green: '#22c55e', white: '#f9fafb', black: '#1f2937', orange: '#f97316', purple: '#a855f7' }
const DRAW_HEX    = { ...OBJECT_HEX, white: '#ffffff', black: '#000000' }

// What each catalog object is, in words the model can match against the video
const OBJECT_HELP = {
  ball: 'soccer ball', basketball: 'basketball', football: 'football', baseball: 'baseball', softball: 'softball', puck: 'hockey puck',
  player: 'unnumbered player figure — coach, server, neutral, goalkeeper or anyone not on a team',
  'player-t1': 'team 1 player figure, numbered automatically (use for the first team / attackers / working group)',
  'player-t2': 'team 2 player figure, numbered automatically (use for the second team / defenders)',
  'pos-t1': 'team 1 basketball player labeled PG, SG, SF, PF, C in order (max 5)',
  'pos-t2': 'team 2 basketball player labeled PG, SG, SF, PF, C in order (max 5)',
  batter: 'batter holding a bat',
  marker: 'flat numbered disc for team 1 (a simple token instead of a figure)',
  marker2: 'flat numbered disc for team 2',
  goal: 'full-size goal', 'popup-goal': 'small pop-up / mini goal', freekick: 'free-kick wall mannequin', arch: 'agility arch / mini hurdle',
  cone: 'cone or flat disc marker', hoop: 'flat agility ring on the ground', pinnie: 'training bib lying on the ground', pole: 'slalom / agility pole',
  ballrack: 'ball rack', fieldgoal: 'football goal posts', bat: 'bat lying on the ground', softtoss: 'soft-toss setup',
  hitstick: 'hit stick', 'hit-net': 'hitting net / screen', tee: 'batting tee', plate: 'home plate', base: 'base', 'hockey-goal': 'hockey net',
}

const PLACE = {
  soccer: { thing: 'pitch', ends: 'goal lines', size: '68 m wide × 105 m long' },
  basketball: { thing: 'court', ends: 'baselines (baskets)', size: '50 ft wide × 94 ft long' },
  football: { thing: 'field', ends: 'end zones', size: '53⅓ yd wide × 120 yd long including end zones' },
  hockey: { thing: 'rink', ends: 'end boards (nets)', size: '85 ft wide × 200 ft long' },
}

// How each view lays the field out on its canvas, so the model can map what it sees
function viewHelp(sport, id) {
  if (sport === 'baseball' || sport === 'softball') {
    return {
      full: 'landscape; the whole diamond and outfield, home plate near the bottom center, center field toward the top',
      half: 'landscape; the infield — home plate near the bottom center, all four bases filling the view',
      'half-flip': 'landscape; the outfield — the edge of the infield along the bottom, the fence near the top',
      middle: 'landscape; close-up of home plate and the batter’s boxes (about 40 × 32 ft)',
      blank: 'landscape; plain grass, no lines — best for stations, hitting drills and anything off the diamond; lay the drill out to fill most of the canvas',
    }[id]
  }
  const p = PLACE[sport]
  return {
    full: `portrait; the whole ${p.thing} (${p.size}), its length running top to bottom with ${p.ends} at the top and bottom edges`,
    horizontal: `landscape; the whole ${p.thing}, its length running left to right with ${p.ends} at the left and right edges`,
    half: `landscape; one half of the ${p.thing} — the end (${p.ends}) along the BOTTOM edge, the halfway / center line along the TOP edge, sidelines left and right`,
    'half-flip': `landscape; one half of the ${p.thing} — the end (${p.ends}) along the TOP edge, the halfway / center line along the BOTTOM edge`,
    'horizontal-left': `narrow (about 4:5); one half of the ${p.thing} with its end along the LEFT edge and the halfway line along the RIGHT edge`,
    'horizontal-right': `narrow (about 4:5); one half of the ${p.thing} with its end along the RIGHT edge and the halfway line along the LEFT edge`,
    middle: `landscape; the middle third of the ${p.thing}, its length running left to right (sidelines along the top and bottom edges)`,
    blank: 'landscape; plain grass with no lines — best for small-sided games, rondos, cone grids and stations, or whenever field markings don’t matter; lay the drill out to fill most of the canvas',
  }[id]
}

function buildPrompt(sport, kit, notes) {
  const sp = kit.SPORTS.find(s => s.id === sport)
  const objects = kit.CATALOG.filter(o => o.sports.includes(sport))
  const views = kit.FIELD_CATALOG.filter(f => kit.fieldInSport(f.id, sport))
  return [
    `You turn a coaching video into a top-down tactics-board diagram. The sport is ${sp.label.replace(/^\S+\s/, '')}.`,
    '',
    'You get still frames from the clip in time order. Work out:',
    '1. The camera angle, and which field markings, cones or lines let you map the picture onto the ground (correct for perspective — the board is a flat top-down view).',
    '2. Which field view below best fits the area the drill uses.',
    '3. Every person and piece of equipment in the drill, and where each one starts.',
    '4. How one repetition of the drill plays out: who moves where, and where the ball goes.',
    '',
    'FIELD VIEWS (coordinates are x 0→1 left→right and y 0→1 top→bottom across the whole view):',
    ...views.map(f => `- ${f.id} ("${kit.fieldLabel(f, sport)}"): ${viewHelp(sport, f.id)}`),
    '',
    'OBJECTS YOU CAN PLACE (type: what it is):',
    ...objects.map(o => `- ${o.type}: ${OBJECT_HELP[o.type] ?? o.label}`),
    '',
    'RULES:',
    '- Give each object a short unique key (e.g. "a1", "d2", "ball", "c3") and its START position.',
    '- Players: use player-t1 / player-t2 for two groups (attack / defense, or two teams); player for coaches, servers and neutrals. A drill with one group uses player-t1 only.',
    '- Place cones individually (up to about 30). If a grid is marked by cones, put a cone at each corner / gate you can see or infer.',
    '- color: the closest palette color to the shirt, bib or cone color you see; "default" when unsure or for equipment that keeps its natural color.',
    '- facing: only for goals and nets — the direction the goal mouth opens toward on the board (0 = up, 90 = right, 180 = down, 270 = left, diagonals in 45° steps). Use 0 for everything else.',
    '- steps: 2–8 key moments of one repetition, in order. Each lists ONLY the objects that moved since the previous moment, with their new positions. Move the ball with whoever has it, and to where it is passed or shot.',
    '- arrows: the main runs (kind "arrow") and passes or shots (kind "dashed-arrow") of that repetition, from start point to end point, at most 10.',
    '- Keep every coordinate between 0.02 and 0.98. Keep objects at least 0.03 apart unless they really are touching.',
    '- If the frames do not show a sports drill or play, return no objects and say why in summary.',
    '- summary: 2–5 sentences a coach could use — setup, how it runs, coaching points.',
    notes ? `\nNOTES FROM THE COACH (trust these over your own guess): ${notes}` : '',
  ].join('\n')
}

function buildSchema(sport, kit) {
  const types = kit.CATALOG.filter(o => o.sports.includes(sport)).map(o => o.type)
  const views = kit.FIELD_CATALOG.filter(f => kit.fieldInSport(f.id, sport)).map(f => f.id)
  const point = { x: { type: 'number' }, y: { type: 'number' } }
  return {
    type: 'object',
    additionalProperties: false,
    required: ['title', 'summary', 'camera', 'field', 'objects', 'steps', 'arrows'],
    properties: {
      title:   { type: 'string', description: 'Short drill name' },
      summary: { type: 'string' },
      camera:  { type: 'string', description: 'One sentence: camera angle and how you mapped it to the board' },
      field:   { type: 'string', enum: views },
      objects: {
        type: 'array',
        items: {
          type: 'object', additionalProperties: false,
          required: ['key', 'type', 'color', 'facing', 'x', 'y'],
          properties: {
            key: { type: 'string' },
            type: { type: 'string', enum: types },
            color: { type: 'string', enum: ['default', ...COLOR_NAMES] },
            facing: { type: 'integer', enum: [0, 45, 90, 135, 180, 225, 270, 315] },
            ...point,
          },
        },
      },
      steps: {
        type: 'array',
        items: {
          type: 'object', additionalProperties: false,
          required: ['note', 'moves'],
          properties: {
            note: { type: 'string' },
            moves: {
              type: 'array',
              items: { type: 'object', additionalProperties: false, required: ['key', 'x', 'y'], properties: { key: { type: 'string' }, ...point } },
            },
          },
        },
      },
      arrows: {
        type: 'array',
        items: {
          type: 'object', additionalProperties: false,
          required: ['kind', 'color', 'x1', 'y1', 'x2', 'y2'],
          properties: {
            kind: { type: 'string', enum: ['arrow', 'dashed-arrow'] },
            color: { type: 'string', enum: COLOR_NAMES },
            x1: { type: 'number' }, y1: { type: 'number' }, x2: { type: 'number' }, y2: { type: 'number' },
          },
        },
      },
    },
  }
}

const clamp01 = (v) => Math.min(0.98, Math.max(0.02, Number(v) || 0.5))

// Claude's answer → a play file the board opens like any saved one
function toPlay(result, sport, kit, withArrows) {
  const field = kit.fieldInSport(result.field, sport) ? result.field : 'blank'
  const { w, h } = kit.canvasFor(sport, field)
  const at = (x, y) => ({ x: Math.round(clamp01(x) * w), y: Math.round(clamp01(y) * h) })
  const allowed = new Set(kit.CATALOG.filter(o => o.sports.includes(sport)).map(o => o.type))

  const objects = [], start = {}, idOf = {}
  for (const o of result.objects ?? []) {
    if (!allowed.has(o.type) || idOf[o.key] != null) continue
    let type = o.type, tag = kit.nextTag(objects, type)
    if (!tag && (type === 'player-t1' || type === 'player-t2' || type === 'pos-t1' || type === 'pos-t2')) { type = 'player'; tag = {} }   // out of numbers
    if (!tag) continue
    const id = objects.length
    const obj = kit.newObject(id, type, tag)
    if (kit.COLORIZABLE.has(type) && OBJECT_HEX[o.color]) obj.color = OBJECT_HEX[o.color]
    if (kit.MODEL_TYPES.has(type)) obj.facing = o.facing ?? kit.GOAL_DEFAULT_FACING
    objects.push(obj)
    idOf[o.key] = id
    start[id] = at(o.x, o.y)
  }

  const frames = [{ positions: start }]
  for (const step of result.steps ?? []) {
    const positions = { ...frames[frames.length - 1].positions }
    let moved = false
    for (const m of step.moves ?? []) {
      if (idOf[m.key] == null) continue
      positions[idOf[m.key]] = at(m.x, m.y)
      moved = true
    }
    if (moved) frames.push({ positions })
  }

  const drawings = withArrows ? (result.arrows ?? []).map((a, i) => {
    const p1 = at(a.x1, a.y1), p2 = at(a.x2, a.y2)
    return { id: i, type: a.kind === 'dashed-arrow' ? 'dashed-arrow' : 'arrow', mode: 'straight', color: DRAW_HEX[a.color] ?? '#ffffff', thickness: 2, points: [p1.x, p1.y, p2.x, p2.y] }
  }) : []

  return {
    format: kit.SAVE_FORMAT, version: kit.SAVE_VERSION, savedAt: new Date().toISOString(),
    sport, field, playSpeed: 1,
    placedObjects: objects, frames, freePaths: {}, drawings, shapes: [], textItems: [],
    nextIds: { object: objects.length, draw: drawings.length, shape: 0, text: 0 },
    // Kept with the file for reference; the board ignores it
    notes: { title: result.title, summary: result.summary, camera: result.camera, steps: (result.steps ?? []).map(s => s.note), source: 'video', model: MODEL },
  }
}

// Seeks through the clip and grabs `count` evenly spaced frames as JPEG data URLs
async function grabFrames(video, from, to, count, onProgress) {
  const scale = Math.min(1, FRAME_W / video.videoWidth)
  const c = document.createElement('canvas')
  c.width = Math.round(video.videoWidth * scale)
  c.height = Math.round(video.videoHeight * scale)
  const ctx = c.getContext('2d')
  const out = []
  video.pause()
  for (let i = 0; i < count; i++) {
    const t = from + (to - from) * (count === 1 ? 0.5 : i / (count - 1))
    await new Promise((resolve, reject) => {
      const done = () => { video.removeEventListener('seeked', done); video.removeEventListener('error', fail); resolve() }
      const fail = () => { video.removeEventListener('seeked', done); video.removeEventListener('error', fail); reject(new Error('The video could not be read at that point.')) }
      video.addEventListener('seeked', done)
      video.addEventListener('error', fail)
      video.currentTime = Math.min(t, video.duration - 0.05)
    })
    ctx.drawImage(video, 0, 0, c.width, c.height)
    out.push({ t, url: c.toDataURL('image/jpeg', 0.8) })   // throws SecurityError for a link without CORS
    onProgress(i + 1)
  }
  return out
}

async function askClaude({ apiKey, sport, kit, notes, frames, signal, onStatus }) {
  if (import.meta.env.DEV && apiKey.trim() === 'test') {   // dev-only canned answer for trying the flow without a key
    await new Promise(r => setTimeout(r, 900))
    return SAMPLE_RESULT
  }
  const client = new Anthropic({ apiKey: apiKey.trim(), dangerouslyAllowBrowser: true })
  const content = []
  frames.forEach((f, i) => {
    content.push({ type: 'text', text: `Frame ${i + 1} — ${f.t.toFixed(1)} s` })
    content.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: f.url.split(',')[1] } })
  })
  content.push({ type: 'text', text: 'Recreate this drill on the board.' })

  const stream = client.beta.messages.stream({
    model: MODEL,
    max_tokens: 32000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    thinking: { type: 'adaptive' },
    output_config: { effort: 'high', format: { type: 'json_schema', schema: buildSchema(sport, kit) } },
    system: buildPrompt(sport, kit, notes),
    messages: [{ role: 'user', content }],
  }, { signal })
  let chars = 0
  stream.on('text', (d) => { chars += d.length; onStatus(`Writing the drill… ${chars} characters`) })
  const msg = await stream.finalMessage()
  if (msg.stop_reason === 'refusal') throw new Error('Claude declined to analyze this clip.')
  if (msg.stop_reason === 'max_tokens') throw new Error('The answer was cut off. Try a shorter clip or fewer frames.')
  const text = msg.content.filter(b => b.type === 'text').map(b => b.text).join('')
  return JSON.parse(text)
}

function errorText(err) {
  if (err.name === 'AbortError' || err instanceof Anthropic.APIUserAbortError) return null
  if (err instanceof Anthropic.AuthenticationError) return 'That API key was not accepted. Check it and try again.'
  if (err instanceof Anthropic.PermissionDeniedError) return 'This API key is not allowed to use that model.'
  if (err instanceof Anthropic.RateLimitError) return 'Rate limited — wait a minute and try again.'
  if (err instanceof Anthropic.BadRequestError) return `The request was rejected: ${err.message}`
  if (err instanceof Anthropic.APIConnectionError) return 'Could not reach the Claude API. Check your connection.'
  if (err instanceof Anthropic.APIError) return `Claude API error ${err.status}: ${err.message}`
  if (err.name === 'SecurityError') return 'That link does not allow its frames to be read. Download the .mp4 and choose the file instead.'
  return err.message || String(err)
}

const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

// Small top-down preview of the draft: start positions and arrows on the view's aspect
function DraftMap({ play, kit }) {
  const { w, h } = kit.canvasFor(play.sport, play.field)
  const pos = play.frames[0].positions
  return (
    <svg className="vi-map" viewBox={`-20 -20 ${w + 40} ${h + 40}`}>
      <rect x={-20} y={-20} width={w + 40} height={h + 40} rx={10} fill="#2d8b2d" />
      <rect x={0} y={0} width={w} height={h} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={3} strokeDasharray="10 8" />
      {play.drawings.map(d => (
        <line key={d.id} x1={d.points[0]} y1={d.points[1]} x2={d.points[2]} y2={d.points[3]} stroke={d.color} strokeWidth={4} strokeDasharray={d.type === 'dashed-arrow' ? '12 8' : undefined} opacity={0.8} />
      ))}
      {play.placedObjects.map(o => {
        const p = pos[o.id]
        const r = o.type === 'cone' ? 7 : /goal|net/.test(o.type) ? 16 : 12
        return (
          <g key={o.id}>
            <circle cx={p.x} cy={p.y} r={r} fill={o.color ?? '#e5e7eb'} stroke="#111827" strokeWidth={2} />
            {(o.number ?? o.position) != null && <text x={p.x} y={p.y + 5} textAnchor="middle" fontSize={14} fontWeight={700} fill="#111827">{o.number ?? o.position}</text>}
          </g>
        )
      })}
    </svg>
  )
}

export default function VideoImport({ sport, kit, onClose, onOpen }) {
  const [videoUrl, setVideoUrl] = useState(null)
  const [sourceName, setSourceName] = useState('')
  const [linkText, setLinkText] = useState('')
  const [isLink, setIsLink] = useState(false)
  const [duration, setDuration] = useState(0)
  const [range, setRange] = useState([0, 0])
  const [count, setCount] = useState(16)
  const [notes, setNotes] = useState('')
  const [apiKey, setApiKey] = useState(() => { try { return localStorage.getItem(KEY_STORE) ?? '' } catch { return '' } })
  const [remember, setRemember] = useState(() => { try { return !!localStorage.getItem(KEY_STORE) } catch { return false } })
  const [withArrows, setWithArrows] = useState(false)
  const [phase, setPhase] = useState('pick')   // pick | working | done
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [frames, setFrames] = useState([])
  const [result, setResult] = useState(null)
  const videoRef = useRef(null)
  const abortRef = useRef(null)
  const startedRef = useRef(0)

  useEffect(() => () => { if (videoUrl?.startsWith('blob:')) URL.revokeObjectURL(videoUrl) }, [videoUrl])
  useEffect(() => () => abortRef.current?.abort(), [])

  const pickFile = (file) => {
    if (!file) return
    setVideoUrl(URL.createObjectURL(file))
    setSourceName(file.name.replace(/\.[^.]+$/, ''))
    setIsLink(false); setError(''); setResult(null); setFrames([])
  }
  const loadLink = () => {
    const url = linkText.trim()
    if (!/^https?:\/\//i.test(url)) { setError('Paste a full link that starts with http:// or https://'); return }
    if (/youtube\.com|youtu\.be|vimeo\.com/i.test(url)) { setError('YouTube and Vimeo pages can’t be read from the browser. Download the clip as an .mp4 and choose the file instead.'); return }
    setVideoUrl(url)
    setSourceName(decodeURIComponent(url.split('/').pop().split('?')[0]).replace(/\.[^.]+$/, '') || 'video')
    setIsLink(true); setError(''); setResult(null); setFrames([])
  }
  const onMeta = () => {
    const v = videoRef.current
    if (Number.isFinite(v.duration)) { setDuration(v.duration); setRange([0, v.duration]); return }
    // Recorded .webm files often don't store their length: seek far past the end and the
    // browser works it out
    const found = () => {
      if (!Number.isFinite(v.duration)) return
      v.removeEventListener('durationchange', found)
      v.currentTime = 0
      setDuration(v.duration); setRange([0, v.duration])
    }
    v.addEventListener('durationchange', found)
    v.currentTime = 1e7
  }
  const markAt = (which) => {
    const t = videoRef.current?.currentTime ?? 0
    setRange(([a, b]) => which === 0 ? [Math.min(t, b - 0.5), b] : [a, Math.max(t, a + 0.5)])
  }

  const analyze = async () => {
    if (!apiKey.trim()) { setError('Enter your Anthropic API key first.'); return }
    try { remember ? localStorage.setItem(KEY_STORE, apiKey.trim()) : localStorage.removeItem(KEY_STORE) } catch { /* private mode */ }
    setError(''); setResult(null); setPhase('working')
    const ctrl = new AbortController()
    abortRef.current = ctrl
    try {
      setStatus(`Pulling frames… 0 / ${count}`)
      const shots = await grabFrames(videoRef.current, range[0], range[1], count, (n) => setStatus(`Pulling frames… ${n} / ${count}`))
      setFrames(shots)
      startedRef.current = Date.now()
      const tick = setInterval(() => setStatus(s => s.startsWith('Writing') ? s : `Claude is studying the clip… ${Math.round((Date.now() - startedRef.current) / 1000)} s`), 1000)
      setStatus('Claude is studying the clip… 0 s')
      let res
      try {
        res = await askClaude({ apiKey, sport, kit, notes: notes.trim(), frames: shots, signal: ctrl.signal, onStatus: setStatus })
      } finally { clearInterval(tick) }
      setResult(res)
      setPhase('done')
    } catch (err) {
      const msg = errorText(err)
      setPhase('pick')
      if (msg) setError(msg)
    }
  }

  const play = result ? toPlay(result, sport, kit, withArrows) : null
  const name = (result?.title || sourceName || 'video drill').replace(/[\\/:*?"<>|]+/g, '-').slice(0, 60)
  const sportLabel = kit.SPORTS.find(s => s.id === sport).label
  const viewLabel = play ? kit.fieldLabel(kit.FIELD_CATALOG.find(f => f.id === play.field), sport) : ''

  return (
    <div className="export-overlay vi-overlay" onClick={phase === 'working' ? undefined : onClose}>
      <div className="export-dialog vi-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="vi-head">
          <div className="export-dialog-title">🎬 Play from video <span className="lab-tag">Lab</span></div>
          <button className="vi-x" onClick={() => { abortRef.current?.abort(); onClose() }} aria-label="Close">✕</button>
        </div>

        {phase !== 'done' && (
          <>
            <p className="vi-hint">Choose a short clip of one drill (an .mp4 works best). Claude looks at still frames and drafts it as a {sportLabel.replace(/^\S+\s/, '')} play you can edit. Switch sports first if this is a different sport.</p>

            <div className="vi-row">
              <label className="vi-file">
                📁 Choose video file
                <input type="file" accept="video/*" onChange={(e) => { pickFile(e.target.files?.[0]); e.target.value = '' }} disabled={phase === 'working'} />
              </label>
              <span className="vi-or">or</span>
              <input className="export-name-input vi-link" placeholder="Direct .mp4 link" value={linkText} onChange={(e) => setLinkText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && loadLink()} disabled={phase === 'working'} />
              <button className="file-btn" onClick={loadLink} disabled={phase === 'working' || !linkText.trim()}>Load</button>
            </div>

            {videoUrl && (
              <>
                <video
                  ref={videoRef}
                  className="vi-video"
                  src={videoUrl}
                  controls
                  playsInline
                  muted
                  preload="auto"
                  crossOrigin={isLink ? 'anonymous' : undefined}
                  onLoadedMetadata={onMeta}
                  onError={() => setError(isLink ? 'That link could not be played here (it may block other sites). Download the .mp4 and choose the file instead.' : 'This browser can’t play that video. Try an .mp4 (H.264).')}
                />
                {duration > 0 && (
                  <div className="vi-row vi-trim">
                    <span>Use <b>{fmt(range[0])}</b> – <b>{fmt(range[1])}</b> ({Math.round(range[1] - range[0])} s)</span>
                    <button className="file-btn" onClick={() => markAt(0)} disabled={phase === 'working'}>Start here</button>
                    <button className="file-btn" onClick={() => markAt(1)} disabled={phase === 'working'}>End here</button>
                    <button className="file-btn" onClick={() => setRange([0, duration])} disabled={phase === 'working'}>Whole clip</button>
                  </div>
                )}
                {range[1] - range[0] > 90 && <div className="vi-warn">That’s a long stretch — trim it to the part that shows one drill (under a minute works best).</div>}
              </>
            )}

            <label className="vi-label">What should Claude know? <span>(optional)</span></label>
            <textarea className="vi-notes" rows={2} placeholder="e.g. 4v2 rondo in a 15×15 yd grid; blue bibs are the defenders; camera is behind the goal" value={notes} onChange={(e) => setNotes(e.target.value)} disabled={phase === 'working'} />

            <div className="vi-row">
              <label className="vi-label vi-inline">Frames
                <select value={count} onChange={(e) => setCount(Number(e.target.value))} disabled={phase === 'working'}>
                  {FRAME_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
              <label className="vi-check"><input type="checkbox" checked={withArrows} onChange={(e) => setWithArrows(e.target.checked)} /> Draw arrows for runs and passes</label>
            </div>

            <label className="vi-label">Anthropic API key</label>
            <div className="vi-row">
              <input className="export-name-input vi-key" type="password" autoComplete="off" placeholder="sk-ant-…" value={apiKey} onChange={(e) => setApiKey(e.target.value)} disabled={phase === 'working'} />
              <label className="vi-check"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember on this device</label>
            </div>

            {error && <div className="vi-error">{error}</div>}
            {phase === 'working' && <div className="vi-status"><span className="vi-spin" /> {status}</div>}

            <div className="export-dialog-actions">
              {phase === 'working'
                ? <button className="export-cancel-btn" onClick={() => abortRef.current?.abort()}>Stop</button>
                : <button className="export-save-btn" onClick={analyze} disabled={!videoUrl || !duration}>Analyze clip</button>}
            </div>
          </>
        )}

        {phase === 'done' && play && (
          <>
            {play.placedObjects.length === 0 ? (
              <div className="vi-error">Claude couldn’t find a drill to draw. {result.summary}</div>
            ) : (
              <div className="vi-result">
                <DraftMap play={play} kit={kit} />
                <div className="vi-info">
                  <div className="vi-title">{result.title}</div>
                  <div className="vi-meta">{viewLabel} · {play.placedObjects.length} objects · {play.frames.length} frames</div>
                  <p>{result.summary}</p>
                  {result.steps?.length > 0 && <ol className="vi-steps">{result.steps.map((s, i) => <li key={i}>{s.note}</li>)}</ol>}
                  <div className="vi-camera">📷 {result.camera}</div>
                  <label className="vi-check"><input type="checkbox" checked={withArrows} onChange={(e) => setWithArrows(e.target.checked)} /> Draw arrows for runs and passes</label>
                </div>
              </div>
            )}
            {frames.length > 0 && (
              <details className="vi-frames">
                <summary>Frames Claude saw ({frames.length})</summary>
                <div className="vi-strip">{frames.map((f, i) => <img key={i} src={f.url} alt={`Frame at ${f.t.toFixed(1)} s`} title={`${f.t.toFixed(1)} s`} />)}</div>
              </details>
            )}
            <div className="export-dialog-actions">
              {play.placedObjects.length > 0 && <button className="export-save-btn" onClick={() => onOpen(play, name)}>Open on board</button>}
              {play.placedObjects.length > 0 && <button className="file-btn" onClick={() => kit.savePlayFile(play, name)}>💾 Save file</button>}
              <button className="export-cancel-btn" onClick={() => { setPhase('pick'); setResult(null) }}>Try again</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Dev-only stand-in for Claude's answer (API key "test" under `npm run dev`)
const SAMPLE_RESULT = {
  title: '4v2 Rondo',
  summary: 'Four attackers hold the outside of a square grid and keep the ball from two defenders in the middle. Attackers move to open passing angles; defenders press as a pair. Swap a defender out when they win the ball.',
  camera: 'Elevated sideline angle; the four corner cones were used to straighten the grid into a square.',
  field: 'blank',
  objects: [
    { key: 'c1', type: 'cone', color: 'orange', facing: 0, x: 0.3, y: 0.2 },
    { key: 'c2', type: 'cone', color: 'orange', facing: 0, x: 0.7, y: 0.2 },
    { key: 'c3', type: 'cone', color: 'orange', facing: 0, x: 0.7, y: 0.8 },
    { key: 'c4', type: 'cone', color: 'orange', facing: 0, x: 0.3, y: 0.8 },
    { key: 'a1', type: 'player-t1', color: 'blue', facing: 0, x: 0.5, y: 0.22 },
    { key: 'a2', type: 'player-t1', color: 'blue', facing: 0, x: 0.68, y: 0.5 },
    { key: 'a3', type: 'player-t1', color: 'blue', facing: 0, x: 0.5, y: 0.78 },
    { key: 'a4', type: 'player-t1', color: 'blue', facing: 0, x: 0.32, y: 0.5 },
    { key: 'd1', type: 'player-t2', color: 'yellow', facing: 0, x: 0.46, y: 0.44 },
    { key: 'd2', type: 'player-t2', color: 'yellow', facing: 0, x: 0.55, y: 0.56 },
    { key: 'ball', type: 'ball', color: 'default', facing: 0, x: 0.5, y: 0.26 },
  ],
  steps: [
    { note: 'A1 passes right to A2; defenders shift across.', moves: [{ key: 'ball', x: 0.64, y: 0.5 }, { key: 'd1', x: 0.55, y: 0.42 }, { key: 'd2', x: 0.6, y: 0.6 }] },
    { note: 'A3 slides to open the angle; A2 plays to A3.', moves: [{ key: 'a3', x: 0.6, y: 0.78 }, { key: 'ball', x: 0.6, y: 0.74 }, { key: 'd2', x: 0.62, y: 0.66 }] },
    { note: 'A3 switches play across to A4.', moves: [{ key: 'ball', x: 0.36, y: 0.52 }, { key: 'd1', x: 0.44, y: 0.5 }] },
  ],
  arrows: [
    { kind: 'dashed-arrow', color: 'white', x1: 0.5, y1: 0.24, x2: 0.66, y2: 0.48 },
    { kind: 'arrow', color: 'yellow', x1: 0.5, y1: 0.78, x2: 0.6, y2: 0.78 },
    { kind: 'dashed-arrow', color: 'white', x1: 0.6, y1: 0.76, x2: 0.36, y2: 0.52 },
  ],
}
