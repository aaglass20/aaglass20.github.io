import { useState, useEffect } from 'react'
import { DRILL_BANK } from '../data/practiceBuilderData.js'
import { drills as drillsDb } from '../lib/db.js'
import { iconsForSport, iconUrl, matchIcon } from '../lib/socialStoryIcons.js'

const SPORTS = [
  { id: 'soccer',     name: '⚽ Soccer' },
  { id: 'basketball', name: '🏀 Basketball' },
  { id: 'softball',   name: '🥎 Softball' },
  { id: 'football',   name: '🏈 Football' },
  { id: 'pickleball', name: '🏓 Pickleball' },
  { id: 'kickball',   name: '🔴 Kickball' },
]

const SPORT_ICON = { soccer: '⚽', basketball: '🏀', softball: '🥎', football: '🏈', pickleball: '🏓', kickball: '🔴' }

const SPORT_CATEGORIES = {
  soccer:     ['Ball Control','Dribbling','Passing','Shooting','Goalkeeping','Multi-Skill','Teamwork','Game'],
  basketball: ['Dribbling','Passing','Shooting','Defense','Fundamentals','Game'],
  softball:   ['Fielding','Hitting','Pitching','Base Running','Game'],
  football:   ['Passing','Routes','Defense','Fundamentals','Game'],
  pickleball: ['Serving','Volley','Fundamentals','Game'],
  kickball:   ['Fielding','Kicking','Base Running','Game'],
}

const BUILTIN_DRILLS = Object.entries(DRILL_BANK).flatMap(([sport, dArr]) =>
  dArr.map(d => ({ ...d, sport, source: 'builtin' }))
)

const EMPTY_FORM = {
  id: null, sport: 'soccer', category: '', icon: '', name: '', description: '',
  steps: [], equipment: [], why: '', volunteerTip: '', facilitatorTip: '',
  defaultTime: 12, videoUrl: '', source: 'user', socialIcon: '',
}

function mergeDrills(dbDrills) {
  const merged = [...BUILTIN_DRILLS]
  dbDrills.forEach(ud => {
    const idx = merged.findIndex(d => d.id === ud.id)
    if (idx >= 0) merged[idx] = ud; else merged.push(ud)
  })
  return merged
}

// ── Station card (matches practice builder format) ────────────

function StationCard({ drill }) {
  return (
    <div className="station-card">
      <div className="station-title">{drill.icon || '⚽'} {drill.name}</div>
      {drill.steps && drill.steps.length > 0 ? (
        <ul className="drill-list">
          {drill.steps.map((s, i) => (
            <li key={i}>
              <span className="drill-icon">{s.icon || '▸'}</span>
              {s.text}
              {s.tag && <span className={`drill-tag ${s.tag}`}>{s.tag}</span>}
            </li>
          ))}
        </ul>
      ) : drill.description ? (
        <p className="drill-desc">{drill.description}</p>
      ) : null}
      {drill.why && (
        <div className="why-tip">
          <span className="tip-icon">🤔</span>
          <div><strong>Why we do this</strong> — {drill.why}</div>
        </div>
      )}
      {drill.volunteerTip && (
        <div className="vol-tip">
          <span className="tip-icon">🙌</span>
          <div><strong>Volunteer tip</strong> — {drill.volunteerTip}</div>
        </div>
      )}
      {drill.facilitatorTip && (
        <div className="fac-tip">
          <span className="tip-icon">💡</span>
          <div><strong>Facilitator tip</strong> — {drill.facilitatorTip}</div>
        </div>
      )}
    </div>
  )
}

// ── Drill form (add/edit) ─────────────────────────────────────

function DrillForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY_FORM)
  const [steps, setSteps] = useState(initial?.steps || [])
  const [equipment, setEquipment] = useState(initial?.equipment || [])
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [uploadStatus, setUploadStatus] = useState('')
  const [ssPickerOpen, setSsPickerOpen] = useState(false)
  const [ssSearch, setSsSearch] = useState('')

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function addStep() { setSteps(s => [...s, { icon: '', text: '', tag: '' }]) }
  function updateStep(i, k, v) { setSteps(s => s.map((x, j) => j === i ? { ...x, [k]: v } : x)) }
  function removeStep(i) { setSteps(s => s.filter((_, j) => j !== i)) }

  function addEquip() { setEquipment(e => [...e, '']) }
  function updateEquip(i, v) { setEquipment(e => e.map((x, j) => j === i ? v : x)) }
  function removeEquip(i) { setEquipment(e => e.filter((_, j) => j !== i)) }

  async function handleSave() {
    if (!form.name.trim()) { setErr('Please enter a drill title.'); return }
    if (!form.sport) { setErr('Please select a sport.'); return }
    setSaving(true); setErr('')
    const drill = {
      ...form,
      icon: SPORT_ICON[form.sport] || '⚽',
      steps: steps.filter(s => s.text.trim()),
      equipment: equipment.filter(Boolean),
      source: 'user',
    }
    if (!drill.id) drill.id = 'user-' + Date.now()
    await onSave(drill)
    setSaving(false)
  }

  const cats = SPORT_CATEGORIES[form.sport] || []

  return (
    <div data-testid="drill-form" className="form-panel" style={{ maxWidth: 680 }}>
      <div className="form-panel-head">
        <h3>{initial?.id ? '✏️ Edit Drill' : '➕ Add New Drill'}</h3>
      </div>
      <div className="form-panel-body">
        {err && <div style={{ color: '#dc2626', fontSize: '.88rem', marginBottom: '.75rem' }}>{err}</div>}

        <div className="form-section">
          <div className="section-label">Basic Info</div>
          <div className="form-row form-row-2 col-half">
            <div className="form-row">
              <label>Sport</label>
              <select value={form.sport} onChange={e => { set('sport', e.target.value); set('category', '') }}>
                {SPORTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-row">
              <label>Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}>
                <option value="">— Category —</option>
                {cats.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row form-row-2 col-title-time">
            <div className="form-row">
              <label>Title</label>
              <input
                type="text"
                data-testid="drill-form-name"
                placeholder="Drill name"
                value={form.name}
                onChange={e => set('name', e.target.value)}
              />
            </div>
            <div className="form-row">
              <label>Time <span style={{ fontWeight: 400, textTransform: 'none', fontSize: '.68rem', color: 'var(--gray-400)' }}>(min)</span></label>
              <input type="number" min="2" max="60" value={form.defaultTime} onChange={e => set('defaultTime', +e.target.value)} style={{ textAlign: 'center' }} />
            </div>
          </div>
          <div className="form-row">
            <label>Summary</label>
            <small className="field-hint">Displayed with the drill — describe what participants do</small>
            <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="e.g. Participants dribble through 3 cone courses at increasing difficulty, choosing their own level." />
          </div>
        </div>

        <div className="form-section">
          <div className="section-label">Setup Steps</div>
          <small className="field-hint" style={{ marginBottom: '.55rem', display: 'block' }}>Each step = icon · description · optional tag (skill / fun / team)</small>
          <div className="steps-list">
            {steps.map((s, i) => (
              <div key={i} className="step-row">
                <input className="step-icon-in" type="text" maxLength={4} placeholder="⚽" value={s.icon} onChange={e => updateStep(i, 'icon', e.target.value)} />
                <textarea className="step-text-in" rows={1} placeholder="Describe this step…" value={s.text} onChange={e => updateStep(i, 'text', e.target.value)} />
                <select className="step-tag-sel" value={s.tag || ''} onChange={e => updateStep(i, 'tag', e.target.value)}>
                  <option value="">—</option>
                  <option value="skill">skill</option>
                  <option value="fun">fun</option>
                  <option value="team">team</option>
                </select>
                <button className="step-del" onClick={() => removeStep(i)}>✕</button>
              </div>
            ))}
          </div>
          <button type="button" className="btn-add-row" onClick={addStep}>+ Add step</button>
        </div>

        <div className="form-section">
          <div className="section-label">Context</div>
          <div className="form-row">
            <label>🤔 Why We Do This</label>
            <small className="field-hint">Shared with participants — keep it player-friendly</small>
            <textarea rows={2} value={form.why} onChange={e => set('why', e.target.value)} placeholder="e.g. 'The more we touch the ball with our feet, the better our feet learn it!'" />
          </div>
          <div className="form-row">
            <label>🙌 Volunteer Tips</label>
            <small className="field-hint">For BDU peer volunteers on the field</small>
            <textarea rows={2} value={form.volunteerTip} onChange={e => set('volunteerTip', e.target.value)} placeholder="What to watch for, celebrate, or adjust during the drill…" />
          </div>
          <div className="form-row">
            <label>💡 Facilitator Tips</label>
            <small className="field-hint">For coaches &amp; program directors — setup, logistics, progressions</small>
            <textarea rows={2} value={form.facilitatorTip} onChange={e => set('facilitatorTip', e.target.value)} placeholder="Equipment setup, spacing, ability-level adjustments…" />
          </div>
          <div className="form-row">
            <label>🎬 Video</label>
            <small className="field-hint">Paste a URL or upload a file — YouTube, Vimeo, MP4, etc.</small>
            <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', marginBottom: '.4rem' }}>
              <input type="url" value={form.videoUrl} onChange={e => set('videoUrl', e.target.value)} placeholder="https://youtube.com/watch?v=…" style={{ flex: 1, marginBottom: 0 }} />
              {form.videoUrl && <button type="button" style={{ background: 'none', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-sm)', padding: '.35rem .6rem', cursor: 'pointer', color: 'var(--gray-400)', fontSize: '.82rem' }} onClick={() => { set('videoUrl', ''); setUploadStatus('') }}>✕</button>}
            </div>
            <div className="video-upload-row">
              <span className="video-or">or</span>
              <label className="btn-upload-video">
                📁 Upload file
                <input type="file" accept="video/*" style={{ display: 'none' }} onChange={e => {
                  const file = e.target.files[0]
                  if (!file) return
                  setUploadStatus(`📎 ${file.name}`)
                  set('videoUrl', URL.createObjectURL(file))
                }} />
              </label>
              {uploadStatus && <span className="video-upload-status">{uploadStatus}</span>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="section-label">📖 Social Story Icon</div>
          <small className="field-hint" style={{ marginBottom: '.75rem', display: 'block' }}>Auto-matched from drill name — lock in a specific icon to override</small>
          {(() => {
            const suggested = matchIcon(form.name, form.sport)
            const locked = form.socialIcon
            const displayFile = locked || suggested
            const isLocked = !!locked
            return (
              <div className="drill-ss-icon-row">
                <div className="drill-ss-preview-wrap">
                  <img src={iconUrl(displayFile, form.sport)} className="drill-ss-preview" alt={displayFile} />
                  <span className={`drill-ss-badge${isLocked ? ' locked' : ' suggested'}`}>
                    {isLocked ? '✓ Locked' : '💡 Suggested'}
                  </span>
                </div>
                <div className="drill-ss-actions">
                  {!isLocked && (
                    <button type="button" className="btn-pick-ss-icon" onClick={() => { set('socialIcon', suggested) }}>
                      Lock this in
                    </button>
                  )}
                  <button type="button" className="btn-pick-ss-icon" onClick={() => setSsPickerOpen(true)}>
                    {isLocked ? '🔄 Change' : 'Pick different'}
                  </button>
                  {isLocked && (
                    <button type="button" className="btn-clear-ss" onClick={() => set('socialIcon', '')}>✕ Use auto</button>
                  )}
                </div>
              </div>
            )
          })()}
        </div>

        <div className="form-section">
          <div className="section-label">🎒 Equipment</div>
          <small className="field-hint" style={{ marginBottom: '.55rem', display: 'block' }}>Each item flows to the Practice Builder equipment checklist</small>
          <div className="equip-list">
            {equipment.map((e, i) => (
              <div key={i} className="equip-row">
                <input className="equip-text-in" type="text" placeholder="e.g. 4 cones, 1 ball per pair" value={e} onChange={ev => updateEquip(i, ev.target.value)} />
                <button className="step-del" onClick={() => removeEquip(i)}>✕</button>
              </div>
            ))}
          </div>
          <button type="button" className="btn-add-row" onClick={addEquip}>+ Add item</button>
        </div>
      </div>

      <div className="form-panel-foot">
        <div className="form-actions">
          <button
            className="btn btn-primary"
            data-testid="drill-form-save"
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? 'Saving…' : (initial?.id ? 'Update Drill' : 'Save Drill')}
          </button>
          {onCancel && <button className="btn btn-outline" onClick={onCancel}>Cancel</button>}
        </div>
      </div>

      {ssPickerOpen && (
        <div className="ss-picker-overlay" onClick={e => { if (e.target === e.currentTarget) { setSsPickerOpen(false); setSsSearch('') } }}>
          <div className="ss-picker-panel">
            <div className="ss-picker-head">
              <span>Choose Social Story Icon</span>
              <button className="view-close" onClick={() => { setSsPickerOpen(false); setSsSearch('') }}>✕</button>
            </div>
            <input
              className="ss-picker-search"
              type="text"
              placeholder="🔍 Search icons…"
              value={ssSearch}
              onChange={e => setSsSearch(e.target.value)}
              autoFocus
            />
            <div className="ss-picker-grid">
              {iconsForSport(form.sport)
                .filter(i => !ssSearch || i.label.toLowerCase().includes(ssSearch.toLowerCase()))
                .map(icon => (
                  <div
                    key={icon.id}
                    className={`ss-picker-icon${form.socialIcon === icon.file ? ' selected' : ''}`}
                    onClick={() => { set('socialIcon', icon.file); setSsPickerOpen(false); setSsSearch('') }}
                  >
                    <img src={iconUrl(icon.file, form.sport)} alt={icon.label} />
                    <span>{icon.label}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main DrillAdmin ───────────────────────────────────────────

export default function DrillAdmin() {
  const [dbDrills, setDbDrills] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('library')
  const [filterSport, setFilterSport] = useState('all')
  const [search, setSearch] = useState('')
  const [editDrill, setEditDrill] = useState(null)

  useEffect(() => {
    drillsDb.list().then(data => { setDbDrills(data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const allDrills = mergeDrills(dbDrills)
  const q = search.trim().toLowerCase()
  const sportFiltered = allDrills.filter(d => filterSport === 'all' || d.sport === filterSport)
  const filteredDrills = q
    ? sportFiltered.filter(d =>
        (d.name || '').toLowerCase().includes(q) ||
        (d.category || '').toLowerCase().includes(q) ||
        (d.description || '').toLowerCase().includes(q)
      )
    : sportFiltered

  async function handleSave(drill) {
    await drillsDb.save(drill)
    const fresh = await drillsDb.list()
    setDbDrills(fresh)
    setEditDrill(null)
    setTab('library')
  }

  async function handleDelete(id) {
    const drill = allDrills.find(d => d.id === id)
    if (!confirm(`Delete "${drill?.name || 'this drill'}"? This cannot be undone.`)) return
    await drillsDb.delete(id)
    const fresh = await drillsDb.list()
    setDbDrills(fresh)
  }

  function openAdd() { setEditDrill(null); setTab('form') }
  function openEdit(drill) { setEditDrill(drill); setTab('form') }
  function openCopy(drill) { setEditDrill({ ...drill, id: null, name: 'Copy of ' + (drill.name || '') }); setTab('form') }
  function closeForm() { setEditDrill(null); setTab('library') }

  function handleExport() {
    const custom = dbDrills.filter(d => d.source !== 'builtin')
    if (!custom.length) { alert('No custom drills to export yet.'); return }
    const json = JSON.stringify(custom, null, 2)
    navigator.clipboard?.writeText(json).then(() => {
      alert('Custom drills JSON copied to clipboard!')
    }).catch(() => {
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = 'empower-custom-drills.json'; a.click()
      URL.revokeObjectURL(url)
    })
  }

  return (
    <>
      <section className="hero" style={{ padding: '2.5rem 1.5rem 3rem' }}>
        <div className="hero-badge">🗂️ Drill Management</div>
        <h1>Drill <span>Library</span></h1>
        <p style={{ fontSize: '.97rem' }}>Add and manage drills for any Empower sport. Each drill includes steps, "Why we do this," volunteer tips, and facilitator tips. Drills you create here automatically appear in the Practice Builder.</p>
      </section>

      <div className="container-wide" data-testid="drill-admin-home">
        {/* Tab bar */}
        <div className="tab-bar">
          <button className={`tab-btn${tab === 'library' ? ' active' : ''}`} onClick={() => { setTab('library'); setEditDrill(null) }}>
            Drill Library
          </button>
          <button className={`tab-btn${tab === 'form' ? ' active' : ''}`} data-testid="add-drill-btn" onClick={openAdd}>
            Add New Drill
          </button>
        </div>

        {/* Form tab */}
        {tab === 'form' && (
          <div className="admin-layout">
            <DrillForm
              initial={editDrill}
              onSave={handleSave}
              onCancel={closeForm}
            />
          </div>
        )}

        {/* Library tab */}
        {tab === 'library' && (
          <div className="library-section">
            <div className="section-header">
              <h2>Drill Library</h2>
              <div className="section-divider" />
              <p>All drills — built-in and custom — shown in the station-card format used in practice plans</p>
            </div>

            {/* Search row */}
            <div className="lib-search-row">
              <div className="lib-search-wrap">
                <span className="lib-search-icon">🔍</span>
                <input
                  type="text"
                  className="lib-search-input"
                  placeholder="Search drills…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {search && (
                  <button className="lib-search-clear visible" onClick={() => setSearch('')}>✕</button>
                )}
              </div>
              <span className="lib-search-count">
                {q
                  ? `${filteredDrills.length} of ${sportFiltered.length}`
                  : (sportFiltered.length ? `${sportFiltered.length} drills` : '')}
              </span>
            </div>

            {/* Sport filter tabs + export */}
            <div className="library-header">
              <div className="sport-filter-tabs">
                <button className={`sport-tab${filterSport === 'all' ? ' active' : ''}`} onClick={() => setFilterSport('all')}>
                  All Sports
                </button>
                {SPORTS.map(s => (
                  <button
                    key={s.id}
                    className={`sport-tab${filterSport === s.id ? ' active' : ''}`}
                    onClick={() => setFilterSport(s.id)}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {loading && <div className="loading-plans">Loading drills…</div>}

            <div className="drill-library-grid">
              {!loading && filteredDrills.length === 0 && (
                <div className="empty-library">
                  <span style={{ fontSize: '2.5rem' }}>{q ? '🔍' : '🏃'}</span>
                  <p>{q ? `No drills match "${q}"` : 'No drills yet. Fill in the form to add your first drill!'}</p>
                </div>
              )}
              {filteredDrills.map(d => {
                const sportMeta = SPORTS.find(s => s.id === d.sport) || { name: d.sport }
                return (
                  <div key={d.id} className="lib-card">
                    <div className="lib-card-head">
                      <span>{d.icon || SPORT_ICON[d.sport] || '⚽'} {d.name}</span>
                      <span className="cat-badge">{d.category || ''}</span>
                    </div>
                    <div className="lib-card-body">
                      <div style={{ fontSize: '.72rem', color: 'var(--gray-400)', marginBottom: '.4rem' }}>
                        {sportMeta.name} · {d.defaultTime || 12} min
                      </div>
                      {d.description && <div className="lib-card-desc">{d.description}</div>}
                      <StationCard drill={d} />
                      <div className="lib-card-actions">
                        <button className="edit-btn" onClick={() => openEdit(d)}>✏️ Edit</button>
                        <button className="copy-btn" onClick={() => openCopy(d)}>📋 Copy</button>
                        <button className="del-btn" onClick={() => handleDelete(d.id)}>🗑 Delete</button>
                        {d.videoUrl && (
                          <button className="watch-btn" onClick={() => window.open(d.videoUrl, '_blank', 'noopener,noreferrer')}>▶ Watch</button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <footer className="page-footer">
        <strong>Empower Sports</strong> Program Playbook — Adapted Athletic, Fitness &amp; Recreational Programs
      </footer>
    </>
  )
}
