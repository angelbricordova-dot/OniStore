"use client";

import { useMemo, useState } from "react";
import type { Product, Settings } from "@/lib/types";
import { plateSweep } from "./Art";
import { slats } from "@/lib/slats";
import { DUSK_A, DUSK_B } from "@/lib/palette";
import { Lamellae } from "./Lamellae";
import { ProductPicker, floorFor } from "./ProductPicker";
import { ProductVisual } from "./ProductVisual";

const TITLE = ["Duerme", "bonito"];

export function HeroFloor({ product, settings }: { product?: Product; settings: Settings }) {
  const [colorIdx, setColorIdx] = useState(0);
  const hex = product?.colors[colorIdx]?.hex;
  const floor = useMemo(() => (hex ? floorFor(hex) : { a: DUSK_A, b: DUSK_B }), [hex]);

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__field">
        <Lamellae
          className="hero__canvas"
          faceA={floor.a}
          faceB={floor.b}
          lines={TITLE}
          dim={0.9}
          reserveBottom={0.24}
          slat={11}
          interactive
        />
        <h1 id="hero-title" className="sr-only">
          Duerme bonito
        </h1>
        <p className="hero__line">
          Pijamas y pequeños rituales para dormir mejor, elegidos por Oniris. Escoges aquí, pides por WhatsApp.
        </p>
      </div>

      {product ? (
        <div className="hero__panel">
          <div className="hero__plate slats" style={slats(plateSweep(hex))}>
            <ProductVisual
              product={product}
              colorHex={hex}
              priority
              sizes="(max-width: 900px) 40vw, 30vw"
              className="hero__visual"
            />
          </div>
          <ProductPicker product={product} settings={settings} colorIdx={colorIdx} onColor={setColorIdx} compact />
        </div>
      ) : null}
    </section>
  );
}
