import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import AvatarSheet from './AvatarSheet'
import './TopBar.css'

const SCREEN_TITLES = {
  '/':         'Home',
  '/drills':   'Drills',
  '/practice': 'Practice',
  '/roster':   'Roster',
  '/tools':    'Tools',
}

export default function TopBar({ onLogout }) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const { pathname } = useLocation()
  const title = SCREEN_TITLES[pathname] ?? 'Coach Approach'

  return (
    <>
      <header className="top-bar">
        <div className="top-bar-left">
          <img
            src="/ca/images/calogo.jpeg"
            alt="CA"
            className="top-bar-logo"
            onError={e => { e.target.style.display = 'none' }}
          />
          <span className="top-bar-title">{title}</span>
        </div>

        <button
          className="avatar-btn"
          onClick={() => setSheetOpen(true)}
          aria-label="Account and settings"
        >
          <div className="avatar-ring">
            <span className="avatar-initials">CA</span>
          </div>
        </button>
      </header>

      <AvatarSheet open={sheetOpen} onClose={() => setSheetOpen(false)} onLogout={onLogout} />
    </>
  )
}
