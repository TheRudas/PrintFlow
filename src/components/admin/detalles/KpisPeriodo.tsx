"use client";

import { formatearMoneda } from "@/lib/formatear";
import type { KpisPeriodo } from "@/lib/types";

interface Props {
  kpis: KpisPeriodo;
}

function formatearFechaCorta(fecha: string): string {
  const partes = fecha.split("-");
  return `${partes[2]}/${partes[1]}`;
}

export default function KpisPeriodo({ kpis }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="sombra-suave rounded-2xl border border-borde bg-superficie p-4 text-center animate-[entrar-arriba_0.3s_cubic-bezier(0.16,1,0.3,1)]">
        <p className="text-xs font-medium uppercase tracking-wide text-texto-suave">
          Total
        </p>
        <p className="mt-1 text-xl font-extrabold tabular-nums text-texto">
          {formatearMoneda(kpis.total)}
        </p>
      </div>

      <div
        className="sombra-suave rounded-2xl border border-borde bg-superficie p-4 text-center animate-[entrar-arriba_0.3s_cubic-bezier(0.16,1,0.3,1)]"
        style={{ animationDelay: "0.1s", animationFillMode: "both" }}
      >
        <p className="text-xs font-medium uppercase tracking-wide text-texto-suave">
          Promedio diario
        </p>
        <p className="mt-1 text-xl font-extrabold tabular-nums text-texto">
          {formatearMoneda(kpis.promedioDiario)}
        </p>
      </div>

      <div
        className="sombra-suave rounded-2xl border border-borde bg-superficie p-4 text-center animate-[entrar-arriba_0.3s_cubic-bezier(0.16,1,0.3,1)]"
        style={{ animationDelay: "0.2s", animationFillMode: "both" }}
      >
        <p className="text-xs font-medium uppercase tracking-wide text-texto-suave">
          Mejor día
        </p>
        <p className="mt-1 text-xl font-extrabold tabular-nums text-texto">
          {kpis.mejorDia ? (
            <>
              {formatearMoneda(kpis.mejorDia.monto)}
              <span className="block text-xs font-normal text-texto-suave">
                {formatearFechaCorta(kpis.mejorDia.fecha)}
              </span>
            </>
          ) : (
            "—"
          )}
        </p>
      </div>
    </div>
  );
}
