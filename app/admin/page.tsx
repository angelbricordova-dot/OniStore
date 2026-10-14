import { Mark } from "@/components/Art";
import { adminPassword, isAdmin } from "@/lib/auth";
import { getCatalog, storageMode } from "@/lib/catalog";
import { AdminApp } from "./AdminApp";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!adminPassword()) {
    return (
      <main className="admin-login">
        <Mark size={72} />
        <h1>Falta un paso</h1>
        <p>
          Para proteger el panel, agrega la variable <code>ADMIN_PASSWORD</code> en Vercel (Settings → Environment
          Variables) con la contraseña que quieras, y vuelve a publicar.
        </p>
      </main>
    );
  }

  if (!(await isAdmin())) {
    return (
      <main className="admin-login">
        <Mark size={72} />
        <h1>Hola de nuevo</h1>
        <p>Escribe la contraseña para administrar la tienda.</p>
        <LoginForm />
      </main>
    );
  }

  const catalog = await getCatalog();
  return <AdminApp initial={catalog} storage={storageMode()} />;
}
