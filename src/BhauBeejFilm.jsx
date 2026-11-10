import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './film/film.css';
import Film from './film/Film.jsx';
import { CreateScreen, GiftScreen } from './film/Screens.jsx';
import { SvgDefs } from './film/effects.jsx';
import { BROTHER_NAME, buildLink, copyText, readLink, useParallax, usePreload, useStageUnits } from './film/hooks.js';
import { FILM_IMAGES } from './film/scenes.jsx';
import { Score } from './film/score.js';

/**
 * A personal Bhau Beej film.
 *
 *  create → a sister enters her name to personalize Saurabh's film
 *  gift   → a shared link (?to=Priya) opens her named surprise
 *  film   → the five-scene film, signed by Saurabh
 */
export default function BhauBeejFilm() {
  const link = useMemo(readLink, []);
  const [draft, setDraft] = useState({ sister: link.sister });
  const [isGift, setIsGift] = useState(link.isGift);
  const [screen, setScreen] = useState(link.isGift ? 'gift' : 'create');
  const [run, setRun] = useState(0);
  const [flash, setFlash] = useState(null);
  const [shareState, setShareState] = useState('idle'); // idle | copied | manual

  const stageRef = useRef(null);
  const timers = useRef([]);
  const scoreRef = useRef(null);
  if (!scoreRef.current) scoreRef.current = new Score();
  const score = scoreRef.current;

  const names = useMemo(() => ({ sister: draft.sister.trim(), brother: BROTHER_NAME }), [draft.sister]);
  const shareUrl = useMemo(() => buildLink(names.sister), [names.sister]);
  const ready = usePreload(FILM_IMAGES);

  useStageUnits(stageRef);
  useParallax(stageRef);

  useEffect(() => {
    document.title = names.sister ? `Happy Bhau Beej, ${names.sister} ❤️` : 'A Bhau Beej Surprise for My Sister ❤️';
  }, [names.sister]);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      score.dispose();
    };
  }, [score]);

  useEffect(() => {
    if (shareState !== 'copied') return undefined;
    const t = setTimeout(() => setShareState('idle'), 4500);
    return () => clearTimeout(t);
  }, [shareState]);

  /** Cut to another screen through a wash of golden light. */
  const cut = useCallback((to) => {
    setFlash('in');
    timers.current.push(
      setTimeout(() => {
        setScreen(to);
        if (to === 'film') setRun((n) => n + 1);
        setFlash('out');
      }, 650),
    );
  }, []);

  const play = useCallback(() => {
    score.start(); // inside the tap, so browsers allow the music
    setShareState('idle');
    cut('film');
  }, [score, cut]);

  const edit = useCallback(() => {
    score.stop();
    setShareState('idle');
    cut('create');
  }, [score, cut]);

  const makeOwn = useCallback(() => {
    score.stop();
    setIsGift(false);
    setDraft({ sister: '' });
    setShareState('idle');
    try {
      window.history.replaceState(null, '', window.location.pathname);
    } catch {
      /* sandboxed frames may not allow this — the film still works */
    }
    cut('create');
  }, [score, cut]);

  const share = useCallback(async () => {
    if (!shareUrl) {
      setShareState('manual');
      return;
    }
    const text = `${names.sister}, ${BROTHER_NAME} made a little Bhau Beej surprise for you ❤️`;

    if (navigator.share && window.matchMedia?.('(pointer: coarse)').matches) {
      try {
        await navigator.share({ title: 'A Bhau Beej surprise', text, url: shareUrl });
        return;
      } catch (err) {
        if (err && err.name === 'AbortError') return;
      }
    }
    const ok = await copyText(shareUrl);
    setShareState(ok ? 'copied' : 'manual');
  }, [shareUrl, names.sister]);

  const copy = useCallback(async () => {
    if (!shareUrl) {
      setShareState('manual');
      return;
    }
    const ok = await copyText(shareUrl);
    setShareState(ok ? 'copied' : 'manual');
  }, [shareUrl]);

  const changeDraft = useCallback((next) => {
    setDraft(next);
    setShareState('idle');
  }, []);

  return (
    <main className="bb-root">
      <div className="bb-stage" ref={stageRef}>
        <SvgDefs />

        {screen === 'create' && (
          <CreateScreen
            draft={draft}
            onChange={changeDraft}
            onPlay={play}
            onCopy={copy}
            shareState={shareState}
            shareUrl={shareUrl}
            ready={ready}
          />
        )}

        {screen === 'gift' && <GiftScreen names={names} ready={ready} onOpen={play} />}

        {screen === 'film' && (
          <Film
            key={run}
            names={names}
            score={score}
            isGift={isGift}
            shareUrl={shareUrl}
            shareState={shareState}
            onShare={share}
            onEdit={edit}
            onMakeOwn={makeOwn}
          />
        )}

        <div
          className={`bb-flash${flash ? ` is-${flash}` : ''}`}
          onAnimationEnd={() => {
            if (flash === 'out') setFlash(null);
          }}
          aria-hidden="true"
        />
      </div>
    </main>
  );
}
