import type { Tables } from "./supabase/database.types";

export type Servicio = Tables<"servicios">;
export type Registro = Tables<"registros">;
export type DatosNuevoRegistro = {
  servicioId: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  nota?: string | null;
};
