import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://fpnmnlrwhwnuefbnehuf.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_NXTAP09deRk87WsP_KdyXg_e1k2Dsih'

let _sb = null
function getSb() {
  if (_sb) return _sb
  try {
    const fetchWithTimeout = (url, options) => {
      const ctrl = new AbortController()
      const tid = setTimeout(() => ctrl.abort(), 4000)
      return fetch(url, { ...options, signal: ctrl.signal }).finally(() => clearTimeout(tid))
    }
    _sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { fetch: fetchWithTimeout } })
    return _sb
  } catch { return null }
}

function lsLoad(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)) }
  catch { return fallback }
}
function lsSave(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) }
  catch (e) { console.error('[db] localStorage write failed:', e) }
}
function lsGenId(prefix) {
  return (prefix || 'id') + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)
}
function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key]; if (!acc[k]) acc[k] = []; acc[k].push(item); return acc
  }, {})
}

// ── Locations ──────────────────────────────────────────────────

function rowToLocation(r) {
  return { id: r.id, name: r.name, address: r.address || '', lat: r.lat || null, lon: r.lon || null, notes: r.notes || '', image: r.image_data || null, createdAt: r.created_at }
}
function locationToRow(l, isNew) {
  const row = { name: l.name, address: l.address || null, lat: l.lat || null, lon: l.lon || null, notes: l.notes || null, image_data: l.image || null }
  if (!isNew && l.id) row.id = l.id
  return row
}

function lsListLocations() { return lsLoad('empowerLocations', []) }
function lsSaveLocation(loc) {
  const arr = lsListLocations()
  if (loc.id) { const i = arr.findIndex(l => l.id === loc.id); if (i >= 0) arr[i] = loc; else arr.unshift(loc) }
  else { loc.id = lsGenId('loc'); arr.unshift(loc) }
  lsSave('empowerLocations', arr); return loc
}

export const locations = {
  async list() {
    const sb = getSb()
    if (!sb) return lsListLocations()
    const { data, error } = await sb.from('ep_locations').select('*').order('created_at', { ascending: false })
    if (error) { console.warn('[db] locations.list:', error); return lsListLocations() }
    return data.map(rowToLocation)
  },
  async save(loc) {
    const sb = getSb()
    if (!sb) return lsSaveLocation({ ...loc })
    if (loc.id) {
      const { data, error } = await sb.from('ep_locations').update(locationToRow(loc, false)).eq('id', loc.id).select().single()
      if (error) { console.warn('[db] locations.update:', error); return lsSaveLocation({ ...loc }) }
      return rowToLocation(data)
    } else {
      const { data, error } = await sb.from('ep_locations').insert(locationToRow(loc, true)).select().single()
      if (error) { console.warn('[db] locations.insert:', error); return lsSaveLocation({ ...loc }) }
      return rowToLocation(data)
    }
  },
  async delete(id) {
    const sb = getSb()
    if (!sb) { lsSave('empowerLocations', lsListLocations().filter(l => l.id !== id)); return }
    const { error } = await sb.from('ep_locations').delete().eq('id', id)
    if (error) { console.warn('[db] locations.delete:', error); lsSave('empowerLocations', lsListLocations().filter(l => l.id !== id)) }
  },
}

// ── Programs ───────────────────────────────────────────────────

function rowToProgram(progRow, weekRows) {
  return {
    id: progRow.id, name: progRow.name, sport: progRow.sport,
    sportIcon: progRow.sport_icon || '', sportName: progRow.sport_name || progRow.sport,
    locationId: progRow.location_id || null, numWeeks: progRow.num_weeks,
    groups: progRow.groups || [],
    weeks: (weekRows || []).sort((a, b) => a.week_num - b.week_num).map(w => ({ weekNum: w.week_num, date: w.session_date || null })),
    plans: progRow.slot_plans || {}, createdAt: progRow.created_at,
  }
}

function lsListPrograms() { return lsLoad('empowerPrograms', []) }
function lsSaveProgram(prog) {
  const arr = lsListPrograms()
  if (prog.id) { const i = arr.findIndex(p => p.id === prog.id); if (i >= 0) arr[i] = prog; else arr.unshift(prog) }
  else { prog.id = lsGenId('prog'); arr.unshift(prog) }
  lsSave('empowerPrograms', arr); return prog
}

export const programs = {
  async list() {
    const sb = getSb()
    if (!sb) return lsListPrograms()
    const { data: progRows, error } = await sb.from('ep_programs').select('*').order('created_at', { ascending: false })
    if (error) { console.warn('[db] programs.list:', error); return lsListPrograms() }
    const progIds = progRows.map(p => p.id)
    const { data: weekData } = await sb.from('ep_program_weeks').select('*').in('program_id', progIds)
    const weeksByProg = groupBy(weekData || [], 'program_id')
    return progRows.map(r => rowToProgram(r, weeksByProg[r.id]))
  },
  async save(prog) {
    const sb = getSb()
    if (!sb) return lsSaveProgram({ ...prog })
    const progRow = { name: prog.name, sport: prog.sport, sport_icon: prog.sportIcon || null, sport_name: prog.sportName || null, location_id: prog.locationId || null, num_weeks: prog.numWeeks, groups: prog.groups, slot_plans: prog.plans || {} }
    let savedId = prog.id
    if (prog.id) {
      const { error } = await sb.from('ep_programs').update(progRow).eq('id', prog.id)
      if (error) { console.warn('[db] programs.update:', error); return lsSaveProgram({ ...prog }) }
    } else {
      const { data, error } = await sb.from('ep_programs').insert(progRow).select().single()
      if (error) { console.warn('[db] programs.insert:', error); return lsSaveProgram({ ...prog }) }
      savedId = data.id
    }
    await sb.from('ep_program_weeks').delete().eq('program_id', savedId)
    if (prog.weeks && prog.weeks.length) {
      const weekRows = prog.weeks.map(w => ({ program_id: savedId, week_num: w.weekNum, session_date: w.date || null }))
      const { error: wErr } = await sb.from('ep_program_weeks').insert(weekRows)
      if (wErr) console.warn('[db] program_weeks.insert:', wErr)
    }
    return { ...prog, id: savedId }
  },
  async delete(ids) {
    const idArr = Array.isArray(ids) ? ids : [ids]
    const sb = getSb()
    if (!sb) { lsSave('empowerPrograms', lsListPrograms().filter(p => !idArr.includes(p.id))); return }
    const { error } = await sb.from('ep_programs').delete().in('id', idArr)
    if (error) { console.warn('[db] programs.delete:', error); lsSave('empowerPrograms', lsListPrograms().filter(p => !idArr.includes(p.id))) }
  },
}

// ── Plans ──────────────────────────────────────────────────────

function rowToPlan(r) {
  return {
    id: r.id, name: r.name || '', programId: r.program_id || null, weekNum: r.week_num || null,
    group: r.group_name || null, sport: r.sport, sportIcon: r.sport_icon || '', sportName: r.sport_name || r.sport,
    durationMinutes: r.duration_minutes, hasWarmup: r.has_warmup, blocks: r.blocks || [],
    createdAt: r.created_at, updatedAt: r.updated_at,
  }
}

function lsGetPlan(id) { return (lsLoad('empowerPlans', {}))[id] || null }
function lsListPlans() { return Object.values(lsLoad('empowerPlans', {})).sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')) }
function lsSavePlanToLs(plan) {
  const all = lsLoad('empowerPlans', {}); all[plan.id] = plan; lsSave('empowerPlans', all)
  if (plan.programId) {
    const progs = lsListPrograms(); const p = progs.find(x => x.id === plan.programId)
    if (p) { if (!p.plans) p.plans = {}; p.plans[`w${plan.weekNum}-${plan.group}`] = plan.id; lsSave('empowerPrograms', progs) }
  }
  return plan
}

export const plans = {
  async list() {
    const sb = getSb()
    if (!sb) return lsListPlans()
    const { data, error } = await sb.from('ep_plans').select('*').order('updated_at', { ascending: false })
    if (error) { console.warn('[db] plans.list:', error); return lsListPlans() }
    return data.map(rowToPlan)
  },
  async get(planId) {
    const sb = getSb()
    if (!sb) return lsGetPlan(planId)
    const { data, error } = await sb.from('ep_plans').select('*').eq('id', planId).single()
    if (error) { console.warn('[db] plans.get:', error); return lsGetPlan(planId) }
    return rowToPlan(data)
  },
  async save(plan) {
    const sb = getSb()
    if (!sb) {
      if (!plan.id) plan.id = lsGenId('plan')
      return lsSavePlanToLs({ ...plan })
    }
    const row = { name: plan.name || null, program_id: plan.programId || null, week_num: plan.weekNum || null, group_name: plan.group || null, sport: plan.sport, sport_icon: plan.sportIcon || null, sport_name: plan.sportName || null, duration_minutes: plan.durationMinutes || 75, has_warmup: plan.hasWarmup ?? true, blocks: plan.blocks || [] }
    if (plan.id) {
      const { data, error } = await sb.from('ep_plans').update(row).eq('id', plan.id).select().single()
      if (error) { console.warn('[db] plans.update:', error); return lsSavePlanToLs({ ...plan }) }
      return rowToPlan(data)
    } else {
      const { data, error } = await sb.from('ep_plans').insert(row).select().single()
      if (error) { console.warn('[db] plans.insert:', error); return lsSavePlanToLs({ ...plan }) }
      return rowToPlan(data)
    }
  },
  async delete(id) {
    const sb = getSb()
    if (!sb) { const all = lsLoad('empowerPlans', {}); delete all[id]; lsSave('empowerPlans', all); return }
    const { error } = await sb.from('ep_plans').delete().eq('id', id)
    if (error) { console.warn('[db] plans.delete:', error); const all = lsLoad('empowerPlans', {}); delete all[id]; lsSave('empowerPlans', all) }
  },
}

// ── Drills (custom) ────────────────────────────────────────────

function rowToDrill(r) {
  return { id: r.id, sport: r.sport, category: r.category || '', icon: r.icon || '⚽', name: r.name, description: r.description || '', steps: r.steps || [], equipment: r.equipment || [], why: r.purpose || '', volunteerTip: r.volunteer_tip || '', facilitatorTip: r.facilitator_tip || '', defaultTime: r.default_time || 12, source: r.source || 'user', videoUrl: r.video_url || '' }
}
function drillToRow(d) {
  const row = { sport: d.sport, category: d.category || null, icon: d.icon || null, name: d.name, description: d.description || null, steps: d.steps || [], equipment: d.equipment || [], purpose: d.why || null, volunteer_tip: d.volunteerTip || null, facilitator_tip: d.facilitatorTip || null, default_time: d.defaultTime || 12, source: d.source || 'user', video_url: d.videoUrl || null }
  if (d.id) row.id = d.id
  return row
}
function lsListDrills() { return lsLoad('empowerDrillBank', []) }

export const drills = {
  async list(sport) {
    const sb = getSb()
    if (!sb) { const all = lsListDrills(); return sport ? all.filter(d => d.sport === sport) : all }
    let q = sb.from('ep_drills').select('*').order('created_at', { ascending: true })
    if (sport) q = q.eq('sport', sport)
    const { data, error } = await q
    if (error) { console.warn('[db] drills.list:', error); return lsListDrills() }
    return data.map(rowToDrill)
  },
  async save(drill) {
    const sb = getSb()
    if (!sb) {
      const arr = lsListDrills()
      if (drill.id) { const i = arr.findIndex(d => d.id === drill.id); if (i >= 0) arr[i] = drill; else arr.push(drill) }
      else { drill.id = lsGenId('drill'); arr.push(drill) }
      lsSave('empowerDrillBank', arr); return drill
    }
    const row = drillToRow(drill)
    const { data, error } = await sb.from('ep_drills').upsert(row, { onConflict: 'id' }).select().single()
    if (error) { console.warn('[db] drills.save:', error); return drill }
    return rowToDrill(data)
  },
  async delete(id) {
    const sb = getSb()
    lsSave('empowerDrillBank', lsListDrills().filter(d => d.id !== id))
    if (!sb) return
    const { error } = await sb.from('ep_drills').delete().eq('id', id)
    if (error) console.warn('[db] drills.delete:', error)
  },
}
