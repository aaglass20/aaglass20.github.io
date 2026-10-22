import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navigation from './components/Navigation'
import TopBar from './components/TopBar'
import LandingScreen from './screens/LandingScreen'
import LoginScreen from './screens/LoginScreen'
import SignupWizard from './screens/SignupWizard'
import HomeScreen from './screens/HomeScreen'
import DrillsScreen from './screens/DrillsScreen'
import PracticeScreen from './screens/PracticeScreen'
import RosterScreen from './screens/RosterScreen'
import ToolsScreen from './screens/ToolsScreen'
import AdaptiveHomeScreen from './screens/adaptive/AdaptiveHomeScreen'
import ProgramsScreen from './screens/adaptive/ProgramsScreen'
import EventsScreen from './screens/adaptive/EventsScreen'
import { seedPrograms } from './data/adaptiveMock'
import { TeamProvider } from './screens/team/TeamContext'
import TeamHomeScreen from './screens/team/TeamHomeScreen'
import TeamEventsScreen from './screens/team/TeamEventsScreen'
import PlanScreen from './screens/team/PlanScreen'
import PlanEditor from './screens/team/PlanEditor'
import './App.css'

export default function App() {
  // account: { name, email, sport } — sport is one of SPORTS ids (src/data/sports.js).
  // Auth is mocked: nothing is persisted yet.
  const [account, setAccount]   = useState(null)
  const [authView, setAuthView] = useState('landing') // 'landing' | 'login' | 'signup'
  // Adaptive Sports programs (each week → an event). Seeded with demo data on sign-up.
  const [programs, setPrograms] = useState([])

  function startSession(acct) {
    setAccount(acct)
    setPrograms(acct.sport === 'adaptive' ? seedPrograms() : [])
  }

  function logout() {
    setAccount(null)
    setPrograms([])
    setAuthView('landing')
  }

  const isAdaptive = account?.sport === 'adaptive'
  const isSoccer   = account?.sport === 'soccer'

  if (!account) {
    if (authView === 'landing') {
      return (
        <LandingScreen
          onLogin={() => setAuthView('login')}
          onSignup={() => setAuthView('signup')}
        />
      )
    }
    if (authView === 'signup') {
      return (
        <SignupWizard
          onBack={() => setAuthView('landing')}
          onLogin={() => setAuthView('login')}
          onComplete={startSession}
        />
      )
    }
    return (
      <LoginScreen
        onBack={() => setAuthView('landing')}
        onSignup={() => setAuthView('signup')}
        onLogin={startSession}
      />
    )
  }

  const shell = (
    <div className="app-shell">
      <TopBar account={account} onLogout={logout} />
      <Navigation account={account} onLogout={logout} />
      <main className="main-content">
        <Routes>
          {isAdaptive ? (
            <>
              <Route path="/"         element={<AdaptiveHomeScreen account={account} programs={programs} />} />
              <Route path="/programs" element={<ProgramsScreen programs={programs} onCreate={p => setPrograms(ps => [p, ...ps])} />} />
              <Route path="/events"   element={<EventsScreen programs={programs} />} />
            </>
          ) : isSoccer ? (
            <>
              <Route path="/"              element={<TeamHomeScreen account={account} />} />
              <Route path="/plan"          element={<PlanScreen />} />
              <Route path="/plan/:eventId" element={<PlanEditor />} />
              <Route path="/events"        element={<TeamEventsScreen />} />
            </>
          ) : (
            <>
              <Route path="/"         element={<HomeScreen account={account} />} />
              <Route path="/roster"   element={<RosterScreen />} />
            </>
          )}
          {/* Shared — Practice Plans + Drills are reachable from Adaptive Home quick actions */}
          <Route path="/drills"   element={<DrillsScreen />} />
          <Route path="/practice" element={<PracticeScreen />} />
          <Route path="/tools"    element={<ToolsScreen />} />
          <Route path="*"         element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )

  // Team selection, events and plans live in TeamProvider; a fresh one per login
  return isSoccer ? <TeamProvider key={account.email}>{shell}</TeamProvider> : shell
}
