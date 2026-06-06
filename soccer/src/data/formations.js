// Stage width = 1100, field runs left-right
// Home team: GK on left, attacks right
// Away team: GK on right, attacks left (mirrored)

const STAGE_W = 1100;

function mirror(positions) {
  const result = {};
  for (const [key, val] of Object.entries(positions)) {
    result[key] = { x: STAGE_W - val.x, y: val.y };
  }
  return result;
}

// --------------- 11v11 Formations ---------------

const home433 = {
  GK:  { x: 80,  y: 350 },
  LB:  { x: 230, y: 540 },
  CB1: { x: 220, y: 430 },
  CB2: { x: 220, y: 270 },
  RB:  { x: 230, y: 160 },
  LCM: { x: 430, y: 490 },
  CM:  { x: 450, y: 350 },
  RCM: { x: 430, y: 210 },
  LW:  { x: 660, y: 540 },
  ST:  { x: 700, y: 350 },
  RW:  { x: 660, y: 160 },
};

const home442 = {
  GK:  { x: 80,  y: 350 },
  LB:  { x: 230, y: 540 },
  CB1: { x: 220, y: 430 },
  CB2: { x: 220, y: 270 },
  RB:  { x: 230, y: 160 },
  LM:  { x: 430, y: 530 },
  LCM: { x: 430, y: 420 },
  RCM: { x: 430, y: 280 },
  RM:  { x: 430, y: 170 },
  LS:  { x: 680, y: 420 },
  RS:  { x: 680, y: 280 },
};

const home4231 = {
  GK:  { x: 80,  y: 350 },
  LB:  { x: 230, y: 540 },
  CB1: { x: 220, y: 430 },
  CB2: { x: 220, y: 270 },
  RB:  { x: 230, y: 160 },
  CDM1:{ x: 370, y: 420 },
  CDM2:{ x: 370, y: 280 },
  LAM: { x: 530, y: 510 },
  CAM: { x: 560, y: 350 },
  RAM: { x: 530, y: 190 },
  ST:  { x: 720, y: 350 },
};

const home352 = {
  GK:  { x: 80,  y: 350 },
  CB1: { x: 210, y: 470 },
  CB2: { x: 210, y: 350 },
  CB3: { x: 210, y: 230 },
  LWB: { x: 390, y: 560 },
  LCM: { x: 400, y: 450 },
  CM:  { x: 420, y: 350 },
  RCM: { x: 400, y: 250 },
  RWB: { x: 390, y: 140 },
  LS:  { x: 680, y: 420 },
  RS:  { x: 680, y: 280 },
};

const home451 = {
  GK:  { x: 80,  y: 350 },
  LB:  { x: 230, y: 540 },
  CB1: { x: 220, y: 430 },
  CB2: { x: 220, y: 270 },
  RB:  { x: 230, y: 160 },
  LM:  { x: 430, y: 540 },
  LCM: { x: 430, y: 430 },
  CM:  { x: 450, y: 350 },
  RCM: { x: 430, y: 270 },
  RM:  { x: 430, y: 160 },
  ST:  { x: 700, y: 350 },
};

// --------------- 9v9 Formations ---------------

const home933 = {
  GK:  { x: 80,  y: 350 },
  LB:  { x: 240, y: 490 },
  CB:  { x: 230, y: 350 },
  RB:  { x: 240, y: 210 },
  LM:  { x: 440, y: 480 },
  CM:  { x: 460, y: 350 },
  RM:  { x: 440, y: 220 },
  LW:  { x: 660, y: 490 },
  ST:  { x: 700, y: 350 },
  RW:  { x: 660, y: 210 },
};

const home932 = {
  GK:  { x: 80,  y: 350 },
  LB:  { x: 240, y: 490 },
  CB:  { x: 230, y: 350 },
  RB:  { x: 240, y: 210 },
  LM:  { x: 430, y: 490 },
  LCM: { x: 430, y: 390 },
  RCM: { x: 430, y: 310 },
  RM:  { x: 430, y: 210 },
  LS:  { x: 680, y: 420 },
  RS:  { x: 680, y: 280 },
};

// --------------- 7v7 Formations ---------------

const home721 = {
  GK:  { x: 80,  y: 350 },
  LB:  { x: 250, y: 480 },
  CB:  { x: 240, y: 350 },
  RB:  { x: 250, y: 220 },
  LM:  { x: 480, y: 460 },
  RM:  { x: 480, y: 240 },
  ST:  { x: 700, y: 350 },
};

const home731 = {
  GK:  { x: 80,  y: 350 },
  LB:  { x: 250, y: 480 },
  CB:  { x: 240, y: 350 },
  RB:  { x: 250, y: 220 },
  LM:  { x: 480, y: 480 },
  CM:  { x: 490, y: 350 },
  RM:  { x: 480, y: 220 },
  ST:  { x: 700, y: 350 },
};

// --------------- Formation Registry ---------------

export const FORMATIONS = {
  '11v11': {
    '4-3-3':   { home: home433,  away: mirror(home433)  },
    '4-4-2':   { home: home442,  away: mirror(home442)  },
    '4-2-3-1': { home: home4231, away: mirror(home4231) },
    '3-5-2':   { home: home352,  away: mirror(home352)  },
    '4-5-1':   { home: home451,  away: mirror(home451)  },
  },
  '9v9': {
    '3-3-2': { home: home933, away: mirror(home933) },
    '3-2-3': { home: home932, away: mirror(home932) },
  },
  '7v7': {
    '2-1-2': { home: home721, away: mirror(home721) },
    '2-3-1': { home: home731, away: mirror(home731) },
  },
};

export const GAME_FORMATS = ['11v11', '9v9', '7v7'];

export const FORMATION_OPTIONS = {
  '11v11': ['4-3-3', '4-4-2', '4-2-3-1', '3-5-2', '4-5-1'],
  '9v9':   ['3-3-2', '3-2-3'],
  '7v7':   ['2-1-2', '2-3-1'],
};

export const DEFAULT_PLAYER_KEYS = {
  '11v11': {
    '4-3-3':   ['GK','LB','CB1','CB2','RB','LCM','CM','RCM','LW','ST','RW'],
    '4-4-2':   ['GK','LB','CB1','CB2','RB','LM','LCM','RCM','RM','LS','RS'],
    '4-2-3-1': ['GK','LB','CB1','CB2','RB','CDM1','CDM2','LAM','CAM','RAM','ST'],
    '3-5-2':   ['GK','CB1','CB2','CB3','LWB','LCM','CM','RCM','RWB','LS','RS'],
    '4-5-1':   ['GK','LB','CB1','CB2','RB','LM','LCM','CM','RCM','RM','ST'],
  },
  '9v9': {
    '3-3-2': ['GK','LB','CB','RB','LM','CM','RM','LW','ST','RW'],
    '3-2-3': ['GK','LB','CB','RB','LM','LCM','RCM','RM','LS','RS'],
  },
  '7v7': {
    '2-1-2': ['GK','LB','CB','RB','LM','RM','ST'],
    '2-3-1': ['GK','LB','CB','RB','LM','CM','RM','ST'],
  },
};

// Build a default keyframe player state from a formation
export function buildDefaultPlayers(gameFormat, formation) {
  const f = FORMATIONS[gameFormat]?.[formation];
  if (!f) return { home: {}, away: {} };

  const home = {};
  const away = {};

  for (const [key, pos] of Object.entries(f.home)) {
    home[key] = { x: pos.x, y: pos.y, name: '', highlighted: false, curve: 0 };
  }
  for (const [key, pos] of Object.entries(f.away)) {
    away[key] = { x: pos.x, y: pos.y, name: '', highlighted: false, curve: 0 };
  }

  return { home, away };
}
