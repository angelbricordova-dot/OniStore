"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkPassword, endSession, isAdmin, startSession } from "@/lib/auth";
import { listVersions, readVersion, saveCatalog, type VersionInfo } from "@/lib/catalog";
import type { Catalog } from "@/lib/types";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const password = String(form.get("password") ?? "");
  if (!checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 600));
    return { error: "Esa no es la contraseña. Inténtalo otra vez." };
  }
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin");
}

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

const fail = (error: unknown): { ok: false; error: string } => ({
  ok: false,
  error: error instanceof Error ? error.message : "Algo salió mal. Inténtalo de nuevo.",
});

export async function publishCatalog(catalog: Catalog): Promise<Result<Catalog>> {
  if (!(await isAdmin())) return { ok: false, error: "Tu sesión expiró. Recarga la página y vuelve a entrar." };
  try {
    const saved = await saveCatalog(catalog);
    revalidatePath("/", "layout");
    return { ok: true, data: saved };
  } catch (error) {
    console.error("[admin] no se pudo guardar", error);
    return fail(error);
  }
}

export async function fetchVersions(): Promise<Result<VersionInfo[]>> {
  if (!(await isAdmin())) return { ok: false, error: "Tu sesión expiró." };
  try {
    return { ok: true, data: await listVersions() };
  } catch (error) {
    return fail(error);
  }
}

export async function restoreVersion(id: string): Promise<Result<Catalog>> {
  if (!(await isAdmin())) return { ok: false, error: "Tu sesión expiró." };
  try {
    const old = await readVersion(id);
    if (!old) return { ok: false, error: "No encontramos esa versión." };
    const saved = await saveCatalog(old);
    revalidatePath("/", "layout");
    return { ok: true, data: saved };
  } catch (error) {
    return fail(error);
  }
}
