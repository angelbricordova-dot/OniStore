# OniStore

Tienda de pijamas y de todo lo que ayuda a dormir mejor. El diseño es sereno, al estilo de las páginas de producto de Apple, con modo día y modo noche (con estrellas). El sistema visual está en `DESIGN.md` y los datos del negocio en `PRODUCT.md`.

- **Tienda**: catálogo por categorías, ficha de cada producto, bolsa y pedido por WhatsApp con el mensaje ya escrito.
- **Tu noche, en ciclos**: dice a qué hora acostarse según la hora de la alarma (ciclos de 90 minutos) y dibuja la noche como una línea de tiempo.
- **`/admin`**: panel para administrar productos, fotos, precios y categorías, y personalizar la tienda: paleta de colores, modo día/noche, estrellas, logo, textos del inicio, orden y visibilidad de las secciones, preguntas frecuentes, WhatsApp y redes. Cada publicación guarda una copia en el historial (las últimas 30) y se puede volver atrás.
- **`/marca`**: kit de marca con las propuestas de logo, la paleta, la foto de perfil y las portadas de historias destacadas para Instagram y TikTok (PNG de 1080 × 1080 en `public/marca/`).

## Publicar en Vercel (una sola vez)

1. En [vercel.com](https://vercel.com) → **Add New → Project** → importa este repositorio de GitHub. Vercel detecta Next.js solo.
2. En el proyecto → **Storage → Create → Blob**. Elige acceso **público** y conéctalo al proyecto. Vercel crea la variable `BLOB_READ_WRITE_TOKEN` automáticamente. Ahí se guardan el catálogo y las fotos.
3. En **Settings → Environment Variables** agrega:
   - `ADMIN_PASSWORD`: la contraseña del panel.
   - `ADMIN_SECRET` (opcional, recomendado): un texto largo cualquiera para firmar la sesión.
   - `NEXT_PUBLIC_SITE_URL` (opcional): la dirección final, por ejemplo `https://onistore.com`, para que los enlaces compartidos muestren bien la vista previa.
4. **Deployments → Redeploy**. Listo: entra a `tu-dominio/admin`.

Cada `git push` a la rama principal publica una versión nueva de la página. Los productos **no** viven en GitHub sino en Vercel Blob, así que editar el catálogo desde `/admin` no necesita tocar el código.

## Primeros pasos en el admin

1. **Contacto y datos** → escribe el número de WhatsApp con código de país (ej. `584121234567`), los enlaces de Instagram y TikTok y la moneda.
2. **Productos** → cambia los productos de ejemplo por los reales y sube sus fotos. Mientras un producto no tenga fotos se muestra un dibujo.
3. **Apariencia** e **Inicio** → escoge paleta, modo, logo y textos; muestra, oculta y ordena las secciones.
4. Toca **Publicar cambios**. La tienda se actualiza en segundos.

## Trabajar en tu computadora

```bash
npm install
npm run dev
```

Abre http://localhost:3000. En local, `/admin` usa la contraseña `luna` (si no defines `ADMIN_PASSWORD`) y guarda los cambios en la carpeta `data/`, que no se sube a GitHub.

## Estructura

- `app/page.tsx`: la página de inicio, capítulo por capítulo.
- `app/producto/[slug]`: la ficha de cada producto.
- `app/admin`: el panel y sus acciones del servidor.
- `components/Lamellae.tsx`: el piso de láminas (canvas) que da vida a toda la página.
- `components/Art.tsx`: el logo (la luna dormida) y los dibujos de los productos.
- `lib/catalog.ts`: dónde se lee y guarda el catálogo (Vercel Blob en producción, archivo local en desarrollo).
- `lib/seed.ts`: el catálogo de ejemplo con el que arranca la tienda.
