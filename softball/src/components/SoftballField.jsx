import { useState, useEffect, useRef, useCallback } from 'react';
import { Stage, Layer, Line, Circle, Rect, Text, Group, Shape } from 'react-konva';
import { FIELD_SIZE, HOME_PLATE, FIRST_BASE, SECOND_BASE, THIRD_BASE, PITCHERS_MOUND, DEFAULT_POSITIONS } from '../data/fieldPositions';

const GRASS_GREEN = '#2d8a4e';
const GRASS_DARK = '#1e6e38';
const DIRT_BROWN = '#c4956a';
const LINE_WHITE = '#ffffff';
const BASE_WHITE = '#ffffff';
const BG_COLOR = '#1a1a2e';
const FENCE_COLOR = '#1a5c30';

// Outfield fence radius — big enough to extend past all outfielders
const FENCE_RADIUS = 435;
const FENCE_BORDER = 6;
// Foul territory dirt strip width
const FOUL_DIRT_WIDTH = 20;

function getTrailPoints(keyframes, type, key) {
  const points = [];
  for (const kf of keyframes) {
    const source = type === 'ball' ? kf.ball : kf[type]?.[key];
    if (source) points.push(source.x, source.y);
  }
  return points;
}

function SoftballField({
  snapshot,
  focusPosition,
  playerNames,
  onPlayerClick,
  editMode,
  onDragEnd,
  showTrails,
  keyframes,
  outs,
}) {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(FIELD_SIZE);

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const scale = Math.min(containerWidth / FIELD_SIZE, 1);
  const displaySize = FIELD_SIZE * scale;

  const hx = HOME_PLATE.x;
  const hy = HOME_PLATE.y;

  // Foul line angle: home through 1B/3B extends at 45 degrees
  const foulRightEnd = { x: hx + FENCE_RADIUS * Math.cos(-Math.PI / 4), y: hy + FENCE_RADIUS * Math.sin(-Math.PI / 4) };
  const foulLeftEnd = { x: hx + FENCE_RADIUS * Math.cos(-Math.PI * 3 / 4), y: hy + FENCE_RADIUS * Math.sin(-Math.PI * 3 / 4) };

  const stageRef = useRef(null);

  // Set touch-action on the actual Konva canvas so scrolling works on mobile
  useEffect(() => {
    if (stageRef.current) {
      const canvas = stageRef.current.getStage().container().querySelector('canvas');
      if (canvas) {
        canvas.style.touchAction = editMode ? 'none' : 'auto';
      }
      stageRef.current.getStage().container().style.touchAction = editMode ? 'none' : 'auto';
    }
  }, [editMode, containerWidth]);

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
    <Stage
      ref={stageRef}
      width={displaySize}
      height={displaySize}
      scaleX={scale}
      scaleY={scale}
    >
      <Layer>
        {/* Background */}
        <Rect x={0} y={0} width={FIELD_SIZE} height={FIELD_SIZE} fill={BG_COLOR} />

        {/* Outfield fence border (dark ring) */}
        <Shape
          sceneFunc={(context, shape) => {
            context.beginPath();
            context.moveTo(hx, hy);
            context.arc(hx, hy, FENCE_RADIUS + FENCE_BORDER, -Math.PI / 4, -Math.PI * 3 / 4, true);
            context.closePath();
            context.fillStrokeShape(shape);
          }}
          fill={FENCE_COLOR}
        />

        {/* Outfield grass — fan/wedge shape */}
        <Shape
          sceneFunc={(context, shape) => {
            context.beginPath();
            context.moveTo(hx, hy);
            context.arc(hx, hy, FENCE_RADIUS, -Math.PI / 4, -Math.PI * 3 / 4, true);
            context.closePath();
            context.fillStrokeShape(shape);
          }}
          fill={GRASS_GREEN}
        />

        {/* Warning track band */}
        <Shape
          sceneFunc={(context, shape) => {
            context.beginPath();
            context.arc(hx, hy, FENCE_RADIUS, -Math.PI / 4, -Math.PI * 3 / 4, true);
            context.arc(hx, hy, FENCE_RADIUS - 14, -Math.PI * 3 / 4, -Math.PI / 4, false);
            context.closePath();
            context.fillStrokeShape(shape);
          }}
          fill={DIRT_BROWN}
          opacity={0.3}
        />

        {/* Foul territory dirt strips — along each foul line, outside the field */}
        {/* Right foul line dirt strip */}
        <Shape
          sceneFunc={(context, shape) => {
            // Strip runs along right foul line from home to fence, on the outside (right side)
            const angle = -Math.PI / 4;
            const perpAngle = angle + Math.PI / 2;
            const dx = Math.cos(perpAngle) * FOUL_DIRT_WIDTH;
            const dy = Math.sin(perpAngle) * FOUL_DIRT_WIDTH;
            const endX = hx + Math.cos(angle) * FENCE_RADIUS;
            const endY = hy + Math.sin(angle) * FENCE_RADIUS;
            context.beginPath();
            context.moveTo(hx, hy);
            context.lineTo(endX, endY);
            context.lineTo(endX + dx, endY + dy);
            context.lineTo(hx + dx, hy + dy);
            context.closePath();
            context.fillStrokeShape(shape);
          }}
          fill={DIRT_BROWN}
          opacity={0.6}
        />
        {/* Left foul line dirt strip */}
        <Shape
          sceneFunc={(context, shape) => {
            const angle = -Math.PI * 3 / 4;
            const perpAngle = angle - Math.PI / 2;
            const dx = Math.cos(perpAngle) * FOUL_DIRT_WIDTH;
            const dy = Math.sin(perpAngle) * FOUL_DIRT_WIDTH;
            const endX = hx + Math.cos(angle) * FENCE_RADIUS;
            const endY = hy + Math.sin(angle) * FENCE_RADIUS;
            context.beginPath();
            context.moveTo(hx, hy);
            context.lineTo(endX, endY);
            context.lineTo(endX + dx, endY + dy);
            context.lineTo(hx + dx, hy + dy);
            context.closePath();
            context.fillStrokeShape(shape);
          }}
          fill={DIRT_BROWN}
          opacity={0.6}
        />

        {/* Home plate dirt semicircle — backstop area */}
        <Shape
          sceneFunc={(context, shape) => {
            context.beginPath();
            // Semicircle behind home plate (below, toward catcher)
            context.arc(hx, hy, 38, -Math.PI / 4, -Math.PI * 3 / 4, true);
            // Larger arc going the other way (below home)
            context.arc(hx, hy, 38, -Math.PI * 3 / 4, Math.PI * 3 / 4, true);
            context.closePath();
            context.fillStrokeShape(shape);
          }}
          fill={DIRT_BROWN}
        />

        {/* Infield dirt — arc shape */}
        <Shape
          sceneFunc={(context, shape) => {
            const dirtCenterY = (HOME_PLATE.y + SECOND_BASE.y) / 2 + 10;
            context.beginPath();
            context.arc(hx, dirtCenterY, 155, 0, Math.PI * 2);
            context.closePath();
            context.fillStrokeShape(shape);
          }}
          fill={DIRT_BROWN}
        />

        {/* Infield grass (inside the diamond) */}
        <Line
          points={[
            hx, hy - 10,
            FIRST_BASE.x - 3, FIRST_BASE.y,
            SECOND_BASE.x, SECOND_BASE.y + 3,
            THIRD_BASE.x + 3, THIRD_BASE.y,
          ]}
          closed
          fill={GRASS_GREEN}
        />

        {/* Pitcher's mound dirt circle */}
        <Circle x={PITCHERS_MOUND.x} y={PITCHERS_MOUND.y} radius={18} fill={DIRT_BROWN} />

        {/* Basepath lines */}
        <Line points={[hx, hy, FIRST_BASE.x, FIRST_BASE.y]} stroke={LINE_WHITE} strokeWidth={2} />
        <Line points={[FIRST_BASE.x, FIRST_BASE.y, SECOND_BASE.x, SECOND_BASE.y]} stroke={LINE_WHITE} strokeWidth={2} />
        <Line points={[SECOND_BASE.x, SECOND_BASE.y, THIRD_BASE.x, THIRD_BASE.y]} stroke={LINE_WHITE} strokeWidth={2} />
        <Line points={[THIRD_BASE.x, THIRD_BASE.y, hx, hy]} stroke={LINE_WHITE} strokeWidth={2} />

        {/* Foul lines — from home to fence */}
        <Line points={[hx, hy, foulRightEnd.x, foulRightEnd.y]} stroke={LINE_WHITE} strokeWidth={2} />
        <Line points={[hx, hy, foulLeftEnd.x, foulLeftEnd.y]} stroke={LINE_WHITE} strokeWidth={2} />

        {/* 2nd base — top point right at the line intersection, base sits inside */}
        <Line
          points={[
            SECOND_BASE.x, SECOND_BASE.y,
            SECOND_BASE.x + 8, SECOND_BASE.y + 8,
            SECOND_BASE.x, SECOND_BASE.y + 16,
            SECOND_BASE.x - 8, SECOND_BASE.y + 8,
          ]}
          closed
          fill={BASE_WHITE}
        />

        {/* 1st base — right point at the line intersection, base sits inside */}
        <Line
          points={[
            FIRST_BASE.x, FIRST_BASE.y,
            FIRST_BASE.x - 8, FIRST_BASE.y + 8,
            FIRST_BASE.x - 16, FIRST_BASE.y,
            FIRST_BASE.x - 8, FIRST_BASE.y - 8,
          ]}
          closed
          fill={BASE_WHITE}
        />

        {/* 3rd base — left point at the line intersection, base sits inside */}
        <Line
          points={[
            THIRD_BASE.x, THIRD_BASE.y,
            THIRD_BASE.x + 8, THIRD_BASE.y - 8,
            THIRD_BASE.x + 16, THIRD_BASE.y,
            THIRD_BASE.x + 8, THIRD_BASE.y + 8,
          ]}
          closed
          fill={BASE_WHITE}
        />

        {/* Home plate (pentagon shape) */}
        <Line
          points={[
            hx, hy - 9,
            hx + 9, hy - 4,
            hx + 9, hy + 5,
            hx - 9, hy + 5,
            hx - 9, hy - 4,
          ]}
          closed fill={BASE_WHITE}
        />

        {/* Pitcher's rubber */}
        <Rect x={PITCHERS_MOUND.x - 10} y={PITCHERS_MOUND.y - 2} width={20} height={4}
          fill={BASE_WHITE} />

        {/* Batter's boxes */}
        <Rect x={hx - 32} y={hy - 22} width={18} height={38}
          stroke={BASE_WHITE} strokeWidth={1.5} fill="transparent" />
        <Rect x={hx + 14} y={hy - 22} width={18} height={38}
          stroke={BASE_WHITE} strokeWidth={1.5} fill="transparent" />

        {/* On-deck circles */}
        <Circle x={hx - 55} y={hy + 28} radius={8} stroke={DIRT_BROWN} strokeWidth={1.5} fill={DIRT_BROWN} opacity={0.7} />
        <Circle x={hx + 55} y={hy + 28} radius={8} stroke={DIRT_BROWN} strokeWidth={1.5} fill={DIRT_BROWN} opacity={0.7} />

        {/* Coach's boxes */}
        <Rect x={160} y={498} width={28} height={48}
          stroke={LINE_WHITE} strokeWidth={1} fill="transparent" opacity={0.4} />
        <Rect x={512} y={498} width={28} height={48}
          stroke={LINE_WHITE} strokeWidth={1} fill="transparent" opacity={0.4} />

        {/* Trail lines */}
        {showTrails && keyframes && (
          <>
            {(() => {
              const pts = getTrailPoints(keyframes, 'ball', null);
              const show = !focusPosition;
              return show && pts.length >= 4 ? (
                <Line points={pts} stroke="#ffff00" strokeWidth={2} dash={[6, 4]} opacity={0.5} />
              ) : null;
            })()}
            {Object.keys(DEFAULT_POSITIONS).map((pos) => {
              const pts = getTrailPoints(keyframes, 'fielders', pos);
              const show = !focusPosition || focusPosition === pos;
              const color = DEFAULT_POSITIONS[pos].color;
              return show && pts.length >= 4 ? (
                <Line key={`trail-${pos}`} points={pts} stroke={color} strokeWidth={2} dash={[6, 4]} opacity={focusPosition === pos ? 0.7 : 0.35} />
              ) : null;
            })}
            {keyframes[0]?.runners && Object.keys(keyframes[0].runners).map((key) => {
              const pts = getTrailPoints(keyframes, 'runners', key);
              const show = !focusPosition || focusPosition === key;
              return show && pts.length >= 4 ? (
                <Line key={`trail-${key}`} points={pts} stroke="#f39c12" strokeWidth={2} dash={[6, 4]} opacity={focusPosition === key ? 0.7 : 0.35} />
              ) : null;
            })}
          </>
        )}

        {/* Ball */}
        {snapshot?.ball && (
          <Group
            x={snapshot.ball.x}
            y={snapshot.ball.y}
            draggable={editMode}
            onDragEnd={(e) => editMode && onDragEnd?.('ball', null, e.target.x(), e.target.y())}
          >
            <Circle
              radius={7}
              fill="#ffff00"
              stroke="#cccc00"
              strokeWidth={1}
              shadowColor="black"
              shadowBlur={4}
              shadowOpacity={0.3}
            />
          </Group>
        )}

        {/* Fielders */}
        {snapshot?.fielders && Object.entries(snapshot.fielders).map(([pos, coords]) => {
          const def = DEFAULT_POSITIONS[pos];
          if (!def) return null;
          const isFocused = !focusPosition || focusPosition === pos;
          const opacity = focusPosition && !isFocused ? 0.2 : 1;
          const isHighlighted = focusPosition === pos;

          return (
            <Group
              key={pos}
              x={coords.x}
              y={coords.y}
              opacity={opacity}
              draggable={editMode}
              onDragEnd={(e) => editMode && onDragEnd?.('fielders', pos, e.target.x(), e.target.y())}
              onClick={() => onPlayerClick?.(pos)}
              onTap={() => onPlayerClick?.(pos)}
            >
              {isHighlighted && (
                <Circle radius={24} fill="rgba(255,255,0,0.3)" stroke="#ffff00" strokeWidth={2} />
              )}
              {editMode && (
                <Circle radius={20} stroke="#e94560" strokeWidth={1} dash={[4, 4]} opacity={0.5} />
              )}
              <Circle radius={16} fill={def.color} stroke="#fff" strokeWidth={2} />
              <Text
                text={def.label}
                fontSize={def.label.length > 2 ? 9 : 11}
                fontStyle="bold"
                fill="#fff"
                align="center"
                verticalAlign="middle"
                width={32}
                height={32}
                offsetX={16}
                offsetY={16}
              />
              {playerNames?.[pos] && (
                <Text
                  text={playerNames[pos]}
                  fontSize={10}
                  fill="#fff"
                  align="center"
                  width={60}
                  offsetX={30}
                  y={20}
                  fontStyle="bold"
                  shadowColor="black"
                  shadowBlur={3}
                  shadowOpacity={0.8}
                />
              )}
            </Group>
          );
        })}

        {/* Runners */}
        {snapshot?.runners && Object.entries(snapshot.runners).map(([key, coords]) => {
          const isFocused = !focusPosition || focusPosition === key;
          const opacity = focusPosition && !isFocused ? 0.2 : 1;
          const label = key === 'batter' ? 'B' : key.replace('runner', 'R');
          const isHighlighted = focusPosition === key;

          return (
            <Group
              key={key}
              x={coords.x}
              y={coords.y}
              opacity={opacity}
              draggable={editMode}
              onDragEnd={(e) => editMode && onDragEnd?.('runners', key, e.target.x(), e.target.y())}
              onClick={() => onPlayerClick?.(key)}
              onTap={() => onPlayerClick?.(key)}
            >
              {isHighlighted && (
                <Circle radius={24} fill="rgba(255,200,0,0.3)" stroke="#ffc800" strokeWidth={2} />
              )}
              {editMode && (
                <Circle radius={18} stroke="#e94560" strokeWidth={1} dash={[4, 4]} opacity={0.5} />
              )}
              <Circle radius={14} fill="#f39c12" stroke="#fff" strokeWidth={2} />
              <Text
                text={label}
                fontSize={11}
                fontStyle="bold"
                fill="#fff"
                align="center"
                verticalAlign="middle"
                width={28}
                height={28}
                offsetX={14}
                offsetY={14}
              />
            </Group>
          );
        })}
        {/* Outs indicator */}
        {outs != null && (
          <Group x={600} y={20}>
            <Rect x={0} y={0} width={80} height={36} fill="#0f1a30" cornerRadius={8} opacity={0.85} />
            <Text
              text="OUTS"
              x={0}
              y={4}
              width={80}
              align="center"
              fontSize={9}
              fill="#888"
              fontStyle="bold"
              letterSpacing={1}
            />
            {[0, 1, 2].map((i) => (
              <Circle
                key={i}
                x={22 + i * 20}
                y={25}
                radius={7}
                fill={i < outs ? '#e94560' : '#16213e'}
                stroke={i < outs ? '#e94560' : '#0f3460'}
                strokeWidth={2}
              />
            ))}
          </Group>
        )}
      </Layer>
    </Stage>
    </div>
  );
}

export default SoftballField;
