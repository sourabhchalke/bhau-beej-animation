import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/** How long the outgoing shot stays mounted underneath the incoming one. */
export const FADE_MS = 1400;

/**
 * A pausable, seekable clock for a list of shots ({ duration } in ms).
 *
 * `view` only changes when the visible shots change, so the film re-renders
 * a handful of times per minute; anything that needs per-frame time (the
 * progress bar) reads the `elapsed` ref directly.
 */
export function useTimeline(shots) {
  const { starts, total } = useMemo(() => {
    let t = 0;
    const list = shots.map((s) => {
      const at = t;
      t += s.duration;
      return at;
    });
    return { starts: list, total: t };
  }, [shots]);

  const [view, setViewState] = useState({ index: 0, from: null, inKey: 'k0', outKey: null, ended: false });
  const [paused, setPausedState] = useState(false);

  const viewRef = useRef(view);
  const pausedRef = useRef(false);
  const elapsed = useRef(0);
  const switchedAt = useRef(0);
  const counter = useRef(1);

  const setView = useCallback((next) => {
    viewRef.current = next;
    setViewState(next);
  }, []);

  const setPaused = useCallback((next) => {
    pausedRef.current = next;
    setPausedState(next);
  }, []);

  const indexAt = useCallback(
    (ms) => {
      let i = starts.length - 1;
      while (i > 0 && ms < starts[i]) i -= 1;
      return i;
    },
    [starts],
  );

  useEffect(() => {
    if (paused) return undefined;
    let raf = 0;
    let last = performance.now();

    const tick = (now) => {
      const dt = Math.min(now - last, 250);
      last = now;
      const v = viewRef.current;

      if (!v.ended) {
        elapsed.current = Math.min(elapsed.current + dt, total);
        const idx = indexAt(elapsed.current);

        if (idx !== v.index) {
          switchedAt.current = elapsed.current;
          setView({ index: idx, from: v.index, inKey: `k${counter.current++}`, outKey: v.inKey, ended: false });
        } else if (v.from !== null && elapsed.current - switchedAt.current > FADE_MS) {
          setView({ ...v, from: null, outKey: null });
        } else if (elapsed.current >= total) {
          setView({ ...v, from: null, outKey: null, ended: true });
        }
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, total, indexAt, setView]);

  const seek = useCallback(
    (i) => {
      const target = Math.max(0, Math.min(shots.length - 1, i));
      const v = viewRef.current;
      elapsed.current = starts[target];
      switchedAt.current = elapsed.current;
      const same = v.index === target;
      setView({
        index: target,
        from: same ? null : v.index,
        inKey: `k${counter.current++}`,
        outKey: same ? null : v.inKey,
        ended: false,
      });
      setPaused(false);
    },
    [shots.length, starts, setView, setPaused],
  );

  const next = useCallback(() => {
    const v = viewRef.current;
    if (!v.ended && v.index < shots.length - 1) seek(v.index + 1);
  }, [seek, shots.length]);

  const prev = useCallback(() => {
    const v = viewRef.current;
    const into = elapsed.current - starts[v.index];
    seek(into > 2500 || v.index === 0 ? v.index : v.index - 1);
  }, [seek, starts]);

  const toggle = useCallback(() => {
    if (viewRef.current.ended) return;
    setPaused(!pausedRef.current);
  }, [setPaused]);

  return { view, paused, pausedRef, setPaused, toggle, seek, next, prev, elapsed, total };
}
