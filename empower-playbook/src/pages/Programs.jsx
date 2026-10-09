import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import * as db from '../lib/db.js'
import PracticeBuilder from './PracticeBuilder.jsx'

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
  const [setupOpen, setSetupOpen] = useState(false)

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
      <div className="pg-header">
        <div>
          <div className="pg-title">My Programs</div>
          <div className="pg-sub">Create a program to manage plans across all groups and weeks.</div>
        </div>
        <div className="hdr-actions">
          <div className="setup-wrap">
            <button className="btn-setup" onClick={() => setSetupOpen(o => !o)}>⚙️ Setup {setupOpen ? '▴' : '▾'}</button>
            {setupOpen && (
              <div className="setup-menu">
                <a href="#/locations" onClick={() => setSetupOpen(false)}>📍 Locations</a>
                <a href="#/plan-library" onClick={() => setSetupOpen(false)}>📚 Plans</a>
                <hr className="setup-menu-divider" />
                <a href="#/drill-admin" onClick={() => setSetupOpen(false)}>🗂️ Drill Library</a>
              </div>
            )}
          </div>
          <button className="btn-create" data-testid="create-program-btn" onClick={onStartWizard}>+ New Program</button>
        </div>
      </div>

      <div className="prog-search-row">
        <div className="prog-search-wrap">
          <span className="prog-search-icon">🔍</span>
          <input
            type="text" placeholder="Search programs…"
            className="prog-search-input"
            value={search} onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="prog-search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>
      </div>

      {selected.size > 0 && (
        <div className="prog-selection-bar">
          <span className="prog-sel-count">{selected.size} program{selected.size !== 1 ? 's' : ''} selected</span>
          <div className="prog-sel-actions">
            <button className="btn-sel-clear" onClick={() => setSelected(new Set())}>Clear</button>
            <button className="btn-sel-delete" onClick={handleDelete}>🗑 Delete</button>
          </div>
        </div>
      )}

      {!filtered.length ? (
        <div className="no-results">No programs match "{search}"</div>
      ) : (
        <div className="progs-grid">
          {filtered.map(p => {
            const total = p.numWeeks * p.groups.length
            const filled = Object.keys(p.plans || {}).length
            const isChecked = selected.has(p.id)
            return (
              <div key={p.id}
                className={`prog-card${isChecked ? ' checked' : ''}`}
                onClick={() => onOpenDashboard(p.id)}
              >
                <label className="prog-card-cb" onClick={e => e.stopPropagation()}>
                  <input type="checkbox" checked={isChecked} onChange={() => toggleSelect(p.id)} />
                </label>
                <div className="prog-card-sport">{p.sportIcon}</div>
                <div className="prog-card-name">{p.name}</div>
                <div className="prog-card-chips">
                  <span className="chip">{p.sportName}</span>
                  <span className="chip">{p.numWeeks} week{p.numWeeks !== 1 ? 's' : ''}</span>
                  <span className="chip">{p.groups.length} group{p.groups.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="prog-card-groups">{p.groups.join(' · ')}</div>
                <div className="prog-card-progress">{filled} / {total} plans created</div>
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

  return (
    <div className="wz-wrap" data-testid="wizard-view">
      <div className="wz-steps">
        {[1,2,3,4].map((n, i) => (
          <React.Fragment key={n}>
            {i > 0 && <div className="wz-line" />}
            <div className={`wz-dot${n === step ? ' active' : ''}${n < step ? ' done' : ''}`}>
              {n < step ? '✓' : n}
            </div>
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
          <div className="sessions-row">
            <div className="stepper">
              <button className="stepper-btn" onClick={() => adjustSessions(-1)}>−</button>
              <span className="stepper-val">{wz.numSessions}</span>
              <button className="stepper-btn" onClick={() => adjustSessions(1)}>+</button>
            </div>
            <span className="sessions-label">session{wz.numSessions !== 1 ? 's' : ''}</span>
          </div>
          <div className="toggle-row">
            <label className="toggle-sw">
              <input type="checkbox" checked={wz.datesEnabled} onChange={e => upd({ datesEnabled: e.target.checked })} />
              <span className="toggle-track" />
              <span className="toggle-thumb" />
            </label>
            <span className="toggle-label">Assign dates now (optional)</span>
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
          <div className="gc-pills">
            {[1,2,3,4].map(n => (
              <button key={n}
                className={`gc-pill${!isCustom && wz.groupCount === n ? ' selected' : ''}`}
                onClick={() => setGroupCount(n)}>{n}</button>
            ))}
            <button
              className={`gc-pill${isCustom ? ' selected' : ''}`}
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
          <div className="group-names-editor">
            {wz.groupNames.map((name, i) => (
              <div key={i} className="gn-row">
                <span className="gn-badge">{i + 1}</span>
                <input type="text" className="gn-input" value={name} maxLength={40} onChange={e => setGroupName(i, e.target.value)} />
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
            <div className="review-card">
              <div className="rv-sport">{wz.sport.icon}</div>
              <div className="rv-name">{wz.name}</div>
              <div className="rv-rows">
                {[
                  ['Sport', wz.sport.name],
                  ['Location', loc ? loc.name : 'None assigned'],
                  ['Sessions', String(wz.numSessions)],
                  ['Dates', datesLine],
                  ['Groups', wz.groupNames.join(', ')],
                ].map(([label, val]) => (
                  <div key={label} className="rv-row">
                    <span className="rv-label">{label}</span>
                    <span className="rv-val">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <button className="btn-create-prog" disabled={creating} onClick={handleCreate}>
            {creating ? 'Creating…' : 'Create Program →'}
          </button>
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '1rem' }}>
            <button className="btn-wiz-back" onClick={() => setStep(3)}>← Back</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Dashboard View ─────────────────────────────────────────────

function DashboardView({ prog, locations, plans: allPlans, onBack, onUpdate, onEditPlan }) {
  const navigate = useNavigate()
  const [addPlanModal, setAddPlanModal] = useState(null)
  const [plansCache, setPlansCache] = useState(null)
  const [planSearch, setPlanSearch] = useState('')
  const [viewPlan, setViewPlan] = useState(null)
  const [vpOpen, setVpOpen] = useState(false)

  useEffect(() => {
    if (viewPlan) requestAnimationFrame(() => setVpOpen(true))
  }, [viewPlan])

  function closeVp() {
    setVpOpen(false)
    setTimeout(() => setViewPlan(null), 320)
  }

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
      <div className="dash-prog-header">
        <div className="dash-prog-sport">{prog.sportIcon}</div>
        <div className="dash-prog-info">
          <div className="dash-prog-name">{prog.name}</div>
          <div className="dash-chips">
            <span className="chip">{prog.sportName}</span>
            {progLoc && <span className="chip">📍 {progLoc.name}</span>}
            <span className="chip">{prog.numWeeks} week{prog.numWeeks !== 1 ? 's' : ''}</span>
            <span className="chip">{prog.groups.length} group{prog.groups.length !== 1 ? 's' : ''}</span>
            <span className="chip orange">{filled} / {total} plans</span>
          </div>
        </div>
        <button className="btn-dash-back" onClick={onBack}>← All Programs</button>
      </div>

      <div className="dash-grid-wrap">
        <table data-testid="dashboard-table" className="dash-tbl">
          <thead>
            <tr>
              <th>Week</th>
              {prog.groups.map(g => <th key={g}>{g}</th>)}
            </tr>
          </thead>
          <tbody>
            {prog.weeks.map(w => (
              <tr key={w.weekNum}>
                <td>
                  <div className="wk-label">Week {w.weekNum}</div>
                  {w.date && <div className="wk-date">{fmtDate(w.date)}</div>}
                  {prog.groups.length > 1 && (
                    <button className="btn-all-groups" onClick={() => openAddPlan(w.weekNum, null, true)}>
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
                    const editPath = `/practice-builder?programId=${encodeURIComponent(prog.id)}&week=${w.weekNum}&group=${encodeURIComponent(g)}&planId=${encodeURIComponent(planId)}&sport=${encodeURIComponent(prog.sport)}&programName=${encodeURIComponent(prog.name)}`
                    return (
                      <td key={g}>
                        <button className="plan-ready" onClick={() => setViewPlan({ ...plan, _editPath: editPath })}>
                          ✅ {plan.name || 'Untitled Plan'}
                        </button>
                        <div className="plan-cell-actions">
                          <button className="pca-btn" onClick={() => setViewPlan({ ...plan, _editPath: editPath })}>👁 View</button>
                          <button className="pca-btn pca-remove" onClick={() => removePlan(key)}>✕ Remove</button>
                        </div>
                        <div className="plan-meta">{bc} block{bc !== 1 ? 's' : ''} · {plan.durationMinutes || '?'} min</div>
                      </td>
                    )
                  }
                  return (
                    <td key={g}>
                      <button className="plan-empty" onClick={() => openAddPlan(w.weekNum, g)}>+ Add Plan</button>
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

      {/* Plan preview slide-in panel */}
      {viewPlan && (
        <div className={`view-overlay${vpOpen ? ' open' : ''}`} style={{ zIndex: 401 }}
          onClick={e => { if (e.target === e.currentTarget) closeVp() }}>
          <div className="view-panel">
            <div className="plan-view-header">
              <span className="view-header-icon">
                {SPORTS.find(s => s.id === (viewPlan.sport || prog.sport))?.icon || prog.sportIcon || '📋'}
              </span>
              <div className="view-header-info">
                <div className="view-header-name">{viewPlan.name || 'Untitled Plan'}</div>
                <div className="view-header-meta">
                  {prog.sportName} · {viewPlan.durationMinutes || 75} min · {(viewPlan.blocks || []).length} blocks
                  {viewPlan.hasWarmup ? ' · Warmup included' : ''}
                </div>
              </div>
              <button className="view-close" onClick={closeVp} aria-label="Close">✕</button>
            </div>
            <div className="view-scroll-body">
              {!(viewPlan.blocks || []).length
                ? <div className="vb-empty">📋 This plan has no blocks yet.</div>
                : (viewPlan.blocks || []).map((block, i) => {
                    const blockIcon = block.type === 'rotation' ? '🔄' : (block.icon || '📌')
                    return (
                      <div key={i} className={`vb-block type-${block.type}`}>
                        <span className="vb-icon">{blockIcon}</span>
                        <div className="vb-body">
                          <div className="vb-name-row">
                            <div className="vb-name">{block.name}</div>
                            <span className="vb-dur">{block.durationMinutes} min</span>
                          </div>
                          {block.type === 'rotation' && (block.drills || []).length > 0 && (
                            <div className="vb-stations">
                              {(block.drills || []).map((d, di) => (
                                <div key={di} className="vb-station">
                                  <div className="vb-station-title">
                                    <span>{d.icon || '🏃'} {d.name}</span>
                                    <span>{block.timePerDrill} min</span>
                                  </div>
                                  {d.description && <div className="vb-desc" style={{ fontSize: '.78rem' }}>{d.description}</div>}
                                  {d.steps && d.steps.length > 0 && (
                                    <ul className="vb-steps">{d.steps.map((s, si) => <li key={si}><span className="si">{s.icon || '▸'}</span>{s.text}</li>)}</ul>
                                  )}
                                  {d.volunteerTip && <div className="vb-tip vb-tip-vol">🙌 <span>{d.volunteerTip}</span></div>}
                                </div>
                              ))}
                            </div>
                          )}
                          {block.type !== 'rotation' && (
                            <>
                              {block.description && <div className="vb-desc">{block.description}</div>}
                              {block.steps && block.steps.length > 0 && (
                                <ul className="vb-steps">{block.steps.map((s, si) => <li key={si}><span className="si">{s.icon || '▸'}</span>{s.text}</li>)}</ul>
                              )}
                              {block.why && <div className="vb-tip vb-tip-why">🤔 <span>{block.why}</span></div>}
                              {block.volunteerTip && <div className="vb-tip vb-tip-vol">🙌 <span>{block.volunteerTip}</span></div>}
                              {block.facilitatorTip && <div className="vb-tip vb-tip-fac">💡 <span>{block.facilitatorTip}</span></div>}
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })
              }
            </div>
            <div className="view-actions">
              <button className="view-btn-edit" onClick={() => { closeVp(); onEditPlan && onEditPlan(viewPlan.id) }}>✏️ Edit Plan</button>
              <button className="view-btn-copy" onClick={closeVp}>← Back</button>
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
  const [dashOpen, setDashOpen] = useState(false)
  const [editPlanId, setEditPlanId] = useState(null)
  const [editOverlayOpen, setEditOverlayOpen] = useState(false)

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

  useEffect(() => {
    if (view === 'dashboard') requestAnimationFrame(() => setDashOpen(true))
  }, [view])

  useEffect(() => {
    if (editPlanId) requestAnimationFrame(() => setEditOverlayOpen(true))
  }, [editPlanId])

  async function openDashboard(progId) {
    const prog = programs.find(p => p.id === progId)
    if (!prog) return
    if (!plans) {
      const pl = await db.plans.list()
      setPlans(pl)
    }
    setDashProg(prog)
    setDashOpen(false)
    setView('dashboard')
  }

  function closeDash() {
    setDashOpen(false)
    setTimeout(() => {
      setDashProg(null)
      setView('home')
    }, 320)
  }

  function openEditOverlay(planId) {
    setEditPlanId(planId)
  }

  function closeEditOverlay() {
    setEditOverlayOpen(false)
    setTimeout(() => setEditPlanId(null), 320)
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
      setDashOpen(false)
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
        {(view === 'home' || view === 'dashboard') && (
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
      </div>

      {/* Program dashboard slide-in panel */}
      {dashProg && (
        <div className={`view-overlay${dashOpen ? ' open' : ''}`}
          onClick={e => { if (e.target === e.currentTarget) closeDash() }}>
          <div className="view-panel prog-dash-panel">
            <div className="prog-dash-scroll">
              <DashboardView
                prog={dashProg}
                locations={locations}
                plans={plans}
                onBack={closeDash}
                onUpdate={handleDashUpdate}
                onEditPlan={openEditOverlay}
              />
            </div>
          </div>
        </div>
      )}

      {/* Practice Builder overlay */}
      {editPlanId && (
        <div className={`pb-overlay${editOverlayOpen ? ' open' : ''}`}>
          <div className="pb-overlay-scroll">
            <PracticeBuilder initPlanId={editPlanId} onExit={closeEditOverlay} />
          </div>
        </div>
      )}
    </>
  )
}
