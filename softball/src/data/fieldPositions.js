// Softball field dimensions and default positions
// Field is rendered in a 700x700 canvas, diamond oriented with home at bottom

export const FIELD_SIZE = 700;
export const FIELD_CENTER_X = 350;

// Key field coordinates (based on 60ft basepaths scaled to canvas)
export const HOME_PLATE = { x: 350, y: 580 };
export const FIRST_BASE = { x: 490, y: 440 };
export const SECOND_BASE = { x: 350, y: 340 };
export const THIRD_BASE = { x: 210, y: 440 };
export const PITCHERS_MOUND = { x: 350, y: 470 };

// Default fielder positions
export const DEFAULT_POSITIONS = {
  P:  { x: 350, y: 458, label: 'P',  name: 'Pitcher',        color: '#e74c3c' },
  C:  { x: 350, y: 600, label: 'C',  name: 'Catcher',        color: '#e74c3c' },
  '1B': { x: 500, y: 430, label: '1B', name: 'First Base',    color: '#3498db' },
  '2B': { x: 420, y: 340, label: '2B', name: 'Second Base',   color: '#3498db' },
  SS: { x: 280, y: 340, label: 'SS', name: 'Shortstop',       color: '#3498db' },
  '3B': { x: 200, y: 430, label: '3B', name: 'Third Base',    color: '#3498db' },
  LF: { x: 160, y: 240, label: 'LF', name: 'Left Field',     color: '#2ecc71' },
  CF: { x: 350, y: 180, label: 'CF', name: 'Center Field',    color: '#2ecc71' },
  RF: { x: 540, y: 240, label: 'RF', name: 'Right Field',     color: '#2ecc71' },
};

export const POSITION_KEYS = Object.keys(DEFAULT_POSITIONS);

// Runner positions (on bases)
export const RUNNER_POSITIONS = {
  batter: { ...HOME_PLATE, label: 'B', name: 'Batter', color: '#f39c12' },
  runner1: { ...FIRST_BASE, label: 'R1', name: 'Runner on 1st', color: '#f39c12' },
  runner2: { ...SECOND_BASE, label: 'R2', name: 'Runner on 2nd', color: '#f39c12' },
  runner3: { ...THIRD_BASE, label: 'R3', name: 'Runner on 3rd', color: '#f39c12' },
};
