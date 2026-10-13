"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { canOrderStatus, money, orderMessage, whatsappLink } from "@/lib/format";
import type { ArtKind, ProductStatus, Settings } from "@/lib/types";
import { ProductArt, plateFor } from "./Art";

export type BagItem = {
  key: string;
  slug: string;
  name: string;
  price: number;
  qty: number;
  size?: string;
  color?: string;
  colorHex?: string;
  image?: string;
  art: ArtKind;
};

type BagContextValue = {
  items: BagItem[];
  count: number;
  total: number;
  settings: Settings;
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (item: Omit<BagItem, "key" | "qty">, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const BagContext = createContext<BagContextValue | null>(null);
const STORAGE_KEY = "onistore-bolsa-v1";

export function useBag() {
  const ctx = useContext(BagContext);
  if (!ctx) throw new Error("useBag debe usarse dentro de <BagProvider>");
  return ctx;
}

export function BagProvider({ settings, children }: { settings: Settings; children: React.ReactNode }) {
  const [items, setItems] = useState<BagItem[]>([]);
  const [open, setOpen] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(saved)) setItems(saved);
    } catch {
      /* sin almacenamiento disponible: la bolsa vive solo en esta visita */
    }
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignorar */
    }
  }, [items]);

  const add = useCallback<BagContextValue["add"]>((item, qty = 1) => {
    const key = [item.slug, item.size ?? "", item.color ?? ""].join("|");
    setItems((prev) => {
      const found = prev.find((i) => i.key === key);
      if (found) return prev.map((i) => (i.key === key ? { ...i, qty: Math.min(99, i.qty + qty) } : i));
      return [...prev, { ...item, key, qty }];
    });
    setOpen(true);
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setItems((prev) =>
      qty <= 0 ? prev.filter((i) => i.key !== key) : prev.map((i) => (i.key === key ? { ...i, qty: Math.min(99, qty) } : i)),
    );
  }, []);

  const remove = useCallback((key: string) => setItems((prev) => prev.filter((i) => i.key !== key)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<BagContextValue>(
    () => ({
      items,
      count: items.reduce((n, i) => n + i.qty, 0),
      total: items.reduce((n, i) => n + i.qty * i.price, 0),
      settings,
      open,
      setOpen,
      add,
      setQty,
      remove,
      clear,
    }),
    [items, settings, open, add, setQty, remove, clear],
  );

  return (
    <BagContext.Provider value={value}>
      {children}
      <BagDrawer />
    </BagContext.Provider>
  );
}

function BagDrawer() {
  const { items, total, settings, open, setOpen, setQty, remove, clear } = useBag();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.documentElement.classList.add("bag-open");
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("bag-open");
    };
  }, [open, setOpen]);

  const message = orderMessage(
    items.map((i) => ({ name: i.name, price: i.price, qty: i.qty, size: i.size, color: i.color })),
    settings,
  );

  return (
    <div className="bag" data-open={open} aria-hidden={!open}>
      <button className="bag__scrim" tabIndex={-1} aria-label="Cerrar la bolsa" onClick={() => setOpen(false)} />
      <div
        className="bag__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bag-title"
        tabIndex={-1}
        ref={panelRef}
        inert={!open}
      >
        <div className="bag__head">
          <h2 id="bag-title">Tu bolsa</h2>
          <button className="link-button" onClick={() => setOpen(false)}>
            Cerrar
          </button>
        </div>

        {items.length === 0 ? (
          <div className="bag__empty">
            <p>Todavía no hay nada aquí. Elige algo del catálogo y aparecerá en esta bolsa.</p>
            <a className="btn btn--dark" href="/#catalogo" onClick={() => setOpen(false)}>
              Ver el catálogo
            </a>
          </div>
        ) : (
          <>
            <ul className="bag__list">
              {items.map((item) => (
                <li key={item.key} className="bag__item">
                  <div className="bag__thumb" style={{ background: item.image ? "var(--cream-3)" : plateFor(item.colorHex) }}>
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt="" />
                    ) : (
                      <ProductArt kind={item.art} color={item.colorHex} />
                    )}
                  </div>
                  <div className="bag__info">
                    <p className="bag__name">{item.name}</p>
                    <p className="bag__meta">
                      {[item.size && `Talla ${item.size}`, item.color].filter(Boolean).join(" · ") || "Única"}
                    </p>
                    <div className="qty" aria-label={`Cantidad de ${item.name}`}>
                      <button onClick={() => setQty(item.key, item.qty - 1)} aria-label="Quitar uno">
                        −
                      </button>
                      <span aria-live="polite">{item.qty}</span>
                      <button onClick={() => setQty(item.key, item.qty + 1)} aria-label="Añadir uno">
                        +
                      </button>
                    </div>
                  </div>
                  <div className="bag__price">
                    <span>{money(item.price * item.qty, settings.currency)}</span>
                    <button className="link-button" onClick={() => remove(item.key)}>
                      Quitar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="bag__foot">
              <p className="bag__total">
                <span>Total</span>
                <span>{money(total, settings.currency)}</span>
              </p>
              <p className="bag__note">
                Al tocar el botón se abre WhatsApp con tu pedido ya escrito. Te confirmamos disponibilidad, pago y
                entrega.
              </p>
              <a className="btn btn--gold btn--block" href={whatsappLink(settings, message)} target="_blank" rel="noopener">
                Enviar pedido por WhatsApp
              </a>
              <button className="link-button bag__clear" onClick={clear}>
                Vaciar la bolsa
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function AddToBag({
  product,
  size,
  color,
  disabled,
  className = "btn btn--gold",
  children = "Añadir a la bolsa",
}: {
  product: { slug: string; name: string; price: number; art: ArtKind; image?: string; status: ProductStatus };
  size?: string;
  color?: { name: string; hex: string };
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  const { add } = useBag();
  const blocked = disabled || !canOrderStatus(product.status);
  return (
    <button
      className={className}
      disabled={blocked}
      onClick={() =>
        add({
          slug: product.slug,
          name: product.name,
          price: product.price,
          art: product.art,
          image: product.image,
          size,
          color: color?.name,
          colorHex: color?.hex,
        })
      }
    >
      {children}
    </button>
  );
}

export function BagButton({ className }: { className?: string }) {
  const { count, setOpen } = useBag();
  return (
    <button className={className} onClick={() => setOpen(true)} aria-label={`Abrir la bolsa, ${count} productos`}>
      Bolsa <span className="bag-count">{count}</span>
    </button>
  );
}
