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
  time,
  snapshot,
  focusedPlayer,
}) {
  const [curveValue, setCurveValue] = useState(0);

  const keyframes = scenario?.keyframes || [];
  const activeKf = keyframes[activeKeyframeIndex];

  const handleCurveChange = (val) => {
    setCurveValue(val);
    if (focusedPlayer) {
      onUpdateMovementCurve && onUpdateMovementCurve(
        focusedPlayer.team,
        focusedPlayer.pos,
        val
      );
    }
  };

  const curveLabel = curveValue === 0
    ? 'Straight'
    : curveValue > 0
      ? `Curve Left (${curveValue.toFixed(1)})`
      : `Curve Right (${Math.abs(curveValue).toFixed(1)})`;

  return (
    <div className={`drawer-bottom ${isOpen ? 'open' : ''}`}>
      {/* Header */}
      <div className="ad-header">
        <span className="ad-title">Keyframe Editor</span>
        <div className="ad-header-actions">
          <button className="ad-btn ad-btn-green ad-btn-capture" onClick={onCaptureFrame}>
            Capture Frame
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
            Remove
          </button>
          <button className="ad-btn" onClick={onAutoSpaceTimes} title="Auto space times evenly">
            Auto Space
          </button>
          <button className="ad-btn ad-btn-icon" onClick={onClose}>X</button>
        </div>
      </div>

      <div className="ad-body">
        {/* Keyframe Timeline */}
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

        {/* Active keyframe editor */}
        {activeKf && (
          <div className="ad-kf-editor">
            <div className="ad-kf-field">
              <label className="ad-kf-label-text">Label</label>
              <input
                type="text"
                className="ad-input"
                value={activeKf.label || ''}
                onChange={(e) => onUpdateKeyframeLabel(activeKeyframeIndex, e.target.value)}
                placeholder="Keyframe label..."
              />
            </div>
            <div className="ad-kf-field">
              <label className="ad-kf-label-text">Time (0-100)</label>
              <input
                type="number"
                className="ad-input ad-input-small"
                min={0}
                max={100}
                value={activeKf.time}
                onChange={(e) => onUpdateKeyframeTime(activeKeyframeIndex, Number(e.target.value))}
              />
            </div>
          </div>
        )}

        {/* Movement Curve */}
        <div className="ad-curve-section">
          <div className="ad-curve-title">Movement Curve</div>
          {focusedPlayer ? (
            <>
              <div className="ad-curve-info">
                Curve for {focusedPlayer.team} / {focusedPlayer.pos} exiting this frame
              </div>
              <div className="ad-curve-row">
                <span className="ad-curve-end-label">R</span>
                <input
                  type="range"
                  min={-1}
                  max={1}
                  step={0.1}
                  value={curveValue}
                  onChange={(e) => handleCurveChange(parseFloat(e.target.value))}
                  className="ad-curve-slider"
                />
                <span className="ad-curve-end-label">L</span>
              </div>
              <div className="ad-curve-label">{curveLabel}</div>
            </>
          ) : (
            <div className="ad-curve-hint">
              Click a player on the field to select, then adjust curve here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
