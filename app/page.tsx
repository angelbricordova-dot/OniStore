import Image from "next/image";
import { Catalog } from "@/components/Catalog";
import { GiftArt, ChatArt, Mark, PajamaArt, PillowArt, Stars } from "@/components/Art";
import { Showcase } from "@/components/Showcase";
import { SiteShell } from "@/components/SiteShell";
import { SleepCalculator } from "@/components/SleepCalculator";
import { getCatalog } from "@/lib/catalog";
import { whatsappLink } from "@/lib/format";

export const revalidate = 300;

export default async function Home() {
  const { settings, categories, products: all } = await getCatalog();
  const products = all.filter((p) => !p.hidden);
  const featured = products.find((p) => p.featured) ?? products[0];
  const hello = whatsappLink(settings, `¡Hola ${settings.storeName}! Quiero ayuda para elegir mi pijama.`);
  const title = ["Duerme", "bonito"];

  return (
    <SiteShell settings={settings}>
      {/* ---------- Atardecer: el título se refleja en el mar del sueño ---------- */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__sky" aria-hidden="true">
          <div className="hero__sun" />
        </div>
        <div className="hero__sea" aria-hidden="true">
          <div className="hero__reflection" />
          <Stars className="hero__stars" count={40} seed={3} />
        </div>
        <div className="hero__layer hero__layer--sky">
          <h1 id="hero-title" className="hero__title">
            {title.map((line, i) => (
              <span className="mline" key={line}>
                <span style={{ "--d": `${i * 110}ms` } as React.CSSProperties}>{line}</span>
              </span>
            ))}
          </h1>
        </div>
        <div className="hero__layer hero__layer--sea" aria-hidden="true">
          <p className="hero__title">
            {title.map((line, i) => (
              <span className="mline" key={line}>
                <span style={{ "--d": `${i * 110}ms` } as React.CSSProperties}>{line}</span>
              </span>
            ))}
          </p>
        </div>
        <div className="hero__foot">
          <p className="hero__lede">
            Pijamas suaves y pequeños rituales para dormir mejor. Elige aquí, pide por WhatsApp.
          </p>
          <a className="btn btn--gold" href="#catalogo">
            Ver el catálogo
          </a>
        </div>
      </section>

      {/* ---------- El nombre ---------- */}
      <section className="chapter chapter--ground intro" aria-labelledby="intro-title">
        <div className="tiles">
          <div className="tile tile--a" data-reveal>
            <h2 id="intro-title" className="display">
              Oni viene
              <br />
              de Oniris
            </h2>
          </div>
          <div className="tile tile--b" data-reveal aria-label="Entre siete y nueve horas de sueño">
            <span className="display" aria-hidden="true">
              7–9 h
            </span>
          </div>
          <div className="tile tile--c" data-reveal aria-hidden="true">
            <Stars className="tile__stars" count={26} seed={5} />
            <Mark size="62%" className="tile__mark" />
          </div>
          <div className="tile tile--text" data-reveal>
            <p className="statement">
              Oni viene de Oniris, la mujer que empezó esta tienda, y también de onírico: todo lo que pertenece a los
              sueños.
            </p>
            <p>
              Por eso no vendemos solo ropa para dormir. Escogemos cada pijama por cómo se siente a las tres de la
              mañana: telas que respiran, costuras que no molestan, cinturas que no aprietan. Y alrededor de la pijama,
              las cosas pequeñas que ayudan a que la noche salga bien: un antifaz que apaga la luz, una almohada que
              sostiene el cuello, unas gomitas para el ritual de antes de dormir. Un adulto necesita entre siete y nueve
              horas de sueño. Queremos que las tuyas sean buenas.
            </p>
          </div>
        </div>
      </section>

      {featured ? <Showcase product={featured} settings={settings} /> : null}

      <Catalog products={products} categories={categories} settings={settings} />

      <SleepCalculator />

      {/* ---------- Cómo pedir: los pasos crecen ---------- */}
      <section className="chapter chapter--magenta how" id="como-pedir" aria-labelledby="how-title">
        <div className="how__grid">
          <h2 id="how-title" className="h2 how__title" data-reveal>
            Pedir es así
            <br />
            de sencillo
          </h2>
          <figure className="how__step how__step--1" data-reveal>
            <div className="how__tile" style={{ background: "var(--coral)" }}>
              <PajamaArt color="#F7ECE1" className="how__art" />
            </div>
            <figcaption>
              <h3>Eliges</h3>
              <p>Mira el catálogo y añade a tu bolsa lo que te guste, con tu talla y tu color.</p>
            </figcaption>
          </figure>
          <figure className="how__step how__step--2" data-reveal>
            <div className="how__tile" style={{ background: "var(--peach)" }}>
              <ChatArt className="how__art" />
            </div>
            <figcaption>
              <h3>Nos escribes</h3>
              <p>Un toque y WhatsApp se abre con tu pedido ya escrito. Te confirmamos disponibilidad y total.</p>
            </figcaption>
          </figure>
          <figure className="how__step how__step--3" data-reveal>
            <div className="how__tile" style={{ background: "var(--gold)" }}>
              <GiftArt className="how__art" />
            </div>
            <figcaption>
              <h3>Te llega</h3>
              <p>{settings.delivery} Tú solo prepara la cama.</p>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ---------- Quiénes somos ---------- */}
      <section className="chapter chapter--ground about" id="nosotros" aria-labelledby="about-title">
        <div className="about__panel">
          <h2 id="about-title" className="h2 about__title" data-reveal>
            Hecho por Oniris,
            <br />
            para tus noches
          </h2>
          <div className="about__portrait" data-reveal>
            {settings.aboutImage ? (
              <Image src={settings.aboutImage} alt="Oniris, fundadora de OniStore" fill sizes="(max-width: 760px) 86vw, 38vw" />
            ) : (
              <div className="about__moon" aria-hidden="true">
                <PillowArt color="#F7ECE1" className="about__pillow" />
              </div>
            )}
          </div>
          <div className="about__blocks">
            <div data-reveal>
              <h3>Elegido a mano</h3>
              <p>
                Antes de que algo entre al catálogo, lo tocamos, lo lavamos y dormimos con él. Si no pasa la prueba de
                la noche, no lo vendemos.
              </p>
            </div>
            <div data-reveal>
              <h3>Te atiende una persona</h3>
              <p>
                Del otro lado del WhatsApp está Oniris o alguien de la familia. Te ayudamos con tallas, colores y
                regalos, sin apuro.
              </p>
            </div>
            <a className="btn btn--gold" href={hello} target="_blank" rel="noopener" data-reveal>
              Escríbenos
            </a>
          </div>
        </div>
      </section>

      {/* ---------- Preguntas: amanece ---------- */}
      {settings.faq.length ? (
        <section className="faq" id="preguntas" aria-labelledby="faq-title">
          <div className="faq__head">
            <h2 id="faq-title" className="display" data-reveal>
              Lo que nos
              <br />
              preguntan
            </h2>
          </div>
          {settings.faq.map((f) => (
            <div className="faq__band" key={f.q}>
              <h3 data-reveal>{f.q}</h3>
              <p data-reveal>{f.a}</p>
            </div>
          ))}
        </section>
      ) : null}

      {/* ---------- Cierre ---------- */}
      <section className="cta" aria-labelledby="cta-title">
        <div className="cta__flank cta__flank--left" aria-hidden="true">
          <PajamaArt color="#38125C" className="cta__art" />
        </div>
        <div className="cta__main" data-reveal>
          <h2 id="cta-title" className="h2">
            Hablemos de
            <br />
            tu noche
          </h2>
          <p>Escríbenos y te ayudamos a elegir pijama, talla o un regalo para alguien que duerme poco.</p>
          <a className="btn btn--dark" href={hello} target="_blank" rel="noopener">
            Abrir WhatsApp
          </a>
        </div>
        <div className="cta__flank cta__flank--right" aria-hidden="true" />
      </section>
    </SiteShell>
  );
}
