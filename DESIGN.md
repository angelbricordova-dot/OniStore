---
name: OniStore
description: Pijamas y rituales para dormir bonito, con la calma de una página de producto de Apple.
colors:
  luna-bg: "#FFFFFF"
  luna-bg-alt: "#F5F5F7"
  luna-ink: "#1D1D1F"
  luna-ink-2: "#6E6E73"
  luna-accent: "#A11370"
  lavanda-bg: "#FBFAFD"
  lavanda-bg-alt: "#F2EEF8"
  lavanda-ink: "#1B1530"
  lavanda-accent: "#38125C"
  durazno-bg: "#FFFCFA"
  durazno-bg-alt: "#FFF2EB"
  durazno-ink: "#2B1A14"
  durazno-accent: "#C93A26"
  noche-bg: "#07071C"
  noche-bg-alt: "#111130"
  noche-surface: "#17173D"
  noche-ink: "#F5F5F7"
  noche-accent: "#FFBF42"
typography:
  hero:
    fontFamily: "-apple-system, SF Pro Display, Inter, system-ui, sans-serif"
    fontSize: "clamp(48px, 8vw, 96px)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  title:
    fontFamily: "-apple-system, SF Pro Display, Inter, system-ui, sans-serif"
    fontSize: "clamp(34px, 5vw, 56px)"
    fontWeight: 700
    lineHeight: 1.07
    letterSpacing: "-0.028em"
  lede:
    fontFamily: "-apple-system, SF Pro Text, Inter, system-ui, sans-serif"
    fontSize: "clamp(19px, 1.7vw, 24px)"
    fontWeight: 400
    lineHeight: 1.38
  body:
    fontFamily: "-apple-system, SF Pro Text, Inter, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.47
    letterSpacing: "-0.011em"
  caption:
    fontFamily: "-apple-system, SF Pro Text, Inter, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  sm: "14px"
  md: "20px"
  lg: "28px"
  pill: "999px"
spacing:
  gutter: "clamp(20px, 4vw, 32px)"
  section: "clamp(84px, 10vw, 140px)"
  container: "1080px"
components:
  button-primary:
    backgroundColor: "{colors.luna-accent}"
    textColor: "#FFFFFF"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
    height: "48px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.luna-accent}"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
    height: "48px"
  size-option:
    backgroundColor: "{colors.luna-bg}"
    textColor: "{colors.luna-ink}"
    rounded: "{rounded.sm}"
    height: "52px"
  category-chip-selected:
    backgroundColor: "{colors.luna-ink}"
    textColor: "{colors.luna-bg}"
    rounded: "{rounded.pill}"
---

# Design System: OniStore

## Overview

**Creative North Star: "La vitrina tranquila"**

OniStore se presenta como una página de producto de Apple: mucho aire, una sola idea por pantalla, tipografía protagonista y el producto grande sobre un fondo de estudio del mismo tono de la prenda. Nada compite con la pijama. El movimiento es sutil y siempre responde a algo: entradas suaves al hacer scroll, un fundido cuando cambia el color, una leve presión en los botones.

La marca vive en el acento y en los tintes de cada producto, no en adornos. Hay cuatro paletas salidas de los colores de la marca; la dueña elige una en /admin.

**Key Characteristics:**
- Fondos lisos, mucho espacio y una sola acción principal por sección.
- Letra del sistema (SF Pro en Apple, Inter en el resto), con interletrado negativo en tamaños grandes.
- Cada producto sobre un fondo de estudio teñido con su propio color.
- Un solo color de acento por paleta, para botones y enlaces.
- Movimiento sutil, sin bucles ni efectos de fondo.

## Colors

Cuatro paletas, cada una con fondo, fondo alterno, tinta, tinta secundaria y un acento.

### Primary
- **Acento de la paleta**: magenta #A11370 (Luna), ciruela #38125C (Lavanda), coral profundo #C93A26 (Durazno), dorado #FFBF42 (Noche). Solo para botones, enlaces y el estado elegido.

### Neutral
- **Fondo** (#FFFFFF, #FBFAFD, #FFFCFA, #07071C) y **fondo alterno** (#F5F5F7, #F2EEF8, #FFF2EB, #111130): las secciones y las tarjetas se separan por este paso de tono, no por líneas.
- **Tinta** (#1D1D1F y equivalentes) y **tinta secundaria** (#6E6E73 y equivalentes): todo el texto; el gris solo para lo secundario.

### Named Rules
**The One Accent Rule.** Cada paleta tiene un solo acento y se usa solo para lo que se toca. Nunca como fondo de sección.

**The Product Tint Rule.** El color de un fondo de producto sale de la prenda: un tinte muy claro de su color en las paletas claras, una versión profunda en Noche.

## Typography

**Display Font:** SF Pro Display en iPhone y Mac, Inter en el resto.
**Body Font:** SF Pro Text en iPhone y Mac, Inter en el resto.

**Character:** neutra y precisa; la jerarquía sale del tamaño y el peso, no de cambiar de letra.

### Hierarchy
- **Hero** (700, clamp(48px, 8vw, 96px), 1.02): una sola vez, en la primera pantalla.
- **Title** (700, clamp(34px, 5vw, 56px), 1.07): títulos de sección, terminados en punto.
- **Lede** (400, clamp(19px, 1.7vw, 24px), 1.38): la frase debajo de cada título, en tinta secundaria.
- **Body** (400, 17px, 1.47): descripciones y respuestas.
- **Caption** (400, 12–14px): notas, pie de página, etiquetas.

### Named Rules
**The Tight Display Rule.** El interletrado es negativo en los tamaños grandes (-0.035em en el héroe, -0.028em en títulos) y casi cero en el texto de lectura.

## Layout

Contenedor de 1080px centrado, con márgenes laterales de clamp(20px, 4vw, 32px) y secciones separadas por clamp(84px, 10vw, 140px). Los títulos van centrados con su frase debajo. Las categorías son mosaicos de 2 columnas (1 en teléfono) y la colección es una cuadrícula de 3 columnas (2 en teléfono). Por debajo de 760px la navegación se reduce a logo y bolsa.

## Elevation & Depth

Plano. La profundidad la dan el paso de tono entre fondo y fondo alterno, y una sombra suave proyectada solo por los dibujos de producto. La barra de navegación es translúcida (desenfoque de 20px) y muestra una línea fina solo cuando hay contenido debajo.

### Shadow Vocabulary
- **Producto** (`drop-shadow(0 18px 24px rgba(20,10,40,0.18))`): bajo cada dibujo de producto.
- **Cajón de la bolsa** (`box-shadow: -20px 0 50px rgba(0,0,0,0.18)`): solo el panel que flota.

## Shapes

Esquinas redondeadas y generosas: 28px en mosaicos y fondos de producto grandes, 20px en tarjetas, 14px en opciones de talla y campos. Botones, chips y etiquetas son píldoras. Las muestras de color son círculos con un anillo del color de acento separado 3px cuando están elegidas.

## Components

- **Botón principal:** píldora de 48px en el color de acento, texto 17px peso 500. Se oscurece al pasar el mouse y baja a scale(0.97) al presionar.
- **Botón secundario:** píldora con borde de 1.5px en el acento.
- **Enlace con flecha:** texto en el acento con una flecha que avanza 3px al pasar el mouse.
- **Fondo de estudio:** el producto centrado sobre su tinte, con un brillo radial suave arriba.
- **Opción de talla:** caja de 72×52px con borde fino; borde de 2px en el acento cuando está elegida.
- **Chips de categoría:** píldoras en el fondo alterno; la elegida se invierte (tinta de fondo, texto claro).
- **Pregunta frecuente:** filas separadas por líneas finas con un signo más que gira 45° al abrir.

## Do's and Don'ts

### Do:
- **Do** dejar una idea por pantalla y mucho espacio alrededor.
- **Do** mostrar cada producto grande, sobre el tinte de su propio color.
- **Do** usar el acento solo en lo que se toca.
- **Do** mantener el movimiento sutil, y siempre como respuesta a algo.
- **Do** cambiar de paleta solo desde /admin, sin tocar el código.

### Don't:
- **Don't** volver a efectos de fondo animados, rayas o texturas: el estilo cinético se probó y se descartó.
- **Don't** usar más de un color de acento a la vez.
- **Don't** poner etiquetas pequeñas encima de los títulos.
- **Don't** inventar testimonios, cifras ni procesos que la tienda no haya confirmado.
