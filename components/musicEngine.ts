/**
 * Motor de la música lo-fi. Vive fuera de React para que la canción siga sonando
 * al pasar de una página a otra de la tienda.
 *
 * El volumen se maneja con Web Audio (GainNode) porque en iPhone el volumen
 * de un <audio> no se puede cambiar desde la página, y así los fundidos funcionan en todos lados.
 */

import { MUSIC_TRACKS } from "@/lib/types";

export type MusicState = { playing: boolean; track: number; loading: boolean };

export const MUSIC_KEY = "onistore-musica";
const TRACK_KEY = "onistore-musica-pista";
const VOLUME = 0.6;
const FADE_IN = 1.6;
const FADE_OUT = 0.6;

let state: MusicState = { playing: false, track: 0, loading: false };
const listeners = new Set<() => void>();

let audio: HTMLAudioElement | null = null;
let ctx: AudioContext | null = null;
let gain: GainNode | null = null;
let pauseTimer: ReturnType<typeof setTimeout> | undefined;
/** Mientras cambia de canción, el navegador avisa "pausa" aunque la música siga. */
let switching = false;

function set(patch: Partial<MusicState>) {
  state = { ...state, ...patch };
  listeners.forEach((fn) => fn());
}

function remember(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* sin almacenamiento: no pasa nada */
  }
}

export function savedPreference(): "on" | "off" | null {
  try {
    const v = localStorage.getItem(MUSIC_KEY);
    return v === "on" || v === "off" ? v : null;
  } catch {
    return null;
  }
}

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export const getState = () => state;
const SERVER_STATE: MusicState = { playing: false, track: 0, loading: false };
export const getServerState = () => SERVER_STATE;

function setup() {
  if (audio) return;
  try {
    const saved = Number(localStorage.getItem(TRACK_KEY));
    if (Number.isInteger(saved) && saved >= 0 && saved < MUSIC_TRACKS.length) state = { ...state, track: saved };
  } catch {
    /* ignorar */
  }
  audio = new Audio();
  audio.preload = "none";
  audio.src = MUSIC_TRACKS[state.track].src;
  audio.addEventListener("ended", () => next(true));
  audio.addEventListener("waiting", () => set({ loading: true }));
  audio.addEventListener("playing", () => {
    switching = false;
    set({ loading: false });
  });
  // Si el teléfono pausa la música (una llamada, otra app), el botón lo refleja.
  audio.addEventListener("pause", () => {
    if (!switching && state.playing && audio && !audio.ended) set({ playing: false, loading: false });
  });

  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (AC) {
    try {
      ctx = new AC();
      gain = ctx.createGain();
      gain.gain.value = 0;
      ctx.createMediaElementSource(audio).connect(gain);
      gain.connect(ctx.destination);
    } catch {
      ctx = null;
      gain = null;
    }
  }
}

function fadeTo(value: number, seconds: number) {
  if (gain && ctx) {
    const now = ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(value, now + seconds);
  } else if (audio) {
    audio.volume = value;
  }
}

/** Tiene que llamarse desde un toque o clic: los navegadores no dejan sonar música antes. */
export async function play() {
  setup();
  if (!audio) return;
  clearTimeout(pauseTimer);
  set({ playing: true, loading: audio.readyState < 3 });
  remember(MUSIC_KEY, "on");
  try {
    if (ctx?.state === "suspended") await ctx.resume();
    fadeTo(0, 0);
    await audio.play();
    fadeTo(VOLUME, FADE_IN);
  } catch {
    set({ playing: false, loading: false });
  }
}

export function pause() {
  if (!audio) return;
  set({ playing: false, loading: false });
  remember(MUSIC_KEY, "off");
  fadeTo(0, FADE_OUT);
  clearTimeout(pauseTimer);
  pauseTimer = setTimeout(() => audio?.pause(), FADE_OUT * 1000 + 50);
}

export function toggle() {
  if (state.playing) pause();
  else void play();
}

/** Pasa a la otra canción. Al terminar una, sigue la siguiente sin parar. */
export function next(auto = false) {
  setup();
  if (!audio) return;
  const track = (state.track + 1) % MUSIC_TRACKS.length;
  remember(TRACK_KEY, String(track));
  const keepPlaying = state.playing || auto;
  switching = keepPlaying;
  set({ track });
  audio.src = MUSIC_TRACKS[track].src;
  if (keepPlaying) {
    set({ playing: true });
    fadeTo(0, 0);
    audio
      .play()
      .then(() => fadeTo(VOLUME, auto ? 0.4 : FADE_IN))
      .catch(() => {
        switching = false;
        set({ playing: false, loading: false });
      });
  }
}
