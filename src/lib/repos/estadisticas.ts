import { crearClienteServidor } from "../supabase/server";
import {
  inicioDelDia,
  inicioDeSemana,
  inicioDelMes,
} from "../fechas";
import type {
  DesgloseServicio,
  EstadisticasCasa,
  FiltroHistorial,
  HistorialPaginado,
  KpisPeriodo,
  ModalidadHistorial,
  Registro,
  TipoHistorial,
  Totales,
  TotalesGenerales,
  VentaPorDia,
  VentaPorDiaServicio,
} from "../types";

export const TAMANO_PAGINA_HISTORIAL = 50;

export const SLUG_USO_CASA = "uso-casa";

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

export async function obtenerDesgloseConFechas(
  desde: Date,
  hasta: Date
): Promise<DesgloseServicio[]> {
  const supabase = await crearClienteServidor();

  const { data, error } = await supabase
    .from("servicios")
    .select("id, slug, nombre, registros!inner(total, cantidad, es_casa, creado_en)");

  if (error) {
    throw new Error(`No se pudo obtener el desglose: ${error.message}`);
  }

  const desdeIso = desde.toISOString();
  const hastaIso = hasta.toISOString();

  return (data ?? [])
    .filter((servicio) => servicio.slug !== SLUG_USO_CASA)
    .map((servicio) => {
      const registros = (
        (servicio.registros as unknown as Array<{
          total: number;
          cantidad: number;
          es_casa: boolean;
          creado_en: string;
        }>) ?? []
      ).filter(
        (registro) =>
          !registro.es_casa &&
          registro.creado_en >= desdeIso &&
          registro.creado_en < hastaIso
      );

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

export async function obtenerVentasDetalladasPorDia(
  desde: Date,
  hasta: Date
): Promise<VentaPorDiaServicio[]> {
  const supabase = await crearClienteServidor();

  const { data, error } = await supabase
    .from("registros")
    .select("total, creado_en, servicio_id, servicios!inner(nombre, slug)")
    .eq("es_casa", false)
    .gte("creado_en", desde.toISOString())
    .lt("creado_en", hasta.toISOString());

  if (error) {
    throw new Error(`No se pudieron obtener las ventas detalladas: ${error.message}`);
  }

  const resultado: VentaPorDiaServicio[] = [];

  for (const r of data ?? []) {
    const servicio = (
      r as unknown as {
        servicios: { nombre: string; slug: string } | { nombre: string; slug: string }[];
      }
    ).servicios;
    const srv = Array.isArray(servicio) ? servicio[0] : servicio;

    resultado.push({
      fecha: (r.creado_en as string).slice(0, 10),
      nombre: srv?.nombre ?? "Servicio eliminado",
      slug: srv?.slug ?? "",
      montoTotal: r.total,
    });
  }

  return resultado;
}

export async function obtenerVentasPorDia(
  desde: Date,
  hasta: Date
): Promise<VentaPorDia[]> {
  const supabase = await crearClienteServidor();

  const { data, error } = await supabase
    .from("registros")
    .select("total, creado_en")
    .eq("es_casa", false)
    .gte("creado_en", desde.toISOString())
    .lt("creado_en", hasta.toISOString())
    .order("creado_en", { ascending: true });

  if (error) {
    throw new Error(`No se pudieron obtener las ventas por día: ${error.message}`);
  }

  const agrupado = new Map<string, VentaPorDia>();

  for (const registro of data ?? []) {
    const fecha = registro.creado_en.slice(0, 10);
    const existente = agrupado.get(fecha);
    if (existente) {
      existente.montoTotal += registro.total;
      existente.cantidad += 1;
    } else {
      agrupado.set(fecha, {
        fecha,
        montoTotal: registro.total,
        cantidad: 1,
      });
    }
  }

  return Array.from(agrupado.values());
}

export async function obtenerKpis(
  desde: Date,
  hasta: Date
): Promise<KpisPeriodo> {
  const supabase = await crearClienteServidor();

  const { data, error } = await supabase
    .from("registros")
    .select("total, creado_en")
    .eq("es_casa", false)
    .gte("creado_en", desde.toISOString())
    .lt("creado_en", hasta.toISOString());

  if (error) {
    throw new Error(`No se pudieron obtener los KPIs: ${error.message}`);
  }

  const registros = data ?? [];
  const total = registros.reduce((s, r) => s + r.total, 0);

  const diasUnicos = new Set(
    registros.map((r) => r.creado_en.slice(0, 10))
  );
  const cantidadDias = diasUnicos.size || 1;
  const promedioDiario = Math.round(total / cantidadDias);

  let mejorDia: { fecha: string; monto: number } | null = null;
  const agrupadoDia = new Map<string, number>();
  for (const registro of registros) {
    const fecha = registro.creado_en.slice(0, 10);
    agrupadoDia.set(fecha, (agrupadoDia.get(fecha) ?? 0) + registro.total);
  }
  for (const [fecha, monto] of agrupadoDia) {
    if (!mejorDia || monto > mejorDia.monto) {
      mejorDia = { fecha, monto };
    }
  }

  return { total, promedioDiario, mejorDia };
}

export async function obtenerTotales(desde: Date): Promise<Totales> {
  const supabase = await crearClienteServidor();

  const { data, error } = await supabase
    .from("registros")
    .select("total")
    .eq("es_casa", false)
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
    .select("total, creado_en, es_casa");

  if (error) {
    throw new Error(`No se pudieron obtener los totales: ${error.message}`);
  }

  const registros = (data ?? []).filter((registro) => !registro.es_casa);

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
    .select("total, cantidad, es_casa");

  if (error) {
    throw new Error(
      `No se pudieron obtener los totales generales: ${error.message}`
    );
  }

  const registros = data ?? [];
  const ventas = registros.filter((registro) => !registro.es_casa);

  return {
    montoTotal: ventas.reduce(
      (acumulado, registro) => acumulado + registro.total,
      0
    ),
    cantidadRegistros: ventas.length,
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
    .select("id, slug, nombre, registros(total, cantidad, es_casa)");

  if (error) {
    throw new Error(`No se pudo obtener el desglose: ${error.message}`);
  }

  return (data ?? [])
    .filter((servicio) => servicio.slug !== SLUG_USO_CASA)
    .map((servicio) => {
      const registros = (
        servicio.registros as unknown as Array<{
          total: number;
          cantidad: number;
          es_casa: boolean;
        }>
      ).filter((registro) => !registro.es_casa);
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

  const { data, count, error } = await supabase
    .from("registros")
    .select("*", { count: "exact" })
    .order("creado_en", { ascending: false })
    .range(paginaInicio, paginaFin);

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

  let consulta = supabase
    .from("registros")
    .select("*", { count: "exact" })
    .order("creado_en", { ascending: false })
    .range(paginaInicio, paginaFin);

  if (idsFiltrados !== null) {
    consulta = consulta.in("servicio_id", idsFiltrados);
  }

  if (filtro.fechaDesde) {
    consulta = consulta.gte("creado_en", filtro.fechaDesde);
  }

  if (filtro.fechaHasta) {
    consulta = consulta.lt("creado_en", filtro.fechaHasta);
  }

  const { data, count, error } = await consulta;

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

export async function obtenerEstadisticasCasa(): Promise<EstadisticasCasa> {
  const supabase = await crearClienteServidor();

  const { data, error } = await supabase
    .from("registros")
    .select("cantidad, creado_en")
    .eq("es_casa", true);

  if (error) {
    throw new Error(
      `No se pudieron obtener las estadísticas de la casa: ${error.message}`
    );
  }

  const registros = data ?? [];

  const contarDesde = (desde: Date): { cantidadHojas: number; cantidadRegistros: number } => {
    const filtrados = registros.filter(
      (registro) => new Date(registro.creado_en) >= desde
    );
    return {
      cantidadHojas: filtrados.reduce(
        (acumulado, registro) => acumulado + registro.cantidad,
        0
      ),
      cantidadRegistros: filtrados.length,
    };
  };

  return {
    hoy: contarDesde(inicioDelDia()),
    semana: contarDesde(inicioDeSemana()),
    mes: contarDesde(inicioDelMes()),
    total: {
      cantidadHojas: registros.reduce(
        (acumulado, registro) => acumulado + registro.cantidad,
        0
      ),
      cantidadRegistros: registros.length,
    },
  };
}

