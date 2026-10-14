import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductView } from "@/components/ProductView";
import { Tile } from "@/components/Tile";
import { SiteShell } from "@/components/SiteShell";
import { getCatalog } from "@/lib/catalog";
import { money } from "@/lib/format";

export const revalidate = 300;

export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { products, settings } = await getCatalog();
  const product = products.find((p) => p.slug === slug && !p.hidden);
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: product.name,
    description: `${product.note}. ${money(product.price, settings.currency)}. ${product.description}`.slice(0, 180),
    openGraph: product.images[0] ? { images: [{ url: product.images[0] }] } : undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const { products, categories, settings } = await getCatalog();
  const visible = products.filter((p) => !p.hidden);
  const product = visible.find((p) => p.slug === slug);
  if (!product) notFound();

  const categoryName = categories.find((c) => c.id === product.category)?.name ?? "";
  const related = [
    ...visible.filter((p) => p.id !== product.id && p.category === product.category),
    ...visible.filter((p) => p.id !== product.id && p.category !== product.category),
  ].slice(0, 3);

  return (
    <SiteShell settings={settings} solidNav>
      <div className="product-page">
        <nav className="crumbs" aria-label="Migas">
          <Link href="/#catalogo">Colección</Link>
          {categoryName ? (
            <>
              <span aria-hidden="true">/</span>
              <span>{categoryName}</span>
            </>
          ) : null}
        </nav>
        <ProductView product={product} settings={settings} />
      </div>
      {related.length ? (
        <section className="related" aria-labelledby="related-title">
          <h2 id="related-title" className="h2" data-reveal>
            Para acompañar
            <br />
            tu noche
          </h2>
          <ul className="grid grid--three">
            {related.map((p, i) => (
              <li key={p.id} style={{ "--i": i } as React.CSSProperties}>
                <Tile product={p} settings={settings} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </SiteShell>
  );
}
