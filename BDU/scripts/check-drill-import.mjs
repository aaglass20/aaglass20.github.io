// Checks a drill import file (BDU/drill-imports/*.sql) before it is run in Supabase.
// See .claude/commands/new-bdu-drill.md.
//   node BDU/scripts/check-drill-import.mjs BDU/drill-imports/<file>.sql
// It parses the JSON between $drills$ … $drills$, checks every field against the
// bdu_drills table's rules, and looks the ids and names up in the live library
// (read-only) so a drill isn't added twice.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const CATEGORIES = ['Warmup', 'Fitness', 'Technical', 'Passing', 'Dribbling', 'Possession', 'Shooting', 'Tactical', 'Goalkeeping', 'Games', 'Scrimmage']
const FOCUS_AREAS = ['Warmup', 'Fun', 'Ball Mastery', 'Dribbling', '1v1', 'Aggression', 'Passing', 'First Touch', 'Combination Play', 'Possession', 'Numbers Up', 'Attacking', 'Finishing', 'Crossing', 'Heading', 'Defending', 'Pressing', 'Transition', 'Set Pieces', 'Goalkeeping', 'Small-Sided Game', 'Team Shape', 'Speed & Agility', 'Conditioning']
const SKILLS = ['', 'Beginner', 'Intermediate', 'Advanced']
const AGES = ['U8', 'U10', 'U12', 'U14', 'U16']
const KEYS = ['id', 'name', 'icon', 'category', 'skill_level', 'min_age', 'duration', 'players', 'description',
  'setup', 'directions', 'variations', 'coaching_points', 'equipment', 'video_file', 'video_url', 'from_hs', 'after_id', 'focus_areas', 'max_age']
const LISTS = ['setup', 'directions', 'variations', 'coaching_points', 'equipment', 'focus_areas']

const file = process.argv[2]
if (!file) { console.error('Usage: node BDU/scripts/check-drill-import.mjs <file.sql>'); process.exit(2) }
const sql = readFileSync(file, 'utf8')
const parts = sql.split('$drills$')
if (parts.length !== 3) { console.error('Expected exactly one $drills$ … $drills$ block'); process.exit(1) }
if (!/insert into bdu_drills/i.test(sql)) { console.error('Missing "insert into bdu_drills"'); process.exit(1) }

let drills
try { drills = JSON.parse(parts[1]) } catch (e) { console.error(`Not valid JSON: ${e.message}`); process.exit(1) }
if (!Array.isArray(drills) || !drills.length) { console.error('The JSON must be a non-empty array of drills'); process.exit(1) }

const problems = [], warnings = []
const ids = new Set()
drills.forEach((d, i) => {
  const who = `#${i + 1} ${d?.name ?? '(no name)'}`
  const bad = m => problems.push(`${who}: ${m}`)
  const warn = m => warnings.push(`${who}: ${m}`)
  for (const k of Object.keys(d)) if (!KEYS.includes(k)) bad(`unknown key "${k}"`)
  if (typeof d.id !== 'string' || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(d.id)) bad(`id must be kebab-case (got ${JSON.stringify(d.id)})`)
  if (ids.has(d.id)) bad('same id as an earlier drill in this file')
  ids.add(d.id)
  if (typeof d.name !== 'string' || !d.name.trim() || d.name.trim().length > 120) bad('name must be 1–120 characters')
  if (!CATEGORIES.includes(d.category)) bad(`category "${d.category}" isn't one of ${CATEGORIES.join(', ')}`)
  if (!SKILLS.includes(d.skill_level ?? '')) bad(`skill_level "${d.skill_level}" must be Beginner, Intermediate, Advanced or ""`)
  if (!AGES.includes(d.min_age)) bad(`min_age "${d.min_age}" isn't one of ${AGES.join(', ')}`)
  if (d.max_age != null && (!AGES.includes(d.max_age) || AGES.indexOf(d.max_age) < AGES.indexOf(d.min_age))) bad(`max_age "${d.max_age}" must be one of ${AGES.join(', ')} and not younger than min_age (or null for no upper limit)`)
  if (!Number.isInteger(d.duration) || d.duration < 1 || d.duration > 180) bad(`duration must be a whole number 1–180 (got ${d.duration})`)
  if (typeof d.description !== 'string' || !d.description.trim()) bad('description is missing')
  if (typeof d.players !== 'string' || !d.players.trim()) warn('players is empty')
  if (typeof d.from_hs !== 'boolean') bad('from_hs must be true or false (ask: is it from the high school program?)')
  for (const k of LISTS) {
    const v = d[k]
    if (!Array.isArray(v)) { bad(`${k} must be a list`); continue }
    v.forEach(l => {
      if (typeof l !== 'string' || !l.trim()) bad(`${k} has an empty line`)
      else if (/^([-•*]|\d+[.)])\s/.test(l.trim())) bad(`${k}: drop the list marker from "${l.slice(0, 30)}…" (the page adds bullets and numbers)`)
    })
    if (k !== 'equipment' && !v.length) bad(`${k} is empty`)
    if (k === 'focus_areas') v.forEach(f => !FOCUS_AREAS.includes(f) && bad(`focus area "${f}" isn't one of ${FOCUS_AREAS.join(', ')}`))
  }
  if (Array.isArray(d.equipment) && d.equipment.some(e => typeof e === 'string' && e.includes(','))) bad('an equipment item has a comma in it (the edit form splits on commas)')
  if (Array.isArray(d.variations) && !d.variations.some(l => /^(Easier|Harder|Ready for more|U\d+)/.test(l))) warn('variations usually start with "Easier:" / "Harder:"')
  if (d.video_file != null && (typeof d.video_file !== 'string' || /^https?:/i.test(d.video_file))) bad('video_file is a file name on the site ("name.mp4" or "tactics/name.webm"); a link goes in video_url')
  if (d.video_url != null && !/^https:\/\/\S+$/.test(d.video_url)) bad('video_url must be a full https:// link')
  if (d.video_file && d.video_url) bad('give video_file or video_url, not both')
  if (d.after_id != null && typeof d.after_id !== 'string') bad('after_id must be a drill id')
  // a younger-age version: "<Original> (U10 Version)" with id "<original id>-u10"
  const m = typeof d.name === 'string' && d.name.match(/\((U\d+) Version\)$/)
  if (m) {
    if (d.min_age !== m[1]) bad(`the name says ${m[1]} Version but min_age is ${d.min_age}`)
    if (typeof d.id === 'string' && !d.id.endsWith('-' + m[1].toLowerCase())) bad(`a ${m[1]} version's id should end in -${m[1].toLowerCase()}`)
    if (!d.after_id) warn('a younger-age version should have after_id = its original\'s id, so it sits right after it')
    if (Array.isArray(d.variations) && !d.variations.some(l => l.startsWith('Ready for more'))) warn('a younger-age version ends its variations with "Ready for more: … — the full <Original>"')
  }
})

// Is it already in the library? (read-only, with the page's own public key)
try {
  const here = dirname(fileURLToPath(import.meta.url))
  const page = readFileSync(join(here, '..', 'indy-drill-library.html'), 'utf8')
  const url = page.match(/SUPABASE_URL:\s*'([^']+)'/)?.[1]
  const key = page.match(/SUPABASE_ANON_KEY:\s*'([^']+)'/)?.[1]
  const res = await fetch(`${url}/rest/v1/bdu_drills?select=id,name`, { headers: { apikey: key, Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const live = await res.json()
  const norm = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  for (const d of drills) {
    const hit = live.find(l => l.id === d.id) ?? live.find(l => norm(l.name) === norm(d.name))
    if (hit) problems.push(`${d.name}: already in the library as "${hit.name}" (${hit.id}) — the import would skip it; edit it on the page instead`)
    if (d.after_id && !live.some(l => l.id === d.after_id) && !ids.has(d.after_id)) problems.push(`${d.name}: after_id "${d.after_id}" isn't a drill in the library or this file`)
  }
  console.log(`Checked against the ${live.length} drills in the library.`)
} catch (e) {
  warnings.push(`Couldn't check the live library for duplicates (${e.message}) — check INDY-WAY.md / the page by hand.`)
}

warnings.forEach(w => console.log('  note: ' + w))
if (problems.length) { console.error(`\n${problems.length} problem${problems.length > 1 ? 's' : ''}:\n  ` + problems.join('\n  ')); process.exit(1) }
console.log(`OK: ${drills.length} drill${drills.length > 1 ? 's' : ''} — ` + drills.map(d => `${d.name}${d.from_hs ? ' [HS]' : ''}`).join(', '))
