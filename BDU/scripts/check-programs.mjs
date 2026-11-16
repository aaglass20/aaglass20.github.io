// Checks the weekly programs (BDU/scripts/indy-programs.js) against the drill library.
//   node BDU/scripts/check-programs.mjs
// Every drill id must be a drill in the library (the live table, or an import file in
// drill-imports/ that hasn't been run yet), every drill must suit the program's ages, and
// each session's minutes must add up to the program's length.
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

const here = dirname(fileURLToPath(import.meta.url))
const AGES = ['U8', 'U10', 'U12', 'U14', 'U16']
const ctx = { window: {} }
vm.runInNewContext(readFileSync(join(here, 'indy-programs.js'), 'utf8'), ctx)
const programs = ctx.window.INDY_PROGRAMS

const drills = new Map()
let source = 'import files only'
for (const f of readdirSync(join(here, '..', 'drill-imports')).filter(f => f.endsWith('.sql'))) {
  const parts = readFileSync(join(here, '..', 'drill-imports', f), 'utf8').split('$drills$')
  if (parts.length === 3) for (const d of JSON.parse(parts[1])) drills.set(d.id, { ...d, where: f })
}
const notRun = new Set(drills.keys())
try {
  const page = readFileSync(join(here, '..', 'indy-drill-library.html'), 'utf8')
  const url = page.match(/SUPABASE_URL:\s*'([^']+)'/)?.[1], key = page.match(/SUPABASE_ANON_KEY:\s*'([^']+)'/)?.[1]
  const res = await fetch(`${url}/rest/v1/bdu_drills?select=*`, { headers: { apikey: key, Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const live = await res.json()
  for (const d of live) { drills.set(d.id, { ...d, where: 'library' }); notRun.delete(d.id) }
  source = `${live.length} drills in the library + import files`
} catch (e) { console.log(`  note: couldn't read the live library (${e.message})`) }

const problems = [], pending = new Set(), ids = new Set()
let sessions = 0
for (const p of programs) {
  const bad = m => problems.push(`${p.id}: ${m}`)
  if (ids.has(p.id)) bad('same id as another program'); ids.add(p.id)
  if (!p.title || !p.focus || !p.goal) bad('needs a title, focus and goal')
  if (!Array.isArray(p.ages) || !p.ages.length || p.ages.some(a => !AGES.includes(a))) bad(`ages must be from ${AGES.join(', ')}`)
  p.weeks.forEach((w, i) => {
    sessions++
    const at = `week ${i + 1}`
    for (const k of ['theme', 'objective', 'twist', 'check']) if (!w[k]) bad(`${at}: ${k} is missing`)
    if (!Array.isArray(w.keys) || w.keys.length < 2) bad(`${at}: needs at least 2 coaching keys`)
    const total = w.blocks.reduce((n, b) => n + b[2], 0)
    if (total !== p.minutes) bad(`${at}: blocks add up to ${total} min, not ${p.minutes}`)
    if (w.blocks[0][0] !== 'warmup') bad(`${at}: should start with a warmup`)
    if (w.blocks.at(-1)[0] !== 'closing') bad(`${at}: should end with the closing huddle`)
    for (const [type, id] of w.blocks) {
      if (type === 'break' || type === 'closing') continue
      const d = drills.get(id)
      if (!d) { bad(`${at}: no drill "${id}" in the library or the import files`); continue }
      if (notRun.has(id)) pending.add(d.where)
      for (const age of p.ages) {
        const lo = AGES.indexOf(d.min_age), hi = d.max_age ? AGES.indexOf(d.max_age) : AGES.length - 1
        if (AGES.indexOf(age) < lo || AGES.indexOf(age) > hi) bad(`${at}: "${d.name}" is ${d.min_age}${d.max_age ? '–' + d.max_age : '+'}, not for ${age}`)
      }
    }
  })
}
// Season plans (scripts/indy-seasons.js): every block names two programs that exist and suit the age
const sctx = { window: {} }
vm.runInNewContext(readFileSync(join(here, 'indy-seasons.js'), 'utf8'), sctx)
const seasons = sctx.window.INDY_SEASONS
const byId = new Map(programs.map(p => [p.id, p]))
for (const s of seasons) {
  const bad = m => problems.push(`season ${s.age}: ${m}`)
  if (s.blocks.length !== 6) bad(`has ${s.blocks.length} blocks, not 6`)
  const used = new Set()
  const need = (id, where) => {
    const p = byId.get(id)
    if (!p) return bad(`${where}: no program "${id}"`)
    if (!p.ages.includes(s.age)) bad(`${where}: "${p.title}" is for ${p.ages.join(', ')}, not ${s.age}`)
    used.add(id)
  }
  s.blocks.forEach((b, i) => { need(b.a, `block ${i + 1} session A`); need(b.b, `block ${i + 1} session B`); if (b.a === b.b) bad(`block ${i + 1}: the same program twice`); if (!b.why) bad(`block ${i + 1}: why is missing`) })
  need(s.keeperProgram, 'keeper program')
  if (s.keeperBlocks.some(n => n < 1 || n > 6)) bad('keeperBlocks must be 1–6')
  const left = programs.filter(p => p.ages.includes(s.age) && !used.has(p.id)).map(p => p.title)
  if (left.length) console.log(`  note: season ${s.age} doesn't use: ${left.join(', ')}`)
}
console.log(`Checked ${programs.length} programs, ${sessions} sessions and ${seasons.length} season plans, against ${source}.`)
if (pending.size) console.log(`  note: some drills aren't in the library yet — run: ${[...pending].join(', ')}`)
if (problems.length) { console.error(`\n${problems.length} problem${problems.length > 1 ? 's' : ''}:\n  ` + problems.join('\n  ')); process.exit(1) }
console.log('OK')
