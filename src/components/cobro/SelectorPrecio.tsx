import { formatearMoneda } from "@/lib/formatear";
import type { Servicio } from "@/lib/types";

interface Props {
  servicio: Servicio;
  precioSeleccionado: number | null;
  onSeleccionarPrecio: (precio: number) => void;
  onEscribirPrecio: (precio: number | null) => void;
}

export default function SelectorPrecio({
  servicio,
  precioSeleccionado,
  onSeleccionarPrecio,
  onEscribirPrecio,
}: Props) {
  const tienePresets = servicio.presets.length > 0;

  function esSeleccionado(precio: number): boolean {
    return precioSeleccionado !== null && precioSeleccionado === precio;
  }

  function manejarMontoLibre(valor: string): void {
    if (valor === "") {
      onEscribirPrecio(null);
      return;
    }

    const monto = Math.trunc(Number(valor));
    if (Number.isFinite(monto)) {
      onEscribirPrecio(monto);
    }
  }

  function ajustarValor(desplazamiento: number): void {
    const base = precioSeleccionado ?? 0;
    const nuevo = Math.max(0, Math.trunc(base) + desplazamiento);
    onEscribirPrecio(nuevo);
  }

  return (
    <div className="flex flex-col gap-3">
      {tienePresets && (
        <div className="flex flex-wrap gap-2">
          {servicio.presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onSeleccionarPrecio(preset)}
              className={`btn-feedback rounded-full border-2 px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                esSeleccionado(preset)
                  ? "glow-marca border-marca-500 bg-marca-600 text-white"
                  : "sombra-suave border-borde bg-superficie text-texto hover:-translate-y-0.5 hover:border-marca-300"
              }`}
            >
              {formatearMoneda(preset)}
            </button>
          ))}
        </div>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold uppercase tracking-wide text-marca-500">
          Escribir valor personalizado
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => ajustarValor(-50)}
            disabled={precioSeleccionado === null || precioSeleccionado <= 0}
            className="btn-feedback flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-borde bg-superficie text-2xl font-bold text-texto hover:border-transparent hover:bg-gradient-to-br hover:from-marca-600 hover:to-marca-800 hover:text-white disabled:opacity-40"
          >
            −
          </button>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Monto libre..."
            value={precioSeleccionado === null ? "" : precioSeleccionado}
            onChange={(evento) => manejarMontoLibre(evento.target.value)}
            className="w-full rounded-2xl border-2 border-borde bg-superficie px-4 py-3 text-center text-lg text-texto placeholder:text-texto-tenue focus:border-marca-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => ajustarValor(50)}
            className="btn-feedback flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-borde bg-superficie text-2xl font-bold text-texto hover:border-transparent hover:bg-gradient-to-br hover:from-marca-600 hover:to-marca-800 hover:text-white"
          >
            +
          </button>
        </div>
      </label>
    </div>
  );
}
