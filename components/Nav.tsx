"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useBag } from "./Bag";
import { Mark } from "./Art";
import { BagIcon } from "./Icons";

export function Nav({ storeName }: { storeName: string }) {
  const [scrolled, setScrolled] = useState(false);
  const { count, setOpen } = useBag();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="nav" data-scrolled={scrolled}>
      <div className="nav__inner">
        <Link href="/" className="nav__brand" aria-label={`${storeName}, inicio`}>
          <Mark size={24} />
          <span>{storeName}</span>
        </Link>
        <nav className="nav__links" aria-label="Principal">
          <Link href="/#coleccion">Colección</Link>
          <Link href="/#tu-noche">Tu noche</Link>
          <Link href="/#como-pedir">Cómo pedir</Link>
          <Link href="/#preguntas">Preguntas</Link>
        </nav>
        <button className="nav__bag" onClick={() => setOpen(true)} aria-label={`Abrir la bolsa, ${count} productos`}>
          <BagIcon size={20} />
          {count > 0 ? <span className="nav__count">{count}</span> : null}
        </button>
      </div>
    </header>
  );
}
