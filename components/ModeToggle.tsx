"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "./Icons";

type Mode = "claro" | "oscuro";
export const MODE_KEY = "onistore-modo";

export function ModeToggle() {
  const [mode, setMode] = useState<Mode | null>(null);

  useEffect(() => {
    const site = document.querySelector<HTMLElement>(".site");
    setMode(site?.dataset.modo === "oscuro" ? "oscuro" : "claro");
  }, []);

  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const site = document.querySelector<HTMLElement>(".site");
    if (!site) return;
    const next: Mode = site.dataset.modo === "oscuro" ? "claro" : "oscuro";
    const apply = () => {
      // Durante el cambio con círculo, los colores cambian de golpe (el círculo ya es la transición).
      site.dataset.instant = "";
      window.setTimeout(() => delete site.dataset.instant, 900);
      site.dataset.modo = next;
      site.dataset.tono = next;
      setMode(next);
      try {
        localStorage.setItem(MODE_KEY, next);
      } catch {
        /* sin almacenamiento: el modo dura solo esta visita */
      }
    };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    if (doc.startViewTransition && !reduce) {
      // El cambio se abre en círculo desde el botón.
      const r = e.currentTarget.getBoundingClientRect();
      document.documentElement.style.setProperty("--vt-x", `${r.left + r.width / 2}px`);
      document.documentElement.style.setProperty("--vt-y", `${r.top + r.height / 2}px`);
      doc.startViewTransition(apply);
    } else {
      apply();
    }
  };

  const label = mode === "oscuro" ? "Cambiar a modo día" : "Cambiar a modo noche";
  return (
    <button type="button" className="mode-toggle" onClick={toggle} aria-label={label} title={label}>
      <span className="mode-toggle__icon" data-mode={mode ?? "claro"}>
        <SunIcon size={19} className="mode-toggle__sun" />
        <MoonIcon size={18} className="mode-toggle__moon" />
      </span>
    </button>
  );
}
