import { canOrderStatus } from "@/lib/format";
import type { Category, Product } from "@/lib/types";
import { plateTints } from "./Art";
import { ChevronRight } from "./Icons";
import { ProductVisual } from "./ProductVisual";

/** Mosaicos grandes por categoría, como la portada de Apple. */
export function CategoryTiles({ categories, products }: { categories: Category[]; products: Product[] }) {
  const tiles = categories
    .map((c) => {
      const items = products.filter((p) => p.category === c.id);
      return { ...c, items, lead: items[0], ready: items.some((p) => canOrderStatus(p.status)) };
    })
    .filter((t) => t.lead);

  return (
    <section className="tiles" aria-label="Categorías">
      {tiles.map((t) => (
        <a key={t.id} href={`#coleccion-${t.id}`} className="tile plate" style={plateTints(t.lead!.colors[0]?.hex)} data-reveal>
          <span className="tile__copy">
            <span className="tile__name">{t.name}</span>
            <span className="tile__blurb">{t.ready ? t.blurb : "Muy pronto."}</span>
            <span className="link-arrow">
              {t.ready ? `Ver ${t.name.toLowerCase()}` : "Ver qué viene"} <ChevronRight size={16} />
            </span>
          </span>
          <span className="tile__art">
            <ProductVisual product={t.lead!} sizes="(max-width: 760px) 80vw, 40vw" />
          </span>
        </a>
      ))}
    </section>
  );
}
