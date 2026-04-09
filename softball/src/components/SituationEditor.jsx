import { useState } from 'react';
import { DEFAULT_POSITIONS, POSITION_KEYS, HOME_PLATE, FIRST_BASE, SECOND_BASE, THIRD_BASE } from '../data/fieldPositions';
import './SituationEditor.css';

const RUNNER_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'runner1', label: '1st' },
  { value: 'runner2', label: '2nd' },
  { value: 'runner3', label: '3rd' },
];

const RUNNER_BASES = {
  runner1: FIRST_BASE,
  runner2: SECOND_BASE,
  runner3: THIRD_BASE,
};

function positionsToXY(positions) {
  const result = {};
  for (const [key, val] of Object.entries(positions)) {
    result[key] = { x: val.x, y: val.y };
  }
  return result;
}

function makeDefaultKeyframe(runners) {
  const runnerPositions = { batter: { x: HOME_PLATE.x, y: HOME_PLATE.y } };
  for (const r of runners) {
    runnerPositions[r] = { ...RUNNER_BASES[r] };
  }
  return {
    time: 0,
    label: 'Start',
    ball: { x: 350, y: 570 },
    fielders: positionsToXY(DEFAULT_POSITIONS),
    runners: runnerPositions,
  };
}

function SituationEditor({ situation, onUpdate, onClose, activeKeyframe, onKeyframeChange, onNewSituation }) {
  const setActiveKeyframe = onKeyframeChange;
  const keyframes = situation.keyframes;
  const kf = keyframes[activeKeyframe];
  const [recording, setRecording] = useState(false);

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

  // --- Record Mode ---
  const captureFrame = () => {
    const current = keyframes[activeKeyframe];
    const frameCount = keyframes.length;
    const newTime = Math.min(Math.round((frameCount / (frameCount + 1)) * 100), 100);

    // Deep copy current positions as new keyframe
    const newKf = {
      time: newTime,
      label: `Frame ${frameCount + 1}`,
      ball: { ...current.ball },
      fielders: {},
      runners: {},
    };
    for (const [key, pos] of Object.entries(current.fielders)) {
      newKf.fielders[key] = { ...pos };
    }
    for (const [key, pos] of Object.entries(current.runners)) {
      newKf.runners[key] = { ...pos };
    }

    const updated = { ...situation };
    updated.keyframes = [...keyframes, newKf];
    onUpdate(updated);
    setActiveKeyframe(updated.keyframes.length - 1);
  };

  const startNewSituation = () => {
    const runners = [];
    const newSit = {
      id: 'new-situation-' + Date.now(),
      title: 'New Situation',
      description: '',
      category: 'Custom',
      hitTo: '',
      outs: 0,
      runners,
      keyframes: [makeDefaultKeyframe(runners)],
    };
    onNewSituation(newSit);
    setRecording(true);
    setActiveKeyframe(0);
  };

  const toggleRunner = (runnerKey) => {
    const updated = { ...situation };
    const hasRunner = updated.runners.includes(runnerKey);
    updated.runners = hasRunner
      ? updated.runners.filter((r) => r !== runnerKey)
      : [...updated.runners, runnerKey];

    // Update all keyframes to add/remove runner
    updated.keyframes = updated.keyframes.map((kf) => {
      const newRunners = { ...kf.runners };
      if (hasRunner) {
        delete newRunners[runnerKey];
      } else {
        newRunners[runnerKey] = { ...RUNNER_BASES[runnerKey] };
      }
      return { ...kf, runners: newRunners };
    });
    onUpdate(updated);
  };

  const autoSpaceTimes = () => {
    const updated = { ...situation };
    const count = keyframes.length;
    updated.keyframes = keyframes.map((kf, i) => ({
      ...kf,
      time: Math.round((i / (count - 1)) * 100),
    }));
    onUpdate(updated);
  };

  // --- Export as pasteable JS code ---
  const exportCode = () => {
    const sit = situation;
    const lines = [];
    lines.push(`  {`);
    lines.push(`    id: '${sit.id}',`);
    lines.push(`    title: '${sit.title}',`);
    lines.push(`    description: '${sit.description}',`);
    lines.push(`    category: '${sit.category || 'Custom'}',`);
    lines.push(`    hitTo: '${sit.hitTo || ''}',`);
    if (sit.highlighted) lines.push(`    highlighted: true,`);
    if (sit.outs) lines.push(`    outs: ${sit.outs},`);
    lines.push(`    runners: [${sit.runners.map((r) => `'${r}'`).join(', ')}],`);
    lines.push(`    keyframes: [`);

    for (const kf of sit.keyframes) {
      lines.push(`      {`);
      lines.push(`        time: ${kf.time},`);
      lines.push(`        label: '${kf.label}',`);
      lines.push(`        ball: { x: ${kf.ball.x}, y: ${kf.ball.y} },`);
      lines.push(`        fielders: {`);
      for (const [key, pos] of Object.entries(kf.fielders)) {
        const k = key.includes('B') || key === 'SS' || key === 'P' || key === 'C' ? `'${key}'` : key;
        lines.push(`          ${k}: { x: ${pos.x}, y: ${pos.y} },`);
      }
      lines.push(`        },`);
      lines.push(`        runners: {`);
      for (const [key, pos] of Object.entries(kf.runners)) {
        lines.push(`          ${key}: { x: ${pos.x}, y: ${pos.y} },`);
      }
      lines.push(`        },`);
      lines.push(`      },`);
    }

    lines.push(`    ],`);
    lines.push(`  },`);

    const code = lines.join('\n');
    navigator.clipboard.writeText(code).then(() => {
      alert('Situation code copied to clipboard! Paste it into sampleSituations.js');
    });
  };

  return (
    <div className="situation-editor">
      <div className="editor-header">
        <h3>{recording ? 'Record Mode' : 'Edit Mode'}</h3>
        <div className="editor-header-actions">
          <button className="new-btn" onClick={startNewSituation} title="Start fresh">
            New
          </button>
          <button className="export-btn" onClick={exportCode} title="Copy code to clipboard">
            Export Code
          </button>
          <button className="close-btn" onClick={onClose}>Close</button>
        </div>
      </div>

      <div className="editor-meta">
        <label>
          Title:
          <input
            type="text"
            value={situation.title || ''}
            onChange={(e) => onUpdate({ ...situation, title: e.target.value })}
          />
        </label>
        <div className="meta-row">
          <label>
            Category:
            <select
              value={situation.category || 'Custom'}
              onChange={(e) => onUpdate({ ...situation, category: e.target.value })}
            >
              <option value="Base Hits">Base Hits</option>
              <option value="Ground Balls">Ground Balls</option>
              <option value="Fly Balls">Fly Balls</option>
              <option value="Bunts">Bunts</option>
              <option value="Custom">Custom</option>
            </select>
          </label>
          <label>
            Hit To:
            <select
              value={situation.hitTo || ''}
              onChange={(e) => onUpdate({ ...situation, hitTo: e.target.value })}
            >
              <option value="">--</option>
              {POSITION_KEYS.map((key) => (
                <option key={key} value={key}>{DEFAULT_POSITIONS[key].label}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="runner-toggles">
          <span className="runner-label">Runners:</span>
          {RUNNER_OPTIONS.filter((o) => o.value).map((opt) => (
            <button
              key={opt.value}
              className={`runner-toggle ${situation.runners?.includes(opt.value) ? 'active' : ''}`}
              onClick={() => toggleRunner(opt.value)}
            >
              {opt.label}
            </button>
          ))}
          <span className="runner-label" style={{ marginLeft: 12 }}>Outs:</span>
          {[0, 1, 2].map((n) => (
            <button
              key={n}
              className={`runner-toggle ${(situation.outs || 0) === n ? 'active' : ''}`}
              style={{ '--active-color': '#e94560' }}
              onClick={() => onUpdate({ ...situation, outs: n })}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Record controls */}
      <div className="record-bar">
        <button className="capture-btn" onClick={captureFrame} title="Save current positions as new frame">
          Capture Frame
        </button>
        <button className="space-btn" onClick={autoSpaceTimes} title="Evenly space all keyframe times">
          Auto-Space Times
        </button>
        <span className="frame-count">{keyframes.length} frames</span>
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
          <button onClick={addKeyframeAfter} title="Add keyframe after current">+ Insert</button>
          <button onClick={removeKeyframe} disabled={keyframes.length <= 1} title="Remove this keyframe">- Remove</button>
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
              Time:
              <input
                type="number"
                min="0"
                max="100"
                value={kf.time}
                onChange={(e) => updateTime(e.target.value)}
              />
            </label>
          </div>
          <p className="drag-hint">Drag players on the field, then Capture Frame to record.</p>

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
