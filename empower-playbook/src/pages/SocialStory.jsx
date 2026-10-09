import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { plans, socialStories } from '../lib/db.js'
import { iconsForSport, iconUrl, buildSocialStory } from '../lib/socialStoryIcons.js'

export default function SocialStory() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [story, setStory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [iconPickerFor, setIconPickerFor] = useState(null)
  const [pickerSearch, setPickerSearch] = useState('')
  const [dragLine, setDragLine] = useState(null)
  const [dragOverLine, setDragOverLine] = useState(null)
  const [toast, setToast] = useState('')
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [showRegenModal, setShowRegenModal] = useState(false)
  const [sourcePlan, setSourcePlan] = useState(null)

  // Warn on browser refresh / tab close
  useEffect(() => {
    function onBeforeUnload(e) {
      if (isDirty) { e.preventDefault(); e.returnValue = '' }
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [isDirty])

  useEffect(() => {
    const planId = searchParams.get('planId')
    if (!planId) { setLoading(false); return }
    async function load() {
      try {
        const p = await plans.get(planId)
        if (!p) { setLoading(false); return }
        setSourcePlan(p)
        const existing = await socialStories.getByPlanId(planId)
        const validStory = existing && Array.isArray(existing.lines) && existing.lines.length > 0 ? existing : null
        setStory(validStory || buildSocialStory(p))
        setIsDirty(false)
      } catch (e) {
        console.warn('[SocialStory] load:', e)
      }
      setLoading(false)
    }
    load()
  }, [])

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 2400) }

  async function handleSave() {
    if (!story) return
    setSaving(true)
    try {
      const saved = await socialStories.save(story)
      setStory(saved)
      setIsDirty(false)
      showToast('✅ Story saved!')
    } catch (e) {
      console.warn('[SocialStory] save:', e)
      showToast('❌ Save failed — check connection')
    }
    setSaving(false)
  }

  async function handleClearAndReset() {
    if (!sourcePlan) return
    try {
      // delete from Supabase + localStorage so it can't reload
      if (story?.id) await socialStories.delete(story.id)
      // also purge any stale localStorage copy
      try {
        const lsKey = 'empowerSocialStories'
        const arr = JSON.parse(localStorage.getItem(lsKey) || '[]')
        localStorage.setItem(lsKey, JSON.stringify(arr.filter(s => s.planId !== sourcePlan.id)))
      } catch { /* ignore */ }
    } catch (e) {
      console.warn('[SocialStory] clear:', e)
    }
    const fresh = buildSocialStory(sourcePlan)
    setStory({ ...fresh, id: null })
    setIsDirty(false)
    showToast('🗑 Cleared — story rebuilt from plan')
  }

  function handleRegenerate() {
    if (!sourcePlan) return
    const fresh = buildSocialStory(sourcePlan)
    // preserve the saved id and planId so saving updates rather than inserts
    setStory(s => ({ ...fresh, id: s?.id || null, planId: s?.planId || fresh.planId }))
    setIsDirty(true)
    setShowRegenModal(false)
    showToast('↺ Story reset to auto-generated layout')
  }

  function dirty(fn) {
    return (...args) => { fn(...args); setIsDirty(true) }
  }

  const updateTitle = dirty(val => setStory(s => ({ ...s, title: val })))

  const updateLineText = dirty((id, text) =>
    setStory(s => ({ ...s, lines: s.lines.map(l => l.id === id ? { ...l, text } : l) }))
  )

  const addIconToLine = dirty((lineId, iconFile) =>
    setStory(s => ({ ...s, lines: s.lines.map(l => l.id === lineId ? { ...l, icons: [...l.icons, iconFile] } : l) }))
  )

  const removeIconFromLine = dirty((lineId, iconIdx) =>
    setStory(s => ({ ...s, lines: s.lines.map(l => l.id === lineId ? { ...l, icons: l.icons.filter((_, i) => i !== iconIdx) } : l) }))
  )

  const deleteLine = dirty(id =>
    setStory(s => ({ ...s, lines: s.lines.filter(l => l.id !== id) }))
  )

  const addLine = dirty(() => {
    const id = 'l' + Date.now()
    setStory(s => ({ ...s, lines: [...s.lines, { id, icons: [], text: '' }] }))
  })

  function handleLineDrop(targetId) {
    if (!dragLine || dragLine === targetId) return
    setStory(s => {
      const lines = [...s.lines]
      const fromIdx = lines.findIndex(l => l.id === dragLine)
      const toIdx = lines.findIndex(l => l.id === targetId)
      const [moved] = lines.splice(fromIdx, 1)
      lines.splice(toIdx, 0, moved)
      return { ...s, lines }
    })
    setIsDirty(true)
    setDragLine(null)
    setDragOverLine(null)
  }

  function swapOrAddIcon(lineId, replaceIdx, iconFile) {
    if (replaceIdx !== null) {
      setStory(s => ({
        ...s,
        lines: s.lines.map(l => l.id === lineId
          ? { ...l, icons: l.icons.map((f, i) => i === replaceIdx ? iconFile : f) }
          : l
        )
      }))
    } else {
      addIconToLine(lineId, iconFile)
    }
    setIsDirty(true)
    setIconPickerFor(null)
    setPickerSearch('')
  }

  if (loading) {
    return (
      <div className="container-wide" style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--gray-400)' }}>
        Loading social story…
      </div>
    )
  }

  if (!story) {
    return (
      <div className="container-wide" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--gray-400)' }}>Plan not found.</p>
        <button className="btn-text-back" onClick={() => navigate(-1)}>← Back</button>
      </div>
    )
  }

  return (
    <>
      <section className="hero ss-hero">
        <div className="hero-badge">📖 Social Story</div>
        {editingTitle
          ? <input
              className="ss-title-input"
              value={story.title}
              onChange={e => updateTitle(e.target.value)}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={e => e.key === 'Enter' && setEditingTitle(false)}
              autoFocus
            />
          : <h1 onClick={() => setEditingTitle(true)}>
              {story.title} <span className="ss-edit-icon">✏️</span>
            </h1>
        }
        <p className="ss-hero-sub">Each row has icons + one sentence · Click icons to swap · Drag rows to reorder</p>
      </section>

      <div className="container-wide">
        <div className="ss-toolbar">
          <button className="btn-text-back" onClick={() => isDirty ? setShowLeaveModal(true) : navigate(-1)}>← Back</button>
          {sourcePlan && (
            <button className="btn-ss-clear" onClick={() => { if (window.confirm('Delete the saved story and rebuild from the plan? This cannot be undone.')) handleClearAndReset() }} title="Delete saved story and rebuild fresh">
              🗑 Reset Story
            </button>
          )}
          <div className="ss-toolbar-right">
            {isDirty && <span className="ss-dirty-badge">● Unsaved changes</span>}
            {sourcePlan && (
              <button className="btn-ss-regen" onClick={() => setShowRegenModal(true)} title="Reset to auto-generated layout">
                ↺ Regenerate
              </button>
            )}
            <button className="btn-print" onClick={() => window.print()}>🖨 Print</button>
            <button className="btn-ss-save" onClick={handleSave} disabled={saving || !isDirty}>
              {saving ? 'Saving…' : 'Save Story'}
            </button>
          </div>
        </div>

        <div className="ss-print-area">
          <div className="ss-print-title">{story.title}</div>

          <div className="ss-lines">
            {(story.lines || []).map((line, idx) => (
              <div
                key={line.id}
                className={`ss-line${dragOverLine === line.id ? ' drag-over' : ''}`}
                draggable
                onDragStart={() => setDragLine(line.id)}
                onDragOver={e => { e.preventDefault(); setDragOverLine(line.id) }}
                onDrop={() => handleLineDrop(line.id)}
                onDragEnd={() => { setDragLine(null); setDragOverLine(null) }}
              >
                <div className="ss-line-label">Line {idx + 1}</div>

                <div className="ss-line-icons">
                  {line.icons.map((file, iconIdx) => (
                    <div key={iconIdx} className="ss-line-icon">
                      <img
                        src={iconUrl(file, story.sport)}
                        alt={file}
                        onClick={() => setIconPickerFor({ lineId: line.id, replaceIdx: iconIdx })}
                        title="Click to swap"
                      />
                      <button className="ss-line-icon-del" onClick={() => removeIconFromLine(line.id, iconIdx)}>✕</button>
                    </div>
                  ))}
                  <div className="ss-add-icon-btn" onClick={() => setIconPickerFor({ lineId: line.id, replaceIdx: null })}>
                    <span style={{ fontSize: '1.4rem' }}>＋</span>
                    <span>Add Icon</span>
                  </div>
                </div>

                <textarea
                  className="ss-line-text"
                  value={line.text}
                  onChange={e => updateLineText(line.id, e.target.value)}
                  rows={2}
                  placeholder="Write a sentence for this row…"
                />
                <p className="ss-line-text-print">{line.text}</p>

                <button className="ss-line-del" onClick={() => deleteLine(line.id)}>✕ Remove</button>
              </div>
            ))}

            <div className="ss-add-line" onClick={addLine}>＋ Add Line</div>
          </div>
        </div>
      </div>

      {/* Icon picker */}
      {iconPickerFor && (
        <div className="ss-picker-overlay" onClick={e => { if (e.target === e.currentTarget) { setIconPickerFor(null); setPickerSearch('') } }}>
          <div className="ss-picker-panel">
            <div className="ss-picker-head">
              <span>{iconPickerFor.replaceIdx !== null ? 'Swap Icon' : 'Add Icon'}</span>
              <button className="view-close" onClick={() => { setIconPickerFor(null); setPickerSearch('') }}>✕</button>
            </div>
            <input
              className="ss-picker-search"
              type="text"
              placeholder="🔍 Search icons…"
              value={pickerSearch}
              onChange={e => setPickerSearch(e.target.value)}
              autoFocus
            />
            <div className="ss-picker-grid">
              {iconsForSport(story?.sport)
                .filter(i => !pickerSearch || i.label.toLowerCase().includes(pickerSearch.toLowerCase()))
                .map(icon => (
                  <div
                    key={icon.id}
                    className="ss-picker-icon"
                    onClick={() => swapOrAddIcon(iconPickerFor.lineId, iconPickerFor.replaceIdx, icon.file)}
                  >
                    <img src={iconUrl(icon.file, story?.sport)} alt={icon.label} />
                    <span>{icon.label}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Regenerate confirmation modal */}
      {showRegenModal && (
        <div className="ss-blocker-overlay" onClick={e => { if (e.target === e.currentTarget) setShowRegenModal(false) }}>
          <div className="ss-blocker-modal">
            <div className="ss-blocker-icon">↺</div>
            <h3>Regenerate Story?</h3>
            <p>This will reset all lines, icons, and text back to the auto-generated layout from your practice plan. Any edits you've made will be lost.</p>
            <div className="ss-blocker-actions">
              <button className="btn-blocker-leave" onClick={handleRegenerate}>Yes, regenerate</button>
              <button className="btn-blocker-stay" onClick={() => setShowRegenModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Unsaved changes modal */}
      {showLeaveModal && (
        <div className="ss-blocker-overlay" onClick={e => { if (e.target === e.currentTarget) setShowLeaveModal(false) }}>
          <div className="ss-blocker-modal">
            <div className="ss-blocker-icon">⚠️</div>
            <h3>Unsaved Changes</h3>
            <p>You have unsaved changes to this social story. If you leave now they will be lost.</p>
            <div className="ss-blocker-actions">
              <button className="btn-blocker-leave" onClick={() => { setShowLeaveModal(false); navigate(-1) }}>Leave without saving</button>
              <button className="btn-blocker-stay" onClick={() => setShowLeaveModal(false)}>Stay and save</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast show">{toast}</div>}
    </>
  )
}
