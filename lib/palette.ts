/* Colores de la marca y las paletas del piso de láminas. */

export const PAL = {
  night: "#0A0A33",
  night2: "#15144A",
  plum: "#38125C",
  magenta: "#A11370",
  coral: "#F95C42",
  gold: "#FFBF42",
  peach: "#FFA385",
  cream: "#F7ECE1",
};

/** Atardecer: la cara que mira al sol. */
export const DUSK_A = [PAL.gold, PAL.coral, PAL.magenta, PAL.plum];
/** Noche: la cara que mira a la noche. */
export const DUSK_B = [PAL.plum, PAL.magenta, PAL.coral, PAL.gold];
export const NIGHT_A = [PAL.plum, PAL.magenta, PAL.plum, PAL.night2];
export const NIGHT_B = [PAL.night2, PAL.plum, PAL.magenta, PAL.coral];
export const DAWN_A = [PAL.plum, PAL.magenta, PAL.coral, PAL.gold, PAL.peach];
export const DAWN_B = [PAL.night2, PAL.plum, PAL.magenta, PAL.coral, PAL.gold];
