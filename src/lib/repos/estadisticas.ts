import { crearClienteSupabase } from "../supabase/client";
import type {
  DesgloseServicio,
  HistorialPaginado,
  Registro,
  Totales,
} from "../types";

export const TAMANO_PAGINA_HISTORIAL = 50;

type RegistroConTotal = Pick<Registro, "total">;

function inicioDelDia(): Date {
  const ahora = new Date();
  return new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
}

function inicioDeSemana(): Date {
  const ahora = new Date();
  const diaDeSemana = (ahora.getDay() + 6) % 7;
  const inicio = new Date(ahora);
  inicio.setDate(ahora.getDate() - diaDeSemana);
  inicio.setHours(0, 0, 0, 0);
  return inicio;
}

function inicioDelMes(): Date {
  const ahora = new Date();
  return new Date(ahora.getFullYear(), ahora.getMonth(), 1);
}

function sumaDeRegistros(registros: RegistroConTotal[]): Totales {
  return {
    montoTotal: registros.reduce(
      (acumulado, registro) => acumulado + registro.total,
      0
    ),
    cantidadRegistros: registros.length,
  };
}

export async function obtenerTotales(desde: Date): Promise<Totales> {
  const supabase = crearClienteSupabase();

  const { data, error } = await supabase
    .from("registros")
    .select("total")
    .gte("creado_en", desde.toISOString());

  if (error) {
    throw new Error(`No se pudieron obtener los totales: ${error.message}`);
  }

  return sumaDeRegistros(data ?? []);
}

export async function obtenerTotalesDeHoy(): Promise<Totales> {
  return obtenerTotales(inicioDelDia());
}

export async function obtenerTotalesDeLaSemana(): Promise<Totales> {
  return obtenerTotales(inicioDeSemana());
}

export async function obtenerTotalesDelMes(): Promise<Totales> {
  return obtenerTotales(inicioDelMes());
}

export async function obtenerDesglosePorServicio(): Promise<
  DesgloseServicio[]
> {
  const supabase = crearClienteSupabase();

  const { data, error } = await supabase
    .from("servicios")
    .select("id, nombre, registros(total, cantidad)");

  if (error) {
    throw new Error(`No se pudo obtener el desglose: ${error.message}`);
  }

  return (data ?? []).map((servicio) => {
    const registros =
      servicio.registros as unknown as Array<{
        total: number;
        cantidad: number;
      }>;
    const montoTotal = registros.reduce(
      (acumulado, registro) => acumulado + registro.total,
      0
    );

    return {
      servicioId: servicio.id,
      nombre: servicio.nombre,
      montoTotal,
      cantidad: registros.length,
    };
  });
}

export async function obtenerHistorialPaginado(
  pagina: number,
  tamanoPagina: number = TAMANO_PAGINA_HISTORIAL
): Promise<HistorialPaginado> {
  const supabase = crearClienteSupabase();
  const paginaInicio = pagina * tamanoPagina;
  const paginaFin = paginaInicio + tamanoPagina - 1;

  const [{ data, error }, { count }] = await Promise.all([
    supabase
      .from("registros")
      .select("*")
      .order("creado_en", { ascending: false })
      .range(paginaInicio, paginaFin),
    supabase.from("registros").select("*", { count: "exact", head: true }),
  ]);

  if (error) {
    throw new Error(`No se pudo obtener el historial: ${error.message}`);
  }

  return {
    registros: data ?? [],
    totalRegistros: count ?? 0,
    pagina,
    tamanoPagina,
  };
}
