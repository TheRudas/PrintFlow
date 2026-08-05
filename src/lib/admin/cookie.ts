import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const NOMBRE_COOKIE_ADMIN = "printflow_admin";
const DIAS_DE_VIGENCIA = 7;
const MILISEGUNDOS_POR_DIA = 24 * 60 * 60 * 1000;

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
  if (partes.length !== 3) {
    return false;
  }

  const [rol, expiracion, firma] = partes;

  if (rol !== "admin") {
    return false;
  }

  const expiracionMs = Number(expiracion);
  if (!Number.isFinite(expiracionMs) || expiracionMs < Date.now()) {
    return false;
  }

  const firmaEsperada = firmar(`${rol}.${expiracion}`);
  return firmasCoinciden(firma, firmaEsperada);
}

export async function crearCookieAdmin(): Promise<void> {
  const cookieStore = await cookies();
  const expiracion = Date.now() + DIAS_DE_VIGENCIA * MILISEGUNDOS_POR_DIA;
  const valor = `admin.${expiracion}.${firmar(`admin.${expiracion}`)}`;

  cookieStore.set(NOMBRE_COOKIE_ADMIN, valor, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: DIAS_DE_VIGENCIA * 24 * 60 * 60,
    path: "/",
  });
}

export async function borrarCookieAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(NOMBRE_COOKIE_ADMIN);
}
