import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AGE_GROUPS, TEAM_COLORS, setupFor, unitsFor, formatLabel } from '../../data/sportFormats'
import { sportById } from '../../data/sports'
import { useTeams } from './TeamContext'
import { FormatEditor, RosterEditor } from './TeamSetupParts'
import '../Screen.css'
import '../shared.css'
import './team.css'

// /teams/new — New Team wizard: 1 · Team → 2 · Format & positions → 3 · Roster → 4 · Review.
const STEPS = ['Team', 'Format', 'Roster', 'Review']

// "Fall 2026" from July on, otherwise "Spring 2026"
function currentSeason() {
  const d = new Date()
  return `${d.getMonth() >= 6 ? 'Fall' : 'Spring'} ${d.getFullYear()}`
}

export default function TeamSetup() {
  const { sport, teams, players, createTeam, setTeamId } = useTeams()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)

  const [name, setName]         = useState('')
  const [ageGroup, setAgeGroup] = useState('U12')
  const [season, setSeason]     = useState(currentSeason)
  const [color, setColor]       = useState(TEAM_COLORS[teams.length % TEAM_COLORS.length])
  const [format, setFormat]     = useState(null)   // { formatId, units, customCount } — set when step 2 opens
  const [rows, setRows]         = useState([])

  // Format defaults follow the age group until the coach picks one
  const formatOrDefault = format ?? (() => {
    const formatId = setupFor(sport).defaultFormat(ageGroup)
    return { formatId, customCount: 7, units: unitsFor(sport, formatId) }
  })()

  const canNext = [name.trim().length > 0, formatOrDefault.units.every(u => u.positions.length), true, true][step]

  function next() {
    if (step === 1 && !format) setFormat(formatOrDefault)
    setStep(s => s + 1)
  }

  function create() {
    const id = createTeam({ name: name.trim(), ageGroup, season: season.trim(), color, ...formatOrDefault, roster: rows })
    setTeamId(id)
    navigate(`/teams/${id}?new=1`)
  }

  const s = sportById(sport)

  return (
    <div className="screen">
      <Link to="/teams" className="back-link">‹ Teams</Link>
      <div className="screen-header">
        <div className="header-eyebrow">{s ? `${s.icon} ${s.label} · ` : ''}New Team</div>
        <h1>{name.trim() || 'Team Setup'}</h1>
      </div>

      <ol className="setup-steps">
        {STEPS.map((label, i) => (
          <li key={label} className={`setup-step ${i === step ? 'is-current' : ''} ${i < step ? 'is-done' : ''}`}>
            <span className="setup-step-num">{i < step ? '✓' : i + 1}</span>{label}
          </li>
        ))}
      </ol>

      <div className="card setup-card">
        {step === 0 && (
          <div className="setup-fields">
            <label className="np-field">
              <span>Team name</span>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. BDU U12 Blue" autoFocus />
            </label>
            <div className="add-event-row">
              <label className="np-field">
                <span>Age group</span>
                <select value={ageGroup} onChange={e => { setAgeGroup(e.target.value); setFormat(null) }}>
                  {AGE_GROUPS.map(a => <option key={a}>{a}</option>)}
                </select>
              </label>
              <label className="np-field">
                <span>Season</span>
                <input value={season} onChange={e => setSeason(e.target.value)} placeholder="Fall 2026" />
              </label>
            </div>
            <div className="np-field">
              <span>Team color</span>
              <div className="swatches">
                {TEAM_COLORS.map(c => (
                  <button key={c} type="button" className={`swatch ${color === c ? 'is-selected' : ''}`} style={{ background: c }} onClick={() => setColor(c)} aria-label={`Color ${c}`} aria-pressed={color === c} />
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <>
            <p className="setup-hint">Defaults are set for {ageGroup}. Change the format or formation, and rename, add or remove positions for this team.</p>
            <FormatEditor sport={sport} value={formatOrDefault} onChange={setFormat} />
          </>
        )}

        {step === 2 && (
          <>
            <p className="setup-hint">Start fresh, or roll over a roster from another team and add or remove players. Returning players keep their history.</p>
            <RosterEditor rows={rows} onChange={setRows} teams={teams} players={players} />
          </>
        )}

        {step === 3 && (
          <dl className="review">
            <div><dt>Team</dt><dd><span className="team-dot" style={{ background: color }} />{name.trim()}</dd></div>
            <div><dt>Age · Season</dt><dd>{ageGroup}{season.trim() ? ` · ${season.trim()}` : ''}</dd></div>
            <div><dt>Format</dt><dd>{formatLabel({ sport, ...formatOrDefault })}</dd></div>
            {formatOrDefault.units.map(u => (
              <div key={u.id}><dt>{u.label}</dt><dd>{u.positions.map(p => p.label).join(', ')}</dd></div>
            ))}
            <div>
              <dt>Roster</dt>
              <dd>
                {rows.filter(r => r.playerId || r.name.trim()).length} players
                {rows.some(r => r.playerId) && ` (${rows.filter(r => r.playerId).length} returning)`}
              </dd>
            </div>
          </dl>
        )}
      </div>

      <div className="setup-nav">
        {step > 0 && <button type="button" className="btn-ghost" onClick={() => setStep(s => s - 1)}>Back</button>}
        {step < STEPS.length - 1
          ? <button type="button" className="btn-primary" disabled={!canNext} onClick={next}>Next</button>
          : <button type="button" className="btn-primary" onClick={create}>Create team</button>}
      </div>
    </div>
  )
}
