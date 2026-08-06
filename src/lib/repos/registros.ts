import { crearClienteSupabase } from "../supabase/client";
import type { DatosNuevoRegistro, Registro } from "../types";

export async function crearRegistro(
  datos: DatosNuevoRegistro
): Promise<Registro> {
  const supabase = crearClienteSupabase();

  const { data, error } = await supabase
    .from("registros")
    .insert({
      servicio_id: datos.servicioId,
      cantidad: datos.cantidad,
      precio_unitario: datos.precioUnitario,
      total: datos.total,
      es_casa: datos.esCasa,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`No se pudo registrar la venta: ${error.message}`);
  }

  return data;
}
