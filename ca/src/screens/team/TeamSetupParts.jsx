import { useState } from 'react'
import { formatsFor, formationsFor, unitsFor } from '../../data/sportFormats'
import { fromInputTime } from '../../data/teamMock'
import { newId } from '../../data/teamStore'
import { addDays, todayISO } from '../../data/dates'

// ── Format → formation → positions ──
// value: { formatId, customCount, units: [{ id, label, formationId, positions: [{ id, label }] }] }
export function FormatEditor({ sport, value, onChange }) {
  const formats = formatsFor(sport)
  const { formatId, units, customCount = 7 } = value

  const pickFormat = id => onChange({ formatId: id, customCount, units: unitsFor(sport, id, {}, customCount) })

  // Custom count: keep the labels already typed, add or drop slots at the end
  const setCount = n => {
    const count = Math.max(1, Math.min(15, n || 1))
    onChange({
      ...value,
      customCount: count,
      units: units.map(u => ({
        ...u,
        positions: count <= u.positions.length
          ? u.positions.slice(0, count)
          : [...u.positions, ...Array.from({ length: count - u.positions.length }, (_, i) => ({ id: newId(u.id), label: `Pos ${u.positions.length + i + 1}` }))],
      })),
    })
  }

  const setUnit = (unitId, patch) => onChange({ ...value, units: units.map(u => (u.id === unitId ? { ...u, ...patch } : u)) })
  const pickFormation = (unitId, formationId) => {
    const fresh = unitsFor(sport, formatId, { [unitId]: formationId }).find(u => u.id === unitId)
    setUnit(unitId, fresh)
  }

  return (
    <div className="fmt-editor">
      <div className="np-step-label">Players at a time</div>
      <div className="fmt-options">
        {formats.map(f => (
          <button
            key={f.id}
            type="button"
            className={`fmt-option ${formatId === f.id ? 'is-selected' : ''}`}
            onClick={() => formatId !== f.id && pickFormat(f.id)}
            aria-pressed={formatId === f.id}
          >
            <span className="fmt-option-label">{f.label}</span>
            <span className="fmt-option-sub">{f.sub}</span>
          </button>
        ))}
      </div>

      {formatId === 'custom' && (
        <label className="np-field fmt-count">
          <span>How many {units.length > 1 ? 'per side of the ball' : 'on the field'}?</span>
          <input type="number" min="1" max="15" value={customCount} onChange={e => setCount(Number(e.target.value))} />
        </label>
      )}

      {units.map(u => {
        const formations = formationsFor(sport, formatId, u.id)
        return (
          <div key={u.id} className="fmt-unit">
            <div className="fmt-unit-head">
              <span className="fmt-unit-label">{u.label} · {u.positions.length}</span>
              {formatId !== 'custom' && (
                <button type="button" className="link-btn section-link" onClick={() => pickFormation(u.id, u.formationId)}>Reset positions</button>
              )}
            </div>
            {formations.length > 1 && (
              <div className="filter-chips fmt-formations">
                {formations.map(f => (
                  <button key={f.id} type="button" className={`chip ${u.formationId === f.id ? 'active' : ''}`} onClick={() => pickFormation(u.id, f.id)}>
                    {f.label}
                  </button>
                ))}
              </div>
            )}
            <div className="pos-grid">
              {u.positions.map(p => (
                <span key={p.id} className="pos-slot">
                  <input
                    value={p.label}
                    aria-label="Position name"
                    onChange={e => setUnit(u.id, { positions: u.positions.map(x => (x.id === p.id ? { ...x, label: e.target.value } : x)) })}
                  />
                  {formatId === 'custom' ? null : (
                    <button
                      type="button"
                      aria-label={`Remove ${p.label}`}
                      disabled={u.positions.length <= 1}
                      onClick={() => setUnit(u.id, { positions: u.positions.filter(x => x.id !== p.id) })}
                    >✕</button>
                  )}
                </span>
              ))}
              {formatId !== 'custom' && (
                <button
                  type="button"
                  className="pos-add"
                  onClick={() => setUnit(u.id, { positions: [...u.positions, { id: newId(u.id), label: 'New' }] })}
                >+ Position</button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Roster rows: [{ key, playerId?, name, number }] — rows without playerId are new players ──
export const rowsFromTeam = (team, players) =>
  team.roster.map(r => ({ key: r.playerId, playerId: r.playerId, name: players[r.playerId]?.name ?? '', number: r.number ?? '' }))

export function RosterEditor({ rows, onChange, teams, players, excludeTeamId }) {
  const [rollFrom, setRollFrom] = useState(null)
  const onRoster = new Set(rows.map(r => r.playerId).filter(Boolean))
  const sources = teams.filter(t => t.id !== excludeTeamId && t.roster.length)
  const source = sources.find(t => t.id === rollFrom)
  const available = source ? source.roster.filter(r => !onRoster.has(r.playerId)) : []

  const setRow = (key, patch) => onChange(rows.map(r => (r.key === key ? { ...r, ...patch } : r)))
  const addBlank = () => onChange([...rows, { key: newId('row'), name: '', number: '' }])
  const addFrom = entries => onChange([
    ...rows,
    ...entries.map(r => ({ key: r.playerId, playerId: r.playerId, name: players[r.playerId]?.name ?? '', number: r.number ?? '' })),
  ])

  return (
    <div className="roster-editor">
      {sources.length > 0 && (
        <div className="rollover">
          <div className="np-step-label">Roll over players from a team</div>
          <div className="filter-chips">
            {sources.map(t => (
              <button key={t.id} type="button" className={`chip ${rollFrom === t.id ? 'active' : ''}`} onClick={() => setRollFrom(rollFrom === t.id ? null : t.id)}>
                {t.name}{t.season ? ` · ${t.season}` : ''}
              </button>
            ))}
          </div>
          {source && (
            <div className="rollover-pick">
              {available.length ? (
                <>
                  <button type="button" className="btn-primary rollover-all" onClick={() => { addFrom(available); setRollFrom(null) }}>
                    Add all {available.length} from {source.name}
                  </button>
                  <div className="bench">
                    {available.map(r => (
                      <button key={r.playerId} type="button" className="bench-chip is-add" onClick={() => addFrom([r])}>
                        + {players[r.playerId]?.name}
                      </button>
                    ))}
                  </div>
                </>
              ) : <span className="empty-note">Everyone from {source.name} is already on this roster.</span>}
            </div>
          )}
        </div>
      )}

      <div className="roster-head">
        <span className="np-step-label">Roster · {rows.length} players</span>
      </div>
      {rows.length ? (
        <ul className="roster-rows">
          {rows.map(r => (
            <li key={r.key} className="roster-row">
              <input
                className="roster-num"
                inputMode="numeric"
                placeholder="#"
                aria-label="Jersey number"
                value={r.number}
                onChange={e => setRow(r.key, { number: e.target.value.replace(/\D/g, '').slice(0, 3) })}
              />
              <input
                className="roster-name"
                placeholder="Player name"
                aria-label="Player name"
                value={r.name}
                onChange={e => setRow(r.key, { name: e.target.value })}
              />
              {r.playerId && <span className="roster-tag" title="Already on your account — keeps their history">Returning</span>}
              <button type="button" className="roster-remove" aria-label={`Remove ${r.name || 'player'}`} onClick={() => onChange(rows.filter(x => x.key !== r.key))}>✕</button>
            </li>
          ))}
        </ul>
      ) : <div className="card empty-note">No players yet. Roll over a roster above or add players.</div>}
      <button type="button" className="btn-ghost roster-add" onClick={addBlank}>+ Add player</button>
    </div>
  )
}

// ── Quick add: schedule a game or practice for one team ──
export function AddEventForm({ teamId, defaultType = 'game', onSave, onCancel }) {
  const [type, setType]   = useState(defaultType)
  const [date, setDate]   = useState(addDays(todayISO(), 7))
  const [time, setTime]   = useState('09:00')
  const [opponent, setOp] = useState('')
  const [home, setHome]   = useState(true)
  const [location, setLoc] = useState('')

  const canSave = date && time && (type === 'practice' || opponent.trim())

  function save(e) {
    e.preventDefault()
    if (!canSave) return
    onSave({
      teamId, type, date, time: fromInputTime(time),
      ...(type === 'game'
        ? { opponent: opponent.trim(), home, location: location.trim() || (home ? 'Home' : 'Away') }
        : { location: location.trim() || 'Practice field' }),
    })
  }

  return (
    <form className="card add-event" onSubmit={save}>
      <div className="filter-chips">
        {['game', 'practice'].map(t => (
          <button key={t} type="button" className={`chip ${type === t ? 'active' : ''}`} onClick={() => setType(t)}>
            {t === 'game' ? 'Game' : 'Practice'}
          </button>
        ))}
      </div>
      {type === 'game' && (
        <label className="np-field">
          <span>Opponent</span>
          <input value={opponent} onChange={e => setOp(e.target.value)} placeholder="e.g. Riverside United" />
        </label>
      )}
      <div className="add-event-row">
        <label className="np-field"><span>Date</span><input type="date" value={date} onChange={e => setDate(e.target.value)} /></label>
        <label className="np-field"><span>Time</span><input type="time" value={time} onChange={e => setTime(e.target.value)} /></label>
      </div>
      {type === 'game' && (
        <div className="filter-chips">
          {[[true, 'Home'], [false, 'Away']].map(([v, label]) => (
            <button key={label} type="button" className={`chip ${home === v ? 'active' : ''}`} onClick={() => setHome(v)}>{label}</button>
          ))}
        </div>
      )}
      <label className="np-field">
        <span>Location (optional)</span>
        <input value={location} onChange={e => setLoc(e.target.value)} placeholder={type === 'game' ? 'Field or address' : 'Practice field'} />
      </label>
      <div className="add-event-actions">
        {onCancel && <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>}
        <button type="submit" className="btn-primary" disabled={!canSave}>Add {type}</button>
      </div>
    </form>
  )
}
