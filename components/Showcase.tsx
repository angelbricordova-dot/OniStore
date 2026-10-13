"use client";

import Link from "next/link";
import { useState } from "react";
import { money, statusLabel, whatsappLink } from "@/lib/format";
import type { Product, Settings } from "@/lib/types";
import { plateFor } from "./Art";
import { ProductVisual } from "./ProductVisual";

export function Showcase({ product, settings }: { product: Product; settings: Settings }) {
  const [active, setActive] = useState(0);
  const color = product.colors[active];
  const ask = `¡Hola ${settings.storeName}! Me interesa la ${product.name}${color ? ` en ${color.name}` : ""}. ¿Qué tallas tienen disponibles?`;

  return (
    <section className="chapter chapter--plum showcase" id="destacado" aria-labelledby="showcase-title">
      <div className="showcase__plate" data-reveal>
        <div className="showcase__square" style={{ "--plate": plateFor(color?.hex) } as React.CSSProperties}>
          <ProductVisual product={product} colorHex={color?.hex} sizes="(max-width: 760px) 100vw, 46vw" />
          <span className="showcase__ring" aria-hidden="true" />
        </div>
      </div>
      <div className="showcase__text">
        {product.colors.length > 1 ? (
          <div className="tabs" role="tablist" aria-label="Colores" data-reveal>
            {product.colors.map((c, i) => (
              <button
                key={c.name}
                role="tab"
                aria-selected={i === active}
                className="tab"
                onClick={() => setActive(i)}
              >
                <span className="swatch" style={{ background: c.hex }} aria-hidden="true" />
                {c.name}
              </button>
            ))}
          </div>
        ) : (
          <span />
        )}
        <div className="showcase__copy" data-reveal>
          <h2 id="showcase-title" className="h2">
            {product.name}
          </h2>
          <p className="showcase__desc">{product.description}</p>
          <p className="showcase__price">
            {money(product.price, settings.currency)}
            {product.compareAt ? <s>{money(product.compareAt, settings.currency)}</s> : null}
            <span className="status" data-status={product.status}>
              {statusLabel[product.status]}
            </span>
          </p>
        </div>
        <div className="showcase__actions" data-reveal>
          <a className="cell cell--gold" href={whatsappLink(settings, ask)} target="_blank" rel="noopener">
            Preguntar por WhatsApp
          </a>
          <Link className="cell cell--tone" href={`/producto/${product.slug}`}>
            Ver tallas y detalles
          </Link>
        </div>
      </div>
    </section>
  );
}
