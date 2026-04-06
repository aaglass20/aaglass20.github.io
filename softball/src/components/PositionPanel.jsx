import { DEFAULT_POSITIONS, POSITION_KEYS } from '../data/fieldPositions';
import './PositionPanel.css';

const RUNNER_KEYS = ['batter', 'runner1', 'runner2', 'runner3'];
const RUNNER_LABELS = {
  batter: 'Batter',
  runner1: 'Runner on 1st',
  runner2: 'Runner on 2nd',
  runner3: 'Runner on 3rd',
};

function PositionPanel({ focusPosition, onFocusChange, playerNames, onNameChange, activeRunners, hideNames }) {
  return (
    <div className="position-panel">
      <h3>Position Focus</h3>
      <p className="hint">Select a position to highlight only their movement</p>

      <button
        className={`pos-btn all-btn ${!focusPosition ? 'active' : ''}`}
        onClick={() => onFocusChange(null)}
      >
        Show All
      </button>

      <div className="pos-group-label">Fielders</div>
      <div className="pos-grid">
        {POSITION_KEYS.map((key) => {
          const pos = DEFAULT_POSITIONS[key];
          return (
            <button
              key={key}
              className={`pos-btn ${focusPosition === key ? 'active' : ''}`}
              style={{ '--pos-color': pos.color }}
              onClick={() => onFocusChange(key)}
            >
              <span className="pos-dot" style={{ background: pos.color }} />
              {pos.label}
              {playerNames?.[key] && <span className="pos-name">{playerNames[key]}</span>}
            </button>
          );
        })}
      </div>

      <div className="pos-group-label">Runners</div>
      <div className="pos-grid">
        {RUNNER_KEYS.filter((k) => k === 'batter' || activeRunners?.includes(k)).map((key) => (
          <button
            key={key}
            className={`pos-btn runner ${focusPosition === key ? 'active' : ''}`}
            onClick={() => onFocusChange(key)}
          >
            <span className="pos-dot" style={{ background: '#f39c12' }} />
            {RUNNER_LABELS[key]}
          </button>
        ))}
      </div>

      {!hideNames && (
        <div className="name-section">
          <h3>Assign Player Names</h3>
          <div className="name-grid">
            {POSITION_KEYS.map((key) => (
              <div key={key} className="name-row">
                <label>{DEFAULT_POSITIONS[key].label}</label>
                <input
                  type="text"
                  placeholder={DEFAULT_POSITIONS[key].name}
                  value={playerNames?.[key] || ''}
                  onChange={(e) => onNameChange(key, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PositionPanel;
