import imgHome from '../assets/film/home.jpg';
import imgPlay from '../assets/film/play.jpg';
import imgFight from '../assets/film/fight.jpg';
import imgShare from '../assets/film/share.jpg';
import imgFestival from '../assets/film/festival.jpg';
import imgTilak from '../assets/film/tilak.jpg';
import imgHug from '../assets/film/hug.jpg';
import imgFinale from '../assets/film/finale.jpg';
import { Bokeh, DiyaRow, Hearts, Mandala, Motes, Ornament, Petals, Stars, Words } from './effects.jsx';

export const FILM_IMAGES = [imgHome, imgPlay, imgFight, imgShare, imgFestival, imgTilak, imgHug, imgFinale];
export const POSTER = imgHome;

export const CHAPTERS = [
  { no: 'I', title: 'The Surprise' },
  { no: 'II', title: 'Childhood' },
  { no: 'III', title: 'Our Bond' },
  { no: 'IV', title: 'From My Heart' },
  { no: 'V', title: 'Forever' },
];

const MESSAGE = [
  'Life gave me many beautiful gifts, but having you as my sister is one of the most precious.',
  'We may fight, tease and annoy each other, but no matter what happens, you will always have a special place in my heart.',
  'Thank you for being my sister, my friend and my lifelong support.',
];

const WISH = 'Always stay happy, keep smiling and remember your brother will always be there for you.';

/** Font size (in stage units) that lets a name of any length sit on one line of script. */
export function fitScript(text, max = 17, room = 84) {
  const length = Math.max(Array.from(text || '').length, 1);
  const size = Math.max(6.5, Math.min(max, room / (length * 0.46)));
  return `calc(var(--u) * ${size.toFixed(2)})`;
}

function Camera({ src, move, seconds, origin = '50% 50%', ease = 'linear' }) {
  return (
    <div className="cam">
      <img
        className={move}
        src={src}
        alt=""
        draggable={false}
        style={{ '--dur': `${seconds}s`, '--origin': origin, '--ease': ease }}
      />
    </div>
  );
}

/* ---------- Scene 1 — Magical beginning ---------- */

function Opening({ sister, brother, seconds }) {
  return (
    <>
      <Camera src={imgHome} move="kb-open" seconds={seconds + 3} origin="50% 30%" ease="cubic-bezier(.25,.6,.3,1)" />
      <div className="flicker" />
      <Bokeh seed={4} count={5} />
      <div className="scrim scrim-top late" style={{ '--at': '.9s' }} />
      <Motes seed={7} count={34} />

      <div className="opening">
        <p className="t-caps track-in" style={{ '--at': '1.2s' }}>
          <span className="gold">
            <span className="t-deva" lang="mr">
              भाऊबीज
            </span>{' '}
            · Bhau Beej
          </span>
        </p>
        <h1 className="t-title glow">
          <Words text="A Special Surprise for My Sister" at={1.9} step={0.17} heart />
        </h1>
        <div className="rise" style={{ '--at': '3.7s' }}>
          <Ornament />
        </div>
        {sister && (
          <p className="t-script opening-name bloom" style={{ '--at': '4.2s', fontSize: fitScript(sister, 17) }}>
            <span className="gold-shine ink">{sister}</span>
          </p>
        )}
        {brother && (
          <p className="opening-from rise" style={{ '--at': sister ? '5.6s' : '4.3s' }}>
            with love, from <span>{brother}</span>
          </p>
        )}
      </div>
    </>
  );
}

/* ---------- Scenes 2 + 3 — Memories and the bond ---------- */

function PhotoShot({ src, move, origin, seconds, caption, memory = false, flicker = false, hearts = false, seed = 1 }) {
  return (
    <>
      <Camera src={src} move={move} seconds={seconds + 2.5} origin={origin} />
      {flicker && <div className="flicker" />}
      {memory && <div className="memory-frame" />}
      {memory && <div className="memory-flash" />}
      <div className="scrim scrim-bottom" />
      {hearts && <Hearts seed={seed + 1} count={7} from="16%" at={0.8} rise={38} />}
      <Motes seed={seed} count={memory ? 20 : 26} />
      <p className="caption">
        <Words text={caption} at={1} step={0.12} gold={false} />
      </p>
    </>
  );
}

/* ---------- Scene 4 — Heart-touching message ---------- */

function Message({ sister }) {
  const dear = `Dear ${sister || 'Sister'},`;
  return (
    <>
      <div className="msg-bg" />
      <div className="msg-halo" />
      <Mandala className="msg-mandala" />
      <Bokeh seed={21} count={5} />
      <Motes seed={22} count={30} />

      <div className="msg">
        <div className="para leaves" style={{ '--out': '8.3s' }}>
          <p className="t-script rise" style={{ '--at': '.6s', fontSize: fitScript(dear, 11) }}>
            <span className="gold ink">{dear}</span>
          </p>
          <p className="t-body glow">
            <Words text={MESSAGE[0]} at={1.6} step={0.14} heart />
          </p>
        </div>
        <div className="para leaves" style={{ '--out': '17.5s' }}>
          <p className="t-body glow">
            <Words text={MESSAGE[1]} at={9.5} step={0.14} />
          </p>
        </div>
        <div className="para">
          <p className="t-body glow">
            <Words text={MESSAGE[2]} at={18.7} step={0.16} />
          </p>
        </div>
      </div>

      <DiyaRow />
    </>
  );
}

/* ---------- Scene 5 — Grand ending ---------- */

function Finale({ sister, brother }) {
  const noteAt = sister ? 11.3 : 7.6;
  const signAt = noteAt + 2.6;
  const wish = sister ? `${sister}, a${WISH.slice(1)}` : WISH;
  const signature = brother || 'Your Brother';

  return (
    <>
      <Camera src={imgFinale} move="kb-finale" seconds={10.5} ease="cubic-bezier(.22,.7,.2,1)" />
      <Stars seed={31} count={26} />
      <div className="shooting-star" />
      <div className="scrim scrim-night late" style={{ '--at': '3.4s' }} />
      <Petals seed={32} count={18} at={2.5} />
      <Hearts seed={33} count={14} from="22%" at={4} rise={30} />

      <div className="finale">
        <p className="finale-deva rise" lang="mr" style={{ '--at': '4.2s' }}>
          <span className="gold">भाऊबीजेच्या हार्दिक शुभेच्छा</span>
        </p>
        <h2 className="t-title glow">
          <Words text="Happy Bhau Beej," at={4.9} step={0.2} />
          <br />
          <Words text="My Dear Sister!" at={5.7} step={0.2} heart />
        </h2>

        <div className="finale-swap">
          {sister && (
            <div className="leaves" style={{ '--out': '10.3s' }}>
              <p className="t-script bloom" style={{ '--at': '7.1s', fontSize: fitScript(sister, 16) }}>
                <span className="gold-shine ink">{sister}</span>
              </p>
            </div>
          )}
          <div className="finale-after">
            <p className="finale-note">
              <Words text={wish} at={noteAt} step={0.13} gold={false} />
            </p>
            <p className="signature rise" style={{ '--at': `${signAt}s` }}>
              <span>{brother ? 'Forever your brother,' : 'Forever,'}</span>
              <span className="t-script" style={{ fontSize: fitScript(signature, 10.5) }}>
                <span className="gold ink">{signature}</span>
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------- The cut list ---------- */

/**
 * Every shot of the film, in order. `scene` groups shots into the five
 * chapters; `say` is what a screen reader announces for the shot.
 */
export function buildShots({ sister, brother }) {
  const remember = sister ? `Remember, ${sister}?` : 'Remember?';
  const lines = {
    play: `${remember} When the whole world was just you, me and our little games.`,
    fight: 'We fought over the silliest little things…',
    share: '…and shared everything again a minute later.',
    festival: 'Every festival shone brighter with you beside me.',
    tilak: 'The years flew by, yet every Bhau Beej your tilak still carries a thousand prayers for me.',
    hug: 'And your hug still feels like home.',
  };
  const photo = (props) => (p) => <PhotoShot seconds={p.seconds} {...props} />;

  return [
    {
      id: 'opening',
      scene: 0,
      duration: 9500,
      say: `A special surprise for my sister${sister ? `, ${sister}` : ''}${brother ? `. With love, from ${brother}` : ''}.`,
      render: (p) => <Opening {...p} />,
    },
    {
      id: 'play',
      scene: 1,
      duration: 6200,
      say: lines.play,
      render: photo({ src: imgPlay, move: 'kb-push', origin: '50% 34%', caption: lines.play, memory: true, seed: 41 }),
    },
    {
      id: 'fight',
      scene: 1,
      duration: 5000,
      say: lines.fight,
      render: photo({ src: imgFight, move: 'kb-right', origin: '50% 40%', caption: lines.fight, memory: true, seed: 42 }),
    },
    {
      id: 'share',
      scene: 1,
      duration: 5200,
      say: lines.share,
      render: photo({ src: imgShare, move: 'kb-push', origin: '48% 36%', caption: lines.share, memory: true, seed: 43 }),
    },
    {
      id: 'festival',
      scene: 1,
      duration: 5800,
      say: lines.festival,
      render: photo({
        src: imgFestival,
        move: 'kb-pull',
        origin: '50% 34%',
        caption: lines.festival,
        memory: true,
        flicker: true,
        seed: 44,
      }),
    },
    {
      id: 'tilak',
      scene: 2,
      duration: 7400,
      say: lines.tilak,
      render: photo({ src: imgTilak, move: 'kb-push', origin: '56% 28%', caption: lines.tilak, flicker: true, seed: 45 }),
    },
    {
      id: 'hug',
      scene: 2,
      duration: 6400,
      say: lines.hug,
      render: photo({
        src: imgHug,
        move: 'kb-pull',
        origin: '50% 26%',
        caption: lines.hug,
        flicker: true,
        hearts: true,
        seed: 46,
      }),
    },
    {
      id: 'message',
      scene: 3,
      duration: 25500,
      say: `Dear ${sister || 'sister'}. ${MESSAGE.join(' ')}`,
      render: (p) => <Message {...p} />,
    },
    {
      id: 'finale',
      scene: 4,
      duration: 16500,
      say: `Happy Bhau Beej, my dear sister! ${WISH}${brother ? ` Forever your brother, ${brother}.` : ''}`,
      render: (p) => <Finale {...p} />,
    },
  ];
}
