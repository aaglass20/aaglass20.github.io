import './SituationEditor.css';

function SituationEditor({ situation, onUpdate, onClose, activeKeyframe, onKeyframeChange }) {
  const setActiveKeyframe = onKeyframeChange;
  const keyframes = situation.keyframes;
  const kf = keyframes[activeKeyframe];

  const updateKeyframePositions = (type, key, x, y) => {
    const updated = { ...situation };
    updated.keyframes = updated.keyframes.map((k, i) => {
      if (i !== activeKeyframe) return k;
      const copy = { ...k };
      if (type === 'fielders') {
        copy.fielders = { ...copy.fielders, [key]: { x: Math.round(x), y: Math.round(y) } };
      } else if (type === 'runners') {
        copy.runners = { ...copy.runners, [key]: { x: Math.round(x), y: Math.round(y) } };
      } else if (type === 'ball') {
        copy.ball = { x: Math.round(x), y: Math.round(y) };
      }
      return copy;
    });
    onUpdate(updated);
  };

  const updateKeyframeLabel = (label) => {
    const updated = { ...situation };
    updated.keyframes = updated.keyframes.map((k, i) =>
      i === activeKeyframe ? { ...k, label } : k
    );
    onUpdate(updated);
  };

  const addKeyframeAfter = () => {
    const updated = { ...situation };
    const current = keyframes[activeKeyframe];
    const next = keyframes[activeKeyframe + 1];
    const newTime = next
      ? Math.round((current.time + next.time) / 2)
      : Math.min(current.time + 10, 100);

    // Interpolate positions between current and next (or copy current)
    const source = next || current;
    const t = 0.5;
    const interp = (a, b) => ({ x: Math.round(a.x + (b.x - a.x) * t), y: Math.round(a.y + (b.y - a.y) * t) });

    const newKf = {
      time: newTime,
      label: 'New keyframe',
      ball: next ? interp(current.ball, source.ball) : { ...current.ball },
      fielders: {},
      runners: {},
    };
    for (const key of Object.keys(current.fielders)) {
      newKf.fielders[key] = next && source.fielders[key]
        ? interp(current.fielders[key], source.fielders[key])
        : { ...current.fielders[key] };
    }
    for (const key of Object.keys(current.runners)) {
      newKf.runners[key] = next && source.runners[key]
        ? interp(current.runners[key], source.runners[key])
        : { ...current.runners[key] };
    }

    updated.keyframes = [
      ...keyframes.slice(0, activeKeyframe + 1),
      newKf,
      ...keyframes.slice(activeKeyframe + 1),
    ];
    onUpdate(updated);
    setActiveKeyframe(activeKeyframe + 1);
  };

  const removeKeyframe = () => {
    if (keyframes.length <= 2) return;
    const updated = { ...situation };
    updated.keyframes = keyframes.filter((_, i) => i !== activeKeyframe);
    onUpdate(updated);
    setActiveKeyframe(Math.max(0, activeKeyframe - 1));
  };

  const updateTime = (newTime) => {
    const updated = { ...situation };
    updated.keyframes = updated.keyframes.map((k, i) =>
      i === activeKeyframe ? { ...k, time: Number(newTime) } : k
    );
    onUpdate(updated);
  };

  const exportSituation = () => {
    const json = JSON.stringify(situation, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      alert('Situation JSON copied to clipboard!');
    });
  };

  return (
    <div className="situation-editor">
      <div className="editor-header">
        <h3>Situation Editor</h3>
        <div className="editor-header-actions">
          <button className="export-btn" onClick={exportSituation} title="Copy JSON to clipboard">
            Export JSON
          </button>
          <button className="close-btn" onClick={onClose}>Close Editor</button>
        </div>
      </div>

      <div className="editor-meta">
        <label>
          Title:
          <input
            type="text"
            value={situation.title}
            onChange={(e) => onUpdate({ ...situation, title: e.target.value })}
          />
        </label>
        <label>
          Description:
          <input
            type="text"
            value={situation.description}
            onChange={(e) => onUpdate({ ...situation, description: e.target.value })}
          />
        </label>
      </div>

      <div className="keyframe-nav">
        <div className="keyframe-steps">
          {keyframes.map((k, i) => (
            <button
              key={i}
              className={`kf-step ${i === activeKeyframe ? 'active' : ''}`}
              onClick={() => setActiveKeyframe(i)}
              title={`${k.label} (t=${k.time})`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <div className="keyframe-actions">
          <button onClick={addKeyframeAfter} title="Add keyframe after current">+ Add</button>
          <button onClick={removeKeyframe} disabled={keyframes.length <= 2} title="Remove this keyframe">- Remove</button>
        </div>
      </div>

      {kf && (
        <div className="keyframe-detail">
          <div className="kf-row">
            <label>
              Label:
              <input
                type="text"
                value={kf.label}
                onChange={(e) => updateKeyframeLabel(e.target.value)}
              />
            </label>
            <label>
              Time (0-100):
              <input
                type="number"
                min="0"
                max="100"
                value={kf.time}
                onChange={(e) => updateTime(e.target.value)}
              />
            </label>
          </div>
          <p className="drag-hint">Drag players on the field to reposition them for this keyframe.</p>

          <div className="position-coords">
            <div className="coord-group">
              <span className="coord-label">Ball:</span>
              <span className="coord-val">({kf.ball.x}, {kf.ball.y})</span>
            </div>
            {Object.entries(kf.fielders).map(([key, pos]) => (
              <div key={key} className="coord-group">
                <span className="coord-label">{key}:</span>
                <span className="coord-val">({pos.x}, {pos.y})</span>
              </div>
            ))}
            {Object.entries(kf.runners).map(([key, pos]) => (
              <div key={key} className="coord-group">
                <span className="coord-label">{key}:</span>
                <span className="coord-val">({pos.x}, {pos.y})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SituationEditor;
