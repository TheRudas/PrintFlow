import { formatearMoneda } from "@/lib/formatear";

interface Props {
  etiqueta: string;
  montoTotal: number;
  cantidadRegistros: number;
}

function claseDeTamanoPara(montoFormateado: string): string {
  const largo = montoFormateado.length;
  if (largo > 12) {
    return "text-base";
  }
  if (largo > 8) {
    return "text-lg";
  }
  return "text-xl";
}

export default function TarjetaTotal({
  etiqueta,
  montoTotal,
  cantidadRegistros,
}: Props) {
  const montoFormateado = formatearMoneda(montoTotal);

  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-2xl border border-marca-100 bg-superficie p-4 shadow-sm">
      <span className="truncate text-xs font-semibold text-marca-500">
        {etiqueta}
      </span>
      <span
        className={`gradiente-marca whitespace-nowrap bg-clip-text font-bold tabular-nums text-transparent ${claseDeTamanoPara(montoFormateado)}`}
      >
        {montoFormateado}
      </span>
      <span className="truncate text-xs text-texto-tenue">
        {cantidadRegistros} registro{cantidadRegistros === 1 ? "" : "s"}
      </span>
    </div>
  );
}
