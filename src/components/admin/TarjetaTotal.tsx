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
    <div className="sombra-suave animar-entrada flex min-w-0 flex-col gap-1.5 rounded-2xl border border-marca-100 bg-superficie p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-marca-300">
      <span className="flex items-center gap-1.5 text-xs font-semibold text-marca-500">
        <span className="gradiente-marca h-2 w-2 rounded-full" />
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
