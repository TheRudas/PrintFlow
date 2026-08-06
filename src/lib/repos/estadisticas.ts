import { crearClienteServidor } from "../supabase/server";
import {
  inicioDelDia,
  inicioDeSemana,
  inicioDelMes,
} from "../fechas";
import type {
  DesgloseServicio,
  FiltroHistorial,
  HistorialPaginado,
  ModalidadHistorial,
  Registro,
  TipoHistorial,
  Totales,
  TotalesGenerales,
} from "../types";

export const TAMANO_PAGINA_HISTORIAL = 50;

type RegistroConTotal = Pick<Registro, "total">;

export function clasificarServicio(slug: string): {
  tipo: TipoHistorial;
  modalidad: ModalidadHistorial;
} {
  const esFotocopia = slug.startsWith("fotocopia");
  const esColor = slug.endsWith("color");

  return {
    tipo: esFotocopia ? "fotocopia" : "impresion",
    modalidad: esColor ? "color" : "bn",
  };
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
  const supabase = await crearClienteServidor();

  const { data, error } = await supabase
    .from("registros")
    .select("total")
    .gte("creado_en", desde.toISOString());

  if (error) {
    throw new Error(`No se pudieron obtener los totales: ${error.message}`);
  }

  return sumaDeRegistros(data ?? []);
}

export async function obtenerTotalesCombinados(): Promise<{
  hoy: Totales;
  semana: Totales;
  mes: Totales;
}> {
  const supabase = await crearClienteServidor();

  const { data, error } = await supabase
    .from("registros")
    .select("total, creado_en");

  if (error) {
    throw new Error(`No se pudieron obtener los totales: ${error.message}`);
  }

  const registros = data ?? [];

  return {
    hoy: sumaDeRegistros(
      registros.filter(
        (registro) => new Date(registro.creado_en) >= inicioDelDia()
      )
    ),
    semana: sumaDeRegistros(
      registros.filter(
        (registro) => new Date(registro.creado_en) >= inicioDeSemana()
      )
    ),
    mes: sumaDeRegistros(
      registros.filter(
        (registro) => new Date(registro.creado_en) >= inicioDelMes()
      )
    ),
  };
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

export async function obtenerTotalesGenerales(): Promise<TotalesGenerales> {
  const supabase = await crearClienteServidor();

  const { data, error } = await supabase
    .from("registros")
    .select("total, cantidad");

  if (error) {
    throw new Error(
      `No se pudieron obtener los totales generales: ${error.message}`
    );
  }

  const registros = data ?? [];

  return {
    montoTotal: registros.reduce(
      (acumulado, registro) => acumulado + registro.total,
      0
    ),
    cantidadRegistros: registros.length,
    cantidadHojas: registros.reduce(
      (acumulado, registro) => acumulado + registro.cantidad,
      0
    ),
  };
}

export async function obtenerDesglosePorServicio(): Promise<
  DesgloseServicio[]
> {
  const supabase = await crearClienteServidor();

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
  const supabase = await crearClienteServidor();
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

export async function obtenerUltimasVentas(
  cantidad: number
): Promise<Registro[]> {
  const supabase = await crearClienteServidor();

  const { data, error } = await supabase
    .from("registros")
    .select("*")
    .order("creado_en", { ascending: false })
    .limit(cantidad);

  if (error) {
    throw new Error(`No se pudieron obtener las últimas ventas: ${error.message}`);
  }

  return data ?? [];
}

export async function obtenerHistorialFiltrado(
  pagina: number,
  filtro: FiltroHistorial,
  tamanoPagina: number = TAMANO_PAGINA_HISTORIAL
): Promise<HistorialPaginado> {
  const supabase = await crearClienteServidor();
  const paginaInicio = pagina * tamanoPagina;
  const paginaFin = paginaInicio + tamanoPagina - 1;

  let idsFiltrados: string[] | null = null;

  if (filtro.tipo !== "todas" || filtro.modalidad !== "todas") {
    const { data: servicios, error: errorServicios } = await supabase
      .from("servicios")
      .select("id, slug");

    if (errorServicios) {
      throw new Error(
        `No se pudieron obtener los servicios: ${errorServicios.message}`
      );
    }

    idsFiltrados = (servicios ?? [])
      .filter((servicio) => {
        const { tipo, modalidad } = clasificarServicio(servicio.slug);
        const coincideTipo =
          filtro.tipo === "todas" || tipo === filtro.tipo;
        const coincideModalidad =
          filtro.modalidad === "todas" || modalidad === filtro.modalidad;
        return coincideTipo && coincideModalidad;
      })
      .map((servicio) => servicio.id);

    if (idsFiltrados.length === 0) {
      return {
        registros: [],
        totalRegistros: 0,
        pagina,
        tamanoPagina,
      };
    }
  }

  let consulta = supabase.from("registros").select("*");
  let consultaConteo = supabase
    .from("registros")
    .select("*", { count: "exact", head: true });

  if (idsFiltrados !== null) {
    consulta = consulta.in("servicio_id", idsFiltrados);
    consultaConteo = consultaConteo.in("servicio_id", idsFiltrados);
  }

  const [resultado, conteo] = await Promise.all([
    consulta
      .order("creado_en", { ascending: false })
      .range(paginaInicio, paginaFin),
    consultaConteo,
  ]);

  if (resultado.error) {
    throw new Error(`No se pudo obtener el historial: ${resultado.error.message}`);
  }

  return {
    registros: resultado.data ?? [],
    totalRegistros: conteo.count ?? 0,
    pagina,
    tamanoPagina,
  };
}

