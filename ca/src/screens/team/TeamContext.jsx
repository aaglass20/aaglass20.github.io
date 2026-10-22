import { createContext, useContext, useMemo, useState } from 'react'
import { TEAMS, seedTeamEvents, seedPlans, emptyPlan } from '../../data/teamMock'
import { todayISO } from '../../data/dates'

// Shared state for the team-based profile: which team is selected (null = all teams),
// the event schedule, and one plan per event. Mocked in memory.
const TeamCtx = createContext(null)

export function TeamProvider({ children }) {
  const [teamId, setTeamId] = useState(null)
  const [events]            = useState(seedTeamEvents)
  const [plans, setPlans]   = useState(seedPlans)

  const value = useMemo(() => {
    const today = todayISO()
    const upcoming = events.filter(e => e.date >= today)
    return {
      teams: TEAMS,
      teamId,
      team: TEAMS.find(t => t.id === teamId) ?? null,
      setTeamId,
      events,
      // Upcoming events for the selected team, or every team when none is selected
      scopedUpcoming: teamId ? upcoming.filter(e => e.teamId === teamId) : upcoming,
      upcomingFor: id => upcoming.filter(e => e.teamId === id),
      eventById: id => events.find(e => e.id === id),
      plans,
      planFor: event => plans[event.id],
      ensurePlan: event => setPlans(p => (p[event.id] ? p : { ...p, [event.id]: emptyPlan(event) })),
      savePlan: (eventId, plan) => setPlans(p => ({ ...p, [eventId]: plan })),
    }
  }, [teamId, events, plans])

  return <TeamCtx.Provider value={value}>{children}</TeamCtx.Provider>
}

export const useTeams = () => useContext(TeamCtx)
