"use client";

import { useState } from "react";
import type { Product, Settings } from "@/lib/types";
import { plateTints } from "./Art";
import { ProductPicker } from "./ProductPicker";
import { ProductVisual } from "./ProductVisual";

export function ProductView({ product, settings }: { product: Product; settings: Settings }) {
  const [colorIdx, setColorIdx] = useState(0);
  const [photo, setPhoto] = useState(0);
  const hex = product.colors[colorIdx]?.hex;

  return (
    <article className="pv">
      <div className="pv__stage">
        <div className="pv__main plate" style={plateTints(hex)} data-photo={product.images.length > 0 || undefined}>
          <span className="pv__art" key={`${hex}-${photo}`}>
            <ProductVisual product={product} colorHex={hex} index={photo} priority sizes="(max-width: 900px) 100vw, 58vw" />
          </span>
        </div>
        {product.images.length > 1 ? (
          <div className="pv__thumbs" role="tablist" aria-label="Fotos">
            {product.images.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === photo}
                aria-label={`Foto ${i + 1}`}
                className="pv__thumb"
                onClick={() => setPhoto(i)}
              >
                <ProductVisual product={product} index={i} sizes="80px" />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="pv__info">
        <ProductPicker product={product} settings={settings} colorIdx={colorIdx} onColor={setColorIdx} headingLevel={1} />
        {product.details.length ? (
          <ul className="pv__details">
            {product.details.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        ) : null}
        <p className="pv__delivery">{settings.delivery}</p>
      </div>
    </article>
  );
}
