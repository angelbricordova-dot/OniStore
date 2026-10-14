import Link from "next/link";
import { canOrderStatus, money, statusLabel } from "@/lib/format";
import type { Product, Settings } from "@/lib/types";
import { plateTints } from "./Art";
import { AddToBag } from "./Bag";
import { ProductVisual } from "./ProductVisual";

/** Tarjeta de producto: foto o dibujo sobre un fondo del tono de la prenda. */
export function Tile({ product: p, settings }: { product: Product; settings: Settings; lead?: boolean }) {
  const simple = p.sizes.length === 0 && p.colors.length <= 1;
  const orderable = canOrderStatus(p.status);
  return (
    <article className="card" data-status={p.status}>
      <Link href={`/producto/${p.slug}`} className="card__link">
        <span className="card__plate plate" style={plateTints(p.colors[0]?.hex)}>
          <span className="card__art">
            <ProductVisual product={p} sizes="(max-width: 760px) 50vw, 33vw" />
          </span>
          {p.status !== "disponible" ? <span className="badge">{statusLabel[p.status]}</span> : null}
        </span>
        <span className="card__body">
          {p.colors.length > 1 ? (
            <span className="card__dots" aria-label={`${p.colors.length} colores`}>
              {p.colors.slice(0, 5).map((c) => (
                <span key={c.name} style={{ background: c.hex }} />
              ))}
            </span>
          ) : null}
          <span className="card__name">{p.name}</span>
          {p.note ? <span className="card__note">{p.note}</span> : null}
          <span className="card__price">
            {money(p.price, settings.currency)}
            {p.compareAt ? <s>{money(p.compareAt, settings.currency)}</s> : null}
          </span>
        </span>
      </Link>
      {orderable && simple ? (
        <AddToBag className="btn btn--primary btn--small card__add" product={{ ...p, image: p.images[0] }} color={p.colors[0]}>
          Añadir a la bolsa
        </AddToBag>
      ) : null}
    </article>
  );
}
