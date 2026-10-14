"use client";

import { useEffect } from "react";

/** Curva suave entre a y b (0 antes de a, 1 después de b). */
function ramp(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/** A partir de esta altura de la página el texto y las tarjetas pasan a colores de noche. */
const NIGHT_FROM = 0.33;

/**
 * En el modo día, la página atardece mientras se baja: el sol cae en línea recta,
 * el cielo pasa por el atardecer y al final queda de noche, con estrellas.
 * Solo cambia opacidades y una posición, así que no pesa al hacer scroll.
 */
export function DayCycle() {
  useEffect(() => {
    const site = document.querySelector<HTMLElement>(".site");
    const sky = site?.querySelector<HTMLElement>(".daysky");
    if (!site || !sky) return;
    const get = (sel: string) => sky.querySelector<HTMLElement>(sel);
    const dusk = get(".daysky__dusk");
    const sunset = get(".daysky__sunset");
    const night = get(".daysky__night");
    const sun = get(".daysky__sunpath");
    const warm = get(".daysky__sun-warm");
    const clouds = get(".daysky__clouds");
    const motes = get(".daysky__motes");

    let frame = 0;
    const update = () => {
      frame = 0;
      const day = site.dataset.modo !== "oscuro";
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = day && max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;

      if (dusk) dusk.style.opacity = ramp(0.04, 0.28, p).toFixed(3);
      if (sunset) sunset.style.opacity = ramp(0.28, 0.37, p).toFixed(3);
      if (night) night.style.opacity = ramp(0.36, 0.76, p).toFixed(3);
      // El sol baja derecho y a ritmo parejo: la misma distancia por cada tramo de scroll.
      if (sun) {
        sun.style.transform = `translate3d(0, ${(p * 80).toFixed(2)}vh, 0)`;
        sun.style.opacity = (1 - ramp(0.55, 0.75, p)).toFixed(3);
      }
      if (warm) warm.style.opacity = ramp(0.1, 0.45, p).toFixed(3);
      // Las nubes se van con la última luz: de noche taparían el texto claro.
      if (clouds) clouds.style.opacity = (1 - ramp(0.2, 0.32, p)).toFixed(3);
      if (motes) motes.style.opacity = (1 - ramp(0.3, 0.5, p)).toFixed(3);

      // El paso por el atardecer intenso es corto a propósito: es el único tramo de contraste medio.
      // Un pequeño margen evita que parpadee justo en el límite.
      const current = site.dataset.tono;
      const tone = !day ? "oscuro" : p >= NIGHT_FROM ? "oscuro" : p <= NIGHT_FROM - 0.03 ? "claro" : current || "claro";
      if (current !== tone) site.dataset.tono = tone;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const modeWatch = new MutationObserver(schedule);
    modeWatch.observe(site, { attributes: true, attributeFilter: ["data-modo"] });
    const sizeWatch = new ResizeObserver(schedule);
    sizeWatch.observe(document.body);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      modeWatch.disconnect();
      sizeWatch.disconnect();
    };
  }, []);
  return null;
}
