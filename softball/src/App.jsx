import { useState, useCallback } from 'react';
import SoftballField from './components/SoftballField';
import PlaybackControls from './components/PlaybackControls';
import SituationPicker from './components/SituationPicker';
import PositionPanel from './components/PositionPanel';
import { useAnimationLoop } from './hooks/useAnimationLoop';
import { SAMPLE_SITUATIONS } from './data/sampleSituations';
import './App.css';

function App() {
  const [situation, setSituation] = useState(SAMPLE_SITUATIONS[0]);
  const [focusPosition, setFocusPosition] = useState(null);
  const [playerNames, setPlayerNames] = useState({});

  const { time, isPlaying, speed, snapshot, play, pause, reset, scrub, setSpeed } =
    useAnimationLoop(situation.keyframes, 6000);

  const handleSelectSituation = useCallback((sit) => {
    setSituation(sit);
    setFocusPosition(null);
    reset();
  }, [reset]);

  const handleNameChange = useCallback((pos, name) => {
    setPlayerNames((prev) => ({ ...prev, [pos]: name }));
  }, []);

  const handlePlayerClick = useCallback((pos) => {
    setFocusPosition((prev) => (prev === pos ? null : pos));
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Softball Playbook</h1>
        <p>Animated situational training for every position</p>
      </header>

      <div className="app-layout">
        <aside className="sidebar">
          <SituationPicker
            situations={SAMPLE_SITUATIONS}
            activeSituation={situation}
            onSelect={handleSelectSituation}
          />
          <PositionPanel
            focusPosition={focusPosition}
            onFocusChange={setFocusPosition}
            playerNames={playerNames}
            onNameChange={handleNameChange}
            activeRunners={situation.runners}
          />
        </aside>

        <main className="field-area">
          <div className="field-container">
            <SoftballField
              snapshot={snapshot}
              focusPosition={focusPosition}
              playerNames={playerNames}
              onPlayerClick={handlePlayerClick}
            />
          </div>
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
        </main>
      </div>
    </div>
  );
}

export default App;
