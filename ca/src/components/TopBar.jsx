import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import AvatarSheet from './AvatarSheet'
import { initialsOf } from '../data/account'
import './TopBar.css'

const SCREEN_TITLES = {
  '/':         'Home',
  '/drills':   'Drills',
  '/practice': 'Practice',
  '/roster':   'Roster',
  '/tools':    'Tools',
  '/programs': 'Programs',
  '/events':   'Events',
  '/plan':     'Plan',
}

export default function TopBar({ account, onLogout }) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const { pathname } = useLocation()
  // '/plan/abc' → 'Plan'
  const title = SCREEN_TITLES[pathname] ?? SCREEN_TITLES['/' + pathname.split('/')[1]] ?? 'Coach Approach'

  return (
    <>
      <header className="top-bar">
        <div className="top-bar-left">
          <img
            src="/ca/images/coachApproachLogo.png"
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
            <span className="avatar-initials">{initialsOf(account?.name)}</span>
          </div>
        </button>
      </header>

      <AvatarSheet account={account} open={sheetOpen} onClose={() => setSheetOpen(false)} onLogout={onLogout} />
    </>
  )
}
