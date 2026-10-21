import './AvatarSheet.css'

const SETUP_ITEMS = [
  { icon: '⚑', label: 'Team Setup',       sub: 'Manage your teams & rosters' },
  { icon: '◈', label: 'Sport Settings',    sub: 'Active sport, season dates' },
  { icon: '◻', label: 'Notifications',     sub: 'Alerts & reminders' },
  { icon: '◧', label: 'Preferences',       sub: 'Display, units, defaults' },
]

export default function AvatarSheet({ open, onClose, onLogout }) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={'sheet-backdrop' + (open ? ' visible' : '')}
        onClick={onClose}
      />

      {/* Sheet */}
      <div className={'avatar-sheet' + (open ? ' open' : '')}>
        <div className="sheet-handle" />

        {/* Coach profile row */}
        <div className="sheet-profile">
          <div className="sheet-avatar">
            <span className="sheet-avatar-initials">CA</span>
          </div>
          <div className="sheet-profile-text">
            <div className="sheet-coach-name">Coach Aaron</div>
            <div className="sheet-coach-sub">3 teams · 24 athletes</div>
          </div>
        </div>

        {/* Setup items */}
        <div className="sheet-section-label">Account & Setup</div>
        <ul className="sheet-list">
          {SETUP_ITEMS.map(({ icon, label, sub }) => (
            <li key={label} className="sheet-item">
              <span className="sheet-item-icon">{icon}</span>
              <div className="sheet-item-text">
                <span className="sheet-item-label">{label}</span>
                <span className="sheet-item-sub">{sub}</span>
              </div>
              <span className="sheet-chevron">›</span>
            </li>
          ))}
        </ul>

        <button className="sheet-logout" onClick={() => { onClose(); onLogout?.() }}>
          Log Out
        </button>
      </div>
    </>
  )
}
