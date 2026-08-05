import { crearClienteSupabase } from "../supabase/client";
import type { Servicio } from "../types";

export async function obtenerServiciosActivos(): Promise<Servicio[]> {
  const supabase = crearClienteSupabase();

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
  const supabase = crearClienteSupabase();

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
