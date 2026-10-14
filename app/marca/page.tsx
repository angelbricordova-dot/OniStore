import type { Metadata } from "next";
import { ChatArt, GiftArt, Mark, MaskArt, GummiesArt, PajamaArt, PillowArt } from "@/components/Art";
import { getCatalog } from "@/lib/catalog";
import { LOGOS } from "@/lib/types";
import "./marca.css";

export const metadata: Metadata = {
  title: "Marca",
  robots: { index: false, follow: false },
};

export const revalidate = 300;

const COLORS = [
  { name: "Medianoche", hex: "#0A0A33", ink: "#F7ECE1", use: "El modo noche" },
  { name: "Ciruela", hex: "#38125C", ink: "#F7ECE1", use: "Acento de Lavanda" },
  { name: "Magenta", hex: "#A11370", ink: "#F7ECE1", use: "Acento de Luna" },
  { name: "Coral", hex: "#F95C42", ink: "#0A0A33", use: "Acento de Durazno" },
  { name: "Dorado", hex: "#FFBF42", ink: "#0A0A33", use: "La luz de la luna" },
  { name: "Durazno", hex: "#FFA385", ink: "#0A0A33", use: "Fondos cálidos" },
  { name: "Crema", hex: "#F7ECE1", ink: "#0A0A33", use: "Texto sobre la noche" },
];

const HIGHLIGHTS = [
  { id: "pijamas", label: "Pijamas", bg: "#38125C", art: <PajamaArt color="#FFA385" /> },
  { id: "antifaces", label: "Antifaces", bg: "#A11370", art: <MaskArt color="#F7ECE1" /> },
  { id: "gomitas", label: "Gomitas", bg: "#F95C42", art: <GummiesArt color="#38125C" /> },
  { id: "almohadas", label: "Almohadas", bg: "#FFA385", art: <PillowArt color="#F7ECE1" /> },
  { id: "pedidos", label: "Pedidos", bg: "#FFBF42", art: <ChatArt /> },
  { id: "envios", label: "Envíos", bg: "#4A1F73", art: <GiftArt /> },
];

export default async function MarcaPage() {
  const { settings } = await getCatalog();
  const logo = settings.appearance.logo;

  return (
    <main className="brand">
      <header className="brand__intro">
        <Mark size={88} variant={logo} />
        <h1>La marca {settings.storeName}.</h1>
        <p>
          Una luna tranquila y la paleta de una noche completa: del atardecer dorado a la medianoche. El nombre juega con
          onírico, todo lo que pertenece a los sueños.
        </p>
      </header>

      <section className="brand__block">
        <h2 className="brand__h">Propuestas de logo</h2>
        <p className="brand__note">Se escoge en el panel: Apariencia → Logo. La que está activa aparece marcada.</p>
        <div className="brand__logos">
          {LOGOS.map((l) => (
            <figure key={l.id} className="logo-card" data-on={l.id === logo}>
              <div className="logo-tile" style={{ background: "#0A0A33", color: "#F7ECE1" }}>
                <Mark size={96} variant={l.id} />
                <span className="wordmark brand__word">{settings.storeName}</span>
              </div>
              <div className="logo-tile logo-tile--small" style={{ background: "#F7ECE1", color: "#0A0A33" }}>
                <Mark size={56} variant={l.id} />
                <Mark size={56} variant={l.id} mono />
              </div>
              <figcaption>
                <strong>{l.name}</strong>
                {l.id === logo ? <span className="brand__on">En uso</span> : null}
                <span>{l.hint}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="brand__block">
        <h2 className="brand__h">Colores</h2>
        <ul className="brand__colors">
          {COLORS.map((c) => (
            <li key={c.hex} style={{ background: c.hex, color: c.ink }}>
              <strong>{c.name}</strong>
              <span>{c.hex}</span>
              <span>{c.use}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="brand__block">
        <h2 className="brand__h">Para Instagram y TikTok</h2>
        <p className="brand__note">Toca una imagen para descargarla. Se hicieron con el logo “Luna creciente”.</p>
        <div className="brand__social">
          <a href="/marca/perfil.png" download className="dl">
            <div className="avatar" id="avatar">
              <Mark size="58%" variant={logo} />
            </div>
            <span>Foto de perfil · 1080 × 1080</span>
          </a>
          <a href="/marca/perfil-con-nombre.png" download className="dl">
            <div className="avatar avatar--name" id="avatar-name">
              <Mark size="48%" variant={logo} />
              <span className="wordmark">{settings.storeName}</span>
            </div>
            <span>Perfil con nombre · 1080 × 1080</span>
          </a>
        </div>
        <h3 className="brand__sub">Portadas de historias destacadas</h3>
        <ul className="brand__highlights">
          {HIGHLIGHTS.map((h) => (
            <li key={h.id}>
              <a href={`/marca/destacada-${h.id}.png`} download className="dl">
                <div className="highlight" id={`hl-${h.id}`} style={{ background: h.bg }}>
                  {h.art}
                </div>
                <span>{h.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
