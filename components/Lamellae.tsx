"use client";

import { useEffect, useRef } from "react";

/*
 * Piso de cromointerferencia.
 * Láminas verticales de dos caras más una línea fina en el filo. Al cambiar el
 * "ángulo de mirada" (dedo, mouse, scroll o inclinación del teléfono) cambia
 * cuánto se ve de cada cara, y los colores se mezclan en el ojo como un
 * degradado que nadie pintó.
 */

import { PAL } from "@/lib/palette";

export { PAL, DUSK_A, DUSK_B, NIGHT_A, NIGHT_B, DAWN_A, DAWN_B } from "@/lib/palette";

type RGB = [number, number, number];
const SAMPLES = 24;

function hexToRgb(hex: string): RGB {
  const n = parseInt(hex.replace("#", "").slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Reparte una paleta en N muestras para poder interpolar entre paletas de distinto largo. */
function resample(stops: string[]): RGB[] {
  const rgb = stops.map(hexToRgb);
  const out: RGB[] = [];
  for (let k = 0; k < SAMPLES; k++) {
    const u = (k / (SAMPLES - 1)) * (rgb.length - 1);
    const i = Math.min(rgb.length - 2, Math.floor(u));
    const f = u - i;
    const a = rgb[i];
    const b = rgb[Math.min(rgb.length - 1, i + 1)];
    out.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]);
  }
  return out;
}

function sample(s: RGB[], u: number) {
  const x = Math.min(1, Math.max(0, u)) * (s.length - 1);
  const i = Math.min(s.length - 2, Math.floor(x));
  const f = x - i;
  const a = s[i];
  const b = s[i + 1];
  return `rgb(${Math.round(a[0] + (b[0] - a[0]) * f)},${Math.round(a[1] + (b[1] - a[1]) * f)},${Math.round(
    a[2] + (b[2] - a[2]) * f,
  )})`;
}

function approach(cur: RGB[], target: RGB[], k: number) {
  let moving = false;
  for (let i = 0; i < cur.length; i++) {
    for (let c = 0; c < 3; c++) {
      const d = target[i][c] - cur[i][c];
      if (Math.abs(d) > 0.4) {
        cur[i][c] += d * k;
        moving = true;
      } else cur[i][c] = target[i][c];
    }
  }
  return moving;
}

export type LamellaeProps = {
  faceA: string[];
  faceB: string[];
  /** Color de la línea fina en el filo de cada lámina. */
  core?: string;
  /** Texto que se recorta del piso (cada elemento es una línea). */
  lines?: string[];
  /** Oscurece lo que no es texto (0 a 1). Solo cuando hay `lines`. */
  dim?: number;
  /** Alineación del texto recortado. */
  align?: "left" | "center";
  /** Parte inferior (0 a 1) que el texto recortado deja libre para otro contenido. */
  reserveBottom?: number;
  /** Ancho de las letras recortadas (palabra clave de font-stretch). */
  stretch?: CanvasFontStretch;
  /** Ancho de cada lámina en px. */
  slat?: number;
  /** Ondulación viva de las láminas (0 la apaga). */
  wave?: number;
  /** Responde al mouse, al dedo y a la inclinación del teléfono. */
  interactive?: boolean;
  /** El scroll gira las láminas. */
  scrollTurn?: boolean;
  className?: string;
};

export function Lamellae({
  faceA,
  faceB,
  core = PAL.cream,
  lines,
  dim = 0.86,
  align = "left",
  stretch = "condensed",
  reserveBottom = 0,
  slat = 10,
  wave = 0.14,
  interactive = false,
  scrollTurn = true,
  className,
}: LamellaeProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const targetA = useRef<RGB[]>(resample(faceA));
  const targetB = useRef<RGB[]>(resample(faceB));
  const kick = useRef<() => void>(() => {});

  // Paletas nuevas: el piso se reacomoda suavemente hacia ellas.
  useEffect(() => {
    targetA.current = resample(faceA);
    targetB.current = resample(faceB);
    kick.current();
  }, [faceA, faceB]);

  const linesKey = lines?.join("\n") ?? "";

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const curA = targetA.current.map((c) => [...c] as RGB);
    const curB = targetB.current.map((c) => [...c] as RGB);
    const coreColor = core;
    const textLines = linesKey ? linesKey.split("\n") : [];

    let w = 0;
    let h = 0;
    let dpr = 1;
    let angle = 0;
    let targetAngle = 0;
    let pointerAngle = 0;
    let tiltAngle = 0;
    let visible = true;
    let frame = 0;
    let last = 0;
    let time = Math.random() * 10;
    let overlay: HTMLCanvasElement | null = null;
    let fontReady = !textLines.length;

    const fontFamily = () =>
      getComputedStyle(document.documentElement).getPropertyValue("--font-display").trim() || "sans-serif";

    const buildOverlay = () => {
      if (!textLines.length || !w || !h) return;
      overlay = overlay ?? document.createElement("canvas");
      overlay.width = Math.round(w * dpr);
      overlay.height = Math.round(h * dpr);
      const o = overlay.getContext("2d");
      if (!o) return;
      o.setTransform(dpr, 0, 0, dpr, 0, 0);
      o.clearRect(0, 0, w, h);
      o.fillStyle = `rgba(10,10,51,${dim})`;
      o.fillRect(0, 0, w, h);
      o.globalCompositeOperation = "destination-out";
      const family = fontFamily();
      const setFont = (px: number) => {
        o.font = `900 ${px}px ${family}`;
        try {
          o.fontStretch = stretch;
        } catch {
          /* navegadores sin fontStretch en canvas */
        }
      };
      setFont(100);
      const widths = textLines.map((l) => o.measureText(l).width);
      const pad = Math.max(16, w * 0.04);
      const lead = 0.93;
      const byWidth = ((w - pad * 2) / Math.max(...widths)) * 100 * 0.95;
      const area = h * (1 - reserveBottom);
      const byHeight = (area - pad * 2) / (textLines.length * lead + 0.15);
      const size = Math.min(byWidth, byHeight);
      setFont(size);
      o.textBaseline = "alphabetic";
      const metrics = o.measureText("H");
      const cap = metrics.actualBoundingBoxAscent || size * 0.72;
      const blockH = cap + (textLines.length - 1) * size * lead;
      let y = (area - blockH) / 2 + cap;
      for (const line of textLines) {
        const lw = o.measureText(line).width;
        const x = align === "center" ? (w - lw) / 2 : pad;
        o.fillText(line, x, y);
        y += size * lead;
      }
      o.globalCompositeOperation = "source-over";
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      if (fontReady) buildOverlay();
      draw();
    };

    const draw = () => {
      if (!w || !h) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const step = Math.max(6, slat * (w < 520 ? 0.8 : 1));
      const n = Math.ceil(w / step) + 1;
      const rowH = coarse ? 40 : 30;
      const rows = wave > 0 ? Math.ceil(h / rowH) : 1;
      const rh = wave > 0 ? rowH : h;
      const coreW = Math.max(1, step * 0.12);
      const shift = angle * 0.12;
      ctx.fillStyle = coreColor;
      for (let i = 0; i < n; i++) {
        const x = i * step;
        const u = i / (n - 1);
        const colA = sample(curA, u * 0.92 + 0.04 + shift);
        const colB = sample(curB, u * 0.92 + 0.04 - shift);
        ctx.fillStyle = colA;
        ctx.fillRect(x, 0, step + 0.5, h);
        for (let r = 0; r < rows; r++) {
          const y = r * rh;
          const wv = wave > 0 ? wave * Math.sin(time * 0.7 + r * 0.42 + i * 0.16) : 0;
          const s = Math.min(0.94, Math.max(0.06, 0.5 + angle * 0.36 + wv));
          const split = step * s;
          ctx.fillStyle = colB;
          ctx.fillRect(x + split, y, step - split + 0.5, rh + 0.5);
          ctx.fillStyle = coreColor;
          ctx.fillRect(x + split - coreW / 2, y, coreW, rh + 0.5);
        }
      }
      if (overlay) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(overlay, 0, 0);
      }
    };

    const loop = (now: number) => {
      frame = 0;
      const dt = Math.min(64, now - (last || now));
      // En teléfonos basta con 30 cuadros por segundo.
      if (coarse && now - last < 30) {
        frame = requestAnimationFrame(loop);
        return;
      }
      last = now;
      time += dt / 1000;
      targetAngle = Math.max(-1, Math.min(1, pointerAngle + tiltAngle + scrollAngle()));
      angle += (targetAngle - angle) * 0.07;
      const a = approach(curA, targetA.current, 0.06);
      const b = approach(curB, targetB.current, 0.06);
      draw();
      const settling = Math.abs(targetAngle - angle) > 0.002 || a || b;
      if (visible && !reduce && (wave > 0 || settling)) frame = requestAnimationFrame(loop);
      else if (reduce && (a || b)) frame = requestAnimationFrame(loop);
    };

    const start = () => {
      if (!frame && visible) {
        last = 0;
        frame = requestAnimationFrame(loop);
      }
    };
    kick.current = start;

    const scrollAngle = () => {
      if (!scrollTurn || reduce) return 0;
      const rect = canvas.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const p = (center - window.innerHeight / 2) / window.innerHeight;
      return Math.max(-0.8, Math.min(0.8, -p * 1.1));
    };

    const onPointer = (e: PointerEvent) => {
      if (reduce) return;
      pointerAngle = ((e.clientX / window.innerWidth) * 2 - 1) * 0.75;
      start();
    };
    const onTilt = (e: DeviceOrientationEvent) => {
      if (reduce || e.gamma == null) return;
      tiltAngle = Math.max(-0.6, Math.min(0.6, e.gamma / 40));
      start();
    };
    const onScroll = () => start();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
      },
      { rootMargin: "120px" },
    );
    io.observe(canvas);
    if (interactive) {
      window.addEventListener("pointermove", onPointer, { passive: true });
      window.addEventListener("deviceorientation", onTilt, { passive: true });
    }
    if (scrollTurn) window.addEventListener("scroll", onScroll, { passive: true });
    const onVisibility = () => {
      visible = document.visibilityState === "visible";
      if (visible) start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    if (textLines.length) {
      const family = fontFamily();
      document.fonts
        .load(`900 100px ${family}`)
        .catch(() => undefined)
        .then(() => document.fonts.ready)
        .then(() => {
          fontReady = true;
          buildOverlay();
          draw();
        });
    }
    resize();
    start();

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("deviceorientation", onTilt);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      kick.current = () => {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linesKey, dim, align, stretch, reserveBottom, slat, wave, interactive, scrollTurn, core]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
