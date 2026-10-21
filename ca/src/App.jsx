import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navigation from './components/Navigation'
import TopBar from './components/TopBar'
import LoginScreen from './screens/LoginScreen'
import HomeScreen from './screens/HomeScreen'
import DrillsScreen from './screens/DrillsScreen'
import PracticeScreen from './screens/PracticeScreen'
import RosterScreen from './screens/RosterScreen'
import ToolsScreen from './screens/ToolsScreen'
import './App.css'

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />
  }

  return (
    <div className="app-shell">
      <TopBar onLogout={() => setIsLoggedIn(false)} />
      <Navigation onLogout={() => setIsLoggedIn(false)} />
      <main className="main-content">
        <Routes>
          <Route path="/"         element={<HomeScreen />} />
          <Route path="/drills"   element={<DrillsScreen />} />
          <Route path="/practice" element={<PracticeScreen />} />
          <Route path="/roster"   element={<RosterScreen />} />
          <Route path="/tools"    element={<ToolsScreen />} />
          <Route path="*"         element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
