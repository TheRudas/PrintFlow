import type { Tables } from "./supabase/database.types";

export type Servicio = Tables<"servicios">;
export type Registro = Tables<"registros">;
export type DatosNuevoRegistro = {
  servicioId: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
};

export type Totales = {
  montoTotal: number;
  cantidadRegistros: number;
};

export type DesgloseServicio = {
  servicioId: string;
  nombre: string;
  montoTotal: number;
  cantidad: number;
};

export type HistorialPaginado = {
  registros: Registro[];
  totalRegistros: number;
  pagina: number;
  tamanoPagina: number;
};

export type DatosServicio = {
  nombre: string;
  slug: string;
  precioPorDefecto: number | null;
  presets: number[];
  unidad: string;
  activo: boolean;
};

export type Perfil = Tables<"perfiles">;
