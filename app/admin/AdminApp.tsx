"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Mark, ProductArt, plateFor } from "@/components/Art";
import { money, statusLabel } from "@/lib/format";
import type { ArtKind, Catalog, Category, Faq, Product, ProductStatus, Settings } from "@/lib/types";
import { fetchVersions, logout, publishCatalog, restoreVersion } from "./actions";

type Storage = "blob" | "file" | "readonly";
type Tab = "productos" | "categorias" | "tienda" | "historial";

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

/** Reduce la foto en el navegador antes de subirla: carga rápida y sin pasar el límite. */
async function shrinkImage(file: File, maxSide = 1600): Promise<File> {
  if (file.type === "image/gif") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/webp", 0.86));
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
  const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !json.url) throw new Error(json.error || "No se pudo subir la foto.");
  return json.url;
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
            ["tienda", "Tienda y textos"],
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
        {tab === "tienda" ? (
          <SettingsTab
            settings={catalog.settings}
            setSettings={setSettings}
            onError={(t) => setToast({ kind: "error", text: t })}
          />
        ) : null}
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
  const [slugTouched, setSlugTouched] = useState(!product.slug.startsWith("nuevo-"));
  const [sizesText, setSizesText] = useState(product.sizes.join(", "));

  const onFiles = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return;
      const list = Array.from(files);
      setUploading((n) => n + list.length);
      const urls: string[] = [];
      for (const file of list) {
        try {
          urls.push(await uploadImage(file, "products"));
        } catch (error) {
          onError(error instanceof Error ? error.message : "No se pudo subir la foto.");
        } finally {
          setUploading((n) => n - 1);
        }
      }
      if (urls.length) update({ images: [...product.images, ...urls] });
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
        <p className="a-muted">La primera foto es la portada. Se ven mejor cuadradas o verticales, con buena luz.</p>
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

/* ===================== Tienda y textos ===================== */

function SettingsTab({
  settings,
  setSettings,
  onError,
}: {
  settings: Settings;
  setSettings: (patch: Partial<Settings>) => void;
  onError: (text: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
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

      <h2>Textos de la tienda</h2>
      <Field label="Aviso arriba de la página" hint="Opcional. Ej: Envíos gratis este fin de semana. Déjalo vacío para ocultarlo.">
        <input value={settings.announcement} onChange={(e) => setSettings({ announcement: e.target.value })} />
      </Field>
      <Field label="Cómo entregan los pedidos">
        <textarea rows={2} value={settings.delivery} onChange={(e) => setSettings({ delivery: e.target.value })} />
      </Field>

      <h2>Foto de Oniris</h2>
      <p className="a-muted">Aparece en un círculo, en la sección “Hecho por Oniris”. Si no hay, se muestra un dibujo.</p>
      <div className="a-about">
        <div className="a-about__preview">
          {settings.aboutImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.aboutImage} alt="Foto actual" />
          ) : (
            <Mark size={80} />
          )}
        </div>
        <label className="a-btn a-btn--ghost">
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              setUploading(true);
              try {
                setSettings({ aboutImage: await uploadImage(file, "site") });
              } catch (error) {
                onError(error instanceof Error ? error.message : "No se pudo subir la foto.");
              } finally {
                setUploading(false);
              }
            }}
          />
          {uploading ? "Subiendo…" : settings.aboutImage ? "Cambiar foto" : "Subir foto"}
        </label>
        {settings.aboutImage ? (
          <button className="a-btn a-btn--ghost" onClick={() => setSettings({ aboutImage: "" })}>
            Quitar
          </button>
        ) : null}
      </div>

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

      <h2>Nombre de la tienda</h2>
      <Field label="Nombre">
        <input value={settings.storeName} onChange={(e) => setSettings({ storeName: e.target.value })} />
      </Field>
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
