import type { EstadisticasCasa } from "@/lib/types";

interface Props {
  estadisticas: EstadisticasCasa;
}

function celda(etiqueta: string, cantidadHojas: number, registros: number) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <span className="text-xs font-medium text-texto-suave">{etiqueta}</span>
      <span className="text-2xl font-bold tabular-nums text-texto">
        {cantidadHojas.toLocaleString("es-CO")}
      </span>
      <span className="text-xs text-texto-tenue">
        {registros} registro{registros === 1 ? "" : "s"}
      </span>
    </div>
  );
}

export default function UsoCasa({ estadisticas }: Props) {
  return (
    <section className="flex w-full max-w-2xl flex-col gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-marca-500">
        Uso de la casa
      </h2>

      <div className="grid w-full grid-cols-4 divide-x divide-borde/40 rounded-2xl border border-marca-100 bg-superficie p-5 shadow-sm">
        {celda("Hoy", estadisticas.hoy.cantidadHojas, estadisticas.hoy.cantidadRegistros)}
        {celda("Semana", estadisticas.semana.cantidadHojas, estadisticas.semana.cantidadRegistros)}
        {celda("Mes", estadisticas.mes.cantidadHojas, estadisticas.mes.cantidadRegistros)}
        {celda("Total", estadisticas.total.cantidadHojas, estadisticas.total.cantidadRegistros)}
      </div>

      <p className="text-xs text-texto-tenue">
        Solo hojas usadas por la casa; no suman a las ganancias.
      </p>
    </section>
  );
}
