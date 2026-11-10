import { useEffect, useLayoutEffect, useState } from 'react';

export const MAX_NAME = 24;
export const BROTHER_NAME = 'Saurabh';

/** Keeps names tidy while typing: no control characters, single spaces, 24 characters max. */
export function cleanName(value) {
  const text = String(value ?? '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f<>]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^\s+/, '');
  return Array.from(text).slice(0, MAX_NAME).join('');
}

/** A shared link only supplies the sister's name; the brother is always Saurabh. */
export function readLink() {
  try {
    const q = new URLSearchParams(window.location.search);
    const sister = cleanName(q.get('to')).trim();
    return {
      sister,
      isGift: Boolean(sister),
    };
  } catch {
    return { sister: '', isGift: false };
  }
}

/** Builds the personal link, or '' when the page has no shareable address. */
export function buildLink(sister) {
  try {
    const url = new URL(window.location.href);
    if (!/^https?:$/.test(url.protocol)) return '';
    url.search = '';
    url.hash = '';
    if (!sister) return '';
    url.searchParams.set('to', sister);
    return url.toString();
  } catch {
    return '';
  }
}

export async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the legacy path */
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  } catch {
    return false;
  }
}

/** Publishes --u / --v (1% of stage width / height, in px) on the stage element. */
export function useStageUnits(ref) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const apply = () => {
      const box = el.getBoundingClientRect();
      el.style.setProperty('--u', `${box.width / 100}px`);
      el.style.setProperty('--v', `${box.height / 100}px`);
    };
    apply();
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(apply) : null;
    observer?.observe(el);
    window.addEventListener('resize', apply);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', apply);
    };
  }, [ref]);
}

/**
 * Publishes --px / --py (-1…1) on the stage. They follow the mouse on desktop
 * and fall back to a slow handheld-camera drift on touch screens or when idle.
 */
export function useParallax(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;

    let raf = 0;
    let x = 0;
    let y = 0;
    let targetX = 0;
    let targetY = 0;
    let lastMove = -Infinity;
    const clamp = (n) => Math.max(-1, Math.min(1, n));

    const onMove = (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      const box = el.getBoundingClientRect();
      targetX = clamp(((e.clientX - box.left) / box.width - 0.5) * 2);
      targetY = clamp(((e.clientY - box.top) / box.height - 0.5) * 2);
      lastMove = performance.now();
    };

    const loop = (now) => {
      const idle = now - lastMove > 2500;
      const t = now / 1000;
      const goalX = idle ? Math.sin(t * 0.45) * 0.55 : targetX;
      const goalY = idle ? Math.cos(t * 0.33) * 0.45 : targetY;
      x += (goalX - x) * 0.045;
      y += (goalY - y) * 0.045;
      el.style.setProperty('--px', x.toFixed(4));
      el.style.setProperty('--py', y.toFixed(4));
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, [ref]);
}

/** Decodes the film's images (and warms up the fonts) before the curtain rises. */
export function usePreload(urls) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    let left = urls.length;
    const done = () => {
      left -= 1;
      if (left <= 0 && alive) setReady(true);
    };
    const images = urls.map((src) => {
      const img = new Image();
      img.onload = done;
      img.onerror = done;
      img.src = src;
      return img;
    });
    // Never leave someone staring at a disabled button
    const failOpen = setTimeout(() => alive && setReady(true), 6000);

    if (document.fonts?.load) {
      [
        ['1em "Great Vibes"'],
        ['italic 500 1em "Cormorant Garamond"'],
        ['500 1em "Cinzel"'],
        ['1em "Tiro Devanagari Marathi"', 'भाऊबीज'],
      ].forEach(([font, sample]) => document.fonts.load(font, sample).catch(() => {}));
    }

    return () => {
      alive = false;
      clearTimeout(failOpen);
      images.forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, [urls]);

  return ready;
}
