/**
 * The film's music: a small generative score played with the Web Audio API.
 * No audio files — a music-box melody over soft strings in D major, mixed
 * differently for each scene, with a little chime whenever the scene changes.
 */

const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);

const VOLUME = 0.85;
const TEMPO = 66; // beats per minute
const STEPS = 64; // eight bars of eighth notes

// D – A/C# – Bm – G – D/F# – G – Asus4 – A
const BARS = [
  { pad: [50, 57, 62, 66], arp: [50, 57, 62, 66, 69, 66, 62, 57] },
  { pad: [49, 57, 61, 64], arp: [49, 57, 61, 64, 69, 64, 61, 57] },
  { pad: [47, 54, 59, 62], arp: [47, 54, 59, 62, 66, 62, 59, 54] },
  { pad: [43, 50, 55, 59], arp: [43, 50, 55, 59, 62, 59, 55, 50] },
  { pad: [42, 50, 57, 62], arp: [42, 50, 57, 62, 66, 62, 57, 50] },
  { pad: [43, 50, 55, 59], arp: [43, 50, 55, 59, 62, 59, 55, 50] },
  { pad: [45, 52, 57, 62], arp: [45, 52, 57, 62, 64, 62, 57, 52] },
  { pad: [45, 52, 57, 61], arp: [45, 52, 57, 61, 64, 61, 57, 52] },
];

// step → [midi note, length in eighths]
const MELODY = {
  0: [78, 3], 3: [76, 1], 4: [74, 2], 6: [69, 2],
  8: [76, 4], 12: [73, 2], 14: [76, 2],
  16: [74, 3], 19: [71, 1], 20: [78, 4],
  24: [79, 3], 27: [78, 1], 28: [74, 4],
  32: [81, 3], 35: [78, 1], 36: [74, 2], 38: [78, 2],
  40: [83, 3], 43: [81, 1], 44: [79, 2], 46: [74, 2],
  48: [76, 2], 50: [74, 2], 52: [76, 4],
  56: [73, 4], 60: [76, 2], 62: [69, 2],
};

// One mix per scene: strings, arpeggio, melody, music-box octave, high strings
const MIX = [
  { pad: 0.9, arp: 0.55, mel: 0.85, bell: 0, hi: 0 },
  { pad: 0.7, arp: 0.9, mel: 1, bell: 0.55, hi: 0 },
  { pad: 1, arp: 0.8, mel: 0.9, bell: 0, hi: 0.35 },
  { pad: 1, arp: 0.7, mel: 0.55, bell: 0, hi: 0.3 },
  { pad: 1.1, arp: 1, mel: 1.1, bell: 0.6, hi: 0.7 },
];

const VOICES = {
  keys: [[1, 'sine', 1], [2, 'sine', 0.32], [3, 'sine', 0.1], [1, 'triangle', 0.22]],
  bell: [[1, 'sine', 1], [2.01, 'sine', 0.35], [3.02, 'sine', 0.12]],
  soft: [[1, 'triangle', 0.8], [2, 'sine', 0.15]],
};

function makeImpulse(ctx, seconds, decay) {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let c = 0; c < 2; c += 1) {
    const data = buffer.getChannelData(c);
    for (let i = 0; i < length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** decay;
    }
  }
  return buffer;
}

export class Score {
  constructor() {
    this.ctx = null;
    this.running = false;
    this.muted = false;
    this.scene = null;
    this.mix = MIX[0];
    this.timer = 0;
    this.sleep = 0;
    this.step = 0;
    this.nextTime = 0;
    this.eighth = 60 / TEMPO / 2;
  }

  _init() {
    if (this.ctx) return true;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return false;
    try {
      const ctx = new AudioCtx();
      const master = ctx.createGain();
      master.gain.value = 0;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -18;
      comp.ratio.value = 3;
      // Make-up gain after the compressor so the score carries on phone speakers
      const output = ctx.createGain();
      output.gain.value = 2.4;
      master.connect(comp);
      comp.connect(output);
      output.connect(ctx.destination);

      const bus = ctx.createGain();
      const dry = ctx.createGain();
      dry.gain.value = 0.8;
      const wet = ctx.createGain();
      wet.gain.value = 0.55;
      const reverb = ctx.createConvolver();
      reverb.buffer = makeImpulse(ctx, 3.2, 2.3);
      bus.connect(dry);
      bus.connect(reverb);
      reverb.connect(wet);
      dry.connect(master);
      wet.connect(master);

      this.ctx = ctx;
      this.master = master;
      this.bus = bus;
      return true;
    } catch {
      return false;
    }
  }

  /** Must be called from a user gesture (tap / click). */
  start() {
    if (!this._init()) return;
    const { ctx } = this;
    clearTimeout(this.sleep);
    clearInterval(this.timer);
    if (ctx.state !== 'running') ctx.resume().catch(() => {});
    this.running = true;
    this.scene = null;
    this.mix = MIX[0];
    this.step = 0;
    this.nextTime = ctx.currentTime + 0.15;
    this._fade(this.muted ? 0 : VOLUME, 2.4);
    this.timer = setInterval(() => this._pump(), 70);
  }

  stop() {
    if (!this.ctx || !this.running) return;
    const { ctx } = this;
    this.running = false;
    clearInterval(this.timer);
    if (ctx.state !== 'running') ctx.resume().catch(() => {});
    this._fade(0, 0.7);
    this.sleep = setTimeout(() => {
      if (!this.running) ctx.suspend().catch(() => {});
    }, 1200);
  }

  pause() {
    if (this.ctx && this.running) this.ctx.suspend().catch(() => {});
  }

  resume() {
    if (this.ctx && this.running && this.ctx.state !== 'running') this.ctx.resume().catch(() => {});
  }

  setMuted(muted) {
    if (muted === this.muted) return;
    this.muted = muted;
    if (this.ctx && this.running) this._fade(muted ? 0 : VOLUME, 0.35);
  }

  setScene(index) {
    const changed = this.scene !== null && this.scene !== index;
    this.scene = index;
    this.mix = MIX[index] || MIX[0];
    if (changed) this.chime();
  }

  chime() {
    if (!this.ctx || !this.running) return;
    const t = this.ctx.currentTime + 0.05;
    [86, 90, 93, 98].forEach((note, i) => this._pluck(t + i * 0.09, note, 2.2, 0.035, 'bell'));
  }

  dispose() {
    clearInterval(this.timer);
    clearTimeout(this.sleep);
    this.running = false;
    if (this.ctx) this.ctx.close().catch(() => {});
    this.ctx = null;
  }

  _fade(value, seconds) {
    const gain = this.master.gain;
    const now = this.ctx.currentTime;
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(gain.value, now);
    gain.linearRampToValueAtTime(value, now + seconds);
  }

  _pump() {
    const { ctx } = this;
    if (!ctx || !this.running || ctx.state !== 'running') return;
    if (this.nextTime < ctx.currentTime) this.nextTime = ctx.currentTime + 0.06;
    while (this.nextTime < ctx.currentTime + 0.4) {
      this._playStep(this.step, this.nextTime);
      this.nextTime += this.eighth;
      this.step = (this.step + 1) % STEPS;
    }
  }

  _playStep(step, time) {
    const bar = BARS[(step >> 3) % BARS.length];
    const pos = step & 7;
    const { mix } = this;

    if (pos === 0) this._pad(bar.pad, time, this.eighth * 8, mix);
    if (mix.arp > 0) this._pluck(time, bar.arp[pos], 1.6, 0.05 * mix.arp * (pos === 0 ? 1.3 : 1), 'soft');

    const note = MELODY[step];
    if (note && mix.mel > 0) {
      this._pluck(time, note[0], Math.max(1.4, note[1] * this.eighth * 1.7), 0.13 * mix.mel, 'keys');
      if (mix.bell > 0) this._pluck(time + 0.012, note[0] + 12, 1.2, 0.05 * mix.bell, 'bell');
    }
  }

  _pluck(time, note, duration, gain, voice) {
    const { ctx } = this;
    const freq = hz(note);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, time);
    env.gain.exponentialRampToValueAtTime(Math.max(gain, 0.0002), time + (voice === 'soft' ? 0.02 : 0.008));
    env.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    env.connect(this.bus);

    for (const [mult, type, level] of VOICES[voice]) {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = freq * mult;
      const part = ctx.createGain();
      part.gain.value = level;
      osc.connect(part);
      part.connect(env);
      osc.start(time);
      osc.stop(time + duration + 0.05);
    }
  }

  _pad(notes, time, length, mix) {
    const { ctx } = this;
    const level = 0.022 * mix.pad;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    filter.Q.value = 0.4;

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, time);
    env.gain.linearRampToValueAtTime(1, time + length * 0.35);
    env.gain.setValueAtTime(1, time + length * 0.8);
    env.gain.linearRampToValueAtTime(0.0001, time + length * 1.35);
    filter.connect(env);
    env.connect(this.bus);

    const voices = notes.map((n) => [n, level]);
    if (mix.hi > 0) voices.push([notes[2] + 12, level * mix.hi], [notes[3] + 12, level * mix.hi]);

    for (const [note, gain] of voices) {
      for (const detune of [-6, 6]) {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = hz(note);
        osc.detune.value = detune;
        const part = ctx.createGain();
        part.gain.value = gain;
        osc.connect(part);
        part.connect(filter);
        osc.start(time);
        osc.stop(time + length * 1.4);
      }
    }

    // A warm root note underneath the strings
    const root = ctx.createOscillator();
    root.type = 'sine';
    root.frequency.value = hz(notes[0]);
    const rootGain = ctx.createGain();
    rootGain.gain.value = 0.05 * mix.pad;
    root.connect(rootGain);
    rootGain.connect(env);
    root.start(time);
    root.stop(time + length * 1.4);
  }
}
