import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { seedTeamData, seedTeamEvents, sortEvents, emptyPlan } from '../../data/teamMock'
import { loadTeamData, saveTeamData, clearTeamData, newId } from '../../data/teamStore'
import { todayISO } from '../../data/dates'

// Shared state for the team-based profile: teams (setup + roster), the account's players,
// events, one plan per event, and which team is selected (null = all teams).
// Saved per account in localStorage; the Soccer demo login starts with demo teams.
const TeamCtx = createContext(null)

const emptyData = () => ({ teams: [], players: {}, plans: {}, events: [] })
const initialData = account =>
  loadTeamData(account.email) ?? (account.sport === 'soccer' ? seedTeamData() : emptyData())

export function TeamProvider({ account, children }) {
  const [data, setData]     = useState(() => initialData(account))
  const [teamId, setTeamId] = useState(null)

  useEffect(() => { saveTeamData(account.email, data) }, [account.email, data])

  const value = useMemo(() => {
    const { teams, players, plans } = data
    const today = todayISO()
    // Demo schedule is regenerated relative to today; events added by the coach are saved
    const events = sortEvents([...seedTeamEvents(teams), ...data.events])
    const upcoming = events.filter(e => e.date >= today)
    const activeTeams = teams.filter(t => !t.archived)
    const teamById = id => teams.find(t => t.id === id)
    const update = fn => setData(d => ({ ...d, ...fn(d) }))

    return {
      sport: account.sport,
      teams,
      activeTeams,
      teamById,
      teamId,
      team: teamById(teamId) ?? null,
      setTeamId,
      players,

      // Roster as display rows: { id (player id), name, number }
      rosterOf: team => team.roster.map(r => ({ id: r.playerId, name: players[r.playerId]?.name ?? 'Unknown', number: r.number })),

      // draft: team fields + roster rows [{ playerId?, name, number }] — rows without a playerId are new players
      createTeam(draft) {
        const id = newId('t')
        update(d => {
          const { roster, newPlayers } = resolveRoster(draft.roster, d.players)
          return {
            players: { ...d.players, ...newPlayers },
            teams: [...d.teams, { ...draft, id, sport: account.sport, roster }],
          }
        })
        return id
      },
      updateTeam: (id, patch) => update(d => ({ teams: d.teams.map(t => (t.id === id ? { ...t, ...patch } : t)) })),
      setRoster: (id, rows) => update(d => {
        const { roster, newPlayers } = resolveRoster(rows, d.players)
        return {
          players: { ...d.players, ...newPlayers },
          teams: d.teams.map(t => (t.id === id ? { ...t, roster } : t)),
        }
      }),
      renamePlayer: (playerId, name) => update(d => ({ players: { ...d.players, [playerId]: { ...d.players[playerId], name } } })),
      deleteTeam(id) {
        update(d => ({ teams: d.teams.filter(t => t.id !== id), events: d.events.filter(e => e.teamId !== id) }))
        if (teamId === id) setTeamId(null)
      },
      resetDemo() {
        clearTeamData(account.email)
        setTeamId(null)
        setData(account.sport === 'soccer' ? seedTeamData() : emptyData())
      },

      events,
      // Upcoming events for the selected team, or every active team when none is selected
      scopedUpcoming: teamId ? upcoming.filter(e => e.teamId === teamId) : upcoming.filter(e => !teamById(e.teamId)?.archived),
      upcomingFor: id => upcoming.filter(e => e.teamId === id),
      eventById: id => events.find(e => e.id === id),
      addEvent(event) {
        const id = newId('e')
        update(d => ({ events: [...d.events, { ...event, id }] }))
        return id
      },

      plans,
      planFor: event => plans[event.id],
      ensurePlan: event => update(d => (d.plans[event.id] ? {} : { plans: { ...d.plans, [event.id]: emptyPlan(event) } })),
      savePlan: (eventId, plan) => update(d => ({ plans: { ...d.plans, [eventId]: plan } })),
    }
  }, [account.email, account.sport, data, teamId])

  return <TeamCtx.Provider value={value}>{children}</TeamCtx.Provider>
}

// Rows → roster entries; rows without a playerId become new account-wide players.
// A returning player's edited name updates them everywhere (same kid, every team).
function resolveRoster(rows, players) {
  const newPlayers = {}
  const roster = rows
    .filter(r => r.playerId || r.name.trim())
    .map(r => {
      if (r.playerId && players[r.playerId]) {
        const name = r.name.trim()
        if (name && name !== players[r.playerId].name) newPlayers[r.playerId] = { ...players[r.playerId], name }
        return { playerId: r.playerId, number: r.number }
      }
      const id = newId('p')
      newPlayers[id] = { id, name: r.name.trim() }
      return { playerId: id, number: r.number }
    })
  return { roster, newPlayers }
}

export const useTeams = () => useContext(TeamCtx)
