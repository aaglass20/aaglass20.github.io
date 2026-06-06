// Sample scenarios using 4-3-3 formation positions

// ---- Scenario 1: Build Out of Back ----

const buildOutHome1 = {
  GK:  { x: 80,  y: 350, name: '', highlighted: true,  curve: 0 },
  LB:  { x: 230, y: 540, name: '', highlighted: false, curve: 0 },
  CB1: { x: 220, y: 430, name: '', highlighted: false, curve: 0 },
  CB2: { x: 220, y: 270, name: '', highlighted: false, curve: 0 },
  RB:  { x: 230, y: 160, name: '', highlighted: false, curve: 0 },
  LCM: { x: 430, y: 490, name: '', highlighted: false, curve: 0 },
  CM:  { x: 450, y: 350, name: '', highlighted: false, curve: 0 },
  RCM: { x: 430, y: 210, name: '', highlighted: false, curve: 0 },
  LW:  { x: 660, y: 540, name: '', highlighted: false, curve: 0 },
  ST:  { x: 700, y: 350, name: '', highlighted: false, curve: 0 },
  RW:  { x: 660, y: 160, name: '', highlighted: false, curve: 0 },
};

const buildOutAway1 = {
  GK:  { x: 1020, y: 350, name: '', highlighted: false, curve: 0 },
  LB:  { x: 870,  y: 540, name: '', highlighted: false, curve: 0 },
  CB1: { x: 880,  y: 430, name: '', highlighted: false, curve: 0 },
  CB2: { x: 880,  y: 270, name: '', highlighted: false, curve: 0 },
  RB:  { x: 870,  y: 160, name: '', highlighted: false, curve: 0 },
  LCM: { x: 670,  y: 490, name: '', highlighted: false, curve: 0 },
  CM:  { x: 650,  y: 350, name: '', highlighted: false, curve: 0 },
  RCM: { x: 670,  y: 210, name: '', highlighted: false, curve: 0 },
  LW:  { x: 440,  y: 540, name: '', highlighted: false, curve: 0 },
  ST:  { x: 400,  y: 350, name: '', highlighted: false, curve: 0 },
  RW:  { x: 440,  y: 160, name: '', highlighted: false, curve: 0 },
};

const buildOutHome2 = {
  GK:  { x: 80,  y: 350, name: '', highlighted: false, curve: 0 },
  LB:  { x: 280, y: 500, name: '', highlighted: false, curve: 0.2 },
  CB1: { x: 220, y: 430, name: '', highlighted: false, curve: 0 },
  CB2: { x: 280, y: 270, name: '', highlighted: true,  curve: 0 },
  RB:  { x: 280, y: 160, name: '', highlighted: false, curve: 0.2 },
  LCM: { x: 460, y: 480, name: '', highlighted: false, curve: 0 },
  CM:  { x: 450, y: 350, name: '', highlighted: false, curve: 0 },
  RCM: { x: 460, y: 210, name: '', highlighted: false, curve: 0 },
  LW:  { x: 680, y: 540, name: '', highlighted: false, curve: 0 },
  ST:  { x: 700, y: 350, name: '', highlighted: false, curve: 0 },
  RW:  { x: 680, y: 160, name: '', highlighted: false, curve: 0 },
};

const buildOutHome3 = {
  GK:  { x: 80,  y: 350, name: '', highlighted: false, curve: 0 },
  LB:  { x: 360, y: 490, name: '', highlighted: false, curve: 0 },
  CB1: { x: 260, y: 430, name: '', highlighted: false, curve: 0 },
  CB2: { x: 350, y: 280, name: '', highlighted: false, curve: 0 },
  RB:  { x: 360, y: 160, name: '', highlighted: false, curve: 0 },
  LCM: { x: 490, y: 480, name: '', highlighted: false, curve: 0 },
  CM:  { x: 510, y: 350, name: '', highlighted: true,  curve: 0 },
  RCM: { x: 490, y: 210, name: '', highlighted: false, curve: 0 },
  LW:  { x: 710, y: 540, name: '', highlighted: false, curve: 0 },
  ST:  { x: 740, y: 350, name: '', highlighted: false, curve: 0 },
  RW:  { x: 710, y: 160, name: '', highlighted: false, curve: 0 },
};

// ---- Scenario 2: High Press Trigger ----

const pressHome1 = {
  GK:  { x: 80,  y: 350, name: '', highlighted: false, curve: 0 },
  LB:  { x: 400, y: 520, name: '', highlighted: false, curve: 0 },
  CB1: { x: 380, y: 420, name: '', highlighted: false, curve: 0 },
  CB2: { x: 380, y: 280, name: '', highlighted: false, curve: 0 },
  RB:  { x: 400, y: 180, name: '', highlighted: false, curve: 0 },
  LCM: { x: 540, y: 490, name: '', highlighted: false, curve: 0 },
  CM:  { x: 560, y: 350, name: '', highlighted: false, curve: 0 },
  RCM: { x: 540, y: 210, name: '', highlighted: false, curve: 0 },
  LW:  { x: 750, y: 520, name: '', highlighted: true,  curve: 0 },
  ST:  { x: 800, y: 350, name: '', highlighted: false, curve: 0 },
  RW:  { x: 750, y: 180, name: '', highlighted: false, curve: 0 },
};

const pressAway1 = {
  GK:  { x: 1020, y: 350, name: '', highlighted: false, curve: 0 },
  LB:  { x: 870,  y: 540, name: '', highlighted: true,  curve: 0 },
  CB1: { x: 880,  y: 430, name: '', highlighted: false, curve: 0 },
  CB2: { x: 880,  y: 270, name: '', highlighted: false, curve: 0 },
  RB:  { x: 870,  y: 160, name: '', highlighted: false, curve: 0 },
  LCM: { x: 700,  y: 490, name: '', highlighted: false, curve: 0 },
  CM:  { x: 680,  y: 350, name: '', highlighted: false, curve: 0 },
  RCM: { x: 700,  y: 210, name: '', highlighted: false, curve: 0 },
  LW:  { x: 500,  y: 540, name: '', highlighted: false, curve: 0 },
  ST:  { x: 460,  y: 350, name: '', highlighted: false, curve: 0 },
  RW:  { x: 500,  y: 160, name: '', highlighted: false, curve: 0 },
};

const pressHome2 = {
  GK:  { x: 80,  y: 350, name: '', highlighted: false, curve: 0 },
  LB:  { x: 420, y: 510, name: '', highlighted: false, curve: 0.3 },
  CB1: { x: 400, y: 420, name: '', highlighted: false, curve: 0 },
  CB2: { x: 400, y: 280, name: '', highlighted: false, curve: 0 },
  RB:  { x: 420, y: 190, name: '', highlighted: false, curve: 0 },
  LCM: { x: 560, y: 480, name: '', highlighted: true,  curve: 0.2 },
  CM:  { x: 580, y: 350, name: '', highlighted: false, curve: 0 },
  RCM: { x: 560, y: 210, name: '', highlighted: false, curve: 0 },
  LW:  { x: 820, y: 510, name: '', highlighted: false, curve: -0.2 },
  ST:  { x: 860, y: 350, name: '', highlighted: false, curve: 0 },
  RW:  { x: 820, y: 190, name: '', highlighted: false, curve: 0 },
};

const pressHome3 = {
  GK:  { x: 80,  y: 350, name: '', highlighted: false, curve: 0 },
  LB:  { x: 440, y: 490, name: '', highlighted: false, curve: 0 },
  CB1: { x: 430, y: 410, name: '', highlighted: false, curve: 0 },
  CB2: { x: 430, y: 290, name: '', highlighted: false, curve: 0 },
  RB:  { x: 440, y: 210, name: '', highlighted: false, curve: 0 },
  LCM: { x: 620, y: 470, name: '', highlighted: true,  curve: 0 },
  CM:  { x: 640, y: 350, name: '', highlighted: false, curve: 0 },
  RCM: { x: 620, y: 230, name: '', highlighted: false, curve: 0 },
  LW:  { x: 860, y: 490, name: '', highlighted: false, curve: 0 },
  ST:  { x: 900, y: 350, name: '', highlighted: true,  curve: 0 },
  RW:  { x: 860, y: 210, name: '', highlighted: false, curve: 0 },
};

// ---- Scenario 3: Wide Overload Attack ----

const wideHome1 = {
  GK:  { x: 80,  y: 350, name: '', highlighted: false, curve: 0 },
  LB:  { x: 230, y: 540, name: '', highlighted: false, curve: 0 },
  CB1: { x: 220, y: 430, name: '', highlighted: false, curve: 0 },
  CB2: { x: 220, y: 270, name: '', highlighted: false, curve: 0 },
  RB:  { x: 230, y: 160, name: '', highlighted: false, curve: 0 },
  LCM: { x: 430, y: 490, name: '', highlighted: false, curve: 0 },
  CM:  { x: 450, y: 350, name: '', highlighted: false, curve: 0 },
  RCM: { x: 430, y: 210, name: '', highlighted: false, curve: 0 },
  LW:  { x: 660, y: 540, name: '', highlighted: false, curve: 0 },
  ST:  { x: 700, y: 350, name: '', highlighted: false, curve: 0 },
  RW:  { x: 660, y: 160, name: '', highlighted: true,  curve: 0 },
};

const wideAway1 = {
  GK:  { x: 1020, y: 350, name: '', highlighted: false, curve: 0 },
  LB:  { x: 870,  y: 540, name: '', highlighted: false, curve: 0 },
  CB1: { x: 880,  y: 430, name: '', highlighted: false, curve: 0 },
  CB2: { x: 880,  y: 270, name: '', highlighted: false, curve: 0 },
  RB:  { x: 870,  y: 160, name: '', highlighted: false, curve: 0 },
  LCM: { x: 670,  y: 490, name: '', highlighted: false, curve: 0 },
  CM:  { x: 650,  y: 350, name: '', highlighted: false, curve: 0 },
  RCM: { x: 670,  y: 210, name: '', highlighted: false, curve: 0 },
  LW:  { x: 440,  y: 540, name: '', highlighted: false, curve: 0 },
  ST:  { x: 400,  y: 350, name: '', highlighted: false, curve: 0 },
  RW:  { x: 440,  y: 160, name: '', highlighted: false, curve: 0 },
};

const wideHome2 = {
  GK:  { x: 80,  y: 350, name: '', highlighted: false, curve: 0 },
  LB:  { x: 360, y: 520, name: '', highlighted: false, curve: 0 },
  CB1: { x: 310, y: 420, name: '', highlighted: false, curve: 0 },
  CB2: { x: 310, y: 280, name: '', highlighted: false, curve: 0 },
  RB:  { x: 500, y: 120, name: '', highlighted: true,  curve: 0.3 },
  LCM: { x: 500, y: 470, name: '', highlighted: false, curve: 0 },
  CM:  { x: 530, y: 370, name: '', highlighted: false, curve: 0 },
  RCM: { x: 520, y: 240, name: '', highlighted: false, curve: 0.2 },
  LW:  { x: 720, y: 520, name: '', highlighted: false, curve: 0 },
  ST:  { x: 780, y: 370, name: '', highlighted: false, curve: 0 },
  RW:  { x: 740, y: 140, name: '', highlighted: true,  curve: 0 },
};

const wideHome3 = {
  GK:  { x: 80,  y: 350, name: '', highlighted: false, curve: 0 },
  LB:  { x: 400, y: 500, name: '', highlighted: false, curve: 0 },
  CB1: { x: 340, y: 415, name: '', highlighted: false, curve: 0 },
  CB2: { x: 340, y: 285, name: '', highlighted: false, curve: 0 },
  RB:  { x: 640, y: 110, name: '', highlighted: false, curve: 0 },
  LCM: { x: 540, y: 460, name: '', highlighted: false, curve: 0 },
  CM:  { x: 580, y: 370, name: '', highlighted: false, curve: 0 },
  RCM: { x: 600, y: 220, name: '', highlighted: true,  curve: 0 },
  LW:  { x: 760, y: 510, name: '', highlighted: false, curve: 0 },
  ST:  { x: 840, y: 370, name: '', highlighted: false, curve: 0 },
  RW:  { x: 820, y: 130, name: '', highlighted: true,  curve: -0.2 },
};

export const sampleScenarios = [
  {
    id: 'sample-1',
    title: 'Build Out of Back - 4-3-3',
    description: 'GK distributes to CB, team builds possession up the field through the thirds.',
    category: 'Build-Up Play',
    gameFormat: '11v11',
    formation: '4-3-3',
    cones: [],
    persistentLines: [],
    keyframes: [
      {
        id: 'kf-1-1',
        time: 0,
        label: 'Initial Shape',
        ball: { x: 80, y: 350 },
        home: buildOutHome1,
        away: buildOutAway1,
        lines: [],
      },
      {
        id: 'kf-1-2',
        time: 50,
        label: 'First Pass to CB',
        ball: { x: 280, y: 270 },
        home: buildOutHome2,
        away: buildOutAway1,
        lines: [],
      },
      {
        id: 'kf-1-3',
        time: 100,
        label: 'Midfield Buildup',
        ball: { x: 510, y: 350 },
        home: buildOutHome3,
        away: buildOutAway1,
        lines: [],
      },
    ],
  },
  {
    id: 'sample-2',
    title: 'High Press Trigger - 4-3-3',
    description: 'Team presses high when away GK distributes. Wing triggers press, midfield cuts passing lanes.',
    category: 'Pressing',
    gameFormat: '11v11',
    formation: '4-3-3',
    cones: [],
    persistentLines: [],
    keyframes: [
      {
        id: 'kf-2-1',
        time: 0,
        label: 'Press Set',
        ball: { x: 1020, y: 350 },
        home: pressHome1,
        away: pressAway1,
        lines: [],
      },
      {
        id: 'kf-2-2',
        time: 50,
        label: 'Trigger Activated',
        ball: { x: 870, y: 540 },
        home: pressHome2,
        away: pressAway1,
        lines: [],
      },
      {
        id: 'kf-2-3',
        time: 100,
        label: 'Full Press',
        ball: { x: 870, y: 540 },
        home: pressHome3,
        away: pressAway1,
        lines: [],
      },
    ],
  },
  {
    id: 'sample-3',
    title: 'Wide Overload Attack - 4-3-3',
    description: 'Right back overlaps to create 3v2 overload on the right flank with winger and midfielder.',
    category: 'Attacking',
    gameFormat: '11v11',
    formation: '4-3-3',
    cones: [],
    persistentLines: [],
    keyframes: [
      {
        id: 'kf-3-1',
        time: 0,
        label: 'Ball at RW',
        ball: { x: 660, y: 160 },
        home: wideHome1,
        away: wideAway1,
        lines: [],
      },
      {
        id: 'kf-3-2',
        time: 50,
        label: 'RB Overlaps',
        ball: { x: 740, y: 140 },
        home: wideHome2,
        away: wideAway1,
        lines: [],
      },
      {
        id: 'kf-3-3',
        time: 100,
        label: 'Cross Delivery',
        ball: { x: 900, y: 120 },
        home: wideHome3,
        away: wideAway1,
        lines: [],
      },
    ],
  },
];
