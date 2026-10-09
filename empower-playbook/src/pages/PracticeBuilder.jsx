import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import * as db from '../lib/db.js'
import { SPORTS, WARMUP_BANK, DRILL_BANK as BASE_DRILL_BANK, DRILL_EQUIPMENT } from '../data/practiceBuilderData.js'

function genId() { return 'plan_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7) }

function getEquipment(drillId, allDrills) {
  const d = allDrills.find(x => x.id === drillId)
  if (d && d.equipment && d.equipment.length) return d.equipment
  return DRILL_EQUIPMENT[drillId] || []
}

function collectEquipment(blocks, drillBank) {
  const allDrills = Object.values(drillBank).flat()
  const items = new Set()
  blocks.forEach(block => {
    if (block.type === 'rotation') {
      block.drills.forEach(d => getEquipment(d.id, allDrills).forEach(e => items.add(e)))
    } else if (block.drillId) {
      getEquipment(block.drillId, allDrills).forEach(e => items.add(e))
    }
  })
  return [...items].sort((a, b) => a.replace(/^[\W]+/, '').localeCompare(b.replace(/^[\W]+/, '')))
}

function minsUsed(blocks) { return blocks.reduce((s, b) => s + (b.durationMinutes || 0), 0) }

function DrillDetail({ d, showTips, showEquipment }) {
  return (
    <>
      {d.steps && d.steps.length > 0 ? (
        <ul className="drill-list">
          {d.steps.map((s, i) => (
            <li key={i}>
              <span className="drill-icon">{s.icon || '▸'}</span> {s.text}
              {s.tag && <span className={`drill-tag ${s.tag}`}>{s.tag}</span>}
            </li>
          ))}
        </ul>
      ) : d.description ? (
        <div className="block-desc">{d.description}</div>
      ) : null}
      {showEquipment && d.equipment && d.equipment.length > 0 && (
        <div className="equip-tip"><span className="tip-icon">🎒</span><div><strong>Equipment</strong> — {d.equipment.join(', ')}</div></div>
      )}
      {showTips && d.why && (
        <div className="why-tip"><span className="tip-icon">🤔</span><div><strong>Why we do this</strong> — {d.why}</div></div>
      )}
      {showTips && d.volunteerTip && (
        <div className="vol-tip"><span className="tip-icon">🙌</span><div><strong>Volunteer tip</strong> — {d.volunteerTip}</div></div>
      )}
      {showTips && d.facilitatorTip && (
        <div className="fac-tip"><span className="tip-icon">💡</span><div><strong>Facilitator tip</strong> — {d.facilitatorTip}</div></div>
      )}
      {!d.steps && !d.why && d.purpose && <div className="block-purpose">Purpose: {d.purpose}</div>}
      {!d.steps && !d.why && showTips && d.tip && <div className="vol-tip"><span className="tip-icon">💡</span> {d.tip}</div>}
    </>
  )
}

function PlanBlock({ block, idx, onEdit, onRemove, onDrop, showTips, showEquipment }) {
  const [isDragging, setIsDragging] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const iconMap = { warmup: block.icon || '🌟', drill: block.icon || '🏃', rotation: '🔄', break: '💧', closing: '🏁' }
  const icon = iconMap[block.type] || '📌'

  return (
    <div
      className={`plan-block type-${block.type}${isDragging ? ' dragging' : ''}${isDragOver ? ' drag-over' : ''}`}
      draggable
      onDragStart={e => { e.dataTransfer.setData('text/plain', String(idx)); e.dataTransfer.effectAllowed = 'move'; setTimeout(() => setIsDragging(true), 0) }}
      onDragEnd={() => { setIsDragging(false); setIsDragOver(false) }}
      onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setIsDragOver(true) }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={e => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); const from = parseInt(e.dataTransfer.getData('text/plain')); if (!isNaN(from) && from !== idx) onDrop(from, idx) }}
      onClick={() => onEdit(idx)}
    >
      <span className="block-drag-handle" title="Drag to reorder" onClick={e => e.stopPropagation()}>⠿</span>
      <span className="block-icon">{icon}</span>
      <div className="block-body">
        <div className="block-name">{block.name}</div>
        {block.type !== 'drill' && block.type !== 'warmup' && block.description && (
          <div className="block-desc">{block.description}</div>
        )}
        {block.type === 'rotation' && (
          <div className="rotation-drills-expanded">
            {block.drills.map((d, i) => (
              <div key={i} className="station-card">
                <div className="station-title">{d.icon || '🏃'} {d.name} <span style={{ marginLeft: 'auto', fontSize: '.78rem', fontWeight: 500, color: '#888' }}>{block.timePerDrill} min</span></div>
                <DrillDetail d={d} showTips={showTips} showEquipment={showEquipment} />
              </div>
            ))}
          </div>
        )}
        {(block.type === 'drill' || block.type === 'warmup') && (
          <DrillDetail d={block} showTips={showTips} showEquipment={showEquipment} />
        )}
        <span className="block-edit-hint">✏️ Click to edit</span>
      </div>
      <span className="block-dur-badge">{block.durationMinutes} min</span>
      <button className="block-remove" title="Remove" onClick={e => { e.stopPropagation(); onRemove(idx) }}>✕</button>
    </div>
  )
}

function Modal({ open, onClose, plan, drillBank, editIdx, onUpsert }) {
  const [panel, setPanel] = useState('choice')
  const [selectedWarmup, setSelectedWarmup] = useState(null)
  const [warmupTime, setWarmupTime] = useState(10)
  const [selectedDrill, setSelectedDrill] = useState(null)
  const [selectedRotDrills, setSelectedRotDrills] = useState([])
  const [isRotational, setIsRotational] = useState(false)
  const [drillTime, setDrillTime] = useState(12)
  const [activeCat, setActiveCat] = useState('All')
  const [breakTime, setBreakTime] = useState(5)
  const [breakLabel, setBreakLabel] = useState('Water Break')
  const [closingName, setClosingName] = useState('Closing Circle')
  const [closingTime, setClosingTime] = useState(5)

  const warmups = plan ? (WARMUP_BANK[plan.sport] || WARMUP_BANK.soccer || []) : []
  const drills = plan ? (drillBank[plan.sport] || []) : []
  const cats = ['All', ...new Set(drills.map(d => d.category))]
  const filteredDrills = activeCat === 'All' ? drills : drills.filter(d => d.category === activeCat)

  useEffect(() => {
    if (!open) return
    setSelectedWarmup(null); setSelectedDrill(null); setSelectedRotDrills([]); setIsRotational(false)
    setActiveCat('All'); setWarmupTime(10); setDrillTime(12)
    setBreakTime(5); setBreakLabel('Water Break'); setClosingName('Closing Circle'); setClosingTime(5)
    if (editIdx !== null && plan) {
      const block = plan.blocks[editIdx]
      if (!block) return
      if (block.type === 'warmup') {
        setPanel('warmup'); setWarmupTime(block.durationMinutes)
        const m = warmups.find(w => w.name === block.name); if (m) setSelectedWarmup(m)
      } else if (block.type === 'drill') {
        setPanel('drill'); setDrillTime(block.durationMinutes)
        const m = drills.find(d => d.name === block.name); if (m) setSelectedDrill(m)
      } else if (block.type === 'rotation') {
        setPanel('drill'); setIsRotational(true); setDrillTime(block.timePerDrill)
        setSelectedRotDrills(block.drills.map(bd => drills.find(d => d.id === bd.id)).filter(Boolean))
      } else if (block.type === 'break') {
        setPanel('break'); setBreakTime(block.durationMinutes); setBreakLabel(block.name)
      } else if (block.type === 'closing') {
        setPanel('closing'); setClosingName(block.name); setClosingTime(block.durationMinutes)
      }
    } else {
      setPanel('choice')
    }
  }, [open, editIdx])

  function confirmWarmup() {
    if (!selectedWarmup) return
    onUpsert({ type: 'warmup', name: selectedWarmup.name, icon: selectedWarmup.icon, description: selectedWarmup.description, drillId: selectedWarmup.id, why: selectedWarmup.purpose, volunteerTip: selectedWarmup.tip, durationMinutes: warmupTime })
    onClose()
  }
  function confirmDrill() {
    if (isRotational) {
      if (!selectedRotDrills.length) return
      onUpsert({ type: 'rotation', name: selectedRotDrills.map(d => d.name).join(' / '), drills: selectedRotDrills, timePerDrill: drillTime, durationMinutes: selectedRotDrills.length * drillTime })
    } else {
      if (!selectedDrill) return
      onUpsert({ type: 'drill', name: selectedDrill.name, icon: selectedDrill.icon || '🏃', description: selectedDrill.description, drillId: selectedDrill.id, steps: selectedDrill.steps || [], why: selectedDrill.why, volunteerTip: selectedDrill.volunteerTip, facilitatorTip: selectedDrill.facilitatorTip, equipment: selectedDrill.equipment || [], durationMinutes: drillTime })
    }
    onClose()
  }
  function confirmBreak() { onUpsert({ type: 'break', name: breakLabel || 'Break', durationMinutes: breakTime }); onClose() }
  function confirmClosing() { onUpsert({ type: 'closing', name: closingName || 'Closing Circle', durationMinutes: closingTime }); onClose() }
  function toggleRotDrill(d) { setSelectedRotDrills(prev => prev.find(x => x.id === d.id) ? prev.filter(x => x.id !== d.id) : [...prev, d]) }

  const titles = { choice: 'Add to Plan', warmup: editIdx !== null ? 'Edit Warmup' : 'Pick a Warmup', drill: editIdx !== null ? (isRotational ? 'Edit Rotation' : 'Edit Drill') : (isRotational ? 'Add Rotation' : 'Pick a Drill'), break: editIdx !== null ? 'Edit Break' : 'Add a Break', closing: editIdx !== null ? 'Edit Closing' : 'Add Closing' }

  if (!open) return null
  return (
    <div className="modal-overlay open" data-testid="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{titles[panel] || 'Add to Plan'}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {panel === 'choice' && (
            <div className="choice-grid">
              {plan?.hasWarmup && <div className="choice-card choice-warmup" onClick={() => setPanel('warmup')}><span className="choice-icon">🌟</span><div className="choice-label">Warmup</div><div className="choice-desc">Set the tone &amp; get moving</div></div>}
              <div className="choice-card choice-drill" onClick={() => setPanel('drill')}><span className="choice-icon">🏃</span><div className="choice-label">Drill</div><div className="choice-desc">Skill drill or rotation</div></div>
              <div className="choice-card choice-break" onClick={() => setPanel('break')}><span className="choice-icon">💧</span><div className="choice-label">Break</div><div className="choice-desc">Water, rest, or transition</div></div>
              <div className="choice-card choice-closing" onClick={() => setPanel('closing')}><span className="choice-icon">🏁</span><div className="choice-label">Closing</div><div className="choice-desc">Wrap up the session</div></div>
            </div>
          )}
          {panel === 'warmup' && (
            <div className="sub-panel active">
              <div className="bank-grid">
                {warmups.map(w => (
                  <div key={w.id} className={`bank-card${selectedWarmup?.id === w.id ? ' selected' : ''}`} onClick={() => setSelectedWarmup(w)}>
                    <span className="bank-icon">{w.icon}</span>
                    <div className="bank-info">
                      <div className="bank-name">{w.name}</div>
                      <div className="bank-desc">{w.description}</div>
                      {w.purpose && <div className="bank-purpose">Purpose: {w.purpose}</div>}
                      {w.tip && <div className="bank-tip">💡 {w.tip}</div>}
                    </div>
                    <span className="bank-check">✓</span>
                  </div>
                ))}
              </div>
              <div className="time-input-row">
                <label>Duration:</label>
                <input type="number" min="1" max="60" value={warmupTime} onChange={e => setWarmupTime(parseInt(e.target.value) || 10)} />
                <span className="min-label">min</span>
              </div>
              <button className="btn-confirm" disabled={!selectedWarmup} onClick={confirmWarmup}>{editIdx !== null ? 'Update Warmup' : 'Add Warmup'}</button>
            </div>
          )}
          {panel === 'drill' && (
            <div className="sub-panel active">
              <div className="rot-toggle-row">
                <label className="rot-toggle-label">
                  <input type="checkbox" checked={isRotational} onChange={e => { setIsRotational(e.target.checked); setSelectedDrill(null); setSelectedRotDrills([]) }} /> Rotation (multiple drills)
                </label>
              </div>
              <div className="cat-tabs">
                {cats.map(c => <button key={c} className={`cat-btn${activeCat === c ? ' active' : ''}`} onClick={() => setActiveCat(c)}>{c}</button>)}
              </div>
              <div className="bank-grid">
                {filteredDrills.map(d => {
                  const sel = isRotational ? selectedRotDrills.some(x => x.id === d.id) : selectedDrill?.id === d.id
                  return (
                    <div key={d.id} className={`bank-card${sel ? ' selected' : ''}`} onClick={() => isRotational ? toggleRotDrill(d) : setSelectedDrill(d)}>
                      <span className="bank-icon">{d.icon || '🏃'}</span>
                      <div className="bank-info">
                        <div className="bank-name">{d.name}</div>
                        <div className="bank-desc">{d.description}</div>
                        {d.volunteerTip && <div className="bank-tip">💡 {d.volunteerTip}</div>}
                      </div>
                      <span className="bank-check">✓</span>
                    </div>
                  )
                })}
              </div>
              {isRotational && selectedRotDrills.length > 0 && (
                <div className="rot-calc">{selectedRotDrills.length} drills × {drillTime} min = {selectedRotDrills.length * drillTime} min total</div>
              )}
              <div className="time-input-row">
                <label>{isRotational ? 'Time per drill:' : 'Duration:'}</label>
                <input type="number" min="1" max="60" value={drillTime} onChange={e => setDrillTime(parseInt(e.target.value) || 12)} />
                <span className="min-label">min</span>
              </div>
              <button className="btn-confirm" disabled={isRotational ? selectedRotDrills.length === 0 : !selectedDrill} onClick={confirmDrill}>
                {editIdx !== null ? (isRotational ? 'Update Rotation' : 'Update Drill') : (isRotational ? 'Add Rotation' : 'Add Drill')}
              </button>
            </div>
          )}
          {panel === 'break' && (
            <div className="sub-panel active">
              <div className="break-preset-row">
                {[3, 5, 8, 10].map(m => <button key={m} className={`break-preset-btn${breakTime === m ? ' selected' : ''}`} onClick={() => setBreakTime(m)}>{m} min</button>)}
              </div>
              <div className="time-input-row">
                <label>Label:</label>
                <input type="text" value={breakLabel} onChange={e => setBreakLabel(e.target.value)} className="text-input-field" style={{ marginBottom: 0 }} />
              </div>
              <div className="time-input-row" style={{ marginTop: '.5rem' }}>
                <label>Duration:</label>
                <input type="number" min="1" max="30" value={breakTime} onChange={e => setBreakTime(parseInt(e.target.value) || 5)} />
                <span className="min-label">min</span>
              </div>
              <button className="btn-confirm" onClick={confirmBreak}>{editIdx !== null ? 'Update Break' : 'Add Break'}</button>
            </div>
          )}
          {panel === 'closing' && (
            <div className="sub-panel active">
              <div className="time-input-row">
                <label>Label:</label>
                <input type="text" value={closingName} onChange={e => setClosingName(e.target.value)} className="text-input-field" style={{ marginBottom: 0 }} />
              </div>
              <div className="time-input-row" style={{ marginTop: '.5rem' }}>
                <label>Duration:</label>
                <input type="number" min="1" max="30" value={closingTime} onChange={e => setClosingTime(parseInt(e.target.value) || 5)} />
                <span className="min-label">min</span>
              </div>
              <button className="btn-confirm" onClick={confirmClosing}>{editIdx !== null ? 'Update Closing' : 'Add Closing'}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PracticeBuilder({ initPlanId, onExit } = {}) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [view, setView] = useState('wizard')
  const [step, setStep] = useState(1)
  const [wiz, setWiz] = useState({ sport: null, sportName: null, sportIcon: null, durationMinutes: 75, hasWarmup: true, planName: '' })
  const [plan, setPlan] = useState(null)
  const [drillBank, setDrillBank] = useState(BASE_DRILL_BANK)
  const [showTips, setShowTips] = useState(true)
  const [showEquipment, setShowEquipment] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editIdx, setEditIdx] = useState(null)
  const [progCtx, setProgCtx] = useState(null)
  const [isDirty, setIsDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [pendingNav, setPendingNav] = useState(null)

  useEffect(() => {
    async function init() {
      try {
        const customs = await db.drills.list()
        if (customs.length > 0) {
          const merged = { ...BASE_DRILL_BANK }
          customs.forEach(d => {
            if (!d.sport || !d.id) return
            if (!merged[d.sport]) merged[d.sport] = []
            const idx = merged[d.sport].findIndex(x => x.id === d.id)
            if (idx >= 0) merged[d.sport][idx] = d; else merged[d.sport].push(d)
          })
          setDrillBank(merged)
        }
      } catch (e) { console.warn('[PracticeBuilder] mergeDrills:', e) }

      const programId = searchParams.get('programId')
      const weekNum = searchParams.get('week')
      const group = searchParams.get('group')
      const planId = initPlanId || searchParams.get('planId')
      const sport = searchParams.get('sport')
      const programName = searchParams.get('programName')

      if (programId) setProgCtx({ programId, weekNum: weekNum ? parseInt(weekNum) : null, group, planId, programName })

      if (planId) {
        try {
          const existing = await db.plans.get(planId)
          if (existing) { setPlan(existing); setView('builder'); return }
        } catch (e) { console.warn('[PracticeBuilder] plan load:', e) }
      }

      if (sport) {
        const s = SPORTS.find(x => x.id === sport)
        if (s) setWiz(prev => ({ ...prev, sport: s.id, sportName: s.name, sportIcon: s.icon, planName: s.name + ' Practice' }))
      }

      try {
        const saved = JSON.parse(localStorage.getItem('empowerPracticePlan') || 'null')
        if (saved && saved.sport && !planId) { setPlan(saved); setView('builder') }
      } catch (e) { /* ignore */ }
    }
    init()
  }, [])

  useEffect(() => {
    function onBeforeUnload(e) {
      if (isDirty) { e.preventDefault(); e.returnValue = '' }
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [isDirty])

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 2400) }

  function guardNav(fn) {
    if (isDirty) { setPendingNav(() => fn); setShowLeaveModal(true) }
    else fn()
  }

  function savePlanToStorage(p) { try { localStorage.setItem('empowerPracticePlan', JSON.stringify(p)) } catch (e) { /* ignore */ } }

  async function savePlanToDB(p) {
    try { return await db.plans.save(p) } catch (e) { console.warn('[PracticeBuilder] save:', e); return p }
  }

  function updatePlan(updater) {
    setPlan(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
      next.updatedAt = new Date().toISOString()
      savePlanToStorage(next)
      return next
    })
    setIsDirty(true)
  }

  async function startBuilder() {
    const p = {
      id: progCtx?.planId || null,
      name: wiz.planName || (wiz.sportName + ' Practice'),
      sport: wiz.sport, sportName: wiz.sportName, sportIcon: wiz.sportIcon,
      durationMinutes: wiz.durationMinutes, hasWarmup: wiz.hasWarmup, blocks: [],
      programId: progCtx?.programId || null,
      weekNum: progCtx?.weekNum || null,
      group: progCtx?.group || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const saved = await savePlanToDB(p)
    savePlanToStorage(saved)
    setPlan(saved)
    setIsDirty(false)
    setView('builder')
  }

  async function handleSave() {
    if (!plan) return
    setSaving(true)
    try {
      const saved = await savePlanToDB(plan)
      setPlan(saved)
      savePlanToStorage(saved)
      setIsDirty(false)
      showToast('✅ Plan saved!')
    } catch (e) {
      console.warn('[PracticeBuilder] save:', e)
      showToast('❌ Save failed — check connection')
    }
    setSaving(false)
  }

  function resetWizard() {
    guardNav(() => {
      localStorage.removeItem('empowerPracticePlan')
      setPlan(null); setWiz({ sport: null, sportName: null, sportIcon: null, durationMinutes: 75, hasWarmup: true, planName: '' }); setStep(1); setView('wizard')
    })
  }

  function openModal(idx = null) { setEditIdx(idx); setModalOpen(true) }
  function closeModal() { setModalOpen(false); setEditIdx(null) }

  function handleUpsert(block) {
    updatePlan(prev => {
      const blocks = [...prev.blocks]
      if (editIdx !== null) blocks[editIdx] = block; else blocks.push(block)
      return { ...prev, blocks }
    })
  }
  function handleRemove(idx) { updatePlan(prev => ({ ...prev, blocks: prev.blocks.filter((_, i) => i !== idx) })) }
  function handleDrop(from, to) {
    updatePlan(prev => {
      const blocks = [...prev.blocks]; const [moved] = blocks.splice(from, 1); blocks.splice(to, 0, moved); return { ...prev, blocks }
    })
  }

  function printPlan() {
    if (!plan) return
    const equipItems = collectEquipment(plan.blocks, drillBank)
    function blockHtml(block) {
      let inner = ''
      if (block.type === 'rotation') {
        inner = block.drills.map(d => `<div style="margin:.4rem 0;padding:.4rem .6rem;border-left:3px solid #7c3aed;"><strong>${d.icon || '🏃'} ${d.name}</strong> — ${block.timePerDrill} min<br/><small>${d.description || ''}</small></div>`).join('')
      } else if (block.type === 'drill' || block.type === 'warmup') {
        if (block.steps && block.steps.length) inner = '<ul style="margin:.3rem 0 0;padding-left:1.2rem;">' + block.steps.map(s => `<li>${s.icon || ''} ${s.text}</li>`).join('') + '</ul>'
        else if (block.description) inner = `<p style="margin:.2rem 0;">${block.description}</p>`
        if (block.why) inner += `<p style="margin:.2rem 0;color:#555;"><em>Why: ${block.why}</em></p>`
        if (block.volunteerTip) inner += `<p style="margin:.2rem 0;color:#555;"><em>💡 ${block.volunteerTip}</em></p>`
      }
      const colors = { warmup: '#f97316', drill: '#2563eb', rotation: '#7c3aed', break: '#0d9488', closing: '#16a34a' }
      const c = colors[block.type] || '#374151'
      return `<div style="margin:.75rem 0;padding:.6rem .9rem;border-left:4px solid ${c};border-radius:4px;background:#f9fafb;"><strong style="color:${c};">${block.name}</strong> <span style="float:right;font-weight:700;">${block.durationMinutes} min</span><br/>${inner}</div>`
    }
    const equipHtml = equipItems.length ? `<div style="margin-top:1.5rem;padding:1rem;border:2px solid #0d9488;border-radius:6px;"><h3 style="margin:0 0 .5rem;color:#0d9488;">🎒 Equipment Needed</h3><ul style="margin:0;padding-left:1.2rem;">${equipItems.map(i => `<li>☐ ${i}</li>`).join('')}</ul></div>` : ''
    const html = `<!DOCTYPE html><html><head><title>${plan.name}</title><style>body{font-family:system-ui,sans-serif;max-width:700px;margin:2rem auto;padding:0 1rem;color:#1f2937;}@media print{button{display:none}}</style></head><body><h1>${plan.sportIcon} ${plan.name}</h1><p style="color:#6b7280;">${plan.durationMinutes} min · ${plan.sport}</p>${plan.programId ? `<p style="color:#2563eb;">Week ${plan.weekNum} · ${plan.group}</p>` : ''}${plan.blocks.map(blockHtml).join('')}${equipHtml}<script>window.print();<\/script></body></html>`
    const w = window.open('', '_blank')
    if (w) { w.document.write(html); w.document.close() }
  }

  // ── Wizard ─────────────────────────────────────────────────
  if (view === 'wizard') {
    const stepDots = [1, 2, 3, 4].map(i => (
      <React.Fragment key={i}>
        <div className={`wizard-step-dot${step === i ? ' active' : ''}${i < step ? ' done' : ''}`}>{i < step ? '✓' : i}</div>
        {i < 4 && <div className="wizard-step-line" />}
      </React.Fragment>
    ))
    return (
      <main>
        {!onExit && progCtx && (
          <div className="prog-ctx-banner visible">
            <div className="prog-ctx-left">
              <span>📁</span><span className="prog-ctx-title">{progCtx.programName || 'Program'}</span>
              <span className="prog-ctx-sep">·</span><span className="prog-ctx-sub">Week {progCtx.weekNum} · {progCtx.group}</span>
            </div>
            <button className="btn-back-prog" onClick={() => { navigate('/programs') }}>← Back to Program</button>
          </div>
        )}
        {!onExit && (
          <section className="hero" style={{ padding: '2.5rem 1.5rem 3rem' }}>
            <div className="hero-badge">📋 Practice Builder</div>
            <h1 style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)' }}>Build Your <span>Practice Plan</span></h1>
            <p style={{ fontSize: '.97rem' }}>Set up your session in seconds — pick drills, set timing, and go.</p>
          </section>
        )}
        <div className="container-wide pb-container">
          <div className="pb-wizard">
            <div className="wizard-steps">{stepDots}</div>
            <div className={`wizard-panel${step === 1 ? ' active' : ''}`} data-testid="wizard-step-1">
              <div className="wizard-heading">Which sport?</div>
              <div className="wizard-sub">Choose the sport you're planning a session for.</div>
              <div className="sport-picker-grid">
                {SPORTS.map(s => (
                  <div key={s.id} className={`sport-pick-card${wiz.sport === s.id ? ' selected' : ''}`} data-testid={`sport-card-${s.id}`}
                    onClick={() => setWiz(prev => ({ ...prev, sport: s.id, sportName: s.name, sportIcon: s.icon }))}>
                    <span className="sport-pick-emoji">{s.icon}</span>
                    <div className="sport-pick-name">{s.name}</div>
                  </div>
                ))}
              </div>
              <div className="wizard-nav">
                <div />
                <button className="btn-wiz-next" data-testid="wizard-next-1" disabled={!wiz.sport} onClick={() => setStep(2)}>Next →</button>
              </div>
            </div>
            <div className={`wizard-panel${step === 2 ? ' active' : ''}`} data-testid="wizard-step-2">
              <div className="wizard-heading">How long is the practice?</div>
              <div className="wizard-sub">Pick a session length — you can fine-tune timing for each block afterward.</div>
              <div className="duration-pills">
                {[30, 45, 60, 75, 90].map(m => (
                  <button key={m} className={`dur-pill${wiz.durationMinutes === m ? ' selected' : ''}`} onClick={() => setWiz(prev => ({ ...prev, durationMinutes: m }))}>{m} min</button>
                ))}
              </div>
              <div className="custom-dur-row">
                <span style={{ fontSize: '.88rem', color: 'var(--gray-600)', fontWeight: 500 }}>Custom:</span>
                <input type="number" min="10" max="180" placeholder="— min" onChange={e => { if (e.target.value) setWiz(prev => ({ ...prev, durationMinutes: parseInt(e.target.value) || 75 })) }} />
                <span className="min-label">minutes</span>
              </div>
              <div className="wizard-nav">
                <button className="btn-wiz-back" data-testid="wizard-back-2" onClick={() => setStep(1)}>← Back</button>
                <button className="btn-wiz-next" data-testid="wizard-next-2" onClick={() => setStep(3)}>Next →</button>
              </div>
            </div>
            <div className={`wizard-panel${step === 3 ? ' active' : ''}`} data-testid="wizard-step-3">
              <div className="wizard-heading">Include a warmup?</div>
              <div className="wizard-sub">If yes, you'll pick from the warmup bank when building your plan.</div>
              <div className="warmup-choice-grid">
                <div className={`warmup-choice-card${wiz.hasWarmup ? ' selected' : ''}`} onClick={() => setWiz(prev => ({ ...prev, hasWarmup: true }))}>
                  <span className="warmup-choice-icon">🌟</span>
                  <div className="warmup-choice-label">Yes, include warmup</div>
                  <div className="warmup-choice-desc">I'll pick from the warmup bank</div>
                </div>
                <div className={`warmup-choice-card${!wiz.hasWarmup ? ' selected' : ''}`} onClick={() => setWiz(prev => ({ ...prev, hasWarmup: false }))}>
                  <span className="warmup-choice-icon">⏭️</span>
                  <div className="warmup-choice-label">No warmup</div>
                  <div className="warmup-choice-desc">Jump straight into drills</div>
                </div>
              </div>
              <div className="wizard-nav">
                <button className="btn-wiz-back" onClick={() => setStep(2)}>← Back</button>
                <button className="btn-wiz-next" data-testid="wizard-next-3" onClick={() => { setWiz(prev => ({ ...prev, planName: prev.planName || (prev.sportName + ' Practice') })); setStep(4) }}>Next →</button>
              </div>
            </div>
            <div className={`wizard-panel${step === 4 ? ' active' : ''}`} data-testid="wizard-step-4">
              <div className="wizard-heading">Ready to build!</div>
              <div className="wizard-sub">Here's your session setup — click below to start filling in your plan.</div>
              <div className="summary-card">
                <div className="summary-row"><span className="summary-label">Sport</span><span className="summary-value">{wiz.sportIcon} {wiz.sportName}</span></div>
                <div className="summary-row"><span className="summary-label">Session Length</span><span className="summary-value">{wiz.durationMinutes} minutes</span></div>
                <div className="summary-row"><span className="summary-label">Includes Warmup</span><span className="summary-value">{wiz.hasWarmup ? '✅ Yes' : '❌ No, jump straight to drills'}</span></div>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 600, color: 'var(--gray-600,#4b5563)', marginBottom: '.35rem' }}>Plan name</label>
                <input type="text" placeholder="e.g. Soccer Practice" value={wiz.planName}
                  onChange={e => setWiz(prev => ({ ...prev, planName: e.target.value }))}
                  style={{ width: '100%', padding: '.55rem .75rem', border: '1.5px solid var(--gray-200,#e5e7eb)', borderRadius: '.5rem', fontSize: '.95rem', boxSizing: 'border-box' }} />
              </div>
              <div className="wizard-nav">
                <button className="btn-wiz-back" onClick={() => setStep(3)}>← Back</button>
                <button className="btn-wiz-next" data-testid="wizard-next-4" style={{ background: 'var(--blue)' }} onClick={startBuilder}>🏗️ Build My Plan →</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // ── Builder ────────────────────────────────────────────────
  if (view === 'builder' && plan) {
    const used = minsUsed(plan.blocks)
    const left = plan.durationMinutes - used
    const over = left < 0
    const pct = Math.min((used / plan.durationMinutes) * 100, 100)
    const planSubLabel = plan.programId ? `Week ${plan.weekNum} · ${plan.group}` : 'Practice Plan'
    const equipItems = collectEquipment(plan.blocks, drillBank)

    return (
      <main data-testid="builder-view">
        {onExit && (
          <div className="pb-overlay-bar">
            <button className="btn-pb-overlay-close" onClick={() => guardNav(onExit)}>← Close Editor</button>
            <span className="pb-overlay-plan-name">{plan?.name || 'Edit Plan'}</span>
          </div>
        )}
        {!onExit && progCtx && (
          <div className="prog-ctx-banner visible">
            <div className="prog-ctx-left">
              <span>📁</span><span className="prog-ctx-title">{progCtx.programName || 'Program'}</span>
              <span className="prog-ctx-sep">·</span><span className="prog-ctx-sub">Week {progCtx.weekNum} · {progCtx.group}</span>
            </div>
            <button className="btn-back-prog" onClick={() => guardNav(() => navigate('/programs'))}>← Back to Program</button>
          </div>
        )}
        <div className="container-wide pb-container">
          <div className="pb-builder active">
            <div className="builder-header">
              <div className="bh-top">
                <div className="bh-sport">
                  <span className="bh-sport-icon">{plan.sportIcon}</span>
                  <div><div className="bh-sport-name">{plan.sportName}</div><div className="bh-sport-sub">{planSubLabel}</div></div>
                </div>
                <div className="time-chips">
                  <span className="time-chip tc-total">⏱ {plan.durationMinutes} min</span>
                  <span className="time-chip tc-used">Used: {used} min</span>
                  <span className={`time-chip ${over ? 'tc-over' : 'tc-left'}`}>{over ? `⚠️ Over by ${Math.abs(left)} min` : `${left} min left`}</span>
                </div>
                {isDirty && <span className="pb-dirty-badge">● Unsaved</span>}
                <button className="btn-pb-save" onClick={handleSave} disabled={saving || !isDirty}>
                  {saving ? 'Saving…' : 'Save Plan'}
                </button>
                <button className="btn-print" onClick={printPlan}>🖨️ Print Plan</button>
                {plan?.id && <button className="btn-story" onClick={() => guardNav(() => navigate(`/social-story?planId=${encodeURIComponent(plan.id)}`))}>📖 Social Story</button>}
                <button className="btn-new-plan" onClick={resetWizard}>↩ New Plan</button>
              </div>
              <div style={{ padding: '.3rem .1rem .1rem' }}>
                <input type="text" value={plan.name} onChange={e => updatePlan({ name: e.target.value })}
                  style={{ width: '100%', maxWidth: 380, padding: '.4rem .65rem', border: '1.5px solid var(--gray-200,#e5e7eb)', borderRadius: '.5rem', fontSize: '.9rem', fontWeight: 600, color: 'var(--blue)', background: 'transparent', boxSizing: 'border-box' }} />
              </div>
              <div className="bh-opts">
                <span className="bh-opts-label">Show:</span>
                <label className={`print-opt-pill${showTips ? ' active' : ''}`}>
                  <input type="checkbox" checked={showTips} onChange={e => setShowTips(e.target.checked)} />💡 Tips
                </label>
                <label className={`print-opt-pill${showEquipment ? ' active' : ''}`}>
                  <input type="checkbox" checked={showEquipment} onChange={e => setShowEquipment(e.target.checked)} />🎒 Equipment
                </label>
              </div>
            </div>
            <div className="progress-bar">
              <div className={`progress-bar-fill${over ? ' over' : ''}`} style={{ width: `${pct}%` }} />
            </div>
            <div className="timeline">
              {plan.blocks.length === 0 && (
                <div className="empty-state">
                  <span className="es-icon">📋</span>
                  <span className="es-text">Your plan is empty — click below to add your first block.</span>
                </div>
              )}
              {plan.blocks.map((block, idx) => (
                <PlanBlock key={idx} block={block} idx={idx} onEdit={openModal} onRemove={handleRemove} onDrop={handleDrop} showTips={showTips} showEquipment={showEquipment} />
              ))}
              {left > 0 && (
                <div className="remaining-block" onClick={() => openModal()}>
                  <span className="rem-icon">⬜</span>
                  <div className="rem-text"><div className="rem-title">{left} min unscheduled</div><div className="rem-sub">Click "+ Add Block" to fill this time</div></div>
                  <span style={{ color: 'var(--orange)', fontWeight: 700 }}>＋</span>
                </div>
              )}
              {left === 0 && (
                <div className="remaining-block complete">
                  <span className="rem-icon">✅</span>
                  <div className="rem-text"><div className="rem-title" style={{ color: '#16a34a' }}>Plan complete — all {plan.durationMinutes} min scheduled!</div><div className="rem-sub">Review and adjust as needed.</div></div>
                </div>
              )}
              {over && (
                <div className="remaining-block over">
                  <span className="rem-icon">⚠️</span>
                  <div className="rem-text"><div className="rem-title" style={{ color: 'var(--red)' }}>Over by {Math.abs(left)} min</div><div className="rem-sub">Remove or shorten a block to fit.</div></div>
                </div>
              )}
            </div>
            <div style={{ padding: '.75rem 0' }}>
              <button className="btn-add-block" data-testid="add-block-btn" disabled={left <= 0} onClick={() => openModal()}>+ Add Block</button>
            </div>
            {showEquipment && equipItems.length > 0 && (
              <div className="equip-checklist">
                <div className="equip-title">🎒 Equipment Needed</div>
                <ul className="equip-list">
                  {equipItems.map((item, i) => <li key={i} className="equip-item"><span className="equip-check">☐</span>{item}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
        <Modal open={modalOpen} onClose={closeModal} plan={plan} drillBank={drillBank} editIdx={editIdx} onUpsert={handleUpsert} />

        {showLeaveModal && (
          <div className="ss-blocker-overlay" onClick={e => { if (e.target === e.currentTarget) setShowLeaveModal(false) }}>
            <div className="ss-blocker-modal">
              <div className="ss-blocker-icon">⚠️</div>
              <h3>Unsaved Changes</h3>
              <p>You have unsaved changes to this plan. If you leave now they will be lost.</p>
              <div className="ss-blocker-actions">
                <button className="btn-blocker-leave" onClick={() => { setShowLeaveModal(false); if (pendingNav) { pendingNav(); setPendingNav(null) } }}>Leave without saving</button>
                <button className="btn-blocker-stay" onClick={() => { setShowLeaveModal(false); setPendingNav(null) }}>Stay and save</button>
              </div>
            </div>
          </div>
        )}

        {toast && <div className="toast show">{toast}</div>}
      </main>
    )
  }

  return <main><div className="container-wide" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div></main>
}
