import type { Tables } from "./supabase/database.types";

export type Servicio = Tables<"servicios">;
export type Registro = Tables<"registros">;
export type DatosNuevoRegistro = {
  servicioId: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  esCasa: boolean;
};

export type Totales = {
  montoTotal: number;
  cantidadRegistros: number;
};

export type TotalesGenerales = {
  montoTotal: number;
  cantidadRegistros: number;
  cantidadHojas: number;
};

export type EstadisticasCasa = {
  hoy: { cantidadHojas: number; cantidadRegistros: number };
  semana: { cantidadHojas: number; cantidadRegistros: number };
  mes: { cantidadHojas: number; cantidadRegistros: number };
  total: { cantidadHojas: number; cantidadRegistros: number };
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

export type TipoHistorial = "todas" | "impresion" | "fotocopia";

export type ModalidadHistorial = "todas" | "bn" | "color";

export type FiltroHistorial = {
  tipo: TipoHistorial;
  modalidad: ModalidadHistorial;
  fechaDesde?: string;
  fechaHasta?: string;
};
