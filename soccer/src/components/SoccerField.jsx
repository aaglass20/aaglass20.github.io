import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Stage, Layer, Group, Rect, Circle, Line, Arc, Arrow, Text, Shape,
} from 'react-konva';
import {
  STAGE_WIDTH, STAGE_HEIGHT,
  FIELD_X, FIELD_Y, FIELD_W, FIELD_H,
  CENTER_X, CENTER_Y,
  GOAL_W, GOAL_D,
  L_GOAL_X, R_GOAL_X,
  L_PENALTY, R_PENALTY,
  L_GOAL_AREA, R_GOAL_AREA,
  CENTER_CIRCLE_R,
  L_PENALTY_SPOT, R_PENALTY_SPOT,
  PENALTY_ARC_R,
  CORNER_ARC_R,
  COLORS,
} from '../data/fieldConstants';

const PLAYER_RADIUS = 16;
const BALL_RADIUS = 9;
const CONE_RADIUS = 8;

// ---- Field Layer ----

function FieldLayer() {
  const stripeCount = 8;
  const stripeW = FIELD_W / stripeCount;

  return (
    <Layer>
      {/* Stage background */}
      <Rect x={0} y={0} width={STAGE_WIDTH} height={STAGE_HEIGHT} fill="#1a2a0f" />

      {/* Field background */}
      <Rect x={FIELD_X} y={FIELD_Y} width={FIELD_W} height={FIELD_H} fill={COLORS.grass} />

      {/* Alternating grass stripes */}
      {Array.from({ length: stripeCount }, (_, i) => (
        i % 2 === 0 ? (
          <Rect
            key={i}
            x={FIELD_X + i * stripeW}
            y={FIELD_Y}
            width={stripeW}
            height={FIELD_H}
            fill={COLORS.grassAlt}
          />
        ) : null
      ))}

      {/* Field boundary */}
      <Rect
        x={FIELD_X} y={FIELD_Y} width={FIELD_W} height={FIELD_H}
        stroke={COLORS.line} strokeWidth={2} fill="transparent"
      />

      {/* Center line */}
      <Line
        points={[CENTER_X, FIELD_Y, CENTER_X, FIELD_Y + FIELD_H]}
        stroke={COLORS.line} strokeWidth={2}
      />

      {/* Center circle */}
      <Circle
        x={CENTER_X} y={CENTER_Y} radius={CENTER_CIRCLE_R}
        stroke={COLORS.line} strokeWidth={2} fill="transparent"
      />

      {/* Center spot */}
      <Circle x={CENTER_X} y={CENTER_Y} radius={4} fill={COLORS.line} />

      {/* Left penalty area */}
      <Rect
        x={L_PENALTY.x} y={L_PENALTY.y} width={L_PENALTY.w} height={L_PENALTY.h}
        stroke={COLORS.line} strokeWidth={2} fill="transparent"
      />

      {/* Right penalty area */}
      <Rect
        x={R_PENALTY.x} y={R_PENALTY.y} width={R_PENALTY.w} height={R_PENALTY.h}
        stroke={COLORS.line} strokeWidth={2} fill="transparent"
      />

      {/* Left goal area */}
      <Rect
        x={L_GOAL_AREA.x} y={L_GOAL_AREA.y} width={L_GOAL_AREA.w} height={L_GOAL_AREA.h}
        stroke={COLORS.line} strokeWidth={2} fill="transparent"
      />

      {/* Right goal area */}
      <Rect
        x={R_GOAL_AREA.x} y={R_GOAL_AREA.y} width={R_GOAL_AREA.w} height={R_GOAL_AREA.h}
        stroke={COLORS.line} strokeWidth={2} fill="transparent"
      />

      {/* Penalty spots */}
      <Circle x={L_PENALTY_SPOT.x} y={L_PENALTY_SPOT.y} radius={3} fill={COLORS.line} />
      <Circle x={R_PENALTY_SPOT.x} y={R_PENALTY_SPOT.y} radius={3} fill={COLORS.line} />

      {/* Left penalty arc (outside penalty area) */}
      {/* Arc centered on L_PENALTY_SPOT, only the part outside the penalty box */}
      {/* The penalty box right edge is at FIELD_X + L_PENALTY.w = ~207 */}
      {/* Angle range roughly 307..53 deg going outside penalty area */}
      <Arc
        x={L_PENALTY_SPOT.x} y={L_PENALTY_SPOT.y}
        innerRadius={PENALTY_ARC_R - 1} outerRadius={PENALTY_ARC_R + 1}
        angle={106} rotation={-53}
        stroke={COLORS.line} strokeWidth={2} fill={COLORS.line}
      />

      {/* Right penalty arc */}
      <Arc
        x={R_PENALTY_SPOT.x} y={R_PENALTY_SPOT.y}
        innerRadius={PENALTY_ARC_R - 1} outerRadius={PENALTY_ARC_R + 1}
        angle={106} rotation={127}
        stroke={COLORS.line} strokeWidth={2} fill={COLORS.line}
      />

      {/* Left goal */}
      <Rect
        x={FIELD_X - GOAL_D} y={CENTER_Y - GOAL_W / 2}
        width={GOAL_D} height={GOAL_W}
        stroke={COLORS.goal} strokeWidth={2} fill="rgba(180,180,180,0.1)"
      />

      {/* Right goal */}
      <Rect
        x={FIELD_X + FIELD_W} y={CENTER_Y - GOAL_W / 2}
        width={GOAL_D} height={GOAL_W}
        stroke={COLORS.goal} strokeWidth={2} fill="rgba(180,180,180,0.1)"
      />

      {/* Corner arcs - top-left */}
      <Arc
        x={FIELD_X} y={FIELD_Y}
        innerRadius={0} outerRadius={CORNER_ARC_R}
        angle={90} rotation={0}
        stroke={COLORS.line} strokeWidth={2} fill="transparent"
      />
      {/* top-right */}
      <Arc
        x={FIELD_X + FIELD_W} y={FIELD_Y}
        innerRadius={0} outerRadius={CORNER_ARC_R}
        angle={90} rotation={90}
        stroke={COLORS.line} strokeWidth={2} fill="transparent"
      />
      {/* bottom-right */}
      <Arc
        x={FIELD_X + FIELD_W} y={FIELD_Y + FIELD_H}
        innerRadius={0} outerRadius={CORNER_ARC_R}
        angle={90} rotation={180}
        stroke={COLORS.line} strokeWidth={2} fill="transparent"
      />
      {/* bottom-left */}
      <Arc
        x={FIELD_X} y={FIELD_Y + FIELD_H}
        innerRadius={0} outerRadius={CORNER_ARC_R}
        angle={90} rotation={270}
        stroke={COLORS.line} strokeWidth={2} fill="transparent"
      />
    </Layer>
  );
}

// ---- Player Component ----

function PlayerNode({
  x, y, team, position, highlighted, name,
  draggable, onDragEnd, onClick, opacity = 1,
}) {
  const isGK = position === 'GK';
  let fill;
  if (team === 'home') {
    fill = isGK ? COLORS.homeGK : COLORS.homeTeam;
  } else {
    fill = isGK ? COLORS.awayGK : COLORS.awayTeam;
  }

  const handleDragEnd = useCallback((e) => {
    onDragEnd && onDragEnd(team, position, e.target.x(), e.target.y());
  }, [onDragEnd, team, position]);

  return (
    <Group
      x={x} y={y}
      draggable={draggable}
      onDragEnd={handleDragEnd}
      onClick={() => onClick && onClick(team, position)}
      opacity={opacity}
    >
      {/* Shadow */}
      <Circle
        x={2} y={3}
        radius={PLAYER_RADIUS}
        fill={COLORS.shadow}
      />

      {/* Highlight ring */}
      {highlighted && (
        <Circle
          x={0} y={0}
          radius={PLAYER_RADIUS + 5}
          stroke={COLORS.highlight}
          strokeWidth={3}
          fill="transparent"
        />
      )}

      {/* Main circle */}
      <Circle
        x={0} y={0}
        radius={PLAYER_RADIUS}
        fill={fill}
        stroke="rgba(255,255,255,0.4)"
        strokeWidth={1.5}
      />

      {/* Position label */}
      <Text
        x={-PLAYER_RADIUS} y={-6}
        width={PLAYER_RADIUS * 2}
        text={position.length > 3 ? position.slice(0, 3) : position}
        fontSize={9}
        fontStyle="bold"
        fill={COLORS.playerText}
        align="center"
      />

      {/* Player name (if set) */}
      {name && (
        <Text
          x={-PLAYER_RADIUS - 5} y={PLAYER_RADIUS + 3}
          width={PLAYER_RADIUS * 2 + 10}
          text={name}
          fontSize={8}
          fill="#e0e0e0"
          align="center"
        />
      )}
    </Group>
  );
}

// ---- Soccer Ball Component ----

function SoccerBall({ x, y, draggable, onDragEnd }) {
  const handleDragEnd = useCallback((e) => {
    onDragEnd && onDragEnd(e.target.x(), e.target.y());
  }, [onDragEnd]);

  // Pentagon patch offsets for classic ball pattern (simplified overhead view)
  const patches = [
    { dx: 0,   dy: 0   },
    { dx: 5,   dy: -5  },
    { dx: -5,  dy: -5  },
    { dx: 5,   dy: 5   },
    { dx: -5,  dy: 5   },
  ];

  return (
    <Group x={x} y={y} draggable={draggable} onDragEnd={handleDragEnd}>
      {/* Shadow */}
      <Circle x={1} y={2} radius={BALL_RADIUS} fill="rgba(0,0,0,0.4)" />
      {/* White ball */}
      <Circle x={0} y={0} radius={BALL_RADIUS} fill={COLORS.ball} stroke="#333" strokeWidth={1} />
      {/* Black patches */}
      {patches.map((p, i) => (
        <Circle key={i} x={p.dx} y={p.dy} radius={2.5} fill="#222" />
      ))}
    </Group>
  );
}

// ---- Cone Component ----

function ConeNode({ id, x, y, onDragEnd, onRemove }) {
  return (
    <Group
      x={x} y={y}
      draggable
      onDragEnd={(e) => onDragEnd && onDragEnd(id, e.target.x(), e.target.y())}
      onContextMenu={(e) => {
        e.evt.preventDefault();
        onRemove && onRemove(id);
      }}
    >
      {/* Shadow */}
      <Circle x={1} y={2} radius={CONE_RADIUS + 1} fill="rgba(0,0,0,0.3)" />
      {/* Cone triangle (overhead) */}
      <Shape
        sceneFunc={(ctx, shape) => {
          ctx.beginPath();
          ctx.moveTo(0, -CONE_RADIUS);
          ctx.lineTo(CONE_RADIUS * 0.8, CONE_RADIUS * 0.6);
          ctx.lineTo(-CONE_RADIUS * 0.8, CONE_RADIUS * 0.6);
          ctx.closePath();
          ctx.fillStrokeShape(shape);
        }}
        fill={COLORS.cone}
        stroke="#c2400a"
        strokeWidth={1}
      />
      {/* Center dot */}
      <Circle x={0} y={0} radius={2} fill="#fff" opacity={0.7} />
    </Group>
  );
}

// ---- Line/Arrow Renderer ----

function renderLine(line, key) {
  const { x1, y1, x2, y2, type, color = '#ffffff', curveAmount = 0 } = line;
  const strokeColor = color;
  const strokeWidth = 2.5;

  if (type === 'arrow') {
    return (
      <Arrow
        key={key}
        points={[x1, y1, x2, y2]}
        stroke={strokeColor}
        fill={strokeColor}
        strokeWidth={strokeWidth}
        pointerLength={10}
        pointerWidth={8}
      />
    );
  }

  if (type === 'dashed-arrow') {
    // Dashed line + manual arrowhead
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const pl = 10;
    const pw = 8;
    const ax1 = x2 - pl * Math.cos(angle - 0.3);
    const ay1 = y2 - pl * Math.sin(angle - 0.3);
    const ax2 = x2 - pl * Math.cos(angle + 0.3);
    const ay2 = y2 - pl * Math.sin(angle + 0.3);

    return (
      <Group key={key}>
        <Line
          points={[x1, y1, x2, y2]}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          dash={[8, 6]}
        />
        <Line
          points={[ax1, ay1, x2, y2, ax2, ay2]}
          stroke={strokeColor}
          fill={strokeColor}
          strokeWidth={strokeWidth}
          closed
        />
      </Group>
    );
  }

  if (type === 'line') {
    return (
      <Line key={key} points={[x1, y1, x2, y2]} stroke={strokeColor} strokeWidth={strokeWidth} />
    );
  }

  if (type === 'dashed-line') {
    return (
      <Line key={key} points={[x1, y1, x2, y2]} stroke={strokeColor} strokeWidth={strokeWidth} dash={[8, 6]} />
    );
  }

  if (type === 'curve-arrow') {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const perpX = dist > 0 ? -dy / dist : 0;
    const perpY = dist > 0 ? dx / dist : 0;
    const curveDir = line.curveDirection === 'right' ? -1 : 1;
    const offset = curveDir * (curveAmount || 0.4) * dist * 0.5;
    const cpx = mx + perpX * offset;
    const cpy = my + perpY * offset;

    return (
      <Shape
        key={key}
        sceneFunc={(ctx, shape) => {
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.quadraticCurveTo(cpx, cpy, x2, y2);
          ctx.strokeShape(shape);

          // Arrow head
          const endAngle = Math.atan2(y2 - cpy, x2 - cpx);
          const pl = 10;
          const pw = 0.4;
          ctx.beginPath();
          ctx.moveTo(x2, y2);
          ctx.lineTo(
            x2 - pl * Math.cos(endAngle - pw),
            y2 - pl * Math.sin(endAngle - pw)
          );
          ctx.lineTo(
            x2 - pl * Math.cos(endAngle + pw),
            y2 - pl * Math.sin(endAngle + pw)
          );
          ctx.closePath();
          ctx.fillShape(shape);
        }}
        stroke={strokeColor}
        fill={strokeColor}
        strokeWidth={strokeWidth}
      />
    );
  }

  return null;
}

// ---- Trail Layer ----

function TrailsLayer({ keyframes, snapshot }) {
  if (!keyframes || keyframes.length < 2) return <Layer />;

  const allPlayerKeys = new Set();
  keyframes.forEach((kf) => {
    Object.keys(kf.home || {}).forEach((k) => allPlayerKeys.add(`home:${k}`));
    Object.keys(kf.away || {}).forEach((k) => allPlayerKeys.add(`away:${k}`));
  });

  const trails = [];
  for (const key of allPlayerKeys) {
    const [team, pos] = key.split(':');
    const points = [];
    for (const kf of keyframes) {
      const players = team === 'home' ? kf.home : kf.away;
      const p = players?.[pos];
      if (p) {
        points.push(p.x, p.y);
      }
    }
    if (points.length >= 4) {
      const color = team === 'home'
        ? 'rgba(96,165,250,0.5)'
        : 'rgba(248,113,113,0.5)';
      trails.push(
        <Line
          key={key}
          points={points}
          stroke={color}
          strokeWidth={1.5}
          dash={[4, 4]}
        />
      );
    }
  }

  return <Layer>{trails}</Layer>;
}

// ---- Main SoccerField Component ----

export default function SoccerField({
  snapshot,
  editMode,
  activeTool,
  scenario,
  focusedPlayer,
  showTrails,
  keyframes,
  onDragEnd,
  onBallDragEnd,
  onAddCone,
  onDragCone,
  onRemoveCone,
  onAddLine,
  onPlayerClick,
  onFieldClick,
}) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [drawingStart, setDrawingStart] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Responsive scaling
  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        const scaleX = clientWidth / STAGE_WIDTH;
        const scaleY = clientHeight / STAGE_HEIGHT;
        setScale(Math.min(scaleX, scaleY, 1));
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const isDrawingTool = ['arrow', 'dashed-arrow', 'line', 'dashed-line', 'curve-arrow'].includes(activeTool);

  const handleStageClick = useCallback((e) => {
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    const scaledX = pos.x / scale;
    const scaledY = pos.y / scale;

    if (activeTool === 'cone') {
      onAddCone && onAddCone(scaledX, scaledY);
      return;
    }

    if (isDrawingTool) {
      if (!drawingStart) {
        setDrawingStart({ x: scaledX, y: scaledY });
      } else {
        const newLine = {
          id: `line-${Date.now()}`,
          type: activeTool,
          x1: drawingStart.x,
          y1: drawingStart.y,
          x2: scaledX,
          y2: scaledY,
          color: '#ffffff',
          curveAmount: 0.4,
          curveDirection: 'left',
        };
        onAddLine && onAddLine(newLine);
        setDrawingStart(null);
      }
      return;
    }

    onFieldClick && onFieldClick(scaledX, scaledY);
  }, [activeTool, drawingStart, isDrawingTool, scale, onAddCone, onAddLine, onFieldClick]);

  const handleMouseMove = useCallback((e) => {
    if (!isDrawingTool || !drawingStart) return;
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    setMousePos({ x: pos.x / scale, y: pos.y / scale });
  }, [isDrawingTool, drawingStart, scale]);

  const home = snapshot?.home || {};
  const away = snapshot?.away || {};
  const ball = snapshot?.ball || { x: CENTER_X, y: CENTER_Y };
  const frameLines = snapshot?.lines || [];
  const cones = scenario?.cones || [];
  const persistentLines = scenario?.persistentLines || [];

  const draggablePlayers = editMode;

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Stage
        width={STAGE_WIDTH * scale}
        height={STAGE_HEIGHT * scale}
        scaleX={scale}
        scaleY={scale}
        onClick={handleStageClick}
        onMouseMove={handleMouseMove}
        style={{ cursor: activeTool === 'cone' ? 'crosshair' : isDrawingTool ? 'crosshair' : 'default' }}
      >
        {/* Layer 1: Field markings */}
        <FieldLayer />

        {/* Layer 2: Trails */}
        {showTrails && <TrailsLayer keyframes={keyframes} snapshot={snapshot} />}
        {!showTrails && <Layer />}

        {/* Layer 3: Persistent lines */}
        <Layer>
          {persistentLines.map((line, i) => renderLine(line, `pline-${i}`))}
        </Layer>

        {/* Layer 4: Cones */}
        <Layer>
          {cones.map((cone) => (
            <ConeNode
              key={cone.id}
              id={cone.id}
              x={cone.x}
              y={cone.y}
              onDragEnd={onDragCone}
              onRemove={onRemoveCone}
            />
          ))}
        </Layer>

        {/* Layer 5: Frame-specific lines */}
        <Layer>
          {frameLines.map((line, i) => renderLine(line, `fline-${i}`))}
        </Layer>

        {/* Layer 6: Players and ball */}
        <Layer>
          {/* Away players */}
          {Object.entries(away).map(([pos, player]) => {
            const isFocused = focusedPlayer?.team === 'away' && focusedPlayer?.pos === pos;
            const opac = focusedPlayer && !isFocused ? 0.35 : 1;
            return (
              <PlayerNode
                key={`away-${pos}`}
                x={player.x}
                y={player.y}
                team="away"
                position={pos}
                highlighted={player.highlighted}
                name={player.name}
                draggable={draggablePlayers}
                onDragEnd={onDragEnd}
                onClick={onPlayerClick}
                opacity={opac}
              />
            );
          })}

          {/* Home players */}
          {Object.entries(home).map(([pos, player]) => {
            const isFocused = focusedPlayer?.team === 'home' && focusedPlayer?.pos === pos;
            const opac = focusedPlayer && !isFocused ? 0.35 : 1;
            return (
              <PlayerNode
                key={`home-${pos}`}
                x={player.x}
                y={player.y}
                team="home"
                position={pos}
                highlighted={player.highlighted}
                name={player.name}
                draggable={draggablePlayers}
                onDragEnd={onDragEnd}
                onClick={onPlayerClick}
                opacity={opac}
              />
            );
          })}

          {/* Ball */}
          <SoccerBall
            x={ball.x}
            y={ball.y}
            draggable={editMode}
            onDragEnd={onBallDragEnd}
          />
        </Layer>

        {/* Layer 7: Drawing preview */}
        <Layer>
          {drawingStart && (
            <Line
              points={[drawingStart.x, drawingStart.y, mousePos.x, mousePos.y]}
              stroke="rgba(255,255,100,0.7)"
              strokeWidth={2}
              dash={[6, 4]}
            />
          )}
          {/* Cancel drawing hint */}
          {drawingStart && (
            <Circle
              x={drawingStart.x} y={drawingStart.y}
              radius={5}
              fill="rgba(255,255,100,0.9)"
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}
