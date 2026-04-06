import './PlaybackControls.css';

function PlaybackControls({ time, isPlaying, speed, onPlay, onPause, onReset, onScrub, onSpeedChange, label }) {
  return (
    <div className="playback-controls">
      <div className="playback-buttons">
        {!isPlaying ? (
          <button className="play-btn" onClick={onPlay} title="Play">
            &#9654;
          </button>
        ) : (
          <button className="pause-btn" onClick={onPause} title="Pause">
            &#9646;&#9646;
          </button>
        )}
        <button className="reset-btn" onClick={onReset} title="Reset">
          &#8634;
        </button>

        <div className="speed-control">
          <label>Speed:</label>
          <select value={speed} onChange={(e) => onSpeedChange(Number(e.target.value))}>
            <option value={0.25}>0.25x</option>
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2x</option>
          </select>
        </div>
      </div>

      <div className="timeline">
        <input
          type="range"
          min="0"
          max="100"
          step="0.5"
          value={time}
          onChange={(e) => onScrub(Number(e.target.value))}
          className="timeline-slider"
        />
        <div className="timeline-label">{label || `${Math.round(time)}%`}</div>
      </div>
    </div>
  );
}

export default PlaybackControls;
