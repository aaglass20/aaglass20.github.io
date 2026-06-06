import './PlaybackControls.css';

const SPEED_OPTIONS = [0.5, 1, 1.5, 2];

export default function PlaybackControls({
  time,
  isPlaying,
  speed,
  label,
  showTrails,
  onPlay,
  onPause,
  onReset,
  onScrub,
  onSpeedChange,
  onShowTrailsChange,
  onOpenAnimationDrawer,
}) {
  return (
    <div className="playback-controls">
      {/* Reset */}
      <button className="pb-btn pb-btn-sm" onClick={onReset} title="Reset">
        Reset
      </button>

      {/* Play/Pause */}
      <button
        className="pb-btn pb-btn-play"
        onClick={isPlaying ? onPause : onPlay}
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>

      {/* Scrubber */}
      <div className="pb-scrubber-wrap">
        <input
          type="range"
          min={0}
          max={100}
          step={0.1}
          value={time}
          onChange={(e) => onScrub(parseFloat(e.target.value))}
          className="pb-scrubber"
        />
        {label && <div className="pb-label">{label}</div>}
      </div>

      {/* Speed */}
      <div className="pb-speed-group">
        {SPEED_OPTIONS.map((s) => (
          <button
            key={s}
            className={`pb-btn pb-btn-sm pb-speed ${speed === s ? 'active' : ''}`}
            onClick={() => onSpeedChange(s)}
          >
            {s}x
          </button>
        ))}
      </div>

      {/* Trails toggle */}
      <button
        className={`pb-btn pb-btn-sm ${showTrails ? 'active' : ''}`}
        onClick={() => onShowTrailsChange(!showTrails)}
        title="Toggle movement trails"
      >
        Trails
      </button>

      {/* Animation drawer */}
      <button className="pb-btn pb-btn-sm pb-record" onClick={onOpenAnimationDrawer} title="Edit keyframes">
        Keyframes
      </button>
    </div>
  );
}
