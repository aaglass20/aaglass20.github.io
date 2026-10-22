import { firstNameOf, sportLabelOf } from '../data/account'
import './Screen.css'

export default function HomeScreen({ account }) {
  return (
    <div className="screen">
      <div className="screen-header">
        <div className="header-eyebrow">Welcome, {firstNameOf(account?.name)} · {sportLabelOf(account)}</div>
        <h1>Dashboard</h1>
      </div>

      <section className="section">
        <h2 className="section-title">Upcoming Practice</h2>
        <div className="card card-highlight">
          <div className="card-row">
            <div className="placeholder-chip" />
            <div className="placeholder-chip wide" />
          </div>
          <div className="placeholder-block short" />
          <div className="placeholder-block short narrow" />
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions">
          <div className="action-tile"><div className="action-icon" /><div className="action-label placeholder-chip short" /></div>
          <div className="action-tile"><div className="action-icon" /><div className="action-label placeholder-chip short" /></div>
          <div className="action-tile"><div className="action-icon" /><div className="action-label placeholder-chip short" /></div>
          <div className="action-tile"><div className="action-icon" /><div className="action-label placeholder-chip short" /></div>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Recent Activity</h2>
        <div className="placeholder-row" />
        <div className="placeholder-row" />
        <div className="placeholder-row" />
      </section>
    </div>
  )
}
