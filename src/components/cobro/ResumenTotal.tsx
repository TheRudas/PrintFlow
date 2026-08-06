import { formatearMoneda } from "@/lib/formatear";

interface Props {
  precioUnitario: number | null;
  cantidad: number;
  guardando: boolean;
  esCasa: boolean;
  onGuardar: () => void;
}

function claseDeTamanoPara(montoFormateado: string): string {
  const largo = montoFormateado.length;
  if (largo > 14) {
    return "text-xl";
  }
  if (largo > 10) {
    return "text-2xl";
  }
  return "text-4xl";
}

export default function ResumenTotal({
  precioUnitario,
  cantidad,
  guardando,
  esCasa,
  onGuardar,
}: Props) {
  const precioValido =
    precioUnitario !== null &&
    (esCasa ? precioUnitario >= 0 : precioUnitario > 0);
  const total = precioValido ? precioUnitario * cantidad : 0;
  const montoFormateado = formatearMoneda(total);

  return (
    <div className="sombra-marca flex flex-col gap-4 rounded-3xl bg-marca-900 p-5 text-white">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <span className="whitespace-nowrap text-lg font-semibold text-marca-300">
          {esCasa ? (
            `Gratis × ${cantidad}`
          ) : precioValido ? (
            <>
              {formatearMoneda(precioUnitario as number)} × {cantidad}
            </>
          ) : (
            "Sin precio"
          )}
        </span>
        <span
          className={`whitespace-nowrap font-bold tabular-nums ${claseDeTamanoPara(montoFormateado)}`}
        >
          {esCasa ? "Gratis" : formatearMoneda(total)}
        </span>
      </div>
      <button
        type="button"
        onClick={onGuardar}
        disabled={!precioValido || guardando}
        className="btn-feedback glow-rosa rounded-full bg-gradient-to-r from-acento-500 to-acento-600 py-4 text-lg font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {guardando ? "Guardando..." : "Guardar venta"}
      </button>
      {!precioValido && !esCasa && (
        <p className="text-center text-xs text-marca-300">
          Elige un precio para poder guardar
        </p>
      )}
    </div>
  );
}
