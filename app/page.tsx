import Image from "next/image";
import { Mark } from "@/components/Art";
import { Collection } from "@/components/Collection";
import { HeroFloor } from "@/components/HeroFloor";
import { Lamellae } from "@/components/Lamellae";
import { NightPlanner } from "@/components/NightPlanner";
import { SiteShell } from "@/components/SiteShell";
import { getCatalog } from "@/lib/catalog";
import { DUSK_A, DUSK_B, NIGHT_A, NIGHT_B } from "@/lib/palette";
import { whatsappLink } from "@/lib/format";
import { slats } from "@/lib/slats";

export const revalidate = 300;

const STEPS = [
  {
    word: "Eliges",
    text: "Mira la colección, toca la pijama que te guste y escoge talla y color. Puedes juntar varias en la bolsa.",
  },
  {
    word: "Nos escribes",
    text: "Un toque y WhatsApp se abre con tu pedido ya escrito. Te confirmamos disponibilidad, total y forma de pago.",
  },
  {
    word: "Duermes",
    text: "",
  },
];

export default async function Home() {
  const { settings, categories, products: all } = await getCatalog();
  const products = all.filter((p) => !p.hidden);
  const featured = products.find((p) => p.featured) ?? products[0];
  const hello = whatsappLink(settings, `¡Hola ${settings.storeName}! Quiero ayuda para escoger mi pijama.`);

  return (
    <SiteShell settings={settings}>
      <HeroFloor product={featured} settings={settings} />

      {/* ---------- El nombre ---------- */}
      <section className="name" aria-labelledby="name-title">
        <h2 id="name-title" className="name__title" data-reveal>
          Oni viene de Oniris, la mujer detrás de esta tienda. Y de onírico: lo
          que pertenece a los sueños.
        </h2>
        <div className="name__body" data-reveal>
          <p>
            Por eso aquí no hay ropa cualquiera. Cada pijama se escoge pensando en cómo se siente a las tres de la
            mañana: telas que respiran, costuras que no molestan, cinturas que no aprietan.
          </p>
          <p>
            Y alrededor de la pijama, lo pequeño que ayuda a que la noche salga bien: un antifaz, una almohada que
            sostiene el cuello, un ritual antes de acostarte. Para ti, para tu hija, o para combinar en pareja.
          </p>
        </div>
      </section>

      <div className="band" aria-hidden="true">
        <Lamellae className="band__canvas" faceA={DUSK_A} faceB={NIGHT_B} slat={8} wave={0.18} />
      </div>

      <Collection products={products} categories={categories} settings={settings} />

      <div className="band band--tall" aria-hidden="true">
        <Lamellae className="band__canvas" faceA={NIGHT_A} faceB={NIGHT_B} slat={9} wave={0.2} />
      </div>

      <NightPlanner />

      {/* ---------- Cómo pedir ---------- */}
      <section className="steps" id="como-pedir" aria-labelledby="steps-title">
        <h2 id="steps-title" className="sr-only">
          Cómo pedir
        </h2>
        <ol className="steps__list">
          {STEPS.map((s, i) => (
            <li key={s.word} className="steps__item" data-reveal>
              <span className="steps__floor slats" style={slats(i === 0 ? ["#A11370", "#F95C42"] : i === 1 ? ["#F95C42", "#FFBF42"] : ["#FFBF42", "#FFA385"])} aria-hidden="true" />
              <p className="steps__word kin">{s.word}.</p>
              <p className="steps__text">{s.text || `${settings.delivery} Tú solo prepara la cama.`}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- Oniris ---------- */}
      <section className="oniris" id="nosotros" aria-labelledby="oniris-title">
        <div className="oniris__field" data-reveal>
          <Lamellae className="oniris__canvas" faceA={DUSK_A} faceB={DUSK_B} slat={9} wave={0.12} />
          <div className="oniris__portrait">
            {settings.aboutImage ? (
              <Image src={settings.aboutImage} alt="Oniris, fundadora de OniStore" fill sizes="(max-width: 900px) 70vw, 30vw" />
            ) : (
              <Mark size="58%" className="oniris__mark" />
            )}
          </div>
        </div>
        <div className="oniris__text">
          <h2 id="oniris-title" className="h2" data-reveal>
            Te atiende
            <br />
            Oniris
          </h2>
          <p data-reveal>
            Del otro lado del WhatsApp está Oniris o alguien de la familia. Te ayudamos con tallas, colores, regalos y
            pijamas para combinar, sin apuro.
          </p>
          <p data-reveal>
            Cada cosa que ves aquí la escogió ella pensando en una sola pregunta: ¿esto ayuda a dormir mejor?
          </p>
          <a className="btn btn--gold" href={hello} target="_blank" rel="noopener" data-reveal>
            Escribirle a Oniris
          </a>
        </div>
      </section>

      {/* ---------- Preguntas ---------- */}
      {settings.faq.length ? (
        <section className="faq" id="preguntas" aria-labelledby="faq-title">
          <h2 id="faq-title" className="h2 faq__title" data-reveal>
            Lo que
            <br />
            nos preguntan
          </h2>
          <div className="faq__list">
            {settings.faq.map((f, i) => (
              <details key={f.q} className="faq__item" open={i === 0}>
                <summary>
                  <span>{f.q}</span>
                  <span className="faq__icon" aria-hidden="true" />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      ) : null}
    </SiteShell>
  );
}
