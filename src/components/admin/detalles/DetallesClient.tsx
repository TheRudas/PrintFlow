"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import FiltrosPeriodo from "./FiltrosPeriodo";
import KpisPeriodo from "./KpisPeriodo";
import GraficoBarras from "./GraficoBarras";
import GraficoTorta from "./GraficoTorta";
import TablaDetallada from "./TablaDetallada";
import type { KpisPeriodo as TKpis, VentaPorDiaServicio, DesgloseServicio, Registro, Servicio } from "@/lib/types";

interface Props {
  kpis: TKpis;
  ventasDetalladas: VentaPorDiaServicio[];
  desglose: DesgloseServicio[];
  registros: Registro[];
  servicios: Servicio[];
  fechaDesde: string;
  fechaHasta: string;
}

export default function DetallesClient({
  kpis,
  ventasDetalladas,
  desglose,
  registros,
  servicios,
  fechaDesde: fechaDesdeInicial,
  fechaHasta: fechaHastaInicial,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const periodoActual = useMemo<
    "hoy" | "semana" | "mes" | "todo" | "personalizado"
  >(() => {
    const p = searchParams.get("periodo");
    if (p === "hoy" || p === "semana" || p === "mes" || p === "todo") return p;
    return fechaDesdeInicial ? "personalizado" : "todo";
  }, [searchParams, fechaDesdeInicial]);

  const periodoGrafico = useMemo(() => {
    return periodoActual;
  }, [periodoActual]);

  const cambiarPeriodo = useCallback(
    (periodo: "hoy" | "semana" | "mes" | "todo" | "personalizado") => {
      if (periodo === "personalizado") {
        return;
      }
      const params = new URLSearchParams();
      params.set("periodo", periodo);
      router.push(`/admin/detalles?${params.toString()}`);
    },
    [router]
  );

  const cambiarFechas = useCallback(
    (desde: string, hasta: string) => {
      const params = new URLSearchParams();
      params.set("periodo", "personalizado");
      params.set("fechaDesde", desde.slice(0, 10));
      params.set("fechaHasta", hasta.slice(0, 10));
      router.push(`/admin/detalles?${params.toString()}`);
    },
    [router]
  );

  return (
    <div className="flex flex-col gap-6">
      <FiltrosPeriodo
        fechaDesde={fechaDesdeInicial}
        fechaHasta={fechaHastaInicial}
        onCambiarFechas={cambiarFechas}
        periodoActual={periodoActual}
        onCambiarPeriodo={cambiarPeriodo}
      />

      <KpisPeriodo kpis={kpis} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="sombra-suave rounded-2xl border border-borde bg-superficie p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-texto-suave">
            {periodoActual === "hoy" && "Ventas de hoy"}
            {periodoActual === "semana" && "Ventas por día (semana)"}
            {periodoActual === "mes" && "Ventas por semana (mes)"}
            {periodoActual === "todo" && "Ventas por mes (año)"}
            {periodoActual === "personalizado" && "Ventas por día"}
          </h3>
          <GraficoBarras detallado={ventasDetalladas} periodo={periodoGrafico} />
        </div>

        <div className="sombra-suave rounded-2xl border border-borde bg-superficie p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-texto-suave">
            {`Por servicio (${periodoActual})`}
          </h3>
          <GraficoTorta datos={desglose} />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-texto-suave">
          Registros del período
        </h3>
        <TablaDetallada registros={registros} servicios={servicios} />
      </div>
    </div>
  );
}
