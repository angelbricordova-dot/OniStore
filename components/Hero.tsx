"use client";

import Link from "next/link";
import { useState } from "react";
import { money, whatsappLink } from "@/lib/format";
import type { Product, Settings } from "@/lib/types";
import { plateTints } from "./Art";
import { ChevronRight } from "./Icons";
import { ProductVisual } from "./ProductVisual";

export function Hero({ product, settings }: { product?: Product; settings: Settings }) {
  const home = settings.home;
  const [colorIdx, setColorIdx] = useState(0);
  const color = product?.colors[colorIdx];
  const hello = whatsappLink(settings, `¡Hola ${settings.storeName}! Quiero ayuda para escoger mi pijama.`);

  return (
    <section className="hero" aria-labelledby="hero-title" data-featured={Boolean(product)}>
      <div className="hero__glow" aria-hidden="true" />
      <div className="hero__copy">
        <h1 id="hero-title" className="hero__title">
          {home.heroTitle}
        </h1>
        <p className="hero__sub">{home.heroSubtitle}</p>
        <div className="hero__actions">
          <a className="btn btn--primary" href="#coleccion">
            {home.heroPrimary}
          </a>
          <a className="link-arrow" href={hello} target="_blank" rel="noopener">
            {home.heroSecondary} <ChevronRight size={16} />
          </a>
        </div>
      </div>

      {product ? (
        <div className="hero__stage">
          <Link href={`/producto/${product.slug}`} className="hero__plate plate" style={plateTints(color?.hex)} aria-label={`Ver ${product.name}`}>
            <span className="hero__art" key={color?.hex ?? "x"}>
              <ProductVisual product={product} colorHex={color?.hex} priority sizes="(max-width: 760px) 90vw, 720px" />
            </span>
          </Link>
          <div className="hero__meta">
            {product.colors.length > 1 ? (
              <div className="swatches" role="radiogroup" aria-label="Colores">
                {product.colors.map((c, i) => (
                  <button
                    key={c.name + i}
                    type="button"
                    role="radio"
                    aria-checked={i === colorIdx}
                    aria-label={c.name}
                    className="swatch"
                    style={{ "--swatch": c.hex } as React.CSSProperties}
                    onClick={() => setColorIdx(i)}
                  />
                ))}
              </div>
            ) : null}
            <p className="hero__product">
              <span>{product.name}</span>
              <span className="hero__price">
                {color ? `${color.name} · ` : ""}
                {money(product.price, settings.currency)}
              </span>
            </p>
            <Link href={`/producto/${product.slug}`} className="link-arrow">
              Elegir talla <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  );
}
