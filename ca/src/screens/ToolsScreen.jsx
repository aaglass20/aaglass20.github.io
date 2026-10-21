import './Screen.css'

const TOOLS = [
  { label: 'Fitness Tracker',   sub: 'Beep test, conditioning logs' },
  { label: 'Brackets',          sub: 'Single / double elimination' },
  { label: 'Game Day',          sub: 'Lineup cards, score tracking' },
  { label: 'Athlete Progress',  sub: 'Development milestones' },
  { label: 'Film & Notes',      sub: 'Video notes, session logs' },
  { label: 'Settings',          sub: 'Teams, sports, preferences' },
]

export default function ToolsScreen() {
  return (
    <div className="screen">
      <div className="screen-header">
        <div className="header-eyebrow">More</div>
        <h1>Tools</h1>
      </div>

      <div className="tools-list">
        {TOOLS.map(({ label, sub }) => (
          <div key={label} className="tool-row">
            <div className="tool-icon-box" />
            <div className="tool-text">
              <div className="tool-label">{label}</div>
              <div className="tool-sub">{sub}</div>
            </div>
            <div className="chevron">›</div>
          </div>
        ))}
      </div>
    </div>
  )
}
