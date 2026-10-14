import { useId } from "react";
import type { ArtKind } from "@/lib/types";

/* Colores de la marca */
export const palette = {
  night: "#0A0A33",
  plum: "#38125C",
  magenta: "#A11370",
  coral: "#F95C42",
  gold: "#FFBF42",
  peach: "#FFA385",
  cream: "#F7ECE1",
};

function hexToRgb(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function mix(a: string, b: string, t: number) {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  const c = ca.map((v, i) => Math.round(v + (cb[i] - v) * t));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

export function isLight(hex: string) {
  const [r, g, b] = hexToRgb(hex);
  return 0.299 * r + 0.587 * g + 0.114 * b > 150;
}

/** Fondo sobre el que se dibuja un producto de ese color. */
export function plateFor(hex?: string) {
  if (!hex) return "#FFD6C4";
  return isLight(hex) ? "#4A1F73" : "#FFD6C4";
}

/** Fondos de estudio para un producto de ese color: uno para paletas claras y otro para la oscura. */
export function plateTints(hex?: string) {
  const c = hex ?? palette.plum;
  const light = isLight(c) ? mix(c, palette.plum, 0.16) : mix(c, "#ffffff", 0.86);
  const dark = isLight(c) ? mix(c, palette.night, 0.72) : mix(c, palette.night, 0.55);
  return { "--plate-l": light, "--plate-d": dark } as React.CSSProperties;
}

/** Colores del barrido de láminas detrás de un producto de ese color. */
export function plateSweep(hex?: string) {
  const c = hex ?? palette.magenta;
  if (isLight(c)) return [palette.plum, mix(c, palette.night, 0.55), palette.magenta, "#15144A"];
  return [palette.gold, palette.peach, mix(c, "#ffffff", 0.62), palette.peach, palette.coral];
}

/** Acento que contrasta con el color principal del producto. */
export function accentFor(hex: string) {
  if (isLight(hex)) return hex.toLowerCase() === palette.gold.toLowerCase() ? palette.magenta : palette.plum;
  return hex.toLowerCase() === palette.magenta.toLowerCase() ? palette.gold : palette.peach;
}

function crescent(cx: number, cy: number, r: number) {
  return `M${cx} ${cy - r} A${r} ${r} 0 1 0 ${cx} ${cy + r} A${r * 0.72} ${r} 0 1 1 ${cx} ${cy - r} Z`;
}

function star(cx: number, cy: number, r: number, points = 5, inner = 0.48) {
  const step = Math.PI / points;
  let d = "";
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 === 0 ? r : r * inner;
    const a = i * step - Math.PI / 2;
    d += `${i ? "L" : "M"}${(cx + rad * Math.cos(a)).toFixed(1)} ${(cy + rad * Math.sin(a)).toFixed(1)} `;
  }
  return `${d}Z`;
}

function sparkle(cx: number, cy: number, r: number) {
  const k = r * 0.22;
  return `M${cx} ${cy - r} Q${cx + k} ${cy - k} ${cx + r} ${cy} Q${cx + k} ${cy + k} ${cx} ${cy + r} Q${cx - k} ${cy + k} ${cx - r} ${cy} Q${cx - k} ${cy - k} ${cx} ${cy - r} Z`;
}

/* ---------------------------------------------------------------- */
/* Marca: luna creciente con un ojo dormido                          */
/* ---------------------------------------------------------------- */

export function Mark({
  size = 40,
  mono,
  className,
  title,
}: {
  size?: number | string;
  /** Pinta la marca en un solo color (currentColor). */
  mono?: boolean;
  className?: string;
  title?: string;
}) {
  const id = useId().replace(/:/g, "");
  const fill = mono ? "currentColor" : `url(#g${id})`;
  const line = mono ? "var(--mark-cut, #0A0A33)" : palette.night;
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient id={`g${id}`} x1="0.15" y1="0.1" x2="0.85" y2="0.95">
          <stop offset="0" stopColor={palette.gold} />
          <stop offset="0.5" stopColor={palette.coral} />
          <stop offset="1" stopColor={palette.magenta} />
        </linearGradient>
        <mask id={`m${id}`}>
          <rect width="120" height="120" fill="#fff" />
          <circle cx="80" cy="46" r="40" fill="#000" />
        </mask>
      </defs>
      <circle cx="58" cy="62" r="50" fill={fill} mask={`url(#m${id})`} />
      {/* ojo dormido */}
      <g
        fill="none"
        stroke={mono ? "currentColor" : line}
        strokeWidth="4.2"
        strokeLinecap="round"
        style={mono ? { stroke: "var(--mark-cut, #0A0A33)" } : undefined}
      >
        <path d="M22 78 Q36 92 52 86" />
        <path d="M26 84 L21 93" />
        <path d="M34 89 L31 99" />
        <path d="M44 90 L44 100" />
      </g>
      <path d={sparkle(92, 30, 11)} fill={mono ? "currentColor" : palette.gold} />
      <circle cx="104" cy="56" r="3.2" fill={mono ? "currentColor" : palette.peach} />
    </svg>
  );
}

/* ---------------------------------------------------------------- */
/* Dibujos de producto                                               */
/* ---------------------------------------------------------------- */

type ArtProps = { color?: string; className?: string; label?: string };

export function ProductArt({ kind, ...props }: ArtProps & { kind: ArtKind }) {
  switch (kind) {
    case "antifaz":
      return <MaskArt {...props} />;
    case "gomitas":
      return <GummiesArt {...props} />;
    case "almohada":
      return <PillowArt {...props} />;
    default:
      return <PajamaArt {...props} />;
  }
}

function Svg({ children, className, label }: { children: React.ReactNode; className?: string; label?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      preserveAspectRatio="xMidYMid meet"
    >
      {children}
    </svg>
  );
}

export function PajamaArt({ color = palette.plum, className, label }: ArtProps) {
  const id = useId().replace(/:/g, "");
  const accent = accentFor(color);
  const shade = mix(color, palette.night, 0.28);
  const deep = mix(color, palette.night, 0.45);
  const light = mix(color, "#ffffff", 0.18);
  const shirt = "M130 94 L170 76 Q200 98 230 76 L270 94 L276 246 Q238 258 200 254 Q162 258 124 246 Z";
  const sleeveL = "M130 94 Q96 132 72 196 L106 214 Q124 172 146 146 Z";
  const sleeveR = "M270 94 Q304 132 328 196 L294 214 Q276 172 254 146 Z";
  const pants = "M140 244 L260 244 L278 372 Q247 379 216 372 L200 292 L184 372 Q153 379 122 372 Z";
  const lapelL = "M170 76 L200 134 L152 116 Q158 92 170 76 Z";
  const lapelR = "M230 76 L200 134 L248 116 Q242 92 230 76 Z";
  return (
    <Svg className={className} label={label}>
      <defs>
        <pattern id={`p${id}`} width="46" height="46" patternUnits="userSpaceOnUse">
          <path d={crescent(12, 12, 5)} fill={accent} opacity="0.42" />
          <path d={sparkle(34, 34, 4)} fill={accent} opacity="0.42" />
        </pattern>
        <linearGradient id={`s${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.32" stopColor="#fff" stopOpacity="0.26" />
          <stop offset="0.46" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.66" stopColor="#fff" stopOpacity="0.1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* pantalón */}
      <path d={pants} fill={shade} />
      <path d={pants} fill={`url(#p${id})`} />
      <path d={pants} fill={`url(#s${id})`} />
      <rect x="140" y="236" width="120" height="16" rx="5" fill={deep} />
      <path d="M196 248 Q190 262 186 270 M204 248 Q210 262 214 270" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M166 300 Q160 332 164 362 M234 300 Q240 332 236 362" fill="none" stroke={deep} strokeWidth="2" opacity="0.6" strokeLinecap="round" />
      <path d="M121 364 Q153 371 185 364 L184 372 Q153 379 122 372 Z" fill={accent} />
      <path d="M215 364 Q247 371 279 364 L278 372 Q247 379 216 372 Z" fill={accent} />
      {/* mangas */}
      <path d={sleeveL} fill={color} />
      <path d={sleeveR} fill={color} />
      <path d={sleeveL} fill={`url(#p${id})`} />
      <path d={sleeveR} fill={`url(#p${id})`} />
      <path d={sleeveL} fill={`url(#s${id})`} />
      <path d={sleeveR} fill={`url(#s${id})`} />
      <path d="M78 184 L111 202 L106 214 L72 196 Z" fill={accent} />
      <path d="M322 184 L289 202 L294 214 L328 196 Z" fill={accent} />
      <path d="M104 150 Q114 166 110 184 M296 150 Q286 166 290 184" fill="none" stroke={shade} strokeWidth="2" opacity="0.7" strokeLinecap="round" />
      {/* camisa */}
      <path d={shirt} fill={color} />
      <path d={shirt} fill={`url(#p${id})`} />
      <path d={shirt} fill={`url(#s${id})`} />
      <path d="M150 196 Q160 220 154 242 M250 182 Q242 208 248 234" fill="none" stroke={shade} strokeWidth="2" opacity="0.6" strokeLinecap="round" />
      <path d="M124 246 Q162 258 200 254 Q238 258 276 246" fill="none" stroke={accent} strokeWidth="3.5" strokeLinecap="round" />
      <path d={lapelL} fill={light} stroke={accent} strokeWidth="3.5" strokeLinejoin="round" />
      <path d={lapelR} fill={light} stroke={accent} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M200 134 L200 254" stroke={shade} strokeWidth="2.5" />
      <path d="M212 134 L212 252" stroke={accent} strokeWidth="2" opacity="0.8" />
      {[156, 182, 208, 234].map((y) => (
        <g key={y}>
          <circle cx="206" cy={y} r="5.5" fill={accent} />
          <circle cx="204.5" cy={y - 1.5} r="1.6" fill="#fff" opacity="0.55" />
        </g>
      ))}
      <path d="M146 150 L178 150 L178 176 Q162 182 146 176 Z" fill={light} />
      <path d="M146 150 L178 150" stroke={accent} strokeWidth="4" strokeLinecap="round" />
    </Svg>
  );
}

export function MaskArt({ color = palette.plum, className, label }: ArtProps) {
  const accent = accentFor(color);
  const body = "M64 200 C64 142 136 128 200 160 C264 128 336 142 336 200 C336 258 270 270 200 242 C130 270 64 258 64 200 Z";
  return (
    <Svg className={className} label={label}>
      <path d="M68 196 C34 188 20 206 12 232" fill="none" stroke={accent} strokeWidth="14" strokeLinecap="round" />
      <path d="M332 196 C366 188 380 206 388 232" fill="none" stroke={accent} strokeWidth="14" strokeLinecap="round" />
      <path d={body} fill={color} stroke={accent} strokeWidth="7" />
      <path d="M108 166 C146 152 176 160 194 172" fill="none" stroke="#fff" strokeOpacity="0.28" strokeWidth="9" strokeLinecap="round" />
      <g fill="none" stroke={accent} strokeWidth="5" strokeLinecap="round">
        <path d="M112 200 Q140 226 168 200" />
        <path d="M120 211 L112 226" />
        <path d="M133 218 L129 234" />
        <path d="M148 218 L151 234" />
        <path d="M161 211 L169 226" />
        <path d="M232 200 Q260 226 288 200" />
        <path d="M280 211 L288 226" />
        <path d="M267 218 L271 234" />
        <path d="M252 218 L249 234" />
        <path d="M239 211 L231 226" />
      </g>
      <path d={sparkle(200, 300, 12)} fill={palette.gold} />
      <path d={sparkle(232, 322, 7)} fill={palette.peach} />
    </Svg>
  );
}

export function GummiesArt({ color = palette.magenta, className, label }: ArtProps) {
  const id = useId().replace(/:/g, "");
  const lid = isLight(color) ? palette.plum : palette.gold;
  const gummies: Array<[string, string]> = [
    [crescent(150, 286, 16), palette.gold],
    [star(196, 300, 18), palette.coral],
    [crescent(246, 290, 16), palette.peach],
    [star(160, 322, 15), palette.peach],
    [crescent(206, 330, 14), palette.gold],
    [star(250, 326, 15), palette.gold],
    [crescent(180, 256, 13), palette.cream],
    [star(232, 256, 14), palette.coral],
  ];
  return (
    <Svg className={className} label={label}>
      <defs>
        <clipPath id={`j${id}`}>
          <rect x="112" y="128" width="176" height="226" rx="38" />
        </clipPath>
      </defs>
      <rect x="112" y="128" width="176" height="226" rx="38" fill={color} />
      <g clipPath={`url(#j${id})`}>
        {gummies.map(([d, fill], i) => (
          <path key={i} d={d} fill={fill} />
        ))}
        <rect x="112" y="128" width="40" height="226" fill="#fff" opacity="0.12" />
      </g>
      <rect x="112" y="170" width="176" height="64" fill={palette.cream} />
      <path d={crescent(150, 202, 17)} fill={palette.magenta} />
      <rect x="178" y="190" width="84" height="8" rx="4" fill={palette.plum} />
      <rect x="178" y="206" width="56" height="8" rx="4" fill={palette.plum} opacity="0.55" />
      <rect x="126" y="88" width="148" height="46" rx="12" fill={lid} />
      {[146, 170, 194, 218, 242].map((x) => (
        <rect key={x} x={x} y="96" width="8" height="30" rx="4" fill="#000" opacity="0.14" />
      ))}
      <path d={star(84, 352, 16)} fill={palette.gold} />
      <path d={crescent(326, 356, 15)} fill={palette.peach} />
      <path d={star(302, 334, 10)} fill={palette.coral} />
    </Svg>
  );
}

export function PillowArt({ color = palette.cream, className, label }: ArtProps) {
  const accent = accentFor(color);
  const shade = mix(color, palette.night, 0.14);
  const body =
    "M78 150 Q66 112 112 116 Q200 96 288 116 Q334 112 322 150 Q334 205 322 262 Q334 300 288 296 Q200 316 112 296 Q66 300 78 262 Q66 205 78 150 Z";
  return (
    <Svg className={className} label={label}>
      <ellipse cx="200" cy="336" rx="132" ry="14" fill={palette.night} opacity="0.22" />
      <path d={body} fill={color} />
      <path
        d={body}
        fill="none"
        stroke={shade}
        strokeWidth="3"
        strokeDasharray="2 9"
        strokeLinecap="round"
        transform="translate(200 206) scale(0.86) translate(-200 -206)"
      />
      <path d="M104 140 Q150 124 196 128" fill="none" stroke="#fff" strokeOpacity="0.4" strokeWidth="10" strokeLinecap="round" />
      <path d="M150 238 Q200 258 250 238" fill="none" stroke={shade} strokeWidth="5" strokeLinecap="round" />
      <path d={crescent(268, 250, 18)} fill={accent} />
      <path d={sparkle(292, 230, 7)} fill={accent} />
      <rect x="312" y="196" width="26" height="18" rx="3" fill={palette.coral} />
    </Svg>
  );
}

/* ---------------------------------------------------------------- */
/* Ilustraciones de la página                                        */
/* ---------------------------------------------------------------- */

export function ChatArt({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <rect x="120" y="40" width="160" height="320" rx="30" fill={palette.night} />
      <rect x="132" y="70" width="136" height="262" rx="10" fill={palette.cream} />
      <rect x="182" y="52" width="36" height="8" rx="4" fill={palette.plum} />
      <rect x="146" y="92" width="88" height="44" rx="14" fill={palette.peach} />
      <rect x="156" y="104" width="60" height="7" rx="3.5" fill={palette.night} />
      <rect x="156" y="118" width="40" height="7" rx="3.5" fill={palette.night} opacity="0.5" />
      <rect x="168" y="152" width="88" height="62" rx="14" fill={palette.magenta} />
      <rect x="180" y="166" width="64" height="7" rx="3.5" fill={palette.cream} />
      <rect x="180" y="180" width="52" height="7" rx="3.5" fill={palette.cream} />
      <rect x="180" y="194" width="34" height="7" rx="3.5" fill={palette.cream} opacity="0.7" />
      <rect x="146" y="230" width="72" height="40" rx="14" fill={palette.peach} />
      <path d={crescent(170, 250, 9)} fill={palette.plum} />
      <rect x="186" y="246" width="22" height="7" rx="3.5" fill={palette.night} />
      <path d={sparkle(312, 92, 16)} fill={palette.gold} />
      <path d={sparkle(92, 286, 11)} fill={palette.cream} />
    </Svg>
  );
}

export function GiftArt({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <rect x="92" y="168" width="216" height="186" rx="8" fill={palette.plum} />
      <rect x="78" y="134" width="244" height="54" rx="8" fill={palette.magenta} />
      <rect x="184" y="134" width="32" height="220" fill={palette.cream} />
      <path d="M200 134 C168 92 120 96 130 124 C138 144 182 140 200 134 Z" fill={palette.cream} />
      <path d="M200 134 C232 92 280 96 270 124 C262 144 218 140 200 134 Z" fill={palette.cream} />
      <circle cx="200" cy="134" r="10" fill={palette.peach} />
      <path d="M232 196 L262 240" stroke={palette.cream} strokeWidth="3" />
      <rect x="242" y="234" width="44" height="58" rx="6" fill={palette.peach} transform="rotate(-14 264 263)" />
      <path d={crescent(262, 262, 11)} fill={palette.plum} transform="rotate(-14 264 263)" />
      <path d={sparkle(96, 92, 14)} fill={palette.cream} />
      <path d={sparkle(318, 70, 10)} fill={palette.night} />
    </Svg>
  );
}

/** Cielo con estrellas, determinista para que no cambie entre servidor y navegador. */
export function Stars({ count = 70, seed = 7, className }: { count?: number; seed?: number; className?: string }) {
  let s = seed;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  const stars = Array.from({ length: count }, () => ({
    x: rand() * 1000,
    y: rand() * 1000,
    r: rand() < 0.12 ? 2.6 : rand() * 1.4 + 0.6,
    d: (rand() * 4).toFixed(2),
  }));
  return (
    <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      {stars.map((st, i) =>
        st.r > 2.5 ? (
          <path key={i} d={sparkle(st.x, st.y, 9)} className="twinkle" style={{ animationDelay: `${st.d}s` }} />
        ) : (
          <circle key={i} cx={st.x} cy={st.y} r={st.r} className="twinkle" style={{ animationDelay: `${st.d}s` }} />
        ),
      )}
    </svg>
  );
}
