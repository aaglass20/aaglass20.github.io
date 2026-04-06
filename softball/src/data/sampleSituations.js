import { DEFAULT_POSITIONS, HOME_PLATE, FIRST_BASE, SECOND_BASE, THIRD_BASE } from './fieldPositions';

// Each situation has:
// - id, title, description
// - runners: which bases are occupied before the play
// - hitLocation: {x, y} where the ball is hit
// - keyframes: array of timed snapshots — each keyframe has positions for all players + ball + runners
//   keyframe.time is 0-100 (percent of animation)

export const SAMPLE_SITUATIONS = [
  {
    id: 'single-left-center-runner-on-2nd',
    title: 'Single to Left-Center, Runner on 2nd',
    description: 'Ball hit to left-center gap. Runner on 2nd scores. Batter takes first.',
    runners: ['runner2'],
    keyframes: [
      {
        time: 0,
        label: 'Hit',
        ball: { x: 350, y: 570 },
        fielders: { ...positionsToXY(DEFAULT_POSITIONS) },
        runners: {
          batter: { x: HOME_PLATE.x, y: HOME_PLATE.y },
          runner2: { x: SECOND_BASE.x, y: SECOND_BASE.y },
        },
      },
      {
        time: 20,
        label: 'Ball in gap',
        ball: { x: 220, y: 200 },
        fielders: {
          P: { x: 350, y: 420 },
          C: { x: 350, y: 590 },
          '1B': { x: 490, y: 435 },
          '2B': { x: 380, y: 370 },
          SS: { x: 270, y: 370 },
          '3B': { x: 210, y: 440 },
          LF: { x: 190, y: 210 },
          CF: { x: 280, y: 190 },
          RF: { x: 540, y: 240 },
        },
        runners: {
          batter: { x: 440, y: 530 },
          runner2: { x: 290, y: 380 },
        },
      },
      {
        time: 45,
        label: 'LF fields ball',
        ball: { x: 190, y: 200 },
        fielders: {
          P: { x: 310, y: 400 },
          C: { x: 350, y: 585 },
          '1B': { x: 490, y: 440 },
          '2B': { x: 420, y: 390 },
          SS: { x: 280, y: 420 },
          '3B': { x: 215, y: 460 },
          LF: { x: 190, y: 200 },
          CF: { x: 250, y: 195 },
          RF: { x: 500, y: 260 },
        },
        runners: {
          batter: { x: 490, y: 450 },
          runner2: { x: 240, y: 460 },
        },
      },
      {
        time: 65,
        label: 'Throw to cutoff (SS)',
        ball: { x: 270, y: 390 },
        fielders: {
          P: { x: 300, y: 430 },
          C: { x: 350, y: 582 },
          '1B': { x: 490, y: 440 },
          '2B': { x: 370, y: 400 },
          SS: { x: 270, y: 390 },
          '3B': { x: 220, y: 460 },
          LF: { x: 200, y: 220 },
          CF: { x: 260, y: 210 },
          RF: { x: 480, y: 270 },
        },
        runners: {
          batter: { x: 490, y: 440 },
          runner2: { x: 280, y: 530 },
        },
      },
      {
        time: 100,
        label: 'Play complete',
        ball: { x: 350, y: 458 },
        fielders: {
          P: { x: 350, y: 458 },
          C: { x: 350, y: 585 },
          '1B': { x: 490, y: 440 },
          '2B': { x: 420, y: 350 },
          SS: { x: 280, y: 350 },
          '3B': { x: 210, y: 440 },
          LF: { x: 180, y: 230 },
          CF: { x: 320, y: 200 },
          RF: { x: 520, y: 250 },
        },
        runners: {
          batter: { x: FIRST_BASE.x, y: FIRST_BASE.y },
          runner2: { x: HOME_PLATE.x, y: HOME_PLATE.y },
        },
      },
    ],
  },
  {
    id: 'ground-ball-to-short-no-runners',
    title: 'Ground Ball to Shortstop, No Runners',
    description: 'Routine ground ball to SS. Throw to 1st for the out.',
    runners: [],
    keyframes: [
      {
        time: 0,
        label: 'Hit',
        ball: { x: 350, y: 570 },
        fielders: { ...positionsToXY(DEFAULT_POSITIONS) },
        runners: {
          batter: { x: HOME_PLATE.x, y: HOME_PLATE.y },
        },
      },
      {
        time: 30,
        label: 'Ball to SS',
        ball: { x: 280, y: 370 },
        fielders: {
          P: { x: 340, y: 430 },
          C: { x: 350, y: 590 },
          '1B': { x: 495, y: 435 },
          '2B': { x: 400, y: 350 },
          SS: { x: 280, y: 360 },
          '3B': { x: 215, y: 430 },
          LF: { x: 175, y: 250 },
          CF: { x: 340, y: 195 },
          RF: { x: 530, y: 245 },
        },
        runners: {
          batter: { x: 420, y: 540 },
        },
      },
      {
        time: 55,
        label: 'SS fields & throws',
        ball: { x: 280, y: 360 },
        fielders: {
          P: { x: 335, y: 420 },
          C: { x: 350, y: 590 },
          '1B': { x: 498, y: 438 },
          '2B': { x: 390, y: 350 },
          SS: { x: 280, y: 360 },
          '3B': { x: 215, y: 435 },
          LF: { x: 180, y: 260 },
          CF: { x: 340, y: 200 },
          RF: { x: 530, y: 250 },
        },
        runners: {
          batter: { x: 470, y: 480 },
        },
      },
      {
        time: 80,
        label: 'Ball to 1B',
        ball: { x: 495, y: 438 },
        fielders: {
          P: { x: 340, y: 430 },
          C: { x: 350, y: 590 },
          '1B': { x: 498, y: 438 },
          '2B': { x: 390, y: 355 },
          SS: { x: 285, y: 365 },
          '3B': { x: 215, y: 435 },
          LF: { x: 180, y: 260 },
          CF: { x: 340, y: 200 },
          RF: { x: 530, y: 250 },
        },
        runners: {
          batter: { x: 488, y: 450 },
        },
      },
      {
        time: 100,
        label: 'Out!',
        ball: { x: 498, y: 438 },
        fielders: {
          P: { x: 350, y: 458 },
          C: { x: 350, y: 590 },
          '1B': { x: 498, y: 438 },
          '2B': { x: 400, y: 350 },
          SS: { x: 285, y: 350 },
          '3B': { x: 215, y: 435 },
          LF: { x: 170, y: 250 },
          CF: { x: 345, y: 195 },
          RF: { x: 535, y: 245 },
        },
        runners: {
          batter: { x: 494, y: 442 },
        },
      },
    ],
  },
  {
    id: 'ground-ball-ss-runner-on-2nd',
    title: 'Ground Ball to SS, Runner on 2nd',
    description: 'Ball hit to shortstop with runner on 2nd. SS must decide: go to 3rd, throw to 1st, or hold the runner.',
    runners: ['runner2'],
    keyframes: [
      {
        time: 0,
        label: 'Hit',
        ball: { x: 350, y: 570 },
        fielders: { ...positionsToXY(DEFAULT_POSITIONS) },
        runners: {
          batter: { x: HOME_PLATE.x, y: HOME_PLATE.y },
          runner2: { x: SECOND_BASE.x, y: SECOND_BASE.y },
        },
      },
      {
        time: 15,
        label: 'Ball off the bat',
        ball: { x: 300, y: 430 },
        fielders: {
          P: { x: 345, y: 440 },
          C: { x: 350, y: 590 },
          '1B': { x: 495, y: 433 },
          '2B': { x: 400, y: 345 },
          SS: { x: 285, y: 350 },
          '3B': { x: 210, y: 435 },
          LF: { x: 165, y: 245 },
          CF: { x: 345, y: 185 },
          RF: { x: 535, y: 242 },
        },
        runners: {
          batter: { x: 390, y: 560 },
          runner2: { x: 340, y: 338 },
        },
      },
      {
        time: 30,
        label: 'Runner breaks — SS reads',
        ball: { x: 285, y: 380 },
        fielders: {
          P: { x: 330, y: 425 },
          C: { x: 350, y: 588 },
          '1B': { x: 495, y: 435 },
          '2B': { x: 380, y: 345 },
          SS: { x: 285, y: 365 },
          '3B': { x: 215, y: 440 },
          LF: { x: 170, y: 252 },
          CF: { x: 342, y: 190 },
          RF: { x: 532, y: 245 },
        },
        runners: {
          batter: { x: 430, y: 535 },
          runner2: { x: 300, y: 365 },
        },
      },
      {
        time: 50,
        label: 'SS fields — checks runner',
        ball: { x: 285, y: 365 },
        fielders: {
          P: { x: 315, y: 415 },
          C: { x: 350, y: 585 },
          '1B': { x: 497, y: 437 },
          '2B': { x: 370, y: 348 },
          SS: { x: 285, y: 365 },
          '3B': { x: 218, y: 443 },
          LF: { x: 175, y: 258 },
          CF: { x: 340, y: 195 },
          RF: { x: 530, y: 248 },
        },
        runners: {
          batter: { x: 465, y: 490 },
          runner2: { x: 265, y: 400 },
        },
      },
      {
        time: 60,
        label: 'Runner holds — SS throws to 1st',
        ball: { x: 390, y: 400 },
        fielders: {
          P: { x: 310, y: 420 },
          C: { x: 350, y: 585 },
          '1B': { x: 498, y: 438 },
          '2B': { x: 365, y: 350 },
          SS: { x: 288, y: 368 },
          '3B': { x: 218, y: 443 },
          LF: { x: 178, y: 260 },
          CF: { x: 340, y: 198 },
          RF: { x: 528, y: 250 },
        },
        runners: {
          batter: { x: 478, y: 470 },
          runner2: { x: 255, y: 410 },
        },
      },
      {
        time: 80,
        label: 'Out at 1st — runner to 3rd',
        ball: { x: 498, y: 438 },
        fielders: {
          P: { x: 320, y: 430 },
          C: { x: 350, y: 585 },
          '1B': { x: 498, y: 438 },
          '2B': { x: 360, y: 352 },
          SS: { x: 290, y: 370 },
          '3B': { x: 215, y: 443 },
          LF: { x: 180, y: 262 },
          CF: { x: 340, y: 200 },
          RF: { x: 528, y: 250 },
        },
        runners: {
          batter: { x: 494, y: 445 },
          runner2: { x: 225, y: 440 },
        },
      },
      {
        time: 100,
        label: 'Play over — runner on 3rd',
        ball: { x: 350, y: 458 },
        fielders: {
          P: { x: 350, y: 458 },
          C: { x: 350, y: 585 },
          '1B': { x: 495, y: 435 },
          '2B': { x: 380, y: 348 },
          SS: { x: 285, y: 355 },
          '3B': { x: 215, y: 440 },
          LF: { x: 170, y: 250 },
          CF: { x: 345, y: 192 },
          RF: { x: 535, y: 245 },
        },
        runners: {
          batter: { x: 494, y: 445 },
          runner2: { x: THIRD_BASE.x, y: THIRD_BASE.y },
        },
      },
    ],
  },
];

function positionsToXY(positions) {
  const result = {};
  for (const [key, val] of Object.entries(positions)) {
    result[key] = { x: val.x, y: val.y };
  }
  return result;
}
