import Link from "next/link";
import { sectionLinks } from "@/lib/defaults";
import type { Settings } from "@/lib/types";
import { Logo } from "./Art";

export function Footer({ settings }: { settings: Settings }) {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="footer__inner">
        <p className="footer__note">{settings.delivery} Precios en dólares. Pedidos y pagos por WhatsApp.</p>
        <div className="footer__row">
          <Link href="/" className="footer__brand" aria-label={`${settings.storeName}, inicio`}>
            <Logo name={settings.storeName} variant={settings.appearance.logo} size={20} />
          </Link>
          <nav className="footer__links" aria-label="Pie de página">
            {sectionLinks(settings.home).map((l) => (
              <Link key={l.id} href={l.href}>
                {l.label}
              </Link>
            ))}
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
