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
    <div className="flex flex-col gap-1 rounded-2xl border border-zinc-200 bg-white p-4">
      <span className="text-sm font-medium text-zinc-500">{etiqueta}</span>
      <span className="text-2xl font-bold text-zinc-900">
        {formatearMoneda(montoTotal)}
      </span>
      <span className="text-xs text-zinc-400">
        {cantidadRegistros} registro{cantidadRegistros === 1 ? "" : "s"}
      </span>
    </div>
  );
}
