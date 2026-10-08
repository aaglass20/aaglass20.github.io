import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/',            icon: '🏠', label: 'Home',           end: true },
  { to: '/basketball',  icon: '🏀', label: 'Basketball' },
  { to: '/softball',    icon: '🥎', label: 'Softball' },
  { to: '/football',    icon: '🏈', label: 'Football' },
  { to: '/pickleball',  icon: '🏓', label: 'Pickleball' },
  { to: '/soccer',      icon: '⚽', label: 'Soccer' },
  { to: '/kickball',    icon: '🔴', label: 'Kickball' },
  { to: '/volunteer',   icon: '🤝', label: 'Volunteer Guide' },
  { to: '/empower-way', icon: '⚡', label: 'Empower Way' },
]

const EMPOWER_WAY_CHILDREN = ['/programs', '/locations', '/practice-builder', '/plan-library', '/drill-admin']

export default function Nav() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  const close = () => setOpen(false)

  return (
    <nav className="nav">
      <a href="#/" className="nav-brand">
        <img src="/empower-playbook/images/empower-logo.png" alt="Empower Sports" className="nav-brand-logo" />
      </a>
      <button
        className={`nav-hamburger${open ? ' open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-label="Toggle menu"
      >
        <span /><span /><span />
      </button>
      <div className={`nav-links${open ? ' open' : ''}`}>
        {NAV_LINKS.map(({ to, icon, label, end }) => {
          const isEmpowerWay = to === '/empower-way'
          const empowerWayActive = isEmpowerWay && EMPOWER_WAY_CHILDREN.includes(pathname)
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => (isActive || empowerWayActive ? 'active' : undefined)}
              onClick={close}
            >
              {icon} <span className="link-label">{label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
