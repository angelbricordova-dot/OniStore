"use client";

import { useState } from "react";
import { canOrderStatus, money, orderMessage, statusLabel, whatsappLink } from "@/lib/format";
import type { Product, Settings } from "@/lib/types";
import { AddToBag } from "./Bag";
import { plateFor } from "./Art";
import { ProductVisual } from "./ProductVisual";

export function ProductView({ product, settings }: { product: Product; settings: Settings }) {
  const [colorIdx, setColorIdx] = useState(0);
  const [size, setSize] = useState<string | undefined>(product.sizes.length === 1 ? product.sizes[0] : undefined);
  const [photo, setPhoto] = useState(0);
  const [tried, setTried] = useState(false);
  const color = product.colors[colorIdx];
  const orderable = canOrderStatus(product.status);
  const needsSize = product.sizes.length > 0 && !size;

  const single = orderMessage(
    [{ name: product.name, price: product.price, qty: 1, size, color: color?.name }],
    settings,
  );
  const ask = `¡Hola ${settings.storeName}! Quiero saber más de ${product.name}.`;
  const views = product.images.length ? product.images.map((_, i) => i) : [0];

  return (
    <article className="pv">
      <div className="pv__stage">
        <div className="pv__main" style={{ "--plate": plateFor(color?.hex) } as React.CSSProperties}>
          <ProductVisual product={product} colorHex={color?.hex} index={photo} priority sizes="(max-width: 860px) 100vw, 52vw" />
        </div>
        {product.images.length > 1 ? (
          <div className="pv__thumbs" role="tablist" aria-label="Fotos">
            {views.map((i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === photo}
                aria-label={`Foto ${i + 1}`}
                className="pv__thumb"
                onClick={() => setPhoto(i)}
              >
                <ProductVisual product={product} index={i} sizes="96px" />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="pv__info">
        <h1 className="h2">{product.name}</h1>
        <p className="pv__price">
          {money(product.price, settings.currency)}
          {product.compareAt ? <s>{money(product.compareAt, settings.currency)}</s> : null}
          <span className="status" data-status={product.status}>
            {statusLabel[product.status]}
          </span>
        </p>
        <p className="pv__desc">{product.description}</p>

        {product.colors.length ? (
          <fieldset className="pv__field">
            <legend>
              Color: <strong>{color?.name}</strong>
            </legend>
            <div className="pv__options">
              {product.colors.map((c, i) => (
                <button
                  key={c.name}
                  className="colorpick"
                  aria-pressed={i === colorIdx}
                  aria-label={c.name}
                  onClick={() => setColorIdx(i)}
                  style={{ background: c.hex }}
                />
              ))}
            </div>
          </fieldset>
        ) : null}

        {product.sizes.length ? (
          <fieldset className="pv__field" data-error={tried && needsSize}>
            <legend>
              Talla{size ? <>: <strong>{size}</strong></> : null}
            </legend>
            <div className="pv__options">
              {product.sizes.map((s) => (
                <button key={s} className="sizepick" aria-pressed={s === size} onClick={() => setSize(s)}>
                  {s}
                </button>
              ))}
            </div>
            {tried && needsSize ? <p className="pv__error">Elige una talla para continuar.</p> : null}
          </fieldset>
        ) : null}

        <div className="pv__actions">
          {orderable && needsSize ? (
            <>
              <button className="btn btn--gold btn--block" onClick={() => setTried(true)}>
                Añadir a la bolsa
              </button>
              <button className="btn btn--line-light btn--block" onClick={() => setTried(true)}>
                Pedir solo esta por WhatsApp
              </button>
            </>
          ) : orderable ? (
            <>
              <AddToBag
                product={{ ...product, image: product.images[0] }}
                size={size}
                color={color}
                className="btn btn--gold btn--block"
              />
              <a className="btn btn--line-light btn--block" href={whatsappLink(settings, single)} target="_blank" rel="noopener">
                Pedir solo esta por WhatsApp
              </a>
            </>
          ) : (
            <a className="btn btn--gold btn--block" href={whatsappLink(settings, ask)} target="_blank" rel="noopener">
              {product.status === "pronto" ? "Avísame cuando llegue" : "Preguntar por WhatsApp"}
            </a>
          )}
        </div>

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
