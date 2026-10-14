import Link from "next/link";
import type { Settings } from "@/lib/types";
import { Mark } from "./Art";

export function Footer({ settings }: { settings: Settings }) {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="footer__inner">
        <p className="footer__note">{settings.delivery} Precios en dólares. Pedidos y pagos por WhatsApp.</p>
        <div className="footer__row">
          <Link href="/" className="footer__brand" aria-label={`${settings.storeName}, inicio`}>
            <Mark size={20} />
            <span>{settings.storeName}</span>
          </Link>
          <nav className="footer__links" aria-label="Pie de página">
            <Link href="/#coleccion">Colección</Link>
            <Link href="/#tu-noche">Tu noche</Link>
            <Link href="/#como-pedir">Cómo pedir</Link>
            <Link href="/#preguntas">Preguntas</Link>
            {settings.instagram ? (
              <a href={settings.instagram} target="_blank" rel="noopener">
                Instagram
              </a>
            ) : null}
            {settings.tiktok ? (
              <a href={settings.tiktok} target="_blank" rel="noopener">
                TikTok
              </a>
            ) : null}
          </nav>
        </div>
        <p className="footer__copy">
          © {year} {settings.storeName}. Para dormir bonito.
        </p>
      </div>
    </footer>
  );
}
