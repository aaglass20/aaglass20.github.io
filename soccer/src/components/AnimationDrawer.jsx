import { useState } from 'react';
import './AnimationDrawer.css';

export default function AnimationDrawer({
  isOpen,
  onClose,
  scenario,
  activeKeyframeIndex,
  onKeyframeSelect,
  onCaptureFrame,
  onAddKeyframe,
  onRemoveKeyframe,
  onUpdateKeyframeLabel,
  onUpdateKeyframeTime,
  onAutoSpaceTimes,
  onUpdateMovementCurve,
  focusedPlayer,
}) {
  const [curveValue, setCurveValue] = useState(0);
  const [captured, setCaptured] = useState(false);

  const handleCapture = () => {
    onCaptureFrame();
    setCaptured(true);
    setTimeout(() => setCaptured(false), 700);
  };

  const keyframes = scenario?.keyframes || [];
  const activeKf = keyframes[activeKeyframeIndex];

  const handleCurveChange = (val) => {
    setCurveValue(val);
    if (focusedPlayer) {
      onUpdateMovementCurve?.(focusedPlayer.team, focusedPlayer.pos, val);
    }
  };

  const curveLabel = curveValue === 0
    ? 'Straight'
    : curveValue > 0
      ? `Curve L (${curveValue.toFixed(1)})`
      : `Curve R (${Math.abs(curveValue).toFixed(1)})`;

  return (
    <div className={`ad-strip ${isOpen ? 'open' : ''}`}>
      {/* Row 1: actions + inline editor for active keyframe */}
      <div className="ad-row-top">
        <div className="ad-actions">
          <button
            className={`ad-btn ad-btn-green ad-btn-capture ${captured ? 'captured' : ''}`}
            onClick={handleCapture}
          >
            {captured ? '✓ Captured!' : 'Capture Frame'}
          </button>
          <button className="ad-btn" onClick={onAddKeyframe} title="Add keyframe after active">
            + Add
          </button>
          <button
            className="ad-btn ad-btn-danger"
            onClick={onRemoveKeyframe}
            disabled={keyframes.length <= 2}
            title="Remove active keyframe"
          >
            − Remove
          </button>
          <button className="ad-btn" onClick={onAutoSpaceTimes} title="Auto space times evenly">
            Auto Space
          </button>
        </div>

        {/* Inline editor for active keyframe */}
        {activeKf && (
          <div className="ad-inline-editor">
            <input
              type="text"
              className="ad-input"
              value={activeKf.label || ''}
              onChange={(e) => onUpdateKeyframeLabel(activeKeyframeIndex, e.target.value)}
              placeholder="Label..."
              title="Keyframe label"
            />
            <input
              type="number"
              className="ad-input ad-input-time"
              min={0}
              max={100}
              value={activeKf.time}
              onChange={(e) => onUpdateKeyframeTime(activeKeyframeIndex, Number(e.target.value))}
              title="Time (0–100)"
            />
          </div>
        )}

        {/* Curve control — only when player focused */}
        {focusedPlayer && (
          <div className="ad-curve-inline">
            <span className="ad-curve-end-label">R</span>
            <input
              type="range"
              min={-1}
              max={1}
              step={0.1}
              value={curveValue}
              onChange={(e) => handleCurveChange(parseFloat(e.target.value))}
              className="ad-curve-slider"
              title={`Movement curve: ${curveLabel}`}
            />
            <span className="ad-curve-end-label">L</span>
            <span className="ad-curve-val">{curveLabel}</span>
          </div>
        )}

        <button className="ad-btn ad-btn-icon ad-btn-close" onClick={onClose} title="Close">✕</button>
      </div>

      {/* Row 2: keyframe timeline */}
      <div className="ad-timeline-wrap">
        <div className="ad-timeline">
          {keyframes.map((kf, i) => (
            <div
              key={kf.id}
              className={`ad-kf-card ${i === activeKeyframeIndex ? 'active' : ''}`}
              onClick={() => onKeyframeSelect(i)}
            >
              <div className="ad-kf-time">{kf.time}</div>
              <div className="ad-kf-label">{kf.label || `Frame ${i + 1}`}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
