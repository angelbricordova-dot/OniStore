"use client";

import { useMemo, useState } from "react";
import type { Category, Product, Settings } from "@/lib/types";
import { Tile } from "./Tile";

export function Collection({
  products,
  categories,
  settings,
}: {
  products: Product[];
  categories: Category[];
  settings: Settings;
}) {
  const tabs = useMemo(
    () =>
      [
        { id: "todo", name: "Todo", blurb: "Todo lo que hay para esta noche.", count: products.length },
        ...categories.map((c) => ({ ...c, count: products.filter((p) => p.category === c.id).length })),
      ].filter((t) => t.id === "todo" || t.count > 0 || categories.length <= 4),
    [products, categories],
  );
  const [active, setActive] = useState("todo");
  const current = tabs.find((t) => t.id === active) ?? tabs[0];
  const shown = active === "todo" ? products : products.filter((p) => p.category === active);

  return (
    <section className="collection" id="catalogo" aria-labelledby="collection-title">
      <header className="collection__head">
        <h2 id="collection-title" className="h2" data-reveal>
          La colección
        </h2>
        <p className="collection__blurb" data-reveal aria-live="polite">
          {current.blurb || "Escoge, toca y pide por WhatsApp."}
        </p>
        <div className="tabs" role="tablist" aria-label="Categorías" data-reveal>
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={t.id === active}
              aria-controls="collection-grid"
              className="tab"
              onClick={() => setActive(t.id)}
            >
              {t.name}
              <span className="tab__count">{t.count}</span>
            </button>
          ))}
        </div>
      </header>

      {shown.length ? (
        <ul className="grid" id="collection-grid" role="tabpanel" aria-label={current.name} key={active}>
          {shown.map((p, i) => (
            <li key={p.id} className={i === 0 && active === "todo" ? "grid__lead" : undefined} style={{ "--i": i } as React.CSSProperties}>
              <Tile product={p} settings={settings} lead={i === 0 && active === "todo"} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="collection__empty">Muy pronto llegan productos a esta categoría.</p>
      )}
    </section>
  );
}
