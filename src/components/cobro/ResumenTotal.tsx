import { formatearMoneda } from "@/lib/formatear";

interface Props {
  precioUnitario: number | null;
  cantidad: number;
  guardando: boolean;
  onGuardar: () => void;
}

export default function ResumenTotal({
  precioUnitario,
  cantidad,
  guardando,
  onGuardar,
}: Props) {
  const precioValido = precioUnitario !== null && precioUnitario > 0;
  const total = precioValido ? precioUnitario * cantidad : 0;

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-marca-900 p-5 text-white">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-marca-200">Total</span>
        <span className="text-4xl font-bold">
          {formatearMoneda(total)}
        </span>
      </div>
      {precioUnitario !== null && precioValido && (
        <p className="text-xs text-marca-300">
          {formatearMoneda(precioUnitario)} × {cantidad}
        </p>
      )}
      <button
        type="button"
        onClick={onGuardar}
        disabled={!precioValido || guardando}
        className="btn-feedback gradiente-marca mt-1 rounded-full py-4 text-lg font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {guardando ? "Guardando..." : "Guardar venta"}
      </button>
      {!precioValido && (
        <p className="text-center text-xs text-marca-300">
          Elegí un precio para poder guardar
        </p>
      )}
    </div>
  );
}
