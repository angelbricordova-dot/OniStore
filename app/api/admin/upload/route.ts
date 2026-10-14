import { isAdmin } from "@/lib/auth";
import { storeImage } from "@/lib/catalog";

// Vercel acepta cuerpos de hasta 4,5 MB; el panel reduce antes las fotos más pesadas.
const MAX_BYTES = 4.4 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Tu sesión expiró. Vuelve a entrar." }, { status: 401 });
  }
  const form = await request.formData();
  const file = form.get("file");
  const folder = form.get("folder") === "site" ? "site" : "products";
  if (!(file instanceof File)) return Response.json({ error: "No llegó ninguna foto." }, { status: 400 });
  if (!TYPES.includes(file.type)) {
    return Response.json({ error: "Ese formato no se puede usar. Sube la foto en JPG, PNG o WebP." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) return Response.json({ error: "La foto pesa demasiado (máximo 4 MB)." }, { status: 400 });
  try {
    const { url, bytes } = await storeImage(file, folder);
    return Response.json({ url, bytes });
  } catch (error) {
    console.error("[upload]", error);
    const message = error instanceof Error ? error.message : "No se pudo subir la foto.";
    return Response.json({ error: message }, { status: 500 });
  }
}
