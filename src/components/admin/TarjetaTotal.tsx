import { formatearMoneda } from "@/lib/formatear";

interface Props {
  etiqueta: string;
  montoTotal: number;
  cantidadRegistros: number;
}

export default function TarjetaTotal({
  etiqueta,
  montoTotal,
  cantidadRegistros,
}: Props) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-marca-100 bg-white p-4 shadow-sm">
      <span className="text-sm font-semibold text-marca-500">{etiqueta}</span>
      <span className="gradiente-marca bg-clip-text text-2xl font-bold text-transparent">
        {formatearMoneda(montoTotal)}
      </span>
      <span className="text-xs text-zinc-400">
        {cantidadRegistros} registro{cantidadRegistros === 1 ? "" : "s"}
      </span>
    </div>
  );
}
