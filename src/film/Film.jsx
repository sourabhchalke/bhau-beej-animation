import { useEffect, useMemo, useRef, useState } from 'react';
import { buildShots, CHAPTERS } from './scenes.jsx';
import { useTimeline } from './useTimeline.js';

const stroke = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

const IconSound = () => (
  <svg {...stroke}>
    <path d="M4 9.5v5h3.5l4.5 4v-13l-4.5 4H4z" />
    <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
  </svg>
);
const IconMuted = () => (
  <svg {...stroke}>
    <path d="M4 9.5v5h3.5l4.5 4v-13l-4.5 4H4z" />
    <path d="M16 9.5l5 5m0-5l-5 5" />
  </svg>
);
const IconPause = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="6.5" y="5" width="4" height="14" rx="1.2" />
    <rect x="13.5" y="5" width="4" height="14" rx="1.2" />
  </svg>
);
const IconPlay = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M8 5.2v13.6a1 1 0 0 0 1.5.86l11-6.8a1 1 0 0 0 0-1.72l-11-6.8A1 1 0 0 0 8 5.2z" />
  </svg>
);
const IconClose = () => (
  <svg {...stroke}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
const IconReplay = () => (
  <svg {...stroke}>
    <path d="M4.5 12a7.5 7.5 0 1 0 2.4-5.5" />
    <path d="M4.5 4.5v4.6h4.6" />
  </svg>
);

/** Story-style progress: one segment per chapter, filled straight from the clock. */
function Progress({ shots, elapsed }) {
  const segments = useMemo(() => {
    const list = [];
    let t = 0;
    shots.forEach((shot) => {
      const tail = list[list.length - 1];
      if (tail && tail.scene === shot.scene) tail.duration += shot.duration;
      else list.push({ scene: shot.scene, start: t, duration: shot.duration });
      t += shot.duration;
    });
    return list;
  }, [shots]);

  const bars = useRef([]);

  useEffect(() => {
    let raf = 0;
    const paint = () => {
      const now = elapsed.current;
      segments.forEach((seg, i) => {
        const bar = bars.current[i];
        if (bar) bar.style.transform = `scaleX(${Math.max(0, Math.min(1, (now - seg.start) / seg.duration))})`;
      });
      raf = requestAnimationFrame(paint);
    };
    raf = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(raf);
  }, [segments, elapsed]);

  return (
    <div className="progress" aria-hidden="true">
      {segments.map((seg, i) => (
        <span key={seg.scene} style={{ '--w': seg.duration }}>
          <i
            ref={(el) => {
              bars.current[i] = el;
            }}
          />
        </span>
      ))}
    </div>
  );
}

export default function Film({ names, score, isGift, shareUrl, shareState, onShare, onEdit, onMakeOwn }) {
  const shots = useMemo(() => buildShots(names), [names]);
  const { view, paused, pausedRef, setPaused, toggle, seek, next, prev, elapsed } = useTimeline(shots);
  const [muted, setMuted] = useState(false);

  const shot = shots[view.index];
  const chapter = CHAPTERS[shot.scene];

  // Music follows the picture
  useEffect(() => {
    score.setScene(shot.scene);
  }, [score, shot.scene]);

  useEffect(() => {
    if (paused) score.pause();
    else score.resume();
  }, [score, paused]);

  useEffect(() => {
    score.setMuted(muted);
  }, [score, muted]);

  // Hold the film while the tab is in the background
  useEffect(() => {
    let auto = false;
    const onVisibility = () => {
      if (document.hidden) {
        if (!pausedRef.current) {
          auto = true;
          setPaused(true);
        }
      } else if (auto) {
        auto = false;
        setPaused(false);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [pausedRef, setPaused]);

  // Keyboard: ← → to step, space / K to pause, M to mute
  useEffect(() => {
    const onKey = (e) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      const onControl = e.target instanceof Element && e.target.closest('button, a, input, textarea, select');
      const key = e.key.toLowerCase();
      if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
      else if ((key === ' ' || key === 'k') && !onControl) {
        e.preventDefault();
        toggle();
      } else if (key === 'm' && !onControl) setMuted((m) => !m);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, toggle]);

  const layers = [];
  if (view.from !== null) layers.push({ key: view.outKey, shot: shots[view.from], state: 'out' });
  layers.push({ key: view.inKey, shot, state: 'in' });

  let note = '';
  if (shareState === 'copied') note = 'Your personal link is copied and ready to share.';
  else if (shareState === 'manual') note = shareUrl ? 'Copy this link to share your film:' : 'Open this page at its own web address to get a link you can send.';

  return (
    <div className="film">
      <div className={`film-shots${paused ? ' is-paused' : ''}`} aria-hidden="true">
        {layers.map((layer) => (
          <section key={layer.key} className={`shot is-${layer.state}`}>
            {layer.shot.render({ ...names, seconds: layer.shot.duration / 1000 })}
          </section>
        ))}
      </div>

      <div className="film-vignette" />
      <div className="film-grain" />

      <p className="bb-sr" aria-live="polite" aria-atomic="true">
        {shot.say}
      </p>

      <div className="zones" aria-hidden="true">
        <button type="button" className="zone" tabIndex={-1} onClick={prev} />
        <button type="button" className="zone" tabIndex={-1} onClick={toggle} />
        <button type="button" className="zone" tabIndex={-1} onClick={next} />
      </div>

      <header className="film-top">
        <Progress shots={shots} elapsed={elapsed} />
        <div className="film-bar">
          <p className="chapter" key={shot.scene}>
            <b>{chapter.no}</b>
            {chapter.title}
          </p>
          <div className="film-actions">
            <button
              type="button"
              className="icon-btn"
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? 'Turn music on' : 'Turn music off'}
              aria-pressed={muted}
            >
              {muted ? <IconMuted /> : <IconSound />}
            </button>
            {!view.ended && (
              <button type="button" className="icon-btn" onClick={toggle} aria-label={paused ? 'Play' : 'Pause'}>
                {paused ? <IconPlay /> : <IconPause />}
              </button>
            )}
            {!isGift && (
              <button type="button" className="icon-btn" onClick={onEdit} aria-label="Close and edit your name">
                <IconClose />
              </button>
            )}
          </div>
        </div>
      </header>

      {paused && !view.ended && (
        <div className="pause-badge" style={{ transform: 'translate(-50%, -50%)' }}>
          <IconPlay /> Tap to play
        </div>
      )}

      {view.ended && (
        <div className="endcard">
          {note && (
            <p className="endcard-note" role="status">
              {note}
            </p>
          )}
          {shareState === 'manual' && shareUrl && (
            <input
              className="manual-link"
              readOnly
              value={shareUrl}
              aria-label="Link to this film"
              onFocus={(e) => e.target.select()}
            />
          )}
          <div className="endcard-row">
            <button type="button" className="btn btn-ghost" onClick={() => seek(0)}>
              <IconReplay /> Replay
            </button>
            {isGift ? (
              <button type="button" className="btn btn-gold" onClick={onMakeOwn}>
                Enter another name
              </button>
            ) : (
              <button type="button" className="btn btn-gold" onClick={onShare}>
                {shareState === 'copied' ? 'Link copied' : 'Share your film'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
