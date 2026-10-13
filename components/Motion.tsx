"use client";

import Lenis from "lenis";
import { useEffect } from "react";

/**
 * Capa de movimiento de las páginas públicas:
 * - scroll suave (Lenis), salvo con "reducir movimiento";
 * - entradas escalonadas para todo lo marcado con data-reveal;
 * - variable --scroll (0 a 1) que usan el sol del inicio y el reloj de la noche.
 */
export function Motion() {
  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let lenis: Lenis | null = null;
    let frame = 0;
    if (!reduce) {
      lenis = new Lenis({ lerp: 0.11, anchors: { offset: -64 } });
      const raf = (time: number) => {
        lenis?.raf(time);
        frame = requestAnimationFrame(raf);
      };
      frame = requestAnimationFrame(raf);
    }

    const onScroll = () => {
      const max = root.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      root.style.setProperty("--scroll", progress.toFixed(4));
      root.style.setProperty("--hero", Math.min(1, window.scrollY / window.innerHeight).toFixed(4));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
    );
    const watch = () => {
      document.querySelectorAll("section, footer, article").forEach((section) => {
        section.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el, i) => {
          if (!el.style.getPropertyValue("--stagger")) el.style.setProperty("--stagger", String(Math.min(i, 6)));
        });
      });
      document.querySelectorAll("[data-reveal]:not(.is-in)").forEach((el) => observer.observe(el));
    };
    watch();
    const mutations = new MutationObserver(watch);
    mutations.observe(document.body, { childList: true, subtree: true });
    root.classList.add("motion-ready");

    const lockScroll = new MutationObserver(() => {
      if (root.classList.contains("bag-open")) lenis?.stop();
      else lenis?.start();
    });
    lockScroll.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => {
      cancelAnimationFrame(frame);
      lenis?.destroy();
      observer.disconnect();
      mutations.disconnect();
      lockScroll.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return null;
}

/** Se ejecuta antes de pintar: activa las entradas solo si hay JavaScript. */
export const motionBootScript = `
document.documentElement.classList.add('js');
setTimeout(function(){ if(!document.documentElement.classList.contains('motion-ready')) document.documentElement.classList.add('no-motion'); }, 3000);
`;
