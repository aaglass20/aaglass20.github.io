import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AGE_GROUPS, TEAM_COLORS, formatLabel } from '../../data/sportFormats'
import { fmtRelative } from '../../data/dates'
import { useTeams } from './TeamContext'
import { FormatEditor, RosterEditor, AddEventForm, rowsFromTeam } from './TeamSetupParts'
import '../Screen.css'
import '../shared.css'
import './team.css'

// /teams/:teamId — one team's setup: info, format & positions, roster, schedule. Info + format save as you go;
// roster edits are a draft until Save (so typing a new name doesn't create a player per keystroke).
export default function TeamDetail() {
  const { teamId } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { teamById, teams, players, updateTeam, setRoster, deleteTeam, upcomingFor, addEvent, ensurePlan, setTeamId, teamId: selectedId } = useTeams()
  const team = teamById(teamId)
  const [rows, setRows]       = useState(() => (team ? rowsFromTeam(team, players) : []))
  const [adding, setAdding]   = useState(false)
  const [editFmt, setEditFmt] = useState(false)

  // After a save (or switching teams) the draft starts again from the saved roster
  useEffect(() => { if (team) setRows(rowsFromTeam(team, players)) }, [team?.id, team?.roster, players])

  if (!team) {
    return (
      <div className="screen">
        <Link to="/teams" className="back-link">‹ Teams</Link>
        <div className="card empty-note">That team wasn't found.</div>
      </div>
    )
  }

  const saved = rowsFromTeam(team, players)
  const dirty = JSON.stringify(rows.map(({ key, ...r }) => r)) !== JSON.stringify(saved.map(({ key, ...r }) => r))
  const upcoming = upcomingFor(team.id)
  const nextGame = upcoming.find(e => e.type === 'game')
  const set = patch => updateTeam(team.id, patch)

  function planGame(event) {
    ensurePlan(event)
    navigate(`/plan/${event.id}`)
  }

  return (
    <div className="screen">
      <Link to="/teams" className="back-link">‹ Teams</Link>

      <div className="screen-header space-between">
        <div>
          <div className="header-eyebrow">
            <span className="team-dot" style={{ background: team.color }} />{team.season || 'Team'}{team.archived ? ' · Archived' : ''}
          </div>
          <h1>{team.name}</h1>
          <div className="editor-meta">{team.ageGroup} · {formatLabel(team)} · {team.roster.length} players</div>
        </div>
        {!team.archived && (
          <button type="button" className={selectedId === team.id ? 'btn-ghost' : 'btn-primary'} onClick={() => setTeamId(selectedId === team.id ? null : team.id)}>
            {selectedId === team.id ? 'Selected ✓' : 'Select team'}
          </button>
        )}
      </div>

      {params.get('new') && (
        <div className="card created-note">
          <strong>Team created.</strong> Next, add a game to the schedule and build its game plan.
          {!adding && <button type="button" className="btn-primary" onClick={() => setAdding(true)}>+ Add a game</button>}
        </div>
      )}

      {/* ── Schedule ── */}
      <section className="section">
        <div className="section-title-row">
          <h2 className="section-title">Schedule · {upcoming.length} upcoming</h2>
          {!adding && <button type="button" className="section-link link-btn" onClick={() => setAdding(true)}>+ Add event</button>}
        </div>
        {adding && (
          <AddEventForm
            teamId={team.id}
            onCancel={() => setAdding(false)}
            onSave={ev => {
              const id = addEvent(ev)
              setAdding(false)
              if (ev.type === 'game') planGame({ ...ev, id })
            }}
          />
        )}
        {upcoming.length ? (
          <div className="plan-rows">
            {upcoming.slice(0, 6).map(e => (
              <Link key={e.id} to={`/plan/${e.id}`} className="plan-row">
                <span className={`type-pill is-${e.type}`}>{e.type === 'game' ? 'Game' : 'Practice'}</span>
                <span className="plan-row-main">
                  <span className="plan-row-title">{e.type === 'game' ? `vs ${e.opponent}` : 'Practice'}</span>
                  <span className="plan-row-sub">{fmtRelative(e.date)} · {e.time} · {e.location}</span>
                </span>
                <span className="chevron">›</span>
              </Link>
            ))}
          </div>
        ) : !adding && <div className="card empty-note">Nothing scheduled.</div>}
        {nextGame && !adding && (
          <button type="button" className="btn-primary team-plan-btn" onClick={() => planGame(nextGame)}>
            Game plan for vs {nextGame.opponent} ›
          </button>
        )}
      </section>

      {/* ── Info ── */}
      <section className="section">
        <h2 className="section-title">Team Info</h2>
        <div className="card setup-fields">
          <label className="np-field"><span>Team name</span><input value={team.name} onChange={e => set({ name: e.target.value })} /></label>
          <div className="add-event-row">
            <label className="np-field">
              <span>Age group</span>
              <select value={team.ageGroup} onChange={e => set({ ageGroup: e.target.value })}>
                {AGE_GROUPS.map(a => <option key={a}>{a}</option>)}
              </select>
            </label>
            <label className="np-field"><span>Season</span><input value={team.season ?? ''} onChange={e => set({ season: e.target.value })} /></label>
          </div>
          <div className="np-field">
            <span>Team color</span>
            <div className="swatches">
              {TEAM_COLORS.map(c => (
                <button key={c} type="button" className={`swatch ${team.color === c ? 'is-selected' : ''}`} style={{ background: c }} onClick={() => set({ color: c })} aria-label={`Color ${c}`} aria-pressed={team.color === c} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Format ── */}
      <section className="section">
        <div className="section-title-row">
          <h2 className="section-title">Format & Positions</h2>
          <button type="button" className="section-link link-btn" onClick={() => setEditFmt(v => !v)}>{editFmt ? 'Done' : 'Edit'}</button>
        </div>
        <div className="card">
          {editFmt ? (
            <>
              <p className="setup-hint">Changing the format or formation resets positions, and players in removed spots drop out of existing lineups.</p>
              <FormatEditor
                sport={team.sport}
                value={{ formatId: team.formatId, units: team.units, customCount: team.customCount }}
                onChange={v => set(v)}
              />
            </>
          ) : (
            <dl className="review">
              <div><dt>Format</dt><dd>{formatLabel(team)}</dd></div>
              {team.units.map(u => (
                <div key={u.id}><dt>{u.label}</dt><dd>{u.positions.map(p => p.label).join(', ')}</dd></div>
              ))}
            </dl>
          )}
        </div>
      </section>

      {/* ── Roster ── */}
      <section className="section">
        <h2 className="section-title">Roster</h2>
        <div className="card">
          <RosterEditor rows={rows} onChange={setRows} teams={teams} players={players} excludeTeamId={team.id} />
        </div>
        {dirty && (
          <div className="save-bar">
            <span>Unsaved roster changes</span>
            <button type="button" className="btn-ghost" onClick={() => setRows(saved)}>Discard</button>
            <button type="button" className="btn-primary" onClick={() => setRoster(team.id, rows)}>Save roster</button>
          </div>
        )}
      </section>

      {/* ── Manage ── */}
      <section className="section team-manage">
        <button type="button" className="btn-ghost" onClick={() => set({ archived: !team.archived })}>
          {team.archived ? 'Restore to active' : 'Archive (past season)'}
        </button>
        <button
          type="button"
          className="btn-ghost is-danger"
          onClick={() => {
            if (!window.confirm(`Delete ${team.name}? Its roster stays on your account, but the team and its added events are removed.`)) return
            deleteTeam(team.id)
            navigate('/teams')
          }}
        >
          Delete team
        </button>
      </section>
    </div>
  )
}
