"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BagButton } from "./Bag";
import { Mark } from "./Art";

/** La página es una noche: el reloj avanza de 19:30 a 06:30 mientras bajas. */
function useNightClock() {
  const [time, setTime] = useState("19:30");
  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      const minutes = Math.round((19.5 * 60 + p * 11 * 60) / 5) * 5;
      const h = Math.floor(minutes / 60) % 24;
      const m = minutes % 60;
      setTime(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return time;
}

export function Nav({ solid = false, storeName }: { solid?: boolean; storeName: string }) {
  const [scrolled, setScrolled] = useState(solid);
  const time = useNightClock();

  useEffect(() => {
    if (solid) return;
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.82);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [solid]);

  return (
    <header className="nav" data-solid={scrolled || solid}>
      <Link href="/" className="nav__brand" aria-label={`${storeName}, inicio`}>
        <Mark size={34} />
        <span className="wordmark">{storeName}</span>
      </Link>
      <nav className="nav__links" aria-label="Principal">
        <Link href="/#catalogo">Catálogo</Link>
        <Link href="/#suenometro">Calculadora de sueño</Link>
        <Link href="/#preguntas">Preguntas</Link>
      </nav>
      <div className="nav__end">
        <span className="nav__clock" aria-hidden="true" title="La hora de la noche en OniStore">
          {time}
        </span>
        <BagButton className="btn btn--nav" />
      </div>
    </header>
  );
}
