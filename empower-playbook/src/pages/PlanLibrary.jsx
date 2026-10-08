import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { plans } from '../lib/db.js'

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
  const [toast, setToast] = useState('')

  useEffect(() => {
    plans.list().then(data => { setAllPlans(data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2400)
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

  return (
    <>
      <section className="hero" style={{ padding: '2.5rem 1.5rem 3rem' }}>
        <div className="hero-badge">📚 Plan Management</div>
        <h1>Practice <span>Plans</span></h1>
        <p style={{ fontSize: '.97rem' }}>View, edit, copy, and organize all your saved practice plans.</p>
      </section>

      <div className="container-wide" data-testid="plan-library-home">
        <div className="lib-header">
          <h2>All Plans</h2>
          <button className="btn-new-plan" data-testid="new-plan-btn" onClick={() => navigate('/practice-builder')}>
            ＋ New Plan
          </button>
        </div>

        {/* Filter row */}
        <div className="filter-row">
          <button className={`sport-tab${filterSport === 'all' ? ' active' : ''}`} onClick={() => setFilterSport('all')}>All Sports</button>
          {SPORTS.filter(s => sportsInUse.has(s.id)).map(s => (
            <button key={s.id} className={`sport-tab${filterSport === s.id ? ' active' : ''}`} onClick={() => setFilterSport(s.id)}>
              {s.icon} {s.name}
            </button>
          ))}
          <div className="search-wrap">
            <input
              type="text"
              className="search-input"
              placeholder="🔍 Search plans…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Plans grid */}
        <div className="plans-grid">
          {loading && <div className="loading-plans">Loading plans…</div>}
          {!loading && filtered.length === 0 && (
            <div className={`empty-plans${allPlans.length === 0 ? '' : ''}`} data-testid="plan-library-empty">
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
              <div key={p.id} className="plan-card" data-testid={`plan-card-${p.id}`}>
                <div className="plan-card-head">
                  <span className="plan-card-icon">{sport.icon}</span>
                  <div className="plan-card-name">{p.name || 'Untitled Plan'}</div>
                </div>
                <div className="plan-card-meta">{sport.name} · {p.durationMinutes || 75} min · {blockCount} block{blockCount !== 1 ? 's' : ''}</div>
                <div className="plan-card-updated">{relativeDate(p.updatedAt || p.createdAt)}</div>
                <div className="plan-card-actions">
                  <button className="view-btn" onClick={() => setViewPlan(p)}>👁 View</button>
                  <button className="edit-btn" onClick={() => navigate(`/practice-builder?planId=${encodeURIComponent(p.id)}`)}>✏️ Edit</button>
                  <button className="copy-btn" onClick={() => handleCopy(p)}>📋 Copy</button>
                  <button className="del-btn" onClick={() => handleDelete(p)}>🗑 Delete</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* View modal */}
      {viewPlan && (
        <div className="view-overlay open" onClick={e => { if (e.target === e.currentTarget) setViewPlan(null) }}>
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
              <button className="view-close" onClick={() => setViewPlan(null)} aria-label="Close">✕</button>
            </div>
            <div className="view-scroll-body">
              {!(viewPlan.blocks || []).length
                ? <div className="vb-empty">📋 This plan has no blocks yet.</div>
                : (viewPlan.blocks || []).map((block, i) => (
                    <div key={i} className={`vb-block type-${block.type}`}>
                      <span className="vb-icon">{block.icon || '📌'}</span>
                      <div className="vb-body">
                        <div className="vb-name">{block.name}</div>
                        {block.description && <div className="vb-desc">{block.description}</div>}
                        {block.why && <div className="vb-tip vb-tip-why">🤔 <span>{block.why}</span></div>}
                        {block.volunteerTip && <div className="vb-tip vb-tip-vol">🙌 <span>{block.volunteerTip}</span></div>}
                      </div>
                      <span className="vb-dur">{block.durationMinutes} min</span>
                    </div>
                  ))
              }
            </div>
            <div className="view-actions">
              <button className="view-btn-edit" onClick={() => { navigate(`/practice-builder?planId=${encodeURIComponent(viewPlan.id)}`); setViewPlan(null) }}>✏️ Edit Plan</button>
              <button className="view-btn-copy" onClick={() => { handleCopy(viewPlan); setViewPlan(null) }}>📋 Copy</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className="toast show">{toast}</div>}
    </>
  )
}
