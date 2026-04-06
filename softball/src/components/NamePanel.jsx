import { DEFAULT_POSITIONS, POSITION_KEYS } from '../data/fieldPositions';
import './PositionPanel.css';

function NamePanel({ playerNames, onNameChange }) {
  return (
    <div className="position-panel">
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
  );
}

export default NamePanel;
