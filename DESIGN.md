---
name: OniStore
description: Pijamas y rituales para dormir bonito, sobre un piso de cromointerferencia.
colors:
  medianoche: "#0A0A33"
  medianoche-2: "#15144A"
  medianoche-3: "#1F1D5C"
  ciruela: "#38125C"
  ciruela-2: "#4A1F73"
  magenta: "#A11370"
  coral: "#F95C42"
  dorado: "#FFBF42"
  dorado-claro: "#FFCF6E"
  durazno: "#FFA385"
  crema: "#F7ECE1"
typography:
  display:
    fontFamily: "Anybody, Arial Narrow, sans-serif"
    fontSize: "clamp(52px, 7.6vw, 96px)"
    fontWeight: 900
    lineHeight: 0.9
    letterSpacing: "-0.03em"
    fontVariation: "'wdth' 125"
  headline:
    fontFamily: "Anybody, Arial Narrow, sans-serif"
    fontSize: "clamp(38px, 5.4vw, 84px)"
    fontWeight: 800
    lineHeight: 0.94
    letterSpacing: "-0.025em"
    fontVariation: "'wdth' 112"
  title:
    fontFamily: "Anybody, Arial Narrow, sans-serif"
    fontSize: "clamp(22px, 1.9vw, 28px)"
    fontWeight: 700
    lineHeight: 1.15
  body:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.6
  lead:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "clamp(19px, 1.45vw, 22px)"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1.2
rounded:
  none: "0px"
  pill: "999px"
spacing:
  gap: "clamp(10px, 1vw, 14px)"
  margin: "clamp(16px, 3vw, 44px)"
  section: "clamp(88px, 11vw, 168px)"
components:
  button-primary:
    backgroundColor: "{colors.dorado}"
    textColor: "{colors.medianoche}"
    rounded: "{rounded.pill}"
    padding: "14px 24px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.dorado-claro}"
  button-ghost:
    backgroundColor: "rgba(247, 236, 225, 0.12)"
    textColor: "{colors.crema}"
    rounded: "{rounded.pill}"
    padding: "14px 24px"
    height: "52px"
  size-option:
    backgroundColor: "rgba(247, 236, 225, 0.12)"
    textColor: "{colors.crema}"
    rounded: "{rounded.pill}"
    height: "46px"
  size-option-selected:
    backgroundColor: "{colors.dorado}"
    textColor: "{colors.medianoche}"
  tab-selected:
    backgroundColor: "{colors.crema}"
    textColor: "{colors.medianoche}"
    rounded: "{rounded.pill}"
  faq-item:
    backgroundColor: "{colors.medianoche-2}"
    textColor: "{colors.crema}"
    rounded: "{rounded.none}"
  faq-item-open:
    backgroundColor: "{colors.ciruela}"
---

# Design System: OniStore

## Overview

**Creative North Star: "El piso de la noche"**

OniStore se construye sobre un piso de cromointerferencia, en la tradición del arte cinético venezolano: láminas verticales de dos caras, con una línea fina en el filo, que mezclan en el ojo los colores de la marca y producen el atardecer sin pintarlo. Cuando el visitante mueve el dedo, el mouse o el teléfono, las láminas giran y el piso pasa de la tarde a la noche. Todo lo demás (letras, productos, botones) se para sobre ese piso o se recorta de él.

La página es de noche porque así se usa: alguien acostado, con el teléfono en la mano, entrando desde Instagram. El fondo es Medianoche a plena fuerza y el color vive en campos de láminas, nunca como acentos sueltos sobre un fondo neutro. La densidad es de tienda: los productos se ven grandes, y entre capítulos el piso aparece como una franja de ancho completo.

**Key Characteristics:**
- Fondo Medianoche; el color vive en campos de láminas, no en manchas.
- Títulos en Anybody, una grotesca de ancho variable que se estira con el movimiento.
- Texto recortado del piso en los momentos grandes (héroe y cierre).
- Campos y fichas de esquina recta; los controles siempre redondos.
- Las entradas se abren como láminas que giran.

## Colors

Una noche completa en siete colores: del dorado del atardecer a la medianoche y de vuelta al amanecer.

### Primary
- **Dorado del atardecer** (#FFBF42): la acción. Botones principales, la hora recomendada en el planificador, el anillo del color elegido, la talla seleccionada.

### Secondary
- **Coral** (#F95C42) y **Magenta** (#A11370): el corazón del piso de láminas, los estados ("Quedan pocas" en coral) y el cierre del atardecer.

### Tertiary
- **Durazno** (#FFA385) y **Ciruela** (#38125C, #4A1F73): las caras claras y oscuras de las láminas, las placas detrás de los productos, el ítem abierto de las preguntas.

### Neutral
- **Medianoche** (#0A0A33): el fondo de todo.
- **Medianoche 2 y 3** (#15144A, #1F1D5C): superficies un paso arriba (bolsa, preguntas, controles).
- **Crema** (#F7ECE1): todo el texto; al 76 % para el texto secundario, al 12 % para fondos de controles.

### Named Rules
**The Floor Carries The Colour Rule.** Los siete colores aparecen juntos solo en el piso de láminas. Fuera del piso, un elemento usa un color con un trabajo concreto: dorado para actuar, coral para avisar, crema para leer.

**The Night Ground Rule.** El fondo es siempre Medianoche. No hay fondos crema ni claros en las páginas de la tienda.

## Typography

**Display Font:** Anybody (con Arial Narrow)
**Body Font:** Figtree (con system-ui)

**Character:** Anybody es una grotesca de ancho variable (50–150): ancha y pesada en títulos y logotipo, condensada cuando se recorta del piso. Figtree se encarga de todo lo que se lee y de los controles.

### Hierarchy
- **Display** (900, clamp(52px, 7.6vw, 96px), 0.9, ancho 125): la hora recomendada del planificador. Los títulos recortados del piso se dibujan en el canvas con ancho condensado y llenan su campo.
- **Headline** (800, clamp(38px, 5.4vw, 84px), 0.94, ancho 112): títulos de sección y nombre del producto en su ficha.
- **Title** (700, clamp(22px, 1.9vw, 28px), 1.15): preguntas frecuentes, nombres en las fichas de la colección, precios.
- **Body** (400, 17px, 1.6): descripciones y párrafos, de 45 a 60 caracteres por línea.
- **Lead** (400, clamp(19px, 1.45vw, 22px), 1.45): la frase de apoyo del héroe y del cierre.
- **Label** (700, 15px): botones, pestañas y leyendas de color y talla.

### Named Rules
**The Kinetic Width Rule.** El ancho de Anybody es parte del movimiento: las palabras de "Cómo pedir" llegan condensadas (62 %) y se abren a 100 %. No se usa ancho variable como adorno en el texto de lectura.

## Layout

Cuadrícula de 12 columnas con márgenes de clamp(16px, 3vw, 44px) y separación de clamp(10px, 1vw, 14px). Los capítulos se separan con clamp(88px, 11vw, 168px) o con una franja de piso de ancho completo (90–170px, o hasta 320px en la versión alta). El héroe divide 7/5: el piso con el título a la izquierda, el producto de la noche a la derecha. La colección usa 4 columnas, con la primera ficha a 2×2; baja a 3 en tableta y a 2 en teléfono. Por debajo de 860px todo pasa a una columna, y en el héroe la placa del producto se reduce a 104px junto a su nombre, para que el botón de añadir entre en la primera pantalla.

## Elevation & Depth

Plano. La profundidad la dan los pasos de tono (Medianoche → Medianoche 2 → Medianoche 3 → Ciruela) y la vibración del piso de láminas. La única sombra es la del panel de la bolsa, porque flota sobre la página.

### Shadow Vocabulary
- **Panel flotante** (`box-shadow: -24px 0 60px rgba(0,0,0,0.45)`): solo el cajón de la bolsa.

## Shapes

Campos, placas, fichas y paneles de preguntas tienen la esquina recta: son pedazos del piso. Todos los controles son píldoras (999px): botones, pestañas, tallas, chips de hora y etiquetas de estado. Las muestras de color son círculos de 44px con un anillo dorado de 3px separado 3px cuando están elegidas.

## Components

- **Piso de láminas (canvas):** láminas verticales de 8–11px con dos caras de color y una línea crema en el filo. Responden al mouse, al dedo, al scroll y a la inclinación del teléfono; ondulan despacio y se detienen fuera de pantalla o con "reducir movimiento". Puede recortar texto: el resto del campo se oscurece al 86–92 % de Medianoche.
- **Placa de láminas (CSS):** un barrido de colores con láminas oscuras de 2px cada 12px y una línea crema de 1px. En pantallas con mouse se desplaza 22px al pasar por encima; en pantallas táctiles avanza con el scroll.
- **Botón principal:** píldora dorada de 52px, texto Medianoche en Figtree 700. Al presionar baja a scale(0.97) en 160ms.
- **Botón fantasma:** píldora crema al 12 %, texto crema; pasa al 20 % al pasar el mouse por encima.
- **Selector de producto:** nombre, precio, muestras de color, tallas y dos acciones lado a lado. Al cambiar el color se reacomoda la paleta del piso.
- **Pregunta frecuente:** `<details>` en Medianoche 2 que pasa a Ciruela al abrirse, con un signo más dibujado en CSS que se convierte en menos.
- **Planificador de la noche:** una barra de seis ciclos hecha de placas de láminas (de la noche al dorado), con marcas en píldora para cada hora posible.

## Do's and Don'ts

### Do:
- **Do** poner el color en campos de láminas que ocupen regiones enteras.
- **Do** recortar los títulos grandes del piso en el héroe y en el cierre.
- **Do** dar a cada acción el dorado, y a nada más.
- **Do** dejar que el piso responda al visitante y que se detenga fuera de pantalla o con "reducir movimiento".
- **Do** reemplazar los dibujos de producto por fotos reales en cuanto existan; la placa de láminas queda detrás de la foto recortada.

### Don't:
- **Don't** usar fondos crema ni claros en las páginas de la tienda.
- **Don't** usar degradados suaves como fondo de sección; el color se mezcla en las láminas.
- **Don't** poner etiquetas pequeñas encima de los títulos.
- **Don't** redondear campos, placas o fichas; solo los controles son redondos.
- **Don't** inventar testimonios, cifras ni procesos que la tienda no haya confirmado.
