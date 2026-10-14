"use client";

import { useEffect, useMemo, useState } from "react";
import type { Category, Product, Settings } from "@/lib/types";
import { Tile } from "./Tile";

export function Collection({
  products,
  categories,
  settings,
  title = "La colección.",
  lede = "",
}: {
  products: Product[];
  categories: Category[];
  settings: Settings;
  title?: string;
  lede?: string;
}) {
  const tabs = useMemo(
    () => [
      { id: "todo", name: "Todo", count: products.length },
      ...categories
        .map((c) => ({ id: c.id, name: c.name, count: products.filter((p) => p.category === c.id).length }))
        .filter((t) => t.count > 0),
    ],
    [products, categories],
  );
  const [active, setActive] = useState("todo");

  // Los mosaicos de categorías enlazan a #coleccion-<categoría>.
  useEffect(() => {
    const read = () => {
      const m = window.location.hash.match(/^#coleccion-(.+)$/);
      if (m && tabs.some((t) => t.id === m[1])) {
        setActive(m[1]);
        document.getElementById("coleccion")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, [tabs]);

  const shown = active === "todo" ? products : products.filter((p) => p.category === active);

  return (
    <section className="collection" id="coleccion" aria-labelledby="collection-title">
      <div className="section-head">
        <h2 id="collection-title" className="title" data-reveal>
          {title}
        </h2>
        {lede ? (
          <p className="lede" data-reveal>
            {lede}
          </p>
        ) : null}
      </div>
      <div className="segmented" role="tablist" aria-label="Categorías" data-reveal>
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={t.id === active}
            aria-controls="collection-grid"
            onClick={() => setActive(t.id)}
          >
            {t.name}
          </button>
        ))}
      </div>
      <ul className="cards" id="collection-grid" role="tabpanel" key={active}>
        {shown.map((p, i) => (
          <li key={p.id} style={{ "--i": i } as React.CSSProperties}>
            <Tile product={p} settings={settings} />
          </li>
        ))}
      </ul>
    </section>
  );
}
