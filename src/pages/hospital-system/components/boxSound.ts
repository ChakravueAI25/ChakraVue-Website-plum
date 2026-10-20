/**
 * The Box story's sound, made live with the Web Audio API (no audio files):
 * four voices start as a muffled, out-of-tune cluster and glide into a
 * clear chord when the devices fall into step. Off unless the visitor turns
 * it on; the choice is kept in sessionStorage ("cv-box-sound").
 */

const KEY = "cv-box-sound";
/** Out of tune and close together: every machine on its own note. */
const CLUSTER = [196, 207.65, 233.08, 246.94];
/** Where they resolve: one chord. */
const CHORD = [196, 246.94, 293.66, 392];

export function soundPreference() {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setSoundPreference(on: boolean) {
  try {
    sessionStorage.setItem(KEY, on ? "1" : "0");
  } catch {
    // Private windows may refuse; the toggle still works for this visit.
  }
}

type Voice = { osc: OscillatorNode; gain: GainNode };

export class BoxSound {
  private ctx: AudioContext | null = null;
  private voices: Voice[] = [];
  private filter: BiquadFilterNode | null = null;
  private master: GainNode | null = null;

  /** Call from a click, so the browser lets the audio start. */
  unlock() {
    if (!this.ctx) {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
    }
    void this.ctx.resume();
  }

  /** The muffled cluster, fading in. */
  start() {
    this.unlock();
    const ctx = this.ctx;
    if (!ctx) return;
    this.stop(0);
    const now = ctx.currentTime;
    this.master = ctx.createGain();
    this.master.gain.setValueAtTime(0, now);
    this.master.gain.linearRampToValueAtTime(0.09, now + 0.8);
    this.filter = ctx.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.setValueAtTime(420, now);
    this.filter.connect(this.master).connect(ctx.destination);
    this.voices = CLUSTER.map((frequency, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(frequency, now);
      osc.detune.setValueAtTime((i % 2 ? 1 : -1) * 18, now);
      gain.gain.setValueAtTime(0.22, now);
      osc.connect(gain).connect(this.filter!);
      osc.start(now);
      return { osc, gain };
    });
  }

  /** Into tune: the voices glide to the chord and the filter opens, then it fades. */
  resolve() {
    const ctx = this.ctx;
    if (!ctx || !this.master || !this.filter) return;
    const now = ctx.currentTime;
    this.voices.forEach(({ osc }, i) => {
      osc.frequency.cancelScheduledValues(now);
      osc.frequency.setValueAtTime(osc.frequency.value, now);
      osc.frequency.exponentialRampToValueAtTime(CHORD[i], now + 0.7);
      osc.detune.linearRampToValueAtTime(0, now + 0.7);
      osc.type = "sine";
    });
    this.filter.frequency.cancelScheduledValues(now);
    this.filter.frequency.setValueAtTime(this.filter.frequency.value, now);
    this.filter.frequency.exponentialRampToValueAtTime(3200, now + 0.8);
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(0.12, now + 0.6);
    this.master.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);
    this.stop(3.3);
  }

  stop(after = 0.2) {
    const ctx = this.ctx;
    if (!ctx) return;
    const end = ctx.currentTime + after;
    if (after > 0.3 && this.master) {
      // resolve() has already scheduled the fade.
    } else if (this.master) {
      this.master.gain.cancelScheduledValues(ctx.currentTime);
      this.master.gain.setValueAtTime(this.master.gain.value, ctx.currentTime);
      this.master.gain.linearRampToValueAtTime(0, end);
    }
    this.voices.forEach(({ osc }) => {
      try {
        osc.stop(end + 0.05);
      } catch {
        // Already stopped.
      }
    });
    this.voices = [];
  }

  dispose() {
    this.stop(0);
    void this.ctx?.close();
    this.ctx = null;
  }
}
