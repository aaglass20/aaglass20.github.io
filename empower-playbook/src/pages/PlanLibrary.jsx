import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { plans, socialStories } from '../lib/db.js'
import { DRILL_EQUIPMENT } from '../data/practiceBuilderData.js'
import PracticeBuilder from './PracticeBuilder.jsx'
import SocialStory from './SocialStory.jsx'

const SPORTS = [
  { id: 'soccer',     name: 'Soccer',     icon: '⚽' },
  { id: 'basketball', name: 'Basketball', icon: '🏀' },
  { id: 'softball',   name: 'Softball',   icon: '🥎' },
  { id: 'football',   name: 'Football',   icon: '🏈' },
  { id: 'pickleball', name: 'Pickleball', icon: '🏓' },
  { id: 'kickball',   name: 'Kickball',   icon: '🔴' },
]

function relativeDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const diffDays = Math.floor((Date.now() - d) / 86400000)
  if (diffDays === 0) return 'Updated today'
  if (diffDays === 1) return 'Updated yesterday'
  if (diffDays < 7) return `Updated ${diffDays} days ago`
  return 'Updated ' + d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: diffDays > 365 ? 'numeric' : undefined })
}

export default function PlanLibrary() {
  const navigate = useNavigate()
  const [allPlans, setAllPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterSport, setFilterSport] = useState('all')
  const [search, setSearch] = useState('')
  const [viewPlan, setViewPlan] = useState(null)
  const [viewOpen, setViewOpen] = useState(false)
  const [editPlanId, setEditPlanId] = useState(null)
  const [editOverlayOpen, setEditOverlayOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [showTips, setShowTips] = useState(true)
  const [showEquipment, setShowEquipment] = useState(true)
  const [ssOverlayPlanId, setSsOverlayPlanId] = useState(null)
  const [ssOverlayOpen, setSsOverlayOpen] = useState(false)
  const editReturnPlanIdRef = useRef(null)
  const ssReturnPlanIdRef = useRef(null)

  function collectViewEquipment(blocks) {
    const items = new Set()
    ;(blocks || []).forEach(block => {
      if (block.type === 'rotation') {
        (block.drills || []).forEach(d => {
          const eq = (d.equipment && d.equipment.length) ? d.equipment : (DRILL_EQUIPMENT[d.id] || [])
          eq.forEach(e => items.add(e))
        })
      } else {
        const eq = (block.equipment && block.equipment.length) ? block.equipment : (DRILL_EQUIPMENT[block.drillId] || [])
        eq.forEach(e => items.add(e))
      }
    })
    return [...items].sort((a, b) => a.replace(/^[\W]+/, '').localeCompare(b.replace(/^[\W]+/, '')))
  }

  function printViewPlan(p) {
    const sport = SPORTS.find(s => s.id === p.sport) || { icon: '⚽', name: p.sport }
    const equipItems = collectViewEquipment(p.blocks)
    function blockHtml(block) {
      const colors = { warmup: '#f97316', drill: '#2563eb', rotation: '#7c3aed', break: '#0d9488', closing: '#16a34a' }
      const c = colors[block.type] || '#374151'
      let inner = ''
      if (block.type === 'rotation') {
        inner = (block.drills || []).map(d => {
          let dInner = `<div style="margin:.4rem 0;padding:.4rem .6rem;border-left:3px solid #7c3aed;"><strong>${d.icon || '🏃'} ${d.name}</strong> — ${block.timePerDrill} min<br/><small>${d.description || ''}</small>`
          if (showTips && d.why) dInner += `<br/><small style="color:#555;"><em>🤔 ${d.why}</em></small>`
          if (showTips && d.volunteerTip) dInner += `<br/><small style="color:#555;"><em>🙌 ${d.volunteerTip}</em></small>`
          return dInner + '</div>'
        }).join('')
      } else {
        if (block.steps && block.steps.length) inner = '<ul style="margin:.3rem 0 0;padding-left:1.2rem;">' + block.steps.map(s => `<li>${s.icon || ''} ${s.text}</li>`).join('') + '</ul>'
        else if (block.description) inner = `<p style="margin:.2rem 0;">${block.description}</p>`
        if (showTips && block.why) inner += `<p style="margin:.2rem 0;color:#555;"><em>🤔 ${block.why}</em></p>`
        if (showTips && block.volunteerTip) inner += `<p style="margin:.2rem 0;color:#555;"><em>🙌 ${block.volunteerTip}</em></p>`
        if (showTips && block.facilitatorTip) inner += `<p style="margin:.2rem 0;color:#555;"><em>💡 ${block.facilitatorTip}</em></p>`
      }
      return `<div style="margin:.75rem 0;padding:.6rem .9rem;border-left:4px solid ${c};border-radius:4px;background:#f9fafb;"><strong style="color:${c};">${block.name}</strong> <span style="float:right;font-weight:700;">${block.durationMinutes} min</span><br/>${inner}</div>`
    }
    const equipHtml = showEquipment && equipItems.length ? `<div style="margin-top:1.5rem;padding:1rem;border:2px solid #0d9488;border-radius:6px;"><h3 style="margin:0 0 .5rem;color:#0d9488;">🎒 Equipment Needed</h3><ul style="margin:0;padding-left:1.2rem;">${equipItems.map(i => `<li>☐ ${i}</li>`).join('')}</ul></div>` : ''
    const html = `<!DOCTYPE html><html><head><title>${p.name || 'Practice Plan'}</title><style>body{font-family:system-ui,sans-serif;max-width:700px;margin:2rem auto;padding:0 1rem;color:#1f2937;}@media print{button{display:none}}</style></head><body><h1>${sport.icon} ${p.name || 'Practice Plan'}</h1><p style="color:#6b7280;">${p.durationMinutes || 75} min · ${sport.name}</p>${(p.blocks || []).map(blockHtml).join('')}${equipHtml}<script>window.print();<\/script></body></html>`
    const w = window.open('', '_blank')
    if (w) { w.document.write(html); w.document.close() }
  }
  const [openMenu, setOpenMenu] = useState(null)

  useEffect(() => {
    plans.list().then(data => { setAllPlans(data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (viewPlan) requestAnimationFrame(() => setViewOpen(true))
  }, [viewPlan])

  useEffect(() => {
    if (editPlanId) requestAnimationFrame(() => setEditOverlayOpen(true))
  }, [editPlanId])

  useEffect(() => {
    if (ssOverlayPlanId) requestAnimationFrame(() => setSsOverlayOpen(true))
  }, [ssOverlayPlanId])

  useEffect(() => {
    if (!openMenu) return
    function handleClick() { setOpenMenu(null) }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [openMenu])

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2400)
  }

  function closePanel() {
    setViewOpen(false)
    setTimeout(() => setViewPlan(null), 320)
  }

  function closeEdit() {
    setEditOverlayOpen(false)
    setTimeout(() => {
      const prevId = editReturnPlanIdRef.current
      editReturnPlanIdRef.current = null
      setEditPlanId(null)
      plans.list().then(data => {
        setAllPlans(data)
        if (prevId) {
          const updated = data.find(p => p.id === prevId)
          if (updated) setViewPlan(updated)
        }
      })
    }, 320)
  }

  function openEdit(planId) {
    editReturnPlanIdRef.current = viewPlan?.id || null
    setEditPlanId(planId)
    closePanel()
  }

  function openSSOverlay(planId) {
    ssReturnPlanIdRef.current = viewPlan?.id || null
    if (viewPlan) closePanel()
    setSsOverlayPlanId(planId)
  }

  function closeSSOverlay() {
    setSsOverlayOpen(false)
    setTimeout(() => {
      const prevId = ssReturnPlanIdRef.current
      ssReturnPlanIdRef.current = null
      setSsOverlayPlanId(null)
      if (prevId) {
        const plan = allPlans.find(p => p.id === prevId)
        if (plan) setViewPlan(plan)
      }
    }, 320)
  }

  const sportsInUse = new Set(allPlans.map(p => p.sport))
  const q = search.trim().toLowerCase()
  const filtered = allPlans
    .filter(p => filterSport === 'all' || p.sport === filterSport)
    .filter(p => !q || (p.name || '').toLowerCase().includes(q) || (p.sportName || p.sport || '').toLowerCase().includes(q))

  async function handleCopy(p) {
    const copy = { ...p, id: null, name: 'Copy of ' + (p.name || 'Untitled Plan'), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    const saved = await plans.save(copy)
    setAllPlans(prev => [saved, ...prev])
    showToast('📋 Plan copied!')
  }

  async function handleDelete(p) {
    if (!confirm(`Delete "${p.name || 'this plan'}"?\n\nThis cannot be undone.`)) return
    await plans.delete(p.id)
    setAllPlans(prev => prev.filter(x => x.id !== p.id))
    if (viewPlan?.id === p.id) setViewPlan(null)
    showToast('🗑 Plan deleted')
  }

  async function handleClearStory(p) {
    if (!confirm(`Clear the saved social story for "${p.name || 'this plan'}"?\n\nThe story will be rebuilt from the plan next time you open it.`)) return
    try {
      const existing = await socialStories.getByPlanId(p.id)
      if (existing?.id) await socialStories.delete(existing.id)
      try {
        const arr = JSON.parse(localStorage.getItem('empowerSocialStories') || '[]')
        localStorage.setItem('empowerSocialStories', JSON.stringify(arr.filter(s => s.planId !== p.id)))
      } catch { /* ignore */ }
      showToast('✅ Story cleared — will regenerate on next open')
    } catch (e) {
      console.warn('[PlanLibrary] clearStory:', e)
      showToast('❌ Could not clear story')
    }
  }

  return (
    <>
      <div className="container-wide" data-testid="plan-library-home">
        <div className="pl-page-header">
          <div>
            <div className="pl-page-title">Practice Plans</div>
            <div className="pl-page-sub">View, edit, and organize your saved plans</div>
          </div>
          <button className="btn-new-plan" data-testid="new-plan-btn" onClick={() => { localStorage.removeItem('empowerPracticePlan'); navigate('/practice-builder') }}>
            ＋ New Plan
          </button>
        </div>

        {/* Filter bar */}
        <div className="pl-filter-bar">
          <div className="pl-sport-tabs">
            <button className={`sport-tab${filterSport === 'all' ? ' active' : ''}`} onClick={() => setFilterSport('all')}>All</button>
            {SPORTS.filter(s => sportsInUse.has(s.id)).map(s => (
              <button key={s.id} className={`sport-tab${filterSport === s.id ? ' active' : ''}`} onClick={() => setFilterSport(s.id)}>
                {s.icon} {s.name}
              </button>
            ))}
          </div>
          <input
            type="text"
            className="pl-search-input"
            placeholder="🔍 Search plans…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Plans grid */}
        <div className="plans-grid">
          {loading && <div className="loading-plans">Loading plans…</div>}
          {!loading && filtered.length === 0 && (
            <div className="empty-plans" data-testid="plan-library-empty">
              <span>{allPlans.length === 0 ? '📋' : '🔍'}</span>
              <p>
                {allPlans.length === 0
                  ? <>No plans yet — click <strong>New Plan</strong> to build your first.</>
                  : 'No plans match your filter.'}
              </p>
            </div>
          )}
          {filtered.map(p => {
            const sport = SPORTS.find(s => s.id === p.sport) || { icon: '⚽', name: p.sport }
            const blockCount = (p.blocks || []).length
            return (
              <div key={p.id} className={`plan-card${openMenu === p.id ? ' plan-card--menu-open' : ''}`} data-testid={`plan-card-${p.id}`} onClick={() => setViewPlan(p)} style={{ cursor: 'pointer' }}>
                <div className="plan-card-head">
                  <span className="plan-card-icon">{sport.icon}</span>
                  <div className="plan-card-name">{p.name || 'Untitled Plan'}</div>
                  <button
                    className="plan-card-menu-btn"
                    onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === p.id ? null : p.id) }}
                    aria-label="Options"
                  >
                    <img src={`${import.meta.env.BASE_URL}options.svg`} alt="" width="20" height="20" />
                  </button>
                  {openMenu === p.id && (
                    <div className="plan-card-menu" onClick={e => e.stopPropagation()}>
                      <button data-testid={`plan-card-${p.id}-view-btn`} onClick={() => { setOpenMenu(null); setViewPlan(p) }}>👁 View</button>
                      <button data-testid={`plan-card-${p.id}-edit-btn`} onClick={() => { setOpenMenu(null); openEdit(p.id) }}>✏️ Edit</button>
                      <button onClick={() => { setOpenMenu(null); handleCopy(p) }}>📋 Copy</button>
                      <button onClick={() => { setOpenMenu(null); openSSOverlay(p.id) }}>📖 Story</button>
                      <button onClick={() => { setOpenMenu(null); handleClearStory(p) }}>✕ Clear Story</button>
                      <button className="menu-del" onClick={() => { setOpenMenu(null); handleDelete(p) }}>🗑 Delete</button>
                    </div>
                  )}
                </div>
                <div className="plan-card-meta">{sport.name} · {p.durationMinutes || 75} min · {blockCount} block{blockCount !== 1 ? 's' : ''}</div>
                <div className="plan-card-updated">{relativeDate(p.updatedAt || p.createdAt)}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* View panel */}
      {viewPlan && (
        <div className={`view-overlay${viewOpen ? ' open' : ''}`} onClick={e => { if (e.target === e.currentTarget) closePanel() }}>
          <div className="view-panel">
            <div className="plan-view-header">
              <span className="view-header-icon">{SPORTS.find(s => s.id === viewPlan.sport)?.icon || '⚽'}</span>
              <div className="view-header-info">
                <div className="view-header-name">{viewPlan.name || 'Untitled Plan'}</div>
                <div className="view-header-meta">
                  {(SPORTS.find(s => s.id === viewPlan.sport)?.name || viewPlan.sport)} · {viewPlan.durationMinutes || 75} min · {(viewPlan.blocks || []).length} blocks
                  {viewPlan.hasWarmup ? ' · Warmup included' : ''}
                </div>
              </div>
              <button className="view-close" onClick={closePanel} aria-label="Close">✕</button>
            </div>
            <div className="view-opts-bar">
              <label className={`print-opt-pill${showTips ? ' active' : ''}`}>
                <input type="checkbox" checked={showTips} onChange={e => setShowTips(e.target.checked)} />💡 Tips
              </label>
              <label className={`print-opt-pill${showEquipment ? ' active' : ''}`}>
                <input type="checkbox" checked={showEquipment} onChange={e => setShowEquipment(e.target.checked)} />🎒 Equipment
              </label>
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
                            <div className="rotation-drills-expanded">
                              {(block.drills || []).map((d, di) => (
                                <div key={di} className="station-card">
                                  <div className="station-title">
                                    <span>{d.icon || '🏃'} {d.name}</span>
                                    <span style={{ marginLeft: 'auto', fontSize: '.78rem', fontWeight: 500, color: '#888' }}>{block.timePerDrill} min</span>
                                  </div>
                                  {d.description && <div className="block-desc">{d.description}</div>}
                                  {d.steps && d.steps.length > 0 && (
                                    <ul className="drill-list">{d.steps.map((s, si) => <li key={si}><span className="drill-icon">{s.icon || '▸'}</span>{s.text}</li>)}</ul>
                                  )}
                                  {showTips && d.why && <div className="why-tip"><span className="tip-icon">🤔</span><div><strong>Why we do this</strong> — {d.why}</div></div>}
                                  {showTips && d.volunteerTip && <div className="vol-tip"><span className="tip-icon">🙌</span><div><strong>Volunteer tip</strong> — {d.volunteerTip}</div></div>}
                                  {showTips && d.facilitatorTip && <div className="fac-tip"><span className="tip-icon">💡</span><div><strong>Facilitator tip</strong> — {d.facilitatorTip}</div></div>}
                                </div>
                              ))}
                            </div>
                          )}
                          {block.type !== 'rotation' && (
                            <>
                              {block.description && <div className="block-desc">{block.description}</div>}
                              {block.steps && block.steps.length > 0 && (
                                <ul className="drill-list">{block.steps.map((s, si) => <li key={si}><span className="drill-icon">{s.icon || '▸'}</span>{s.text}</li>)}</ul>
                              )}
                              {showTips && block.why && <div className="why-tip"><span className="tip-icon">🤔</span><div><strong>Why we do this</strong> — {block.why}</div></div>}
                              {showTips && block.volunteerTip && <div className="vol-tip"><span className="tip-icon">🙌</span><div><strong>Volunteer tip</strong> — {block.volunteerTip}</div></div>}
                              {showTips && block.facilitatorTip && <div className="fac-tip"><span className="tip-icon">💡</span><div><strong>Facilitator tip</strong> — {block.facilitatorTip}</div></div>}
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })
              }
              {showEquipment && (() => {
                const equipItems = collectViewEquipment(viewPlan.blocks)
                return equipItems.length > 0 ? (
                  <div className="equip-checklist">
                    <div className="equip-title">🎒 Equipment Needed</div>
                    <ul className="equip-list">
                      {equipItems.map((item, i) => <li key={i} className="equip-item"><span className="equip-check">☐</span>{item}</li>)}
                    </ul>
                  </div>
                ) : null
              })()}
            </div>
            <div className="view-actions">
              <button className="view-btn-edit" onClick={() => openEdit(viewPlan.id)}>✏️ Edit Plan</button>
              <button className="view-btn-copy" onClick={() => { handleCopy(viewPlan); closePanel() }}>📋 Copy</button>
              <button className="view-btn-story" onClick={() => openSSOverlay(viewPlan.id)}>📖 Social Story</button>
              <button className="btn-print" onClick={() => printViewPlan(viewPlan)}>🖨 Print</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className="toast show">{toast}</div>}

      {/* Practice Builder overlay */}
      {editPlanId && (
        <div className={`pb-overlay${editOverlayOpen ? ' open' : ''}`}>
          <div className="pb-overlay-panel">
            <div className="pb-overlay-scroll">
              <PracticeBuilder initPlanId={editPlanId} onExit={closeEdit} />
            </div>
          </div>
        </div>
      )}

      {/* Social Story overlay */}
      {ssOverlayPlanId && (
        <div className={`ss-overlay${ssOverlayOpen ? ' open' : ''}`}>
          <div className="ss-overlay-panel">
            <div className="ss-overlay-scroll">
              <SocialStory planId={ssOverlayPlanId} onExit={closeSSOverlay} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
