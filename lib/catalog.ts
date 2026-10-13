import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { del, get, list, put } from "@vercel/blob";
import { seedCatalog } from "./seed";
import type { Catalog, Category, Product, Settings } from "./types";

/**
 * Dónde vive el catálogo:
 * - "blob": Vercel Blob (producción). Se activa al conectar un Blob Store al proyecto.
 * - "file": un JSON en /data (solo en desarrollo, en tu computadora).
 * - "readonly": producción sin Blob conectado; se muestra el catálogo de ejemplo
 *   y el admin avisa que hay que conectar el almacenamiento.
 */
export type StorageMode = "blob" | "file" | "readonly";

const CATALOG_PATH = "data/catalog.json";
const VERSIONS_PREFIX = "data/versions/";
const MAX_VERSIONS = 30;

const LOCAL_FILE = path.join(process.cwd(), "data", "catalog.local.json");
const LOCAL_VERSIONS = path.join(process.cwd(), "data", "versions");

export function storageMode(): StorageMode {
  if (process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID) return "blob";
  if (process.env.NODE_ENV !== "production") return "file";
  return "readonly";
}

async function readBlobJson(pathname: string): Promise<unknown | null> {
  const result = await get(pathname, { access: "public", useCache: false });
  if (!result || !result.stream) return null;
  const text = await new Response(result.stream).text();
  return JSON.parse(text);
}

export async function getCatalog(): Promise<Catalog> {
  try {
    const mode = storageMode();
    if (mode === "blob") {
      const data = await readBlobJson(CATALOG_PATH);
      if (data) return normalizeCatalog(data);
    } else if (mode === "file") {
      const text = await fs.readFile(LOCAL_FILE, "utf8").catch(() => null);
      if (text) return normalizeCatalog(JSON.parse(text));
    }
  } catch (error) {
    console.error("[catalog] no se pudo leer el catálogo, uso el de ejemplo", error);
  }
  return normalizeCatalog(seedCatalog);
}

export type VersionInfo = { id: string; savedAt: string; size: number };

export async function saveCatalog(input: Catalog): Promise<Catalog> {
  const mode = storageMode();
  if (mode === "readonly") {
    throw new Error(
      "Falta conectar el almacenamiento. En Vercel: Storage → Create → Blob, conéctalo a este proyecto y vuelve a publicar.",
    );
  }
  const catalog = normalizeCatalog({
    ...input,
    version: (input.version ?? 0) + 1,
    updatedAt: new Date().toISOString(),
  });
  const body = JSON.stringify(catalog, null, 2);
  const stamp = catalog.updatedAt.replace(/[:.]/g, "-");

  if (mode === "blob") {
    await put(CATALOG_PATH, body, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      cacheControlMaxAge: 60,
    });
    await put(`${VERSIONS_PREFIX}${stamp}.json`, body, {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json",
    });
    await pruneBlobVersions();
  } else {
    await fs.mkdir(LOCAL_VERSIONS, { recursive: true });
    await fs.writeFile(LOCAL_FILE, body);
    await fs.writeFile(path.join(LOCAL_VERSIONS, `${stamp}.json`), body);
  }
  return catalog;
}

async function pruneBlobVersions() {
  const { blobs } = await list({ prefix: VERSIONS_PREFIX, limit: 1000 });
  const old = blobs
    .sort((a, b) => b.pathname.localeCompare(a.pathname))
    .slice(MAX_VERSIONS)
    .map((b) => b.url);
  if (old.length) await del(old);
}

export async function listVersions(): Promise<VersionInfo[]> {
  const mode = storageMode();
  if (mode === "blob") {
    const { blobs } = await list({ prefix: VERSIONS_PREFIX, limit: 1000 });
    return blobs
      .map((b) => ({
        id: b.pathname.slice(VERSIONS_PREFIX.length).replace(/\.json$/, ""),
        savedAt: b.uploadedAt.toISOString(),
        size: b.size,
      }))
      .sort((a, b) => b.id.localeCompare(a.id));
  }
  if (mode === "file") {
    const files = await fs.readdir(LOCAL_VERSIONS).catch(() => [] as string[]);
    const infos = await Promise.all(
      files
        .filter((f) => f.endsWith(".json"))
        .map(async (f) => {
          const stat = await fs.stat(path.join(LOCAL_VERSIONS, f));
          return { id: f.replace(/\.json$/, ""), savedAt: stat.mtime.toISOString(), size: stat.size };
        }),
    );
    return infos.sort((a, b) => b.id.localeCompare(a.id));
  }
  return [];
}

export async function readVersion(id: string): Promise<Catalog | null> {
  if (!/^[\w-]+$/.test(id)) return null;
  const mode = storageMode();
  if (mode === "blob") {
    const data = await readBlobJson(`${VERSIONS_PREFIX}${id}.json`);
    return data ? normalizeCatalog(data) : null;
  }
  if (mode === "file") {
    const text = await fs.readFile(path.join(LOCAL_VERSIONS, `${id}.json`), "utf8").catch(() => null);
    return text ? normalizeCatalog(JSON.parse(text)) : null;
  }
  return null;
}

/** Guarda una imagen subida desde el admin y devuelve su URL pública. */
export async function storeImage(file: File, folder: "products" | "site"): Promise<string> {
  const mode = storageMode();
  const ext = (file.type.split("/")[1] || "jpg").replace("jpeg", "jpg").replace(/[^a-z0-9]/g, "");
  const name = `${folder}/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  if (mode === "blob") {
    const blob = await put(name, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type,
    });
    return blob.url;
  }
  if (mode === "file") {
    const target = path.join(process.cwd(), "public", "uploads", name);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, Buffer.from(await file.arrayBuffer()));
    return `/uploads/${name}`;
  }
  throw new Error("Falta conectar el almacenamiento (Vercel Blob) para subir fotos.");
}

/* ---------- Normalización: tolera datos viejos o incompletos ---------- */

const str = (v: unknown, fallback = "") => (typeof v === "string" ? v : fallback);
const num = (v: unknown, fallback = 0) => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
};
const strList = (v: unknown) =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.trim() !== "") : [];

export function slugify(text: string) {
  return (
    text
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "producto"
  );
}

export function normalizeCatalog(raw: unknown): Catalog {
  const data = (raw ?? {}) as Partial<Catalog>;
  const s = (data.settings ?? {}) as Partial<Settings>;
  const seed = seedCatalog.settings;

  const settings: Settings = {
    storeName: str(s.storeName, seed.storeName) || seed.storeName,
    whatsapp: str(s.whatsapp).replace(/\D/g, ""),
    instagram: str(s.instagram),
    tiktok: str(s.tiktok),
    currency: str(s.currency, seed.currency) || "$",
    announcement: str(s.announcement),
    delivery: str(s.delivery, seed.delivery),
    aboutImage: str(s.aboutImage),
    faq: Array.isArray(s.faq)
      ? s.faq
          .map((f) => ({ q: str(f?.q).trim(), a: str(f?.a).trim() }))
          .filter((f) => f.q && f.a)
      : seed.faq,
  };

  const categories: Category[] = (Array.isArray(data.categories) ? data.categories : seedCatalog.categories)
    .map((c) => ({
      id: slugify(str(c?.id) || str(c?.name)),
      name: str(c?.name).trim(),
      blurb: str(c?.blurb).trim(),
    }))
    .filter((c) => c.name);

  const usedSlugs = new Set<string>();
  const products: Product[] = (Array.isArray(data.products) ? data.products : [])
    .map((p, i) => {
      const name = str(p?.name).trim() || `Producto ${i + 1}`;
      let slug = slugify(str(p?.slug) || name);
      while (usedSlugs.has(slug)) slug = `${slug}-${i + 1}`;
      usedSlugs.add(slug);
      const art = ["pijama", "antifaz", "gomitas", "almohada"].includes(p?.art as string)
        ? (p!.art as Product["art"])
        : "pijama";
      const status = ["disponible", "pocas", "agotado", "pronto"].includes(p?.status as string)
        ? (p!.status as Product["status"])
        : "disponible";
      const compareAt = num(p?.compareAt, 0);
      return {
        id: str(p?.id) || `p-${Date.now().toString(36)}-${i}`,
        slug,
        name,
        category: str(p?.category) || categories[0]?.id || "pijamas",
        price: Math.max(0, num(p?.price)),
        compareAt: compareAt > 0 ? compareAt : null,
        note: str(p?.note).trim(),
        description: str(p?.description).trim(),
        details: strList(p?.details),
        sizes: strList(p?.sizes),
        colors: Array.isArray(p?.colors)
          ? p!.colors
              .map((c) => ({
                name: str(c?.name).trim(),
                hex: /^#[0-9a-f]{6}$/i.test(str(c?.hex)) ? str(c?.hex) : "#38125C",
              }))
              .filter((c) => c.name)
          : [],
        images: strList(p?.images),
        art,
        status,
        featured: Boolean(p?.featured),
        hidden: Boolean(p?.hidden),
      };
    });

  return {
    version: num(data.version, 1),
    updatedAt: str(data.updatedAt, new Date().toISOString()),
    settings,
    categories,
    products,
  };
}
