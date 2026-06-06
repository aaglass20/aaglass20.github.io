export const STAGE_WIDTH = 1100;
export const STAGE_HEIGHT = 700;

// Field boundary (inside stage)
export const FIELD_X = 50;
export const FIELD_Y = 25;
export const FIELD_W = 1000;
export const FIELD_H = 650;

export const CENTER_X = FIELD_X + FIELD_W / 2;   // 550
export const CENTER_Y = FIELD_Y + FIELD_H / 2;   // 350

// Using ~9.52px per meter (field 105m x 68m)
export const SCALE = FIELD_W / 105; // ~9.52 px/m

// Goal dimensions (7.32m wide, 2.44m deep)
export const GOAL_W = 73;  // px (7.32m * scale ~= 70)
export const GOAL_D = 24;  // depth in px

// Left goal
export const L_GOAL_Y1 = CENTER_Y - GOAL_W / 2;
export const L_GOAL_Y2 = CENTER_Y + GOAL_W / 2;
export const L_GOAL_X = FIELD_X;

// Right goal
export const R_GOAL_Y1 = CENTER_Y - GOAL_W / 2;
export const R_GOAL_Y2 = CENTER_Y + GOAL_W / 2;
export const R_GOAL_X = FIELD_X + FIELD_W;

// Penalty areas (40.32m wide x 16.5m deep)
export const PENALTY_W = 403;  // px
export const PENALTY_D = 157;  // px (16.5 * scale)
export const L_PENALTY = { x: FIELD_X, y: CENTER_Y - PENALTY_W / 2, w: PENALTY_D, h: PENALTY_W };
export const R_PENALTY = { x: FIELD_X + FIELD_W - PENALTY_D, y: CENTER_Y - PENALTY_W / 2, w: PENALTY_D, h: PENALTY_W };

// Goal areas (18.32m wide x 5.5m deep)
export const GOAL_AREA_W = 183;
export const GOAL_AREA_D = 52;
export const L_GOAL_AREA = { x: FIELD_X, y: CENTER_Y - GOAL_AREA_W / 2, w: GOAL_AREA_D, h: GOAL_AREA_W };
export const R_GOAL_AREA = { x: FIELD_X + FIELD_W - GOAL_AREA_D, y: CENTER_Y - GOAL_AREA_W / 2, w: GOAL_AREA_D, h: GOAL_AREA_W };

// Center circle (9.15m radius)
export const CENTER_CIRCLE_R = 87;

// Penalty spots (11m from goal line)
export const L_PENALTY_SPOT = { x: FIELD_X + 105, y: CENTER_Y };
export const R_PENALTY_SPOT = { x: FIELD_X + FIELD_W - 105, y: CENTER_Y };

// Penalty arc radius (same as center circle, 9.15m)
export const PENALTY_ARC_R = 87;

// Corner arc radius (1m)
export const CORNER_ARC_R = 10;

// Colors
export const COLORS = {
  grass: '#2d5a1b',
  grassAlt: '#2a5519',
  grassStripe: '#295218',
  line: '#ffffff',
  goal: '#aaaaaa',
  goalNet: '#888888',
  homeTeam: '#2563eb',
  homeGK: '#1d4ed8',
  awayTeam: '#dc2626',
  awayGK: '#991b1b',
  playerText: '#ffffff',
  ball: '#f5f5f5',
  cone: '#f97316',
  highlight: '#fbbf24',
  shadow: 'rgba(0,0,0,0.3)',
};
