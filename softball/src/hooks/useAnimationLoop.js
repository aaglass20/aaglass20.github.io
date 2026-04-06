import { useState, useRef, useCallback, useEffect } from 'react';

// Interpolate between keyframes based on current time (0-100)
function lerp(a, b, t) {
  return a + (b - a) * t;
}

function interpolatePositions(keyframes, time) {
  if (!keyframes || keyframes.length === 0) return null;
  if (time <= keyframes[0].time) return keyframes[0];
  if (time >= keyframes[keyframes.length - 1].time) return keyframes[keyframes.length - 1];

  // Find the two keyframes we're between
  let prev = keyframes[0];
  let next = keyframes[1];
  for (let i = 0; i < keyframes.length - 1; i++) {
    if (time >= keyframes[i].time && time <= keyframes[i + 1].time) {
      prev = keyframes[i];
      next = keyframes[i + 1];
      break;
    }
  }

  const segmentDuration = next.time - prev.time;
  const t = segmentDuration === 0 ? 0 : (time - prev.time) / segmentDuration;

  // Interpolate ball
  const ball = {
    x: lerp(prev.ball.x, next.ball.x, t),
    y: lerp(prev.ball.y, next.ball.y, t),
  };

  // Interpolate fielders
  const fielders = {};
  for (const key of Object.keys(prev.fielders)) {
    fielders[key] = {
      x: lerp(prev.fielders[key].x, next.fielders[key].x, t),
      y: lerp(prev.fielders[key].y, next.fielders[key].y, t),
    };
  }

  // Interpolate runners
  const runners = {};
  for (const key of Object.keys(prev.runners)) {
    if (next.runners[key]) {
      runners[key] = {
        x: lerp(prev.runners[key].x, next.runners[key].x, t),
        y: lerp(prev.runners[key].y, next.runners[key].y, t),
      };
    }
  }

  // Find current label
  let label = prev.label;
  for (const kf of keyframes) {
    if (kf.time <= time) label = kf.label;
  }

  return { ball, fielders, runners, label };
}

export function useAnimationLoop(keyframes, duration = 5000) {
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedAtRef = useRef(0);

  const play = useCallback(() => {
    setIsPlaying(true);
    startTimeRef.current = performance.now() - (pausedAtRef.current / 100) * (duration / speed);
  }, [duration, speed]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    pausedAtRef.current = time;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, [time]);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setTime(0);
    pausedAtRef.current = 0;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const scrub = useCallback((newTime) => {
    setTime(newTime);
    pausedAtRef.current = newTime;
    if (isPlaying) {
      startTimeRef.current = performance.now() - (newTime / 100) * (duration / speed);
    }
  }, [isPlaying, duration, speed]);

  useEffect(() => {
    if (!isPlaying) return;

    const animate = (now) => {
      if (!startTimeRef.current) startTimeRef.current = now;
      const elapsed = (now - startTimeRef.current) * speed;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setTime(progress);
      pausedAtRef.current = progress;

      if (progress < 100) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setIsPlaying(false);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, duration, speed]);

  const snapshot = interpolatePositions(keyframes, time);

  return { time, isPlaying, speed, snapshot, play, pause, reset, scrub, setSpeed };
}
