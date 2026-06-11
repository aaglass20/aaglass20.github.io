import { useState, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './App.css';

import SoccerField from './components/SoccerField';
import PlaybackControls from './components/PlaybackControls';
import ScenarioDrawer from './components/ScenarioDrawer';
import ToolsDrawer from './components/ToolsDrawer';
import AnimationDrawer from './components/AnimationDrawer';
import PlayerPanel from './components/PlayerPanel';
import FormationSelector from './components/FormationSelector';

import { useAnimationLoop } from './hooks/useAnimationLoop';
import { useSupabase } from './hooks/useSupabase';
import { sampleScenarios } from './data/sampleScenarios';
import { buildDefaultPlayers, FORMATIONS } from './data/formations';

// ---- helpers ----

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function buildDefaultKeyframe(gameFormat, formation, time, label) {
  const players = buildDefaultPlayers(gameFormat, formation);
  return {
    id: uuidv4(),
    time,
    label,
    ball: { x: 550, y: 350 },
    home: players.home,
    away: players.away,
    lines: [],
  };
}

function buildBlankScenario() {
  const kf1 = buildDefaultKeyframe('11v11', '4-3-3', 0, 'Start');
  const kf2 = buildDefaultKeyframe('11v11', '4-3-3', 50, 'Middle');
  const kf3 = buildDefaultKeyframe('11v11', '4-3-3', 100, 'End');
  return {
    id: uuidv4(),
    title: 'New Scenario',
    description: '',
    category: 'Other',
    gameFormat: '11v11',
    formation: '4-3-3',
    cones: [],
    persistentLines: [],
    keyframes: [kf1, kf2, kf3],
  };
}

// Apply names from playerNames state into a keyframe's home/away
function applyNamesToKeyframe(kf, playerNames) {
  const home = { ...kf.home };
  const away = { ...kf.away };
  for (const pos of Object.keys(home)) {
    home[pos] = { ...home[pos], name: playerNames.home?.[pos] || '' };
  }
  for (const pos of Object.keys(away)) {
    away[pos] = { ...away[pos], name: playerNames.away?.[pos] || '' };
  }
  return { ...kf, home, away };
}

// ---- App ----

export default function App() {
  const containerRef = useRef(null);

  // Scenarios
  const [scenarios, setScenarios] = useState(sampleScenarios);
  const [activeScenarioId, setActiveScenarioId] = useState(sampleScenarios[0].id);
  const activeScenario = scenarios.find((s) => s.id === activeScenarioId) || scenarios[0];

  // Drawers
  const [showScenarioDrawer, setShowScenarioDrawer] = useState(false);
  const [showToolsDrawer, setShowToolsDrawer] = useState(false);
  const [showAnimationDrawer, setShowAnimationDrawer] = useState(false);
  const [showFormationSelector, setShowFormationSelector] = useState(false);
  const [showPlayerPanel, setShowPlayerPanel] = useState(false);

  // Tools
  const [activeTool, setActiveTool] = useState('select');
  const [lineColor, setLineColor] = useState('#ffffff');
  const [linePersistence, setLinePersistence] = useState('frame');

  // Players
  const [focusedPlayer, setFocusedPlayer] = useState(null);
  const [playerNames, setPlayerNames] = useState({ home: {}, away: {} });
  const [showTrails, setShowTrails] = useState(false);

  // Edit mode & keyframes
  const [editMode, setEditMode] = useState(false);
  const [activeKeyframeIndex, setActiveKeyframeIndex] = useState(0);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((msg) => {
    clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  }, []);

  // Animation
  const { snapshot, time, isPlaying, play, pause, reset, scrub, setSpeed, speed } =
    useAnimationLoop(activeScenario?.keyframes || [], 6000);

  // Supabase / localStorage
  const { saveScenario, loadScenarios, deleteScenario, loading: dbLoading, isOffline } = useSupabase();

  // ---- Scenario mutation helpers ----

  const updateActiveScenario = useCallback((updater) => {
    setScenarios((prev) =>
      prev.map((s) => (s.id === activeScenarioId ? updater(deepClone(s)) : s))
    );
  }, [activeScenarioId]);

  const updateActiveKeyframe = useCallback((kfIndex, updater) => {
    updateActiveScenario((s) => {
      const kfs = [...s.keyframes];
      kfs[kfIndex] = updater(kfs[kfIndex]);
      return { ...s, keyframes: kfs };
    });
  }, [updateActiveScenario]);

  // ---- Player drag ----

  const handleDragEnd = useCallback((team, position, x, y) => {
    updateActiveKeyframe(activeKeyframeIndex, (kf) => {
      const players = kf[team] ? { ...kf[team] } : {};
      players[position] = { ...(players[position] || {}), x, y };
      return { ...kf, [team]: players };
    });
  }, [activeKeyframeIndex, updateActiveKeyframe]);

  const handleBallDragEnd = useCallback((x, y) => {
    updateActiveKeyframe(activeKeyframeIndex, (kf) => ({ ...kf, ball: { x, y } }));
  }, [activeKeyframeIndex, updateActiveKeyframe]);

  // ---- Cones ----

  const handleAddCone = useCallback((x, y) => {
    updateActiveScenario((s) => ({
      ...s,
      cones: [...(s.cones || []), { id: uuidv4(), x, y }],
    }));
  }, [updateActiveScenario]);

  const handleDragCone = useCallback((id, x, y) => {
    updateActiveScenario((s) => ({
      ...s,
      cones: (s.cones || []).map((c) => (c.id === id ? { ...c, x, y } : c)),
    }));
  }, [updateActiveScenario]);

  const handleRemoveCone = useCallback((id) => {
    updateActiveScenario((s) => ({
      ...s,
      cones: (s.cones || []).filter((c) => c.id !== id),
    }));
  }, [updateActiveScenario]);

  // ---- Lines ----

  const handleAddLine = useCallback((line) => {
    const coloredLine = { ...line, color: lineColor };
    if (linePersistence === 'scenario') {
      updateActiveScenario((s) => ({
        ...s,
        persistentLines: [...(s.persistentLines || []), coloredLine],
      }));
    } else {
      updateActiveKeyframe(activeKeyframeIndex, (kf) => ({
        ...kf,
        lines: [...(kf.lines || []), coloredLine],
      }));
    }
  }, [lineColor, linePersistence, activeKeyframeIndex, updateActiveScenario, updateActiveKeyframe]);

  const handleClearFrameLines = useCallback(() => {
    updateActiveKeyframe(activeKeyframeIndex, (kf) => ({ ...kf, lines: [] }));
  }, [activeKeyframeIndex, updateActiveKeyframe]);

  const handleClearAllLines = useCallback(() => {
    updateActiveScenario((s) => ({
      ...s,
      persistentLines: [],
      keyframes: s.keyframes.map((kf) => ({ ...kf, lines: [] })),
    }));
  }, [updateActiveScenario]);

  // ---- Keyframes ----

  const handleCaptureFrame = useCallback(() => {
    if (!snapshot) return;
    const kfs = activeScenario?.keyframes || [];
    const kf = kfs[activeKeyframeIndex];
    const label = kf?.label || `Frame ${activeKeyframeIndex + 1}`;
    updateActiveKeyframe(activeKeyframeIndex, (kf) => ({
      ...kf,
      home: deepClone(snapshot.home || {}),
      away: deepClone(snapshot.away || {}),
      ball: deepClone(snapshot.ball || { x: 550, y: 350 }),
    }));
    showToast(`✓ "${label}" captured`);
  }, [snapshot, activeKeyframeIndex, activeScenario, updateActiveKeyframe, showToast]);

  const handleAddKeyframe = useCallback(() => {
    const kfs = activeScenario?.keyframes || [];
    const afterIdx = activeKeyframeIndex;
    const kfA = kfs[afterIdx];
    const kfB = kfs[afterIdx + 1];

    let newTime;
    if (kfB) {
      newTime = Math.round((kfA.time + kfB.time) / 2);
    } else {
      newTime = Math.min(100, kfA.time + 10);
    }

    const newKf = {
      id: uuidv4(),
      time: newTime,
      label: `Frame ${kfs.length + 1}`,
      ball: deepClone(kfA.ball || { x: 550, y: 350 }),
      home: deepClone(kfA.home || {}),
      away: deepClone(kfA.away || {}),
      lines: [],
    };

    updateActiveScenario((s) => {
      const kfsCopy = [...s.keyframes];
      kfsCopy.splice(afterIdx + 1, 0, newKf);
      return { ...s, keyframes: kfsCopy };
    });
    setActiveKeyframeIndex(afterIdx + 1);
  }, [activeScenario, activeKeyframeIndex, updateActiveScenario]);

  const handleRemoveKeyframe = useCallback(() => {
    const kfs = activeScenario?.keyframes || [];
    if (kfs.length <= 2) return;
    updateActiveScenario((s) => {
      const kfsCopy = [...s.keyframes];
      kfsCopy.splice(activeKeyframeIndex, 1);
      return { ...s, keyframes: kfsCopy };
    });
    setActiveKeyframeIndex((i) => Math.max(0, i - 1));
  }, [activeScenario, activeKeyframeIndex, updateActiveScenario]);

  const handleUpdateKeyframe = useCallback((index, updates) => {
    updateActiveKeyframe(index, (kf) => ({ ...kf, ...updates }));
  }, [updateActiveKeyframe]);

  const handleAutoSpaceTimes = useCallback(() => {
    updateActiveScenario((s) => {
      const kfs = s.keyframes.map((kf, i) => ({
        ...kf,
        time: Math.round((i / (s.keyframes.length - 1)) * 100),
      }));
      return { ...s, keyframes: kfs };
    });
  }, [updateActiveScenario]);

  const handleUpdateMovementCurve = useCallback((team, position, curveAmount) => {
    updateActiveKeyframe(activeKeyframeIndex, (kf) => {
      const players = { ...kf[team] };
      if (players[position]) {
        players[position] = { ...players[position], curve: curveAmount };
      }
      return { ...kf, [team]: players };
    });
  }, [activeKeyframeIndex, updateActiveKeyframe]);

  // ---- Scenario management ----

  const handleNewScenario = useCallback(() => {
    const s = buildBlankScenario();
    setScenarios((prev) => [...prev, s]);
    setActiveScenarioId(s.id);
    setActiveKeyframeIndex(0);
    reset();
  }, [reset]);

  const handleSaveScenario = useCallback(async () => {
    if (!activeScenario) return;
    try {
      await saveScenario(activeScenario);
    } catch {
      // error handled in hook
    }
  }, [activeScenario, saveScenario]);

  const handleDeleteScenario = useCallback(async (id) => {
    try {
      await deleteScenario(id);
    } catch {
      // best effort
    }
    setScenarios((prev) => {
      const remaining = prev.filter((s) => s.id !== id);
      if (activeScenarioId === id && remaining.length > 0) {
        setActiveScenarioId(remaining[0].id);
      }
      return remaining.length > 0 ? remaining : [buildBlankScenario()];
    });
  }, [activeScenarioId, deleteScenario]);

  const handleSelectScenario = useCallback((id) => {
    setActiveScenarioId(id);
    setActiveKeyframeIndex(0);
    reset();
    setFocusedPlayer(null);
  }, [reset]);

  const handleLoadScenarios = useCallback(async () => {
    const loaded = await loadScenarios();
    if (loaded.length > 0) {
      setScenarios((prev) => {
        const existingIds = new Set(prev.map((s) => s.id));
        const newOnes = loaded.filter((s) => !existingIds.has(s.id));
        return [...prev, ...newOnes];
      });
    }
  }, [loadScenarios]);

  // ---- Formation change ----

  const handleApplyFormation = useCallback((gameFormat, formation) => {
    updateActiveScenario((s) => {
      const newKeyframes = s.keyframes.map((kf) => {
        const players = buildDefaultPlayers(gameFormat, formation);
        return {
          ...kf,
          home: players.home,
          away: players.away,
        };
      });
      return { ...s, gameFormat, formation, keyframes: newKeyframes };
    });
    setActiveKeyframeIndex(0);
    reset();
  }, [updateActiveScenario, reset]);

  // ---- Player names ----

  const handleNameChange = useCallback((team, position, name) => {
    setPlayerNames((prev) => ({
      ...prev,
      [team]: { ...(prev[team] || {}), [position]: name },
    }));
    // Also update in all keyframes
    updateActiveScenario((s) => ({
      ...s,
      keyframes: s.keyframes.map((kf) => {
        const players = { ...kf[team] };
        if (players[position]) {
          players[position] = { ...players[position], name };
        }
        return { ...kf, [team]: players };
      }),
    }));
  }, [updateActiveScenario]);

  const handleToggleHighlight = useCallback((team, position) => {
    // Toggle in active keyframe
    updateActiveKeyframe(activeKeyframeIndex, (kf) => {
      const players = { ...kf[team] };
      if (players[position]) {
        players[position] = {
          ...players[position],
          highlighted: !players[position].highlighted,
        };
      }
      return { ...kf, [team]: players };
    });
  }, [activeKeyframeIndex, updateActiveKeyframe]);

  const handlePlayerClick = useCallback((team, pos) => {
    setFocusedPlayer((prev) =>
      prev?.team === team && prev?.pos === pos ? null : { team, pos }
    );
  }, []);

  // Active keyframe cursor advance on scrub
  const handleScrub = useCallback((val) => {
    scrub(val);
    // Advance activeKeyframeIndex to closest keyframe
    const kfs = activeScenario?.keyframes || [];
    if (kfs.length > 0) {
      let closest = 0;
      let minDist = Infinity;
      kfs.forEach((kf, i) => {
        const d = Math.abs(kf.time - val);
        if (d < minDist) { minDist = d; closest = i; }
      });
      setActiveKeyframeIndex(closest);
    }
  }, [scrub, activeScenario]);

  return (
    <div className="app">
      {/* Field area */}
      <div className="field-container" ref={containerRef}>
        <SoccerField
          snapshot={snapshot}
          editMode={editMode}
          activeTool={activeTool}
          scenario={activeScenario}
          focusedPlayer={focusedPlayer}
          showTrails={showTrails}
          keyframes={activeScenario?.keyframes}
          onDragEnd={handleDragEnd}
          onBallDragEnd={handleBallDragEnd}
          onAddCone={handleAddCone}
          onDragCone={handleDragCone}
          onRemoveCone={handleRemoveCone}
          onAddLine={handleAddLine}
          onPlayerClick={handlePlayerClick}
        />
      </div>

      {/* Playback controls */}
      <PlaybackControls
        time={time}
        isPlaying={isPlaying}
        speed={speed}
        label={snapshot?.label || ''}
        showTrails={showTrails}
        onPlay={play}
        onPause={pause}
        onReset={reset}
        onScrub={handleScrub}
        onSpeedChange={setSpeed}
        onShowTrailsChange={setShowTrails}
        onOpenAnimationDrawer={() => setShowAnimationDrawer(true)}
      />

      {/* FAB buttons */}
      <button className="fab fab-left" onClick={() => setShowScenarioDrawer(true)}>
        Scenarios
      </button>
      <button className="fab fab-right" onClick={() => setShowToolsDrawer(true)}>
        Tools
      </button>
      <button
        className="fab fab-top-right"
        onClick={() => setShowPlayerPanel((p) => !p)}
      >
        Players
      </button>
      <button
        className="fab fab-formation"
        onClick={() => setShowFormationSelector(true)}
      >
        Formation
      </button>
      <button
        className={`fab fab-edit ${editMode ? 'active' : ''}`}
        onClick={() => setEditMode((e) => !e)}
      >
        {editMode ? 'Done' : 'Edit'}
      </button>

      {/* Scenario title display */}
      <div className="scenario-title-bar">
        <span className="scenario-title">{activeScenario?.title || 'Untitled'}</span>
        {editMode && <span className="edit-mode-badge">EDIT MODE</span>}
      </div>

      {/* Drawers */}
      <ScenarioDrawer
        isOpen={showScenarioDrawer}
        onClose={() => setShowScenarioDrawer(false)}
        scenarios={scenarios}
        activeScenarioId={activeScenarioId}
        onSelectScenario={handleSelectScenario}
        onNewScenario={handleNewScenario}
        onDeleteScenario={handleDeleteScenario}
        onSaveScenario={handleSaveScenario}
        loading={dbLoading}
        isOffline={isOffline}
      />

      <ToolsDrawer
        isOpen={showToolsDrawer}
        onClose={() => setShowToolsDrawer(false)}
        activeTool={activeTool}
        onToolSelect={setActiveTool}
        activeLineColor={lineColor}
        onLineColorChange={setLineColor}
        linePersistence={linePersistence}
        onLineTypeChange={setLinePersistence}
        onClearFrameLines={handleClearFrameLines}
        onClearAllLines={handleClearAllLines}
      />

      <AnimationDrawer
        isOpen={showAnimationDrawer}
        onClose={() => setShowAnimationDrawer(false)}
        scenario={activeScenario}
        activeKeyframeIndex={activeKeyframeIndex}
        onKeyframeSelect={setActiveKeyframeIndex}
        onCaptureFrame={handleCaptureFrame}
        onAddKeyframe={handleAddKeyframe}
        onRemoveKeyframe={handleRemoveKeyframe}
        onUpdateKeyframeLabel={(idx, label) => handleUpdateKeyframe(idx, { label })}
        onUpdateKeyframeTime={(idx, t) => handleUpdateKeyframe(idx, { time: t })}
        onAutoSpaceTimes={handleAutoSpaceTimes}
        onUpdateMovementCurve={handleUpdateMovementCurve}
        time={time}
        snapshot={snapshot}
        focusedPlayer={focusedPlayer}
      />

      {showPlayerPanel && (
        <div className="player-panel-float">
          <PlayerPanel
            scenario={activeScenario}
            focusedPlayer={focusedPlayer}
            playerNames={playerNames}
            onFocusPlayer={setFocusedPlayer}
            onNameChange={handleNameChange}
            onToggleHighlight={handleToggleHighlight}
            gameFormat={activeScenario?.gameFormat || '11v11'}
          />
        </div>
      )}

      <FormationSelector
        isOpen={showFormationSelector}
        onClose={() => setShowFormationSelector(false)}
        gameFormat={activeScenario?.gameFormat}
        formation={activeScenario?.formation}
        onApply={handleApplyFormation}
      />

      {toast && <div className="app-toast">{toast}</div>}
    </div>
  );
}
