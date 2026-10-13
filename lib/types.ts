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

export type Settings = {
  storeName: string;
  /** Número con código de país, solo dígitos. Ej: 584121234567 */
  whatsapp: string;
  instagram: string;
  tiktok: string;
  currency: string;
  /** Aviso opcional que aparece arriba de la página. */
  announcement: string;
  /** Cómo se entregan los pedidos. */
  delivery: string;
  aboutImage: string;
  faq: Faq[];
};

export type Catalog = {
  version: number;
  updatedAt: string;
  settings: Settings;
  categories: Category[];
  products: Product[];
};
