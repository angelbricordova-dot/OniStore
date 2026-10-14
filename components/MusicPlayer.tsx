"use client";

import { useEffect, useSyncExternalStore } from "react";
import { MUSIC_TRACKS } from "@/lib/types";
import { NoteIcon, SkipIcon } from "./Icons";
import { getServerState, getState, next, play, savedPreference, subscribe, toggle } from "./musicEngine";

/** Botón de música lo-fi, siempre en la esquina. Suena solo cuando la persona lo pide. */
export function MusicPlayer({ autoplay }: { autoplay: boolean }) {
  const { playing, track, loading } = useSyncExternalStore(subscribe, getState, getServerState);

  // Si la persona la dejó sonando en otra visita (o la tienda lo pide), vuelve con el primer toque.
  useEffect(() => {
    const pref = savedPreference();
    if (getState().playing || pref === "off" || (pref !== "on" && !autoplay)) return;
    const start = (e: Event) => {
      if ((e.target as Element | null)?.closest?.(".music")) return;
      cleanup();
      void play();
    };
    const events = ["pointerdown", "keydown"] as const;
    const cleanup = () => events.forEach((t) => window.removeEventListener(t, start, true));
    events.forEach((t) => window.addEventListener(t, start, true));
    return cleanup;
  }, [autoplay]);

  const title = MUSIC_TRACKS[track]?.title ?? "Música";
  return (
    <div className="music" data-playing={playing} data-loading={loading}>
      <button
        type="button"
        className="music__main"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? `Pausar la música (${title})` : "Poner música lo-fi para dormir"}
      >
        <span className="music__icon" aria-hidden="true">
          <NoteIcon size={18} className="music__note" />
          <span className="music__bars">
            <i />
            <i />
            <i />
            <i />
          </span>
        </span>
        <span className="music__label">
          <span className="music__state">{playing ? "Sonando" : "Música para dormir"}</span>
          {playing ? <span className="music__title">{title}</span> : null}
        </span>
      </button>
      {playing ? (
        <button type="button" className="music__next" onClick={() => next()} aria-label="Siguiente canción" title="Siguiente canción">
          <SkipIcon size={16} />
        </button>
      ) : null}
    </div>
  );
}
