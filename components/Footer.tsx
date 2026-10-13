import Link from "next/link";
import { whatsappLink } from "@/lib/format";
import type { Settings } from "@/lib/types";

const BLOCK_COLORS = ["#0A0A33", "#38125C", "#A11370", "#F95C42", "#38125C", "#0A0A33", "#A11370", "#F95C42"];
const BLOCK_HEIGHTS = [100, 78, 64, 88, 72, 96, 68, 84];

export function Footer({ settings }: { settings: Settings }) {
  const letters = settings.storeName.split("");
  const year = new Date().getFullYear();
  return (
    <footer className="footer" id="pie">
      <div className="footer__mark" aria-label={settings.storeName} role="img">
        {letters.map((l, i) => (
          <span
            key={i}
            className="footer__block"
            data-reveal
            style={
              {
                background: BLOCK_COLORS[i % BLOCK_COLORS.length],
                height: `${BLOCK_HEIGHTS[i % BLOCK_HEIGHTS.length]}%`,
                "--i": i,
              } as React.CSSProperties
            }
            aria-hidden="true"
          >
            {l}
          </span>
        ))}
      </div>

      <div className="footer__grid">
        <div className="footer__col">
          <p className="footer__head">Tienda</p>
          <Link href="/#catalogo">Catálogo</Link>
          <Link href="/#destacado">La favorita</Link>
          <Link href="/#suenometro">Calculadora de sueño</Link>
        </div>
        <div className="footer__col">
          <p className="footer__head">Ayuda</p>
          <Link href="/#como-pedir">Cómo pedir</Link>
          <Link href="/#preguntas">Preguntas</Link>
          <Link href="/#nosotros">Quiénes somos</Link>
        </div>
        <div className="footer__col">
          <p className="footer__head">Síguenos</p>
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
          <a href={whatsappLink(settings, `¡Hola ${settings.storeName}!`)} target="_blank" rel="noopener">
            WhatsApp
          </a>
        </div>
        <div className="footer__contact">
          <p>{settings.delivery}</p>
          <p>Pedidos y dudas, siempre por WhatsApp.</p>
        </div>
      </div>

      <div className="footer__last">
        <p>
          © {year} {settings.storeName}. Hecho con cariño para que duermas bonito.
        </p>
        <a className="btn btn--dark btn--small" href="#contenido">
          Volver arriba
        </a>
      </div>
    </footer>
  );
}
