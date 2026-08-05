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
  const tienePrecioPorDefecto = servicio.precio_por_defecto !== null;

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

  return (
    <div className="flex flex-col gap-3">
      {tienePresets && (
        <div className="flex flex-wrap gap-2">
          {servicio.presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onSeleccionarPrecio(preset)}
              className={`btn-feedback rounded-full border-2 px-4 py-2 text-sm font-semibold ${
                esSeleccionado(preset)
                  ? "border-marca-500 bg-marca-500 text-white"
                  : "border-borde bg-superficie text-texto hover:border-marca-300"
              }`}
            >
              {formatearMoneda(preset)}
            </button>
          ))}
        </div>
      )}

      {tienePrecioPorDefecto && (
        <button
          type="button"
          onClick={() =>
            onSeleccionarPrecio(servicio.precio_por_defecto as number)
          }
          className={`btn-feedback rounded-full border-2 px-4 py-2 text-sm font-semibold ${
            esSeleccionado(servicio.precio_por_defecto as number)
              ? "border-marca-500 bg-marca-500 text-white"
              : "border-borde bg-superficie text-texto hover:border-marca-300"
          }`}
        >
          {formatearMoneda(servicio.precio_por_defecto as number)}
        </button>
      )}

      <input
        type="number"
        inputMode="numeric"
        min="0"
        step="1"
        placeholder="Monto libre..."
        value={precioSeleccionado === null ? "" : precioSeleccionado}
        onChange={(evento) => manejarMontoLibre(evento.target.value)}
        className="rounded-2xl border-2 border-borde bg-superficie px-4 py-3 text-lg text-texto placeholder:text-texto-tenue focus:border-marca-500 focus:outline-none"
      />
    </div>
  );
}
