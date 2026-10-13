import type { Product, Settings } from "./types";

export function money(value: number, currency = "$") {
  const rounded = Math.round(value * 100) / 100;
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
  return `${currency}${text}`;
}

export const statusLabel: Record<Product["status"], string> = {
  disponible: "Disponible",
  pocas: "Quedan pocas",
  agotado: "Agotado",
  pronto: "Muy pronto",
};

export function canOrderStatus(status: Product["status"]) {
  return status === "disponible" || status === "pocas";
}

export function canOrder(p: Product) {
  return canOrderStatus(p.status);
}

export type OrderLine = {
  name: string;
  price: number;
  qty: number;
  size?: string;
  color?: string;
};

export function orderMessage(lines: OrderLine[], settings: Settings) {
  const items = lines.map((l) => {
    const extra = [l.size && `talla ${l.size}`, l.color && l.color].filter(Boolean).join(", ");
    return `• ${l.qty} × ${l.name}${extra ? ` (${extra})` : ""}: ${money(l.price * l.qty, settings.currency)}`;
  });
  const total = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
  return [
    `¡Hola ${settings.storeName}! Quiero hacer este pedido:`,
    "",
    ...items,
    "",
    `Total: ${money(total, settings.currency)}`,
    "",
    "Mi nombre es: ",
  ].join("\n");
}

export function whatsappLink(settings: Settings, text: string) {
  const base = settings.whatsapp ? `https://wa.me/${settings.whatsapp}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(text)}`;
}
