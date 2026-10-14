import type { Appearance, HomeContent, SectionId } from "./types";

export const DEFAULT_APPEARANCE: Appearance = {
  palette: "luna",
  mode: "claro",
  modeToggle: true,
  stars: true,
  daySky: true,
  logo: "creciente",
  music: true,
  musicAutoplay: false,
};

export const DEFAULT_HOME: HomeContent = {
  heroTitle: "Duerme bonito.",
  heroSubtitle: "Pijamas suaves y pequeños rituales para dormir mejor.",
  heroPrimary: "Ver la colección",
  heroSecondary: "Pedir por WhatsApp",
  showFeatured: false,
  sections: [
    { id: "categorias", visible: true },
    { id: "coleccion", visible: true },
    { id: "tuNoche", visible: true },
    { id: "comoPedir", visible: true },
    { id: "preguntas", visible: true },
    { id: "cierre", visible: true },
  ],
  collectionTitle: "La colección.",
  collectionLede: "Toca cualquier pieza para ver sus colores y tallas.",
  plannerTitle: "Tu noche, en ciclos.",
  plannerLede:
    "Dormimos en ciclos de unos 90 minutos. Despertar cuando uno termina, y no a la mitad, es la diferencia entre levantarte liviano o arrastrando la mañana.",
  stepsTitle: "Pedir es así de fácil.",
  steps: [
    { title: "Escoge.", text: "Mira la colección y elige talla y color. Puedes juntar varias piezas en la bolsa." },
    {
      title: "Escríbenos.",
      text: "Un toque y WhatsApp se abre con tu pedido ya escrito. Te confirmamos disponibilidad y total.",
    },
    { title: "Recibe.", text: "Coordinamos la entrega o el envío contigo por WhatsApp, según tu zona." },
  ],
  faqTitle: "Preguntas frecuentes.",
  ctaTitle: "Hablemos de tu noche.",
  ctaText: "Escríbenos y te ayudamos a escoger pijama, talla o un regalo para alguien que duerme poco.",
  ctaButton: "Abrir WhatsApp",
};

/** Enlaces del menú; cada uno solo aparece si su sección está visible en el inicio. */
export const SECTION_LINKS: { id: SectionId; href: string; label: string }[] = [
  { id: "coleccion", href: "/#coleccion", label: "Colección" },
  { id: "tuNoche", href: "/#tu-noche", label: "Tu noche" },
  { id: "comoPedir", href: "/#como-pedir", label: "Cómo pedir" },
  { id: "preguntas", href: "/#preguntas", label: "Preguntas" },
];

export function sectionLinks(home: HomeContent) {
  const on = new Set(home.sections.filter((s) => s.visible).map((s) => s.id));
  return SECTION_LINKS.filter((l) => on.has(l.id));
}
