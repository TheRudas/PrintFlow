export const ZONA_HORARIA = "America/Bogota";

// Las funciones de Vercel corren en UTC; forzamos el huso del negocio
// en el proceso de Node para que cualquier new Date() sin zona explícita
// use hora de Bogotá (UTC-5). Solo aplica en el servidor.
if (typeof process !== "undefined" && process.env) {
  process.env.TZ = "America/Bogota";
}

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
  // Bogotá es UTC-5: la medianoche local (00:00) equivale a las 05:00 UTC.
  // Date.UTC maneja correctamente el overflow de meses/días (días negativos o > fin de mes).
  return new Date(Date.UTC(anio, mes - 1, dia, 5, 0, 0));
}

export function inicioDelDia(): Date {
  const ahora = new Date();
  const { anio, mes, dia } = obtenerPartesFechaZona(ahora);
  return fechaZonaEnUtc(anio, mes, dia);
}

export function inicioDeSemana(): Date {
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

  return fechaZonaEnUtc(anio, mes, diaInicio);
}

export function inicioDelMes(): Date {
  const ahora = new Date();
  const { anio, mes } = obtenerPartesFechaZona(ahora);
  return fechaZonaEnUtc(anio, mes, 1);
}
