"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { LogoVariant } from "@/lib/types";
import { useBag } from "./Bag";
import { Logo } from "./Art";
import { BagIcon } from "./Icons";
import { ModeToggle } from "./ModeToggle";

export function Nav({
  storeName,
  logo,
  modeToggle,
  links,
}: {
  storeName: string;
  logo: LogoVariant;
  modeToggle: boolean;
  links: { id: string; href: string; label: string }[];
}) {
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
          <Logo name={storeName} variant={logo} size={24} />
        </Link>
        <nav className="nav__links" aria-label="Principal">
          {links.map((l) => (
            <Link key={l.id} href={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="nav__end">
          {modeToggle ? <ModeToggle /> : null}
          <button className="nav__bag" onClick={() => setOpen(true)} aria-label={`Abrir la bolsa, ${count} productos`}>
            <BagIcon size={20} />
            {count > 0 ? <span className="nav__count">{count}</span> : null}
          </button>
        </div>
      </div>
    </header>
  );
}
