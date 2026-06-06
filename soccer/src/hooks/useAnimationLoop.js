import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Compute a quadratic bezier point.
 * P0 = start, P1 = end, t = progress [0,1], curveAmount = -1..1
 */
function bezierPoint(x0, y0, x1, y1, t, curveAmount) {
  // Midpoint
  const mx = (x0 + x1) / 2;
  const my = (y0 + y1) / 2;

  // Direction vector
  const dx = x1 - x0;
  const dy = y1 - y0;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < 0.001) return { x: x0 + (x1 - x0) * t, y: y0 + (y1 - y0) * t };

  // Perpendicular (rotate 90 deg counter-clockwise)
  const perpX = -dy / dist;
  const perpY = dx / dist;

  // Control point offset: positive curve = bend left of travel, negative = right
  const offset = curveAmount * dist * 0.5;
  const cpx = mx + perpX * offset;
  const cpy = my + perpY * offset;

  // Quadratic bezier
  const oneMinusT = 1 - t;
  const x = oneMinusT * oneMinusT * x0 + 2 * oneMinusT * t * cpx + t * t * x1;
  const y = oneMinusT * oneMinusT * y0 + 2 * oneMinusT * t * cpy + t * t * y1;

  return { x, y };
}

function lerpVal(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Interpolate between two keyframes.
 * Returns a snapshot matching the keyframe structure.
 */
export function interpolateKeyframes(keyframes, normalizedTime) {
  if (!keyframes || keyframes.length === 0) return null;
  if (keyframes.length === 1) return { ...keyframes[0] };

  // Clamp time
  const t = Math.max(0, Math.min(100, normalizedTime));

  // Find surrounding keyframes
  let fromKf = keyframes[0];
  let toKf = keyframes[keyframes.length - 1];
  let fromIdx = 0;

  if (t <= keyframes[0].time) {
    return { ...keyframes[0] };
  }
  if (t >= keyframes[keyframes.length - 1].time) {
    return { ...keyframes[keyframes.length - 1] };
  }

  for (let i = 0; i < keyframes.length - 1; i++) {
    if (t >= keyframes[i].time && t <= keyframes[i + 1].time) {
      fromKf = keyframes[i];
      toKf = keyframes[i + 1];
      fromIdx = i;
      break;
    }
  }

  // Progress within this segment
  const range = toKf.time - fromKf.time;
  const progress = range === 0 ? 0 : (t - fromKf.time) / range;

  // Interpolate ball
  const fromBall = fromKf.ball || { x: 550, y: 350 };
  const toBall = toKf.ball || { x: 550, y: 350 };
  const ball = {
    x: lerpVal(fromBall.x, toBall.x, progress),
    y: lerpVal(fromBall.y, toBall.y, progress),
  };

  // Interpolate home players
  const home = {};
  const fromHome = fromKf.home || {};
  const toHome = toKf.home || {};
  const allHomeKeys = new Set([...Object.keys(fromHome), ...Object.keys(toHome)]);

  for (const key of allHomeKeys) {
    const from = fromHome[key];
    const to = toHome[key];
    if (!from && !to) continue;
    if (!from) { home[key] = { ...to }; continue; }
    if (!to) { home[key] = { ...from }; continue; }

    const curveAmt = from.curve || 0;
    let pos;
    if (curveAmt !== 0) {
      pos = bezierPoint(from.x, from.y, to.x, to.y, progress, curveAmt);
    } else {
      pos = { x: lerpVal(from.x, to.x, progress), y: lerpVal(from.y, to.y, progress) };
    }

    home[key] = {
      ...from,
      x: pos.x,
      y: pos.y,
      // highlighted and name come from the "active" from keyframe
      highlighted: progress < 0.5 ? from.highlighted : to.highlighted,
      name: from.name || to.name,
    };
  }

  // Interpolate away players
  const away = {};
  const fromAway = fromKf.away || {};
  const toAway = toKf.away || {};
  const allAwayKeys = new Set([...Object.keys(fromAway), ...Object.keys(toAway)]);

  for (const key of allAwayKeys) {
    const from = fromAway[key];
    const to = toAway[key];
    if (!from && !to) continue;
    if (!from) { away[key] = { ...to }; continue; }
    if (!to) { away[key] = { ...from }; continue; }

    const curveAmt = from.curve || 0;
    let pos;
    if (curveAmt !== 0) {
      pos = bezierPoint(from.x, from.y, to.x, to.y, progress, curveAmt);
    } else {
      pos = { x: lerpVal(from.x, to.x, progress), y: lerpVal(from.y, to.y, progress) };
    }

    away[key] = {
      ...from,
      x: pos.x,
      y: pos.y,
      highlighted: progress < 0.5 ? from.highlighted : to.highlighted,
      name: from.name || to.name,
    };
  }

  // Lines come from the current "active" from keyframe
  const lines = fromKf.lines || [];
  const label = progress < 0.5 ? fromKf.label : toKf.label;

  return { ball, home, away, lines, label };
}

/**
 * Animation loop hook.
 * keyframes: array of keyframe objects with .time (0-100)
 * duration: total animation duration in ms (default 6000)
 */
export function useAnimationLoop(keyframes, duration = 6000) {
  const [time, setTime] = useState(0);           // 0-100 normalized
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeedState] = useState(1);
  const [snapshot, setSnapshot] = useState(() =>
    keyframes && keyframes.length > 0 ? { ...keyframes[0] } : null
  );

  const rafRef = useRef(null);
  const startTimeRef = useRef(null);
  const startNormRef = useRef(0);
  const speedRef = useRef(1);
  const durationRef = useRef(duration);
  const keyframesRef = useRef(keyframes);
  const isPlayingRef = useRef(false);

  // Keep refs in sync
  useEffect(() => {
    keyframesRef.current = keyframes;
    durationRef.current = duration;
  }, [keyframes, duration]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  // Recompute snapshot when keyframes change (e.g. edit mode drag)
  useEffect(() => {
    if (keyframes && keyframes.length > 0) {
      const snap = interpolateKeyframes(keyframes, time);
      setSnapshot(snap);
    }
  }, [keyframes]); // eslint-disable-line react-hooks/exhaustive-deps

  const tick = useCallback((timestamp) => {
    if (!isPlayingRef.current) return;

    if (startTimeRef.current === null) {
      startTimeRef.current = timestamp;
    }

    const elapsed = (timestamp - startTimeRef.current) * speedRef.current;
    const elapsedNorm = (elapsed / durationRef.current) * 100;
    const newTime = Math.min(startNormRef.current + elapsedNorm, 100);

    setTime(newTime);
    const snap = interpolateKeyframes(keyframesRef.current, newTime);
    setSnapshot(snap);

    if (newTime >= 100) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      setTime(100);
      return;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const play = useCallback(() => {
    if (isPlayingRef.current) return;
    isPlayingRef.current = true;
    setIsPlaying(true);
    startTimeRef.current = null;

    // If at end, reset to beginning
    if (time >= 100) {
      startNormRef.current = 0;
      setTime(0);
    } else {
      startNormRef.current = time;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [tick, time]);

  const pause = useCallback(() => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    startTimeRef.current = null;
  }, []);

  const reset = useCallback(() => {
    pause();
    setTime(0);
    startNormRef.current = 0;
    const snap = interpolateKeyframes(keyframesRef.current, 0);
    setSnapshot(snap);
  }, [pause]);

  const scrub = useCallback((newTime) => {
    const clamped = Math.max(0, Math.min(100, newTime));
    if (isPlayingRef.current) {
      startNormRef.current = clamped;
      startTimeRef.current = null;
    }
    setTime(clamped);
    const snap = interpolateKeyframes(keyframesRef.current, clamped);
    setSnapshot(snap);
  }, []);

  const setSpeed = useCallback((newSpeed) => {
    // If playing, recalibrate start so jump doesn't occur
    if (isPlayingRef.current) {
      startNormRef.current = time;
      startTimeRef.current = null;
    }
    speedRef.current = newSpeed;
    setSpeedState(newSpeed);
  }, [time]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { snapshot, time, isPlaying, play, pause, reset, scrub, setSpeed, speed };
}
