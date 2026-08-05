"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { crearClienteSupabase } from "../supabase/client";
import type { HistorialPaginado } from "../types";
import {
  borrarCookieAdmin,
  crearCookieAdmin,
  leerSesionAdmin,
} from "./cookie";
import {
  obtenerHistorialPaginado,
  TAMANO_PAGINA_HISTORIAL,
} from "../repos/estadisticas";
import {
  actualizarServicio,
  crearServicio,
} from "../repos/servicios";
import type { DatosServicio } from "../types";

const CLAVE_CODIGO_ADMIN = "admin_code";

function obtenerCodigoDeEntorno(): string | null {
  return process.env.ADMIN_CODE ?? null;
}

async function obtenerCodigoEfectivo(): Promise<string | null> {
  const supabase = crearClienteSupabase();

  const { data, error } = await supabase
    .from("configuracion")
    .select("valor")
    .eq("clave", CLAVE_CODIGO_ADMIN)
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo leer la configuración: ${error.message}`);
  }

  if (data) {
    return data.valor;
  }

  const codigoDeEntorno = obtenerCodigoDeEntorno();
  if (codigoDeEntorno) {
    await guardarCodigoEnTabla(codigoDeEntorno);
    return codigoDeEntorno;
  }

  return null;
}

async function guardarCodigoEnTabla(codigo: string): Promise<void> {
  const supabase = crearClienteSupabase();

  const { error } = await supabase
    .from("configuracion")
    .upsert({ clave: CLAVE_CODIGO_ADMIN, valor: codigo });

  if (error) {
    throw new Error(`No se pudo guardar el código: ${error.message}`);
  }
}

export async function ingresarCodigoAdmin(
  codigo: string
): Promise<{ exito: boolean }> {
  const codigoEfectivo = await obtenerCodigoEfectivo();

  if (!codigoEfectivo || codigo.trim() !== codigoEfectivo) {
    return { exito: false };
  }

  await crearCookieAdmin();
  return { exito: true };
}

export async function esAdmin(): Promise<boolean> {
  return leerSesionAdmin();
}

export async function cerrarSesionAdmin(): Promise<void> {
  await borrarCookieAdmin();
}

export async function cambiarCodigoAdmin(
  codigoNuevo: string
): Promise<{ exito: boolean }> {
  const sesionValida = await leerSesionAdmin();
  if (!sesionValida || codigoNuevo.trim().length < 4) {
    return { exito: false };
  }

  await guardarCodigoEnTabla(codigoNuevo.trim());
  return { exito: true };
}

export async function irAlPanel(): Promise<void> {
  const sesionValida = await leerSesionAdmin();
  if (!sesionValida) {
    redirect("/");
  }
  redirect("/admin");
}

export async function obtenerPaginaHistorial(
  pagina: number
): Promise<HistorialPaginado> {
  const sesionValida = await leerSesionAdmin();
  if (!sesionValida) {
    return {
      registros: [],
      totalRegistros: 0,
      pagina: 0,
      tamanoPagina: TAMANO_PAGINA_HISTORIAL,
    };
  }

  return obtenerHistorialPaginado(pagina);
}

export async function crearServicioComoAdmin(
  datos: DatosServicio
): Promise<{ exito: boolean; error?: string }> {
  const sesionValida = await leerSesionAdmin();
  if (!sesionValida) {
    return { exito: false, error: "No autorizado" };
  }

  try {
    await crearServicio(datos);
    revalidatePath("/admin");
    return { exito: true };
  } catch (error) {
    return {
      exito: false,
      error: error instanceof Error ? error.message : "No se pudo crear",
    };
  }
}

export async function actualizarServicioComoAdmin(
  id: string,
  datos: Partial<DatosServicio>
): Promise<{ exito: boolean; error?: string }> {
  const sesionValida = await leerSesionAdmin();
  if (!sesionValida) {
    return { exito: false, error: "No autorizado" };
  }

  try {
    await actualizarServicio(id, datos);
    revalidatePath("/admin");
    return { exito: true };
  } catch (error) {
    return {
      exito: false,
      error: error instanceof Error ? error.message : "No se pudo actualizar",
    };
  }
}
