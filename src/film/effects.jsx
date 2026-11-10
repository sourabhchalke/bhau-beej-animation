import { Fragment, useMemo } from 'react';

const HEART =
  'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';

/** Small seeded PRNG so particles keep their positions between renders. */
function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = (rand, min, max) => +(min + rand() * (max - min)).toFixed(2);
const u = (n) => `calc(var(--u) * ${n})`;

/** Shared SVG gradients, rendered once inside the stage. */
export function SvgDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="bb-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff6d8" />
          <stop offset=".45" stopColor="#f6cf6d" />
          <stop offset="1" stopColor="#d08a26" />
        </linearGradient>
        <linearGradient id="bb-flame" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ff6a00" />
          <stop offset=".45" stopColor="#ffb11f" />
          <stop offset="1" stopColor="#fff3b0" />
        </linearGradient>
        <linearGradient id="bb-clay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c8582a" />
          <stop offset=".55" stopColor="#8f3415" />
          <stop offset="1" stopColor="#4d1608" />
        </linearGradient>
        <radialGradient id="bb-oil" cx=".5" cy=".5" r=".6">
          <stop offset="0" stopColor="#fff0b0" />
          <stop offset="1" stopColor="#e0871c" />
        </radialGradient>
        <radialGradient id="bb-mari-a" cx=".38" cy=".34" r=".75">
          <stop offset="0" stopColor="#ffd766" />
          <stop offset=".55" stopColor="#ff9a1f" />
          <stop offset="1" stopColor="#d85a00" />
        </radialGradient>
        <radialGradient id="bb-mari-b" cx=".38" cy=".34" r=".75">
          <stop offset="0" stopColor="#fff3a0" />
          <stop offset=".55" stopColor="#ffc629" />
          <stop offset="1" stopColor="#e88a00" />
        </radialGradient>
        <linearGradient id="bb-leaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7fbf4a" />
          <stop offset="1" stopColor="#2f6b22" />
        </linearGradient>
        <linearGradient id="bb-heart" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff7a92" />
          <stop offset="1" stopColor="#d5133c" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function HeartIcon() {
  return (
    <svg className="heart-ico" viewBox="0 0 24 24" aria-hidden="true">
      <path d={HEART} fill="url(#bb-heart)" />
    </svg>
  );
}

/**
 * Text that arrives one word at a time.
 * `heart` appends a beating heart that never wraps onto a line of its own.
 */
export function Words({ text, at = 0, step = 0.12, gold = true, heart = false }) {
  const words = text.split(/\s+/).filter(Boolean);
  const cls = gold ? 'gold' : undefined;
  const last = words.length - 1;

  return (
    <span className="words" style={{ '--at': `${at}s`, '--step': `${step}s` }}>
      {words.map((word, i) => {
        const el = (
          <span className="w" style={{ '--i': i }}>
            <span className={cls}>{word}</span>
          </span>
        );
        if (heart && i === last) {
          return (
            <span key={i} className="nowrap">
              {el}
              {'\u00a0'}
              <span className="w" style={{ '--i': i + 2 }}>
                <HeartIcon />
              </span>
            </span>
          );
        }
        return (
          <Fragment key={i}>
            {el}{' '}
          </Fragment>
        );
      })}
    </span>
  );
}

export function Ornament() {
  return (
    <span className="orn" aria-hidden="true">
      <i />
      <b />
      <i />
    </span>
  );
}

/** Floating golden dust. */
export function Motes({ count = 28, seed = 1 }) {
  const items = useMemo(() => {
    const rand = mulberry(seed);
    return Array.from({ length: count }, () => {
      const big = rand() > 0.82;
      return {
        '--x': `${pick(rand, 0, 100)}%`,
        '--y': `${pick(rand, 6, 100)}%`,
        '--s': u(big ? pick(rand, 2.6, 4.6) : pick(rand, 0.9, 2.2)),
        '--t': `${pick(rand, 7, 15)}s`,
        '--d': `${-pick(rand, 0, 15)}s`,
        '--dx': u(pick(rand, -9, 9)),
        '--dy': u(-pick(rand, 10, 30)),
        '--o': pick(rand, 0.45, 1),
      };
    });
  }, [count, seed]);

  return (
    <div className="motes" aria-hidden="true">
      {items.map((style, i) => (
        <i key={i} className="mote" style={style} />
      ))}
    </div>
  );
}

/** Large, soft out-of-focus lights in the foreground. */
export function Bokeh({ count = 6, seed = 2 }) {
  const items = useMemo(() => {
    const rand = mulberry(seed);
    return Array.from({ length: count }, () => ({
      '--x': `${pick(rand, 0, 100)}%`,
      '--y': `${pick(rand, 8, 96)}%`,
      '--s': u(pick(rand, 12, 30)),
      '--o': pick(rand, 0.3, 0.75),
      '--t': `${pick(rand, 9, 16)}s`,
      '--d': `${-pick(rand, 0, 12)}s`,
      '--dx': u(pick(rand, -6, 6)),
      '--dy': u(pick(rand, -8, 4)),
    }));
  }, [count, seed]);

  return (
    <div className="bokeh" aria-hidden="true">
      {items.map((style, i) => (
        <i key={i} style={style} />
      ))}
    </div>
  );
}

const PETAL_COLORS = [
  'radial-gradient(120% 120% at 30% 25%, #ffd978 0%, #ff9d1f 55%, #e2620a 100%)',
  'radial-gradient(120% 120% at 30% 25%, #ff9db2 0%, #e8395f 55%, #b3123a 100%)',
  'radial-gradient(120% 120% at 30% 25%, #fff2a8 0%, #ffc933 60%, #ee9a0c 100%)',
];

/** Marigold and rose petals tumbling down in 3D. */
export function Petals({ count = 18, seed = 9, at = 0 }) {
  const items = useMemo(() => {
    const rand = mulberry(seed);
    return Array.from({ length: count }, (_, i) => {
      const t = pick(rand, 7.5, 13);
      return {
        '--x': `${pick(rand, 2, 96)}%`,
        '--s': u(pick(rand, 2.4, 4.6)),
        '--t': `${t}s`,
        '--d': `${(at + rand() * t).toFixed(2)}s`,
        '--c': PETAL_COLORS[i % PETAL_COLORS.length],
      };
    });
  }, [count, seed, at]);

  return (
    <div className="petals" aria-hidden="true">
      {items.map((style, i) => (
        <span key={i} className="petal" style={style}>
          <i>
            <b />
          </i>
        </span>
      ))}
    </div>
  );
}

/** Golden hearts rising from `from` (distance above the bottom edge) by `rise` % of the stage height. */
export function Hearts({ count = 14, seed = 5, from = '26%', at = 0, rise = 40 }) {
  const items = useMemo(() => {
    const rand = mulberry(seed);
    return Array.from({ length: count }, () => ({
      '--x': `${pick(rand, 12, 88)}%`,
      '--y': u(pick(rand, -6, 8)),
      '--s': u(pick(rand, 3.2, 7)),
      '--t': `${pick(rand, 5.5, 9.5)}s`,
      '--d': `${(at + rand() * 9).toFixed(2)}s`,
      '--dx': u(pick(rand, -12, 12)),
      '--r': `${pick(rand, -24, 24)}deg`,
    }));
  }, [count, seed, at]);

  return (
    <div className="hearts" style={{ '--from': from, '--rise': rise }} aria-hidden="true">
      {items.map((style, i) => (
        <svg key={i} className="heart-p" viewBox="0 0 24 24" style={style}>
          <path d={HEART} fill="url(#bb-gold)" />
        </svg>
      ))}
    </div>
  );
}

/** Extra twinkles over the night sky. */
export function Stars({ count = 26, seed = 12 }) {
  const items = useMemo(() => {
    const rand = mulberry(seed);
    return Array.from({ length: count }, () => ({
      '--x': `${pick(rand, 2, 98)}%`,
      '--y': `${pick(rand, 2, 50)}%`,
      '--s': u(pick(rand, 0.45, 1.1)),
      '--t': `${pick(rand, 2.2, 5)}s`,
      '--d': `${-pick(rand, 0, 5)}s`,
    }));
  }, [count, seed]);

  return (
    <div className="stars" aria-hidden="true">
      {items.map((style, i) => (
        <i key={i} className="star" style={style} />
      ))}
    </div>
  );
}

/** A clay diya with a living flame. `size` is in stage units. */
export function Diya({ size = 14, delay = 0, style }) {
  return (
    <span className="diya" style={{ '--size': u(size), '--d': `${delay}s`, ...style }}>
      <span className="diya-glow" />
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <g className="diya-flame">
          <path d="M50 4C60 22 70 35 62 49c-3 6-8 9-12 9s-9-3-12-9C30 35 40 22 50 4z" fill="url(#bb-flame)" />
          <path
            d="M50 27c5 9 9 15 6 23-1.4 3.6-4 5.6-6 5.6s-4.6-2-6-5.6c-3-8 1-14 6-23z"
            fill="#fff9dc"
            opacity=".92"
          />
        </g>
        <path d="M7 62c1 14 14 29 43 30 29-1 42-16 43-30-22 9-64 9-86 0z" fill="url(#bb-clay)" />
        <ellipse cx="50" cy="62" rx="43" ry="8.5" fill="#5e1f0e" stroke="#f6cf6d" strokeWidth="2.2" />
        <ellipse cx="50" cy="62.5" rx="33" ry="5.2" fill="url(#bb-oil)" />
        <g fill="#f6cf6d">
          {[26, 38, 50, 62, 74].map((x, i) => (
            <circle key={x} cx={x} cy={81 - Math.abs(i - 2) * 1.6} r="1.9" />
          ))}
        </g>
      </svg>
    </span>
  );
}

const DIYA_ROW = [
  { size: 10, lift: 5, delay: -0.4 },
  { size: 13, lift: 2, delay: -1.1 },
  { size: 16.5, lift: 0, delay: 0 },
  { size: 13, lift: 2, delay: -0.7 },
  { size: 10, lift: 5, delay: -1.5 },
];

export function DiyaRow() {
  return (
    <div className="diya-row" aria-hidden="true">
      {DIYA_ROW.map((d, i) => (
        <Diya key={i} size={d.size} delay={d.delay} style={{ marginBottom: u(d.lift) }} />
      ))}
    </div>
  );
}

const petalPath = (r, len, w) =>
  `M0 ${-r}Q${w} ${-(r + len * 0.5)} 0 ${-(r + len)}Q${-w} ${-(r + len * 0.5)} 0 ${-r}Z`;

function Ring({ n, r, len, w }) {
  const d = petalPath(r, len, w);
  return Array.from({ length: n }, (_, i) => <path key={i} d={d} transform={`rotate(${(360 / n) * i})`} />);
}

/** Line-art rangoli: two counter-rotating rings of petals. */
export function Mandala({ className = '' }) {
  const line = { fill: 'none', stroke: '#f3c766', strokeWidth: 0.45 };
  return (
    <div className={`mandala-wrap ${className}`} aria-hidden="true">
      <svg className="m-outer" viewBox="-100 -100 200 200" {...line}>
        <circle r="98" />
        <circle r="94" strokeDasharray="1 3" />
        <circle r="78" />
        <Ring n={36} r={78} len={15} w={6} />
        <Ring n={24} r={56} len={21} w={8} />
        <circle r="56" />
      </svg>
      <svg className="m-inner" viewBox="-100 -100 200 200" {...line}>
        <circle r="52" strokeDasharray=".6 2.4" />
        <circle r="34" />
        <Ring n={16} r={34} len={17} w={7.5} />
        <Ring n={8} r={12} len={21} w={9} />
        <circle r="12" />
        <circle r="5" fill="#f3c766" stroke="none" opacity=".7" />
      </svg>
    </div>
  );
}

/** A marigold toran (door garland) with mango leaves, swaying gently. */
export function Toran() {
  const { flowers, leaves } = useMemo(() => {
    const rand = mulberry(11);
    const W = 360;
    const swags = 3;
    const top = 8;
    const sag = 30;
    const f = [];
    const l = [];

    for (let s = 0; s < swags; s += 1) {
      const x0 = (W / swags) * s;
      const x1 = (W / swags) * (s + 1);
      const n = 11;
      for (let i = 0; i <= n; i += 1) {
        const t = i / n;
        f.push({ x: x0 + (x1 - x0) * t, y: top + sag * 4 * t * (1 - t), r: pick(rand, 6.6, 8.4), alt: (i + s) % 2 });
      }
    }
    for (let j = 0; j <= swags; j += 1) {
      const x = Math.min(Math.max((W / swags) * j, 9), W - 9);
      const len = j === 0 || j === swags ? 5 : 3;
      for (let k = 1; k <= len; k += 1) f.push({ x, y: top + k * 13, r: 7, alt: k % 2 });
      l.push({ x, y: top + len * 13 + 6 });
    }
    return { flowers: f, leaves: l };
  }, []);

  return (
    <svg className="toran" viewBox="0 0 360 100" aria-hidden="true">
      {leaves.map((leaf, i) => (
        <path
          key={i}
          d="M0 0C7 8 7 20 0 30C-7 20 -7 8 0 0Z"
          transform={`translate(${leaf.x} ${leaf.y})`}
          fill="url(#bb-leaf)"
        />
      ))}
      {flowers.map((fl, i) => (
        <g key={i} transform={`translate(${fl.x.toFixed(1)} ${fl.y.toFixed(1)})`}>
          <circle r={fl.r} fill={fl.alt ? 'url(#bb-mari-a)' : 'url(#bb-mari-b)'} />
          <circle
            r={fl.r * 0.55}
            fill="none"
            stroke="rgba(120, 40, 0, .35)"
            strokeWidth=".8"
            strokeDasharray="2 1.6"
          />
        </g>
      ))}
    </svg>
  );
}
