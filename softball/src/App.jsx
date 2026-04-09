import { useState, useCallback } from 'react';
import SoftballField from './components/SoftballField';
import PlaybackControls from './components/PlaybackControls';
import SituationPicker from './components/SituationPicker';
import PositionPanel from './components/PositionPanel';
import NamePanel from './components/NamePanel';
import MobileTabs from './components/MobileTabs';
import SituationEditor from './components/SituationEditor';
import { useAnimationLoop } from './hooks/useAnimationLoop';
import { SAMPLE_SITUATIONS } from './data/sampleSituations';
import './App.css';

function App() {
  const [situation, setSituation] = useState(SAMPLE_SITUATIONS[0]);
  const [focusPosition, setFocusPosition] = useState(null);
  const [playerNames, setPlayerNames] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [showTrails, setShowTrails] = useState(false);
  const [editorKeyframe, setEditorKeyframe] = useState(0);

  const { time, isPlaying, speed, snapshot, play, pause, reset, scrub, setSpeed } =
    useAnimationLoop(situation.keyframes, 6000);

  const editorSnapshot = editMode ? situation.keyframes[editorKeyframe] : null;
  const displaySnapshot = editMode ? editorSnapshot : snapshot;

  const handleSelectSituation = useCallback((sit) => {
    setSituation(sit);
    setFocusPosition(null);
    setEditMode(false);
    setEditorKeyframe(0);
    reset();
  }, [reset]);

  const handleNameChange = useCallback((pos, name) => {
    setPlayerNames((prev) => ({ ...prev, [pos]: name }));
  }, []);

  const handlePlayerClick = useCallback((pos) => {
    setFocusPosition((prev) => (prev === pos ? null : pos));
  }, []);

  const handleEditorUpdate = useCallback((updated) => {
    setSituation(updated);
  }, []);

  const handleDragEnd = useCallback((type, key, x, y) => {
    if (!editMode) return;
    const updated = { ...situation };
    updated.keyframes = updated.keyframes.map((kf, i) => {
      if (i !== editorKeyframe) return kf;
      const copy = { ...kf };
      if (type === 'ball') {
        copy.ball = { x: Math.round(x), y: Math.round(y) };
      } else if (type === 'fielders') {
        copy.fielders = { ...copy.fielders, [key]: { x: Math.round(x), y: Math.round(y) } };
      } else if (type === 'runners') {
        copy.runners = { ...copy.runners, [key]: { x: Math.round(x), y: Math.round(y) } };
      }
      return copy;
    });
    setSituation(updated);
  }, [editMode, editorKeyframe, situation]);

  const handleEditorKeyframeChange = useCallback((index) => {
    setEditorKeyframe(index);
  }, []);

  // Shared panel components
  const situationPicker = (
    <SituationPicker
      situations={SAMPLE_SITUATIONS}
      activeSituation={situation}
      onSelect={handleSelectSituation}
    />
  );

  const focusPanel = (
    <PositionPanel
      focusPosition={focusPosition}
      onFocusChange={setFocusPosition}
      playerNames={playerNames}
      onNameChange={handleNameChange}
      activeRunners={situation.runners}
      hideNames
    />
  );

  const namePanel = (
    <NamePanel
      playerNames={playerNames}
      onNameChange={handleNameChange}
    />
  );

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>Softball Playbook</h1>
          <p>Animated situational training for every position</p>
        </div>
        <div className="header-controls">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={showTrails}
              onChange={(e) => setShowTrails(e.target.checked)}
            />
            Trail Lines
          </label>
          <button
            className={`edit-toggle ${editMode ? 'active' : ''}`}
            onClick={() => {
              setEditMode(!editMode);
              if (!editMode) {
                pause();
                setEditorKeyframe(0);
              }
            }}
          >
            {editMode ? 'Exit Editor' : 'Edit Mode'}
          </button>
        </div>
      </header>

      <div className="app-layout">
        {/* Desktop sidebar */}
        <aside className="sidebar desktop-only">
          {situationPicker}
          {!editMode && (
            <PositionPanel
              focusPosition={focusPosition}
              onFocusChange={setFocusPosition}
              playerNames={playerNames}
              onNameChange={handleNameChange}
              activeRunners={situation.runners}
            />
          )}
        </aside>

        <main className="field-area">
          <div className="field-container">
            <SoftballField
              snapshot={displaySnapshot}
              focusPosition={focusPosition}
              playerNames={playerNames}
              onPlayerClick={handlePlayerClick}
              editMode={editMode}
              onDragEnd={handleDragEnd}
              showTrails={showTrails}
              keyframes={situation.keyframes}
            />
          </div>
          {!editMode ? (
            <PlaybackControls
              time={time}
              isPlaying={isPlaying}
              speed={speed}
              onPlay={play}
              onPause={pause}
              onReset={reset}
              onScrub={scrub}
              onSpeedChange={setSpeed}
              label={snapshot?.label}
            />
          ) : (
            <SituationEditor
              situation={situation}
              onUpdate={handleEditorUpdate}
              onClose={() => setEditMode(false)}
              activeKeyframe={editorKeyframe}
              onKeyframeChange={handleEditorKeyframeChange}
            />
          )}

          {/* Mobile layout — only visible on small screens */}
          {!editMode && (
            <MobileTabs
              situations={SAMPLE_SITUATIONS}
              activeSituation={situation}
              onSelect={handleSelectSituation}
              focusPanel={focusPanel}
              namePanel={namePanel}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
