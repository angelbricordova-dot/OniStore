"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Mark, ProductArt, plateFor } from "@/components/Art";
import { money, statusLabel } from "@/lib/format";
import {
  LOGOS,
  MUSIC_TRACKS,
  PALETTES,
  SECTIONS,
  type Appearance,
  type ArtKind,
  type Catalog,
  type Category,
  type Faq,
  type HomeContent,
  type Mode,
  type Product,
  type ProductStatus,
  type SectionId,
  type Settings,
} from "@/lib/types";
import { fetchVersions, logout, publishCatalog, restoreVersion } from "./actions";

type Storage = "blob" | "file" | "readonly";
type Tab = "productos" | "categorias" | "apariencia" | "inicio" | "tienda" | "historial";

const BRAND_COLORS = [
  { name: "Medianoche", hex: "#0A0A33" },
  { name: "Ciruela", hex: "#38125C" },
  { name: "Magenta", hex: "#A11370" },
  { name: "Coral", hex: "#F95C42" },
  { name: "Dorado", hex: "#FFBF42" },
  { name: "Durazno", hex: "#FFA385" },
  { name: "Crema", hex: "#F7ECE1" },
];

const ART_OPTIONS: { value: ArtKind; label: string }[] = [
  { value: "pijama", label: "Pijama" },
  { value: "antifaz", label: "Antifaz" },
  { value: "gomitas", label: "Gomitas" },
  { value: "almohada", label: "Almohada" },
];

const STATUS_OPTIONS: ProductStatus[] = ["disponible", "pocas", "agotado", "pronto"];

function slugify(text: string) {
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

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function move<T>(list: T[], index: number, delta: number) {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const copy = [...list];
  [copy[index], copy[target]] = [copy[target], copy[index]];
  return copy;
}

/** Hasta este peso la foto viaja tal cual y el servidor la optimiza una sola vez (mejor calidad). */
const SEND_AS_IS = 3.5 * 1024 * 1024;

/**
 * Solo si la foto es muy pesada se reduce primero en el teléfono, con calidad alta,
 * para no pasar el límite de subida. La compresión final la hace el servidor.
 */
async function shrinkImage(file: File, maxSide = 2400): Promise<File> {
  if (file.type === "image/gif") return file;
  if (file.size <= SEND_AS_IS && ["image/jpeg", "image/png", "image/webp"].includes(file.type)) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/webp", 0.92));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".webp", { type: "image/webp" });
  } catch {
    return file;
  }
}

async function uploadImage(file: File, folder: "products" | "site") {
  const small = await shrinkImage(file);
  const body = new FormData();
  body.append("file", small);
  body.append("folder", folder);
  const res = await fetch("/api/admin/upload", { method: "POST", body });
  const json = (await res.json().catch(() => ({}))) as { url?: string; bytes?: number; error?: string };
  if (!res.ok || !json.url) throw new Error(json.error || "No se pudo subir la foto.");
  return { url: json.url, before: file.size, after: json.bytes ?? small.size };
}

function formatBytes(n: number) {
  return n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1).replace(".", ",")} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;
}

/* ===================================================================== */

export function AdminApp({ initial, storage }: { initial: Catalog; storage: Storage }) {
  const [catalog, setCatalog] = useState<Catalog>(initial);
  const [saved, setSaved] = useState(() => JSON.stringify(initial));
  const [tab, setTab] = useState<Tab>("productos");
  const [toast, setToast] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const dirty = useMemo(() => JSON.stringify(catalog) !== saved, [catalog, saved]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), toast.kind === "ok" ? 3500 : 8000);
    return () => clearTimeout(t);
  }, [toast]);

  const publish = () =>
    startTransition(async () => {
      const result = await publishCatalog(catalog);
      if (result.ok) {
        setCatalog(result.data);
        setSaved(JSON.stringify(result.data));
        setToast({ kind: "ok", text: "¡Listo! Los cambios ya están en la tienda." });
      } else {
        setToast({ kind: "error", text: result.error });
      }
    });

  const replaceCatalog = (next: Catalog) => {
    setCatalog(next);
    setSaved(JSON.stringify(next));
  };

  const setSettings = (patch: Partial<Settings>) =>
    setCatalog((c) => ({ ...c, settings: { ...c.settings, ...patch } }));
  const setProducts = (fn: (p: Product[]) => Product[]) => setCatalog((c) => ({ ...c, products: fn(c.products) }));
  const setCategories = (fn: (c: Category[]) => Category[]) =>
    setCatalog((c) => ({ ...c, categories: fn(c.categories) }));

  return (
    <div className="admin">
      <header className="a-top">
        <div className="a-top__brand">
          <Mark size={36} />
          <div>
            <p className="a-top__title">{catalog.settings.storeName}</p>
            <p className="a-top__sub">Panel de la tienda</p>
          </div>
        </div>
        <div className="a-top__actions">
          <a className="a-btn a-btn--ghost" href="/" target="_blank" rel="noopener">
            Ver tienda
          </a>
          <form action={logout}>
            <button className="a-btn a-btn--ghost">Salir</button>
          </form>
        </div>
      </header>

      {storage !== "blob" ? (
        <div className={`a-banner ${storage === "readonly" ? "a-banner--warn" : ""}`}>
          {storage === "readonly" ? (
            <>
              <strong>Todavía no se pueden guardar cambios.</strong> Falta conectar el almacenamiento: en Vercel abre el
              proyecto → Storage → Create → Blob (acceso público) → Connect, y vuelve a publicar.
            </>
          ) : (
            <>Modo local: los cambios se guardan en tu computadora (carpeta data/). En Vercel se guardarán en Blob.</>
          )}
        </div>
      ) : null}

      <nav className="a-tabs" aria-label="Secciones del panel">
        {(
          [
            ["productos", `Productos (${catalog.products.length})`],
            ["categorias", "Categorías"],
            ["apariencia", "Apariencia"],
            ["inicio", "Inicio"],
            ["tienda", "Contacto y datos"],
            ["historial", "Historial"],
          ] as [Tab, string][]
        ).map(([id, label]) => (
          <button key={id} className="a-tab" aria-current={tab === id} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </nav>

      <main className="a-main">
        {tab === "productos" ? (
          <ProductsTab catalog={catalog} setProducts={setProducts} onError={(t) => setToast({ kind: "error", text: t })} />
        ) : null}
        {tab === "categorias" ? <CategoriesTab catalog={catalog} setCategories={setCategories} /> : null}
        {tab === "apariencia" ? <AppearanceTab settings={catalog.settings} setSettings={setSettings} /> : null}
        {tab === "inicio" ? (
          <HomeTab settings={catalog.settings} setSettings={setSettings} products={catalog.products} />
        ) : null}
        {tab === "tienda" ? <SettingsTab settings={catalog.settings} setSettings={setSettings} /> : null}
        {tab === "historial" ? (
          <HistoryTab
            dirty={dirty}
            onRestored={(c) => {
              replaceCatalog(c);
              setToast({ kind: "ok", text: "Versión restaurada y publicada." });
            }}
            onError={(t) => setToast({ kind: "error", text: t })}
          />
        ) : null}
      </main>

      <div className="a-savebar" data-dirty={dirty}>
        <p>
          {pending
            ? "Publicando…"
            : dirty
              ? "Tienes cambios sin publicar."
              : `Todo publicado · última vez ${new Date(catalog.updatedAt).toLocaleString("es", { dateStyle: "medium", timeStyle: "short" })}`}
        </p>
        <div className="a-savebar__actions">
          {dirty ? (
            <button className="a-btn a-btn--ghost" onClick={() => setCatalog(JSON.parse(saved))} disabled={pending}>
              Descartar
            </button>
          ) : null}
          <button className="a-btn a-btn--primary" onClick={publish} disabled={!dirty || pending || storage === "readonly"}>
            {pending ? "Publicando…" : "Publicar cambios"}
          </button>
        </div>
      </div>

      {toast ? (
        <div className={`a-toast a-toast--${toast.kind}`} role="status">
          {toast.text}
        </div>
      ) : null}
    </div>
  );
}

/* ===================== Productos ===================== */

function ProductsTab({
  catalog,
  setProducts,
  onError,
}: {
  catalog: Catalog;
  setProducts: (fn: (p: Product[]) => Product[]) => void;
  onError: (text: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState("todas");
  const product = catalog.products.find((p) => p.id === selected) ?? null;
  const editorRef = useRef<HTMLDivElement>(null);

  const open = (id: string) => {
    setSelected(id);
    requestAnimationFrame(() => editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const create = () => {
    const id = uid("p");
    const category = filter !== "todas" ? filter : catalog.categories[0]?.id ?? "pijamas";
    const fresh: Product = {
      id,
      slug: `nuevo-${id.slice(-5)}`,
      name: "Nuevo producto",
      category,
      price: 0,
      compareAt: null,
      note: "",
      description: "",
      details: [],
      sizes: category === "pijamas" ? ["S", "M", "L", "XL"] : [],
      colors: [],
      images: [],
      art: category === "antifaces" ? "antifaz" : category === "gomitas" ? "gomitas" : category === "almohadas" ? "almohada" : "pijama",
      status: "disponible",
      featured: false,
      hidden: true,
    };
    setProducts((list) => [fresh, ...list]);
    open(id);
  };

  const update = (patch: Partial<Product>) => {
    if (!product) return;
    setProducts((list) =>
      list.map((p) => {
        if (p.id === product.id) return { ...p, ...patch };
        // Solo un producto puede ser "la favorita".
        if (patch.featured) return { ...p, featured: false };
        return p;
      }),
    );
  };

  const remove = () => {
    if (!product) return;
    if (!confirm(`¿Borrar "${product.name}"? Si te equivocas, toca «Descartar» antes de publicar.`)) return;
    setProducts((list) => list.filter((p) => p.id !== product.id));
    setSelected(null);
  };

  const duplicate = () => {
    if (!product) return;
    const id = uid("p");
    setProducts((list) => {
      const i = list.findIndex((p) => p.id === product.id);
      const copy = { ...product, id, slug: `${product.slug}-copia`, name: `${product.name} (copia)`, featured: false, hidden: true };
      return [...list.slice(0, i + 1), copy, ...list.slice(i + 1)];
    });
    open(id);
  };

  const visible = catalog.products.filter((p) => filter === "todas" || p.category === filter);

  return (
    <div className="a-products" data-editing={Boolean(product)}>
      <section className="a-list" aria-label="Lista de productos">
        <div className="a-list__head">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filtrar por categoría">
            <option value="todas">Todas las categorías</option>
            {catalog.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button className="a-btn a-btn--primary" onClick={create}>
            + Nuevo
          </button>
        </div>
        <ul>
          {visible.map((p) => {
            const index = catalog.products.findIndex((x) => x.id === p.id);
            return (
              <li key={p.id} className="a-row" aria-current={p.id === selected}>
                <button className="a-row__main" onClick={() => open(p.id)}>
                  <span className="a-thumb" style={{ background: plateFor(p.colors[0]?.hex) }}>
                    {p.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.images[0]} alt="" />
                    ) : (
                      <ProductArt kind={p.art} color={p.colors[0]?.hex} />
                    )}
                  </span>
                  <span className="a-row__text">
                    <strong>{p.name}</strong>
                    <span>
                      {money(p.price, catalog.settings.currency)} · {statusLabel[p.status]}
                      {p.hidden ? " · Oculto" : ""}
                      {p.featured ? " · Favorita" : ""}
                    </span>
                  </span>
                </button>
                <span className="a-row__order">
                  <button
                    aria-label={`Subir ${p.name}`}
                    onClick={() => setProducts((l) => move(l, index, -1))}
                    disabled={index === 0}
                  >
                    ↑
                  </button>
                  <button
                    aria-label={`Bajar ${p.name}`}
                    onClick={() => setProducts((l) => move(l, index, 1))}
                    disabled={index === catalog.products.length - 1}
                  >
                    ↓
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
        {visible.length === 0 ? <p className="a-muted">No hay productos en esta categoría todavía.</p> : null}
      </section>

      <section className="a-editor" ref={editorRef} aria-label="Editar producto">
        {product ? (
          <ProductEditor
            key={product.id}
            product={product}
            categories={catalog.categories}
            currency={catalog.settings.currency}
            update={update}
            onClose={() => setSelected(null)}
            onRemove={remove}
            onDuplicate={duplicate}
            onError={onError}
          />
        ) : (
          <div className="a-empty">
            <Mark size={64} />
            <p>Elige un producto de la lista para editarlo, o crea uno nuevo.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="a-field">
      <span className="a-field__label">{label}</span>
      {children}
      {hint ? <span className="a-field__hint">{hint}</span> : null}
    </label>
  );
}

function ProductEditor({
  product,
  categories,
  currency,
  update,
  onClose,
  onRemove,
  onDuplicate,
  onError,
}: {
  product: Product;
  categories: Category[];
  currency: string;
  update: (patch: Partial<Product>) => void;
  onClose: () => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onError: (text: string) => void;
}) {
  const [uploading, setUploading] = useState(0);
  const [saved, setSaved] = useState<{ before: number; after: number } | null>(null);
  const [slugTouched, setSlugTouched] = useState(!product.slug.startsWith("nuevo-"));
  const [sizesText, setSizesText] = useState(product.sizes.join(", "));

  const onFiles = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return;
      const list = Array.from(files);
      setUploading((n) => n + list.length);
      const urls: string[] = [];
      let before = 0;
      let after = 0;
      for (const file of list) {
        try {
          const up = await uploadImage(file, "products");
          urls.push(up.url);
          before += up.before;
          after += up.after;
        } catch (error) {
          onError(error instanceof Error ? error.message : "No se pudo subir la foto.");
        } finally {
          setUploading((n) => n - 1);
        }
      }
      if (urls.length) {
        update({ images: [...product.images, ...urls] });
        setSaved({ before, after });
      }
    },
    [product.images, update, onError],
  );

  return (
    <div className="a-form">
      <div className="a-form__head">
        <button className="a-btn a-btn--ghost a-back" onClick={onClose}>
          ← Lista
        </button>
        <h2>{product.name || "Sin nombre"}</h2>
        <a className="a-link" href={`/producto/${product.slug}`} target="_blank" rel="noopener">
          Ver ficha publicada
        </a>
      </div>

      <div className="a-grid">
        <Field label="Nombre">
          <input
            value={product.name}
            onChange={(e) =>
              update(slugTouched ? { name: e.target.value } : { name: e.target.value, slug: slugify(e.target.value) })
            }
          />
        </Field>
        <Field label="Enlace" hint={`onistore…/producto/${product.slug}`}>
          <input
            value={product.slug}
            onChange={(e) => {
              setSlugTouched(true);
              update({ slug: slugify(e.target.value) });
            }}
          />
        </Field>
        <Field label="Categoría">
          <select value={product.category} onChange={(e) => update({ category: e.target.value })}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Estado">
          <select value={product.status} onChange={(e) => update({ status: e.target.value as ProductStatus })}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {statusLabel[s]}
              </option>
            ))}
          </select>
        </Field>
        <Field label={`Precio (${currency})`}>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.5"
            value={product.price || ""}
            onChange={(e) => update({ price: Number(e.target.value) || 0 })}
          />
        </Field>
        <Field label={`Precio antes (${currency})`} hint="Opcional. Si lo llenas, se muestra tachado como oferta.">
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.5"
            value={product.compareAt ?? ""}
            onChange={(e) => update({ compareAt: Number(e.target.value) || null })}
          />
        </Field>
      </div>

      <div className="a-checks">
        <label className="a-check">
          <input type="checkbox" checked={!product.hidden} onChange={(e) => update({ hidden: !e.target.checked })} />
          <span>Visible en la tienda</span>
        </label>
        <label className="a-check">
          <input type="checkbox" checked={product.featured} onChange={(e) => update({ featured: e.target.checked })} />
          <span>Es “la favorita de la casa” (sale en grande en el inicio)</span>
        </label>
      </div>

      <Field label="Línea corta" hint="Aparece bajo el nombre en el catálogo. Ej: Satén · camisa y pantalón largo">
        <input value={product.note} onChange={(e) => update({ note: e.target.value })} />
      </Field>
      <Field label="Descripción">
        <textarea rows={4} value={product.description} onChange={(e) => update({ description: e.target.value })} />
      </Field>
      <Field label="Detalles" hint="Uno por línea: tela, medidas, cuidados…">
        <textarea
          rows={3}
          value={product.details.join("\n")}
          onChange={(e) => update({ details: e.target.value.split("\n") })}
          onBlur={(e) => update({ details: e.target.value.split("\n").map((d) => d.trim()).filter(Boolean) })}
        />
      </Field>
      <Field label="Tallas" hint="Separadas por coma. Déjalo vacío si es talla única. Ej: S, M, L, XL">
        <input
          value={sizesText}
          onChange={(e) => {
            setSizesText(e.target.value);
            update({
              sizes: e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            });
          }}
        />
      </Field>

      <fieldset className="a-fieldset">
        <legend>Colores</legend>
        <ul className="a-colors">
          {product.colors.map((c, i) => (
            <li key={i}>
              <input
                type="color"
                value={c.hex}
                aria-label={`Color ${c.name}`}
                onChange={(e) =>
                  update({ colors: product.colors.map((x, j) => (j === i ? { ...x, hex: e.target.value } : x)) })
                }
              />
              <input
                value={c.name}
                aria-label="Nombre del color"
                onChange={(e) =>
                  update({ colors: product.colors.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })
                }
              />
              <button className="a-icon" aria-label="Subir color" onClick={() => update({ colors: move(product.colors, i, -1) })}>
                ↑
              </button>
              <button
                className="a-icon"
                aria-label={`Quitar ${c.name}`}
                onClick={() => update({ colors: product.colors.filter((_, j) => j !== i) })}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
        <div className="a-swatches">
          <span className="a-muted">Añadir:</span>
          {BRAND_COLORS.map((c) => (
            <button
              key={c.hex}
              className="a-swatch"
              style={{ background: c.hex }}
              title={c.name}
              aria-label={`Añadir ${c.name}`}
              onClick={() => update({ colors: [...product.colors, c] })}
            />
          ))}
          <button className="a-btn a-btn--ghost a-btn--small" onClick={() => update({ colors: [...product.colors, { name: "Nuevo color", hex: "#999999" }] })}>
            Otro color
          </button>
        </div>
      </fieldset>

      <fieldset className="a-fieldset">
        <legend>Fotos</legend>
        <p className="a-muted">
          La primera foto es la portada. Se ven mejor cuadradas o verticales, con buena luz. Sube las fotos tal como salen del
          teléfono: la tienda las comprime sola sin perder nitidez.
        </p>
        <ul className="a-photos">
          {product.images.map((src, i) => (
            <li key={src}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Foto ${i + 1}`} />
              <div className="a-photos__bar">
                <button className="a-icon" aria-label="Mover a la izquierda" onClick={() => update({ images: move(product.images, i, -1) })} disabled={i === 0}>
                  ←
                </button>
                <button
                  className="a-icon"
                  aria-label="Mover a la derecha"
                  onClick={() => update({ images: move(product.images, i, 1) })}
                  disabled={i === product.images.length - 1}
                >
                  →
                </button>
                <button
                  className="a-icon"
                  aria-label="Quitar foto"
                  onClick={() => update({ images: product.images.filter((_, j) => j !== i) })}
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
          <li className="a-photos__add">
            <label>
              <input type="file" accept="image/*" multiple onChange={(e) => { onFiles(e.target.files); e.target.value = ""; }} />
              <span>{uploading ? `Subiendo ${uploading}…` : "+ Subir fotos"}</span>
            </label>
          </li>
        </ul>
        {saved && saved.after < saved.before ? (
          <p className="a-saved" role="status">
            Fotos optimizadas: {formatBytes(saved.before)} → {formatBytes(saved.after)} (
            {Math.round((1 - saved.after / saved.before) * 100)}% más livianas).
          </p>
        ) : null}
        {product.images.length === 0 ? (
          <div className="a-artpick">
            <div className="a-artpick__preview" style={{ background: plateFor(product.colors[0]?.hex) }}>
              <ProductArt kind={product.art} color={product.colors[0]?.hex} />
            </div>
            <Field label="Mientras no haya fotos, mostrar este dibujo">
              <select value={product.art} onChange={(e) => update({ art: e.target.value as ArtKind })}>
                {ART_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        ) : null}
      </fieldset>

      <div className="a-form__danger">
        <button className="a-btn a-btn--ghost" onClick={onDuplicate}>
          Duplicar
        </button>
        <button className="a-btn a-btn--danger" onClick={onRemove}>
          Borrar producto
        </button>
      </div>
    </div>
  );
}

/* ===================== Categorías ===================== */

function CategoriesTab({
  catalog,
  setCategories,
}: {
  catalog: Catalog;
  setCategories: (fn: (c: Category[]) => Category[]) => void;
}) {
  const count = (id: string) => catalog.products.filter((p) => p.category === id).length;
  const [name, setName] = useState("");

  const add = () => {
    const clean = name.trim();
    if (!clean) return;
    let id = slugify(clean);
    while (catalog.categories.some((c) => c.id === id)) id = `${id}-2`;
    setCategories((list) => [...list, { id, name: clean, blurb: "" }]);
    setName("");
  };

  return (
    <div className="a-panel">
      <h2>Categorías</h2>
      <p className="a-muted">El orden de aquí es el orden de las pestañas del catálogo.</p>
      <ul className="a-cats">
        {catalog.categories.map((c, i) => (
          <li key={c.id}>
            <div className="a-grid">
              <Field label="Nombre">
                <input
                  value={c.name}
                  onChange={(e) => setCategories((l) => l.map((x) => (x.id === c.id ? { ...x, name: e.target.value } : x)))}
                />
              </Field>
              <Field label="Frase corta">
                <input
                  value={c.blurb}
                  onChange={(e) => setCategories((l) => l.map((x) => (x.id === c.id ? { ...x, blurb: e.target.value } : x)))}
                />
              </Field>
            </div>
            <div className="a-cats__bar">
              <span className="a-muted">{count(c.id)} productos</span>
              <button className="a-icon" aria-label="Subir" onClick={() => setCategories((l) => move(l, i, -1))} disabled={i === 0}>
                ↑
              </button>
              <button
                className="a-icon"
                aria-label="Bajar"
                onClick={() => setCategories((l) => move(l, i, 1))}
                disabled={i === catalog.categories.length - 1}
              >
                ↓
              </button>
              <button
                className="a-btn a-btn--ghost a-btn--small"
                disabled={count(c.id) > 0}
                title={count(c.id) > 0 ? "Mueve o borra sus productos primero" : undefined}
                onClick={() => setCategories((l) => l.filter((x) => x.id !== c.id))}
              >
                Borrar
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="a-inline">
        <input placeholder="Nueva categoría, ej: Batas" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} />
        <button className="a-btn a-btn--primary" onClick={add}>
          Añadir
        </button>
      </div>
    </div>
  );
}

/* ===================== Apariencia ===================== */

function AppearanceTab({ settings, setSettings }: { settings: Settings; setSettings: (patch: Partial<Settings>) => void }) {
  const a = settings.appearance;
  const set = (patch: Partial<Appearance>) => setSettings({ appearance: { ...a, ...patch } });
  const modes: { id: Mode; name: string; hint: string }[] = [
    { id: "claro", name: "Día", hint: "Fondo claro." },
    { id: "oscuro", name: "Noche", hint: "Fondo oscuro con estrellas." },
    { id: "auto", name: "Automático", hint: "Igual que el teléfono de cada persona." },
  ];
  return (
    <div className="a-panel">
      <h2>Paleta de colores</h2>
      <p className="a-muted">Cambia los colores de toda la tienda. Cada paleta tiene su versión de día y de noche.</p>
      <div className="a-themes" role="radiogroup" aria-label="Paleta de colores">
        {PALETTES.map((p) => (
          <div key={p.id} className="a-theme" data-on={a.palette === p.id}>
            <button type="button" role="radio" aria-checked={a.palette === p.id} className="a-theme__pick" onClick={() => set({ palette: p.id })}>
              <span className="a-theme__chips" aria-hidden="true">
                {p.light.map((c) => (
                  <span key={c} style={{ background: c }} />
                ))}
              </span>
              <span className="a-theme__chips" aria-hidden="true">
                {p.dark.map((c) => (
                  <span key={c} style={{ background: c }} />
                ))}
              </span>
              <strong>{p.name}</strong>
              <span className="a-muted">{p.hint}</span>
            </button>
            <span className="a-theme__links">
              <a className="a-link" href={`/?tema=${p.id}&modo=claro`} target="_blank" rel="noopener">
                Ver de día
              </a>
              <a className="a-link" href={`/?tema=${p.id}&modo=oscuro`} target="_blank" rel="noopener">
                Ver de noche
              </a>
            </span>
          </div>
        ))}
      </div>

      <h2>Día y noche</h2>
      <p className="a-muted">Con qué modo abre la tienda la primera vez. Cada visitante puede cambiarlo con el botón de la barra.</p>
      <div className="a-seg" role="radiogroup" aria-label="Modo inicial">
        {modes.map((m) => (
          <button key={m.id} type="button" role="radio" aria-checked={a.mode === m.id} onClick={() => set({ mode: m.id })}>
            <strong>{m.name}</strong>
            <span>{m.hint}</span>
          </button>
        ))}
      </div>
      <div className="a-checks">
        <label className="a-check">
          <input type="checkbox" checked={a.modeToggle} onChange={(e) => set({ modeToggle: e.target.checked })} />
          <span>Mostrar el botón de día/noche en la barra</span>
        </label>
        <label className="a-check">
          <input type="checkbox" checked={a.daySky} onChange={(e) => set({ daySky: e.target.checked })} />
          <span>Cielo en el modo día: sol, nubes que pasan y un atardecer al bajar por la página</span>
        </label>
        <label className="a-check">
          <input type="checkbox" checked={a.stars} onChange={(e) => set({ stars: e.target.checked })} />
          <span>Estrellas animadas de fondo en el modo noche</span>
        </label>
      </div>

      <h2>Música</h2>
      <p className="a-muted">
        Un botón en la esquina con música lo-fi para dormir ({MUSIC_TRACKS.map((t) => t.title).join(" y ")}). Cada
        visitante la prende o la apaga cuando quiera, y la página recuerda lo que eligió.
      </p>
      <div className="a-checks">
        <label className="a-check">
          <input type="checkbox" checked={a.music} onChange={(e) => set({ music: e.target.checked })} />
          <span>Mostrar el botón de música</span>
        </label>
        <label className="a-check" data-off={!a.music}>
          <input
            type="checkbox"
            checked={a.musicAutoplay}
            disabled={!a.music}
            onChange={(e) => set({ musicAutoplay: e.target.checked })}
          />
          <span>Que empiece a sonar sola con el primer toque en la página (antes de eso los navegadores no dejan)</span>
        </label>
      </div>
      <div className="a-tracks">
        {MUSIC_TRACKS.map((t) => (
          <figure key={t.src}>
            <figcaption>{t.title}</figcaption>
            <audio controls preload="none" src={t.src} />
          </figure>
        ))}
      </div>

      <h2>Logo</h2>
      <p className="a-muted">Mientras llega el logo definitivo, escoge una de estas propuestas.</p>
      <div className="a-logos" role="radiogroup" aria-label="Logo">
        {LOGOS.map((l) => (
          <button key={l.id} type="button" role="radio" aria-checked={a.logo === l.id} className="a-logo" onClick={() => set({ logo: l.id })}>
            <span className="a-logo__preview">
              <Mark size={64} variant={l.id} />
            </span>
            <strong>{l.name}</strong>
            <span className="a-muted">{l.hint}</span>
          </button>
        ))}
      </div>

      <h2>Nombre de la tienda</h2>
      <Field label="Nombre">
        <input value={settings.storeName} onChange={(e) => setSettings({ storeName: e.target.value })} />
      </Field>
    </div>
  );
}

/* ===================== Inicio ===================== */

function HomeTab({
  settings,
  setSettings,
  products,
}: {
  settings: Settings;
  setSettings: (patch: Partial<Settings>) => void;
  products: Product[];
}) {
  const h = settings.home;
  const set = (patch: Partial<HomeContent>) => setSettings({ home: { ...h, ...patch } });
  const featured = products.find((p) => p.featured) ?? products[0];
  const sectionName = (id: SectionId) => SECTIONS.find((x) => x.id === id)?.name ?? id;

  return (
    <div className="a-panel">
      <h2>Portada</h2>
      <Field label="Título grande">
        <input value={h.heroTitle} onChange={(e) => set({ heroTitle: e.target.value })} />
      </Field>
      <Field label="Frase debajo del título">
        <textarea rows={2} value={h.heroSubtitle} onChange={(e) => set({ heroSubtitle: e.target.value })} />
      </Field>
      <div className="a-grid">
        <Field label="Botón principal">
          <input value={h.heroPrimary} onChange={(e) => set({ heroPrimary: e.target.value })} />
        </Field>
        <Field label="Enlace de WhatsApp">
          <input value={h.heroSecondary} onChange={(e) => set({ heroSecondary: e.target.value })} />
        </Field>
      </div>
      <label className="a-check">
        <input type="checkbox" checked={h.showFeatured} onChange={(e) => set({ showFeatured: e.target.checked })} />
        <span>
          Mostrar la pieza favorita debajo del título{featured ? ` (ahora: ${featured.name})` : ""}. Se cambia en Productos.
        </span>
      </label>

      <h2>Secciones del inicio</h2>
      <p className="a-muted">Muestra, oculta y ordena las secciones. El orden de aquí es el orden de la página.</p>
      <ul className="a-sections">
        {h.sections.map((sec, i) => (
          <li key={sec.id} data-off={!sec.visible}>
            <label className="a-check">
              <input
                type="checkbox"
                checked={sec.visible}
                onChange={(e) =>
                  set({ sections: h.sections.map((x) => (x.id === sec.id ? { ...x, visible: e.target.checked } : x)) })
                }
              />
              <span>{sectionName(sec.id)}</span>
            </label>
            <span className="a-sections__order">
              <button className="a-icon" aria-label="Subir" disabled={i === 0} onClick={() => set({ sections: move(h.sections, i, -1) })}>
                ↑
              </button>
              <button
                className="a-icon"
                aria-label="Bajar"
                disabled={i === h.sections.length - 1}
                onClick={() => set({ sections: move(h.sections, i, 1) })}
              >
                ↓
              </button>
            </span>
          </li>
        ))}
      </ul>

      <h2>La colección</h2>
      <div className="a-grid">
        <Field label="Título">
          <input value={h.collectionTitle} onChange={(e) => set({ collectionTitle: e.target.value })} />
        </Field>
        <Field label="Frase">
          <input value={h.collectionLede} onChange={(e) => set({ collectionLede: e.target.value })} />
        </Field>
      </div>

      <h2>Tu noche, en ciclos</h2>
      <Field label="Título">
        <input value={h.plannerTitle} onChange={(e) => set({ plannerTitle: e.target.value })} />
      </Field>
      <Field label="Explicación">
        <textarea rows={3} value={h.plannerLede} onChange={(e) => set({ plannerLede: e.target.value })} />
      </Field>

      <h2>Cómo pedir</h2>
      <Field label="Título">
        <input value={h.stepsTitle} onChange={(e) => set({ stepsTitle: e.target.value })} />
      </Field>
      <ul className="a-faq">
        {h.steps.map((st, i) => (
          <li key={i}>
            <Field label={`Paso ${i + 1}`}>
              <input
                value={st.title}
                onChange={(e) => set({ steps: h.steps.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })}
              />
            </Field>
            <Field label="Texto">
              <textarea
                rows={2}
                value={st.text}
                onChange={(e) => set({ steps: h.steps.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)) })}
              />
            </Field>
            {h.steps.length > 1 ? (
              <div className="a-cats__bar">
                <button className="a-btn a-btn--ghost a-btn--small" onClick={() => set({ steps: h.steps.filter((_, j) => j !== i) })}>
                  Quitar paso
                </button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      {h.steps.length < 4 ? (
        <button className="a-btn a-btn--ghost" onClick={() => set({ steps: [...h.steps, { title: "Nuevo paso.", text: "" }] })}>
          + Añadir paso
        </button>
      ) : null}

      <h2>Preguntas frecuentes</h2>
      <Field label="Título de la sección" hint="Las preguntas se editan en la pestaña Contacto y datos.">
        <input value={h.faqTitle} onChange={(e) => set({ faqTitle: e.target.value })} />
      </Field>

      <h2>Cierre</h2>
      <Field label="Título">
        <input value={h.ctaTitle} onChange={(e) => set({ ctaTitle: e.target.value })} />
      </Field>
      <Field label="Texto">
        <textarea rows={2} value={h.ctaText} onChange={(e) => set({ ctaText: e.target.value })} />
      </Field>
      <Field label="Botón">
        <input value={h.ctaButton} onChange={(e) => set({ ctaButton: e.target.value })} />
      </Field>
    </div>
  );
}

/* ===================== Contacto y datos ===================== */

function SettingsTab({
  settings,
  setSettings,
}: {
  settings: Settings;
  setSettings: (patch: Partial<Settings>) => void;
}) {
  const setFaq = (faq: Faq[]) => setSettings({ faq });

  return (
    <div className="a-panel">
      <h2>Contacto y redes</h2>
      <div className="a-grid">
        <Field label="Número de WhatsApp" hint="Con código de país, sin + ni espacios. Ej: 584121234567">
          <input
            inputMode="tel"
            value={settings.whatsapp}
            onChange={(e) => setSettings({ whatsapp: e.target.value.replace(/\D/g, "") })}
          />
        </Field>
        <Field label="Moneda" hint="Símbolo que va antes del precio. Ej: $ o Bs.">
          <input value={settings.currency} onChange={(e) => setSettings({ currency: e.target.value })} />
        </Field>
        <Field label="Instagram (enlace)">
          <input value={settings.instagram} onChange={(e) => setSettings({ instagram: e.target.value.trim() })} />
        </Field>
        <Field label="TikTok (enlace)">
          <input value={settings.tiktok} onChange={(e) => setSettings({ tiktok: e.target.value.trim() })} />
        </Field>
      </div>
      {!settings.whatsapp ? (
        <p className="a-banner a-banner--warn">Sin número de WhatsApp, los pedidos abren WhatsApp sin destinatario.</p>
      ) : null}

      <h2>Avisos y entregas</h2>
      <Field label="Aviso arriba de la página" hint="Opcional. Ej: Envíos gratis este fin de semana. Déjalo vacío para ocultarlo.">
        <input value={settings.announcement} onChange={(e) => setSettings({ announcement: e.target.value })} />
      </Field>
      <Field label="Cómo entregan los pedidos" hint="Aparece en las fichas de producto y en el pie de la página.">
        <textarea rows={2} value={settings.delivery} onChange={(e) => setSettings({ delivery: e.target.value })} />
      </Field>

      <h2>Preguntas frecuentes</h2>
      <ul className="a-faq">
        {settings.faq.map((f, i) => (
          <li key={i}>
            <Field label={`Pregunta ${i + 1}`}>
              <input value={f.q} onChange={(e) => setFaq(settings.faq.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)))} />
            </Field>
            <Field label="Respuesta">
              <textarea
                rows={3}
                value={f.a}
                onChange={(e) => setFaq(settings.faq.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)))}
              />
            </Field>
            <div className="a-cats__bar">
              <button className="a-icon" aria-label="Subir" onClick={() => setFaq(move(settings.faq, i, -1))} disabled={i === 0}>
                ↑
              </button>
              <button
                className="a-icon"
                aria-label="Bajar"
                onClick={() => setFaq(move(settings.faq, i, 1))}
                disabled={i === settings.faq.length - 1}
              >
                ↓
              </button>
              <button className="a-btn a-btn--ghost a-btn--small" onClick={() => setFaq(settings.faq.filter((_, j) => j !== i))}>
                Borrar
              </button>
            </div>
          </li>
        ))}
      </ul>
      <button className="a-btn a-btn--ghost" onClick={() => setFaq([...settings.faq, { q: "", a: "" }])}>
        + Añadir pregunta
      </button>
    </div>
  );
}

/* ===================== Historial ===================== */

function HistoryTab({
  dirty,
  onRestored,
  onError,
}: {
  dirty: boolean;
  onRestored: (c: Catalog) => void;
  onError: (text: string) => void;
}) {
  const [versions, setVersions] = useState<{ id: string; savedAt: string }[] | null>(null);
  const [busy, startTransition] = useTransition();
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    fetchVersions().then((r) => (r.ok ? setVersions(r.data) : onErrorRef.current(r.error)));
  }, []);

  const restore = (id: string, label: string) => {
    const warning = dirty ? " Perderás los cambios que no has publicado." : "";
    if (!confirm(`¿Volver a la versión del ${label}?${warning}`)) return;
    startTransition(async () => {
      const r = await restoreVersion(id);
      if (r.ok) {
        onRestored(r.data);
        const list = await fetchVersions();
        if (list.ok) setVersions(list.data);
      } else onError(r.error);
    });
  };

  return (
    <div className="a-panel">
      <h2>Historial</h2>
      <p className="a-muted">
        Cada vez que publicas se guarda una copia. Si algo sale mal, puedes volver a cualquiera de las últimas 30.
      </p>
      {versions === null ? (
        <p>Cargando…</p>
      ) : versions.length === 0 ? (
        <p className="a-muted">Todavía no hay versiones guardadas. Aparecerán aquí cuando publiques.</p>
      ) : (
        <ul className="a-versions">
          {versions.map((v, i) => {
            const label = new Date(v.savedAt).toLocaleString("es", { dateStyle: "long", timeStyle: "short" });
            return (
              <li key={v.id}>
                <span>
                  {label}
                  {i === 0 ? <strong> · actual</strong> : null}
                </span>
                {i > 0 ? (
                  <button className="a-btn a-btn--ghost a-btn--small" disabled={busy} onClick={() => restore(v.id, label)}>
                    Restaurar
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
