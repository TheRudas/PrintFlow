import { formatearMoneda } from "@/lib/formatear";
import type { TotalesGenerales } from "@/lib/types";

interface Props {
  totales: TotalesGenerales;
}

function claseDeTamanoPara(montoFormateado: string): string {
  const largo = montoFormateado.length;
  if (largo > 12) {
    return "text-lg";
  }
  return "text-2xl";
}

export default function ResumenGeneral({ totales }: Props) {
  const montoFormateado = formatearMoneda(totales.montoTotal);

  return (
    <section className="flex w-full max-w-2xl flex-col gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-marca-500">
        Registro histórico
      </h2>

      <div className="grid w-full grid-cols-3 divide-x divide-borde/40 rounded-2xl border border-marca-100 bg-superficie p-5 shadow-sm">
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-xs font-medium text-texto-suave">
            Acumulado
          </span>
          <span
            className={`gradiente-marca whitespace-nowrap bg-clip-text font-bold tabular-nums text-transparent ${claseDeTamanoPara(montoFormateado)}`}
          >
            {montoFormateado}
          </span>
        </div>

        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-xs font-medium text-texto-suave">
            Hojas usadas
          </span>
          <span className="text-2xl font-bold tabular-nums text-texto">
            {totales.cantidadHojas.toLocaleString("es-CO")}
          </span>
        </div>

        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-xs font-medium text-texto-suave">Ventas</span>
          <span className="text-2xl font-bold tabular-nums text-texto">
            {totales.cantidadRegistros.toLocaleString("es-CO")}
          </span>
        </div>
      </div>
    </section>
  );
}
