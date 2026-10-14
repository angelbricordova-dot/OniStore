"use client";

import Link from "next/link";
import { useState } from "react";
import { canOrderStatus, money, orderMessage, statusLabel, whatsappLink } from "@/lib/format";
import type { Product, Settings } from "@/lib/types";
import { AddToBag } from "./Bag";

/**
 * Elegir color y talla y comprar. Lo usan el inicio (versión compacta) y la ficha
 * del producto. El color es controlado desde afuera para que el piso de color
 * cambie con él.
 */
export function ProductPicker({
  product,
  settings,
  colorIdx,
  onColor,
  compact,
  headingLevel = 2,
}: {
  product: Product;
  settings: Settings;
  colorIdx: number;
  onColor: (i: number) => void;
  compact?: boolean;
  headingLevel?: 1 | 2;
}) {
  const [size, setSize] = useState<string | undefined>(product.sizes.length === 1 ? product.sizes[0] : undefined);
  const [tried, setTried] = useState(false);
  const color = product.colors[colorIdx];
  const orderable = canOrderStatus(product.status);
  const needsSize = product.sizes.length > 0 && !size;
  const Heading = headingLevel === 1 ? "h1" : "h2";

  const single = orderMessage(
    [{ name: product.name, price: product.price, qty: 1, size, color: color?.name }],
    settings,
  );
  const ask = `¡Hola ${settings.storeName}! Quiero saber más de ${product.name}${color ? ` en ${color.name}` : ""}.`;

  return (
    <div className={compact ? "picker picker--compact" : "picker"}>
      <div className="picker__head">
        <Heading className="picker__name">
          {compact ? <Link href={`/producto/${product.slug}`}>{product.name}</Link> : product.name}
        </Heading>
        <p className="picker__price">
          <span>{money(product.price, settings.currency)}</span>
          {product.compareAt ? <s>{money(product.compareAt, settings.currency)}</s> : null}
          {product.status !== "disponible" ? <span className="badge badge--inline">{statusLabel[product.status]}</span> : null}
        </p>
        {product.note ? <p className="picker__note">{product.note}</p> : null}
      </div>

      {!compact && product.description ? <p className="picker__desc">{product.description}</p> : null}

      {product.colors.length ? (
        <fieldset className="picker__field">
          <legend>
            Color. <span>{color?.name}</span>
          </legend>
          <div className="picker__options">
            {product.colors.map((c, i) => (
              <button
                key={c.name + i}
                type="button"
                className="swatch-btn"
                aria-pressed={i === colorIdx}
                aria-label={c.name}
                title={c.name}
                onClick={() => onColor(i)}
                style={{ "--swatch": c.hex } as React.CSSProperties}
              />
            ))}
          </div>
        </fieldset>
      ) : null}

      {product.sizes.length && orderable ? (
        <fieldset className="picker__field" data-error={tried && needsSize}>
          <legend>
            Talla. <span>{size ?? "Elige la tuya."}</span>
          </legend>
          <div className="picker__options">
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                className="size-btn"
                aria-pressed={s === size}
                onClick={() => {
                  setSize(s);
                  setTried(false);
                }}
              >
                {s}
              </button>
            ))}
          </div>
          {tried && needsSize ? (
            <p className="picker__error" role="alert">
              Elige una talla para seguir.
            </p>
          ) : null}
        </fieldset>
      ) : null}

      <div className="picker__actions">
        {orderable && needsSize ? (
          <>
            <button type="button" className="btn btn--primary" onClick={() => setTried(true)}>
              Añadir a la bolsa
            </button>
            <button type="button" className="btn btn--secondary" onClick={() => setTried(true)}>
              Pedir por WhatsApp
            </button>
          </>
        ) : orderable ? (
          <>
            <AddToBag
              product={{ ...product, image: product.images[0] }}
              size={size}
              color={color}
              className="btn btn--primary"
            />
            <a className="btn btn--secondary" href={whatsappLink(settings, single)} target="_blank" rel="noopener">
              Pedir por WhatsApp
            </a>
          </>
        ) : (
          <a className="btn btn--primary" href={whatsappLink(settings, ask)} target="_blank" rel="noopener">
            {product.status === "pronto" ? "Avísame cuando llegue" : "Preguntar por WhatsApp"}
          </a>
        )}
      </div>
    </div>
  );
}
