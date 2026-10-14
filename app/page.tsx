import { CategoryTiles } from "@/components/CategoryTiles";
import { Collection } from "@/components/Collection";
import { Hero } from "@/components/Hero";
import { BagIcon, ChatIcon, ChevronRight, GiftIcon, MoonIcon, PlusIcon } from "@/components/Icons";
import { NightPlanner } from "@/components/NightPlanner";
import { SiteShell } from "@/components/SiteShell";
import { getCatalog } from "@/lib/catalog";
import { whatsappLink } from "@/lib/format";
import type { SectionId } from "@/lib/types";

export const revalidate = 300;

const STEP_ICONS = [BagIcon, ChatIcon, GiftIcon, MoonIcon];

export default async function Home() {
  const { settings, categories, products: all } = await getCatalog();
  const home = settings.home;
  const products = all.filter((p) => !p.hidden);
  const featured = products.find((p) => p.featured) ?? products[0];
  const hello = whatsappLink(settings, `¡Hola ${settings.storeName}! Quiero ayuda para escoger mi pijama.`);

  const render: Record<SectionId, () => React.ReactNode> = {
    categorias: () => <CategoryTiles key="categorias" categories={categories} products={products} />,
    coleccion: () => (
      <Collection
        key="coleccion"
        products={products}
        categories={categories}
        settings={settings}
        title={home.collectionTitle}
        lede={home.collectionLede}
      />
    ),
    tuNoche: () => <NightPlanner key="tuNoche" title={home.plannerTitle} lede={home.plannerLede} />,
    comoPedir: () => (
      <section key="comoPedir" className="steps" id="como-pedir" aria-labelledby="steps-title">
        <div className="section-head">
          <h2 id="steps-title" className="title" data-reveal>
            {home.stepsTitle}
          </h2>
        </div>
        <ol className="steps__list" data-count={home.steps.length}>
          {home.steps.map((s, i) => {
            const Icon = STEP_ICONS[i % STEP_ICONS.length];
            return (
              <li key={i} className="steps__item" data-reveal>
                <span className="steps__icon">
                  <Icon size={26} />
                </span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            );
          })}
        </ol>
      </section>
    ),
    preguntas: () =>
      settings.faq.length ? (
        <section key="preguntas" className="faq" id="preguntas" aria-labelledby="faq-title">
          <div className="section-head">
            <h2 id="faq-title" className="title" data-reveal>
              {home.faqTitle}
            </h2>
          </div>
          <div className="faq__list" data-reveal>
            {settings.faq.map((f) => (
              <details key={f.q} className="faq__item">
                <summary>
                  <span>{f.q}</span>
                  <PlusIcon size={20} className="faq__icon" />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      ) : null,
    cierre: () => (
      <section key="cierre" className="cta" aria-labelledby="cta-title">
        <h2 id="cta-title" className="title" data-reveal>
          {home.ctaTitle}
        </h2>
        <p className="lede" data-reveal>
          {home.ctaText}
        </p>
        <div className="cta__actions" data-reveal>
          <a className="btn btn--primary" href={hello} target="_blank" rel="noopener">
            {home.ctaButton}
          </a>
          {settings.instagram ? (
            <a className="link-arrow" href={settings.instagram} target="_blank" rel="noopener">
              Instagram <ChevronRight size={16} />
            </a>
          ) : null}
          {settings.tiktok ? (
            <a className="link-arrow" href={settings.tiktok} target="_blank" rel="noopener">
              TikTok <ChevronRight size={16} />
            </a>
          ) : null}
        </div>
      </section>
    ),
  };

  return (
    <SiteShell settings={settings}>
      <Hero product={home.showFeatured ? featured : undefined} settings={settings} />
      {home.sections.filter((s) => s.visible).map((s) => render[s.id]())}
    </SiteShell>
  );
}
