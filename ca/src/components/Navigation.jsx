import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import AvatarSheet from './AvatarSheet'
import './Navigation.css'

const NAV_ITEMS = [
  {
    to: '/',
    label: 'Home',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    to: '/drills',
    label: 'Drills',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3"/>
      </svg>
    ),
  },
  {
    to: '/practice',
    label: 'Practice',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="2" width="6" height="4" rx="1"/>
        <path d="M17 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
        <line x1="9" y1="12" x2="15" y2="12"/>
        <line x1="9" y1="16" x2="13" y2="16"/>
      </svg>
    ),
  },
  {
    to: '/roster',
    label: 'Roster',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    to: '/tools',
    label: 'Tools',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
        <line x1="12" y1="2" x2="12" y2="6"/>
        <line x1="12" y1="18" x2="12" y2="22"/>
        <line x1="4.22" y1="4.22" x2="7.05" y2="7.05"/>
        <line x1="16.95" y1="16.95" x2="19.78" y2="19.78"/>
      </svg>
    ),
  },
]

export default function Navigation({ onLogout }) {
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="sidebar">
        <div className="sidebar-logo">
          <img src="/ca/images/calogo.jpeg" alt="Coach Approach" className="logo-img" />
          <div className="logo-text">
            <span className="logo-name">Coach Approach</span>
            <span className="logo-tagline">Develop · Organize · Grow</span>
          </div>
        </div>
        <ul className="sidebar-links">
          {NAV_ITEMS.map(({ to, icon, label }) => (
            <li key={to}>
              <NavLink to={to} className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')} end={to === '/'}>
                <span className="nav-icon">{icon}</span>
                <span className="nav-label">{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Sidebar avatar — desktop only */}
        <button className="sidebar-avatar-btn" onClick={() => setSheetOpen(true)}>
          <div className="sidebar-avatar-ring">
            <span className="sidebar-avatar-initials">CA</span>
          </div>
          <div className="sidebar-avatar-text">
            <span className="sidebar-avatar-name">Coach Aaron</span>
            <span className="sidebar-avatar-sub">Account &amp; Setup</span>
          </div>
          <svg className="sidebar-avatar-gear" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
          </svg>
        </button>
      </nav>

      <AvatarSheet open={sheetOpen} onClose={() => setSheetOpen(false)} onLogout={onLogout} />

      {/* Mobile bottom tab bar */}
      <nav className="bottom-nav">
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => 'bottom-tab' + (isActive ? ' active' : '')} end={to === '/'}>
            <span className="nav-icon">{icon}</span>
            <span className="nav-label">{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}
