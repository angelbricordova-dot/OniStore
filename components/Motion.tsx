"use client";

import { useEffect } from "react";

/** Apariciones suaves al hacer scroll. Sin JavaScript, todo se ve igual. */
export function Motion() {
  useEffect(() => {
    const root = document.documentElement;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 },
    );
    const watch = () => {
      document.querySelectorAll("section, footer, article").forEach((section) => {
        section.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el, i) => {
          if (!el.style.getPropertyValue("--stagger")) el.style.setProperty("--stagger", String(Math.min(i, 5)));
        });
      });
      document.querySelectorAll("[data-reveal]:not(.is-in)").forEach((el) => observer.observe(el));
    };
    watch();
    const mutations = new MutationObserver(watch);
    mutations.observe(document.body, { childList: true, subtree: true });
    root.classList.add("motion-ready");
    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, []);
  return null;
}

/** Se ejecuta antes de pintar: activa las apariciones solo si hay JavaScript. */
export const motionBootScript = `
document.documentElement.classList.add('js');
setTimeout(function(){ if(!document.documentElement.classList.contains('motion-ready')) document.documentElement.classList.add('no-motion'); }, 3000);
`;
