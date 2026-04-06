import './SituationPicker.css';

function SituationPicker({ situations, activeSituation, onSelect }) {
  return (
    <div className="situation-picker">
      <h3>Situations</h3>
      <div className="situation-list">
        {situations.map((sit) => (
          <button
            key={sit.id}
            className={`situation-card ${activeSituation?.id === sit.id ? 'active' : ''}`}
            onClick={() => onSelect(sit)}
          >
            <div className="situation-title">{sit.title}</div>
            <div className="situation-desc">{sit.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default SituationPicker;
