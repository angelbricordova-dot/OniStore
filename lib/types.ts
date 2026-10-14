export type ArtKind = "pijama" | "antifaz" | "gomitas" | "almohada";

export type ProductStatus = "disponible" | "pocas" | "agotado" | "pronto";

export type ProductColor = { name: string; hex: string };

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  /** Precio anterior, si está en oferta. */
  compareAt?: number | null;
  /** Una línea corta que aparece bajo el nombre en el catálogo. */
  note: string;
  description: string;
  /** Detalles sueltos: tela, cuidados, medidas. Uno por línea. */
  details: string[];
  sizes: string[];
  colors: ProductColor[];
  images: string[];
  /** Dibujo que se muestra mientras el producto no tenga fotos. */
  art: ArtKind;
  status: ProductStatus;
  featured: boolean;
  hidden: boolean;
};

export type Category = {
  id: string;
  name: string;
  /** Frase corta que acompaña a la categoría. */
  blurb: string;
};

export type Faq = { q: string; a: string };

export type Palette = "luna" | "lavanda" | "durazno";
export type Mode = "claro" | "oscuro" | "auto";
export type LogoVariant = "creciente" | "fase" | "nube";

export const PALETTES: { id: Palette; name: string; hint: string; light: string[]; dark: string[] }[] = [
  { id: "luna", name: "Luna", hint: "Limpia, con magenta.", light: ["#FFFFFF", "#F5F5F7", "#A11370"], dark: ["#07071C", "#17173D", "#F06AB8"] },
  { id: "lavanda", name: "Lavanda", hint: "Lila suave, con ciruela.", light: ["#FBFAFD", "#F2EEF8", "#38125C"], dark: ["#0B0820", "#1E1840", "#C7A4F2"] },
  { id: "durazno", name: "Durazno", hint: "Cálida, con coral.", light: ["#FFFCFA", "#FFF2EB", "#C93A26"], dark: ["#0F0A1C", "#221934", "#FF9A7A"] },
];

export const LOGOS: { id: LogoVariant; name: string; hint: string }[] = [
  { id: "creciente", name: "Luna creciente", hint: "Una media luna limpia, con el degradado de la marca." },
  { id: "fase", name: "Fase lunar", hint: "La luna completa con su parte iluminada." },
  { id: "nube", name: "Luna y nube", hint: "Una media luna que descansa sobre una nube." },
];

export type SectionId = "categorias" | "coleccion" | "tuNoche" | "comoPedir" | "preguntas" | "cierre";

export const SECTIONS: { id: SectionId; name: string }[] = [
  { id: "categorias", name: "Categorías (mosaicos)" },
  { id: "coleccion", name: "La colección" },
  { id: "tuNoche", name: "Tu noche, en ciclos" },
  { id: "comoPedir", name: "Cómo pedir" },
  { id: "preguntas", name: "Preguntas frecuentes" },
  { id: "cierre", name: "Cierre con WhatsApp" },
];

export type HomeSection = { id: SectionId; visible: boolean };
export type Step = { title: string; text: string };

export type Appearance = {
  palette: Palette;
  /** Modo con el que abre la página. "auto" sigue al teléfono del visitante. */
  mode: Mode;
  /** Muestra el botón de día/noche en la barra. */
  modeToggle: boolean;
  /** Estrellas animadas de fondo en el modo noche. */
  stars: boolean;
  logo: LogoVariant;
};

export type HomeContent = {
  heroTitle: string;
  heroSubtitle: string;
  heroPrimary: string;
  heroSecondary: string;
  /** Muestra la pieza destacada debajo del título. */
  showFeatured: boolean;
  sections: HomeSection[];
  collectionTitle: string;
  collectionLede: string;
  plannerTitle: string;
  plannerLede: string;
  stepsTitle: string;
  steps: Step[];
  faqTitle: string;
  ctaTitle: string;
  ctaText: string;
  ctaButton: string;
};

export type Settings = {
  storeName: string;
  appearance: Appearance;
  home: HomeContent;
  /** Número con código de país, solo dígitos. Ej: 584121234567 */
  whatsapp: string;
  instagram: string;
  tiktok: string;
  currency: string;
  /** Aviso opcional que aparece arriba de la página. */
  announcement: string;
  /** Cómo se entregan los pedidos. */
  delivery: string;
  faq: Faq[];
};

export type Catalog = {
  version: number;
  updatedAt: string;
  settings: Settings;
  categories: Category[];
  products: Product[];
};
