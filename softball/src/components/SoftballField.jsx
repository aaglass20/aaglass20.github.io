import { Stage, Layer, Line, Circle, Arc, Rect, Text, Group, Arrow } from 'react-konva';
import { FIELD_SIZE, HOME_PLATE, FIRST_BASE, SECOND_BASE, THIRD_BASE, PITCHERS_MOUND, DEFAULT_POSITIONS } from '../data/fieldPositions';

const GRASS_GREEN = '#2d8a4e';
const DIRT_BROWN = '#c4956a';
const LINE_WHITE = '#ffffff';
const BASE_WHITE = '#ffffff';

function SoftballField({ snapshot, focusPosition, playerNames, onPlayerClick }) {
  const width = FIELD_SIZE;
  const height = FIELD_SIZE;

  return (
    <Stage width={width} height={height}>
      <Layer>
        {/* Grass background */}
        <Rect x={0} y={0} width={width} height={height} fill={GRASS_GREEN} />

        {/* Outfield arc (dirt warning track hint) */}
        <Arc
          x={HOME_PLATE.x}
          y={HOME_PLATE.y}
          innerRadius={340}
          outerRadius={360}
          angle={90}
          rotation={-135}
          fill="#3a9960"
        />

        {/* Infield dirt */}
        <Circle x={350} y={460} radius={120} fill={DIRT_BROWN} />

        {/* Basepaths */}
        <Line
          points={[HOME_PLATE.x, HOME_PLATE.y, FIRST_BASE.x, FIRST_BASE.y]}
          stroke={LINE_WHITE} strokeWidth={2}
        />
        <Line
          points={[FIRST_BASE.x, FIRST_BASE.y, SECOND_BASE.x, SECOND_BASE.y]}
          stroke={LINE_WHITE} strokeWidth={2}
        />
        <Line
          points={[SECOND_BASE.x, SECOND_BASE.y, THIRD_BASE.x, THIRD_BASE.y]}
          stroke={LINE_WHITE} strokeWidth={2}
        />
        <Line
          points={[THIRD_BASE.x, THIRD_BASE.y, HOME_PLATE.x, HOME_PLATE.y]}
          stroke={LINE_WHITE} strokeWidth={2}
        />

        {/* Foul lines — extend through 1st and 3rd base to outfield edge */}
        <Line
          points={[HOME_PLATE.x, HOME_PLATE.y, 0, 230]}
          stroke={LINE_WHITE} strokeWidth={2}
        />
        <Line
          points={[HOME_PLATE.x, HOME_PLATE.y, 700, 230]}
          stroke={LINE_WHITE} strokeWidth={2}
        />

        {/* Bases */}
        <Rect x={FIRST_BASE.x - 8} y={FIRST_BASE.y - 8} width={16} height={16} fill={BASE_WHITE} rotation={45} offsetX={0} offsetY={0} />
        <Rect x={SECOND_BASE.x - 8} y={SECOND_BASE.y - 8} width={16} height={16} fill={BASE_WHITE} rotation={45} />
        <Rect x={THIRD_BASE.x - 8} y={THIRD_BASE.y - 8} width={16} height={16} fill={BASE_WHITE} rotation={45} />

        {/* Home plate */}
        <Line
          points={[
            HOME_PLATE.x, HOME_PLATE.y - 8,
            HOME_PLATE.x + 8, HOME_PLATE.y - 4,
            HOME_PLATE.x + 8, HOME_PLATE.y + 4,
            HOME_PLATE.x - 8, HOME_PLATE.y + 4,
            HOME_PLATE.x - 8, HOME_PLATE.y - 4,
          ]}
          closed fill={BASE_WHITE}
        />

        {/* Pitcher's circle */}
        <Circle x={PITCHERS_MOUND.x} y={PITCHERS_MOUND.y} radius={12} fill={DIRT_BROWN} stroke={LINE_WHITE} strokeWidth={1} />

        {/* Ball */}
        {snapshot?.ball && (
          <Group>
            <Circle
              x={snapshot.ball.x}
              y={snapshot.ball.y}
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
          const isFocused = !focusPosition || focusPosition === pos;
          const opacity = focusPosition && !isFocused ? 0.2 : 1;
          const displayName = playerNames?.[pos] || def.label;
          const isHighlighted = focusPosition === pos;

          return (
            <Group
              key={pos}
              x={coords.x}
              y={coords.y}
              opacity={opacity}
              onClick={() => onPlayerClick?.(pos)}
              onTap={() => onPlayerClick?.(pos)}
            >
              {isHighlighted && (
                <Circle radius={24} fill="rgba(255,255,0,0.3)" stroke="#ffff00" strokeWidth={2} />
              )}
              <Circle radius={16} fill={def.color} stroke="#fff" strokeWidth={2} />
              <Text
                text={def.label}
                fontSize={11}
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
              onClick={() => onPlayerClick?.(key)}
              onTap={() => onPlayerClick?.(key)}
            >
              {isHighlighted && (
                <Circle radius={24} fill="rgba(255,200,0,0.3)" stroke="#ffc800" strokeWidth={2} />
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
      </Layer>
    </Stage>
  );
}

export default SoftballField;
