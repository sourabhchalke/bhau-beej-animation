import { Diya, Mandala, Motes, Toran } from './effects.jsx';
import { BROTHER_NAME, cleanName, MAX_NAME } from './hooks.js';
import { fitScript, POSTER } from './scenes.jsx';

const IconPlay = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M8 5.2v13.6a1 1 0 0 0 1.5.86l11-6.8a1 1 0 0 0 0-1.72l-11-6.8A1 1 0 0 0 8 5.2z" />
  </svg>
);

/** The sister enters her own name; the sender is fixed throughout the film. */
export function CreateScreen({ draft, onChange, onPlay, onCopy, shareState, shareUrl, ready }) {
  const sister = draft.sister.trim();

  let hint = 'Enter your name to make every scene yours.';
  if (shareState === 'copied') hint = 'Your personal link is copied and ready to share.';
  else if (shareState === 'manual') {
    hint = shareUrl
      ? 'Copy the link above to share your personalized film.'
      : 'Open this page at its own web address to get a link you can send.';
  }

  return (
    <section className="screen create" aria-labelledby="bb-create-title">
      <div className="create-bg" aria-hidden="true">
        <img src={POSTER} alt="" draggable={false} />
      </div>
      <Motes seed={3} count={22} />

      <div className="create-scroll">
        <form
          className="create-body"
          onSubmit={(e) => {
            e.preventDefault();
            if (ready && sister) onPlay();
          }}
        >
          <p className="t-caps">
            <span className="gold">
              <span className="t-deva" lang="mr">
                भाऊबीज
              </span>{' '}
              · Bhau Beej
            </span>
          </p>
          <h1 id="bb-create-title" className="t-title create-title">
            <span className="gold">A surprise film, made just for you</span>
          </h1>
          <p className="t-lede">A little Bhau Beej gift from {BROTHER_NAME}. What's your name?</p>

          <div className="field">
            <label htmlFor="bb-sister">Enter your name</label>
            <input
              id="bb-sister"
              name="sister"
              type="text"
              value={draft.sister}
              onChange={(e) => onChange({ ...draft, sister: cleanName(e.target.value) })}
              placeholder="Priya"
              maxLength={MAX_NAME}
              autoComplete="off"
              autoCapitalize="words"
              spellCheck={false}
              enterKeyHint="go"
              required
            />
          </div>

          <button type="submit" className="btn btn-gold" disabled={!ready || !sister}>
            {ready ? (
              <>
                <IconPlay /> Open your surprise
              </>
            ) : (
              'Lighting the diyas…'
            )}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onCopy} disabled={!sister}>
            {shareState === 'copied' ? 'Link copied' : 'Copy your link'}
          </button>
          {shareState === 'manual' && shareUrl && (
            <input
              className="manual-link"
              readOnly
              value={shareUrl}
              aria-label="Link to your film"
              onFocus={(e) => e.target.select()}
            />
          )}
          <p className="hint" role="status">
            {hint}
          </p>
        </form>
      </div>
    </section>
  );
}

/** What she sees when she opens her link: a gift waiting to be opened. */
export function GiftScreen({ names, ready, onOpen }) {
  const { sister, brother } = names;
  const title = sister || 'My Dear Sister';

  return (
    <section className="screen gift" aria-labelledby="bb-gift-title">
      <Toran />
      <Motes seed={5} count={26} />

      <div className="gift-head">
        <p className="t-caps rise" style={{ '--at': '.2s' }}>
          <span className="gold">A Bhau Beej surprise</span>
        </p>
        <p className="gift-for rise" style={{ '--at': '.5s' }}>
          for
        </p>
        <h1 id="bb-gift-title" className="t-script bloom" style={{ '--at': '.7s', fontSize: fitScript(title, 17) }}>
          <span className="gold-shine ink">{title}</span>
        </h1>
      </div>

      <div className="gift-center" aria-hidden="true">
        <Mandala className="gift-mandala" />
        <Diya size={30} />
      </div>

      <div className="gift-foot">
        <p className="t-lede rise" style={{ '--at': '1.2s' }}>
          <strong>{brother}</strong> made a little film, just for you.
        </p>
        <button type="button" className="btn btn-gold btn-pulse" onClick={onOpen} disabled={!ready}>
          {ready ? 'Open your surprise' : 'Lighting the diyas…'}
        </button>
        <p className="hint">Turn your sound on — there’s music.</p>
      </div>
    </section>
  );
}
