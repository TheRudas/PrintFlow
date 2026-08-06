import { crearClienteServidor } from "../supabase/server";
import type {
  DesgloseServicio,
  HistorialPaginado,
  Registro,
  Totales,
} from "../types";

export const TAMANO_PAGINA_HISTORIAL = 50;

const ZONA_HORARIA = "America/Bogota";

type RegistroConTotal = Pick<Registro, "total">;

function obtenerPartesFechaZona(
  fecha: Date
): { anio: number; mes: number; dia: number } {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: ZONA_HORARIA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(fecha);

  const valorDe = (tipo: string): number => {
    const parte = partes.find((p) => p.type === tipo);
    return Number(parte?.value ?? "0");
  };

  return { anio: valorDe("year"), mes: valorDe("month"), dia: valorDe("day") };
}

function fechaZonaEnUtc(anio: number, mes: number, dia: number): Date {
  return new Date(Date.UTC(anio, mes - 1, dia, 0, 0, 0));
}

function inicioDelDia(): Date {
  const ahora = new Date();
  const { anio, mes, dia } = obtenerPartesFechaZona(ahora);
  return fechaZonaEnUtc(anio, mes, dia);
}

function inicioDeSemana(): Date {
  const ahora = new Date();
  const { anio, mes, dia } = obtenerPartesFechaZona(ahora);

  const diaDeSemana = new Intl.DateTimeFormat("en-US", {
    timeZone: ZONA_HORARIA,
    weekday: "short",
  })
    .formatToParts(ahora)
    .find((parte) => parte.type === "weekday")?.value;

  const indiceDia: Record<string, number> = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
    Sat: 5,
    Sun: 6,
  };

  const diaInicio = dia - (indiceDia[diaDeSemana ?? "Mon"] ?? 0);

  const base = fechaZonaEnUtc(anio, mes, diaInicio);
  const ajuste = new Date(base);
  ajuste.setUTCHours(0, 0, 0, 0);
  return ajuste;
}

function inicioDelMes(): Date {
  const ahora = new Date();
  const { anio, mes } = obtenerPartesFechaZona(ahora);
  return fechaZonaEnUtc(anio, mes, 1);
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

