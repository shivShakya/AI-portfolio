// Tiny shared state for the avatar's spoken reply, so the mic (Stt) can tell when the
// avatar is talking and duck, pause or stop it when the visitor interrupts.
type Listener = (speaking: boolean) => void;

let current: HTMLAudioElement | null = null;
let lastEndedAt = 0; // when the avatar last stopped talking
const listeners = new Set<Listener>();
const emit = (speaking: boolean) => listeners.forEach((l) => l(speaking));

export const voiceBus = {
  /** Register a reply that is about to play. Stops any previous one. */
  play(audio: HTMLAudioElement) {
    voiceBus.stop();
    current = audio;
    const done = () => {
      if (current === audio) {
        current = null;
        lastEndedAt = Date.now();
        emit(false);
      }
    };
    audio.addEventListener("playing", () => current === audio && emit(true));
    audio.addEventListener("ended", done);
    audio.addEventListener("error", done);
  },

  /** Milliseconds since the avatar last finished speaking (Infinity if it never has). */
  sinceLastSpoke: () => (lastEndedAt ? Date.now() - lastEndedAt : Infinity),

  /** The reply currently loaded (playing or paused), if any. */
  current: () => current,

  /** Stop and forget the current reply. */
  stop() {
    if (!current) return;
    const audio = current;
    current = null;
    lastEndedAt = Date.now();
    audio.pause();
    emit(false);
  },

  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
