import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import * as db from '../lib/db.js'

const SPORTS = [
  { id: 'basketball', name: 'Basketball', icon: '🏀' },
  { id: 'softball',   name: 'Softball',   icon: '🥎' },
  { id: 'football',   name: 'Football',   icon: '🏈' },
  { id: 'pickleball', name: 'Pickleball', icon: '🏓' },
  { id: 'soccer',     name: 'Soccer',     icon: '⚽' },
  { id: 'kickball',   name: 'Kickball',   icon: '🔴' },
]

const DEFAULT_GROUPS = {
  1: ['Skills'],
  2: ['Competitive', 'Skills'],
  3: ['Competitive', 'Skills A', 'Skills B'],
  4: ['Competitive', 'Skills', 'Competitive B', 'Skills B'],
}

function fmtDate(d) {
  if (!d) return ''
  const [y, m, day] = d.split('-')
  return new Date(+y, +m - 1, +day).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

// ── Home View ──────────────────────────────────────────────────

function HomeView({ programs, locations, onOpenDashboard, onStartWizard, onDeleteSelected }) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(new Set())

  const q = search.trim().toLowerCase()
  const filtered = q
    ? programs.filter(p => p.name.toLowerCase().includes(q) || (p.sportName || '').toLowerCase().includes(q))
    : programs

  function toggleSelect(id) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  function handleDelete() {
    if (!selected.size) return
    if (!confirm(`Delete ${selected.size} program${selected.size !== 1 ? 's' : ''}? This cannot be undone.`)) return
    onDeleteSelected([...selected])
    setSelected(new Set())
  }

  if (!programs.length) {
    return (
      <div className="empty-state" data-testid="programs-empty">
        <span className="es-icon">📁</span>
        <div className="es-title">No programs yet</div>
        <div className="es-sub">Create your first program to organize practice plans by week and group.</div>
        <button className="btn-create" data-testid="create-program-btn" onClick={onStartWizard}>+ Create First Program</button>
      </div>
    )
  }

  return (
    <div data-testid="programs-home">
      <div style={{ display: 'flex', gap: '.75rem', marginBottom: '1.25rem', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text" placeholder="Search programs…"
            style={{ width: '100%', padding: '.55rem .9rem', border: '2px solid var(--gray-100)', borderRadius: 'var(--radius-sm)', fontSize: '.9rem' }}
            value={search} onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')}
              style={{ position: 'absolute', right: '.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}>
              ✕
            </button>
          )}
        </div>
        <button className="btn-create" data-testid="create-program-btn" onClick={onStartWizard}>+ New Program</button>
      </div>

      {selected.size > 0 && (
        <div style={{ background: 'var(--blue-light)', padding: '.65rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 600, color: 'var(--blue)', fontSize: '.88rem' }}>{selected.size} program{selected.size !== 1 ? 's' : ''} selected</span>
          <div style={{ display: 'flex', gap: '.5rem' }}>
            <button onClick={() => setSelected(new Set())}
              style={{ background: 'none', border: '1.5px solid var(--blue)', color: 'var(--blue)', padding: '.35rem .8rem', borderRadius: 'var(--radius-sm)', fontSize: '.82rem', fontWeight: 600, cursor: 'pointer' }}>
              Clear
            </button>
            <button onClick={handleDelete}
              style={{ background: 'var(--red)', color: '#fff', border: 'none', padding: '.35rem .8rem', borderRadius: 'var(--radius-sm)', fontSize: '.82rem', fontWeight: 600, cursor: 'pointer' }}>
              🗑 Delete
            </button>
          </div>
        </div>
      )}

      {!filtered.length ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>No programs match "{search}"</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {filtered.map(p => {
            const total = p.numWeeks * p.groups.length
            const filled = Object.keys(p.plans || {}).length
            const isChecked = selected.has(p.id)
            return (
              <div key={p.id}
                className={'prog-card' + (isChecked ? ' checked' : '')}
                style={{ background: 'var(--white)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)', padding: '1.25rem 1.4rem', cursor: 'pointer', border: isChecked ? '2px solid var(--orange)' : '2px solid transparent', position: 'relative' }}
                onClick={() => onOpenDashboard(p.id)}
              >
                <label style={{ position: 'absolute', top: '.75rem', right: '.75rem' }} onClick={e => e.stopPropagation()}>
                  <input type="checkbox" checked={isChecked} onChange={() => toggleSelect(p.id)} />
                </label>
                <div style={{ fontSize: '2rem', marginBottom: '.35rem' }}>{p.sportIcon}</div>
                <div style={{ fontWeight: 800, color: 'var(--blue)', fontSize: '1rem', marginBottom: '.4rem' }}>{p.name}</div>
                <div style={{ display: 'flex', gap: '.35rem', flexWrap: 'wrap', marginBottom: '.4rem' }}>
                  <span className="chip">{p.sportName}</span>
                  <span className="chip">{p.numWeeks} week{p.numWeeks !== 1 ? 's' : ''}</span>
                  <span className="chip">{p.groups.length} group{p.groups.length !== 1 ? 's' : ''}</span>
                </div>
                <div style={{ fontSize: '.82rem', color: 'var(--gray-400)', marginBottom: '.25rem' }}>{p.groups.join(' · ')}</div>
                <div style={{ fontSize: '.82rem', color: 'var(--orange)', fontWeight: 600 }}>{filled} / {total} plans created</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Wizard View ────────────────────────────────────────────────

function WizardView({ locations, onComplete, onCancel }) {
  const [step, setStep] = useState(1)
  const [wz, setWz] = useState({
    name: '', sport: null, locationId: null,
    numSessions: 8, datesEnabled: false, dates: {},
    groupCount: 1, groupNames: [...DEFAULT_GROUPS[1]],
  })
  const [creating, setCreating] = useState(false)

  function upd(patch) { setWz(prev => ({ ...prev, ...patch })) }

  function adjustSessions(delta) {
    const n = Math.max(1, Math.min(26, wz.numSessions + delta))
    const dates = { ...wz.dates }
    Object.keys(dates).forEach(k => { if (+k > n) delete dates[k] })
    upd({ numSessions: n, dates })
  }

  function setGroupCount(n) {
    upd({
      groupCount: n,
      groupNames: DEFAULT_GROUPS[n] ? [...DEFAULT_GROUPS[n]] : Array.from({ length: n }, (_, i) => i === 0 ? 'Competitive' : `Group ${i + 1}`)
    })
  }

  function applyCustomGroupCount(n) {
    n = Math.max(5, Math.min(10, n))
    const prev = wz.groupNames
    upd({ groupCount: n, groupNames: Array.from({ length: n }, (_, i) => prev[i] !== undefined ? prev[i] : `Group ${i + 1}`) })
  }

  function setGroupName(i, val) {
    const names = [...wz.groupNames]; names[i] = val; upd({ groupNames: names })
  }

  async function handleCreate() {
    setCreating(true)
    try {
      const weeks = Array.from({ length: wz.numSessions }, (_, i) => ({ weekNum: i + 1, date: wz.dates[i + 1] || null }))
      const saved = await db.programs.save({
        name: wz.name, sport: wz.sport.id, sportIcon: wz.sport.icon, sportName: wz.sport.name,
        locationId: wz.locationId || null, numWeeks: wz.numSessions, weeks,
        groups: [...wz.groupNames], plans: {},
      })
      onComplete(saved.id)
    } catch (err) {
      console.error('[Programs] createProgram:', err)
      alert('Could not create program — please try again.')
      setCreating(false)
    }
  }

  const canNext1 = !!(wz.name.trim() && wz.sport)
  const isCustom = wz.groupCount > 4
  const loc = wz.locationId ? locations.find(l => l.id === wz.locationId) : null
  const datesLine = wz.datesEnabled
    ? `${Object.values(wz.dates).filter(Boolean).length} of ${wz.numSessions} dates assigned`
    : 'No dates assigned — can add from dashboard'

  const dotStyle = (n) => ({
    width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: '.85rem', flexShrink: 0,
    background: n === step ? 'var(--orange)' : n < step ? 'var(--green)' : 'var(--gray-100)',
    color: n <= step ? '#fff' : 'var(--gray-400)',
  })

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }} data-testid="wizard-view">
      {/* Step dots */}
      <div style={{ display: 'flex', gap: '.5rem', marginBottom: '2.5rem', alignItems: 'center' }}>
        {[1,2,3,4].map((n, i) => (
          <React.Fragment key={n}>
            {i > 0 && <div style={{ flex: 1, height: 2, background: 'var(--gray-100)' }} />}
            <div style={dotStyle(n)}>{n < step ? '✓' : n}</div>
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Name + Sport */}
      {step === 1 && (
        <div data-testid="wizard-step-1">
          <div className="wizard-heading">Name your program</div>
          <div className="wizard-sub">Give this program a name, pick the sport, and optionally assign a location.</div>
          <label className="field-label">Program Name</label>
          <input type="text" className="field-input" placeholder="e.g. Fall 2026 Soccer" maxLength={80}
            value={wz.name} onChange={e => upd({ name: e.target.value })} />
          <label className="field-label">Sport</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '.75rem', marginBottom: '1.5rem' }}>
            {SPORTS.map(s => (
              <div key={s.id}
                data-testid={`sport-card-${s.id}`}
                style={{ background: 'var(--white)', border: `2.5px solid ${wz.sport && wz.sport.id === s.id ? 'var(--orange)' : 'var(--gray-100)'}`, borderRadius: 'var(--radius)', padding: '1rem .75rem', textAlign: 'center', cursor: 'pointer', background: wz.sport && wz.sport.id === s.id ? 'var(--orange-light)' : 'var(--white)' }}
                onClick={() => upd({ sport: s })}
              >
                <span style={{ fontSize: '1.75rem', display: 'block', marginBottom: '.4rem' }}>{s.icon}</span>
                <span style={{ fontWeight: 700, fontSize: '.88rem', color: 'var(--blue)' }}>{s.name}</span>
              </div>
            ))}
          </div>
          <label className="field-label">Location <span style={{ fontWeight: 400, color: 'var(--gray-400)' }}>(optional)</span></label>
          <select className="field-input" style={{ marginBottom: '1.5rem' }} value={wz.locationId || ''} onChange={e => upd({ locationId: e.target.value || null })}>
            <option value="">— No location assigned —</option>
            {locations.map(l => <option key={l.id} value={l.id}>{l.name}{l.address ? ' — ' + l.address : ''}</option>)}
          </select>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
            <button className="btn-wiz-back" onClick={onCancel}>← Cancel</button>
            <button className="btn-wiz-next" disabled={!canNext1} onClick={() => setStep(2)}>Next →</button>
          </div>
        </div>
      )}

      {/* Step 2: Sessions */}
      {step === 2 && (
        <div data-testid="wizard-step-2">
          <div className="wizard-heading">Sessions</div>
          <div className="wizard-sub">How many practice sessions in this program?</div>
          <label className="field-label">Number of Sessions</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <button className="stepper-btn" onClick={() => adjustSessions(-1)}>−</button>
              <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--blue)', minWidth: 32, textAlign: 'center' }}>{wz.numSessions}</span>
              <button className="stepper-btn" onClick={() => adjustSessions(1)}>+</button>
            </div>
            <span style={{ color: 'var(--gray-400)', fontSize: '.9rem' }}>session{wz.numSessions !== 1 ? 's' : ''}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1.25rem' }}>
            <input type="checkbox" id="datesToggle" checked={wz.datesEnabled} onChange={e => upd({ datesEnabled: e.target.checked })} />
            <label htmlFor="datesToggle" style={{ fontSize: '.9rem', fontWeight: 500, cursor: 'pointer' }}>Assign dates now (optional)</label>
          </div>
          {wz.datesEnabled && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '.5rem', marginBottom: '1.25rem' }}>
              {Array.from({ length: wz.numSessions }, (_, i) => (
                <div key={i + 1} style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '.85rem', color: 'var(--gray-600)', minWidth: 60 }}>Week {i + 1}</span>
                  <input type="date" value={wz.dates[i + 1] || ''} onChange={e => upd({ dates: { ...wz.dates, [i + 1]: e.target.value } })}
                    style={{ padding: '.4rem .6rem', border: '2px solid var(--gray-100)', borderRadius: 'var(--radius-sm)', fontSize: '.85rem' }} />
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
            <button className="btn-wiz-back" onClick={() => setStep(1)}>← Back</button>
            <button className="btn-wiz-next" onClick={() => setStep(3)}>Next →</button>
          </div>
        </div>
      )}

      {/* Step 3: Groups */}
      {step === 3 && (
        <div data-testid="wizard-step-3">
          <div className="wizard-heading">Groups</div>
          <div className="wizard-sub">How many groups does this program have?</div>
          <label className="field-label">Number of Groups</label>
          <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {[1,2,3,4].map(n => (
              <button key={n}
                style={{ padding: '.45rem 1rem', borderRadius: 99, border: `2px solid ${!isCustom && wz.groupCount === n ? 'var(--orange)' : 'var(--gray-100)'}`, background: !isCustom && wz.groupCount === n ? 'var(--orange)' : 'var(--white)', color: !isCustom && wz.groupCount === n ? '#fff' : 'var(--gray-600)', fontWeight: 700, cursor: 'pointer' }}
                onClick={() => setGroupCount(n)}>{n}</button>
            ))}
            <button
              style={{ padding: '.45rem 1rem', borderRadius: 99, border: `2px solid ${isCustom ? 'var(--orange)' : 'var(--gray-100)'}`, background: isCustom ? 'var(--orange)' : 'var(--white)', color: isCustom ? '#fff' : 'var(--gray-600)', fontWeight: 700, cursor: 'pointer' }}
              onClick={() => isCustom ? setGroupCount(1) : setGroupCount(5)}>Custom</button>
          </div>
          {isCustom && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '.88rem', fontWeight: 600, color: 'var(--gray-600)' }}>How many? (5–10)</span>
              <input type="number" min="5" max="10" value={wz.groupCount} onChange={e => applyCustomGroupCount(+e.target.value)}
                style={{ width: 70, padding: '.45rem .65rem', border: '2px solid var(--gray-100)', borderRadius: 'var(--radius-sm)', fontSize: '.95rem' }} />
            </div>
          )}
          <label className="field-label">Group Names</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', marginBottom: '1.5rem' }}>
            {wz.groupNames.map((name, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--orange)', color: '#fff', fontWeight: 700, fontSize: '.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                <input type="text" value={name} maxLength={40} onChange={e => setGroupName(i, e.target.value)}
                  style={{ flex: 1, padding: '.45rem .7rem', border: '2px solid var(--gray-100)', borderRadius: 'var(--radius-sm)', fontSize: '.9rem' }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn-wiz-back" onClick={() => setStep(2)}>← Back</button>
            <button className="btn-wiz-next" onClick={() => setStep(4)}>Review →</button>
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <div data-testid="wizard-step-4">
          <div className="wizard-heading">Review &amp; Create</div>
          <div className="wizard-sub">Everything look right?</div>
          {wz.sport && (
            <div style={{ background: 'var(--white)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-md)', padding: '1.75rem 2rem', marginBottom: '1.5rem', borderTop: '5px solid var(--orange)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '.35rem' }}>{wz.sport.icon}</div>
              <div style={{ fontWeight: 800, color: 'var(--blue)', fontSize: '1.15rem', marginBottom: '1rem' }}>{wz.name}</div>
              {[
                ['Sport', wz.sport.name],
                ['Location', loc ? loc.name : 'None assigned'],
                ['Sessions', String(wz.numSessions)],
                ['Dates', datesLine],
                ['Groups', wz.groupNames.join(', ')],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '.55rem 0', borderBottom: '1px solid var(--gray-100)', fontSize: '.93rem' }}>
                  <span style={{ color: 'var(--gray-400)', fontWeight: 500 }}>{label}</span>
                  <span style={{ color: 'var(--blue)', fontWeight: 700 }}>{val}</span>
                </div>
              ))}
            </div>
          )}
          <button className="btn-wiz-next" style={{ width: '100%', padding: '.85rem', marginBottom: '1rem', fontSize: '.95rem' }}
            disabled={creating} onClick={handleCreate}>
            {creating ? 'Creating…' : 'Create Program →'}
          </button>
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <button className="btn-wiz-back" onClick={() => setStep(3)}>← Back</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Dashboard View ─────────────────────────────────────────────

function DashboardView({ prog, locations, plans: allPlans, onBack, onUpdate }) {
  const [addPlanModal, setAddPlanModal] = useState(null)
  const [plansCache, setPlansCache] = useState(null)
  const [planSearch, setPlanSearch] = useState('')

  const progLoc = prog.locationId ? locations.find(l => l.id === prog.locationId) : null
  const planMap = {}
  if (allPlans) allPlans.forEach(p => { planMap[p.id] = p })

  async function openAddPlan(weekNum, group, allGroups = false) {
    if (!plansCache) {
      const loaded = await db.plans.list()
      setPlansCache(loaded)
    }
    setAddPlanModal({ weekNum, group, allGroups })
    setPlanSearch('')
  }

  async function selectPlan(planId) {
    const { weekNum, group, allGroups } = addPlanModal
    const updated = { ...prog, plans: { ...prog.plans } }
    if (allGroups) {
      prog.groups.forEach(g => { updated.plans[`w${weekNum}-${g}`] = planId })
    } else {
      updated.plans[`w${weekNum}-${group}`] = planId
    }
    await db.programs.save(updated)
    setPlansCache(null)
    setAddPlanModal(null)
    onUpdate(updated)
  }

  async function removePlan(slotKey) {
    if (!confirm('Remove this plan from the slot?')) return
    const updated = { ...prog, plans: { ...prog.plans } }
    delete updated.plans[slotKey]
    await db.programs.save(updated)
    onUpdate(updated)
  }

  const total = prog.numWeeks * prog.groups.length
  const filled = Object.keys(prog.plans || {}).length

  const filteredPlans = plansCache
    ? (() => {
        const q = planSearch.trim().toLowerCase()
        let ps = plansCache.filter(p => !p.sport || p.sport === prog.sport)
        if (q) ps = ps.filter(p => (p.name || '').toLowerCase().includes(q))
        return ps
      })()
    : []

  return (
    <div data-testid="dashboard-view">
      <div style={{ background: 'var(--white)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-md)', padding: '1.25rem 1.5rem', marginBottom: '1.5rem', borderTop: '5px solid var(--blue)', display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '2.5rem' }}>{prog.sportIcon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, color: 'var(--blue)', fontSize: '1.15rem', marginBottom: '.4rem' }}>{prog.name}</div>
          <div style={{ display: 'flex', gap: '.35rem', flexWrap: 'wrap' }}>
            <span className="chip">{prog.sportName}</span>
            {progLoc && <span className="chip">📍 {progLoc.name}</span>}
            <span className="chip">{prog.numWeeks} week{prog.numWeeks !== 1 ? 's' : ''}</span>
            <span className="chip">{prog.groups.length} group{prog.groups.length !== 1 ? 's' : ''}</span>
            <span className="chip" style={{ background: 'var(--orange-light)', color: 'var(--orange-dark)' }}>{filled} / {total} plans</span>
          </div>
        </div>
        <button className="btn-wiz-back" onClick={onBack}>← All Programs</button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table data-testid="dashboard-table" style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--white)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--gray-100)' }}>
              <th style={{ padding: '.75rem 1rem', textAlign: 'left', fontWeight: 700, fontSize: '.85rem', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Week</th>
              {prog.groups.map(g => (
                <th key={g} style={{ padding: '.75rem 1rem', textAlign: 'left', fontWeight: 700, fontSize: '.85rem', color: 'var(--blue)' }}>{g}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {prog.weeks.map(w => (
              <tr key={w.weekNum} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                <td style={{ padding: '.75rem 1rem', verticalAlign: 'top', minWidth: 120 }}>
                  <div style={{ fontWeight: 700, color: 'var(--blue)', fontSize: '.9rem' }}>Week {w.weekNum}</div>
                  {w.date && <div style={{ fontSize: '.78rem', color: 'var(--gray-400)', marginTop: '.2rem' }}>{fmtDate(w.date)}</div>}
                  {prog.groups.length > 1 && (
                    <button onClick={() => openAddPlan(w.weekNum, null, true)}
                      style={{ marginTop: '.4rem', background: 'none', border: '1.5px solid var(--blue)', color: 'var(--blue)', padding: '.25rem .6rem', borderRadius: 'var(--radius-sm)', fontSize: '.72rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      📋 Same plan for all
                    </button>
                  )}
                </td>
                {prog.groups.map(g => {
                  const key = `w${w.weekNum}-${g}`
                  const planId = (prog.plans || {})[key]
                  const plan = planId ? planMap[planId] : null
                  if (plan) {
                    const bc = (plan.blocks || []).length
                    const url = `#/practice-builder?programId=${encodeURIComponent(prog.id)}&week=${w.weekNum}&group=${encodeURIComponent(g)}&planId=${encodeURIComponent(planId)}&sport=${encodeURIComponent(prog.sport)}&programName=${encodeURIComponent(prog.name)}`
                    return (
                      <td key={g} style={{ padding: '.75rem 1rem', verticalAlign: 'top' }}>
                        <a href={url} style={{ display: 'block', fontWeight: 700, color: 'var(--blue)', fontSize: '.88rem', marginBottom: '.25rem', textDecoration: 'none' }}>✅ {plan.name || 'Untitled Plan'}</a>
                        <div style={{ display: 'flex', gap: '.35rem', marginBottom: '.25rem' }}>
                          <a href={url} style={{ fontSize: '.75rem', color: 'var(--blue)', fontWeight: 600, textDecoration: 'none' }}>👁 View</a>
                          <button onClick={() => removePlan(key)}
                            style={{ background: 'none', border: 'none', fontSize: '.75rem', color: 'var(--red)', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                            ✕ Remove
                          </button>
                        </div>
                        <div style={{ fontSize: '.75rem', color: 'var(--gray-400)' }}>{bc} block{bc !== 1 ? 's' : ''} · {plan.durationMinutes || '?'} min</div>
                      </td>
                    )
                  }
                  return (
                    <td key={g} style={{ padding: '.75rem 1rem', verticalAlign: 'top' }}>
                      <button onClick={() => openAddPlan(w.weekNum, g)}
                        style={{ border: '2px dashed var(--gray-100)', borderRadius: 'var(--radius-sm)', background: 'none', color: 'var(--gray-400)', padding: '.5rem .9rem', fontSize: '.82rem', fontWeight: 600, cursor: 'pointer', width: '100%' }}>
                        + Add Plan
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Plan Modal */}
      {addPlanModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={e => { if (e.target === e.currentTarget) setAddPlanModal(null) }}>
          <div style={{ background: 'var(--white)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: 560, maxHeight: '88vh', overflowY: 'auto' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'var(--white)' }}>
              <div style={{ fontWeight: 800, color: 'var(--blue)', fontSize: '1.05rem' }}>
                Add Plan — Week {addPlanModal.weekNum} · {addPlanModal.allGroups ? 'All Groups' : addPlanModal.group}
              </div>
              <button onClick={() => setAddPlanModal(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: 'var(--gray-400)', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: '1rem 1.5rem 0' }}>
              <input type="text" placeholder="Search existing plans…" value={planSearch} onChange={e => setPlanSearch(e.target.value)}
                style={{ width: '100%', padding: '.55rem .9rem', border: '2px solid var(--gray-100)', borderRadius: 'var(--radius-sm)', fontSize: '.9rem', marginBottom: '.75rem' }} />
            </div>
            <div style={{ padding: '0 1.5rem', maxHeight: '45vh', overflowY: 'auto' }}>
              {!plansCache ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>Loading…</div>
              ) : !filteredPlans.length ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)', fontSize: '.88rem' }}>
                  {planSearch ? `No plans match "${planSearch}".` : `No saved ${prog.sportName} plans yet.`}<br />
                  Use "Create New Plan" to build one.
                </div>
              ) : filteredPlans.map(p => {
                const bc = (p.blocks || []).length
                const parts = [p.sportName, `${bc} block${bc !== 1 ? 's' : ''}`, p.durationMinutes ? `${p.durationMinutes} min` : ''].filter(Boolean)
                return (
                  <button key={p.id} onClick={() => selectPlan(p.id)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.85rem .75rem', border: '2px solid var(--gray-100)', borderRadius: 'var(--radius-sm)', background: 'var(--gray-50)', marginBottom: '.4rem', cursor: 'pointer', textAlign: 'left' }}>
                    <span style={{ fontSize: '1.5rem' }}>{p.sportIcon || '📋'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: 'var(--blue)', fontSize: '.9rem' }}>{p.name || 'Untitled Plan'}</div>
                      <div style={{ fontSize: '.78rem', color: 'var(--gray-400)' }}>{parts.join(' · ')}</div>
                    </div>
                    <span style={{ fontSize: '.82rem', color: 'var(--orange)', fontWeight: 600 }}>Select →</span>
                  </button>
                )
              })}
            </div>
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '.8rem', color: 'var(--gray-400)' }}>{plansCache ? `${filteredPlans.length} plan${filteredPlans.length !== 1 ? 's' : ''}` : ''}</span>
              <a href={`#/practice-builder?programId=${encodeURIComponent(prog.id)}&week=${addPlanModal.weekNum}&group=${encodeURIComponent(addPlanModal.group || '')}&sport=${encodeURIComponent(prog.sport)}&programName=${encodeURIComponent(prog.name)}`}
                className="btn-wiz-next" style={{ textDecoration: 'none', padding: '.5rem 1rem', fontSize: '.85rem' }}>
                + Create New Plan
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────

export default function Programs() {
  const [searchParams] = useSearchParams()
  const [view, setView] = useState('loading')
  const [programs, setPrograms] = useState([])
  const [locations, setLocations] = useState([])
  const [plans, setPlans] = useState(null)
  const [dashProg, setDashProg] = useState(null)

  const loadData = useCallback(async () => {
    const [progs, locs] = await Promise.all([db.programs.list(), db.locations.list()])
    setPrograms(progs)
    setLocations(locs)
    return progs
  }, [])

  useEffect(() => {
    async function init() {
      const progs = await loadData()
      const openId = searchParams.get('openProgram')
      if (openId) {
        const target = progs.find(p => p.id === openId)
        if (target) {
          const pl = await db.plans.list()
          setPlans(pl)
          setDashProg(target)
          setView('dashboard')
          return
        }
      }
      setView('home')
    }
    init()
  }, [])

  async function openDashboard(progId) {
    const prog = programs.find(p => p.id === progId)
    if (!prog) return
    if (!plans) {
      const pl = await db.plans.list()
      setPlans(pl)
    }
    setDashProg(prog)
    setView('dashboard')
  }

  async function handleDeleteSelected(ids) {
    await db.programs.delete(ids)
    await loadData()
  }

  async function handleWizardComplete(progId) {
    const progs = await loadData()
    const prog = progs.find(p => p.id === progId)
    if (prog) {
      const pl = await db.plans.list()
      setPlans(pl)
      setDashProg(prog)
      setView('dashboard')
    }
  }

  function handleDashUpdate(updatedProg) {
    setDashProg(updatedProg)
    setPrograms(prev => prev.map(p => p.id === updatedProg.id ? updatedProg : p))
  }

  if (view === 'loading') {
    return (
      <main style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--gray-400)' }}>Loading…</main>
    )
  }

  return (
    <>
      <section className="hero" style={{ padding: '2.5rem 1.5rem 3rem' }}>
        <div className="hero-badge">📁 Programs</div>
        <h1 style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)' }}>Programs <span>Manager</span></h1>
        <p style={{ fontSize: '.97rem' }}>Organize your practice plans by program, week, and group.</p>
      </section>

      <div className="container-wide" style={{ maxWidth: 900, margin: '0 auto', padding: '1.5rem 1rem 4rem' }}>
        {view === 'home' && (
          <HomeView
            programs={programs}
            locations={locations}
            onOpenDashboard={openDashboard}
            onStartWizard={() => setView('wizard')}
            onDeleteSelected={handleDeleteSelected}
          />
        )}
        {view === 'wizard' && (
          <WizardView
            locations={locations}
            onComplete={handleWizardComplete}
            onCancel={() => setView('home')}
          />
        )}
        {view === 'dashboard' && dashProg && (
          <DashboardView
            prog={dashProg}
            locations={locations}
            plans={plans}
            onBack={() => setView('home')}
            onUpdate={handleDashUpdate}
          />
        )}
      </div>
    </>
  )
}
