import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const NOMBRE_COOKIE_ADMIN = "printflow_admin";
const MAX_AGE_SEGUNDOS = 10 * 365 * 24 * 60 * 60;

function obtenerSecreto(): string {
  const secreto = process.env.ADMIN_COOKIE_SECRET;
  if (!secreto) {
    throw new Error(
      "Falta la variable de entorno ADMIN_COOKIE_SECRET para firmar la sesión admin"
    );
  }
  return secreto;
}

function firmar(valor: string): string {
  return createHmac("sha256", obtenerSecreto()).update(valor).digest("hex");
}

function firmasCoinciden(firmaA: string, firmaB: string): boolean {
  const bufferA = Buffer.from(firmaA);
  const bufferB = Buffer.from(firmaB);
  return bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB);
}

export async function leerSesionAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const valor = cookieStore.get(NOMBRE_COOKIE_ADMIN)?.value;

  if (!valor) {
    return false;
  }

  const partes = valor.split(".");
  if (partes.length !== 2) {
    return false;
  }

  const [rol, firma] = partes;

  if (rol !== "admin") {
    return false;
  }

  const firmaEsperada = firmar(rol);
  return firmasCoinciden(firma, firmaEsperada);
}

export async function crearCookieAdmin(): Promise<void> {
  const cookieStore = await cookies();
  const valor = `admin.${firmar("admin")}`;

  cookieStore.set(NOMBRE_COOKIE_ADMIN, valor, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE_SEGUNDOS,
    path: "/",
  });
}

export async function borrarCookieAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(NOMBRE_COOKIE_ADMIN);
}
