import { crearClienteServidor } from "../supabase/server";
import type { Perfil } from "../types";

export async function obtenerPerfilPorUsuarioId(
  usuarioId: string
): Promise<Perfil | null> {
  const supabase = await crearClienteServidor();

  const { data, error } = await supabase
    .from("perfiles")
    .select("*")
    .eq("id", usuarioId)
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo obtener el perfil: ${error.message}`);
  }

  return data;
}

export async function asignarRol(
  usuarioId: string,
  nombre: string,
  rol: "admin" | "empleado"
): Promise<void> {
  const supabase = await crearClienteServidor();

  const { error } = await supabase.from("perfiles").upsert(
    { id: usuarioId, nombre, rol },
    { onConflict: "id" }
  );

  if (error) {
    throw new Error(`No se pudo asignar el rol: ${error.message}`);
  }
}
