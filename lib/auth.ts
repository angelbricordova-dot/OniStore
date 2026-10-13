import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "oni_admin";
const SESSION_DAYS = 30;

/** En desarrollo, si no hay contraseña configurada, se usa "oniris". */
export function adminPassword(): string | null {
  const pwd = process.env.ADMIN_PASSWORD?.trim();
  if (pwd) return pwd;
  return process.env.NODE_ENV === "production" ? null : "oniris";
}

function secret() {
  return process.env.ADMIN_SECRET?.trim() || adminPassword() || "";
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function checkPassword(input: string) {
  const pwd = adminPassword();
  if (!pwd) return false;
  // Comparamos hashes para no filtrar el largo de la contraseña.
  return safeEqual(sign(`pwd:${input}`), sign(`pwd:${pwd}`));
}

export async function startSession() {
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const token = `${expires}.${sign(String(expires))}`;
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expires),
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  if (!adminPassword()) return false;
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature || Number(expires) < Date.now()) return false;
  return safeEqual(signature, sign(expires));
}

export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Tu sesión expiró. Vuelve a entrar.");
}
