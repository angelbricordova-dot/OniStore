"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { canOrderStatus, money, statusLabel } from "@/lib/format";
import type { Category, Product, Settings } from "@/lib/types";
import { AddToBag } from "./Bag";
import { plateFor } from "./Art";
import { ProductVisual } from "./ProductVisual";

export function Catalog({
  products,
  categories,
  settings,
}: {
  products: Product[];
  categories: Category[];
  settings: Settings;
}) {
  const tabs = useMemo(
    () => [
      { id: "todo", name: "Todo", blurb: "Todo lo que tenemos para esta noche.", count: products.length },
      ...categories.map((c) => ({ ...c, count: products.filter((p) => p.category === c.id).length })),
    ],
    [products, categories],
  );
  const [active, setActive] = useState("todo");
  const current = tabs.find((t) => t.id === active) ?? tabs[0];
  const shown = active === "todo" ? products : products.filter((p) => p.category === active);

  return (
    <section className="chapter chapter--cream catalog" id="catalogo" aria-labelledby="catalog-title">
      <div className="catalog__head">
        <h2 id="catalog-title" className="h2" data-reveal>
          <span className="soft">Todo lo que hay</span>
          <br />
          para esta noche
        </h2>
        <p className="catalog__lede" data-reveal>
          Toca un producto para ver sus fotos, tallas y colores. Lo que añadas a la bolsa nos llega por WhatsApp en un
          solo mensaje.
        </p>
      </div>

      <div className="catalog__body">
        <div className="catalog__tabs" role="tablist" aria-label="Categorías">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={t.id === active}
              aria-controls="catalog-list"
              className="daytab"
              onClick={() => setActive(t.id)}
            >
              <span className="daytab__name">{t.name}</span>
              <span className="daytab__count">
                {t.count === 1 ? "1 producto" : `${t.count} productos`}
              </span>
            </button>
          ))}
        </div>

        <div id="catalog-list" role="tabpanel" aria-label={current.name}>
          <p className="catalog__blurb">{current.blurb}</p>
          {shown.length === 0 ? (
            <p className="catalog__empty">Muy pronto tendremos productos en esta categoría.</p>
          ) : (
            <ul className="bands">
              {shown.map((p) => {
                const simple = p.sizes.length === 0 && p.colors.length <= 1;
                return (
                  <li key={p.id} className="band" data-status={p.status}>
                    <Link href={`/producto/${p.slug}`} className="band__link">
                      <span className="band__thumb" style={{ "--plate": plateFor(p.colors[0]?.hex) } as React.CSSProperties}>
                        <ProductVisual product={p} sizes="120px" />
                      </span>
                      <span className="band__title">
                        <span className="band__name">{p.name}</span>
                        <span className="band__note">{p.note}</span>
                      </span>
                      <span className="band__swatches" aria-hidden="true">
                        {p.colors.slice(0, 4).map((c) => (
                          <span key={c.name} className="swatch" style={{ background: c.hex }} />
                        ))}
                      </span>
                      <span className="band__price">
                        {money(p.price, settings.currency)}
                        {p.compareAt ? <s>{money(p.compareAt, settings.currency)}</s> : null}
                        <span className="status" data-status={p.status}>
                          {statusLabel[p.status]}
                        </span>
                      </span>
                    </Link>
                    <span className="band__action">
                      {canOrderStatus(p.status) && simple ? (
                        <AddToBag
                          className="btn btn--dark btn--small"
                          product={{ ...p, image: p.images[0] }}
                          color={p.colors[0]}
                        >
                          Añadir
                        </AddToBag>
                      ) : (
                        <Link href={`/producto/${p.slug}`} className="btn btn--line btn--small" tabIndex={-1} aria-hidden="true">
                          {canOrderStatus(p.status) ? "Elegir talla" : "Ver"}
                        </Link>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
