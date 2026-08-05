"use server";

import { revalidatePath } from "next/cache";
import { esAdmin } from "../auth/acciones";
import {
  actualizarServicio,
  crearServicio,
} from "../repos/servicios";
import {
  obtenerHistorialPaginado,
  TAMANO_PAGINA_HISTORIAL,
} from "../repos/estadisticas";
import type { DatosServicio, HistorialPaginado } from "../types";

export async function crearServicioComoAdmin(
  datos: DatosServicio
): Promise<{ exito: boolean; error?: string }> {
  if (!(await esAdmin())) {
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
  if (!(await esAdmin())) {
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

export async function obtenerPaginaHistorial(
  pagina: number
): Promise<HistorialPaginado> {
  if (!(await esAdmin())) {
    return {
      registros: [],
      totalRegistros: 0,
      pagina: 0,
      tamanoPagina: TAMANO_PAGINA_HISTORIAL,
    };
  }

  return obtenerHistorialPaginado(pagina);
}
