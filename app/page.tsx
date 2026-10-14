import Image from "next/image";
import { Mark } from "@/components/Art";
import { CategoryTiles } from "@/components/CategoryTiles";
import { Collection } from "@/components/Collection";
import { Hero } from "@/components/Hero";
import { BagIcon, ChatIcon, GiftIcon, PlusIcon, ChevronRight } from "@/components/Icons";
import { NightPlanner } from "@/components/NightPlanner";
import { SiteShell } from "@/components/SiteShell";
import { getCatalog } from "@/lib/catalog";
import { whatsappLink } from "@/lib/format";

export const revalidate = 300;

export default async function Home() {
  const { settings, categories, products: all } = await getCatalog();
  const products = all.filter((p) => !p.hidden);
  const featured = products.find((p) => p.featured) ?? products[0];
  const hello = whatsappLink(settings, `¡Hola ${settings.storeName}! Quiero ayuda para escoger mi pijama.`);

  const steps = [
    {
      icon: <BagIcon size={26} />,
      title: "Escoge.",
      text: "Mira la colección y elige talla y color. Puedes juntar varias piezas en la bolsa.",
    },
    {
      icon: <ChatIcon size={26} />,
      title: "Escríbenos.",
      text: "Un toque y WhatsApp se abre con tu pedido ya escrito. Te confirmamos disponibilidad y total.",
    },
    {
      icon: <GiftIcon size={26} />,
      title: "Recibe.",
      text: settings.delivery,
    },
  ];

  return (
    <SiteShell settings={settings}>
      <Hero product={featured} settings={settings} />

      <section className="statement" aria-labelledby="statement-title">
        <h2 id="statement-title" className="statement__text" data-reveal>
          Oni viene de Oniris, la mujer detrás de esta tienda. <span>Y de onírico, lo que pertenece a los sueños.</span>
        </h2>
      </section>

      <CategoryTiles categories={categories} products={products} />

      <Collection products={products} categories={categories} settings={settings} />

      <NightPlanner />

      <section className="steps" id="como-pedir" aria-labelledby="steps-title">
        <div className="section-head">
          <h2 id="steps-title" className="title" data-reveal>
            Pedir es así de fácil.
          </h2>
        </div>
        <ol className="steps__list">
          {steps.map((s) => (
            <li key={s.title} className="steps__item" data-reveal>
              <span className="steps__icon">{s.icon}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="oniris" id="nosotros" aria-labelledby="oniris-title">
        <div className="oniris__portrait" data-reveal>
          {settings.aboutImage ? (
            <Image src={settings.aboutImage} alt="Oniris, fundadora de OniStore" fill sizes="220px" />
          ) : (
            <Mark size="56%" />
          )}
        </div>
        <h2 id="oniris-title" className="title" data-reveal>
          Te atiende Oniris.
        </h2>
        <p className="lede" data-reveal>
          Del otro lado del WhatsApp está Oniris o alguien de su familia. Te ayudamos con tallas, colores, regalos y
          pijamas para combinar en pareja o con tu hija.
        </p>
        <a className="link-arrow" href={hello} target="_blank" rel="noopener" data-reveal>
          Escribirle a Oniris <ChevronRight size={16} />
        </a>
      </section>

      {settings.faq.length ? (
        <section className="faq" id="preguntas" aria-labelledby="faq-title">
          <div className="section-head">
            <h2 id="faq-title" className="title" data-reveal>
              Preguntas frecuentes.
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
      ) : null}

      <section className="cta" aria-labelledby="cta-title">
        <h2 id="cta-title" className="title" data-reveal>
          Hablemos de tu noche.
        </h2>
        <p className="lede" data-reveal>
          Escríbenos y te ayudamos a escoger pijama, talla o un regalo para alguien que duerme poco.
        </p>
        <div className="cta__actions" data-reveal>
          <a className="btn btn--primary" href={hello} target="_blank" rel="noopener">
            Abrir WhatsApp
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
    </SiteShell>
  );
}
