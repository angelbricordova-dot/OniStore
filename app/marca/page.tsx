import type { Metadata } from "next";
import { ChatArt, GiftArt, Mark, MaskArt, GummiesArt, PajamaArt, PillowArt, Stars } from "@/components/Art";
import "./marca.css";

export const metadata: Metadata = {
  title: "Marca",
  robots: { index: false, follow: false },
};

const COLORS = [
  { name: "Medianoche", hex: "#0A0A33", ink: "#F7ECE1", use: "Fondo principal, la noche" },
  { name: "Ciruela", hex: "#38125C", ink: "#F7ECE1", use: "Fondos, títulos sobre el atardecer" },
  { name: "Magenta", hex: "#A11370", ink: "#F7ECE1", use: "Capítulos y degradados" },
  { name: "Coral", hex: "#F95C42", ink: "#0A0A33", use: "Atardecer, avisos" },
  { name: "Dorado", hex: "#FFBF42", ink: "#0A0A33", use: "Botones, el sol, la acción" },
  { name: "Durazno", hex: "#FFA385", ink: "#0A0A33", use: "Superficies cálidas" },
  { name: "Crema", hex: "#F7ECE1", ink: "#0A0A33", use: "Texto sobre oscuro, el amanecer" },
];

const HIGHLIGHTS = [
  { id: "pijamas", label: "Pijamas", bg: "#38125C", art: <PajamaArt color="#FFA385" /> },
  { id: "antifaces", label: "Antifaces", bg: "#A11370", art: <MaskArt color="#F7ECE1" /> },
  { id: "gomitas", label: "Gomitas", bg: "#F95C42", art: <GummiesArt color="#38125C" /> },
  { id: "almohadas", label: "Almohadas", bg: "#FFA385", art: <PillowArt color="#F7ECE1" /> },
  { id: "pedidos", label: "Pedidos", bg: "#FFBF42", art: <ChatArt /> },
  { id: "envios", label: "Envíos", bg: "#4A1F73", art: <GiftArt /> },
];

export default function MarcaPage() {
  return (
    <main className="brand">
      <header className="brand__intro">
        <Mark size={96} />
        <h1 className="h2">
          La marca
          <br />
          OniStore
        </h1>
        <p>
          Una luna que se queda dormida. El nombre viene de Oniris y de onírico, y la paleta es una noche completa: del
          atardecer dorado a la medianoche y de vuelta al amanecer.
        </p>
      </header>

      <section className="brand__block">
        <h2 className="brand__h">Logo</h2>
        <div className="brand__logos">
          <div className="logo-tile" style={{ background: "#0A0A33", color: "#F7ECE1" }}>
            <Mark size={120} />
            <span className="wordmark brand__word">OniStore</span>
          </div>
          <div className="logo-tile" style={{ background: "#F7ECE1", color: "#0A0A33" }}>
            <Mark size={120} />
            <span className="wordmark brand__word">OniStore</span>
          </div>
          <div className="logo-tile" style={{ background: "#FFBF42", color: "#0A0A33", ["--mark-cut" as string]: "#FFBF42" }}>
            <Mark size={120} mono />
            <span className="wordmark brand__word">OniStore</span>
          </div>
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
        <div className="brand__gradients">
          <div style={{ background: "linear-gradient(180deg,#A11370 0%,#F95C42 40%,#FFA385 72%,#FFBF42 100%)" }}>
            <span>Atardecer</span>
          </div>
          <div style={{ background: "linear-gradient(180deg,#38125C 0%,#1F0F47 50%,#0A0A33 100%)" }}>
            <span>Noche</span>
          </div>
          <div style={{ background: "radial-gradient(circle at 50% 45%,#FFF3D6 0%,#FFBF42 26%,#F95C42 58%,#A11370 100%)" }}>
            <span>El sol del logo</span>
          </div>
        </div>
      </section>

      <section className="brand__block">
        <h2 className="brand__h">Letras</h2>
        <div className="brand__type">
          <p className="brand__fraunces">Fraunces, suave</p>
          <p>Figtree para todo lo que se lee: descripciones, precios, botones y el panel.</p>
        </div>
      </section>

      <section className="brand__block">
        <h2 className="brand__h">Para Instagram y TikTok</h2>
        <p className="brand__note">Toca una imagen para descargarla en tamaño completo.</p>
        <div className="brand__social">
          <a href="/marca/perfil.png" download className="dl">
            <div className="avatar" id="avatar">
              <Stars className="avatar__stars" count={34} seed={9} />
              <Mark size="62%" />
            </div>
            <span>Foto de perfil · 1080 × 1080</span>
          </a>
          <a href="/marca/perfil-con-nombre.png" download className="dl">
            <div className="avatar avatar--name" id="avatar-name">
              <Stars className="avatar__stars" count={34} seed={4} />
              <Mark size="54%" />
              <span className="wordmark">OniStore</span>
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
