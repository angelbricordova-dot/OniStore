import type { CSSProperties } from "react";

/**
 * Versión liviana del piso para fichas: un barrido de colores con láminas
 * oscuras encima. Devuelve variables CSS para `style`; la clase `.slats` las usa.
 */
export function slats(colors: string[], ink = "rgba(10,10,51,0.5)"): CSSProperties {
  const list = colors.length >= 2 ? colors : [colors[0] ?? "#38125C", "#A11370"];
  return {
    "--slats-sweep": `linear-gradient(90deg, ${list.join(", ")})`,
    "--slats-ink": ink,
  } as CSSProperties;
}
