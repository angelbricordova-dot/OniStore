import Link from "next/link";
import { canOrderStatus, money, statusLabel } from "@/lib/format";
import type { Product, Settings } from "@/lib/types";
import { plateSweep } from "./Art";
import { AddToBag } from "./Bag";
import { slats } from "@/lib/slats";
import { ProductVisual } from "./ProductVisual";

/** Un producto parado sobre su propio piso de color. */
export function Tile({ product: p, settings, lead }: { product: Product; settings: Settings; lead?: boolean }) {
  const simple = p.sizes.length === 0 && p.colors.length <= 1;
  const orderable = canOrderStatus(p.status);
  return (
    <article className="tile" data-status={p.status}>
      <Link href={`/producto/${p.slug}`} className="tile__link">
        <span className="tile__plate slats" style={slats(plateSweep(p.colors[0]?.hex))}>
          <ProductVisual
            product={p}
            sizes={lead ? "(max-width: 760px) 100vw, 50vw" : "(max-width: 760px) 50vw, 25vw"}
            className="tile__visual"
          />
          {p.status !== "disponible" ? (
            <span className="chip tile__chip" data-status={p.status}>
              {statusLabel[p.status]}
            </span>
          ) : null}
        </span>
        <span className="tile__info">
          <span className="tile__name">{p.name}</span>
          <span className="tile__price">
            {money(p.price, settings.currency)}
            {p.compareAt ? <s>{money(p.compareAt, settings.currency)}</s> : null}
          </span>
          {p.note ? <span className="tile__note">{p.note}</span> : null}
          {p.colors.length > 1 ? (
            <span className="tile__swatches" aria-label={`${p.colors.length} colores`}>
              {p.colors.slice(0, 5).map((c) => (
                <span key={c.name} style={{ background: c.hex }} />
              ))}
            </span>
          ) : null}
        </span>
      </Link>
      {orderable && simple ? (
        <AddToBag className="btn btn--small btn--gold tile__add" product={{ ...p, image: p.images[0] }} color={p.colors[0]}>
          Añadir
        </AddToBag>
      ) : null}
    </article>
  );
}
