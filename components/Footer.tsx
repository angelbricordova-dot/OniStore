import Link from "next/link";
import { whatsappLink } from "@/lib/format";
import { DAWN_A, DAWN_B } from "@/lib/palette";
import type { Settings } from "@/lib/types";
import { Mark } from "./Art";
import { Lamellae } from "./Lamellae";

export function Footer({ settings }: { settings: Settings }) {
  const year = new Date().getFullYear();
  const hello = whatsappLink(settings, `¡Hola ${settings.storeName}!`);
  return (
    <footer className="footer" id="pie">
      <div className="close">
        <div className="close__text">
          <h2 className="h2" data-reveal>
            Hablemos de
            <br />
            tu noche
          </h2>
          <p data-reveal>
            Escríbenos y te ayudamos a escoger pijama, talla o un regalo para alguien que duerme poco.
          </p>
          <div className="close__actions" data-reveal>
            <a className="btn btn--gold" href={hello} target="_blank" rel="noopener">
              Abrir WhatsApp
            </a>
            {settings.instagram ? (
              <a className="btn btn--ghost" href={settings.instagram} target="_blank" rel="noopener">
                Instagram
              </a>
            ) : null}
            {settings.tiktok ? (
              <a className="btn btn--ghost" href={settings.tiktok} target="_blank" rel="noopener">
                TikTok
              </a>
            ) : null}
          </div>
        </div>
        <div className="close__field">
          <Lamellae
            className="close__canvas"
            faceA={DAWN_A}
            faceB={DAWN_B}
            lines={settings.storeName === "OniStore" ? ["Oni", "Store"] : [settings.storeName]}
            dim={0.9}
            slat={10}
            interactive
          />
        </div>
      </div>

      <div className="footer__base">
        <Link href="/" className="footer__brand" aria-label={`${settings.storeName}, inicio`}>
          <Mark size={30} />
          <span className="wordmark">{settings.storeName}</span>
        </Link>
        <nav className="footer__links" aria-label="Pie de página">
          <Link href="/#catalogo">Colección</Link>
          <Link href="/#suenometro">Tu noche en ciclos</Link>
          <Link href="/#como-pedir">Cómo pedir</Link>
          <Link href="/#nosotros">Oniris</Link>
          <Link href="/#preguntas">Preguntas</Link>
        </nav>
        <p className="footer__note">{settings.delivery}</p>
        <p className="footer__copy">
          © {year} {settings.storeName}. Para dormir bonito.
        </p>
      </div>
    </footer>
  );
}
