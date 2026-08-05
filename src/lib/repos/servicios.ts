import { crearClienteServidor } from "../supabase/server";
import type { DatosServicio, Servicio } from "../types";

export async function obtenerServiciosActivos(): Promise<Servicio[]> {
  const supabase = await crearClienteServidor();

  const { data, error } = await supabase
    .from("servicios")
    .select("*")
    .eq("activo", true)
    .order("nombre");

  if (error) {
    throw new Error(`No se pudieron obtener los servicios: ${error.message}`);
  }

  return data ?? [];
}

export async function obtenerServicioPorSlug(
  slug: string
): Promise<Servicio | null> {
  const supabase = await crearClienteServidor();

  const { data, error } = await supabase
    .from("servicios")
    .select("*")
    .ilike("slug", slug)
    .eq("activo", true)
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo obtener el servicio: ${error.message}`);
  }

  return data;
}

export async function obtenerTodosLosServicios(): Promise<Servicio[]> {
  const supabase = await crearClienteServidor();

  const { data, error } = await supabase
    .from("servicios")
    .select("*")
    .order("nombre");

  if (error) {
    throw new Error(`No se pudieron obtener los servicios: ${error.message}`);
  }

  return data ?? [];
}

export async function crearServicio(
  datos: DatosServicio
): Promise<Servicio> {
  const supabase = await crearClienteServidor();

  const { data, error } = await supabase
    .from("servicios")
    .insert({
      nombre: datos.nombre,
      slug: datos.slug,
      precio_por_defecto: datos.precioPorDefecto,
      presets: datos.presets,
      unidad: datos.unidad,
      activo: datos.activo,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`No se pudo crear el servicio: ${error.message}`);
  }

  return data;
}

export async function actualizarServicio(
  id: string,
  datos: Partial<DatosServicio>
): Promise<Servicio> {
  const supabase = await crearClienteServidor();

  const { data, error } = await supabase
    .from("servicios")
    .update({
      ...(datos.nombre !== undefined && { nombre: datos.nombre }),
      ...(datos.precioPorDefecto !== undefined && {
        precio_por_defecto: datos.precioPorDefecto,
      }),
      ...(datos.presets !== undefined && { presets: datos.presets }),
      ...(datos.unidad !== undefined && { unidad: datos.unidad }),
      ...(datos.activo !== undefined && { activo: datos.activo }),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`No se pudo actualizar el servicio: ${error.message}`);
  }

  return data;
}
